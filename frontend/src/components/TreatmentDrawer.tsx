"use client";

import React from "react";
import { TreatmentOption } from "../types/cdss";

interface TreatmentDrawerProps {
  option: TreatmentOption | null;
  onClose: () => void;
}

export default function TreatmentDrawer({ option, onClose }: TreatmentDrawerProps) {
  if (!option) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex justify-end transition-opacity">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-[#DEE5E1] animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#DEE5E1] bg-[#F5F6F3] flex items-start justify-between">
          <div>
            <div className="text-[10px] text-[#68777C] font-mono uppercase tracking-wider">
              {option.treatment_option_id} • {option.treatment_category.replace(/_/g, " ")}
            </div>
            <h3 className="text-base font-bold text-[#193B4A] mt-1 leading-snug">
              {option.regimen_or_modality}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#68777C] hover:text-[#24343B] hover:bg-[#DEE5E1] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-[#24343B]">
          {/* Status & Intent */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-[#F5F6F3] rounded border border-[#DEE5E1]">
            <div>
              <span className="text-[11px] text-[#68777C] font-semibold block mb-0.5">Eligibility Status</span>
              <span className="font-semibold capitalize text-[#193B4A]">
                {option.eligibility_status.replace(/_/g, " ")}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#68777C] font-semibold block mb-0.5">Clinical Intent</span>
              <span className="font-semibold capitalize text-[#193B4A]">
                {option.clinical_intent.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          {/* Clinical Rationale */}
          <div>
            <h4 className="text-xs font-semibold text-[#193B4A] uppercase tracking-wider mb-2">
              Clinical Rationale
            </h4>
            <div className="p-3.5 bg-white border border-[#DEE5E1] rounded leading-relaxed text-[#24343B]">
              {option.rationale}
            </div>
          </div>

          {/* Safety & Contraindications */}
          <div>
            <h4 className="text-xs font-semibold text-[#193B4A] uppercase tracking-wider mb-2">
              Safety & Contraindication Findings
            </h4>
            {option.safety_findings.length > 0 ? (
              <div className="space-y-2">
                {option.safety_findings.map((f, i) => (
                  <div
                    key={i}
                    className="p-3 bg-[#F8E9E7] border border-[#B54B4B]/30 rounded text-[#B54B4B] font-medium"
                  >
                    🛑 {f}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-[#E7F0EA] border border-[#DEE5E1] rounded text-[#4E8276] font-medium">
                ✓ No active contraindications or FDA Boxed Warnings flagged in available patient telemetry.
              </div>
            )}
          </div>

          {/* Clinician Action Prompts */}
          {option.clinician_action_prompts.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-[#193B4A] uppercase tracking-wider mb-2">
                Required Clinician Actions
              </h4>
              <div className="space-y-2">
                {option.clinician_action_prompts.map((prompt, i) => (
                  <div
                    key={i}
                    className="p-3 bg-[#F6EEDC] border border-[#B78643]/30 rounded text-[#B78643] font-medium"
                  >
                    ⚠️ {prompt}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Supporting Evidence Source */}
          <div>
            <h4 className="text-xs font-semibold text-[#193B4A] uppercase tracking-wider mb-2">
              Guideline & Trial Evidence Source
            </h4>
            <div className="p-4 bg-white border border-[#DEE5E1] rounded space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#193B4A]">
                  {option.evidence_source?.guideline_body || "ESMO Guidelines 2024"}
                </span>
                <span className="badge-teal">
                  {option.evidence_source?.level_of_evidence || "Level I, Grade A"}
                </span>
              </div>
              <p className="text-[11px] text-[#68777C] italic leading-relaxed">
                {option.evidence_source?.primary_reference}
              </p>
              {option.evidence_source?.fda_boxed_warning && (
                <div className="text-[10px] text-[#B54B4B] font-semibold flex items-center space-x-1 pt-1">
                  <span>⚠️</span>
                  <span>FDA Boxed Warning applies to this therapeutic class.</span>
                </div>
              )}
            </div>
          </div>

          {/* Missing Information */}
          {option.missing_information.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-[#193B4A] uppercase tracking-wider mb-2">
                Data Limitations & Missing Parameters
              </h4>
              <ul className="list-disc list-inside bg-[#F5F6F3] p-3 rounded border border-[#DEE5E1] space-y-1 text-[#68777C]">
                {option.missing_information.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#DEE5E1] bg-[#F5F6F3] flex items-center justify-between">
          <span className="text-[11px] text-[#68777C]">
            Mandatory Multidisciplinary Review Required
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#193B4A] hover:bg-[#244b5c] text-white text-xs font-medium rounded transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

