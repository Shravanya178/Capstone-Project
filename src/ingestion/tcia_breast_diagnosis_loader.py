"""
TCIA Breast-Diagnosis Clinical Summary Ingestion Loader.

Handles the transposed matrix format (15 rows x 53 columns) of
`TCIA-Breast-clinical-data-public-7_16_11 (1).xlsx`, transforming it into 51
standardized patient-level records while preserving original raw values,
provenance coordinates, and narrative MRI impression text.
"""

from typing import Dict, Any, List, Optional
import os
import uuid
import pandas as pd


class TCIABreastDiagnosisLoader:
    """Loader for TCIA Breast-Diagnosis clinical summary workbook."""

    DATASET_NAME = "TCIA_BREAST_DIAGNOSIS"
    EXPECTED_PATIENT_COUNT = 51

    ROW_MAPPING = {
        0: "background",
        1: "diagnosis_raw",
        2: "pathology_laterality_raw",
        3: "er_raw",
        4: "pr_raw",
        5: "her2_raw",
        6: "e_cadherin_raw",
        7: "ki67_raw",
        8: "oncotype_score_raw",
        9: "oncotype_risk_raw",
        10: "age_decade_raw",
        11: "path_notes_raw",
        12: "mri_laterality_raw",
        13: "birads_raw",
        14: "mri_impression_text",
    }

    def __init__(self, file_path: str):
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"TCIA Breast Diagnosis workbook not found at: {file_path}")
        self.file_path = file_path
        self.raw_df: Optional[pd.DataFrame] = None
        self.patients_df: Optional[pd.DataFrame] = None
        self.ingestion_report: Dict[str, Any] = {}

    def load(self) -> pd.DataFrame:
        """Loads and transposes the raw Excel matrix into patient records."""
        self.raw_df = pd.read_excel(self.file_path, sheet_name="Sheet1")
        
        # Verify shape
        num_rows, num_cols = self.raw_df.shape
        if num_rows < 15 or num_cols < 3:
            raise ValueError(f"Unexpected matrix shape: ({num_rows}, {num_cols}). Expected at least 15 rows and 3 columns.")

        # Columns 0 and 1 are labels. Columns 2..52 are patient identifiers.
        patient_cols = [c for c in self.raw_df.columns[2:] if str(c).startswith("BreastDX-")]
        if len(patient_cols) != self.EXPECTED_PATIENT_COUNT:
            # Fallback to taking all columns after col 1 if naming differs slightly
            patient_cols = [c for c in self.raw_df.columns[2:] if not str(c).startswith("Unnamed")]

        records: List[Dict[str, Any]] = []
        for col_idx, pat_id in enumerate(patient_cols, start=2):
            rec: Dict[str, Any] = {
                "patient_id": str(pat_id).strip(),
                "source_dataset": self.DATASET_NAME,
                "source_file": os.path.basename(self.file_path),
                "source_column_index": col_idx,
            }
            for row_idx, field_name in self.ROW_MAPPING.items():
                if row_idx < len(self.raw_df):
                    val = self.raw_df.iloc[row_idx, col_idx]
                    rec[field_name] = None if pd.isna(val) else str(val).strip()
                else:
                    rec[field_name] = None
            records.append(rec)

        self.patients_df = pd.DataFrame(records)

        # Generate audit report
        self.ingestion_report = {
            "source_file": self.file_path,
            "raw_shape": list(self.raw_df.shape),
            "patient_count": len(self.patients_df),
            "unique_patient_ids": int(self.patients_df["patient_id"].nunique()),
            "missing_counts": self.patients_df.isna().sum().to_dict(),
            "validation_passed": len(self.patients_df) == self.EXPECTED_PATIENT_COUNT,
        }

        return self.patients_df

    def to_clinical_observations(self) -> List[Dict[str, Any]]:
        """Extracts granular clinical observations with provenance and temporal context."""
        if self.patients_df is None:
            self.load()

        observations: List[Dict[str, Any]] = []

        for _, row in self.patients_df.iterrows():
            pat_id = row["patient_id"]

            # Diagnosis observation
            if row["diagnosis_raw"] is not None:
                observations.append({
                    "observation_id": str(uuid.uuid4()),
                    "concept": "histologic_diagnosis",
                    "normalized_value": row["diagnosis_raw"],
                    "raw_value": row["diagnosis_raw"],
                    "status": "documented",
                    "unit": None,
                    "timepoint": "pre_treatment",
                    "provenance": {
                        "source_dataset": self.DATASET_NAME,
                        "source_file": os.path.basename(self.file_path),
                        "source_record_id": pat_id,
                        "source_field_path": "Row 1 (Dx)",
                    },
                    "extraction": {
                        "method": "structured_parser",
                        "confidence": 1.0,
                    },
                })

            # ER Status
            er_status = "not_reported" if row["er_raw"] is None else "documented"
            observations.append({
                "observation_id": str(uuid.uuid4()),
                "concept": "er_status",
                "normalized_value": row["er_raw"].lower() if row["er_raw"] else None,
                "raw_value": row["er_raw"],
                "status": er_status,
                "unit": None,
                "timepoint": "baseline",
                "provenance": {
                    "source_dataset": self.DATASET_NAME,
                    "source_file": os.path.basename(self.file_path),
                    "source_record_id": pat_id,
                    "source_field_path": "Row 3 (ER)",
                },
                "extraction": {
                    "method": "structured_parser",
                    "confidence": 1.0,
                },
            })

            # PR Status
            pr_status = "not_reported" if row["pr_raw"] is None else "documented"
            observations.append({
                "observation_id": str(uuid.uuid4()),
                "concept": "pr_status",
                "normalized_value": row["pr_raw"].lower() if row["pr_raw"] else None,
                "raw_value": row["pr_raw"],
                "status": pr_status,
                "unit": None,
                "timepoint": "baseline",
                "provenance": {
                    "source_dataset": self.DATASET_NAME,
                    "source_file": os.path.basename(self.file_path),
                    "source_record_id": pat_id,
                    "source_field_path": "Row 4 (PR)",
                },
                "extraction": {
                    "method": "structured_parser",
                    "confidence": 1.0,
                },
            })

            # HER2 Status
            her2_status = "not_reported" if row["her2_raw"] is None else "documented"
            observations.append({
                "observation_id": str(uuid.uuid4()),
                "concept": "her2_status",
                "normalized_value": row["her2_raw"].lower() if row["her2_raw"] else None,
                "raw_value": row["her2_raw"],
                "status": her2_status,
                "unit": None,
                "timepoint": "baseline",
                "provenance": {
                    "source_dataset": self.DATASET_NAME,
                    "source_file": os.path.basename(self.file_path),
                    "source_record_id": pat_id,
                    "source_field_path": "Row 5 (HER2)",
                },
                "extraction": {
                    "method": "structured_parser",
                    "confidence": 1.0,
                },
            })

            # BI-RADS assessment
            if row["birads_raw"] is not None:
                observations.append({
                    "observation_id": str(uuid.uuid4()),
                    "concept": "birads_category",
                    "normalized_value": row["birads_raw"],
                    "raw_value": row["birads_raw"],
                    "status": "documented",
                    "unit": "category",
                    "timepoint": "pre_treatment",
                    "provenance": {
                        "source_dataset": self.DATASET_NAME,
                        "source_file": os.path.basename(self.file_path),
                        "source_record_id": pat_id,
                        "source_field_path": "Row 13 (BIRAD)",
                    },
                    "extraction": {
                        "method": "structured_parser",
                        "confidence": 1.0,
                    },
                })

            # Narrative MRI Impression
            if row["mri_impression_text"] is not None:
                observations.append({
                    "observation_id": str(uuid.uuid4()),
                    "concept": "mri_impression_narrative",
                    "normalized_value": row["mri_impression_text"],
                    "raw_value": row["mri_impression_text"],
                    "status": "documented",
                    "unit": None,
                    "timepoint": "pre_treatment",
                    "provenance": {
                        "source_dataset": self.DATASET_NAME,
                        "source_file": os.path.basename(self.file_path),
                        "source_record_id": pat_id,
                        "source_field_path": "Row 14 (Impression)",
                    },
                    "extraction": {
                        "method": "structured_parser",
                        "confidence": 1.0,
                    },
                })

        return observations

