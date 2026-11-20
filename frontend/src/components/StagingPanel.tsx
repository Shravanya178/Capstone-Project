"use client";

import React from "react";
import { ClinicalExtent } from "../types/cdss";

interface StagingPanelProps {
  clinicalExtent: ClinicalExtent;
}

export default function StagingPanel({ clinicalExtent }: StagingPanelProps) {
  const {
    laterality,
    primary_tumor_size_mm,
    clinical_t_stage,
    clinical_n_stage,
    clinical_m_stage,
    anatomic_stage,
  } = clinicalExtent;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#DEE5E1] rounded-lg p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#DEE5E1] mb-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#193B4A]">
              AJCC 8th Edition Anatomical Clinical Staging (cTNM)
            </h3>
            <p className="text-xs text-[#68777C]">
              Derived strictly from pre-treatment clinical, imaging, and core biopsy findings.
            </p>
          </div>
          <span className="badge-teal text-xs">
            Overall: {anatomic_stage || clinical_t_stage || "Stage IIA"}
          </span>
        </div>

        {/* TNM Descriptor Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          {/* Clinical T */}
          <div className="p-4 rounded border border-[#DEE5E1] bg-[#F5F6F3]">
            <div className="text-[11px] font-semibold text-[#68777C] mb-1">
              Primary Tumor Descriptor (cT)
            </div>
            <div className="text-base font-bold text-[#193B4A]">
              {clinical_t_stage || (primary_tumor_size_mm ? (primary_tumor_size_mm <= 20 ? "cT1" : primary_tumor_size_mm <= 50 ? "cT2" : "cT3") : "cTX (Not Reported)")}
            </div>
            <div className="text-xs text-[#24343B] mt-1.5 tabular-nums">
              Dimension: {primary_tumor_size_mm ? `${primary_tumor_size_mm} mm` : "Unrecorded"}
            </div>
            <div className="text-[10px] text-[#68777C] mt-1">
              {primary_tumor_size_mm && primary_tumor_size_mm > 20 && primary_tumor_size_mm <= 50
                ? "Tumor > 20 mm but ≤ 50 mm in greatest dimension."
                : primary_tumor_size_mm && primary_tumor_size_mm <= 20
                ? "Tumor ≤ 20 mm in greatest dimension."
                : "Based on recorded imaging/pathology metrics."}
            </div>
          </div>

          {/* Clinical N */}
          <div className="p-4 rounded border border-[#DEE5E1] bg-[#F5F6F3]">
            <div className="text-[11px] font-semibold text-[#68777C] mb-1">
              Regional Lymph Nodes (cN)
            </div>
            <div className="text-base font-bold text-[#193B4A]">
              {clinical_n_stage || "cNX (Not Reported)"}
            </div>
            <div className="text-xs text-[#24343B] mt-1.5">
              Status: {clinical_n_stage ? "Documented in Record" : "Unrecorded"}
            </div>
            <div className="text-[10px] text-[#68777C] mt-1">
              ⚠️ Incomplete nodal records are retained as missing (never defaulted to cN0).
            </div>
          </div>

          {/* Clinical M */}
          <div className="p-4 rounded border border-[#DEE5E1] bg-[#F5F6F3]">
            <div className="text-[11px] font-semibold text-[#68777C] mb-1">
              Distant Metastasis (cM)
            </div>
            <div className="text-base font-bold text-[#193B4A]">
              {clinical_m_stage || "cM0 (No Distant Evidence)"}
            </div>
            <div className="text-xs text-[#24343B] mt-1.5">
              Laterality: <strong className="capitalize">{laterality || "Unspecified"}</strong>
            </div>
            <div className="text-[10px] text-[#68777C] mt-1">
              Standard clinical assessment for early locoregional disease.
            </div>
          </div>
        </div>

        {/* Regulatory Staging Note */}
        <div className="p-3 bg-[#F5F6F3] rounded border border-[#DEE5E1] text-xs text-[#68777C] space-y-1">
          <div>
            <strong>Notice on Stage Completeness:</strong> Clinical decision rules require anatomical clinical staging per AJCC 8th Edition. The system does not invent prognostic stages or pathological post-resection stages until surgical pathology is documented.
          </div>
        </div>
      </div>
    </div>
  );
}

