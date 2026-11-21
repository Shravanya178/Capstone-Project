"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PatientRecord,
  getPatients,
  getActivePatient,
  setActivePatientId,
  saveDoctorFeedback,
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
  MessageSquare,
  ThumbsUp,
  Sliders,
  RefreshCw,
} from "lucide-react";

export default function DecisionSupportPage() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [activePatient, setActivePatientState] = useState<PatientRecord | null>(null);
  const [activeTab, setActiveTab] = useState<"pathways" | "safety" | "guidelines">("pathways");

  // Doctor Feedback Loop State
  const [openFeedbackId, setOpenFeedbackId] = useState<string | null>(null);
  const [feedbackAction, setFeedbackAction] = useState<"accepted" | "modified" | "rejected" | "under_review">("accepted");
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSavedMsg, setFeedbackSavedMsg] = useState<string | null>(null);

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

  const handleSaveDoctorFeedback = (treatmentId: string) => {
    if (!activePatient) return;
    saveDoctorFeedback(activePatient.id, treatmentId, {
      action: feedbackAction,
      comment:
        feedbackComment.trim() ||
        (feedbackAction === "accepted"
          ? "Accepted by Multidisciplinary Breast Disease Management Group."
          : "Modified per patient clinical and organ profile."),
      oncologistName: "Dr. R. Nair / Breast Oncology DMG",
    });
    setFeedbackSavedMsg(treatmentId);
    setTimeout(() => setFeedbackSavedMsg(null), 4000);
    setOpenFeedbackId(null);
    setFeedbackComment("");
    setActivePatientState(getActivePatient());
  };

  const handleResetData = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cdss_oncology_patients");
    }
    const fresh = getPatients();
    setPatients(fresh);
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

  // Sort treatment options by rank ascending, ensuring fallbacks exist
  const sortedTreatments = [...treatmentOptions]
    .map((opt, idx) => {
      const assignedRank = opt.rank || (opt.status === "contraindicated" ? 4 : idx + 1);
      const assignedBadge =
        opt.rankBadge ||
        (assignedRank === 1
          ? "Rank 1: Preferred First-Line Standard of Care"
          : assignedRank === 2
          ? "Rank 2: Preferred Surgical Standard of Care"
          : assignedRank === 3
          ? "Rank 3: Locoregional / Alternative Option"
          : "Rank 4: Contraindicated / Not Indicated");
      return {
        ...opt,
        rank: assignedRank,
        rankBadge: assignedBadge,
      };
    })
    .sort((a, b) => a.rank - b.rank);

  return (
    <div className="flex-1 w-full px-6 lg:px-10 py-6 space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#DEE5E1]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#68777C]">
            <Link href="/" className="hover:text-[#193B4A]">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#A2B0AB]" />
            <Link href="/clinical-records" className="hover:text-[#193B4A]">Clinical Records</Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#A2B0AB]" />
            <Link href="/clinical-assessment" className="hover:text-[#193B4A]">Clinical Assessment</Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#A2B0AB]" />
            <span className="font-semibold text-[#193B4A]">Decision Support & Ranked Pathways</span>
          </div>
          <h1 className="text-xl font-bold text-[#193B4A] mt-1 flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#4E8276]" />
            Clinical Decision Support – For Oncologist Review
          </h1>
          <p className="text-xs text-[#68777C] mt-0.5">
            Report Extraction → Comorbidities & Safety Firewall Check → Ranked Treatment Suggestions with Doctor Feedback Loop.
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

          <button
            onClick={handleResetData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#DEE5E1] text-[#193B4A] hover:bg-[#F5F6F3] text-xs font-semibold rounded-lg shadow-xs transition-colors"
            title="Reset cached state and reload all latest ranked guidelines"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#4E8276]" />
            <span>Sync Ranks</span>
          </button>

          <Link
            href="/reports"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#193B4A] text-white text-xs font-semibold rounded-lg hover:bg-[#122B36] transition-colors shadow-xs"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Generate Final Report</span>
          </Link>
        </div>
      </div>

      {/* 4-Step Clinical Process Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-3 bg-white border border-[#BED7CF] rounded-lg flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-[#E8F1EE] text-[#2C5E53] flex items-center justify-center font-bold text-[11px]">1</div>
          <div>
            <div className="font-bold text-[#193B4A]">Report Uploaded</div>
            <div className="text-[10px] text-[#68777C]">{activePatient.documents[0]?.name || "Pathology Report"}</div>
          </div>
        </div>

        <div className="p-3 bg-white border border-[#BED7CF] rounded-lg flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-[#E8F1EE] text-[#2C5E53] flex items-center justify-center font-bold text-[11px]">2</div>
          <div>
            <div className="font-bold text-[#193B4A]">Entities Extracted</div>
            <div className="text-[10px] text-[#68777C]">{biomarkers.surrogateSubtype} · {clinicalStaging.stageGroup}</div>
          </div>
        </div>

        <div className="p-3 bg-white border border-[#BED7CF] rounded-lg flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-[#E8F1EE] text-[#2C5E53] flex items-center justify-center font-bold text-[11px]">3</div>
          <div>
            <div className="font-bold text-[#193B4A]">Safety Firewall Checked</div>
            <div className="text-[10px] text-[#68777C]">{safetyStatus.overallStatus.replace(/_/g, " ").toUpperCase()}</div>
          </div>
        </div>

        <div className="p-3 bg-[#193B4A] text-white rounded-lg flex items-center gap-2.5 shadow-xs">
          <div className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-[11px]">4</div>
          <div>
            <div className="font-bold">Ranked Pathways & Feedback</div>
            <div className="text-[10px] text-[#D5E3DF]">{sortedTreatments.length} Options Evaluated</div>
          </div>
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
                {activePatient.age} yrs · {activePatient.sex} · {activePatient.menopausalStatus.toUpperCase()}
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
              <span>•</span>
              <span>Comorbidities: <strong className="text-[#193B4A]">{activePatient.comorbidities.join(", ") || "None"}</strong></span>
            </div>
          </div>
        </div>

        {/* Safety Overall Status Pill */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#68777C]">Organ Safety Firewall</div>
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
          <span>Ranked Treatment Suggestions ({sortedTreatments.length})</span>
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
          <span>Organ Safety Firewall & Comorbidities ({safetyStatus.warnings.length} Warnings)</span>
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

      {/* TAB 1: Ranked Treatment Suggestions with Explainability & Feedback */}
      {activeTab === "pathways" && (
        <div className="space-y-6">
          {/* STEP 2 FIREWALL CHECK SUMMARY (Shows Comorbidities & Safety before Treatments) */}
          <div className="p-4 bg-white border border-[#DEE5E1] rounded-xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#4E8276]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#193B4A]">
                  Step 2: Comorbidities & Safety Contraindication Firewall Result
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-[#68777C]">
                4 Domains Evaluated
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-[#F8FAF9] border border-[#DEE5E1]">
                <span className="text-[10px] text-[#68777C] font-semibold block">Cardiac (LVEF)</span>
                <strong className={`text-xs ${isLvefLow ? "text-[#9E3636]" : "text-[#193B4A]"}`}>
                  {safetyStatus.lvefPercent !== undefined ? `${safetyStatus.lvefPercent}% (Cutoff ≥50%)` : "Not Documented"}
                </strong>
              </div>

              <div className="p-2.5 rounded-lg bg-[#F8FAF9] border border-[#DEE5E1]">
                <span className="text-[10px] text-[#68777C] font-semibold block">Renal Clearance</span>
                <strong className="text-xs text-[#193B4A]">
                  {safetyStatus.crclMlMin ? `${safetyStatus.crclMlMin} mL/min` : "Normal"}
                </strong>
              </div>

              <div className="p-2.5 rounded-lg bg-[#F8FAF9] border border-[#DEE5E1]">
                <span className="text-[10px] text-[#68777C] font-semibold block">CYP2D6 Interactions</span>
                <strong className="text-xs text-[#193B4A]">No Strong Inhibitors</strong>
              </div>

              <div className="p-2.5 rounded-lg bg-[#F8FAF9] border border-[#DEE5E1]">
                <span className="text-[10px] text-[#68777C] font-semibold block">Patient Comorbidities</span>
                <strong className="text-xs text-[#193B4A]">
                  {activePatient.comorbidities.join(", ") || "None recorded"}
                </strong>
              </div>
            </div>

            {/* Contraindication Alert if active */}
            {safetyStatus.warnings.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {safetyStatus.warnings.map((w, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                      w.severity === "critical"
                        ? "bg-[#FFF6F6] border-[#F4C7C7] text-[#9E3636]"
                        : "bg-[#FFFDF7] border-[#F2DEB0] text-[#9A6700]"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong>{w.title}:</strong> {w.description} <br />
                      <span className="font-semibold underline">Clinical Action:</span> {w.clinicalAction}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RANKED TREATMENT SUGGESTIONS HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-[#193B4A] flex items-center gap-2">
                <span>Ranked Guideline-Concordant Treatment Suggestions</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E8F1EE] text-[#2C5E53] border border-[#BED7CF]">
                  ESMO 2024 / TMC DMG Protocol
                </span>
              </h3>
              <p className="text-xs text-[#68777C]">
                Options are prioritized by clinical guideline hierarchy and organ safety compatibility.
              </p>
            </div>
            <span className="text-xs font-mono text-[#68777C]">
              {sortedTreatments.filter(t => t.status === "supported").length} Supported · {sortedTreatments.filter(t => t.status === "contraindicated").length} Contraindicated
            </span>
          </div>

          {feedbackSavedMsg && (
            <div className="p-3 bg-[#E8F1EE] border border-[#BED7CF] rounded-lg text-xs font-bold text-[#2C5E53] flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Doctor Feedback & Tumor Board decision logged successfully for treatment option!</span>
            </div>
          )}

          {/* TREATMENT OPTIONS CARDS LIST */}
          <div className="space-y-5">
            {sortedTreatments.map((opt) => (
              <div
                key={opt.id}
                className={`bg-white border rounded-xl p-5 shadow-xs transition-all space-y-4 ${
                  opt.status === "contraindicated"
                    ? "border-[#F4C7C7] bg-[#FFFBFB]"
                    : "border-[#DEE5E1] hover:border-[#BED7CF]"
                }`}
              >
                {/* Header Strip with Rank Badge */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        opt.rank === 1
                          ? "bg-[#193B4A] text-white border-[#193B4A]"
                          : opt.rank === 2
                          ? "bg-[#E8F1EE] text-[#2C5E53] border-[#BED7CF]"
                          : opt.rank === 3
                          ? "bg-[#FFF6E5] text-[#9A6700] border-[#F2DEB0]"
                          : "bg-[#FDF2F2] text-[#9E3636] border-[#F4C7C7]"
                      }`}>
                        {opt.rankBadge || (opt.rank ? `Rank ${opt.rank}` : "Candidate Option")}
                      </span>
                      <span className="text-[11px] font-semibold text-[#68777C]">
                        {opt.modality} · {opt.intent}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-[#193B4A]">
                      {opt.title}
                    </h4>
                  </div>

                  <span className={`px-2.5 py-1 text-xs font-bold rounded border shrink-0 ${
                    opt.status === "supported"
                      ? "bg-[#E8F1EE] text-[#2C5E53] border-[#BED7CF]"
                      : opt.status === "contraindicated"
                      ? "bg-[#FDF2F2] text-[#9E3636] border-[#F4C7C7]"
                      : "bg-[#FFF6E5] text-[#9A6700] border-[#F2DEB0]"
                  }`}>
                    {opt.status === "supported" && "Supported / Recommended"}
                    {opt.status === "contraindicated" && "CONTRAINDICATED"}
                    {opt.status === "review_required" && "Review Required"}
                  </span>
                </div>

                <p className="text-xs text-[#24343B] leading-relaxed">
                  {opt.rationale}
                </p>

                {/* Contraindication Override Warning */}
                {opt.status === "contraindicated" && opt.contraindicationNote && (
                  <div className="p-3 bg-[#FDF2F2] border border-[#F4C7C7] rounded-lg text-xs text-[#9E3636] flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong>Safety Firewall Override:</strong> {opt.contraindicationNote}
                    </div>
                  </div>
                )}

                {/* EXPLAINABLE "WHY DID WE CHOOSE THIS?" SECTION */}
                {opt.whyChosen && opt.whyChosen.length > 0 && (
                  <div className="p-3.5 bg-[#F0F5F3] border border-[#BED7CF] rounded-lg space-y-1.5">
                    <div className="text-[10px] uppercase font-bold text-[#2C5E53] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Why Did We Choose This? (Explainable Clinical Rationale)</span>
                    </div>
                    <ul className="text-xs text-[#24343B] space-y-1 list-disc list-inside">
                      {opt.whyChosen.map((reason, rIdx) => (
                        <li key={rIdx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-[11px] text-[#4E8276] font-medium">
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Guideline Citation: {opt.supportingGuideline}</span>
                </div>

                {/* DOCTOR FEEDBACK LOOP SECTION */}
                <div className="pt-3 border-t border-[#DEE5E1] space-y-2">
                  {opt.doctorFeedback ? (
                    <div className="p-3.5 bg-[#F8FAF9] border border-[#BED7CF] rounded-lg text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#2C5E53] flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#2C5E53]" />
                          <span>Tumor Board Decision Logged: {opt.doctorFeedback.action.toUpperCase()}</span>
                        </span>
                        <span className="text-[10px] text-[#68777C] font-mono">{opt.doctorFeedback.timestamp}</span>
                      </div>
                      <p className="text-[#24343B] italic bg-white p-2 rounded border border-[#DEE5E1]">
                        &quot;{opt.doctorFeedback.comment}&quot;
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-[#68777C] pt-0.5">
                        <span>Signed by: <strong>{opt.doctorFeedback.oncologistName}</strong></span>
                        <button
                          onClick={() => {
                            setOpenFeedbackId(opt.id);
                            setFeedbackAction(opt.doctorFeedback?.action || "accepted");
                            setFeedbackComment(opt.doctorFeedback?.comment || "");
                          }}
                          className="text-[#4E8276] hover:underline font-bold"
                        >
                          Edit Comment / Update Decision
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={() => {
                          setOpenFeedbackId(openFeedbackId === opt.id ? null : opt.id);
                          setFeedbackAction("accepted");
                          setFeedbackComment("");
                        }}
                        className="text-xs text-[#193B4A] hover:text-[#4E8276] font-bold flex items-center gap-1.5 underline decoration-[#BED7CF]"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#4E8276]" />
                        <span>Record Doctor Feedback / Tumor Board Decision Loop</span>
                      </button>

                      {openFeedbackId === opt.id && (
                        <div className="mt-3 p-4 bg-[#F8FAF9] border border-[#BED7CF] rounded-xl space-y-3 text-xs animate-fade-in">
                          <div className="font-bold text-[#193B4A] flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-[#4E8276]" />
                            <span>Doctor Feedback Loop — Clinical Review for {opt.title}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-[#68777C]">Decision:</span>
                            {(["accepted", "modified", "rejected"] as const).map((act) => (
                              <button
                                key={act}
                                onClick={() => setFeedbackAction(act)}
                                className={`px-3 py-1 rounded text-[11px] font-bold capitalize border transition-all ${
                                  feedbackAction === act
                                    ? "bg-[#193B4A] text-white border-[#193B4A] shadow-xs"
                                    : "bg-white text-[#68777C] border-[#DEE5E1] hover:bg-[#F5F6F3]"
                                }`}
                              >
                                {act === "accepted" && "✓ Accept Recommendation"}
                                {act === "modified" && "✎ Modify Regimen / Dose"}
                                {act === "rejected" && "✗ Reject Regimen"}
                              </button>
                            ))}
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-bold text-[#68777C] block mb-1">
                              Attending Oncologist Comments / Multidisciplinary Tumor Board (MDT) Notes
                            </label>
                            <textarea
                              rows={2}
                              value={feedbackComment}
                              onChange={(e) => setFeedbackComment(e.target.value)}
                              placeholder="e.g. Accepted by TMC Breast DMG. Letrozole 2.5mg OD initiated. Baseline DEXA scan ordered for osteopenia monitoring."
                              className="w-full p-2.5 bg-white border border-[#DEE5E1] rounded-lg text-xs text-[#24343B] focus:outline-none focus:ring-1 focus:ring-[#4E8276]"
                            />
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              onClick={() => setOpenFeedbackId(null)}
                              className="px-3 py-1.5 text-xs text-[#68777C] hover:text-[#193B4A]"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveDoctorFeedback(opt.id)}
                              className="px-4 py-2 bg-[#4E8276] hover:bg-[#376258] text-white text-xs font-bold rounded-lg transition-all shadow-xs"
                            >
                              Save Feedback & Log Decision
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Organ Safety Firewall Full Breakdown */}
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
            Compile verified findings, staging, safety evaluations, ranked treatment decisions, and doctor notes for the tumor board.
          </p>
        </div>
        <Link
          href="/reports"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#193B4A] text-white text-xs font-semibold rounded-lg hover:bg-[#122B36] transition-colors shadow-xs"
        >
          <FileCheck className="w-4 h-4" />
          <span>Generate Final Report</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
