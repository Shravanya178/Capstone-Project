"""
Treatment Reasoning & Safety Synthesis Engine.

Harmonizes biological eligibility, upstream guideline rule results, and patient-specific
contraindication/safety findings to formulate explainable treatment options.
"""

from typing import Dict, Any, List

from src.treatment.treatment_options import TreatmentOptionCatalog
from src.treatment.treatment_eligibility import TreatmentEligibilityEvaluator
from src.treatment.treatment_evidence import TreatmentEvidenceRegister


class TreatmentReasoningEngine:
    """Synthesizes clinical eligibility, guideline evidence, and safety findings."""

    @classmethod
    def formulate_treatment_options(
        cls,
        patient_profile: Dict[str, Any],
        guideline_checks: Dict[str, Any],
        safety_assessment: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generates evidence-based treatment options with safety constraints."""
        templates = TreatmentOptionCatalog.get_all_templates()
        safety_findings = safety_assessment.get("safety_findings", [])
        safety_by_med: Dict[str, List[Dict[str, Any]]] = {}

        for sf in safety_findings:
            med_class = sf.get("medication_or_class", "").lower()
            safety_by_med.setdefault(med_class, []).append(sf)

        options: List[Dict[str, Any]] = []

        for tmpl in templates:
            t_id = tmpl["template_id"]
            regimen = tmpl["regimen_or_modality"]
            category = tmpl["treatment_category"]
            intent = tmpl["clinical_intent"]
            evidence = TreatmentEvidenceRegister.get_evidence(tmpl["evidence_key"])

            # 1. Assess baseline eligibility
            (
                status,
                supporting_obs,
                supporting_guidelines,
                missing_info,
                action_prompts
            ) = TreatmentEligibilityEvaluator.evaluate_option_eligibility(
                template=tmpl,
                patient_profile=patient_profile,
                guideline_checks=guideline_checks,
            )

            # 2. Check for matching safety constraints
            active_safety_findings: List[str] = []
            has_absolute_contraindication = False

            for med_key, findings_list in safety_by_med.items():
                # Match medication tokens
                tokens = med_key.replace("(", " ").replace(")", " ").replace("/", " ").split()
                if any(tok in regimen.lower() for tok in tokens if len(tok) > 3):
                    for f in findings_list:
                        f_id = f.get("finding_id", "FIND")
                        f_cat = f.get("safety_category", "")
                        f_exp = f.get("explanation", "")
                        active_safety_findings.append(f"{f_id}: [{f_cat.upper()}] {f_exp}")

                        if f_cat in {"absolute_contraindication", "black_box_warning"}:
                            has_absolute_contraindication = True
                            action_prompts.append(f"CONTRAINDICATION: {f.get('clinician_recommendation')}")

            # 3. Apply Safety Overrides
            if has_absolute_contraindication and status in {"supported_for_consideration", "requires_clinician_review"}:
                status = "contraindication_flagged"
                rationale = (
                    f"Option is biologically indicated by tumor characteristics, but CONTRAINDICATION FLAGGED "
                    f"due to documented safety risks. Requires multidisciplinary tumor board review."
                )
            elif status == "supported_for_consideration":
                rationale = (
                    f"Supported for consideration based on patient biomarker profile and guideline consensus. "
                    f"Modality intent: {intent.replace('_', ' ')}."
                )
            elif status == "requires_clinician_review":
                rationale = (
                    f"Requires clinician review. Borderline, equivocal, or conflicting parameters require "
                    f"expert tumor board consensus prior to definitive selection."
                )
            elif status == "insufficient_information":
                rationale = (
                    f"Insufficient clinical data to determine eligibility. "
                    f"Missing critical parameters: {', '.join(missing_info)}."
                )
            else:
                rationale = "Not supported by currently available clinical stage or biomarker findings."

            option_payload = {
                "treatment_option_id": t_id,
                "treatment_category": category,
                "regimen_or_modality": regimen,
                "clinical_intent": intent,
                "eligibility_status": status,
                "supporting_observations": supporting_obs,
                "supporting_guideline_rules": supporting_guidelines,
                "safety_findings": active_safety_findings,
                "missing_information": missing_info,
                "rationale": rationale,
                "clinician_action_prompts": action_prompts,
                "evidence_source": evidence,
                "manual_review_required": True,
            }

            options.append(option_payload)

        return options
