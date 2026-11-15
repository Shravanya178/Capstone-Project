"""
I-SPY-1 / ACRIN 6657 Clinical & Outcome Data Ingestion Loader.

Enforces strict clinical segregation between baseline pre-treatment clinical
variables, longitudinal MRI tumor measurements, and post-treatment outcome endpoints
(pCR, RCBClass, RFS) across 221 trial patients.
"""

from typing import Dict, Any, List, Optional
import os
import uuid
import pandas as pd


class ISPY1Loader:
    """Loader for I-SPY-1 / ACRIN 6657 trial clinical and outcome workbook."""

    DATASET_NAME = "ISPY1_CALGB150007"
    EXPECTED_PATIENT_COUNT = 221

    CLINICAL_SHEET = "TCIA Patient Clinical Subset"
    OUTCOMES_SHEET = "TCIA Outcomes Subset"
    CLINICAL_DICT_SHEET = "Clinical Data Dictionary"
    OUTCOMES_DICT_SHEET = "Outcome Data Dictionary"

    def __init__(self, file_path: str):
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"I-SPY-1 workbook not found at: {file_path}")
        self.file_path = file_path
        self.clinical_df: Optional[pd.DataFrame] = None
        self.outcomes_df: Optional[pd.DataFrame] = None
        self.clinical_dict_df: Optional[pd.DataFrame] = None
        self.outcomes_dict_df: Optional[pd.DataFrame] = None
        self.ingestion_report: Dict[str, Any] = {}

    def load(self) -> Dict[str, pd.DataFrame]:
        """Loads both clinical and outcomes sheets and validates record integrity."""
        excel_file = pd.ExcelFile(self.file_path)

        for req_sheet in [self.CLINICAL_SHEET, self.OUTCOMES_SHEET]:
            if req_sheet not in excel_file.sheet_names:
                raise ValueError(f"Required sheet '{req_sheet}' not found in {self.file_path}")

        self.clinical_df = pd.read_excel(excel_file, sheet_name=self.CLINICAL_SHEET)
        self.outcomes_df = pd.read_excel(excel_file, sheet_name=self.OUTCOMES_SHEET)

        if self.CLINICAL_DICT_SHEET in excel_file.sheet_names:
            self.clinical_dict_df = pd.read_excel(excel_file, sheet_name=self.CLINICAL_DICT_SHEET)
        if self.OUTCOMES_DICT_SHEET in excel_file.sheet_names:
            self.outcomes_dict_df = pd.read_excel(excel_file, sheet_name=self.OUTCOMES_DICT_SHEET)

        # Assert patient counts
        clin_count = len(self.clinical_df)
        out_count = len(self.outcomes_df)

        if clin_count != self.EXPECTED_PATIENT_COUNT:
            raise ValueError(f"Expected {self.EXPECTED_PATIENT_COUNT} clinical rows, found {clin_count}")

        # Ensure SUBJECTID is integer/string without nulls
        self.clinical_df["SUBJECTID"] = self.clinical_df["SUBJECTID"].astype(str).str.strip()
        self.outcomes_df["SUBJECTID"] = self.outcomes_df["SUBJECTID"].astype(str).str.strip()

        # Audit report
        self.ingestion_report = {
            "source_file": self.file_path,
            "clinical_patient_count": clin_count,
            "outcomes_patient_count": out_count,
            "unique_clinical_subject_ids": int(self.clinical_df["SUBJECTID"].nunique()),
            "unique_outcome_subject_ids": int(self.outcomes_df["SUBJECTID"].nunique()),
            "clinical_columns": self.clinical_df.columns.tolist(),
            "outcomes_columns": self.outcomes_df.columns.tolist(),
            "clinical_missing": self.clinical_df.isna().sum().to_dict(),
            "outcomes_missing": self.outcomes_df.isna().sum().to_dict(),
            "validation_passed": clin_count == self.EXPECTED_PATIENT_COUNT and out_count == self.EXPECTED_PATIENT_COUNT,
        }

        return {
            "clinical": self.clinical_df,
            "outcomes": self.outcomes_df,
        }

    def to_clinical_observations(self, include_outcomes: bool = False) -> List[Dict[str, Any]]:
        """Converts patient records into canonical observations with strict temporal tags."""
        if self.clinical_df is None or self.outcomes_df is None:
            self.load()

        observations: List[Dict[str, Any]] = []

        # Ingest baseline and longitudinal clinical data
        for _, row in self.clinical_df.iterrows():
            subj_id = row["SUBJECTID"]

            # Demographics: Age
            if pd.notna(row.get("age")):
                observations.append({
                    "observation_id": str(uuid.uuid4()),
                    "concept": "patient_age",
                    "normalized_value": float(row["age"]),
                    "raw_value": row["age"],
                    "status": "documented",
                    "unit": "years",
                    "timepoint": "baseline",
                    "provenance": {
                        "source_dataset": self.DATASET_NAME,
                        "source_file": os.path.basename(self.file_path),
                        "source_record_id": subj_id,
                        "source_field_path": f"{self.CLINICAL_SHEET}.age",
                    },
                    "extraction": {
                        "method": "structured_parser",
                        "confidence": 1.0,
                    },
                })

            # Laterality
            if pd.notna(row.get("Laterality")):
                lat_code = int(row["Laterality"])
                lat_map = {1: "right", 2: "left", 3: "bilateral"}
                lat_norm = lat_map.get(lat_code, "unknown")
                observations.append({
                    "observation_id": str(uuid.uuid4()),
                    "concept": "disease_laterality",
                    "normalized_value": lat_norm,
                    "raw_value": lat_code,
                    "status": "documented" if lat_norm != "unknown" else "unknown",
                    "unit": None,
                    "timepoint": "baseline",
                    "provenance": {
                        "source_dataset": self.DATASET_NAME,
                        "source_file": os.path.basename(self.file_path),
                        "source_record_id": subj_id,
                        "source_field_path": f"{self.CLINICAL_SHEET}.Laterality",
                    },
                    "extraction": {
                        "method": "structured_parser",
                        "confidence": 1.0,
                    },
                })

            # ER Status (0=neg, 1=pos)
            er_val = row.get("ERpos")
            er_status = "not_reported" if pd.isna(er_val) else "documented"
            er_norm = "positive" if er_val == 1 else ("negative" if er_val == 0 else "unknown")
            observations.append({
                "observation_id": str(uuid.uuid4()),
                "concept": "er_status",
                "normalized_value": er_norm if er_status == "documented" else None,
                "raw_value": None if pd.isna(er_val) else int(er_val),
                "status": er_status,
                "unit": None,
                "timepoint": "baseline",
                "provenance": {
                    "source_dataset": self.DATASET_NAME,
                    "source_file": os.path.basename(self.file_path),
                    "source_record_id": subj_id,
                    "source_field_path": f"{self.CLINICAL_SHEET}.ERpos",
                },
                "extraction": {
                    "method": "structured_parser",
                    "confidence": 1.0,
                },
            })

            # PR Status (0=neg, 1=pos)
            pr_val = row.get("PgRpos")
            pr_status = "not_reported" if pd.isna(pr_val) else "documented"
            pr_norm = "positive" if pr_val == 1 else ("negative" if pr_val == 0 else "unknown")
            observations.append({
                "observation_id": str(uuid.uuid4()),
                "concept": "pr_status",
                "normalized_value": pr_norm if pr_status == "documented" else None,
                "raw_value": None if pd.isna(pr_val) else int(pr_val),
                "status": pr_status,
                "unit": None,
                "timepoint": "baseline",
                "provenance": {
                    "source_dataset": self.DATASET_NAME,
                    "source_file": os.path.basename(self.file_path),
                    "source_record_id": subj_id,
                    "source_field_path": f"{self.CLINICAL_SHEET}.PgRpos",
                },
                "extraction": {
                    "method": "structured_parser",
                    "confidence": 1.0,
                },
            })

            # HER2 Status (0=neg, 1=pos)
            her2_val = row.get("Her2MostPos")
            her2_status = "not_reported" if pd.isna(her2_val) else "documented"
            her2_norm = "positive" if her2_val == 1 else ("negative" if her2_val == 0 else "unknown")
            observations.append({
                "observation_id": str(uuid.uuid4()),
                "concept": "her2_status",
                "normalized_value": her2_norm if her2_status == "documented" else None,
                "raw_value": None if pd.isna(her2_val) else int(her2_val),
                "status": her2_status,
                "unit": None,
                "timepoint": "baseline",
                "provenance": {
                    "source_dataset": self.DATASET_NAME,
                    "source_file": os.path.basename(self.file_path),
                    "source_record_id": subj_id,
                    "source_field_path": f"{self.CLINICAL_SHEET}.Her2MostPos",
                },
                "extraction": {
                    "method": "structured_parser",
                    "confidence": 1.0,
                },
            })

            # Longitudinal MRI Measurements:
            # 1. Baseline MRI LD
            if pd.notna(row.get("MRI LD Baseline")):
                observations.append({
                    "observation_id": str(uuid.uuid4()),
                    "concept": "tumor_largest_diameter_mm",
                    "normalized_value": float(row["MRI LD Baseline"]),
                    "raw_value": row["MRI LD Baseline"],
                    "status": "documented",
                    "unit": "mm",
                    "timepoint": "baseline",
                    "provenance": {
                        "source_dataset": self.DATASET_NAME,
                        "source_file": os.path.basename(self.file_path),
                        "source_record_id": subj_id,
                        "source_field_path": f"{self.CLINICAL_SHEET}.MRI LD Baseline",
                    },
                    "extraction": {
                        "method": "structured_parser",
                        "confidence": 1.0,
                    },
                })

            # 2. Early Response 1-3dAC
            if pd.notna(row.get("MRI LD 1-3dAC")):
                observations.append({
                    "observation_id": str(uuid.uuid4()),
                    "concept": "tumor_largest_diameter_mm",
                    "normalized_value": float(row["MRI LD 1-3dAC"]),
                    "raw_value": row["MRI LD 1-3dAC"],
                    "status": "documented",
                    "unit": "mm",
                    "timepoint": "during_treatment_early_ac",
                    "provenance": {
                        "source_dataset": self.DATASET_NAME,
                        "source_file": os.path.basename(self.file_path),
                        "source_record_id": subj_id,
                        "source_field_path": f"{self.CLINICAL_SHEET}.MRI LD 1-3dAC",
                    },
                    "extraction": {
                        "method": "structured_parser",
                        "confidence": 1.0,
                    },
                })

            # 3. Inter-regimen MRI LD
            if pd.notna(row.get("MRI LD InterReg")):
                observations.append({
                    "observation_id": str(uuid.uuid4()),
                    "concept": "tumor_largest_diameter_mm",
                    "normalized_value": float(row["MRI LD InterReg"]),
                    "raw_value": row["MRI LD InterReg"],
                    "status": "documented",
                    "unit": "mm",
                    "timepoint": "during_treatment_inter_regimen",
                    "provenance": {
                        "source_dataset": self.DATASET_NAME,
                        "source_file": os.path.basename(self.file_path),
                        "source_record_id": subj_id,
                        "source_field_path": f"{self.CLINICAL_SHEET}.MRI LD InterReg",
                    },
                    "extraction": {
                        "method": "structured_parser",
                        "confidence": 1.0,
                    },
                })

            # 4. Pre-surgical MRI LD
            if pd.notna(row.get("MRI LD PreSurg")):
                observations.append({
                    "observation_id": str(uuid.uuid4()),
                    "concept": "tumor_largest_diameter_mm",
                    "normalized_value": float(row["MRI LD PreSurg"]),
                    "raw_value": row["MRI LD PreSurg"],
                    "status": "documented",
                    "unit": "mm",
                    "timepoint": "pre_surgical_resection",
                    "provenance": {
                        "source_dataset": self.DATASET_NAME,
                        "source_file": os.path.basename(self.file_path),
                        "source_record_id": subj_id,
                        "source_field_path": f"{self.CLINICAL_SHEET}.MRI LD PreSurg",
                    },
                    "extraction": {
                        "method": "structured_parser",
                        "confidence": 1.0,
                    },
                })

        # Optionally ingest outcome variables (STRICTLY tagged with timepoint: "outcome")
        if include_outcomes and self.outcomes_df is not None:
            for _, row in self.outcomes_df.iterrows():
                subj_id = row["SUBJECTID"]
                if pd.notna(row.get("PCR")):
                    pcr_val = int(row["PCR"])
                    observations.append({
                        "observation_id": str(uuid.uuid4()),
                        "concept": "pathologic_complete_response",
                        "normalized_value": bool(pcr_val == 1),
                        "raw_value": pcr_val,
                        "status": "documented",
                        "unit": "binary_endpoint",
                        "timepoint": "outcome",
                        "provenance": {
                            "source_dataset": self.DATASET_NAME,
                            "source_file": os.path.basename(self.file_path),
                            "source_record_id": subj_id,
                            "source_field_path": f"{self.OUTCOMES_SHEET}.PCR",
                        },
                        "extraction": {
                            "method": "structured_parser",
                            "confidence": 1.0,
                        },
                    })

                if pd.notna(row.get("RCBClass")):
                    rcb_val = int(row["RCBClass"])
                    observations.append({
                        "observation_id": str(uuid.uuid4()),
                        "concept": "residual_cancer_burden_class",
                        "normalized_value": rcb_val,
                        "raw_value": rcb_val,
                        "status": "documented",
                        "unit": "rcb_class",
                        "timepoint": "outcome",
                        "provenance": {
                            "source_dataset": self.DATASET_NAME,
                            "source_file": os.path.basename(self.file_path),
                            "source_record_id": subj_id,
                            "source_field_path": f"{self.OUTCOMES_SHEET}.RCBClass",
                        },
                        "extraction": {
                            "method": "structured_parser",
                            "confidence": 1.0,
                        },
                    })

        return observations

