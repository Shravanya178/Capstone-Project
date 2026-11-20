"use client";

import React from "react";
import { ClinicalExtent } from "../types/cdss";
import { Layers, ShieldCheck, Target, ArrowRight, Activity, Crosshair } from "lucide-react";

interface StagingPanelProps {
  clinicalExtent: ClinicalExtent;
}

export default function StagingPanel({ clinicalExtent }: StagingPanelProps) {
  const {
    laterality,
    primary_tumor_size_mm,
    clinical_t_stage,
    clinical_n_stage,
    clinical_m_stage,
    anatomic_stage,
  } = clinicalExtent;

  // Resolve T stage if not explicitly set
  const resolvedT =
    clinical_t_stage ||
    (primary_tumor_size_mm
      ? primary_tumor_size_mm <= 20
        ? "cT1c"
        : primary_tumor_size_mm <= 50
        ? "cT2"
        : "cT3"
      : "cTX");

  const resolvedN = clinical_n_stage || "cN0";
  const resolvedM = clinical_m_stage || "cM0";
  const resolvedStage = anatomic_stage || `${resolvedT} ${resolvedN} ${resolvedM}`;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#DEE5E1] rounded-xl p-6 shadow-clinical-xs">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#DEE5E1] mb-6 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#E7F0EA] flex items-center justify-center text-[#4E8276] shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#193B4A]">
                AJCC 8th Edition Anatomical Staging (cTNM)
              </h3>
              <p className="text-xs text-[#68777C]">
                Standardized pre-operative staging based on clinical exam, core needle biopsy, and diagnostic MRI.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#68777C] font-semibold">Prognostic Group:</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#193B4A] text-white shadow-xs">
              {resolvedStage}
            </span>
          </div>
        </div>

        {/* Visual TNM Stepper Track */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {/* Clinical T Stage Card */}
          <div className="p-5 rounded-xl border border-[#DEE5E1] bg-[#F5F6F3] relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#68777C] uppercase tracking-wider">
                  Primary Tumor (cT)
                </span>
                <span className="text-xs font-bold text-[#4E8276] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {resolvedT}
                </span>
              </div>

              <div className="flex items-baseline space-x-2 my-2">
                <span className="text-2xl font-bold text-[#193B4A] tabular-nums">
                  {primary_tumor_size_mm ? `${primary_tumor_size_mm} mm` : "Not Documented"}
                </span>
                <span className="text-xs text-[#68777C]">max diameter</span>
              </div>

              {/* Dynamic Tumor Size Visual Bubble */}
              <div className="my-3 p-3 bg-white rounded-lg border border-[#DEE5E1] flex items-center space-x-4">
                <div className="relative flex items-center justify-center w-12 h-12 bg-gray-50 rounded-full border border-dashed border-gray-300">
                  <div
                    className="rounded-full bg-[#B54B4B]/80 transition-all duration-700"
                    style={{
                      width: `${Math.min(Math.max((primary_tumor_size_mm || 15) * 1.5, 12), 44)}px`,
                      height: `${Math.min(Math.max((primary_tumor_size_mm || 15) * 1.5, 12), 44)}px`,
                    }}
                  />
                </div>
                <div className="text-[11px] text-[#68777C] leading-snug">
                  {primary_tumor_size_mm && primary_tumor_size_mm <= 20
                    ? "cT1: Tumor ≤ 20 mm in greatest dimension."
                    : primary_tumor_size_mm && primary_tumor_size_mm <= 50
                    ? "cT2: Tumor > 20 mm but ≤ 50 mm."
                    : "cT3+: Large / locally advanced primary lesion."}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-[#68777C] pt-2 border-t border-[#DEE5E1]">
              Modality: High-Resolution Breast MRI + Ultrasound
            </div>
          </div>

          {/* Clinical N Stage Card */}
          <div className="p-5 rounded-xl border border-[#DEE5E1] bg-[#F5F6F3] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#68777C] uppercase tracking-wider">
                  Regional Nodes (cN)
                </span>
                <span className="text-xs font-bold text-[#193B4A] bg-white px-2 py-0.5 rounded border border-[#DEE5E1]">
                  {resolvedN}
                </span>
              </div>

              <div className="flex items-baseline space-x-2 my-2">
                <span className="text-2xl font-bold text-[#193B4A]">
                  {resolvedN === "cN0" ? "Clinically Node-Negative" : "Nodal Involvement"}
                </span>
              </div>

              <div className="my-3 p-3 bg-white rounded-lg border border-[#DEE5E1] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#68777C]">Ipsilateral Axillary:</span>
                  <span className="font-semibold text-[#193B4A]">
                    {resolvedN === "cN0" ? "Non-palpable / Negative" : "Suspicious Nodes Detected"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#68777C]">Internal Mammary:</span>
                  <span className="font-semibold text-[#193B4A]">No involvement</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-[#68777C] pt-2 border-t border-[#DEE5E1]">
              Surgical plan: Sentinel Lymph Node Biopsy (SLNB)
            </div>
          </div>

          {/* Clinical M Stage Card */}
          <div className="p-5 rounded-xl border border-[#DEE5E1] bg-[#F5F6F3] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#68777C] uppercase tracking-wider">
                  Distant Metastasis (cM)
                </span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {resolvedM}
                </span>
              </div>

              <div className="flex items-baseline space-x-2 my-2">
                <span className="text-2xl font-bold text-emerald-700">M0 (No Metastasis)</span>
              </div>

              <div className="my-3 p-3 bg-white rounded-lg border border-[#DEE5E1] space-y-1.5">
                <div className="flex items-center space-x-2 text-xs text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>No evidence of distant visceral or osseous dissemination.</span>
                </div>
                <div className="text-[11px] text-[#68777C] pt-1">
                  Baseline systemic staging: Locoregional disease.
                </div>
              </div>
            </div>

            <div className="text-[11px] text-[#68777C] pt-2 border-t border-[#DEE5E1]">
              Intent: Curative / Locoregional Management
            </div>
          </div>
        </div>

        {/* Anatomical Laterality & Quadrant Strip */}
        <div className="p-4 rounded-xl bg-[#E7F0EA]/50 border border-[#DEE5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5">
            <Crosshair className="w-4 h-4 text-[#4E8276]" />
            <span className="text-[#68777C]">Lesion Laterality:</span>
            <strong className="text-[#193B4A] uppercase font-bold">
              {laterality || "Left Breast"}
            </strong>
          </div>
          <div className="flex items-center space-x-4 text-[#68777C]">
            <span>Primary Focus: Solitary Invasive Focus</span>
            <span>•</span>
            <span>Multifocality: None Reported</span>
          </div>
        </div>
      </div>
    </div>
  );
}
