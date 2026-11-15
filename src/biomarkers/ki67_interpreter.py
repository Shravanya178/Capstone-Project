"""
Ki-67 Proliferation Index Interpretation per International Ki-67 in Breast Cancer Working Group (IKWG).
"""

from typing import Dict, Any, Optional
from src.preprocessing.value_normalizer import ValueNormalizer


class Ki67Interpreter:
    """Interprets Ki-67 nuclear antigen proliferation index."""

    THRESHOLD_PERCENT = 20.0

    @classmethod
    def interpret(cls, raw_ki67: Any, numeric_index: Optional[float] = None) -> Dict[str, Any]:
        """Categorizes Ki-67 index into low (<20%) vs high (>=20%) proliferation."""
        num_val, cat_val, status = ValueNormalizer.normalize_ki67(raw_ki67)
        idx = numeric_index if numeric_index is not None else num_val

        category = "unknown"
        comment = ""

        if idx is not None:
            if idx < cls.THRESHOLD_PERCENT:
                category = "low"
                comment = f"Ki-67 low proliferation ({idx}% < 20%). Favors Luminal A biology."
            else:
                category = "high"
                comment = f"Ki-67 high proliferation ({idx}% >= 20%). Favors Luminal B biology."
            status = "documented"
        elif cat_val is not None:
            category = cat_val
            comment = f"Ki-67 {cat_val} proliferation category documented."
            status = "documented"
        else:
            comment = "Ki-67 proliferation index not reported."
            status = "not_reported"

        return {
            "ki67_index": idx,
            "proliferation_category": category,
            "threshold_used_percent": cls.THRESHOLD_PERCENT,
            "clinical_comment": comment,
            "status": status,
        }

