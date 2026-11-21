"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Settings as SettingsIcon,
  Sliders,
  ShieldCheck,
  Building,
  CheckCircle2,
  Activity,
  Layers,
  Save,
  RefreshCw,
  ChevronRight,
  Info,
} from "lucide-react";

export default function SettingsPage() {
  const [lvefCutoff, setLvefCutoff] = useState(50);
  const [crclCutoff, setCrclCutoff] = useState(50);
  const [ki67Cutoff, setKi67Cutoff] = useState(20);
  const [institutionName, setInstitutionName] = useState("Metropolitan Comprehensive Breast Cancer Center");
  const [oncologistName, setOncologistName] = useState("Dr. Sarah Vance, MD, PhD");
  const [tumorBoardTime, setTumorBoardTime] = useState("Wednesdays at 07:30 AM");
  const [saved, setSaved] = useState(false);

  const [guidelines, setGuidelines] = useState([
    {
      id: "ESMO-2024",
      name: "ESMO Early Breast Cancer Clinical Practice Guidelines (2024)",
      description: "Primary recommendation engine for systemic therapy, endocrine therapy, and dual anti-HER2 blockade.",
      enabled: true,
      status: "Active · Version 2024.1",
    },
    {
      id: "ASCO-CAP-2020",
      name: "ASCO/CAP Biomarker Testing & Reporting Standards (2018/2020/2023)",
      description: "Deterministic cutoffs for ER/PR positivity (≥ 1%), ER-Low (1-10%), and HER2 2+ equivocal reflex ISH testing.",
      enabled: true,
      status: "Active · Standard",
    },
    {
      id: "ST-GALLEN-2023",
      name: "St. Gallen International Consensus on Early Breast Cancer (2023)",
      description: "Surrogate molecular subtyping (Luminal A, Luminal B HER2-, Luminal B HER2+, HER2-enriched, TNBC).",
      enabled: true,
      status: "Active · Standard",
    },
    {
      id: "NCCN-2024",
      name: "NCCN Clinical Practice Guidelines in Oncology: Breast Cancer (v2.2024)",
      description: "Secondary reference framework for staging, surgical margins, and radiation therapy fields.",
      enabled: false,
      status: "Available for Activation",
    },
  ]);

  const toggleGuideline = (id: string) => {
    setGuidelines(prev =>
      prev.map(g => (g.id === id ? { ...g, enabled: !g.enabled } : g))
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex-1 w-full px-6 lg:px-10 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#DEE5E1]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#68777C]">
            <Link href="/" className="hover:text-[#193B4A]">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#A2B0AB]" />
            <span className="font-semibold text-[#193B4A]">System Settings</span>
          </div>
          <h1 className="text-xl font-bold text-[#193B4A] mt-1 flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6 text-[#4E8276]" />
            System & Clinical Settings
          </h1>
          <p className="text-xs text-[#68777C] mt-0.5">
            Configure clinical practice guidelines, organ safety firewall thresholds, and institutional profile.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#193B4A] text-white text-xs font-semibold rounded-lg hover:bg-[#122B36] transition-colors shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saved ? "Settings Saved!" : "Save Changes"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Guidelines & Safety Thresholds (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Clinical Practice Guidelines */}
          <div className="bg-white border border-[#DEE5E1] rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 bg-[#F5F6F3] border-b border-[#DEE5E1] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#4E8276]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#193B4A]">
                  Codified Clinical Practice Guidelines
                </h3>
              </div>
              <span className="badge-teal text-[10px]">Deterministic Framework</span>
            </div>

            <div className="divide-y divide-[#DEE5E1]">
              {guidelines.map((g) => (
                <div key={g.id} className="p-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[#193B4A]">{g.name}</h4>
                      <span className="font-mono text-[10px] text-[#68777C] px-1.5 py-0.5 bg-[#F5F6F3] rounded border border-[#DEE5E1]">
                        {g.id}
                      </span>
                    </div>
                    <p className="text-xs text-[#68777C] leading-relaxed">{g.description}</p>
                    <span className={`text-[10px] font-bold ${g.enabled ? "text-[#2C5E53]" : "text-[#889792]"}`}>
                      {g.status}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleGuideline(g.id)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
                      g.enabled ? "bg-[#4E8276]" : "bg-[#DEE5E1]"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        g.enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Organ Safety Thresholds */}
          <div className="bg-white border border-[#DEE5E1] rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 bg-[#F5F6F3] border-b border-[#DEE5E1] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#4E8276]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#193B4A]">
                  Organ Safety Firewall Thresholds
                </h3>
              </div>
              <span className="text-[10px] font-bold text-[#B54B4B] bg-[#FDF2F2] px-2 py-0.5 rounded border border-[#F4C7C7]">
                Safety Overrides
              </span>
            </div>

            <div className="p-5 space-y-5">
              {/* LVEF Cutoff */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-[#193B4A]">Cardiac LVEF Contraindication Threshold</strong>
                    <p className="text-[11px] text-[#68777C]">
                      Values below this percentage strictly contraindicate Trastuzumab/Pertuzumab.
                    </p>
                  </div>
                  <span className="font-mono text-sm font-bold text-[#193B4A] bg-[#F5F6F3] px-2.5 py-1 rounded border border-[#DEE5E1]">
                    {lvefCutoff}%
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="60"
                  step="1"
                  value={lvefCutoff}
                  onChange={(e) => setLvefCutoff(Number(e.target.value))}
                  className="w-full accent-[#4E8276] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#68777C] font-mono">
                  <span>40%</span>
                  <span className="text-[#4E8276] font-bold">50% (Standard)</span>
                  <span>60%</span>
                </div>
              </div>

              {/* CrCl Cutoff */}
              <div className="space-y-2 pt-2 border-t border-[#DEE5E1]">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-[#193B4A]">Renal Creatinine Clearance (CrCl) Cutoff</strong>
                    <p className="text-[11px] text-[#68777C]">
                      Threshold for dose-modification of bisphosphonates and platinum agents.
                    </p>
                  </div>
                  <span className="font-mono text-sm font-bold text-[#193B4A] bg-[#F5F6F3] px-2.5 py-1 rounded border border-[#DEE5E1]">
                    {crclCutoff} mL/min
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="60"
                  step="5"
                  value={crclCutoff}
                  onChange={(e) => setCrclCutoff(Number(e.target.value))}
                  className="w-full accent-[#4E8276] cursor-pointer"
                />
              </div>

              {/* Ki-67 Cutoff */}
              <div className="space-y-2 pt-2 border-t border-[#DEE5E1]">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-[#193B4A]">Ki-67 High Proliferation Threshold</strong>
                    <p className="text-[11px] text-[#68777C]">
                      St. Gallen consensus threshold distinguishing Luminal A-like from Luminal B-like tumors.
                    </p>
                  </div>
                  <span className="font-mono text-sm font-bold text-[#193B4A] bg-[#F5F6F3] px-2.5 py-1 rounded border border-[#DEE5E1]">
                    {ki67Cutoff}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="30"
                  step="1"
                  value={ki67Cutoff}
                  onChange={(e) => setKi67Cutoff(Number(e.target.value))}
                  className="w-full accent-[#4E8276] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Institutional Profile & System Health (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Institutional Profile */}
          <div className="bg-white border border-[#DEE5E1] rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 bg-[#F5F6F3] border-b border-[#DEE5E1] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#4E8276]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#193B4A]">
                  Institutional Clinical Profile
                </h3>
              </div>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-[#68777C] block mb-1">
                  Cancer Center / Hospital Name
                </label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full text-xs font-bold text-[#193B4A] bg-white border border-[#DEE5E1] rounded-lg p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[#68777C] block mb-1">
                  Lead Attending Oncologist
                </label>
                <input
                  type="text"
                  value={oncologistName}
                  onChange={(e) => setOncologistName(e.target.value)}
                  className="w-full text-xs font-bold text-[#193B4A] bg-white border border-[#DEE5E1] rounded-lg p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[#68777C] block mb-1">
                  Tumor Board Conference Schedule
                </label>
                <input
                  type="text"
                  value={tumorBoardTime}
                  onChange={(e) => setTumorBoardTime(e.target.value)}
                  className="w-full text-xs font-bold text-[#193B4A] bg-white border border-[#DEE5E1] rounded-lg p-2.5 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Engine Status & Diagnostics */}
          <div className="bg-white border border-[#DEE5E1] rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 bg-[#F5F6F3] border-b border-[#DEE5E1] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#4E8276]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#193B4A]">
                  Engine Architecture & Diagnostics
                </h3>
              </div>
              <span className="badge-teal text-[10px]">Operational</span>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-[#F8FAF9] rounded-lg">
                <span className="text-[#68777C]">FastAPI Clinical Backend:</span>
                <span className="flex items-center gap-1.5 font-bold text-[#2C5E53]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Connected (:8000)
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#F8FAF9] rounded-lg">
                <span className="text-[#68777C]">NLP Extraction Engine:</span>
                <span className="font-bold text-[#193B4A]">
                  Local Regex & Medical Lexicon
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#F8FAF9] rounded-lg">
                <span className="text-[#68777C]">Guideline Reasoning:</span>
                <span className="font-bold text-[#193B4A]">
                  Deterministic Multi-Agent
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#F8FAF9] rounded-lg">
                <span className="text-[#68777C]">Safety Firewall Overrides:</span>
                <span className="font-bold text-[#2C5E53]">
                  Enabled (Strict Hierarchy)
                </span>
              </div>
            </div>
          </div>

          {/* Regulatory Posture Note */}
          <div className="p-4 bg-[#F5F8F7] border border-[#BED7CF] rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-[#4E8276] shrink-0 mt-0.5" />
            <div className="text-xs text-[#24343B] space-y-1">
              <div className="font-bold text-[#193B4A]">Research Prototype Posture</div>
              <p className="text-[#68777C] leading-relaxed">
                This system operates as clinical decision support under human-in-the-loop oversight. Configuration modifications should be verified by the institutional multidisciplinary tumor board.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
