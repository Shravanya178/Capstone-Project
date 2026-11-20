"use client";

import React, { useState } from "react";
import { PathologyBiomarkers } from "../types/cdss";

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

  return (
    <div className="space-y-6">
      {/* 1. Critical Clinical Biomarker Alerts */}
      {isHer2Equivocal && (
        <div className="p-4 rounded-lg bg-[#F8E9E7] border border-[#B54B4B] flex items-start space-x-3 text-[#B54B4B]">
          <span className="text-xl">⚠️</span>
          <div>
            <h4 className="text-sm font-bold">
              HER2 IHC 2+ Equivocal — Confirmatory Reflex ISH / FISH Mandated
            </h4>
            <p className="text-xs text-[#24343B] mt-0.5 leading-relaxed">
              Per ASCO/CAP 2018 guidelines, an IHC score of 2+ is equivocal and cannot be classified as positive or negative without in situ hybridization. Anti-HER2 targeted therapy is held in <strong className="text-[#B54B4B]">requires_clinician_review</strong> pending reflex test completion.
            </p>
          </div>
        </div>
      )}

      {er_low_flag && (
        <div className="p-4 rounded-lg bg-[#F6EEDC] border border-[#B78643] flex items-start space-x-3 text-[#B78643]">
          <span className="text-xl">ℹ️</span>
          <div>
            <h4 className="text-sm font-bold">
              Estrogen Receptor Low Positive (1–10% Nuclear Staining)
            </h4>
            <p className="text-xs text-[#24343B] mt-0.5 leading-relaxed">
              Per ASCO/CAP 2020 guidelines, tumors with 1–10% ER expression exhibit heterogeneous biology and limited endocrine sensitivity compared to ER &gt; 10%. Oncologist review is advised regarding the relative benefit of adjuvant endocrine therapy versus chemotherapy.
            </p>
          </div>
        </div>
      )}

      {/* 2. Structured Biomarker Grid */}
      <div className="bg-white border border-[#DEE5E1] rounded-lg p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#DEE5E1] mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#193B4A]">
            Standardized Pathology Biomarker Profile
          </h3>
          <button
            onClick={() => setShowInterpretationHelp(!showInterpretationHelp)}
            className="text-xs text-[#4E8276] hover:underline font-medium flex items-center space-x-1"
          >
            <span>{showInterpretationHelp ? "Hide Interpretation Guide ▲" : "How is this interpreted? ▼"}</span>
          </button>
        </div>

        {/* Expandable Interpretation Guide */}
        {showInterpretationHelp && (
          <div className="mb-5 p-4 rounded bg-[#F5F6F3] border border-[#DEE5E1] text-xs text-[#24343B] space-y-2 leading-relaxed animate-in fade-in duration-150">
            <h5 className="font-semibold text-[#193B4A]">IHC Surrogate Subtyping Standard (St. Gallen 2013 / Goldhirsch et al.)</h5>
            <p>
              Surrogate molecular subtyping is approximated via immunohistochemistry (IHC) protein expression:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[#68777C]">
              <li><strong>Luminal A</strong>: ER positive, PR positive (&ge; 20%), HER2 negative, low proliferation (Ki-67 &lt; 20% or Grade 1–2).</li>
              <li><strong>Luminal B (HER2-)</strong>: ER positive, HER2 negative, with either PR &lt; 20% or high proliferation (Ki-67 &ge; 20% / Grade 3).</li>
              <li><strong>Luminal B (HER2+)</strong>: Triple positive (ER+, PR any, HER2+).</li>
              <li><strong>HER2-Enriched</strong>: ER negative, PR negative, HER2 positive.</li>
              <li><strong>Triple-Negative (TNBC)</strong>: ER negative, PR negative, HER2 negative.</li>
            </ul>
            <div className="text-[11px] text-[#68777C] pt-1 border-t border-[#DEE5E1]">
              ⚠️ <em>Notice:</em> IHC surrogate classifications are clinical approximations and are <strong>NOT PAM50 gene-expression microarrays</strong>.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Estrogen Receptor */}
          <div className="p-3.5 rounded border border-[#DEE5E1] bg-[#F5F6F3]">
            <div className="text-[11px] font-semibold text-[#68777C] mb-1">Estrogen Receptor (ER)</div>
            <div className="text-sm font-bold text-[#193B4A] capitalize">
              {er_status}
              {er_percentage !== null && er_percentage !== undefined && (
                <span className="text-xs font-normal text-[#68777C] ml-1.5 tabular-nums">
                  ({er_percentage}%)
                </span>
              )}
            </div>
            <div className="mt-1.5">
              {er_low_flag ? (
                <span className="badge-warning text-[10px]">ER-Low (1-10%)</span>
              ) : er_status === "positive" ? (
                <span className="badge-teal text-[10px]">Positive</span>
              ) : (
                <span className="badge-neutral text-[10px]">Negative</span>
              )}
            </div>
          </div>

          {/* Progesterone Receptor */}
          <div className="p-3.5 rounded border border-[#DEE5E1] bg-[#F5F6F3]">
            <div className="text-[11px] font-semibold text-[#68777C] mb-1">Progesterone Receptor (PR)</div>
            <div className="text-sm font-bold text-[#193B4A] capitalize">
              {pr_status}
              {pr_percentage !== null && pr_percentage !== undefined && (
                <span className="text-xs font-normal text-[#68777C] ml-1.5 tabular-nums">
                  ({pr_percentage}%)
                </span>
              )}
            </div>
            <div className="mt-1.5">
              {pr_status === "positive" ? (
                <span className="badge-teal text-[10px]">Positive</span>
              ) : (
                <span className="badge-neutral text-[10px]">Negative</span>
              )}
            </div>
          </div>

          {/* HER2 Receptor */}
          <div className="p-3.5 rounded border border-[#DEE5E1] bg-[#F5F6F3]">
            <div className="text-[11px] font-semibold text-[#68777C] mb-1">HER2 / neu Status</div>
            <div className="text-sm font-bold text-[#193B4A] capitalize">
              {her2_status}
              {her2_ihc_score && (
                <span className="text-xs font-normal text-[#68777C] ml-1.5 font-mono">
                  [IHC {her2_ihc_score}]
                </span>
              )}
            </div>
            <div className="mt-1.5">
              {isHer2Equivocal ? (
                <span className="badge-critical text-[10px] animate-pulse">Equivocal (Reflex Req)</span>
              ) : her2_status === "positive" ? (
                <span className="badge-primary text-[10px]">Positive (Amplified)</span>
              ) : (
                <span className="badge-neutral text-[10px]">Negative (0/1+)</span>
              )}
            </div>
          </div>

          {/* Ki-67 Index */}
          <div className="p-3.5 rounded border border-[#DEE5E1] bg-[#F5F6F3]">
            <div className="text-[11px] font-semibold text-[#68777C] mb-1">Proliferation (Ki-67)</div>
            <div className="text-sm font-bold text-[#193B4A] tabular-nums">
              {ki67_index !== null && ki67_index !== undefined ? `${ki67_index}%` : "Not Recorded"}
            </div>
            <div className="mt-1.5">
              {ki67_index !== null && ki67_index !== undefined ? (
                ki67_index >= 20 ? (
                  <span className="badge-warning text-[10px]">High (&ge; 20%)</span>
                ) : (
                  <span className="badge-teal text-[10px]">Low (&lt; 20%)</span>
                )
              ) : (
                <span className="badge-neutral text-[10px]">Unassessed</span>
              )}
            </div>
          </div>

          {/* Histological Grade */}
          <div className="p-3.5 rounded border border-[#DEE5E1] bg-[#F5F6F3]">
            <div className="text-[11px] font-semibold text-[#68777C] mb-1">Nottingham Grade</div>
            <div className="text-sm font-bold text-[#193B4A] capitalize">
              {histologic_grade?.replace(/_/g, " ") || "Not Documented"}
            </div>
            <div className="text-[10px] text-[#68777C] mt-1.5">Tubule / Nuclear / Mitotic</div>
          </div>

          {/* Histological Diagnosis */}
          <div className="p-3.5 rounded border border-[#DEE5E1] bg-[#F5F6F3]">
            <div className="text-[11px] font-semibold text-[#68777C] mb-1">Histological Type</div>
            <div className="text-sm font-bold text-[#193B4A] capitalize truncate">
              {histologic_type?.replace(/_/g, " ") || "Invasive Carcinoma"}
            </div>
            <div className="text-[10px] text-[#68777C] mt-1.5">WHO Classification</div>
          </div>

          {/* Surrogate Molecular Subtype (Spans 2 cols) */}
          <div className="p-3.5 rounded border border-[#DEE5E1] bg-[#F5F6F3] sm:col-span-2">
            <div className="text-[11px] font-semibold text-[#68777C] mb-1">IHC Surrogate Subtype</div>
            <div className="text-sm font-bold text-[#193B4A] capitalize">
              {molecular_subtype.replace(/_/g, " ")}
            </div>
            <div className="text-[10px] text-[#68777C] mt-1.5">
              Derived from ER, PR, HER2 IHC, Ki-67, and histological grade.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

