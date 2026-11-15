# Data Loading Specification — Ingestion Pipelines

## 1. Overview
The CDSS ingestion pipeline consists of four modular loaders in `src/ingestion/`. Each loader enforces deterministic transformation, schema validation, source-level provenance, and strict clinical temporal phase separation.

---

## 2. Loader Specifications

### 2.1 `TCIABreastDiagnosisLoader`
- **File**: `TCIA-Breast-clinical-data-public-7_16_11 (1).xlsx`
- **Source Layout**: Transposed 15 row × 53 column matrix.
- **Transformation**:
  - Drops metadata labels in columns 0 and 1.
  - Pivots 51 individual patient columns (`BreastDX-01-0001` to `BreastDX-01-0074`) into patient rows.
  - Maps rows 1–11 into structured pathology observations (ER, PR, HER2, Grade, E-Cadherin, Ki-67, Oncotype, Age decade, Biopsy notes).
  - Maps row 14 into narrative MRI impression observations.
- **Output Record Count**: 51 patient records, 100% schema validated.

### 2.2 `ISPY1Loader`
- **File**: `I-SPY-1-All-Patient-Clinical-and-Outcome-Data.xlsx`
- **Sheets Ingested**:
  - `TCIA Patient Clinical Subset`: 221 patients.
  - `TCIA Outcomes Subset`: 221 patients.
- **Temporal Tagging**:
  - `baseline`: Demographics (`age`), `Laterality`, `ERpos`, `PgRpos`, `Her2MostPos`, `MRI LD Baseline`.
  - `during_treatment_early_ac`: `MRI LD 1-3dAC`.
  - `during_treatment_inter_regimen`: `MRI LD InterReg`.
  - `pre_surgical_resection`: `MRI LD PreSurg`.
  - `outcome`: `PCR`, `RCBClass`, `RFS` (strictly excluded from baseline patient profiles to prevent data leakage).

### 2.3 `BreastPathQLoader`
- **File**: `FINAL-BreastPathQ_TrainTest_Clinical_Features.xlsx`
- **Sheet Ingested**: `Clinical Features` (96 rows, 54 unique patients).
- **Transformation**:
  - Strips whitespace and quote artifacts from column headers.
  - Resolves 1-to-many patient-to-scan mapping (54 patients across 96 scans).
  - Normalizes compound/multi-focal tumor size expressions (e.g., `'4.5,1'` → `{ "max_dimension_mm": 4.5, "all_foci_mm": [4.5, 1.0] }`).
  - Tags resection biomarkers with `timepoint: "post_treatment_resection"`.

### 2.4 `TCGABRCALoader`
- **File**: `TCGA_Reports.csv` (9,523 total multi-cancer reports).
- **Filtering Methodology**:
  - Standard GDC/TCGA Tissue Source Site (TSS) codes for Breast Invasive Carcinoma (BRCA): 39 verified TSS codes (`3C`, `4H`, `5L`, `5T`, `A1`, `A2`, `A7`, `A8`, `AC`, `AN`, `AO`, `AQ`, `AR`, `B6`, `BH`, `C8`, `D8`, `E2`, `E9`, `EW`, `GI`, `GM`, `HN`, `JL`, `LD`, `LL`, `MS`, `OK`, `OL`, `PE`, `PL`, `S3`, `UL`, `UU`, `V7`, `W8`, `WT`, `XX`, `Z7`) matching 1,033 reports.
  - Specimen verification: Patient `TCGA-MB-A8JL` (documented breast specimens in SARC cohort) matching 1 report.
  - Filtered Total: Exactly 1,034 TCGA-BRCA reports.
- **Output**: 1,034 validated narrative pathology reports preserved with original identifiers.

