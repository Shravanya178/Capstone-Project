"""
Master Treatment Planning & Decision-Support Engine.

Coordinates treatment eligibility evaluation, guideline synthesis, safety overrides,
and explainable treatment option packaging. Produces schema-validated treatment plans.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import os
import json
import jsonschema

from src.treatment.treatment_reasoning import TreatmentReasoningEngine
from src.treatment.treatment_explanation import TreatmentExplanationGenerator


class TreatmentEngine:
    """Master oncology treatment planning and clinical reasoning engine."""

    SCHEMA_PATH = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "schemas",
        "treatment_plan.schema.json",
    )

    def __init__(self, validate_schema: bool = True):
        self.validate_schema = validate_schema

    def generate_plan(
        self,
        patient_profile: Dict[str, Any],
        guideline_checks: Dict[str, Any],
        safety_assessment: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Instance alias for generate_treatment_plan."""
        return self.generate_treatment_plan(
            patient_profile=patient_profile,
            guideline_checks=guideline_checks,
            safety_assessment=safety_assessment,
            validate_output=self.validate_schema,
        )

    @classmethod
    def generate_treatment_plan(
        cls,
        patient_profile: Dict[str, Any],
        guideline_checks: Dict[str, Any],
        safety_assessment: Dict[str, Any],
        validate_output: bool = True,
    ) -> Dict[str, Any]:
        """
        Synthesizes a schema-validated, explainable treatment plan from upstream clinical inputs.
        """
        patient_id = patient_profile.get("patient_id", "UNKNOWN_PATIENT")
        upstream_version = patient_profile.get("profile_generation_timestamp", datetime.now(timezone.utc).isoformat())
        biomarkers = patient_profile.get("pathology_biomarkers", {})
        clinical_extent = patient_profile.get("clinical_extent", {})
        demographics = patient_profile.get("demographics", {})

        # 1. Clinical Context Summary
        context_summary = {
            "anatomic_stage": clinical_extent.get("clinical_t_stage") or clinical_extent.get("anatomic_stage"),
            "molecular_subtype": biomarkers.get("molecular_subtype"),
            "menopausal_status": demographics.get("menopausal_status", "unknown"),
            "primary_tumor_size_mm": clinical_extent.get("primary_tumor_size_mm"),
            "nodal_status": clinical_extent.get("clinical_n_stage"),
            "histologic_grade": biomarkers.get("histologic_grade"),
            "histologic_type": biomarkers.get("histologic_type"),
        }

        # 2. Formulate treatment options with safety integration
        options = TreatmentReasoningEngine.formulate_treatment_options(
            patient_profile=patient_profile,
            guideline_checks=guideline_checks,
            safety_assessment=safety_assessment,
        )

        # 3. Compile guideline checks summary
        guideline_rule_ids = [
            c.get("rule_id") for c in guideline_checks.get("checks", [])
            if c.get("result") in {"applicable", "requires_review"}
        ]

        # 4. Compile safety findings summary
        safety_summaries = [
            f"{f.get('medication_or_class')}: {f.get('explanation')}"
            for f in safety_assessment.get("safety_findings", [])
        ]

        # 5. Missing Information
        all_missing = []
        for opt in options:
            all_missing.extend(opt.get("missing_information", []))
        all_missing.extend(safety_assessment.get("missing_safety_information", []))
        dedup_missing = list(dict.fromkeys(all_missing))

        # 6. Determine Plan Status
        has_contraindication = any(o.get("eligibility_status") == "contraindication_flagged" for o in options)
        has_supported = any(o.get("eligibility_status") == "supported_for_consideration" for o in options)
        has_review = any(o.get("eligibility_status") == "requires_clinician_review" for o in options)

        if has_contraindication:
            plan_status = "contraindication_flagged"
        elif has_review and not has_supported:
            plan_status = "requires_clinician_review"
        elif has_supported:
            plan_status = "supported_for_consideration"
        elif dedup_missing:
            plan_status = "insufficient_information"
        else:
            plan_status = "no_treatment_options_supported"

        # 7. Generate Clinical Explanation
        explanation = TreatmentExplanationGenerator.generate_overall_explanation(
            context=context_summary,
            options=options,
            safety_findings=safety_summaries,
            missing_info=dedup_missing,
        )

        # 8. Documented Limitations
        limitations = [
            "Treatment options reflect research guidelines (ESMO 2024, ASCO, St. Gallen 2023) and require oncologist review.",
            "Patient preferences, detailed comorbidities, and surgical cosmetic factors must be confirmed by multidisciplinary team.",
            "Genomic recurrence risk scores (Oncotype DX, MammaPrint) should be integrated when available for ER+ HER2- node-negative disease."
        ]
        limitations.extend(safety_assessment.get("dataset_limitations", []))

        # 9. Assembled Payload
        plan_payload = {
            "patient_id": patient_id,
            "plan_timestamp": datetime.now(timezone.utc).isoformat(),
            "upstream_profile_version": upstream_version,
            "plan_status": plan_status,
            "manual_review_required": True,
            "clinical_context_summary": context_summary,
            "treatment_options": options,
            "supporting_guideline_checks": guideline_rule_ids,
            "safety_findings_summary": safety_summaries,
            "missing_information": dedup_missing,
            "explanation": explanation,
            "limitations": list(dict.fromkeys(limitations)),
        }

        # 10. Schema Validation
        if validate_output and os.path.exists(cls.SCHEMA_PATH):
            with open(cls.SCHEMA_PATH, "r", encoding="utf-8") as f:
                schema = json.load(f)
            jsonschema.validate(plan_payload, schema)

        return plan_payload
