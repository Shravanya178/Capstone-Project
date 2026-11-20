"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Topbar from "../../components/Topbar";
import { CdssApi, ApiError } from "../../services/api";

export default function NewAssessmentPage() {
  const router = useRouter();

  const [inputMode, setInputMode] = useState<"text" | "file" | "dicom">("text");
  const [patientId, setPatientId] = useState<string>("");
  const [clinicalText, setClinicalText] = useState<string>(
    `DIAGNOSTIC PATHOLOGY REPORT:
Specimen: Left breast mass, core needle biopsy.
Histologic Diagnosis: Invasive Ductal Carcinoma of the breast.
Nottingham Histologic Grade: Grade 2 (moderately differentiated).
Primary Tumor Size: Measuring 2.2 cm in greatest dimension.
Biomarker Analysis:
- Estrogen Receptor (ER): Positive (85% nuclear positivity, strong intensity).
- Progesterone Receptor (PR): Positive (70% nuclear positivity, moderate intensity).
- HER2 / neu: Negative by Immunohistochemistry (Score 1+).
- Ki-67 Proliferation Index: 14% nuclear positivity.
Regional Lymph Nodes: No clinical lymphadenopathy on physical examination (cN0).`
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stages = [
    "Data Ingestion & Formatting",
    "Preprocessing & Missingness Classification",
    "Clinical NLP Extraction & Entity Grounding",
    "Canonical Patient Profile Generation",
    "Biomarker Interpretation (ER/PR/HER2/Ki-67)",
    "IHC Surrogate Molecular Subtyping",
    "AJCC 8th Edition Anatomical Staging (cTNM)",
    "Deterministic Guideline Evaluation (ESMO/ASCO)",
    "Clinical Safety & Contraindication Overrides",
    "Multimodal Treatment Plan Generation",
  ];

  const handleProcessText = async () => {
    if (!clinicalText.trim()) {
      setErrorMessage("Please enter clinical report text to assess.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setCurrentStage(1);

    // Visual progress step simulation aligned with real backend call
    const progressInterval = setInterval(() => {
      setCurrentStage((prev) => (prev < 9 ? prev + 1 : prev));
    }, 300);

    try {
      const result = await CdssApi.assessText(
        clinicalText,
        patientId.trim() || undefined
      );
      clearInterval(progressInterval);
      setCurrentStage(10);

      // Store in sessionStorage for instant retrieval if needed
      if (typeof window !== "undefined") {
        sessionStorage.setItem("latest_assessment", JSON.stringify(result));
      }

      setTimeout(() => {
        router.push("/workspace?case=scenario_a");
      }, 500);
    } catch (err: any) {
      clearInterval(progressInterval);
      setIsProcessing(false);
      setErrorMessage(err.message || "Assessment failed. Please review input text.");
    }
  };

  const handleProcessFile = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select a supported .xlsx, .csv, or .txt file.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setCurrentStage(1);

    const progressInterval = setInterval(() => {
      setCurrentStage((prev) => (prev < 9 ? prev + 1 : prev));
    }, 400);

    try {
      let result;
      if (inputMode === "dicom") {
        result = await CdssApi.parseDicomSR(selectedFile);
      } else {
        result = await CdssApi.uploadFile(selectedFile);
      }

      clearInterval(progressInterval);
      setCurrentStage(10);

      if (typeof window !== "undefined") {
        sessionStorage.setItem("latest_assessment", JSON.stringify(result));
      }

      setTimeout(() => {
        router.push("/workspace?case=scenario_a");
      }, 600);
    } catch (err: any) {
      clearInterval(progressInterval);
      setIsProcessing(false);
      setErrorMessage(err.message || "File upload failed. Ensure the file conforms to supported schemas.");
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Topbar />

      <main className="flex-1 p-6 max-w-5xl w-full mx-auto space-y-6">
        {/* Title Header */}
        <div className="bg-white border border-[#DEE5E1] rounded-lg p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-[#68777C] uppercase tracking-wider">
                Clinical Ingestion Workspace
              </span>
              <h2 className="text-lg font-bold text-[#193B4A] mt-0.5">
                New Breast Cancer Assessment
              </h2>
              <p className="text-xs text-[#68777C] mt-1">
                Submit an unformatted clinical narrative, pathology biopsy note, structured spreadsheet, or DICOM Structured Report.
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <span className="badge-teal">SOP 1.2.840.10008.5.1.4.1.1.88.33 Supported</span>
            </div>
          </div>
        </div>

        {/* Input Mode Selector Tabs */}
        <div className="flex space-x-2 border-b border-[#DEE5E1]">
          <button
            onClick={() => setInputMode("text")}
            className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors ${
              inputMode === "text"
                ? "border-[#193B4A] text-[#193B4A]"
                : "border-transparent text-[#68777C] hover:text-[#24343B]"
            }`}
          >
            Narrative Text / Synoptic Report
          </button>
          <button
            onClick={() => setInputMode("file")}
            className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors ${
              inputMode === "file"
                ? "border-[#193B4A] text-[#193B4A]"
                : "border-transparent text-[#68777C] hover:text-[#24343B]"
            }`}
          >
            Clinical Spreadsheet (.xlsx, .csv)
          </button>
          <button
            onClick={() => setInputMode("dicom")}
            className={`py-2 px-4 text-xs font-semibold border-b-2 transition-colors ${
              inputMode === "dicom"
                ? "border-[#193B4A] text-[#193B4A]"
                : "border-transparent text-[#68777C] hover:text-[#24343B]"
            }`}
          >
            DICOM Structured Report (.dcm)
          </button>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-4 rounded-lg bg-[#F8E9E7] border border-[#B54B4B] text-xs text-[#B54B4B] flex items-start space-x-2">
            <span className="text-base font-bold">⚠️</span>
            <div>
              <strong>Validation / Processing Notice:</strong> {errorMessage}
            </div>
          </div>
        )}

        {/* Section C: Optional Patient Metadata */}
        <div className="bg-white border border-[#DEE5E1] rounded-lg p-4 shadow-xs">
          <label className="text-xs font-semibold text-[#193B4A] block mb-1">
            Patient / Cohort Identifier (Optional):
          </label>
          <input
            type="text"
            placeholder="e.g. TCIA_BreastDX-01-0022 or PATIENT_RESEARCH_01"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            disabled={isProcessing}
            className="w-full text-xs p-2.5 rounded border border-[#DEE5E1] bg-[#F5F6F3] text-[#24343B] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4E8276] font-mono"
          />
        </div>

        {/* Section A: Text Ingestion */}
        {inputMode === "text" && (
          <div className="bg-white border border-[#DEE5E1] rounded-lg p-5 shadow-xs space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#193B4A] block mb-1">
                Paste Diagnostic Pathology / Breast Imaging Narrative:
              </label>
              <textarea
                rows={9}
                value={clinicalText}
                onChange={(e) => setClinicalText(e.target.value)}
                disabled={isProcessing}
                className="w-full text-xs p-3.5 rounded border border-[#DEE5E1] bg-[#F5F6F3] text-[#24343B] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4E8276] font-mono leading-relaxed"
                placeholder="Enter pathology impression, receptor percentages, or Nottingham grade..."
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[#68777C]">
                Bio_ClinicalBERT NLP & ASCO/CAP rule extractor will segment and ground observations.
              </span>
              <button
                onClick={handleProcessText}
                disabled={isProcessing}
                className="px-5 py-2 bg-[#193B4A] hover:bg-[#244b5c] text-white text-xs font-semibold rounded shadow-xs transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <span>{isProcessing ? "Processing..." : "Run Clinical Assessment →"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Section B: File Upload (Spreadsheet or DICOM SR) */}
        {(inputMode === "file" || inputMode === "dicom") && (
          <div className="bg-white border border-[#DEE5E1] rounded-lg p-6 shadow-xs space-y-4">
            <div className="border-2 border-dashed border-[#DEE5E1] rounded-lg p-8 text-center space-y-3 bg-[#F5F6F3]">
              <div className="text-2xl">
                {inputMode === "dicom" ? "🩻" : "📊"}
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#193B4A]">
                  {inputMode === "dicom"
                    ? "Upload DICOM Structured Report (.dcm)"
                    : "Upload Clinical Spreadsheet (.xlsx, .csv)"}
                </h4>
                <p className="text-[11px] text-[#68777C] mt-0.5">
                  {inputMode === "dicom"
                    ? "Accepts Modality SR under SOP Class 1.2.840.10008.5.1.4.1.1.88.33. Non-SR image instances will be rejected."
                    : "Supported formats: TCIA Breast clinical workbook, I-SPY-1 clinical trial matrix, or synoptic text."}
                </p>
              </div>

              <input
                type="file"
                accept={inputMode === "dicom" ? ".dcm" : ".xlsx,.csv,.txt"}
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                disabled={isProcessing}
                className="text-xs text-[#68777C] file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#193B4A] file:text-white hover:file:bg-[#244b5c]"
              />

              {selectedFile && (
                <div className="text-xs text-[#4E8276] font-medium pt-2">
                  Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[#68777C]">
                Deterministic parsers assert schema conformance before pipeline ingestion.
              </span>
              <button
                onClick={handleProcessFile}
                disabled={isProcessing || !selectedFile}
                className="px-5 py-2 bg-[#193B4A] hover:bg-[#244b5c] text-white text-xs font-semibold rounded shadow-xs transition-colors disabled:opacity-50"
              >
                {isProcessing ? "Processing File..." : "Ingest & Evaluate File →"}
              </button>
            </div>
          </div>
        )}

        {/* Section D: 10-Stage Pipeline Processing Tracker */}
        {isProcessing && (
          <div className="bg-white border border-[#DEE5E1] rounded-lg p-6 shadow-xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#DEE5E1]">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 border-2 border-[#193B4A] border-t-transparent rounded-full animate-spin" />
                <h4 className="text-xs font-bold text-[#193B4A] uppercase tracking-wider">
                  Live Pipeline Execution Tracker
                </h4>
              </div>
              <span className="text-xs font-mono text-[#4E8276] font-semibold">
                Stage {currentStage} of 10
              </span>
            </div>

            <div className="space-y-2">
              {stages.map((stageName, index) => {
                const stageNum = index + 1;
                const isComplete = currentStage > stageNum;
                const isActive = currentStage === stageNum;

                return (
                  <div
                    key={stageName}
                    className={`p-2.5 rounded border text-xs flex items-center justify-between transition-colors ${
                      isComplete
                        ? "bg-[#E7F0EA] border-[#DEE5E1] text-[#4E8276]"
                        : isActive
                        ? "bg-[#F5F6F3] border-[#193B4A] text-[#193B4A] font-semibold shadow-xs"
                        : "bg-white border-gray-100 text-[#68777C]"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono text-[10px] w-5 text-center">
                        {isComplete ? "✓" : isActive ? "►" : stageNum}
                      </span>
                      <span>{stageName}</span>
                    </div>
                    <span className="text-[10px] font-mono">
                      {isComplete ? "COMPLETED" : isActive ? "ACTIVE" : "PENDING"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

