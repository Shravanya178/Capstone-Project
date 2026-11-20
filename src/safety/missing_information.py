# Copyright (c) 2026 Shravanya Andhale, Nikhil Kadam, Sanket Patil, Khushi Shukla,
# Asma Parveen I Siddavatam and Pradnya Karekar
"""
Missing Information & Dataset Limitation Tracker for Clinical Safety.

Detects unrecorded safety variables (e.g. absent LVEF, missing medication lists,
unrecorded renal/hepatic panels, undocumented allergy status) and maps source dataset
provenance boundaries (e.g. TCIA imaging notes vs clinical trial workbooks).
"""

from typing import Dict, Any, List, Set


class SafetyMissingnessTracker:
    """Tracks required safety inputs and logs explicit data limitations."""

    REQUIRED_SAFETY_PARAMETERS = [
        ("current_medications", "Current active medication list"),
        ("known_allergies", "Documented medication and contrast allergies"),
        ("cardiac_lvef", "Left ventricular ejection fraction (LVEF / Echocardiogram)"),
        ("renal_function", "Renal function panel (Serum creatinine, eGFR, CrCl)"),
        ("hepatic_function", "Hepatic panel (Total bilirubin, AST, ALT, alkaline phosphatase)"),
        ("hematologic_counts", "Complete blood count with differential (ANC, platelets, hemoglobin)"),
        ("comorbidity_history", "Documented history of cardiovascular disease, DVT/PE, or autoimmune disorders"),
        ("pregnancy_status", "Reproductive and pregnancy status in premenopausal women")
    ]

    DATASET_SAFETY_LIMITATIONS = {
        "TCIA_BREAST_DIAGNOSIS": [
            "TCIA Breast-Diagnosis dataset consists of diagnostic MRI impressions and core biopsy pathology notes.",
            "Complete outpatient medication lists, allergy records, and serial laboratory panels are not recorded in this imaging archive.",
            "Safety assessments for this cohort reflect only documented pathology and narrative imaging findings."
        ],
        "ISPY1_CALGB150007": [
            "I-SPY-1 / ACRIN 6657 is a clinical trial cohort focusing on baseline tumor biology and longitudinal MRI volume response.",
            "Specific outpatient concomitant medications and baseline non-trial drug lists are not included in the public extract.",
            "Trial protocol required baseline organ clearance (LVEF >= 50%, normal marrow/renal/hepatic) for protocol enrollment, but explicit serial lab values are not stored in the public workbook."
        ],
        "BREASTPATHQ": [
            "BreastPathQ represents post-neoadjuvant surgical resection pathology assessment.",
            "Outpatient concomitant medications, organ function laboratory values, and cardiology notes are absent."
        ],
        "TCGA_BRCA": [
            "TCGA-BRCA reports are diagnostic surgical pathology synoptics.",
            "Non-surgical concomitant medications, daily prescribing history, and cardiology telemetry are not documented in tissue synoptics."
        ],
        "SYNTHETIC_CONTROL": [
            "Synthetic scenario designed for clinical edge case and software boundary validation."
        ]
    }

    @classmethod
    def identify_missing_safety_fields(
        cls,
        patient_profile: Dict[str, Any],
        candidate_medications: List[str]
    ) -> List[str]:
        """Identifies specific unrecorded clinical parameters required for candidate medications."""
        missing = []
        observations = patient_profile.get("observations", [])
        obs_concepts = {o.get("concept") for o in observations}

        # Check for medication list
        if "current_medications" not in obs_concepts:
            missing.append("Current active medication list (to evaluate drug-drug interactions)")

        # Check for allergies
        if "medication_allergies" not in obs_concepts:
            missing.append("Documented medication and excipient allergy history")

        # Medication-specific requirements
        meds_lower = " ".join(candidate_medications).lower()

        if "trastuzumab" in meds_lower or "pertuzumab" in meds_lower or "doxorubicin" in meds_lower:
            if "lvef_percent" not in obs_concepts and "cardiac_ejection_fraction" not in obs_concepts:
                missing.append("Baseline Left Ventricular Ejection Fraction (LVEF / Echocardiogram)")

        if "tamoxifen" in meds_lower:
            if "thromboembolic_history" not in obs_concepts:
                missing.append("Documented thromboembolic history (DVT / PE / clotting disorders)")

        if "cisplatin" in meds_lower or "carboplatin" in meds_lower:
            if "creatinine_clearance" not in obs_concepts and "serum_creatinine" not in obs_concepts:
                missing.append("Renal function panel (Serum creatinine, eGFR / CrCl for platinum dosing)")

        if "paclitaxel" in meds_lower or "docetaxel" in meds_lower:
            if "absolute_neutrophil_count" not in obs_concepts:
                missing.append("Baseline complete blood count (Absolute Neutrophil Count and Platelets)")

        # Pregnancy in premenopausal women
        menopausal = patient_profile.get("demographics", {}).get("menopausal_status", "unknown")
        if menopausal == "premenopausal" and "pregnancy_status" not in obs_concepts:
            missing.append("Serum or urine pregnancy test in premenopausal patient prior to systemic therapy")

        return missing

    @classmethod
    def get_dataset_limitations(cls, source_dataset: str) -> List[str]:
        """Returns verified limitations of the source dataset."""
        return cls.DATASET_SAFETY_LIMITATIONS.get(
            source_dataset,
            [
                f"Source dataset '{source_dataset}' does not include comprehensive electronic health record medication reconciliation.",
                "Clinical safety checks are limited to variables explicitly recorded in the source documentation."
            ]
        )

