import type { Metadata } from "next";
import "./globals.css";
import TopNavbar from "../components/TopNavbar";

export const metadata: Metadata = {
  title: "OncoSupport CDSS — Breast Cancer Decision Support System",
  description: "Explainable, guideline-based clinical decision support platform for oncologists.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#F5F6F3] text-[#24343B] min-h-screen flex flex-col antialiased">
        {/* Top Clinical Navigation Bar */}
        <TopNavbar />

        {/* Full-Width Main Viewport */}
        <div className="flex-1 w-full flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
