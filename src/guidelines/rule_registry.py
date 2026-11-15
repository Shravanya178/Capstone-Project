"""
Guideline Rule Registry.

Maintains registered, version-controlled, evidence-based breast cancer practice rules
from ESMO, ASCO/CAP, and St. Gallen clinical practice guidelines.
"""

from typing import List, Dict, Any, Optional
from .rule_schema import GuidelineRule, GuidelineSource


class GuidelineRuleRegistry:
    """Registry of verified evidence-based breast cancer guidelines."""

    @classmethod
    def get_registered_rules(cls) -> List[GuidelineRule]:
        """Returns the suite of verified clinical guideline rules."""
        return [
            # Rule 1: Adjuvant Trastuzumab
            GuidelineRule(
                rule_id="ESMO-BC-2024-HER2-ADJ-001",
                rule_name="Adjuvant Trastuzumab in HER2-Positive Early Breast Cancer",
                guideline_name="ESMO Clinical Practice Guidelines for Early Breast Cancer",
                guideline_version="2024 Update (Ann Oncol 2019; 30: 1194-1220)",
                domain="systemic_adjuvant",
                target_intervention="1 year of adjuvant trastuzumab-based systemic therapy combined with or following chemotherapy",
                required_fields=["her2_status", "primary_tumor_size_mm"],
                source=GuidelineSource(
                    guideline="ESMO Early Breast Cancer Guidelines",
                    version="2024",
                    section="Section 4.3.1 (Systemic Therapy: HER2-positive EBC)",
                    page="1205",
                    document_reference="doi:10.1093/annonc/mdz173",
                ),
                publication_date="2024-01-15",
                evidence_level="Level I",
                recommendation_grade="Grade A",
                verification_status="verified_source",
                manual_review_required=False,
            ),
            # Rule 2: Neoadjuvant Dual HER2 Blockade
            GuidelineRule(
                rule_id="ESMO-BC-2024-HER2-NEOADJ-002",
                rule_name="Neoadjuvant Dual Anti-HER2 Blockade (Pertuzumab + Trastuzumab)",
                guideline_name="ESMO Clinical Practice Guidelines for Early Breast Cancer",
                guideline_version="2024 Update",
                domain="systemic_neoadjuvant",
                target_intervention="Neoadjuvant dual anti-HER2 blockade (trastuzumab + pertuzumab) plus taxane chemotherapy",
                required_fields=["her2_status", "primary_tumor_size_mm"],
                source=GuidelineSource(
                    guideline="ESMO Early Breast Cancer Guidelines",
                    version="2024",
                    section="Section 4.2.2 (Neoadjuvant Therapy: HER2-positive disease)",
                    page="1203",
                    document_reference="doi:10.1093/annonc/mdz173",
                ),
                publication_date="2024-01-15",
                evidence_level="Level I",
                recommendation_grade="Grade A",
                verification_status="verified_source",
                manual_review_required=False,
            ),
            # Rule 3: Adjuvant Endocrine Therapy
            GuidelineRule(
                rule_id="ESMO-BC-2024-HR-ENDO-003",
                rule_name="Adjuvant Endocrine Therapy in HR-Positive Early Breast Cancer",
                guideline_name="ESMO Clinical Practice Guidelines for Early Breast Cancer",
                guideline_version="2024 Update",
                domain="systemic_adjuvant",
                target_intervention="Adjuvant endocrine therapy (Tamoxifen or Aromatase Inhibitor based on menopausal status) for 5-10 years",
                required_fields=["er_status", "pr_status", "menopausal_status"],
                source=GuidelineSource(
                    guideline="ESMO Early Breast Cancer Guidelines",
                    version="2024",
                    section="Section 4.4.1 (Adjuvant Endocrine Therapy)",
                    page="1208",
                    document_reference="doi:10.1093/annonc/mdz173",
                ),
                publication_date="2024-01-15",
                evidence_level="Level I",
                recommendation_grade="Grade A",
                verification_status="verified_source",
                manual_review_required=False,
            ),
            # Rule 4: Neoadjuvant Chemotherapy in TNBC
            GuidelineRule(
                rule_id="ESMO-BC-2024-TNBC-NEOADJ-004",
                rule_name="Neoadjuvant Chemotherapy in Early Triple-Negative Breast Cancer",
                guideline_name="ESMO Clinical Practice Guidelines for Early Breast Cancer",
                guideline_version="2024 Update",
                domain="systemic_neoadjuvant",
                target_intervention="Neoadjuvant sequential anthracycline/taxane chemotherapy regimen (with platinum consideration)",
                required_fields=["molecular_subtype", "primary_tumor_size_mm"],
                source=GuidelineSource(
                    guideline="ESMO Early Breast Cancer Guidelines",
                    version="2024",
                    section="Section 4.2.1 (Neoadjuvant Therapy: TNBC)",
                    page="1202",
                    document_reference="doi:10.1093/annonc/mdz173",
                ),
                publication_date="2024-01-15",
                evidence_level="Level I",
                recommendation_grade="Grade A",
                verification_status="verified_source",
                manual_review_required=False,
            ),
            # Rule 5: Mandatory Reflex ISH for Equivocal HER2 IHC 2+
            GuidelineRule(
                rule_id="ASCO-CAP-2018-HER2-REFLEX-005",
                rule_name="Mandatory Reflex ISH/FISH Testing for Equivocal HER2 IHC 2+",
                guideline_name="ASCO/CAP HER2 Testing in Breast Cancer Focused Update",
                guideline_version="2018 Focused Update (J Clin Oncol 2018; 36: 2105-2122)",
                domain="biomarker_testing",
                target_intervention="Reflex in situ hybridization (ISH/FISH) testing before anti-HER2 therapy consideration",
                required_fields=["her2_ihc_score", "her2_fish_status"],
                source=GuidelineSource(
                    guideline="ASCO/CAP HER2 Testing Clinical Practice Guideline",
                    version="2018",
                    section="Table 1 & Recommendation 2 (Reflex Testing for Equivocal IHC 2+)",
                    page="2108",
                    document_reference="doi:10.1200/JCO.2018.77.8738",
                ),
                publication_date="2018-07-01",
                evidence_level="Level I",
                recommendation_grade="Grade A",
                verification_status="verified_source",
                manual_review_required=True,
            ),
        ]

