# Copyright (c) 2026 Shravanya Andhale, Nikhil Kadam, Sanket Patil, Khushi Shukla,
# Asma Parveen I Siddavatam and Pradnya Karekar
"""
Unit tests for DICOM Structured Report (SR) recursive parser.
"""

import pytest
import os
import tempfile
import json
import jsonschema
import pydicom
from pydicom.dataset import Dataset, FileMetaDataset
from pydicom.sequence import Sequence

from src.dicom_sr.parser import DICOMSRParser

WORKSPACE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OBS_SCHEMA_FILE = os.path.join(WORKSPACE_DIR, "schemas", "clinical_observation.schema.json")


def create_synthetic_dicom_sr(filepath: str, modality: str = "SR", sop_class: str = "1.2.840.10008.5.1.4.1.1.88.33"):
    """Creates a valid DICOM Comprehensive SR file for testing."""
    file_meta = FileMetaDataset()
    file_meta.MediaStorageSOPClassUID = pydicom.uid.UID(sop_class)
    file_meta.MediaStorageSOPInstanceUID = pydicom.uid.UID("1.2.3.4.5.6.7.8.9")
    file_meta.TransferSyntaxUID = pydicom.uid.ExplicitVRLittleEndian

    ds = Dataset()
    ds.file_meta = file_meta
    ds.preamble = b"\x00" * 128

    ds.PatientID = "BreastDX-01-0002"
    ds.PatientName = "ANONYMIZED^PATIENT"
    ds.Modality = modality
    ds.SOPClassUID = file_meta.MediaStorageSOPClassUID
    ds.SOPInstanceUID = file_meta.MediaStorageSOPInstanceUID
    ds.StudyDescription = "Breast MRI Structured Report"

    # Root concept
    root_concept = Dataset()
    root_concept.CodeValue = "111000"
    root_concept.CodingSchemeDesignator = "DCM"
    root_concept.CodeMeaning = "Breast Imaging Report"
    ds.ConceptNameCodeSequence = Sequence([root_concept])

    # Build Content Sequence
    # Child 1: Container for Findings
    finding_container = Dataset()
    finding_container.ValueType = "CONTAINER"
    finding_container.RelationshipType = "CONTAINS"
    finding_container.ContinuityOfContent = "SEPARATE"
    c_concept = Dataset()
    c_concept.CodeValue = "121070"
    c_concept.CodingSchemeDesignator = "DCM"
    c_concept.CodeMeaning = "Finding"
    finding_container.ConceptNameCodeSequence = Sequence([c_concept])

    # Grandchild 1: NUM measurement of tumor size
    num_node = Dataset()
    num_node.ValueType = "NUM"
    num_node.RelationshipType = "CONTAINS"
    n_concept = Dataset()
    n_concept.CodeValue = "121206"
    n_concept.CodingSchemeDesignator = "DCM"
    n_concept.CodeMeaning = "Longest Diameter"
    num_node.ConceptNameCodeSequence = Sequence([n_concept])

    meas_seq = Dataset()
    meas_seq.NumericValue = "22.5"
    unit_seq = Dataset()
    unit_seq.CodeValue = "mm"
    unit_seq.CodingSchemeDesignator = "UCUM"
    unit_seq.CodeMeaning = "millimeter"
    meas_seq.MeasurementUnitsCodeSequence = Sequence([unit_seq])
    num_node.MeasuredValueSequence = Sequence([meas_seq])

    # Grandchild 2: CODE for BI-RADS Category
    code_node = Dataset()
    code_node.ValueType = "CODE"
    code_node.RelationshipType = "CONTAINS"
    b_concept = Dataset()
    b_concept.CodeValue = "111001"
    b_concept.CodingSchemeDesignator = "DCM"
    b_concept.CodeMeaning = "BI-RADS Assessment"
    code_node.ConceptNameCodeSequence = Sequence([b_concept])

    birads_code = Dataset()
    birads_code.CodeValue = "111005"
    birads_code.CodingSchemeDesignator = "DCM"
    birads_code.CodeMeaning = "BI-RADS Category 6 - Known Biopsy Proven Malignancy"
    code_node.ConceptCodeSequence = Sequence([birads_code])

    finding_container.ContentSequence = Sequence([num_node, code_node])
    ds.ContentSequence = Sequence([finding_container])

    pydicom.dcmwrite(filepath, ds, write_like_original=False)


def test_dicom_sr_parsing_and_schema_validation():
    """Tests loading, recursive tree parsing, and observation extraction."""
    with tempfile.NamedTemporaryFile(suffix=".dcm", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        create_synthetic_dicom_sr(tmp_path)
        parser = DICOMSRParser(tmp_path)
        tree = parser.parse()

        assert tree["patient_id"] == "BreastDX-01-0002"
        assert tree["modality"] == "SR"
        assert len(tree["tree"]) == 1
        assert tree["tree"][0]["value_type"] == "CONTAINER"

        obs = parser.to_clinical_observations()
        assert len(obs) >= 2

        concepts = [o["concept"] for o in obs]
        assert "tumor_largest_diameter_mm" in concepts
        assert "birads_category" in concepts

        # Check measurement details
        size_obs = [o for o in obs if o["concept"] == "tumor_largest_diameter_mm"][0]
        assert size_obs["normalized_value"] == 22.5
        assert size_obs["unit"] == "millimeter"

        # Validate against JSON Schema
        with open(OBS_SCHEMA_FILE, "r") as sf:
            schema = json.load(sf)
        validator = jsonschema.Draft202012Validator(schema)
        for o in obs:
            validator.validate(o)

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def test_dicom_sr_rejects_invalid_modality():
    """Verifies that non-SR modalities are strictly rejected."""
    with tempfile.NamedTemporaryFile(suffix=".dcm", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        create_synthetic_dicom_sr(tmp_path, modality="MR")
        parser = DICOMSRParser(tmp_path)
        with pytest.raises(ValueError, match="not Modality SR"):
            parser.load_and_verify()
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
