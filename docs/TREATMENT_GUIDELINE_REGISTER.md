# Treatment Guideline & Evidence Source Register
**Module Owner**: Sanket Patil (`sanketp09`)  
**Role**: Senior Clinical Software Engineer & Clinical Backend Architect  
**Component**: `src/treatment/treatment_evidence.py` & `treatment_options.py`  
**Guidelines**: ESMO Early Breast Cancer 2024, ASCO Practice Guidelines, St. Gallen 2023 Consensus

---

## 1. Overview of Treatment Evidence Register

All treatment templates codified in Sanket's Treatment Planning Engine (`TreatmentOptionCatalog`) are mapped directly to international consensus guidelines, landmark phase III clinical trials, and FDA approvals.

The engine does not recommend experimental or unvalidated protocols; every option reflects standard-of-care recommendations for early and locally advanced breast cancer.

---

## 2. Itemized Treatment Option Register

### 1. `OPT-SURG-BCS-001`
- **Treatment Category**: Surgical Intervention
- **Modality / Regimen**: Breast-Conserving Surgery (Partial Mastectomy / Lumpectomy) + Sentinel Lymph Node Biopsy (SLNB)
- **Clinical Intent**: Locoregional Control
- **Inclusion Criteria**: Unifocal disease ($\text{cT1-T2}$), favorable breast-to-tumor volume ratio, absence of diffuse microcalcifications, patient eligible for post-operative radiation.
- **Exclusion Criteria**: Multicentric carcinoma, extensive suspicious calcifications, persistent positive margins, prior thoracic radiation, pregnancy (if radiation required immediately).
- **Primary References**:
  - Loibl S, et al. Early breast cancer: ESMO Clinical Practice Guideline for diagnosis, treatment and follow-up. *Ann Oncol*. 2024.
  - Fisher B, et al. Twenty-year follow-up of a randomized trial comparing total mastectomy, lumpectomy, and lumpectomy plus irradiation for the treatment of invasive breast cancer. *N Engl J Med*. 2002;347(16):1233-1241.
  - Veronesi U, et al. Twenty-year follow-up of a randomized study comparing breast-conserving surgery with radical mastectomy for early breast cancer. *N Engl J Med*. 2002;347(16):1227-1232.
- **Evidence Level**: Level I, Grade A.

### 2. `OPT-SURG-MASTECTOMY-002`
- **Treatment Category**: Surgical Intervention
- **Modality / Regimen**: Total / Simple Mastectomy with SLNB (or Axillary Lymph Node Dissection if gross nodal burden)
- **Clinical Intent**: Locoregional Control
- **Inclusion Criteria**: Multicentric disease, extensive tumor-to-breast ratio, inability to obtain clear margins after lumpectomy, contraindications to radiation, patient preference, or high-penetrance genetic predisposition ($BRCA1/2$).
- **Primary References**:
  - ESMO Early Breast Cancer Clinical Practice Guidelines 2024.
  - St. Gallen International Consensus Conference 2023.
- **Evidence Level**: Level I, Grade A.

### 3. `OPT-RT-WHOLE-BREAST-003`
- **Treatment Category**: Locoregional Radiation Therapy
- **Modality / Regimen**: Moderately Hypofractionated Whole Breast Radiotherapy (WBRT)
- **Clinical Intent**: Locoregional Control & Recurrence Risk Reduction
- **Inclusion Criteria**: Mandatory post-operative standard following Breast-Conserving Surgery to eliminate residual microscopic disease. Standard schedule: $40\text{ Gy}$ in $15$ fractions over 3 weeks, or $26\text{ Gy}$ in $5$ fractions (FAST-Forward trial).
- **Safety Constraints**: Requires cardiac-sparing deep inspiration breath-hold (DIBH) techniques for left-sided breast tumors to minimize cardiac radiation exposure.
- **Primary References**:
  - Early Breast Cancer Trialists' Collaborative Group (EBCTCG). Effect of radiotherapy after breast-conserving surgery on 10-year recurrence and 15-year breast cancer death: meta-analysis of individual patient data. *Lancet*. 2011;378(9804):1707-1716.
  - Brunt AM, et al. Hypofractionated breast radiotherapy for 1 week versus 3 weeks (FAST-Forward): 5-year results from a multicentre, open-label, non-inferiority, randomised, phase 3 trial. *Lancet*. 2020;395(10237):1613-1626.
- **Evidence Level**: Level I, Grade A.

### 4. `OPT-NEOADJ-HER2-DUAL-004`
- **Treatment Category**: Neoadjuvant Systemic Therapy
- **Modality / Regimen**: Docetaxel + Carboplatin + Trastuzumab + Pertuzumab (TCHP $\times$ 6 cycles)
- **Clinical Intent**: Pathologic Complete Response (pCR) & Tumor Downstaging
- **Inclusion Criteria**: HER2-positive early breast cancer with tumor size $> 20\text{ mm}$ ($\text{cT2-T4}$) or node-positive ($\text{cN1-N3}$).
- **Safety Constraints**: Contraindicated if baseline LVEF $< 50\%$ or $\text{CrCl} < 50\text{ mL/min}$.
- **Primary References**:
  - Gianni L, et al. Efficacy and safety of neoadjuvant pertuzumab and trastuzumab in women with locally advanced, inflammatory, or early HER2-positive breast cancer (NeoSphere): a randomised multicentre, open-label, phase 2 trial. *Lancet Oncol*. 2012;13(1):25-32.
  - Schneeweiss A, et al. Pertuzumab plus trastuzumab in combination with standard neoadjuvant anthracycline-containing and anthracycline-free chemotherapy regimens in patients with HER2-positive early breast cancer: a randomized phase II cardiac safety study (TRYPHAENA). *Ann Oncol*. 2013;24(9):2278-2284.
- **Evidence Level**: Level I, Grade A (FDA Approved).

### 5. `OPT-NEOADJ-TNBC-KEYNOTE522-005`
- **Treatment Category**: Neoadjuvant Systemic Therapy
- **Modality / Regimen**: Pembrolizumab ($200\text{ mg}$ Q3W) + Carboplatin + Paclitaxel, followed by Pembrolizumab + Doxorubicin + Cyclophosphamide, then Adjuvant Pembrolizumab ($9$ cycles)
- **Clinical Intent**: Event-Free Survival (EFS) Improvement & pCR
- **Inclusion Criteria**: High-risk early Triple-Negative Breast Cancer (TNBC) with tumor size $> 20\text{ mm}$ ($\text{cT2-T4}$) or node-positive ($\text{cN1-N3}$).
- **Safety Constraints**: Contraindicated in active severe autoimmune disease, baseline severe cardiac failure, or pregnancy.
- **Primary References**:
  - Schmid P, et al. Event-free Survival with Neoadjuvant Pembrolizumab in Early Triple-Negative Breast Cancer (KEYNOTE-522). *N Engl J Med*. 2022;386(6):556-567.
  - US FDA Approval Notification: Pembrolizumab for high-risk early-stage TNBC, July 2021.
- **Evidence Level**: Level I, Grade A.

### 6. `OPT-ADJ-HER2-TRAST-006`
- **Treatment Category**: Targeted Biotherapy
- **Modality / Regimen**: Adjuvant Trastuzumab ($8\text{ mg/kg}$ loading, then $6\text{ mg/kg}$ IV Q3W to complete 1 full year)
- **Clinical Intent**: Distant Recurrence Risk Reduction
- **Inclusion Criteria**: HER2-positive invasive breast cancer with primary tumor $> 5\text{ mm}$ ($\text{cT1b-T4}$) or node-positive ($\text{cN1-N3}$).
- **Safety Constraints**: Strict requirement for baseline LVEF $\ge 50\%$ and serial cardiac monitoring at 3, 6, 9, and 12 months.
- **Primary References**:
  - Piccart-Gebhart MJ, et al. Trastuzumab after adjuvant chemotherapy in HER2-positive breast cancer (HERA). *N Engl J Med*. 2005;353(16):1659-1672.
  - Perez EA, et al. Four-year follow-up of trastuzumab plus adjuvant chemotherapy for operable human epidermal growth factor receptor 2-positive breast cancer: joint analysis of North Central Cancer Treatment Group N9831 and National Surgical Adjuvant Breast and Bowel Project B-31. *J Clin Oncol*. 2011;29(25):3366-3373.
- **Evidence Level**: Level I, Grade A.

### 7. `OPT-ENDO-AI-007`
- **Treatment Category**: Endocrine Therapy
- **Modality / Regimen**: Aromatase Inhibitor (Anastrozole $1\text{ mg}$ daily, Letrozole $2.5\text{ mg}$ daily, or Exemestane $25\text{ mg}$ daily for 5–10 years)
- **Clinical Intent**: Long-Term Recurrence Reduction
- **Inclusion Criteria**: Estrogen Receptor-positive ($\text{ER}^+$) and/or Progesterone Receptor-positive ($\text{PR}^+$) invasive breast cancer.
- **Menopausal Gating**: Standard of care in postmenopausal women. Strictly contraindicated as monotherapy in premenopausal women; requires concurrent Ovarian Function Suppression (OFS) via GnRH agonists or oophorectomy.
- **Primary References**:
  - Baum M, et al. Anastrozole alone or in combination with tamoxifen versus tamoxifen alone for adjuvant treatment of postmenopausal women with early breast cancer: first results of the ATAC randomised trial. *Lancet*. 2002;359(9324):2131-2139.
  - Francis PA, et al. Tailoring Adjuvant Endocrine Therapy for Premenopausal Breast Cancer (SOFT and TEXT Trials). *N Engl J Med*. 2018;379(2):122-137.
- **Evidence Level**: Level I, Grade A.

### 8. `OPT-ENDO-TAM-008`
- **Treatment Category**: Endocrine Therapy
- **Modality / Regimen**: Tamoxifen ($20\text{ mg}$ orally once daily for 5–10 years)
- **Clinical Intent**: Distant & Locoregional Recurrence Reduction
- **Inclusion Criteria**: Hormone Receptor-positive ($\text{ER}^+$ and/or $\text{PR}^+$) invasive breast cancer in premenopausal or postmenopausal women.
- **Safety Constraints**: Contraindicated in patients with active or prior thromboembolic disease (DVT, PE). Avoid concurrent strong CYP2D6 inhibitors.
- **Primary References**:
  - Early Breast Cancer Trialists' Collaborative Group (EBCTCG). Relevance of breast cancer hormone receptors and other factors to the efficacy of adjuvant tamoxifen: patient-level meta-analysis of randomised trials. *Lancet*. 2011;378(9793):771-784.
  - Davies C, et al. Long-term effects of continuing adjuvant tamoxifen to 10 years versus stopping at 5 years after diagnosis of oestrogen receptor-positive breast cancer: ATLAS, a randomised trial. *Lancet*. 2013;381(9869):805-816.
- **Evidence Level**: Level I, Grade A.

