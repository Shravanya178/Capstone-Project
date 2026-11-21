"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  FileText,
  Calendar,
  Layers,
  Dna,
} from "lucide-react";
import { PatientStore, PatientRecord } from "../../services/patientStore";

export default function PatientsDirectoryPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setPatients(PatientStore.getPatients());
  }, []);

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.biomarkers.surrogateSubtype.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === "all") return true;
    if (statusFilter === "assessment_complete") return p.status === "assessment_complete";
    if (statusFilter === "awaiting_verification") return p.status === "awaiting_verification";
    if (statusFilter === "incomplete") return p.clinicalStaging.isIncomplete || p.status === "incomplete_info";
    return true;
  });

  const handleSelectPatient = (patientId: string) => {
    PatientStore.setActivePatientId(patientId);
    router.push("/clinical-records");
  };

  return (
    <main className="w-full px-6 lg:px-10 py-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#DEE5E1] gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-[#193B4A] tracking-tight">
              Oncology Patient Directory
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#E7F0EA] text-[#4E8276] border border-[#DEE5E1]">
              {patients.length} Registered
            </span>
          </div>
          <p className="text-xs text-[#68777C] mt-1">
            Browse active breast cancer patient records, upload new clinical reports, and review multi-agent staging assessments.
          </p>
        </div>

        <Link
          href="/patients/new"
          className="px-4 py-2 bg-[#193B4A] hover:bg-[#234D5F] text-white text-xs font-bold rounded-lg transition-all shadow-clinical-sm flex items-center space-x-2 shrink-0 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </Link>
      </div>

      {/* Filter and Search Ribbon */}
      <div className="p-4 rounded-xl bg-white border border-[#DEE5E1] shadow-clinical-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {["all", "assessment_complete", "awaiting_verification", "incomplete"].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === filter
                  ? "bg-[#193B4A] text-white shadow-xs"
                  : "bg-[#F5F6F3] text-[#24343B] hover:bg-[#DEE5E1]"
              }`}
            >
              {filter.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#68777C] absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search patient name, ID, or subtype..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs pl-8 pr-3 py-1.5 bg-[#F5F6F3] border border-[#DEE5E1] rounded-md text-[#24343B] focus:outline-none focus:ring-1 focus:ring-[#4E8276] focus:bg-white w-72 shadow-xs"
          />
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white border border-[#DEE5E1] rounded-xl shadow-clinical-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F6F3] text-[#68777C] uppercase text-[10px] font-bold border-b border-[#DEE5E1]">
              <tr>
                <th className="px-5 py-3">Patient ID</th>
                <th className="px-5 py-3">Patient Name & Demographics</th>
                <th className="px-5 py-3">Surrogate Subtype</th>
                <th className="px-5 py-3">AJCC 8th Ed. Stage</th>
                <th className="px-5 py-3">Uploaded Documents</th>
                <th className="px-5 py-3">Clinical Workflow Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEE5E1]">
              {filteredPatients.map((p) => {
                const isComplete = p.status === "assessment_complete";
                const isAwaiting = p.status === "awaiting_verification";

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-[#F5F6F3] transition-colors cursor-pointer"
                    onClick={() => handleSelectPatient(p.id)}
                  >
                    <td className="px-5 py-4 font-mono font-bold text-[#193B4A]">
                      {p.id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-[#193B4A] text-sm">{p.name}</div>
                      <div className="text-[11px] text-[#68777C] mt-0.5">
                        {p.age}yo {p.sex} • Menopause: {p.menopausalStatus}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-[#E7F0EA] text-[#4E8276] border border-[#DEE5E1] inline-block">
                        {p.biomarkers.surrogateSubtype}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-[#193B4A]">
                      {p.clinicalStaging.stageGroup}
                    </td>
                    <td className="px-5 py-4 text-[#68777C]">
                      <span className="font-semibold text-[#193B4A]">
                        {p.documents.length}
                      </span>{" "}
                      files on record
                    </td>
                    <td className="px-5 py-4">
                      {isComplete && (
                        <span className="inline-flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Assessment Complete</span>
                        </span>
                      )}
                      {isAwaiting && (
                        <span className="inline-flex items-center space-x-1.5 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-300">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Verify NLP Extraction</span>
                        </span>
                      )}
                      {p.status === "awaiting_documents" && (
                        <span className="inline-flex items-center space-x-1.5 text-[11px] font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                          <span>Upload Reports Needed</span>
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPatient(p.id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#193B4A] hover:bg-[#234D5F] text-white text-xs font-semibold transition-all inline-flex items-center space-x-1 shadow-xs"
                      >
                        <span>Workspace</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

