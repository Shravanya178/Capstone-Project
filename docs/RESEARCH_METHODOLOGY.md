# Research Methodology & Strict Scientific Constraints

## 1. Core Principles

All software design, clinical data engineering, and NLP implementation in this system must strictly adhere to the following mandatory research principles.

---

## 2. Principle 1: Raw Data Inviolability & Reproducibility

1. **Source Preservation**: Raw dataset files must never be modified, renamed, moved, or overwritten in place.
2. **Directory Partitioning**:
   - `data/raw/`: Untouched raw source files (or read-only pointers to secure local data stores).
   - `data/interim/`: Intermediate transformed or staged extracts.
   - `data/processed/`: Normalized canonical patient profiles and parsed observation collections.
   - `data/sample/`: Small, de-identified mock data fixtures for unit tests.
3. **Reproducibility**: Preprocessing transformations must be deterministic, version-controlled, and executable via automated pipelines.

---

## 3. Principle 2: No Artificial Patient Merging Across Cohorts

1. **Distinct Study Cohorts**:
   - `TCIA_BREAST_DIAGNOSIS`
   - `ISPY1_ACRIN6657`
   - `BREASTPATHQ`
   - `TCGA_BRCA`
   These represent completely independent clinical study populations, protocols, and institutions.
2. **Prohibition of Feature-Based Merging**: Patients from different datasets must **never** be merged or conflated based on similar age, histology, stage, or biomarker profile.
3. **Explicit Identifier Preservation**: Every canonical patient profile must retain both its `source_dataset` and original `source_patient_id`.

---

## 4. Principle 3: Explicit Missing Data Handling

1. **Missing Is Not Normal**: Missing clinical information must **never** be silently interpreted as normal, negative, absent, or zero.
   - *Example*: A missing HER2 test result must never be labeled as "HER2-negative".
   - *Example*: A missing lymph node field must never be assumed as "node-negative".
2. **Standardized Observation Status Values**:
   - `documented`: The observation is explicitly recorded with a clinical value.
   - `not_reported`: The clinical document or dataset form did not report this parameter.
   - `not_assessed`: The test or examination was explicitly noted as not performed.
   - `not_available`: Data source indicates the record is unavailable or pending.
   - `unknown`: Clinical record explicitly states status is unknown.
   - `equivocal`: The laboratory or imaging test produced an equivocal/borderline result.
   - `conflicting`: Multiple conflicting values exist across reports for the same observation.
   - `not_applicable`: Clinical context makes the parameter inapplicable (e.g., resection margin in non-surgical patient).

---

## 5. Principle 4: End-to-End Provenance & Traceability

Every extracted clinical observation must maintain full provenance back to its origin:
- `source_dataset`: Identifying dataset name.
- `source_file`: Specific filename or DICOM SOP Instance UID.
- `source_record_id`: Patient or scan identifier in the source.
- `source_field_path`: Specific table column, JSON/DICOM sequence path, or document section.
- `raw_value`: Exact string or number as it appeared in the raw data.
- `normalized_value`: Standardized clinical value.
- `unit`: Clinical measurement unit (e.g., `mm`, `%`, `score`), or `null`.
- `timepoint`: Clinical phase when observation occurred.
- `extraction_method`: (`structured_parser`, `dicom_sr_parser`, `nlp_bio_clinicalbert`, `rule_regex`).
- `extraction_confidence`: Numerical confidence score for NLP models, or `null` for deterministic parsing.

---

## 6. Principle 5: Temporal & Phase Segregation

Clinical observations must strictly preserve the clinical timepoint:
- `baseline`: Diagnostic biopsy, initial staging, pre-treatment baseline.
- `pre_treatment`: Imaging or labs immediately prior to initiating a specific therapy.
- `during_treatment`: Longitudinal measurements during neoadjuvant chemotherapy (e.g., I-SPY-1 1-3dAC, InterReg).
- `post_treatment_resection`: Surgical pathology post-neoadjuvant therapy (e.g., BreastPathQ resection features).
- `outcome`: Post-treatment efficacy endpoints (pCR, RCB class, recurrence-free survival, overall survival).

> [!CAUTION]
> **Prohibition of Data Leakage**:
> Outcome variables (`pCR`, `RCBClass`, `sstat`, `RFS`) and post-resection residual tumor measurements must **never** be injected as baseline inputs to clinical decision checks.

---

## 7. Principle 6: Standardized Biomarker & Staging Interpretation

### Estrogen & Progesterone Receptors (ER / PR)
- Interpreted according to ASCO/CAP guidelines:
  - **Positive**: $\ge 1\%$ positive nuclear staining.
  - **ER-Low Positive**: $1\% - 10\%$ positive staining. Must retain explicit `er_low` flag and exact percentage.
  - **Negative**: $< 1\%$ or explicit "negative" report.
  - **Equivocal / Indeterminate**: Technical failure, uninterpretable.

### HER2 Status
- Determined via dual-modality ASCO/CAP algorithm:
  - **IHC 0 or 1+**: HER2 Negative.
  - **IHC 2+**: **Equivocal**. Requires confirmatory In Situ Hybridization (ISH / FISH). Must **not** be resolved without verified ISH data.
  - **IHC 3+**: HER2 Positive.
  - **ISH Positive**: $HER2/CEP17 \text{ ratio} \ge 2.0$ or average $HER2 \text{ copy number} \ge 6.0$.
  - Missing HER2 or missing ISH when IHC is 2+ must yield `equivocal` or `insufficient_information`.

### Intrinsic Molecular Subtypes
- Subtypes must only be derived when required underlying biomarkers are documented:
  - **Luminal A-like**: ER positive, PR high ($\ge 20\%$), HER2 negative, Ki-67 low ($< 14\%$).
  - **Luminal B-like (HER2-)**: ER positive, HER2 negative, and either Ki-67 high ($\ge 14\%$) or PR low/negative.
  - **Luminal B-like (HER2+)**: ER positive, HER2 positive (any PR or Ki-67).
  - **HER2-Enriched**: ER negative, PR negative, HER2 positive.
  - **Triple-Negative (TNBC)**: ER negative, PR negative, HER2 negative.
  - If Ki-67 or PR is missing for ER+/HER2- cases, the profile must state subtype as `Luminal_unspecified` rather than guessing Luminal A vs B.

### Disease Extent & TNM Staging
- Distinguish clinical staging (`cTNM`) from pathologic staging (`pTNM`).
- Never impute missing T, N, or M components.

---

## 8. Principle 7: DICOM SR vs. Narrative NLP Specialization

- **DICOM SR** contains explicit, coded information sequences (`DCM:121058` Procedure reported, `DCM:121071` Finding, etc.). These must be parsed recursively and deterministically using `pydicom`. Language models must **not** be used to reinterpret already-coded DICOM SR values.
- **Bio_ClinicalBERT** is dedicated to unstructured narrative pathology text (TCGA and clinical summary notes), where syntactic and contextual understanding of negation, uncertainty, and semantic entities is required.
- **Rule Baseline Comparison**: Every Bio_ClinicalBERT narrative extraction task must be compared against a deterministic rule/regex baseline, reporting Precision, Recall, and F1 scores.

---

## 9. Principle 8: Deterministic, Traceable Guideline Engine

- Guideline checks must be executed by a version-controlled, deterministic rule engine.
- Rules must specify:
  - `rule_id`: Unique identifier (e.g., `ISMPO-BC-2023-EBC-001`).
  - `guideline_source`: Source institution, publication year, section/page.
  - `clinical_conditions`: Explicit Boolean logic over canonical patient profile observations.
  - `result_status`: `applicable`, `not_applicable`, `insufficient_information`, `requires_clinician_review`, `conflicting_information`.
  - `explanation`: Transparent narrative detailing why the rule fired and listing supporting evidence.
- No arbitrary numeric risk weights or synthetic scorings are permitted.
