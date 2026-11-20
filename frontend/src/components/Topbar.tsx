"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, PlusCircle, CheckCircle2, ChevronRight, Activity } from "lucide-react";

interface TopbarProps {
  currentCaseId?: string;
  onSelectCase?: (caseId: string) => void;
}

export default function Topbar({ currentCaseId = "scenario_a", onSelectCase }: TopbarProps) {
  return (
    <header className="h-14 bg-white/95 backdrop-blur-md border-b border-[#DEE5E1] px-6 flex items-center justify-between sticky top-0 z-20 shadow-clinical-xs transition-all">
      {/* Left: System Breadcrumb / Title */}
      <div className="flex items-center space-x-2 text-xs">
        <span className="font-semibold text-[#193B4A] tracking-wider uppercase flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-[#4E8276]" />
          <span>Breast Cancer CDSS</span>
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-[#68777C]" />
        <span className="font-medium text-[#68777C]">Clinical Decision Support Studio</span>
      </div>

      {/* Center / Right: Quick Case Switcher and Clinical Protocol Pill */}
      <div className="flex items-center space-x-4">
        {onSelectCase && (
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-[#68777C] font-medium hidden sm:inline">Active Scenario:</span>
            <select
              value={currentCaseId}
              onChange={(e) => onSelectCase(e.target.value)}
              className="bg-[#F5F6F3] border border-[#DEE5E1] text-[#24343B] text-xs rounded-md px-3 py-1 font-medium focus:outline-none focus:ring-1 focus:ring-[#4E8276] hover:border-[#4E8276] transition-colors cursor-pointer shadow-xs"
            >
              <option value="scenario_a">Scenario A: Luminal A (ER+/PR+/HER2-)</option>
              <option value="scenario_b">Scenario B: HER2 2+ Equivocal Reflex Alert</option>
              <option value="scenario_c">Scenario C: Missing Laboratory Safeguard</option>
              <option value="scenario_d">Scenario D: ER-Low (1-9%) Notification</option>
              <option value="scenario_e">Scenario E: Longitudinal Timepoint Segregation</option>
            </select>
          </div>
        )}

        {/* Prototype Regulatory Pill */}
        <div className="flex items-center space-x-1.5 px-3 py-1 bg-[#F6EEDC] border border-[#B78643]/30 rounded-full text-[11px] text-[#B78643] font-medium shadow-xs">
          <AlertTriangle className="w-3 h-3 text-[#B78643] shrink-0" />
          <span className="truncate max-w-[220px] sm:max-w-none">
            Research Prototype — Clinician Verification Mandatory
          </span>
        </div>

        {/* Action Button */}
        <Link
          href="/new-assessment"
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-[#193B4A] hover:bg-[#234D5F] text-white text-xs font-medium rounded-md transition-all shadow-clinical-xs hover:shadow-clinical-sm active:scale-95"
        >
          <PlusCircle className="w-3.5 h-3.5 mr-0.5" />
          <span>New Assessment</span>
        </Link>
      </div>
    </header>
  );
}
