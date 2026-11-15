# Dataset Inventory & Comprehensive Audit Report

## 1. Overview of Evaluated Materials

The workspace environment was inspected on 2026-11-15. Five primary data collections and multiple reference files were audited. This document records verified factual attributes, schemas, record counts, patient identifiers, data distributions, and known limitations.

---

## 2. Dataset Audits

### Dataset A: TCIA BREAST-DIAGNOSIS (Clinical Summary & DICOM SR)

- **Source / Collection**: The Cancer Imaging Archive (TCIA) — Breast-Diagnosis collection.
- **Intended Purpose**: Primary structured clinical summary and DICOM Structured Report (SR) extraction; validation of parsed imaging observations against clinical records.
- **Components Found**:
  1. **Clinical Summary Workbook**:
     - **File Path**: `D:\FINAL PROJECT\TCIA-Breast-clinical-data-public-7_16_11 (1).xlsx`
     - **Format**: Microsoft Excel (.xlsx)
     - **Sheet Name**: `Sheet1`
     - **Shape**: 15 rows × 53 columns
     - **Layout Structure**: **Transposed Matrix**. Row labels are in column 0 (`Breast Dx Case`) and column 1 (`Unnamed: 1`). Columns 2 through 52 represent 51 individual patient cases (`BreastDX-01-0001` through `BreastDX-01-0074` with non-contiguous gaps).
     - **Verified Fields (Rows)**:
       - Row 0: `Background` (Metadata)
       - Row 1: `Dx` (Histologic diagnosis, e.g., "infiltrat lobular", "Invasive ductal CA", "benign fibrosis")
       - Row 2: `Which breast` (Laterality: L, R, Bilateral)
       - Row 3: `ER` (Estrogen Receptor text: pos, neg, nan)
       - Row 4: `PR` (Progesterone Receptor text: pos, neg (stain moderate), pos (weak), nan)
       - Row 5: `HER2` (HER2 Receptor text: pos, neg, nan)
       - Row 6: `E-Cadherin` (pos, neg, nan)
       - Row 7: `Ki67` (high prolif, intermed prolif, nan)
       - Row 8: `Oncotype score` (numerical score or nan)
       - Row 9: `Oncotype risk` (low, intermed, high, nan)
       - Row 10: `Age decade` (e.g., 40, 50, nan)
       - Row 11: `Notes` (Free-text surgical / biopsy notes, e.g., "re-bx single 1cm residual CA focus")
       - Row 12: `Which breast?` (MRI report laterality)
       - Row 13: `BIRAD` (BI-RADS assessment score, e.g., 6)
       - Row 14: `Impression` (Full narrative MRI report impression detailing lesion dimensions, enhancement dynamics, clip placement, lymphadenopathy assessment)
     - **Total Unique Patients**: 51 unique patient identifiers.
  2. **DICOM Structured Report (SR) Collection**:
     - **File Directory**: `D:\DATASET CAPSTONE\breast_diagnosis\breast_diagnosis\`
     - **Format**: DICOM Part 10 files (`.dcm`)
     - **File Count**: Exactly 94 `.dcm` files.
     - **Unique Patient Directories**: 50 unique patient folders (`BreastDx-01-0001` through `BreastDx-01-0073`).
     - **SOP Class UID Verified**: `1.2.840.10008.5.1.4.1.1.88.33` (Comprehensive SR Storage).
     - **Modality**: `SR`.
     - **Content**: Hierarchical DICOM Content Sequence (`(0040,A730)`) containing Breast Imaging Report templates (TID 4200 / TID 1400), coded lesion findings, BI-RADS categories, and spatial coordinates.
- **Limitations & Integrity Notes**:
  - The Excel sheet is transposed and requires programmatic restructuring into a standard patient-row schema.
  - Biomarker values are raw informal strings (e.g., "pos", "neg (stain moderate)") requiring clinical vocabulary normalization.
  - Patient 0074 is in the Excel file but no corresponding DICOM SR directory was present in the audited folder; conversely, 50 patients have SR files. Linkage must be validated per patient.

---

### Dataset B: I-SPY-1 TRIAL (ACRIN 6657 / CALGB 150007)

- **Source / Collection**: The Cancer Imaging Archive (TCIA) — I-SPY-1 / ACRIN 6657 Trial.
- **File Path**: `D:\FINAL PROJECT\I-SPY-1-All-Patient-Clinical-and-Outcome-Data.xlsx`
- **Format**: Microsoft Excel (.xlsx)
- **Sheet Architecture**: 4 sheets verified:
  1. `Clinical Data Dictionary`: 69 rows × 4 columns. Field definitions, encoding rules, clinical units.
  2. `TCIA Patient Clinical Subset`: 221 rows × 16 columns.
     - **Total Unique Patients**: 221 unique `SUBJECTID` values (IDs 1001 to 1233).
     - **Key Columns & Null Counts**:
       - `SUBJECTID`: 0 nulls (Primary Key).
       - `DataExtractDt`: 0 nulls (Extract date).
       - `age`: 0 nulls (Range 23–77 years).
       - `race_id`: 0 nulls (Categorical race indicator).
       - `ERpos`: 2 nulls (125 positive, 94 negative, 2 unrecorded).
       - `PgRpos`: 2 nulls (Progesterone receptor status).
       - `HR Pos`: 2 nulls (Combined Hormone Receptor positive status).
       - `Her2MostPos`: 5 nulls (HER2 definitive status).
       - `HR_HER2_CATEGORY`: 5 nulls (Subtype category codes 1–4).
       - `HR_HER2_STATUS`: 5 nulls (HRposHER2neg: 96, HER2pos: 67, TripleNeg: 53, NaN: 5).
       - `BilateralCa`: 0 nulls (Indicator for bilateral breast cancer).
       - `Laterality`: 0 nulls (1=Right, 2=Left, 3=Bilateral).
       - `MRI LD Baseline`: 2 nulls (Baseline largest diameter in mm).
       - `MRI LD 1-3dAC`: 11 nulls (Early response after 1–3 days of doxorubicin/cyclophosphamide).
       - `MRI LD InterReg`: 19 nulls (Inter-regimen measurement before taxane).
       - `MRI LD PreSurg`: 13 nulls (Pre-surgical largest diameter measurement).
  3. `Outcome Data Dictionary`: 32 rows × 4 columns. Outcome variable definitions.
  4. `TCIA Outcomes Subset`: 221 rows × 8 columns.
     - **Columns**: `SUBJECTID`, `DataExtractDt`, `sstat` (survival status), `survDtD2 (tx)` (survival days), `RFS` (recurrence-free survival days), `rfs_ind` (RFS event indicator), `PCR` (Pathologic Complete Response: 0=No, 1=Yes; 6 nulls), `RCBClass` (Residual Cancer Burden class 0–3; 20 nulls).
- **Critical Methodological Guardrails**:
  - `TCIA Outcomes Subset` contains post-treatment response endpoints (`PCR`, `RCBClass`, `RFS`). Under no circumstances may outcome variables be ingested as baseline clinical inputs.
  - Longitudinal measurements (`MRI LD Baseline`, `1-3dAC`, `InterReg`, `PreSurg`) represent distinct clinical timepoints and must not be flattened into a single timeless value.

---

### Dataset C: BreastPathQ

- **Source / Collection**: BreastPathQ Challenge (SPIE-AAPM-NCI) — Quantitative Assessment of Residual Cancer Burden.
- **File Path**: `D:\FINAL PROJECT\FINAL-BreastPathQ_TrainTest_Clinical_Features.xlsx`
- **Format**: Microsoft Excel (.xlsx)
- **Sheets Verified**:
  1. `Clinical Features`: 96 rows × 27 columns.
     - **Header Note**: Columns have trailing whitespace: `'patient ID '`, `'scan ID '`.
     - **Total Records**: 96 scan records.
     - **Total Unique Patients**: **54 unique patients** (`patient ID ` values 1 through 66 with gaps).
     - **Total Unique Scans**: 96 unique scan identifiers (`scan ID ` values).
     - **Features & Null Distribution**:
       - `patient ID `: 96 non-null (54 unique).
       - `scan ID `: 96 non-null.
       - `Age @ diagnosis`: 96 non-null.
       - `Menopausal status`: 91 non-null (5 null).
       - `Chemo-NAT`: 94 non-null (Neoadjuvant chemotherapy indicator).
       - `AntiHER2-NAT`: 92 non-null (Neoadjuvant anti-HER2 therapy).
       - `RAD-NAT`: 92 non-null (Neoadjuvant radiation).
       - `Endocrine-NAT`: 92 non-null (Neoadjuvant endocrine therapy).
       - `Type of breast surgery`: 57 non-null (1=Lumpectomy, 2=Mastectomy).
       - `Type ofaxillary LN surgery`: 57 non-null.
       - `Histological type (resection)`: 58 non-null.
       - `Histology Grade (resection)`: 58 non-null.
       - `Number of foci`: 58 non-null.
       - `ER (resection)`: 54 non-null.
       - `PR (resection)`: 53 non-null.
       - `HER IHC (resection)`: 54 non-null.
       - `HER-2 FISH`: 15 non-null.
       - `Residual tumor size (mm)`: 58 non-null.
       - `LVI`: 54 non-null (Lymphovascular invasion).
       - `DCIS(/LCIS(%)`: 58 non-null.
       - `No of LN tested`: 96 non-null.
       - `LN involved`: 96 non-null.
       - `LN with regression`: 96 non-null.
       - `Response in BC `: 56 non-null.
       - `Overall Cellularity`: 55 non-null.
       - `Size of Tumor Bed (mm)`: 51 non-null.
       - `Cell Annotations (Y/N)`: 96 non-null.
  2. `Definitions`: 15 rows × 2 columns. Dictionary decoding numeric categorical levels.
- **Critical Methodological Guardrails**:
  - The dataset has 96 rows for 54 patients; multiple rows share the same patient ID representing different resection specimens / scans. **Rows must never be treated as independent patients.**
  - Resection pathology features (`ER (resection)`, `Residual tumor size`, etc.) represent post-neoadjuvant surgical specimens, not baseline diagnostic biopsies.

---

### Dataset D: TCGA Pathology Reports

- **Source / Collection**: The Cancer Genome Atlas (TCGA) Pathology Reports Corpus.
- **File Paths**:
  - In workspace: `D:\FINAL PROJECT\TCGA_Reports.csv` (35,465,045 bytes).
  - Source archive on D:\: `D:\tcga-path-reports-main.zip` and `D:\tcga-path-reports-main\tcga-path-reports-main\TCGA_Reports.csv.zip`.
  - Cancer type ground truth: `D:\tcga-path-reports-main\tcga-path-reports-main\data\tcga_metadata\tcga_patient_to_cancer_type.csv`.
- **Format**: CSV text file.
- **Total Records**: Exactly **9,523 reports**.
- **Columns**: `patient_filename`, `text`.
- **Audit & Cohort Verification**:
  - `TCGA_Reports.csv` spans **32 distinct cancer types**.
  - Cross-referencing against verified metadata in `tcga_patient_to_cancer_type.csv` confirms:
    - **TCGA-BRCA (Breast Invasive Carcinoma)**: Exactly **1,034 reports** (1,034 unique patient identifiers).
    - Other cancer types (8,489 reports total): UCEC (546), KIRC (525), HNSC (520), LUAD (488), THCA (487), LGG (469), LUSC (468), PRAD (446), COAD (418), GBM (399), BLCA (379), OV (371), STAD (361), LIHC (341), CESC (289), KIRP (280), SARC (249), PAAD (176), PCPG (174), READ (162), ESCA (146), THYM (114), KICH (112), SKCM (102), ACC (90), TGCT (87), MESO (79), UVM (65), UCS (56), DLBC (47), CHOL (43).
    - Every single report in `TCGA_Reports.csv` maps unambiguously to a cancer type (0 missing linkages).
- **Purpose in CDSS**:
  - Ingestion and preprocessing of unstructured surgical pathology narratives.
  - Evaluation of Bio_ClinicalBERT vs. rule-based baseline extraction for ER, PR, HER2, histologic grade, and histologic subtype.
- **Guardrails**:
  - Keyword search alone must NOT be used for cohort selection. Only the verified 1,034 BRCA subset is in scope for breast CDSS evaluation.

---

### Dataset E: BreastDCEDL Data Dictionary

- **Source / Collection**: Breast Dynamic Contrast-Enhanced Deep Learning (DCE-DL) / I-SPY-2 Study.
- **File Path**: `D:\BreastDCEDL_DataDictionary.tsv`
- **Format**: Tab-Separated Values (.tsv).
- **Shape**: 49 rows × 4 columns (`Column`, `Description`, `Type`, `Values`).
- **Nature**: Reference data dictionary defining 49 clinical, imaging, and genomic parameters (e.g., MammaPrint `MP`, pCR, targeted therapy indicators including Veliparib, Trebananib, Pembrolizumab, Pertuzumab, T-DM1).
- **Audit Finding**: Contains **no patient records**. Serves exclusively as a semantic mapping and variable definition resource.

---

### Dataset F: ACRIN-FLT-Breast (ACRIN 6688) & ISPY1 DICOM Pixel Data

- **Paths Audited**:
  - `D:\DATASET CAPSTONE\acrin_flt_breast\` and `D:\acrin_flt_breast\`
  - `D:\ispy1\`
- **Contents**:
  - `acrin_flt_breast`: DICOM Positron Emission Tomography (`PT_...`) and Computed Tomography (`CT_...`) image slice files.
  - `ispy1`: DICOM Magnetic Resonance (`MR_...`) and Segmentation (`SEG_...`) image slice files.
- **Audit Finding & Scope Verification**:
  - No DICOM SR files exist in these folders.
  - As defined in Section 2 of Project Context, **pixel-level DICOM processing is strictly out of scope**.
  - These folders will NOT be ingested into the CDSS report engine.

---

## 3. Materials Status & Gap Analysis

| Dataset / Material | Expected Role | Status in Environment | Verified Facts / Gaps |
| :--- | :--- | :--- | :--- |
| **TCIA Breast-Dx Excel** | Clinical Summary & Pathology | **Present & Verified** | 15 rows × 53 cols (51 patients), transposed matrix format. |
| **TCIA Breast-Dx DICOM SR** | Structured Report Parsing | **Present & Verified** | 94 `.dcm` files across 50 patients; SOP Class UID verified. |
| **I-SPY-1 / ACRIN 6657** | Clinical Baseline & Outcomes | **Present & Verified** | 221 patients; 4 sheets; strict baseline/outcome separation confirmed. |
| **BreastPathQ** | Resection Pathology | **Present & Verified** | 96 scans across 54 unique patients; post-NAT resection data confirmed. |
| **TCGA Pathology Reports** | Narrative NLP Pipeline | **Present & Verified** | 9,523 total reports; exactly 1,034 BRCA verified via TCGA metadata. |
| **BreastDCEDL Dictionary** | Variable Reference | **Present & Verified** | 49 field definitions (reference only, no patient rows). |
| **ACRIN 6688 Clinical Forms** | Comorbidity / Lab Forms | **Missing / Not Uploaded** | Only DICOM PET/CT images found. Clinical CSV forms (E3, BA, CJ, etc.) not on disk. |
| **ISMPO Guideline Document** | Evidence Rules Base | **Missing / Not Uploaded** | Guideline PDF not in workspace. Framework built to accept standard schema. |
