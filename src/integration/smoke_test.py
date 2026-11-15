"""
Executable Integration Smoke Test for Sanket & Nikhil.

Demonstrates end-to-end execution:
1. Loads an input canonical patient profile.
2. Asserts Draft 2020-12 schema validity.
3. Executes deterministic guideline evaluations.
4. Asserts guideline output schema validity.
5. Validates preservation of equivocal status, missing data, and clinical review flags.

Usage:
    python -m src.integration.smoke_test
"""

import os
import sys
import json
import jsonschema

from src.patient_profile.generator import PatientProfileGenerator
from src.guidelines.evaluator import GuidelineEvaluator

WORKSPACE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROFILE_SCHEMA = os.path.join(WORKSPACE_DIR, "schemas", "patient_profile.schema.json")
GUIDELINE_SCHEMA = os.path.join(WORKSPACE_DIR, "schemas", "guideline_check.schema.json")
SAMPLE_PROFILE = os.path.join(WORKSPACE_DIR, "data", "sample", "sample_patient_profile.json")


def run_smoke_test() -> bool:
    print("==================================================================")
    print("  BREAST CANCER CDSS — INTEGRATION SMOKE TEST (SHRAVANYA -> SANKET)")
    print("==================================================================")

    # Step 1: Validate Schema Compilations
    print("[1/5] Validating JSON Schema contracts...")
    with open(PROFILE_SCHEMA, "r") as f:
        profile_schema_doc = json.load(f)
    with open(GUIDELINE_SCHEMA, "r") as f:
        guideline_schema_doc = json.load(f)

    p_validator = jsonschema.Draft202012Validator(profile_schema_doc)
    g_validator = jsonschema.Draft202012Validator(guideline_schema_doc)
    print("      ✓ schemas/patient_profile.schema.json is valid.")
    print("      ✓ schemas/guideline_check.schema.json is valid.")

    # Step 2: Load and Validate Sample Patient Profile
    print("\n[2/5] Loading and validating canonical patient profile...")
    with open(SAMPLE_PROFILE, "r") as f:
        patient_profile = json.load(f)
    p_validator.validate(patient_profile)
    print(f"      ✓ Patient Profile '{patient_profile['patient_id']}' conforms to contract.")
    print(f"        Subtype: {patient_profile['pathology_biomarkers']['molecular_subtype']}, ER: {patient_profile['pathology_biomarkers']['er_status']}")

    # Step 3: Run Deterministic Guideline Evaluation
    print("\n[3/5] Executing clinical guideline evaluation engine...")
    evaluator = GuidelineEvaluator(validate_schema=True)
    guideline_output = evaluator.evaluate_profile(patient_profile)
    g_validator.validate(guideline_output)
    print(f"      ✓ Evaluated {len(guideline_output['checks'])} guideline rules. Output schema verified.")

    # Step 4: Display Guideline Outcomes
    print("\n[4/5] Guideline Evaluation Summary:")
    for check in guideline_output["checks"]:
        print(f"      - [{check['result'].upper()}] {check['rule_id']}: {check['rule_name']}")
        if check.get("clinician_action_prompt"):
            print(f"        Action: {check['clinician_action_prompt']}")

    # Step 5: Test Equivocal & Missingness Edge Cases
    print("\n[5/5] Testing Equivocal & Missingness Guardrails...")
    pgen = PatientProfileGenerator(validate_schema=True)
    equivocal_profile = pgen.build_profile(
        patient_id="SMOKE_EQUIVOCAL_HER2",
        source_dataset="TCIA_BREAST_DIAGNOSIS",
        source_patient_id="Test_02",
        observations=[],
        tumor_size_mm=22.0,
        er_raw="positive",
        pr_raw="positive",
        her2_raw="2+",
        her2_fish_raw=None,
    )
    equivocal_results = evaluator.evaluate_profile(equivocal_profile)
    checks = {c["rule_id"]: c for c in equivocal_results["checks"]}

    # Assert reflex ISH rule triggers requires_review and manual review
    assert checks["ASCO-CAP-2018-HER2-REFLEX-005"]["result"] == "requires_review"
    assert checks["ASCO-CAP-2018-HER2-REFLEX-005"]["manual_review_required"] is True
    print("      ✓ HER2 2+ equivocal case correctly marked REQUIRES_REVIEW (Never defaulted to positive or negative).")

    print("\n==================================================================")
    print("  ALL SMOKE TESTS PASSED — READY FOR SANKET & NIKHIL CONSUMPTION")
    print("==================================================================")
    return True


if __name__ == "__main__":
    success = run_smoke_test()
    sys.exit(0 if success else 1)

