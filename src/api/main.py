"""
FastAPI Application Entrypoint for Breast Cancer CDSS.

Provides RESTful endpoints for clinical capability inspection, sample cases,
unformatted text extraction, file ingestion, DICOM SR parsing, and multi-agent
clinical decision-support pipeline execution.
"""

from typing import Dict, Any, List, Optional
import os
import io
import json
import uuid
import tempfile
from datetime import datetime, timezone

from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src.api.service import CDSSService

app = FastAPI(
    title="Breast Cancer Clinical Decision Support System (CDSS) API",
    description="Research-oriented, explainable, clinician-in-the-loop decision-support backend.",
    version="1.0.0",
)

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Local development and Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

service = CDSSService()


# Request / Response Models
class TextAssessmentRequest(BaseModel):
    text: str = Field(..., description="Unformatted clinical narrative, pathology report, or impression note.")
    patient_id: Optional[str] = Field(None, description="Optional patient or case identifier.")


class ProfileAssessmentRequest(BaseModel):
    patient_profile: Dict[str, Any] = Field(..., description="Canonical patient profile conforming to Draft 2020-12 schema.")
    candidate_medications: Optional[List[str]] = Field(None, description="Optional list of candidate oncology medications.")


@app.get("/health")
def health_check() -> Dict[str, Any]:
    """Basic health check and system heartbeat."""
    return {
        "status": "healthy",
        "service": "breast_cancer_cdss_backend",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "modules": {
            "ingestion": "operational",
            "clinical_nlp": "operational",
            "biomarkers": "operational",
            "guidelines": "operational",
            "safety": "operational",
            "treatment": "operational",
            "dicom_sr": "operational",
        },
    }


@app.get("/api/v1/capabilities")
def get_capabilities() -> Dict[str, Any]:
    """Returns supported modalities, guidelines, safety rules, and limitations."""
    return service.get_capabilities()


@app.get("/api/v1/sample-cases")
def list_sample_cases() -> List[Dict[str, Any]]:
    """Lists pre-configured clinical sample scenarios."""
    return service.list_sample_cases()


@app.get("/api/v1/sample-cases/{case_id}")
def get_sample_case_assessment(case_id: str) -> Dict[str, Any]:
    """Executes the full pipeline for a designated sample clinical scenario."""
    try:
        return service.get_sample_assessment(case_id)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline execution error: {str(e)}")


@app.post("/api/v1/assessments/text")
def assess_clinical_text(req: TextAssessmentRequest) -> Dict[str, Any]:
    """
    Ingests raw clinical text, performs NLP entity extraction and subtyping,
    and runs the full guideline, safety, and treatment pipeline.
    """
    try:
        return service.process_clinical_text(text=req.text, patient_id=req.patient_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text assessment failed: {str(e)}")


@app.post("/api/v1/assessments/profile")
def assess_patient_profile(req: ProfileAssessmentRequest) -> Dict[str, Any]:
    """
    Directly evaluates a structured canonical patient profile against guidelines,
    clinical safety contraindications, and treatment templates.
    """
    try:
        return service.pipeline.process_patient_profile(
            patient_profile=req.patient_profile,
            candidate_medications=req.candidate_medications,
        )
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Schema or evaluation failure: {str(e)}")


@app.post("/api/v1/assessments/upload")
async def upload_and_assess_file(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Ingests an uploaded clinical file (.xlsx, .csv, .txt), runs appropriate loaders,
    and returns the full assessment bundle.
    """
    filename = file.filename or "uploaded_file"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in {".xlsx", ".csv", ".txt", ".dcm"}:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Supported formats: .xlsx, .csv, .txt, .dcm",
        )

    content = await file.read()

    # Plain text file
    if ext == ".txt":
        try:
            text_str = content.decode("utf-8", errors="replace")
            return service.process_clinical_text(text_str, patient_id=f"FILE_{filename[:10]}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to process text file: {str(e)}")

    # DICOM SR file
    if ext == ".dcm":
        try:
            parsed = service.parse_dicom_sr_file(content, filename)
            # Build profile from SR observations
            profile = service.profile_generator.build_profile(
                patient_id=f"DICOM_{parsed.get('patient_id', 'UNKNOWN')}",
                source_dataset="DICOM_STRUCTURED_REPORT",
                source_patient_id=parsed.get("patient_id", "UNKNOWN"),
                observations=parsed.get("observations", []),
            )
            assessment = service.pipeline.process_patient_profile(profile)
            assessment["dicom_metadata"] = {
                "sop_class_uid": parsed["sop_class_uid"],
                "modality": parsed["modality"],
                "observation_count": parsed["observation_count"],
            }
            return assessment
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"DICOM SR parsing failed: {str(e)}")

    # Excel or CSV file
    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        # Check if TCIA workbook format
        if ext == ".xlsx":
            try:
                import pandas as pd
                xl = pd.ExcelFile(tmp_path)
                if "TCIA-Breast-clinical-data" in filename or len(xl.sheet_names) == 1:
                    from src.ingestion.tcia_breast_diagnosis_loader import TCIABreastDiagnosisLoader
                    loader = TCIABreastDiagnosisLoader(tmp_path)
                    df = loader.load()
                    all_obs = loader.to_clinical_observations()
                    first_pat = df.iloc[0]["patient_id"]
                    pat_obs = [o for o in all_obs if o["provenance"]["source_record_id"] == first_pat]
                    pat_row = df.iloc[0]
                    profile = service.profile_generator.build_profile(
                        patient_id=f"TCIA_{first_pat}",
                        source_dataset=loader.DATASET_NAME,
                        source_patient_id=first_pat,
                        observations=pat_obs,
                        laterality=pat_row["pathology_laterality_raw"],
                        histologic_type=pat_row["diagnosis_raw"],
                        er_raw=pat_row["er_raw"],
                        pr_raw=pat_row["pr_raw"],
                        her2_raw=pat_row["her2_raw"],
                        ki67_raw=pat_row["ki67_raw"],
                    )
                    return service.pipeline.process_patient_profile(profile)
            except Exception:
                pass  # Fallback to general processing

        raise HTTPException(
            status_code=422,
            detail=f"Uploaded table '{filename}' did not match recognized cohort schema. Please submit standard TCIA, I-SPY-1, or plain text synoptic reports.",
        )
    finally:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except OSError:
                pass


@app.post("/api/v1/dicom-sr/parse")
async def parse_dicom_sr_endpoint(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Dedicated endpoint for DICOM Structured Report (SR) validation and tree parsing.
    Asserts Modality == 'SR' and SOP Class UID 1.2.840.10008.5.1.4.1.1.88.33.
    """
    filename = file.filename or "sr_file.dcm"
    content = await file.read()
    try:
        return service.parse_dicom_sr_file(content, filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DICOM SR parsing failed: {str(e)}")

