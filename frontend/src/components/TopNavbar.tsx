"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FolderOpen,
  Activity,
  ShieldCheck,
  FileCheck2,
  Settings,
  HeartPulse,
  AlertTriangle,
  ChevronDown,
  User,
} from "lucide-react";
import { PatientStore, PatientRecord } from "../services/patientStore";

export default function TopNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [activePatientId, setActivePatientId] = useState<string>("BC-2026-0842");

  const syncPatients = () => {
    setPatients(PatientStore.getPatients());
    setActivePatientId(PatientStore.getActivePatientId());
  };

  useEffect(() => {
    syncPatients();
    const handleStorage = () => syncPatients();
    window.addEventListener("cdss_active_patient_changed", handleStorage);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("cdss_active_patient_changed", handleStorage);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleSelectPatient = (id: string) => {
    PatientStore.setActivePatientId(id);
    setActivePatientId(id);
    // If on a patient-specific view, force reload or state update
    router.refresh();
  };

  const navLinks = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Patients", href: "/patients", icon: Users },
    { name: "New Patient", href: "/patients/new", icon: UserPlus },
    { name: "Clinical Records", href: "/clinical-records", icon: FolderOpen },
    { name: "Clinical Assessment", href: "/clinical-assessment", icon: Activity },
    { name: "Decision Support", href: "/decision-support", icon: ShieldCheck },
    { name: "Reports", href: "/reports", icon: FileCheck2 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const currentPatient = patients.find((p) => p.id === activePatientId) || patients[0];

  return (
    <header className="sticky top-0 z-50 bg-[#193B4A] text-white shadow-clinical-md border-b border-[#14323F] w-full">
      {/* Top Clinical Utility Ribbon */}
      <div className="bg-[#102631] px-6 py-1.5 flex items-center justify-between text-xs text-[#A5C0BA] border-b border-white/5">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1 font-semibold text-white">
            <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
            <span>OncoSupport CDSS — Breast Oncology Clinic</span>
          </span>
          <span className="text-white/20">|</span>
          <span className="hidden sm:inline">ESMO 2024 / ASCO 2020 Clinical Standards</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20 text-[11px] font-medium">
            <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Decision Support Prototype — Clinician Verification Mandatory</span>
          </div>
          <div className="flex items-center space-x-1.5 text-white/80">
            <div className="w-5 h-5 rounded-full bg-[#4E8276] text-white flex items-center justify-center font-bold text-[10px]">
              SP
            </div>
            <span className="text-[11px] font-medium hidden md:inline">Dr. S. Patil, MD</span>
          </div>
        </div>
      </div>

      {/* Primary Navigation & Active Patient Bar */}
      <div className="px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center space-x-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4E8276] to-[#376258] flex items-center justify-center text-white font-bold text-sm shadow-clinical-xs ring-1 ring-white/10 group-hover:scale-105 transition-transform">
            BC
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-white flex items-center space-x-1.5">
              <span>Breast Cancer CDSS</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#4E8276] text-white font-medium uppercase">
                Clinical
              </span>
            </div>
            <div className="text-[10px] text-[#A5C0BA]">Explainable Decision Support Platform</div>
          </div>
        </Link>

        {/* Main Navigation Tabs */}
        <nav className="flex items-center space-x-1 overflow-x-auto scrollbar-none py-1">
          {navLinks.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#244B5C] text-white shadow-xs border border-[#4E8276]/40"
                    : "text-[#D3E0DC] hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#4E8276]" : "text-[#A5C0BA]"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Active Patient Quick Switcher Dock */}
        <div className="flex items-center space-x-2 shrink-0 bg-[#102631] px-3 py-1.5 rounded-lg border border-white/10 shadow-xs">
          <User className="w-3.5 h-3.5 text-[#4E8276]" />
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase font-bold text-[#A5C0BA] tracking-wider">
              Active Patient
            </span>
            <select
              value={activePatientId}
              onChange={(e) => handleSelectPatient(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-4 appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23A5C0BA'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right center", backgroundSize: "12px" }}
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#193B4A] text-white">
                  {p.id}: {p.name} ({p.age}F, {p.clinicalStaging.stageGroup || "Stage pending"})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
