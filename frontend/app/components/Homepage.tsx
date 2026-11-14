"use client";

import React from "react";
import {
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileText,
  Download,
  ArrowRight,
  Sparkles,
  Building2,
  Calendar,
  Clock,
  Briefcase,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { CompanyVault } from "../types";

interface HomepageProps {
  vault: CompanyVault | null;
  onLaunchApp: () => void;
  onLoadSampleAndLaunch: () => void;
  onNavigateTab: (tab: "monitor" | "audit" | "scorecard" | "vault") => void;
}

export default function Homepage({
  vault,
  onLaunchApp,
  onLoadSampleAndLaunch,
  onNavigateTab
}: HomepageProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* ----------------- CLEAN STICKY HEADER ----------------- */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div
              className="flex items-center space-x-2.5 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <div className="w-9 h-9 rounded-xl bg-[#0C1E3A] flex items-center justify-center text-white shadow-xs">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-[#0C1E3A]">CivicScribe</span>
                <span className="ml-2 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  GovTech
                </span>
              </div>
            </div>

            {/* Simple Nav Links */}
            <nav className="hidden md:flex items-center space-x-7 text-xs font-semibold text-slate-600">
              <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
                How It Works
              </a>
              <a href="#preview" className="hover:text-slate-900 transition-colors">
                Audit Preview
              </a>
              <a href="#trades" className="hover:text-slate-900 transition-colors">
                Supported Trades
              </a>
              <a href="#trust" className="hover:text-slate-900 transition-colors">
                Zero-Hallucination
              </a>
            </nav>

            {/* Launch CTA */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onLaunchApp}
                className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2 rounded-xl font-bold text-xs sm:text-sm bg-[#0C1E3A] hover:bg-[#1B365D] text-white shadow-xs hover:shadow-md transition-all active:scale-95"
              >
                <span>Open Auditor</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ----------------- CALM, FOCUSED HERO ----------------- */}
      <section className="pt-16 pb-16 sm:pt-24 sm:pb-20 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Municipal RFP Compliance Auditor & Proposal Writer</span>
          </div>

          {/* Clean, Bold Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0C1E3A] tracking-tight leading-[1.12]">
            Win Municipal Bids. <br className="hidden sm:inline" />
            <span className="text-blue-700">Without the Disqualifications.</span>
          </h1>

          {/* One Clear Sentence */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Drop any 50-page public works solicitation. CivicScribe audits your CSLB licenses, insurance limits, and DIR registrations in 14 seconds—then drafts a rubric-aligned Word proposal.
          </p>

          {/* Single Dominant Primary CTA */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={onLaunchApp}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base bg-[#0C1E3A] hover:bg-[#1B365D] text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <UploadCloud className="w-5 h-5 text-emerald-400" />
              <span>Audit Your First RFP (Free)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onLoadSampleAndLaunch}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-xs sm:text-sm text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Test Benchmark City Parks RFP</span>
            </button>
          </div>

          {/* Minimal Trust Indicator */}
          <p className="text-xs text-slate-400 pt-1">
            Locked to your verified Company Vault • 0.0% Hallucinations • CSLB & DIR Compliant
          </p>
        </div>

        {/* ----------------- CLEAN SINGULAR PRODUCT PREVIEW CARD ----------------- */}
        <div id="preview" className="mt-12 sm:mt-16 max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden text-left">
            {/* Card Header */}
            <div className="p-4 sm:p-5 bg-[#0C1E3A] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  SOLICITATION AUDIT VERDICT
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  City of San Leandro — Grounds & Parks Maintenance Services
                </h3>
                <p className="text-xs text-slate-300">
                  RFP #PW-2026-042 • Est. Value: $520,000 / year • Due: Dec 15, 2026
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  CONDITIONAL GO
                </span>
              </div>
            </div>

            {/* Card Body: 3 Clear Verification Rows */}
            <div className="divide-y divide-slate-100 p-4 sm:p-6 space-y-3">
              {/* Row 1 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 first:pt-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      CSLB C-27 Landscaping Contractor License
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">§ 2.1, p. 7</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verified in Company Vault: CSLB #984210 (Active through 2027)
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  QUALIFIED
                </span>
              </div>

              {/* Row 2 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      Commercial General Liability ($2,000,000 Minimum)
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">§ 7.2, p. 24</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verified in Company Vault: Travelers Casualty Policy $2M occurrence / $4M aggregate
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  QUALIFIED
                </span>
              </div>

              {/* Row 3 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      Mandatory Pre-Bid Conference Attendance
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">§ 1.4, p. 3</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Requires mandatory attendance on Nov 28 at 10:00 AM PST (Civic Center)
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 self-start sm:self-auto shrink-0">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  ACTION REQUIRED
                </span>
              </div>
            </div>

            {/* Card Footer */}
            <div className="bg-slate-50 px-4 sm:px-6 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <span className="text-slate-600 font-medium">
                Audited in <strong>14.4 seconds</strong> • 5 Narrative Sections drafted & aligned to 100-point rubric
              </span>
              <button
                type="button"
                onClick={onLaunchApp}
                className="font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                <span>Open in Live Workspace</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- THREE-STEP WORKFLOW ----------------- */}
      <section id="how-it-works" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-14">
            <span className="text-xs font-bold tracking-wider uppercase text-blue-700">HOW IT WORKS</span>
            <h2 className="text-3xl font-extrabold text-[#0C1E3A]">Three Steps to Submission</h2>
            <p className="text-sm text-slate-600">
              No prompt engineering. No complex setup. Just drop your solicitation PDF.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="space-y-3 p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-extrabold text-sm">
                01
              </div>
              <h3 className="font-bold text-slate-900 text-base">Drop Solicitation PDF</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload any 40- to 80-page municipal RFP. CivicScribe parses scope, insurance exhibits, and evaluation rubrics.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3 p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-sm">
                02
              </div>
              <h3 className="font-bold text-slate-900 text-base">Instant Go/No-Go Audit</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The compliance engine cross-references criteria against your Company Vault, flagging fatal disqualifiers and required actions.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3 p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-extrabold text-sm">
                03
              </div>
              <h3 className="font-bold text-slate-900 text-base">Download Word Proposal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Export formatted <code className="font-mono text-slate-700 font-bold">.docx</code> packets aligned to agency scoring points, ready for executive signature.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- CORE TRUST / ANTI-HALLUCINATION ----------------- */}
      <section id="trust" className="py-20 bg-slate-100 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-9 h-9" />
            </div>

            <div className="space-y-3 text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                ANTI-HALLUCINATION GUARANTEE
              </div>
              <h3 className="text-2xl font-extrabold text-[#0C1E3A]">
                The Proposal Writer Cannot Invent Credentials
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Unlike generic AI that invents past projects or certifications, CivicScribe is locked by architectural policy to your verified Company Vault (<code className="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded">vault/company_profile.json</code>).
              </p>
              <p className="text-xs text-slate-600">
                If an RFP requires a credential not found in your vault, CivicScribe explicitly tags it as{" "}
                <code className="bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded text-[11px]">
                  [VENDOR ACTION REQUIRED]
                </code>{" "}
                so your team stays 100% compliant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- SUPPORTED TRADES ----------------- */}
      <section id="trades" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-12">
            <span className="text-xs font-bold tracking-wider uppercase text-blue-700">SPECIALIZED COVERAGE</span>
            <h2 className="text-3xl font-extrabold text-[#0C1E3A]">Built for Trade Contractors</h2>
            <p className="text-sm text-slate-600">
              Fine-tuned for the municipal licensing and prevailing wage rules of California service trades.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1.5">
              <span className="font-extrabold text-blue-900 text-base">C-27</span>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Landscaping & Grounds</h4>
              <p className="text-[11px] text-slate-500">Parks, medians, smart irrigation, and tree trimming.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1.5">
              <span className="font-extrabold text-emerald-900 text-base">JAN</span>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Facilities & Janitorial</h4>
              <p className="text-[11px] text-slate-500">Civic buildings, day porters, and LEED green cleaning.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1.5">
              <span className="font-extrabold text-purple-900 text-base">C-20</span>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">HVAC & Mechanical</h4>
              <p className="text-[11px] text-slate-500">Preventive maintenance, chiller service, and emergency SLAs.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1.5">
              <span className="font-extrabold text-amber-900 text-base">DIR</span>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Public Works (Class B)</h4>
              <p className="text-[11px] text-slate-500">eCPR certified payroll, prevailing wage, and public facilities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- CLEAN BOTTOM CTA ----------------- */}
      <section className="py-20 bg-[#0C1E3A] text-white text-center border-t border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Audit Your Next Municipal Bid?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Run a forensic qualification check on any public works RFP in 14 seconds.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={onLaunchApp}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-[#0C1E3A] shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Launch CivicScribe Auditor</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onLoadSampleAndLaunch}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-xs sm:text-sm bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 text-blue-300" />
              <span>Test Benchmark Parks RFP</span>
            </button>
          </div>
        </div>
      </section>

      {/* ----------------- MINIMAL FOOTER ----------------- */}
      <footer className="bg-[#081528] text-slate-400 border-t border-slate-800 py-8 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              CS
            </div>
            <span className="font-bold text-white">CivicScribe</span>
            <span className="text-slate-600">|</span>
            <span>Municipal RFP Compliance & Bid Writer for Trade Contractors</span>
          </div>

          <div className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} CivicScribe. Built with FastAPI, Next.js, and Google Antigravity SDK.
          </div>
        </div>
      </footer>
    </div>
  );
}
