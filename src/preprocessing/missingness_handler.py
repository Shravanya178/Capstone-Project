# Copyright (c) 2026 Shravanya Andhale, Nikhil Kadam, Sanket Patil, Khushi Shukla,
# Asma Parveen I Siddavatam and Pradnya Karekar
"""
Missingness and Uncertainty Handler.

Strictly manages clinical certainty and reporting status.
Guarantees that missing data is never converted to negative or normal,
and flags equivocal or conflicting findings across multiple clinical sources.
"""

from enum import Enum
from typing import Any, List, Optional, Tuple


class ClinicalStatus(str, Enum):
    """Allowed clinical certainty and missingness states."""
    DOCUMENTED = "documented"
    NOT_REPORTED = "not_reported"
    NOT_ASSESSED = "not_assessed"
    NOT_AVAILABLE = "not_available"
    UNKNOWN = "unknown"
    EQUIVOCAL = "equivocal"
    CONFLICTING = "conflicting"
    NOT_APPLICABLE = "not_applicable"


class MissingnessHandler:
    """Evaluates values for missingness, equivocal status, and inter-source conflict."""

    MISSING_TOKENS = {
        "", "none", "null", "nan", "na", "n/a", "unknown", "unrecorded",
        "not reported", "not documented", "unspecified", "pending"
    }

    EQUIVOCAL_TOKENS = {
        "equivocal", "indeterminate", "borderline", "uncertain", "suspicious",
        "cannot be excluded", "atypical", "weakly positive", "2+"
    }

    @classmethod
    def evaluate_status(cls, raw_val: Any) -> Tuple[ClinicalStatus, Optional[Any]]:
        """Determines clinical status from a raw value without assuming negative/normal."""
        if raw_val is None:
            return ClinicalStatus.NOT_REPORTED, None

        if isinstance(raw_val, float):
            import math
            if math.isnan(raw_val):
                return ClinicalStatus.NOT_REPORTED, None
            return ClinicalStatus.DOCUMENTED, raw_val

        val_str = str(raw_val).strip()
        val_lower = val_str.lower()

        if val_lower in cls.MISSING_TOKENS:
            return ClinicalStatus.NOT_REPORTED, None

        if any(eq in val_lower for eq in cls.EQUIVOCAL_TOKENS) and not any(neg in val_lower for neg in ["not equivocal", "non-equivocal"]):
            # Specific case: "2+" is equivocal for HER2 IHC unless ISH is present
            return ClinicalStatus.EQUIVOCAL, val_str

        return ClinicalStatus.DOCUMENTED, val_str

    @classmethod
    def detect_conflicts(cls, observations: List[Any], concept_name: str) -> bool:
        """Detects whether multiple observations of the same concept disagree."""
        distinct_values = set()
        for obs in observations:
            if obs.get("concept") == concept_name:
                norm_val = obs.get("normalized_value")
                if norm_val is not None:
                    distinct_values.add(str(norm_val).strip().lower())
        return len(distinct_values) > 1

