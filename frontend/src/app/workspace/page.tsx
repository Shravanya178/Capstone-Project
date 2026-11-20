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
    { id: "overview", label: "Overview", icon: "⊞" },
    { id: "evidence", label: "Clinical Evidence", icon: "📄" },
    { id: "biomarkers", label: "Biomarkers & Subtype", icon: "🧬" },
    { id: "staging", label: "Clinical Staging", icon: "📏" },
    { id: "guidelines", label: "Guideline Checks", icon: "📜" },
    { id: "safety", label: "Safety Assessment", icon: "🛡" },
    { id: "treatments", label: "Treatment Comparison", icon: "⚖️" },
    { id: "decision_record", label: "Final Decision Record", icon: "📋" },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <Topbar currentCaseId={caseParam} onSelectCase={handleCaseChange} />
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#193B4A] border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-xs font-semibold text-[#193B4A] tracking-wider uppercase">
              Executing Clinical Decision Support Pipeline...
            </div>
            <p className="text-[11px] text-[#68777C]">
              Ingesting profile • Evaluating ESMO guidelines • Running safety contraindication rules • Synthesizing multimodal options
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="flex-1 flex flex-col">
        <Topbar currentCaseId={caseParam} onSelectCase={handleCaseChange} />
        <div className="flex-1 p-8 max-w-4xl mx-auto space-y-4">
          <div className="p-4 bg-[#F8E9E7] border border-[#B54B4B] rounded-lg text-xs text-[#B54B4B]">
            <h4 className="font-bold text-sm mb-1">Assessment Ingestion Error</h4>
            <p>{error || "Unable to retrieve assessment data."}</p>
          </div>
          <button
            onClick={() => handleCaseChange("scenario_a")}
            className="px-4 py-2 bg-[#193B4A] text-white text-xs font-medium rounded shadow-xs"
          >
            Load Default Scenario A (Luminal A)
          </button>
        </div>
      </div>
    );
  }

  const { patient_profile, guideline_check, safety_assessment, treatment_plan } = bundle;

  return (
    <div className="flex-1 flex flex-col">
      {/* Topbar with Quick Case Switcher */}
      <Topbar currentCaseId={caseParam} onSelectCase={handleCaseChange} />

      {/* Compact Patient Demographic & Biomarker Header */}
      <PatientHeader
        profile={patient_profile}
        safety={safety_assessment}
        treatment={treatment_plan}
      />

      {/* Contextual Navigation Tabs */}
      <div className="bg-white border-b border-[#DEE5E1] px-6">
        <div className="flex space-x-1 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
                  isActive
                    ? "border-[#193B4A] text-[#193B4A] font-semibold"
                    : "border-transparent text-[#68777C] hover:text-[#24343B] hover:border-[#DEE5E1]"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Workspace */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {/* 1. Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Clinical Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-white border border-[#DEE5E1] shadow-xs">
                <span className="text-[11px] font-semibold text-[#68777C] block mb-1">
                  Surrogate Subtype
                </span>
                <div className="text-sm font-bold text-[#193B4A] capitalize">
                  {patient_profile.pathology_biomarkers?.molecular_subtype?.replace(/_/g, " ")}
                </div>
                <div className="text-[11px] text-[#68777C] mt-1">
                  ER {patient_profile.pathology_biomarkers?.er_status} • HER2 {patient_profile.pathology_biomarkers?.her2_status}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white border border-[#DEE5E1] shadow-xs">
                <span className="text-[11px] font-semibold text-[#68777C] block mb-1">
                  Anatomical Stage (cTNM)
                </span>
                <div className="text-sm font-bold text-[#193B4A]">
                  {patient_profile.clinical_extent?.anatomic_stage || patient_profile.clinical_extent?.clinical_t_stage || "Stage IIA"}
                </div>
                <div className="text-[11px] text-[#68777C] mt-1">
                  Tumor: {patient_profile.clinical_extent?.primary_tumor_size_mm ? `${patient_profile.clinical_extent.primary_tumor_size_mm} mm` : "Unrecorded"}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white border border-[#DEE5E1] shadow-xs">
                <span className="text-[11px] font-semibold text-[#68777C] block mb-1">
                  Safety Firewall Status
                </span>
                <div className="text-sm font-bold text-[#193B4A] capitalize">
                  {safety_assessment.overall_safety_status.replace(/_/g, " ")}
                </div>
                <div className="text-[11px] text-[#B78643] mt-1">
                  {safety_assessment.safety_findings?.length || 0} Findings • {safety_assessment.missing_safety_information?.length || 0} Missing
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white border border-[#DEE5E1] shadow-xs">
                <span className="text-[11px] font-semibold text-[#68777C] block mb-1">
                  Treatment Options
                </span>
                <div className="text-sm font-bold text-[#4E8276]">
                  {treatment_plan.treatment_options?.filter((o) => o.eligibility_status === "supported_for_consideration").length || 0} Supported
                </div>
                <div className="text-[11px] text-[#68777C] mt-1">
                  Total Evaluated: {treatment_plan.treatment_options?.length || 8} modalities
                </div>
              </div>
            </div>

            {/* Quick Action Banner */}
            <div className="p-5 rounded-lg bg-white border border-[#DEE5E1] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-[#193B4A] uppercase tracking-wider">
                  Side-by-Side Treatment Comparison Available
                </h4>
                <p className="text-xs text-[#68777C] mt-0.5">
                  Compare surgical, systemic, and targeted options horizontally without automated scoring.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("treatments")}
                className="px-4 py-2 bg-[#193B4A] text-white text-xs font-semibold rounded hover:bg-[#244b5c] transition-colors shadow-xs"
              >
                Launch Treatment Canvas →
              </button>
            </div>

            {/* Safety Overview Panel Snippet */}
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

      {/* Detail Slide-Over Drawer for Selected Option */}
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

