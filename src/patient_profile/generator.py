"""
Canonical Patient Profile Generator.

Consolidates multimodal clinical observations into standardized, schema-validated
patient profile documents for downstream safety analysis (Sanket) and UI rendering (Nikhil).
"""

from typing import Dict, Any, List, Optional
import datetime
import json
import os
import jsonschema

from src.preprocessing.value_normalizer import ValueNormalizer
from src.preprocessing.temporal_classifier import TemporalClassifier, ClinicalTimepoint


class PatientProfileGenerator:
    """Builds canonical patient profile conforming to schemas/patient_profile.schema.json."""

    SCHEMA_PATH = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "schemas",
        "patient_profile.schema.json",
    )

    def __init__(self, validate_schema: bool = True):
        self.validate_schema = validate_schema
        self.validator: Optional[jsonschema.Draft202012Validator] = None
        if validate_schema and os.path.exists(self.SCHEMA_PATH):
            with open(self.SCHEMA_PATH, "r") as f:
                schema_doc = json.load(f)
            self.validator = jsonschema.Draft202012Validator(schema_doc)

    @staticmethod
    def _determine_intrinsic_subtype(
        er_status: str,
        pr_status: str,
        her2_status: str,
        ki67_index: Optional[float] = None,
        grade: Optional[str] = None
    ) -> str:
        """
        Classifies surrogate intrinsic molecular subtype per St. Gallen / ESMO guidelines.
        Requires ER, PR, and HER2. Never classifies triple-negative if HER2 is equivocal.
        """
        if er_status in {"not_reported", "unknown"} or her2_status in {"not_reported", "unknown"}:
            return "unknown"

        if her2_status == "equivocal":
            return "unknown"

        # Triple-Negative Breast Cancer (TNBC)
        if er_status == "negative" and pr_status == "negative" and her2_status == "negative":
            return "triple_negative"

        # HER2-Enriched
        if er_status == "negative" and pr_status == "negative" and her2_status == "positive":
            return "her2_enriched"

        # Luminal Subtypes (HR Positive)
        if er_status in {"positive", "er_low"} or pr_status == "positive":
            if her2_status == "positive":
                return "luminal_b_her2_positive"
            else:
                # HER2 Negative: Distinguish Luminal A vs Luminal B HER2- using Ki-67 or Grade
                if ki67_index is not None:
                    return "luminal_a" if ki67_index < 20.0 else "luminal_b_her2_negative"
                if grade is not None:
                    return "luminal_a" if grade in {"grade_1"} else "luminal_b_her2_negative"
                return "luminal_unspecified"

        return "unknown"

    def build_profile(
        self,
        patient_id: str,
        source_dataset: str,
        source_patient_id: str,
        observations: List[Dict[str, Any]],
        age: Optional[float] = None,
        menopausal_status: Optional[str] = None,
        laterality: Optional[str] = None,
        tumor_size_mm: Optional[float] = None,
        c_t: Optional[str] = None,
        c_n: Optional[str] = None,
        c_m: Optional[str] = None,
        histologic_type: Optional[str] = None,
        histologic_grade: Optional[str] = None,
        er_raw: Optional[Any] = None,
        pr_raw: Optional[Any] = None,
        her2_raw: Optional[Any] = None,
        her2_fish_raw: Optional[Any] = None,
        ki67_raw: Optional[Any] = None,
    ) -> Dict[str, Any]:
        """Synthesizes observations into a complete, validated canonical patient profile."""
        review_flags: List[Dict[str, Any]] = []

        # 1. Demographics
        norm_meno, meno_status = ValueNormalizer.normalize_menopausal_status(menopausal_status)
        demo_status = "documented" if (age is not None or meno_status == "documented") else "not_reported"
        demographics = {
            "age": float(age) if age is not None else None,
            "menopausal_status": norm_meno,
            "race_ethnicity": None,
            "status": demo_status,
        }

        # 2. Clinical Extent
        norm_lat, lat_status = ValueNormalizer.normalize_laterality(laterality)
        extent_status = "documented" if (norm_lat != "not_reported" or tumor_size_mm is not None) else "not_reported"
        clinical_extent = {
            "laterality": norm_lat,
            "primary_tumor_size_mm": float(tumor_size_mm) if tumor_size_mm is not None else None,
            "clinical_t_stage": c_t,
            "clinical_n_stage": c_n,
            "clinical_m_stage": c_m,
            "status": extent_status,
        }

        # 3. Pathology & Biomarkers
        norm_er = ValueNormalizer.normalize_er(er_raw)
        norm_pr = ValueNormalizer.normalize_pr(pr_raw)
        norm_her2 = ValueNormalizer.normalize_her2(her2_raw, fish_val=her2_fish_raw)
        norm_grade, grade_status = ValueNormalizer.normalize_histologic_grade(histologic_grade)
        norm_type, _ = ValueNormalizer.normalize_histologic_type(histologic_type)
        ki67_num, ki67_cat, ki67_status = ValueNormalizer.normalize_ki67(ki67_raw)

        # Flag missing or equivocal critical biomarkers
        if norm_her2["her2_status"] in {"not_reported", "unknown"}:
            review_flags.append({
                "flag_type": "missing_critical_data",
                "severity": "critical",
                "field": "her2_status",
                "message": "HER2 receptor status is not documented in baseline pathology.",
            })
        elif norm_her2["her2_status"] == "equivocal":
            review_flags.append({
                "flag_type": "equivocal_biomarker",
                "severity": "warning",
                "field": "her2_status",
                "message": "HER2 IHC is equivocal (2+) without documented confirmatory ISH/FISH.",
            })

        if norm_er["er_status"] in {"not_reported", "unknown"}:
            review_flags.append({
                "flag_type": "missing_critical_data",
                "severity": "critical",
                "field": "er_status",
                "message": "Estrogen receptor (ER) status is not reported.",
            })
        elif norm_er.get("er_low_flag"):
            review_flags.append({
                "flag_type": "er_low_notification",
                "severity": "info",
                "field": "er_status",
                "message": "Tumor is ER-low (1-10% nuclear staining); clinical benefit from endocrine therapy may be limited.",
            })

        # Molecular Subtype Determination
        mol_subtype = self._determine_intrinsic_subtype(
            er_status=norm_er["er_status"],
            pr_status=norm_pr["pr_status"],
            her2_status=norm_her2["her2_status"],
            ki67_index=ki67_num,
            grade=norm_grade,
        )

        pathology_biomarkers = {
            "histologic_type": norm_type,
            "histologic_grade": norm_grade,
            "er_status": norm_er["er_status"],
            "er_percentage": norm_er.get("percentage"),
            "er_low_flag": norm_er.get("er_low_flag"),
            "pr_status": norm_pr["pr_status"],
            "pr_percentage": norm_pr.get("percentage"),
            "her2_status": norm_her2["her2_status"],
            "her2_ihc_score": norm_her2.get("ihc_score"),
            "her2_fish_ratio": None,
            "her2_fish_status": norm_her2.get("fish_status"),
            "ki67_index": ki67_num,
            "molecular_subtype": mol_subtype,
            "status": "documented" if (norm_er["status"] == "documented" or norm_her2["status"] == "documented") else "not_reported",
        }

        # 4. Group observations by timepoint
        grouped_timepoints = TemporalClassifier.group_by_timepoint(observations)

        profile = {
            "patient_id": patient_id,
            "source_dataset": source_dataset,
            "source_patient_id": source_patient_id,
            "profile_generation_timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "demographics": demographics,
            "clinical_extent": clinical_extent,
            "pathology_biomarkers": pathology_biomarkers,
            "clinical_timepoints": grouped_timepoints,
            "observations": observations,
            "review_flags": review_flags,
        }

        # Validate against JSON Schema
        if self.validator is not None:
            self.validator.validate(profile)

        return profile

