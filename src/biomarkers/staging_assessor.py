"""
AJCC Cancer Staging Manual (8th Edition) Anatomical Extent Assessor.

Classifies clinical T (cT) from tumor measurements and evaluates clinical N (cN)
and clinical M (cM) without hallucinating missing staging parameters.
"""

from typing import Dict, Any, Optional


class AJCCStagingAssessor:
    """Calculates AJCC 8th Edition clinical T staging from millimeter tumor dimensions."""

    @classmethod
    def evaluate_cT(
        cls,
        tumor_size_mm: Optional[float],
        chest_wall_involvement: bool = False,
        skin_ulceration: bool = False,
        inflammatory_carcinoma: bool = False
    ) -> Dict[str, Any]:
        """Evaluates clinical T category."""
        if inflammatory_carcinoma:
            return {"c_t": "cT4d", "description": "Inflammatory breast carcinoma"}
        if chest_wall_involvement and skin_ulceration:
            return {"c_t": "cT4c", "description": "Both chest wall extension and skin ulceration"}
        if chest_wall_involvement:
            return {"c_t": "cT4a", "description": "Extension to chest wall"}
        if skin_ulceration:
            return {"c_t": "cT4b", "description": "Ulceration and/or macroscopic skin satellite nodules"}

        if tumor_size_mm is None:
            return {"c_t": None, "description": "Primary tumor size not documented; cT cannot be assessed (cTX)"}

        s = float(tumor_size_mm)

        if s <= 1.0:
            return {"c_t": "cT1mi", "description": "Microinvasion <= 1 mm in greatest dimension"}
        elif 1.0 < s <= 5.0:
            return {"c_t": "cT1a", "description": "Tumor > 1 mm but <= 5 mm in greatest dimension"}
        elif 5.0 < s <= 10.0:
            return {"c_t": "cT1b", "description": "Tumor > 5 mm but <= 10 mm in greatest dimension"}
        elif 10.0 < s <= 20.0:
            return {"c_t": "cT1c", "description": "Tumor > 10 mm but <= 20 mm in greatest dimension"}
        elif 20.0 < s <= 50.0:
            return {"c_t": "cT2", "description": "Tumor > 20 mm but <= 50 mm in greatest dimension"}
        elif s > 50.0:
            return {"c_t": "cT3", "description": "Tumor > 50 mm in greatest dimension"}

        return {"c_t": None, "description": "Unknown or unclassifiable tumor dimension"}

    @classmethod
    def evaluate_extent(
        cls,
        tumor_size_mm: Optional[float] = None,
        raw_c_t: Optional[str] = None,
        raw_c_n: Optional[str] = None,
        raw_c_m: Optional[str] = None,
        lymph_node_positive: Optional[bool] = None
    ) -> Dict[str, Any]:
        """Synthesizes clinical extent without hallucinating missing cN or cM."""
        # cT calculation or preservation
        if raw_c_t:
            c_t = raw_c_t
        else:
            ct_res = cls.evaluate_cT(tumor_size_mm)
            c_t = ct_res["c_t"]

        # cN determination
        if raw_c_n:
            c_n = raw_c_n
            n_status = "documented"
        elif lymph_node_positive is True:
            c_n = "cN1"
            n_status = "documented"
        elif lymph_node_positive is False:
            c_n = "cN0"
            n_status = "documented"
        else:
            c_n = None
            n_status = "not_reported"

        # cM determination - never assume cM0 without workup
        if raw_c_m:
            c_m = raw_c_m
            m_status = "documented"
        else:
            c_m = None
            m_status = "not_reported"

        return {
            "clinical_t_stage": c_t,
            "clinical_n_stage": c_n,
            "clinical_m_stage": c_m,
            "status": "documented" if (c_t is not None or c_n is not None) else "not_reported",
            "n_status": n_status,
            "m_status": m_status,
        }

