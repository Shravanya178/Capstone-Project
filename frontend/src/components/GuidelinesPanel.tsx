"use client";

import React, { useState } from "react";
import { GuidelineCheckOutput } from "../types/cdss";

interface GuidelinesPanelProps {
  guidelines: GuidelineCheckOutput;
}

export default function GuidelinesPanel({ guidelines }: GuidelinesPanelProps) {
  const [expandedRule, setExpandedRule] = useState<string | null>(
    guidelines.checks[0]?.rule_id || null
  );

  const getResultBadge = (result: string) => {
    switch (result) {
      case "applicable":
        return <span className="badge-teal">Applicable / Recommended</span>;
      case "requires_review":
        return <span className="badge-critical animate-pulse">Clinician Review Required</span>;
      case "insufficient_information":
        return <span className="badge-warning">Missing Information</span>;
      default:
        return <span className="badge-neutral text-gray-500">Not Applicable</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#DEE5E1] rounded-lg shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#DEE5E1] bg-[#F5F6F3] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#193B4A]">
              Clinical Practice Guideline Evaluation (ESMO 2024 / ASCO 2018)
            </h3>
            <p className="text-xs text-[#68777C]">
              Deterministic rule evaluation against codified international consensus standards.
            </p>
          </div>
          <span className="text-[11px] text-[#68777C]">
            Evaluated Rules: {guidelines.checks?.length || 5}
          </span>
        </div>

        {/* Accordion / Table of Rules */}
        <div className="divide-y divide-[#DEE5E1]">
          {guidelines.checks.map((rule) => {
            const isExpanded = expandedRule === rule.rule_id;
            return (
              <div key={rule.rule_id} className="p-4 transition-colors hover:bg-[#F5F6F3]/40">
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer"
                  onClick={() => setExpandedRule(isExpanded ? null : rule.rule_id)}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-[#193B4A]">
                        {rule.rule_id}
                      </span>
                      <span className="text-[11px] text-[#68777C]">
                        • {rule.guideline_source || rule.source?.guideline}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-[#24343B] mt-0.5">
                      {rule.rule_name}
                    </h4>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getResultBadge(rule.result)}
                    <span className="text-xs text-[#68777C]">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[#DEE5E1] space-y-3 text-xs leading-relaxed animate-in fade-in duration-150">
                    <div>
                      <strong className="text-[#193B4A] block mb-1">Clinical Explanation:</strong>
                      <div className="p-3 bg-[#F5F6F3] rounded border border-[#DEE5E1] text-[#24343B]">
                        {rule.explanation}
                      </div>
                    </div>

                    {/* Matched vs Missing Criteria */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 rounded border border-[#DEE5E1] bg-white">
                        <strong className="text-[#4E8276] text-[11px] uppercase tracking-wider block mb-1.5">
                          ✓ Matched Patient Criteria:
                        </strong>
                        {rule.matched_criteria && rule.matched_criteria.length > 0 ? (
                          <ul className="list-disc list-inside space-y-0.5 text-[#24343B]">
                            {rule.matched_criteria.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-[#68777C] italic">None satisfied</span>
                        )}
                      </div>

                      <div className="p-3 rounded border border-[#DEE5E1] bg-white">
                        <strong className="text-[#B78643] text-[11px] uppercase tracking-wider block mb-1.5">
                          ⚠️ Missing / Unmet Criteria:
                        </strong>
                        {rule.missing_criteria && rule.missing_criteria.length > 0 ? (
                          <ul className="list-disc list-inside space-y-0.5 text-[#24343B]">
                            {rule.missing_criteria.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-emerald-700 font-medium">All criteria documented</span>
                        )}
                      </div>
                    </div>

                    {/* Clinician Action Prompt */}
                    {rule.clinician_action_prompt && (
                      <div className="p-3 bg-[#F6EEDC] border border-[#B78643]/30 rounded text-[#B78643] font-medium flex items-start space-x-2">
                        <span className="text-base">⚠️</span>
                        <div>
                          <strong>Action Prompt:</strong> {rule.clinician_action_prompt}
                        </div>
                      </div>
                    )}

                    {/* Citation */}
                    <div className="text-[11px] text-[#68777C] pt-1">
                      Reference:{" "}
                      <span className="italic">
                        {rule.source?.document_reference || rule.source?.version || "ESMO Clinical Practice Guidelines 2024 / ASCO 2018"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

