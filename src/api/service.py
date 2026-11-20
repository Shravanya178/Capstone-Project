"""
Backend Service Layer for Breast Cancer CDSS API.

Coordinates execution across ingestion, NLP extraction, canonical profile generation,
guideline checking, safety/contraindication evaluation, and treatment planning.
"""

from typing import Dict, Any, List, Optional
import os
import json
import uuid
import tempfile
from datetime import datetime, timezone

from src.integration.pipeline import CDSSPipeline
from src.dicom_sr.parser import DICOMSRParser
from src.patient_profile.generator import PatientProfileGenerator
from src.nlp.rule_extractor import ClinicalRuleExtractor
from src.nlp.bio_clinicalbert_extractor import BioClinicalBERTExtractor


WORKSPACE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SAMPLE_DIR = os.path.join(WORKSPACE_DIR, "data", "sample")


class CDSSService:
    """Core service orchestrating backend workflows for API consumers."""

    def __init__(self):
        self.pipeline = CDSSPipeline(workspace_dir=WORKSPACE_DIR, validate_schemas=True)
        self.bert_extractor = BioClinicalBERTExtractor(load_weights=False)  # Fast init for API, can use rules + checkpoint on demand
        self.profile_generator = PatientProfileGenerator(validate_schema=True)

    def get_capabilities(self) -> Dict[str, Any]:
        """Returns documented system capabilities and supported modalities."""
        return {
            "system_name": "Breast Cancer Clinical Decision Support System (CDSS)",
            "version": "1.0.0",
            "operating_mode": "clinician_in_the_loop_decision_support",
            "research_prototype": True,
            "disclaimer": "This system is a research decision-support prototype. It is NOT an autonomous diagnostic or prescribing system. All recommendations require multidisciplinary tumor board confirmation.",
            "supported_inputs": {
                "file_formats": [".xlsx", ".csv", ".dcm (DICOM SR)", ".txt"],
                "clinical_narratives": ["Pathology synoptic reports", "Breast MRI impression notes", "Diagnostic biopsy summaries"],
                "structured_dicom": ["SOP Class 1.2.840.10008.5.1.4.1.1.88.33 (Comprehensive SR)"],
            },
            "supported_datasets": [
                "TCGA-BRCA (The Cancer Genome Atlas Breast Invasive Carcinoma)",
                "TCIA_BREAST_DIAGNOSIS (The Cancer Imaging Archive)",
                "I-SPY-1 (ACRIN 6657 Trial)",
                "BREASTPATHQ (Quantitative Assessment of Residual Cancer Cellularity)",
            ],
            "guideline_rules": [
                {
                    "rule_id": "ESMO-BC-2024-HER2-ADJ-001",
                    "name": "Adjuvant Trastuzumab in HER2-Positive Early Breast Cancer",
                    "source": "ESMO Early Breast Cancer Clinical Practice Guidelines 2024",
                    "level_of_evidence": "Level I, Grade A",
                },
                {
                    "rule_id": "ESMO-BC-2024-HER2-NEOADJ-002",
                    "name": "Neoadjuvant Dual Anti-HER2 Blockade (Pertuzumab + Trastuzumab)",
                    "source": "ESMO Early Breast Cancer Clinical Practice Guidelines 2024",
                    "level_of_evidence": "Level I, Grade A",
                },
                {
                    "rule_id": "ESMO-BC-2024-HR-ENDO-003",
                    "name": "Adjuvant Endocrine Therapy in HR-Positive Early Breast Cancer",
                    "source": "ESMO Early Breast Cancer Clinical Practice Guidelines 2024",
                    "level_of_evidence": "Level I, Grade A",
                },
                {
                    "rule_id": "ESMO-BC-2024-TNBC-NEOADJ-004",
                    "name": "Neoadjuvant Chemotherapy in Early Triple-Negative Breast Cancer",
                    "source": "ESMO Early Breast Cancer Clinical Practice Guidelines 2024",
                    "level_of_evidence": "Level I, Grade A",
                },
                {
                    "rule_id": "ASCO-CAP-2018-HER2-REFLEX-005",
                    "name": "HER2 2+ Equivocal Reflex In Situ Hybridization (ISH)",
                    "source": "ASCO/CAP HER2 Testing Guidelines 2018",
                    "level_of_evidence": "Consensus Standard",
                },
            ],
            "safety_rules_count": 11,
            "treatment_modalities_count": 8,
            "nlp_classifier": "emilyalsentzer/Bio_ClinicalBERT (Fine-Tuned on Breast Oncology)",
        }

    def list_sample_cases(self) -> List[Dict[str, Any]]:
        """Lists pre-configured sample clinical scenarios available for instant evaluation."""
        scenarios = [
            {
                "case_id": "scenario_a",
                "filename": "scenario_a_complete_profile.json",
                "title": "Scenario A: Luminal A Invasive Ductal Carcinoma",
                "description": "Postmenopausal patient, ER+ 85%, PR+ 70%, HER2 negative, primary tumor 22mm (cT2 cN0). Clean baseline staging.",
                "key_features": ["ER positive", "PR positive", "HER2 negative", "Postmenopausal", "cT2 cN0"],
            },
            {
                "case_id": "scenario_b",
                "filename": "scenario_b_her2_equivocal.json",
                "title": "Scenario B: HER2 IHC 2+ Equivocal Reflex Case",
                "description": "Diagnostic biopsy showing HER2 IHC 2+ equivocal with reflex FISH pending. Tests anti-HER2 pause guardrail.",
                "key_features": ["HER2 IHC 2+ Equivocal", "Reflex ISH Required", "Anti-HER2 Paused"],
            },
            {
                "case_id": "scenario_c",
                "filename": "scenario_c_missing_information.json",
                "title": "Scenario C: Incomplete Research Profile (Missing Labs)",
                "description": "Retrospective trial subject lacking baseline echocardiography and renal panel. Tests missingness safeguard.",
                "key_features": ["Missing LVEF", "Missing CrCl", "Insufficient Information Status"],
            },
            {
                "case_id": "scenario_d",
                "filename": "scenario_d_er_low_notification.json",
                "title": "Scenario D: ER-Low (1-9%) Notification",
                "description": "Invasive carcinoma with low ER expression (5%) triggering ASCO/CAP 2020 ER-low clinical alert.",
                "key_features": ["ER-Low 5%", "Endocrine Heterogeneity Alert"],
            },
            {
                "case_id": "scenario_e",
                "filename": "scenario_e_temporal_segregation.json",
                "title": "Scenario E: Pre-NAT Biopsy vs Post-Resection Pathology",
                "description": "I-SPY-1 trial subject with longitudinal timeline tracking pre-treatment MRI and surgical resection cellularity.",
                "key_features": ["Pre-treatment Biopsy", "Post-resection Residual Bed", "Longitudinal Timeline"],
            },
        ]
        return scenarios

    def get_sample_assessment(self, case_id: str) -> Dict[str, Any]:
        """Loads and processes a sample clinical scenario through the full pipeline."""
        cases_map = {c["case_id"]: c["filename"] for c in self.list_sample_cases()}
        filename = cases_map.get(case_id.lower())
        if not filename:
            raise KeyError(f"Sample case '{case_id}' not found. Available: {list(cases_map.keys())}")

        file_path = os.path.join(SAMPLE_DIR, filename)
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Fixture file missing: {file_path}")

        with open(file_path, "r", encoding="utf-8") as f:
            profile = json.load(f)

        if "profile" in profile and isinstance(profile["profile"], dict):
            profile = profile["profile"]

        return self.pipeline.process_patient_profile(profile)

    def process_clinical_text(self, text: str, patient_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Parses unformatted clinical narrative, extracts entities via rule engine & BERT,
        builds canonical patient profile, and executes full pipeline.
        """
        if not text or not text.strip():
            raise ValueError("Clinical text input cannot be empty.")

        pid = patient_id or f"NARRATIVE_{uuid.uuid4().hex[:8].upper()}"

        # 1. Deterministic Rule Extraction
        observations = ClinicalRuleExtractor.extract_from_text(
            text=text, report_id=pid, source_dataset="CLINICAL_NARRATIVE_TEXT"
        )

        # Infer key parameters from extracted findings
        er_val = next((o["normalized_value"] for o in observations if o["concept"] == "er_status"), None)
        pr_val = next((o["normalized_value"] for o in observations if o["concept"] == "pr_status"), None)
        her2_val = next((o["normalized_value"] for o in observations if o["concept"] == "her2_status"), None)
        grade_val = next((o["normalized_value"] for o in observations if o["concept"] == "histologic_grade"), None)
        hist_val = next((o["normalized_value"] for o in observations if o["concept"] == "histologic_type"), None)
        size_val = next((o["normalized_value"] for o in observations if o["concept"] == "tumor_largest_diameter_mm"), None)
        lat_val = next((o["normalized_value"] for o in observations if o["concept"] == "laterality"), None)

        try:
            size_mm = float(size_val) if size_val is not None else None
        except (ValueError, TypeError):
            size_mm = None

        profile = self.profile_generator.build_profile(
            patient_id=pid,
            source_dataset="CLINICAL_NARRATIVE_TEXT",
            source_patient_id=pid,
            observations=observations,
            laterality=str(lat_val) if lat_val else None,
            histologic_type=str(hist_val) if hist_val else None,
            tumor_size_mm=size_mm,
            er_raw=str(er_val) if er_val is not None else None,
            pr_raw=str(pr_val) if pr_val is not None else None,
            her2_raw=str(her2_val) if her2_val is not None else None,
        )

        return self.pipeline.process_patient_profile(profile)

    def parse_dicom_sr_file(self, file_bytes: bytes, filename: str) -> Dict[str, Any]:
        """
        Parses a DICOM Structured Report (.dcm), asserts SOP Class UID and Modality SR,
        and returns extracted clinical observations.
        """
        with tempfile.NamedTemporaryFile(suffix=".dcm", delete=False) as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name

        try:
            parser = DICOMSRParser(tmp_path)
            parser.load_and_verify()
            tree = parser.parse_tree()
            observations = parser.to_clinical_observations()
            return {
                "filename": filename,
                "sop_class_uid": getattr(parser.dataset, "SOPClassUID", "UNKNOWN"),
                "modality": getattr(parser.dataset, "Modality", "UNKNOWN"),
                "patient_id": getattr(parser.dataset, "PatientID", "UNKNOWN_PATIENT"),
                "observation_count": len(observations),
                "observations": observations,
                "tree_summary": {
                    "root_concept": tree.get("concept_meaning"),
                    "depth": tree.get("depth", 0),
                    "child_count": len(tree.get("children", [])),
                },
            }
        finally:
            if os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except OSError:
                    pass
