"""
Clinical Contraindication & Medication Safety Knowledge Base.

Grounded in authoritative FDA prescribing information, ASCO clinical practice guidelines,
ESMO Early Breast Cancer Guidelines (2024), and AHA/ACC Cardio-Oncology Consensus.
Distinguishes absolute contraindications, relative contraindications, black-box warnings,
precautions, drug interactions, and organ function threshold requirements.
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict


@dataclass(frozen=True)
class SafetyRule:
    rule_id: str
    medication_or_class: str
    safety_category: str  # absolute_contraindication, relative_contraindication, black_box_warning, precaution, drug_interaction, organ_toxicity_risk, monitoring_requirement
    severity: str         # critical, high, moderate, low, informational
    target_organ_or_domain: str
    trigger_concept: str
    threshold_or_condition_description: str
    clinician_action: str
    source_name: str
    version: str
    section: str
    reference: str


class ContraindicationRegistry:
    """Registry of verified evidence-based oncology safety rules."""

    RULES: List[SafetyRule] = [
        SafetyRule(
            rule_id="RULE-SAFE-TRASTUZUMAB-CARDIO-001",
            medication_or_class="Trastuzumab / Pertuzumab (Anti-HER2 Therapy)",
            safety_category="absolute_contraindication",
            severity="critical",
            target_organ_or_domain="cardiac",
            trigger_concept="lvef_percent",
            threshold_or_condition_description="Baseline LVEF < 50% or absolute decline >= 10 percentage points from baseline to < 50%",
            clinician_action="Withhold anti-HER2 therapy. Order repeat echocardiogram in 3-4 weeks. Refer to cardio-oncology prior to any re-challenge.",
            source_name="FDA Prescribing Information & ESMO Early Breast Cancer Guidelines",
            version="2024 Update",
            section="Section 4.3 (Cardiac Safety of Anti-HER2 Therapy) & Herceptin USPI Boxed Warning",
            reference="doi:10.1093/annonc/mdz173"
        ),
        SafetyRule(
            rule_id="RULE-SAFE-ANTHRACYCLINE-CARDIO-002",
            medication_or_class="Doxorubicin / Epirubicin (Anthracyclines)",
            safety_category="black_box_warning",
            severity="critical",
            target_organ_or_domain="cardiac",
            trigger_concept="anthracycline_cardiac_threshold",
            threshold_or_condition_description="Baseline LVEF < 50%, symptomatic heart failure, or prior cumulative doxorubicin dose > 450 mg/m2",
            clinician_action="Anthracyclines contraindicated. Consider non-anthracycline regimen (e.g. Docetaxel + Cyclophosphamide or TCH for HER2+).",
            source_name="ASCO Clinical Practice Guideline & Adriamycin USPI",
            version="2020 Update",
            section="Boxed Warning & Prevention/Monitoring of Cardiac Dysfunction",
            reference="doi:10.1200/JCO.2017.74.6248"
        ),
        SafetyRule(
            rule_id="RULE-SAFE-TAMOXIFEN-THROMBO-003",
            medication_or_class="Tamoxifen (SERM)",
            safety_category="absolute_contraindication",
            severity="critical",
            target_organ_or_domain="vascular",
            trigger_concept="thromboembolic_history",
            threshold_or_condition_description="History of deep vein thrombosis (DVT), pulmonary embolism (PE), or active thromboembolic disease",
            clinician_action="Tamoxifen contraindicated. In postmenopausal women, use Aromatase Inhibitors. In premenopausal women, consider ovarian suppression + AI.",
            source_name="ASCO Adjuvant Endocrine Therapy Guideline & Nolvadex USPI",
            version="2020 Update",
            section="Contraindications & Thromboembolic Risk Assessment",
            reference="doi:10.1200/JCO.2013.54.2258"
        ),
        SafetyRule(
            rule_id="RULE-SAFE-TAMOXIFEN-CYP2D6-004",
            medication_or_class="Tamoxifen (SERM)",
            safety_category="drug_interaction",
            severity="high",
            target_organ_or_domain="pharmacokinetics",
            trigger_concept="cyp2d6_inhibitor_use",
            threshold_or_condition_description="Concurrent administration of potent CYP2D6 inhibitors (Paroxetine, Fluoxetine, Bupropion)",
            clinician_action="Major interaction: Potent CYP2D6 inhibitors prevent conversion of tamoxifen into active metabolite endoxifen. Switch antidepressant to Venlafaxine, Citalopram, or Escitalopram.",
            source_name="ASCO Clinical Practice Guideline & CPIC Dosing Guideline",
            version="2020 Update",
            section="Pharmacogenomic and Drug-Interaction Considerations",
            reference="doi:10.1002/cpt.1007"
        ),
        SafetyRule(
            rule_id="RULE-SAFE-AI-PREMENO-005",
            medication_or_class="Aromatase Inhibitors (Anastrozole, Letrozole, Exemestane)",
            safety_category="absolute_contraindication",
            severity="critical",
            target_organ_or_domain="reproductive",
            trigger_concept="menopausal_status",
            threshold_or_condition_description="Premenopausal ovarian function without concurrent ovarian function suppression (OFS / GnRH agonist)",
            clinician_action="Aromatase inhibitors ineffective and contraindicated as monotherapy in premenopausal women due to intact hypothalamic-pituitary-ovarian axis. Add GnRH agonist (Goserelin, Leuprolide) or switch to Tamoxifen.",
            source_name="ESMO Early Breast Cancer Guidelines & St. Gallen Consensus",
            version="2024 Update",
            section="Section 4.4.1 (Adjuvant Endocrine Therapy in Premenopausal Patients)",
            reference="doi:10.1093/annonc/mdz173"
        ),
        SafetyRule(
            rule_id="RULE-SAFE-TAXANE-NEUTRO-006",
            medication_or_class="Paclitaxel / Docetaxel (Taxanes)",
            safety_category="precaution",
            severity="high",
            target_organ_or_domain="hematologic",
            trigger_concept="absolute_neutrophil_count",
            threshold_or_condition_description="Baseline ANC < 1,500/uL or platelets < 100,000/uL",
            clinician_action="Delay cycle until ANC >= 1,500/uL and platelets >= 100,000/uL. Consider secondary prophylaxis with G-CSF (Filgrastim/Pegfilgrastim).",
            source_name="ASCO Antimicrobial Prophylaxis and G-CSF Guidelines",
            version="2020 Update",
            section="Myelosuppression and Colony-Stimulating Factors",
            reference="doi:10.1200/JCO.2015.62.3090"
        ),
        SafetyRule(
            rule_id="RULE-SAFE-TAXANE-NEURO-007",
            medication_or_class="Paclitaxel / Docetaxel (Taxanes)",
            safety_category="precaution",
            severity="moderate",
            target_organ_or_domain="neurologic",
            trigger_concept="peripheral_neuropathy_grade",
            threshold_or_condition_description="Pre-existing peripheral sensory or motor neuropathy >= Grade 2",
            clinician_action="High risk of disabling neurotoxicity. Consider weekly paclitaxel schedule or dose attenuation; monitor neurologic symptoms closely.",
            source_name="ASCO Clinical Practice Guideline on Chemotherapy-Induced Peripheral Neuropathy",
            version="2020 Update",
            section="Clinical Management of Neurotoxic Agents",
            reference="doi:10.1200/JCO.20.01399"
        ),
        SafetyRule(
            rule_id="RULE-SAFE-CDK46-QTc-008",
            medication_or_class="Ribociclib (CDK4/6 Inhibitor)",
            safety_category="precaution",
            severity="high",
            target_organ_or_domain="cardiac",
            trigger_concept="qtc_interval_ms",
            threshold_or_condition_description="Baseline QTc > 450 ms or concurrent QTc-prolonging medications",
            clinician_action="Do not initiate Ribociclib if baseline QTc > 450 ms. Perform ECG at baseline, Day 14 of Cycle 1, and prior to Cycle 2. Alternatively consider Palbociclib or Abemaciclib.",
            source_name="FDA Prescribing Information (Kisqali) & ASCO Guidelines",
            version="2023 Update",
            section="Warnings and Precautions: QT Interval Prolongation",
            reference="doi:10.1200/JCO.2018.77.8738"
        ),
        SafetyRule(
            rule_id="RULE-SAFE-PEMBRO-AUTOIMMUNE-009",
            medication_or_class="Pembrolizumab (Immune Checkpoint Inhibitor)",
            safety_category="relative_contraindication",
            severity="high",
            target_organ_or_domain="immunologic",
            trigger_concept="autoimmune_disease_status",
            threshold_or_condition_description="Active severe autoimmune disease (e.g. Crohn's disease, ulcerative colitis, severe lupus, active pneumonitis)",
            clinician_action="High risk of severe immune-related adverse events (irAEs). Requires multidisciplinary review with rheumatologist/gastroenterologist prior to consideration.",
            source_name="ESMO Clinical Practice Guidelines for Oncologic Immunotherapy & Keytruda USPI",
            version="2024 Update",
            section="Management of Immune-Related Toxicities",
            reference="doi:10.1016/j.annonc.2022.10.001"
        ),
        SafetyRule(
            rule_id="RULE-SAFE-PLATINUM-RENAL-010",
            medication_or_class="Cisplatin / Carboplatin (Platinum Chemotherapy)",
            safety_category="organ_toxicity_risk",
            severity="high",
            target_organ_or_domain="renal",
            trigger_concept="creatinine_clearance_ml_min",
            threshold_or_condition_description="eGFR or CrCl < 50 mL/min for Cisplatin, or < 30 mL/min for Carboplatin",
            clinician_action="Cisplatin contraindicated if CrCl < 50 mL/min. For Carboplatin, calculate AUC dose strictly using the Calvert formula with capped GFR.",
            source_name="NCCN Guidelines for Antiemesis & Renal Supportive Care",
            version="2024 Version 1",
            section="Principles of Chemotherapy Dosing in Renal Dysfunction",
            reference="doi:10.6004/jnccn.2023.0034"
        ),
        SafetyRule(
            rule_id="RULE-SAFE-PREGNANCY-011",
            medication_or_class="Cytotoxic Chemotherapy / Anti-HER2 / Endocrine Therapy",
            safety_category="absolute_contraindication",
            severity="critical",
            target_organ_or_domain="reproductive",
            trigger_concept="pregnancy_status",
            threshold_or_condition_description="Confirmed pregnancy (especially 1st trimester) or lactation",
            clinician_action="Anti-HER2 agents, endocrine agents, and 1st-trimester chemotherapy are strictly contraindicated due to major fetal malformation and oligohydramnios. Refer immediately to high-risk obstetric oncology.",
            source_name="ESMO Guidelines on Breast Cancer in Pregnancy",
            version="2024 Update",
            section="Section 8 (Systemic Therapy During Pregnancy)",
            reference="doi:10.1093/annonc/mdz173"
        )
    ]

    @classmethod
    def get_all_rules(cls) -> List[SafetyRule]:
        return list(cls.RULES)

    @classmethod
    def get_rule_by_id(cls, rule_id: str) -> Optional[SafetyRule]:
        for r in cls.RULES:
            if r.rule_id == rule_id:
                return r
        return None

    @classmethod
    def get_rules_for_medication(cls, medication_name: str) -> List[SafetyRule]:
        med_lower = medication_name.lower()
        matched = []
        for r in cls.RULES:
            if any(term in med_lower for term in r.medication_or_class.lower().split("/")):
                matched.append(r)
        return matched

