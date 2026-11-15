"""
Medication Safety Rule Evaluator.

Applies evidence-based safety rules against patient profile observations,
organ function assessments, and concomitant medications.
"""

from typing import Dict, Any, List, Optional
import uuid

from src.safety.contraindication_registry import ContraindicationRegistry, SafetyRule


class MedicationRuleEvaluator:
    """Evaluates medication contraindications, precautions, and interactions."""

    @classmethod
    def evaluate_safety_rules(
        cls,
        patient_profile: Dict[str, Any],
        organ_assessments: Dict[str, Any],
        candidate_medications: List[str]
    ) -> List[Dict[str, Any]]:
        """Evaluates active safety rules for candidate therapies."""
        findings: List[Dict[str, Any]] = []
        observations = patient_profile.get("observations", [])
        obs_map: Dict[str, List[Dict[str, Any]]] = {}
        for o in observations:
            c = o.get("concept")
            if c:
                obs_map.setdefault(c, []).append(o)

        meds_text = " ".join(candidate_medications).lower()

        # 1. Trastuzumab / Pertuzumab Cardiotoxicity Check
        if "trastuzumab" in meds_text or "pertuzumab" in meds_text or "anti-her2" in meds_text:
            cardiac = organ_assessments.get("cardiac", {})
            lvef = cardiac.get("lvef_percent")
            if lvef is not None and lvef < 50.0:
                rule = ContraindicationRegistry.get_rule_by_id("RULE-SAFE-TRASTUZUMAB-CARDIO-001")
                if rule:
                    findings.append(cls._build_finding(
                        rule,
                        actual_value=f"LVEF {lvef}%",
                        explanation=f"Patient Left Ventricular Ejection Fraction is {lvef}%, which is below the mandatory 50% safety threshold for anti-HER2 targeted agents.",
                        status="confirmed_contraindication"
                    ))

        # 2. Anthracycline Cardiotoxicity Check
        if "doxorubicin" in meds_text or "epirubicin" in meds_text or "anthracycline" in meds_text:
            cardiac = organ_assessments.get("cardiac", {})
            lvef = cardiac.get("lvef_percent")
            if (lvef is not None and lvef < 50.0) or cardiac.get("status") == "abnormal":
                rule = ContraindicationRegistry.get_rule_by_id("RULE-SAFE-ANTHRACYCLINE-CARDIO-002")
                if rule:
                    findings.append(cls._build_finding(
                        rule,
                        actual_value=f"LVEF {lvef}%" if lvef else "Abnormal cardiac status",
                        explanation=f"Anthracyclines carry a Black Box Warning for cumulative cardiomyopathy. Patient has baseline cardiac compromise ({cardiac.get('notes')}).",
                        status="confirmed_contraindication"
                    ))

        # 3. Tamoxifen Thromboembolic Risk
        if "tamoxifen" in meds_text:
            thrombo_obs = obs_map.get("thromboembolic_history") or obs_map.get("deep_vein_thrombosis") or obs_map.get("pulmonary_embolism")
            if thrombo_obs:
                val = str(thrombo_obs[0].get("normalized_value")).lower()
                if val in {"positive", "present", "documented", "history_of_dvt", "history_of_pe"}:
                    rule = ContraindicationRegistry.get_rule_by_id("RULE-SAFE-TAMOXIFEN-THROMBO-003")
                    if rule:
                        findings.append(cls._build_finding(
                            rule,
                            actual_value="Documented history of DVT/PE",
                            explanation="Tamoxifen carries an absolute contraindication in patients with a history of deep vein thrombosis, pulmonary embolism, or active thromboembolism.",
                            status="confirmed_contraindication"
                        ))

            # Check CYP2D6 inhibitor interaction
            concomitant_meds = obs_map.get("current_medications")
            if concomitant_meds:
                med_list_str = str(concomitant_meds[0].get("normalized_value")).lower()
                cyp2d6_inhibitors = ["paroxetine", "fluoxetine", "bupropion"]
                for inh in cyp2d6_inhibitors:
                    if inh in med_list_str:
                        rule = ContraindicationRegistry.get_rule_by_id("RULE-SAFE-TAMOXIFEN-CYP2D6-004")
                        if rule:
                            findings.append(cls._build_finding(
                                rule,
                                actual_value=f"Concurrent {inh.capitalize()} use",
                                explanation=f"Concurrent potent CYP2D6 inhibitor ({inh.capitalize()}) substantially reduces conversion of tamoxifen to active endoxifen.",
                                status="potential_interaction"
                            ))

        # 4. Aromatase Inhibitors in Premenopausal Patients
        if "aromatase" in meds_text or "anastrozole" in meds_text or "letrozole" in meds_text or "exemestane" in meds_text:
            reproductive = organ_assessments.get("reproductive", {})
            meno = reproductive.get("menopausal_status")
            ofs_obs = obs_map.get("ovarian_function_suppression") or obs_map.get("gnrh_agonist")
            has_ofs = False
            if ofs_obs:
                has_ofs = str(ofs_obs[0].get("normalized_value")).lower() in {"positive", "documented", "concurrent"}

            if meno == "premenopausal" and not has_ofs:
                rule = ContraindicationRegistry.get_rule_by_id("RULE-SAFE-AI-PREMENO-005")
                if rule:
                    findings.append(cls._build_finding(
                        rule,
                        actual_value="Premenopausal without ovarian suppression",
                        explanation="Aromatase inhibitors are contraindicated as monotherapy in premenopausal women due to intact feedback stimulating ovarian gonadotropins.",
                        status="confirmed_contraindication"
                    ))

        # 5. Taxane Neutropenia Check
        if "paclitaxel" in meds_text or "docetaxel" in meds_text or "taxane" in meds_text:
            hematologic = organ_assessments.get("hematologic", {})
            anc = hematologic.get("anc")
            if anc is not None and anc < 1500:
                rule = ContraindicationRegistry.get_rule_by_id("RULE-SAFE-TAXANE-NEUTRO-006")
                if rule:
                    findings.append(cls._build_finding(
                        rule,
                        actual_value=f"ANC {anc}/uL",
                        explanation=f"Baseline Absolute Neutrophil Count is {anc}/uL (< 1,500/uL threshold). Cytotoxic taxane therapy requires adequate marrow reserve.",
                        status="requires_monitoring"
                    ))

        # 6. Platinum Renal Clearance Check
        if "cisplatin" in meds_text or "carboplatin" in meds_text or "platinum" in meds_text:
            renal = organ_assessments.get("renal", {})
            crcl = renal.get("egfr_or_crcl")
            if crcl is not None and crcl < 50.0:
                rule = ContraindicationRegistry.get_rule_by_id("RULE-SAFE-PLATINUM-RENAL-010")
                if rule:
                    findings.append(cls._build_finding(
                        rule,
                        actual_value=f"CrCl {crcl} mL/min",
                        explanation=f"Renal clearance ({crcl} mL/min) is compromised. Cisplatin is contraindicated; Carboplatin dosing requires strict GFR capping.",
                        status="confirmed_contraindication" if "cisplatin" in meds_text else "precaution_noted"
                    ))

        # 7. Pregnancy Check across all systemic therapies
        reproductive = organ_assessments.get("reproductive", {})
        if reproductive.get("pregnancy_status") == "positive":
            rule = ContraindicationRegistry.get_rule_by_id("RULE-SAFE-PREGNANCY-011")
            if rule:
                findings.append(cls._build_finding(
                    rule,
                    actual_value="Confirmed Pregnancy",
                    explanation="Pregnancy confirmed. Systemic cytotoxic agents, anti-HER2 biotherapy, and endocrine therapy are teratogenic and contraindicated.",
                    status="confirmed_contraindication"
                ))

        # 8. Known Allergies
        allergies_obs = obs_map.get("known_allergies") or obs_map.get("medication_allergies")
        if allergies_obs:
            allergies_str = str(allergies_obs[0].get("normalized_value")).lower()
            for med in candidate_medications:
                if med.lower() in allergies_str:
                    findings.append({
                        "finding_id": f"FIND-ALLERGY-{uuid.uuid4().hex[:8].upper()}",
                        "medication_or_class": med,
                        "safety_category": "absolute_contraindication",
                        "severity": "critical",
                        "triggering_condition": f"Documented hypersensitivity / allergy to {med}",
                        "actual_patient_value": allergies_str,
                        "threshold_or_criteria": "Prior anaphylaxis or severe hypersensitivity reaction",
                        "explanation": f"Patient has documented allergy to {med}. Re-challenge is strictly contraindicated without formal desensitization.",
                        "clinician_recommendation": f"Select non-cross-reactive alternative regimen for {med}.",
                        "evidence_source": {
                            "source_name": "Standard Oncologic Hypersensitivity Protocol & USPI",
                            "version": "2024",
                            "section": "Contraindications: Hypersensitivity Reactions",
                            "reference": "doi:10.1200/JCO.2018.77.8738"
                        },
                        "status": "confirmed_contraindication"
                    })

        return findings

    @classmethod
    def _build_finding(
        cls,
        rule: SafetyRule,
        actual_value: Any,
        explanation: str,
        status: str
    ) -> Dict[str, Any]:
        return {
            "finding_id": f"FIND-{rule.rule_id}-{uuid.uuid4().hex[:6].upper()}",
            "medication_or_class": rule.medication_or_class,
            "safety_category": rule.safety_category,
            "severity": rule.severity,
            "triggering_condition": rule.threshold_or_condition_description,
            "actual_patient_value": actual_value,
            "threshold_or_criteria": rule.threshold_or_condition_description,
            "explanation": explanation,
            "clinician_recommendation": rule.clinician_action,
            "evidence_source": {
                "source_name": rule.source_name,
                "version": rule.version,
                "section": rule.section,
                "reference": rule.reference,
            },
            "status": status,
        }

