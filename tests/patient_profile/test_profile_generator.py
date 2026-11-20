# Copyright (c) 2026 Shravanya Andhale, Nikhil Kadam, Sanket Patil, Khushi Shukla,
# Asma Parveen I Siddavatam and Pradnya Karekar
"""
Unit tests for canonical patient profile generation and clinical edge cases.
"""

import pytest
import os
import json
import jsonschema
from src.patient_profile.generator import PatientProfileGenerator


def test_luminal_a_profile_generation():
    """Tests Archetype 1: Early-stage ER+/HER2- (Luminal A)."""
    generator = PatientProfileGenerator(validate_schema=True)

    profile = generator.build_profile(
        patient_id="SYNTH_PAT_001",
        source_dataset="TCIA_BREAST_DIAGNOSIS",
        source_patient_id="BreastDX-01-0002",
        observations=[],
        age=52.0,
        menopausal_status="postmenopausal",
        laterality="right",
        tumor_size_mm=18.0,
        c_t="cT1c",
        c_n="cN0",
        c_m="cM0",
        histologic_type="invasive_ductal_carcinoma",
        histologic_grade="grade_1",
        er_raw="85% positive",
        pr_raw="70% positive",
        her2_raw="0",
        ki67_raw="10%",
    )

    assert profile["patient_id"] == "SYNTH_PAT_001"
    assert profile["demographics"]["menopausal_status"] == "postmenopausal"
    assert profile["pathology_biomarkers"]["er_status"] == "positive"
    assert profile["pathology_biomarkers"]["her2_status"] == "negative"
    assert profile["pathology_biomarkers"]["molecular_subtype"] == "luminal_a"
    assert len(profile["review_flags"]) == 0


def test_her2_positive_profile_generation():
    """Tests Archetype 2: Locally advanced HER2-positive."""
    generator = PatientProfileGenerator(validate_schema=True)

    profile = generator.build_profile(
        patient_id="SYNTH_PAT_002",
        source_dataset="ISPY1_CALGB150007",
        source_patient_id="1005",
        observations=[],
        age=45.0,
        menopausal_status="premenopausal",
        laterality="left",
        tumor_size_mm=45.0,
        c_t="cT2",
        c_n="cN1",
        c_m="cM0",
        histologic_type="invasive_ductal_carcinoma",
        histologic_grade="grade_3",
        er_raw="negative",
        pr_raw="negative",
        her2_raw="3+",
        ki67_raw="55%",
    )

    assert profile["pathology_biomarkers"]["her2_status"] == "positive"
    assert profile["pathology_biomarkers"]["molecular_subtype"] == "her2_enriched"


def test_triple_negative_profile_generation():
    """Tests Archetype 3: Triple-Negative Breast Cancer (TNBC)."""
    generator = PatientProfileGenerator(validate_schema=True)

    profile = generator.build_profile(
        patient_id="SYNTH_PAT_003",
        source_dataset="ISPY1_CALGB150007",
        source_patient_id="1010",
        observations=[],
        age=38.0,
        menopausal_status="premenopausal",
        laterality="left",
        tumor_size_mm=32.0,
        er_raw="0% negative",
        pr_raw="0% negative",
        her2_raw="1+",
        ki67_raw="70%",
    )

    assert profile["pathology_biomarkers"]["molecular_subtype"] == "triple_negative"


def test_her2_equivocal_review_flag():
    """Tests Archetype 4: Incomplete / Equivocal profile (HER2 2+ without ISH)."""
    generator = PatientProfileGenerator(validate_schema=True)

    profile = generator.build_profile(
        patient_id="SYNTH_PAT_004",
        source_dataset="TCIA_BREAST_DIAGNOSIS",
        source_patient_id="BreastDX-01-0025",
        observations=[],
        age=61.0,
        menopausal_status="postmenopausal",
        laterality="right",
        tumor_size_mm=22.0,
        er_raw="positive",
        pr_raw="positive",
        her2_raw="2+",
        her2_fish_raw=None,
    )

    assert profile["pathology_biomarkers"]["her2_status"] == "equivocal"
    assert profile["pathology_biomarkers"]["molecular_subtype"] == "unknown"
    flags = [f["flag_type"] for f in profile["review_flags"]]
    assert "equivocal_biomarker" in flags


def test_er_low_notification():
    """Tests ER-low (1-10%) notification flag preservation."""
    generator = PatientProfileGenerator(validate_schema=True)

    profile = generator.build_profile(
        patient_id="SYNTH_PAT_005",
        source_dataset="BREASTPATHQ",
        source_patient_id="12",
        observations=[],
        age=58.0,
        menopausal_status="postmenopausal",
        laterality="right",
        tumor_size_mm=15.0,
        er_raw="ER low positive (5%)",
        pr_raw="negative",
        her2_raw="0",
    )

    assert profile["pathology_biomarkers"]["er_status"] == "er_low"
    assert profile["pathology_biomarkers"]["er_low_flag"] is True
    flags = [f["flag_type"] for f in profile["review_flags"]]
    assert "er_low_notification" in flags

