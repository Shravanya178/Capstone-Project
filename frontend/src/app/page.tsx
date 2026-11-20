"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Topbar from "../components/Topbar";
import { CdssApi } from "../services/api";
import { SampleCaseMeta } from "../types/cdss";

export default function OverviewPage() {
  const router = useRouter();
  const [sampleCases, setSampleCases] = useState<SampleCaseMeta[]>([]);
  const [capabilities, setCapabilities] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cases, caps] = await Promise.all([
          CdssApi.listSampleCases().catch(() => [
            {
              case_id: "scenario_a",
              filename: "scenario_a_complete_profile.json",
              title: "Scenario A: Luminal A Invasive Ductal Carcinoma",
              description: "Postmenopausal patient, ER+ 85%, PR+ 70%, HER2 negative, primary tumor 22mm (cT2 cN0). Clean baseline staging.",
              key_features: ["ER positive", "PR positive", "HER2 negative", "Postmenopausal", "cT2 cN0"],
            },
            {
              case_id: "scenario_b",
              filename: "scenario_b_her2_equivocal.json",
              title: "Scenario B: HER2 IHC 2+ Equivocal Reflex Case",
              description: "Diagnostic biopsy showing HER2 IHC 2+ equivocal with reflex FISH pending. Tests anti-HER2 pause guardrail.",
              key_features: ["HER2 IHC 2+ Equivocal", "Reflex ISH Required", "Anti-HER2 Paused"],
            },
            {
              case_id: "scenario_c",
              filename: "scenario_c_missing_information.json",
              title: "Scenario C: Incomplete Research Profile (Missing Labs)",
              description: "Retrospective trial subject lacking baseline echocardiography and renal panel. Tests missingness safeguard.",
              key_features: ["Missing LVEF", "Missing CrCl", "Insufficient Information Status"],
            },
            {
              case_id: "scenario_d",
              filename: "scenario_d_er_low_notification.json",
              title: "Scenario D: ER-Low (1-9%) Notification",
              description: "Invasive carcinoma with low ER expression (5%) triggering ASCO/CAP 2020 ER-low clinical alert.",
              key_features: ["ER-Low 5%", "Endocrine Heterogeneity Alert"],
            },
            {
              case_id: "scenario_e",
              filename: "scenario_e_temporal_segregation.json",
              title: "Scenario E: Pre-NAT Biopsy vs Post-Resection Pathology",
              description: "I-SPY-1 trial subject with longitudinal timeline tracking pre-treatment MRI and surgical resection cellularity.",
              key_features: ["Pre-treatment Biopsy", "Post-resection Residual Bed", "Longitudinal Timeline"],
            },
          ]),
          CdssApi.getCapabilities().catch(() => null),
        ]);
        setSampleCases(cases);
        setCapabilities(caps);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleLaunchCase = (caseId: string) => {
    router.push(`/workspace?case=${caseId}`);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Topbar />

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Hero Section */}
        <div className="bg-white border border-[#DEE5E1] rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-[#E7F0EA] text-[#4E8276] border border-[#DEE5E1]">
              <span>🛡</span>
              <span>Explainable Rule-Based Clinical Decision Support</span>
            </div>
            <h2 className="text-xl font-bold text-[#193B4A] tracking-tight">
              Breast Cancer Clinical Decision Support System (CDSS)
            </h2>
            <p className="text-xs text-[#68777C] leading-relaxed">
              Synthesizes heterogeneous pathology reports, breast imaging notes, and DICOM Structured Reports into standardized canonical patient profiles. Evaluates deterministic guideline consensus rules (ESMO 2024 / ASCO) and screens organ toxicities against 11 evidence-based contraindications.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              href="/new-assessment"
              className="px-4 py-2.5 bg-[#193B4A] hover:bg-[#244b5c] text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center justify-center space-x-2"
            >
              <span>⊕</span>
              <span>New Patient Assessment</span>
            </Link>
            <Link
              href="/workspace?case=scenario_a"
              className="px-4 py-2.5 bg-white border border-[#DEE5E1] hover:bg-[#F5F6F3] text-[#193B4A] text-xs font-semibold rounded-md transition-colors flex items-center justify-center space-x-2"
            >
              <span>🔬</span>
              <span>Open Live Workspace</span>
            </Link>
          </div>
        </div>

        {/* Regulatory Research Disclaimer Notice */}
        <div className="p-4 rounded-lg bg-[#F6EEDC] border border-[#B78643]/30 flex items-start space-x-3 text-[#B78643] text-xs">
          <span className="text-base flex-shrink-0">⚠️</span>
          <div>
            <strong className="font-semibold">Research Decision-Support Disclaimer:</strong> This system is a research-oriented clinical decision support prototype. It is <strong>NOT an autonomous diagnostic or treatment-prescribing system</strong>. It does not replace the independent medical judgment of an oncologist, pathologist, or multidisciplinary tumor board.
          </div>
        </div>

        {/* Clinical Scenario Evaluation Hub */}
        <div className="bg-white border border-[#DEE5E1] rounded-lg p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DEE5E1]">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#193B4A]">
                Validated Clinical Scenarios & Test Cohorts
              </h3>
              <p className="text-xs text-[#68777C]">
                Select a verified case to launch the interactive workspace and inspect biomarker interpretation, guideline evaluation, safety overrides, and treatment matrices.
              </p>
            </div>
            <span className="text-xs text-[#68777C] font-mono">
              {sampleCases.length} Scenarios Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleCases.map((c) => (
              <div
                key={c.case_id}
                className="p-4 rounded border border-[#DEE5E1] bg-[#F5F6F3] hover:bg-white hover:border-[#4E8276] transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] uppercase font-bold text-[#4E8276]">
                      {c.case_id}
                    </span>
                    <span className="text-[10px] text-[#68777C] bg-white border border-[#DEE5E1] px-1.5 py-0.5 rounded">
                      Verified
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#193B4A]">{c.title}</h4>
                  <p className="text-[11px] text-[#68777C] mt-1 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {c.key_features.map((f, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-[#DEE5E1] text-[#24343B]"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleLaunchCase(c.case_id)}
                    className="w-full py-1.5 rounded bg-[#193B4A] hover:bg-[#244b5c] text-white text-xs font-medium transition-colors shadow-xs"
                  >
                    Evaluate Case in Workspace →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modules & Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-lg border border-[#DEE5E1] bg-white shadow-xs space-y-2">
            <div className="w-7 h-7 rounded bg-[#E7F0EA] text-[#4E8276] flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h4 className="text-xs font-bold text-[#193B4A] uppercase tracking-wider">
              Multimodal Ingestion & DICOM SR
            </h4>
            <p className="text-xs text-[#68777C] leading-relaxed">
              Parses pathology synoptic reports, narrative MRI impressions, and DICOM Structured Reports (SOP Class 1.2.840.10008.5.1.4.1.1.88.33) with full character span provenance.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-[#DEE5E1] bg-white shadow-xs space-y-2">
            <div className="w-7 h-7 rounded bg-[#E7F0EA] text-[#4E8276] flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h4 className="text-xs font-bold text-[#193B4A] uppercase tracking-wider">
              Guideline Consensus (ESMO 2024 / ASCO)
            </h4>
            <p className="text-xs text-[#68777C] leading-relaxed">
              Deterministic evaluation of 5 peer-reviewed clinical rules. Automatically detects ER-low (1-10%) and pauses anti-HER2 regimens when IHC 2+ is equivocal.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-[#DEE5E1] bg-white shadow-xs space-y-2">
            <div className="w-7 h-7 rounded bg-[#E7F0EA] text-[#4E8276] flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h4 className="text-xs font-bold text-[#193B4A] uppercase tracking-wider">
              Safety Firewall & Contraindications
            </h4>
            <p className="text-xs text-[#68777C] leading-relaxed">
              Screens 11 safety rules and FDA Boxed Warnings across cardiac (LVEF &lt; 50%), renal, and thromboembolic risks. Enforces dynamic safety overrides.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
