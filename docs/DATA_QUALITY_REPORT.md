# Data Quality & Ingestion Audit Report

## 1. Summary of Ingested Cohorts

| Dataset Identifier | Raw Records | Processed Units | Unique Patients | Validation Status |
| :--- | :--- | :--- | :--- | :--- |
| **TCIA Breast Diagnosis** | 15 rows × 53 cols | 51 patient rows | 51 | Passed (100%) |
| **I-SPY-1 Clinical Subset** | 221 rows × 16 cols | 221 patient rows | 221 | Passed (100%) |
| **I-SPY-1 Outcomes Subset** | 221 rows × 8 cols | 221 patient rows | 221 | Passed (100%) |
| **BreastPathQ Challenge** | 96 rows × 27 cols | 96 scan rows | 54 | Passed (100%) |
| **TCGA-BRCA Pathology** | 9,523 multi-cancer | 1,034 breast reports | 1,018 | Passed (100%) |

---

## 2. Quality Assertion Results

1. **Patient Identifier Integrity**:
   - Zero null or missing primary keys across all loaders.
   - Clean whitespace stripping prevents subtle join or lookup failures.

2. **Temporal Phase Segregation**:
   - Out of 221 I-SPY-1 outcomes, zero leaked into baseline profiles.
   - All 96 BreastPathQ resection measurements explicitly assigned `timepoint: "post_treatment_resection"`.

3. **Compound Value Normalization**:
   - Multi-focal tumor size measurements in BreastPathQ (e.g. `'4.5,1'`, `'14, 2.5'`) safely parsed into structured representations preserving both individual foci and maximal dimension.
   - Inequality expressions (e.g., `'<1'`) handled without unhandled exception.

4. **Schema Adherence**:
   - 100% of generated sample `clinical_observation` objects validate against `schemas/clinical_observation.schema.json` under JSON Schema Draft 2020-12.

