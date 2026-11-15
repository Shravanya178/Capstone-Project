"""
Unit and Integration Tests for Sanket's Clinical Safety & Contraindication Engine.
"""

import pytest
import os
import json
import jsonschema

from src.safety import (
    SafetyEngine,
    ContraindicationRegistry,
    PatientRiskAssessor,
    MedicationRuleEvaluator,
    SafetyMissingnessTracker,
)

SCHEMA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "schemas")
SAFETY_SCHEMA = os.path.join(SCHEMA_DIR, "safety_assessment.schema.json")


@pytest.fixture
def base_profile():
    return {
        "patient_id": "TEST_PATIENT_SAFETY",
        "source_dataset": "TCIA_BREAST_DIAGNOSIS",
        "source_patient_id": "BreastDX-01-9999",
        "profile_generation_timestamp": "2026-11-15T12:00:00Z",
        "demographics": {
            "age": 52.0,
            "menopausal_status": "postmenopausal",
            "race_ethnicity": None,
            "status": "documented"
        },
        "clinical_extent": {
            "laterality": "left",
            "primary_tumor_size_mm": 22.0,
            "clinical_t_stage": "cT2",
            "clinical_n_stage": "cN0",
            "clinical_m_stage": "cM0",
            "status": "documented"
        },
        "pathology_biomarkers": {
            "histologic_type": "invasive_ductal_carcinoma",
            "histologic_grade": "grade_2",
            "er_status": "positive",
            "er_percentage": 85.0,
            "er_low_flag": False,
            "pr_status": "positive",
            "pr_percentage": 70.0,
            "her2_status": "positive",
            "her2_ihc_score": "3+",
            "her2_fish_ratio": None,
            "her2_fish_status": None,
            "ki67_index": 20.0,
            "molecular_subtype": "luminal_b_her2_positive",
            "status": "documented"
        },
        "clinical_timepoints": [],
        "observations": [],
        "review_flags": []
    }


def test_safety_schema_validity():
    """Verifies that schemas/safety_assessment.schema.json is a valid Draft 2020-12 schema."""
    with open(SAFETY_SCHEMA) as f:
        schema = json.load(f)
    jsonschema.Draft202012Validator.check_schema(schema)


def test_normal_cardiac_clearance(base_profile):
    """Verifies that LVEF >= 50% is assessed as normal cardiac risk."""
    base_profile["observations"].append({
        "observation_id": "OBS-CARDIO-NORMAL",
        "concept": "lvef_percent",
        "normalized_value": 62.0,
        "raw_value": "62%",
        "status": "documented",
        "unit": "%",
        "timepoint": "pre_treatment",
        "provenance": {"source_dataset": "TEST", "source_file": "cardio", "source_record_id": "1", "source_field_path": "lvef"},
        "extraction": {"method": "structured", "confidence": 1.0}
    })
    assessment = SafetyEngine.evaluate_patient_safety(base_profile, candidate_medications=["Trastuzumab"])
    cardiac = assessment["organ_function_assessments"]["cardiac"]
    assert cardiac["status"] == "normal"
    assert cardiac["lvef_percent"] == 62.0
    assert cardiac["risk_level"] == "low"
    assert len(assessment["safety_findings"]) == 0


def test_cardiotoxicity_absolute_contraindication(base_profile):
    """Verifies that LVEF < 50% triggers absolute contraindication for Trastuzumab."""
    base_profile["observations"].append({
        "observation_id": "OBS-CARDIO-LOW",
        "concept": "lvef_percent",
        "normalized_value": 44.0,
        "raw_value": "44%",
        "status": "documented",
        "unit": "%",
        "timepoint": "pre_treatment",
        "provenance": {"source_dataset": "TEST", "source_file": "cardio", "source_record_id": "1", "source_field_path": "lvef"},
        "extraction": {"method": "structured", "confidence": 1.0}
    })
    assessment = SafetyEngine.evaluate_patient_safety(base_profile, candidate_medications=["Trastuzumab", "Pertuzumab"])
    assert assessment["overall_safety_status"] == "contraindication_identified"
    assert assessment["manual_review_required"] is True

    findings = assessment["safety_findings"]
    assert len(findings) >= 1
    trastuzumab_findings = [f for f in findings if "Trastuzumab" in f["medication_or_class"]]
    assert len(trastuzumab_findings) == 1
    assert trastuzumab_findings[0]["safety_category"] == "absolute_contraindication"
    assert trastuzumab_findings[0]["severity"] == "critical"
    assert "below the mandatory 50% safety threshold" in trastuzumab_findings[0]["explanation"]


def test_tamoxifen_thromboembolism_contraindication(base_profile):
    """Verifies that documented DVT/PE history contraindicates Tamoxifen."""
    base_profile["observations"].append({
        "observation_id": "OBS-THROMBO",
        "concept": "thromboembolic_history",
        "normalized_value": "history_of_dvt",
        "raw_value": "Prior deep vein thrombosis (2022)",
        "status": "documented",
        "unit": None,
        "timepoint": "baseline",
        "provenance": {"source_dataset": "TEST", "source_file": "med_hx", "source_record_id": "1", "source_field_path": "dvt"},
        "extraction": {"method": "structured", "confidence": 1.0}
    })
    assessment = SafetyEngine.evaluate_patient_safety(base_profile, candidate_medications=["Tamoxifen"])
    assert assessment["overall_safety_status"] == "contraindication_identified"
    thrombo_findings = [f for f in assessment["safety_findings"] if "Tamoxifen" in f["medication_or_class"]]
    assert len(thrombo_findings) == 1
    assert thrombo_findings[0]["safety_category"] == "absolute_contraindication"


def test_tamoxifen_cyp2d6_drug_interaction(base_profile):
    """Verifies that concurrent Paroxetine flags potential CYP2D6 interaction."""
    base_profile["observations"].append({
        "observation_id": "OBS-MEDS",
        "concept": "current_medications",
        "normalized_value": "Paroxetine 20 mg daily, Lisinopril 10 mg",
        "raw_value": "Paroxetine 20 mg daily, Lisinopril 10 mg",
        "status": "documented",
        "unit": None,
        "timepoint": "baseline",
        "provenance": {"source_dataset": "TEST", "source_file": "med_list", "source_record_id": "1", "source_field_path": "meds"},
        "extraction": {"method": "structured", "confidence": 1.0}
    })
    assessment = SafetyEngine.evaluate_patient_safety(base_profile, candidate_medications=["Tamoxifen"])
    assert assessment["overall_safety_status"] == "potential_interaction"
    interaction_findings = [f for f in assessment["safety_findings"] if f["safety_category"] == "drug_interaction"]
    assert len(interaction_findings) == 1
    assert "CYP2D6" in interaction_findings[0]["explanation"]


def test_aromatase_inhibitor_premenopausal_contraindication(base_profile):
    """Verifies that AIs without ovarian suppression in premenopausal patients are contraindicated."""
    base_profile["demographics"]["menopausal_status"] = "premenopausal"
    assessment = SafetyEngine.evaluate_patient_safety(base_profile, candidate_medications=["Anastrozole", "Letrozole"])
    assert assessment["overall_safety_status"] == "contraindication_identified"
    ai_findings = [f for f in assessment["safety_findings"] if "Aromatase" in f["medication_or_class"]]
    assert len(ai_findings) == 1
    assert ai_findings[0]["safety_category"] == "absolute_contraindication"


def test_renal_impairment_platinum_toxicity(base_profile):
    """Verifies that CrCl < 50 mL/min flags organ toxicity risk for platinum."""
    base_profile["observations"].append({
        "observation_id": "OBS-RENAL",
        "concept": "creatinine_clearance_ml_min",
        "normalized_value": 38.0,
        "raw_value": "38 mL/min",
        "status": "documented",
        "unit": "mL/min",
        "timepoint": "pre_treatment",
        "provenance": {"source_dataset": "TEST", "source_file": "renal_panel", "source_record_id": "1", "source_field_path": "crcl"},
        "extraction": {"method": "structured", "confidence": 1.0}
    })
    assessment = SafetyEngine.evaluate_patient_safety(base_profile, candidate_medications=["Cisplatin", "Carboplatin"])
    renal = assessment["organ_function_assessments"]["renal"]
    assert renal["status"] == "abnormal"
    assert renal["egfr_or_crcl"] == 38.0
    assert renal["risk_level"] == "high"


def test_confirmed_pregnancy_absolute_contraindication(base_profile):
    """Verifies that confirmed pregnancy flags absolute contraindication for systemic chemotherapy."""
    base_profile["demographics"]["menopausal_status"] = "premenopausal"
    base_profile["observations"].append({
        "observation_id": "OBS-PREG",
        "concept": "pregnancy_status",
        "normalized_value": "positive",
        "raw_value": "Positive hCG serum test",
        "status": "documented",
        "unit": None,
        "timepoint": "pre_treatment",
        "provenance": {"source_dataset": "TEST", "source_file": "beta_hcg", "source_record_id": "1", "source_field_path": "hcg"},
        "extraction": {"method": "structured", "confidence": 1.0}
    })
    assessment = SafetyEngine.evaluate_patient_safety(base_profile, candidate_medications=["Paclitaxel", "Doxorubicin", "Trastuzumab"])
    assert assessment["overall_safety_status"] == "contraindication_identified"
    preg_findings = [f for f in assessment["safety_findings"] if "Pregnancy" in f["triggering_condition"] or "teratogenic" in f["explanation"]]
    assert len(preg_findings) >= 1
    assert preg_findings[0]["severity"] == "critical"


def test_missing_safety_information_tracking(base_profile):
    """Verifies that unrecorded safety variables are explicitly cataloged."""
    assessment = SafetyEngine.evaluate_patient_safety(base_profile)
    missing = assessment["missing_safety_information"]
    assert any("medication list" in m.lower() for m in missing)
    assert any("allergy" in m.lower() for m in missing)
    assert any("lvef" in m.lower() for m in missing)
    assert len(assessment["dataset_limitations"]) >= 1
