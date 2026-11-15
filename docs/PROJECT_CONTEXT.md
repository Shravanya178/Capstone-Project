# Project Context — Explainable Breast Cancer Clinical Decision Support System (CDSS)

## 1. Executive Summary & Purpose

This project is a research-oriented, explainable **Breast Cancer Clinical Decision Support System (CDSS)**. The system is designed to assist multidisciplinary clinical teams (surgical oncologists, medical oncologists, radiation oncologists, and pathologists) by ingesting multimodal clinical reports and records, structuring observations, normalizing clinical data to canonical standards, interpreting biomarker profiles and disease extent, evaluating guideline-adherent clinical checks, assessing contraindications, and presenting traceable, explainable treatment recommendations.

> [!IMPORTANT]
> **Clinical & Ethical Scope Boundary**:
> The system is strictly intended to **support** clinicians, never to replace them. It must **never** independently prescribe treatment, administer care, or present unvalidated predictive outputs as established clinical facts.

---

## 2. Report-Based Scope Definition

The scope of this project is strictly **REPORT-BASED**:

### In-Scope
- **Surgical & Diagnostic Pathology Reports**: Narrative histology, grade, receptor status, margin status, lymph node involvement, and synoptic reports.
- **Breast Imaging Reports**: Diagnostic text reports and structured report formats from Mammography, Ultrasound, and Dynamic Contrast-Enhanced (DCE) MRI.
- **DICOM Structured Reports (DICOM SR)**: Comprehensive SR documents (SOP Class UID `1.2.840.10008.5.1.4.1.1.88.33`) containing hierarchical coded concepts, measurements, and BI-RADS classifications.
- **Structured Clinical Registries & Trial Workbooks**: Clinical characteristics, patient demographics, longitudinal tumor measurements, and surgical findings.
- **Clinical Natural Language Processing (NLP)**: Domain-specific parsing, negation detection, uncertainty quantification, and entity extraction using Bio_ClinicalBERT alongside deterministic rule baselines.
- **Canonical Patient Profile & Harmonization**: Standardized clinical schemas preserving source provenance, timepoint context, and clinical certainty.
- **Guideline-Based Clinical Checks**: Transparent, deterministic rule execution mapping patient profiles against evidence-based clinical practice guidelines (e.g., ISMPO, NCCN, ASCO/CAP).

### Out-of-Scope
- Mammography image pixel interpretation.
- Breast MRI pixel-level image processing.
- PET image pixel interpretation.
- Whole-slide digital histopathology image (WSI) tile analysis.
- Deep learning image-based tumor segmentation or lesion detection.
- Unvalidated treatment auto-prescriptions.

---

## 3. Team Architecture & Responsibilities

The CDSS project is partitioned across three core owners to maintain modularity, independence, and clean API boundaries:

```
[ Data Ingestion & Auditing ] (Shravanya: Mod 1-2)
             │
             ▼
[ Normalization & Canonical Profile ] (Shravanya: Mod 3, 6) ◄── [ DICOM SR Parser ] (Shravanya: Mod 4)
             │                                              ◄── [ Bio_ClinicalBERT NLP ] (Shravanya: Mod 5)
             ▼
[ Biomarker & Extent Assessment ] (Shravanya: Mod 5, 7)
             │
             ▼
[ Guideline-Based Clinical Checks ] (Shravanya: Mod 7)
             │
             ├──────────────────────────────────────────────┐
             ▼                                              ▼
[ Contraindication & Safety Engine ] (Sanket: Mod 7-8)   [ Clinical UI & Frontend ] (Nikhil: Mod 10)
             │                                              ▲
             ▼                                              │
[ Treatment Planning & Recommendations ] (Sanket: Mod 9) ───┘
```

### Module Breakdown & Ownership
1. **Shravanya (Modules 1–7)**:
   - Mod 1: Clinical report and patient data ingestion.
   - Mod 2: Data auditing, exploratory quality checks, and cohort verification.
   - Mod 3: Preprocessing, clinical value normalization, and provenance tracking.
   - Mod 4: DICOM Structured Report (SR) recursive parsing.
   - Mod 5: Clinical narrative processing and information extraction (Bio_ClinicalBERT).
   - Mod 6: Canonical patient profile generation and JSON schema contracts.
   - Mod 7 (Part A): Biomarker interpretation (ASCO/CAP guidelines), anatomical staging-related assessment, and deterministic guideline clinical checks.
2. **Sanket (Modules 7–10 / Downstream Safety & Planning)**:
   - Mod 7 (Part B): Contraindication assessment and drug-disease interaction filtering.
   - Mod 8: Patient safety checks (organ function thresholds, ECOG limits).
   - Mod 9: Treatment planning and multi-agent recommendation ranking.
   - Mod 10 (Part A): Explainability reasoning for treatment pathways.
3. **Nikhil (UI & System Integration)**:
   - Mod 10 (Part B): Clinical user interface, patient timeline visualization, guideline check summaries, interactive recommendation presentation, and end-to-end user verification.

---

## 4. End-to-End System Workflow

1. **Ingestion**: Raw clinical Excel workbooks, DICOM SR files, and pathology narrative text files are received and validated against dataset manifests.
2. **Information Extraction**:
   - Structured workbooks: Column harmonization and extraction.
   - DICOM SR: Recursive tree walking extracting coded concepts (`NUM`, `CODE`, `TEXT`).
   - Narrative text: Sentence segmentation, entity extraction (ER, PR, HER2, Grade, Histology), and negation/uncertainty tagging using Bio_ClinicalBERT + rule baselines.
3. **Data Normalization**: Values are mapped to standard clinical vocabularies (SNOMED-CT, LOINC, ICD-O-3, ASCO/CAP). Provenance, timepoint, and original raw values are strictly retained.
4. **Canonical Profile Generation**: Consolidated per-patient JSON documents conform to `schemas/patient_profile.schema.json`.
5. **Clinical Interpretation**:
   - Hormone Receptor (ER/PR) status interpreted with explicit ER-low (1–10%) awareness.
   - HER2 status determined via IHC and ISH (2+ equivocal logic).
   - Intrinsic molecular subtype (Luminal A, Luminal B, HER2-enriched, Triple-Negative) classified with explicit confidence and missingness alerts.
   - Anatomical disease extent (cTNM / pTNM) evaluated without hallucinating missing parameters.
6. **Guideline Checking**: Deterministic rule engine evaluates eligibility and guideline flags against clinical knowledge bases, outputting to `schemas/guideline_check.schema.json`.
7. **Downstream Safety & Handover**: Sanket's module consumes patient profiles and guideline check outputs to filter contraindications, evaluate organ safety, and formulate ranked therapy recommendations.
8. **UI Presentation**: Nikhil's interface renders profile summaries, evidence trails, guideline check results, and recommendation explanations to clinicians.
