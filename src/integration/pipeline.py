"""
End-to-End CDSS Integration Pipeline.

Orchestrates complete data ingestion, preprocessing, normalization, canonical
patient profile generation, and deterministic clinical guideline checking.
"""

from typing import Dict, Any, List, Optional
import os
import json

from src.ingestion.tcia_breast_diagnosis_loader import TCIABreastDiagnosisLoader
from src.ingestion.ispy1_loader import ISPY1Loader
from src.ingestion.breastpathq_loader import BreastPathQLoader
from src.ingestion.tcga_brca_loader import TCGABRCALoader
from src.patient_profile.generator import PatientProfileGenerator
from src.guidelines.evaluator import GuidelineEvaluator


class CDSSPipeline:
    """Master pipeline orchestrator for Shravanya's modules."""

    def __init__(self, workspace_dir: Optional[str] = None):
        self.workspace_dir = workspace_dir or os.getcwd()
        self.profile_generator = PatientProfileGenerator(validate_schema=True)
        self.guideline_evaluator = GuidelineEvaluator(validate_schema=True)

    def process_tcia_patient(self, patient_col_index: int = 2) -> Dict[str, Any]:
        """Loads TCIA clinical workbook and processes a specified patient column."""
        tcia_file = os.path.join(self.workspace_dir, "TCIA-Breast-clinical-data-public-7_16_11 (1).xlsx")
        loader = TCIABreastDiagnosisLoader(tcia_file)
        patients_df = loader.load()

        pat_row = patients_df.iloc[patient_col_index - 2]
        pat_id = pat_row["patient_id"]

        # Filter observations for this patient
        all_obs = loader.to_clinical_observations()
        pat_obs = [o for o in all_obs if o["provenance"]["source_record_id"] == pat_id]

        # Build Profile
        profile = self.profile_generator.build_profile(
            patient_id=f"TCIA_{pat_id}",
            source_dataset=loader.DATASET_NAME,
            source_patient_id=pat_id,
            observations=pat_obs,
            laterality=pat_row["pathology_laterality_raw"],
            histologic_type=pat_row["diagnosis_raw"],
            er_raw=pat_row["er_raw"],
            pr_raw=pat_row["pr_raw"],
            her2_raw=pat_row["her2_raw"],
            ki67_raw=pat_row["ki67_raw"],
        )

        # Run Guideline Evaluation
        guideline_results = self.guideline_evaluator.evaluate_profile(profile)

        return {
            "patient_profile": profile,
            "guideline_check": guideline_results,
        }

    def process_ispy1_patient(self, row_index: int = 0) -> Dict[str, Any]:
        """Loads I-SPY-1 clinical trial data and processes a patient row."""
        ispy_file = os.path.join(self.workspace_dir, "I-SPY-1-All-Patient-Clinical-and-Outcome-Data.xlsx")
        loader = ISPY1Loader(ispy_file)
        sheets = loader.load()
        clin_df = sheets["clinical"]

        row = clin_df.iloc[row_index]
        subj_id = row["SUBJECTID"]

        all_obs = loader.to_clinical_observations(include_outcomes=False)
        pat_obs = [o for o in all_obs if o["provenance"]["source_record_id"] == subj_id]

        profile = self.profile_generator.build_profile(
            patient_id=f"ISPY1_{subj_id}",
            source_dataset=loader.DATASET_NAME,
            source_patient_id=subj_id,
            observations=pat_obs,
            age=float(row["age"]) if "age" in row and pd_notna(row["age"]) else None,
            laterality=str(row["Laterality"]) if "Laterality" in row else None,
            tumor_size_mm=float(row["MRI LD Baseline"]) if "MRI LD Baseline" in row and pd_notna(row["MRI LD Baseline"]) else None,
            er_raw=row.get("ERpos"),
            pr_raw=row.get("PgRpos"),
            her2_raw=row.get("Her2MostPos"),
        )

        guideline_results = self.guideline_evaluator.evaluate_profile(profile)

        return {
            "patient_profile": profile,
            "guideline_check": guideline_results,
        }


def pd_notna(val: Any) -> bool:
    import pandas as pd
    return pd.notna(val)

