# Handover Specification — Shravanya to Sanket & Nikhil

## 1. Handover Overview

This document specifies the exact outputs, schemas, integration contracts, and dependencies provided by Shravanya's modules (Modules 1–7) to:
1. **Sanket**: Modules 7–10 (Contraindication assessment, safety checks, treatment planning, and treatment recommendation logic).
2. **Nikhil**: Module 10 (Clinical user interface, timeline visualization, and end-to-end integration).

---

## 2. Artifacts Delivered by Shravanya

| Artifact / Interface | Format | Location | Primary Consumer | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Canonical Patient Profile** | JSON (Schema validated) | `schemas/patient_profile.schema.json` | Sanket & Nikhil | Comprehensive standardized clinical profile for a patient |
| **Guideline Evaluation Results** | JSON (Schema validated) | `schemas/guideline_check.schema.json` | Sanket & Nikhil | Deterministic evaluation of clinical practice guideline rules |
| **Patient Profile Python Model** | Pydantic / Dataclass | `src/patient_profile/models.py` | Sanket | Strongly typed Python interface for programmatic consumption |
| **Guideline Evaluator Endpoint** | Python Callable | `src/guidelines/evaluator.py` | Sanket | Evaluates a patient profile against registered guideline rules |
| **Sample Profile Fixtures** | JSON Fixtures | `data/sample/` | Nikhil & Sanket | Static test fixtures for mock UI development and integration tests |

---

## 3. Handover Contract for Sanket (Downstream Safety & Planning)

### What Sanket Receives:
1. **Normalized Clinical Parameters**:
   - `demographics`: Age, menopausal status.
   - `clinical_extent`: Laterality, primary tumor size (mm), clinical T, N, M staging.
   - `pathology_biomarkers`: Histologic type, grade, ER status & percentage, PR status & percentage, HER2 status & IHC score, Ki-67 index & category, and surrogate molecular subtype.
   - `observations`: Full array of granular observations with explicit `status` (`documented`, `not_reported`, `equivocal`, etc.), `unit`, and `timepoint`.
2. **Guideline Eligibility Checks**:
   - List of evaluated rules with `result_status` (`applicable`, `not_applicable`, `insufficient_information`, `requires_clinician_review`).
   - Matched and missing clinical criteria.
   - Guideline references and clinical action prompts.

### What Sanket Assumes:
- Shravanya guarantees that `missing` data is never converted to negative/normal.
- Shravanya guarantees that post-treatment outcome endpoints (`pCR`, `RCBClass`) are flagged with `timepoint: "outcome"` and excluded from baseline profiles.
- Sanket's contraindication engine should inspect `observations` and `pathology_biomarkers` to evaluate drug-drug interactions, organ clearance thresholds, and regimen eligibility.

---

## 4. Handover Contract for Nikhil (Clinical UI & Presentation)

### What Nikhil Receives:
1. **Visual Profile Cards**:
   - Pre-formatted patient header fields (Age, Menopausal Status, Histology, Subtype).
   - Provenance badges: Every field can link back to source document, file name, and extraction confidence.
2. **Guideline Compliance Flags**:
   - Visual badges for guideline checks: Green (Applicable), Gray (Not Applicable), Amber (Insufficient Information), Red (Clinician Review Required / Conflicting).
   - Traceable citation drawer displaying guideline source, edition, section, and text rationale.
3. **Mock Data Fixtures**:
   - Sample profiles representing key archetypes:
     - Archetype 1: Early-stage ER+/HER2- (Luminal A).
     - Archetype 2: Locally advanced HER2-positive.
     - Archetype 3: Triple-Negative Breast Cancer (TNBC).
     - Archetype 4: Incomplete / Equivocal profile (HER2 2+ without ISH).

---

## 5. Change Management & Interface Stability

- Any proposed change to `schemas/patient_profile.schema.json` or `schemas/guideline_check.schema.json` will be incremented with semantic versioning (`major.minor.patch`).
- Breaking changes to fields will be communicated directly in this document and logged in `docs/DECISION_LOG.md` before code changes are staged.
