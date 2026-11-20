"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: "Overview", href: "/", icon: "grid" },
  { name: "Patient Assessment", href: "/workspace", icon: "activity", badge: "Live" },
  { name: "New Assessment", href: "/new-assessment", icon: "plus-circle" },
  { name: "Clinical Evidence", href: "/evidence", icon: "file-text" },
  { name: "Decision Support", href: "/decision-support", icon: "shield-check" },
  { name: "System Information", href: "/system-info", icon: "info" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#193B4A] text-white flex flex-col flex-shrink-0 min-h-screen border-r border-[#193B4A]">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#244b5c]">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-[#4E8276] flex items-center justify-center font-bold text-white text-base shadow-sm">
            BC
          </div>
          <div>
            <h1 className="font-semibold text-sm tracking-wide text-white">Breast Cancer CDSS</h1>
            <p className="text-[11px] text-[#A5C0BA] font-normal">Decision Support System</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold text-[#8DA6A0] tracking-wider uppercase">
          Clinical Workspace
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded text-xs font-medium transition-colors ${
                isActive
                  ? "bg-[#244b5c] text-white shadow-sm border-l-2 border-[#4E8276]"
                  : "text-[#D3E0DC] hover:bg-[#1f4555] hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <span className="text-sm">
                  {item.icon === "grid" && "⊞"}
                  {item.icon === "activity" && "⚕"}
                  {item.icon === "plus-circle" && "⊕"}
                  {item.icon === "file-text" && "📄"}
                  {item.icon === "shield-check" && "🛡"}
                  {item.icon === "info" && "ⓘ"}
                </span>
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-[#4E8276] text-white rounded">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-[#244b5c] bg-[#14323f]">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-medium text-emerald-300">Engine Operational</span>
        </div>
        <p className="text-[10px] text-[#A5C0BA] leading-tight">
          Research Decision Support Prototype.
          <br />
          Non-autonomous. Clinician-in-the-loop.
        </p>
      </div>
    </aside>
  );
}

