# Copyright (c) 2026 Shravanya Andhale, Nikhil Kadam, Sanket Patil, Khushi Shukla,
# Asma Parveen I Siddavatam and Pradnya Karekar
"""
Executable Integration Smoke Test for Shravanya, Sanket & Nikhil.

Demonstrates end-to-end execution:
1. Loads and validates all 5 JSON Schema contracts (Draft 2020-12).
2. Ingests / validates canonical patient profiles.
3. Executes deterministic guideline evaluations (Shravanya).
4. Executes comprehensive clinical safety & contraindication assessment (Sanket).
5. Executes patient-specific treatment planning & explainable reasoning (Sanket).
6. Asserts schema compliance for all outputs.
7. Validates guardrails: HER2 equivocal reflex, LVEF cardiotoxicity override, missingness handling.
8. Persists sample output artifacts for Nikhil's UI/API integration.

Usage:
    python -m src.integration.smoke_test
"""

import os
import sys
import json
import jsonschema

from src.patient_profile.generator import PatientProfileGenerator
from src.guidelines.evaluator import GuidelineEvaluator
from src.safety.safety_engine import SafetyEngine
from src.treatment.treatment_engine import TreatmentEngine

WORKSPACE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SCHEMAS_DIR = os.path.join(WORKSPACE_DIR, "schemas")
DATA_SAMPLE_DIR = os.path.join(WORKSPACE_DIR, "data", "sample")

OBSERVATION_SCHEMA = os.path.join(SCHEMAS_DIR, "clinical_observation.schema.json")
PROFILE_SCHEMA = os.path.join(SCHEMAS_DIR, "patient_profile.schema.json")
GUIDELINE_SCHEMA = os.path.join(SCHEMAS_DIR, "guideline_check.schema.json")
SAFETY_SCHEMA = os.path.join(SCHEMAS_DIR, "safety_assessment.schema.json")
TREATMENT_SCHEMA = os.path.join(SCHEMAS_DIR, "treatment_plan.schema.json")

SAMPLE_PROFILE = os.path.join(DATA_SAMPLE_DIR, "sample_patient_profile.json")
SAMPLE_SAFETY_OUTPUT = os.path.join(DATA_SAMPLE_DIR, "sample_safety_assessment.json")
SAMPLE_TREATMENT_OUTPUT = os.path.join(DATA_SAMPLE_DIR, "sample_treatment_plan.json")


def run_smoke_test() -> bool:
    print("================================================================================")
    print("  BREAST CANCER CDSS — END-TO-END SMOKE TEST (SHRAVANYA -> SANKET -> NIKHIL)")
    print("================================================================================")

    # Step 1: Validate All 5 JSON Schema Compilations
    print("\n[1/6] Validating all 5 JSON Schema contracts (Draft 2020-12)...")
    schemas = {
        "clinical_observation": OBSERVATION_SCHEMA,
        "patient_profile": PROFILE_SCHEMA,
        "guideline_check": GUIDELINE_SCHEMA,
        "safety_assessment": SAFETY_SCHEMA,
        "treatment_plan": TREATMENT_SCHEMA,
    }

    validators = {}
    for name, path in schemas.items():
        assert os.path.exists(path), f"Missing schema file: {path}"
        with open(path, "r", encoding="utf-8") as f:
            schema_doc = json.load(f)
        validators[name] = jsonschema.Draft202012Validator(schema_doc)
        print(f"      ✓ schemas/{name}.schema.json compiled successfully.")

    # Step 2: Load and Validate Canonical Patient Profile
    print("\n[2/6] Loading and validating canonical patient profile...")
    with open(SAMPLE_PROFILE, "r", encoding="utf-8") as f:
        patient_profile = json.load(f)
    validators["patient_profile"].validate(patient_profile)
    print(f"      ✓ Patient Profile '{patient_profile['patient_id']}' conforms to contract.")
    print(f"        Subtype: {patient_profile['pathology_biomarkers']['molecular_subtype']}, "
          f"ER: {patient_profile['pathology_biomarkers']['er_status']}, "
          f"HER2: {patient_profile['pathology_biomarkers']['her2_status']}")

    # Step 3: Run Deterministic Guideline Evaluation (Shravanya)
    print("\n[3/6] Executing clinical guideline evaluation engine (Shravanya)...")
    evaluator = GuidelineEvaluator(validate_schema=True)
    guideline_output = evaluator.evaluate_profile(patient_profile)
    validators["guideline_check"].validate(guideline_output)
    print(f"      ✓ Evaluated {len(guideline_output['checks'])} guideline rules. Output schema verified.")
    for check in guideline_output["checks"][:4]:
        print(f"        - [{check['result'].upper()}] {check['rule_id']}: {check['rule_name']}")

    # Step 4: Run Clinical Safety Evaluation (Sanket)
    print("\n[4/6] Executing clinical safety & contraindication engine (Sanket)...")
    safety_output = SafetyEngine.evaluate_patient_safety(patient_profile, validate_output=True)
    validators["safety_assessment"].validate(safety_output)
    print(f"      ✓ Safety Assessment verified. Status: {safety_output['overall_safety_status']}")
    print(f"        Identified Findings: {len(safety_output['safety_findings'])}")
    print(f"        Missing Safety Variables: {len(safety_output['missing_safety_information'])}")

    # Persist sample safety assessment
    with open(SAMPLE_SAFETY_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(safety_output, f, indent=2)
    print(f"      ✓ Saved sample safety fixture to: {os.path.basename(SAMPLE_SAFETY_OUTPUT)}")

    # Step 5: Run Treatment Planning Engine (Sanket)
    print("\n[5/6] Executing treatment planning & clinical reasoning engine (Sanket)...")
    treatment_output = TreatmentEngine.generate_treatment_plan(
        patient_profile=patient_profile,
        guideline_checks=guideline_output,
        safety_assessment=safety_output,
        validate_output=True,
    )
    validators["treatment_plan"].validate(treatment_output)
    print(f"      ✓ Treatment Plan verified. Overall Status: {treatment_output['plan_status']}")
    print(f"        Total Modalities Evaluated: {len(treatment_output['treatment_options'])}")
    for opt in treatment_output["treatment_options"]:
        print(f"        - [{opt['treatment_category'].upper()}] {opt['regimen_or_modality']}: {opt['eligibility_status']}")

    # Persist sample treatment plan
    with open(SAMPLE_TREATMENT_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(treatment_output, f, indent=2)
    print(f"      ✓ Saved sample treatment fixture to: {os.path.basename(SAMPLE_TREATMENT_OUTPUT)}")

    # Step 6: Verify Critical Clinical Guardrails
    print("\n[6/6] Verifying Multi-Agent Clinical Guardrails...")

    # Guardrail A: HER2 2+ Equivocal Reflex
    pgen = PatientProfileGenerator(validate_schema=True)
    equivocal_profile = pgen.build_profile(
        patient_id="SMOKE_EQUIVOCAL_HER2",
        source_dataset="TCIA_BREAST_DIAGNOSIS",
        source_patient_id="Test_Equivocal",
        observations=[],
        tumor_size_mm=25.0,
        er_raw="positive",
        pr_raw="positive",
        her2_raw="2+",
        her2_fish_raw=None,
    )
    equivocal_guidelines = evaluator.evaluate_profile(equivocal_profile)
    equivocal_safety = SafetyEngine.evaluate_patient_safety(equivocal_profile)
    equivocal_plan = TreatmentEngine.generate_treatment_plan(
        equivocal_profile, equivocal_guidelines, equivocal_safety
    )
    her2_opt = next(o for o in equivocal_plan["treatment_options"] if "Trastuzumab" in o["regimen_or_modality"])
    assert her2_opt["eligibility_status"] == "requires_clinician_review"
    assert "HER2" in str(her2_opt["clinician_action_prompts"]) or "equivocal" in her2_opt["rationale"].lower()
    print("      ✓ Guardrail A Passed: HER2 IHC 2+ pauses anti-HER2 to requires_clinician_review.")

    # Guardrail B: Cardiotoxicity Safety Override
    cardiac_profile = pgen.build_profile(
        patient_id="SMOKE_CARDIAC_CONTRAINDICATION",
        source_dataset="TCIA_BREAST_DIAGNOSIS",
        source_patient_id="Test_Cardiac",
        observations=[
            {
                "observation_id": "OBS-LVEF-LOW",
                "concept": "lvef_percent",
                "normalized_value": 42.0,
                "raw_value": "42%",
                "status": "documented",
                "unit": "%",
                "timepoint": "pre_treatment",
                "provenance": {
                    "source_dataset": "TCIA_BREAST_DIAGNOSIS",
                    "source_file": "cardiac_echo.pdf",
                    "source_record_id": "Test_Cardiac",
                    "source_field_path": "echocardiogram.lvef",
                },
                "extraction": {
                    "method": "structured_parser",
                    "confidence": 1.0,
                },
            }
        ],
        tumor_size_mm=30.0,
        er_raw="negative",
        pr_raw="negative",
        her2_raw="3+",
    )
    cardiac_guidelines = evaluator.evaluate_profile(cardiac_profile)
    cardiac_safety = SafetyEngine.evaluate_patient_safety(cardiac_profile)
    cardiac_plan = TreatmentEngine.generate_treatment_plan(
        cardiac_profile, cardiac_guidelines, cardiac_safety
    )
    assert cardiac_safety["overall_safety_status"] == "contraindication_identified"
    cardiac_her2_opt = next(o for o in cardiac_plan["treatment_options"] if "Trastuzumab" in o["regimen_or_modality"])
    assert cardiac_her2_opt["eligibility_status"] == "contraindication_flagged"
    print("      ✓ Guardrail B Passed: LVEF 42% strictly overrides anti-HER2 to contraindication_flagged.")

    # Guardrail C: Missing Data Explicit Handling (Never assumes normal)
    assert len(safety_output["missing_safety_information"]) > 0
    assert safety_output["manual_review_required"] is True
    assert treatment_output["manual_review_required"] is True
    print("      ✓ Guardrail C Passed: Missing variables tracked explicitly; manual review mandatory.")

    print("\n================================================================================")
    print("  ALL INTEGRATION SMOKE TESTS PASSED (100%) — COMPLETE WORKFLOW VERIFIED")
    print("  READY FOR NIKHIL FRONTEND & API INTEGRATION")
    print("================================================================================")
    return True


if __name__ == "__main__":
    success = run_smoke_test()
    sys.exit(0 if success else 1)


