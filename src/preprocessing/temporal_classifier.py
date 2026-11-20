# Copyright (c) 2026 Shravanya Andhale, Nikhil Kadam, Sanket Patil, Khushi Shukla,
# Asma Parveen I Siddavatam and Pradnya Karekar
"""
Clinical Temporal Classifier.

Segregates clinical observations across distinct chronological treatment phases.
Prevents post-treatment surgical resection data and outcome metrics from leaking
into baseline clinical profiles.
"""

from enum import Enum
from typing import List, Dict, Any


class ClinicalTimepoint(str, Enum):
    """Standardized clinical phases in breast oncology."""
    BASELINE = "baseline"
    PRE_TREATMENT = "pre_treatment"
    DURING_TREATMENT = "during_treatment"
    DURING_TREATMENT_EARLY_AC = "during_treatment_early_ac"
    DURING_TREATMENT_INTER_REGIMEN = "during_treatment_inter_regimen"
    PRE_SURGICAL_RESECTION = "pre_surgical_resection"
    POST_TREATMENT_RESECTION = "post_treatment_resection"
    OUTCOME = "outcome"


class TemporalClassifier:
    """Manages observation filtering and segregation by clinical timepoint."""

    BASELINE_ELIGIBLE_TIMEPOINTS = {
        ClinicalTimepoint.BASELINE.value,
        ClinicalTimepoint.PRE_TREATMENT.value,
    }

    POST_TREATMENT_TIMEPOINTS = {
        ClinicalTimepoint.POST_TREATMENT_RESECTION.value,
        ClinicalTimepoint.OUTCOME.value,
    }

    @classmethod
    def filter_baseline_observations(cls, observations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Filters observations to include ONLY baseline and pre-treatment data."""
        return [
            obs for obs in observations
            if obs.get("timepoint") in cls.BASELINE_ELIGIBLE_TIMEPOINTS
        ]

    @classmethod
    def group_by_timepoint(cls, observations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Groups flat observations into structured clinical timepoint containers."""
        groups: Dict[str, List[Dict[str, Any]]] = {}
        for obs in observations:
            tp = obs.get("timepoint", ClinicalTimepoint.BASELINE.value)
            if tp not in groups:
                groups[tp] = []
            groups[tp].append(obs)

        return [
            {"timepoint": tp, "observations": obs_list}
            for tp, obs_list in groups.items()
        ]

