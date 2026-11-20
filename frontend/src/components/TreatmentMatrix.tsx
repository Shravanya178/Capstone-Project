"use client";

import React, { useState } from "react";
import { TreatmentOption } from "../types/cdss";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  BookOpen,
  Layers,
  ChevronRight,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
} from "lucide-react";

interface TreatmentMatrixProps {
  options: TreatmentOption[];
  onOpenDrawer: (option: TreatmentOption) => void;
}

export default function TreatmentMatrix({ options, onOpenDrawer }: TreatmentMatrixProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Modalities" },
    { id: "systemic_chemotherapy", label: "Systemic Chemotherapy" },
    { id: "targeted_biotherapy", label: "Targeted Biotherapy" },
    { id: "endocrine_therapy", label: "Endocrine Hormonal" },
    { id: "surgical_intervention", label: "Locoregional Surgery" },
    { id: "radiation_therapy", label: "Radiation Therapy" },
  ];

  const filteredOptions = options.filter((opt) => {
    if (activeCategory === "all") return true;
    const cat = (opt.treatment_category || (opt as any).modality || "").toLowerCase();
    if (activeCategory === "systemic_chemotherapy") {
      return cat.includes("systemic") || cat.includes("chemotherapy") || cat.includes("neoadjuvant");
    }
    if (activeCategory === "targeted_biotherapy") {
      return cat.includes("targeted") || cat.includes("biotherapy") || cat.includes("her2");
    }
    if (activeCategory === "endocrine_therapy") {
      return cat.includes("endocrine") || cat.includes("hormon");
    }
    if (activeCategory === "surgical_intervention") {
      return cat.includes("surg") || cat.includes("mastectomy") || cat.includes("bcs");
    }
    if (activeCategory === "radiation_therapy") {
      return cat.includes("radiat");
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "supported_for_consideration":
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E7F0EA] text-[#4E8276] border border-[#4E8276]/30 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4E8276]" />
            <span>Supported for Consideration</span>
          </span>
        );
      case "requires_clinician_review":
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F6EEDC] text-[#B78643] border border-[#DEE5E1] shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-[#B78643]" />
            <span>Tumor Board Review Required</span>
          </span>
        );
      case "contraindication_flagged":
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F8E9E7] text-[#B54B4B] border border-[#B54B4B]/40 shadow-xs animate-pulse-slow">
            <ShieldAlert className="w-3.5 h-3.5 text-[#B54B4B]" />
            <span>Contraindication Flagged</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            <span>○</span>
            <span>Not Indicated for Subtype</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Category Filter Ribbon */}
      <div className="bg-white border border-[#DEE5E1] rounded-xl p-5 shadow-clinical-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#DEE5E1] mb-4 gap-3">
          <div className="flex items-center space-x-2.5">
            <Layers className="w-5 h-5 text-[#4E8276]" />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#193B4A]">
                Candidate Oncology Modalities Landscape
              </h3>
              <p className="text-xs text-[#68777C]">
                Evidence-stratified treatment options aligned to ESMO 2024 & ASCO clinical guidelines.
              </p>
            </div>
          </div>

          <div className="text-xs text-[#68777C] font-mono">
            Showing <strong className="text-[#193B4A]">{filteredOptions.length}</strong> of {options.length} options
          </div>
        </div>

        {/* Modality Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center space-x-1.5 ${
                  isActive
                    ? "bg-[#193B4A] text-white shadow-clinical-sm ring-1 ring-[#193B4A]"
                    : "bg-[#F5F6F3] text-[#24343B] hover:bg-[#DEE5E1] border border-[#DEE5E1]"
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Multi-Option Comparative Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOptions.map((opt) => {
          const isContraindicated = opt.eligibility_status === "contraindication_flagged";
          const isSupported = opt.eligibility_status === "supported_for_consideration";

          return (
            <div
              key={opt.treatment_option_id}
              className={`rounded-xl border p-5 flex flex-col justify-between transition-all duration-300 shadow-clinical-xs hover:shadow-clinical-md ${
                isContraindicated
                  ? "bg-[#F8E9E7]/40 border-[#B54B4B]/60 ring-1 ring-[#B54B4B]/20"
                  : isSupported
                  ? "bg-white border-[#DEE5E1] hover:border-[#4E8276]"
                  : "bg-white border-[#DEE5E1]"
              }`}
            >
              <div>
                {/* Header: Title and Status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#68777C] block mb-1">
                      {opt.treatment_category ? opt.treatment_category.replace(/_/g, " ") : "Oncology Regimen"}
                    </span>
                    <h4 className="text-base font-bold text-[#193B4A] tracking-tight leading-snug">
                      {opt.regimen_or_modality || (opt as any).title || "Therapeutic Regimen"}
                    </h4>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-4">{getStatusBadge(opt.eligibility_status)}</div>

                {/* Contraindication Override Banner */}
                {isContraindicated && (
                  <div className="mb-4 p-3 rounded-lg bg-[#F8E9E7] border border-[#B54B4B] text-xs text-[#B54B4B] flex items-start space-x-2">
                    <ShieldAlert className="w-4 h-4 text-[#B54B4B] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Safety Override Active:</strong>
                      <span className="text-[#24343B] text-[11px] leading-snug">
                        {(opt as any).contraindication_details ||
                          opt.safety_findings?.join("; ") ||
                          "Regimen flagged due to baseline organ function contraindication or Black Box Warning."}
                      </span>
                    </div>
                  </div>
                )}

                {/* Clinical Intent Tag */}
                <div className="mb-3 flex items-center space-x-1.5 text-xs">
                  <span className="text-[#68777C]">Intent:</span>
                  <span className="font-semibold text-[#193B4A] bg-[#F5F6F3] px-2 py-0.5 rounded border border-[#DEE5E1]">
                    {opt.clinical_intent || "Curative Locoregional"}
                  </span>
                </div>

                {/* Clinical Rationale Snippet */}
                <div className="text-xs text-[#24343B] leading-relaxed mb-4 p-3 rounded-lg bg-[#F5F6F3] border border-[#DEE5E1]">
                  <p className="line-clamp-3">{opt.rationale || (opt as any).clinical_rationale}</p>
                </div>

                {/* Evidence & Phase III Trials */}
                {opt.evidence_source && (
                  <div className="mb-4 text-xs">
                    <div className="flex items-center space-x-1.5 text-[#68777C] mb-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#4E8276]" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Landmark Evidence & Reference
                      </span>
                    </div>
                    <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-medium flex items-center justify-between">
                      <span className="truncate max-w-[200px]">
                        {opt.evidence_source.guideline_body} • {opt.evidence_source.primary_reference}
                      </span>
                      <span className="font-bold text-[10px] bg-white px-1.5 py-0.2 rounded border border-emerald-300">
                        {opt.evidence_source.level_of_evidence || "Level I, A"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button: Opens Drawer */}
              <div className="pt-4 border-t border-[#DEE5E1] mt-2">
                <button
                  onClick={() => onOpenDrawer(opt)}
                  className="w-full py-2 px-3 rounded-lg bg-[#193B4A] hover:bg-[#234D5F] text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all shadow-xs hover:shadow-clinical-sm active:scale-98"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Inspect Full Trial Rationale & MDT Prompts</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
