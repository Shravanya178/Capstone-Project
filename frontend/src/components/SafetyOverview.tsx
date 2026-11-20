"use client";

import React from "react";
import { SafetyAssessment } from "../types/cdss";

interface SafetyOverviewProps {
  safety: SafetyAssessment;
}

export default function SafetyOverview({ safety }: SafetyOverviewProps) {
  const {
    overall_safety_status,
    safety_findings,
    organ_function_assessments,
    missing_safety_information,
    dataset_limitations,
  } = safety;

  const renderStatusHero = () => {
    switch (overall_safety_status) {
      case "contraindication_identified":
        return (
          <div className="p-4 rounded-lg bg-[#F8E9E7] border border-[#B54B4B] flex items-start space-x-3 text-[#B54B4B]">
            <span className="text-xl">🛑</span>
            <div>
              <h4 className="text-sm font-bold">
                Absolute Contraindication / Boxed Warning Flagged
              </h4>
              <p className="text-xs text-[#24343B] mt-0.5 leading-relaxed">
                Critical safety rules have been triggered based on documented organ dysfunction or patient comorbidity. Affected modalities have been overridden to <strong className="text-[#B54B4B]">contraindication_flagged</strong> and require urgent multidisciplinary tumor board review.
              </p>
            </div>
          </div>
        );
      case "potential_interaction":
        return (
          <div className="p-4 rounded-lg bg-[#F6EEDC] border border-[#B78643] flex items-start space-x-3 text-[#B78643]">
            <span className="text-xl">⚠️</span>
            <div>
              <h4 className="text-sm font-bold">
                Major Drug-Drug Interaction Detected
              </h4>
              <p className="text-xs text-[#24343B] mt-0.5 leading-relaxed">
                A significant pharmacokinetic or pharmacodynamic interaction was identified between candidate therapy and concomitant prescriptions. Review recommendations below for safer alternative agents.
              </p>
            </div>
          </div>
        );
      case "insufficient_information":
        return (
          <div className="p-4 rounded-lg bg-[#F5F6F3] border border-[#DEE5E1] flex items-start space-x-3 text-[#193B4A]">
            <span className="text-xl">ℹ️</span>
            <div>
              <h4 className="text-sm font-bold">
                Incomplete Baseline Safety Telemetry
              </h4>
              <p className="text-xs text-[#68777C] mt-0.5 leading-relaxed">
                Retrospective records lack essential laboratory panels or baseline echocardiography. In accordance with safety safeguards, <strong className="text-[#24343B]">unrecorded variables are NEVER assumed normal</strong>. Clinician verification is required.
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-4 rounded-lg bg-[#E7F0EA] border border-[#4E8276] flex items-start space-x-3 text-[#4E8276]">
            <span className="text-xl">✓</span>
            <div>
              <h4 className="text-sm font-bold">
                No Contraindications Documented in Available Records
              </h4>
              <p className="text-xs text-[#24343B] mt-0.5 leading-relaxed">
                No active contraindications or Black Box Warnings were breached in the evaluated patient profile. Note: Safety verification remains conditional upon the completeness of patient records.
              </p>
            </div>
          </div>
        );
    }
  };

  const getOrganBadge = (assessment: any) => {
    if (!assessment || assessment.status === "not_assessed") {
      return <span className="badge-neutral">Not Assessed / Missing</span>;
    }
    const cat = assessment.risk_category || "";
    if (cat.includes("severe") || cat.includes("contraindication")) {
      return <span className="badge-critical font-bold">{cat.replace(/_/g, " ")}</span>;
    }
    if (cat.includes("moderate") || cat.includes("impairment")) {
      return <span className="badge-warning">{cat.replace(/_/g, " ")}</span>;
    }
    return <span className="badge-teal">Cleared / Normal</span>;
  };

  return (
    <div className="space-y-6">
      {/* 1. Overall Status Hero Banner */}
      {renderStatusHero()}

      {/* 2. Organ Function Panel (5 Domains) */}
      <div className="bg-white border border-[#DEE5E1] rounded-lg p-5 shadow-xs">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#193B4A] mb-4">
          Baseline Organ Function Risk Assessments
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Cardiac */}
          <div className="p-3.5 rounded border border-[#DEE5E1] bg-[#F5F6F3]">
            <div className="text-[11px] font-semibold text-[#68777C] flex items-center justify-between mb-1">
              <span>🫀 Cardiac (LVEF)</span>
            </div>
            <div className="my-1.5">{getOrganBadge(organ_function_assessments?.cardiac_function)}</div>
            <div className="text-xs text-[#24343B] font-mono">
              Value: {organ_function_assessments?.cardiac_function?.lvef_percent ? `${organ_function_assessments.cardiac_function.lvef_percent}%` : "Not Documented"}
            </div>
            <div className="text-[10px] text-[#68777C] mt-1">Threshold: ≥ 50%</div>
          </div>

          {/* Renal */}
          <div className="p-3.5 rounded border border-[#DEE5E1] bg-[#F5F6F3]">
            <div className="text-[11px] font-semibold text-[#68777C] flex items-center justify-between mb-1">
              <span>🩺 Renal (CrCl)</span>
            </div>
            <div className="my-1.5">{getOrganBadge(organ_function_assessments?.renal_function)}</div>
            <div className="text-xs text-[#24343B] font-mono">
              Value: {organ_function_assessments?.renal_function?.creatinine_clearance_ml_min ? `${organ_function_assessments.renal_function.creatinine_clearance_ml_min} mL/min` : "Not Documented"}
            </div>
            <div className="text-[10px] text-[#68777C] mt-1">Threshold: ≥ 50 mL/min</div>
          </div>

          {/* Hepatic */}
          <div className="p-3.5 rounded border border-[#DEE5E1] bg-[#F5F6F3]">
            <div className="text-[11px] font-semibold text-[#68777C] flex items-center justify-between mb-1">
              <span>🧪 Hepatic (Bilirubin)</span>
            </div>
            <div className="my-1.5">{getOrganBadge(organ_function_assessments?.hepatic_function)}</div>
            <div className="text-xs text-[#24343B] font-mono">
              Value: {organ_function_assessments?.hepatic_function?.serum_bilirubin_mg_dl ? `${organ_function_assessments.hepatic_function.serum_bilirubin_mg_dl} mg/dL` : "Not Documented"}
            </div>
            <div className="text-[10px] text-[#68777C] mt-1">Threshold: ≤ 3.0 mg/dL</div>
          </div>

          {/* Hematologic */}
          <div className="p-3.5 rounded border border-[#DEE5E1] bg-[#F5F6F3]">
            <div className="text-[11px] font-semibold text-[#68777C] flex items-center justify-between mb-1">
              <span>🩸 Hematologic (ANC)</span>
            </div>
            <div className="my-1.5">{getOrganBadge(organ_function_assessments?.hematologic_function)}</div>
            <div className="text-xs text-[#24343B] font-mono">
              Value: {organ_function_assessments?.hematologic_function?.absolute_neutrophil_count ? `${organ_function_assessments.hematologic_function.absolute_neutrophil_count}/µL` : "Not Documented"}
            </div>
            <div className="text-[10px] text-[#68777C] mt-1">Threshold: ≥ 1,500/µL</div>
          </div>

          {/* Reproductive */}
          <div className="p-3.5 rounded border border-[#DEE5E1] bg-[#F5F6F3]">
            <div className="text-[11px] font-semibold text-[#68777C] flex items-center justify-between mb-1">
              <span>👶 Reproductive / Pregnancy</span>
            </div>
            <div className="my-1.5">{getOrganBadge(organ_function_assessments?.reproductive_status)}</div>
            <div className="text-xs text-[#24343B] capitalize">
              {organ_function_assessments?.reproductive_status?.pregnancy_status || "Unknown / Not Tested"}
            </div>
            <div className="text-[10px] text-[#68777C] mt-1">Teratogenic risk</div>
          </div>
        </div>
      </div>

      {/* 3. Detailed Safety Findings Table */}
      <div className="bg-white border border-[#DEE5E1] rounded-lg shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#DEE5E1] bg-[#F5F6F3] flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#193B4A]">
            Active Safety Findings & Contraindication Flags ({safety_findings.length})
          </h3>
          <span className="text-[11px] text-[#68777C]">
            Triggered by FDA Boxed Warnings & Clinical Practice Rules
          </span>
        </div>

        {safety_findings.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#68777C]">
            No contraindications, Boxed Warnings, or major drug interactions identified in the available clinical data.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#F5F6F3]/50 border-b border-[#DEE5E1] text-[#68777C]">
                  <th className="p-3 font-semibold">Rule / Finding ID</th>
                  <th className="p-3 font-semibold">Medication / Class</th>
                  <th className="p-3 font-semibold">Category</th>
                  <th className="p-3 font-semibold">Trigger Condition</th>
                  <th className="p-3 font-semibold">Clinician Recommendation</th>
                  <th className="p-3 font-semibold">Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DEE5E1]">
                {safety_findings.map((f) => (
                  <tr key={f.finding_id} className="hover:bg-[#F5F6F3]/50">
                    <td className="p-3 font-mono text-[11px] text-[#193B4A] font-semibold whitespace-nowrap">
                      {f.finding_id}
                    </td>
                    <td className="p-3 font-medium text-[#24343B]">
                      {f.medication_or_class}
                      {f.fda_boxed_warning && (
                        <span className="block text-[10px] text-[#B54B4B] font-bold">
                          FDA Boxed Warning
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {f.safety_category === "absolute_contraindication" && (
                        <span className="badge-critical">Absolute Contraindication</span>
                      )}
                      {f.safety_category === "drug_interaction" && (
                        <span className="badge-warning">Drug Interaction</span>
                      )}
                      {f.safety_category === "organ_toxicity_risk" && (
                        <span className="badge-warning">Organ Toxicity</span>
                      )}
                    </td>
                    <td className="p-3 text-[#24343B] leading-relaxed">
                      {f.triggering_condition}
                    </td>
                    <td className="p-3 text-[#B78643] font-medium leading-relaxed">
                      {f.clinician_recommendation}
                    </td>
                    <td className="p-3 text-[#68777C] text-[11px]">
                      {f.evidence_source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Missing Information Checklist & Limitations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Missing Required Safety Parameters */}
        <div className="bg-white border border-[#DEE5E1] rounded-lg p-5 shadow-xs">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#193B4A] mb-2 flex items-center justify-between">
            <span>Missing Safety Parameters ({missing_safety_information.length})</span>
            <span className="text-[10px] text-[#B78643] font-normal">Never assumed normal</span>
          </h4>
          <p className="text-xs text-[#68777C] mb-3">
            The following physiological metrics were not recorded in the submitted files:
          </p>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {missing_safety_information.map((item, i) => (
              <div key={i} className="p-2.5 rounded bg-[#F5F6F3] border border-[#DEE5E1] text-xs">
                <div className="flex items-center justify-between">
                  <strong className="text-[#193B4A] font-mono">{item.parameter_name}</strong>
                  <span className="badge-neutral text-[10px]">Unrecorded</span>
                </div>
                <div className="text-[11px] text-[#68777C] mt-1">
                  Required for: <span>{item.required_for_evaluation_of}</span>
                </div>
                <div className="text-[10px] text-[#B78643] mt-0.5">
                  Risk if unverified: {item.clinical_risk_if_unassessed}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dataset Limitations Auditing */}
        <div className="bg-white border border-[#DEE5E1] rounded-lg p-5 shadow-xs">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#193B4A] mb-2">
            Dataset Limitations & Auditing Caveats
          </h4>
          <p className="text-xs text-[#68777C] mb-3">
            Inherent boundaries of retrospective research cohorts:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-[#68777C] leading-relaxed">
            {dataset_limitations.map((limit, i) => (
              <li key={i}>{limit}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

