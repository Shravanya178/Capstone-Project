"""
Deterministic Clinical Entity Recognition Rule Baseline.

Extracts breast oncology biomarkers, histological types, grades, tumor dimensions,
lymph node findings, and laterality from clinical narratives with exact text spans.
"""

from typing import List, Dict, Any, Optional
import re
import uuid

from src.nlp.text_preprocessor import ClinicalTextPreprocessor


class ClinicalRuleExtractor:
    """Regex and rule-based extractor for breast pathology reports and imaging impressions."""

    METHOD_NAME = "rule_regex"

    @classmethod
    def extract_from_text(cls, text: str, report_id: str, source_dataset: str = "NARRATIVE_TEXT") -> List[Dict[str, Any]]:
        """Processes clinical narrative and extracts canonical clinical observations."""
        sentences = ClinicalTextPreprocessor.split_sentences(text)
        observations: List[Dict[str, Any]] = []

        for sent_info in sentences:
            sent_text = sent_info["text"]
            sent_offset = sent_info["start_char"]

            # 1. ER Extraction
            er_matches = re.finditer(
                r"\b(?:estrogen\s+receptor|ER)\s*(?::|\s+is\s+)?\s*(positive|negative|pos|neg|\+|-|equivocal|low\s+positive|\d{1,3}\s*%)\b",
                sent_text,
                re.IGNORECASE,
            )
            for m in er_matches:
                match_str = m.group(0)
                raw_val = m.group(1).lower()
                context = ClinicalTextPreprocessor.analyze_context(sent_text, match_str)

                # Check for percentage
                pct_m = re.search(r"(\d{1,3})\s*%", sent_text)
                pct = float(pct_m.group(1)) if pct_m else None

                # Determine ER status
                if context["is_negated"] or raw_val in {"neg", "negative", "-"}:
                    norm_val = "negative"
                    er_low = False
                elif "low" in raw_val or (pct is not None and 1.0 <= pct <= 10.0):
                    norm_val = "er_low"
                    er_low = True
                elif "equivocal" in raw_val or context["is_uncertain"]:
                    norm_val = "equivocal"
                    er_low = None
                else:
                    norm_val = "positive"
                    er_low = False

                observations.append({
                    "observation_id": str(uuid.uuid4()),
                    "concept": "er_status",
                    "normalized_value": norm_val,
                    "raw_value": match_str,
                    "status": "equivocal" if norm_val == "equivocal" else "documented",
                    "unit": None,
                    "timepoint": "pre_treatment",
                    "provenance": {
                        "source_dataset": source_dataset,
                        "source_file": report_id,
                        "source_record_id": report_id,
                        "source_field_path": f"char_{sent_offset + m.start()}_{sent_offset + m.end()}",
                    },
                    "extraction": {
                        "method": cls.METHOD_NAME,
                        "confidence": 0.95,
                    },
                    "extra_metadata": {
                        "er_percentage": pct,
                        "er_low_flag": er_low,
                        "sentence": sent_text,
                    }
                })

            # 2. PR Extraction
            pr_matches = re.finditer(
                r"\b(?:progesterone\s+receptor|PR|PgR)\s*(?::|\s+is\s+)?\s*(positive|negative|pos|neg|\+|-|equivocal|\d{1,3}\s*%)\b",
                sent_text,
                re.IGNORECASE,
            )
            for m in pr_matches:
                match_str = m.group(0)
                raw_val = m.group(1).lower()
                context = ClinicalTextPreprocessor.analyze_context(sent_text, match_str)

                if context["is_negated"] or raw_val in {"neg", "negative", "-"}:
                    norm_val = "negative"
                elif "equivocal" in raw_val or context["is_uncertain"]:
                    norm_val = "equivocal"
                else:
                    norm_val = "positive"

                observations.append({
                    "observation_id": str(uuid.uuid4()),
                    "concept": "pr_status",
                    "normalized_value": norm_val,
                    "raw_value": match_str,
                    "status": "equivocal" if norm_val == "equivocal" else "documented",
                    "unit": None,
                    "timepoint": "pre_treatment",
                    "provenance": {
                        "source_dataset": source_dataset,
                        "source_file": report_id,
                        "source_record_id": report_id,
                        "source_field_path": f"char_{sent_offset + m.start()}_{sent_offset + m.end()}",
                    },
                    "extraction": {
                        "method": cls.METHOD_NAME,
                        "confidence": 0.95,
                    },
                })

            # 3. HER2 Extraction
            her2_matches = re.finditer(
                r"\b(?:HER2(?:\/neu)?)\s*(?::|\s+is\s+)?\s*(0|1\+|2\+|3\+|positive|negative|pos|neg|\+|-|equivocal|amplified|non-amplified)(?=\s|[.,;]|$|\b)",
                sent_text,
                re.IGNORECASE,
            )
            for m in her2_matches:
                match_str = m.group(0)
                raw_val = m.group(1).lower()
                context = ClinicalTextPreprocessor.analyze_context(sent_text, match_str)

                if raw_val in {"3+", "positive", "pos", "+", "amplified"} and not context["is_negated"]:
                    norm_val = "positive"
                    status = "documented"
                elif raw_val in {"0", "1+", "negative", "neg", "-", "non-amplified"} or context["is_negated"]:
                    norm_val = "negative"
                    status = "documented"
                elif raw_val == "2+" or "equivocal" in raw_val or context["is_uncertain"]:
                    norm_val = "equivocal"
                    status = "equivocal"
                else:
                    norm_val = "unknown"
                    status = "unknown"

                observations.append({
                    "observation_id": str(uuid.uuid4()),
                    "concept": "her2_status",
                    "normalized_value": norm_val,
                    "raw_value": match_str,
                    "status": status,
                    "unit": None,
                    "timepoint": "pre_treatment",
                    "provenance": {
                        "source_dataset": source_dataset,
                        "source_file": report_id,
                        "source_record_id": report_id,
                        "source_field_path": f"char_{sent_offset + m.start()}_{sent_offset + m.end()}",
                    },
                    "extraction": {
                        "method": cls.METHOD_NAME,
                        "confidence": 0.95,
                    },
                })

            # 4. Histologic Type
            type_match = re.search(
                r"\b(invasive\s+ductal\s+carcinoma|infiltrating\s+ductal\s+carcinoma|invasive\s+lobular\s+carcinoma|infiltrating\s+lobular|ductal\s+carcinoma\s+in\s+situ|dcis|idc|ilc)\b",
                sent_text,
                re.IGNORECASE,
            )
            if type_match:
                t_str = type_match.group(0).lower()
                norm_type = "invasive_lobular_carcinoma" if "lobular" in t_str else (
                    "invasive_ductal_carcinoma" if "ductal" in t_str or "idc" in t_str else "ductal_carcinoma_in_situ"
                )
                observations.append({
                    "observation_id": str(uuid.uuid4()),
                    "concept": "histologic_diagnosis",
                    "normalized_value": norm_type,
                    "raw_value": type_match.group(0),
                    "status": "documented",
                    "unit": None,
                    "timepoint": "pre_treatment",
                    "provenance": {
                        "source_dataset": source_dataset,
                        "source_file": report_id,
                        "source_record_id": report_id,
                        "source_field_path": f"char_{sent_offset + type_match.start()}_{sent_offset + type_match.end()}",
                    },
                    "extraction": {
                        "method": cls.METHOD_NAME,
                        "confidence": 0.98,
                    },
                })

            # 5. Histologic Grade
            grade_match = re.search(
                r"\b(?:nottingham\s+)?grade\s*([1-3]|i{1,3})\b|\b(poorly|moderately|well)\s+differentiated\b",
                sent_text,
                re.IGNORECASE,
            )
            if grade_match:
                g_str = grade_match.group(0).lower()
                norm_g = "grade_1" if ("1" in g_str or "well" in g_str) else (
                    "grade_2" if ("2" in g_str or "moderately" in g_str) else "grade_3"
                )
                observations.append({
                    "observation_id": str(uuid.uuid4()),
                    "concept": "histologic_grade",
                    "normalized_value": norm_g,
                    "raw_value": grade_match.group(0),
                    "status": "documented",
                    "unit": "grade",
                    "timepoint": "pre_treatment",
                    "provenance": {
                        "source_dataset": source_dataset,
                        "source_file": report_id,
                        "source_record_id": report_id,
                        "source_field_path": f"char_{sent_offset + grade_match.start()}_{sent_offset + grade_match.end()}",
                    },
                    "extraction": {
                        "method": cls.METHOD_NAME,
                        "confidence": 0.95,
                    },
                })

            # 6. Tumor Size
            size_match = re.search(
                r"\b(?:measuring|measures|size(?:\s+is)?)\s*(\d+(?:\.\d+)?)\s*(?:x\s*(\d+(?:\.\d+)?))?(?:\s*x\s*(\d+(?:\.\d+)?))?\s*(cm|mm)\b|\b(\d+(?:\.\d+)?)\s*(cm|mm)\s*(?:mass|tumor|lesion|carcinoma)\b",
                sent_text,
                re.IGNORECASE,
            )
            if size_match:
                # Find the largest dimension and convert to mm
                groups = size_match.groups()
                unit = "mm"
                dimensions: List[float] = []
                for g in groups:
                    if g:
                        if g.lower() in {"cm", "mm"}:
                            unit = g.lower()
                        else:
                            try:
                                dimensions.append(float(g))
                            except ValueError:
                                pass
                if dimensions:
                    max_dim = max(dimensions)
                    max_dim_mm = max_dim * 10.0 if unit == "cm" else max_dim
                    observations.append({
                        "observation_id": str(uuid.uuid4()),
                        "concept": "tumor_largest_diameter_mm",
                        "normalized_value": round(max_dim_mm, 1),
                        "raw_value": size_match.group(0),
                        "status": "documented",
                        "unit": "mm",
                        "timepoint": "pre_treatment",
                        "provenance": {
                            "source_dataset": source_dataset,
                            "source_file": report_id,
                            "source_record_id": report_id,
                            "source_field_path": f"char_{sent_offset + size_match.start()}_{sent_offset + size_match.end()}",
                        },
                        "extraction": {
                            "method": cls.METHOD_NAME,
                            "confidence": 0.92,
                        },
                    })

            # 7. Lymph Node Findings (Negation handling)
            ln_neg_match = re.search(
                r"\b(?:no\s+evidence\s+of|negative\s+for)\s+(?:(?:right|left|bilateral)\s+)?(?:axillary\s+)?lymphadenopathy\b|\bnegative\s+for\s+(?:axillary\s+)?(?:nodal\s+)?metastasis\b|\b0\s*(?:\/|\s+of\s+)\s*(\d+)\s*(?:lymph\s+nodes?|nodes?)\b",
                sent_text,
                re.IGNORECASE,
            )
            if ln_neg_match:
                observations.append({
                    "observation_id": str(uuid.uuid4()),
                    "concept": "lymph_node_involvement",
                    "normalized_value": "negative",
                    "raw_value": ln_neg_match.group(0),
                    "status": "documented",
                    "unit": None,
                    "timepoint": "pre_treatment",
                    "provenance": {
                        "source_dataset": source_dataset,
                        "source_file": report_id,
                        "source_record_id": report_id,
                        "source_field_path": f"char_{sent_offset + ln_neg_match.start()}_{sent_offset + ln_neg_match.end()}",
                    },
                    "extraction": {
                        "method": cls.METHOD_NAME,
                        "confidence": 0.96,
                    },
                })

            # 8. Laterality
            lat_match = re.search(r"\b(right\s+breast|left\s+breast|bilateral\s+breast)\b", sent_text, re.IGNORECASE)
            if lat_match:
                l_str = lat_match.group(0).lower()
                norm_lat = "right" if "right" in l_str else ("left" if "left" in l_str else "bilateral")
                observations.append({
                    "observation_id": str(uuid.uuid4()),
                    "concept": "disease_laterality",
                    "normalized_value": norm_lat,
                    "raw_value": lat_match.group(0),
                    "status": "documented",
                    "unit": None,
                    "timepoint": "pre_treatment",
                    "provenance": {
                        "source_dataset": source_dataset,
                        "source_file": report_id,
                        "source_record_id": report_id,
                        "source_field_path": f"char_{sent_offset + lat_match.start()}_{sent_offset + lat_match.end()}",
                    },
                    "extraction": {
                        "method": cls.METHOD_NAME,
                        "confidence": 0.99,
                    },
                })

        return observations
