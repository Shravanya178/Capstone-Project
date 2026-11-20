# Copyright (c) 2026 Shravanya Andhale, Nikhil Kadam, Sanket Patil, Khushi Shukla,
# Asma Parveen I Siddavatam and Pradnya Karekar
"""
Standard Evidence-Based Breast Cancer Treatment Modalities & Regimens.

Represents surgical, radiation, cytotoxic, endocrine, and targeted biotherapy options
aligned with St. Gallen 2023, ESMO 2024, and ASCO clinical practice guidelines.
"""

from typing import Dict, Any, List
from src.treatment.treatment_evidence import TreatmentEvidenceRegister


class TreatmentOptionCatalog:
    """Catalog of evidence-based breast cancer treatment templates."""

    @classmethod
    def get_all_templates(cls) -> List[Dict[str, Any]]:
        """Returns standard decision-support treatment templates."""
        return [
            # 1. Surgical Locoregional Options
            {
                "template_id": "OPT-SURG-BCS-001",
                "treatment_category": "surgical_intervention",
                "regimen_or_modality": "Breast-Conserving Surgery (Partial Mastectomy / Lumpectomy) + SLNB",
                "clinical_intent": "locoregional_control",
                "evidence_key": "ESMO_2024_SURGERY_LOCOREGIONAL",
                "description": "Excision of primary tumor with clear surgical margins, combined with Sentinel Lymph Node Biopsy (SLNB). Mandates post-operative whole-breast radiation therapy."
            },
            {
                "template_id": "OPT-SURG-MASTECTOMY-002",
                "treatment_category": "surgical_intervention",
                "regimen_or_modality": "Total / Simple Mastectomy with SLNB (or ALND if gross nodal disease)",
                "clinical_intent": "locoregional_control",
                "evidence_key": "ESMO_2024_SURGERY_LOCOREGIONAL",
                "description": "Total removal of breast tissue. Indicated for multicentric disease, extensive tumor-to-breast ratio, patient preference, or contraindications to radiation."
            },

            # 2. Radiation Therapy
            {
                "template_id": "OPT-RT-WHOLE-BREAST-003",
                "treatment_category": "locoregional_radiation_therapy",
                "regimen_or_modality": "Moderately Hypofractionated Whole Breast Radiotherapy (WBRT)",
                "clinical_intent": "locoregional_control",
                "evidence_key": "ESMO_2024_RADIOTHERAPY_WBRT",
                "description": "Standard 3-week course (40 Gy in 15 fractions or 26 Gy in 5 fractions) to the ipsilateral breast following breast-conserving surgery to reduce local recurrence."
            },

            # 3. Neoadjuvant Systemic Therapy
            {
                "template_id": "OPT-NEOADJ-HER2-DUAL-004",
                "treatment_category": "neoadjuvant_systemic_therapy",
                "regimen_or_modality": "Docetaxel + Carboplatin + Trastuzumab + Pertuzumab (TCHP x 6 cycles)",
                "clinical_intent": "curative_neoadjuvant",
                "evidence_key": "ESMO_2024_HER2_NEOADJ",
                "description": "Neoadjuvant dual anti-HER2 blockade with platinum/taxane backbone for stage II-III HER2-positive breast cancer to maximize pathological complete response (pCR)."
            },
            {
                "template_id": "OPT-NEOADJ-TNBC-KEYNOTE-005",
                "treatment_category": "neoadjuvant_systemic_therapy",
                "regimen_or_modality": "Pembrolizumab + Carboplatin + Paclitaxel, followed by Doxorubicin + Cyclophosphamide (Keynote-522)",
                "clinical_intent": "curative_neoadjuvant",
                "evidence_key": "ESMO_2024_TNBC_NEOADJ",
                "description": "Neoadjuvant chemo-immunotherapy for high-risk early triple-negative breast cancer (T1c N1-2 or T2-4 N0-2) to improve event-free survival."
            },

            # 4. Adjuvant Targeted Biotherapy
            {
                "template_id": "OPT-ADJ-HER2-TRASTUZUMAB-006",
                "treatment_category": "targeted_biotherapy",
                "regimen_or_modality": "Adjuvant Trastuzumab (every 3 weeks to complete 1 full year)",
                "clinical_intent": "curative_adjuvant",
                "evidence_key": "ESMO_2024_HER2_ADJ",
                "description": "Adjuvant anti-HER2 monoclonal antibody for 1 year in patients with HER2-positive early breast cancer. Requires baseline LVEF >= 50%."
            },

            # 5. Adjuvant Endocrine Therapy
            {
                "template_id": "OPT-ADJ-ENDO-AI-007",
                "treatment_category": "endocrine_therapy",
                "regimen_or_modality": "Aromatase Inhibitor (Anastrozole 1 mg daily or Letrozole 2.5 mg daily for 5-10 years)",
                "clinical_intent": "curative_adjuvant",
                "evidence_key": "ESMO_2024_ENDOCRINE_POSTMENO",
                "description": "Preferred standard adjuvant endocrine therapy for postmenopausal hormone receptor-positive early breast cancer. Superior recurrence reduction compared to tamoxifen."
            },
            {
                "template_id": "OPT-ADJ-ENDO-TAMOXIFEN-008",
                "treatment_category": "endocrine_therapy",
                "regimen_or_modality": "Tamoxifen (20 mg daily for 5-10 years)",
                "clinical_intent": "curative_adjuvant",
                "evidence_key": "ESMO_2024_ENDOCRINE_PREMENO",
                "description": "Standard adjuvant endocrine therapy for premenopausal HR-positive breast cancer, or postmenopausal patients with contraindications to aromatase inhibitors."
            }
        ]

