"""
Clinical Safety Explainability & Synthesis Engine.

Generates transparent clinician-in-the-loop safety rationales, warning prompts,
and monitoring requirements for multidisciplinary tumor board decision support.
"""

from typing import Dict, Any, List


class SafetyExplanationGenerator:
    """Generates natural language summaries and clinician action rationales."""

    @classmethod
    def generate_overall_explanation(
        cls,
        status: str,
        findings: List[Dict[str, Any]],
        missing_fields: List[str],
        organs: Dict[str, Any]
    ) -> str:
        """Synthesizes an executive clinical safety summary."""
        parts = []

        if status == "contraindication_identified":
            critical_findings = [f for f in findings if f.get("severity") == "critical" or f.get("safety_category") == "absolute_contraindication"]
            parts.append(
                f"SAFETY ALERT: {len(critical_findings)} absolute contraindication(s) or black-box warning(s) identified in patient records."
            )
            for f in critical_findings:
                parts.append(f"- [{f['medication_or_class']}]: {f['explanation']} Action: {f['clinician_recommendation']}")

        elif status == "precaution_identified" or status == "potential_interaction":
            precautions = [f for f in findings if f.get("status") in {"precaution_noted", "potential_interaction", "requires_monitoring"}]
            parts.append(
                f"SAFETY PRECAUTIONS: {len(precautions)} potential drug-drug interaction(s) or physiological precaution(s) identified."
            )
            for f in precautions:
                parts.append(f"- [{f['medication_or_class']}]: {f['explanation']} Action: {f['clinician_recommendation']}")

        elif status == "insufficient_information":
            parts.append(
                "INSUFFICIENT SAFETY DATA: Essential safety parameters (e.g., active medication list, cardiac function, or baseline laboratory counts) are missing from available records. Comprehensive contraindication screening cannot be completed."
            )

        elif status == "no_identified_issue_in_available_data":
            parts.append(
                "NO DETECTED CONTRAINDICATIONS IN AVAILABLE DATA: No active contraindications were identified among evaluated parameters. NOTE: This does not guarantee absence of clinical risk; vital records such as full medication reconciliation and complete organ panels remain subject to clinical verification."
            )

        if missing_fields:
            parts.append(f"UNRECORDED SAFETY PARAMETERS ({len(missing_fields)}):")
            for mf in missing_fields[:4]:
                parts.append(f"- {mf}")
            if len(missing_fields) > 4:
                parts.append(f"- ...and {len(missing_fields) - 4} additional unrecorded parameters.")

        return "\n\n".join(parts)
