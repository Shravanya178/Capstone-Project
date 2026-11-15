# Known Limitations, Missing Materials & Risk Assessment

## 1. Missing Datasets & Clinical Materials

### LIM-001: ACRIN 6688 Clinical Forms (CSV Forms) Not Uploaded
- **Finding**: While DICOM PET/CT image folders for ACRIN-FLT-Breast exist on disk (`D:\acrin_flt_breast`), the clinical CSV forms (`E3`, `BA`, `BR`, `CJ`, `CK`, `AF`, `HE`, `PH`, `PM`, `SB`, `JT`) and the `QIN_6688 Data Dictionary` were **not found** in the workspace.
- **Impact**: Laboratory biochemistry (`CJ`), hematology (`HE`), and baseline medical history (`BA`) cannot be loaded until the clinical CSV files are provided.
- **Mitigation**: Construct the ingestion framework to support ACRIN 6688 clinical forms modularly, but do not block Phase 1–6 development on other complete datasets (TCIA, I-SPY-1, BreastPathQ, TCGA).

---

### LIM-002: ISMPO Breast Cancer Guideline Document Not Uploaded
- **Finding**: The ISMPO Breast Cancer guideline PDF was not found in the local environment.
- **Impact**: Exact edition, publication year, section numbering, and verbatim recommendation wording cannot be verified directly against the primary PDF.
- **Mitigation**: Build the guideline rules schema (`guideline_check.schema.json`) and core rule engine with standard peer-reviewed evidence rules (ASCO/CAP, St. Gallen, NCCN, and published ISMPO consensus points). When the exact ISMPO document is uploaded, update verbatim citations and section references.

---

## 2. Dataset-Specific Inherent Limitations

### LIM-003: Transposed Matrix Structure in TCIA Breast-Dx Excel
- **Finding**: The workbook `TCIA-Breast-clinical-data-public-7_16_11 (1).xlsx` lists patients as columns rather than rows.
- **Impact**: Standard row-based data frame ingestion will fail or produce garbled fields without custom transposition.
- **Mitigation**: Dedicated loader `tcia_breast_diagnosis_loader.py` will transpose and reshape the dataset prior to normalization.

---

### LIM-004: Multicentric / Multiple Resection Scans in BreastPathQ
- **Finding**: 96 records correspond to only 54 unique patients (e.g., patient 1 has scans 99788 and 99789).
- **Impact**: Treating rows as independent patients will cause double-counting and demographic skew.
- **Mitigation**: Enforce parent-child data model (`patient_id` -> list of `scans`).

---

### LIM-005: Informal Biomarker Text in TCIA Clinical Data
- **Finding**: Biomarker values in TCIA Breast-Dx are recorded as informal strings (e.g., "neg (stain moderate)", "pos (weak)", "high prolif").
- **Impact**: Simple equality checks (`val == 'positive'`) will miss entries or misclassify weak stains.
- **Mitigation**: Clinical string parsing regex with explicit categorization and preservation of raw text.

---

### LIM-006: TCGA Multi-Organ Heterogeneity
- **Finding**: `TCGA_Reports.csv` contains 9,523 reports spanning 32 cancer types. Only 1,034 reports belong to BRCA.
- **Impact**: Ingesting the entire file without filtering will pollute breast cancer CDSS evaluation with non-breast malignancies.
- **Mitigation**: Mandatory cohort filtering using verified patient mapping from `tcga_patient_to_cancer_type.csv`.

---

## 3. Computational & Environment Limitations

### LIM-007: Sandbox Network Isolation & Dependency Management
- **Finding**: Sandbox mode prevents network connections for `pip install`. `pydicom` is required for DICOM SR parsing in Phase 3.
- **Mitigation**: When entering Phase 3, run package installation outside the sandbox with user approval or verify pre-cached wheels.
