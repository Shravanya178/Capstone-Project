"use client";

import React, { useState } from "react";
import { ClinicalObservation } from "../types/cdss";

interface EvidenceTraceViewerProps {
  observations: ClinicalObservation[];
}

export default function EvidenceTraceViewer({ observations }: EvidenceTraceViewerProps) {
  const [selectedObsId, setSelectedObsId] = useState<string>(
    observations[0]?.observation_id || ""
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Categories inferred from concepts
  const categories = ["all", "biomarkers", "histology", "staging", "receptor", "organ_function"];

  const filteredObservations = observations.filter((obs) => {
    const conceptLower = obs.concept.toLowerCase();
    const rawLower = String(obs.raw_value || "").toLowerCase();

    // Category filter
    if (categoryFilter === "biomarkers" && !conceptLower.includes("er") && !conceptLower.includes("pr") && !conceptLower.includes("her2") && !conceptLower.includes("ki67")) {
      return false;
    }
    if (categoryFilter === "histology" && !conceptLower.includes("histolog") && !conceptLower.includes("grade")) {
      return false;
    }
    if (categoryFilter === "staging" && !conceptLower.includes("size") && !conceptLower.includes("stage") && !conceptLower.includes("node")) {
      return false;
    }
    if (categoryFilter === "receptor" && !conceptLower.includes("er") && !conceptLower.includes("pr") && !conceptLower.includes("her2")) {
      return false;
    }
    if (categoryFilter === "organ_function" && !conceptLower.includes("lvef") && !conceptLower.includes("cardio") && !conceptLower.includes("renal")) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return conceptLower.includes(q) || rawLower.includes(q);
    }

    return true;
  });

  const activeObs = observations.find((o) => o.observation_id === selectedObsId) || filteredObservations[0] || observations[0];

  return (
    <div className="bg-white border border-[#DEE5E1] rounded-lg shadow-xs overflow-hidden">
      {/* Header with Search and Filter */}
      <div className="p-4 border-b border-[#DEE5E1] bg-[#F5F6F3] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#193B4A]">
            Evidence Trace Viewer
          </h3>
          <p className="text-xs text-[#68777C]">
            Directly audit every extracted clinical entity against its original narrative source text.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-white border border-[#DEE5E1] rounded px-2.5 py-1 text-[#24343B] capitalize focus:outline-none focus:ring-1 focus:ring-[#4E8276]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Filter: {c.replace("_", " ")}
              </option>
            ))}
          </select>

          {/* Search */}
          <input
            type="text"
            placeholder="Search findings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs bg-white border border-[#DEE5E1] rounded px-2.5 py-1 text-[#24343B] focus:outline-none focus:ring-1 focus:ring-[#4E8276] w-40"
          />
        </div>
      </div>

      {/* Two-Panel Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#DEE5E1] min-h-[420px]">
        {/* Left Panel: Observation List (5 cols) */}
        <div className="md:col-span-5 max-h-[500px] overflow-y-auto divide-y divide-[#DEE5E1]">
          {filteredObservations.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#68777C]">
              No extracted findings match the selected filter.
            </div>
          ) : (
            filteredObservations.map((obs) => {
              const isSelected = obs.observation_id === activeObs?.observation_id;
              return (
                <button
                  key={obs.observation_id}
                  onClick={() => setSelectedObsId(obs.observation_id)}
                  className={`w-full text-left p-3.5 transition-colors flex items-start justify-between ${
                    isSelected
                      ? "bg-[#E7F0EA]/70 border-l-3 border-[#4E8276]"
                      : "hover:bg-[#F5F6F3]"
                  }`}
                >
                  <div className="pr-2">
                    <div className="text-xs font-semibold text-[#193B4A] font-mono">
                      {obs.concept}
                    </div>
                    <div className="text-xs text-[#24343B] mt-0.5">
                      Normalized: <strong className="font-semibold">{String(obs.normalized_value)}</strong>
                      {obs.unit && <span className="text-[#68777C] ml-1">({obs.unit})</span>}
                    </div>
                    <div className="text-[11px] text-[#68777C] truncate mt-1">
                      Matched: &ldquo;{String(obs.raw_value)}&rdquo;
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end flex-shrink-0">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-[#DEE5E1] text-[#68777C] font-mono">
                      {obs.extraction?.method || "rule_regex"}
                    </span>
                    <span className="text-[10px] text-[#68777C] mt-1 tabular-nums">
                      Conf: {obs.extraction?.confidence !== null && obs.extraction?.confidence !== undefined ? `${Math.round(obs.extraction.confidence * 100)}%` : "N/A"}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Right Panel: Source Trace & Provenance (7 cols) */}
        <div className="md:col-span-7 p-6 bg-white flex flex-col justify-between">
          {activeObs ? (
            <div className="space-y-5">
              {/* Top Banner */}
              <div className="flex items-center justify-between pb-3 border-b border-[#DEE5E1]">
                <div>
                  <span className="text-[11px] font-semibold text-[#68777C] uppercase tracking-wider">
                    Trace Finding
                  </span>
                  <h4 className="text-sm font-bold text-[#193B4A] font-mono mt-0.5">
                    {activeObs.concept}
                  </h4>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="badge-teal font-mono text-[10px]">
                    Status: {activeObs.status}
                  </span>
                  <span className="text-[10px] text-[#68777C] bg-[#F5F6F3] border border-[#DEE5E1] px-2 py-0.5 rounded font-mono">
                    Timepoint: {activeObs.timepoint}
                  </span>
                </div>
              </div>

              {/* Source Sentence Box with Highlight */}
              <div>
                <label className="text-xs font-semibold text-[#68777C] uppercase tracking-wider block mb-1.5">
                  Original Source Narrative Text:
                </label>
                <div className="p-4 rounded border border-[#DEE5E1] bg-[#F5F6F3] text-xs text-[#24343B] leading-relaxed font-sans">
                  {/* Context Sentence or Snippet */}
                  {activeObs.extra_metadata?.sentence ? (
                    <span>
                      {renderHighlightedSentence(
                        activeObs.extra_metadata.sentence,
                        String(activeObs.raw_value)
                      )}
                    </span>
                  ) : (
                    <span>
                      Matched Phrase:{" "}
                      <mark className="bg-[#F6EEDC] text-[#B78643] px-1 py-0.5 rounded font-semibold border border-[#B78643]/30">
                        {String(activeObs.raw_value)}
                      </mark>
                    </span>
                  )}
                </div>
              </div>

              {/* Provenance and Extraction Mechanics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded border border-[#DEE5E1] bg-white">
                  <span className="text-[11px] font-semibold text-[#68777C] block mb-1">
                    Dataset & Provenance
                  </span>
                  <div className="space-y-1 text-[#24343B]">
                    <div>
                      Dataset: <strong>{activeObs.provenance?.source_dataset || "N/A"}</strong>
                    </div>
                    <div>
                      File:{" "}
                      <span className="font-mono text-[11px] text-[#68777C]">
                        {activeObs.provenance?.source_file || "N/A"}
                      </span>
                    </div>
                    <div>
                      Record:{" "}
                      <span className="font-mono text-[11px]">
                        {activeObs.provenance?.source_record_id || "N/A"}
                      </span>
                    </div>
                    {activeObs.provenance?.source_field_path && (
                      <div>
                        Span / Field:{" "}
                        <span className="font-mono text-[10px] text-[#4E8276]">
                          {activeObs.provenance.source_field_path}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded border border-[#DEE5E1] bg-white">
                  <span className="text-[11px] font-semibold text-[#68777C] block mb-1">
                    Extraction Attributes
                  </span>
                  <div className="space-y-1 text-[#24343B]">
                    <div>
                      Method: <strong>{activeObs.extraction?.method || "rule_regex"}</strong>
                    </div>
                    <div>
                      Confidence:{" "}
                      <strong className="text-[#4E8276]">
                        {activeObs.extraction?.confidence !== null && activeObs.extraction?.confidence !== undefined
                          ? `${Math.round(activeObs.extraction.confidence * 100)}% (rule-based estimate)`
                          : "Deterministic Rule"}
                      </strong>
                    </div>
                    <div>
                      Negation Cue:{" "}
                      <span className="text-[#68777C]">
                        {activeObs.extra_metadata?.is_negated ? "NEGATED (Affirmed Negative)" : "Affirmative"}
                      </span>
                    </div>
                    <div>
                      Uncertainty Flag:{" "}
                      <span className="text-[#68777C]">
                        {activeObs.extra_metadata?.is_uncertain ? "YES (Hedged / Borderline)" : "Definitive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Regulatory Notice */}
              <div className="text-[11px] text-[#68777C] bg-[#F5F6F3] p-2.5 rounded border border-[#DEE5E1]">
                ℹ️ Extraction confidence reflects heuristic rule match calibration and Bio_ClinicalBERT sequence salience. It does not represent an autonomous clinical certainty probability.
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#68777C]">
              Select an observation from the left panel to trace its source evidence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function renderHighlightedSentence(sentence: string, targetPhrase: string) {
  if (!targetPhrase || !sentence.toLowerCase().includes(targetPhrase.toLowerCase())) {
    return sentence;
  }
  const parts = sentence.split(new RegExp(`(${escapeRegExp(targetPhrase)})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === targetPhrase.toLowerCase() ? (
          <mark
            key={i}
            className="bg-[#F6EEDC] text-[#B78643] px-1 py-0.5 rounded font-semibold border border-[#B78643]/30"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

