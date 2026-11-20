# Copyright (c) 2026 Shravanya Andhale, Nikhil Kadam, Sanket Patil, Khushi Shukla,
# Asma Parveen I Siddavatam and Pradnya Karekar
"""
Clinical Treatment Plan Explainability Engine.

Generates transparent, structured clinical rationales explaining multidisciplinary
options, safety overrides, and missing clinical parameters for the oncologist.
"""

from typing import Dict, Any, List


class TreatmentExplanationGenerator:
    """Generates natural language clinical rationale for multidisciplinary treatment plans."""

    @classmethod
    def generate_overall_explanation(
        cls,
        context: Dict[str, Any],
        options: List[Dict[str, Any]],
        safety_findings: List[str],
        missing_info: List[str]
    ) -> str:
        """Synthesizes executive treatment decision-support narrative."""
        stage = context.get("anatomic_stage", "Unknown stage")
        subtype = context.get("molecular_subtype", "Undetermined subtype")
        meno = context.get("menopausal_status", "Unknown menopausal status")

        supported = [o for o in options if o.get("eligibility_status") == "supported_for_consideration"]
        contraindicated = [o for o in options if o.get("eligibility_status") == "contraindication_flagged"]
        review_needed = [o for o in options if o.get("eligibility_status") == "requires_clinician_review"]

        lines = [
            f"MULTIDISCIPLINARY TREATMENT DECISION SUPPORT SUMMARY",
            f"Patient Context: {subtype.replace('_', ' ').title() if subtype else 'Unknown Subtype'} | Stage {stage if stage else 'Unstaged'} | {meno.capitalize()}",
            f"Supported Options for Consideration: {len(supported)} modality/regimen(s).",
        ]

        if supported:
            lines.append("\nSUPPORTED MODALITIES:")
            for o in supported:
                lines.append(f"  - [{o['treatment_category'].replace('_', ' ').upper()}]: {o['regimen_or_modality']}")

        if contraindicated:
            lines.append(f"\nCONTRAINDICATION ALERTS ({len(contraindicated)}):")
            for o in contraindicated:
                lines.append(f"  - [{o['regimen_or_modality']}]: {o['rationale']}")

        if review_needed:
            lines.append(f"\nOPTIONS REQUIRING TUMOR BOARD REVIEW ({len(review_needed)}):")
            for o in review_needed:
                lines.append(f"  - [{o['regimen_or_modality']}]: {o['rationale']}")

        if missing_info:
            lines.append(f"\nMISSING CLINICAL PARAMETERS ({len(missing_info)}):")
            for m in missing_info[:4]:
                lines.append(f"  - {m}")

        lines.append(
            "\nCLINICAL SAFEGUARD: This is a decision-support synthesis and does not constitute a prescription. "
            "All recommendations require multidisciplinary confirmation and patient shared decision-making."
        )

        return "\n".join(lines)

