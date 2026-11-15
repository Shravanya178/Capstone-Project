"""
Clinical Value and Biomarker Normalizer.

Applies standardized ASCO/CAP, CAP, and AJCC vocabulary mappings to clinical
biomarkers, demographics, anatomical extent, and tumor measurements.
"""

from typing import Any, Dict, Optional, Tuple
import re


class ValueNormalizer:
    """Deterministic normalizer for breast oncology clinical variables."""

    @staticmethod
    def normalize_laterality(val: Any) -> Tuple[str, str]:
        """Normalizes laterality values into 'left', 'right', 'bilateral', or 'unknown'."""
        if val is None:
            return "not_reported", "not_reported"
        s = str(val).strip().lower()
        if s in {"1", "r", "right", "rt", "right breast"}:
            return "right", "documented"
        elif s in {"2", "l", "left", "lt", "left breast"}:
            return "left", "documented"
        elif s in {"3", "bilateral", "both", "bilat"}:
            return "bilateral", "documented"
        elif s in {"", "none", "null", "nan"}:
            return "not_reported", "not_reported"
        return "unknown", "unknown"

    @staticmethod
    def normalize_menopausal_status(val: Any) -> Tuple[str, str]:
        """Normalizes menopausal status."""
        if val is None:
            return "not_reported", "not_reported"
        s = str(val).strip().lower()
        if "post" in s:
            return "postmenopausal", "documented"
        elif "peri" in s:
            return "perimenopausal", "documented"
        elif "pre" in s:
            return "premenopausal", "documented"
        elif s in {"", "none", "null", "nan", "unknown"}:
            return "unknown", "unknown"
        return "unknown", "unknown"

    @staticmethod
    def normalize_histologic_grade(val: Any) -> Tuple[Optional[str], str]:
        """Normalizes Bloom-Richardson-Elston / Nottingham histologic grade (1-3)."""
        if val is None:
            return None, "not_reported"
        s = str(val).strip().lower()
        if s in {"1", "i", "grade 1", "grade i", "well differentiated", "low"}:
            return "grade_1", "documented"
        elif s in {"2", "ii", "grade 2", "grade ii", "moderately differentiated", "intermediate"}:
            return "grade_2", "documented"
        elif s in {"3", "iii", "grade 3", "grade iii", "poorly differentiated", "high"}:
            return "grade_3", "documented"
        elif s in {"", "none", "null", "nan", "unknown"}:
            return None, "not_reported"
        return None, "unknown"

    @staticmethod
    def normalize_histologic_type(val: Any) -> Tuple[Optional[str], str]:
        """Normalizes histologic diagnosis into standard terminology."""
        if val is None:
            return None, "not_reported"
        s = str(val).strip().lower()
        if "lobular" in s or "infiltrat lobular" in s or "ilc" in s:
            return "invasive_lobular_carcinoma", "documented"
        elif "ductal" in s or "infiltrating ductal" in s or "invasive ductal" in s or "idc" in s:
            return "invasive_ductal_carcinoma", "documented"
        elif "dcis" in s or "ductal carcinoma in situ" in s:
            return "ductal_carcinoma_in_situ", "documented"
        elif "fibrosis" in s or "benign" in s:
            return "benign_fibrosis", "documented"
        elif s in {"", "none", "null", "nan"}:
            return None, "not_reported"
        return s, "documented"

    @classmethod
    def normalize_er(cls, val: Any) -> Dict[str, Any]:
        """
        Normalizes Estrogen Receptor (ER) findings per ASCO/CAP 2020 guidelines.
        Preserves explicit ER-low (1% - 10% positive nuclear staining).
        """
        if val is None:
            return {
                "status": "not_reported",
                "er_status": "not_reported",
                "percentage": None,
                "er_low_flag": None,
                "raw": None,
            }

        s = str(val).strip().lower()
        if s in {"", "none", "null", "nan"}:
            return {
                "status": "not_reported",
                "er_status": "not_reported",
                "percentage": None,
                "er_low_flag": None,
                "raw": str(val),
            }

        # Check for numeric percentage in string
        pct_match = re.search(r"(\d{1,3})\s*%", s)
        pct: Optional[float] = float(pct_match.group(1)) if pct_match else None

        # Check for explicit ER-low mentions
        is_er_low = "er-low" in s or "er low" in s or "low positive" in s
        if pct is not None and 1.0 <= pct <= 10.0:
            is_er_low = True

        if is_er_low:
            return {
                "status": "documented",
                "er_status": "er_low",
                "percentage": pct if pct is not None else 5.0,
                "er_low_flag": True,
                "raw": str(val),
            }

        if any(pos in s for pos in ["pos", "positive", "+", "1", "reactive"]) and not any(neg in s for neg in ["neg", "negative", "non"]):
            return {
                "status": "documented",
                "er_status": "positive",
                "percentage": pct,
                "er_low_flag": False,
                "raw": str(val),
            }

        if any(neg in s for neg in ["neg", "negative", "0", "non-reactive", "unreactive"]):
            return {
                "status": "documented",
                "er_status": "negative",
                "percentage": pct if pct is not None else 0.0,
                "er_low_flag": False,
                "raw": str(val),
            }

        if "equivocal" in s or "borderline" in s or "indeterminate" in s:
            return {
                "status": "equivocal",
                "er_status": "equivocal",
                "percentage": pct,
                "er_low_flag": None,
                "raw": str(val),
            }

        return {
            "status": "unknown",
            "er_status": "unknown",
            "percentage": pct,
            "er_low_flag": None,
            "raw": str(val),
        }

    @classmethod
    def normalize_pr(cls, val: Any) -> Dict[str, Any]:
        """Normalizes Progesterone Receptor (PR) findings."""
        if val is None:
            return {
                "status": "not_reported",
                "pr_status": "not_reported",
                "percentage": None,
                "raw": None,
            }

        s = str(val).strip().lower()
        if s in {"", "none", "null", "nan"}:
            return {
                "status": "not_reported",
                "pr_status": "not_reported",
                "percentage": None,
                "raw": str(val),
            }

        pct_match = re.search(r"(\d{1,3})\s*%", s)
        pct: Optional[float] = float(pct_match.group(1)) if pct_match else None

        if any(pos in s for pos in ["pos", "positive", "+", "1"]) and not any(neg in s for neg in ["neg", "negative"]):
            return {
                "status": "documented",
                "pr_status": "positive",
                "percentage": pct,
                "raw": str(val),
            }

        if any(neg in s for neg in ["neg", "negative", "0"]):
            return {
                "status": "documented",
                "pr_status": "negative",
                "percentage": pct if pct is not None else 0.0,
                "raw": str(val),
            }

        if "equivocal" in s or "borderline" in s:
            return {
                "status": "equivocal",
                "pr_status": "equivocal",
                "percentage": pct,
                "raw": str(val),
            }

        return {
            "status": "unknown",
            "pr_status": "unknown",
            "percentage": pct,
            "raw": str(val),
        }

    @classmethod
    def normalize_her2(cls, ihc_val: Any, fish_val: Any = None) -> Dict[str, Any]:
        """
        Normalizes HER2 receptor status per ASCO/CAP 2018 guidelines.
        Guarantees that IHC 2+ is classified as equivocal unless confirmatory ISH/FISH is provided.
        """
        ihc_str = "" if ihc_val is None else str(ihc_val).strip()
        ihc_lower = ihc_str.lower()

        fish_str = "" if fish_val is None else str(fish_val).strip()
        fish_lower = fish_str.lower()

        # Parse IHC Score
        ihc_score: Optional[str] = None
        if "3+" in ihc_lower or ihc_lower == "3":
            ihc_score = "3+"
        elif "2+" in ihc_lower or ihc_lower == "2":
            ihc_score = "2+"
        elif "1+" in ihc_lower or ihc_lower == "1":
            ihc_score = "1+"
        elif "0" in ihc_lower:
            ihc_score = "0"
        elif "neg" in ihc_lower:
            ihc_score = "0"
        elif "pos" in ihc_lower:
            ihc_score = "3+"

        # Parse FISH Status
        fish_status: Optional[str] = None
        if fish_lower:
            if any(pos in fish_lower for pos in ["pos", "amplified", "positive", "+"]):
                fish_status = "positive"
            elif any(neg in fish_lower for neg in ["neg", "non-amplified", "negative", "not amplified"]):
                fish_status = "negative"
            elif "equivocal" in fish_lower:
                fish_status = "equivocal"

        # Determine Definitive HER2 Status
        if ihc_score == "3+":
            return {
                "status": "documented",
                "her2_status": "positive",
                "ihc_score": "3+",
                "fish_status": fish_status,
                "raw_ihc": ihc_str,
                "raw_fish": fish_str,
            }

        if ihc_score in {"0", "1+"}:
            if fish_status == "positive":
                # Discordant / Confirmatory positive
                return {
                    "status": "documented",
                    "her2_status": "positive",
                    "ihc_score": ihc_score,
                    "fish_status": "positive",
                    "raw_ihc": ihc_str,
                    "raw_fish": fish_str,
                }
            return {
                "status": "documented",
                "her2_status": "negative",
                "ihc_score": ihc_score,
                "fish_status": fish_status,
                "raw_ihc": ihc_str,
                "raw_fish": fish_str,
            }

        if ihc_score == "2+":
            if fish_status == "positive":
                return {
                    "status": "documented",
                    "her2_status": "positive",
                    "ihc_score": "2+",
                    "fish_status": "positive",
                    "raw_ihc": ihc_str,
                    "raw_fish": fish_str,
                }
            elif fish_status == "negative":
                return {
                    "status": "documented",
                    "her2_status": "negative",
                    "ihc_score": "2+",
                    "fish_status": "negative",
                    "raw_ihc": ihc_str,
                    "raw_fish": fish_str,
                }
            else:
                # IHC 2+ WITHOUT confirmatory FISH must remain EQUIVOCAL
                return {
                    "status": "equivocal",
                    "her2_status": "equivocal",
                    "ihc_score": "2+",
                    "fish_status": fish_status,
                    "raw_ihc": ihc_str,
                    "raw_fish": fish_str,
                }

        # Fallback if only binary status was provided
        if any(pos in ihc_lower for pos in ["pos", "positive"]):
            return {
                "status": "documented",
                "her2_status": "positive",
                "ihc_score": "3+",
                "fish_status": fish_status,
                "raw_ihc": ihc_str,
                "raw_fish": fish_str,
            }
        if any(neg in ihc_lower for neg in ["neg", "negative"]):
            return {
                "status": "documented",
                "her2_status": "negative",
                "ihc_score": "0",
                "fish_status": fish_status,
                "raw_ihc": ihc_str,
                "raw_fish": fish_str,
            }

        return {
            "status": "not_reported",
            "her2_status": "not_reported",
            "ihc_score": None,
            "fish_status": None,
            "raw_ihc": ihc_str,
            "raw_fish": fish_str,
        }

    @staticmethod
    def normalize_ki67(val: Any) -> Tuple[Optional[float], Optional[str], str]:
        """
        Normalizes Ki-67 proliferation index.
        Returns: (numeric_percentage, proliferation_category, status)
        """
        if val is None:
            return None, None, "not_reported"
        s = str(val).strip().lower()
        if s in {"", "none", "null", "nan"}:
            return None, None, "not_reported"

        num_match = re.search(r"(\d+(?:\.\d+)?)\s*%", s)
        if num_match:
            pct = float(num_match.group(1))
            cat = "high" if pct >= 20.0 else "low"
            return pct, cat, "documented"

        try:
            pct = float(s)
            cat = "high" if pct >= 20.0 else "low"
            return pct, cat, "documented"
        except ValueError:
            pass

        if "high" in s:
            return None, "high", "documented"
        elif "intermed" in s or "moderate" in s:
            return None, "intermediate", "documented"
        elif "low" in s:
            return None, "low", "documented"

        return None, None, "unknown"

