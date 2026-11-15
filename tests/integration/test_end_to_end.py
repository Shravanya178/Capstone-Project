"""
End-to-End Pipeline Integration Tests.
Verifies complete workflow: raw data ingestion -> canonical profile -> guideline evaluation.
"""

import pytest
import os
from src.integration.pipeline import CDSSPipeline
from src.integration.smoke_test import run_smoke_test


def test_tcia_end_to_end():
    """Runs pipeline on real TCIA Breast-Diagnosis patient record."""
    pipeline = CDSSPipeline()
    output = pipeline.process_tcia_patient(patient_col_index=3)  # BreastDX-01-0002

    profile = output["patient_profile"]
    guidelines = output["guideline_check"]

    assert profile["patient_id"] == "TCIA_BreastDX-01-0002"
    assert profile["pathology_biomarkers"]["er_status"] == "positive"
    assert profile["pathology_biomarkers"]["her2_status"] == "negative"
    assert len(profile["observations"]) > 0

    assert guidelines["patient_id"] == "TCIA_BreastDX-01-0002"
    assert len(guidelines["checks"]) == 5


def test_ispy1_end_to_end():
    """Runs pipeline on real I-SPY-1 clinical trial patient record."""
    pipeline = CDSSPipeline()
    output = pipeline.process_ispy1_patient(row_index=0)  # SUBJECTID 1001

    profile = output["patient_profile"]
    guidelines = output["guideline_check"]

    assert profile["patient_id"] == "ISPY1_1001"
    assert profile["clinical_extent"]["primary_tumor_size_mm"] is not None
    assert len(guidelines["checks"]) == 5


def test_smoke_test_execution():
    """Verifies that the standalone integration smoke test passes."""
    assert run_smoke_test() is True

