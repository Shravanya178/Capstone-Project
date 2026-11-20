# Copyright (c) 2026 Shravanya Andhale, Nikhil Kadam, Sanket Patil, Khushi Shukla,
# Asma Parveen I Siddavatam and Pradnya Karekar
"""
Guideline Rule Definition and Schema Data Models.
"""

from enum import Enum
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field


class EvaluationResultStatus(str, Enum):
    """Allowed guideline check outcomes."""
    APPLICABLE = "applicable"
    NOT_APPLICABLE = "not_applicable"
    INSUFFICIENT_INFORMATION = "insufficient_information"
    REQUIRES_REVIEW = "requires_review"
    CONFLICTING_INFORMATION = "conflicting_information"


@dataclass
class GuidelineSource:
    """Traceable bibliographic citation."""
    guideline: str
    version: str
    section: str
    page: Optional[str] = None
    document_reference: Optional[str] = None


@dataclass
class GuidelineRule:
    """Evidence-based clinical practice guideline rule specification."""
    rule_id: str
    rule_name: str
    guideline_name: str
    guideline_version: str
    domain: str
    target_intervention: str
    required_fields: List[str]
    source: GuidelineSource
    publication_date: Optional[str] = None
    evidence_level: Optional[str] = None
    recommendation_grade: Optional[str] = None
    verification_status: str = "verified_source"
    manual_review_required: bool = False

