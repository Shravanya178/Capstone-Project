# Copyright (c) 2026 Shravanya Andhale, Nikhil Kadam, Sanket Patil, Khushi Shukla,
# Asma Parveen I Siddavatam and Pradnya Karekar
"""
Master Clinical Safety & Contraindication Engine.

Coordinates organ function risk assessment, medication-specific safety checks,
drug-drug interaction detection, and missing information tracking.
Produces schema-validated safety assessment JSONs.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import os
import json
import jsonschema

from src.safety.contraindication_registry import ContraindicationRegistry
from src.safety.patient_risk_assessment import PatientRiskAssessor
from src.safety.medication_rules import MedicationRuleEvaluator
from src.safety.missing_information import SafetyMissingnessTracker
from src.safety.safety_explanation import SafetyExplanationGenerator


class SafetyEngine:
    """Master engine evaluating oncology contraindications and clinical safety."""

    SCHEMA_PATH = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "schemas",
        "safety_assessment.schema.json",
    )

    def __init__(self, validate_schema: bool = True):
        self.validate_schema = validate_schema

    def evaluate_profile(
        self,
        patient_profile: Dict[str, Any],
        candidate_medications: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Instance alias for evaluate_patient_safety."""
        return self.evaluate_patient_safety(
            patient_profile=patient_profile,
            candidate_medications=candidate_medications,
            validate_output=self.validate_schema,
        )

    @classmethod
    def evaluate_patient_safety(
        cls,
        patient_profile: Dict[str, Any],
        candidate_medications: Optional[List[str]] = None,
        validate_output: bool = True,
    ) -> Dict[str, Any]:
        """
        Executes comprehensive safety assessment for a patient profile.
        """
        patient_id = patient_profile.get("patient_id", "UNKNOWN_PATIENT")
        upstream_version = patient_profile.get("profile_generation_timestamp", datetime.now(timezone.utc).isoformat())
        source_dataset = patient_profile.get("source_dataset", "UNKNOWN_DATASET")

        # 1. Infer candidate medications if not provided based on molecular subtype
        if not candidate_medications:
            candidate_medications = cls._infer_candidate_medications(patient_profile)

        # 2. Assess baseline organ functions
        organ_assessments = PatientRiskAssessor.assess_all_organs(patient_profile)

        # 3. Evaluate medication rules
        safety_findings = MedicationRuleEvaluator.evaluate_safety_rules(
            patient_profile=patient_profile,
            organ_assessments=organ_assessments,
            candidate_medications=candidate_medications,
        )

        # 4. Identify unrecorded safety variables
        missing_fields = SafetyMissingnessTracker.identify_missing_safety_fields(
            patient_profile=patient_profile,
            candidate_medications=candidate_medications,
        )

        # 5. Determine overall safety status
        has_contraindication = any(
            f.get("safety_category") in {"absolute_contraindication", "black_box_warning"}
            for f in safety_findings
        )
        has_interaction = any(
            f.get("safety_category") == "drug_interaction"
            for f in safety_findings
        )
        has_precaution = any(
            f.get("safety_category") in {"precaution", "organ_toxicity_risk", "relative_contraindication"}
            for f in safety_findings
        )

        if has_contraindication:
            overall_status = "contraindication_identified"
        elif has_interaction:
            overall_status = "potential_interaction"
        elif has_precaution:
            overall_status = "precaution_identified"
        elif len(missing_fields) >= 4 and not safety_findings:
            overall_status = "insufficient_information"
        else:
            overall_status = "no_identified_issue_in_available_data"

        # 6. Retrieve dataset limitations
        limitations = SafetyMissingnessTracker.get_dataset_limitations(source_dataset)

        # 7. Construct payload
        safety_payload = {
            "patient_id": patient_id,
            "assessment_timestamp": datetime.now(timezone.utc).isoformat(),
            "upstream_profile_version": upstream_version,
            "overall_safety_status": overall_status,
            "manual_review_required": True,
            "safety_findings": safety_findings,
            "organ_function_assessments": organ_assessments,
            "missing_safety_information": missing_fields,
            "dataset_limitations": limitations,
        }

        # 8. Schema validation
        if validate_output and os.path.exists(cls.SCHEMA_PATH):
            with open(cls.SCHEMA_PATH, "r", encoding="utf-8") as f:
                schema = json.load(f)
            jsonschema.validate(safety_payload, schema)

        return safety_payload

    @classmethod
    def _infer_candidate_medications(cls, profile: Dict[str, Any]) -> List[str]:
        """Infers candidate oncology medication classes based on tumor biology."""
        biomarkers = profile.get("pathology_biomarkers", {})
        subtype = str(biomarkers.get("molecular_subtype", "")).lower()
        er_status = str(biomarkers.get("er_status", "")).lower()
        her2_status = str(biomarkers.get("her2_status", "")).lower()

        candidates = ["Paclitaxel", "Docetaxel", "Doxorubicin", "Cyclophosphamide"]

        if er_status == "positive" or "luminal" in subtype:
            candidates.extend(["Tamoxifen", "Anastrozole", "Letrozole"])

        if her2_status == "positive" or "her2" in subtype:
            candidates.extend(["Trastuzumab", "Pertuzumab"])

        if "triple_negative" in subtype or (er_status == "negative" and her2_status == "negative"):
            candidates.extend(["Carboplatin", "Pembrolizumab"])

        return list(dict.fromkeys(candidates))
