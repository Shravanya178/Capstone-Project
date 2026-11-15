"""
Treatment Eligibility Evaluator.

Assesses clinical eligibility for candidate interventions based on disease stage,
molecular subtype, receptor status, tumor dimensions, nodal extent, and upstream guideline evaluations.
"""

from typing import Dict, Any, List, Tuple


class TreatmentEligibilityEvaluator:
    """Evaluates biological and anatomic eligibility for treatment options."""

    @classmethod
    def evaluate_option_eligibility(
        cls,
        template: Dict[str, Any],
        patient_profile: Dict[str, Any],
        guideline_checks: Dict[str, Any]
    ) -> Tuple[str, List[str], List[str], List[str], List[str]]:
        """
        Determines:
        (eligibility_status, supporting_obs, supporting_guidelines, missing_info, action_prompts)
        """
        template_id = template["template_id"]
        biomarkers = patient_profile.get("pathology_biomarkers", {})
        clinical_extent = patient_profile.get("clinical_extent", {})
        demographics = patient_profile.get("demographics", {})

        er_status = biomarkers.get("er_status")
        pr_status = biomarkers.get("pr_status")
        her2_status = biomarkers.get("her2_status")
        subtype = biomarkers.get("molecular_subtype")
        size_mm = clinical_extent.get("primary_tumor_size_mm")
        t_stage = clinical_extent.get("clinical_t_stage")
        n_stage = clinical_extent.get("clinical_n_stage")
        meno = demographics.get("menopausal_status")

        # Map Shravanya guideline checks
        guideline_rules_map = {}
        for c in guideline_checks.get("checks", []):
            guideline_rules_map[c.get("rule_id")] = c

        supporting_obs = []
        supporting_guidelines = []
        missing_info = []
        action_prompts = []

        # -------------------------------------------------------------
        # 1. Breast-Conserving Surgery
        # -------------------------------------------------------------
        if template_id == "OPT-SURG-BCS-001":
            if size_mm is not None and size_mm <= 50.0:
                supporting_obs.append(f"Primary tumor size: {size_mm} mm (<= 50 mm, favorable for breast preservation)")
                supporting_guidelines.append("ESMO-BC-2024-SURGERY-LOCOREGIONAL")
                action_prompts.append("Discuss breast-conserving surgery vs mastectomy with patient; evaluate cosmetic feasibility and surgical margins.")
                return "supported_for_consideration", supporting_obs, supporting_guidelines, missing_info, action_prompts
            elif size_mm is None:
                missing_info.append("Primary tumor dimension (to assess tumor-to-breast ratio)")
                return "insufficient_information", supporting_obs, supporting_guidelines, missing_info, action_prompts
            else:
                return "not_supported_by_available_information", supporting_obs, supporting_guidelines, missing_info, action_prompts

        # -------------------------------------------------------------
        # 2. Mastectomy
        # -------------------------------------------------------------
        if template_id == "OPT-SURG-MASTECTOMY-002":
            supporting_guidelines.append("ESMO-BC-2024-SURGERY-LOCOREGIONAL")
            if size_mm is not None and size_mm > 50.0:
                supporting_obs.append(f"Primary tumor size: {size_mm} mm (> 50 mm, locally extensive)")
                action_prompts.append("Mastectomy indicated due to large tumor volume; discuss immediate vs delayed reconstruction.")
            else:
                action_prompts.append("Mastectomy option available based on patient preference or multicentric disease.")
            return "supported_for_consideration", supporting_obs, supporting_guidelines, missing_info, action_prompts

        # -------------------------------------------------------------
        # 3. Whole Breast Radiotherapy (WBRT)
        # -------------------------------------------------------------
        if template_id == "OPT-RT-WHOLE-BREAST-003":
            supporting_guidelines.append("ESMO-BC-2024-RADIOTHERAPY-WBRT")
            supporting_obs.append("Mandatory adjuvant standard of care following breast-conserving surgery")
            action_prompts.append("Refer to radiation oncology following definitive breast-conserving surgery.")
            return "supported_for_consideration", supporting_obs, supporting_guidelines, missing_info, action_prompts

        # -------------------------------------------------------------
        # 4. Neoadjuvant Dual Anti-HER2 Blockade (TCHP)
        # -------------------------------------------------------------
        if template_id == "OPT-NEOADJ-HER2-DUAL-004":
            if her2_status == "positive":
                supporting_obs.append("HER2-positive biomarker status (IHC 3+ or ISH amplified)")
                supporting_guidelines.append("ESMO-BC-2024-HER2-NEOADJ-002")
                if size_mm is not None and size_mm > 20.0:
                    supporting_obs.append(f"Primary tumor size: {size_mm} mm (> 20 mm, stage II-III indication)")
                    action_prompts.append("Evaluate baseline echocardiogram (LVEF) prior to initiating neoadjuvant dual anti-HER2 blockade.")
                    return "supported_for_consideration", supporting_obs, supporting_guidelines, missing_info, action_prompts
                elif size_mm is None:
                    missing_info.append("Primary tumor dimension (mandatory for neoadjuvant TCHP indication)")
                    return "insufficient_information", supporting_obs, supporting_guidelines, missing_info, action_prompts
                else:
                    return "not_supported_by_available_information", supporting_obs, supporting_guidelines, missing_info, action_prompts
            elif her2_status == "equivocal":
                supporting_guidelines.append("ASCO-CAP-2018-HER2-REFLEX-005")
                action_prompts.append("HER2 IHC 2+ equivocal. Perform confirmatory ISH testing before anti-HER2 therapy decision.")
                return "requires_clinician_review", supporting_obs, supporting_guidelines, missing_info, action_prompts
            elif her2_status is None or her2_status == "not_reported":
                missing_info.append("HER2 status (IHC and/or ISH)")
                return "insufficient_information", supporting_obs, supporting_guidelines, missing_info, action_prompts
            else:
                return "not_supported_by_available_information", supporting_obs, supporting_guidelines, missing_info, action_prompts

        # -------------------------------------------------------------
        # 5. Neoadjuvant TNBC Chemo-Immunotherapy (Keynote-522)
        # -------------------------------------------------------------
        if template_id == "OPT-NEOADJ-TNBC-KEYNOTE-005":
            if subtype == "triple_negative" or (er_status == "negative" and pr_status == "negative" and her2_status == "negative"):
                supporting_obs.append("Triple-negative breast cancer (ER-, PR-, HER2-)")
                supporting_guidelines.append("ESMO-BC-2024-TNBC-NEOADJ-004")
                if size_mm is not None and size_mm > 20.0:
                    supporting_obs.append(f"Tumor size: {size_mm} mm (> 20 mm / Stage II-III TNBC)")
                    action_prompts.append("Screen for active autoimmune disorders and baseline organ clearance prior to pembrolizumab.")
                    return "supported_for_consideration", supporting_obs, supporting_guidelines, missing_info, action_prompts
                elif size_mm is None:
                    missing_info.append("Primary tumor size (T stage >= T2 or N+ required for Keynote-522 indication)")
                    return "insufficient_information", supporting_obs, supporting_guidelines, missing_info, action_prompts
                else:
                    return "not_supported_by_available_information", supporting_obs, supporting_guidelines, missing_info, action_prompts
            elif er_status is None or her2_status is None:
                missing_info.append("Complete receptor status (ER, PR, HER2)")
                return "insufficient_information", supporting_obs, supporting_guidelines, missing_info, action_prompts
            else:
                return "not_supported_by_available_information", supporting_obs, supporting_guidelines, missing_info, action_prompts

        # -------------------------------------------------------------
        # 6. Adjuvant Trastuzumab (1 year)
        # -------------------------------------------------------------
        if template_id == "OPT-ADJ-HER2-TRASTUZUMAB-006":
            if her2_status == "positive":
                supporting_obs.append("HER2-positive disease (IHC 3+ or ISH amplified)")
                supporting_guidelines.append("ESMO-BC-2024-HER2-ADJ-001")
                action_prompts.append("Verify baseline LVEF >= 50% on echocardiogram; monitor LVEF every 3 months during trastuzumab.")
                return "supported_for_consideration", supporting_obs, supporting_guidelines, missing_info, action_prompts
            elif her2_status == "equivocal":
                supporting_guidelines.append("ASCO-CAP-2018-HER2-REFLEX-005")
                action_prompts.append("Mandatory reflex ISH testing required for IHC 2+ before anti-HER2 therapy consideration.")
                return "requires_clinician_review", supporting_obs, supporting_guidelines, missing_info, action_prompts
            elif her2_status is None or her2_status == "not_reported":
                missing_info.append("HER2 receptor status")
                return "insufficient_information", supporting_obs, supporting_guidelines, missing_info, action_prompts
            else:
                return "not_supported_by_available_information", supporting_obs, supporting_guidelines, missing_info, action_prompts

        # -------------------------------------------------------------
        # 7. Adjuvant Endocrine Therapy — Aromatase Inhibitor
        # -------------------------------------------------------------
        if template_id == "OPT-ADJ-ENDO-AI-007":
            if er_status == "positive" or "luminal" in str(subtype):
                supporting_obs.append("Estrogen Receptor-positive biomarker status")
                supporting_guidelines.append("ESMO-BC-2024-HR-ENDO-003")
                if meno == "postmenopausal":
                    supporting_obs.append("Postmenopausal ovarian status (preferred indication for AIs)")
                    action_prompts.append("Initiate Aromatase Inhibitor (Letrozole / Anastrozole); order baseline DEXA bone mineral density scan.")
                    return "supported_for_consideration", supporting_obs, supporting_guidelines, missing_info, action_prompts
                elif meno == "premenopausal":
                    action_prompts.append("Premenopausal status: Aromatase Inhibitors require concurrent ovarian function suppression (GnRH agonist).")
                    return "requires_clinician_review", supporting_obs, supporting_guidelines, missing_info, action_prompts
                else:
                    missing_info.append("Menopausal status (to distinguish AI monotherapy from Tamoxifen/OFS)")
                    return "insufficient_information", supporting_obs, supporting_guidelines, missing_info, action_prompts
            elif er_status == "er_low":
                supporting_guidelines.append("ESMO-BC-2024-HR-ENDO-003")
                action_prompts.append("ER-low (1-10%): Limited endocrine responsiveness. Multidisciplinary review recommended.")
                return "requires_clinician_review", supporting_obs, supporting_guidelines, missing_info, action_prompts
            elif er_status is None or er_status == "not_reported":
                missing_info.append("Estrogen Receptor (ER) status")
                return "insufficient_information", supporting_obs, supporting_guidelines, missing_info, action_prompts
            else:
                return "not_supported_by_available_information", supporting_obs, supporting_guidelines, missing_info, action_prompts

        # -------------------------------------------------------------
        # 8. Adjuvant Endocrine Therapy — Tamoxifen
        # -------------------------------------------------------------
        if template_id == "OPT-ADJ-ENDO-TAMOXIFEN-008":
            if er_status == "positive" or "luminal" in str(subtype):
                supporting_obs.append("Estrogen Receptor-positive biomarker status")
                supporting_guidelines.append("ESMO-BC-2024-HR-ENDO-003")
                action_prompts.append("Standard endocrine option. Screen for thromboembolic risk and potent CYP2D6-inhibiting medications.")
                return "supported_for_consideration", supporting_obs, supporting_guidelines, missing_info, action_prompts
            elif er_status == "er_low":
                supporting_guidelines.append("ESMO-BC-2024-HR-ENDO-003")
                action_prompts.append("ER-low (1-10%): Discuss potential modest benefit of endocrine therapy vs adverse effects.")
                return "requires_clinician_review", supporting_obs, supporting_guidelines, missing_info, action_prompts
            elif er_status is None or er_status == "not_reported":
                missing_info.append("Estrogen Receptor (ER) status")
                return "insufficient_information", supporting_obs, supporting_guidelines, missing_info, action_prompts
            else:
                return "not_supported_by_available_information", supporting_obs, supporting_guidelines, missing_info, action_prompts

        return "not_supported_by_available_information", supporting_obs, supporting_guidelines, missing_info, action_prompts

