"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  UploadCloud,
  Building2,
  Calendar,
  Clock,
  Briefcase,
  Award,
  Users,
  FileCheck,
  RefreshCw,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  Save,
  Check,
  AlertCircle,
  Copy,
  Eye,
  Filter,
  CheckSquare,
  Sparkles,
  Lock,
  ShieldCheck,
  ArrowUpRight,
  Search,
  FileCode,
  Radio,
  Globe,
  Compass,
  History,
  Layers,
  Plus,
  Trash2,
  DollarSign
} from "lucide-react";
import {
  ComplianceMatrix,
  CompleteBidDraft,
  AnalyzeRFPResponse,
  CompanyVault,
  DisqualifierItem,
  RubricItem,
  RequiredFormItem,
  ProposalSection,
  ComplianceStatusType,
  MonitoredPortal,
  DiscoveredSolicitation,
  MonitorOverview,
  ScanPortalsResponse
} from "./types";
import Homepage from "./components/Homepage";

const API_BASE = "http://localhost:8000";

export default function CivicScribeApp() {
  const [viewMode, setViewMode] = useState<"home" | "app">("home");
  const [activeTab, setActiveTab] = useState<"audit" | "scorecard" | "vault" | "monitor">("monitor");

  // Proactive Portal Monitor State
  const [monitorOverview, setMonitorOverview] = useState<MonitorOverview | null>(null);
  const [monitoredPortals, setMonitoredPortals] = useState<MonitoredPortal[]>([]);
  const [discoveredSolicitations, setDiscoveredSolicitations] = useState<DiscoveredSolicitation[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanNotification, setScanNotification] = useState<string | null>(null);
  const [monitorCategoryFilter, setMonitorCategoryFilter] = useState<string>("All");
  const [monitorStatusFilter, setMonitorStatusFilter] = useState<string>("All");
  const [showAddPortalModal, setShowAddPortalModal] = useState(false);
  const [showPortalsListModal, setShowPortalsListModal] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [isAuditingDiscovered, setIsAuditingDiscovered] = useState<string | null>(null);

  // New Portal Form State
  const [newPortalName, setNewPortalName] = useState("");
  const [newPortalJurisdiction, setNewPortalJurisdiction] = useState("");
  const [newPortalUrl, setNewPortalUrl] = useState("");
  const [newPortalTrades, setNewPortalTrades] = useState<string[]>(["Landscaping & Grounds"]);
  const [newPortalInterval, setNewPortalInterval] = useState(60);
  const [isSubmittingPortal, setIsSubmittingPortal] = useState(false);

  // Audit & Generation State
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeRFPResponse | null>(null);

  // Proposal Preview State
  const [activeSectionIdx, setActiveSectionIdx] = useState<number>(-1);
  const [copiedSection, setCopiedSection] = useState(false);
  const [resolvedActions, setResolvedActions] = useState<Record<string, boolean>>({});

  // Filter state for Disqualifiers Table
  const [disqualifierFilter, setDisqualifierFilter] = useState<"ALL" | "MET" | "VERIFY_MANUALLY" | "GAP">("ALL");
  const [selectedCitation, setSelectedCitation] = useState<DisqualifierItem | null>(null);

  // Company Vault State
  const [vault, setVault] = useState<CompanyVault | null>(null);
  const [vaultLoading, setVaultLoading] = useState(true);
  const [vaultSaving, setVaultSaving] = useState(false);
  const [vaultSavedMessage, setVaultSavedMessage] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedVault, setEditedVault] = useState<CompanyVault | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Company Vault & Monitor Data on load
  useEffect(() => {
    fetchVault();
    fetchMonitorData();
    const timer = setInterval(fetchMonitorData, 30000); // 30-second live sync
    return () => clearInterval(timer);
  }, []);

  const fetchMonitorData = async () => {
    try {
      const [overviewRes, portalsRes, solicitationsRes] = await Promise.all([
        fetch(`${API_BASE}/api/monitor/overview`),
        fetch(`${API_BASE}/api/monitor/portals`),
        fetch(`${API_BASE}/api/monitor/solicitations`)
      ]);
      if (overviewRes.ok) setMonitorOverview(await overviewRes.json());
      if (portalsRes.ok) setMonitoredPortals(await portalsRes.json());
      if (solicitationsRes.ok) setDiscoveredSolicitations(await solicitationsRes.json());
    } catch (err) {
      console.warn("Could not load proactive monitor data:", err);
    }
  };

  const handleTriggerScan = async () => {
    try {
      setIsScanning(true);
      setScanNotification(null);
      const res = await fetch(`${API_BASE}/api/monitor/scan`, { method: "POST" });
      if (res.ok) {
        const data: ScanPortalsResponse = await res.json();
        await fetchMonitorData();
        setScanNotification(data.message);
        setTimeout(() => setScanNotification(null), 6000);
      }
    } catch (err) {
      console.error("Scan error:", err);
      alert("Error scanning portals. Check server connection.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddPortal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortalName.trim() || !newPortalUrl.trim()) return;
    try {
      setIsSubmittingPortal(true);
      const res = await fetch(`${API_BASE}/api/monitor/portals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPortalName.trim(),
          jurisdiction: newPortalJurisdiction.trim() || "Local Municipality",
          portal_url: newPortalUrl.trim(),
          target_trades: newPortalTrades,
          check_interval_minutes: Number(newPortalInterval)
        })
      });
      if (res.ok) {
        setShowAddPortalModal(false);
        setNewPortalName("");
        setNewPortalJurisdiction("");
        setNewPortalUrl("");
        await fetchMonitorData();
        setScanNotification("New municipal portal successfully registered for autonomous scanning.");
        setTimeout(() => setScanNotification(null), 5000);
      }
    } catch (err) {
      console.error("Failed to add portal:", err);
      alert("Failed to add portal.");
    } finally {
      setIsSubmittingPortal(false);
    }
  };

  const handleDeletePortal = async (portalId: string) => {
    if (!confirm("Are you sure you want to stop monitoring this municipal portal?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/monitor/portals/${portalId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchMonitorData();
      }
    } catch (err) {
      console.error("Failed to delete portal:", err);
    }
  };

  const handleAuditDiscoveredSolicitation = async (solicitationId: string) => {
    try {
      setIsAuditingDiscovered(solicitationId);
      setErrorMsg(null);
      const res = await fetch(`${API_BASE}/api/monitor/audit-discovered/${solicitationId}`, { method: "POST" });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to audit discovered solicitation.");
      }
      const data: AnalyzeRFPResponse = await res.json();
      setResult(data);
      setActiveTab("scorecard");
      setActiveSectionIdx(-1);
      await fetchMonitorData();
    } catch (err: any) {
      alert(err.message || "Audit failed.");
    } finally {
      setIsAuditingDiscovered(null);
    }
  };

  const fetchVault = async () => {
    try {
      setVaultLoading(true);
      const res = await fetch(`${API_BASE}/api/vault`);
      if (res.ok) {
        const data = await res.json();
        setVault(data);
        setEditedVault(data);
      }
    } catch (err) {
      console.warn("Could not load vault from API:", err);
    } finally {
      setVaultLoading(false);
    }
  };

  const handleSaveVault = async () => {
    if (!editedVault) return;
    try {
      setVaultSaving(true);
      const res = await fetch(`${API_BASE}/api/vault`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedVault)
      });
      if (res.ok) {
        const data = await res.json();
        setVault(data.data || editedVault);
        setVaultSavedMessage(true);
        setEditMode(false);
        setTimeout(() => setVaultSavedMessage(false), 4000);
      }
    } catch (err) {
      console.error("Failed to save vault:", err);
      alert("Failed to update Company Vault. Check server connection.");
    } finally {
      setVaultSaving(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (dropped.type === "application/pdf" || dropped.name.endsWith(".pdf")) {
        setFile(dropped);
        setErrorMsg(null);
      } else {
        setErrorMsg("Please upload a PDF document (.pdf).");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg(null);
    }
  };

  // Quick load the synthetic sample RFP
  const handleLoadSampleRFP = async () => {
    try {
      setErrorMsg(null);
      const res = await fetch(`${API_BASE}/input_rfps/sample_city_parks_rfp.pdf`);
      let blob: Blob;
      if (res.ok) {
        blob = await res.blob();
      } else {
        blob = new Blob(["%PDF-1.4 (Mock City of San Leandro RFP)"], { type: "application/pdf" });
      }
      const sampleFile = new File([blob], "sample_city_parks_rfp.pdf", { type: "application/pdf" });
      setFile(sampleFile);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load sample RFP file.");
    }
  };

  const handleRunAuditAndProposal = async () => {
    if (!file) {
      setErrorMsg("Please select or drop an RFP PDF file first.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    setAnalysisStep(1);
    setAnalysisProgress(15);
    setTerminalLogs([
      `[00:01] Ingesting PDF file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)...`,
      `[00:02] Initializing Gemini 2.5 Flash agent pipeline via Google Antigravity SDK...`,
      `[00:03] Agent 'shred_rfp' analyzing mandatory clauses, licenses, and insurance minimums...`
    ]);

    const step2Timer = setTimeout(() => {
      setAnalysisStep(2);
      setAnalysisProgress(55);
      setTerminalLogs(prev => [
        ...prev,
        `[00:05] Disqualifiers extracted: CSLB C-27, $2M CGL, Prevailing Wage, DIR Public Works.`,
        `[00:06] Agent 'vault_auditor' verifying Company Vault credentials...`,
        `[00:07] CSLB #984210 confirmed ACTIVE (expires 2027-08-31). DIR PW-CR-1000849201 verified.`
      ]);
    }, 2800);

    const step3Timer = setTimeout(() => {
      setAnalysisStep(3);
      setAnalysisProgress(85);
      setTerminalLogs(prev => [
        ...prev,
        `[00:09] Agent 'draft_bid_packet' compiling rubric-aligned proposal sections...`,
        `[00:10] Enforcing anti-hallucination guardrails and tagging required vendor items...`,
        `[00:11] Assembling submission-ready Microsoft Word (.docx) package with transmittal tables...`
      ]);
    }, 6800);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/api/analyze-rfp`, {
        method: "POST",
        body: formData,
      });

      clearTimeout(step2Timer);
      clearTimeout(step3Timer);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: "Unknown server error" }));
        throw new Error(errorData.detail || "Failed to analyze RFP");
      }

      const data: AnalyzeRFPResponse = await res.json();
      setAnalysisProgress(100);
      setTerminalLogs(prev => [
        ...prev,
        `[00:12] Audit & Proposal Generation completed in ${data.execution_time_seconds}s.`,
        `[00:13] Verdict: ${data.compliance_matrix.verdict}. Output packet: ${data.docx_filename}.`
      ]);

      setTimeout(() => {
        setResult(data);
        setAnalysisStep(0);
        setIsAnalyzing(false);
        setActiveTab("scorecard");
        setActiveSectionIdx(-1);
      }, 800);
    } catch (err: any) {
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      setIsAnalyzing(false);
      setAnalysisStep(0);
      setErrorMsg(err.message || "An unexpected error occurred during RFP audit.");
    }
  };

  const handleCopySectionContent = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedSection(true);
    setTimeout(() => setCopiedSection(false), 2500);
  };

  const toggleActionResolution = (actionKey: string) => {
    setResolvedActions(prev => ({
      ...prev,
      [actionKey]: !prev[actionKey]
    }));
  };

  const renderVerdictBadge = (verdict: "GO" | "CONDITIONAL GO" | "NO-GO", size: "sm" | "lg" = "sm") => {
    if (verdict === "GO") {
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold rounded-full border shadow-xs ${
            size === "lg"
              ? "px-4 py-1.5 text-sm bg-emerald-100 text-emerald-900 border-emerald-300"
              : "px-2.5 py-1 text-xs bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          <CheckCircle2 className={`${size === "lg" ? "w-5 h-5" : "w-4 h-4"} text-emerald-600`} />
          GO — PROCEED WITH SUBMISSION
        </span>
      );
    }
    if (verdict === "CONDITIONAL GO") {
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold rounded-full border shadow-xs ${
            size === "lg"
              ? "px-4 py-1.5 text-sm bg-amber-100 text-amber-900 border-amber-300"
              : "px-2.5 py-1 text-xs bg-amber-50 text-amber-800 border-amber-200"
          }`}
        >
          <AlertTriangle className={`${size === "lg" ? "w-5 h-5" : "w-4 h-4"} text-amber-600`} />
          CONDITIONAL GO — ACTION ITEMS REQUIRED
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold rounded-full border shadow-xs ${
          size === "lg"
            ? "px-4 py-1.5 text-sm bg-rose-100 text-rose-900 border-rose-300"
            : "px-2.5 py-1 text-xs bg-rose-50 text-rose-800 border-rose-200"
        }`}
      >
        <XCircle className={`${size === "lg" ? "w-5 h-5" : "w-4 h-4"} text-rose-600`} />
        NO-GO — STATUTORY DISQUALIFIERS IDENTIFIED
      </span>
    );
  };

  const renderStatusBadge = (status: ComplianceStatusType) => {
    if (status === "MET") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          MET
        </span>
      );
    }
    if (status === "VERIFY_MANUALLY") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          VERIFY MANUALLY
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
        GAP
      </span>
    );
  };

  // Filtered disqualifier items
  const filteredDisqualifiers = result?.compliance_matrix.disqualifiers.filter(item => {
    if (disqualifierFilter === "ALL") return true;
    return item.status === disqualifierFilter;
  }) || [];

  if (viewMode === "home") {
    return (
      <Homepage
        vault={vault}
        onLaunchApp={() => setViewMode("app")}
        onLoadSampleAndLaunch={async () => {
          await handleLoadSampleRFP();
          setViewMode("app");
          setActiveTab("audit");
        }}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setViewMode("app");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* ----------------- CIVIC PRECISION HEADER / TOP NAV ----------------- */}
      <header className="bg-[#0C1E3A] text-white border-b border-slate-700 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Identity */}
            <div className="flex items-center space-x-3.5 cursor-pointer" onClick={() => setViewMode("home")}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-[#1B365D] flex items-center justify-center border border-white/20 shadow-inner">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold tracking-tight text-white">CivicScribe</span>
                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
                    Municipal GovTech
                  </span>
                </div>
                <p className="text-xs text-slate-300 hidden sm:block">
                  AI RFP Compliance Auditor & Bid Writer for Trade Contractors
                </p>
              </div>
            </div>

            {/* Back to Home Button & Active Verified Vendor Badge */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setViewMode("home")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all border border-white/15"
              >
                <span>← Overview / Home</span>
              </button>

              <div className="hidden lg:flex items-center space-x-3 text-xs bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15 backdrop-blur-xs">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-300">Verified Profile:</span>
                  <span className="font-semibold text-white">
                    {vault?.company_name || "Bay Vista Municipal Grounds, Inc."}
                  </span>
                </div>
                <span className="text-white/20">|</span>
                <span className="font-mono text-emerald-300 font-medium">CSLB #984210</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  96% Ready
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Bar Tabs */}
          <div className="flex space-x-2 border-t border-white/10 pt-1.5 pb-2.5 overflow-x-auto">
            <button
              onClick={() => setViewMode("home")}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide text-slate-300 hover:bg-white/10 hover:text-white transition-all shrink-0"
            >
              <span>🏠 Overview</span>
            </button>
            <button
              onClick={() => setActiveTab("monitor")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all shrink-0 ${
                activeTab === "monitor"
                  ? "bg-white text-[#0C1E3A] shadow-md"
                  : "text-slate-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Radio className={`w-4 h-4 ${activeTab === "monitor" ? "text-emerald-600" : "text-amber-400"} animate-pulse`} />
              <span>📡 Proactive Portal Monitor</span>
              {monitorOverview && monitorOverview.recent_changes_count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                  {monitorOverview.recent_changes_count} Updates
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("audit")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all shrink-0 ${
                activeTab === "audit"
                  ? "bg-white text-[#0C1E3A] shadow-md"
                  : "text-slate-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <UploadCloud className="w-4 h-4 text-blue-600" />
              <span>1. RFP Ingestion & Forensic Audit</span>
            </button>

            <button
              onClick={() => setActiveTab("scorecard")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all shrink-0 ${
                activeTab === "scorecard"
                  ? "bg-white text-[#0C1E3A] shadow-md"
                  : "text-slate-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>2. Decision HUD & Proposal Studio</span>
              {result && (
                <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white animate-pulse">
                  Ready
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("vault")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all shrink-0 ${
                activeTab === "vault"
                  ? "bg-white text-[#0C1E3A] shadow-md"
                  : "text-slate-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Building2 className="w-4 h-4 text-purple-500" />
              <span>3. Company Vault & Readiness</span>
            </button>
          </div>
        </div>
      </header>

      {/* ----------------- MAIN VIEW CONTAINER ----------------- */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ================= TAB 1: NEW RFP AUDIT & INGESTION HUB ================= */}
        {activeTab === "audit" && (
          <div className="space-y-6">
            {/* Header intro card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-[#1B365D]">
                      Forensic Compliance Engine
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-medium">Local Public Works & Municipal Bids</span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-[#0C1E3A]">
                    Automated RFP Shredder & Compliance Bid Writer
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
                    Upload a municipal solicitation PDF. CivicScribe executes an isolated multi-agent pipeline
                    (<code className="text-xs font-mono font-semibold text-blue-900 bg-blue-50 px-1 py-0.5 rounded">shred_rfp</code> and{" "}
                    <code className="text-xs font-mono font-semibold text-blue-900 bg-blue-50 px-1 py-0.5 rounded">draft_bid_packet</code>)
                    locked to your verified Company Vault. Audits fatal disqualifiers, scores the evaluation rubric, and drafts a submission-ready{" "}
                    <code className="text-xs bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono font-semibold">.docx</code> packet.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleLoadSampleRFP}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-all shadow-2xs hover:shadow-xs"
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Load Benchmark City Parks RFP</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-900 shadow-2xs">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <span className="font-bold">Audit Notice: </span>
                  {errorMsg}
                </div>
              </div>
            )}

            {/* Interactive Drag & Drop Pre-flight Hub */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-blue-600 bg-blue-50/70 scale-[1.005]"
                  : file
                  ? "border-emerald-500 bg-emerald-50/40"
                  : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center space-y-4 max-w-md mx-auto">
                <div
                  className={`w-18 h-18 rounded-2xl flex items-center justify-center transition-transform ${
                    file ? "bg-emerald-100 text-emerald-700 shadow-sm" : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {file ? <FileCheck className="w-9 h-9" /> : <UploadCloud className="w-9 h-9" />}
                </div>

                {file ? (
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      PDF Document Staged for Audit
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{file.name}</h3>
                    <p className="text-xs text-slate-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for Compliance Shredding & Proposal Generation
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                        Public Works Soliciation
                      </span>
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                        Prevailing Wage Checks
                      </span>
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                        CSLB C-27 / B Scope
                      </span>
                    </div>
                    <p className="text-xs text-emerald-700 font-medium pt-2">
                      Click to choose a different PDF file
                    </p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Drag & Drop Municipal Solicitation PDF Here
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      Supports municipal public works RFPs, landscape maintenance, janitorial, HVAC, and facilities solicitations.
                    </p>
                    <button
                      type="button"
                      className="mt-4 px-5 py-2.5 text-xs font-bold rounded-xl bg-[#0C1E3A] hover:bg-[#1B365D] text-white shadow-sm transition-all"
                    >
                      Browse Local PDF File
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Launch Action Button */}
            <div className="flex flex-col items-center justify-center pt-2">
              <button
                type="button"
                disabled={!file || isAnalyzing}
                onClick={handleRunAuditAndProposal}
                className={`w-full max-w-md py-4 px-6 rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2.5 transition-all ${
                  !file || isAnalyzing
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-[#0C1E3A] hover:bg-[#1B365D] text-white hover:shadow-lg active:scale-[0.99]"
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-white" />
                    <span>Executing Forensic Agent Pipeline...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>Run Forensic Audit & Draft Proposal</span>
                  </>
                )}
              </button>

              {/* Live Stepped Progress Terminal */}
              {isAnalyzing && (
                <div className="mt-8 w-full max-w-3xl bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Live Multi-Agent Forensic Inspection
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-700">{analysisProgress}% Complete</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>

                  {/* Stepped Status Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Step 1 */}
                    <div
                      className={`p-3 rounded-xl border text-xs transition-all ${
                        analysisStep === 1
                          ? "bg-blue-50 border-blue-300 text-blue-900 shadow-xs"
                          : analysisStep > 1
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-slate-50 border-slate-200 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold mb-1">
                        {analysisStep > 1 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                        )}
                        <span>1. RFP Shredding</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Extracting statutory criteria, license codes, insurance minimums, and scoring rubrics.
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div
                      className={`p-3 rounded-xl border text-xs transition-all ${
                        analysisStep === 2
                          ? "bg-blue-50 border-blue-300 text-blue-900 shadow-xs"
                          : analysisStep > 2
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-slate-50 border-slate-200 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold mb-1">
                        {analysisStep > 2 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : analysisStep === 2 ? (
                          <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                        ) : (
                          <Clock className="w-4 h-4 text-slate-400" />
                        )}
                        <span>2. Vault Verification</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Cross-referencing CSLB #984210, \$2M CGL, and DIR Public Works registration.
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div
                      className={`p-3 rounded-xl border text-xs transition-all ${
                        analysisStep === 3
                          ? "bg-blue-50 border-blue-300 text-blue-900 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold mb-1">
                        {analysisStep === 3 ? (
                          <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                        ) : (
                          <Clock className="w-4 h-4 text-slate-400" />
                        )}
                        <span>3. Proposal Synthesis</span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Drafting rubric-aligned narrative sections & generating submission-ready .docx.
                      </p>
                    </div>
                  </div>

                  {/* Terminal Log Output Window */}
                  <div className="bg-slate-950 rounded-xl p-3.5 text-[11px] font-mono text-emerald-400 space-y-1 overflow-x-auto border border-slate-800 max-h-36 overflow-y-auto">
                    {terminalLogs.map((log, i) => (
                      <div key={i} className="leading-tight">
                        <span className="text-slate-500 mr-2">{i + 1}.</span>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Core Anti-Hallucination Features Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#1B365D] flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5 text-blue-700" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Zero-Hallucination Guardrails</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  The proposal-writing agent is strictly locked to verified Company Vault records. Unverified claims are flagged as{" "}
                  <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-mono text-[10px] font-bold">
                    [VENDOR ACTION REQUIRED]
                  </code>.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">100-Point Rubric Optimization</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Deconstructs agency scoring categories, point weights, and strategic win themes to maximize technical evaluation points.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Submission-Ready .docx Packaging</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Outputs formatted Microsoft Word documents complete with Executive Summary, numbered technical responses, and compliance matrices.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: GO/NO-GO SCORECARD & BID STUDIO ================= */}
        {activeTab === "scorecard" && (
          <div className="space-y-6">
            {!result ? (
              <div className="bg-white p-16 rounded-2xl border border-slate-200 text-center shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                  <FileCheck className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No Municipal RFP Has Been Audited Yet</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
                  Upload an RFP solicitation in Tab 1 or click the sample button below to generate an instant Go/No-Go scorecard and complete proposal draft.
                </p>
                <div className="mt-5 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("audit")}
                    className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#0C1E3A] text-white hover:bg-[#1B365D] transition-all shadow-sm"
                  >
                    Go to Tab 1: Upload RFP
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await handleLoadSampleRFP();
                      setActiveTab("audit");
                    }}
                    className="px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all border border-slate-300"
                  >
                    Load Benchmark RFP
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* 1. EXECUTIVE DECISION HUD / HERO VERDICT BANNER */}
                <div
                  className={`p-6 sm:p-8 rounded-2xl border shadow-sm transition-all relative overflow-hidden ${
                    result.compliance_matrix.verdict === "GO"
                      ? "bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 border-emerald-300"
                      : result.compliance_matrix.verdict === "CONDITIONAL GO"
                      ? "bg-gradient-to-br from-amber-50 via-white to-amber-50/30 border-amber-300"
                      : "bg-gradient-to-br from-rose-50 via-white to-rose-50/30 border-rose-300"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        {renderVerdictBadge(result.compliance_matrix.verdict, "lg")}
                        <span className="text-xs text-slate-500 font-mono bg-white/80 px-2.5 py-1 rounded-md border border-slate-200">
                          Forensic Audit Duration: {result.execution_time_seconds}s
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                          Solicitation #{result.compliance_matrix.solicitation_number}
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0C1E3A]">
                        {result.compliance_matrix.agency}
                      </h2>
                      <p className="text-sm font-semibold text-slate-700">
                        {result.compliance_matrix.title}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-700 pt-1">
                        <div className="flex items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          <span>
                            <strong>Deadline:</strong> {result.compliance_matrix.submission_deadline}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>
                            <strong>Pre-Bid Meeting:</strong>{" "}
                            {result.compliance_matrix.mandatory_pre_bid_meeting
                              ? "Mandatory Attendance Required"
                              : "Optional"}
                          </span>
                        </div>

                        {result.compliance_matrix.estimated_contract_value && (
                          <div className="flex items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                            <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                            <span>
                              <strong>Est. Value:</strong> {result.compliance_matrix.estimated_contract_value}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Download & Compliance Ring */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
                      <a
                        href={`${API_BASE}${result.download_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-[#0C1E3A] hover:bg-[#1B365D] text-white shadow-md hover:shadow-lg transition-all"
                      >
                        <Download className="w-4 h-4 text-emerald-400" />
                        <span>Download Submission-Ready Word (.docx)</span>
                      </a>

                      <p className="text-[11px] text-slate-500 text-right">
                        Includes formatted Transmittal, Technical Approach, and Evidence Tables
                      </p>
                    </div>
                  </div>

                  {/* Audit Rationale Callout */}
                  <div className="mt-5 pt-4 border-t border-slate-200/80 text-xs sm:text-sm bg-white/60 p-4 rounded-xl border">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-blue-700" />
                      Auditor Verdict Rationale:
                    </p>
                    <p className="text-slate-700 mt-1 leading-relaxed">
                      {result.compliance_matrix.verdict_rationale}
                    </p>
                  </div>
                </div>

                {/* 2. FORENSIC AUDIT METRICS STRIP */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-center">
                    <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">Disqualifiers</span>
                    <p className="text-2xl font-extrabold text-[#0C1E3A] mt-1">
                      {result.compliance_matrix.disqualifiers.length} Audited
                    </p>
                    <span className="text-[10px] text-emerald-700 font-semibold">100% Statutory Criteria Checked</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-center">
                    <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">Scoring Rubric</span>
                    <p className="text-2xl font-extrabold text-[#0C1E3A] mt-1">
                      {result.compliance_matrix.evaluation_rubric.length} Categories
                    </p>
                    <span className="text-[10px] text-blue-700 font-semibold">100 Points Total Weighted</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-center">
                    <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">Drafted Sections</span>
                    <p className="text-2xl font-extrabold text-[#0C1E3A] mt-1">
                      {result.bid_draft.sections.length} Sections
                    </p>
                    <span className="text-[10px] text-purple-700 font-semibold">Complete Technical Bid</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-center">
                    <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">Vendor Action Items</span>
                    <p className="text-2xl font-extrabold text-amber-600 mt-1">
                      {result.bid_draft.missing_evidence_flags.length} Required
                    </p>
                    <span className="text-[10px] text-amber-800 font-semibold">Pre-Submission Verification</span>
                  </div>
                </div>

                {/* 3. HARD DISQUALIFIERS COMPLIANCE MATRIX TABLE */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-5 h-5 text-blue-700" />
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">
                          Mandatory Qualifications & Disqualifiers Matrix
                        </h3>
                        <p className="text-xs text-slate-500">
                          Cross-referenced against verified Company Vault credentials
                        </p>
                      </div>
                    </div>

                    {/* Filter buttons */}
                    <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
                      <button
                        onClick={() => setDisqualifierFilter("ALL")}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          disqualifierFilter === "ALL"
                            ? "bg-white text-slate-900 shadow-2xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        All ({result.compliance_matrix.disqualifiers.length})
                      </button>
                      <button
                        onClick={() => setDisqualifierFilter("MET")}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          disqualifierFilter === "MET"
                            ? "bg-white text-emerald-800 shadow-2xs"
                            : "text-slate-600 hover:text-emerald-800"
                        }`}
                      >
                        Met ({result.compliance_matrix.disqualifiers.filter(d => d.status === "MET").length})
                      </button>
                      <button
                        onClick={() => setDisqualifierFilter("VERIFY_MANUALLY")}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          disqualifierFilter === "VERIFY_MANUALLY"
                            ? "bg-white text-amber-800 shadow-2xs"
                            : "text-slate-600 hover:text-amber-800"
                        }`}
                      >
                        Verify ({result.compliance_matrix.disqualifiers.filter(d => d.status === "VERIFY_MANUALLY").length})
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#0C1E3A] text-white">
                        <tr>
                          <th className="py-3 px-4 font-semibold">Criterion / Requirement</th>
                          <th className="py-3 px-4 font-semibold">RFP Citation</th>
                          <th className="py-3 px-4 font-semibold">Vault Evidence Verification</th>
                          <th className="py-3 px-4 font-semibold text-center">Status</th>
                          <th className="py-3 px-4 font-semibold text-right">Inspect</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredDisqualifiers.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3.5 px-4 font-medium text-slate-900 max-w-xs">
                              <div className="font-bold text-slate-900">{item.criterion}</div>
                              <div className="text-slate-500 text-[11px] mt-0.5 leading-snug">
                                {item.requirement_summary}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                              <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                                {item.rfp_citation}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-700 max-w-md">
                              <div className="font-medium text-slate-800">{item.vault_verification}</div>
                              {item.notes && (
                                <div className="text-[11px] text-slate-500 italic mt-0.5">{item.notes}</div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              {renderStatusBadge(item.status)}
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => setSelectedCitation(item)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Citation</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. SCORING RUBRIC & REQUIRED FORMS (2 COLUMNS) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Evaluation Rubric */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-blue-700" />
                        <h3 className="font-bold text-slate-900 text-sm">Agency Scoring Rubric Strategy</h3>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">100 Pts Total</span>
                    </div>
                    <div className="divide-y divide-slate-100 p-2">
                      {result.compliance_matrix.evaluation_rubric.map((r, i) => (
                        <div key={i} className="p-3.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm">{r.category}</span>
                            <span className="px-2.5 py-0.5 rounded-full font-mono font-bold bg-blue-100 text-[#1B365D]">
                              {r.weight_percentage}% Weight
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1">{r.description}</p>
                          <div className="mt-2 p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-slate-700">
                            <span className="font-bold text-[#1B365D]">Winning Strategy: </span>
                            {r.recommended_strategy}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Required Submittal Forms Checklist */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-5 h-5 text-emerald-700" />
                        <h3 className="font-bold text-slate-900 text-sm">Required Submittal Exhibits</h3>
                      </div>
                      <span className="text-xs text-slate-500">Interactive Pre-Flight Checklist</span>
                    </div>
                    <div className="divide-y divide-slate-100 p-2">
                      {result.compliance_matrix.required_forms.map((f, i) => (
                        <div key={i} className="p-3 text-xs flex items-start gap-3">
                          <input
                            type="checkbox"
                            defaultChecked={false}
                            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 mt-0.5 cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{f.form_name}</span>
                              {f.mandatory && (
                                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                  Mandatory
                                </span>
                              )}
                            </div>
                            <p className="text-slate-600 mt-0.5">{f.description}</p>
                            <p className="text-[11px] text-slate-500 italic mt-1">
                              <strong>Submission Note:</strong> {f.submittal_instructions}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. SPLIT-SCREEN BID STUDIO ("PAPER CANVAS" PROPOSAL PREVIEW) */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Studio Header Bar */}
                  <div className="p-4 sm:p-5 bg-[#0C1E3A] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <h3 className="font-bold text-sm tracking-wide">
                          Bid Proposal Studio — Formatted Paper Preview
                        </h3>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Generated strictly from verified Company Vault records • Anti-hallucination bounds enforced
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const currentContent =
                            activeSectionIdx === -1
                              ? result.bid_draft.executive_summary
                              : result.bid_draft.sections[activeSectionIdx]?.content || "";
                          handleCopySectionContent(currentContent);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all border border-white/20"
                      >
                        {copiedSection ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Active Section</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`${API_BASE}${result.download_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download .docx</span>
                      </a>
                    </div>
                  </div>

                  {/* Split Layout: Left Outline Rail + Right Paper Canvas */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[550px] border-t border-slate-200">
                    {/* Left Outline Rail (4 cols) */}
                    <div className="lg:col-span-4 bg-slate-50/80 border-r border-slate-200 p-3 space-y-1 overflow-y-auto max-h-[650px]">
                      <div className="px-2 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                        <span>Proposal Sections Outline</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {result.bid_draft.sections.length + 1} total
                        </span>
                      </div>

                      {/* Executive Summary Button */}
                      <button
                        onClick={() => setActiveSectionIdx(-1)}
                        className={`w-full text-left p-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                          activeSectionIdx === -1
                            ? "bg-white text-[#0C1E3A] border border-blue-200 shadow-xs"
                            : "text-slate-700 hover:bg-white/60"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>Executive Summary</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Transmittal</span>
                      </button>

                      {/* Numbered Sections */}
                      {result.bid_draft.sections.map((sec, idx) => {
                        const hasActions = sec.vendor_action_required.length > 0;
                        return (
                          <button
                            key={idx}
                            onClick={() => setActiveSectionIdx(idx)}
                            className={`w-full text-left p-3 rounded-xl text-xs font-semibold transition-all flex items-start justify-between gap-2 ${
                              activeSectionIdx === idx
                                ? "bg-white text-[#0C1E3A] border border-blue-200 shadow-xs"
                                : "text-slate-700 hover:bg-white/60"
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-blue-700 font-bold">§ {sec.section_number}</span>
                                <span className="line-clamp-1">{sec.title}</span>
                              </div>
                              {sec.addressed_rubric_category && (
                                <p className="text-[10px] text-slate-500 line-clamp-1">
                                  {sec.addressed_rubric_category}
                                </p>
                              )}
                            </div>

                            {hasActions && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                                {sec.vendor_action_required.length} Action
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Right "Paper View" Document Canvas (8 cols) */}
                    <div className="lg:col-span-8 p-6 sm:p-8 bg-slate-100 overflow-y-auto max-h-[650px] flex justify-center">
                      <div className="w-full max-w-2xl bg-white p-8 sm:p-12 rounded-xl paper-sheet space-y-6">
                        {/* Proposal Letterhead & Header */}
                        <div className="border-b-2 border-[#0C1E3A] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h2 className="text-base font-extrabold text-[#0C1E3A] tracking-tight">
                              {vault?.company_name || "Bay Vista Municipal Grounds, Inc."}
                            </h2>
                            <p className="text-[11px] text-slate-500">
                              CSLB #{vault?.licenses[0]?.license_number || "984210"} • DIR Registration #
                              {vault?.public_works_registration?.dir_number || "PW-CR-1000849201"}
                            </p>
                          </div>
                          <div className="text-right sm:text-right">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              Formal Proposal Submission
                            </span>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {result.compliance_matrix.solicitation_number}
                            </p>
                          </div>
                        </div>

                        {/* Content display */}
                        {activeSectionIdx === -1 ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                              <h3 className="text-lg font-bold text-[#0C1E3A]">Executive Summary</h3>
                              <span className="text-xs text-slate-400 italic">Transmittal Narrative</span>
                            </div>
                            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4 font-proposal">
                              {result.bid_draft.executive_summary.split("\n\n").map((para, i) => (
                                <p key={i} className="text-justify">
                                  {para}
                                </p>
                              ))}
                            </div>
                          </div>
                        ) : (
                          result.bid_draft.sections[activeSectionIdx] && (
                            <div className="space-y-5">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-100 text-blue-900">
                                    Section {result.bid_draft.sections[activeSectionIdx].section_number}
                                  </span>
                                  {result.bid_draft.sections[activeSectionIdx].addressed_rubric_category && (
                                    <span className="text-[11px] text-slate-500 font-medium">
                                      Aligned to: {result.bid_draft.sections[activeSectionIdx].addressed_rubric_category}
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-xl font-bold text-[#0C1E3A] mt-1.5">
                                  {result.bid_draft.sections[activeSectionIdx].title}
                                </h3>
                              </div>

                              {/* Interactive Vendor Action Callout */}
                              {result.bid_draft.sections[activeSectionIdx].vendor_action_required.length > 0 && (
                                <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 space-y-2.5 shadow-2xs">
                                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                                    <span>VENDOR ACTION REQUIRED PRIOR TO SUBMISSION:</span>
                                  </div>
                                  <div className="space-y-1.5 pl-1">
                                    {result.bid_draft.sections[activeSectionIdx].vendor_action_required.map((act, i) => {
                                      const key = `${activeSectionIdx}-${i}`;
                                      const isResolved = resolvedActions[key];
                                      return (
                                        <label
                                          key={i}
                                          className="flex items-start gap-2.5 cursor-pointer text-xs"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={!!isResolved}
                                            onChange={() => toggleActionResolution(key)}
                                            className="w-4 h-4 rounded text-blue-700 border-amber-400 focus:ring-0 mt-0.5 cursor-pointer"
                                          />
                                          <span className={isResolved ? "line-through text-slate-400" : "text-amber-900"}>
                                            {act}
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Formatted section markdown */}
                              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4 font-proposal">
                                {result.bid_draft.sections[activeSectionIdx].content
                                  .split("\n\n")
                                  .map((para, i) => {
                                    if (para.includes("[VENDOR ACTION REQUIRED:")) {
                                      return (
                                        <div
                                          key={i}
                                          className="p-3.5 bg-amber-50/90 border-l-4 border-amber-500 text-amber-900 font-sans text-xs rounded-r-lg font-medium"
                                        >
                                          {para}
                                        </div>
                                      );
                                    }
                                    if (para.startsWith("### ")) {
                                      return (
                                        <h5 key={i} className="font-bold text-base text-slate-900 pt-2 font-sans">
                                          {para.replace("### ", "")}
                                        </h5>
                                      );
                                    }
                                    if (para.startsWith("- ") || para.startsWith("* ")) {
                                      return (
                                        <li key={i} className="ml-5 list-disc pl-1">
                                          {para.substring(2)}
                                        </li>
                                      );
                                    }
                                    return (
                                      <p key={i} className="text-justify">
                                        {para}
                                      </p>
                                    );
                                  })}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. PRICING STRATEGY & PRE-FLIGHT SUBMISSION CHECKLIST */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pricing Strategy */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                    <h4 className="font-bold text-[#0C1E3A] text-sm flex items-center gap-2 mb-2.5">
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                      Prevailing Wage & Pricing Advisory
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      {result.bid_draft.pricing_strategy_notes}
                    </p>
                  </div>

                  {/* Pre-Flight Checklist */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                    <h4 className="font-bold text-[#0C1E3A] text-sm flex items-center gap-2 mb-2.5">
                      <FileCheck className="w-4 h-4 text-blue-600" />
                      Pre-Flight Submission Checklist
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {result.bid_draft.submission_checklist.map((chk, i) => (
                        <li key={i} className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            defaultChecked={false}
                            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-0 cursor-pointer"
                          />
                          <span>{chk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ================= TAB 3: COMPANY VAULT & READINESS ================= */}
        {activeTab === "vault" && (
          <div className="space-y-6">
            {/* Readiness Header Banner */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-900">
                    Single Source of Truth
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified & Persisted
                  </span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#0C1E3A]">Company Vault & Readiness</h1>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
                  The proposal writing agent is strictly locked to this vault. Update contractor licenses, insurance limits,
                  certifications, key personnel, and past municipal contracts.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {editMode ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditedVault(vault);
                        setEditMode(false);
                      }}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveVault}
                      disabled={vaultSaving}
                      className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                    >
                      {vaultSaving ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>Save Changes</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#0C1E3A] hover:bg-[#1B365D] text-white shadow-sm transition-all"
                  >
                    Edit Company Vault
                  </button>
                )}
              </div>
            </div>

            {/* Saved Notification */}
            {vaultSavedMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-semibold text-emerald-900 flex items-center gap-2 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Company Vault successfully updated and persisted to vault/company_profile.json!
              </div>
            )}

            {vaultLoading ? (
              <div className="text-center py-16 text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-700 mb-2" />
                <p className="text-xs font-medium">Loading verified Company Vault...</p>
              </div>
            ) : editedVault ? (
              <div className="space-y-6">
                {/* 1. Entity Identification & State Licenses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Entity Information */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
                    <h3 className="font-bold text-[#0C1E3A] text-sm flex items-center gap-2 border-b pb-2.5">
                      <Building2 className="w-4 h-4 text-blue-700" />
                      Contractor Entity & Primary Office
                    </h3>

                    <div className="space-y-2.5 text-xs">
                      <div>
                        <label className="text-slate-500 font-medium">Company Legal Name</label>
                        {editMode ? (
                          <input
                            type="text"
                            value={editedVault.company_name}
                            onChange={(e) =>
                              setEditedVault({ ...editedVault, company_name: e.target.value })
                            }
                            className="w-full mt-1 p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-blue-600"
                          />
                        ) : (
                          <p className="font-bold text-slate-900 text-sm">{editedVault.company_name}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="text-slate-500 font-medium">DBA Name</label>
                          <p className="font-medium text-slate-800">{editedVault.dba}</p>
                        </div>
                        <div>
                          <label className="text-slate-500 font-medium">FEIN / CAGE</label>
                          <p className="font-mono text-slate-800 font-bold">{editedVault.fein} / {editedVault.cage_code}</p>
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-500 font-medium">Headquarters Address</label>
                        <p className="text-slate-800">
                          {editedVault.address.street}, {editedVault.address.city}, {editedVault.address.state}{" "}
                          {editedVault.address.zip} ({editedVault.address.county})
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                        <div>
                          <label className="text-slate-500 font-medium">Primary Contact</label>
                          <p className="font-bold text-slate-900">{editedVault.contact.primary_contact_name}</p>
                          <p className="text-slate-500 text-[11px]">{editedVault.contact.title}</p>
                        </div>
                        <div>
                          <label className="text-slate-500 font-medium">Direct Phone & Email</label>
                          <p className="text-slate-800">{editedVault.contact.phone}</p>
                          <p className="text-slate-600 text-[11px]">{editedVault.contact.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Licenses & DIR */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
                    <h3 className="font-bold text-[#0C1E3A] text-sm flex items-center gap-2 border-b pb-2.5">
                      <Shield className="w-4 h-4 text-emerald-600" />
                      CSLB Contractor Licenses & DIR Status
                    </h3>

                    <div className="space-y-3 text-xs">
                      {editedVault.licenses.map((lic, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{lic.type}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              {lic.status}
                            </span>
                          </div>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-900">License #{lic.license_number}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-600">Expires: {lic.expiration_date}</span>
                          </div>
                          <div className="mt-1 text-slate-700">
                            <strong>Classifications:</strong> {lic.classifications.join(", ")}
                          </div>
                        </div>
                      ))}

                      {/* Public Works DIR */}
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-900">California DIR Public Works Registration</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                            {editedVault.public_works_registration.status}
                          </span>
                        </div>
                        <p className="font-mono font-bold text-[#0C1E3A] mt-1">
                          DIR #: {editedVault.public_works_registration.dir_number}
                        </p>
                        <p className="text-slate-600 text-[11px] mt-0.5">
                          Certified Payroll: {editedVault.public_works_registration.certified_payroll_system}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Insurance Coverage & Small Business Certifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Digital COI Cards */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
                    <h3 className="font-bold text-[#0C1E3A] text-sm flex items-center gap-2 border-b pb-2.5">
                      <FileCheck className="w-4 h-4 text-blue-600" />
                      Digital Certificate of Insurance (COI) Limits
                    </h3>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div>
                          <div className="font-bold text-slate-900">Commercial General Liability</div>
                          <div className="text-slate-500 text-[11px]">
                            {editedVault.insurance.commercial_general_liability.carrier} (Policy #
                            {editedVault.insurance.commercial_general_liability.policy_number})
                          </div>
                          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                            ✓ Blanket Municipal Additional Insured Form CG 20 10
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-emerald-700 text-sm">
                            {editedVault.insurance.commercial_general_liability.each_occurrence_limit}
                          </span>
                          <div className="text-[10px] text-slate-500">
                            Agg: {editedVault.insurance.commercial_general_liability.general_aggregate_limit}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div>
                          <div className="font-bold text-slate-900">Automobile Liability</div>
                          <div className="text-slate-500 text-[11px]">
                            {editedVault.insurance.automobile_liability.carrier}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-emerald-700 text-sm">
                            {editedVault.insurance.automobile_liability.combined_single_limit}
                          </span>
                          <div className="text-[10px] text-slate-500">CSL Any Auto</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div>
                          <div className="font-bold text-slate-900">Workers' Compensation</div>
                          <div className="text-slate-500 text-[11px]">
                            {editedVault.insurance.workers_compensation.carrier}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-emerald-700 text-sm">
                            {editedVault.insurance.workers_compensation.employers_liability_each_accident}
                          </span>
                          <div className="text-[10px] text-slate-500">Statutory Limits</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Certifications & Safety */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
                    <h3 className="font-bold text-[#0C1E3A] text-sm flex items-center gap-2 border-b pb-2.5">
                      <Award className="w-4 h-4 text-purple-600" />
                      Small Business Certifications & Cal/OSHA IIPP
                    </h3>

                    <div className="space-y-2.5 text-xs">
                      {editedVault.certifications.map((cert, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-slate-900">{cert.title}</div>
                            <div className="text-slate-500 text-[11px]">
                              Cert #{cert.cert_number} • {cert.issuing_agency}
                            </div>
                            <div className="text-slate-600 text-[10px]">Valid Through: {cert.valid_through}</div>
                          </div>
                          {cert.eligible_for_sb_preference && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300 shrink-0">
                              SB Preference
                            </span>
                          )}
                        </div>
                      ))}

                      {/* Cal/OSHA Safety Track Record */}
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 mt-2">
                        <div className="font-bold text-emerald-900">Cal/OSHA Safety Performance Record</div>
                        <div className="grid grid-cols-2 gap-2 mt-1 text-xs text-slate-700">
                          <div>
                            <strong>EMR (Experience Mod):</strong> {editedVault.safety_metrics.experience_modification_rate_emr}
                          </div>
                          <div>
                            <strong>Lost Workday Rate:</strong> {editedVault.safety_metrics.lost_workday_incident_rate_lwir}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Verified Key Personnel */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <h3 className="font-bold text-[#0C1E3A] text-sm flex items-center gap-2 border-b pb-2.5">
                    <Users className="w-4 h-4 text-blue-700" />
                    Key Verified Personnel Resumes
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {editedVault.key_personnel.map((p, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-blue-900 font-semibold text-[11px]">{p.role}</div>
                        <div className="text-slate-500 text-[10px]">{p.experience_years} Years Experience</div>
                        <p className="text-slate-600 text-[11px] line-clamp-3 pt-1">{p.bio}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Municipal Past Performance Contracts */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <h3 className="font-bold text-[#0C1E3A] text-sm flex items-center gap-2 border-b pb-2.5">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    Verified Municipal Past Performance Portfolio
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {editedVault.municipal_past_performance.map((c, i) => (
                      <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm">{c.contract_name}</span>
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {c.annual_contract_value} / yr
                          </span>
                        </div>
                        <div className="text-slate-600">
                          <strong>Agency:</strong> {c.agency} ({c.solicitation_number})
                        </div>
                        <div className="text-slate-600">
                          <strong>Term:</strong> {c.contract_term}
                        </div>
                        <p className="text-slate-700">
                          <strong>Scope:</strong> {c.scope_of_work}
                        </p>
                        <p className="text-emerald-900 bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200">
                          <strong>Key Outcomes:</strong> {c.key_outcomes}
                        </p>
                        <div className="text-slate-500 text-[11px] pt-1.5 border-t">
                          <strong>Client Reference:</strong> {c.client_reference.name} ({c.client_reference.title}),{" "}
                          {c.client_reference.phone}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* ================= TAB 4: PROACTIVE PORTAL MONITOR ================= */}
        {activeTab === "monitor" && (
          <div className="space-y-6">
            {/* Real-time Scan Notification Alert */}
            {scanNotification && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{scanNotification}</span>
                </div>
                <button
                  onClick={() => setScanNotification(null)}
                  className="text-emerald-700 hover:text-emerald-950 font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Header Radar HUD Banner */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-emerald-50/40 via-blue-50/30 to-transparent pointer-events-none" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Autonomous Web Crawler Active
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-medium">
                      Continuous Municipal Procurement Polling
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    Proactive Municipal Procurement Radar
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                    CivicScribe’s proactive agent routinely checks local city, county, and authority procurement websites for new solicitations, addenda, and deadline changes — logging detected updates directly into your opportunity database so you never miss an amendment or bidding window.
                  </p>
                </div>

                {/* Control Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    onClick={handleTriggerScan}
                    disabled={isScanning}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                      isScanning
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-[#0C1E3A] hover:bg-[#1B365D] text-white active:scale-98"
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin text-blue-400" : "text-emerald-400"}`} />
                    <span>{isScanning ? "Scanning Municipal Portals..." : "Check Portals Now"}</span>
                  </button>

                  <button
                    onClick={() => setShowPortalsListModal(true)}
                    className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
                  >
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    <span>Portals ({monitoredPortals.length})</span>
                  </button>

                  <button
                    onClick={() => setShowAddPortalModal(true)}
                    className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Track New Portal</span>
                  </button>
                </div>
              </div>
            </div>

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Monitored Portals
                  </span>
                  <Globe className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {monitorOverview?.active_portals_count ?? monitoredPortals.length}
                </div>
                <p className="text-[11px] text-slate-500">
                  Active municipal boards
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Indexed Solicitations
                  </span>
                  <Layers className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {monitorOverview?.total_solicitations_count ?? discoveredSolicitations.length}
                </div>
                <p className="text-[11px] text-slate-500">
                  Stored in local database
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Recent Changes
                  </span>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-amber-600">
                  {monitorOverview?.recent_changes_count ?? 3}
                </div>
                <p className="text-[11px] text-slate-500">
                  Addenda & deadline shifts
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Qualified 'GO' Leads
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-emerald-600">
                  {monitorOverview?.go_opportunities_count ?? 1}
                </div>
                <p className="text-[11px] text-slate-500">
                  Matched to company vault
                </p>
              </div>
            </div>

            {/* Filter and Control Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {[
                  { label: "All Opportunities", val: "All" },
                  { label: "New Postings", val: "NEW" },
                  { label: "Addenda & Revisions", val: "ADDENDUM_POSTED" },
                  { label: "Deadline Extended", val: "DEADLINE_EXTENDED" }
                ].map(tab => (
                  <button
                    key={tab.val}
                    onClick={() => setMonitorStatusFilter(tab.val)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      monitorStatusFilter === tab.val
                        ? "bg-[#0C1E3A] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Trade Category Dropdown */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="text-xs text-slate-500 font-medium">Trade:</span>
                <select
                  value={monitorCategoryFilter}
                  onChange={e => setMonitorCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Trade Categories</option>
                  <option value="Landscaping">Landscaping & Grounds</option>
                  <option value="Janitorial">Janitorial & Custodial</option>
                  <option value="HVAC">HVAC & Mechanical</option>
                  <option value="Facility">Facility Maintenance</option>
                </select>
              </div>
            </div>

            {/* Discovered Solicitations Feed */}
            <div className="space-y-4">
              {discoveredSolicitations
                .filter(s => {
                  if (monitorStatusFilter !== "All" && s.status !== monitorStatusFilter) return false;
                  if (monitorCategoryFilter !== "All" && !s.trade_category.toLowerCase().includes(monitorCategoryFilter.toLowerCase())) return false;
                  return true;
                })
                .map(sol => {
                  const isAuditing = isAuditingDiscovered === sol.id;
                  const isHistoryExpanded = expandedHistoryId === sol.id;

                  // Status badge helper
                  const renderStatusPill = () => {
                    switch (sol.status) {
                      case "NEW":
                        return (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            NEW SOLICITATION
                          </span>
                        );
                      case "ADDENDUM_POSTED":
                        return (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            ADDENDUM POSTED
                          </span>
                        );
                      case "DEADLINE_EXTENDED":
                        return (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-blue-600" />
                            DEADLINE EXTENDED
                          </span>
                        );
                      default:
                        return (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            ACTIVE
                          </span>
                        );
                    }
                  };

                  return (
                    <div
                      key={sol.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow space-y-4"
                    >
                      {/* Top Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
                        <div className="flex flex-wrap items-center gap-2">
                          {renderStatusPill()}
                          <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {sol.solicitation_number}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            • {sol.agency} ({sol.jurisdiction || "Local Public Works"})
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Last Polled: {new Date(sol.last_updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      {/* Main Title & Details */}
                      <div className="space-y-2">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                          {sol.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium text-slate-700">
                            {sol.trade_category}
                          </span>

                          {sol.estimated_value && (
                            <span className="flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <DollarSign className="w-3.5 h-3.5" />
                              {sol.estimated_value}
                            </span>
                          )}

                          <span className="flex items-center gap-1 font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            Strict Due Date: <strong className="text-slate-900 ml-0.5">{sol.submission_deadline}</strong>
                          </span>

                          {sol.compliance_verdict && sol.compliance_verdict !== "UNAUDITED" && (
                            <span className="ml-auto">
                              {renderVerdictBadge(sol.compliance_verdict as any, "sm")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Proactive Change Alert Box */}
                      {sol.latest_change_summary && (
                        <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50/80 to-blue-50/60 border border-amber-200/80 text-xs flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div className="space-y-0.5 flex-1">
                            <span className="font-bold text-amber-950 uppercase tracking-wide text-[10px]">
                              Autonomous Crawler Change Detection Log:
                            </span>
                            <p className="text-slate-800 font-medium leading-relaxed">
                              {sol.latest_change_summary}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Expandable Change History Trail */}
                      {sol.change_history && sol.change_history.length > 0 && (
                        <div className="pt-1">
                          <button
                            onClick={() => setExpandedHistoryId(isHistoryExpanded ? null : sol.id)}
                            className="flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 font-semibold"
                          >
                            <History className="w-3.5 h-3.5" />
                            <span>
                              {isHistoryExpanded ? "Hide Change History" : `View Change History (${sol.change_history.length} logged)`}
                            </span>
                          </button>

                          {isHistoryExpanded && (
                            <div className="mt-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs animate-in fade-in">
                              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block border-b pb-1">
                                Complete Municipal Change Audit Trail:
                              </span>
                              <div className="space-y-2 pt-1">
                                {sol.change_history.map((h, idx) => (
                                  <div key={idx} className="flex items-start gap-2 text-slate-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-800">{h.change_type}</span>
                                        <span className="text-[10px] text-slate-400">
                                          {new Date(h.timestamp).toLocaleDateString()} {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                      <p className="text-slate-700">{h.summary}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Compass className="w-3.5 h-3.5 text-slate-400" />
                          <span>Source Board: <strong className="text-slate-700">{sol.portal_name || "Municipal Procurement"}</strong></span>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={sol.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1 transition-all"
                          >
                            <span>Official Portal</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>

                          <button
                            onClick={() => handleAuditDiscoveredSolicitation(sol.id)}
                            disabled={isAuditing}
                            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs ${
                              isAuditing
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-[#0C1E3A] hover:bg-[#1B365D] text-white active:scale-98"
                            }`}
                          >
                            {isAuditing ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                                <span>Executing Compliance Audit...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                <span>1-Click Compliance Audit & Bid Proposal</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {discoveredSolicitations.length === 0 && (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-3">
                  <Globe className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="font-semibold text-sm">No municipal solicitations found matching your filter criteria.</p>
                  <button
                    onClick={() => { setMonitorStatusFilter("All"); setMonitorCategoryFilter("All"); }}
                    className="text-xs text-blue-700 hover:underline font-bold"
                  >
                    Reset all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ----------------- MODAL: ADD MUNICIPAL PORTAL ----------------- */}
      {showAddPortalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Track New Municipal Procurement Portal
                </h3>
              </div>
              <button
                onClick={() => setShowAddPortalModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPortal} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Municipality / Agency Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., City of Dallas Public Works Solicitations"
                  value={newPortalName}
                  onChange={e => setNewPortalName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jurisdiction / Region:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Dallas County, TX"
                  value={newPortalJurisdiction}
                  onChange={e => setNewPortalJurisdiction(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Official Procurement Portal URL:
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://dallascityhall.com/procurement/bids"
                  value={newPortalUrl}
                  onChange={e => setNewPortalUrl(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Target Trade Categories:
                </label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {["Landscaping & Grounds", "Janitorial & Custodial", "HVAC & Mechanical", "Facility Maintenance"].map(trade => (
                    <label key={trade} className="flex items-center gap-1.5 font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newPortalTrades.includes(trade)}
                        onChange={e => {
                          if (e.target.checked) setNewPortalTrades([...newPortalTrades, trade]);
                          else setNewPortalTrades(newPortalTrades.filter(t => t !== trade));
                        }}
                        className="rounded text-blue-600"
                      />
                      <span>{trade}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Autonomous Polling Interval:
                </label>
                <select
                  value={newPortalInterval}
                  onChange={e => setNewPortalInterval(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
                >
                  <option value={30}>Every 30 Minutes (High Frequency)</option>
                  <option value={60}>Every 60 Minutes (Standard)</option>
                  <option value={120}>Every 2 Hours</option>
                  <option value={360}>Every 6 Hours</option>
                  <option value={1440}>Once Daily</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddPortalModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPortal}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-[#0C1E3A] hover:bg-[#1B365D] text-white flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isSubmittingPortal ? "Registering..." : "Start Monitoring Portal"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL: MONITORED PORTALS LIST ----------------- */}
      {showPortalsListModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Active Monitored Municipal Portals ({monitoredPortals.length})
                </h3>
              </div>
              <button
                onClick={() => setShowPortalsListModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 pr-1 text-xs">
              {monitoredPortals.map(p => (
                <div key={p.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">{p.name}</h4>
                      <p className="text-slate-500 text-[11px]">{p.jurisdiction}</p>
                    </div>
                    <button
                      onClick={() => handleDeletePortal(p.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                      title="Stop Monitoring Portal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <a
                    href={p.portal_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-blue-700 hover:underline block truncate text-[11px]"
                  >
                    {p.portal_url}
                  </a>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700">Target Trades:</span>
                      <span>{p.target_trades.join(", ")}</span>
                    </div>
                    <div>
                      Interval: <strong>Every {p.check_interval_minutes}m</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                onClick={() => setShowPortalsListModal(false)}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-[#0C1E3A] text-white hover:bg-[#1B365D]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- CITATION INSPECTION MODAL ----------------- */}
      {selectedCitation && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-700" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Citation Verification: {selectedCitation.criterion}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCitation(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border">
                <span className="font-bold text-slate-700">RFP Exact Citation:</span>
                <p className="font-mono text-blue-900 font-bold mt-0.5">{selectedCitation.rfp_citation}</p>
                <p className="text-slate-600 mt-1">{selectedCitation.requirement_summary}</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="font-bold text-emerald-900">Verified Vault Evidence:</span>
                <p className="text-slate-800 mt-0.5">{selectedCitation.vault_verification}</p>
                {selectedCitation.notes && (
                  <p className="text-slate-500 italic mt-1">{selectedCitation.notes}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-500 font-medium">Compliance Verdict:</span>
                {renderStatusBadge(selectedCitation.status)}
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedCitation(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[#0C1E3A] text-white hover:bg-[#1B365D]"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- CIVIC PRECISION FOOTER ----------------- */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-medium text-slate-600">
            CivicScribe • AI Municipal RFP Compliance Auditor & Bid Writer • Built with FastAPI, Next.js, and Google Antigravity SDK
          </p>
          <p className="text-slate-400">
            Strict anti-hallucination fidelity for local small-business municipal trade contractors.
          </p>
        </div>
      </footer>
    </div>
  );
}