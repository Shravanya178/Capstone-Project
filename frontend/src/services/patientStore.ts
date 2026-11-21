/**
/**
 * Oncology Patient Store & Clinical Workflow State Manager.
 * Provides realistic patient records, persistent active patient selection,
 * and maintains the clinical workflow pipeline:
 * Registration -> Document Upload -> NLP Extraction -> Oncologist Verification -> Staging -> Decision Support -> Final Report.
 */

export interface ClinicalDocument {
  id: string;
  name: string;
  category:
    | "Histopathology Report"
    | "Breast Biopsy Report"
    | "Immunohistochemistry (IHC) Report"
    | "HER2 ISH/FISH Report"
    | "Mammography Report"
    | "Ultrasound Report"
    | "Breast MRI Report"
    | "PET/CT Report"
    | "Blood Chemistry / CBC"
    | "Discharge Summary";
  uploadDate: string;
  fileType: string;
  fileSize: string;
  rawText: string;
  status: "uploaded" | "processing" | "extracted" | "verified";
}

export interface ExtractedFinding {
  id: string;
  category: "tumour" | "biomarkers" | "lymph_nodes" | "surgical" | "safety";
  label: string;
  fieldKey: string;
  extractedValue: string | number;
  verifiedValue: string | number;
  unit?: string;
  originalText: string;
  sourceDocName: string;
  confidence: number;
  status: "confirmed" | "edited" | "rejected" | "uncertain" | "missing";
  negation: boolean;
  uncertainty: boolean;
}

export interface PatientRecord {
  id: string;
  name: string;
  dob: string;
  age: number;
  sex: "Female" | "Male";
  contactPhone?: string;
  contactEmail?: string;
  diagnosisDate: string;
  medicalHistory: string;
  comorbidities: string[];
  currentMedications: string[];
  knownAllergies: string[];
  menopausalStatus: "premenopausal" | "perimenopausal" | "postmenopausal" | "unknown";
  pregnancyStatus: "negative" | "positive" | "not_applicable" | "untested";
  status: "awaiting_documents" | "awaiting_verification" | "assessment_complete" | "incomplete_info";
  documents: ClinicalDocument[];
  extractedFindings: ExtractedFinding[];
  verified: boolean;
  // Clinical Interpretation
  clinicalStaging: {
    tCategory: string;
    nCategory: string;
    mCategory: string;
    stageGroup: string;
    tumorSizeMm?: number;
    isIncomplete: boolean;
  };
  biomarkers: {
    erStatus: "positive" | "negative" | "er_low_positive" | "unknown";
    erPercent?: number;
    prStatus: "positive" | "negative" | "unknown";
    prPercent?: number;
    her2Ihc: "0" | "1+" | "2+" | "3+" | "not_reported";
    her2Status: "positive" | "negative" | "equivocal" | "unknown";
    her2FishRatio?: number;
    ki67Percent?: number;
    histologicGrade: string;
    histologicType: string;
    surrogateSubtype: string;
  };
  safetyStatus: {
    overallStatus: "safe" | "caution" | "relative_contraindication" | "absolute_contraindication" | "insufficient_information";
    lvefPercent?: number;
    crclMlMin?: number;
    warnings: Array<{
      ruleId: string;
      title: string;
      severity: "critical" | "major" | "moderate" | "safe";
      description: string;
      clinicalAction: string;
    }>;
  };
  guidelinesTriggered: Array<{
    ruleId: string;
    ruleName: string;
    source: string;
    status: "applicable" | "requires_review" | "not_applicable";
    rationale: string;
    suggestedPathway: string;
  }>;
  treatmentOptions: Array<{
    id: string;
    title: string;
    modality: string;
    intent: string;
    status: "supported" | "contraindicated" | "review_required";
    supportingGuideline: string;
    rationale: string;
    contraindicationNote?: string;
  }>;
  oncologistNotes?: string;
}

const INITIAL_PATIENTS: PatientRecord[] = [
  {
    id: "BC-2026-0842",
    name: "Margaret Sullivan",
    dob: "1964-05-14",
    age: 62,
    sex: "Female",
    contactPhone: "+1 (312) 555-0142",
    contactEmail: "m.sullivan@demo-care.org",
    diagnosisDate: "2026-10-18",
    medicalHistory: "Screen-detected left breast mass on routine screening mammography. No personal or family history of breast/ovarian malignancy.",
    comorbidities: ["Mild Essential Hypertension", "Osteopenia"],
    currentMedications: ["Amlodipine 5mg OD", "Calcium + Vitamin D3"],
    knownAllergies: ["Penicillin (mild cutaneous rash)"],
    menopausalStatus: "postmenopausal",
    pregnancyStatus: "not_applicable",
    status: "assessment_complete",
    verified: true,
    documents: [
      {
        id: "DOC-001",
        name: "Left_Breast_Core_Biopsy_Pathology.pdf",
        category: "Histopathology Report",
        uploadDate: "2026-10-22",
        fileType: "application/pdf",
        fileSize: "482 KB",
        rawText:
          "CLINICAL HISTORY: 62yo female with 2.2 cm left upper outer quadrant mass.\n" +
          "HISTOPATHOLOGY: Invasive ductal carcinoma (NST), Nottingham histological grade 2 (tubule 2, pleomorphism 2, mitosis 1, total score 5/9).\n" +
          "IMMUNOHISTOCHEMISTRY:\n" +
          "- Estrogen Receptor (ER): Strong nuclear positivity in 85% of tumor cells.\n" +
          "- Progesterone Receptor (PR): Moderate nuclear positivity in 70% of tumor cells.\n" +
          "- HER2/neu: Score 1+ (Negative, membranous staining weak and incomplete).\n" +
          "- Ki-67 proliferation index: 12% positive nuclei.\n" +
          "- Lymphovascular invasion (LVI): Not identified.\n" +
          "- E-cadherin: Positive, consistent with ductal phenotype.",
        status: "verified",
      },
      {
        id: "DOC-002",
        name: "Bilateral_Diagnostic_Mammogram_and_US.pdf",
        category: "Mammography Report",
        uploadDate: "2026-10-20",
        fileType: "application/pdf",
        fileSize: "1.2 MB",
        rawText:
          "FINDINGS: Left breast at 2 o'clock, 5 cm from nipple: Spiculated hypoechoic mass measuring 22 x 18 x 20 mm (max dimension 2.2 cm). No microcalcifications beyond mass margins. Right breast unremarkable.\n" +
          "AXILLA: Normal morphologic left axillary lymph nodes with preserved fatty hilum and cortex < 2.5 mm.\n" +
          "IMPRESSION: BI-RADS 5 - Highly suggestive of malignancy (cT2 cN0).",
        status: "verified",
      },
    ],
    extractedFindings: [
      {
        id: "FND-001",
        category: "tumour",
        label: "Tumour Maximum Dimension",
        fieldKey: "primary_tumor_size_mm",
        extractedValue: 22,
        verifiedValue: 22,
        unit: "mm",
        originalText: "measuring 22 x 18 x 20 mm (max dimension 2.2 cm)",
        sourceDocName: "Bilateral_Diagnostic_Mammogram_and_US.pdf",
        confidence: 0.98,
        status: "confirmed",
        negation: false,
        uncertainty: false,
      },
      {
        id: "FND-002",
        category: "tumour",
        label: "Histological Type",
        fieldKey: "histologic_type",
        extractedValue: "Invasive Ductal Carcinoma",
        verifiedValue: "Invasive Ductal Carcinoma",
        originalText: "Invasive ductal carcinoma (NST)",
        sourceDocName: "Left_Breast_Core_Biopsy_Pathology.pdf",
        confidence: 0.99,
        status: "confirmed",
        negation: false,
        uncertainty: false,
      },
      {
        id: "FND-003",
        category: "tumour",
        label: "Nottingham Histological Grade",
        fieldKey: "histologic_grade",
        extractedValue: "Grade 2 (Intermediate)",
        verifiedValue: "Grade 2 (Intermediate)",
        originalText: "Nottingham histological grade 2 (tubule 2, pleomorphism 2, mitosis 1, total score 5/9)",
        sourceDocName: "Left_Breast_Core_Biopsy_Pathology.pdf",
        confidence: 0.97,
        status: "confirmed",
        negation: false,
        uncertainty: false,
      },
      {
        id: "FND-004",
        category: "biomarkers",
        label: "Estrogen Receptor (ER) Expression",
        fieldKey: "er_percentage",
        extractedValue: 85,
        verifiedValue: 85,
        unit: "%",
        originalText: "Estrogen Receptor (ER): Strong nuclear positivity in 85% of tumor cells",
        sourceDocName: "Left_Breast_Core_Biopsy_Pathology.pdf",
        confidence: 0.99,
        status: "confirmed",
        negation: false,
        uncertainty: false,
      },
      {
        id: "FND-005",
        category: "biomarkers",
        label: "Progesterone Receptor (PR) Expression",
        fieldKey: "pr_percentage",
        extractedValue: 70,
        verifiedValue: 70,
        unit: "%",
        originalText: "Progesterone Receptor (PR): Moderate nuclear positivity in 70% of tumor cells",
        sourceDocName: "Left_Breast_Core_Biopsy_Pathology.pdf",
        confidence: 0.99,
        status: "confirmed",
        negation: false,
        uncertainty: false,
      },
      {
        id: "FND-006",
        category: "biomarkers",
        label: "HER2 / neu IHC Score",
        fieldKey: "her2_ihc_score",
        extractedValue: "1+ (Negative)",
        verifiedValue: "1+ (Negative)",
        originalText: "HER2/neu: Score 1+ (Negative, membranous staining weak and incomplete)",
        sourceDocName: "Left_Breast_Core_Biopsy_Pathology.pdf",
        confidence: 0.98,
        status: "confirmed",
        negation: false,
        uncertainty: false,
      },
      {
        id: "FND-007",
        category: "biomarkers",
        label: "Ki-67 Proliferation Index",
        fieldKey: "ki67_index",
        extractedValue: 12,
        verifiedValue: 12,
        unit: "%",
        originalText: "Ki-67 proliferation index: 12% positive nuclei",
        sourceDocName: "Left_Breast_Core_Biopsy_Pathology.pdf",
        confidence: 0.96,
        status: "confirmed",
        negation: false,
        uncertainty: false,
      },
      {
        id: "FND-008",
        category: "lymph_nodes",
        label: "Axillary Lymph Node Status",
        fieldKey: "clinical_n_stage",
        extractedValue: "cN0 (Clinically Negative)",
        verifiedValue: "cN0 (Clinically Negative)",
        originalText: "Normal morphologic left axillary lymph nodes with preserved fatty hilum",
        sourceDocName: "Bilateral_Diagnostic_Mammogram_and_US.pdf",
        confidence: 0.95,
        status: "confirmed",
        negation: false,
        uncertainty: false,
      },
    ],
    clinicalStaging: {
      tCategory: "cT2",
      nCategory: "cN0",
      mCategory: "cM0",
      stageGroup: "Stage IIA",
      tumorSizeMm: 22,
      isIncomplete: false,
    },
    biomarkers: {
      erStatus: "positive",
      erPercent: 85,
      prStatus: "positive",
      prPercent: 70,
      her2Ihc: "1+",
      her2Status: "negative",
      ki67Percent: 12,
      histologicGrade: "Grade 2",
      histologicType: "Invasive Ductal Carcinoma (NST)",
      surrogateSubtype: "Luminal A (HR+/HER2-)",
    },
    safetyStatus: {
      overallStatus: "safe",
      lvefPercent: 62,
      crclMlMin: 78,
      warnings: [],
    },
    guidelinesTriggered: [
      {
        ruleId: "ESMO-2024-LUMINAL-EARLY",
        ruleName: "Early Stage Hormone Receptor-Positive HER2-Negative Breast Cancer",
        source: "ESMO Clinical Practice Guidelines 2024 / ASCO 2023",
        status: "applicable",
        rationale: "ER > 10%, PR > 20%, HER2 negative with low proliferation (Ki-67 12%). Primary consideration is breast-conserving surgery followed by adjuvant endocrine therapy.",
        suggestedPathway: "Breast-Conserving Surgery + Sentinel Lymph Node Biopsy -> Adjuvant Radiation -> 5 Years Aromatase Inhibitor (Letrozole or Anastrozole)",
      },
    ],
    treatmentOptions: [
      {
        id: "TX-01",
        title: "Breast-Conserving Surgery (Lumpectomy) + SLNB",
        modality: "Surgical Locoregional",
        intent: "Curative Locoregional",
        status: "supported",
        supportingGuideline: "ESMO 2024 / NCCN Category 1",
        rationale: "Tumor size 2.2 cm in average-sized breast allows clear margins with favorable cosmetic outcome.",
      },
      {
        id: "TX-02",
        title: "Adjuvant Endocrine Therapy: Non-Steroidal Aromatase Inhibitor",
        modality: "Endocrine Hormonal",
        intent: "Adjuvant Systemic",
        status: "supported",
        supportingGuideline: "ESMO 2024 / ASCO Adjuvant Endocrine Guidelines",
        rationale: "Patient is postmenopausal with high ER/PR positivity (85%/70%). 5 years of Letrozole (2.5mg OD) or Anastrozole (1mg OD) significantly reduces recurrence risk.",
      },
      {
        id: "TX-03",
        title: "Whole Breast Adjuvant Hypofractionated Radiotherapy",
        modality: "Locoregional Radiation",
        intent: "Adjuvant Locoregional",
        status: "supported",
        supportingGuideline: "ASTRO / ESMO 2024 Hypofractionated Protocol",
        rationale: "Mandated following breast-conserving surgery (40 Gy in 15 fractions over 3 weeks).",
      },
    ],
    oncologistNotes: "Patient informed of biopsy findings. Scheduled for multidisciplinary tumor board discussion on Tuesday.",
  },
  {
    id: "BC-2026-0914",
    name: "Elena Rostova",
    dob: "1978-08-22",
    age: 48,
    sex: "Female",
    contactPhone: "+1 (312) 555-0194",
    diagnosisDate: "2026-11-02",
    medicalHistory: "Palpable right breast lump noticed 4 weeks ago. Premenopausal with regular menstrual cycles.",
    comorbidities: ["No significant past medical history"],
    currentMedications: ["None"],
    knownAllergies: ["No known drug allergies (NKDA)"],
    menopausalStatus: "premenopausal",
    pregnancyStatus: "negative",
    status: "awaiting_verification",
    verified: false,
    documents: [
      {
        id: "DOC-003",
        name: "Right_Breast_Core_Needle_Biopsy.pdf",
        category: "Histopathology Report",
        uploadDate: "2026-11-05",
        fileType: "application/pdf",
        fileSize: "512 KB",
        rawText:
          "RIGHT BREAST CORE BIOPSY:\n" +
          "Invasive ductal carcinoma, Grade 3 (tubule 3, nuclear 3, mitosis 3, total 9/9).\n" +
          "Tumor dimension: Core fragments show extensive tumor spanning 28 mm.\n" +
          "BIOMARKER STUDY:\n" +
          "- Estrogen Receptor (ER): Negative (< 1% nuclear staining).\n" +
          "- Progesterone Receptor (PR): Negative (< 1% nuclear staining).\n" +
          "- HER2/neu IHC: Score 2+ (EQUIVOCAL: Weak to moderate complete membrane staining in > 10% of tumor cells).\n" +
          "- Ki-67 index: 45% positive nuclei.\n" +
          "NOTE: Per ASCO/CAP 2018 guidelines, reflex In Situ Hybridization (FISH/CISH) has been ordered to assess HER2 gene amplification.",
        status: "uploaded",
      },
    ],
    extractedFindings: [
      {
        id: "FND-009",
        category: "tumour",
        label: "Tumour Size",
        fieldKey: "primary_tumor_size_mm",
        extractedValue: 28,
        verifiedValue: 28,
        unit: "mm",
        originalText: "Core fragments show extensive tumor spanning 28 mm",
        sourceDocName: "Right_Breast_Core_Needle_Biopsy.pdf",
        confidence: 0.94,
        status: "uncertain",
        negation: false,
        uncertainty: true,
      },
      {
        id: "FND-010",
        category: "biomarkers",
        label: "HER2 / neu IHC Score",
        fieldKey: "her2_ihc_score",
        extractedValue: "2+ (Equivocal)",
        verifiedValue: "2+ (Equivocal)",
        originalText: "HER2/neu IHC: Score 2+ (EQUIVOCAL: Weak to moderate complete membrane staining)",
        sourceDocName: "Right_Breast_Core_Needle_Biopsy.pdf",
        confidence: 0.99,
        status: "confirmed",
        negation: false,
        uncertainty: true,
      },
      {
        id: "FND-011",
        category: "biomarkers",
        label: "Estrogen Receptor (ER)",
        fieldKey: "er_status",
        extractedValue: "Negative (< 1%)",
        verifiedValue: "Negative (< 1%)",
        originalText: "Estrogen Receptor (ER): Negative (< 1% nuclear staining)",
        sourceDocName: "Right_Breast_Core_Needle_Biopsy.pdf",
        confidence: 0.98,
        status: "confirmed",
        negation: true,
        uncertainty: false,
      },
    ],
    clinicalStaging: {
      tCategory: "cT2",
      nCategory: "cN1",
      mCategory: "cM0",
      stageGroup: "Stage IIB",
      tumorSizeMm: 28,
      isIncomplete: false,
    },
    biomarkers: {
      erStatus: "negative",
      erPercent: 0,
      prStatus: "negative",
      prPercent: 0,
      her2Ihc: "2+",
      her2Status: "equivocal",
      ki67Percent: 45,
      histologicGrade: "Grade 3",
      histologicType: "Invasive Ductal Carcinoma",
      surrogateSubtype: "HER2 Status Pending Reflex ISH",
    },
    safetyStatus: {
      overallStatus: "caution",
      warnings: [
        {
          ruleId: "SAFE-REFLEX-HOLD",
          title: "HER2 IHC 2+ Equivocal — Anti-HER2 Regimens Held",
          severity: "major",
          description: "Anti-HER2 targeted monoclonal antibodies (Trastuzumab, Pertuzumab) must not be ordered until FISH/ISH confirms amplification ratio >= 2.0 or HER2 copy number >= 6.0.",
          clinicalAction: "Await Path Dept FISH result before finalizing neoadjuvant protocol.",
        },
      ],
    },
    guidelinesTriggered: [
      {
        ruleId: "ASCO-2018-HER2-REFLEX",
        ruleName: "Mandatory In Situ Hybridization Reflex Testing",
        source: "ASCO/CAP 2018 Clinical Practice Guideline",
        status: "requires_review",
        rationale: "IHC 2+ is equivocal. Clinical decision requires confirmatory dual-probe ISH testing.",
        suggestedPathway: "Order automated reflex dual-probe ISH on original block.",
      },
    ],
    treatmentOptions: [
      {
        id: "TX-04",
        title: "Neoadjuvant Targeted Therapy (TCHP)",
        modality: "Targeted Biotherapy",
        intent: "Neoadjuvant Curative",
        status: "review_required",
        supportingGuideline: "ESMO 2024 / TRYPHAENA Trial",
        rationale: "Candidate regimen IF reflex FISH confirms HER2 amplification. Currently held under safety guardrail.",
        contraindicationNote: "Requires FISH confirmation before initiation.",
      },
    ],
  },
  {
    id: "BC-2026-1022",
    name: "Priya Sharma",
    dob: "1972-11-09",
    age: 54,
    sex: "Female",
    contactPhone: "+1 (312) 555-0102",
    diagnosisDate: "2026-11-10",
    medicalHistory: "Diagnosed with aggressive left breast lump. Baseline cardiac echocardiogram performed 1 week ago.",
    comorbidities: ["Post-myocardial ischemic cardiomyopathy", "Type 2 Diabetes Mellitus"],
    currentMedications: ["Metformin 1000mg BD", "Lisinopril 10mg OD", "Bisoprolol 2.5mg OD"],
    knownAllergies: ["Sulfa drugs"],
    menopausalStatus: "postmenopausal",
    pregnancyStatus: "not_applicable",
    status: "assessment_complete",
    verified: true,
    documents: [],
    extractedFindings: [],
    clinicalStaging: {
      tCategory: "cT2",
      nCategory: "cN1",
      mCategory: "cM0",
      stageGroup: "Stage IIB",
      tumorSizeMm: 35,
      isIncomplete: false,
    },
    biomarkers: {
      erStatus: "negative",
      erPercent: 0,
      prStatus: "negative",
      prPercent: 0,
      her2Ihc: "0",
      her2Status: "negative",
      ki67Percent: 65,
      histologicGrade: "Grade 3",
      histologicType: "Triple-Negative Invasive Carcinoma (TNBC)",
      surrogateSubtype: "Triple-Negative (TNBC)",
    },
    safetyStatus: {
      overallStatus: "absolute_contraindication",
      lvefPercent: 42,
      crclMlMin: 65,
      warnings: [
        {
          ruleId: "SAFE-CARDIO-LVEF45",
          title: "Left Ventricular Ejection Fraction 42% (<= 45%)",
          severity: "critical",
          description: "Anthracyclines (Doxorubicin, Epirubicin) and Trastuzumab are strictly contraindicated. Severe risk of irreversible cardiomyopathy.",
          clinicalAction: "Select non-anthracycline platinum/taxane regimen; cardiology co-management mandatory.",
        },
      ],
    },
    guidelinesTriggered: [
      {
        ruleId: "ESMO-2024-TNBC-EARLY",
        ruleName: "Early Stage Triple-Negative Breast Cancer (Keynote-522)",
        source: "ESMO 2024 Guidelines / KEYNOTE-522 Trial",
        status: "applicable",
        rationale: "Stage IIB TNBC patient eligible for neoadjuvant chemotherapy plus pembrolizumab.",
        suggestedPathway: "Carboplatin + Paclitaxel + Pembrolizumab (Anthracyclines omitted due to LVEF 42%).",
      },
    ],
    treatmentOptions: [
      {
        id: "TX-05",
        title: "Anthracycline-Containing AC-T Regimen",
        modality: "Systemic Chemotherapy",
        intent: "Neoadjuvant",
        status: "contraindicated",
        supportingGuideline: "NCCN Guidelines",
        rationale: "Omitted: LVEF 42% breaches cardiac safety cutoff.",
        contraindicationNote: "ABSOLUTE CONTRAINDICATION: Documented LVEF 42% <= 45%.",
      },
      {
        id: "TX-06",
        title: "Carboplatin + Paclitaxel + Pembrolizumab (Non-Anthracycline)",
        modality: "Neoadjuvant Chemo-Immunotherapy",
        intent: "Neoadjuvant Curative",
        status: "supported",
        supportingGuideline: "ESMO 2024 / KEYNOTE-522 Modified",
        rationale: "Anthracycline-sparing regimen with proven pathological complete response (pCR) efficacy.",
      },
    ],
  },
];

export const PatientStore = {
  getPatients(): PatientRecord[] {
    if (typeof window === "undefined") return INITIAL_PATIENTS;
    try {
      const stored = localStorage.getItem("cdss_oncology_patients");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return INITIAL_PATIENTS;
  },

  savePatients(patients: PatientRecord[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("cdss_oncology_patients", JSON.stringify(patients));
    } catch {
      // ignore
    }
  },

  getPatient(id: string): PatientRecord | undefined {
    const list = this.getPatients();
    return list.find((p) => p.id === id);
  },

  getActivePatientId(): string {
    if (typeof window === "undefined") return "BC-2026-0842";
    try {
      const active = localStorage.getItem("cdss_active_patient_id");
      if (active) return active;
    } catch {
      // fallback
    }
    return "BC-2026-0842";
  },

  setActivePatientId(id: string) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("cdss_active_patient_id", id);
      window.dispatchEvent(new Event("cdss_active_patient_changed"));
    } catch {
      // ignore
    }
  },

  getActivePatient(): PatientRecord {
    const activeId = this.getActivePatientId();
    const patient = this.getPatient(activeId);
    return patient || INITIAL_PATIENTS[0];
  },

  registerPatient(data: Omit<PatientRecord, "id" | "status" | "documents" | "extractedFindings" | "verified" | "clinicalStaging" | "biomarkers" | "safetyStatus" | "guidelinesTriggered" | "treatmentOptions">): PatientRecord {
    const patients = this.getPatients();
    const newId = `BC-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const newRecord: PatientRecord = {
      ...data,
      id: newId,
      status: "awaiting_documents",
      verified: false,
      documents: [],
      extractedFindings: [],
      clinicalStaging: {
        tCategory: "cTX",
        nCategory: "cNX",
        mCategory: "cM0",
        stageGroup: "Incomplete staging information",
        isIncomplete: true,
      },
      biomarkers: {
        erStatus: "unknown",
        prStatus: "unknown",
        her2Ihc: "not_reported",
        her2Status: "unknown",
        histologicGrade: "Pending pathology",
        histologicType: "Pending biopsy",
        surrogateSubtype: "Unclassified",
      },
      safetyStatus: {
        overallStatus: "insufficient_information",
        warnings: [
          {
            ruleId: "SAFE-BASE-INCOMPLETE",
            title: "Baseline Clinical Telemetry Incomplete",
            severity: "moderate",
            description: "No laboratory records or cardiac telemetry uploaded yet. Parameters are never assumed normal.",
            clinicalAction: "Upload diagnostic reports and baseline lab panel.",
          },
        ],
      },
      guidelinesTriggered: [],
      treatmentOptions: [],
    };

    patients.unshift(newRecord);
    this.savePatients(patients);
    this.setActivePatientId(newId);
    return newRecord;
  },

  addDocument(patientId: string, doc: Omit<ClinicalDocument, "id" | "uploadDate" | "status">): ClinicalDocument {
    const patients = this.getPatients();
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) throw new Error("Patient not found");

    const newDoc: ClinicalDocument = {
      ...doc,
      id: `DOC-${Date.now().toString().slice(-4)}`,
      uploadDate: new Date().toISOString().split("T")[0],
      status: "uploaded",
    };

    patient.documents.unshift(newDoc);
    if (patient.status === "awaiting_documents") {
      patient.status = "awaiting_verification";
    }
    this.savePatients(patients);
    return newDoc;
  },

  updateFindings(patientId: string, findings: ExtractedFinding[]) {
    const patients = this.getPatients();
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return;

    patient.extractedFindings = findings;
    patient.status = "awaiting_verification";
    this.savePatients(patients);
  },

  confirmAndMapRecord(patientId: string, verifiedFindings: ExtractedFinding[], notes?: string) {
    const patients = this.getPatients();
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return;

    patient.extractedFindings = verifiedFindings;
    patient.verified = true;
    patient.status = "assessment_complete";
    if (notes) patient.oncologistNotes = notes;

    // Map verified findings to biomarkers & staging
    verifiedFindings.forEach((f) => {
      if (f.status === "rejected") return;
      const val = f.verifiedValue;

      if (f.fieldKey === "primary_tumor_size_mm") {
        const num = Number(val);
        if (!isNaN(num)) {
          patient.clinicalStaging.tumorSizeMm = num;
          if (num <= 20) patient.clinicalStaging.tCategory = "cT1c";
          else if (num <= 50) patient.clinicalStaging.tCategory = "cT2";
          else patient.clinicalStaging.tCategory = "cT3";
        }
      }
      if (f.fieldKey === "er_percentage") {
        const num = Number(val);
        if (!isNaN(num)) {
          patient.biomarkers.erPercent = num;
          if (num >= 10) patient.biomarkers.erStatus = "positive";
          else if (num >= 1) patient.biomarkers.erStatus = "er_low_positive";
          else patient.biomarkers.erStatus = "negative";
        }
      }
      if (f.fieldKey === "pr_percentage") {
        const num = Number(val);
        if (!isNaN(num)) {
          patient.biomarkers.prPercent = num;
          patient.biomarkers.prStatus = num >= 1 ? "positive" : "negative";
        }
      }
      if (f.fieldKey === "her2_ihc_score") {
        const s = String(val);
        if (s.includes("0") || s.includes("1+")) {
          patient.biomarkers.her2Ihc = s.includes("0") ? "0" : "1+";
          patient.biomarkers.her2Status = "negative";
        } else if (s.includes("2+")) {
          patient.biomarkers.her2Ihc = "2+";
          patient.biomarkers.her2Status = "equivocal";
        } else if (s.includes("3+")) {
          patient.biomarkers.her2Ihc = "3+";
          patient.biomarkers.her2Status = "positive";
        }
      }
      if (f.fieldKey === "ki67_index") {
        const num = Number(val);
        if (!isNaN(num)) patient.biomarkers.ki67Percent = num;
      }
      if (f.fieldKey === "histologic_grade") {
        patient.biomarkers.histologicGrade = String(val);
      }
      if (f.fieldKey === "histologic_type") {
        patient.biomarkers.histologicType = String(val);
      }
    });

    // Recompute surrogate subtype
    const b = patient.biomarkers;
    if (b.her2Status === "equivocal") {
      b.surrogateSubtype = "HER2 Equivocal (Awaiting Reflex ISH)";
    } else if (b.erStatus === "positive" && b.her2Status === "negative") {
      if ((b.ki67Percent && b.ki67Percent < 20) || b.histologicGrade.includes("1")) {
        b.surrogateSubtype = "Luminal A (HR+/HER2-)";
      } else {
        b.surrogateSubtype = "Luminal B (HER2-)";
      }
    } else if (b.erStatus === "positive" && b.her2Status === "positive") {
      b.surrogateSubtype = "Luminal B (Triple Positive)";
    } else if (b.erStatus === "negative" && b.prStatus === "negative" && b.her2Status === "positive") {
      b.surrogateSubtype = "HER2-Enriched";
    } else if (b.erStatus === "negative" && b.prStatus === "negative" && b.her2Status === "negative") {
      b.surrogateSubtype = "Triple-Negative (TNBC)";
    }

    // Recompute Stage
    const s = patient.clinicalStaging;
    if (s.tCategory !== "cTX" && s.nCategory !== "cNX") {
      s.isIncomplete = false;
      if (s.tCategory === "cT1c" && s.nCategory === "cN0") s.stageGroup = "Stage IA";
      else if (s.tCategory === "cT2" && s.nCategory === "cN0") s.stageGroup = "Stage IIA";
      else if (s.tCategory === "cT2" && s.nCategory === "cN1") s.stageGroup = "Stage IIB";
      else if (s.tCategory === "cT3") s.stageGroup = "Stage IIIA";
    } else {
      s.isIncomplete = true;
      s.stageGroup = "Incomplete staging information";
    }

    this.savePatients(patients);
  },
};

export const getPatients = (): PatientRecord[] => PatientStore.getPatients();
export const getActivePatient = (): PatientRecord | null => PatientStore.getActivePatient();
export const setActivePatientId = (id: string): void => PatientStore.setActivePatientId(id);
export const getPatient = (id: string): PatientRecord | undefined => PatientStore.getPatient(id);
export const savePatients = (patients: PatientRecord[]): void => PatientStore.savePatients(patients);

