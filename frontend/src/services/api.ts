/**
 * Dedicated API Service Layer for Breast Cancer CDSS.
 * Communicates with the FastAPI backend and maps errors gracefully.
 */

import { AssessmentBundle, SampleCaseMeta } from "../types/cdss";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  details?: string;

  constructor(status: number, message: string, details?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        ...options.headers,
      },
    });

    if (!res.ok) {
      let errorMsg = `Server responded with status ${res.status}`;
      try {
        const errorJson = await res.json();
        errorMsg = errorJson.detail || errorJson.message || errorMsg;
      } catch {
        // ignore parse error
      }
      throw new ApiError(res.status, errorMsg);
    }

    return (await res.json()) as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(0, "Backend service unavailable. Please check that the FastAPI server is running on port 8000.", err.message);
  }
}

export const CdssApi = {
  async getCapabilities(): Promise<any> {
    return request("/api/v1/capabilities");
  },

  async listSampleCases(): Promise<SampleCaseMeta[]> {
    return request<SampleCaseMeta[]>("/api/v1/sample-cases");
  },

  async getSampleAssessment(caseId: string): Promise<AssessmentBundle> {
    return request<AssessmentBundle>(`/api/v1/sample-cases/${caseId}`);
  },

  async assessText(text: string, patientId?: string): Promise<AssessmentBundle> {
    return request<AssessmentBundle>("/api/v1/assessments/text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, patient_id: patientId || undefined }),
    });
  },

  async uploadFile(file: File): Promise<AssessmentBundle> {
    const formData = new FormData();
    formData.append("file", file);

    const url = `${API_BASE_URL}/api/v1/assessments/upload`;
    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      let errorMsg = `File processing failed (${res.status})`;
      try {
        const errorJson = await res.json();
        errorMsg = errorJson.detail || errorMsg;
      } catch {}
      throw new ApiError(res.status, errorMsg);
    }

    return (await res.json()) as AssessmentBundle;
  },

  async parseDicomSR(file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);

    const url = `${API_BASE_URL}/api/v1/dicom-sr/parse`;
    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      let errorMsg = `DICOM parsing failed (${res.status})`;
      try {
        const errorJson = await res.json();
        errorMsg = errorJson.detail || errorMsg;
      } catch {}
      throw new ApiError(res.status, errorMsg);
    }

    return await res.json();
  },
};

