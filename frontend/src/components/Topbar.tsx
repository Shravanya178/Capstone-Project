"use client";

import React from "react";
import Link from "next/link";

interface TopbarProps {
  currentCaseId?: string;
  onSelectCase?: (caseId: string) => void;
}

export default function Topbar({ currentCaseId = "scenario_a", onSelectCase }: TopbarProps) {
  return (
    <header className="h-14 bg-white border-b border-[#DEE5E1] px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Left: System Breadcrumb / Title */}
      <div className="flex items-center space-x-3">
        <span className="text-xs font-semibold text-[#193B4A] tracking-wider uppercase">
          Breast Cancer CDSS
        </span>
        <span className="text-xs text-[#68777C]">/</span>
        <span className="text-xs font-medium text-[#68777C]">Clinical Decision Support</span>
      </div>

      {/* Center / Right: Case Switcher and Clinical Flags */}
      <div className="flex items-center space-x-4">
        {onSelectCase && (
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-[#68777C] font-medium">Quick Case:</span>
            <select
              value={currentCaseId}
              onChange={(e) => onSelectCase(e.target.value)}
              className="bg-[#F5F6F3] border border-[#DEE5E1] text-[#24343B] text-xs rounded px-2.5 py-1 font-medium focus:outline-none focus:ring-1 focus:ring-[#4E8276]"
            >
              <option value="scenario_a">Scenario A: Luminal A (ER+/PR+/HER2-)</option>
              <option value="scenario_b">Scenario B: HER2 2+ Equivocal Reflex</option>
              <option value="scenario_c">Scenario C: Incomplete Research Profile</option>
              <option value="scenario_d">Scenario D: ER-Low (1-9%) Notification</option>
              <option value="scenario_e">Scenario E: Longitudinal Timeline</option>
            </select>
          </div>
        )}

        {/* Prototype Regulatory Pill */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#F6EEDC] border border-[#B78643]/30 rounded text-[11px] text-[#B78643] font-medium">
          <span>⚠</span>
          <span>Research Prototype — Clinician Sign-Off Required</span>
        </div>

        {/* Action Button */}
        <Link
          href="/new-assessment"
          className="inline-flex items-center px-3 py-1 bg-[#193B4A] hover:bg-[#244b5c] text-white text-xs font-medium rounded transition-colors shadow-xs"
        >
          <span className="mr-1">⊕</span> New Assessment
        </Link>
      </div>
    </header>
  );
}

