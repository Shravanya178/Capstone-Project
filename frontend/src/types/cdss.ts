/**
 * TypeScript Data Contracts for Breast Cancer CDSS.
 * Derived from JSON Schema Draft 2020-12 specifications.
 */

export interface Provenance {
  source_dataset: string;
  source_file: string;
  source_record_id: string;
  source_field_path?: string | null;
}

export interface ExtractionMetadata {
  method:
    | "structured_parser"
    | "dicom_sr_parser"
    | "nlp_bio_clinicalbert"
    | "nlp_bio_clinicalbert_finetuned"
    | "rule_regex"
    | "rule_regex_fallback"
    | "manual_entry";
  confidence?: number | null;
}

export interface ClinicalObservation {
  observation_id: string;
  concept: string;
  normalized_value: any;
  raw_value: any;
  status:
    | "documented"
    | "not_reported"
    | "not_assessed"
    | "not_available"
    | "unknown"
    | "equivocal"
    | "conflicting"
    | "not_applicable";
  unit?: string | null;
  timepoint:
    | "baseline"
    | "pre_treatment"
    | "during_treatment"
    | "during_treatment_early_ac"
    | "during_treatment_inter_regimen"
    | "pre_surgical_resection"
    | "post_treatment_resection"
    | "outcome";
  provenance: Provenance;
  extraction: ExtractionMetadata;
  extra_metadata?: Record<string, any>;
}

export interface Demographics {
  age?: number | null;
  menopausal_status: "premenopausal" | "perimenopausal" | "postmenopausal" | "unknown";
  race_ethnicity?: string | null;
  status: string;
}

export interface ClinicalExtent {
  laterality?: "left" | "right" | "bilateral" | "unknown" | null;
  primary_tumor_size_mm?: number | null;
  clinical_t_stage?: string | null;
  clinical_n_stage?: string | null;
  clinical_m_stage?: string | null;
  anatomic_stage?: string | null;
  status: string;
}

export interface PathologyBiomarkers {
  histologic_type?: string | null;
  histologic_grade?: "grade_1" | "grade_2" | "grade_3" | "unknown" | null;
  er_status: "positive" | "negative" | "equivocal" | "unknown" | "not_reported";
  er_percentage?: number | null;
  er_low_flag?: boolean;
  pr_status: "positive" | "negative" | "equivocal" | "unknown" | "not_reported";
  pr_percentage?: number | null;
  her2_status: "positive" | "negative" | "equivocal" | "unknown" | "not_reported";
  her2_ihc_score?: "0" | "1+" | "2+" | "3+" | "unknown" | null;
  her2_fish_ratio?: number | null;
  her2_fish_status?: "positive" | "negative" | "equivocal" | null;
  ki67_index?: number | null;
  molecular_subtype:
    | "luminal_a"
    | "luminal_b_her2_negative"
    | "luminal_b_her2_positive"
    | "her2_enriched"
    | "triple_negative"
    | "unknown";
  status: string;
}

export interface PatientProfile {
  patient_id: string;
  source_dataset: string;
  source_patient_id: string;
  profile_generation_timestamp: string;
  demographics: Demographics;
  clinical_extent: ClinicalExtent;
  pathology_biomarkers: PathologyBiomarkers;
  observations: ClinicalObservation[];
  clinical_timepoints?: Array<{
    timepoint: string;
    description?: string;
    observations: ClinicalObservation[];
  }>;
  review_flags: Array<{
    flag_type: string;
    field: string;
    reason: string;
    requires_clinician_action: boolean;
  }>;
}

export interface GuidelineCheckItem {
  rule_id: string;
  rule_name: string;
  guideline_source: string;
  clinical_focus: string;
  result: "applicable" | "not_applicable" | "insufficient_information" | "requires_review";
  manual_review_required: boolean;
  matched_criteria: string[];
  missing_criteria: string[];
  explanation: string;
  clinician_action_prompt?: string | null;
  source: {
    guideline: string;
    version: string;
    section?: string;
    document_reference?: string;
  };
}

export interface GuidelineCheckOutput {
  patient_id: string;
  evaluation_timestamp: string;
  upstream_profile_version: string;
  checks: GuidelineCheckItem[];
}

export interface SafetyFinding {
  finding_id: string;
  safety_category:
    | "absolute_contraindication"
    | "relative_contraindication"
    | "black_box_warning"
    | "drug_interaction"
    | "precaution"
    | "organ_toxicity_risk";
  medication_or_class: string;
  severity: "critical" | "major" | "moderate";
  triggering_condition: string;
  explanation: string;
  clinician_recommendation: string;
  evidence_source: string;
  fda_boxed_warning: boolean;
}

export interface OrganFunctionAssessment {
  status: "documented" | "not_assessed" | "unknown";
  risk_category: string;
  measured_value?: number | string | null;
  unit?: string | null;
  notes?: string;
  [key: string]: any;
}

export interface SafetyAssessment {
  patient_id: string;
  assessment_timestamp: string;
  upstream_profile_version: string;
  overall_safety_status:
    | "contraindication_identified"
    | "potential_interaction"
    | "precaution_identified"
    | "insufficient_information"
    | "no_identified_issue_in_available_data";
  manual_review_required: boolean;
  safety_findings: SafetyFinding[];
  organ_function_assessments: {
    cardiac_function: OrganFunctionAssessment;
    renal_function: OrganFunctionAssessment;
    hepatic_function: OrganFunctionAssessment;
    hematologic_function: OrganFunctionAssessment;
    reproductive_status: OrganFunctionAssessment;
  };
  missing_safety_information: Array<{
    parameter_name: string;
    required_for_evaluation_of: string;
    clinical_risk_if_unassessed: string;
    status: string;
  }>;
  dataset_limitations: string[];
}

export interface TreatmentOption {
  treatment_option_id: string;
  treatment_category:
    | "surgical_intervention"
    | "locoregional_radiation_therapy"
    | "neoadjuvant_systemic_therapy"
    | "adjuvant_systemic_therapy"
    | "endocrine_therapy"
    | "targeted_biotherapy"
    | "supportive_bone_modifying_agent";
  regimen_or_modality: string;
  clinical_intent: string;
  eligibility_status:
    | "supported_for_consideration"
    | "requires_clinician_review"
    | "contraindication_flagged"
    | "insufficient_information"
    | "not_supported_by_available_information";
  supporting_observations: string[];
  supporting_guideline_rules: string[];
  safety_findings: string[];
  missing_information: string[];
  rationale: string;
  clinician_action_prompts: string[];
  evidence_source: {
    guideline_body: string;
    primary_reference: string;
    level_of_evidence: string;
    fda_boxed_warning: boolean;
  };
  manual_review_required: boolean;
}

export interface TreatmentPlan {
  patient_id: string;
  plan_timestamp: string;
  upstream_profile_version: string;
  plan_status:
    | "supported_for_consideration"
    | "requires_clinician_review"
    | "contraindication_flagged"
    | "insufficient_information"
    | "no_treatment_options_supported";
  manual_review_required: boolean;
  clinical_context_summary: {
    anatomic_stage?: string | null;
    molecular_subtype?: string | null;
    menopausal_status: string;
    primary_tumor_size_mm?: number | null;
    nodal_status?: string | null;
    histologic_grade?: string | null;
    histologic_type?: string | null;
  };
  treatment_options: TreatmentOption[];
  supporting_guideline_checks: string[];
  safety_findings_summary: string[];
  missing_information: string[];
  explanation: string;
  limitations: string[];
}

export interface AssessmentBundle {
  patient_profile: PatientProfile;
  guideline_check: GuidelineCheckOutput;
  safety_assessment: SafetyAssessment;
  treatment_plan: TreatmentPlan;
  dicom_metadata?: Record<string, any>;
}

export interface SampleCaseMeta {
  case_id: string;
  filename: string;
  title: string;
  description: string;
  key_features: string[];
}

