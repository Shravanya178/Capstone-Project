"use client";

import React from "react";
import Topbar from "../../components/Topbar";

export default function SystemInfoPage() {
  return (
    <div className="flex-1 flex flex-col">
      <Topbar />

      <main className="flex-1 p-6 max-w-5xl w-full mx-auto space-y-6">
        <div className="bg-white border border-[#DEE5E1] rounded-lg p-6 shadow-xs">
          <span className="text-[10px] font-semibold text-[#68777C] uppercase tracking-wider">
            Architecture & Handover Specifications
          </span>
          <h2 className="text-lg font-bold text-[#193B4A] mt-0.5">
            System Information & Multi-Agent Architecture
          </h2>
          <p className="text-xs text-[#68777C] mt-1 leading-relaxed">
            Technical audit, modular ownership breakdown, and computational environment specifications for the Breast Cancer Clinical Decision Support System.
          </p>
        </div>

        {/* Team Module Ownership Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-white border border-[#DEE5E1] shadow-xs space-y-2">
            <span className="badge-teal text-[10px]">Module 1–6, 8</span>
            <h4 className="text-xs font-bold text-[#193B4A]">Shravanya&apos;s Module</h4>
            <ul className="list-disc list-inside text-xs text-[#68777C] space-y-1">
              <li>Heterogeneous Dataset Ingestion</li>
              <li>Bio_ClinicalBERT Fine-Tuned NLP</li>
              <li>DICOM Structured Reporting</li>
              <li>Biomarkers &amp; Molecular Subtyping</li>
              <li>Canonical Profile Generator</li>
              <li>Deterministic Guideline Checks</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-white border border-[#DEE5E1] shadow-xs space-y-2">
            <span className="badge-primary text-[10px]">Module 7, 9</span>
            <h4 className="text-xs font-bold text-[#193B4A]">Sanket&apos;s Module</h4>
            <ul className="list-disc list-inside text-xs text-[#68777C] space-y-1">
              <li>Clinical Safety Firewall</li>
              <li>5-Domain Organ Risk Assessor</li>
              <li>11 Contraindications &amp; Boxed Warnings</li>
              <li>Missing Information Tracking</li>
              <li>Dynamic Safety Overrides</li>
              <li>Multimodal Treatment Planning</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-white border border-[#DEE5E1] shadow-xs space-y-2">
            <span className="badge-warning text-[10px]">Module 10</span>
            <h4 className="text-xs font-bold text-[#193B4A]">Nikhil&apos;s Module</h4>
            <ul className="list-disc list-inside text-xs text-[#68777C] space-y-1">
              <li>Next.js / TypeScript Frontend</li>
              <li>FastAPI Integration Layer</li>
              <li>Evidence Trace Viewer (Two-Panel)</li>
              <li>Side-by-Side Treatment Canvas</li>
              <li>Clinical Color Palette (#F5F6F3)</li>
              <li>Final Decision Record Export</li>
            </ul>
          </div>
        </div>

        {/* Technical Specs Table */}
        <div className="bg-white border border-[#DEE5E1] rounded-lg shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#DEE5E1] bg-[#F5F6F3]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#193B4A]">
              Runtime Specifications &amp; Validated Cohorts
            </h3>
          </div>
          <div className="p-4 space-y-3 text-xs text-[#24343B]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-[#F5F6F3] rounded border border-[#DEE5E1]">
              <div>
                <span className="text-[#68777C] block text-[10px]">Python Runtime:</span>
                <strong>Python 3.10.0 (Win32)</strong>
              </div>
              <div>
                <span className="text-[#68777C] block text-[10px]">Frontend Framework:</span>
                <strong>Next.js 14 / React 18 / TS</strong>
              </div>
              <div>
                <span className="text-[#68777C] block text-[10px]">Backend Framework:</span>
                <strong>FastAPI / Uvicorn (REST)</strong>
              </div>
              <div>
                <span className="text-[#68777C] block text-[10px]">Schema Standard:</span>
                <strong>JSON Schema Draft 2020-12</strong>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="font-semibold text-[#193B4A]">Ingested Cohort Volumes:</div>
              <ul className="list-disc list-inside space-y-1 text-[#68777C]">
                <li><strong>TCGA-BRCA:</strong> 1,034 verified breast cancer pathology reports.</li>
                <li><strong>TCIA Breast-Diagnosis:</strong> 51 unique patients parsed from 15x53 transposed matrix.</li>
                <li><strong>I-SPY-1 Clinical Trial:</strong> 221 trial patients across baseline, MRI, and outcome endpoints.</li>
                <li><strong>BreastPathQ:</strong> 96 post-neoadjuvant resection scans across 54 patients.</li>
                <li><strong>DICOM Structured Reports:</strong> 94 Comprehensive SR files under SOP Class 1.2.840.10008.5.1.4.1.1.88.33.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

