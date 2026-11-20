"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  FilePlus2,
  FileSpreadsheet,
  ShieldAlert,
  Info,
  Sparkles,
  HeartPulse,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeType?: "live" | "neutral";
}

const navItems: NavItem[] = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Patient Assessment", href: "/workspace", icon: Activity, badge: "Live", badgeType: "live" },
  { name: "New Assessment", href: "/new-assessment", icon: FilePlus2 },
  { name: "Clinical Evidence", href: "/evidence", icon: FileSpreadsheet },
  { name: "Decision Support", href: "/decision-support", icon: ShieldAlert },
  { name: "System Information", href: "/system-info", icon: Info },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#193B4A] text-white flex flex-col flex-shrink-0 min-h-screen border-r border-[#14323F] select-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#244B5C] bg-[#14323F]/60">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#4E8276] to-[#376258] flex items-center justify-center font-bold text-white text-base shadow-clinical-sm ring-1 ring-white/10">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="font-semibold text-sm tracking-wide text-white">Breast Cancer CDSS</h1>
            </div>
            <p className="text-[11px] text-[#A5C0BA] font-normal flex items-center space-x-1 mt-0.5">
              <span>Precision Oncology Engine</span>
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold text-[#8DA6A0] tracking-wider uppercase flex items-center justify-between">
          <span>Clinical Workspace</span>
          <span className="text-[9px] bg-[#234D5F] px-1.5 py-0.2 rounded text-[#A5C0BA]">ESMO/ASCO</span>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-[#244B5C] text-white shadow-sm border-l-2 border-[#4E8276] pl-2.5"
                  : "text-[#D3E0DC] hover:bg-[#1F4555] hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors duration-200 ${
                    isActive ? "text-[#4E8276]" : "text-[#8DA6A0] group-hover:text-white"
                  }`}
                />
                <span className="tracking-wide">{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 text-[9px] font-semibold rounded ${
                    item.badgeType === "live"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1"
                      : "bg-[#4E8276] text-white"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{item.badge}</span>
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Operational Heartbeat Dock */}
      <div className="p-4 border-t border-[#244B5C] bg-[#102631]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold text-emerald-300">Engine Operational</span>
          </div>
          <span className="text-[10px] text-[#A5C0BA] font-mono">v1.0-CDSS</span>
        </div>
        <p className="text-[10px] text-[#8DA6A0] leading-snug">
          Clinical Decision Support Prototype.
          <br />
          <span className="text-[#DEE5E1]/70 font-medium">Clinician-in-the-loop required.</span>
        </p>
      </div>
    </aside>
  );
}
