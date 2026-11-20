"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Topbar from "../../components/Topbar";
import PatientHeader from "../../components/PatientHeader";
import EvidenceTraceViewer from "../../components/EvidenceTraceViewer";
import BiomarkerPanel from "../../components/BiomarkerPanel";
import StagingPanel from "../../components/StagingPanel";
import GuidelinesPanel from "../../components/GuidelinesPanel";
import SafetyOverview from "../../components/SafetyOverview";
import TreatmentMatrix from "../../components/TreatmentMatrix";
import TreatmentDrawer from "../../components/TreatmentDrawer";
import DecisionRecordView from "../../components/DecisionRecordView";
import { CdssApi } from "../../services/api";
import { AssessmentBundle, TreatmentOption } from "../../types/cdss";
import {
  LayoutDashboard,
  FileText,
  Dna,
  Layers,
  ShieldCheck,
  ShieldAlert,
  Scale,
  ClipboardCheck,
  ArrowRight,
  Activity,
  HeartPulse,
  Sparkles,
} from "lucide-react";

function WorkspaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const caseParam = searchParams.get("case") || "scenario_a";

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [bundle, setBundle] = useState<AssessmentBundle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOption, setDrawerOption] = useState<TreatmentOption | null>(null);

  useEffect(() => {
    async function fetchCase(cId: string) {
      setLoading(true);
      setError(null);
      try {
        const data = await CdssApi.getSampleAssessment(cId);
        setBundle(data);
      } catch (err: any) {
        setError(err.message || "Failed to load clinical case assessment.");
      } finally {
        setLoading(false);
      }
    }
    fetchCase(caseParam);
  }, [caseParam]);

  const handleCaseChange = (newCaseId: string) => {
    router.push(`/workspace?case=${newCaseId}`);
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "evidence", label: "Clinical Evidence", icon: FileText },
    { id: "biomarkers", label: "Biomarkers & Subtype", icon: Dna },
    { id: "staging", label: "Clinical Staging", icon: Layers },
    { id: "guidelines", label: "Guideline Checks", icon: ShieldCheck },
    { id: "safety", label: "Safety Assessment", icon: ShieldAlert },
    { id: "treatments", label: "Treatment Comparison", icon: Scale },
    { id: "decision_record", label: "Final Decision Record", icon: ClipboardCheck },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <Topbar currentCaseId={caseParam} onSelectCase={handleCaseChange} />
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-center space-y-4 max-w-md">
            <div className="relative w-12 h-12 mx-auto">
              <div className="w-12 h-12 border-3 border-[#DEE5E1] border-t-[#4E8276] rounded-full animate-spin" />
              <Activity className="w-5 h-5 text-[#4E8276] absolute inset-0 m-auto" />
            </div>
            <div className="text-sm font-bold text-[#193B4A] tracking-wider uppercase">
              Executing Clinical Decision Support Pipeline...
            </div>
            <p className="text-xs text-[#68777C] leading-relaxed">
              Synthesizing canonical profile • Evaluating ESMO 2024 / ASCO consensus rules • Running 5-domain organ safety checks • Formulating MDT treatment options
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <Topbar currentCaseId={caseParam} onSelectCase={handleCaseChange} />
        <div className="flex-1 p-8 max-w-4xl mx-auto space-y-4">
          <div className="p-5 bg-[#F8E9E7] border-2 border-[#B54B4B] rounded-xl text-xs text-[#B54B4B] shadow-clinical-alert">
            <h4 className="font-bold text-sm mb-1">Assessment Ingestion Error</h4>
            <p>{error || "Unable to retrieve assessment data."}</p>
          </div>
          <button
            onClick={() => handleCaseChange("scenario_a")}
            className="px-4 py-2 bg-[#193B4A] text-white text-xs font-semibold rounded-lg shadow-xs hover:bg-[#234D5F] transition-colors"
          >
            Load Default Scenario A (Luminal A)
          </button>
        </div>
      </div>
    );
  }

  const { patient_profile, guideline_check, safety_assessment, treatment_plan } = bundle;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Topbar with Quick Case Switcher */}
      <Topbar currentCaseId={caseParam} onSelectCase={handleCaseChange} />

      {/* Sticky Patient Demographic & Biomarker Header */}
      <PatientHeader
        profile={patient_profile}
        safety={safety_assessment}
        treatment={treatment_plan}
      />

      {/* Modern Contextual Navigation Tabs */}
      <div className="bg-white border-b border-[#DEE5E1] px-6 sticky top-28 z-10 shadow-clinical-xs">
        <div className="flex space-x-1 overflow-x-auto scrollbar-none py-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 px-3.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-2 shrink-0 ${
                  isActive
                    ? "bg-[#193B4A] text-white shadow-clinical-xs"
                    : "text-[#68777C] hover:text-[#193B4A] hover:bg-[#F5F6F3]"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? "text-[#4E8276]" : "text-[#8DA6A0]"
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Workspace Canvas */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto animate-fade-in">
        {/* 1. Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Clinical Telemetry Scorecard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div
                onClick={() => setActiveTab("biomarkers")}
                className="p-5 rounded-xl bg-white border border-[#DEE5E1] shadow-clinical-xs hover:shadow-clinical-sm transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-[#68777C] mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Molecular Subtype
                  </span>
                  <Dna className="w-4 h-4 text-[#4E8276] group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-base font-bold text-[#193B4A] capitalize">
                  {patient_profile.pathology_biomarkers?.molecular_subtype?.replace(/_/g, " ")}
                </div>
                <div className="text-xs text-[#68777C] mt-1.5 flex items-center space-x-1">
                  <span>ER: {patient_profile.pathology_biomarkers?.er_status}</span>
                  <span>•</span>
                  <span>HER2: {patient_profile.pathology_biomarkers?.her2_status}</span>
                </div>
              </div>

              <div
                onClick={() => setActiveTab("staging")}
                className="p-5 rounded-xl bg-white border border-[#DEE5E1] shadow-clinical-xs hover:shadow-clinical-sm transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-[#68777C] mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    AJCC Staging (cTNM)
                  </span>
                  <Layers className="w-4 h-4 text-[#4E8276] group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-base font-bold text-[#193B4A]">
                  {patient_profile.clinical_extent?.anatomic_stage ||
                    patient_profile.clinical_extent?.clinical_t_stage ||
                    "Stage IIA"}
                </div>
                <div className="text-xs text-[#68777C] mt-1.5">
                  Tumor:{" "}
                  {patient_profile.clinical_extent?.primary_tumor_size_mm
                    ? `${patient_profile.clinical_extent.primary_tumor_size_mm} mm`
                    : "Unrecorded"}
                </div>
              </div>

              <div
                onClick={() => setActiveTab("safety")}
                className="p-5 rounded-xl bg-white border border-[#DEE5E1] shadow-clinical-xs hover:shadow-clinical-sm transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-[#68777C] mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Safety Status
                  </span>
                  <ShieldAlert className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-base font-bold text-[#193B4A] capitalize truncate">
                  {safety_assessment.overall_safety_status.replace(/_/g, " ")}
                </div>
                <div className="text-xs text-[#B78643] mt-1.5">
                  {safety_assessment.safety_findings?.length || 0} Findings •{" "}
                  {safety_assessment.missing_safety_information?.length || 0} Missing Labs
                </div>
              </div>

              <div
                onClick={() => setActiveTab("treatments")}
                className="p-5 rounded-xl bg-white border border-[#DEE5E1] shadow-clinical-xs hover:shadow-clinical-sm transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-[#68777C] mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Candidate Modalities
                  </span>
                  <Scale className="w-4 h-4 text-[#4E8276] group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-base font-bold text-[#4E8276]">
                  {treatment_plan.treatment_options?.filter(
                    (o) => o.eligibility_status === "supported_for_consideration"
                  ).length || 0}{" "}
                  Supported
                </div>
                <div className="text-xs text-[#68777C] mt-1.5">
                  Total: {treatment_plan.treatment_options?.length || 8} modalities evaluated
                </div>
              </div>
            </div>

            {/* Quick Action Navigation Strip */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-white via-[#F5F6F3] to-white border border-[#DEE5E1] shadow-clinical-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-[#193B4A] uppercase tracking-wider flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#4E8276]" />
                  <span>Multidisciplinary Tumor Board (MDT) Decision Canvas</span>
                </h4>
                <p className="text-xs text-[#68777C] mt-1">
                  Compare surgical, systemic chemotherapy, and targeted biotherapy options horizontally across 12 dimensions without automated scoring.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("treatments")}
                className="px-5 py-2.5 bg-[#193B4A] hover:bg-[#234D5F] text-white text-xs font-bold rounded-lg transition-all shadow-clinical-xs hover:shadow-clinical-sm flex items-center space-x-2 active:scale-95 shrink-0"
              >
                <span>Launch Treatment Canvas</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Organ Function & Clinical Safety Section */}
            <SafetyOverview safety={safety_assessment} />
          </div>
        )}

        {/* 2. Clinical Evidence Tab */}
        {activeTab === "evidence" && (
          <EvidenceTraceViewer observations={patient_profile.observations || []} />
        )}

        {/* 3. Biomarkers & Subtype Tab */}
        {activeTab === "biomarkers" && (
          <BiomarkerPanel biomarkers={patient_profile.pathology_biomarkers} />
        )}

        {/* 4. Clinical Staging Tab */}
        {activeTab === "staging" && (
          <StagingPanel clinicalExtent={patient_profile.clinical_extent} />
        )}

        {/* 5. Guideline Checks Tab */}
        {activeTab === "guidelines" && (
          <GuidelinesPanel guidelines={guideline_check} />
        )}

        {/* 6. Safety Assessment Tab */}
        {activeTab === "safety" && (
          <SafetyOverview safety={safety_assessment} />
        )}

        {/* 7. Treatment Comparison Tab */}
        {activeTab === "treatments" && (
          <TreatmentMatrix
            options={treatment_plan.treatment_options || []}
            onOpenDrawer={(opt) => setDrawerOption(opt)}
          />
        )}

        {/* 8. Final Decision Record Tab */}
        {activeTab === "decision_record" && (
          <DecisionRecordView bundle={bundle} />
        )}
      </main>

      {/* Slide-Over Drawer for Selected Option */}
      <TreatmentDrawer
        option={drawerOption}
        onClose={() => setDrawerOption(null)}
      />
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-xs text-[#68777C]">Loading Clinical Workspace...</div>
        </div>
      }
    >
      <WorkspaceContent />
    </Suspense>
  );
}
