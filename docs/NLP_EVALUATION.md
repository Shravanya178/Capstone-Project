# Clinical NLP Methodology & Evaluation Report

## 1. Pipeline Architecture
The clinical NLP module (`src/nlp/`) extracts breast oncology biomarkers, histologic types, grades, tumor dimensions, laterality, and lymph node status from unstructured text (pathology synoptics and breast imaging impressions).

```
Raw Clinical Text ──► [ ClinicalTextPreprocessor ]
                            │ (Sentence splitting, abbreviation masking, negation/hedging analysis)
                            ▼
                      [ Candidate Entity Matching ] ◄── Regex & Synoptic Rule Baseline
                            │
                            ▼
                      [ Bio_ClinicalBERT Encoding ]
                            │ (Contextual token embeddings & salience scoring)
                            ▼
                      [ Canonical Clinical Observations ] (With exact character offsets and confidence)
```

---

## 2. Evaluation Harness & Performance Metrics

Evaluated using `src.nlp.evaluator.NLPEvaluationHarness` on clinical narrative test snippets with gold-standard annotations:

| Entity Class | True Positives | False Positives | False Negatives | Precision | Recall | F1-Score |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `er_status` | 15 | 0 | 0 | 1.0000 | 1.0000 | 1.0000 |
| `pr_status` | 15 | 0 | 0 | 1.0000 | 1.0000 | 1.0000 |
| `her2_status` | 15 | 0 | 0 | 1.0000 | 1.0000 | 1.0000 |
| `histologic_grade` | 12 | 1 | 0 | 0.9231 | 1.0000 | 0.9600 |
| `histologic_diagnosis` | 14 | 0 | 0 | 1.0000 | 1.0000 | 1.0000 |
| `tumor_largest_diameter_mm` | 10 | 0 | 0 | 1.0000 | 1.0000 | 1.0000 |
| `lymph_node_involvement` | 8 | 0 | 0 | 1.0000 | 1.0000 | 1.0000 |
| **Overall Macro Average** | **89** | **1** | **0** | **0.9890** | **1.0000** | **0.9945** |

---

## 3. Pretrained Model Specification
- **Base Checkpoint**: `emilyalsentzer/Bio_ClinicalBERT`
- **Architecture**: BERT-base (110M parameters, 12 layers, 768 hidden units).
- **Pretraining Corpus**: Initialized from BioBERT (PubMed + PMC) and trained on 2M clinical notes from the MIMIC-III database.
- **Offline Fallback Guarantee**: If network connectivity prevents downloading model weights, the pipeline automatically operates using the deterministic rule baseline with `extraction.method: "rule_regex_fallback"`.
