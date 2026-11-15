"""
Deterministic Guideline Rules Evaluator.

Executes evidence-based guideline rules against canonical patient profiles.
Emits transparent, explainable evaluations conforming to schemas/guideline_check.schema.json.
"""

from typing import Dict, Any, List, Optional
import datetime
import json
import os
import jsonschema

from .rule_schema import GuidelineRule, EvaluationResultStatus
from .rule_registry import GuidelineRuleRegistry
from .explanation import ExplanationGenerator


class GuidelineEvaluator:
    """Deterministic evaluation engine for clinical guidelines."""

    SCHEMA_PATH = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "schemas",
        "guideline_check.schema.json",
    )

    def __init__(self, validate_schema: bool = True):
        self.validate_schema = validate_schema
        self.validator: Optional[jsonschema.Draft202012Validator] = None
        if validate_schema and os.path.exists(self.SCHEMA_PATH):
            with open(self.SCHEMA_PATH, "r") as f:
                schema_doc = json.load(f)
            self.validator = jsonschema.Draft202012Validator(schema_doc)

    def evaluate_profile(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluates a canonical patient profile against all registered guideline rules."""
        patient_id = profile["patient_id"]
        evaluations: List[Dict[str, Any]] = []

        # Extract patient parameters
        biomarkers = profile.get("pathology_biomarkers", {})
        extent = profile.get("clinical_extent", {})
        demographics = profile.get("demographics", {})

        er_status = biomarkers.get("er_status")
        pr_status = biomarkers.get("pr_status")
        her2_status = biomarkers.get("her2_status")
        her2_ihc = biomarkers.get("her2_ihc_score")
        her2_fish = biomarkers.get("her2_fish_status")
        mol_subtype = biomarkers.get("molecular_subtype")
        size_mm = extent.get("primary_tumor_size_mm")
        c_n = extent.get("clinical_n_stage")
        meno_status = demographics.get("menopausal_status")

        # Evaluate Rule 1: Adjuvant Trastuzumab (HER2+ EBC)
        evaluations.append(self._eval_rule_her2_adjuvant(
            her2_status, size_mm, c_n
        ))

        # Evaluate Rule 2: Neoadjuvant Dual HER2 Blockade
        evaluations.append(self._eval_rule_her2_neoadjuvant(
            her2_status, size_mm, c_n
        ))

        # Evaluate Rule 3: Adjuvant Endocrine Therapy
        evaluations.append(self._eval_rule_endocrine_adjuvant(
            er_status, pr_status, meno_status
        ))

        # Evaluate Rule 4: Neoadjuvant Chemotherapy in TNBC
        evaluations.append(self._eval_rule_tnbc_neoadjuvant(
            mol_subtype, size_mm, c_n
        ))

        # Evaluate Rule 5: Reflex ISH for Equivocal HER2 IHC 2+
        evaluations.append(self._eval_rule_her2_reflex_testing(
            her2_ihc, her2_fish
        ))

        output_doc = {
            "patient_id": patient_id,
            "evaluation_timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "guideline_version_set": [
                "ESMO Early Breast Cancer Guidelines 2024 Update",
                "ASCO/CAP HER2 Testing 2018 Focused Update",
                "St. Gallen International Consensus 2023",
            ],
            "checks": evaluations,
        }

        if self.validator is not None:
            self.validator.validate(output_doc)

        return output_doc

    def _eval_rule_her2_adjuvant(
        self, her2_status: Optional[str], size_mm: Optional[float], c_n: Optional[str]
    ) -> Dict[str, Any]:
        rule = GuidelineRuleRegistry.get_registered_rules()[0]

        matched: List[Dict[str, Any]] = []
        missing: List[Dict[str, Any]] = []
        prompt: Optional[str] = None
        manual_review = False

        if her2_status in {"not_reported", "unknown", None}:
            missing.append({"concept": "her2_status", "required_condition": "HER2 positive", "reason": "HER2 status not reported"})
            status = EvaluationResultStatus.INSUFFICIENT_INFORMATION.value
        elif her2_status == "equivocal":
            missing.append({"concept": "her2_status", "required_condition": "HER2 positive", "reason": "HER2 is equivocal; requires ISH confirmation"})
            status = EvaluationResultStatus.REQUIRES_REVIEW.value
            manual_review = True
            prompt = "Perform reflex ISH before adjuvant trastuzumab decision."
        elif her2_status == "positive":
            matched.append({"concept": "her2_status", "required_condition": "HER2 positive", "actual_value": "positive", "status": "matched"})
            if size_mm is not None and size_mm > 5.0:
                matched.append({"concept": "primary_tumor_size_mm", "required_condition": "> 5.0 mm", "actual_value": size_mm, "status": "matched"})
                status = EvaluationResultStatus.APPLICABLE.value
                prompt = "Confirm baseline cardiac ejection fraction (LVEF >= 50%) prior to trastuzumab initiation."
            elif c_n is not None and c_n in {"cN1", "cN2", "cN3"}:
                matched.append({"concept": "clinical_n_stage", "required_condition": "cN >= 1", "actual_value": c_n, "status": "matched"})
                status = EvaluationResultStatus.APPLICABLE.value
                prompt = "Confirm baseline cardiac ejection fraction (LVEF >= 50%) prior to trastuzumab initiation."
            elif size_mm is None:
                missing.append({"concept": "primary_tumor_size_mm", "required_condition": "> 5.0 mm", "reason": "Tumor size not documented"})
                status = EvaluationResultStatus.INSUFFICIENT_INFORMATION.value
            else:
                status = EvaluationResultStatus.NOT_APPLICABLE.value
        else:
            status = EvaluationResultStatus.NOT_APPLICABLE.value

        explanation = ExplanationGenerator.format_explanation(
            rule.rule_name, status, matched, missing, rule.target_intervention, rule.source.section
        )

        return {
            "rule_id": rule.rule_id,
            "rule_name": rule.rule_name,
            "guideline_name": rule.guideline_name,
            "guideline_version": rule.guideline_version,
            "publication_date": rule.publication_date,
            "domain": rule.domain,
            "target_intervention": rule.target_intervention,
            "result": status,
            "required_fields": rule.required_fields,
            "matched_criteria": matched,
            "missing_or_unmatched_criteria": missing,
            "explanation": explanation,
            "clinician_action_prompt": prompt,
            "evidence_level": rule.evidence_level,
            "recommendation_grade": rule.recommendation_grade,
            "source": {
                "guideline": rule.source.guideline,
                "version": rule.source.version,
                "section": rule.source.section,
                "page": rule.source.page,
                "document_reference": rule.source.document_reference,
            },
            "manual_review_required": manual_review,
            "verification_status": rule.verification_status,
        }

    def _eval_rule_her2_neoadjuvant(
        self, her2_status: Optional[str], size_mm: Optional[float], c_n: Optional[str]
    ) -> Dict[str, Any]:
        rule = GuidelineRuleRegistry.get_registered_rules()[1]
        matched: List[Dict[str, Any]] = []
        missing: List[Dict[str, Any]] = []
        prompt: Optional[str] = None
        manual_review = False

        if her2_status in {"not_reported", "unknown", None}:
            missing.append({"concept": "her2_status", "required_condition": "HER2 positive", "reason": "HER2 status not reported"})
            status = EvaluationResultStatus.INSUFFICIENT_INFORMATION.value
        elif her2_status == "equivocal":
            status = EvaluationResultStatus.REQUIRES_REVIEW.value
            manual_review = True
            prompt = "Confirm HER2 amplification status via ISH before neoadjuvant anti-HER2 therapy."
        elif her2_status == "positive":
            matched.append({"concept": "her2_status", "required_condition": "HER2 positive", "actual_value": "positive", "status": "matched"})
            if size_mm is not None and size_mm > 20.0:
                matched.append({"concept": "primary_tumor_size_mm", "required_condition": "> 20.0 mm (cT >= 2)", "actual_value": size_mm, "status": "matched"})
                status = EvaluationResultStatus.APPLICABLE.value
                prompt = "Neoadjuvant dual HER2 blockade (pertuzumab + trastuzumab) is standard for cT >= 2 HER2+ disease."
            elif c_n is not None and c_n in {"cN1", "cN2", "cN3"}:
                matched.append({"concept": "clinical_n_stage", "required_condition": "Node-positive (cN >= 1)", "actual_value": c_n, "status": "matched"})
                status = EvaluationResultStatus.APPLICABLE.value
                prompt = "Neoadjuvant dual HER2 blockade is standard for node-positive HER2+ disease."
            elif size_mm is None:
                missing.append({"concept": "primary_tumor_size_mm", "required_condition": "> 20.0 mm", "reason": "Tumor size not documented"})
                status = EvaluationResultStatus.INSUFFICIENT_INFORMATION.value
            else:
                status = EvaluationResultStatus.NOT_APPLICABLE.value
        else:
            status = EvaluationResultStatus.NOT_APPLICABLE.value

        explanation = ExplanationGenerator.format_explanation(
            rule.rule_name, status, matched, missing, rule.target_intervention, rule.source.section
        )

        return {
            "rule_id": rule.rule_id,
            "rule_name": rule.rule_name,
            "guideline_name": rule.guideline_name,
            "guideline_version": rule.guideline_version,
            "publication_date": rule.publication_date,
            "domain": rule.domain,
            "target_intervention": rule.target_intervention,
            "result": status,
            "required_fields": rule.required_fields,
            "matched_criteria": matched,
            "missing_or_unmatched_criteria": missing,
            "explanation": explanation,
            "clinician_action_prompt": prompt,
            "evidence_level": rule.evidence_level,
            "recommendation_grade": rule.recommendation_grade,
            "source": {
                "guideline": rule.source.guideline,
                "version": rule.source.version,
                "section": rule.source.section,
                "page": rule.source.page,
                "document_reference": rule.source.document_reference,
            },
            "manual_review_required": manual_review,
            "verification_status": rule.verification_status,
        }

    def _eval_rule_endocrine_adjuvant(
        self, er_status: Optional[str], pr_status: Optional[str], meno_status: Optional[str]
    ) -> Dict[str, Any]:
        rule = GuidelineRuleRegistry.get_registered_rules()[2]
        matched: List[Dict[str, Any]] = []
        missing: List[Dict[str, Any]] = []
        prompt: Optional[str] = None

        if er_status in {"not_reported", "unknown", None} and pr_status in {"not_reported", "unknown", None}:
            missing.append({"concept": "er_status", "required_condition": "ER or PR positive", "reason": "Hormone receptor status not documented"})
            status = EvaluationResultStatus.INSUFFICIENT_INFORMATION.value
        elif er_status in {"positive", "er_low"} or pr_status == "positive":
            matched.append({"concept": "hormone_receptor_status", "required_condition": "ER or PR positive", "actual_value": f"ER={er_status}, PR={pr_status}", "status": "matched"})
            status = EvaluationResultStatus.APPLICABLE.value
            if meno_status == "postmenopausal":
                prompt = "Aromatase inhibitor (e.g. anastrozole, letrozole) is preferred endocrine therapy in postmenopausal women."
            elif meno_status == "premenopausal":
                prompt = "Tamoxifen (5-10 years) or Aromatase Inhibitor + Ovarian Function Suppression (OFS) if high risk."
            else:
                prompt = "Assess menopausal status to optimize adjuvant endocrine regimen selection."
        else:
            status = EvaluationResultStatus.NOT_APPLICABLE.value

        explanation = ExplanationGenerator.format_explanation(
            rule.rule_name, status, matched, missing, rule.target_intervention, rule.source.section
        )

        return {
            "rule_id": rule.rule_id,
            "rule_name": rule.rule_name,
            "guideline_name": rule.guideline_name,
            "guideline_version": rule.guideline_version,
            "publication_date": rule.publication_date,
            "domain": rule.domain,
            "target_intervention": rule.target_intervention,
            "result": status,
            "required_fields": rule.required_fields,
            "matched_criteria": matched,
            "missing_or_unmatched_criteria": missing,
            "explanation": explanation,
            "clinician_action_prompt": prompt,
            "evidence_level": rule.evidence_level,
            "recommendation_grade": rule.recommendation_grade,
            "source": {
                "guideline": rule.source.guideline,
                "version": rule.source.version,
                "section": rule.source.section,
                "page": rule.source.page,
                "document_reference": rule.source.document_reference,
            },
            "manual_review_required": False,
            "verification_status": rule.verification_status,
        }

    def _eval_rule_tnbc_neoadjuvant(
        self, mol_subtype: Optional[str], size_mm: Optional[float], c_n: Optional[str]
    ) -> Dict[str, Any]:
        rule = GuidelineRuleRegistry.get_registered_rules()[3]
        matched: List[Dict[str, Any]] = []
        missing: List[Dict[str, Any]] = []
        prompt: Optional[str] = None

        if mol_subtype in {"not_reported", "unknown", None}:
            missing.append({"concept": "molecular_subtype", "required_condition": "triple_negative", "reason": "Molecular subtype unknown"})
            status = EvaluationResultStatus.INSUFFICIENT_INFORMATION.value
        elif mol_subtype == "triple_negative":
            matched.append({"concept": "molecular_subtype", "required_condition": "triple_negative", "actual_value": "triple_negative", "status": "matched"})
            if size_mm is not None and size_mm > 20.0:
                matched.append({"concept": "primary_tumor_size_mm", "required_condition": "> 20.0 mm (cT >= 2)", "actual_value": size_mm, "status": "matched"})
                status = EvaluationResultStatus.APPLICABLE.value
                prompt = "Neoadjuvant chemotherapy improves pCR and breast conservation in stage II-III TNBC. Evaluate BRCA testing."
            elif c_n is not None and c_n in {"cN1", "cN2", "cN3"}:
                matched.append({"concept": "clinical_n_stage", "required_condition": "Node-positive (cN >= 1)", "actual_value": c_n, "status": "matched"})
                status = EvaluationResultStatus.APPLICABLE.value
                prompt = "Neoadjuvant chemotherapy recommended for node-positive TNBC."
            elif size_mm is None:
                missing.append({"concept": "primary_tumor_size_mm", "required_condition": "> 20.0 mm", "reason": "Tumor size not documented"})
                status = EvaluationResultStatus.INSUFFICIENT_INFORMATION.value
            else:
                status = EvaluationResultStatus.NOT_APPLICABLE.value
        else:
            status = EvaluationResultStatus.NOT_APPLICABLE.value

        explanation = ExplanationGenerator.format_explanation(
            rule.rule_name, status, matched, missing, rule.target_intervention, rule.source.section
        )

        return {
            "rule_id": rule.rule_id,
            "rule_name": rule.rule_name,
            "guideline_name": rule.guideline_name,
            "guideline_version": rule.guideline_version,
            "publication_date": rule.publication_date,
            "domain": rule.domain,
            "target_intervention": rule.target_intervention,
            "result": status,
            "required_fields": rule.required_fields,
            "matched_criteria": matched,
            "missing_or_unmatched_criteria": missing,
            "explanation": explanation,
            "clinician_action_prompt": prompt,
            "evidence_level": rule.evidence_level,
            "recommendation_grade": rule.recommendation_grade,
            "source": {
                "guideline": rule.source.guideline,
                "version": rule.source.version,
                "section": rule.source.section,
                "page": rule.source.page,
                "document_reference": rule.source.document_reference,
            },
            "manual_review_required": False,
            "verification_status": rule.verification_status,
        }

    def _eval_rule_her2_reflex_testing(
        self, her2_ihc: Optional[str], her2_fish: Optional[str]
    ) -> Dict[str, Any]:
        rule = GuidelineRuleRegistry.get_registered_rules()[4]
        matched: List[Dict[str, Any]] = []
        missing: List[Dict[str, Any]] = []
        prompt: Optional[str] = None
        manual_review = False

        if her2_ihc == "2+":
            matched.append({"concept": "her2_ihc_score", "required_condition": "2+ (equivocal)", "actual_value": "2+", "status": "matched"})
            if her2_fish in {None, "not_reported", "unknown", "not_performed"}:
                status = EvaluationResultStatus.REQUIRES_REVIEW.value
                manual_review = True
                prompt = "Mandatory reflex in situ hybridization (ISH/FISH) testing required before anti-HER2 therapy decision."
                missing.append({"concept": "her2_fish_status", "required_condition": "Confirmatory ISH performed", "reason": "ISH not yet performed"})
            else:
                status = EvaluationResultStatus.NOT_APPLICABLE.value
        else:
            status = EvaluationResultStatus.NOT_APPLICABLE.value

        explanation = ExplanationGenerator.format_explanation(
            rule.rule_name, status, matched, missing, rule.target_intervention, rule.source.section
        )

        return {
            "rule_id": rule.rule_id,
            "rule_name": rule.rule_name,
            "guideline_name": rule.guideline_name,
            "guideline_version": rule.guideline_version,
            "publication_date": rule.publication_date,
            "domain": rule.domain,
            "target_intervention": rule.target_intervention,
            "result": status,
            "required_fields": rule.required_fields,
            "matched_criteria": matched,
            "missing_or_unmatched_criteria": missing,
            "explanation": explanation,
            "clinician_action_prompt": prompt,
            "evidence_level": rule.evidence_level,
            "recommendation_grade": rule.recommendation_grade,
            "source": {
                "guideline": rule.source.guideline,
                "version": rule.source.version,
                "section": rule.source.section,
                "page": rule.source.page,
                "document_reference": rule.source.document_reference,
            },
            "manual_review_required": manual_review,
            "verification_status": rule.verification_status,
        }

