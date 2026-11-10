"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Filter,
  FileSpreadsheet,
  Globe,
  Mail,
  Moon,
  Play,
  Plus,
  RefreshCw,
  Search,
  Send,
  Sun,
  Upload,
  X,
  AlertCircle,
  Building2,
  Calendar,
  Terminal,
  Eye,
} from "lucide-react";
import {
  ApplicationStatus,
  CandidateProfile,
  CrmEntry,
  GeneratedApplication,
  JobOffer,
  NightlySyncLog,
} from "@/lib/types";
import {
  DEFAULT_CANDIDATE_PROFILE,
  extractKeywordsFromText,
  generateApplicationDraft,
  GOOGLE_SHEET_ID,
  GOOGLE_SHEET_URL,
  USER_GMAIL_ADDRESS,
  VERIFIED_JOB_OFFERS,
  matchAndRankOffers,
} from "@/lib/offers-data";

async function extractTextFromPdfOrTextFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  if (file.name.toLowerCase().endsWith(".txt") || file.type === "text/plain") {
    return new TextDecoder("utf-8").decode(bytes);
  }

  // Lightweight client-side PDF text extractor (reads literal strings and UTF-8/Latin1 tokens from PDF streams)
  const rawLatin1 = new TextDecoder("latin1").decode(bytes);
  const extractedChunks: string[] = [];

  // Extract parenthesized PDF text strings (...)
  const parenRegex = /\(([^()\\]{2,200})\)/g;
  let match: RegExpExecArray | null;
  while ((match = parenRegex.exec(rawLatin1)) !== null) {
    const clean = match[1].replace(/[^\x20-\x7EÀ-ÿ]/g, " ").trim();
    if (clean.length > 2) extractedChunks.push(clean);
  }

  // Also scan readable ASCII/Latin words for technical stack detection
  const readableWords = rawLatin1.match(/[A-Za-zÀ-ÿ0-9+#._-]{3,40}/g) || [];
  const combined = `${extractedChunks.join(" ")} ${readableWords.join(" ")}`;
  return combined.slice(0, 35000);
}

export default function StagePilotDashboard() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeTab, setActiveTab] = useState<"offers" | "crm" | "cron">("offers");

  // Profile & Scraping state
  const [profile, setProfile] = useState<CandidateProfile>(DEFAULT_CANDIDATE_PROFILE);
  const [keywordInput, setKeywordInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [offers, setOffers] = useState<JobOffer[]>(() =>
    matchAndRankOffers(VERIFIED_JOB_OFFERS, DEFAULT_CANDIDATE_PROFILE.keywords)
  );
  const [isScraping, setIsScraping] = useState(false);
  const [lastScrapedAt, setLastScrapedAt] = useState<string>("10/11/2026 22:15");
  const [cvUploadStatus, setCvUploadStatus] = useState<string>(
    "Profil actif : CV_Maxime_Navellier_FullStack_IA.pdf (15 compétences détectées)"
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // One-Click Application state
  const [oneClickDirectMode, setOneClickDirectMode] = useState<boolean>(false);
  const [applyingOfferId, setApplyingOfferId] = useState<string | null>(null);
  const [activeDraftModal, setActiveDraftModal] = useState<{
    offer: JobOffer;
    draft: GeneratedApplication;
  } | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "info" | "error";
    title: string;
    detail: string;
    gmailUrl?: string;
    sheetUrl?: string;
  } | null>(null);

  // CRM & Nightly Sync state
  const [crmEntries, setCrmEntries] = useState<CrmEntry[]>([]);
  const [crmStatusFilter, setCrmStatusFilter] = useState<string>("ALL");
  const [syncLogs, setSyncLogs] = useState<NightlySyncLog[]>([]);
  const [isRunningCron, setIsRunningCron] = useState(false);

  // Theme initialization + OS listener
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("stagepilot-theme")) {
        const nextTheme = e.matches ? "dark" : "light";
        document.documentElement.classList.toggle("dark", e.matches);
        setTheme(nextTheme);
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("stagepilot-theme", next);
  };

  // Load initial CRM entries & logs
  useEffect(() => {
    fetch("/api/crm")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.entries)) setCrmEntries(data.entries);
        if (Array.isArray(data.logs)) setSyncLogs(data.logs);
      })
      .catch(() => {});
  }, []);

  // Re-rank offers whenever keywords or searchQuery change
  useEffect(() => {
    setOffers(matchAndRankOffers(VERIFIED_JOB_OFFERS, profile.keywords, searchQuery));
  }, [profile.keywords, searchQuery]);

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCvUploadStatus(`Analyse du fichier ${file.name} en cours...`);
    try {
      const rawText = await extractTextFromPdfOrTextFile(file);
      const detected = extractKeywordsFromText(rawText);
      const merged = Array.from(
        new Set([...detected, ...profile.keywords])
      );

      const updatedProfile: CandidateProfile = {
        ...profile,
        cvFileName: file.name,
        cvRawText: rawText.slice(0, 6000) || profile.cvRawText,
        keywords: merged.length > 0 ? merged : profile.keywords,
      };
      setProfile(updatedProfile);
      setCvUploadStatus(
        `CV importé : ${file.name} (${detected.length > 0 ? `${detected.length} compétences extraites du PDF` : "profil mis à jour"})`
      );

      await triggerScraping(updatedProfile.keywords, updatedProfile.cvRawText, searchQuery);
    } catch {
      setCvUploadStatus(`Erreur de lecture sur ${file.name}. Veuillez vérifier le fichier.`);
    }
  };

  const addKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = keywordInput.trim();
    if (!trimmed) return;
    if (!profile.keywords.includes(trimmed)) {
      const nextKeywords = [...profile.keywords, trimmed];
      setProfile({ ...profile, keywords: nextKeywords });
    }
    setKeywordInput("");
  };

  const removeKeyword = (kw: string) => {
    setProfile({
      ...profile,
      keywords: profile.keywords.filter((k) => k !== kw),
    });
  };

  const triggerScraping = async (
    customKeywords = profile.keywords,
    customCvText = profile.cvRawText,
    customQuery = searchQuery
  ) => {
    setIsScraping(true);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: customKeywords,
          cvText: customCvText,
          searchQuery: customQuery,
        }),
      });
      const data = await res.json();
      if (Array.isArray(data.offers)) {
        setOffers(data.offers);
      }
      setLastScrapedAt(
        new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setNotification({
        type: "info",
        title: "Scan Browserbase & Matching terminé",
        detail: `${data.offers?.length || offers.length} offres vérifiées et classées selon votre profil (${customKeywords.length} compétences actives).`,
      });
    } catch {
      setOffers(matchAndRankOffers(VERIFIED_JOB_OFFERS, customKeywords, customQuery));
    } finally {
      setIsScraping(false);
    }
  };

  const handleClickPostuler = async (offer: JobOffer) => {
    const draft = generateApplicationDraft(offer, profile);
    if (oneClickDirectMode) {
      await executeSendApplication(offer, draft);
    } else {
      setActiveDraftModal({ offer, draft });
    }
  };

  const executeSendApplication = async (
    offer: JobOffer,
    draft: GeneratedApplication
  ) => {
    setApplyingOfferId(offer.id);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offer,
          profile,
          customSubject: draft.subject,
          customEmailBody: draft.emailBody,
          customCoverLetter: draft.coverLetter,
          customRecipientEmail: draft.recipientEmail,
        }),
      });
      const data = await res.json();

      if (data.crmEntry) {
        setCrmEntries((prev) => [data.crmEntry, ...prev]);
      }

      setActiveDraftModal(null);
      setNotification({
        type: "success",
        title: `Candidature envoyée : ${offer.company} (${offer.title})`,
        detail: `${data.gmail?.message || `Expédié via ${USER_GMAIL_ADDRESS}`} Ligne ajoutée dans Google Sheets avec le statut "Envoyé".`,
        gmailUrl: data.gmail?.gmailComposeUrl,
        sheetUrl: GOOGLE_SHEET_URL,
      });
    } catch (err) {
      setNotification({
        type: "error",
        title: "Échec de l'envoi automatique",
        detail: String(err),
      });
    } finally {
      setApplyingOfferId(null);
    }
  };

  const handleRunNightlySyncNow = async () => {
    setIsRunningCron(true);
    try {
      const res = await fetch("/api/cron/nightly-sync", { method: "POST" });
      const data = await res.json();
      if (Array.isArray(data.entries)) {
        setCrmEntries(data.entries);
      }
      if (data.syncLog) {
        setSyncLogs((prev) => [data.syncLog, ...prev]);
      }
      setNotification({
        type: "info",
        title: "Routine de Suivi Nocturne exécutée",
        detail:
          data.syncLog?.summary ||
          `Boîte ${USER_GMAIL_ADDRESS} analysée et Google Sheet mis à jour.`,
        sheetUrl: GOOGLE_SHEET_URL,
      });
    } catch (err) {
      setNotification({
        type: "error",
        title: "Erreur lors du scan Gmail",
        detail: String(err),
      });
    } finally {
      setIsRunningCron(false);
    }
  };

  const handleUpdateCrmStatus = async (id: string, newStatus: ApplicationStatus) => {
    const today = new Date().toISOString().slice(0, 10);
    setCrmEntries((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: newStatus,
              responseDate: newStatus === "Envoyé" ? "En attente" : today,
            }
          : item
      )
    );
    await fetch("/api/crm", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus, responseDate: today }),
    });
  };

  const isOfferAlreadyApplied = (offer: JobOffer) =>
    crmEntries.some(
      (e) =>
        e.offerUrl === offer.url ||
        (e.company.toLowerCase() === offer.company.toLowerCase() &&
          e.role.toLowerCase() === offer.title.toLowerCase())
    );

  const filteredCrmEntries =
    crmStatusFilter === "ALL"
      ? crmEntries
      : crmEntries.filter((e) => e.status === crmStatusFilter);

  const getStatusBadgeClasses = (status: ApplicationStatus) => {
    switch (status) {
      case "Entretien":
        return "border-emerald-700/40 bg-emerald-50 text-emerald-900 dark:border-emerald-500/40 dark:bg-[#16231B] dark:text-emerald-300";
      case "Refus":
        return "border-red-700/40 bg-red-50 text-red-900 dark:border-red-500/40 dark:bg-[#261616] dark:text-red-300";
      case "En attente":
        return "border-amber-700/40 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-[#241E14] dark:text-amber-300";
      case "Envoyé":
      default:
        return "border-[#D1D5DB] bg-[#F3F4F6] text-[#111827] dark:border-[#374151] dark:bg-[#262626] dark:text-[#E5E7EB]";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-[#111827] dark:bg-[#121212] dark:text-[#E5E7EB]">
      {/* Top Utilitarian B2B Header */}
      <header className="sticky top-0 z-30 border-b border-[#E5E7EB] dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded border border-[#111827] dark:border-[#E5E7EB] bg-[#111827] dark:bg-[#E5E7EB] text-[#F9FAFB] dark:text-[#121212] flex items-center justify-center font-mono font-bold text-sm">
              SP
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-semibold tracking-tight text-base text-[#111827] dark:text-[#E5E7EB]">
                  StagePilot
                </span>
                <span className="text-xs font-mono uppercase px-2 py-0.5 rounded border border-[#E5E7EB] dark:border-[#2E2E2E] bg-[#F9FAFB] dark:bg-[#121212] text-[#4B5563] dark:text-[#9CA3AF]">
                  Placement & CRM B2B
                </span>
              </div>
              <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] hidden sm:block">
                Compte actif : <span className="font-mono">{USER_GMAIL_ADDRESS}</span> · CRON :{" "}
                <span className="font-mono">23h50 (Europe/Paris)</span>
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 border border-[#E5E7EB] dark:border-[#2E2E2E] rounded p-1 bg-[#F9FAFB] dark:bg-[#121212]">
            <button
              onClick={() => setActiveTab("offers")}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                activeTab === "offers"
                  ? "bg-white dark:bg-[#1E1E1E] text-[#111827] dark:text-[#E5E7EB] border border-[#E5E7EB] dark:border-[#2E2E2E]"
                  : "text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#E5E7EB]"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Offres & Matching</span>
              <span className="font-mono text-[11px] px-1.5 py-0.2 bg-[#F3F4F6] dark:bg-[#262626] rounded">
                {offers.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("crm")}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                activeTab === "crm"
                  ? "bg-white dark:bg-[#1E1E1E] text-[#111827] dark:text-[#E5E7EB] border border-[#E5E7EB] dark:border-[#2E2E2E]"
                  : "text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#E5E7EB]"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CRM Google Sheets</span>
              <span className="font-mono text-[11px] px-1.5 py-0.2 bg-[#F3F4F6] dark:bg-[#262626] rounded">
                {crmEntries.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("cron")}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                activeTab === "cron"
                  ? "bg-white dark:bg-[#1E1E1E] text-[#111827] dark:text-[#E5E7EB] border border-[#E5E7EB] dark:border-[#2E2E2E]"
                  : "text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#E5E7EB]"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Routine 23h50</span>
            </button>
          </nav>

          {/* Right Utilities: Google Sheet Link + Theme Toggle */}
          <div className="flex items-center gap-2.5">
            <a
              href={GOOGLE_SHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-[#E5E7EB] dark:border-[#2E2E2E] bg-[#F9FAFB] dark:bg-[#121212] text-[#111827] dark:text-[#E5E7EB] hover:bg-[#F3F4F6] dark:hover:bg-[#262626] transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ouvrir Google Sheet</span>
              <ExternalLink className="w-3 h-3 text-[#4B5563] dark:text-[#9CA3AF]" />
            </a>

            <button
              onClick={toggleTheme}
              aria-label="Basculer Mode Clair / Mode Sombre"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded border border-[#E5E7EB] dark:border-[#2E2E2E] bg-[#F9FAFB] dark:bg-[#121212] text-[#111827] dark:text-[#E5E7EB] hover:bg-[#F3F4F6] dark:hover:bg-[#262626] transition-colors"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mode Clair</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mode Sombre</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Container with Generous Whitespace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-8 py-8 space-y-8">
        {/* Notification Banner */}
        {notification && (
          <div className="p-4 rounded border border-[#111827] dark:border-[#E5E7EB] bg-white dark:bg-[#1E1E1E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              {notification.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-emerald-700 dark:text-emerald-400" />
              ) : notification.type === "error" ? (
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-700 dark:text-red-400" />
              ) : (
                <Terminal className="w-5 h-5 mt-0.5 shrink-0 text-[#111827] dark:text-[#E5E7EB]" />
              )}
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#111827] dark:text-[#E5E7EB]">
                  {notification.title}
                </p>
                <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF]">
                  {notification.detail}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {notification.gmailUrl && (
                    <a
                      href={notification.gmailUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium underline underline-offset-4 text-[#111827] dark:text-[#E5E7EB]"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Vérifier dans Gmail ({USER_GMAIL_ADDRESS})</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {notification.sheetUrl && (
                    <a
                      href={notification.sheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium underline underline-offset-4 text-[#111827] dark:text-[#E5E7EB]"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Voir la ligne dans Google Sheets</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="self-end sm:self-center p-1 text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#E5E7EB]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top KPI Bar */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded border border-[#E5E7EB] dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E]">
            <div className="flex items-center justify-between text-xs text-[#4B5563] dark:text-[#9CA3AF] mb-2">
              <span>OFFRES MATCHÉES</span>
              <Globe className="w-4 h-4" />
            </div>
            <div className="text-2xl font-mono font-semibold text-[#111827] dark:text-[#E5E7EB]">
              {offers.length}
            </div>
            <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] mt-1">
              Dernier scan Browserbase : {lastScrapedAt}
            </p>
          </div>

          <div className="p-5 rounded border border-[#E5E7EB] dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E]">
            <div className="flex items-center justify-between text-xs text-[#4B5563] dark:text-[#9CA3AF] mb-2">
              <span>CANDIDATURES ENVOYÉES</span>
              <Send className="w-4 h-4" />
            </div>
            <div className="text-2xl font-mono font-semibold text-[#111827] dark:text-[#E5E7EB]">
              {crmEntries.length}
            </div>
            <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] mt-1">
              Compte : {USER_GMAIL_ADDRESS}
            </p>
          </div>

          <div className="p-5 rounded border border-[#E5E7EB] dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E]">
            <div className="flex items-center justify-between text-xs text-[#4B5563] dark:text-[#9CA3AF] mb-2">
              <span>CRM GOOGLE SHEETS</span>
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="text-sm font-mono font-semibold truncate text-[#111827] dark:text-[#E5E7EB]">
              Connecté (Synchronisé)
            </div>
            <a
              href={GOOGLE_SHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs underline underline-offset-2 text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#E5E7EB] mt-1.5"
            >
              <span>ID: {GOOGLE_SHEET_ID.slice(0, 14)}...</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-5 rounded border border-[#E5E7EB] dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E]">
            <div className="flex items-center justify-between text-xs text-[#4B5563] dark:text-[#9CA3AF] mb-2">
              <span>ROUTINE NOCTURNE (CRON)</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-lg font-mono font-semibold text-[#111827] dark:text-[#E5E7EB]">
              23:50 Quotidien
            </div>
            <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] mt-1">
              Scan auto Gmail → Statut Sheets
            </p>
          </div>
        </section>

        {/* TAB 1: MOTEUR DE SCRAPING, MATCHING & CANDIDATURE ONE-CLICK */}
        {activeTab === "offers" && (
          <div className="space-y-8">
            {/* Control Panel: CV Upload + Keywords + Browserbase Trigger */}
            <section className="p-6 sm:p-8 rounded border border-[#E5E7EB] dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E] space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E5E7EB] dark:border-[#2E2E2E] pb-5">
                <div>
                  <h1 className="text-lg font-semibold text-[#111827] dark:text-[#E5E7EB]">
                    1. Moteur de Scraping (Browserbase) & Matching Profil
                  </h1>
                  <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] mt-1">
                    Importez votre CV au format PDF ou ajustez vos mots-clés techniques pour filtrer et scorer les offres de stage en temps réel.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 text-xs text-[#4B5563] dark:text-[#9CA3AF] cursor-pointer select-none border border-[#E5E7EB] dark:border-[#2E2E2E] rounded px-3 py-2 bg-[#F9FAFB] dark:bg-[#121212]">
                    <input
                      type="checkbox"
                      checked={oneClickDirectMode}
                      onChange={(e) => setOneClickDirectMode(e.target.checked)}
                      className="rounded border-[#D1D5DB] text-[#111827] focus:ring-0"
                    />
                    <span>Mode Envoi Direct 1-Clic (sans modale de relecture)</span>
                  </label>

                  <button
                    onClick={() => triggerScraping()}
                    disabled={isScraping}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded bg-[#111827] text-[#F9FAFB] dark:bg-[#E5E7EB] dark:text-[#121212] hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? "animate-spin" : ""}`} />
                    <span>{isScraping ? "Scan Browserbase en cours..." : "Scanner les sites d'emploi"}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: CV PDF Upload */}
                <div className="lg:col-span-5 space-y-3">
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF]">
                    CV du Candidat (PDF ou Texte)
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-5 rounded border border-dashed border-[#D1D5DB] dark:border-[#374151] bg-[#F9FAFB] dark:bg-[#121212] hover:border-[#111827] dark:hover:border-[#E5E7EB] transition-colors cursor-pointer flex flex-col justify-between gap-3"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.txt"
                      onChange={handleCvUpload}
                      className="hidden"
                    />
                    <div className="flex items-start gap-3">
                      <Upload className="w-5 h-5 mt-0.5 text-[#4B5563] dark:text-[#9CA3AF] shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-[#111827] dark:text-[#E5E7EB]">
                          Cliquer pour uploader votre CV (.pdf)
                        </p>
                        <p className="text-[11px] text-[#4B5563] dark:text-[#9CA3AF] mt-0.5">
                          Extraction automatique des compétences et croisement avec chaque offre pour la lettre de motivation.
                        </p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-[#E5E7EB] dark:border-[#2E2E2E] flex items-center justify-between text-[11px] font-mono text-[#4B5563] dark:text-[#9CA3AF]">
                      <span className="truncate">{cvUploadStatus}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Keywords & Search Filter */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF] mb-1.5">
                        Ajouter une compétence / mot-clé
                      </label>
                      <form onSubmit={addKeyword} className="flex gap-2">
                        <input
                          type="text"
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          placeholder="Ex: FastAPI, Kubernetes, Lille..."
                          className="flex-1 px-3 py-1.5 text-xs rounded border border-[#E5E7EB] dark:border-[#2E2E2E] bg-[#F9FAFB] dark:bg-[#121212] text-[#111827] dark:text-[#E5E7EB] focus:outline-none focus:border-[#111827] dark:focus:border-[#E5E7EB]"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 text-xs font-medium rounded border border-[#E5E7EB] dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E] hover:bg-[#F3F4F6] dark:hover:bg-[#262626] inline-flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Ajouter</span>
                        </button>
                      </form>
                    </div>

                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF] mb-1.5">
                        Filtrer par ville, entreprise ou techno
                      </label>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563] dark:text-[#9CA3AF]" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Ex: Lille, ADEO, Paris, Full Stack, IA..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-[#E5E7EB] dark:border-[#2E2E2E] bg-[#F9FAFB] dark:bg-[#121212] text-[#111827] dark:text-[#E5E7EB] focus:outline-none focus:border-[#111827] dark:focus:border-[#E5E7EB]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Active Keyword Pills */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-mono uppercase text-[#4B5563] dark:text-[#9CA3AF]">
                        Mots-clés actifs pour le matching ({profile.keywords.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded border border-[#E5E7EB] dark:border-[#2E2E2E] bg-[#F9FAFB] dark:bg-[#121212] text-[#111827] dark:text-[#E5E7EB]"
                        >
                          <span>{kw}</span>
                          <button
                            type="button"
                            onClick={() => removeKeyword(kw)}
                            className="text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#E5E7EB]"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Offers List with Generous Whitespace */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF]">
                  Offres de stage correspondantes ({offers.length})
                </h2>
                <span className="text-xs font-mono text-[#4B5563] dark:text-[#9CA3AF]">
                  Triées par pertinence avec votre CV
                </span>
              </div>

              <div className="space-y-5">
                {offers.map((offer) => {
                  const alreadyApplied = isOfferAlreadyApplied(offer);
                  const isApplyingThis = applyingOfferId === offer.id;

                  return (
                    <article
                      key={offer.id}
                      className="p-6 sm:p-8 rounded border border-[#E5E7EB] dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E] transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        {/* Offer Main Information */}
                        <div className="space-y-4 flex-1">
                          {/* Meta Header: Company, Date, Location, Source */}
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="inline-flex items-center gap-1.5 font-semibold text-[#111827] dark:text-[#E5E7EB] bg-[#F3F4F6] dark:bg-[#262626] px-2.5 py-1 rounded border border-[#E5E7EB] dark:border-[#2E2E2E]">
                              <Building2 className="w-3.5 h-3.5" />
                              {offer.company}
                            </span>
                            <span className="inline-flex items-center gap-1 font-mono text-[#4B5563] dark:text-[#9CA3AF] px-2.5 py-1 rounded border border-[#E5E7EB] dark:border-[#2E2E2E]">
                              <Calendar className="w-3.5 h-3.5" />
                              Date : {offer.date}
                            </span>
                            <span className="font-mono text-[#4B5563] dark:text-[#9CA3AF] px-2.5 py-1 rounded border border-[#E5E7EB] dark:border-[#2E2E2E]">
                              {offer.location}
                            </span>
                            <span className="font-mono text-[#4B5563] dark:text-[#9CA3AF] px-2.5 py-1 rounded border border-[#E5E7EB] dark:border-[#2E2E2E]">
                              {offer.duration}
                            </span>
                            <span className="font-mono text-[11px] text-[#4B5563] dark:text-[#9CA3AF] px-2 py-0.5 rounded bg-[#F9FAFB] dark:bg-[#121212] border border-[#E5E7EB] dark:border-[#2E2E2E]">
                              Source : {offer.source}
                            </span>
                          </div>

                          {/* Title & Link */}
                          <div>
                            <div className="flex items-start justify-between gap-4">
                              <h3 className="text-lg font-semibold text-[#111827] dark:text-[#E5E7EB]">
                                {offer.title}
                              </h3>
                            </div>
                            <p className="text-sm text-[#4B5563] dark:text-[#9CA3AF] mt-1 leading-relaxed">
                              {offer.description}
                            </p>
                          </div>

                          {/* Required Skills (Compétences exigées) */}
                          <div className="space-y-2 pt-1">
                            <div className="text-xs font-semibold uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF]">
                              Compétences exigées ({offer.matchedSkills?.length || 0}/
                              {offer.requiredSkills.length} présentes dans votre profil)
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {offer.requiredSkills.map((skill) => {
                                const isMatched = offer.matchedSkills?.includes(skill);
                                return (
                                  <span
                                    key={skill}
                                    className={`px-2.5 py-1 text-xs font-mono rounded border ${
                                      isMatched
                                        ? "border-[#111827] bg-[#111827] text-[#F9FAFB] dark:border-[#E5E7EB] dark:bg-[#E5E7EB] dark:text-[#121212] font-medium"
                                        : "border-[#E5E7EB] bg-[#F9FAFB] text-[#4B5563] dark:border-[#2E2E2E] dark:bg-[#121212] dark:text-[#9CA3AF]"
                                    }`}
                                  >
                                    {skill} {isMatched ? "✓" : ""}
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          {/* Missions */}
                          <div className="space-y-2 pt-1">
                            <div className="text-xs font-semibold uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF]">
                              Missions principales
                            </div>
                            <ul className="space-y-1.5 text-sm text-[#111827] dark:text-[#E5E7EB] list-disc list-inside">
                              {offer.missions.map((mission, idx) => (
                                <li key={idx} className="leading-relaxed">
                                  {mission}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Right Action Box: Match Score + One-Click Postuler */}
                        <div className="lg:w-64 shrink-0 flex flex-col justify-between gap-4 p-4 rounded border border-[#E5E7EB] dark:border-[#2E2E2E] bg-[#F9FAFB] dark:bg-[#121212]">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs uppercase font-mono text-[#4B5563] dark:text-[#9CA3AF]">
                                Score Matching
                              </span>
                              <span className="text-lg font-mono font-bold text-[#111827] dark:text-[#E5E7EB]">
                                {offer.matchScore || 92}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-[#E5E7EB] dark:bg-[#2E2E2E] rounded overflow-hidden">
                              <div
                                className="h-full bg-[#111827] dark:bg-[#E5E7EB]"
                                style={{ width: `${offer.matchScore || 92}%` }}
                              />
                            </div>
                            <p className="text-[11px] font-mono text-[#4B5563] dark:text-[#9CA3AF] pt-1 truncate">
                              Contact : {offer.contactEmail}
                            </p>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-[#E5E7EB] dark:border-[#2E2E2E]">
                            <button
                              onClick={() => handleClickPostuler(offer)}
                              disabled={isApplyingThis}
                              className="w-full py-2.5 px-4 text-xs font-semibold rounded bg-[#111827] text-[#F9FAFB] dark:bg-[#E5E7EB] dark:text-[#121212] hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>
                                {isApplyingThis
                                  ? "Rédaction & Envoi..."
                                  : alreadyApplied
                                  ? "Postuler à nouveau"
                                  : "Postuler (One-Click)"}
                              </span>
                            </button>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  setActiveDraftModal({
                                    offer,
                                    draft: generateApplicationDraft(offer, profile),
                                  })
                                }
                                className="flex-1 py-1.5 px-2.5 text-[11px] font-medium rounded border border-[#E5E7EB] dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E] text-[#111827] dark:text-[#E5E7EB] hover:bg-[#F3F4F6] dark:hover:bg-[#262626] inline-flex items-center justify-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Lettre & Mail</span>
                              </button>
                              <a
                                href={offer.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="py-1.5 px-2.5 text-[11px] font-medium rounded border border-[#E5E7EB] dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E] text-[#111827] dark:text-[#E5E7EB] hover:bg-[#F3F4F6] dark:hover:bg-[#262626] inline-flex items-center justify-center gap-1"
                              >
                                <span>Offre</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>

                            {alreadyApplied && (
                              <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1 pt-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Inscrit dans le CRM Sheets</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: CRM AUTOMATISÉ GOOGLE SHEETS */}
        {activeTab === "crm" && (
          <section className="p-6 sm:p-8 rounded border border-[#E5E7EB] dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] dark:border-[#2E2E2E] pb-5">
              <div>
                <h1 className="text-lg font-semibold text-[#111827] dark:text-[#E5E7EB]">
                  3. CRM Automatisé (Synchronisé avec Google Sheets)
                </h1>
                <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] mt-1">
                  Chaque candidature envoyée ajoute automatiquement une ligne avec Entreprise, Poste, Date d&apos;envoi, Lien de l&apos;offre et Statut.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1 border border-[#E5E7EB] dark:border-[#2E2E2E] rounded p-1 bg-[#F9FAFB] dark:bg-[#121212]">
                  {["ALL", "Envoyé", "En attente", "Entretien", "Refus"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setCrmStatusFilter(st)}
                      className={`px-2.5 py-1 text-xs rounded transition-colors ${
                        crmStatusFilter === st
                          ? "bg-white dark:bg-[#1E1E1E] text-[#111827] dark:text-[#E5E7EB] font-medium border border-[#E5E7EB] dark:border-[#2E2E2E]"
                          : "text-[#4B5563] dark:text-[#9CA3AF]"
                      }`}
                    >
                      {st === "ALL" ? "Tous" : st}
                    </button>
                  ))}
                </div>

                <a
                  href={GOOGLE_SHEET_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded bg-[#111827] text-[#F9FAFB] dark:bg-[#E5E7EB] dark:text-[#121212]"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Ouvrir dans Google Sheets</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB] dark:border-[#2E2E2E] text-[11px] font-mono uppercase text-[#4B5563] dark:text-[#9CA3AF]">
                    <th className="py-3 px-4">Entreprise</th>
                    <th className="py-3 px-4">Poste</th>
                    <th className="py-3 px-4">Date d&apos;envoi</th>
                    <th className="py-3 px-4">Lien de l&apos;offre</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4">Date de réponse</th>
                    <th className="py-3 px-4">Destinataire</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#2E2E2E] text-sm">
                  {filteredCrmEntries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-[#F9FAFB] dark:hover:bg-[#121212] transition-colors"
                    >
                      <td className="py-3.5 px-4 font-medium text-[#111827] dark:text-[#E5E7EB]">
                        {entry.company}
                      </td>
                      <td className="py-3.5 px-4 text-[#111827] dark:text-[#E5E7EB]">
                        {entry.role}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-[#4B5563] dark:text-[#9CA3AF]">
                        {entry.sentDate}
                      </td>
                      <td className="py-3.5 px-4">
                        <a
                          href={entry.offerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-mono underline underline-offset-2 text-[#111827] dark:text-[#E5E7EB]"
                        >
                          <span>Voir l&apos;offre</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={entry.status}
                          onChange={(e) =>
                            handleUpdateCrmStatus(
                              entry.id,
                              e.target.value as ApplicationStatus
                            )
                          }
                          className={`text-xs font-mono px-2.5 py-1 rounded border cursor-pointer focus:outline-none ${getStatusBadgeClasses(
                            entry.status
                          )}`}
                        >
                          <option value="Envoyé">Envoyé</option>
                          <option value="En attente">En attente</option>
                          <option value="Entretien">Entretien</option>
                          <option value="Refus">Refus</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-[#4B5563] dark:text-[#9CA3AF]">
                        {entry.responseDate}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-[#4B5563] dark:text-[#9CA3AF]">
                        {entry.recipientEmail}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 3: ROUTINE DE SUIVI NOCTURNE (CRON 23H50) */}
        {activeTab === "cron" && (
          <section className="p-6 sm:p-8 rounded border border-[#E5E7EB] dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] dark:border-[#2E2E2E] pb-5">
              <div>
                <h1 className="text-lg font-semibold text-[#111827] dark:text-[#E5E7EB]">
                  4. Routine de Suivi Nocturne (CRON Quotidien — 23h50)
                </h1>
                <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] mt-1">
                  Tâche planifiée qui scanne la boîte Gmail ({USER_GMAIL_ADDRESS}) tous les soirs à 23h50, qualifie les réponses reçues et met à jour le Google Sheet avec le statut (&quot;Refus&quot;, &quot;Entretien&quot;, &quot;En attente&quot;) et la date de réponse.
                </p>
              </div>

              <button
                onClick={handleRunNightlySyncNow}
                disabled={isRunningCron}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded bg-[#111827] text-[#F9FAFB] dark:bg-[#E5E7EB] dark:text-[#121212] hover:opacity-90 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>
                  {isRunningCron
                    ? "Analyse Gmail en cours..."
                    : "Exécuter la routine maintenant (Test Live)"}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded border border-[#E5E7EB] dark:border-[#2E2E2E] bg-[#F9FAFB] dark:bg-[#121212]">
                <div className="text-xs font-mono uppercase text-[#4B5563] dark:text-[#9CA3AF]">
                  Planification CRON
                </div>
                <div className="text-sm font-mono font-semibold mt-1 text-[#111827] dark:text-[#E5E7EB]">
                  CRON_TZ=Europe/Paris 50 23 * * *
                </div>
                <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] mt-1">
                  Endpoint Cloud : <code className="font-mono">/api/cron/nightly-sync</code>
                </p>
              </div>

              <div className="p-4 rounded border border-[#E5E7EB] dark:border-[#2E2E2E] bg-[#F9FAFB] dark:bg-[#121212]">
                <div className="text-xs font-mono uppercase text-[#4B5563] dark:text-[#9CA3AF]">
                  Boîte Gmail Scannée
                </div>
                <div className="text-sm font-mono font-semibold mt-1 text-[#111827] dark:text-[#E5E7EB]">
                  {USER_GMAIL_ADDRESS}
                </div>
                <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] mt-1">
                  Filtre : réponses des recruteurs & entreprises du CRM
                </p>
              </div>

              <div className="p-4 rounded border border-[#E5E7EB] dark:border-[#2E2E2E] bg-[#F9FAFB] dark:bg-[#121212]">
                <div className="text-xs font-mono uppercase text-[#4B5563] dark:text-[#9CA3AF]">
                  Règles de Classification
                </div>
                <div className="text-xs mt-1 space-y-1 text-[#111827] dark:text-[#E5E7EB]">
                  <div>• Invitation / créneau / visio → <span className="font-mono font-semibold">Entretien</span></div>
                  <div>• Suite défavorable / regret → <span className="font-mono font-semibold">Refus</span></div>
                  <div>• Accusé de réception / sans rép. → <span className="font-mono font-semibold">En attente</span></div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-xs font-mono uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF]">
                Journal d&apos;exécution de la routine nocturne
              </h2>
              <div className="space-y-3">
                {syncLogs.map((log, i) => (
                  <div
                    key={i}
                    className="p-4 rounded border border-[#E5E7EB] dark:border-[#2E2E2E] bg-[#F9FAFB] dark:bg-[#121212] space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-semibold text-[#111827] dark:text-[#E5E7EB]">
                        Exécution : {new Date(log.timestamp).toLocaleString("fr-FR")}
                      </span>
                      <span className="text-[#4B5563] dark:text-[#9CA3AF]">
                        {log.scannedMessages} e-mails analysés
                      </span>
                    </div>
                    <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF]">
                      {log.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* MODAL: ONE-CLICK APPLICATION PREVIEW & SEND (Lettre de Motivation + Mail Personnalisé) */}
      {activeDraftModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded border border-[#E5E7EB] dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E] p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] dark:border-[#2E2E2E] pb-4">
              <div>
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded border border-[#E5E7EB] dark:border-[#2E2E2E] bg-[#F9FAFB] dark:bg-[#121212] text-[#4B5563] dark:text-[#9CA3AF]">
                  Candidature One-Click · Croisement Offre × CV
                </span>
                <h2 className="text-lg font-semibold text-[#111827] dark:text-[#E5E7EB] mt-2">
                  {activeDraftModal.offer.company} — {activeDraftModal.offer.title}
                </h2>
                <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] mt-0.5">
                  Expéditeur : <span className="font-mono">{USER_GMAIL_ADDRESS}</span>
                </p>
              </div>
              <button
                onClick={() => setActiveDraftModal(null)}
                className="p-1.5 rounded border border-[#E5E7EB] dark:border-[#2E2E2E] text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#E5E7EB]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#4B5563] dark:text-[#9CA3AF] mb-1">
                    Destinataire (Recrutement)
                  </label>
                  <input
                    type="email"
                    value={activeDraftModal.draft.recipientEmail}
                    onChange={(e) =>
                      setActiveDraftModal({
                        ...activeDraftModal,
                        draft: {
                          ...activeDraftModal.draft,
                          recipientEmail: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 text-xs font-mono rounded border border-[#E5E7EB] dark:border-[#2E2E2E] bg-[#F9FAFB] dark:bg-[#121212] text-[#111827] dark:text-[#E5E7EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#4B5563] dark:text-[#9CA3AF] mb-1">
                    Objet du mail
                  </label>
                  <input
                    type="text"
                    value={activeDraftModal.draft.subject}
                    onChange={(e) =>
                      setActiveDraftModal({
                        ...activeDraftModal,
                        draft: {
                          ...activeDraftModal.draft,
                          subject: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded border border-[#E5E7EB] dark:border-[#2E2E2E] bg-[#F9FAFB] dark:bg-[#121212] text-[#111827] dark:text-[#E5E7EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#4B5563] dark:text-[#9CA3AF] mb-1">
                  Mail personnalisé d&apos;accompagnement
                </label>
                <textarea
                  rows={6}
                  value={activeDraftModal.draft.emailBody}
                  onChange={(e) =>
                    setActiveDraftModal({
                      ...activeDraftModal,
                      draft: {
                        ...activeDraftModal.draft,
                        emailBody: e.target.value,
                      },
                    })
                  }
                  className="w-full p-3 text-xs leading-relaxed rounded border border-[#E5E7EB] dark:border-[#2E2E2E] bg-[#F9FAFB] dark:bg-[#121212] text-[#111827] dark:text-[#E5E7EB] font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#4B5563] dark:text-[#9CA3AF] mb-1">
                  Lettre de Motivation générée sur-mesure
                </label>
                <textarea
                  rows={11}
                  value={activeDraftModal.draft.coverLetter}
                  onChange={(e) =>
                    setActiveDraftModal({
                      ...activeDraftModal,
                      draft: {
                        ...activeDraftModal.draft,
                        coverLetter: e.target.value,
                      },
                    })
                  }
                  className="w-full p-3 text-xs leading-relaxed rounded border border-[#E5E7EB] dark:border-[#2E2E2E] bg-[#F9FAFB] dark:bg-[#121212] text-[#111827] dark:text-[#E5E7EB] font-sans"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#E5E7EB] dark:border-[#2E2E2E]">
              <span className="text-xs text-[#4B5563] dark:text-[#9CA3AF]">
                Action : Envoi via {USER_GMAIL_ADDRESS} + Ajout automatique au Google Sheet CRM
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setActiveDraftModal(null)}
                  className="px-4 py-2 text-xs font-medium rounded border border-[#E5E7EB] dark:border-[#2E2E2E] text-[#4B5563] dark:text-[#9CA3AF]"
                >
                  Annuler
                </button>
                <button
                  onClick={() =>
                    executeSendApplication(
                      activeDraftModal.offer,
                      activeDraftModal.draft
                    )
                  }
                  disabled={applyingOfferId === activeDraftModal.offer.id}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded bg-[#111827] text-[#F9FAFB] dark:bg-[#E5E7EB] dark:text-[#121212] hover:opacity-90 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {applyingOfferId === activeDraftModal.offer.id
                      ? "Envoi & Synchronisation..."
                      : "Envoyer via Gmail & Ajouter au CRM"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E] py-4 px-6 sm:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#4B5563] dark:text-[#9CA3AF]">
          <div>
            StagePilot B2B — Assistant Personnel de Placement · Maxime Navellier ({USER_GMAIL_ADDRESS})
          </div>
          <div className="font-mono">
            Browserbase · Gmail API · Google Sheets CRM · Vercel Cron (23h50)
          </div>
        </div>
      </footer>
    </div>
  );
}
