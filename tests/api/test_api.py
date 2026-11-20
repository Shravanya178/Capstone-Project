"""
Automated Unit and Integration Tests for FastAPI Backend Endpoints.
"""

import pytest
from fastapi.testclient import TestClient

from src.api.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "breast_cancer_cdss_backend"
    assert "modules" in data


def test_capabilities_endpoint():
    response = client.get("/api/v1/capabilities")
    assert response.status_code == 200
    data = response.json()
    assert data["research_prototype"] is True
    assert len(data["guideline_rules"]) == 5
    assert data["safety_rules_count"] == 11
    assert data["treatment_modalities_count"] == 8


def test_list_sample_cases():
    response = client.get("/api/v1/sample-cases")
    assert response.status_code == 200
    cases = response.json()
    assert len(cases) >= 5
    case_ids = [c["case_id"] for c in cases]
    assert "scenario_a" in case_ids
    assert "scenario_b" in case_ids
    assert "scenario_c" in case_ids


def test_get_sample_case_scenario_a():
    response = client.get("/api/v1/sample-cases/scenario_a")
    assert response.status_code == 200
    data = response.json()
    assert "patient_profile" in data
    assert "guideline_check" in data
    assert "safety_assessment" in data
    assert "treatment_plan" in data
    assert data["patient_profile"]["pathology_biomarkers"]["molecular_subtype"] == "luminal_a"
    assert data["treatment_plan"]["plan_status"] == "supported_for_consideration"


def test_get_sample_case_scenario_b_equivocal():
    response = client.get("/api/v1/sample-cases/scenario_b")
    assert response.status_code == 200
    data = response.json()
    options = data["treatment_plan"]["treatment_options"]
    trast = next((o for o in options if "Trastuzumab" in o["regimen_or_modality"]), None)
    assert trast is not None
    assert trast["eligibility_status"] == "requires_clinician_review"


def test_get_invalid_sample_case_404():
    response = client.get("/api/v1/sample-cases/non_existent_case_999")
    assert response.status_code == 404


def test_assess_clinical_text():
    text_sample = (
        "DIAGNOSTIC PATHOLOGY REPORT: Left breast mass core biopsy demonstrates "
        "Invasive Ductal Carcinoma, Nottingham Grade 2. "
        "Estrogen Receptor: Positive (80%). Progesterone Receptor: Positive (60%). "
        "HER-2/neu: Score 1+ (Negative). Primary tumor measuring 2.4 cm."
    )
    response = client.post(
        "/api/v1/assessments/text",
        json={"text": text_sample, "patient_id": "TEST_API_PATIENT"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "patient_profile" in data
    assert "guideline_check" in data
    assert "safety_assessment" in data
    assert "treatment_plan" in data
    assert data["patient_profile"]["patient_id"] == "TEST_API_PATIENT"
    assert data["patient_profile"]["pathology_biomarkers"]["er_status"] == "positive"
    assert data["patient_profile"]["pathology_biomarkers"]["her2_status"] == "negative"

