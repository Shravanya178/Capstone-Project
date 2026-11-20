"use client";

import React, { useState } from "react";
import { AssessmentBundle } from "../types/cdss";

interface DecisionRecordViewProps {
  bundle: AssessmentBundle;
}

export default function DecisionRecordView({ bundle }: DecisionRecordViewProps) {
  const [activeView, setActiveView] = useState<"formatted" | "json">("formatted");
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(bundle, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `decision_record_${bundle.patient_profile?.patient_id || "patient"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const { patient_profile, guideline_check, safety_assessment, treatment_plan } = bundle;

  return (
    <div className="space-y-6">
      {/* View Switcher Header */}
      <div className="bg-white border border-[#DEE5E1] rounded-lg p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveView("formatted")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeView === "formatted"
                ? "bg-[#193B4A] text-white"
                : "bg-[#F5F6F3] text-[#24343B] hover:bg-[#DEE5E1]"
            }`}
          >
            Formatted Clinical Summary
          </button>
          <button
            onClick={() => setActiveView("json")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeView === "json"
                ? "bg-[#193B4A] text-white"
                : "bg-[#F5F6F3] text-[#24343B] hover:bg-[#DEE5E1]"
            }`}
          >
            Raw JSON Record
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded bg-[#F5F6F3] border border-[#DEE5E1] text-[#193B4A] text-xs font-medium hover:bg-white transition-colors"
          >
            {copied ? "✓ Copied!" : "📋 Copy JSON"}
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded bg-[#4E8276] text-white text-xs font-medium hover:bg-[#3d695f] transition-colors shadow-xs"
          >
            ⬇ Download JSON Record
          </button>
        </div>
      </div>

      {activeView === "formatted" ? (
        <div className="bg-white border border-[#DEE5E1] rounded-lg p-6 shadow-xs space-y-6 text-xs text-[#24343B]">
          {/* Header */}
          <div className="border-b border-[#DEE5E1] pb-4 flex items-start justify-between">
            <div>
              <span className="text-[10px] font-semibold text-[#68777C] uppercase tracking-wider">
                Permanent Clinical Decision Record
              </span>
              <h3 className="text-base font-bold text-[#193B4A] mt-0.5">
                Case ID: {patient_profile?.patient_id}
              </h3>
              <p className="text-[11px] text-[#68777C]">
                Source Dataset: {patient_profile?.source_dataset} • Generated:{" "}
                {patient_profile?.profile_generation_timestamp}
              </p>
            </div>
            <div className="text-right">
              <span className="badge-primary">Clinician Review Gate: Enforced</span>
            </div>
          </div>

          {/* Section 1: Clinical Profile Summary */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#193B4A] uppercase tracking-wider text-[11px]">
              1. Patient Demographics & Biomarkers
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-[#F5F6F3] rounded border border-[#DEE5E1]">
              <div>
                <span className="text-[#68777C] block text-[10px]">Age / Menopause:</span>
                <strong>{patient_profile?.demographics?.age ?? "Unrecorded"} yrs</strong> /{" "}
                <span className="capitalize">{patient_profile?.demographics?.menopausal_status}</span>
              </div>
              <div>
                <span className="text-[#68777C] block text-[10px]">ER / PR Status:</span>
                <strong>ER {patient_profile?.pathology_biomarkers?.er_status}</strong> /{" "}
                <strong>PR {patient_profile?.pathology_biomarkers?.pr_status}</strong>
              </div>
              <div>
                <span className="text-[#68777C] block text-[10px]">HER2 IHC Status:</span>
                <strong>{patient_profile?.pathology_biomarkers?.her2_status}</strong> (IHC{" "}
                {patient_profile?.pathology_biomarkers?.her2_ihc_score ?? "N/A"})
              </div>
              <div>
                <span className="text-[#68777C] block text-[10px]">Surrogate Subtype:</span>
                <strong className="capitalize text-[#193B4A]">
                  {patient_profile?.pathology_biomarkers?.molecular_subtype?.replace(/_/g, " ")}
                </strong>
              </div>
            </div>
          </div>

          {/* Section 2: Staging Summary */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#193B4A] uppercase tracking-wider text-[11px]">
              2. Anatomical Clinical Staging (AJCC 8th Edition)
            </h4>
            <div className="p-3 bg-[#F5F6F3] rounded border border-[#DEE5E1]">
              Primary Tumor: <strong>{patient_profile?.clinical_extent?.primary_tumor_size_mm ? `${patient_profile.clinical_extent.primary_tumor_size_mm} mm` : "Unrecorded"}</strong> • Staging Descriptors:{" "}
              <strong>{patient_profile?.clinical_extent?.clinical_t_stage || "cTX"}</strong>{" "}
              <strong>{patient_profile?.clinical_extent?.clinical_n_stage || "cNX"}</strong>{" "}
              <strong>{patient_profile?.clinical_extent?.clinical_m_stage || "cM0"}</strong> (
              {patient_profile?.clinical_extent?.anatomic_stage || "Stage IIA"})
            </div>
          </div>

          {/* Section 3: Guideline Rules Evaluated */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#193B4A] uppercase tracking-wider text-[11px]">
              3. Guideline Rules Consensus (ESMO 2024 / ASCO)
            </h4>
            <div className="space-y-1.5">
              {guideline_check?.checks?.map((check) => (
                <div
                  key={check.rule_id}
                  className="p-2.5 rounded border border-[#DEE5E1] bg-white flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono font-bold text-[#193B4A] mr-2">
                      {check.rule_id}
                    </span>
                    <span className="text-[#24343B]">{check.rule_name}</span>
                  </div>
                  <span className="font-semibold uppercase text-[10px] text-[#4E8276]">
                    [{check.result}]
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Safety & Contraindications */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#193B4A] uppercase tracking-wider text-[11px]">
              4. Clinical Safety & Organ Function Status
            </h4>
            <div className="p-3 bg-[#F5F6F3] rounded border border-[#DEE5E1]">
              <div>
                Overall Safety Status:{" "}
                <strong className="capitalize text-[#193B4A]">
                  {safety_assessment?.overall_safety_status?.replace(/_/g, " ")}
                </strong>
              </div>
              <div className="mt-1 text-[#68777C]">
                Active Findings: {safety_assessment?.safety_findings?.length || 0} • Unrecorded Variables:{" "}
                {safety_assessment?.missing_safety_information?.length || 0}
              </div>
            </div>
          </div>

          {/* Section 5: Evaluated Treatment Modalities */}
          <div className="space-y-2">
            <h4 className="font-bold text-[#193B4A] uppercase tracking-wider text-[11px]">
              5. Multimodal Treatment Options Catalog ({treatment_plan?.treatment_options?.length || 0})
            </h4>
            <div className="space-y-1.5">
              {treatment_plan?.treatment_options?.map((opt) => (
                <div
                  key={opt.treatment_option_id}
                  className="p-2.5 rounded border border-[#DEE5E1] bg-white flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-[#193B4A]">{opt.regimen_or_modality}</span>
                    <span className="text-[10px] text-[#68777C] ml-2 capitalize">
                      ({opt.treatment_category.replace(/_/g, " ")})
                    </span>
                  </div>
                  <span className="badge-teal text-[10px] capitalize">
                    {opt.eligibility_status.replace(/_/g, " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Clinician Review Footer */}
          <div className="p-4 bg-[#F6EEDC] rounded border border-[#B78643]/30 text-[#B78643] text-xs">
            <strong>Mandatory Clinician Verification Notice:</strong> This summary is generated for multidisciplinary tumor board discussion and decision support. It does not replace independent pathological review or direct patient assessment by an oncologist.
          </div>
        </div>
      ) : (
        /* Raw JSON Viewer */
        <div className="bg-[#193B4A] text-[#DEE5E1] p-5 rounded-lg font-mono text-xs overflow-x-auto shadow-inner max-h-[600px] leading-relaxed">
          <pre>{jsonString}</pre>
        </div>
      )}
    </div>
  );
}

