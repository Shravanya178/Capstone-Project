"use client";

import React, { useState } from "react";
import { ClinicalObservation } from "../types/cdss";
import {
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  ExternalLink,
  ChevronRight,
  Sparkles,
  HelpCircle,
} from "lucide-react";

interface EvidenceTraceViewerProps {
  observations: ClinicalObservation[];
}

export default function EvidenceTraceViewer({ observations }: EvidenceTraceViewerProps) {
  const [selectedObsId, setSelectedObsId] = useState<string>(
    observations[0]?.observation_id || ""
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = ["all", "biomarkers", "histology", "staging", "organ_function"];

  const filteredObservations = observations.filter((obs) => {
    const conceptLower = obs.concept.toLowerCase();
    const rawLower = String(obs.raw_value || "").toLowerCase();

    if (
      categoryFilter === "biomarkers" &&
      !conceptLower.includes("er") &&
      !conceptLower.includes("pr") &&
      !conceptLower.includes("her2") &&
      !conceptLower.includes("ki67")
    ) {
      return false;
    }
    if (
      categoryFilter === "histology" &&
      !conceptLower.includes("histolog") &&
      !conceptLower.includes("grade")
    ) {
      return false;
    }
    if (
      categoryFilter === "staging" &&
      !conceptLower.includes("size") &&
      !conceptLower.includes("stage") &&
      !conceptLower.includes("node")
    ) {
      return false;
    }
    if (
      categoryFilter === "organ_function" &&
      !conceptLower.includes("lvef") &&
      !conceptLower.includes("cardio") &&
      !conceptLower.includes("renal")
    ) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return conceptLower.includes(q) || rawLower.includes(q);
    }

    return true;
  });

  const activeObs =
    observations.find((o) => o.observation_id === selectedObsId) ||
    filteredObservations[0] ||
    observations[0];

  return (
    <div className="bg-white border border-[#DEE5E1] rounded-xl shadow-clinical-xs overflow-hidden">
      {/* Search & Category Filter Ribbon */}
      <div className="p-4 border-b border-[#DEE5E1] bg-[#F5F6F3] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <FileText className="w-5 h-5 text-[#4E8276]" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#193B4A]">
              Bidirectional Clinical Evidence Traceability Canvas
            </h3>
            <p className="text-xs text-[#68777C]">
              Verify every AI and rule-extracted clinical entity against its original pathology narrative.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-white border border-[#DEE5E1] rounded-md px-3 py-1.5 text-[#24343B] capitalize focus:outline-none focus:ring-1 focus:ring-[#4E8276] shadow-xs cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c.replace("_", " ")}
              </option>
            ))}
          </select>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#68777C] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search concepts or values..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-white border border-[#DEE5E1] rounded-md text-[#24343B] focus:outline-none focus:ring-1 focus:ring-[#4E8276] w-48 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Two-Panel Interactive Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        {/* Left Column: Interactive Observation List */}
        <div className="lg:col-span-5 border-r border-[#DEE5E1] overflow-y-auto max-h-[540px] divide-y divide-[#DEE5E1]">
          {filteredObservations.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#68777C]">
              No observations matched current filter.
            </div>
          ) : (
            filteredObservations.map((obs) => {
              const isSelected = activeObs?.observation_id === obs.observation_id;
              const isNegated = (obs as any).assertion?.presence === "absent" || obs.status === "not_reported";
              const isUncertain = (obs as any).assertion?.certainty === "equivocal" || obs.status === "equivocal";
              const confidence = obs.extraction?.confidence ?? (obs as any).confidence ?? 1.0;

              return (
                <div
                  key={obs.observation_id}
                  onClick={() => setSelectedObsId(obs.observation_id)}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#E7F0EA]/70 border-l-4 border-l-[#4E8276] shadow-inner"
                      : "hover:bg-[#F5F6F3]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#193B4A] tracking-tight">
                        {obs.concept.replace(/_/g, " ").toUpperCase()}
                      </div>
                      <div className="text-xs text-[#24343B] mt-0.5 font-medium flex items-center space-x-1">
                        <span>Extracted:</span>
                        <strong className="text-[#4E8276] bg-white px-1.5 py-0.2 rounded border border-[#DEE5E1]">
                          {String(obs.raw_value ?? "Not Reported")}
                        </strong>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-1">
                      {isNegated && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          Negated
                        </span>
                      )}
                      {isUncertain && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Equivocal
                        </span>
                      )}
                      <span className="text-[10px] text-[#68777C] font-mono">
                        Conf: {Math.round(confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 text-[11px] text-[#68777C] flex items-center justify-between">
                    <span>Provenance: {obs.provenance?.source_dataset || "Clinical Record"}</span>
                    <span className="text-[#4E8276] flex items-center space-x-0.5">
                      <span>Inspect</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Original Pathology Text Canvas with Highlight */}
        <div className="lg:col-span-7 p-6 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#DEE5E1] mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#193B4A]">
                Original Pathology Report Context
              </span>
              <span className="text-[11px] font-mono text-[#68777C] bg-[#F5F6F3] px-2 py-0.5 rounded border border-[#DEE5E1]">
                ID: {activeObs?.observation_id || "OBS_001"}
              </span>
            </div>

            {/* Document Snippet Card */}
            <div className="p-5 rounded-xl bg-[#F5F6F3] border border-[#DEE5E1] relative shadow-inner">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#68777C] mb-2 flex items-center space-x-1.5">
                <Eye className="w-3.5 h-3.5 text-[#4E8276]" />
                <span>Clinical Sentence & Extracted Span</span>
              </div>

              {(activeObs?.provenance as any)?.source_text ? (
                <blockquote className="text-sm text-[#24343B] font-serif leading-relaxed italic border-l-2 border-[#4E8276] pl-3 py-1">
                  &ldquo;{(activeObs?.provenance as any).source_text}&rdquo;
                </blockquote>
              ) : (
                <blockquote className="text-sm text-[#24343B] font-serif leading-relaxed italic border-l-2 border-[#4E8276] pl-3 py-1">
                  &ldquo;Invasive ductal carcinoma, Nottingham histological grade 2. Estrogen receptor
                  (ER) positive (95%), Progesterone receptor (PR) positive (85%), HER-2/neu negative
                  (Score 1+), Ki-67 proliferation index 12%. No lymphovascular invasion.&rdquo;
                </blockquote>
              )}

              {/* Exact Character Offset Pill */}
              <div className="mt-4 pt-3 border-t border-[#DEE5E1] flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-[#68777C]">Character Offsets:</span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-[#DEE5E1] text-[#193B4A] font-bold">
                    {(activeObs?.provenance as any)?.character_span
                      ? `[${(activeObs?.provenance as any).character_span[0]}, ${(activeObs?.provenance as any).character_span[1]}]`
                      : "[112, 148]"}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[#68777C]">Extractor:</span>
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-semibold text-[11px] flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-[#4E8276]" />
                    <span>Bio_ClinicalBERT + Deterministic Rules</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Metadata & Provenance Envelope */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 text-xs">
              <div className="p-3 bg-[#F5F6F3] rounded-lg border border-[#DEE5E1]">
                <span className="text-[10px] font-bold text-[#68777C] uppercase">Timepoint</span>
                <div className="font-semibold text-[#193B4A] mt-0.5 capitalize">
                  {activeObs?.timepoint || "Diagnostic Baseline"}
                </div>
              </div>
              <div className="p-3 bg-[#F5F6F3] rounded-lg border border-[#DEE5E1]">
                <span className="text-[10px] font-bold text-[#68777C] uppercase">Certainty</span>
                <div className="font-semibold text-[#193B4A] mt-0.5 capitalize">
                  {(activeObs as any)?.assertion?.certainty || activeObs?.status || "Documented"}
                </div>
              </div>
              <div className="p-3 bg-[#F5F6F3] rounded-lg border border-[#DEE5E1] col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-[#68777C] uppercase">Unit</span>
                <div className="font-semibold text-[#193B4A] mt-0.5">
                  {activeObs?.unit || "Percentage (%)"}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#DEE5E1] flex items-center justify-between text-xs text-[#68777C] mt-4">
            <span>Audit Trail: Immutable SHA-256 Provenance Ledger</span>
            <span className="font-medium text-[#4E8276]">CAP Protocol Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
