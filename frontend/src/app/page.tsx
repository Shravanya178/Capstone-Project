"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Topbar from "../components/Topbar";
import { CdssApi } from "../services/api";
import { SampleCaseMeta } from "../types/cdss";
import {
  HeartPulse,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Dna,
  FileText,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Microscope,
  FileSpreadsheet,
  Clock,
  ChevronRight,
  Database,
  ExternalLink,
} from "lucide-react";

export default function OverviewPage() {
  const router = useRouter();
  const [sampleCases, setSampleCases] = useState<SampleCaseMeta[]>([]);
  const [activeStage, setActiveStage] = useState<number>(1);
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const cases = await CdssApi.listSampleCases().catch(() => [
          {
            case_id: "scenario_a",
            filename: "scenario_a_complete_profile.json",
            title: "Scenario A: Luminal A Invasive Ductal Carcinoma",
            description: "Postmenopausal patient, ER+ 85%, PR+ 70%, HER2 negative, primary tumor 22mm (cT2 cN0). Complete baseline staging.",
            key_features: ["ER positive 85%", "PR positive 70%", "HER2 negative", "Postmenopausal", "cT2 cN0"],
          },
          {
            case_id: "scenario_b",
            filename: "scenario_b_her2_equivocal.json",
            title: "Scenario B: HER2 IHC 2+ Equivocal Reflex Case",
            description: "Diagnostic biopsy showing HER2 IHC 2+ equivocal with reflex FISH pending. Triggers anti-HER2 pause guardrail.",
            key_features: ["HER2 IHC 2+ Equivocal", "Reflex ISH Mandate", "Anti-HER2 Paused"],
          },
          {
            case_id: "scenario_c",
            filename: "scenario_c_missing_information.json",
            title: "Scenario C: Incomplete Research Profile (Missing Labs)",
            description: "Retrospective subject lacking baseline echocardiography and renal panel. Tests unrecorded normalcy safeguard.",
            key_features: ["Missing LVEF", "Missing CrCl", "Insufficient Info Status"],
          },
          {
            case_id: "scenario_d",
            filename: "scenario_d_er_low_notification.json",
            title: "Scenario D: ER-Low (1-9%) Clinical Notification",
            description: "Invasive carcinoma with 5% ER expression triggering ASCO/CAP 2020 ER-low clinical alert and MDT review.",
            key_features: ["ER-Low 5%", "Heterogeneous Endocrine Biology", "MDT Review Req."],
          },
          {
            case_id: "scenario_e",
            filename: "scenario_e_temporal_segregation.json",
            title: "Scenario E: Pre-NAT Biopsy vs Post-Resection Pathology",
            description: "I-SPY-1 trial subject with longitudinal timeline tracking pre-treatment MRI and surgical resection cellularity.",
            key_features: ["Pre-treatment Biopsy", "Post-resection Bed", "Longitudinal Timeline"],
          },
        ]);
        setSampleCases(cases);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleLaunchCase = (caseId: string) => {
    router.push(`/workspace?case=${caseId}`);
  };

  const pipelineStages = [
    {
      num: 1,
      title: "Multi-Modal Clinical Ingestion",
      lead: "Ingests raw pathology texts, multi-sheet spreadsheets, and DICOM Structured Reports.",
      detail:
        "Extracts semi-structured clinical narratives from TCIA, I-SPY-1, BreastPathQ, and TCGA-BRCA cohorts with recursive ContentSequence tree traversal for DICOM SR (SOP Class 1.2.840.10008.5.1.4.1.1.88.33).",
      tag: "Ingestion Engine",
    },
    {
      num: 2,
      title: "Bio_ClinicalBERT NLP & Span Extraction",
      lead: "Supervised fine-tuned transformer with character-level evidence span offsets.",
      detail:
        "Trained on 3,492 clinical sentences with 99.75% accuracy and 0.9973 F1. Extracts ER/PR staining, HER2 scores, Nottingham grade, and tumor dimensions while detecting negations and clinical hedging.",
      tag: "Clinical NLP",
    },
    {
      num: 3,
      title: "Canonical Harmonization & Subtyping",
      lead: "Maps extracted observations to ASCO/CAP 2020 and St. Gallen 2013 standards.",
      detail:
        "Normalizes values into Draft 2020-12 canonical schemas, computes surrogate molecular subtypes (Luminal A, Luminal B, HER2-Enriched, TNBC), and flags ER-low (1–10%) notifications.",
      tag: "Biomarker Engine",
    },
    {
      num: 4,
      title: "Deterministic Guideline Engine",
      lead: "Codified ESMO 2024 & ASCO guideline rules with explicit review guardrails.",
      detail:
        "Evaluates 5 verified evidence-based rules with strict guardrails: automatically pauses anti-HER2 regimens when HER2 IHC is 2+ equivocal pending reflex ISH/FISH.",
      tag: "Guideline Rules",
    },
    {
      num: 5,
      title: "5-Domain Organ Safety & MDT Matrix",
      lead: "Dynamic contraindication firewall with landmark Phase III trial evidence.",
      detail:
        "Screens cardiac, renal, hepatic, hematologic, and reproductive safety. Applies dynamic safety overrides (e.g. LVEF ≤ 45% flags Trastuzumab/Anthracyclines) with FDA Boxed Warning citations.",
      tag: "Safety & Treatment",
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Topbar />

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-10 animate-fade-in">
        {/* 1. Cinematic Hero & Command Center */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#193B4A] via-[#102631] to-[#14323F] text-white p-8 sm:p-10 shadow-clinical-lg border border-[#244B5C]">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-[#4E8276]/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#4E8276]/20 text-emerald-300 border border-[#4E8276]/40 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Next-Gen Oncology Clinical Decision Support</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Explainable Rule-Based Clinical Decision Support for Breast Cancer
            </h1>

            <p className="text-xs sm:text-sm text-[#D3E0DC] leading-relaxed max-w-2xl">
              Engineered for oncology multidisciplinary tumor boards. Synthesizes pathology narratives, core biopsies, and DICOM Structured Reports into schema-validated canonical profiles, executing ESMO 2024 / ASCO clinical rules with a 5-domain organ safety firewall.
            </p>

            {/* Quick Action Ribbon */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <Link
                href="/workspace?case=scenario_a"
                className="px-5 py-2.5 rounded-lg bg-[#4E8276] hover:bg-[#376258] text-white text-xs font-bold transition-all shadow-clinical-sm hover:shadow-clinical-glow flex items-center space-x-2 active:scale-95"
              >
                <Activity className="w-4 h-4" />
                <span>Launch Clinical Workspace</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <Link
                href="/new-assessment"
                className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/20 backdrop-blur-sm flex items-center space-x-2"
              >
                <Microscope className="w-4 h-4 text-emerald-300" />
                <span>Intake Narrative / DICOM SR</span>
              </Link>

              <Link
                href="/evidence"
                className="px-4 py-2.5 rounded-lg bg-transparent hover:bg-white/5 text-[#A5C0BA] hover:text-white text-xs font-medium transition-colors flex items-center space-x-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>CAP Taxonomy Specs</span>
              </Link>
            </div>
          </div>

          {/* Telemetry Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-[#244B5C]/60 text-xs">
            <div>
              <div className="text-[11px] text-[#A5C0BA] uppercase font-semibold">Consensus Guidelines</div>
              <div className="text-lg font-bold text-white mt-0.5">ESMO 2024 / ASCO</div>
            </div>
            <div>
              <div className="text-[11px] text-[#A5C0BA] uppercase font-semibold">Organ Safety Rules</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">11 Standardized Rules</div>
            </div>
            <div>
              <div className="text-[11px] text-[#A5C0BA] uppercase font-semibold">NLP Test Accuracy</div>
              <div className="text-lg font-bold text-white mt-0.5">99.75% (F1: 0.9973)</div>
            </div>
            <div>
              <div className="text-[11px] text-[#A5C0BA] uppercase font-semibold">Clinical Posture</div>
              <div className="text-lg font-bold text-amber-300 mt-0.5">Clinician-in-the-Loop</div>
            </div>
          </div>
        </section>

        {/* 2. Interactive Clinical Scenario Studio */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#193B4A] uppercase tracking-wider flex items-center space-x-2">
                <Database className="w-4 h-4 text-[#4E8276]" />
                <span>Validated Clinical Benchmark Scenarios</span>
              </h2>
              <p className="text-xs text-[#68777C]">
                Select a verified patient scenario to inspect the multi-agent reasoning flow and safety safeguards.
              </p>
            </div>
            <span className="text-xs text-[#4E8276] font-semibold">
              5 Pre-computed Clinical Profiles Loaded
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sampleCases.map((c, idx) => {
              const isSelected = selectedScenarioIndex === idx;
              const isEquivocal = c.case_id === "scenario_b";
              const isMissing = c.case_id === "scenario_c";
              const isErLow = c.case_id === "scenario_d";

              return (
                <div
                  key={c.case_id}
                  onClick={() => setSelectedScenarioIndex(idx)}
                  className={`p-5 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-white border-[#4E8276] shadow-clinical-md ring-2 ring-[#4E8276]/20"
                      : "bg-white border-[#DEE5E1] hover:border-[#4E8276] shadow-clinical-xs"
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F5F6F3] border border-[#DEE5E1] text-[#68777C]">
                        {c.case_id.toUpperCase()}
                      </span>
                      {isEquivocal && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300">
                          Reflex Hold
                        </span>
                      )}
                      {isMissing && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-300">
                          Data Gap
                        </span>
                      )}
                      {isErLow && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300">
                          ER-Low (5%)
                        </span>
                      )}
                      {!isEquivocal && !isMissing && !isErLow && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">
                          Complete
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-[#193B4A] tracking-tight leading-snug mb-2">
                      {c.title}
                    </h3>

                    <p className="text-xs text-[#68777C] leading-relaxed mb-4 line-clamp-2">
                      {c.description}
                    </p>

                    {/* Key Feature Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {c.key_features.map((feat, fIdx) => (
                        <span
                          key={fIdx}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#F5F6F3] text-[#24343B] border border-[#DEE5E1]"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#DEE5E1] flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLaunchCase(c.case_id);
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-[#193B4A] hover:bg-[#234D5F] text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all shadow-xs"
                    >
                      <span>Open in Studio</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. Interactive 5-Stage Multi-Agent Architecture */}
        <section className="bg-white border border-[#DEE5E1] rounded-2xl p-6 sm:p-8 shadow-clinical-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#DEE5E1] gap-2">
            <div>
              <h2 className="text-base font-bold text-[#193B4A] uppercase tracking-wider flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#4E8276]" />
                <span>Multi-Agent Reasoning Architecture</span>
              </h2>
              <p className="text-xs text-[#68777C]">
                Click any pipeline stage below to inspect its clinical responsibilities and mathematical guarantees.
              </p>
            </div>
            <span className="text-xs font-mono text-[#68777C]">5-Stage Pipeline</span>
          </div>

          {/* Stepper Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {pipelineStages.map((stage) => {
              const isActive = activeStage === stage.num;
              return (
                <button
                  key={stage.num}
                  onClick={() => setActiveStage(stage.num)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isActive
                      ? "bg-[#193B4A] text-white border-[#193B4A] shadow-clinical-sm ring-2 ring-[#4E8276]/30"
                      : "bg-[#F5F6F3] text-[#24343B] border-[#DEE5E1] hover:bg-[#DEE5E1]/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isActive ? "bg-[#4E8276] text-white" : "bg-white text-[#193B4A] border border-[#DEE5E1]"
                      }`}
                    >
                      {stage.num}
                    </span>
                    <span
                      className={`text-[9px] uppercase tracking-wider font-semibold ${
                        isActive ? "text-[#A5C0BA]" : "text-[#68777C]"
                      }`}
                    >
                      {stage.tag}
                    </span>
                  </div>
                  <div className="text-xs font-bold truncate mt-1">{stage.title}</div>
                </button>
              );
            })}
          </div>

          {/* Stage Details Canvas */}
          {(() => {
            const current = pipelineStages.find((s) => s.num === activeStage) || pipelineStages[0];
            return (
              <div className="p-6 rounded-xl bg-[#F5F6F3] border border-[#DEE5E1] flex flex-col md:flex-row items-start justify-between gap-6 animate-fade-in">
                <div className="space-y-3 max-w-2xl">
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E7F0EA] text-[#4E8276] border border-[#DEE5E1]">
                    <span>Stage {current.num} Execution</span>
                    <span>•</span>
                    <span>{current.tag}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#193B4A]">{current.title}</h3>
                  <p className="text-xs font-semibold text-[#24343B] leading-relaxed">
                    {current.lead}
                  </p>
                  <p className="text-xs text-[#68777C] leading-relaxed">
                    {current.detail}
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-[#DEE5E1] shadow-xs text-xs space-y-2 shrink-0 w-full md:w-72">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#68777C] block mb-1">
                    Technical Specifications
                  </span>
                  <div className="flex items-center justify-between py-1 border-b border-[#DEE5E1]">
                    <span className="text-[#68777C]">Draft Version:</span>
                    <span className="font-mono font-bold text-[#193B4A]">Draft 2020-12</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#DEE5E1]">
                    <span className="text-[#68777C]">Model Backbone:</span>
                    <span className="font-mono font-bold text-[#193B4A]">Bio_ClinicalBERT</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#DEE5E1]">
                    <span className="text-[#68777C]">Execution Mode:</span>
                    <span className="font-bold text-emerald-700">Deterministic Rules</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#68777C]">Human In Loop:</span>
                    <span className="font-bold text-[#B54B4B]">Mandatory Gate</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </section>

        {/* 4. Clinical Evidence & Safety Guardrail Demonstration */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: HER2 IHC 2+ Reflex Guardrail */}
          <div className="p-6 rounded-2xl bg-white border border-[#DEE5E1] shadow-clinical-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#193B4A] uppercase tracking-wider">
              ASCO/CAP 2018 HER2 Reflex Guardrail
            </h3>
            <p className="text-xs text-[#68777C] leading-relaxed">
              When immunohistochemistry reports HER2 IHC 2+, the system automatically enforces a strict clinical pause. Anti-HER2 targeted therapies (Trastuzumab / Pertuzumab) are held in <code className="text-[#B78643] font-bold">requires_clinician_review</code> until confirmatory FISH/ISH in situ hybridization is documented.
            </p>
            <div className="pt-2 text-xs font-semibold text-[#4E8276] flex items-center space-x-1">
              <span>Verified in Test Suite: tests/guidelines/test_guidelines.py</span>
            </div>
          </div>

          {/* Card 2: LVEF Cardiotoxicity Override */}
          <div className="p-6 rounded-2xl bg-white border border-[#DEE5E1] shadow-clinical-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#193B4A] uppercase tracking-wider">
              Dynamic Safety Overrides (LVEF ≤ 45%)
            </h3>
            <p className="text-xs text-[#68777C] leading-relaxed">
              Even if a patient meets 100% of guideline biomarker eligibility criteria for anti-HER2 regimens, documented left ventricular ejection fraction (LVEF) &le; 45% automatically triggers an absolute safety override. Eligibility is converted to <code className="text-[#B54B4B] font-bold">contraindication_flagged</code> with FDA Boxed Warning citations.
            </p>
            <div className="pt-2 text-xs font-semibold text-[#4E8276] flex items-center space-x-1">
              <span>Verified in Test Suite: tests/safety/test_safety_engine.py</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
