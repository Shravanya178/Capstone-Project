# Integration Guide for Nikhil (Module 10: Clinical UI & Frontend Presentation)

## 1. Executive Summary
This guide specifies the schema structure, display fields, badge mappings, and timeline conventions provided by Shravanya's backend modules for clinical dashboard rendering.

---

## 2. UI Component Mapping Matrix

### 2.1 Patient Summary Header (`demographics` & `clinical_extent`)
- `patient_id`: Main header badge (e.g. `TCIA_BreastDX-01-0002`).
- `demographics.age`: Displayed as integer years.
- `demographics.menopausal_status`: Displayed with pre/peri/post-menopausal badge.
- `clinical_extent.laterality`: Laterality indicator (`Left`, `Right`, `Bilateral`).
- `clinical_extent.primary_tumor_size_mm`: Primary tumor dimension in millimeters (with cm conversion if desired).
- `clinical_extent.clinical_t_stage`: AJCC clinical T stage (e.g. `cT1c`, `cT2`).

### 2.2 Biomarker Card (`pathology_biomarkers`)
- `molecular_subtype`: Prominent subtype chip:
  - `luminal_a`: Blue badge ("Luminal A (HR+/HER2-, Low Prolif)")
  - `luminal_b_her2_negative`: Cyan badge ("Luminal B HER2- (HR+/HER2-, High Prolif)")
  - `luminal_b_her2_positive`: Purple badge ("Luminal B HER2+ (Triple Positive)")
  - `her2_enriched`: Orange badge ("HER2-Enriched (HR-/HER2+)")
  - `triple_negative`: Red badge ("Triple-Negative (TNBC)")
  - `unknown`: Gray badge ("Subtype Unknown / Incomplete Data")
- `er_status`: If `er_low`, render amber notification pill: "ER-Low (1-10%)".
- `her2_status`: If `equivocal`, render red pulsing badge: "HER2 Equivocal (IHC 2+) — ISH Required".

### 2.3 Guideline Check Summary Cards (`checks` array in `guideline_check.json`)
- Badge Color Coding by `result`:
  - `applicable`: Green ("Eligible / Recommended Consideration")
  - `not_applicable`: Neutral Gray ("Not Applicable")
  - `insufficient_information`: Amber ("Missing Information")
  - `requires_review`: Red Alert ("Clinician Review Required")
- `explanation`: Collapsible card body text detailing matched and missing criteria.
- `clinician_action_prompt`: Highlighted actionable callout box.
- Citation Drawer: Render `source.guideline`, `source.version`, `source.section`, and `source.document_reference` for clinician auditability.

### 2.4 Longitudinal Timeline (`clinical_timepoints`)
Group observations visually across tabs or horizontal timeline nodes:
1. `baseline`: Diagnostic biopsy & baseline imaging.
2. `during_treatment`: Longitudinal MRI measurements during chemotherapy cycles (e.g. `during_treatment_early_ac`, `during_treatment_inter_regimen`).
3. `pre_surgical_resection`: Pre-operative imaging.
4. `post_treatment_resection`: Surgical resection pathology (residual tumor bed, residual cellularity).
5. `outcome`: Trial outcome endpoints (`PCR`, `RCBClass`).

