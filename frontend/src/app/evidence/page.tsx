"use client";

import React from "react";
import Topbar from "../../components/Topbar";

export default function EvidenceTraceabilityPage() {
  const observationClasses = [
    { name: "ER_POSITIVE", desc: "Estrogen receptor positive (> 10% nuclear staining)", standard: "ASCO/CAP 2020" },
    { name: "ER_NEGATIVE", desc: "Estrogen receptor negative (< 1% nuclear staining)", standard: "ASCO/CAP 2020" },
    { name: "HER2_POSITIVE", desc: "HER2 overexpression by IHC 3+ or amplified ISH ratio ≥ 2.0", standard: "ASCO/CAP 2018" },
    { name: "HER2_NEGATIVE", desc: "HER2 negative by IHC 0 or 1+", standard: "ASCO/CAP 2018" },
    { name: "HER2_EQUIVOCAL", desc: "HER2 IHC 2+ requiring reflex ISH before therapy", standard: "ASCO/CAP 2018" },
    { name: "GRADE_1", desc: "Nottingham Histologic Grade 1 (3–5 points, well differentiated)", standard: "Elston-Ellis / Nottingham" },
    { name: "GRADE_2", desc: "Nottingham Histologic Grade 2 (6–7 points, moderately differentiated)", standard: "Elston-Ellis / Nottingham" },
    { name: "GRADE_3", desc: "Nottingham Histologic Grade 3 (8–9 points, poorly differentiated)", standard: "Elston-Ellis / Nottingham" },
    { name: "HISTOLOGY_IDC", desc: "Invasive Ductal Carcinoma of No Special Type (NST)", standard: "WHO Classification" },
    { name: "HISTOLOGY_ILC", desc: "Invasive Lobular Carcinoma (dyscohesive E-cadherin negative)", standard: "WHO Classification" },
    { name: "TUMOR_SIZE", desc: "Greatest primary tumor dimension in millimeters", standard: "AJCC 8th Edition" },
    { name: "LATERALITY", desc: "Primary tumor breast laterality (Left, Right, Bilateral)", standard: "DICOM Part 16" },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <Topbar />

      <main className="flex-1 p-6 max-w-5xl w-full mx-auto space-y-6">
        <div className="bg-white border border-[#DEE5E1] rounded-lg p-6 shadow-xs">
          <span className="text-[10px] font-semibold text-[#68777C] uppercase tracking-wider">
            Clinical Traceability Knowledge Base
          </span>
          <h2 className="text-lg font-bold text-[#193B4A] mt-0.5">
            Evidence Traceability & NLP Grounding
          </h2>
          <p className="text-xs text-[#68777C] mt-1 leading-relaxed">
            Every clinical observation in this CDSS is anchored to verified character spans, source records, and extraction confidences. We enforce complete auditability so clinicians can verify exactly why an entity was recorded.
          </p>
        </div>

        {/* Traceability Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-white border border-[#DEE5E1] shadow-xs space-y-2">
            <div className="text-xs font-bold text-[#193B4A] uppercase">Exact Character Spans</div>
            <p className="text-xs text-[#68777C] leading-relaxed">
              Every extracted observation stores start and end character offsets within the source narrative, enabling instant visual verification.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-white border border-[#DEE5E1] shadow-xs space-y-2">
            <div className="text-xs font-bold text-[#193B4A] uppercase">Negation & Uncertainty</div>
            <p className="text-xs text-[#68777C] leading-relaxed">
              ClinicalTextPreprocessor detects negation cues (&quot;negative for&quot;, &quot;no evidence of&quot;) and hedging phrases (&quot;suspicious for&quot;, &quot;equivocal&quot;) to avoid misclassification.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-white border border-[#DEE5E1] shadow-xs space-y-2">
            <div className="text-xs font-bold text-[#193B4A] uppercase">Auxiliary Bio_ClinicalBERT</div>
            <p className="text-xs text-[#68777C] leading-relaxed">
              Emily Alsentzer&apos;s Bio_ClinicalBERT was fine-tuned as an auxiliary classifier (99.75% test accuracy) to confirm sentence context alongside deterministic rules.
            </p>
          </div>
        </div>

        {/* 12-Class Taxonomy Table */}
        <div className="bg-white border border-[#DEE5E1] rounded-lg shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#DEE5E1] bg-[#F5F6F3]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#193B4A]">
              12-Class Breast Oncology Observation Taxonomy
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#F5F6F3]/50 border-b border-[#DEE5E1] text-[#68777C]">
                  <th className="p-3 font-semibold">Semantic Concept Class</th>
                  <th className="p-3 font-semibold">Clinical Definition</th>
                  <th className="p-3 font-semibold">Regulatory Standard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DEE5E1]">
                {observationClasses.map((item) => (
                  <tr key={item.name} className="hover:bg-[#F5F6F3]/50">
                    <td className="p-3 font-mono font-bold text-[#193B4A]">{item.name}</td>
                    <td className="p-3 text-[#24343B]">{item.desc}</td>
                    <td className="p-3 text-[#4E8276] font-medium">{item.standard}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

