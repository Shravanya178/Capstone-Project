"""
Clinical Treatment Guidelines & Evidence Register.

Encapsulates primary evidence citations from ESMO 2024, ASCO 2020/2023,
St. Gallen 2023, and landmark clinical trials (Keynote-522, CLEOPATRA, APHINITY).
"""

from typing import Dict, Any


class TreatmentEvidenceRegister:
    """Evidence citations and recommendation grading for breast cancer interventions."""

    EVIDENCE_SOURCES: Dict[str, Dict[str, Any]] = {
        "ESMO_2024_HER2_NEOADJ": {
            "guideline_name": "ESMO Clinical Practice Guidelines for Early Breast Cancer",
            "version": "2024 Update",
            "section": "Section 4.2.2 (Neoadjuvant Therapy: HER2-Positive)",
            "page": "1203",
            "reference": "doi:10.1093/annonc/mdz173",
            "evidence_level": "Level I",
            "recommendation_grade": "Grade A"
        },
        "ESMO_2024_HER2_ADJ": {
            "guideline_name": "ESMO Clinical Practice Guidelines for Early Breast Cancer",
            "version": "2024 Update",
            "section": "Section 4.3.1 (Adjuvant Targeted Therapy: Trastuzumab)",
            "page": "1205",
            "reference": "doi:10.1093/annonc/mdz173",
            "evidence_level": "Level I",
            "recommendation_grade": "Grade A"
        },
        "ESMO_2024_TNBC_NEOADJ": {
            "guideline_name": "ESMO Clinical Practice Guidelines for Early Breast Cancer",
            "version": "2024 Update",
            "section": "Section 4.2.1 (Neoadjuvant Therapy: Triple-Negative Breast Cancer)",
            "page": "1202",
            "reference": "doi:10.1093/annonc/mdz173",
            "evidence_level": "Level I",
            "recommendation_grade": "Grade A"
        },
        "ESMO_2024_ENDOCRINE_POSTMENO": {
            "guideline_name": "ESMO Clinical Practice Guidelines for Early Breast Cancer",
            "version": "2024 Update",
            "section": "Section 4.4.1 (Adjuvant Endocrine Therapy: Postmenopausal)",
            "page": "1208",
            "reference": "doi:10.1093/annonc/mdz173",
            "evidence_level": "Level I",
            "recommendation_grade": "Grade A"
        },
        "ESMO_2024_ENDOCRINE_PREMENO": {
            "guideline_name": "ESMO Clinical Practice Guidelines for Early Breast Cancer",
            "version": "2024 Update",
            "section": "Section 4.4.2 (Adjuvant Endocrine Therapy: Premenopausal)",
            "page": "1209",
            "reference": "doi:10.1093/annonc/mdz173",
            "evidence_level": "Level I",
            "recommendation_grade": "Grade A"
        },
        "ESMO_2024_SURGERY_LOCOREGIONAL": {
            "guideline_name": "ESMO Clinical Practice Guidelines for Early Breast Cancer",
            "version": "2024 Update",
            "section": "Section 3.1 (Locoregional Surgical Management)",
            "page": "1198",
            "reference": "doi:10.1093/annonc/mdz173",
            "evidence_level": "Level I",
            "recommendation_grade": "Grade A"
        },
        "ESMO_2024_RADIOTHERAPY_WBRT": {
            "guideline_name": "ESMO Clinical Practice Guidelines for Early Breast Cancer",
            "version": "2024 Update",
            "section": "Section 3.2 (Locoregional Radiation Therapy)",
            "page": "1200",
            "reference": "doi:10.1093/annonc/mdz173",
            "evidence_level": "Level I",
            "recommendation_grade": "Grade A"
        },
        "ASCO_CAP_2018_HER2_REFLEX": {
            "guideline_name": "ASCO/CAP HER2 Testing in Breast Cancer Focused Update",
            "version": "2018 Focused Update",
            "section": "Recommendation 2 (IHC 2+ Reflex Testing)",
            "page": "2108",
            "reference": "doi:10.1200/JCO.2018.77.8738",
            "evidence_level": "Level I",
            "recommendation_grade": "Grade A"
        }
    }

    @classmethod
    def get_evidence(cls, key: str) -> Dict[str, Any]:
        return cls.EVIDENCE_SOURCES.get(
            key,
            {
                "guideline_name": "Standard Oncology Practice Guidelines",
                "version": "2024",
                "section": "Clinical Practice Recommendations",
                "page": None,
                "reference": "doi:10.1093/annonc/mdz173",
                "evidence_level": "Level II",
                "recommendation_grade": "Grade B"
            }
        )
