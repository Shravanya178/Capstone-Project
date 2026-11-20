# Copyright (c) 2026 Shravanya Andhale, Nikhil Kadam, Sanket Patil, Khushi Shukla,
# Asma Parveen I Siddavatam and Pradnya Karekar
"""
DICOM Structured Report (SR) Tree Traversal and Extraction Parser.

Recursively navigates DICOM ContentSequence trees, extracting coded concepts,
measurements, units, spatial qualifiers, and BI-RADS categories per DICOM
Part 16 (TID 4200 / TID 1400 Breast Imaging Report Templates).
"""

from typing import Dict, Any, List, Optional
import os
import uuid
import pydicom
from pydicom.dataset import Dataset
from pydicom.sequence import Sequence

from src.dicom_sr.concept_mapper import DICOMConceptMapper


class DICOMSRParser:
    """Standardized recursive parser for DICOM Structured Reports (SR)."""

    COMPREHENSIVE_SR_SOP_CLASS = "1.2.840.10008.5.1.4.1.1.88.33"
    SUPPORTED_SOP_CLASSES = {
        "1.2.840.10008.5.1.4.1.1.88.33",  # Comprehensive SR
        "1.2.840.10008.5.1.4.1.1.88.22",  # Enhanced SR
        "1.2.840.10008.5.1.4.1.1.88.11",  # Basic Text SR
        "1.2.840.10008.5.1.4.1.1.88.34",  # Comprehensive 3D SR
    }

    def __init__(self, file_path: str):
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"DICOM SR file not found at: {file_path}")
        self.file_path = file_path
        self.dataset: Optional[Dataset] = None
        self.parsed_tree: Optional[Dict[str, Any]] = None
        self.extracted_observations: List[Dict[str, Any]] = []

    def load_and_verify(self) -> Dataset:
        """Reads file, asserts DICOM validity, and checks SOP Class UID and Modality."""
        self.dataset = pydicom.dcmread(self.file_path, force=True)
        
        modality = getattr(self.dataset, "Modality", None)
        sop_class = getattr(self.dataset, "SOPClassUID", None)

        if modality != "SR":
            raise ValueError(f"File {self.file_path} is not Modality SR (found {modality})")

        if sop_class not in self.SUPPORTED_SOP_CLASSES:
            raise ValueError(f"Unsupported SOP Class UID: {sop_class}. Expected Comprehensive SR or related.")

        return self.dataset

    @staticmethod
    def _extract_coded_concept(item: Dataset) -> Dict[str, Optional[str]]:
        """Decodes ConceptNameCodeSequence if present."""
        if hasattr(item, "ConceptNameCodeSequence") and len(item.ConceptNameCodeSequence) > 0:
            seq = item.ConceptNameCodeSequence[0]
            return {
                "code_value": getattr(seq, "CodeValue", None),
                "coding_scheme": getattr(seq, "CodingSchemeDesignator", None),
                "code_meaning": getattr(seq, "CodeMeaning", None),
            }
        return {"code_value": None, "coding_scheme": None, "code_meaning": None}

    def _traverse_node(self, node: Dataset, depth: int = 0) -> Dict[str, Any]:
        """Recursively parses an SR ContentSequence node."""
        val_type = getattr(node, "ValueType", "UNKNOWN")
        rel_type = getattr(node, "RelationshipType", None)
        concept = self._extract_coded_concept(node)

        node_data: Dict[str, Any] = {
            "depth": depth,
            "value_type": val_type,
            "relationship_type": rel_type,
            "concept_code": concept["code_value"],
            "coding_scheme": concept["coding_scheme"],
            "concept_meaning": concept["code_meaning"],
            "value": None,
            "unit": None,
            "children": [],
        }

        # Value Type Handling
        if val_type == "TEXT":
            node_data["value"] = getattr(node, "TextValue", None)

        elif val_type == "CODE":
            if hasattr(node, "ConceptCodeSequence") and len(node.ConceptCodeSequence) > 0:
                c_seq = node.ConceptCodeSequence[0]
                node_data["value"] = {
                    "code_value": getattr(c_seq, "CodeValue", None),
                    "coding_scheme": getattr(c_seq, "CodingSchemeDesignator", None),
                    "code_meaning": getattr(c_seq, "CodeMeaning", None),
                }

        elif val_type == "NUM":
            if hasattr(node, "MeasuredValueSequence") and len(node.MeasuredValueSequence) > 0:
                m_seq = node.MeasuredValueSequence[0]
                node_data["value"] = getattr(m_seq, "NumericValue", None)
                if hasattr(m_seq, "MeasurementUnitsCodeSequence") and len(m_seq.MeasurementUnitsCodeSequence) > 0:
                    u_seq = m_seq.MeasurementUnitsCodeSequence[0]
                    node_data["unit"] = getattr(u_seq, "CodeMeaning", getattr(u_seq, "CodeValue", None))

        elif val_type in {"DATE", "TIME", "DATETIME"}:
            node_data["value"] = getattr(node, f"{val_type.capitalize()}Value", getattr(node, "Date", None))

        elif val_type == "CONTAINER":
            node_data["continuity"] = getattr(node, "ContinuityOfContent", None)

        # Recursive walk into child ContentSequence
        if hasattr(node, "ContentSequence") and isinstance(node.ContentSequence, (Sequence, list)):
            for child in node.ContentSequence:
                node_data["children"].append(self._traverse_node(child, depth=depth + 1))

        return node_data

    def parse(self) -> Dict[str, Any]:
        """Parses the full DICOM SR document into a hierarchical dictionary."""
        if self.dataset is None:
            self.load_and_verify()

        patient_id = getattr(self.dataset, "PatientID", "UNKNOWN")
        sop_uid = getattr(self.dataset, "SOPInstanceUID", "UNKNOWN")
        study_desc = getattr(self.dataset, "StudyDescription", None)

        root_concept = self._extract_coded_concept(self.dataset)
        root_data: Dict[str, Any] = {
            "source_file": os.path.basename(self.file_path),
            "patient_id": patient_id,
            "sop_instance_uid": sop_uid,
            "sop_class_uid": getattr(self.dataset, "SOPClassUID", None),
            "modality": getattr(self.dataset, "Modality", None),
            "study_description": study_desc,
            "root_concept": root_concept,
            "tree": [],
        }

        if hasattr(self.dataset, "ContentSequence") and len(self.dataset.ContentSequence) > 0:
            for root_child in self.dataset.ContentSequence:
                root_data["tree"].append(self._traverse_node(root_child, depth=0))

        self.parsed_tree = root_data
        return self.parsed_tree

    def to_clinical_observations(self) -> List[Dict[str, Any]]:
        """Flattens parsed nodes into canonical clinical_observation objects."""
        if self.parsed_tree is None:
            self.parse()

        observations: List[Dict[str, Any]] = []
        patient_id = self.parsed_tree["patient_id"]

        def _collect_observations(node: Dict[str, Any]):
            val_type = node.get("value_type")
            code_meaning = node.get("concept_meaning")
            code_value = node.get("concept_code")

            canonical_concept = DICOMConceptMapper.map_concept(code_value, code_meaning)

            # Extract measurement
            if val_type == "NUM" and node.get("value") is not None:
                observations.append({
                    "observation_id": str(uuid.uuid4()),
                    "concept": canonical_concept,
                    "normalized_value": float(node["value"]),
                    "raw_value": node["value"],
                    "status": "documented",
                    "unit": str(node.get("unit") or "mm"),
                    "timepoint": "pre_treatment",
                    "provenance": {
                        "source_dataset": "TCIA_BREAST_DIAGNOSIS_DICOM_SR",
                        "source_file": os.path.basename(self.file_path),
                        "source_record_id": patient_id,
                        "source_field_path": f"ContentSequence.{code_meaning or code_value}",
                    },
                    "extraction": {
                        "method": "dicom_sr_parser",
                        "confidence": 1.0,
                    },
                })

            # Extract qualitative code / BI-RADS assessment
            elif val_type == "CODE" and isinstance(node.get("value"), dict):
                code_obj = node["value"]
                meaning = code_obj.get("code_meaning") or code_obj.get("code_value")
                observations.append({
                    "observation_id": str(uuid.uuid4()),
                    "concept": canonical_concept,
                    "normalized_value": meaning,
                    "raw_value": meaning,
                    "status": "documented",
                    "unit": "code",
                    "timepoint": "pre_treatment",
                    "provenance": {
                        "source_dataset": "TCIA_BREAST_DIAGNOSIS_DICOM_SR",
                        "source_file": os.path.basename(self.file_path),
                        "source_record_id": patient_id,
                        "source_field_path": f"ContentSequence.{code_meaning or code_value}",
                    },
                    "extraction": {
                        "method": "dicom_sr_parser",
                        "confidence": 1.0,
                    },
                })

            # Extract text
            elif val_type == "TEXT" and node.get("value") is not None:
                observations.append({
                    "observation_id": str(uuid.uuid4()),
                    "concept": canonical_concept,
                    "normalized_value": node["value"],
                    "raw_value": node["value"],
                    "status": "documented",
                    "unit": None,
                    "timepoint": "pre_treatment",
                    "provenance": {
                        "source_dataset": "TCIA_BREAST_DIAGNOSIS_DICOM_SR",
                        "source_file": os.path.basename(self.file_path),
                        "source_record_id": patient_id,
                        "source_field_path": f"ContentSequence.{code_meaning or code_value}",
                    },
                    "extraction": {
                        "method": "dicom_sr_parser",
                        "confidence": 1.0,
                    },
                })

            for child in node.get("children", []):
                _collect_observations(child)

        for top_node in self.parsed_tree.get("tree", []):
            _collect_observations(top_node)

        self.extracted_observations = observations
        return observations
