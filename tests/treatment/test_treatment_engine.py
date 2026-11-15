"""
Unit and Integration Tests for Sanket's Treatment Planning & Clinical Reasoning Engine.
"""

import pytest
import os
import json
import jsonschema

from src.treatment import (
    TreatmentEngine,
    TreatmentEligibilityEvaluator,
    TreatmentOptionCatalog,
    TreatmentReasoningEngine,
    TreatmentExplanationGenerator,
)
from src.safety import SafetyEngine
from src.guidelines.evaluator import GuidelineEvaluator

SCHEMA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "schemas")
TREATMENT_SCHEMA = os.path.join(SCHEMA_DIR, "treatment_plan.schema.json")


@pytest.fixture
def luminal_a_profile():
    return {
        "patient_id": "TEST_LUMINAL_A",
        "source_dataset": "TCIA_BREAST_DIAGNOSIS",
        "source_patient_id": "BreastDX-01-0001",
        "profile_generation_timestamp": "2026-11-15T12:00:00Z",
        "demographics": {
            "age": 60.0,
            "menopausal_status": "postmenopausal",
            "race_ethnicity": None,
            "status": "documented"
        },
        "clinical_extent": {
            "laterality": "right",
            "primary_tumor_size_mm": 18.0,
            "clinical_t_stage": "cT1c",
            "clinical_n_stage": "cN0",
            "clinical_m_stage": "cM0",
            "status": "documented"
        },
        "pathology_biomarkers": {
            "histologic_type": "invasive_ductal_carcinoma",
            "histologic_grade": "grade_1",
            "er_status": "positive",
            "er_percentage": 90.0,
            "er_low_flag": False,
            "pr_status": "positive",
            "pr_percentage": 80.0,
            "her2_status": "negative",
            "her2_ihc_score": "0",
            "her2_fish_ratio": None,
            "her2_fish_status": None,
            "ki67_index": 10.0,
            "molecular_subtype": "luminal_a",
            "status": "documented"
        },
        "clinical_timepoints": [],
        "observations": [],
        "review_flags": []
    }


def test_treatment_schema_validity():
    """Verifies that schemas/treatment_plan.schema.json is a valid Draft 2020-12 schema."""
    with open(TREATMENT_SCHEMA) as f:
        schema = json.load(f)
    jsonschema.Draft202012Validator.check_schema(schema)


def test_luminal_a_treatment_plan(luminal_a_profile):
    """Verifies that Luminal A postmenopausal patient receives endocrine & surgical options."""
    guide_eval = GuidelineEvaluator()
    guidelines = guide_eval.evaluate_profile(luminal_a_profile)
    safety = SafetyEngine.evaluate_patient_safety(luminal_a_profile)
    plan = TreatmentEngine.generate_treatment_plan(luminal_a_profile, guidelines, safety)

    assert plan["plan_status"] == "supported_for_consideration"
    assert plan["manual_review_required"] is True

    options = {o["treatment_option_id"]: o for o in plan["treatment_options"]}

    # Aromatase inhibitor should be supported for consideration
    ai_opt = options["OPT-ADJ-ENDO-AI-007"]
    assert ai_opt["eligibility_status"] == "supported_for_consideration"
    assert "postmenopausal" in " ".join(ai_opt["supporting_observations"]).lower()

    # Tamoxifen should also be supported
    tam_opt = options["OPT-ADJ-ENDO-TAMOXIFEN-008"]
    assert tam_opt["eligibility_status"] == "supported_for_consideration"

    # Anti-HER2 and TNBC chemo should NOT be supported
    assert options["OPT-NEOADJ-HER2-DUAL-004"]["eligibility_status"] == "not_supported_by_available_information"
    assert options["OPT-NEOADJ-TNBC-KEYNOTE-005"]["eligibility_status"] == "not_supported_by_available_information"


def test_her2_positive_plan(luminal_a_profile):
    """Verifies that HER2-positive stage II patient receives anti-HER2 recommendations."""
    luminal_a_profile["pathology_biomarkers"]["her2_status"] = "positive"
    luminal_a_profile["pathology_biomarkers"]["her2_ihc_score"] = "3+"
    luminal_a_profile["clinical_extent"]["primary_tumor_size_mm"] = 28.0
    luminal_a_profile["clinical_extent"]["clinical_t_stage"] = "cT2"

    guide_eval = GuidelineEvaluator()
    guidelines = guide_eval.evaluate_profile(luminal_a_profile)
    safety = SafetyEngine.evaluate_patient_safety(luminal_a_profile)
    plan = TreatmentEngine.generate_treatment_plan(luminal_a_profile, guidelines, safety)

    options = {o["treatment_option_id"]: o for o in plan["treatment_options"]}
    assert options["OPT-NEOADJ-HER2-DUAL-004"]["eligibility_status"] == "supported_for_consideration"
    assert options["OPT-ADJ-HER2-TRASTUZUMAB-006"]["eligibility_status"] == "supported_for_consideration"


def test_her2_equivocal_reflex_testing_guardrail(luminal_a_profile):
    """Verifies that HER2 IHC 2+ equivocal profile triggers clinician review rather than prescription."""
    luminal_a_profile["pathology_biomarkers"]["her2_status"] = "equivocal"
    luminal_a_profile["pathology_biomarkers"]["her2_ihc_score"] = "2+"

    guide_eval = GuidelineEvaluator()
    guidelines = guide_eval.evaluate_profile(luminal_a_profile)
    safety = SafetyEngine.evaluate_patient_safety(luminal_a_profile)
    plan = TreatmentEngine.generate_treatment_plan(luminal_a_profile, guidelines, safety)

    options = {o["treatment_option_id"]: o for o in plan["treatment_options"]}
    trastuzumab_adj = options["OPT-ADJ-HER2-TRASTUZUMAB-006"]
    assert trastuzumab_adj["eligibility_status"] == "requires_clinician_review"
    assert any("reflex" in p.lower() for p in trastuzumab_adj["clinician_action_prompts"])


def test_triple_negative_keynote522(luminal_a_profile):
    """Verifies that Stage II TNBC patient receives Keynote-522 chemo-immunotherapy option."""
    luminal_a_profile["pathology_biomarkers"]["molecular_subtype"] = "triple_negative"
    luminal_a_profile["pathology_biomarkers"]["er_status"] = "negative"
    luminal_a_profile["pathology_biomarkers"]["pr_status"] = "negative"
    luminal_a_profile["pathology_biomarkers"]["her2_status"] = "negative"
    luminal_a_profile["clinical_extent"]["primary_tumor_size_mm"] = 32.0

    guide_eval = GuidelineEvaluator()
    guidelines = guide_eval.evaluate_profile(luminal_a_profile)
    safety = SafetyEngine.evaluate_patient_safety(luminal_a_profile)
    plan = TreatmentEngine.generate_treatment_plan(luminal_a_profile, guidelines, safety)

    options = {o["treatment_option_id"]: o for o in plan["treatment_options"]}
    assert options["OPT-NEOADJ-TNBC-KEYNOTE-005"]["eligibility_status"] == "supported_for_consideration"


def test_cardiotoxicity_safety_override(luminal_a_profile):
    """Verifies that LVEF < 50% overrides HER2 eligibility to 'contraindication_flagged'."""
    luminal_a_profile["pathology_biomarkers"]["her2_status"] = "positive"
    luminal_a_profile["clinical_extent"]["primary_tumor_size_mm"] = 25.0
    luminal_a_profile["observations"].append({
        "observation_id": "OBS-CARDIO-LOW",
        "concept": "lvef_percent",
        "normalized_value": 41.0,
        "raw_value": "41%",
        "status": "documented",
        "unit": "%",
        "timepoint": "pre_treatment",
        "provenance": {"source_dataset": "TEST", "source_file": "echo", "source_record_id": "1", "source_field_path": "lvef"},
        "extraction": {"method": "structured", "confidence": 1.0}
    })

    guide_eval = GuidelineEvaluator()
    guidelines = guide_eval.evaluate_profile(luminal_a_profile)
    safety = SafetyEngine.evaluate_patient_safety(luminal_a_profile)
    plan = TreatmentEngine.generate_treatment_plan(luminal_a_profile, guidelines, safety)

    assert plan["plan_status"] == "contraindication_flagged"
    options = {o["treatment_option_id"]: o for o in plan["treatment_options"]}
    trast_adj = options["OPT-ADJ-HER2-TRASTUZUMAB-006"]
    assert trast_adj["eligibility_status"] == "contraindication_flagged"
    assert "CONTRAINDICATION FLAGGED" in trast_adj["rationale"]


def test_premenopausal_ai_contraindication_override(luminal_a_profile):
    """Verifies that AIs in premenopausal women without OFS are flagged as contraindicated."""
    luminal_a_profile["demographics"]["menopausal_status"] = "premenopausal"

    guide_eval = GuidelineEvaluator()
    guidelines = guide_eval.evaluate_profile(luminal_a_profile)
    safety = SafetyEngine.evaluate_patient_safety(luminal_a_profile)
    plan = TreatmentEngine.generate_treatment_plan(luminal_a_profile, guidelines, safety)

    options = {o["treatment_option_id"]: o for o in plan["treatment_options"]}
    ai_opt = options["OPT-ADJ-ENDO-AI-007"]
    assert ai_opt["eligibility_status"] == "contraindication_flagged"

