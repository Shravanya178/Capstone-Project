# Copyright (c) 2026 Shravanya Andhale, Nikhil Kadam, Sanket Patil, Khushi Shukla,
# Asma Parveen I Siddavatam and Pradnya Karekar
"""
Surrogate Intrinsic Molecular Subtype Classifier per St. Gallen Consensus & ESMO Guidelines.
"""

from typing import Dict, Any, Optional


class MolecularSubtypeInterpreter:
    """Classifies breast cancer into clinical surrogate intrinsic subtypes."""

    @classmethod
    def classify(
        cls,
        er_status: str,
        pr_status: str,
        her2_status: str,
        ki67_index: Optional[float] = None,
        pr_percentage: Optional[float] = None,
        histologic_grade: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Derives intrinsic molecular subtype with explicit missingness and uncertainty handling.
        """
        # Guardrail 1: Critical missingness
        if er_status in {"not_reported", "unknown"} or her2_status in {"not_reported", "unknown"}:
            return {
                "molecular_subtype": "unknown",
                "confidence": 0.0,
                "classification_rationale": "Cannot determine subtype: ER or HER2 status is not documented.",
                "review_flag_required": True,
            }

        # Guardrail 2: Equivocal HER2
        if her2_status == "equivocal":
            return {
                "molecular_subtype": "unknown",
                "confidence": 0.0,
                "classification_rationale": "Cannot determine subtype: HER2 is equivocal (2+ without ISH). Must perform reflex ISH.",
                "review_flag_required": True,
            }

        # Subtype 1: Triple-Negative Breast Cancer (TNBC)
        if er_status == "negative" and pr_status == "negative" and her2_status == "negative":
            return {
                "molecular_subtype": "triple_negative",
                "confidence": 0.98,
                "classification_rationale": "ER negative, PR negative, and HER2 negative (Basal-like surrogate / TNBC).",
                "review_flag_required": False,
            }

        # Subtype 2: HER2-Enriched
        if er_status == "negative" and pr_status == "negative" and her2_status == "positive":
            return {
                "molecular_subtype": "her2_enriched",
                "confidence": 0.98,
                "classification_rationale": "ER negative, PR negative, and HER2 positive (HER2-enriched surrogate).",
                "review_flag_required": False,
            }

        # Subtype 3 & 4: Hormone Receptor Positive (Luminal)
        if er_status in {"positive", "er_low"} or pr_status == "positive":
            # HER2 Positive Luminal
            if her2_status == "positive":
                return {
                    "molecular_subtype": "luminal_b_her2_positive",
                    "confidence": 0.95,
                    "classification_rationale": "HR positive (ER+ and/or PR+) and HER2 positive (Triple-positive / Luminal B HER2+).",
                    "review_flag_required": False,
                }
            else:
                # HER2 Negative Luminal: Distinguish Luminal A from Luminal B HER2-
                # St. Gallen criteria: Luminal A requires PR >= 20% (if documented) and low Ki-67 (<20%) or Grade 1
                is_low_prolif = False
                if ki67_index is not None:
                    is_low_prolif = ki67_index < 20.0
                elif histologic_grade is not None:
                    is_low_prolif = histologic_grade == "grade_1"

                pr_is_high = True if (pr_percentage is None or pr_percentage >= 20.0) else False

                if is_low_prolif and pr_is_high and pr_status == "positive":
                    return {
                        "molecular_subtype": "luminal_a",
                        "confidence": 0.90,
                        "classification_rationale": "ER+, HER2-, PR positive/high, and low proliferation (Ki-67 < 20% or Grade 1).",
                        "review_flag_required": False,
                    }
                elif ki67_index is not None or histologic_grade is not None or pr_status == "negative":
                    return {
                        "molecular_subtype": "luminal_b_her2_negative",
                        "confidence": 0.90,
                        "classification_rationale": "ER+, HER2-, with high proliferation (Ki-67 >= 20% / Grade 3) or negative/low PR.",
                        "review_flag_required": False,
                    }
                else:
                    return {
                        "molecular_subtype": "luminal_unspecified",
                        "confidence": 0.70,
                        "classification_rationale": "ER+, HER2-, but Ki-67 index and histological grade are missing; cannot distinguish Luminal A from Luminal B.",
                        "review_flag_required": False,
                    }

        return {
            "molecular_subtype": "unknown",
            "confidence": 0.0,
            "classification_rationale": "Unrecognized or discordant biomarker combination.",
            "review_flag_required": True,
        }

