# Copyright (c) 2026 Shravanya Andhale, Nikhil Kadam, Sanket Patil, Khushi Shukla,
# Asma Parveen I Siddavatam and Pradnya Karekar
"""
Unit tests for Clinical NLP pipeline (preprocessing, rule extraction, evaluation harness).
"""

import pytest
from src.nlp.text_preprocessor import ClinicalTextPreprocessor
from src.nlp.rule_extractor import ClinicalRuleExtractor
from src.nlp.evaluator import NLPEvaluationHarness


def test_sentence_splitting_and_abbreviation_preservation():
    """Verifies that sentence segmentation does not split on decimal points or abbreviations."""
    sample_text = (
        "Patient seen by Dr. Smith for right breast mass approx. 2.5 cm. "
        "Biopsy confirmed invasive ductal carcinoma. No lymphadenopathy seen."
    )
    sentences = ClinicalTextPreprocessor.split_sentences(sample_text)
    assert len(sentences) == 2 or len(sentences) == 3
    # Check that '2.5 cm' is not split into '2.' and '5 cm'
    first_sent = sentences[0]["text"]
    assert "2.5 cm" in first_sent


def test_negation_detection():
    """Tests that 'no evidence of axillary lymphadenopathy' correctly identifies negation."""
    sent = "RIGHT BREAST: No evidence of right axillary lymphadenopathy or skin thickening."
    analysis = ClinicalTextPreprocessor.analyze_context(sent, "axillary lymphadenopathy")
    assert analysis["is_negated"] is True
    assert analysis["negation_cue"] is not None


def test_uncertainty_detection():
    """Tests that 'equivocal HER2 2+ staining' flags uncertainty."""
    sent = "Immunohistochemical evaluation reveals equivocal HER2 2+ staining requiring confirmatory FISH."
    analysis = ClinicalTextPreprocessor.analyze_context(sent, "HER2")
    assert analysis["is_uncertain"] is True


def test_rule_extraction_from_clinical_impression():
    """Tests extraction of tumor size, diagnosis, and nodal negation from real TCIA MRI impression."""
    impression = (
        "RIGHT BREAST: There is moderate background enhancement. Within the lower, central right breast at 6-7:00 "
        "position is an irregularly marginated mass which measures 2.1 x 2.0 x 4.6 cm consistent with invasive ductal carcinoma. "
        "No evidence of right axillary lymphadenopathy."
    )
    obs = ClinicalRuleExtractor.extract_from_text(impression, report_id="CASE_0002_MRI")
    concepts = [o["concept"] for o in obs]

    assert "tumor_largest_diameter_mm" in concepts
    assert "histologic_diagnosis" in concepts
    assert "lymph_node_involvement" in concepts
    assert "disease_laterality" in concepts

    # Check size normalization: 4.6 cm -> 46.0 mm
    size_obs = [o for o in obs if o["concept"] == "tumor_largest_diameter_mm"][0]
    assert size_obs["normalized_value"] == 46.0
    assert size_obs["unit"] == "mm"

    # Check nodal status is negative
    ln_obs = [o for o in obs if o["concept"] == "lymph_node_involvement"][0]
    assert ln_obs["normalized_value"] == "negative"


def test_biomarker_extraction_with_er_low():
    """Tests extraction of ER-low (1-10%), PR, and HER2 from pathology synoptic text."""
    path_text = "Pathology summary: Estrogen receptor is low positive (6%). Progesterone receptor is negative. HER2/neu is 2+ equivocal."
    obs = ClinicalRuleExtractor.extract_from_text(path_text, report_id="TCGA_PATH_001")

    er_obs = [o for o in obs if o["concept"] == "er_status"][0]
    assert er_obs["normalized_value"] == "er_low"

    pr_obs = [o for o in obs if o["concept"] == "pr_status"][0]
    assert pr_obs["normalized_value"] == "negative"

    her2_obs = [o for o in obs if o["concept"] == "her2_status"][0]
    assert her2_obs["normalized_value"] == "equivocal"
    assert her2_obs["status"] == "equivocal"


def test_evaluation_harness_metrics():
    """Tests Precision, Recall, and F1 computation on sample predictions."""
    ground_truth = [
        {"provenance": {"source_record_id": "P1"}, "concept": "er_status", "normalized_value": "positive"},
        {"provenance": {"source_record_id": "P1"}, "concept": "pr_status", "normalized_value": "positive"},
        {"provenance": {"source_record_id": "P2"}, "concept": "her2_status", "normalized_value": "negative"},
    ]
    predictions = [
        {"provenance": {"source_record_id": "P1"}, "concept": "er_status", "normalized_value": "positive"},
        {"provenance": {"source_record_id": "P1"}, "concept": "pr_status", "normalized_value": "positive"},
        {"provenance": {"source_record_id": "P2"}, "concept": "her2_status", "normalized_value": "negative"},
    ]
    metrics = NLPEvaluationHarness.evaluate_predictions(ground_truth, predictions)
    assert metrics["overall"]["precision"] == 1.0
    assert metrics["overall"]["recall"] == 1.0
    assert metrics["overall"]["f1_score"] == 1.0


def test_bio_clinicalbert_finetuned_extractor():
    """Verifies that BioClinicalBERTExtractor loads fine-tuned weights and classifies clinical text."""
    from src.nlp.bio_clinicalbert_extractor import BioClinicalBERTExtractor

    extractor = BioClinicalBERTExtractor(load_weights=True)
    assert extractor.is_initialized is True
    assert extractor.is_finetuned is True

    test_text = (
        "FINAL PATHOLOGY: Invasive ductal carcinoma of the right breast, Nottingham grade 3. "
        "Estrogen receptor: positive (95%). HER2/neu: negative (1+)."
    )
    obs = extractor.extract_from_text(test_text, report_id="TEST_CASE_BRCA")
    assert len(obs) > 0

    # Ensure fine-tuned method is recorded
    for o in obs:
        assert o["extraction"]["method"] == "nlp_bio_clinicalbert_finetuned"
        assert o["extraction"]["confidence"] >= 0.50

    # Check that ER is recognized as positive
    er_items = [o for o in obs if o["concept"] == "er_status"]
    assert len(er_items) > 0
    assert er_items[0]["normalized_value"] == "positive"
    assert er_items[0]["extra_metadata"]["bio_clinicalbert_class"] == "ER_POSITIVE"
