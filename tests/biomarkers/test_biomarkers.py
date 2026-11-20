# Copyright (c) 2026 Shravanya Andhale, Nikhil Kadam, Sanket Patil, Khushi Shukla,
# Asma Parveen I Siddavatam and Pradnya Karekar
"""
Unit tests for ASCO/CAP biomarker interpretation and AJCC staging assessment.
"""

import pytest
from src.biomarkers.er_interpreter import ERInterpreter
from src.biomarkers.pr_interpreter import PRInterpreter
from src.biomarkers.her2_interpreter import HER2Interpreter
from src.biomarkers.ki67_interpreter import Ki67Interpreter
from src.biomarkers.subtype_interpreter import MolecularSubtypeInterpreter
from src.biomarkers.staging_assessor import AJCCStagingAssessor


def test_er_interpreter_cases():
    """Tests standard ER-positive, ER-negative, and explicit ER-low (1-10%)."""
    # Case 1: Standard positive (80%)
    res_pos = ERInterpreter.interpret("positive", percentage=80.0)
    assert res_pos["er_status"] == "positive"
    assert res_pos["er_low_flag"] is False

    # Case 2: ER-low (5%) per ASCO/CAP 2020
    res_low = ERInterpreter.interpret("ER low positive", percentage=5.0)
    assert res_low["er_status"] == "er_low"
    assert res_low["er_low_flag"] is True
    assert "limited" in res_low["clinical_comment"]

    # Case 3: Negative (0%)
    res_neg = ERInterpreter.interpret("negative", percentage=0.0)
    assert res_neg["er_status"] == "negative"
    assert res_neg["er_low_flag"] is False

    # Case 4: Missing / Not reported
    res_miss = ERInterpreter.interpret(None)
    assert res_miss["er_status"] == "not_reported"
    assert res_miss["status"] == "not_reported"


def test_her2_interpreter_cases():
    """Tests IHC 3+, 0/1+, 2+ equivocal, and reflex ISH/FISH concordance."""
    # Case 1: IHC 3+ is directly positive
    res_3 = HER2Interpreter.interpret("3+")
    assert res_3["her2_definitive_status"] == "positive"
    assert res_3["requires_reflex_testing"] is False

    # Case 2: IHC 0 is directly negative
    res_0 = HER2Interpreter.interpret("0")
    assert res_0["her2_definitive_status"] == "negative"
    assert res_0["requires_reflex_testing"] is False

    # Case 3: IHC 2+ WITHOUT ISH MUST be equivocal
    res_2_no_fish = HER2Interpreter.interpret("2+", raw_fish=None)
    assert res_2_no_fish["her2_definitive_status"] == "equivocal"
    assert res_2_no_fish["requires_reflex_testing"] is True
    assert res_2_no_fish["review_prompt"] is not None

    # Case 4: IHC 2+ with confirmatory FISH positive (ratio 2.5)
    res_2_fish_pos = HER2Interpreter.interpret("2+", raw_fish="positive", fish_ratio=2.5)
    assert res_2_fish_pos["her2_definitive_status"] == "positive"

    # Case 5: IHC 2+ with confirmatory FISH negative (ratio 1.2, copy number 2.8)
    res_2_fish_neg = HER2Interpreter.interpret("2+", raw_fish="negative", fish_ratio=1.2, copy_number=2.8)
    assert res_2_fish_neg["her2_definitive_status"] == "negative"


def test_molecular_subtype_classifier():
    """Tests surrogate intrinsic subtype classification and guardrails."""
    # Luminal A: ER+, PR+, HER2-, low Ki-67
    st_la = MolecularSubtypeInterpreter.classify(
        er_status="positive", pr_status="positive", her2_status="negative", ki67_index=12.0
    )
    assert st_la["molecular_subtype"] == "luminal_a"

    # Luminal B HER2-negative: ER+, HER2-, high Ki-67
    st_lb_neg = MolecularSubtypeInterpreter.classify(
        er_status="positive", pr_status="positive", her2_status="negative", ki67_index=45.0
    )
    assert st_lb_neg["molecular_subtype"] == "luminal_b_her2_negative"

    # Luminal B HER2-positive: ER+, HER2+
    st_lb_pos = MolecularSubtypeInterpreter.classify(
        er_status="positive", pr_status="positive", her2_status="positive"
    )
    assert st_lb_pos["molecular_subtype"] == "luminal_b_her2_positive"

    # HER2-Enriched: ER-, PR-, HER2+
    st_her2_enr = MolecularSubtypeInterpreter.classify(
        er_status="negative", pr_status="negative", her2_status="positive"
    )
    assert st_her2_enr["molecular_subtype"] == "her2_enriched"

    # Triple-Negative: ER-, PR-, HER2-
    st_tnbc = MolecularSubtypeInterpreter.classify(
        er_status="negative", pr_status="negative", her2_status="negative"
    )
    assert st_tnbc["molecular_subtype"] == "triple_negative"

    # Guardrail: HER2 equivocal MUST result in unknown subtype with review flag
    st_eq = MolecularSubtypeInterpreter.classify(
        er_status="negative", pr_status="negative", her2_status="equivocal"
    )
    assert st_eq["molecular_subtype"] == "unknown"
    assert st_eq["review_flag_required"] is True


def test_ajcc_staging_assessor():
    """Tests AJCC 8th Edition clinical T evaluation and staging integrity."""
    # cT1c (18 mm)
    st_1c = AJCCStagingAssessor.evaluate_cT(18.0)
    assert st_1c["c_t"] == "cT1c"

    # cT2 (35 mm)
    st_2 = AJCCStagingAssessor.evaluate_cT(35.0)
    assert st_2["c_t"] == "cT2"

    # cT3 (65 mm)
    st_3 = AJCCStagingAssessor.evaluate_cT(65.0)
    assert st_3["c_t"] == "cT3"

    # Extent with unassessed cN and cM
    extent = AJCCStagingAssessor.evaluate_extent(tumor_size_mm=22.0)
    assert extent["clinical_t_stage"] == "cT2"
    assert extent["clinical_n_stage"] is None
    assert extent["n_status"] == "not_reported"
    assert extent["clinical_m_stage"] is None
    assert extent["m_status"] == "not_reported"

