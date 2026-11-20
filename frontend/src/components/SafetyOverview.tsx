"use client";

import React from "react";
import { SafetyAssessment } from "../types/cdss";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  HeartPulse,
  Activity,
  Droplets,
  TestTube,
  Baby,
  FileWarning,
  CheckCircle2,
  Info,
} from "lucide-react";

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

  const cardiac = (organ_function_assessments as any)?.cardiac || (organ_function_assessments as any)?.cardiac_function;
  const renal = (organ_function_assessments as any)?.renal || (organ_function_assessments as any)?.renal_function;
  const hepatic = (organ_function_assessments as any)?.hepatic || (organ_function_assessments as any)?.hepatic_function;
  const hematologic = (organ_function_assessments as any)?.hematologic || (organ_function_assessments as any)?.hematologic_function;
  const reproductive = (organ_function_assessments as any)?.reproductive || (organ_function_assessments as any)?.reproductive_status;

  const renderStatusHero = () => {
    switch (overall_safety_status) {
      case "contraindication_identified":
        return (
          <div className="p-5 rounded-xl bg-[#F8E9E7] border-2 border-[#B54B4B] shadow-clinical-alert flex items-start space-x-4 text-[#B54B4B] animate-pulse-slow">
            <ShieldAlert className="w-7 h-7 text-[#B54B4B] shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-base font-bold tracking-tight">
                  Absolute Contraindication / Boxed Warning Flagged
                </h4>
                <span className="px-2 py-0.5 rounded bg-[#B54B4B] text-white text-[10px] font-bold uppercase tracking-wider">
                  Critical Hold
                </span>
              </div>
              <p className="text-xs text-[#24343B] mt-1.5 leading-relaxed">
                Critical safety rules have been triggered based on documented organ dysfunction or patient comorbidities. Affected oncology regimens have been automatically overridden to{" "}
                <code className="px-1.5 py-0.5 bg-white border border-[#B54B4B]/30 rounded text-[#B54B4B] font-mono text-[11px]">
                  contraindication_flagged
                </code>{" "}
                and require urgent multidisciplinary tumor board review prior to any therapy order.
              </p>
            </div>
          </div>
        );
      case "potential_interaction":
        return (
          <div className="p-5 rounded-xl bg-[#F6EEDC] border border-[#B78643] shadow-clinical-sm flex items-start space-x-4 text-[#B78643]">
            <AlertTriangle className="w-6 h-6 text-[#B78643] shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold tracking-tight">
                  Major Drug-Drug Interaction Detected
                </h4>
                <span className="px-2 py-0.5 rounded bg-[#B78643] text-white text-[10px] font-bold uppercase tracking-wider">
                  Caution
                </span>
              </div>
              <p className="text-xs text-[#24343B] mt-1 leading-relaxed">
                A significant pharmacokinetic or pharmacodynamic interaction was identified between candidate therapies and concomitant medications (e.g. strong CYP2D6 inhibition with Tamoxifen). Review alternative agents below.
              </p>
            </div>
          </div>
        );
      case "insufficient_information":
        return (
          <div className="p-5 rounded-xl bg-white border border-[#DEE5E1] shadow-clinical-xs flex items-start space-x-4 text-[#193B4A]">
            <Info className="w-6 h-6 text-[#4E8276] shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold tracking-tight">
                  Incomplete Baseline Safety Telemetry
                </h4>
                <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-bold uppercase tracking-wider border border-gray-200">
                  Data Gap
                </span>
              </div>
              <p className="text-xs text-[#68777C] mt-1 leading-relaxed">
                Retrospective records lack certain essential laboratory panels (e.g. LVEF echocardiogram or creatinine clearance). In accordance with clinical CDSS safety protocols,{" "}
                <strong className="text-[#24343B]">unrecorded variables are NEVER assumed normal</strong>. On-site clinician verification is required.
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-5 rounded-xl bg-[#E7F0EA] border border-[#4E8276] shadow-clinical-sm flex items-start space-x-4 text-[#4E8276]">
            <ShieldCheck className="w-6 h-6 text-[#4E8276] shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold tracking-tight">
                  Organ Function Cleared for Guideline-Concordant Regimens
                </h4>
                <span className="px-2 py-0.5 rounded bg-[#4E8276] text-white text-[10px] font-bold uppercase tracking-wider">
                  Cleared
                </span>
              </div>
              <p className="text-xs text-[#24343B] mt-1 leading-relaxed">
                No active organ contraindications or FDA Black Box Warnings were breached in the evaluated patient profile. Regimens remain subject to clinical confirmation.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Overall Safety Status Banner */}
      {renderStatusHero()}

      {/* 2. Visual 5-Domain Organ Risk Telemetry Grid */}
      <div className="bg-white border border-[#DEE5E1] rounded-xl p-6 shadow-clinical-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#DEE5E1] mb-6">
          <div className="flex items-center space-x-2.5">
            <Activity className="w-5 h-5 text-[#4E8276]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#193B4A]">
              5-Domain Organ Risk Telemetry & Medication Safeguards
            </h3>
          </div>
          <span className="text-[11px] text-[#68777C] font-mono">ASCO / FDA Standards</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Cardiac Domain */}
          <div className="p-4 rounded-xl border border-[#DEE5E1] bg-[#F5F6F3] flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-bold text-[#193B4A]">Cardiac Function (LVEF)</span>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    cardiac?.lvef_percent && cardiac.lvef_percent <= 45
                      ? "bg-rose-100 text-rose-800 border border-rose-300"
                      : cardiac?.lvef_percent && cardiac.lvef_percent < 50
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  }`}
                >
                  {cardiac?.lvef_percent && cardiac.lvef_percent <= 45 ? "Cardiotoxicity" : "Cleared"}
                </span>
              </div>

              <div className="my-3">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-2xl font-bold text-[#193B4A] tabular-nums">
                    {cardiac?.lvef_percent ? `${cardiac.lvef_percent}%` : "Not Documented"}
                  </span>
                  <span className="text-[11px] text-[#68777C]">Cutoff: 50%</span>
                </div>

                {/* Visual EF Meter */}
                <div className="w-full bg-[#CBD6D0] h-2.5 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full transition-all duration-700 ${
                      cardiac?.lvef_percent && cardiac.lvef_percent <= 45
                        ? "bg-rose-600"
                        : cardiac?.lvef_percent && cardiac.lvef_percent < 50
                        ? "bg-amber-500"
                        : "bg-[#4E8276]"
                    }`}
                    style={{ width: `${Math.min(cardiac?.lvef_percent || 0, 100)}%` }}
                  />
                  {/* 50% threshold marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-black/50 z-10"
                    style={{ left: "50%" }}
                    title="50% Trastuzumab Safety Cutoff"
                  />
                </div>
              </div>

              <p className="text-[11px] text-[#68777C] leading-snug">
                {cardiac?.lvef_percent && cardiac.lvef_percent <= 45
                  ? "Absolute contraindication to Trastuzumab and Anthracyclines due to left ventricular ejection fraction ≤ 45%."
                  : "Baseline echocardiogram evaluated for anti-HER2 targeted and anthracycline systemic therapy."}
              </p>
            </div>

            <div className="text-[10px] text-[#68777C] pt-2 mt-3 border-t border-[#DEE5E1]">
              Trastuzumab / Doxorubicin Shield
            </div>
          </div>

          {/* 2. Renal Domain */}
          <div className="p-4 rounded-xl border border-[#DEE5E1] bg-[#F5F6F3] flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Droplets className="w-4 h-4 text-cyan-600" />
                  <span className="text-xs font-bold text-[#193B4A]">Renal Function (CrCl)</span>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                  {renal?.crcl_ml_min ? `${renal.crcl_ml_min} mL/min` : "Missing"}
                </span>
              </div>

              <div className="my-3">
                <div className="text-xl font-bold text-[#193B4A]">
                  {renal?.crcl_ml_min ? `${renal.crcl_ml_min} mL/min` : "Unrecorded"}
                </div>
                <p className="text-[11px] text-[#68777C] mt-1 leading-snug">
                  Creatinine clearance must exceed <strong>50 mL/min</strong> for standard cisplatin/carboplatin therapy in TNBC neoadjuvant protocols.
                </p>
              </div>
            </div>

            <div className="text-[10px] text-[#68777C] pt-2 mt-3 border-t border-[#DEE5E1]">
              Platinum Nephrotoxicity Gate
            </div>
          </div>

          {/* 3. Hepatic Domain */}
          <div className="p-4 rounded-xl border border-[#DEE5E1] bg-[#F5F6F3] flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <TestTube className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-[#193B4A]">Hepatic Clearance</span>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {hepatic?.total_bilirubin_mg_dl ? `${hepatic.total_bilirubin_mg_dl} mg/dL` : "Normal / Missing"}
                </span>
              </div>

              <div className="my-3">
                <div className="text-xl font-bold text-[#193B4A]">
                  {hepatic?.total_bilirubin_mg_dl ? `${hepatic.total_bilirubin_mg_dl} mg/dL` : "Unrecorded"}
                </div>
                <p className="text-[11px] text-[#68777C] mt-1 leading-snug">
                  Total bilirubin must be &le; 1.5 mg/dL. Doxorubicin clearance is severely impaired in hyperbilirubinemia.
                </p>
              </div>
            </div>

            <div className="text-[10px] text-[#68777C] pt-2 mt-3 border-t border-[#DEE5E1]">
              Anthracycline Clearance Gate
            </div>
          </div>

          {/* 4. Hematologic Domain */}
          <div className="p-4 rounded-xl border border-[#DEE5E1] bg-[#F5F6F3] flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-[#193B4A]">Hematologic Reserve</span>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Baseline OK
                </span>
              </div>

              <div className="my-3">
                <div className="text-sm font-bold text-[#193B4A]">
                  ANC &ge; 1,500 / &mu;L | Platelets &ge; 100,000 / &mu;L
                </div>
                <p className="text-[11px] text-[#68777C] mt-1 leading-snug">
                  Standard thresholds required before each cycle of cytotoxic chemotherapy (AC-T, TCHP, Carboplatin).
                </p>
              </div>
            </div>

            <div className="text-[10px] text-[#68777C] pt-2 mt-3 border-t border-[#DEE5E1]">
              Taxane Neutropenia Gate
            </div>
          </div>

          {/* 5. Reproductive & Endocrine Domain */}
          <div className="p-4 rounded-xl border border-[#DEE5E1] bg-[#F5F6F3] flex flex-col justify-between shadow-xs lg:col-span-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Baby className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-bold text-[#193B4A]">
                    Reproductive & Menopausal Safety Shield
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                <div className="p-3 bg-white rounded-lg border border-[#DEE5E1]">
                  <span className="text-[10px] font-bold text-[#68777C] uppercase">Pregnancy Status</span>
                  <div className="text-xs font-semibold text-[#193B4A] mt-0.5">
                    Negative / Not Pregnant
                  </div>
                  <p className="text-[10px] text-[#68777C] mt-1">
                    Trastuzumab, Tamoxifen, & AIs strictly contraindicated in confirmed pregnancy.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-[#DEE5E1]">
                  <span className="text-[10px] font-bold text-[#68777C] uppercase">Aromatase Inhibitors</span>
                  <div className="text-xs font-semibold text-[#193B4A] mt-0.5">
                    Postmenopausal Only
                  </div>
                  <p className="text-[10px] text-[#68777C] mt-1">
                    Contraindicated in premenopausal patients without concurrent ovarian function suppression (OFS).
                  </p>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-[#68777C] pt-2 mt-1 border-t border-[#DEE5E1]">
              Teratogenicity & Ovarian Suppression Protocol
            </div>
          </div>
        </div>
      </div>

      {/* 3. Detailed Safety Findings & Boxed Warnings */}
      {safety_findings && safety_findings.length > 0 && (
        <div className="bg-white border border-[#DEE5E1] rounded-xl p-6 shadow-clinical-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#193B4A] pb-3 border-b border-[#DEE5E1] mb-4 flex items-center space-x-2">
            <FileWarning className="w-4 h-4 text-[#B54B4B]" />
            <span>Documented Safety Findings & Black Box Warnings</span>
          </h3>

          <div className="space-y-3">
            {safety_findings.map((finding, idx) => {
              const isCritical = finding.severity === "critical" || finding.safety_category === "absolute_contraindication" || finding.fda_boxed_warning;
              const medication = finding.medication_or_class || (finding as any).affected_medication || "Oncology Regimen";
              const rationale = finding.explanation || (finding as any).clinical_rationale || finding.triggering_condition;
              const recommendation = finding.clinician_recommendation || (finding as any).action_prompt;
              const ruleId = finding.finding_id || (finding as any).rule_id || "SAFETY_RULE";

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    isCritical
                      ? "bg-[#F8E9E7] border-[#B54B4B]"
                      : "bg-[#F6EEDC] border-[#B78643]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          isCritical
                            ? "bg-[#B54B4B] text-white"
                            : "bg-[#B78643] text-white"
                        }`}
                      >
                        {finding.safety_category ? finding.safety_category.replace(/_/g, " ").toUpperCase() : finding.severity.toUpperCase()}
                      </span>
                      <span className="text-xs font-bold text-[#193B4A]">
                        Agent: {medication}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#68777C] font-mono">
                      {ruleId}
                    </span>
                  </div>

                  <p className="text-xs text-[#24343B] mt-2 leading-relaxed font-medium">
                    {rationale}
                  </p>

                  {recommendation && (
                    <div className="mt-3 p-2.5 rounded bg-white/80 border border-[#DEE5E1] text-xs text-[#193B4A] flex items-start space-x-2">
                      <strong className="text-[#B54B4B] shrink-0">Mandatory Action:</strong>
                      <span>{recommendation}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Missing Safety Variables Checklist */}
      {missing_safety_information && missing_safety_information.length > 0 && (
        <div className="bg-white border border-[#DEE5E1] rounded-xl p-5 shadow-clinical-xs">
          <div className="flex items-center space-x-2 mb-3">
            <Info className="w-4 h-4 text-[#B78643]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#193B4A]">
              Missing Clinical Safety Data (Not Assumed Normal)
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {missing_safety_information.map((item: any, idx: number) => {
              const label = item?.parameter_name?.replace(/_/g, " ") || (typeof item === "string" ? item : "Missing Parameter");
              const note = item?.required_for_evaluation_of || null;
              return (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F5F6F3] border border-dashed border-[#DEE5E1] text-[#68777C] flex items-center space-x-1.5"
                  title={note || undefined}
                >
                  <span className="font-semibold text-[#193B4A]">{label}</span>
                  {note && <span className="text-[10px] text-[#68777C]">({note})</span>}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
