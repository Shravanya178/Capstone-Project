"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PatientRecord,
  getPatients,
  getActivePatient,
  setActivePatientId,
} from "../../services/patientStore";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info,
  ChevronRight,
  ArrowRight,
  Heart,
  Pill,
  Activity,
  Layers,
  FileCheck,
  Stethoscope,
  Sparkles,
} from "lucide-react";

export default function DecisionSupportPage() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [activePatient, setActivePatientState] = useState<PatientRecord | null>(null);
  const [activeTab, setActiveTab] = useState<"pathways" | "guidelines" | "safety">("pathways");

  useEffect(() => {
    const list = getPatients();
    setPatients(list);
    const curr = getActivePatient();
    setActivePatientState(curr);

    const handlePatientChange = () => {
      setPatients(getPatients());
      setActivePatientState(getActivePatient());
    };
    window.addEventListener("cdss_active_patient_changed", handlePatientChange);
    return () => {
      window.removeEventListener("cdss_active_patient_changed", handlePatientChange);
    };
  }, []);

  const handleSelectPatient = (id: string) => {
    setActivePatientId(id);
    const updated = getPatients();
    setPatients(updated);
    setActivePatientState(getActivePatient());
  };

  if (!activePatient) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center space-y-3">
          <Activity className="w-10 h-10 text-[#68777C] mx-auto animate-pulse" />
          <p className="text-sm font-semibold text-[#193B4A]">Loading Decision Support Engine...</p>
        </div>
      </div>
    );
  }

  const { biomarkers, clinicalStaging, safetyStatus, guidelinesTriggered, treatmentOptions } = activePatient;

  // Organ safety checks
  const isLvefLow = safetyStatus.lvefPercent !== undefined && safetyStatus.lvefPercent < 50;
  const isLvefMissing = safetyStatus.lvefPercent === undefined;

  return (
    <div className="flex-1 w-full px-6 lg:px-10 py-6 space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#DEE5E1]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#68777C]">
            <Link href="/" className="hover:text-[#193B4A]">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#A2B0AB]" />
            <Link href="/clinical-assessment" className="hover:text-[#193B4A]">Clinical Assessment</Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#A2B0AB]" />
            <span className="font-semibold text-[#193B4A]">Decision Support & Safety Firewall</span>
          </div>
          <h1 className="text-xl font-bold text-[#193B4A] mt-1 flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#4E8276]" />
            Clinical Decision Support – For Oncologist Review
          </h1>
          <p className="text-xs text-[#68777C] mt-0.5">
            Guideline-concordant therapy matching (ESMO 2024 / ASCO) and multi-domain organ safety firewall.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Patient Switcher */}
          <div className="flex items-center gap-2 bg-white border border-[#DEE5E1] rounded-lg px-3 py-1.5 shadow-xs">
            <span className="text-[11px] font-medium text-[#68777C]">Cohort:</span>
            <select
              aria-label="Active Cohort Patient"
              value={activePatient.id}
              onChange={(e) => handleSelectPatient(e.target.value)}
              className="text-xs font-bold text-[#193B4A] bg-transparent focus:outline-none cursor-pointer"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id})
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/reports"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#193B4A] text-white text-xs font-semibold rounded-lg hover:bg-[#122B36] transition-colors shadow-xs"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>View Full Assessment Report</span>
          </Link>
        </div>
      </div>

      {/* Mandatory Non-Prescribing Governance Banner */}
      <div className="p-4 bg-[#F5F8F7] border border-[#BED7CF] rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-[#4E8276] shrink-0 mt-0.5" />
        <div className="text-xs text-[#24343B] space-y-1">
          <div className="font-bold text-[#193B4A]">Clinician-in-the-Loop Governance Notice</div>
          <p className="text-[#68777C] leading-relaxed">
            This platform is an explainable decision-support research system. It codifies published international guidelines and organ safety boundaries. It does not prescribe, execute orders, or replace multidisciplinary tumor board (MDT) consensus.
          </p>
        </div>
      </div>

      {/* Active Patient Clinical Summary Strip */}
      <div className="bg-white border border-[#DEE5E1] rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F0F5F3] border border-[#D5E3DF] flex items-center justify-center text-[#193B4A] font-bold text-base">
            {activePatient.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#193B4A]">{activePatient.name}</h2>
              <span className="font-mono text-xs px-2 py-0.5 bg-[#F5F6F3] text-[#24343B] rounded border border-[#DEE5E1]">
                {activePatient.id}
              </span>
              <span className="text-xs text-[#68777C]">
                {activePatient.age} yrs · {activePatient.sex} · {activePatient.menopausalStatus}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#68777C]">
              <span>Stage: <strong className="text-[#193B4A]">{clinicalStaging.stageGroup} ({clinicalStaging.tCategory} {clinicalStaging.nCategory} {clinicalStaging.mCategory})</strong></span>
              <span>•</span>
              <span>Subtype: <strong className="text-[#193B4A]">{biomarkers.surrogateSubtype}</strong></span>
              <span>•</span>
              <span>ER: <strong>{biomarkers.erPercent ?? 0}%</strong></span>
              <span>•</span>
              <span>PR: <strong>{biomarkers.prPercent ?? 0}%</strong></span>
              <span>•</span>
              <span>HER2: <strong>IHC {biomarkers.her2Ihc}</strong></span>
            </div>
          </div>
        </div>

        {/* Safety Overall Status Pill */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#68777C]">Organ Safety Status</div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md mt-0.5 border ${
              safetyStatus.overallStatus === "absolute_contraindication"
                ? "bg-[#FDF2F2] text-[#9E3636] border-[#F4C7C7]"
                : safetyStatus.overallStatus === "caution" || safetyStatus.overallStatus === "relative_contraindication"
                ? "bg-[#FFF6E5] text-[#9A6700] border-[#F2DEB0]"
                : "bg-[#E8F1EE] text-[#2C5E53] border-[#BED7CF]"
            }`}>
              {safetyStatus.overallStatus === "absolute_contraindication" && <XCircle className="w-3.5 h-3.5" />}
              {(safetyStatus.overallStatus === "caution" || safetyStatus.overallStatus === "relative_contraindication") && <AlertTriangle className="w-3.5 h-3.5" />}
              {safetyStatus.overallStatus === "safe" && <CheckCircle2 className="w-3.5 h-3.5" />}
              {safetyStatus.overallStatus.replace(/_/g, " ").toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#DEE5E1]">
        <button
          onClick={() => setActiveTab("pathways")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === "pathways"
              ? "border-[#193B4A] text-[#193B4A]"
              : "border-transparent text-[#68777C] hover:text-[#193B4A]"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Explainable Treatment Pathways ({treatmentOptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("safety")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === "safety"
              ? "border-[#193B4A] text-[#193B4A]"
              : "border-transparent text-[#68777C] hover:text-[#193B4A]"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Organ Safety Firewall ({safetyStatus.warnings.length} Warnings)</span>
        </button>

        <button
          onClick={() => setActiveTab("guidelines")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === "guidelines"
              ? "border-[#193B4A] text-[#193B4A]"
              : "border-transparent text-[#68777C] hover:text-[#193B4A]"
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Triggered Guidelines ({guidelinesTriggered.length})</span>
        </button>
      </div>

      {/* TAB 1: Explainable Treatment Pathways */}
      {activeTab === "pathways" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#193B4A]">
                Multidisciplinary Treatment Pathways (Concordant with ESMO 2024 / ASCO)
              </h3>
              <p className="text-xs text-[#68777C]">
                Treatment options are dynamically filtered against active organ contraindications.
              </p>
            </div>
            <span className="text-xs font-mono text-[#68777C]">
              {treatmentOptions.filter(t => t.status === "supported").length} Supported · {treatmentOptions.filter(t => t.status === "contraindicated").length} Contraindicated
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {treatmentOptions.map((opt) => (
              <div
                key={opt.id}
                className={`bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                  opt.status === "contraindicated"
                    ? "border-[#F4C7C7] bg-[#FFFBFB]"
                    : "border-[#DEE5E1] hover:border-[#BED7CF]"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#68777C] block">
                        {opt.modality} · {opt.intent}
                      </span>
                      <h4 className="text-sm font-bold text-[#193B4A] mt-0.5">
                        {opt.title}
                      </h4>
                    </div>

                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded border shrink-0 ${
                      opt.status === "supported"
                        ? "bg-[#E8F1EE] text-[#2C5E53] border-[#BED7CF]"
                        : opt.status === "contraindicated"
                        ? "bg-[#FDF2F2] text-[#9E3636] border-[#F4C7C7]"
                        : "bg-[#FFF6E5] text-[#9A6700] border-[#F2DEB0]"
                    }`}>
                      {opt.status === "supported" && "Supported"}
                      {opt.status === "contraindicated" && "CONTRAINDICATED"}
                      {opt.status === "review_required" && "MDT Review Req."}
                    </span>
                  </div>

                  <p className="text-xs text-[#24343B] leading-relaxed">
                    {opt.rationale}
                  </p>

                  {/* Contraindication Callout */}
                  {opt.status === "contraindicated" && opt.contraindicationNote && (
                    <div className="p-3 bg-[#FDF2F2] border border-[#F4C7C7] rounded-lg text-xs text-[#9E3636] flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <strong>Safety Firewall Override:</strong> {opt.contraindicationNote}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex items-center gap-1.5 text-[11px] text-[#4E8276] font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Basis: {opt.supportingGuideline}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#DEE5E1] flex items-center justify-between text-xs text-[#68777C]">
                  <span>Evidence: <strong>Level I, Grade A</strong></span>
                  <span className="font-medium text-[#193B4A]">Discuss at Breast Tumor Board</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Organ Safety Firewall */}
      {activeTab === "safety" && (
        <div className="space-y-6">
          <div className="bg-white border border-[#DEE5E1] rounded-xl p-5 shadow-xs space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#68777C]">
                Pharmacovigilance & Safety Architecture
              </span>
              <h3 className="text-base font-bold text-[#193B4A] mt-0.5">
                5-Domain Organ Safety Firewall
              </h3>
              <p className="text-xs text-[#68777C] mt-1 leading-relaxed">
                A non-negotiable rule of our clinical architecture is: <strong>Safety strictly overrides guideline recommendations</strong>. Unassessed clinical variables are <em>never assumed normal</em>.
              </p>
            </div>

            {/* Organ Function Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Cardiac Function */}
              <div className={`p-4 rounded-xl border space-y-2 ${
                isLvefLow
                  ? "bg-[#FFF8F8] border-[#F4C7C7]"
                  : isLvefMissing
                  ? "bg-[#FFFDF7] border-[#F2DEB0]"
                  : "bg-white border-[#DEE5E1]"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className={`w-4 h-4 ${isLvefLow ? "text-[#9E3636]" : "text-[#4E8276]"}`} />
                    <span className="text-xs font-bold text-[#193B4A]">Cardiac (LVEF)</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isLvefLow
                      ? "bg-[#FDF2F2] text-[#9E3636]"
                      : isLvefMissing
                      ? "bg-[#FFF6E5] text-[#9A6700]"
                      : "bg-[#E8F1EE] text-[#2C5E53]"
                  }`}>
                    {safetyStatus.lvefPercent !== undefined ? `${safetyStatus.lvefPercent}%` : "Not Recorded"}
                  </span>
                </div>
                <p className="text-[11px] text-[#68777C] leading-snug">
                  Threshold: ≥ 50% for Trastuzumab/Anthracyclines.
                  {isLvefLow && " Current LVEF < 50% triggers strict contraindication."}
                  {isLvefMissing && " Baseline echocardiogram mandatory prior to anti-HER2 therapy."}
                </p>
              </div>

              {/* Renal Function */}
              <div className="p-4 rounded-xl border border-[#DEE5E1] bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#4E8276]" />
                    <span className="text-xs font-bold text-[#193B4A]">Renal (CrCl)</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E8F1EE] text-[#2C5E53]">
                    {safetyStatus.crclMlMin ? `${safetyStatus.crclMlMin} mL/min` : "Preserved"}
                  </span>
                </div>
                <p className="text-[11px] text-[#68777C] leading-snug">
                  Threshold: CrCl ≥ 50 mL/min for full-dose platinum/bisphosphonates.
                </p>
              </div>

              {/* CYP2D6 Interactions */}
              <div className="p-4 rounded-xl border border-[#DEE5E1] bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-[#4E8276]" />
                    <span className="text-xs font-bold text-[#193B4A]">Drug Interactions (CYP2D6)</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E8F1EE] text-[#2C5E53]">
                    No Inhibitors
                  </span>
                </div>
                <p className="text-[11px] text-[#68777C] leading-snug">
                  Checks fluoxetine, paroxetine, bupropion co-administration with Tamoxifen.
                </p>
              </div>
            </div>
          </div>

          {/* Active Safety Warnings Register */}
          <div className="bg-white border border-[#DEE5E1] rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 bg-[#F5F6F3] border-b border-[#DEE5E1] flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#193B4A]">
                Evaluated Safety Warnings & Overrides ({safetyStatus.warnings.length})
              </h3>
              <span className="text-[11px] text-[#68777C]">Safety Firewall V2.4</span>
            </div>

            <div className="divide-y divide-[#DEE5E1]">
              {safetyStatus.warnings.map((w, idx) => (
                <div key={idx} className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#193B4A]">{w.ruleId}</span>
                      <h4 className="text-xs font-bold text-[#24343B]">{w.title}</h4>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                      w.severity === "critical"
                        ? "bg-[#FDF2F2] text-[#9E3636] border-[#F4C7C7]"
                        : "bg-[#FFF6E5] text-[#9A6700] border-[#F2DEB0]"
                    }`}>
                      {w.severity}
                    </span>
                  </div>
                  <p className="text-xs text-[#24343B] leading-relaxed">
                    {w.description}
                  </p>
                  <div className="p-3 bg-[#F5F8F7] border border-[#DEE5E1] rounded-lg text-xs font-medium text-[#193B4A]">
                    <strong className="text-[#4E8276]">Recommended Action:</strong> {w.clinicalAction}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Codified Guidelines */}
      {activeTab === "guidelines" && (
        <div className="space-y-6">
          <div className="bg-white border border-[#DEE5E1] rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 bg-[#F5F6F3] border-b border-[#DEE5E1] flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#193B4A]">
                Triggered Clinical Practice Guidelines ({guidelinesTriggered.length})
              </h3>
              <span className="badge-teal text-[10px]">Deterministic Matching</span>
            </div>

            <div className="divide-y divide-[#DEE5E1]">
              {guidelinesTriggered.map((g) => (
                <div key={g.ruleId} className="p-5 space-y-3 hover:bg-[#FAFCFB] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#193B4A]">{g.ruleId}</span>
                      <span className="badge-teal text-[10px]">{g.source}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                      g.status === "applicable"
                        ? "bg-[#E8F1EE] text-[#2C5E53] border-[#BED7CF]"
                        : "bg-[#FFF6E5] text-[#9A6700] border-[#F2DEB0]"
                    }`}>
                      {g.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-[#193B4A]">{g.ruleName}</h4>
                  <p className="text-xs text-[#24343B] leading-relaxed">{g.rationale}</p>

                  <div className="p-3 bg-[#F5F6F3] rounded-lg text-xs font-mono text-[#193B4A]">
                    <span className="text-[#68777C] font-sans text-[11px] font-bold block mb-1">
                      Concordant Clinical Pathway:
                    </span>
                    {g.suggestedPathway}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="bg-white border border-[#DEE5E1] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-[#193B4A]">Finalize Clinical Assessment Report</h4>
          <p className="text-xs text-[#68777C] mt-0.5">
            Compile verified findings, staging, safety evaluations, and recommended pathways for tumor board review.
          </p>
        </div>
        <Link
          href="/reports"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#193B4A] text-white text-xs font-semibold rounded-lg hover:bg-[#122B36] transition-colors shadow-xs"
        >
          <FileCheck className="w-4 h-4" />
          <span>Generate Assessment Report</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
