# Clinical Contraindication & Safety Assessment Methodology
**Module Owner**: Sanket Patil (`sanketp09`)  
**Role**: Senior Clinical Software Engineer & Clinical Backend Architect  
**Component**: `src/safety/`

---

## 1. Clinical Safety Taxonomy

In clinical oncology, therapeutic safety requires a precise, hierarchical classification of risk. Conflating an absolute contraindication with a precautionary dose adjustment or an unrecorded laboratory value poses severe clinical hazards.

Our system establishes a strict five-tier clinical safety taxonomy:

| Category | Definition | System Action | Override Behavior |
| :--- | :--- | :--- | :--- |
| **Absolute Contraindication** | A clinical condition or comorbidity where the administration of the agent carries a life-threatening or irreversible risk that conclusively outweighs any potential oncologic benefit. | Flags critical safety finding; generates warning; mandates tumor board review. | **Strictly overrides** treatment eligibility to `contraindication_flagged`. |
| **FDA Boxed Warning** | The strongest warning issued by the US FDA, highlighting serious hazards, fatal toxicities, or permanent disability associated with the drug. | Flags critical safety finding; highlights Boxed Warning in UI. | Overrides candidate regimen or mandates mandatory prerequisite testing (e.g. baseline ECHO). |
| **Relative Contraindication / Precaution** | A condition where increased risk exists, but clinical benefit may outweigh risk under strict monitoring, cardioprotection, or dose reduction. | Flags moderate safety finding; generates clinician recommendation. | Preserves eligibility but transitions status to `requires_clinician_review` with alert. |
| **Drug-Drug Interaction (DDI)** | Pharmacokinetic or pharmacodynamic interference between an oncology agent and a concomitant prescription that alters drug efficacy or toxicity. | Identifies interacting pair; details metabolic pathway (e.g. CYP2D6 inhibition). | Recommends non-interacting alternative (e.g. Escitalopram, Venlafaxine) with review flag. |
| **Missing Information (Data Gap)** | The absence of essential physiological or laboratory parameters required to confirm drug safety. | Explicitly catalogs unrecorded variables in `missing_safety_information`. | **Never assumes normal**. Flags `insufficient_information` and mandates clinical verification. |

---

## 2. Evidence-Based Safety Rules Rationale

### 2.1 Anti-HER2 Targeted Agents: Trastuzumab & Pertuzumab
- **Primary Toxicity**: Cardiotoxicity / Left Ventricular Ejection Fraction (LVEF) decline.
- **Biochemical Mechanism**: HER2/ErbB2 signaling in cardiomyocytes plays an essential role in myocardial survival and repair under mechanical strain. Blockade of cardiomyocyte ErbB2 by Trastuzumab prevents normal stress response, leading to non-dose-dependent, often reversible contractile dysfunction.
- **Clinical Benchmark**: Baseline LVEF must be $\ge 50\%$. If baseline LVEF is $< 50\%$ or has dropped $\ge 10\%$ points from baseline to below $50\%$, anti-HER2 therapy must be withheld.
- **Safety Rule**: `CONTRA-CARD-HER2-001` (FDA Boxed Warning).

### 2.2 Anthracyclines: Doxorubicin & Epirubicin
- **Primary Toxicity**: Cumulative, irreversible cardiomyopathy, congestive heart failure (CHF), and myelosuppression.
- **Biochemical Mechanism**: Anthracyclines intercalate into DNA and inhibit Topoisomerase II$\beta$ in cardiac myocytes, inducing double-stranded DNA breaks and generating iron-mediated reactive oxygen species (ROS), leading to irreversible myocyte apoptosis and myocardial fibrosis.
- **Clinical Benchmarks**:
  - Baseline LVEF $< 50\%$ or history of symptomatic heart failure represents an **absolute contraindication**.
  - Prior cumulative doxorubicin dose $> 450\text{--}500\text{ mg/m}^2$ significantly escalates heart failure risk from $5\%$ to $> 20\%$.
- **Safety Rule**: `CONTRA-CARD-ANTHRA-002` (FDA Boxed Warning).

### 2.3 Selective Estrogen Receptor Modulators (SERMs): Tamoxifen
- **Primary Toxicities**: Thromboembolism (Deep Vein Thrombosis, Pulmonary Embolism), endometrial carcinoma, and pharmacokinetic CYP2D6 interactions.
- **Biochemical Mechanism**:
  - While Tamoxifen acts as an estrogen antagonist in breast parenchyma, it acts as an **estrogen agonist** in the liver and vascular endothelium, decreasing circulating levels of Antithrombin III and Protein S, thus increasing venous thrombosis risk.
  - Active metabolite bioactivation: Tamoxifen is a prodrug requiring hepatic conversion by Cytochrome P450 2D6 (**CYP2D6**) into **Endoxifen** (which possesses 100-fold greater affinity for the estrogen receptor). Strong CYP2D6 inhibitors (Fluoxetine, Paroxetine, Bupropion) block this conversion, substantially reducing circulating endoxifen and impairing disease-free survival.
- **Clinical Benchmarks**:
  - Documented history of DVT, PE, or active thromboembolic disease is an **absolute contraindication**.
  - Concomitant use of strong CYP2D6 inhibitors is a **major drug-drug interaction** requiring substitution with non-CYP2D6 inhibiting SSRIs/SNRIs (e.g. Venlafaxine, Citalopram, Escitalopram).
- **Safety Rules**: `CONTRA-THROMB-TAM-003` and `DDI-CYP2D6-TAM-004`.

### 2.4 Aromatase Inhibitors: Anastrozole, Letrozole, Exemestane
- **Primary Hazard**: Ineffective endocrine therapy and paradoxical ovarian stimulation in premenopausal women.
- **Biochemical Mechanism**: Aromatase inhibitors suppress peripheral conversion of androgens to estrogens by the aromatase enzyme (CYP19A1). In women with intact, functional ovaries, systemic reduction of circulating estrogen releases negative feedback inhibition on the hypothalamic-pituitary axis. This induces a massive compensatory release of Luteinizing Hormone (LH) and Follicle-Stimulating Hormone (FSH), stimulating the ovaries to hypersecrete estrogens and overwhelming the inhibitor.
- **Clinical Benchmark**: Aromatase inhibitor monotherapy in premenopausal women is an **absolute contraindication**. Aromatase inhibitors may only be administered to premenopausal women in combination with concurrent **Ovarian Function Suppression (OFS)** via GnRH agonists (Goserelin, Leuprolide) or bilateral oophorectomy.
- **Safety Rule**: `CONTRA-ENDO-AI-PREMENO-005` (ESMO / ASCO Guidelines).

### 2.5 Taxanes: Paclitaxel & Docetaxel
- **Primary Toxicities**: Peripheral sensory and motor neuropathy, severe myelosuppression (neutropenia), and hypersensitivity reactions.
- **Biochemical Mechanism**: Taxanes bind to and hyper-stabilize $\beta$-tubulin polymers, inhibiting normal microtubule depolymerization during mitotic spindle formation. In peripheral neurons, this causes axonal microtubule bundling, disrupting anterograde and retrograde axonal organelle transport and causing sensory axonal degeneration.
- **Clinical Benchmarks**:
  - Pre-existing peripheral neuropathy $\ge \text{Grade } 2$ represents a strong relative contraindication or mandate for regimen modification (e.g. albumin-bound paclitaxel, dose reduction, or alternative regimens).
  - Baseline Absolute Neutrophil Count (ANC) $< 1,500/\mu\text{L}$ mandates chemotherapy withholding until hematologic recovery.
- **Safety Rules**: `CONTRA-NEURO-TAXANE-006` and `CONTRA-HEME-TAX-NEUTR-007`.

### 2.6 Platinum Agents: Cisplatin & Carboplatin
- **Primary Toxicity**: Nephrotoxicity (acute kidney injury, renal tubular acidosis), ototoxicity, and severe myelosuppression.
- **Biochemical Mechanism**: Platinum complexes accumulate in renal proximal tubular epithelial cells via organic cation transporter 2 (OCT2), where they cross-link mitochondrial and genomic DNA, inducing reactive oxygen species and acute tubular necrosis.
- **Clinical Benchmark**: Creatinine Clearance ($\text{CrCl}$) $< 50\text{ mL/min}$ requires dose reduction or substitution (Carboplatin AUC-based dosing rather than Cisplatin); $\text{CrCl} < 30\text{ mL/min}$ contraindicates cisplatin and requires extreme caution with carboplatin.
- **Safety Rule**: `CONTRA-RENAL-PLATINUM-008`.

### 2.7 Pregnancy & Reproductive Teratogenicity
- **Primary Hazard**: Teratogenicity, congenital malformations, intrauterine growth restriction, and spontaneous abortion.
- **Biochemical Mechanism**: Cytotoxic agents disrupt rapidly dividing embryonic and fetal cell populations. Endocrine agents (Tamoxifen, AI) disrupt critical estrogen-mediated organogenesis. HER2-targeted agents (Trastuzumab) block ErbB2 in the fetal kidneys, leading to oligohydramnios sequence (Potter's syndrome), pulmonary hypoplasia, and neonatal death.
- **Clinical Benchmark**: Cytotoxic chemotherapy, targeted biotherapy, and endocrine therapy are **strictly contraindicated** during pregnancy (especially first trimester). Radiation therapy to the breast during pregnancy is absolutely contraindicated due to fetal scatter.
- **Safety Rule**: `CONTRA-PREG-TERATOGEN-010` (FDA Pregnancy Boxed Warnings).

---

## 3. Dynamic Safety Override Mechanism

A core architectural breakthrough of Sanket's module is the **Safety Override Engine** inside `treatment_reasoning.py`.

In conventional rule engines, biomarker matching may designate a drug as "recommended" (e.g. HER2 3+ tumor $\rightarrow$ Trastuzumab supported). If safety evaluation occurs independently without tight synthesis, contradictory recommendations reach the clinician.

Sanket's reasoning engine enforces an explicit override hierarchy:

```
            [Tumor Biology & Stage Evaluation]
                           │
                           ▼
          Candidate Regimen Status: "supported"
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
    [Safety Findings]            [Guideline Alignment]
             │                           │
  Does absolute contraindication        Matches ESMO/ASCO rule?
  or boxed warning match drug?           │
             │                           │
    YES: ────┼───────────────────────────┘
             │
             ▼
   OVERRIDE TO: "contraindication_flagged"
   - Injects clinical rationale detailing contraindication.
   - Attaches clinician action prompts with alternatives.
   - Escalates plan_status to "contraindication_flagged".
```

### Safety Override Verification Test Case
- **Patient**: HER2 3+, Stage IIA, Baseline LVEF = $42\%$.
- **Guideline Evaluation (Shravanya)**: Rule `ESMO-BC-2024-HER2-ADJ-001` evaluates as `applicable` (HER2+ tumor indicates adjuvant Trastuzumab).
- **Safety Evaluation (Sanket)**: Rule `CONTRA-CARD-HER2-001` fires: Absolute Contraindication / FDA Boxed Warning due to LVEF $< 50\%$.
- **Reasoning Synthesis (Sanket)**:
  - Adjuvant Trastuzumab eligibility status is **overridden** from `supported_for_consideration` $\rightarrow$ `contraindication_flagged`.
  - Clinician action prompt: *"CONTRAINDICATION: Withhold HER2-targeted monoclonal antibodies. Repeat echocardiogram in 4 weeks. Refer to cardio-oncology."*
  - Verified by automated unit test `test_cardiotoxicity_safety_override` in `tests/treatment/test_treatment_engine.py`.

