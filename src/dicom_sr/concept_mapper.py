# Copyright (c) 2026 Shravanya Andhale, Nikhil Kadam, Sanket Patil, Khushi Shukla,
# Asma Parveen I Siddavatam and Pradnya Karekar
"""
DICOM SR Concept Mapper.

Maps standard coded DICOM concepts (DCM, SRT/SNOMED-CT, BI-RADS) to canonical
clinical imaging observation concepts.
"""

from typing import Dict, Any, Optional


class DICOMConceptMapper:
    """Maps DICOM SR coded concepts to canonical CDSS concept representations."""

    CONCEPT_MAP = {
        # BI-RADS Assessments
        "111000": "birads_category",
        "111001": "birads_category",
        "birads assessment": "birads_category",
        "breast imaging report": "imaging_report_container",
        "finding": "imaging_finding",
        "mass": "breast_mass",
        "architectural distortion": "architectural_distortion",
        "calcification": "breast_calcification",
        "asymmetry": "breast_asymmetry",
        "longest diameter": "tumor_largest_diameter_mm",
        "size": "tumor_largest_diameter_mm",
        "diameter": "tumor_largest_diameter_mm",
        "margin": "lesion_margin",
        "shape": "lesion_shape",
        "density": "breast_density",
    }

    @classmethod
    def map_concept(cls, code_value: Optional[str], code_meaning: Optional[str]) -> str:
        """Resolves canonical concept key from CodeValue or CodeMeaning."""
        if code_value and code_value in cls.CONCEPT_MAP:
            return cls.CONCEPT_MAP[code_value]

        if code_meaning:
            meaning_lower = code_meaning.strip().lower()
            if meaning_lower in cls.CONCEPT_MAP:
                return cls.CONCEPT_MAP[meaning_lower]
            for key, mapped in cls.CONCEPT_MAP.items():
                if key in meaning_lower:
                    return mapped

        return code_meaning.strip().lower().replace(" ", "_") if code_meaning else "unknown_concept"

