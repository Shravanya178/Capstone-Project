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
  Activity,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Dna,
  ShieldCheck,
  FileText,
  ChevronRight,
  Sliders,
  Sparkles,
  Info,
} from "lucide-react";

export default function ClinicalAssessmentPage() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [activePatient, setActivePatientState] = useState<PatientRecord | null>(null);

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
          <p className="text-sm font-semibold text-[#193B4A]">Loading Clinical Assessment Workspace...</p>
        </div>
      </div>
    );
  }

  const { biomarkers, clinicalStaging } = activePatient;

  // Staging rules table for AJCC 8th edition reference
  const ajccRules = [
    { t: "T1 (≤ 20 mm)", n: "N0", m: "M0", stage: "Stage IA", active: clinicalStaging.tCategory.startsWith("T1") && clinicalStaging.nCategory === "N0" },
    { t: "T0 / T1", n: "N1mi", m: "M0", stage: "Stage IB", active: false },
    { t: "T2 (21-50 mm)", n: "N0", m: "M0", stage: "Stage IIA", active: clinicalStaging.tCategory === "T2" && clinicalStaging.nCategory === "N0" },
    { t: "T1 (≤ 20 mm)", n: "N1 (1-3 nodes)", m: "M0", stage: "Stage IIA", active: clinicalStaging.tCategory.startsWith("T1") && clinicalStaging.nCategory === "N1" },
    { t: "T2 (21-50 mm)", n: "N1 (1-3 nodes)", m: "M0", stage: "Stage IIB", active: clinicalStaging.tCategory === "T2" && clinicalStaging.nCategory === "N1" },
    { t: "T3 (> 50 mm)", n: "N0", m: "M0", stage: "Stage IIB", active: clinicalStaging.tCategory === "T3" && clinicalStaging.nCategory === "N0" },
    { t: "T3 (> 50 mm)", n: "N1-N2", m: "M0", stage: "Stage IIIA", active: clinicalStaging.tCategory === "T3" && (clinicalStaging.nCategory === "N1" || clinicalStaging.nCategory === "N2") },
    { t: "T4 (chest wall/skin)", n: "Any N", m: "M0", stage: "Stage IIIB", active: clinicalStaging.tCategory.startsWith("T4") },
    { t: "Any T", n: "N3 (≥ 10 nodes / infraclavicular)", m: "M0", stage: "Stage IIIC", active: clinicalStaging.nCategory === "N3" },
    { t: "Any T", n: "Any N", m: "M1", stage: "Stage IV", active: clinicalStaging.mCategory === "M1" },
  ];

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
            <span className="font-semibold text-[#193B4A]">Clinical Assessment & Staging</span>
          </div>
          <h1 className="text-xl font-bold text-[#193B4A] mt-1 flex items-center gap-2.5">
            <Dna className="w-6 h-6 text-[#4E8276]" />
            Biomarker Profiling & AJCC 8th Staging
          </h1>
          <p className="text-xs text-[#68777C] mt-0.5">
            Deterministic biomarker interpretation (ASCO/CAP 2020) and anatomical stage grouping.
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
            href="/decision-support"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#193B4A] text-white text-xs font-semibold rounded-lg hover:bg-[#122B36] transition-colors shadow-xs"
          >
            <span>Proceed to Decision Support</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Active Patient Identity Banner */}
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
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[#68777C]">
              <span>Diagnosis: <strong className="text-[#193B4A]">{activePatient.diagnosisDate}</strong></span>
              <span>•</span>
              <span>Histology: <strong className="text-[#193B4A]">{biomarkers.histologicType} (Grade {biomarkers.histologicGrade})</strong></span>
              <span>•</span>
              <span>Tumour Size: <strong className="text-[#193B4A]">{clinicalStaging.tumorSizeMm ? `${clinicalStaging.tumorSizeMm} mm` : "Not Documented"}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#68777C]">St. Gallen Subtype</div>
            <span className="inline-block px-2.5 py-1 text-xs font-bold rounded-md bg-[#E8F1EE] text-[#2C5E53] border border-[#BED7CF] mt-0.5">
              {biomarkers.surrogateSubtype}
            </span>
          </div>
          <div className="h-8 w-px bg-[#DEE5E1]" />
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#68777C]">AJCC 8th Stage</div>
            <span className="inline-block px-2.5 py-1 text-xs font-bold rounded-md bg-[#193B4A] text-white mt-0.5">
              {clinicalStaging.stageGroup}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Left Biomarkers, Right AJCC Staging */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Biomarker Profiling Studio (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-[#DEE5E1] rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 bg-[#F5F6F3] border-b border-[#DEE5E1] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dna className="w-4 h-4 text-[#4E8276]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#193B4A]">
                  Immunohistochemistry & Biomarker Cascade
                </h3>
              </div>
              <span className="text-[11px] font-medium text-[#68777C]">
                ASCO/CAP 2020 Guidelines
              </span>
            </div>

            <div className="p-5 space-y-5">
              {/* ER (Estrogen Receptor) */}
              <div className="border border-[#DEE5E1] rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#193B4A]">Estrogen Receptor (ER)</div>
                    <div className="text-[11px] text-[#68777C]">Nuclear staining percentage in invasive carcinoma cells</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-[#193B4A]">
                      {biomarkers.erPercent !== undefined ? `${biomarkers.erPercent}%` : "Not Reported"}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                      biomarkers.erStatus === "positive"
                        ? "bg-[#E8F1EE] text-[#2C5E53] border-[#BED7CF]"
                        : biomarkers.erStatus === "er_low_positive"
                        ? "bg-[#FFF6E5] text-[#9A6700] border-[#F2DEB0]"
                        : "bg-[#FDF2F2] text-[#9E3636] border-[#F4C7C7]"
                    }`}>
                      {biomarkers.erStatus === "positive"
                        ? "Positive (≥ 1%)"
                        : biomarkers.erStatus === "er_low_positive"
                        ? "ER-Low Positive (1-10%)"
                        : "Negative (< 1%)"}
                    </span>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="space-y-1">
                  <div className="h-3 w-full bg-[#E5EAE7] rounded-full overflow-hidden relative">
                    {/* 1% threshold marker */}
                    <div className="absolute top-0 bottom-0 left-[1%] w-0.5 bg-[#B54B4B] z-10" title="1% Cutoff" />
                    {/* 10% threshold marker */}
                    <div className="absolute top-0 bottom-0 left-[10%] w-0.5 bg-[#D97706] z-10" title="10% ER-Low Cutoff" />
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        biomarkers.erStatus === "positive"
                          ? "bg-[#4E8276]"
                          : biomarkers.erStatus === "er_low_positive"
                          ? "bg-[#D97706]"
                          : "bg-[#B54B4B]"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, biomarkers.erPercent || 0))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#68777C] font-mono">
                    <span>0%</span>
                    <span className="text-[#B54B4B]">1% (Threshold)</span>
                    <span className="text-[#D97706]">10% (ER-Low)</span>
                    <span>100%</span>
                  </div>
                </div>

                {biomarkers.erStatus === "er_low_positive" && (
                  <div className="flex items-start gap-2 p-2.5 bg-[#FFF6E5] border border-[#F2DEB0] rounded-md text-[11px] text-[#9A6700]">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong>ASCO/CAP Clinical Alert:</strong> Tumors with 1-10% ER staining are classified as ER-Low. Biological behavior frequently resembles ER-negative breast cancer; chemotherapy responsiveness is similar to TNBC. Endocrine therapy may offer limited incremental benefit.
                    </div>
                  </div>
                )}
                {biomarkers.erStatus === "positive" && (
                  <p className="text-[11px] text-[#2C5E53] leading-relaxed">
                    Strong endocrine receptor expression. Predicts clinical benefit from adjuvant endocrine therapies (AIs/Tamoxifen).
                  </p>
                )}
                {biomarkers.erStatus === "negative" && (
                  <p className="text-[11px] text-[#9E3636] leading-relaxed">
                    Negative ER staining (&lt; 1%). Endocrine therapy is not indicated.
                  </p>
                )}
              </div>

              {/* PR (Progesterone Receptor) */}
              <div className="border border-[#DEE5E1] rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#193B4A]">Progesterone Receptor (PR)</div>
                    <div className="text-[11px] text-[#68777C]">Nuclear staining percentage in invasive carcinoma cells</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-[#193B4A]">
                      {biomarkers.prPercent !== undefined ? `${biomarkers.prPercent}%` : "Not Reported"}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                      biomarkers.prStatus === "positive"
                        ? "bg-[#E8F1EE] text-[#2C5E53] border-[#BED7CF]"
                        : "bg-[#FDF2F2] text-[#9E3636] border-[#F4C7C7]"
                    }`}>
                      {biomarkers.prStatus === "positive" ? "Positive (≥ 1%)" : "Negative (< 1%)"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="h-3 w-full bg-[#E5EAE7] rounded-full overflow-hidden relative">
                    <div className="absolute top-0 bottom-0 left-[20%] w-0.5 bg-[#4E8276] z-10" title="20% Cutoff" />
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        biomarkers.prStatus === "positive" ? "bg-[#4E8276]" : "bg-[#B54B4B]"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, biomarkers.prPercent || 0))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#68777C] font-mono">
                    <span>0%</span>
                    <span className="text-[#4E8276]">20% (St. Gallen Cutoff for Luminal A)</span>
                    <span>100%</span>
                  </div>
                </div>

                <p className="text-[11px] text-[#68777C]">
                  {biomarkers.prPercent && biomarkers.prPercent >= 20
                    ? "PR expression ≥ 20% confirms intact ER pathway signaling, supporting Luminal A classification."
                    : "Low/negative PR expression (&lt; 20%) in ER+ tumors indicates potentially higher aggressiveness (Luminal B-like phenotype)."}
                </p>
              </div>

              {/* HER2 / neu Status & IHC/ISH Reflex */}
              <div className="border border-[#DEE5E1] rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#193B4A]">HER2 / neu Status</div>
                    <div className="text-[11px] text-[#68777C]">ASCO/CAP HER2 Testing Algorithm</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#193B4A]">
                      IHC {biomarkers.her2Ihc}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                      biomarkers.her2Status === "positive"
                        ? "bg-[#E8F1EE] text-[#2C5E53] border-[#BED7CF]"
                        : biomarkers.her2Status === "equivocal"
                        ? "bg-[#FFF6E5] text-[#9A6700] border-[#F2DEB0]"
                        : "bg-[#F5F6F3] text-[#24343B] border-[#DEE5E1]"
                    }`}>
                      {biomarkers.her2Status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* IHC Spectrum Gauge */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className={`p-2.5 rounded-lg border transition-all ${
                    biomarkers.her2Ihc === "0"
                      ? "border-[#193B4A] bg-[#F0F5F3] font-bold shadow-xs"
                      : "border-[#DEE5E1] bg-[#FAFCFB] text-[#68777C]"
                  }`}>
                    <div className="font-bold text-[#193B4A]">Score 0</div>
                    <div className="text-[10px] mt-0.5">Negative</div>
                  </div>
                  <div className={`p-2.5 rounded-lg border transition-all ${
                    biomarkers.her2Ihc === "1+"
                      ? "border-[#193B4A] bg-[#F0F5F3] font-bold shadow-xs"
                      : "border-[#DEE5E1] bg-[#FAFCFB] text-[#68777C]"
                  }`}>
                    <div className="font-bold text-[#193B4A]">Score 1+</div>
                    <div className="text-[10px] mt-0.5">Negative (HER2-Low)</div>
                  </div>
                  <div className={`p-2.5 rounded-lg border transition-all ${
                    biomarkers.her2Ihc === "2+"
                      ? "border-[#D97706] bg-[#FFF6E5] font-bold shadow-xs text-[#9A6700]"
                      : "border-[#DEE5E1] bg-[#FAFCFB] text-[#68777C]"
                  }`}>
                    <div className="font-bold text-[#9A6700]">Score 2+</div>
                    <div className="text-[10px] mt-0.5">Equivocal (Reflex ISH)</div>
                  </div>
                  <div className={`p-2.5 rounded-lg border transition-all ${
                    biomarkers.her2Ihc === "3+"
                      ? "border-[#4E8276] bg-[#E8F1EE] font-bold shadow-xs text-[#2C5E53]"
                      : "border-[#DEE5E1] bg-[#FAFCFB] text-[#68777C]"
                  }`}>
                    <div className="font-bold text-[#2C5E53]">Score 3+</div>
                    <div className="text-[10px] mt-0.5">Positive</div>
                  </div>
                </div>

                {/* Equivocal 2+ ISH Alert Banner */}
                {biomarkers.her2Ihc === "2+" && (
                  <div className="p-3.5 bg-[#FFF6E5] border border-[#F2DEB0] rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#9A6700]">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>MANDATORY CLINICAL ACTION: Reflex ISH Testing Required</span>
                    </div>
                    <p className="text-[11px] text-[#785400] leading-relaxed">
                      Per ASCO/CAP 2018/2023 guidelines, IHC score 2+ is equivocal and must not be used to guide anti-HER2 targeted therapy without reflex in situ hybridization (FISH/CISH).
                    </p>
                    <div className="pt-1 flex items-center justify-between text-xs font-mono bg-white/70 p-2 rounded border border-[#F2DEB0]">
                      <span>Reflex ISH Ratio (HER2/CEP17):</span>
                      <strong className="text-[#193B4A]">
                        {biomarkers.her2FishRatio ? biomarkers.her2FishRatio.toFixed(1) : "Pending In Situ Hybridization"}
                      </strong>
                    </div>
                  </div>
                )}

                {biomarkers.her2Ihc === "3+" && (
                  <div className="p-3 bg-[#E8F1EE] border border-[#BED7CF] rounded-lg text-[11px] text-[#2C5E53] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>HER2 Overexpressed / Amplified: Level I, Grade A indication for anti-HER2 targeted therapy (Trastuzumab + Pertuzumab).</span>
                  </div>
                )}

                {(biomarkers.her2Ihc === "0" || biomarkers.her2Ihc === "1+") && (
                  <div className="p-3 bg-[#F5F6F3] border border-[#DEE5E1] rounded-lg text-[11px] text-[#24343B]">
                    HER2 Non-Amplified. Standard anti-HER2 adjuvant targeted therapies are not indicated. (IHC 1+ qualifies as HER2-Low under DESTINY-Breast04 criteria for metastatic salvage).
                  </div>
                )}
              </div>

              {/* Ki-67 Proliferation Index */}
              <div className="border border-[#DEE5E1] rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#193B4A]">Ki-67 Proliferation Index</div>
                    <div className="text-[11px] text-[#68777C]">Percentage of positively stained nuclear tumor cells</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-[#193B4A]">
                      {biomarkers.ki67Percent !== undefined ? `${biomarkers.ki67Percent}%` : "Not Reported"}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                      biomarkers.ki67Percent !== undefined && biomarkers.ki67Percent < 20
                        ? "bg-[#E8F1EE] text-[#2C5E53] border-[#BED7CF]"
                        : "bg-[#FFF6E5] text-[#9A6700] border-[#F2DEB0]"
                    }`}>
                      {biomarkers.ki67Percent !== undefined && biomarkers.ki67Percent < 20
                        ? "Low (< 20%)"
                        : "High (≥ 20%)"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="h-3 w-full bg-[#E5EAE7] rounded-full overflow-hidden relative">
                    <div className="absolute top-0 bottom-0 left-[20%] w-0.5 bg-[#193B4A] z-10" title="20% Cutoff" />
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        biomarkers.ki67Percent && biomarkers.ki67Percent >= 20 ? "bg-[#D97706]" : "bg-[#4E8276]"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, biomarkers.ki67Percent || 0))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#68777C] font-mono">
                    <span>0%</span>
                    <span className="text-[#193B4A]">20% (St. Gallen Consensus Cutoff)</span>
                    <span>100%</span>
                  </div>
                </div>

                <p className="text-[11px] text-[#68777C]">
                  {biomarkers.ki67Percent && biomarkers.ki67Percent >= 20
                    ? "Elevated proliferation index indicates higher recurrence risk and suggests potential benefit from adjuvant chemotherapy in HR+ disease."
                    : "Low proliferation indicates indolent disease biology; patients with Luminal A tumors and node-negative disease frequently avoid cytotoxic chemotherapy."}
                </p>
              </div>

              {/* St. Gallen Surrogate Subtype Synthesis Card */}
              <div className="bg-[#193B4A] text-white p-5 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#A2C2B8]" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#A2C2B8]">
                      Consensus Surrogate Molecular Subtype
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#D5E3DF]">St. Gallen 2023 / ESMO 2024</span>
                </div>
                <div className="text-xl font-bold tracking-tight">
                  {biomarkers.surrogateSubtype}
                </div>
                <p className="text-xs text-[#D5E3DF] leading-relaxed">
                  Deterministic classification based on IHC profile: ER ({biomarkers.erPercent || 0}%), PR ({biomarkers.prPercent || 0}%), HER2 ({biomarkers.her2Ihc}), Ki-67 ({biomarkers.ki67Percent || 0}%).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AJCC 8th Edition Staging Studio (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#DEE5E1] rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 bg-[#F5F6F3] border-b border-[#DEE5E1] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#4E8276]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#193B4A]">
                  AJCC 8th Edition Staging
                </h3>
              </div>
              <span className="badge-teal text-[10px]">Anatomical</span>
            </div>

            <div className="p-5 space-y-5">
              {/* Primary Stage Group Display */}
              <div className="p-4 bg-[#F0F5F3] border border-[#BED7CF] rounded-xl text-center space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#2C5E53]">
                  Calculated Anatomical Stage Group
                </span>
                <div className="text-3xl font-extrabold text-[#193B4A]">
                  {clinicalStaging.stageGroup}
                </div>
                <div className="text-xs font-mono text-[#4E8276] font-semibold">
                  {clinicalStaging.tCategory} {clinicalStaging.nCategory} {clinicalStaging.mCategory}
                </div>
              </div>

              {/* cTNM Parameters */}
              <div className="space-y-3">
                {/* Primary Tumour cT */}
                <div className="p-3.5 bg-white border border-[#DEE5E1] rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#193B4A]">Primary Tumour (cT)</span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#F5F6F3] rounded border border-[#DEE5E1] text-[#193B4A]">
                      {clinicalStaging.tCategory}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#68777C]">
                    Max tumor diameter: <strong>{clinicalStaging.tumorSizeMm ? `${clinicalStaging.tumorSizeMm} mm` : "Not measured"}</strong>.
                    {clinicalStaging.tCategory === "T2" && " (Tumor > 20 mm but ≤ 50 mm)"}
                    {clinicalStaging.tCategory.startsWith("T1") && " (Tumor ≤ 20 mm)"}
                    {clinicalStaging.tCategory === "T3" && " (Tumor > 50 mm)"}
                  </p>
                </div>

                {/* Regional Lymph Nodes cN */}
                <div className="p-3.5 bg-white border border-[#DEE5E1] rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#193B4A]">Regional Lymph Nodes (cN)</span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#F5F6F3] rounded border border-[#DEE5E1] text-[#193B4A]">
                      {clinicalStaging.nCategory}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#68777C]">
                    {clinicalStaging.nCategory === "N0" && "No regional lymph node metastasis clinically or by imaging."}
                    {clinicalStaging.nCategory === "N1" && "Metastases to movable ipsilateral level I/II axillary lymph node(s)."}
                    {clinicalStaging.nCategory === "N2" && "Metastases in ipsilateral level I/II nodes clinically fixed or matted."}
                    {clinicalStaging.nCategory === "N3" && "Metastases in ipsilateral infraclavicular, supraclavicular, or internal mammary nodes."}
                  </p>
                </div>

                {/* Distant Metastasis cM */}
                <div className="p-3.5 bg-white border border-[#DEE5E1] rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#193B4A]">Distant Metastasis (cM)</span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#F5F6F3] rounded border border-[#DEE5E1] text-[#193B4A]">
                      {clinicalStaging.mCategory}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#68777C]">
                    {clinicalStaging.mCategory === "M0"
                      ? "No clinical or radiographic evidence of distant metastases."
                      : "Evidence of distant metastatic disease (Stage IV)."}
                  </p>
                </div>
              </div>

              {/* Incomplete Staging Warning */}
              {clinicalStaging.isIncomplete && (
                <div className="p-3.5 bg-[#FFF6E5] border border-[#F2DEB0] rounded-lg flex items-start gap-2.5 text-[11px] text-[#9A6700]">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>Incomplete Staging Notice:</strong> Pathological axillary node status is awaiting surgical staging. Current stage represents clinical staging (cTNM) only.
                  </div>
                </div>
              )}

              {/* AJCC Rules Traceability Register */}
              <div className="border border-[#DEE5E1] rounded-lg overflow-hidden">
                <div className="p-3 bg-[#F5F6F3] border-b border-[#DEE5E1]">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#68777C]">
                    AJCC 8th Edition Grouping Matrix
                  </span>
                </div>
                <div className="divide-y divide-[#DEE5E1] max-h-56 overflow-y-auto text-xs">
                  {ajccRules.map((r, idx) => (
                    <div
                      key={idx}
                      className={`px-3 py-2 flex items-center justify-between ${
                        r.active ? "bg-[#E8F1EE] font-bold text-[#2C5E53]" : "text-[#68777C] hover:bg-[#FAFCFB]"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span>{r.t}</span>
                        <span>+</span>
                        <span>{r.n}</span>
                        <span>+</span>
                        <span>{r.m}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-bold">
                        <span>{r.stage}</span>
                        {r.active && <CheckCircle2 className="w-3.5 h-3.5 text-[#2C5E53]" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Navigation Card to Decision Support */}
          <div className="bg-white border border-[#DEE5E1] rounded-xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-[#193B4A] uppercase tracking-wider">
              Next Clinical Step
            </h4>
            <p className="text-xs text-[#68777C] leading-relaxed">
              Biomarkers and anatomical staging are verified. Proceed to evaluate ESMO 2024 / ASCO clinical guidelines and check organ safety contraindications.
            </p>
            <Link
              href="/decision-support"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#193B4A] text-white text-xs font-semibold rounded-lg hover:bg-[#122B36] transition-colors"
            >
              <span>Evaluate Decision Support Guidelines</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
