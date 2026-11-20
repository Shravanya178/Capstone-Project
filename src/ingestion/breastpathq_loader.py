# Copyright (c) 2026 Shravanya Andhale, Nikhil Kadam, Sanket Patil, Khushi Shukla,
# Asma Parveen I Siddavatam and Pradnya Karekar
"""
BreastPathQ Challenge Clinical Features Ingestion Loader.

Distinguishes between 54 unique patients and 96 unique scans, cleanly parses
post-NAT surgical resection pathology, and enforces temporal tagging
(post_treatment_resection vs baseline demographics).
"""

from typing import Dict, Any, List, Optional
import os
import uuid
import pandas as pd


class BreastPathQLoader:
    """Loader for BreastPathQ Challenge clinical features workbook."""

    DATASET_NAME = "BREASTPATHQ"
    EXPECTED_SCAN_COUNT = 96
    EXPECTED_PATIENT_COUNT = 54

    FEATURES_SHEET = "Clinical Features"
    DEFINITIONS_SHEET = "Definitions"

    def __init__(self, file_path: str):
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"BreastPathQ workbook not found at: {file_path}")
        self.file_path = file_path
        self.raw_df: Optional[pd.DataFrame] = None
        self.clean_df: Optional[pd.DataFrame] = None
        self.definitions_df: Optional[pd.DataFrame] = None
        self.ingestion_report: Dict[str, Any] = {}

    def load(self) -> pd.DataFrame:
        """Loads and normalizes column headers, validating scan and patient counts."""
        excel_file = pd.ExcelFile(self.file_path)

        if self.FEATURES_SHEET not in excel_file.sheet_names:
            raise ValueError(f"Required sheet '{self.FEATURES_SHEET}' not found in {self.file_path}")

        self.raw_df = pd.read_excel(excel_file, sheet_name=self.FEATURES_SHEET)
        if self.DEFINITIONS_SHEET in excel_file.sheet_names:
            self.definitions_df = pd.read_excel(excel_file, sheet_name=self.DEFINITIONS_SHEET)

        # Clean column names by stripping spaces and quotes
        cleaned_columns = {col: str(col).strip().strip("'\"").strip() for col in self.raw_df.columns}
        self.clean_df = self.raw_df.rename(columns=cleaned_columns).copy()

        # Rename standard identifier columns
        self.clean_df.rename(columns={
            "patient ID": "patient_id",
            "scan ID": "scan_id",
            "Age @ diagnosis": "age_at_diagnosis",
            "Menopausal status": "menopausal_status",
            "Histological  type (resection)": "histologic_type_resection",
            "Histology Grade (resection)": "histologic_grade_resection",
            "ER (resection)": "er_resection",
            "PR (resection)": "pr_resection",
            "HER IHC (resection)": "her2_ihc_resection",
            "HER-2 FISH": "her2_fish_resection",
            "Residual tumor size (mm)": "residual_tumor_size_mm",
            "Overall Cellularity": "overall_cellularity",
            "Size of Tumor Bed (mm)": "tumor_bed_size_mm",
        }, inplace=True)

        self.clean_df["patient_id"] = self.clean_df["patient_id"].astype(str).str.strip()
        self.clean_df["scan_id"] = self.clean_df["scan_id"].astype(str).str.strip()

        scan_count = len(self.clean_df)
        patient_count = int(self.clean_df["patient_id"].nunique())

        if scan_count != self.EXPECTED_SCAN_COUNT:
            raise ValueError(f"Expected {self.EXPECTED_SCAN_COUNT} scans, found {scan_count}")

        if patient_count != self.EXPECTED_PATIENT_COUNT:
            raise ValueError(f"Expected {self.EXPECTED_PATIENT_COUNT} unique patients, found {patient_count}")

        self.ingestion_report = {
            "source_file": self.file_path,
            "scan_count": scan_count,
            "patient_count": patient_count,
            "columns": self.clean_df.columns.tolist(),
            "missing_counts": self.clean_df.isna().sum().to_dict(),
            "validation_passed": scan_count == self.EXPECTED_SCAN_COUNT and patient_count == self.EXPECTED_PATIENT_COUNT,
        }

        return self.clean_df

    @staticmethod
    def _parse_size_measurement(val: Any) -> Any:
        """Safely parses tumor size measurements that may contain multiple foci or inequalities."""
        if pd.isna(val):
            return None
        if isinstance(val, (int, float)):
            return float(val)
        val_str = str(val).strip()
        try:
            return float(val_str)
        except ValueError:
            # Handle comma-separated foci like '4.5,1' or '14, 2.5'
            if "," in val_str:
                parts = [p.strip() for p in val_str.split(",") if p.strip()]
                parsed_nums = []
                for p in parts:
                    try:
                        parsed_nums.append(float(p))
                    except ValueError:
                        pass
                if parsed_nums:
                    return {
                        "max_dimension_mm": max(parsed_nums),
                        "all_foci_mm": parsed_nums,
                        "raw_foci_expression": val_str
                    }
            if val_str.startswith("<"):
                try:
                    num = float(val_str[1:].strip())
                    return {"operator": "<", "value": num}
                except ValueError:
                    pass
            return val_str

    def to_clinical_observations(self) -> List[Dict[str, Any]]:
        """Converts resection features and demographics into observations with strict temporal tags."""
        if self.clean_df is None:
            self.load()

        observations: List[Dict[str, Any]] = []

        # Track processed patients to avoid duplicating patient-level baseline demographics across scans
        seen_patients = set()

        for _, row in self.clean_df.iterrows():
            pat_id = row["patient_id"]
            scan_id = row["scan_id"]

            # Demographics (baseline) - emit once per patient
            if pat_id not in seen_patients:
                seen_patients.add(pat_id)

                if pd.notna(row.get("age_at_diagnosis")):
                    observations.append({
                        "observation_id": str(uuid.uuid4()),
                        "concept": "patient_age",
                        "normalized_value": float(row["age_at_diagnosis"]),
                        "raw_value": row["age_at_diagnosis"],
                        "status": "documented",
                        "unit": "years",
                        "timepoint": "baseline",
                        "provenance": {
                            "source_dataset": self.DATASET_NAME,
                            "source_file": os.path.basename(self.file_path),
                            "source_record_id": pat_id,
                            "source_field_path": "Clinical Features.Age @ diagnosis",
                        },
                        "extraction": {
                            "method": "structured_parser",
                            "confidence": 1.0,
                        },
                    })

                if pd.notna(row.get("menopausal_status")):
                    raw_meno = str(row["menopausal_status"]).strip().lower()
                    norm_meno = "postmenopausal" if "post" in raw_meno else ("premenopausal" if "pre" in raw_meno else "unknown")
                    observations.append({
                        "observation_id": str(uuid.uuid4()),
                        "concept": "menopausal_status",
                        "normalized_value": norm_meno,
                        "raw_value": row["menopausal_status"],
                        "status": "documented",
                        "unit": None,
                        "timepoint": "baseline",
                        "provenance": {
                            "source_dataset": self.DATASET_NAME,
                            "source_file": os.path.basename(self.file_path),
                            "source_record_id": pat_id,
                            "source_field_path": "Clinical Features.Menopausal status",
                        },
                        "extraction": {
                            "method": "structured_parser",
                            "confidence": 1.0,
                        },
                    })

            # Post-NAT Resection Pathology (Specific to each scan/resection)
            # 1. Residual tumor size
            if pd.notna(row.get("residual_tumor_size_mm")):
                norm_size = self._parse_size_measurement(row["residual_tumor_size_mm"])
                observations.append({
                    "observation_id": str(uuid.uuid4()),
                    "concept": "residual_tumor_size_mm",
                    "normalized_value": norm_size,
                    "raw_value": str(row["residual_tumor_size_mm"]),
                    "status": "documented",
                    "unit": "mm",
                    "timepoint": "post_treatment_resection",
                    "provenance": {
                        "source_dataset": self.DATASET_NAME,
                        "source_file": os.path.basename(self.file_path),
                        "source_record_id": f"Patient_{pat_id}_Scan_{scan_id}",
                        "source_field_path": "Clinical Features.Residual tumor size (mm)",
                    },
                    "extraction": {
                        "method": "structured_parser",
                        "confidence": 1.0,
                    },
                })

            # 2. Resection ER
            er_val = row.get("er_resection")
            if pd.notna(er_val):
                observations.append({
                    "observation_id": str(uuid.uuid4()),
                    "concept": "er_resection_status",
                    "normalized_value": str(er_val).strip().lower(),
                    "raw_value": er_val,
                    "status": "documented",
                    "unit": None,
                    "timepoint": "post_treatment_resection",
                    "provenance": {
                        "source_dataset": self.DATASET_NAME,
                        "source_file": os.path.basename(self.file_path),
                        "source_record_id": f"Patient_{pat_id}_Scan_{scan_id}",
                        "source_field_path": "Clinical Features.ER (resection)",
                    },
                    "extraction": {
                        "method": "structured_parser",
                        "confidence": 1.0,
                    },
                })

            # 3. Resection PR
            pr_val = row.get("pr_resection")
            if pd.notna(pr_val):
                observations.append({
                    "observation_id": str(uuid.uuid4()),
                    "concept": "pr_resection_status",
                    "normalized_value": str(pr_val).strip().lower(),
                    "raw_value": pr_val,
                    "status": "documented",
                    "unit": None,
                    "timepoint": "post_treatment_resection",
                    "provenance": {
                        "source_dataset": self.DATASET_NAME,
                        "source_file": os.path.basename(self.file_path),
                        "source_record_id": f"Patient_{pat_id}_Scan_{scan_id}",
                        "source_field_path": "Clinical Features.PR (resection)",
                    },
                    "extraction": {
                        "method": "structured_parser",
                        "confidence": 1.0,
                    },
                })

            # 4. Resection HER2 IHC
            her2_val = row.get("her2_ihc_resection")
            if pd.notna(her2_val):
                observations.append({
                    "observation_id": str(uuid.uuid4()),
                    "concept": "her2_ihc_resection_score",
                    "normalized_value": str(her2_val).strip(),
                    "raw_value": her2_val,
                    "status": "documented",
                    "unit": "ihc_score",
                    "timepoint": "post_treatment_resection",
                    "provenance": {
                        "source_dataset": self.DATASET_NAME,
                        "source_file": os.path.basename(self.file_path),
                        "source_record_id": f"Patient_{pat_id}_Scan_{scan_id}",
                        "source_field_path": "Clinical Features.HER IHC (resection)",
                    },
                    "extraction": {
                        "method": "structured_parser",
                        "confidence": 1.0,
                    },
                })

        return observations
