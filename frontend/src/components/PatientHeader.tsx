"use client";

import React from "react";
import { PatientProfile, SafetyAssessment, TreatmentPlan } from "../types/cdss";
import {
  User,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  HeartPulse,
  Dna,
  Layers,
  CircleDot,
  FileSpreadsheet,
} from "lucide-react";

interface PatientHeaderProps {
  profile: PatientProfile;
  safety?: SafetyAssessment;
  treatment?: TreatmentPlan;
}

export default function PatientHeader({ profile, safety, treatment }: PatientHeaderProps) {
  const subtype = profile.pathology_biomarkers?.molecular_subtype || "unknown";
  const stage = profile.clinical_extent?.anatomic_stage || profile.clinical_extent?.clinical_t_stage || "cT2 cN0 (Stage IIA)";
  const safetyStatus = safety?.overall_safety_status || "insufficient_information";
  const planStatus = treatment?.plan_status || "supported_for_consideration";
  const tumorSize = profile.clinical_extent?.primary_tumor_size_mm;
  const lvef = (safety?.organ_function_assessments as any)?.cardiac?.lvef_percent ?? (safety?.organ_function_assessments?.cardiac_function as any)?.lvef_percent;

  const getSubtypeConfig = (sub: string) => {
    switch (sub) {
      case "luminal_a":
        return {
          label: "Luminal A (HR+/HER2-)",
          color: "bg-emerald-50 text-emerald-800 border-emerald-200",
          ring: "ring-emerald-500/20",
        };
      case "luminal_b_her2_negative":
        return {
          label: "Luminal B (HER2-)",
          color: "bg-teal-50 text-teal-800 border-teal-200",
          ring: "ring-teal-500/20",
        };
      case "luminal_b_her2_positive":
        return {
          label: "Luminal B (Triple Positive)",
          color: "bg-indigo-50 text-indigo-800 border-indigo-200",
          ring: "ring-indigo-500/20",
        };
      case "her2_enriched":
        return {
          label: "HER2-Enriched (HR-/HER2+)",
          color: "bg-purple-50 text-purple-800 border-purple-200",
          ring: "ring-purple-500/20",
        };
      case "triple_negative":
        return {
          label: "Triple-Negative (TNBC)",
          color: "bg-rose-50 text-rose-800 border-rose-200",
          ring: "ring-rose-500/20",
        };
      default:
        return {
          label: "Subtype Classification Pending",
          color: "bg-gray-50 text-gray-700 border-gray-200",
          ring: "ring-gray-400/20",
        };
    }
  };

  const subtypeConfig = getSubtypeConfig(subtype);

  const getSafetyBadge = (stat: string) => {
    switch (stat) {
      case "contraindication_identified":
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#F8E9E7] text-[#B54B4B] border border-[#B54B4B]/30 shadow-xs">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0 animate-pulse text-[#B54B4B]" />
            <span>Contraindication Override Active</span>
          </span>
        );
      case "potential_interaction":
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#F6EEDC] text-[#B78643] border border-[#DEE5E1] shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[#B78643]" />
            <span>Drug Interaction Alert</span>
          </span>
        );
      case "precaution_identified":
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#F6EEDC] text-[#B78643] border border-[#DEE5E1] shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[#B78643]" />
            <span>Organ Precaution Identified</span>
          </span>
        );
      case "insufficient_information":
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 shadow-xs">
            <CircleDot className="w-3.5 h-3.5 shrink-0 text-gray-500" />
            <span>Baseline Telemetry Incomplete</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[#E7F0EA] text-[#4E8276] border border-[#DEE5E1] shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-[#4E8276]" />
            <span>Cleared for Guideline Regimens</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white border-b border-[#DEE5E1] px-6 py-4 shadow-clinical-xs sticky top-14 z-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Patient Demographic & Diagnostic Summary */}
        <div className="flex items-start space-x-4">
          <div className="w-11 h-11 rounded-lg bg-[#F5F6F3] border border-[#DEE5E1] flex items-center justify-center shrink-0 shadow-clinical-xs">
            <User className="w-6 h-6 text-[#193B4A]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h2 className="text-base font-bold text-[#24343B] tracking-tight">
                {profile.patient_id}
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#F5F6F3] border border-[#DEE5E1] text-[#68777C] flex items-center space-x-1">
                <FileSpreadsheet className="w-3 h-3 text-[#68777C]" />
                <span>{profile.source_dataset}</span>
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${subtypeConfig.color} shadow-xs ring-1 ${subtypeConfig.ring} flex items-center space-x-1`}
              >
                <Dna className="w-3.5 h-3.5" />
                <span>{subtypeConfig.label}</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#68777C]">
              <span>
                Age: <strong className="text-[#24343B]">{profile.demographics?.age ?? "Unrecorded"}</strong>
              </span>
              <span>•</span>
              <span>
                Menopause:{" "}
                <strong className="text-[#24343B] capitalize">
                  {profile.demographics?.menopausal_status || "Unknown"}
                </strong>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Layers className="w-3 h-3 text-[#4E8276]" />
                <span>Stage:</span>
                <strong className="text-[#24343B]">{stage}</strong>
              </span>
              <span>•</span>
              <span>
                Tumor Size:{" "}
                <strong className="text-[#24343B] tabular-nums">
                  {tumorSize ? `${tumorSize} mm` : "Unrecorded"}
                </strong>
              </span>
              {lvef !== undefined && lvef !== null && (
                <>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                    <span>LVEF:</span>
                    <strong
                      className={`tabular-nums font-bold ${
                        lvef <= 45 ? "text-rose-600" : lvef < 50 ? "text-amber-600" : "text-emerald-700"
                      }`}
                    >
                      {lvef}%
                    </strong>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Dual Safety Firewall & Decision Posture Cards */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="bg-[#F5F6F3] border border-[#DEE5E1] rounded-lg p-2.5 shadow-xs text-right min-w-[170px]">
            <div className="text-[10px] text-[#68777C] font-semibold uppercase tracking-wider mb-1">
              Safety Firewall
            </div>
            <div>{getSafetyBadge(safetyStatus)}</div>
          </div>

          <div className="bg-[#193B4A] text-white rounded-lg p-2.5 shadow-clinical-sm text-right min-w-[180px]">
            <div className="text-[10px] text-[#A5C0BA] font-semibold uppercase tracking-wider mb-1">
              Decision Posture
            </div>
            <div className="text-xs font-semibold">
              {planStatus === "supported_for_consideration" && (
                <span className="text-emerald-300 flex items-center justify-end space-x-1">
                  <span>●</span>
                  <span>Options Eligible</span>
                </span>
              )}
              {planStatus === "requires_clinician_review" && (
                <span className="text-amber-300 flex items-center justify-end space-x-1">
                  <span>▲</span>
                  <span>MDT Review Req.</span>
                </span>
              )}
              {planStatus === "contraindication_flagged" && (
                <span className="text-rose-300 flex items-center justify-end space-x-1">
                  <span>🛑</span>
                  <span>Safety Overrides</span>
                </span>
              )}
              {planStatus === "insufficient_information" && (
                <span className="text-gray-300 flex items-center justify-end space-x-1">
                  <span>○</span>
                  <span>Incomplete Data</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
