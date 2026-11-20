"use client";

import React from "react";
import Topbar from "../../components/Topbar";

export default function DecisionSupportPage() {
  const guidelines = [
    {
      id: "ESMO-BC-2024-HER2-ADJ-001",
      name: "Adjuvant Trastuzumab in HER2-Positive Early Breast Cancer",
      body: "ESMO Early Breast Cancer Clinical Practice Guidelines 2024",
      evidence: "Level I, Grade A",
      criteria: "HER2 3+ or ISH amplified, tumor > 5 mm or node-positive. Requires baseline LVEF ≥ 50%.",
    },
    {
      id: "ESMO-BC-2024-HER2-NEOADJ-002",
      name: "Neoadjuvant Dual Anti-HER2 Blockade (Pertuzumab + Trastuzumab)",
      body: "ESMO Early Breast Cancer Clinical Practice Guidelines 2024",
      evidence: "Level I, Grade A",
      criteria: "HER2-positive early breast cancer with primary tumor > 20 mm (cT2-T4) or node-positive (cN1-N3).",
    },
    {
      id: "ESMO-BC-2024-HR-ENDO-003",
      name: "Adjuvant Endocrine Therapy in HR-Positive Early Breast Cancer",
      body: "ESMO Early Breast Cancer Clinical Practice Guidelines 2024",
      evidence: "Level I, Grade A",
      criteria: "ER-positive (≥ 1%) and/or PR-positive. AIs preferred for postmenopausal; Tamoxifen or AI + OFS for premenopausal.",
    },
    {
      id: "ESMO-BC-2024-TNBC-NEOADJ-004",
      name: "Neoadjuvant Chemotherapy in Early Triple-Negative Breast Cancer",
      body: "ESMO Early Breast Cancer Clinical Practice Guidelines 2024",
      evidence: "Level I, Grade A",
      criteria: "Triple-negative breast cancer with tumor > 20 mm or node-positive. Incorporates KEYNOTE-522 regimen.",
    },
    {
      id: "ASCO-CAP-2018-HER2-REFLEX-005",
      name: "HER2 2+ Equivocal Reflex In Situ Hybridization (ISH)",
      body: "ASCO/CAP HER2 Testing Guidelines 2018",
      evidence: "Consensus Standard",
      criteria: "IHC score 2+ must be confirmed by reflex ISH or repeat assay before anti-HER2 targeted therapy can be considered.",
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <Topbar />

      <main className="flex-1 p-6 max-w-5xl w-full mx-auto space-y-6">
        <div className="bg-white border border-[#DEE5E1] rounded-lg p-6 shadow-xs">
          <span className="text-[10px] font-semibold text-[#68777C] uppercase tracking-wider">
            Consensus Framework
          </span>
          <h2 className="text-lg font-bold text-[#193B4A] mt-0.5">
            Guideline Rules & Decision-Support Framework
          </h2>
          <p className="text-xs text-[#68777C] mt-1 leading-relaxed">
            All treatment reasoning in the system is deterministically mapped to published international clinical guidelines. The system does not employ uninterpretable deep neural networks for treatment generation.
          </p>
        </div>

        {/* Dynamic Safety Overrides Explanation */}
        <div className="p-5 rounded-lg bg-white border border-[#DEE5E1] shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-[#193B4A] uppercase tracking-wider">
            Dynamic Safety Overrides (Hierarchical Multi-Agent Reasoning)
          </h3>
          <p className="text-xs text-[#24343B] leading-relaxed">
            A key breakthrough of our multi-agent architecture is that <strong>clinical safety strictly overrides guideline recommendations</strong>:
          </p>
          <div className="p-3.5 bg-[#F5F6F3] rounded border border-[#DEE5E1] font-mono text-[11px] text-[#193B4A] space-y-1">
            <div>1. Upstream Guideline Evaluator identifies HER2+ tumor $\rightarrow$ Trastuzumab indicated.</div>
            <div>2. Safety Firewall identifies Left Ventricular Ejection Fraction (LVEF) = 42% (&lt; 50%).</div>
            <div>3. Reasoning Engine strictly overrides Trastuzumab $\rightarrow$ <span className="text-[#B54B4B] font-bold">contraindication_flagged</span>.</div>
            <div>4. Generates clinician action prompt: &quot;Withhold anti-HER2; repeat ECHO in 4 weeks; refer to cardio-oncology.&quot;</div>
          </div>
        </div>

        {/* 5 Guideline Rules Table */}
        <div className="bg-white border border-[#DEE5E1] rounded-lg shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#DEE5E1] bg-[#F5F6F3]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#193B4A]">
              Codified Guideline Rules Register
            </h3>
          </div>
          <div className="divide-y divide-[#DEE5E1]">
            {guidelines.map((g) => (
              <div key={g.id} className="p-4 space-y-1 hover:bg-[#F5F6F3]/50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#193B4A]">{g.id}</span>
                  <span className="badge-teal text-[10px]">{g.evidence}</span>
                </div>
                <h4 className="text-xs font-bold text-[#24343B]">{g.name}</h4>
                <p className="text-xs text-[#68777C] leading-relaxed">{g.criteria}</p>
                <div className="text-[11px] text-[#4E8276] font-medium pt-1">{g.body}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

