# Master Data Dictionary & Canonical Field Mappings

## 1. Canonical Patient Profile Concept Schema

This dictionary defines the standard canonical concept fields produced by Shravanya's ingestion and normalization modules (Modules 1–6) and consumed by downstream clinical reasoning (Sanket: Modules 7–10) and UI visualization (Nikhil: Module 10).

---

## 2. Canonical Clinical Concepts

| Canonical Concept | Data Type | Permissible Standard Values | Standard Vocabulary | Description |
| :--- | :--- | :--- | :--- | :--- |
| `patient_id` | String | Unique alphanumeric ID | Internal System ID | De-identified canonical patient ID |
| `source_dataset` | Enum | `TCIA_BREAST_DIAGNOSIS`, `ISPY1_ACRIN6657`, `BREASTPATHQ`, `TCGA_BRCA` | Internal Enum | Dataset of origin |
| `source_patient_id` | String | Dataset native patient ID | Native Study ID | Identifier in source cohort |
| `age_at_diagnosis` | Float | $18.0 - 100.0$ | LOINC: 30525-0 | Age in years at primary diagnosis |
| `menopausal_status` | Enum | `premenopausal`, `perimenopausal`, `postmenopausal`, `unknown` | SNOMED-CT: 263678003 | Menopausal category |
| `laterality` | Enum | `left`, `right`, `bilateral`, `unknown` | SNOMED-CT: 272741003 | Laterality of primary disease |
| `histologic_type` | Enum | `invasive_ductal_carcinoma`, `invasive_lobular_carcinoma`, `ductal_carcinoma_in_situ`, `mucinous_carcinoma`, `metaplastic_carcinoma`, `benign_fibrosis`, `other` | ICD-O-3 / SNOMED-CT | Histological diagnosis |
| `histologic_grade` | Enum | `grade_1_well_differentiated`, `grade_2_moderately_differentiated`, `grade_3_poorly_differentiated`, `unknown` | Nottingham System | Bloom-Richardson / Nottingham histologic grade |
| `er_status` | Enum | `positive`, `negative`, `equivocal`, `unknown` | ASCO/CAP Standard | Estrogen receptor qualitative status |
| `er_percentage` | Float | $0.0 - 100.0$ (%) | LOINC: 85337-4 | ER percentage nuclear staining |
| `er_low_flag` | Boolean | `true`, `false`, `null` | ASCO/CAP 2020 Update | True if $1\% \le \text{ER} \le 10\%$ |
| `pr_status` | Enum | `positive`, `negative`, `equivocal`, `unknown` | ASCO/CAP Standard | Progesterone receptor qualitative status |
| `pr_percentage` | Float | $0.0 - 100.0$ (%) | LOINC: 85339-0 | PR percentage nuclear staining |
| `her2_status` | Enum | `positive`, `negative`, `equivocal`, `unknown` | ASCO/CAP 2018 Update | Combined definitive HER2 status |
| `her2_ihc_score` | Enum | `0`, `1+`, `2+`, `3+`, `unknown` | ASCO/CAP IHC Score | HER2 immunohistochemistry membrane staining score |
| `her2_fish_ratio` | Float | $\ge 0.0$ | LOINC: 48676-1 | HER2/CEP17 copy ratio by in situ hybridization |
| `ki67_index` | Float | $0.0 - 100.0$ (%) | LOINC: 35384-7 | Ki-67 proliferation index percentage |
| `ki67_category` | Enum | `low` ($< 14\%$), `intermediate` ($14-20\%$), `high` ($> 20\%$), `unknown` | St. Gallen 2013 | Proliferation category |
| `molecular_subtype` | Enum | `luminal_a`, `luminal_b_her2_negative`, `luminal_b_her2_positive`, `her2_enriched`, `triple_negative`, `luminal_unspecified`, `unknown` | St. Gallen Consensus | Clinically derived surrogate intrinsic subtype |
| `tumor_size_mm` | Float | $> 0.0$ (mm) | LOINC: 21889-1 | Longest diameter of primary tumor |
| `clinical_t_stage` | Enum | `cT1`, `cT1a`, `cT1b`, `cT1c`, `cT2`, `cT3`, `cT4`, `cT4a`, `cT4b`, `cT4c`, `cT4d`, `cTX`, `unknown` | AJCC 8th Edition | Clinical tumor size category |
| `clinical_n_stage` | Enum | `cN0`, `cN1`, `cN1mi`, `cN2`, `cN3`, `cNX`, `unknown` | AJCC 8th Edition | Clinical regional nodal status |
| `clinical_m_stage` | Enum | `cM0`, `cM1`, `cM0_i+`, `unknown` | AJCC 8th Edition | Clinical distant metastatic status |
| `birads_category` | Enum | `0`, `1`, `2`, `3`, `4`, `4A`, `4B`, `4C`, `5`, `6`, `unknown` | ACR BI-RADS Atlas | Breast imaging assessment code |
| `lymph_node_tested` | Integer | $\ge 0$ | Surgical Pathology | Number of axillary nodes examined |
| `lymph_node_positive`| Integer | $\ge 0$ | Surgical Pathology | Number of positive axillary nodes |
| `lvi_status` | Enum | `present`, `absent`, `unknown` | Pathology Standard | Lymphovascular invasion indicator |

---

## 3. Dataset-to-Canonical Field Mapping Matrix

| Canonical Concept | TCIA BREAST-DIAGNOSIS (Excel) | TCIA BREAST-DIAGNOSIS (DICOM SR) | I-SPY-1 / ACRIN 6657 (Excel) | BreastPathQ (Excel) | TCGA-BRCA (Pathology Reports) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `patient_id` | Derived: `TCIA-BD-{col}` | Derived: `TCIA-BD-{dir}` | Derived: `ISPY1-{SUBJECTID}` | Derived: `BPQ-{patient ID }` | Derived: `TCGA-{patient_id}` |
| `age_at_diagnosis` | Row `Age decade` $\times 10$ (approx decade) | N/A | Column `age` | Column `Age @ diagnosis` | Extracted from text demographics |
| `menopausal_status`| N/A | N/A | Mapped from `perimenops`/`menopause` if available | Column `Menopausal status` (1=Post, 2=Pre, 3=Peri) | Extracted from clinical narrative |
| `laterality` | Row `Which breast` (L, R) | TID 4200 Coded Laterality | Column `Laterality` (1=R, 2=L, 3=Bilat) | Derived from surgery records | Extracted from text gross description |
| `histologic_type` | Row `Dx` ("infiltrat lobular", "Invasive ductal CA") | N/A | N/A | Column `Histological type (resection)` | Extracted from Final Diagnosis section |
| `histologic_grade` | N/A | N/A | N/A | Column `Histology Grade (resection)` | Extracted Nottingham grade from text |
| `er_status` | Row `ER` ("pos", "neg") | N/A | Column `ERpos` (1=pos, 0=neg) | Column `ER (resection)` | Extracted from IHC summary in text |
| `pr_status` | Row `PR` ("pos", "neg") | N/A | Column `PgRpos` (1=pos, 0=neg) | Column `PR (resection)` | Extracted from IHC summary in text |
| `her2_status` | Row `HER2` ("pos", "neg") | N/A | Column `Her2MostPos` (1=pos, 0=neg) | Column `HER IHC (resection)` & `HER-2 FISH` | Extracted from IHC & ISH narrative |
| `ki67_index` | Row `Ki67` (qualitative prolif) | N/A | N/A | N/A | Extracted numerical percentage |
| `tumor_size_mm` | Extracted from Row `Impression` text | TID 1400 Length Measurements | Column `MRI LD Baseline` (in mm) | Column `Residual tumor size (mm)` (resection) | Extracted tumor dimensions |
| `birads_category` | Row `BIRAD` (e.g., 6) | Coded Concept: BI-RADS Assessment | N/A | N/A | N/A |
| `lymph_node_positive`| N/A | N/A | N/A | Column `LN involved` | Extracted from regional node dissection |
| `lvi_status` | N/A | N/A | N/A | Column `LVI` (0=absent, 1=present) | Extracted LVI narrative statements |
