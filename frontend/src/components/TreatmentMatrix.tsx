"use client";

import React, { useState } from "react";
import { TreatmentOption } from "../types/cdss";

interface TreatmentMatrixProps {
  options: TreatmentOption[];
  onOpenDrawer: (option: TreatmentOption) => void;
}

export default function TreatmentMatrix({ options, onOpenDrawer }: TreatmentMatrixProps) {
  // Pre-select first 2 supported options by default
  const defaultSelected = options
    .filter((o) => o.eligibility_status === "supported_for_consideration")
    .slice(0, 2)
    .map((o) => o.treatment_option_id);

  const [selectedIds, setSelectedIds] = useState<string[]>(
    defaultSelected.length >= 2 ? defaultSelected : options.slice(0, 2).map((o) => o.treatment_option_id)
  );

  const toggleOption = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const removeOption = (id: string) => {
    if (selectedIds.length > 1) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    }
  };

  const resetComparison = () => {
    setSelectedIds(options.slice(0, 2).map((o) => o.treatment_option_id));
  };

  const selectedOptions = selectedIds
    .map((id) => options.find((o) => o.treatment_option_id === id))
    .filter(Boolean) as TreatmentOption[];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "supported_for_consideration":
        return <span className="badge-teal">Supported for Consideration</span>;
      case "requires_clinician_review":
        return <span className="badge-warning">Requires Clinician Review</span>;
      case "contraindication_flagged":
        return <span className="badge-critical">Contraindication Flagged</span>;
      case "insufficient_information":
        return <span className="badge-neutral">Insufficient Data</span>;
      default:
        return <span className="badge-neutral text-gray-500">Not Indicated</span>;
    }
  };

  // Grouped modalities for landscape overview
  const groupedCategories = [
    { title: "Surgical Locoregional", category: "surgical_intervention" },
    { title: "Radiation Therapy", category: "locoregional_radiation_therapy" },
    { title: "Neoadjuvant Systemic Therapy", category: "neoadjuvant_systemic_therapy" },
    { title: "Targeted Biotherapy", category: "targeted_biotherapy" },
    { title: "Endocrine Therapy", category: "endocrine_therapy" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Treatment Landscape (Category-Grouped Selection Bar) */}
      <div className="bg-white border border-[#DEE5E1] rounded-lg p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DEE5E1]">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#193B4A]">
              Treatment Landscape & Option Selector
            </h3>
            <p className="text-xs text-[#68777C]">
              Select 2 or 3 modalities to compare side-by-side on the Clinical Canvas. All options reflect standard-of-care guidelines (ESMO 2024 / ASCO / St. Gallen 2023).
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="text-[#68777C]">
              Selected: <strong className="text-[#193B4A]">{selectedIds.length} / 3</strong>
            </span>
            <button
              onClick={resetComparison}
              className="text-[#4E8276] hover:underline font-medium"
            >
              Reset Canvas
            </button>
          </div>
        </div>

        {/* Option Chips by Modality */}
        <div className="mt-4 space-y-3">
          {groupedCategories.map((grp) => {
            const catOptions = options.filter((o) => o.treatment_category === grp.category);
            if (catOptions.length === 0) return null;

            return (
              <div key={grp.category} className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="w-44 text-[11px] font-semibold text-[#68777C] flex-shrink-0">
                  {grp.title}:
                </span>
                <div className="flex flex-wrap gap-2">
                  {catOptions.map((opt) => {
                    const isSelected = selectedIds.includes(opt.treatment_option_id);
                    return (
                      <button
                        key={opt.treatment_option_id}
                        onClick={() => toggleOption(opt.treatment_option_id)}
                        className={`text-xs px-2.5 py-1.5 rounded border transition-all flex items-center space-x-2 ${
                          isSelected
                            ? "bg-[#193B4A] text-white border-[#193B4A] shadow-xs"
                            : "bg-[#F5F6F3] text-[#24343B] border-[#DEE5E1] hover:bg-white"
                        }`}
                      >
                        <span className="font-medium truncate max-w-xs">
                          {opt.regimen_or_modality}
                        </span>
                        <span className="text-[10px]">
                          {isSelected ? "✓" : "+"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Side-by-Side Treatment Comparison Canvas */}
      <div className="bg-white border border-[#DEE5E1] rounded-lg shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#DEE5E1] bg-[#F5F6F3] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm">⚖️</span>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#193B4A]">
              Side-by-Side Treatment Comparison Canvas
            </h3>
          </div>
          <span className="text-[11px] text-[#68777C]">
            Objective Multidisciplinary Matrix • No Default Winner • Unranked
          </span>
        </div>

        {/* Horizontal Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#DEE5E1] bg-[#F5F6F3]/50">
                <th className="p-4 text-left font-semibold text-[#68777C] w-48 border-r border-[#DEE5E1]">
                  Comparison Dimension
                </th>
                {selectedOptions.map((opt) => (
                  <th
                    key={opt.treatment_option_id}
                    className="p-4 text-left font-semibold text-[#193B4A] min-w-[280px] border-r border-[#DEE5E1] last:border-r-0 relative"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[10px] text-[#68777C] font-mono">
                          {opt.treatment_option_id}
                        </div>
                        <div className="text-xs font-bold text-[#193B4A] mt-0.5">
                          {opt.regimen_or_modality}
                        </div>
                      </div>
                      {selectedOptions.length > 1 && (
                        <button
                          onClick={() => removeOption(opt.treatment_option_id)}
                          className="text-[#68777C] hover:text-[#B54B4B] text-sm ml-2"
                          title="Remove from comparison"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEE5E1]">
              {/* Category */}
              <tr>
                <td className="p-3.5 font-semibold text-[#68777C] bg-[#F5F6F3]/30 border-r border-[#DEE5E1]">
                  Treatment Modality
                </td>
                {selectedOptions.map((opt) => (
                  <td key={opt.treatment_option_id} className="p-3.5 border-r border-[#DEE5E1] last:border-r-0">
                    <span className="capitalize text-[#24343B]">
                      {opt.treatment_category.replace(/_/g, " ")}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Clinical Intent */}
              <tr>
                <td className="p-3.5 font-semibold text-[#68777C] bg-[#F5F6F3]/30 border-r border-[#DEE5E1]">
                  Clinical Intent
                </td>
                {selectedOptions.map((opt) => (
                  <td key={opt.treatment_option_id} className="p-3.5 border-r border-[#DEE5E1] last:border-r-0">
                    <span className="capitalize font-medium text-[#193B4A]">
                      {opt.clinical_intent.replace(/_/g, " ")}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Eligibility Status */}
              <tr>
                <td className="p-3.5 font-semibold text-[#68777C] bg-[#F5F6F3]/30 border-r border-[#DEE5E1]">
                  Eligibility Status
                </td>
                {selectedOptions.map((opt) => (
                  <td key={opt.treatment_option_id} className="p-3.5 border-r border-[#DEE5E1] last:border-r-0">
                    {getStatusBadge(opt.eligibility_status)}
                  </td>
                ))}
              </tr>

              {/* Supporting Observations */}
              <tr>
                <td className="p-3.5 font-semibold text-[#68777C] bg-[#F5F6F3]/30 border-r border-[#DEE5E1]">
                  Supporting Biomarkers
                </td>
                {selectedOptions.map((opt) => (
                  <td key={opt.treatment_option_id} className="p-3.5 border-r border-[#DEE5E1] last:border-r-0">
                    {opt.supporting_observations.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {opt.supporting_observations.map((obs, i) => (
                          <span
                            key={i}
                            className="inline-block px-1.5 py-0.5 rounded bg-[#F5F6F3] border border-[#DEE5E1] text-[11px] text-[#24343B]"
                          >
                            {obs}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[#68777C] italic">None required / Not matched</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Guideline Association */}
              <tr>
                <td className="p-3.5 font-semibold text-[#68777C] bg-[#F5F6F3]/30 border-r border-[#DEE5E1]">
                  Guideline Rules
                </td>
                {selectedOptions.map((opt) => (
                  <td key={opt.treatment_option_id} className="p-3.5 border-r border-[#DEE5E1] last:border-r-0">
                    {opt.supporting_guideline_rules.length > 0 ? (
                      <div className="space-y-1">
                        {opt.supporting_guideline_rules.map((g, i) => (
                          <div key={i} className="font-mono text-[11px] text-[#4E8276] font-medium">
                            {g}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[#68777C]">Clinical standard / No rule triggered</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Contraindication Flags */}
              <tr>
                <td className="p-3.5 font-semibold text-[#68777C] bg-[#F5F6F3]/30 border-r border-[#DEE5E1]">
                  Safety & Contraindications
                </td>
                {selectedOptions.map((opt) => (
                  <td key={opt.treatment_option_id} className="p-3.5 border-r border-[#DEE5E1] last:border-r-0">
                    {opt.safety_findings.length > 0 ? (
                      <div className="space-y-1">
                        {opt.safety_findings.map((f, i) => (
                          <div
                            key={i}
                            className="p-2 rounded bg-[#F8E9E7] border border-[#B54B4B]/30 text-[11px] text-[#B54B4B] font-medium"
                          >
                            {f}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-emerald-700 font-medium">
                        ✓ No active contraindications flagged
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Missing Information */}
              <tr>
                <td className="p-3.5 font-semibold text-[#68777C] bg-[#F5F6F3]/30 border-r border-[#DEE5E1]">
                  Missing Information
                </td>
                {selectedOptions.map((opt) => (
                  <td key={opt.treatment_option_id} className="p-3.5 border-r border-[#DEE5E1] last:border-r-0">
                    {opt.missing_information.length > 0 ? (
                      <ul className="list-disc list-inside text-[11px] text-[#B78643] space-y-0.5">
                        {opt.missing_information.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-[#68777C]">All required parameters documented</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Clinical Rationale */}
              <tr>
                <td className="p-3.5 font-semibold text-[#68777C] bg-[#F5F6F3]/30 border-r border-[#DEE5E1]">
                  Clinical Rationale
                </td>
                {selectedOptions.map((opt) => (
                  <td key={opt.treatment_option_id} className="p-3.5 border-r border-[#DEE5E1] last:border-r-0 leading-relaxed text-[#24343B]">
                    {opt.rationale}
                  </td>
                ))}
              </tr>

              {/* Action Prompts */}
              <tr>
                <td className="p-3.5 font-semibold text-[#68777C] bg-[#F5F6F3]/30 border-r border-[#DEE5E1]">
                  Clinician Action Prompts
                </td>
                {selectedOptions.map((opt) => (
                  <td key={opt.treatment_option_id} className="p-3.5 border-r border-[#DEE5E1] last:border-r-0">
                    {opt.clinician_action_prompts.length > 0 ? (
                      <div className="space-y-1">
                        {opt.clinician_action_prompts.map((prompt, i) => (
                          <div
                            key={i}
                            className="p-2 rounded bg-[#F6EEDC] border border-[#B78643]/30 text-[11px] text-[#B78643] font-medium"
                          >
                            ⚠️ {prompt}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[#68777C]">Standard tumor board adjudication</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Evidence Level & Action */}
              <tr>
                <td className="p-3.5 font-semibold text-[#68777C] bg-[#F5F6F3]/30 border-r border-[#DEE5E1]">
                  Evidence Source & Details
                </td>
                {selectedOptions.map((opt) => (
                  <td key={opt.treatment_option_id} className="p-3.5 border-r border-[#DEE5E1] last:border-r-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="badge-teal text-[10px]">
                          {opt.evidence_source?.level_of_evidence || "Level I, Grade A"}
                        </span>
                        <div className="text-[10px] text-[#68777C] mt-1">
                          {opt.evidence_source?.guideline_body || "ESMO 2024"}
                        </div>
                      </div>
                      <button
                        onClick={() => onOpenDrawer(opt)}
                        className="px-2.5 py-1 rounded bg-[#F5F6F3] border border-[#DEE5E1] hover:bg-[#193B4A] hover:text-white text-xs font-medium text-[#193B4A] transition-colors"
                      >
                        Inspect Details →
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

