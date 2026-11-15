"""
Guideline Evaluation Explanation Generator.

Produces clinician-facing transparent rationale detailing exactly why a guideline rule
was deemed applicable, not applicable, or in need of manual review.
"""

from typing import List, Dict, Any


class ExplanationGenerator:
    """Formats explainable rationale strings for clinical decision support."""

    @staticmethod
    def format_explanation(
        rule_name: str,
        result_status: str,
        matched_criteria: List[Dict[str, Any]],
        missing_criteria: List[Dict[str, Any]],
        target_intervention: str,
        source_citation: str
    ) -> str:
        """Constructs an evidence-backed narrative explanation."""
        if result_status == "applicable":
            matched_desc = "; ".join([f"{m['concept']} = {m['actual_value']}" for m in matched_criteria])
            return (
                f"Guideline check '{rule_name}' is APPLICABLE. Patient meets all clinical criteria: "
                f"[{matched_desc}]. Recommended consideration: {target_intervention}. Ref: {source_citation}."
            )

        elif result_status == "insufficient_information":
            missing_desc = "; ".join([f"{m['concept']} ({m['reason']})" for m in missing_criteria])
            return (
                f"Guideline check '{rule_name}' cannot be fully evaluated due to INSUFFICIENT INFORMATION. "
                f"Missing parameters: [{missing_desc}]. Clinician review required before confirming eligibility."
            )

        elif result_status == "requires_review":
            return (
                f"Guideline check '{rule_name}' REQUIRES CLINICIAN REVIEW. Equivocal or borderline clinical parameters "
                f"detected. Reflex testing or multidisciplinary tumor board review required."
            )

        elif result_status == "conflicting_information":
            return (
                f"Guideline check '{rule_name}' found CONFLICTING CLINICAL EVIDENCE between multiple pathology/imaging reports. "
                f"Manual clinician resolution is mandatory."
            )

        else:  # not_applicable
            return (
                f"Guideline check '{rule_name}' is NOT APPLICABLE. Patient does not meet criteria for {target_intervention}."
            )

