"""
End-to-End Integration Tests for Sanket's Module.

Verifies that Shravanya's canonical patient profiles and guideline check outputs
feed directly into Sanket's Safety Engine and Treatment Planning Engine,
producing schema-valid safety assessments and treatment plans across all clinical scenarios.
"""

import pytest
import os
import glob
import json
import jsonschema

from src.safety import SafetyEngine
from src.treatment import TreatmentEngine
from src.guidelines.evaluator import GuidelineEvaluator

SAMPLE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data", "sample")
SCHEMA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "schemas")

SAFETY_SCHEMA = os.path.join(SCHEMA_DIR, "safety_assessment.schema.json")
TREATMENT_SCHEMA = os.path.join(SCHEMA_DIR, "treatment_plan.schema.json")


def test_scenario_a_end_to_end_integration():
    """Tests end-to-end processing of Scenario A (Luminal A)."""
    scenario_path = os.path.join(SAMPLE_DIR, "scenario_a_complete_profile.json")
    with open(scenario_path) as f:
        profile = json.load(f)

    # 1. Shravanya guideline evaluation
    guide_eval = GuidelineEvaluator()
    guideline_output = guide_eval.evaluate_profile(profile)

    # 2. Sanket safety evaluation
    safety_output = SafetyEngine.evaluate_patient_safety(profile)

    # 3. Sanket treatment plan formulation
    treatment_output = TreatmentEngine.generate_treatment_plan(profile, guideline_output, safety_output)

    # Assert schema conformance
    with open(SAFETY_SCHEMA) as f:
        s_schema = json.load(f)
    with open(TREATMENT_SCHEMA) as f:
        t_schema = json.load(f)

    jsonschema.validate(safety_output, s_schema)
    jsonschema.validate(treatment_output, t_schema)

    assert treatment_output["plan_status"] == "supported_for_consideration"
    assert treatment_output["patient_id"] == profile["patient_id"]


def test_scenario_b_her2_equivocal_integration():
    """Tests that HER2 IHC 2+ triggers reflex testing prompt and review status."""
    scenario_path = os.path.join(SAMPLE_DIR, "scenario_b_her2_equivocal.json")
    with open(scenario_path) as f:
        data = json.load(f)
    profile = data["profile"]
    guidelines = data["guideline_check"]

    safety_output = SafetyEngine.evaluate_patient_safety(profile)
    treatment_output = TreatmentEngine.generate_treatment_plan(profile, guidelines, safety_output)

    # HER2 therapies should require clinician review
    trast_options = [o for o in treatment_output["treatment_options"] if "Trastuzumab" in o["regimen_or_modality"]]
    for opt in trast_options:
        assert opt["eligibility_status"] == "requires_clinician_review"


def test_scenario_c_missing_information_integration():
    """Tests that missing parameters lead to insufficient information status."""
    scenario_path = os.path.join(SAMPLE_DIR, "scenario_c_missing_information.json")
    with open(scenario_path) as f:
        data = json.load(f)
    profile = data["profile"]
    guidelines = data["guideline_check"]

    safety_output = SafetyEngine.evaluate_patient_safety(profile)
    treatment_output = TreatmentEngine.generate_treatment_plan(profile, guidelines, safety_output)

    assert len(treatment_output["missing_information"]) > 0


def test_all_sample_scenarios_schema_compliance():
    """Verifies that running SafetyEngine and TreatmentEngine on all sample profiles satisfies schemas."""
    with open(SAFETY_SCHEMA) as f:
        s_schema = json.load(f)
    with open(TREATMENT_SCHEMA) as f:
        t_schema = json.load(f)

    guide_eval = GuidelineEvaluator()

    for fpath in glob.glob(os.path.join(SAMPLE_DIR, "*.json")):
        with open(fpath) as f:
            doc = json.load(f)

        profile = None
        guidelines = None

        if "profile" in doc:
            profile = doc["profile"]
            guidelines = doc.get("guideline_check")
        elif "patient_id" in doc and "demographics" in doc:
            profile = doc

        if profile is not None:
            if guidelines is None:
                guidelines = guide_eval.evaluate_profile(profile)

            safety = SafetyEngine.evaluate_patient_safety(profile)
            plan = TreatmentEngine.generate_treatment_plan(profile, guidelines, safety)

            jsonschema.validate(safety, s_schema)
            jsonschema.validate(plan, t_schema)

