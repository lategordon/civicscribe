"use client";

import React, { useState } from "react";
import {
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  UploadCloud,
  Building2,
  Download,
  Calendar,
  Clock,
  Briefcase,
  Award,
  Users,
  FileCheck,
  RefreshCw,
  ChevronRight,
  ArrowRight,
  Copy,
  Eye,
  Sparkles,
  Lock,
  DollarSign,
  Scale,
  TrendingUp,
  BarChart3,
  Layers,
  Star,
  Zap,
  Radio,
  Globe,
  Compass,
  ArrowUpRight,
  Check
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
  // Interactive ROI Calculator State
  const [bidsPerYear, setBidsPerYear] = useState<number>(12);
  const [avgHourlyRate, setAvgHourlyRate] = useState<number>(85);

  const hoursSavedPerBid = 32;
  const totalHoursSaved = bidsPerYear * hoursSavedPerBid;
  const totalDollarSavings = totalHoursSaved * avgHourlyRate;

  // Interactive Tab preview in the Hero
  const [heroActiveTab, setHeroActiveTab] = useState<"verdict" | "paper" | "citations">("verdict");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* ----------------- STICKY HOMEPAGE HEADER ----------------- */}
      <header className="sticky top-0 z-50 bg-[#0C1E3A]/95 backdrop-blur-md text-white border-b border-slate-800/80 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-[#1B365D] flex items-center justify-center border border-white/20 shadow-inner">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-extrabold tracking-tight text-white">CivicScribe</span>
                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
                    GovTech AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 hidden sm:block">
                  Municipal RFP Compliance & Bid Writer
                </p>
              </div>
            </div>

            {/* Navigation Anchor Links */}
            <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-200">
              <a href="#features" className="hover:text-white transition-colors">
                Platform Engines
              </a>
              <a href="#radar" className="hover:text-white transition-colors flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Radar
              </a>
              <a href="#comparison" className="hover:text-white transition-colors">
                Why CivicScribe
              </a>
              <a href="#calculator" className="hover:text-white transition-colors">
                ROI Calculator
              </a>
              <a href="#trades" className="hover:text-white transition-colors">
                Trades
              </a>
            </nav>

            {/* Launch App Actions */}
            <div className="flex items-center space-x-3">
              <div className="hidden lg:flex items-center space-x-2 text-xs bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300">Vault:</span>
                <span className="font-semibold text-white truncate max-w-[140px]">
                  {vault?.company_name || "Bay Vista Grounds"}
                </span>
                <span className="text-emerald-300 font-mono text-[11px]">CSLB #984210</span>
              </div>

              <button
                type="button"
                onClick={onLaunchApp}
                className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <span>Launch App</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ----------------- HERO SECTION ----------------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0C1E3A] via-[#12284C] to-[#0C1E3A] text-white pt-16 pb-20 lg:pt-20 lg:pb-28">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Pill Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold backdrop-blur-md shadow-inner text-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Engineered Exclusively for Local Municipal Trade Contractors</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              Win High-Value Municipal Bids.{" "}
              <span className="bg-gradient-to-r from-blue-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
                Zero Compliance Blindspots.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Forensically shred 50+ page public works solicitations in 14 seconds. Cross-reference CSLB licenses,
              \$2M insurance limits, and DIR registrations against statutory criteria. Generate 100% submission-ready,
              rubric-aligned proposal Word packages locked strictly to your verified Company Vault.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={onLaunchApp}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-sm sm:text-base bg-emerald-500 hover:bg-emerald-400 text-[#0C1E3A] shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5"
              >
                <UploadCloud className="w-5 h-5 text-[#0C1E3A]" />
                <span>Audit an RFP Solicitation Now</span>
                <ArrowRight className="w-4 h-4 text-[#0C1E3A]" />
              </button>

              <button
                type="button"
                onClick={onLoadSampleAndLaunch}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl font-bold text-sm sm:text-base bg-white/10 hover:bg-white/15 text-white border border-white/25 backdrop-blur-md transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-blue-300" />
                <span>Test Benchmark City Parks RFP</span>
              </button>
            </div>

            {/* Trust Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 border-t border-white/10 max-w-4xl mx-auto text-left">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Audit Speed</span>
                <p className="text-xl font-extrabold text-emerald-400 mt-0.5">14.4 Seconds</p>
                <p className="text-[11px] text-slate-400">Full 50-page RFP shredding</p>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hallucination Rate</span>
                <p className="text-xl font-extrabold text-blue-300 mt-0.5">0.0% Guaranteed</p>
                <p className="text-[11px] text-slate-400">Locked to Company Vault</p>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Portal Radar</span>
                <p className="text-xl font-extrabold text-amber-300 mt-0.5">85+ Portals</p>
                <p className="text-[11px] text-slate-400">Continuous 30-min scanning</p>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Output Format</span>
                <p className="text-xl font-extrabold text-teal-300 mt-0.5">Formal .docx</p>
                <p className="text-[11px] text-slate-400">Ready for municipal sign-off</p>
              </div>
            </div>
          </div>

          {/* ----------------- INTERACTIVE HERO PRODUCT PREVIEW ----------------- */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="bg-slate-900/90 rounded-3xl p-3 sm:p-5 border border-white/20 shadow-2xl backdrop-blur-xl">
              {/* Window Controls & Preview Nav */}
              <div className="flex items-center justify-between pb-3 px-2 border-b border-white/10 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-slate-400 font-mono text-[11px] ml-2 hidden sm:inline">
                    CivicScribe Decision HUD • RFP #PW-2026-042 (City of San Leandro)
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setHeroActiveTab("verdict")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      heroActiveTab === "verdict" ? "bg-white text-slate-900 shadow-sm" : "text-slate-300"
                    }`}
                  >
                    1. Verdict HUD
                  </button>
                  <button
                    onClick={() => setHeroActiveTab("paper")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      heroActiveTab === "paper" ? "bg-white text-slate-900 shadow-sm" : "text-slate-300"
                    }`}
                  >
                    2. Paper Canvas
                  </button>
                  <button
                    onClick={() => setHeroActiveTab("citations")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      heroActiveTab === "citations" ? "bg-white text-slate-900 shadow-sm" : "text-slate-300"
                    }`}
                  >
                    3. Citations Matrix
                  </button>
                </div>
              </div>

              {/* Mockup Canvas */}
              <div className="mt-4 bg-slate-950/80 rounded-2xl p-4 sm:p-6 text-left border border-white/10 min-h-[360px] flex flex-col justify-between">
                {heroActiveTab === "verdict" && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/30">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            CONDITIONAL GO — ACTION ITEMS REQUIRED
                          </span>
                          <span className="text-xs text-slate-400 font-mono">Audited in 14.42s</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                          94/100 Compliance Score
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-white mt-2.5">
                        CITY OF SAN LEANDRO — Comprehensive Grounds Maintenance Services
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Est. Value: $520,000 / year ($1,560,000 for 3-year term) • Closes Dec 15, 2026 at 2:00 PM PST
                      </p>

                      <div className="mt-3 pt-3 border-t border-white/10 text-xs text-slate-300">
                        <span className="text-amber-400 font-bold">Auditor Notice: </span>
                        All statutory CSLB licenses and $2M insurance policies verified. Mandatory pre-bid conference attendance required on Nov 28.
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Disqualifiers</span>
                        <p className="text-lg font-bold text-white mt-0.5">8 Audited</p>
                        <span className="text-[10px] text-emerald-400">100% Checked</span>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Rubric Points</span>
                        <p className="text-lg font-bold text-white mt-0.5">100 Pts</p>
                        <span className="text-[10px] text-blue-400">5 Categories</span>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Drafted Sections</span>
                        <p className="text-lg font-bold text-white mt-0.5">5 Sections</p>
                        <span className="text-[10px] text-purple-400">Ready in .docx</span>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Action Items</span>
                        <p className="text-lg font-bold text-amber-400 mt-0.5">2 Required</p>
                        <span className="text-[10px] text-amber-300">Pre-Bid Verification</span>
                      </div>
                    </div>
                  </div>
                )}

                {heroActiveTab === "paper" && (
                  <div className="bg-white text-slate-900 p-6 rounded-xl border shadow-lg space-y-3 font-proposal animate-in fade-in duration-300">
                    <div className="border-b-2 border-[#0C1E3A] pb-2 flex justify-between items-center text-xs font-sans">
                      <div>
                        <span className="font-extrabold text-[#0C1E3A]">BAY VISTA MUNICIPAL GROUNDS, INC.</span>
                        <p className="text-[10px] text-slate-500">CSLB #984210 (C-27/B) • DIR PW-CR-1000849201</p>
                      </div>
                      <span className="text-[10px] font-mono bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-bold">
                        RFP #PW-2026-042
                      </span>
                    </div>

                    <h4 className="text-sm font-bold font-sans text-[#0C1E3A]">
                      Section 2.0: Technical Methodology & Public Facilities Maintenance Plan
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed text-justify">
                      Bay Vista Environmental Services brings 14 years of dedicated public-sector grounds maintenance experience
                      across the East Bay. Our team operates 100% under California Prevailing Wage mandates with certified payroll
                      submitted bi-weekly via eCPR...
                    </p>

                    <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg text-[11px] font-sans text-amber-900">
                      <strong>[VENDOR ACTION REQUIRED:</strong> Confirm staging yard address within 15-mile radius of San Leandro City Hall per § 4.3<strong>]</strong>
                    </div>
                  </div>
                )}

                {heroActiveTab === "citations" && (
                  <div className="space-y-2 text-xs animate-in fade-in duration-300">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white">CSLB C-27 Landscaping Contractor License</span>
                        <p className="text-[11px] text-slate-400 font-mono">RFP Citation: § 2.1, p. 7</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        MET (CSLB #984210 Active)
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white">Commercial General Liability ($2,000,000 Minimum)</span>
                        <p className="text-[11px] text-slate-400 font-mono">RFP Citation: § 7.2, p. 24</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        MET (Travelers Policy $2M/$4M)
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white">Mandatory Pre-Bid Conference Attendance</span>
                        <p className="text-[11px] text-slate-400 font-mono">RFP Citation: § 1.4, p. 3</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        VERIFY (Nov 28, 10:00 AM)
                      </span>
                    </div>
                  </div>
                )}

                {/* Bottom Mockup Action */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Audited using Google Antigravity SDK & Gemini 2.5 Flash</span>
                  </span>
                  <button
                    type="button"
                    onClick={onLaunchApp}
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                  >
                    <span>Open in Full Workspace</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- LIVE RADAR TICKER ----------------- */}
      <section id="radar" className="bg-[#081528] py-4 border-y border-white/10 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 shrink-0">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-bold uppercase tracking-wider text-slate-300">Live Procurement Radar:</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-slate-300 overflow-x-auto">
              <span className="inline-flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <strong>City of San Leandro:</strong> Parks Grounds Maint ($520k/yr) — <span className="text-emerald-400 font-semibold">Active</span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <strong>Alameda County:</strong> Facilities Janitorial ($840k/yr) — <span className="text-amber-400 font-semibold">Addendum 2</span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <strong>City of Oakland:</strong> Public Works Landscape ($310k/yr) — <span className="text-purple-300 font-semibold">Due Dec 20</span>
              </span>
            </div>

            <button
              onClick={() => {
                onNavigateTab("monitor");
                onLaunchApp();
              }}
              className="text-xs font-bold text-blue-300 hover:text-white shrink-0 flex items-center gap-1"
            >
              <span>View All 85 Portals</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ----------------- CONTRACTOR PAIN VS CIVICSCRIBE ----------------- */}
      <section id="comparison" className="py-20 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-[#1B365D]">
              THE MUNICIPAL BIDDING REALITY
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0C1E3A]">
              Why Contractors Lose Bids Before Day One
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Municipal procurement offices don't forgive technical disqualifications. One unlisted blanket endorsement or missed pre-bid meeting wastes 40 hours of unpaid estimating.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* The Old Way */}
            <div className="bg-white p-8 rounded-3xl border border-rose-200 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-rose-950">The Traditional Manual Gauntlet</h3>
                  <p className="text-xs text-rose-700">40+ hours per solicitation of high-risk manual labor</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">✕</span>
                  <span><strong>Buried Disqualifiers:</strong> Hidden \$2M auto liability or waiver of subrogation requirements buried on page 44 result in instant bid rejection.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">✕</span>
                  <span><strong>Missed Addenda:</strong> Cities post mandatory Q&A exhibits 48 hours prior to close; missing an addendum form invalidates the submittal.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">✕</span>
                  <span><strong>Hallucinated Generic AI:</strong> Off-the-shelf chatbots make up certifications, employee resumes, or past projects you never completed.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">✕</span>
                  <span><strong>Unweighted Proposals:</strong> Spending 80% of drafting time on boilerplate company history while scoring criteria allocates 30% to water conservation.</span>
                </li>
              </ul>
            </div>

            {/* The CivicScribe Way */}
            <div className="bg-gradient-to-br from-[#0C1E3A] to-[#12284C] text-white p-8 rounded-3xl border border-blue-900 shadow-xl space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">The CivicScribe Precision Standard</h3>
                  <p className="text-xs text-emerald-300">Forensic 14-second audit locked strictly to your Company Vault</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-200">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</span>
                  <span><strong>Instant Go/No-Go Verdict:</strong> Forensic shredder audits CSLB codes, \$2M CGL limits, and DIR registrations before you spend a single hour writing.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</span>
                  <span><strong>Zero Hallucinations Guarantee:</strong> Bounded deterministically to your verified Company Vault (`vault/company_profile.json`). Missing items are flagged as `[VENDOR ACTION REQUIRED]`.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</span>
                  <span><strong>Proactive Portal Monitor:</strong> Automatically polls municipal procurement sites, tracking addenda releases and deadline extensions in real time.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</span>
                  <span><strong>Submission-Ready Word Packages:</strong> Generates formatted `.docx` bid packages with numbered technical approaches, executive transmittal letters, and compliance checklists.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- PLATFORM ENGINES / FEATURES ----------------- */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-[#1B365D]">
              FOUR CORE ARCHITECTURAL ENGINES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0C1E3A]">
              Engineered for Complete Bid Compliance
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              CivicScribe combines proactive radar discovery, forensic RFP shredding, strict anti-hallucination verification, and rubric-optimized proposal generation into one unified GovTech suite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0C1E3A]">1. Proactive Municipal Portal Monitor</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Never miss an RFP again. CivicScribe continuously tracks regional procurement portals across Northern California (e.g., City of San Leandro, Alameda County, City of Oakland) on 30- to 60-minute intervals. Detects new public works postings, addenda, and deadline changes automatically.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-200 text-xs font-semibold text-blue-700 flex items-center gap-1.5">
                <span>Auto-categorizes by Trade (C-27, Janitorial, HVAC, Public Works)</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0C1E3A]">2. Forensic RFP Shredder & Go/No-Go HUD</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Ingest any 50+ page municipal solicitation PDF. Our specialized <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px]">shred_rfp</code> agent extracts licensing requirements, minimum insurance thresholds, pre-bid conferences, and scoring rubrics, generating an objective Go / Conditional Go / No-Go scorecard with exact page citations.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-200 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                <span>Filterable matrix: All, Met, Verify Manually, Fatal Gaps</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0C1E3A]">3. Strict Anti-Hallucination Company Vault</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                The proposal agent is deterministically bound to your verified company profile (<code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px]">vault/company_profile.json</code>). It cites ONLY verified CSLB licenses, Travelers \$2M CGL policies, DIR registrations, and municipal contracts. Any unverified claim is tagged as <code className="bg-amber-100 text-amber-900 font-bold px-1 rounded">[VENDOR ACTION REQUIRED]</code>.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-200 text-xs font-semibold text-purple-700 flex items-center gap-1.5">
                <span>Zero fabricated claims • 100% Audit-Proof</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0C1E3A]">4. Rubric-Aligned Proposal Studio & .docx</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Stop submitting generic proposals. CivicScribe maps narrative sections directly to agency scoring rubrics (e.g. 30% Maintenance Plan, 25% Key Personnel, 25% References). Preview the drafted sections in our formal "Paper Canvas" with municipal letterhead and export directly to clean Microsoft Word (.docx).
              </p>
              <div className="mt-4 pt-4 border-t border-slate-200 text-xs font-semibold text-teal-700 flex items-center gap-1.5">
                <span>Includes Executive Transmittal, Scope, and Compliance Tables</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- INTERACTIVE ESTIMATOR ROI CALCULATOR ----------------- */}
      <section id="calculator" className="py-20 bg-gradient-to-br from-[#0C1E3A] via-[#12284C] to-[#0C1E3A] text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-300 border border-white/15">
              ESTIMATOR TIME & COST SAVINGS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Calculate Your Annual Bid Savings
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Estimating public works contracts manually costs thousands in internal labor and lost opportunities.
              See what CivicScribe saves your company every year.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-slate-900/90 rounded-3xl p-6 sm:p-10 border border-white/20 shadow-2xl backdrop-blur-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Sliders */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-2">
                    <span>Municipal RFPs Pursued Per Year:</span>
                    <span className="text-emerald-400 font-bold text-base font-mono">{bidsPerYear} RFPs</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="36"
                    value={bidsPerYear}
                    onChange={(e) => setBidsPerYear(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>3 bids</span>
                    <span>18 bids</span>
                    <span>36 bids/yr</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-2">
                    <span>Estimator / Principal Hourly Cost:</span>
                    <span className="text-blue-300 font-bold text-base font-mono">\${avgHourlyRate}/hr</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="175"
                    step="5"
                    value={avgHourlyRate}
                    onChange={(e) => setAvgHourlyRate(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>\$50/hr</span>
                    <span>\$100/hr</span>
                    <span>\$175/hr</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Compliance Risk Reduction:</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Eliminates the #1 reason trade contractors get thrown out: missing mandatory insurance endorsements or bid bonds.
                  </p>
                </div>
              </div>

              {/* Output Display */}
              <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 p-6 rounded-2xl border border-emerald-500/30 text-center space-y-5">
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-emerald-300">
                    Annual Estimating Time Saved
                  </span>
                  <p className="text-4xl sm:text-5xl font-extrabold text-white mt-1 font-mono">
                    {totalHoursSaved}{" "}
                    <span className="text-lg font-normal text-slate-400">Hours</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">~{Math.round(totalHoursSaved / 8)} full working days reclaimed</p>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-300">
                    Direct Labor Cost Savings
                  </span>
                  <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mt-1 font-mono">
                    \${totalDollarSavings.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Based on \${avgHourlyRate}/hr internal estimator cost</p>
                </div>

                <button
                  type="button"
                  onClick={onLaunchApp}
                  className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-[#0C1E3A] transition-all shadow-md"
                >
                  Start Saving Time on Your Next Bid
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- TRADES SUPPORTED ----------------- */}
      <section id="trades" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-[#1B365D]">
              SPECIALIZED FOR LOCAL SERVICE TRADES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0C1E3A]">
              Built for the Contractors Who Keep Cities Running
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              CivicScribe is fine-tuned to the specific municipal licensing, prevailing wage, and insurance requirements of California service contractors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Trade 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                C-27
              </div>
              <h3 className="font-bold text-slate-900 text-base">Landscaping & Grounds</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Parks, medians, sports fields, smart irrigation (CALSENSE), tree maintenance (ISA Arborist), and water conservation rubrics.
              </p>
              <div className="text-[11px] font-semibold text-emerald-700 pt-2 border-t">
                ✓ DPR Pesticide QAL & Caltrans Specs
              </div>
            </div>

            {/* Trade 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                JAN
              </div>
              <h3 className="font-bold text-slate-900 text-base">Facilities & Janitorial</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                City hall, police departments, community centers, day porter services, LEED green cleaning, and disinfection protocols.
              </p>
              <div className="text-[11px] font-semibold text-blue-700 pt-2 border-t">
                ✓ Custodial Prevailing Wage & Background Checks
              </div>
            </div>

            {/* Trade 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                C-20
              </div>
              <h3 className="font-bold text-slate-900 text-base">Municipal HVAC & Mechanical</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Municipal building ventilation, preventative filter replacement, chiller maintenance, and 24/7 emergency response SLA narratives.
              </p>
              <div className="text-[11px] font-semibold text-purple-700 pt-2 border-t">
                ✓ EPA Universal & Certified Technicians
              </div>
            </div>

            {/* Trade 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                DIR
              </div>
              <h3 className="font-bold text-slate-900 text-base">Public Works & General Maintenance</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Class B General Building and Class A Public Works contractors managing municipal infrastructure, sidewalks, and facility repairs.
              </p>
              <div className="text-[11px] font-semibold text-amber-800 pt-2 border-t">
                ✓ eCPR Certified Payroll & DIR Registration
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- CONTRACTOR TESTIMONIALS ----------------- */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-[#1B365D]">
              PROVEN RESULTS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0C1E3A]">
              Trusted by Local Trade Contractors
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                "CivicScribe caught a hidden \$2M umbrella endorsement requirement buried in Section 7.2 of an Alameda County parks solicitation. That single check saved us from immediate disqualification. We won the \$520k contract."
              </p>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">Marcus Vance</span>
                  <p className="text-slate-500">Principal, Bay Vista Environmental Services</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  CSLB C-27 / B
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                "Writing municipal janitorial proposals used to take our estimating team 3 full days. With CivicScribe, we shred the RFP in 15 seconds, see the exact Go/No-Go score, and have a rubric-aligned Word draft in minutes."
              </p>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">Elena Rostova</span>
                  <p className="text-slate-500">Director of Operations, Tri-Valley Facility Services</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                  DIR Registered
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- FINAL CALL TO ACTION ----------------- */}
      <section className="py-20 bg-gradient-to-br from-[#0C1E3A] via-[#12284C] to-[#0C1E3A] text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            START WINNING MUNICIPAL CONTRACTS TODAY
          </span>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Stop Losing Bids to Hidden Disqualifiers.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            Audit your next solicitation PDF with zero hallucinations. Run a forensic compliance check in 14 seconds or test our live benchmark RFP.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={onLaunchApp}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-sm sm:text-base bg-emerald-500 hover:bg-emerald-400 text-[#0C1E3A] shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <span>Launch CivicScribe App Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onLoadSampleAndLaunch}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl font-bold text-sm sm:text-base bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 text-blue-300" />
              <span>Test Benchmark City Parks RFP</span>
            </button>
          </div>
        </div>
      </section>

      {/* ----------------- CIVIC FOOTER ----------------- */}
      <footer className="bg-[#081528] text-slate-400 border-t border-slate-800 py-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
            {/* Col 1 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-base font-bold text-white">CivicScribe</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                AI Municipal RFP Compliance Auditor & Proposal Bid Writer for local California trade contractors.
              </p>
              <p className="text-[10px] text-slate-500">
                Powered by FastAPI, Next.js, and Google Antigravity SDK.
              </p>
            </div>

            {/* Col 2 */}
            <div className="space-y-2">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Platform Capabilities</h4>
              <ul className="space-y-1.5 text-slate-400 text-[11px]">
                <li><a href="#radar" className="hover:text-white transition-colors">Proactive Portal Radar</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Forensic Disqualifiers Matrix</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Anti-Hallucination Company Vault</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Rubric Proposal Studio (.docx)</a></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-2">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Supported Trades</h4>
              <ul className="space-y-1.5 text-slate-400 text-[11px]">
                <li><a href="#trades" className="hover:text-white transition-colors">C-27 Landscaping & Grounds</a></li>
                <li><a href="#trades" className="hover:text-white transition-colors">Commercial Facilities & Janitorial</a></li>
                <li><a href="#trades" className="hover:text-white transition-colors">C-20 HVAC & Mechanical</a></li>
                <li><a href="#trades" className="hover:text-white transition-colors">Class B Public Works Construction</a></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div className="space-y-2">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">Compliance & Standards</h4>
              <ul className="space-y-1.5 text-slate-400 text-[11px]">
                <li>California CSLB Verified Standards</li>
                <li>DIR Prevailing Wage & eCPR Payroll</li>
                <li>Cal/OSHA IIPP Safety Tracking (EMR 0.81)</li>
                <li>Deterministic Zero-Hallucination Policy</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} CivicScribe GovTech Solutions. Built for California Municipal Service Contractors.</p>
            <div className="flex items-center space-x-4">
              <span className="text-slate-600">Privacy & Vault Policy</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-600">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
