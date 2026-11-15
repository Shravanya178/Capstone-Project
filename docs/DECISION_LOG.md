# Technical & Research Decision Log

## 1. Architectural Decisions

### DEC-001: Strict Scope Boundary — Report-Based Ingestion vs. Pixel Data
- **Date**: 2026-11-15
- **Status**: **Approved**
- **Context**: The workspace environment contains folders with raw DICOM MRI slices (`D:\ispy1`), PET slices (`D:\acrin_flt_breast`), and CT slices (`D:\DATASET CAPSTONE\acrin_flt_breast`).
- **Decision**: These image pixel datasets are explicitly declared **Out-of-Scope**. The CDSS will ingest only clinical records, pathology narratives, clinical trial workbooks, and DICOM Structured Reports (SR). No pixel processing or computer vision models will be implemented.
- **Consequences**: Avoids massive computational overhead, maintains clinical explainability focus, and respects the research specification.

---

### DEC-002: Deterministic DICOM SR Parsing vs. LLM/NLP
- **Date**: 2026-11-15
- **Status**: **Approved**
- **Context**: DICOM SR files contain nested, standardized code sequences (`(0040,A730)`).
- **Decision**: Use `pydicom` for deterministic tree traversal and concept code extraction. Never use an NLP model or LLM to re-interpret already-structured, standardized DICOM SR codes.
- **Consequences**: Guarantees 100% deterministic reproducibility, zero hallucination, and accurate preservation of spatial units and BI-RADS categories.

---

### DEC-003: Bio_ClinicalBERT Role & Rule Baseline Requirement
- **Date**: 2026-11-15
- **Status**: **Approved**
- **Context**: Unstructured narrative pathology reports in TCGA require entity and context extraction.
- **Decision**: Deploy Bio_ClinicalBERT exclusively for narrative text extraction (ER, PR, HER2, Grade, Histology), accompanied by a deterministic regex/rule-based baseline. Both approaches will be evaluated side-by-side using Precision, Recall, and F1.
- **Consequences**: Adheres to strict research methodology; ensures that deep learning models are not treated as infallible black boxes without rigorous benchmarking.

---

### DEC-004: Ingestion Strategy for Transposed TCIA Breast-Dx Excel
- **Date**: 2026-11-15
- **Status**: **Approved**
- **Context**: `TCIA-Breast-clinical-data-public-7_16_11 (1).xlsx` is structured as a 15-row × 53-column matrix where columns represent individual patients.
- **Decision**: Implement a custom ingestion transform in `src/ingestion/tcia_breast_diagnosis_loader.py` that transposes the matrix into standard patient-row records while parsing structured pathology and narrative MRI impressions into distinct observation containers.
- **Consequences**: Clean harmonization into canonical patient profiles with zero loss of clinical data.

---

### DEC-005: Verified TCGA-BRCA Cohort Filtering
- **Date**: 2026-11-15
- **Status**: **Approved**
- **Context**: `TCGA_Reports.csv` contains 9,523 reports spanning 32 cancer types. Keyword search alone is error-prone.
- **Decision**: Use the verified metadata registry in `D:\tcga-path-reports-main\tcga-path-reports-main\data\tcga_metadata\tcga_patient_to_cancer_type.csv` to filter exactly the **1,034 verified BRCA patients**.
- **Consequences**: Completely eliminates non-breast pathology reports (e.g., glioblastoma, lung cancer) from the clinical pipeline with verified epidemiological accuracy.

---

### DEC-006: Separation of Neoadjuvant Response Endpoints from Baseline Inputs
- **Date**: 2026-11-15
- **Status**: **Approved**
- **Context**: I-SPY-1 and BreastPathQ contain post-treatment surgical resection data and outcome metrics (`pCR`, `RCBClass`, `RFS`, `Residual tumor size`).
- **Decision**: Enforce strict temporal tagging. Outcomes are categorized as `timepoint: "outcome"` and resection parameters as `timepoint: "post_treatment_resection"`. These are excluded from baseline guideline eligibility checks to prevent clinical data leakage.
- **Consequences**: Ensures scientific integrity and clinical safety.
