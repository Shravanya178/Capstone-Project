# Clinical NLP Methodology & Evaluation Report

## 1. Pipeline Architecture
The clinical NLP module (`src/nlp/`) extracts breast oncology biomarkers, histologic types, Nottingham grades, tumor dimensions, laterality, and lymph node status from unstructured text (pathology synoptics and breast imaging impressions).

```
Raw Clinical Text ──► [ ClinicalTextPreprocessor ]
                            │ (Sentence splitting, abbreviation masking, clausal negation/hedging scoping)
                            ▼
                      [ Candidate Entity Matching ] ◄── Character Span Rule Baseline
                            │
                            ▼
                      [ Bio_ClinicalBERT Supervised Classifier ]
                            │ (Fine-tuned sequence classification head on MIMIC-III + TCGA/TCIA BRCA)
                            ▼
                      [ Canonical Clinical Observations ] (With exact character offsets and posterior confidence)
```

---

## 2. Supervised Bio_ClinicalBERT Fine-Tuning Specification

- **Base Checkpoint**: `emilyalsentzer/Bio_ClinicalBERT`
- **Architecture**: BERT-base (12 layers, 768 hidden dimensions, 12 attention heads, 110M parameters).
- **Domain Specialization**: Initialized from BioBERT and MIMIC-III notes, then fine-tuned on real breast oncology clinical observations.
- **Training Strategy**: Transfer learning with frozen lower layers (embeddings and layers 0–8 frozen; top layers 9–11 and classification head trained).
- **Dataset Scale**:
  - Total labeled clinical observations: **3,492**
  - Unique clinical patients: **920**
  - Cohort Split: **80% Train (2,740 observations, 736 patients) / 10% Validation (345 observations, 92 patients) / 10% Held-Out Test (407 observations, 92 patients)**.
  - Zero patient leakage guaranteed by strict patient-level partitioning.
- **Hyperparameters**:
  - Optimizer: AdamW ($\text{lr} = 3 \times 10^{-5}$, weight decay $= 0.01$, gradient clip $= 1.0$)
  - Batch Size: 16
  - Sequence Length: 64 tokens
  - Epochs: 3
  - Warmup: Linear warmup over first 10% of training steps

### Training & Validation Loss Progression

| Epoch | Training Loss | Validation Loss | Validation Accuracy | Validation Macro F1 | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | 1.1275 | 0.3324 | 92.75% | 0.5822 | Checkpoint Saved |
| **2** | 0.1865 | 0.0801 | 97.97% | 0.7665 | Checkpoint Saved |
| **3** | 0.0828 | 0.0549 | 99.13% | 0.8741 | Best Checkpoint Selected |

---

## 3. Held-Out Test Cohort Evaluation Benchmark

Evaluated on the 407 held-out test observations (representing 92 unique patients completely unseen during training):

### Overall Macro Metrics
- **Overall Accuracy**: **99.75%** (406 / 407 correct predictions)
- **Weighted Macro Precision**: **0.9976**
- **Weighted Macro Recall**: **0.9975**
- **Weighted Macro F1-Score**: **0.9973**
- **Unweighted Macro F1-Score**: **0.9784**

### Per-Class Detailed Performance

| Clinical Target Class | Class ID | Test Support | Precision | Recall | F1-Score | Clinical Interpretation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ER_POSITIVE` | 0 | 19 | 1.0000 | 1.0000 | **1.0000** | ASCO/CAP positive ($\ge 1\%$) |
| `ER_NEGATIVE` | 1 | 15 | 1.0000 | 1.0000 | **1.0000** | ASCO/CAP negative ($< 1\%$) |
| `HER2_POSITIVE` | 3 | 4 | 1.0000 | 1.0000 | **1.0000** | IHC 3+ / FISH amplified |
| `HER2_NEGATIVE` | 4 | 30 | 0.9677 | 1.0000 | **0.9836** | IHC 0/1+ / FISH non-amplified |
| `HER2_EQUIVOCAL` | 5 | 3 | 1.0000 | 0.6667 | **0.8000** | IHC 2+ requiring reflex ISH |
| `GRADE_1` | 6 | 19 | 1.0000 | 1.0000 | **1.0000** | Nottingham Grade 1 / Well-diff |
| `GRADE_2` | 7 | 70 | 1.0000 | 1.0000 | **1.0000** | Nottingham Grade 2 / Mod-diff |
| `GRADE_3` | 8 | 59 | 1.0000 | 1.0000 | **1.0000** | Nottingham Grade 3 / Poorly-diff |
| `HISTOLOGY_IDC` | 9 | 151 | 1.0000 | 1.0000 | **1.0000** | Invasive ductal carcinoma |
| `HISTOLOGY_ILC` | 10 | 37 | 1.0000 | 1.0000 | **1.0000** | Invasive lobular carcinoma |
| **Total / Summary** | — | **407** | **0.9976** | **0.9975** | **0.9973** | **Evaluated on Held-Out Split** |

---

## 4. Offline Fallback & Deployment Guarantee

- **Primary Mode**: Fine-tuned Bio_ClinicalBERT loaded from `models_cache/bio_clinicalbert_brca`. Tags observation with `extraction.method: "nlp_bio_clinicalbert_finetuned"`.
- **Secondary Mode**: Pretrained base model loaded from `D:\hf_cache`. Tags observation with `extraction.method: "nlp_bio_clinicalbert"`.
- **Offline / Isolated Fallback**: If transformer weights are inaccessible, the pipeline falls back to deterministic rule-based span extraction with `extraction.method: "rule_regex_fallback"`. Zero crashes on missing weights.
