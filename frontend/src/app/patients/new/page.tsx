"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UserPlus,
  ArrowRight,
  ShieldAlert,
  Calendar,
  FileText,
  User,
  Heart,
  Pill,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { PatientStore } from "../../../services/patientStore";

export default function NewPatientRegistrationPage() {
  const router = useRouter();

  // Form State
  const [name, setName] = useState("");
  const [dob, setDob] = useState("1970-01-01");
  const [sex, setSex] = useState<"Female" | "Male">("Female");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [diagnosisDate, setDiagnosisDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [medicalHistory, setMedicalHistory] = useState("");
  const [comorbidities, setComorbidities] = useState("");
  const [currentMedications, setCurrentMedications] = useState("");
  const [knownAllergies, setKnownAllergies] = useState("");
  const [menopausalStatus, setMenopausalStatus] = useState<
    "premenopausal" | "perimenopausal" | "postmenopausal" | "unknown"
  >("postmenopausal");
  const [pregnancyStatus, setPregnancyStatus] = useState<
    "negative" | "positive" | "not_applicable" | "untested"
  >("not_applicable");

  // Calculate age from DOB
  const calculateAge = (dobString: string) => {
    try {
      const birthDate = new Date(dobString);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return isNaN(age) || age < 0 ? 55 : age;
    } catch {
      return 55;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const age = calculateAge(dob);

    const newPatient = PatientStore.registerPatient({
      name: name.trim(),
      dob,
      age,
      sex,
      contactPhone: contactPhone.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      diagnosisDate,
      medicalHistory: medicalHistory.trim() || "No significant medical history documented.",
      comorbidities: comorbidities
        ? comorbidities.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      currentMedications: currentMedications
        ? currentMedications.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      knownAllergies: knownAllergies
        ? knownAllergies.split(",").map((s) => s.trim()).filter(Boolean)
        : ["No known drug allergies (NKDA)"],
      menopausalStatus,
      pregnancyStatus,
    });

    // Directly navigate to patient clinical records for document upload
    router.push("/clinical-records");
  };

  return (
    <main className="w-full px-6 lg:px-10 py-6 space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb & Title */}
      <div className="pb-4 border-b border-[#DEE5E1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-[#68777C] mb-1">
            <Link href="/patients" className="hover:underline">
              Patients
            </Link>
            <span>/</span>
            <span className="text-[#193B4A] font-semibold">New Patient Intake</span>
          </div>
          <h1 className="text-2xl font-bold text-[#193B4A] tracking-tight flex items-center space-x-2.5">
            <UserPlus className="w-6 h-6 text-[#4E8276]" />
            <span>Oncologist Patient Registration</span>
          </h1>
          <p className="text-xs text-[#68777C] mt-1">
            Register a patient profile to begin clinical document upload, automated NLP extraction, and guideline safety evaluation.
          </p>
        </div>

        <Link
          href="/patients"
          className="text-xs text-[#4E8276] hover:underline font-semibold"
        >
          Cancel & Return to Directory
        </Link>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Demographics & Identifiers */}
        <div className="p-6 rounded-xl bg-white border border-[#DEE5E1] shadow-clinical-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#193B4A] pb-3 border-b border-[#DEE5E1] flex items-center space-x-2">
            <User className="w-4 h-4 text-[#4E8276]" />
            <span>Patient Identification & Demographics</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-[#24343B] block mb-1">
                Full Patient Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Susan Reynolds"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F6F3] border border-[#DEE5E1] rounded-lg text-xs text-[#24343B] focus:outline-none focus:ring-1 focus:ring-[#4E8276] focus:bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-[#24343B] block mb-1">
                Date of Birth (DOB) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F6F3] border border-[#DEE5E1] rounded-lg text-xs text-[#24343B] focus:outline-none focus:ring-1 focus:ring-[#4E8276] focus:bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-[#24343B] block mb-1">
                Biological Sex <span className="text-rose-500">*</span>
              </label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#F5F6F3] border border-[#DEE5E1] rounded-lg text-xs text-[#24343B] focus:outline-none focus:ring-1 focus:ring-[#4E8276] focus:bg-white"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-[#24343B] block mb-1">
                Primary Contact Phone
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 012-3456"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F6F3] border border-[#DEE5E1] rounded-lg text-xs text-[#24343B] focus:outline-none focus:ring-1 focus:ring-[#4E8276] focus:bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-[#24343B] block mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="patient@example.org"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F6F3] border border-[#DEE5E1] rounded-lg text-xs text-[#24343B] focus:outline-none focus:ring-1 focus:ring-[#4E8276] focus:bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-[#24343B] block mb-1">
                Diagnosis Date
              </label>
              <input
                type="date"
                value={diagnosisDate}
                onChange={(e) => setDiagnosisDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F6F3] border border-[#DEE5E1] rounded-lg text-xs text-[#24343B] focus:outline-none focus:ring-1 focus:ring-[#4E8276] focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* 2. Endocrine & Reproductive Status */}
        <div className="p-6 rounded-xl bg-white border border-[#DEE5E1] shadow-clinical-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#193B4A] pb-3 border-b border-[#DEE5E1] flex items-center space-x-2">
            <Heart className="w-4 h-4 text-[#4E8276]" />
            <span>Endocrine & Reproductive Profile (Mandatory for Aromatase Inhibitors & Trastuzumab)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-[#24343B] block mb-1">
                Menopausal Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={menopausalStatus}
                onChange={(e) => setMenopausalStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#F5F6F3] border border-[#DEE5E1] rounded-lg text-xs text-[#24343B] focus:outline-none focus:ring-1 focus:ring-[#4E8276] focus:bg-white"
              >
                <option value="postmenopausal">Postmenopausal (Eligible for Aromatase Inhibitors)</option>
                <option value="premenopausal">Premenopausal (Requires OFS for Aromatase Inhibitors)</option>
                <option value="perimenopausal">Perimenopausal</option>
                <option value="unknown">Unknown / Not Documented</option>
              </select>
              <p className="text-[11px] text-[#68777C] mt-1">
                Aromatase inhibitors are contraindicated in premenopausal women without concurrent GnRH ovarian suppression.
              </p>
            </div>

            <div>
              <label className="font-semibold text-[#24343B] block mb-1">
                Pregnancy Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={pregnancyStatus}
                onChange={(e) => setPregnancyStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#F5F6F3] border border-[#DEE5E1] rounded-lg text-xs text-[#24343B] focus:outline-none focus:ring-1 focus:ring-[#4E8276] focus:bg-white"
              >
                <option value="not_applicable">Not Applicable (e.g. Postmenopausal)</option>
                <option value="negative">Confirmed Negative (Serum hCG Neg)</option>
                <option value="positive">Confirmed Pregnant (Critical Contraindication)</option>
                <option value="untested">Untested / Pending</option>
              </select>
              <p className="text-[11px] text-[#68777C] mt-1">
                Trastuzumab, Tamoxifen, and cytotoxic chemotherapy carry FDA Boxed Warnings for embryo-fetal lethality.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Medical History, Comorbidities, Medications & Allergies */}
        <div className="p-6 rounded-xl bg-white border border-[#DEE5E1] shadow-clinical-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#193B4A] pb-3 border-b border-[#DEE5E1] flex items-center space-x-2">
            <Pill className="w-4 h-4 text-[#4E8276]" />
            <span>Clinical History, Comorbidities & Medication Safeguards</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-[#24343B] block mb-1">
                Relevant Medical History & Diagnostic Context
              </label>
              <textarea
                rows={2}
                placeholder="e.g. 62yo female with palpable left breast mass. No prior history of breast cancer."
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F6F3] border border-[#DEE5E1] rounded-lg text-xs text-[#24343B] focus:outline-none focus:ring-1 focus:ring-[#4E8276] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-semibold text-[#24343B] block mb-1">
                  Existing Comorbidities (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Hypertension, Cardiomyopathy, DVT"
                  value={comorbidities}
                  onChange={(e) => setComorbidities(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F6F3] border border-[#DEE5E1] rounded-lg text-xs text-[#24343B] focus:outline-none focus:ring-1 focus:ring-[#4E8276] focus:bg-white"
                />
                <span className="text-[10px] text-[#68777C] mt-0.5 block">
                  e.g. Cardiomyopathy triggers LVEF check
                </span>
              </div>

              <div>
                <label className="font-semibold text-[#24343B] block mb-1">
                  Current Medications (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Fluoxetine, Paroxetine, Amlodipine"
                  value={currentMedications}
                  onChange={(e) => setCurrentMedications(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F6F3] border border-[#DEE5E1] rounded-lg text-xs text-[#24343B] focus:outline-none focus:ring-1 focus:ring-[#4E8276] focus:bg-white"
                />
                <span className="text-[10px] text-[#68777C] mt-0.5 block">
                  e.g. Fluoxetine inhibits Tamoxifen CYP2D6
                </span>
              </div>

              <div>
                <label className="font-semibold text-[#24343B] block mb-1">
                  Known Drug Allergies
                </label>
                <input
                  type="text"
                  placeholder="Penicillin, Sulfa, NKDA"
                  value={knownAllergies}
                  onChange={(e) => setKnownAllergies(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F6F3] border border-[#DEE5E1] rounded-lg text-xs text-[#24343B] focus:outline-none focus:ring-1 focus:ring-[#4E8276] focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end space-x-4 pt-2">
          <Link
            href="/patients"
            className="px-4 py-2.5 rounded-lg border border-[#DEE5E1] bg-white text-xs font-semibold text-[#68777C] hover:bg-[#F5F6F3]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-[#193B4A] hover:bg-[#234D5F] text-white text-xs font-bold transition-all shadow-clinical-sm flex items-center space-x-2 active:scale-95"
          >
            <span>Register & Proceed to Document Upload</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </main>
  );
}

