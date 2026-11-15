"""
Unit tests for Guideline Knowledge Base and Deterministic Rules Evaluator.
"""

import pytest
import os
import json
import jsonschema
from src.patient_profile.generator import PatientProfileGenerator
from src.guidelines.evaluator import GuidelineEvaluator

WORKSPACE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
GUIDELINE_SCHEMA_FILE = os.path.join(WORKSPACE_DIR, "schemas", "guideline_check.schema.json")


def test_her2_positive_early_breast_cancer_guidelines():
    """Tests that HER2+ tumor > 5mm triggers adjuvant trastuzumab (Rule 1)."""
    pgen = PatientProfileGenerator(validate_schema=True)
    profile = pgen.build_profile(
        patient_id="PAT_TEST_HER2",
        source_dataset="TCIA_BREAST_DIAGNOSIS",
        source_patient_id="BreastDX-01-0002",
        observations=[],
        tumor_size_mm=18.0,
        er_raw="negative",
        pr_raw="negative",
        her2_raw="3+",
    )

    evaluator = GuidelineEvaluator(validate_schema=True)
    result = evaluator.evaluate_profile(profile)

    assert result["patient_id"] == "PAT_TEST_HER2"
    checks = {c["rule_id"]: c for c in result["checks"]}

    # Rule 1: Adjuvant Trastuzumab should be APPLICABLE
    assert checks["ESMO-BC-2024-HER2-ADJ-001"]["result"] == "applicable"
    assert "cardiac" in checks["ESMO-BC-2024-HER2-ADJ-001"]["clinician_action_prompt"].lower()

    # Rule 2: Neoadjuvant dual blockade is NOT APPLICABLE (size <= 20mm, cN0)
    assert checks["ESMO-BC-2024-HER2-NEOADJ-002"]["result"] == "not_applicable"

    # Rule 3: Endocrine therapy is NOT APPLICABLE (ER-, PR-)
    assert checks["ESMO-BC-2024-HR-ENDO-003"]["result"] == "not_applicable"


def test_tnbc_neoadjuvant_guidelines():
    """Tests that TNBC tumor > 20mm triggers neoadjuvant chemotherapy (Rule 4)."""
    pgen = PatientProfileGenerator(validate_schema=True)
    profile = pgen.build_profile(
        patient_id="PAT_TEST_TNBC",
        source_dataset="ISPY1_CALGB150007",
        source_patient_id="1008",
        observations=[],
        tumor_size_mm=35.0,
        er_raw="negative",
        pr_raw="negative",
        her2_raw="0",
    )

    evaluator = GuidelineEvaluator(validate_schema=True)
    result = evaluator.evaluate_profile(profile)
    checks = {c["rule_id"]: c for c in result["checks"]}

    assert checks["ESMO-BC-2024-TNBC-NEOADJ-004"]["result"] == "applicable"
    assert "BRCA" in checks["ESMO-BC-2024-TNBC-NEOADJ-004"]["clinician_action_prompt"]


def test_her2_equivocal_reflex_testing_guidelines():
    """Tests that HER2 2+ triggers reflex ISH requirement (Rule 5)."""
    pgen = PatientProfileGenerator(validate_schema=True)
    profile = pgen.build_profile(
        patient_id="PAT_TEST_EQUIVOCAL",
        source_dataset="BREASTPATHQ",
        source_patient_id="22",
        observations=[],
        tumor_size_mm=25.0,
        er_raw="positive",
        pr_raw="positive",
        her2_raw="2+",
        her2_fish_raw=None,
    )

    evaluator = GuidelineEvaluator(validate_schema=True)
    result = evaluator.evaluate_profile(profile)
    checks = {c["rule_id"]: c for c in result["checks"]}

    # Rule 5: Reflex ISH should be REQUIRES_REVIEW
    assert checks["ASCO-CAP-2018-HER2-REFLEX-005"]["result"] == "requires_review"
    assert checks["ASCO-CAP-2018-HER2-REFLEX-005"]["manual_review_required"] is True

    # Adjuvant Trastuzumab should also require review, never automatically applicable
    assert checks["ESMO-BC-2024-HER2-ADJ-001"]["result"] == "requires_review"


def test_missing_data_safeguard():
    """Verifies that missing critical information triggers insufficient_information, never applicable."""
    pgen = PatientProfileGenerator(validate_schema=True)
    profile = pgen.build_profile(
        patient_id="PAT_TEST_MISSING",
        source_dataset="TCIA_BREAST_DIAGNOSIS",
        source_patient_id="BreastDX-01-0050",
        observations=[],
        tumor_size_mm=None,
        er_raw=None,
        pr_raw=None,
        her2_raw=None,
    )

    evaluator = GuidelineEvaluator(validate_schema=True)
    result = evaluator.evaluate_profile(profile)
    checks = {c["rule_id"]: c for c in result["checks"]}

    # Neither Trastuzumab nor Endocrine can be declared applicable
    assert checks["ESMO-BC-2024-HER2-ADJ-001"]["result"] == "insufficient_information"
    assert checks["ESMO-BC-2024-HR-ENDO-003"]["result"] == "insufficient_information"

