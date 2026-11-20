"use client";

import React from "react";
import { PatientProfile, SafetyAssessment, TreatmentPlan } from "../types/cdss";

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

  const getSubtypeBadge = (sub: string) => {
    switch (sub) {
      case "luminal_a":
        return <span className="badge-teal">Luminal A (HR+/HER2-)</span>;
      case "luminal_b_her2_negative":
        return <span className="badge-teal">Luminal B HER2-</span>;
      case "luminal_b_her2_positive":
        return <span className="badge-primary">Luminal B HER2+ (Triple Pos)</span>;
      case "her2_enriched":
        return <span className="badge-warning">HER2-Enriched</span>;
      case "triple_negative":
        return <span className="badge-critical">Triple-Negative (TNBC)</span>;
      default:
        return <span className="badge-neutral">Subtype Unknown</span>;
    }
  };

  const getSafetyBadge = (stat: string) => {
    switch (stat) {
      case "contraindication_identified":
        return (
          <span className="badge-critical flex items-center space-x-1">
            <span>🛑</span>
            <span>Contraindication Flagged</span>
          </span>
        );
      case "potential_interaction":
        return (
          <span className="badge-warning flex items-center space-x-1">
            <span>⚠️</span>
            <span>Drug Interaction Alert</span>
          </span>
        );
      case "precaution_identified":
        return (
          <span className="badge-warning flex items-center space-x-1">
            <span>⚠️</span>
            <span>Precaution Identified</span>
          </span>
        );
      case "insufficient_information":
        return (
          <span className="badge-neutral flex items-center space-x-1">
            <span>ℹ️</span>
            <span>Incomplete Baseline Labs</span>
          </span>
        );
      default:
        return (
          <span className="badge-teal flex items-center space-x-1">
            <span>✓</span>
            <span>No Documented Issue</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white border-b border-[#DEE5E1] px-6 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Patient Identifier and Core Tags */}
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h2 className="text-base font-semibold text-[#24343B] tracking-tight">
              {profile.patient_id}
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#F5F6F3] border border-[#DEE5E1] text-[#68777C]">
              {profile.source_dataset}
            </span>
            {getSubtypeBadge(subtype)}
          </div>
          <div className="flex items-center space-x-4 text-xs text-[#68777C]">
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
            <span>
              Clinical Stage: <strong className="text-[#24343B]">{stage}</strong>
            </span>
            <span>•</span>
            <span>
              Tumor Size:{" "}
              <strong className="text-[#24343B] tabular-nums">
                {profile.clinical_extent?.primary_tumor_size_mm ? `${profile.clinical_extent.primary_tumor_size_mm} mm` : "Unrecorded"}
              </strong>
            </span>
          </div>
        </div>

        {/* Right: Assessment & Safety Status */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] text-[#68777C] font-medium">Safety Firewall</div>
            <div className="mt-0.5">{getSafetyBadge(safetyStatus)}</div>
          </div>
          <div className="h-8 w-px bg-[#DEE5E1] hidden sm:block" />
          <div className="text-right">
            <div className="text-[11px] text-[#68777C] font-medium">Decision Status</div>
            <div className="mt-0.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#193B4A] text-white">
                {planStatus === "supported_for_consideration" && "Options Available"}
                {planStatus === "requires_clinician_review" && "Tumor Board Review Required"}
                {planStatus === "contraindication_flagged" && "Contraindication Overrides Applied"}
                {planStatus === "insufficient_information" && "Data Incomplete"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

