# Complete Integration & Frontend Guide for Nikhil
**Modules Covered**: Shravanya's (1–5, 8) & Sanket's (6–7, 9)  
**Consumer**: Nikhil (Module 10: Clinical UI, Frontend Presentation, and API Integration)  
**Schema Contracts**:
- `schemas/patient_profile.schema.json`
- `schemas/guideline_check.schema.json`
- `schemas/safety_assessment.schema.json`
- `schemas/treatment_plan.schema.json`
- `schemas/clinical_observation.schema.json`

---

## 1. Executive Summary & Architecture

The Breast Cancer Clinical Decision Support System generates four core JSON artifacts that feed Nikhil's frontend user interface:

```
[Inpatient / Pathology Records]
              │
              ▼
    [Shravanya Pipeline]
    ├── patient_profile.json
    └── guideline_check.json
              │
              ▼
     [Sanket Pipeline]
     ├── safety_assessment.json
     └── treatment_plan.json
              │
              ▼
     [Nikhil Dashboard]
     ├── Patient Demographics & Biomarker Summary Card
     ├── Guideline Rule Evaluation Drawer
     ├── Clinical Safety & Contraindication Alert Banner
     ├── Organ Function & Laboratory Panel Status Cards
     ├── Multimodal Treatment Plan & Decision-Support Cards
     └── Multidisciplinary Tumor Board Sign-Off Modal
```

All JSON payloads adhere strictly to JSON Schema Draft 2020-12. Every clinical recommendation is non-autonomous and gated by `manual_review_required: true`.

---

## 2. Patient Profile & Biomarkers (`patient_profile.json`)

### 2.1 Patient Summary Header (`demographics` & `clinical_extent`)
- `patient_id`: Main header badge (e.g. `SCENARIO_A_LUMINAL_A`).
- `demographics.age`: Integer years (e.g. `58`).
- `demographics.menopausal_status`: Chip (`Premenopausal`, `Perimenopausal`, `Postmenopausal`, `Unknown`).
- `clinical_extent.laterality`: Laterality chip (`Left`, `Right`, `Bilateral`).
- `clinical_extent.primary_tumor_size_mm`: Size in mm (e.g. `24.0 mm`).
- `clinical_extent.clinical_t_stage` / `clinical_n_stage` / `clinical_m_stage`: TNM badge (e.g. `cT2 cN0 cM0`).

### 2.2 Biomarker Card (`pathology_biomarkers`)
- `molecular_subtype`: Prominent colored chip:
  - `luminal_a`: Blue badge ("Luminal A (HR+/HER2-, Low Prolif)")
  - `luminal_b_her2_negative`: Cyan badge ("Luminal B HER2- (HR+/HER2-, High Prolif)")
  - `luminal_b_her2_positive`: Purple badge ("Luminal B HER2+ (Triple Positive)")
  - `her2_enriched`: Orange badge ("HER2-Enriched (HR-/HER2+)")
  - `triple_negative`: Red badge ("Triple-Negative (TNBC)")
  - `unknown`: Gray badge ("Subtype Incomplete / Pending")
- `er_status`: If `er_low_flag: true`, render amber notification pill: *"ER-Low (1-10%) — Endocrine benefit may be limited"*.
- `her2_status`: If `equivocal`, render red pulsing badge: *"HER2 Equivocal (IHC 2+) — Reflex FISH Required"*.

---

## 3. Clinical Safety & Contraindication Dashboard (`safety_assessment.json`)

### 3.1 Overall Safety Status Banner (`overall_safety_status`)
Render as a high-visibility hero banner at the top of the treatment view:

| `overall_safety_status` | Visual Style | Display Label | UI Action |
| :--- | :--- | :--- | :--- |
| `contraindication_identified` | **Red Alert Banner (pulsing)** | 🛑 Absolute Contraindication / Black Box Warning Flagged | Highlights affected drugs in red; blocks 1-click confirmation. |
| `potential_interaction` | **Orange Warning Banner** | ⚠️ Major Drug-Drug Interaction Detected | Displays interacting medication callout; suggests alternative. |
| `precaution_identified` | **Yellow Alert Banner** | ⚠️ Clinical Precaution / Organ Risk Identified | Recommends dose modification or monitoring protocols. |
| `insufficient_information` | **Blue / Slate Info Banner** | ℹ️ Incomplete Baseline Safety Records | Displays checklist of missing telemetry & labs. |
| `no_identified_issue_in_available_data` | **Green Success Banner** | ✅ No Documented Contraindications in Available Data | Allows tumor board consideration. |

### 3.2 Organ Function Risk Cards (`organ_function_assessments`)
Render a 5-card grid summarizing physiological status:
1. **Cardiac Function**:
   - Status badge: `cleared` (Green) if $\ge 50\%$; `moderate_dysfunction` (Amber) if $40\text{--}49\%$; `severe_dysfunction` (Red) if $< 40\%$; `not_assessed` (Gray) if missing.
   - Value display: e.g. `LVEF: 62%` or `ECHO unrecorded`.
2. **Renal Function**:
   - Status badge: `normal_clearance` (Green); `moderate_impairment` (Amber: $\text{CrCl } 30\text{--}49\text{ mL/min}$); `severe_impairment` (Red: $< 30\text{ mL/min}$).
3. **Hepatic Function**:
   - Status badge: `normal_hepatic_function` vs `severe_hyperbilirubinemia` (Bilirubin $> 3.0\text{ mg/dL}$).
4. **Hematologic Function**:
   - Status badge: `adequate_marrow_function` vs `severe_neutropenia` ($\text{ANC} < 1,500/\mu\text{L}$).
5. **Reproductive Status**:
   - Status badge: `not_pregnant` vs `pregnant_absolute_contraindication` (Red Alert).

### 3.3 Missing Safety Variables Checklist (`missing_safety_information`)
Display an interactive clinical verification checklist. Items absent from retrospective records (e.g. `lvef_percent`, `creatinine_clearance_ml_min`, `concomitant_medications`) must allow the clinician to type in recent lab values or check "Verified via EHR".

---

## 4. Treatment Planning & Decision Support Interface (`treatment_plan.json`)

### 4.1 Plan Status Chip (`plan_status`)
- `supported_for_consideration`: Green chip ("Treatment Options Supported by Guideline Consensus")
- `requires_clinician_review`: Amber chip ("Multidisciplinary Tumor Board Review Required")
- `contraindication_flagged`: Red chip ("Contraindication Flagged — Safety Overrides Applied")
- `insufficient_information`: Gray chip ("Pending Clinical Variables")

### 4.2 Multimodal Treatment Options Cards (`treatment_options`)
Group options visually by `treatment_category`:
- **Locoregional Interventions**:
  - `surgical_intervention` (Breast-Conserving Surgery + SLNB vs Mastectomy)
  - `locoregional_radiation_therapy` (Hypofractionated Whole Breast Radiotherapy)
- **Systemic Therapy**:
  - `neoadjuvant_systemic_therapy` (TCHP, Keynote-522)
  - `targeted_biotherapy` (Adjuvant Trastuzumab)
  - `endocrine_therapy` (Aromatase Inhibitors, Tamoxifen)

Each option card displays:
1. **Header**: `regimen_or_modality` title + `clinical_intent` tag (e.g. `locoregional_control`, `pathologic_complete_response`, `risk_reduction_recurrence`).
2. **Eligibility Badge**:
   - `supported_for_consideration`: Green pill
   - `requires_clinician_review`: Amber pill
   - `contraindication_flagged`: Red pill
   - `not_supported_by_available_information`: Neutral gray pill
3. **Clinical Rationale (`rationale`)**: Clear, concise biological reasoning.
4. **Supporting Observations**: Chips showing why tumor matches (e.g. `ER: positive`, `HER2: 3+`, `cT2 cN0`).
5. **Supporting Guidelines**: Tags linking to guideline IDs (`ESMO-BC-2024-HR-ENDO-003`).
6. **Safety Warnings (`safety_findings`)**: If present, render red/amber alert box detailing contraindication or drug interaction.
7. **Clinician Action Prompts (`clinician_action_prompts`)**: Highlighting actionable clinical next steps (e.g. *"Obtain reflex FISH testing"*, *"Withhold HER2 therapy; repeat ECHO in 4 weeks"*).
8. **Evidence Citation Drawer (`evidence_source`)**:
   - Guideline Body (e.g. `ESMO Clinical Practice Guidelines 2024`)
   - Primary Reference (`Loibl S, et al. Early breast cancer...`)
   - Level of Evidence badge (`Level I, Grade A`)
   - FDA Boxed Warning badge if applicable.

### 4.3 Multidisciplinary Tumor Board Confirmation Gate
At the footer of the treatment plan, render the mandatory clinician sign-off:
- Checkbox: *"I have reviewed the clinical findings, verified patient-specific contraindications, and confirm this decision-support summary will be adjudicated by the Multidisciplinary Tumor Board."*
- Button: **Confirm & Export Clinical Summary (PDF / EHR)** (Disabled until checkbox is selected).

---

## 5. Sample Fixture Files for Frontend Development

Nikhil can directly import the verified sample JSON fixtures from the repository:
- Canonical Patient Profile: `data/sample/sample_patient_profile.json`
- Guideline Evaluation: `data/sample/sample_guideline_check.json`
- Safety Assessment: `data/sample/sample_safety_assessment.json`
- Treatment Plan: `data/sample/sample_treatment_plan.json`
- Clinical Observation Schema: `schemas/clinical_observation.schema.json`
