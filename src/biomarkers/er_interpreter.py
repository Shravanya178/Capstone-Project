# Copyright (c) 2026 Shravanya Andhale, Nikhil Kadam, Sanket Patil, Khushi Shukla,
# Asma Parveen I Siddavatam and Pradnya Karekar
"""
Estrogen Receptor (ER) Clinical Interpretation per ASCO/CAP 2020 Guidelines.

Preserves explicit ER-low reporting category (1% to 10% positive nuclear staining).
"""

from typing import Dict, Any, Optional
from src.preprocessing.value_normalizer import ValueNormalizer


class ERInterpreter:
    """Interprets ER findings and generates clinician guidance."""

    @classmethod
    def interpret(cls, raw_er: Any, percentage: Optional[float] = None) -> Dict[str, Any]:
        """Evaluates ER status per ASCO/CAP 2020 recommendations."""
        norm = ValueNormalizer.normalize_er(raw_er)

        # Override percentage if explicitly passed
        pct = percentage if percentage is not None else norm.get("percentage")

        if pct is not None:
            if pct < 1.0:
                er_status = "negative"
                er_low = False
                comment = "ER negative (< 1% nuclear staining)."
            elif 1.0 <= pct <= 10.0:
                er_status = "er_low"
                er_low = True
                comment = (
                    "ER-low positive (1% to 10% nuclear staining). Note: Per ASCO/CAP 2020 update, "
                    "benefit from endocrine therapy alone is limited; systemic chemotherapy should be considered."
                )
            else:
                er_status = "positive"
                er_low = False
                comment = "ER positive (> 10% nuclear staining). Strong candidate for endocrine therapy."
        else:
            er_status = norm["er_status"]
            er_low = norm.get("er_low_flag", False)
            if er_status == "er_low":
                comment = "ER-low positive documented. Limited endocrine therapy responsiveness expected."
            elif er_status == "positive":
                comment = "ER positive documented."
            elif er_status == "negative":
                comment = "ER negative documented."
            elif er_status == "equivocal":
                comment = "ER equivocal or borderline; repeat testing recommended."
            else:
                comment = "ER status is not documented or unknown."

        return {
            "er_status": er_status,
            "percentage": pct,
            "er_low_flag": er_low,
            "clinical_comment": comment,
            "status": "documented" if er_status in {"positive", "negative", "er_low"} else (
                "equivocal" if er_status == "equivocal" else "not_reported"
            ),
        }
