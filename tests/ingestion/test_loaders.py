# Copyright (c) 2026 Shravanya Andhale, Nikhil Kadam, Sanket Patil, Khushi Shukla,
# Asma Parveen I Siddavatam and Pradnya Karekar
"""
Unit tests for clinical data ingestion loaders.
"""

import pytest
import os
import json
import jsonschema
from src.ingestion.tcia_breast_diagnosis_loader import TCIABreastDiagnosisLoader
from src.ingestion.ispy1_loader import ISPY1Loader
from src.ingestion.breastpathq_loader import BreastPathQLoader
from src.ingestion.tcga_brca_loader import TCGABRCALoader

WORKSPACE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TCIA_FILE = os.path.join(WORKSPACE_DIR, "TCIA-Breast-clinical-data-public-7_16_11 (1).xlsx")
ISPY1_FILE = os.path.join(WORKSPACE_DIR, "I-SPY-1-All-Patient-Clinical-and-Outcome-Data.xlsx")
BPQ_FILE = os.path.join(WORKSPACE_DIR, "FINAL-BreastPathQ_TrainTest_Clinical_Features.xlsx")
TCGA_FILE = os.path.join(WORKSPACE_DIR, "TCGA_Reports.csv")
OBS_SCHEMA_FILE = os.path.join(WORKSPACE_DIR, "schemas", "clinical_observation.schema.json")


@pytest.fixture(scope="module")
def observation_schema():
    with open(OBS_SCHEMA_FILE, "r") as f:
        return json.load(f)


def test_tcia_breast_diagnosis_loader(observation_schema):
    """Verifies TCIA Breast-Diagnosis transposition, patient count, and observations."""
    loader = TCIABreastDiagnosisLoader(TCIA_FILE)
    df = loader.load()

    assert len(df) == 51, f"Expected 51 patients, got {len(df)}"
    assert df["patient_id"].nunique() == 51
    assert "BreastDX-01-0001" in df["patient_id"].values
    assert "BreastDX-01-0002" in df["patient_id"].values

    # Check observations
    obs = loader.to_clinical_observations()
    assert len(obs) > 0

    # Validate against JSON schema
    validator = jsonschema.Draft202012Validator(observation_schema)
    for sample_obs in obs[:20]:
        validator.validate(sample_obs)

    # Check that patient 0002 has biopsy notes and MRI impression
    pat2_obs = [o for o in obs if o["provenance"]["source_record_id"] == "BreastDX-01-0002"]
    concepts = [o["concept"] for o in pat2_obs]
    assert "histologic_diagnosis" in concepts
    assert "er_status" in concepts
    assert "her2_status" in concepts


def test_ispy1_loader(observation_schema):
    """Verifies I-SPY-1 trial loading, temporal tagging, and baseline/outcome segregation."""
    loader = ISPY1Loader(ISPY1_FILE)
    sheets = loader.load()

    clin_df = sheets["clinical"]
    out_df = sheets["outcomes"]

    assert len(clin_df) == 221
    assert len(out_df) == 221
    assert clin_df["SUBJECTID"].nunique() == 221

    # Check default observations (baseline and longitudinal only, no outcomes)
    baseline_obs = loader.to_clinical_observations(include_outcomes=False)
    timepoints = set(o["timepoint"] for o in baseline_obs)
    assert "outcome" not in timepoints, "Outcome variables must NOT be in baseline observations!"
    assert "baseline" in timepoints

    # Validate schema on samples
    validator = jsonschema.Draft202012Validator(observation_schema)
    for sample_obs in baseline_obs[:20]:
        validator.validate(sample_obs)

    # Check when outcomes are requested explicitly
    all_obs = loader.to_clinical_observations(include_outcomes=True)
    all_timepoints = set(o["timepoint"] for o in all_obs)
    assert "outcome" in all_timepoints


def test_breastpathq_loader(observation_schema):
    """Verifies BreastPathQ patient vs scan count and resection temporal tagging."""
    loader = BreastPathQLoader(BPQ_FILE)
    df = loader.load()

    assert len(df) == 96, "Expected 96 scan records"
    assert df["patient_id"].nunique() == 54, "Expected 54 unique patients"

    obs = loader.to_clinical_observations()
    assert len(obs) > 0

    # Check that resection observations have timepoint 'post_treatment_resection'
    resection_obs = [o for o in obs if "resection" in o["concept"] or "residual" in o["concept"]]
    assert len(resection_obs) > 0
    for ro in resection_obs:
        assert ro["timepoint"] == "post_treatment_resection"

    # Validate against JSON schema
    validator = jsonschema.Draft202012Validator(observation_schema)
    for sample_obs in obs[:20]:
        validator.validate(sample_obs)


def test_tcga_brca_loader(observation_schema):
    """Verifies TCGA-BRCA filtering of the verified 1,034 reports cohort."""
    loader = TCGABRCALoader(TCGA_FILE)
    df = loader.load()

    assert len(df) == 1034, f"Expected 1,034 TCGA-BRCA reports, got {len(df)}"
    assert df["patient_id"].nunique() > 900
    assert "TCGA-MB-A8JL" in df["patient_id"].values

    obs = loader.to_clinical_observations()
    assert len(obs) == 1034

    # Validate against JSON schema
    validator = jsonschema.Draft202012Validator(observation_schema)
    for sample_obs in obs[:10]:
        validator.validate(sample_obs)

