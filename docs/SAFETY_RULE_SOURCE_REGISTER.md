# Clinical Safety Rule Source Register
**Module Owner**: Sanket Patil (`sanketp09`)  
**Role**: Senior Clinical Software Engineer & Clinical Backend Architect  
**Component**: `src/safety/contraindication_registry.py`  
**Standard**: FDA Boxed Warnings, ASCO/ESMO Clinical Guidelines

---

## Complete Register of Codified Safety Rules

This register documents all 11 evidence-based safety rules implemented in Sanket's Clinical Safety & Contraindication Engine. Every rule is tied to a primary regulatory source, published guideline, or pharmacogenomic benchmark.

| Rule ID | Rule Name | Medication / Class | Category | Severity | Boxed Warning | Primary Source & Reference |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| `CONTRA-CARD-HER2-001` | Trastuzumab/Pertuzumab Baseline Cardiotoxicity | Anti-HER2 Monoclonal Antibodies (Trastuzumab, Pertuzumab) | Absolute Contraindication | Critical | **Yes** | US FDA Herceptin PI (Boxed Warning: Cardiomyopathy); ESMO 2024 Guidelines; Suter TM et al., *J Clin Oncol* 2007. |
| `CONTRA-CARD-ANTHRA-002` | Anthracycline Baseline Cardiac Dysfunction & Dose Limits | Anthracyclines (Doxorubicin, Epirubicin) | Absolute Contraindication | Critical | **Yes** | US FDA Adriamycin PI (Boxed Warning: Myocardial Toxicity); Swain SM et al., *Cancer* 2003; ASCO Cardio-Oncology Guidelines. |
| `CONTRA-THROMB-TAM-003` | Tamoxifen Thromboembolic Disease | SERMs (Tamoxifen) | Absolute Contraindication | Critical | **Yes** | US FDA Nolvadex PI (Boxed Warning: Thromboembolic Events); ASCO 2020 Endocrine Guidelines; EBCTCG *Lancet* 2011. |
| `DDI-CYP2D6-TAM-004` | Tamoxifen & Strong CYP2D6 Inhibitor Interaction | Tamoxifen + Strong CYP2D6 Inhibitor | Drug-Drug Interaction | Major | No | Kelly CM et al., *BMJ* 2010; Jin Y et al., *J Natl Cancer Inst* 2005; CPIC Dosing Guideline for Tamoxifen and CYP2D6. |
| `CONTRA-ENDO-AI-PREMENO-005`| Premenopausal Aromatase Inhibitor Without Ovarian Suppression | Aromatase Inhibitors (Anastrozole, Letrozole, Exemestane) | Absolute Contraindication | Critical | No | Francis PA et al., SOFT/TEXT Trials *N Engl J Med* 2018; ESMO 2024 Guidelines; ASCO Clinical Practice Guidelines. |
| `CONTRA-NEURO-TAXANE-006` | Taxane Pre-existing Peripheral Neuropathy | Taxanes (Paclitaxel, Docetaxel) | Relative Contraindication / Precaution | Major | No | Loprinzi CL et al., ASCO Chemotherapy-Induced Peripheral Neuropathy Guideline, *J Clin Oncol* 2020. |
| `CONTRA-HEME-TAX-NEUTR-007` | Taxane Baseline Neutropenia & Sepsis Risk | Myelosuppressive Chemotherapy (Taxanes, Anthracyclines) | Absolute Contraindication | Critical | **Yes** | US FDA Taxol/Taxotere PI (Boxed Warning: Neutropenic Sepsis); ASCO Clinical Practice Guideline on Antimicrobial Prophylaxis. |
| `CONTRA-RENAL-PLATINUM-008`| Platinum Renal Clearance Impairment | Platinum Agents (Cisplatin, Carboplatin) | Relative Contraindication / Organ Toxicity Risk | Major | **Yes** | US FDA Platinol PI (Boxed Warning: Nephrotoxicity); Miller RP et al., *Toxicol Appl Pharmacol* 2010; Calvert Formula Standard. |
| `CONTRA-HEPATIC-ANTHRA-009`| Anthracycline Severe Hepatic Impairment | Anthracyclines (Doxorubicin) | Relative Contraindication | Major | No | Benjamin RS et al., *Cancer* 1974; FDA Adriamycin PI (Biliary Excretion Dose Adjustments). |
| `CONTRA-PREG-TERATOGEN-010`| Cytotoxic / Endocrine / HER2 Agents in Confirmed Pregnancy | Systemic Chemotherapy, HER2 Agents, Endocrine Agents | Absolute Contraindication | Critical | **Yes** | FDA Pregnancy Category D/X Boxed Warnings; Loibl S et al., ESMO Guidelines on Breast Cancer During Pregnancy, 2020. |
| `PRECAUTION-IMMUNE-PEMBRO-011`| Pembrolizumab Active Autoimmune Disease | Immune Checkpoint Inhibitors (Pembrolizumab) | Precaution / Organ Toxicity Risk | Moderate | No | Brahmer JR et al., ASCO Immune-Related Adverse Events Guideline, *J Clin Oncol* 2018; Schmid P et al., KEYNOTE-522. |

---

## Detailed Rule Specifications

### 1. `CONTRA-CARD-HER2-001`
- **Trigger**: Baseline $\text{LVEF} < 50\%$ or drop $\ge 10\%$ points below $50\%$ on echocardiography / MUGA.
- **Medications Affected**: Trastuzumab, Pertuzumab, Ado-Trastuzumab Emtansine (T-DM1), Trastuzumab Deruxtecan (T-DXd).
- **Clinical Action**: Withhold anti-HER2 therapy. Repeat cardiac evaluation in 3–4 weeks. Refer to cardio-oncology.

### 2. `CONTRA-CARD-ANTHRA-002`
- **Trigger**: Baseline $\text{LVEF} < 50\%$, clinical heart failure (NYHA Class II–IV), or prior cumulative doxorubicin exposure $> 450\text{ mg/m}^2$.
- **Medications Affected**: Doxorubicin, Epirubicin.
- **Clinical Action**: Absolute contraindication. Replace anthracycline-containing regimens with non-anthracycline alternatives (e.g. Docetaxel + Carboplatin + Trastuzumab + Pertuzumab [TCHP] for HER2+ disease; TC [Docetaxel + Cyclophosphamide] for HER2- disease).

### 3. `CONTRA-THROMB-TAM-003`
- **Trigger**: Documented history of Deep Vein Thrombosis (DVT), Pulmonary Embolism (PE), or hereditary pro-thrombotic mutations (Factor V Leiden homozygous).
- **Medications Affected**: Tamoxifen.
- **Clinical Action**: Absolute contraindication. In postmenopausal women, switch to an Aromatase Inhibitor. In premenopausal women, consider GnRH agonist (OFS) plus Aromatase Inhibitor.

### 4. `DDI-CYP2D6-TAM-004`
- **Trigger**: Co-prescription of Tamoxifen with strong CYP2D6 inhibitors (Fluoxetine, Paroxetine, Bupropion, Quinidine).
- **Medications Affected**: Tamoxifen.
- **Clinical Action**: Major drug-drug interaction. Prescribe non- or weak-inhibitor antidepressants such as Venlafaxine, Desvenlafaxine, Escitalopram, or Citalopram to treat hot flashes or depression without blunting endoxifen formation.

### 5. `CONTRA-ENDO-AI-PREMENO-005`
- **Trigger**: Premenopausal status in a patient evaluated for an Aromatase Inhibitor without documented Ovarian Function Suppression (OFS).
- **Medications Affected**: Anastrozole, Letrozole, Exemestane.
- **Clinical Action**: Absolute contraindication. Monotherapy fails to suppress estrogen and stimulates ovarian gonadotropin release. Mandate concurrent GnRH agonist (Goserelin, Leuprolide) or surgical bilateral oophorectomy, or switch to Tamoxifen.

### 6. `CONTRA-NEURO-TAXANE-006`
- **Trigger**: Pre-existing sensory or motor peripheral neuropathy $\ge \text{Grade } 2$.
- **Medications Affected**: Paclitaxel, Docetaxel.
- **Clinical Action**: Relative contraindication. Consider dose reduction, albumin-bound paclitaxel (Nab-paclitaxel), prolonged infusion schedule, or alternative regimens to prevent irreversible neurotoxicity.

### 7. `CONTRA-HEME-TAX-NEUTR-007`
- **Trigger**: Baseline Absolute Neutrophil Count ($\text{ANC}$) $< 1,500/\mu\text{L}$ or platelet count $< 100,000/\mu\text{L}$.
- **Medications Affected**: Paclitaxel, Docetaxel, Doxorubicin, Cyclophosphamide, Carboplatin.
- **Clinical Action**: Absolute contraindication to initiation until bone marrow recovery. Mandate G-CSF (Filgrastim/Pegfilgrastim) support upon cycle resumption.

### 8. `CONTRA-RENAL-PLATINUM-008`
- **Trigger**: Estimated Creatinine Clearance ($\text{CrCl}$) $< 50\text{ mL/min}$.
- **Medications Affected**: Cisplatin, Carboplatin.
- **Clinical Action**: Withhold cisplatin; utilize Calvert-formula AUC-based dosing for Carboplatin ($\text{Target AUC } \times [\text{GFR} + 25]$). Ensure aggressive pre- and post-hydration with normal saline.

### 9. `CONTRA-HEPATIC-ANTHRA-009`
- **Trigger**: Serum total bilirubin $> 3.0\text{ mg/dL}$ or AST/ALT $> 5\times \text{ULN}$.
- **Medications Affected**: Doxorubicin, Epirubicin.
- **Clinical Action**: Relative contraindication. Doxorubicin undergoes extensive hepatic metabolism and biliary excretion. Reduce dose by $50\text{--}75\%$ or select non-hepatically cleared alternatives.

### 10. `CONTRA-PREG-TERATOGEN-010`
- **Trigger**: Confirmed positive pregnancy test or documented gestation.
- **Medications Affected**: Cytotoxic chemotherapy, Endocrine therapy (Tamoxifen, AI), HER2-targeted agents (Trastuzumab), Radiation therapy.
- **Clinical Action**: Absolute contraindication during the first trimester. Trastuzumab causes fetal renal failure and oligohydramnios sequence in all trimesters. Mandate multidisciplinary maternal-fetal cardio-oncology consultation.

### 11. `PRECAUTION-IMMUNE-PEMBRO-011`
- **Trigger**: Active, severe systemic autoimmune disease (e.g. active ulcerative colitis, systemic lupus erythematosus, severe myasthenia gravis).
- **Medications Affected**: Pembrolizumab.
- **Clinical Action**: Precaution / toxicity risk. High risk of severe or fatal immune-related adverse events (irAEs: immune-mediated colitis, myocarditis, pneumonitis). Requires expert rheumatology consultation and risk-benefit evaluation.

