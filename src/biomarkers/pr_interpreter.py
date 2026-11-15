"""
Progesterone Receptor (PR) Clinical Interpretation per ASCO/CAP Guidelines.
"""

from typing import Dict, Any, Optional
from src.preprocessing.value_normalizer import ValueNormalizer


class PRInterpreter:
    """Interprets PR findings and prognostic value."""

    @classmethod
    def interpret(cls, raw_pr: Any, percentage: Optional[float] = None) -> Dict[str, Any]:
        """Evaluates PR status per ASCO/CAP criteria."""
        norm = ValueNormalizer.normalize_pr(raw_pr)
        pct = percentage if percentage is not None else norm.get("percentage")

        if pct is not None:
            if pct < 1.0:
                pr_status = "negative"
                comment = "PR negative (< 1% nuclear staining)."
            else:
                pr_status = "positive"
                comment = f"PR positive ({pct}% nuclear staining)."
        else:
            pr_status = norm["pr_status"]
            if pr_status == "positive":
                comment = "PR positive documented."
            elif pr_status == "negative":
                comment = "PR negative documented."
            elif pr_status == "equivocal":
                comment = "PR equivocal; repeat testing recommended."
            else:
                comment = "PR status is not documented or unknown."

        return {
            "pr_status": pr_status,
            "percentage": pct,
            "clinical_comment": comment,
            "status": "documented" if pr_status in {"positive", "negative"} else (
                "equivocal" if pr_status == "equivocal" else "not_reported"
            ),
        }

