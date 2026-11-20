"use client";

import React, { useState } from "react";
import { PathologyBiomarkers } from "../types/cdss";
import {
  Dna,
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Activity,
  Microscope,
  Sparkles,
} from "lucide-react";

interface BiomarkerPanelProps {
  biomarkers: PathologyBiomarkers;
}

export default function BiomarkerPanel({ biomarkers }: BiomarkerPanelProps) {
  const [showInterpretationHelp, setShowInterpretationHelp] = useState(false);

  const {
    er_status,
    er_percentage,
    er_low_flag,
    pr_status,
    pr_percentage,
    her2_status,
    her2_ihc_score,
    her2_fish_ratio,
    her2_fish_status,
    ki67_index,
    histologic_grade,
    histologic_type,
    molecular_subtype,
  } = biomarkers;

  const isHer2Equivocal = her2_status === "equivocal" || her2_ihc_score === "2+";

  // Helper for Circular Progress Ring
  const renderRadialGauge = (
    value: number | null | undefined,
    label: string,
    status: string,
    isErLow?: boolean
  ) => {
    const val = value !== undefined && value !== null ? Math.min(Math.max(value, 0), 100) : 0;
    const strokeDashoffset = 100 - val;

    let strokeColor = "#4E8276"; // default teal
    let statusBg = "bg-emerald-50 text-emerald-800 border-emerald-200";

    if (isErLow) {
      strokeColor = "#B78643";
      statusBg = "bg-amber-50 text-amber-800 border-amber-300";
    } else if (status === "negative") {
      strokeColor = "#B54B4B";
      statusBg = "bg-rose-50 text-rose-800 border-rose-200";
    } else if (value === null || value === undefined) {
      strokeColor = "#DEE5E1";
      statusBg = "bg-gray-100 text-gray-600 border-gray-200";
    }

    return (
      <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-[#DEE5E1] shadow-clinical-xs hover:shadow-clinical-sm transition-all duration-300">
        <div className="relative w-24 h-24 mb-3">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-[#F0F2EE]"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              stroke={strokeColor}
              strokeWidth="3.5"
              strokeDasharray="100, 100"
              strokeDashoffset={value !== null && value !== undefined ? strokeDashoffset : 100}
              strokeLinecap="round"
              fill="none"
              className="transition-all duration-1000 ease-out"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold text-[#193B4A] tabular-nums tracking-tight">
              {value !== null && value !== undefined ? `${value}%` : "N/R"}
            </span>
            <span className="text-[10px] text-[#68777C] font-semibold uppercase tracking-wider">
              Staining
            </span>
          </div>
        </div>

        <div className="text-center w-full">
          <div className="text-xs font-semibold text-[#24343B] mb-1">{label}</div>
          <div
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border inline-block ${statusBg}`}
          >
            {status ? status.replace("_", " ").toUpperCase() : "NOT REPORTED"}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Critical Reflex & Safety Alerts */}
      {isHer2Equivocal && (
        <div className="p-4 rounded-xl bg-[#F8E9E7] border-2 border-[#B54B4B] shadow-clinical-alert flex items-start space-x-3.5 text-[#B54B4B] animate-pulse-slow">
          <AlertTriangle className="w-6 h-6 text-[#B54B4B] shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-bold tracking-tight">
                HER2 IHC 2+ Equivocal — Mandatory Confirmatory Reflex ISH / FISH
              </h4>
              <span className="px-2 py-0.5 rounded bg-[#B54B4B] text-white text-[10px] font-bold uppercase tracking-wider">
                Reflex Hold
              </span>
            </div>
            <p className="text-xs text-[#24343B] mt-1 leading-relaxed">
              Per <strong>ASCO/CAP 2018 guidelines</strong>, an IHC score of 2+ cannot be classified as positive or negative without in situ hybridization (FISH/CISH). Anti-HER2 targeted therapy is currently withheld in{" "}
              <code className="px-1.5 py-0.5 bg-white border border-[#B54B4B]/30 rounded text-[#B54B4B] font-mono text-[11px]">
                requires_clinician_review
              </code>{" "}
              pending reflex testing.
            </p>
          </div>
        </div>
      )}

      {er_low_flag && (
        <div className="p-4 rounded-xl bg-[#F6EEDC] border border-[#B78643] shadow-clinical-sm flex items-start space-x-3.5 text-[#B78643]">
          <Info className="w-5 h-5 text-[#B78643] shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-bold tracking-tight">
                Estrogen Receptor Low Positive (1–10% Nuclear Staining)
              </h4>
              <span className="px-2 py-0.5 rounded bg-[#B78643] text-white text-[10px] font-bold uppercase tracking-wider">
                ASCO/CAP 2020
              </span>
            </div>
            <p className="text-xs text-[#24343B] mt-1 leading-relaxed">
              Tumors expressing 1–10% ER exhibit heterogeneous biology with limited endocrine sensitivity compared to ER &gt; 10%. Clinical oncologist review is strongly recommended to determine whether systemic chemotherapy is indicated alongside endocrine therapy.
            </p>
          </div>
        </div>
      )}

      {/* 2. Visual Biomarker Studio */}
      <div className="bg-white border border-[#DEE5E1] rounded-xl p-6 shadow-clinical-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#DEE5E1] mb-6">
          <div className="flex items-center space-x-2.5">
            <Microscope className="w-5 h-5 text-[#4E8276]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#193B4A]">
              Pathology & Biomarker Expression Matrix
            </h3>
          </div>
          <button
            onClick={() => setShowInterpretationHelp(!showInterpretationHelp)}
            className="text-xs text-[#4E8276] hover:text-[#376258] font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <span>{showInterpretationHelp ? "Close Interpretation Guide" : "Subtyping Criteria"}</span>
            {showInterpretationHelp ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Expandable Interpretation Blueprint */}
        {showInterpretationHelp && (
          <div className="mb-6 p-5 rounded-xl bg-[#F5F6F3] border border-[#DEE5E1] text-xs text-[#24343B] space-y-3 leading-relaxed animate-fade-in shadow-inner">
            <div className="flex items-center space-x-2 text-[#193B4A] font-bold text-sm">
              <Dna className="w-4 h-4 text-[#4E8276]" />
              <h5>St. Gallen 2013 / ESMO 2024 Surrogate IHC Subtyping Standard</h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[#68777C] pt-2">
              <div className="p-3 bg-white rounded-lg border border-[#DEE5E1]">
                <strong className="text-emerald-800">Luminal A:</strong> ER+, PR+ (&ge; 20%), HER2-, low Ki-67 (&lt; 14–20% or Grade 1–2).
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#DEE5E1]">
                <strong className="text-teal-800">Luminal B (HER2-):</strong> ER+, HER2-, with either PR &lt; 20% or high proliferation (Ki-67 &ge; 20% / Grade 3).
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#DEE5E1]">
                <strong className="text-indigo-800">Luminal B (HER2+):</strong> Triple Positive (ER+, PR any, HER2+).
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#DEE5E1]">
                <strong className="text-purple-800">HER2-Enriched:</strong> ER-, PR-, HER2+ (IHC 3+ or FISH amplified).
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#DEE5E1] md:col-span-2">
                <strong className="text-rose-800">Triple-Negative (TNBC):</strong> ER-, PR-, HER2- (&lt; 1% nuclear staining).
              </div>
            </div>
          </div>
        )}

        {/* Visual Receptor Gauges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {/* ER Radial Gauge */}
          {renderRadialGauge(er_percentage, "Estrogen Receptor (ER)", er_status || "unknown", er_low_flag)}

          {/* PR Radial Gauge */}
          {renderRadialGauge(pr_percentage, "Progesterone Receptor (PR)", pr_status || "unknown")}

          {/* HER2 Interactive Spectrum Card */}
          <div className="p-4 rounded-xl bg-white border border-[#DEE5E1] shadow-clinical-xs hover:shadow-clinical-sm transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#24343B]">HER2 / neu IHC Spectrum</span>
                <span className="text-[10px] text-[#68777C] font-mono">ASCO 2018</span>
              </div>

              {/* 4-Stage Segmented Bar */}
              <div className="grid grid-cols-4 gap-1.5 my-3">
                {["0", "1+", "2+", "3+"].map((tier) => {
                  const isActive = her2_ihc_score === tier;
                  const isEquivocal = tier === "2+";
                  const isPositive = tier === "3+";

                  let tierClass = "bg-[#F0F2EE] text-[#68777C] border-transparent";
                  if (isActive) {
                    if (isEquivocal) {
                      tierClass = "bg-[#B78643] text-white border-[#B78643] shadow-clinical-sm ring-2 ring-[#B78643]/30";
                    } else if (isPositive) {
                      tierClass = "bg-purple-600 text-white border-purple-600 shadow-clinical-sm";
                    } else {
                      tierClass = "bg-[#4E8276] text-white border-[#4E8276] shadow-clinical-sm";
                    }
                  }

                  return (
                    <div
                      key={tier}
                      className={`h-11 rounded-md flex flex-col items-center justify-center text-center font-bold text-xs border transition-all ${tierClass}`}
                    >
                      <span>{tier}</span>
                      <span className="text-[9px] font-normal opacity-90">
                        {tier === "0" || tier === "1+" ? "Neg" : tier === "2+" ? "Equiv" : "Pos"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-center pt-2 border-t border-[#DEE5E1]">
              <div className="text-[11px] font-semibold text-[#68777C]">
                Reported Score:{" "}
                <strong className="text-[#193B4A]">{her2_ihc_score || "N/A"}</strong>
              </div>
              <div className="text-[10px] text-[#68777C] mt-0.5">
                FISH: {her2_fish_status || "Not performed"}
              </div>
            </div>
          </div>

          {/* Ki-67 Proliferation Speedometer Card */}
          <div className="p-4 rounded-xl bg-white border border-[#DEE5E1] shadow-clinical-xs hover:shadow-clinical-sm transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#24343B]">Ki-67 Proliferation Index</span>
                <span className="text-[10px] text-[#68777C] font-mono">Cutoff: 14%</span>
              </div>

              <div className="my-3">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-2xl font-bold text-[#193B4A] tabular-nums">
                    {ki67_index !== null && ki67_index !== undefined ? `${ki67_index}%` : "Not Stated"}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      ki67_index !== null && ki67_index !== undefined
                        ? ki67_index >= 20
                          ? "bg-rose-100 text-rose-800"
                          : "bg-emerald-100 text-emerald-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {ki67_index !== null && ki67_index !== undefined
                      ? ki67_index >= 20
                        ? "High Proliferation"
                        : "Low Proliferation"
                      : "Unreported"}
                  </span>
                </div>

                {/* Progress Line */}
                <div className="w-full bg-[#F0F2EE] h-2.5 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      ki67_index && ki67_index >= 20 ? "bg-rose-500" : "bg-[#4E8276]"
                    }`}
                    style={{ width: `${Math.min(ki67_index || 0, 100)}%` }}
                  />
                  {/* 14% Threshold Marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-black/40 z-10"
                    style={{ left: "14%" }}
                    title="14% St. Gallen Threshold"
                  />
                </div>
              </div>
            </div>

            <div className="text-[11px] text-[#68777C] text-center pt-2 border-t border-[#DEE5E1]">
              Biological Growth Rate Indicator
            </div>
          </div>
        </div>

        {/* 3. Secondary Histopathology & Grade Attributes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#DEE5E1]">
          <div className="p-3.5 bg-[#F5F6F3] rounded-lg border border-[#DEE5E1]">
            <div className="text-[10px] font-bold text-[#68777C] uppercase tracking-wider mb-1">
              Histologic Type
            </div>
            <div className="text-xs font-bold text-[#193B4A]">
              {histologic_type ? histologic_type.replace(/_/g, " ").toUpperCase() : "Invasive Ductal Carcinoma"}
            </div>
            <div className="text-[10px] text-[#68777C] mt-0.5">Primary invasive lesion architecture</div>
          </div>

          <div className="p-3.5 bg-[#F5F6F3] rounded-lg border border-[#DEE5E1]">
            <div className="text-[10px] font-bold text-[#68777C] uppercase tracking-wider mb-1">
              Nottingham Histologic Grade
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-[#193B4A] capitalize">
                {histologic_grade ? histologic_grade.replace(/_/g, " ") : "Grade 2 (Intermediate)"}
              </span>
              <div className="flex space-x-1">
                {[1, 2, 3].map((g) => {
                  const currentGrade = histologic_grade?.includes("1")
                    ? 1
                    : histologic_grade?.includes("2")
                    ? 2
                    : histologic_grade?.includes("3")
                    ? 3
                    : 2;
                  return (
                    <span
                      key={g}
                      className={`w-2 h-2 rounded-full ${
                        g <= currentGrade ? "bg-[#193B4A]" : "bg-[#CBD6D0]"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
            <div className="text-[10px] text-[#68777C] mt-0.5">Tubule formation + Pleomorphism + Mitosis</div>
          </div>

          <div className="p-3.5 bg-[#F5F6F3] rounded-lg border border-[#DEE5E1]">
            <div className="text-[10px] font-bold text-[#68777C] uppercase tracking-wider mb-1">
              Surrogate Intrinsic Subtype
            </div>
            <div className="text-xs font-bold text-[#4E8276] uppercase">
              {molecular_subtype ? molecular_subtype.replace(/_/g, " ") : "Luminal A"}
            </div>
            <div className="text-[10px] text-[#68777C] mt-0.5">Computed via ASCO/CAP & ESMO rules</div>
          </div>
        </div>
      </div>
    </div>
  );
}
