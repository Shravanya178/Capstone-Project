"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  ArrowRight,
  Clock,
  FileText,
  ShieldAlert,
  ChevronRight,
  Search,
  Filter,
  Activity,
  HeartPulse,
  Sparkles,
} from "lucide-react";
import { PatientStore, PatientRecord } from "../services/patientStore";

export default function ClinicalDashboardPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setPatients(PatientStore.getPatients());
  }, []);

  const totalPatients = patients.length;
  const awaitingVerification = patients.filter((p) => p.status === "awaiting_verification").length;
  const incompleteInfo = patients.filter((p) => p.status === "incomplete_info" || p.clinicalStaging.isIncomplete).length;
  const completedAssessments = patients.filter((p) => p.status === "assessment_complete").length;

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.biomarkers.surrogateSubtype.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenPatientWorkspace = (patientId: string) => {
    PatientStore.setActivePatientId(patientId);
    router.push("/clinical-records");
  };

  return (
    <main className="w-full px-6 lg:px-10 py-6 space-y-6">
      {/* 1. Header Banner & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#DEE5E1]">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-[#193B4A] tracking-tight">
              Oncology Clinical Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E7F0EA] text-[#4E8276] border border-[#DEE5E1]">
              Live Service
            </span>
          </div>
          <p className="text-xs text-[#68777C] mt-1">
            Patient-centric clinical decision support for breast oncology multidisciplinary tumor boards.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/patients/new"
            className="px-4 py-2 bg-[#193B4A] hover:bg-[#234D5F] text-white text-xs font-bold rounded-lg transition-all shadow-clinical-sm flex items-center space-x-2 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Patient</span>
          </Link>
          <Link
            href="/clinical-records"
            className="px-4 py-2 bg-white border border-[#DEE5E1] hover:bg-[#F5F6F3] text-[#193B4A] text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 shadow-xs"
          >
            <FileText className="w-4 h-4 text-[#4E8276]" />
            <span>Upload Reports</span>
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-xl bg-white border border-[#DEE5E1] shadow-clinical-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#68777C] uppercase tracking-wider block mb-1">
              Registered Patients
            </span>
            <div className="text-3xl font-extrabold text-[#193B4A] tabular-nums">
              {totalPatients}
            </div>
            <div className="text-[11px] text-[#4E8276] font-medium mt-1">
              Active oncology registry
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#F5F6F3] border border-[#DEE5E1] flex items-center justify-center text-[#193B4A]">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#DEE5E1] shadow-clinical-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#68777C] uppercase tracking-wider block mb-1">
              Awaiting Verification
            </span>
            <div className="text-3xl font-extrabold text-[#B78643] tabular-nums">
              {awaitingVerification}
            </div>
            <div className="text-[11px] text-[#B78643] font-medium mt-1">
              NLP extraction ready for review
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#B78643]">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#DEE5E1] shadow-clinical-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#68777C] uppercase tracking-wider block mb-1">
              Incomplete Data / Gaps
            </span>
            <div className="text-3xl font-extrabold text-[#B54B4B] tabular-nums">
              {incompleteInfo}
            </div>
            <div className="text-[11px] text-[#B54B4B] font-medium mt-1">
              Missing baseline staging or labs
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#B54B4B]">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#DEE5E1] shadow-clinical-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#68777C] uppercase tracking-wider block mb-1">
              Assessments Completed
            </span>
            <div className="text-3xl font-extrabold text-[#4E8276] tabular-nums">
              {completedAssessments}
            </div>
            <div className="text-[11px] text-[#4E8276] font-medium mt-1">
              Guideline & safety evaluated
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#4E8276]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Main Workspace Grid: Patient Table + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Registered Patients Table */}
        <div className="lg:col-span-8 bg-white border border-[#DEE5E1] rounded-xl shadow-clinical-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-[#DEE5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F5F6F3]">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-[#4E8276]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#193B4A]">
                  Active Oncology Cohort
                </h2>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#68777C] absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search patient, ID, or subtype..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs pl-8 pr-3 py-1.5 bg-white border border-[#DEE5E1] rounded-md text-[#24343B] focus:outline-none focus:ring-1 focus:ring-[#4E8276] w-64 shadow-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F6F3]/50 text-[#68777C] uppercase text-[10px] font-bold border-b border-[#DEE5E1]">
                  <tr>
                    <th className="px-4 py-3">Patient ID & Name</th>
                    <th className="px-4 py-3">Age / Sex</th>
                    <th className="px-4 py-3">Surrogate Subtype</th>
                    <th className="px-4 py-3">cTNM Stage</th>
                    <th className="px-4 py-3">Workflow Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DEE5E1]">
                  {filteredPatients.map((p) => {
                    const isComplete = p.status === "assessment_complete";
                    const isAwaiting = p.status === "awaiting_verification";
                    const isIncomplete = p.clinicalStaging.isIncomplete;

                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-[#F5F6F3] transition-colors cursor-pointer"
                        onClick={() => handleOpenPatientWorkspace(p.id)}
                      >
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-[#193B4A]">{p.name}</div>
                          <div className="text-[11px] font-mono text-[#68777C]">{p.id}</div>
                        </td>
                        <td className="px-4 py-3.5 text-[#24343B]">
                          {p.age} yo / {p.sex}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                              p.biomarkers.surrogateSubtype.includes("Luminal A")
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : p.biomarkers.surrogateSubtype.includes("Equivocal")
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : p.biomarkers.surrogateSubtype.includes("Triple-Negative")
                                ? "bg-rose-50 text-rose-800 border-rose-200"
                                : "bg-teal-50 text-teal-800 border-teal-200"
                            }`}
                          >
                            {p.biomarkers.surrogateSubtype}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-[#193B4A]">
                          {p.clinicalStaging.stageGroup}
                        </td>
                        <td className="px-4 py-3.5">
                          {isComplete && (
                            <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Ready for Review</span>
                            </span>
                          )}
                          {isAwaiting && (
                            <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Verify NLP Data</span>
                            </span>
                          )}
                          {p.status === "awaiting_documents" && (
                            <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                              <span>Upload Needed</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPatientWorkspace(p.id);
                            }}
                            className="px-2.5 py-1 rounded bg-[#F5F6F3] hover:bg-[#193B4A] hover:text-white border border-[#DEE5E1] text-xs font-semibold text-[#193B4A] transition-all flex items-center space-x-1 ml-auto"
                          >
                            <span>Open</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 border-t border-[#DEE5E1] bg-[#F5F6F3] text-[11px] text-[#68777C] flex items-center justify-between">
            <span>Showing {filteredPatients.length} patients in clinic queue</span>
            <span className="font-medium text-[#4E8276]">Synthetic Clinical Demo Cohort</span>
          </div>
        </div>

        {/* Right: Feed of Recently Uploaded Reports & Critical Safety Alerts */}
        <div className="lg:col-span-4 space-y-6">
          {/* Recently Uploaded Reports */}
          <div className="bg-white border border-[#DEE5E1] rounded-xl p-5 shadow-clinical-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DEE5E1]">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#4E8276]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#193B4A]">
                  Recently Uploaded Reports
                </h3>
              </div>
              <span className="text-[10px] text-[#68777C] font-mono">Today</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[#F5F6F3] border border-[#DEE5E1] text-xs">
                <div className="flex items-center justify-between font-bold text-[#193B4A]">
                  <span>Left_Breast_Core_Biopsy_Pathology.pdf</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 rounded border border-emerald-200">
                    Extracted
                  </span>
                </div>
                <div className="text-[11px] text-[#68777C] mt-1">
                  Patient: Margaret Sullivan (BC-2026-0842)
                </div>
                <div className="text-[10px] text-[#4E8276] mt-1 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>8 entities mapped with 98% avg confidence</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#F5F6F3] border border-[#DEE5E1] text-xs">
                <div className="flex items-center justify-between font-bold text-[#193B4A]">
                  <span>Right_Breast_Core_Needle_Biopsy.pdf</span>
                  <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 rounded border border-amber-300">
                    Needs Verify
                  </span>
                </div>
                <div className="text-[11px] text-[#68777C] mt-1">
                  Patient: Elena Rostova (BC-2026-0914)
                </div>
                <div className="text-[10px] text-amber-700 mt-1 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>HER2 2+ Equivocal reflex testing identified</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#F5F6F3] border border-[#DEE5E1] text-xs">
                <div className="flex items-center justify-between font-bold text-[#193B4A]">
                  <span>Bilateral_Diagnostic_Mammogram_and_US.pdf</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 rounded border border-emerald-200">
                    Verified
                  </span>
                </div>
                <div className="text-[11px] text-[#68777C] mt-1">
                  Patient: Margaret Sullivan (BC-2026-0842)
                </div>
              </div>
            </div>
          </div>

          {/* Pending Clinical Reviews & Safety Overrides */}
          <div className="bg-white border border-[#DEE5E1] rounded-xl p-5 shadow-clinical-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DEE5E1]">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-[#B54B4B]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#193B4A]">
                  Active Safety Overrides
                </h3>
              </div>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Action Required
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#F8E9E7] border border-[#B54B4B] text-xs text-[#B54B4B] space-y-1">
              <div className="font-bold flex items-center justify-between">
                <span>Cardiotoxicity Override (LVEF 42%)</span>
                <span className="text-[10px] font-mono">BC-2026-1022</span>
              </div>
              <p className="text-[11px] text-[#24343B] leading-snug">
                Priya Sharma has documented LVEF 42% &le; 45%. Anthracyclines and Trastuzumab are flagged with absolute contraindications.
              </p>
              <Link
                href="/decision-support"
                className="text-[11px] font-bold text-[#B54B4B] hover:underline block pt-1"
              >
                Inspect Safety Firewall →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
