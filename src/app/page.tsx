"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  ExternalLink,
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
  Trash2,
  SlidersHorizontal,
  MapPin,
  GraduationCap,
  Coins,
  Gift,
  Bookmark,
  Settings,
  Sparkles,
  ShieldCheck,
  BellRing,
  Download,
  Copy,
  Check,
  UserCheck,
} from "lucide-react";
import {
  ApplicationStatus,
  CandidateProfile,
  CrmEntry,
  GeneratedApplication,
  JobOffer,
  NightlySyncLog,
  SearchFilters,
  UserWorkspaceConfig,
} from "@/lib/types";
import {
  DEFAULT_CANDIDATE_PROFILE,
  generateApplicationDraft,
  GOOGLE_SHEET_ID,
  GOOGLE_SHEET_URL,
  UNIVERSAL_DOMAIN_PRESETS,
  USER_GMAIL_ADDRESS,
  VERIFIED_JOB_OFFERS,
  matchAndRankOffers,
} from "@/lib/offers-data";

const DEFAULT_FILTERS: SearchFilters = {
  city: "Lille / Hauts-de-France (Priorité) + France",
  radiusKm: 25,
  durationFilter: "ALL",
  studyLevelFilter: "ALL",
  workModeFilter: "ALL",
  minRemuneration: 0,
  requiredPerk: "ALL",
  maxOffers: 35,
  onlyVerifiedEmails: false,
  onlyFavorites: false,
  contractTypeFilter: "STAGE_ONLY",
};

function getSourceBadgeStyle(source: string): { label: string; classes: string } {
  const s = (source || "").toLowerCase();
  if (s.includes("welcome") || s.includes("wttj")) {
    return {
      label: "🌟 Welcome to the Jungle",
      classes:
        "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/60",
    };
  }
  if (s.includes("mulliez") || s.includes("afm")) {
    return {
      label: "🏢 Portail Galaxie Mulliez / AFM",
      classes:
        "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700/60",
    };
  }
  if (s.includes("banque") || s.includes("assurance")) {
    return {
      label: "🏦 Portail Banques & Assurances",
      classes:
        "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/60",
    };
  }
  if (s.includes("1jeune") || s.includes("gouv")) {
    return {
      label: "🇫🇷 1jeune1solution.gouv",
      classes:
        "bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700/60",
    };
  }
  if (s.includes("stage.fr")) {
    return {
      label: "🎓 Stage.fr",
      classes:
        "bg-violet-50 text-violet-800 border-violet-300 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-700/60",
    };
  }
  if (s.includes("indeed")) {
    return {
      label: "🔎 Indeed",
      classes:
        "bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-700/60",
    };
  }
  if (s.includes("linkedin")) {
    return {
      label: "💼 LinkedIn Jobs",
      classes:
        "bg-indigo-50 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-700/60",
    };
  }
  return {
    label: `🌐 ${source}`,
    classes:
      "bg-teal-50 text-teal-800 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-700/60",
  };
}

const APPS_SCRIPT_SNIPPET = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.company,
    data.role,
    data.sentDate,
    data.offerUrl,
    data.status || "Envoyé",
    data.responseDate || "En attente",
    data.recipientEmail
  ]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

export default function StagePilotDashboard() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeTab, setActiveTab] = useState<"offers" | "crm" | "cron">("offers");

  // Multi-user Workspace Configuration (persisted per user in browser)
  const [userConfig, setUserConfig] = useState<UserWorkspaceConfig>({
    fullName: DEFAULT_CANDIDATE_PROFILE.fullName,
    email: USER_GMAIL_ADDRESS,
    googleSheetUrl: GOOGLE_SHEET_URL,
    googleSheetId: GOOGLE_SHEET_ID,
    googleAppsScriptWebhookUrl: "",
    autoMailScanEnabled: true,
  });
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Profile & Scraping state
  const [profile, setProfile] = useState<CandidateProfile>(DEFAULT_CANDIDATE_PROFILE);
  const [hasCustomCvLoaded, setHasCustomCvLoaded] = useState(false);
  const [keywordInput, setKeywordInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("Data Analyst");
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [showFiltersPanel, setShowFiltersPanel] = useState<boolean>(false);
  const [favoriteOfferIds, setFavoriteOfferIds] = useState<string[]>([]);
  const [currentOffset, setCurrentOffset] = useState<number>(0);
  const [sourceBreakdown, setSourceBreakdown] = useState<Record<string, number>>({});
  const [rejectedCdiCount, setRejectedCdiCount] = useState<number>(0);
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"score" | "salary">("score");

  const [rawScrapedOffers, setRawScrapedOffers] = useState<JobOffer[]>(VERIFIED_JOB_OFFERS);
  const [offers, setOffers] = useState<JobOffer[]>(() =>
    matchAndRankOffers(VERIFIED_JOB_OFFERS, DEFAULT_CANDIDATE_PROFILE.keywords, "Data Analyst")
  );
  const [isScraping, setIsScraping] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastScrapedAt, setLastScrapedAt] = useState<string>("En direct");
  const [cvUploadStatus, setCvUploadStatus] = useState<string>(
    "Importez votre CV (.pdf) — Détection auto de votre métier (Psycho, Méca, Data, Marketing, RH...) & compétences"
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hasInitialScraped = useRef<boolean>(false);

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
  const [newCrmCompany, setNewCrmCompany] = useState("");
  const [newCrmRole, setNewCrmRole] = useState("");
  const [newCrmUrl, setNewCrmUrl] = useState("");

  const isMainAntigravityAccount =
    userConfig.email.trim().toLowerCase() === USER_GMAIL_ADDRESS.toLowerCase();

  // Theme + LocalStorage User Workspace Initialization
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    // Load saved user workspace config, favorites, and personal CRM if any
    try {
      const savedConfig = localStorage.getItem("stagepilot-user-config-v2");
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig) as UserWorkspaceConfig;
        setUserConfig(parsed);
        setProfile((prev) => ({
          ...prev,
          fullName: parsed.fullName || prev.fullName,
          email: parsed.email || prev.email,
        }));
      }
      const savedFavs = localStorage.getItem("stagepilot-favorites-v2");
      if (savedFavs) {
        setFavoriteOfferIds(JSON.parse(savedFavs));
      }
      const savedProfile = localStorage.getItem("stagepilot-profile-v2");
      if (savedProfile) {
        const p = JSON.parse(savedProfile) as CandidateProfile;
        setProfile(p);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("stagepilot-theme", next);
  };

  // Save profile changes to localStorage so each user keeps their skills/CV
  useEffect(() => {
    try {
      localStorage.setItem("stagepilot-profile-v2", JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  // Load CRM entries (isolated per user email in localStorage, or from server for Maxime)
  useEffect(() => {
    const storageKey = `stagepilot-crm-${userConfig.email.toLowerCase().trim()}`;
    const localSaved = localStorage.getItem(storageKey);

    if (!isMainAntigravityAccount && localSaved) {
      try {
        setCrmEntries(JSON.parse(localSaved));
        return;
      } catch {
        // fallback
      }
    }

    fetch("/api/crm")
      .then((r) => r.json())
      .then((data) => {
        if (isMainAntigravityAccount) {
          if (Array.isArray(data.entries)) {
            setCrmEntries(data.entries);
            localStorage.setItem(storageKey, JSON.stringify(data.entries));
          }
          if (Array.isArray(data.logs)) setSyncLogs(data.logs);
        } else {
          // New external user starts with their own clean CRM (or saved local CRM)
          setCrmEntries(localSaved ? JSON.parse(localSaved) : []);
        }
      })
      .catch(() => {});
  }, [userConfig.email, isMainAntigravityAccount]);

  const persistUserCrm = (nextEntries: CrmEntry[]) => {
    setCrmEntries(nextEntries);
    try {
      const storageKey = `stagepilot-crm-${userConfig.email.toLowerCase().trim()}`;
      localStorage.setItem(storageKey, JSON.stringify(nextEntries));
    } catch {
      // ignore
    }
  };

  // Re-rank offers whenever keywords or scraped pool change while preserving Top Employer & Lille priority boosts
  useEffect(() => {
    const ranked = matchAndRankOffers(rawScrapedOffers, profile.keywords, searchQuery);
    const isLillePreferred = /lille|hauts-de-france|nord|priorit[ée]/i.test(filters.city);
    const boosted = ranked.map((offer) => {
      let score = offer.matchScore || 50;
      if (offer.isTopDataEmployer) score += 8;
      const isLille =
        /\b(lille|villeneuve[\s-]?d['’]?ascq|lezennes|roubaix|lesquin|hem|tourcoing|marcq|seclin|douai|valenciennes|59|hauts[\s-]?de[\s-]?france|nord)\b/i.test(
          (offer.location || "").toLowerCase()
        );
      if (isLillePreferred && isLille) score += 6;
      return { ...offer, matchScore: Math.min(99, score) };
    });
    boosted.sort((a, b) => {
      const diff = (b.matchScore || 0) - (a.matchScore || 0);
      if (diff !== 0) return diff;
      const locA = /\b(lille|villeneuve|lezennes|roubaix|lesquin|hem|59|nord)\b/i.test(a.location) ? 2 : /paris|75|92/i.test(a.location) ? 1 : 0;
      const locB = /\b(lille|villeneuve|lezennes|roubaix|lesquin|hem|59|nord)\b/i.test(b.location) ? 2 : /paris|75|92/i.test(b.location) ? 1 : 0;
      return locB - locA;
    });
    setOffers(boosted);
  }, [rawScrapedOffers, profile.keywords, filters.city]);

  // Auto-scrape on mount & when searchQuery, city, radius, or maxOffers change
  useEffect(() => {
    if (!hasInitialScraped.current) {
      hasInitialScraped.current = true;
      triggerScraping(
        profile.keywords,
        profile.cvRawText,
        searchQuery,
        filters.city,
        filters.radiusKm,
        filters.maxOffers,
        true
      );
      return;
    }

    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        triggerScraping(
          profile.keywords,
          profile.cvRawText,
          searchQuery,
          filters.city,
          filters.radiusKm,
          filters.maxOffers,
          true,
          0,
          filters.contractTypeFilter
        );
      }
    }, 650);

    return () => clearTimeout(timer);
  }, [searchQuery, filters.city, filters.radiusKm, filters.maxOffers, filters.contractTypeFilter]);

  // Client-side filtering & sorting on top of live scraped offers (city, source, duration, studyLevel, workMode, remuneration, perks, favorites)
  const displayedOffers = useMemo(() => {
    const cityTrim = filters.city.trim().toLowerCase();
    const isBroadFranceOrPriority =
      !cityTrim || cityTrim === "france" || cityTrim.includes("priorité");

    const filtered = offers.filter((offer) => {
      if (!isBroadFranceOrPriority) {
        const offerLoc = (offer.location || "").toLowerCase();
        if (cityTrim.includes("lille")) {
          if (
            !/\b(lille|villeneuve|lezennes|roubaix|lesquin|hem|tourcoing|marcq|seclin|douai|valenciennes|59|nord|hauts-de-france)\b/i.test(
              offerLoc
            )
          ) {
            return false;
          }
        } else if (cityTrim.includes("paris")) {
          if (
            !/\b(paris|massy|nanterre|montrouge|boulogne|issy|d[ée]fense|neuilly|courbevoie|levallois|75|92|93|94|91|78|idf|[îi]le-de-france)\b/i.test(
              offerLoc
            )
          ) {
            return false;
          }
        } else if (!offerLoc.includes(cityTrim) && offerLoc !== "france") {
          return false;
        }
      }
      if (selectedSourceFilter !== "ALL") {
        const matchesMain = offer.source === selectedSourceFilter;
        const matchesMerged = offer.mergedSources?.includes(selectedSourceFilter);
        if (!matchesMain && !matchesMerged) return false;
      }
      if (filters.onlyFavorites && !favoriteOfferIds.includes(offer.id)) {
        return false;
      }
      if (filters.onlyVerifiedEmails && !offer.emailVerified) {
        return false;
      }
      if (filters.durationFilter !== "ALL") {
        const m = offer.durationMonths || 6;
        if (filters.durationFilter === "1-2" && m > 2) return false;
        if (filters.durationFilter === "3-4" && (m < 3 || m > 4)) return false;
        if (filters.durationFilter === "5-6" && m < 5) return false;
      }
      if (filters.studyLevelFilter !== "ALL") {
        const lvl = (offer.studyLevel || "").toUpperCase();
        if (filters.studyLevelFilter === "BAC+2" && !lvl.includes("BAC+2") && !lvl.includes("BAC+3")) return false;
        if (filters.studyLevelFilter === "BAC+3" && !lvl.includes("BAC+3") && !lvl.includes("BAC+4")) return false;
        if (filters.studyLevelFilter === "BAC+4" && !lvl.includes("BAC+4") && !lvl.includes("BAC+5")) return false;
        if (filters.studyLevelFilter === "BAC+5" && !lvl.includes("BAC+5") && !lvl.includes("MASTER")) return false;
      }
      if (filters.workModeFilter !== "ALL" && offer.workMode !== filters.workModeFilter) {
        return false;
      }
      if (filters.minRemuneration > 0 && (offer.remunerationMin || 800) < filters.minRemuneration) {
        return false;
      }
      if (filters.requiredPerk !== "ALL") {
        const perksText = (offer.perks || []).join(" ").toLowerCase();
        if (!perksText.includes(filters.requiredPerk.toLowerCase())) {
          return false;
        }
      }
      return true;
    });

    if (sortBy === "salary") {
      return [...filtered].sort(
        (a, b) => (b.remunerationMin || 0) - (a.remunerationMin || 0)
      );
    }
    return filtered;
  }, [offers, filters, favoriteOfferIds, selectedSourceFilter, sortBy]);

  // Calculate Top Application Stats
  const stats = useMemo(() => {
    const total = crmEntries.length;
    const waiting = crmEntries.filter(
      (e) => e.status === "Envoyé" || e.status === "En attente"
    ).length;
    const positive = crmEntries.filter((e) => e.status === "Entretien").length;
    const refused = crmEntries.filter((e) => e.status === "Refus").length;
    const positiveUnreplied = crmEntries.filter(
      (e) => e.status === "Entretien" && !e.repliedToPositive
    ).length;

    return {
      total,
      waiting,
      positive,
      refused,
      positiveUnreplied,
    };
  }, [crmEntries]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.city !== "Lille / Hauts-de-France (Priorité) + France" && filters.city !== "France") count++;
    if (filters.contractTypeFilter !== "STAGE_ONLY") count++;
    if (filters.durationFilter !== "ALL") count++;
    if (filters.studyLevelFilter !== "ALL") count++;
    if (filters.workModeFilter !== "ALL") count++;
    if (filters.minRemuneration > 0) count++;
    if (filters.requiredPerk !== "ALL") count++;
    if (filters.onlyVerifiedEmails) count++;
    if (filters.onlyFavorites) count++;
    if (selectedSourceFilter !== "ALL") count++;
    return count;
  }, [filters, selectedSourceFilter]);

  const toggleFavorite = (offerId: string) => {
    setFavoriteOfferIds((prev) => {
      const next = prev.includes(offerId)
        ? prev.filter((id) => id !== offerId)
        : [...prev, offerId];
      try {
        localStorage.setItem("stagepilot-favorites-v2", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCvUploadStatus(`Analyse approfondie du CV « ${file.name} » en cours...`);
    setIsScraping(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const parseRes = await fetch("/api/parse-cv", {
        method: "POST",
        body: formData,
      });
      const parsedData = await parseRes.json();

      if (!parseRes.ok || !parsedData.profile) {
        throw new Error(parsedData.error || "Impossible de lire ce fichier PDF");
      }

      const newProfile: CandidateProfile = parsedData.profile;
      const nextQuery: string = parsedData.suggestedQuery || "Data Analyst";

      setProfile(newProfile);
      setHasCustomCvLoaded(true);
      setSearchQuery(nextQuery);
      setCvUploadStatus(
        `CV actif : ${file.name} → Métier détecté : « ${nextQuery} » (${newProfile.keywords.length} compétences extraites)`
      );

      await triggerScraping(
        newProfile.keywords,
        newProfile.cvRawText,
        nextQuery,
        filters.city,
        filters.radiusKm,
        filters.maxOffers,
        false
      );
    } catch (err) {
      setCvUploadStatus(`Erreur de lecture sur ${file.name} : ${String(err)}`);
      setIsScraping(false);
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

  const clearAllKeywords = () => {
    setProfile({
      ...profile,
      keywords: [],
    });
  };

  const triggerScraping = async (
    customKeywords = profile.keywords,
    customCvText = profile.cvRawText,
    customQuery = searchQuery,
    customCity = filters.city,
    customRadius = filters.radiusKm,
    customMaxOffers = filters.maxOffers,
    silent = false,
    appendOffset = 0,
    customContractTypeFilter = filters.contractTypeFilter
  ) => {
    if (appendOffset > 0) {
      setIsLoadingMore(true);
    } else {
      setIsScraping(true);
      setCurrentOffset(0);
    }

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: customKeywords,
          cvText: customCvText,
          searchQuery: customQuery,
          location: customCity,
          radiusKm: customRadius,
          maxOffers: customMaxOffers,
          startOffset: appendOffset,
          contractTypeFilter: customContractTypeFilter,
        }),
      });
      const data = await res.json();
      if (data.sourceBreakdown && typeof data.sourceBreakdown === "object") {
        setSourceBreakdown(data.sourceBreakdown);
      }
      if (typeof data.rejectedCdiCount === "number") {
        setRejectedCdiCount(data.rejectedCdiCount);
      }
      if (Array.isArray(data.offers) && data.offers.length > 0) {
        if (appendOffset > 0) {
          setRawScrapedOffers((prev) => {
            const existingIds = new Set(prev.map((o) => o.id));
            const fresh = data.offers.filter((o: JobOffer) => !existingIds.has(o.id));
            const combined = [...prev, ...fresh];
            setOffers(matchAndRankOffers(combined, customKeywords, customQuery));
            return combined;
          });
          setCurrentOffset(appendOffset);
        } else {
          setRawScrapedOffers(data.offers);
          setOffers(data.offers);
        }
      }
      setLastScrapedAt(
        new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      if (!silent) {
        setNotification({
          type: "info",
          title: `Recherche Multi-Sources : « Stage ${data.effectiveQuery || customQuery} » (${customCity})`,
          detail: `${data.offers?.length || 0} offres de stage vérifiées (0% CDI/CDD) fusionnées depuis LinkedIn, WTTJ, 1jeune1solution, Stage.fr, Indeed & Portails Entreprises.`,
        });
      }
    } catch {
      const fallback = matchAndRankOffers(VERIFIED_JOB_OFFERS, customKeywords, customQuery);
      setRawScrapedOffers(fallback);
      setOffers(fallback);
    } finally {
      setIsScraping(false);
      setIsLoadingMore(false);
    }
  };

  const handleClickPostuler = async (offer: JobOffer) => {
    const draft = generateApplicationDraft(offer, {
      ...profile,
      fullName: userConfig.fullName || profile.fullName,
      email: userConfig.email || profile.email,
    });
    if (oneClickDirectMode) {
      await executeSendApplication(offer, draft);
    } else {
      setActiveDraftModal({ offer, draft });
    }
  };

  const executeSendApplication = async (
    offer: JobOffer,
    draft: GeneratedApplication,
    openGmailTab = false
  ) => {
    setApplyingOfferId(offer.id);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offer,
          profile,
          userConfig,
          customSubject: draft.subject,
          customEmailBody: draft.emailBody,
          customCoverLetter: draft.coverLetter,
          customRecipientEmail: draft.recipientEmail,
        }),
      });
      const data = await res.json();

      if (data.crmEntry) {
        const nextEntries = [data.crmEntry, ...crmEntries];
        persistUserCrm(nextEntries);
      }

      if (openGmailTab && data.gmail?.gmailComposeUrl) {
        window.open(data.gmail.gmailComposeUrl, "_blank", "noopener,noreferrer");
      }

      setActiveDraftModal(null);
      setNotification({
        type: "success",
        title: `Candidature enregistrée : ${offer.company} (${offer.title})`,
        detail: isMainAntigravityAccount
          ? `${data.gmail?.message || `Envoyé via ${userConfig.email}`} Ligne ajoutée dans votre Google Sheet.`
          : `Ligne ajoutée à votre suivi CRM${userConfig.googleAppsScriptWebhookUrl ? " et à votre Google Sheet personnel" : ""}. Utilisez le lien Gmail ci-dessous si vous souhaitez expédier le mail depuis votre boîte.`,
        gmailUrl: data.gmail?.gmailComposeUrl,
        sheetUrl: userConfig.googleSheetUrl || GOOGLE_SHEET_URL,
      });
    } catch (err) {
      setNotification({
        type: "error",
        title: "Échec de l'envoi de la candidature",
        detail: String(err),
      });
    } finally {
      setApplyingOfferId(null);
    }
  };

  const handleRunNightlySyncNow = async () => {
    if (!isMainAntigravityAccount) {
      setNotification({
        type: "info",
        title: "Scan automatique Gmail désactivé pour les comptes externes",
        detail:
          "L'automation nocturne Antigravity est reliée à la boîte principale de Maxime. Pour votre compte, vos candidatures s'ajoutent bien à votre CRM/Google Sheet et vous pouvez mettre à jour vos statuts en 1 clic.",
      });
      return;
    }

    setIsRunningCron(true);
    try {
      const res = await fetch("/api/cron/nightly-sync", { method: "POST" });
      const data = await res.json();
      if (Array.isArray(data.entries)) {
        persistUserCrm(data.entries);
      }
      if (data.syncLog) {
        setSyncLogs((prev) => [data.syncLog, ...prev]);
      }
      setNotification({
        type: "info",
        title: "Routine de Suivi Nocturne exécutée",
        detail:
          data.syncLog?.summary ||
          `Boîte ${userConfig.email} analysée et Google Sheet mis à jour.`,
        sheetUrl: userConfig.googleSheetUrl,
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
    const nextEntries = crmEntries.map((item) =>
      item.id === id
        ? {
            ...item,
            status: newStatus,
            responseDate: newStatus === "Envoyé" ? "En attente" : today,
            repliedToPositive:
              newStatus === "Entretien" ? (item.repliedToPositive ?? false) : undefined,
          }
        : item
    );
    persistUserCrm(nextEntries);

    if (isMainAntigravityAccount) {
      await fetch("/api/crm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus, responseDate: today }),
      });
    }
  };

  const handleToggleRepliedToPositive = async (id: string, currentVal?: boolean) => {
    const nextVal = !currentVal;
    const nextEntries = crmEntries.map((item) =>
      item.id === id ? { ...item, repliedToPositive: nextVal } : item
    );
    persistUserCrm(nextEntries);

    if (isMainAntigravityAccount) {
      await fetch("/api/crm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, repliedToPositive: nextVal }),
      });
    }
  };

  const handleAddManualCrmEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrmCompany.trim() || !newCrmRole.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    const manualEntry: CrmEntry = {
      id: `manual-${Date.now()}`,
      company: newCrmCompany.trim(),
      role: newCrmRole.trim(),
      sentDate: today,
      offerUrl: newCrmUrl.trim() || "https://www.linkedin.com/jobs",
      status: "Envoyé",
      responseDate: "En attente",
      recipientEmail: "Portail / Candidature directe",
      repliedToPositive: false,
    };
    persistUserCrm([manualEntry, ...crmEntries]);
    setNewCrmCompany("");
    setNewCrmRole("");
    setNewCrmUrl("");
  };

  const exportCrmToCsv = () => {
    const headers = [
      "Entreprise",
      "Poste",
      "Date d'envoi",
      "Lien de l'offre",
      "Statut",
      "Date de réponse",
      "Destinataire",
      "Répondu au recruteur",
    ];
    const rows = crmEntries.map((e) => [
      `"${(e.company || "").replace(/"/g, '""')}"`,
      `"${(e.role || "").replace(/"/g, '""')}"`,
      e.sentDate,
      e.offerUrl,
      e.status,
      e.responseDate,
      e.recipientEmail,
      e.status === "Entretien" ? (e.repliedToPositive ? "Oui" : "À répondre !") : "-",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `suivi-stages-${userConfig.fullName.replace(/\s+/g, "-")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveWorkspaceConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const idMatch = userConfig.googleSheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const extractedId = idMatch ? idMatch[1] : userConfig.googleSheetId;
    const isOwner =
      userConfig.email.trim().toLowerCase() === USER_GMAIL_ADDRESS.toLowerCase();

    const updatedConfig: UserWorkspaceConfig = {
      ...userConfig,
      googleSheetId: extractedId || GOOGLE_SHEET_ID,
      autoMailScanEnabled: isOwner,
    };

    setUserConfig(updatedConfig);
    setProfile((prev) => ({
      ...prev,
      fullName: updatedConfig.fullName || prev.fullName,
      email: updatedConfig.email || prev.email,
    }));
    localStorage.setItem("stagepilot-user-config-v2", JSON.stringify(updatedConfig));
    setShowWorkspaceModal(false);

    setNotification({
      type: "success",
      title: "Espace personnel mis à jour",
      detail: isOwner
        ? `Connecté au compte principal (${updatedConfig.email}) : Google Sheet + Scan Gmail nocturne 23h50 activés.`
        : `Profil configuré pour ${updatedConfig.fullName} (${updatedConfig.email}). Vos statistiques et votre Google Sheet sont isolés pour votre compte (suivi auto des mails désactivé).`,
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
      : crmStatusFilter === "TO_REPLY"
      ? crmEntries.filter((e) => e.status === "Entretien" && !e.repliedToPositive)
      : crmEntries.filter((e) => e.status === crmStatusFilter);

  const getStatusBadgeClasses = (status: ApplicationStatus) => {
    switch (status) {
      case "Entretien":
        return "border-emerald-500/40 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-950/50 dark:text-emerald-300";
      case "Refus":
        return "border-rose-500/40 bg-rose-50 text-rose-800 dark:border-rose-500/40 dark:bg-rose-950/50 dark:text-rose-300";
      case "En attente":
        return "border-amber-500/40 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/50 dark:text-amber-300";
      case "Envoyé":
      default:
        return "border-indigo-500/30 bg-indigo-50 text-indigo-800 dark:border-indigo-400/30 dark:bg-indigo-950/40 dark:text-indigo-300";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] text-[#111827] dark:bg-[#121212] dark:text-[#E5E7EB] transition-colors">
      {/* Top Modern SaaS Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 dark:border-[#2A2A2A] bg-white/95 dark:bg-[#1A1A1A]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              SP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-base text-[#111827] dark:text-[#E5E7EB]">
                  StagePilot
                </span>
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                  Assistant Universel de Stages
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">
                Profil : <span className="font-medium text-gray-700 dark:text-gray-300">{userConfig.fullName}</span> ({userConfig.email}) ·{" "}
                {isMainAntigravityAccount ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Suivi Gmail 23h50 Actif
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    Mode Google Sheet Personnel (Scan auto mails désactivé)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 border border-gray-200 dark:border-[#2E2E2E] rounded-xl p-1 bg-gray-100/80 dark:bg-[#121212]">
            <button
              onClick={() => setActiveTab("offers")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "offers"
                  ? "bg-white dark:bg-[#242424] text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Offres</span>
              <span className="font-mono text-[11px] px-1.5 py-0.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 rounded-md">
                {displayedOffers.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("crm")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "crm"
                  ? "bg-white dark:bg-[#242424] text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Suivi & Sheet</span>
              <span className="font-mono text-[11px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 rounded-md">
                {crmEntries.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("cron")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "cron"
                  ? "bg-white dark:bg-[#242424] text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Automatisation</span>
            </button>
          </nav>

          {/* Right Utilities: Personal Account / Sheet Setup + Theme Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWorkspaceModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-950/70 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mon Sheet & Compte</span>
            </button>

            <a
              href={userConfig.googleSheetUrl || GOOGLE_SHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-gray-200 dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Google Sheet</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>

            <button
              onClick={toggleTheme}
              aria-label="Basculer Mode Clair / Mode Sombre"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-gray-200 dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Clair</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Sombre</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Notification Banner */}
        {notification && (
          <div className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 bg-white dark:bg-[#1E1E1E] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              {notification.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : notification.type === "error" ? (
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
              ) : (
                <Sparkles className="w-5 h-5 mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
              )}
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#111827] dark:text-[#E5E7EB]">
                  {notification.title}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {notification.detail}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {notification.gmailUrl && (
                    <a
                      href={notification.gmailUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Ouvrir le mail prêt dans Gmail ({userConfig.email})</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {notification.sheetUrl && (
                    <a
                      href={notification.sheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Voir mon Google Sheet</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="self-end sm:self-center p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Application Statistics Bar (5 KPI Cards requested by user) */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div
            onClick={() => {
              setActiveTab("crm");
              setCrmStatusFilter("ALL");
            }}
            className="p-4 rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1E1E1E] shadow-sm hover:border-indigo-400 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              <span>Candidatures</span>
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <Send className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl font-bold text-[#111827] dark:text-white">
              {stats.total}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 truncate">
              Total envoyées / suivies
            </p>
          </div>

          <div
            onClick={() => {
              setActiveTab("crm");
              setCrmStatusFilter("En attente");
            }}
            className="p-4 rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1E1E1E] shadow-sm hover:border-amber-400 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              <span>Sans réponse</span>
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <Clock className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats.waiting}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 truncate">
              En attente de retour RH
            </p>
          </div>

          <div
            onClick={() => {
              setActiveTab("crm");
              setCrmStatusFilter("Entretien");
            }}
            className="p-4 rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1E1E1E] shadow-sm hover:border-emerald-400 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              <span>Réponses +</span>
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.positive}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 truncate">
              Entretiens / Retours positifs
            </p>
          </div>

          <div
            onClick={() => {
              setActiveTab("crm");
              setCrmStatusFilter("TO_REPLY");
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
              stats.positiveUnreplied > 0
                ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 dark:border-emerald-500/70"
                : "border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1E1E1E]"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
              <span>À répondre !</span>
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                <BellRing className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {stats.positiveUnreplied}
            </div>
            <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1 truncate">
              Réponse + non répondue
            </p>
          </div>

          <div
            onClick={() => {
              setActiveTab("crm");
              setCrmStatusFilter("Refus");
            }}
            className="p-4 rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1E1E1E] shadow-sm hover:border-rose-400 transition-all cursor-pointer col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              <span>Refus</span>
              <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                <X className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {stats.refused}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 truncate">
              Candidatures clôturées
            </p>
          </div>
        </section>

        {/* TAB 1: MOTEUR DE SCRAPING, FILTRES AVANCÉS & MATCHING UNIVERSEL */}
        {activeTab === "offers" && (
          <div className="space-y-6">
            {/* Control Panel: CV Upload + Universal Domains + Skills + Filters */}
            <section className="p-6 sm:p-7 rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1E1E1E] shadow-sm space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 dark:border-[#2A2A2A] pb-5">
                <div>
                  <h1 className="text-lg font-bold text-[#111827] dark:text-[#E5E7EB] flex items-center gap-2">
                    <span>Recherche de Stage en Direct & Matching sur-mesure</span>
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Compatible avec tous les secteurs (Data, Informatique, Psychologie, Mécanique, Marketing, Finance, RH, Droit, BTP...).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all ${
                      showFiltersPanel || activeFiltersCount > 0
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-500"
                        : "border-gray-200 dark:border-[#2E2E2E] bg-gray-50 dark:bg-[#141414] text-gray-700 dark:text-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Filtres avancés</span>
                    {activeFiltersCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-indigo-600 text-white">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        onlyFavorites: !prev.onlyFavorites,
                      }))
                    }
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all ${
                      filters.onlyFavorites
                        ? "border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        : "border-gray-200 dark:border-[#2E2E2E] bg-gray-50 dark:bg-[#141414] text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Favoris ({favoriteOfferIds.length})</span>
                  </button>

                  <button
                    onClick={() =>
                      triggerScraping(
                        profile.keywords,
                        profile.cvRawText,
                        searchQuery,
                        filters.city,
                        filters.radiusKm,
                        filters.maxOffers,
                        false
                      )
                    }
                    disabled={isScraping}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? "animate-spin" : ""}`} />
                    <span>{isScraping ? "Recherche live..." : "Actualiser les offres"}</span>
                  </button>
                </div>
              </div>

              {/* Universal Domain Presets (All Professions) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Secteurs & Métiers (Cliquez pour adapter la recherche)
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Dernière synchro live : {lastScrapedAt}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {UNIVERSAL_DOMAIN_PRESETS.map((preset) => {
                    const isSelected =
                      searchQuery.toLowerCase() === preset.query.toLowerCase();
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setSearchQuery(preset.query);
                          const nextSkills = hasCustomCvLoaded
                            ? profile.keywords
                            : preset.defaultSkills;
                          if (!hasCustomCvLoaded) {
                            setProfile((prev) => ({
                              ...prev,
                              targetRole: `Stage ${preset.query}`,
                              keywords: preset.defaultSkills,
                            }));
                          }
                          triggerScraping(
                            nextSkills,
                            profile.cvRawText,
                            preset.query,
                            filters.city,
                            filters.radiusKm,
                            filters.maxOffers,
                            false
                          );
                        }}
                        className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                            : "border-gray-200 dark:border-[#2E2E2E] bg-gray-50/80 dark:bg-[#141414] text-gray-700 dark:text-gray-300 hover:border-indigo-400"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Expandable Advanced Filters Drawer */}
              {showFiltersPanel && (
                <div className="p-5 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-[#161822] space-y-4">
                  <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/40 pb-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-950 dark:text-indigo-200">
                      <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Filtres avancés : Localisation & Rayon, Durée, Niveau d&apos;études, Rémunération, Avantages & Nombre d&apos;offres</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFilters(DEFAULT_FILTERS)}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Réinitialiser les filtres
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* City Filter */}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">
                        Ville ou Région (Priorité Lille & Nord par défaut)
                      </label>
                      <div className="relative">
                        <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={filters.city}
                          onChange={(e) =>
                            setFilters({ ...filters, city: e.target.value })
                          }
                          placeholder="Ex: Lille, Paris, Lyon, France..."
                          className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#2E2E2E] bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {[
                          { label: "⭐ Lille (Priorité) + France", val: "Lille / Hauts-de-France (Priorité) + France" },
                          { label: "Lille / Nord", val: "Lille" },
                          { label: "Paris / IDF", val: "Paris" },
                          { label: "Lyon", val: "Lyon" },
                          { label: "Nantes", val: "Nantes" },
                          { label: "Bordeaux", val: "Bordeaux" },
                          { label: "Toulouse", val: "Toulouse" },
                          { label: "France entière", val: "France" },
                        ].map((c) => (
                          <button
                            key={c.val}
                            type="button"
                            onClick={() => setFilters({ ...filters, city: c.val })}
                            className={`px-2 py-0.5 text-[10px] rounded-md border ${
                              filters.city.toLowerCase() === c.val.toLowerCase()
                                ? "border-indigo-600 bg-indigo-600 text-white font-semibold"
                                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Strict Contract Type Filter (Anti-CDI/CDD) */}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-emerald-700 dark:text-emerald-400 mb-1">
                        🛡️ Type de contrat (Anti-CDI actif)
                      </label>
                      <select
                        value={filters.contractTypeFilter}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            contractTypeFilter: e.target.value as SearchFilters["contractTypeFilter"],
                          })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 dark:border-emerald-800/70 bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 font-semibold"
                      >
                        <option value="STAGE_ONLY">Stages uniquement (0% CDI/CDD — Par défaut)</option>
                        <option value="STAGE_AND_ALTERNANCE">Stages + Alternances (0% CDI/CDD)</option>
                        <option value="ALTERNANCE_ONLY">Alternances uniquement</option>
                      </select>
                    </div>

                    {/* Radius in km */}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">
                        Rayon autour de la ville : {filters.radiusKm} km
                      </label>
                      <select
                        value={filters.radiusKm}
                        onChange={(e) =>
                          setFilters({ ...filters, radiusKm: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#2E2E2E] bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100"
                      >
                        <option value={5}>5 km (Centre-ville uniquement)</option>
                        <option value={10}>10 km (Agglomération proche)</option>
                        <option value={25}>25 km (Métropole — Recommandé)</option>
                        <option value={50}>50 km (Département / Région proche)</option>
                        <option value={100}>100 km (Élargi)</option>
                      </select>
                    </div>

                    {/* Duration Filter */}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">
                        Durée du stage
                      </label>
                      <select
                        value={filters.durationFilter}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            durationFilter: e.target.value as SearchFilters["durationFilter"],
                          })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#2E2E2E] bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100"
                      >
                        <option value="ALL">Toutes les durées</option>
                        <option value="1-2">1 à 2 mois (Stage court / Découverte)</option>
                        <option value="3-4">3 à 4 mois (Stage Licence / BUT / M1)</option>
                        <option value="5-6">5 à 6 mois (Stage Fin d&apos;études / M2)</option>
                      </select>
                    </div>

                    {/* Study Level Filter */}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">
                        Niveau d&apos;études
                      </label>
                      <select
                        value={filters.studyLevelFilter}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            studyLevelFilter: e.target.value as SearchFilters["studyLevelFilter"],
                          })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#2E2E2E] bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100"
                      >
                        <option value="ALL">Tous niveaux d&apos;études</option>
                        <option value="BAC+2">Bac+2 (BTS / BUT 2)</option>
                        <option value="BAC+3">Bac+3 (Licence / BUT 3 / Bachelor)</option>
                        <option value="BAC+4">Bac+4 (Master 1 / École)</option>
                        <option value="BAC+5">Bac+5 (Master 2 / Ingénieur / PFE)</option>
                      </select>
                    </div>

                    {/* Min Remuneration Filter */}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">
                        Gratification / Rémunération min.
                      </label>
                      <select
                        value={filters.minRemuneration}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            minRemuneration: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#2E2E2E] bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100"
                      >
                        <option value={0}>Toutes rémunérations</option>
                        <option value={650}>≥ 650 € / mois (Minimum légal+)</option>
                        <option value={950}>≥ 950 € / mois</option>
                        <option value={1200}>≥ 1 200 € / mois</option>
                        <option value={1400}>≥ 1 400 € / mois (Grands groupes)</option>
                      </select>
                    </div>

                    {/* Perks Filter */}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">
                        Avantages & Primes
                      </label>
                      <select
                        value={filters.requiredPerk}
                        onChange={(e) =>
                          setFilters({ ...filters, requiredPerk: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#2E2E2E] bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100"
                      >
                        <option value="ALL">Tous les avantages</option>
                        <option value="Tickets Restaurant">Tickets Restaurant / RIE</option>
                        <option value="Transport">Remboursement Transport</option>
                        <option value="Télétravail">Télétravail autorisé</option>
                        <option value="Prime">Prime / Gratification majorée</option>
                        <option value="CSE">Avantages CSE / Groupe</option>
                      </select>
                    </div>

                    {/* Work Mode Filter */}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">
                        Mode de travail
                      </label>
                      <select
                        value={filters.workModeFilter}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            workModeFilter: e.target.value as SearchFilters["workModeFilter"],
                          })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#2E2E2E] bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100"
                      >
                        <option value="ALL">Présentiel ou Télétravail</option>
                        <option value="Présentiel">Présentiel</option>
                        <option value="Hybride / Télétravail">Hybride / Télétravail partiel</option>
                        <option value="Télétravail complet">Télétravail complet</option>
                      </select>
                    </div>

                    {/* Number of offers to load */}
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">
                        Nombre d&apos;offres à charger
                      </label>
                      <select
                        value={filters.maxOffers}
                        onChange={(e) =>
                          setFilters({ ...filters, maxOffers: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#2E2E2E] bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 font-semibold"
                      >
                        <option value={15}>15 offres par recherche</option>
                        <option value={25}>25 offres par recherche</option>
                        <option value={35}>35 offres par recherche (Recommandé)</option>
                        <option value={50}>50 offres par recherche (Maximum)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: CV PDF Upload */}
                <div className="lg:col-span-5 space-y-2.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    1. Importer votre CV (.PDF ou .TXT)
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-5 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-[#161822] hover:border-indigo-500 dark:hover:border-indigo-400 transition-all cursor-pointer flex flex-col justify-between gap-3"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.txt"
                      onChange={handleCvUpload}
                      className="hidden"
                    />
                    <div className="flex items-start gap-3.5">
                      <div className="p-2.5 rounded-xl bg-indigo-600 text-white shrink-0">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#111827] dark:text-[#E5E7EB]">
                          Cliquez pour importer votre CV (.pdf)
                        </p>
                        <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
                          Détecte automatiquement votre métier (Psychologue, Data Analyst, Mécanicien, RH, Marketing...) et remplace les compétences par celles de votre CV.
                        </p>
                      </div>
                    </div>
                    <div className="pt-2.5 border-t border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-[11px] font-medium text-indigo-700 dark:text-indigo-300">
                      <span className="truncate">{cvUploadStatus}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Search Query & Skills Management (with Clear All button!) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                        2. Rechercher n&apos;importe quel métier
                      </label>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          triggerScraping(
                            profile.keywords,
                            profile.cvRawText,
                            searchQuery,
                            filters.city,
                            filters.radiusKm,
                            filters.maxOffers,
                            false
                          );
                        }}
                        className="flex gap-2"
                      >
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Ex: Psychologue, Data Analyst, Mécanicien..."
                            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#2E2E2E] bg-gray-50 dark:bg-[#121212] text-[#111827] dark:text-[#E5E7EB] focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isScraping}
                          className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                          Chercher
                        </button>
                      </form>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                        3. Ajouter une compétence / un outil
                      </label>
                      <form onSubmit={addKeyword} className="flex gap-2">
                        <input
                          type="text"
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          placeholder="Ex: Bilan clinique, SolidWorks, SQL, Canva..."
                          className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#2E2E2E] bg-gray-50 dark:bg-[#121212] text-[#111827] dark:text-[#E5E7EB] focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="submit"
                          className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E] hover:bg-gray-50 dark:hover:bg-[#262626] inline-flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Ajouter</span>
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Active Keyword Pills + Clear All Skills Button */}
                  <div className="p-4 rounded-2xl border border-gray-100 dark:border-[#262626] bg-gray-50/70 dark:bg-[#141414] space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Compétences de votre profil ({profile.keywords.length})
                      </span>

                      <div className="flex items-center gap-2">
                        {profile.keywords.length > 0 ? (
                          <button
                            type="button"
                            onClick={clearAllKeywords}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Supprimer toutes les compétences</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setProfile({
                                ...profile,
                                keywords: DEFAULT_CANDIDATE_PROFILE.keywords,
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Restaurer compétences par défaut</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {profile.keywords.length === 0 ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic py-1">
                        Aucune compétence sélectionnée. Ajoutez vos compétences ci-dessus ou importez votre CV PDF !
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {profile.keywords.map((kw) => (
                          <span
                            key={kw}
                            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border border-indigo-200/80 dark:border-indigo-800/60 bg-white dark:bg-[#1E1E1E] text-indigo-950 dark:text-indigo-200 shadow-2xs"
                          >
                            <span>{kw}</span>
                            <button
                              type="button"
                              onClick={() => removeKeyword(kw)}
                              className="text-gray-400 hover:text-rose-600 dark:hover:text-rose-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Multi-Source Breakdown Bar & Anti-CDI Shield */}
            <section className="p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1E1E1E] shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Sources interrogées & Déduplication active</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>
                      Filtre strict Anti-CDI/CDD actif
                      {rejectedCdiCount > 0 ? ` (${rejectedCdiCount} CDI/CDD écartés)` : ""}
                    </span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { label: "⭐ Priorité Lille + France", city: "Lille / Hauts-de-France (Priorité) + France" },
                    { label: "📍 Lille / Nord uniquement", city: "Lille" },
                    { label: "📍 Paris / IDF", city: "Paris" },
                  ].map((btn) => (
                    <button
                      key={btn.city}
                      type="button"
                      onClick={() => setFilters({ ...filters, city: btn.city })}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-xl border transition-all ${
                        filters.city === btn.city
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-gray-200 dark:border-[#2E2E2E] bg-gray-50 dark:bg-[#141414] text-gray-700 dark:text-gray-300 hover:border-indigo-400"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clickable Source Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedSourceFilter("ALL")}
                  className={`px-3 py-1 text-xs font-semibold rounded-xl border transition-all ${
                    selectedSourceFilter === "ALL"
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-gray-200 dark:border-[#2E2E2E] bg-gray-50 dark:bg-[#141414] text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Toutes les sources ({offers.length})
                </button>
                {Object.entries(sourceBreakdown).map(([srcName, count]) => {
                  const badge = getSourceBadgeStyle(srcName);
                  const isActive = selectedSourceFilter === srcName;
                  return (
                    <button
                      key={srcName}
                      type="button"
                      onClick={() =>
                        setSelectedSourceFilter(isActive ? "ALL" : srcName)
                      }
                      className={`px-3 py-1 text-xs font-semibold rounded-xl border transition-all ${
                        isActive
                          ? "border-indigo-600 bg-indigo-600 text-white shadow-xs"
                          : badge.classes
                      }`}
                    >
                      {badge.label} ({count})
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Offers List */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Offres de stage correspondantes ({displayedOffers.length})
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-medium">
                    📍 {filters.city}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                    Trier par :
                  </span>
                  <div className="inline-flex rounded-xl border border-gray-200 dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E] p-0.5">
                    <button
                      type="button"
                      onClick={() => setSortBy("score")}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                        sortBy === "score"
                          ? "bg-indigo-600 text-white"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                      }`}
                    >
                      Compatibilité CV
                    </button>
                    <button
                      type="button"
                      onClick={() => setSortBy("salary")}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                        sortBy === "salary"
                          ? "bg-emerald-600 text-white"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                      }`}
                    >
                      💰 Meilleure rémunération
                    </button>
                  </div>
                </div>
              </div>

              {displayedOffers.length === 0 ? (
                <div className="p-12 rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1E1E1E] text-center space-y-3">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Aucune offre ne correspond à ces filtres stricts.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Essayez d&apos;élargir les filtres (source, durée, rémunération minimale) ou de réinitialiser.
                  </p>
                  <button
                    onClick={() => {
                      setFilters(DEFAULT_FILTERS);
                      setSelectedSourceFilter("ALL");
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white"
                  >
                    Réinitialiser tous les filtres
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedOffers.map((offer) => {
                    const alreadyApplied = isOfferAlreadyApplied(offer);
                    const isApplyingThis = applyingOfferId === offer.id;
                    const isFav = favoriteOfferIds.includes(offer.id);
                    const score = offer.matchScore || 88;
                    const sourceBadge = getSourceBadgeStyle(offer.source);

                    return (
                      <article
                        key={offer.id}
                        className="p-6 sm:p-7 rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1E1E1E] hover:border-indigo-300 dark:hover:border-indigo-800/70 transition-all shadow-xs"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                          {/* Offer Main Information */}
                          <div className="space-y-4 flex-1">
                            {/* Meta Header: Company, Top Data Employer Badge, Source Badge, Location, Duration */}
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="inline-flex items-center gap-1.5 font-bold text-indigo-950 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-200/80 dark:border-indigo-800/60">
                                <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                {offer.company}
                              </span>

                              {/* Source Badge + Deduplicated Merged Sources */}
                              <a
                                href={offer.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Ouvrir l'annonce originale sur la source"
                                className={`inline-flex items-center gap-1 font-semibold px-2.5 py-1 rounded-xl border hover:opacity-90 transition-opacity ${sourceBadge.classes}`}
                              >
                                <span>{sourceBadge.label}</span>
                                <ExternalLink className="w-3 h-3 opacity-75" />
                              </a>

                              {offer.mergedSources && offer.mergedSources.length > 1 && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                                  🔗 Fusionné ({offer.mergedSources.join(" + ")})
                                </span>
                              )}

                              {offer.isTopDataEmployer && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-100/90 text-amber-900 border border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700">
                                  ★ Top Employeur Data · {offer.companyGroup || "Avantages Premium"}
                                </span>
                              )}

                              <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-1 rounded-xl">
                                {offer.contractType || "Stage"}
                              </span>

                              <span className="inline-flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#262626] px-2.5 py-1 rounded-xl">
                                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                                {offer.location}
                              </span>
                              <span className="inline-flex items-center gap-1 font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-[#262626] px-2.5 py-1 rounded-xl">
                                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                {offer.duration}
                              </span>
                              {offer.studyLevel && (
                                <span className="inline-flex items-center gap-1 font-medium text-violet-800 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/50 border border-violet-200/60 dark:border-violet-800/50 px-2.5 py-1 rounded-xl">
                                  <GraduationCap className="w-3.5 h-3.5" />
                                  {offer.studyLevel}
                                </span>
                              )}
                              {offer.workMode && (
                                <span className="inline-flex items-center gap-1 font-medium text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 border border-sky-200/60 dark:border-sky-800/50 px-2.5 py-1 rounded-xl">
                                  {offer.workMode}
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 px-2 py-0.5 text-[11px]">
                                <Calendar className="w-3 h-3" />
                                {offer.date}
                              </span>
                            </div>

                            {/* Title & Description */}
                            <div>
                              <div className="flex items-start justify-between gap-3">
                                <h3 className="text-lg font-bold text-[#111827] dark:text-white">
                                  {offer.title}
                                </h3>
                                <button
                                  type="button"
                                  onClick={() => toggleFavorite(offer.id)}
                                  title="Sauvegarder dans mes favoris"
                                  className={`p-2 rounded-xl border transition-colors ${
                                    isFav
                                      ? "border-amber-400 bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
                                      : "border-gray-200 dark:border-[#2E2E2E] text-gray-400 hover:text-amber-500"
                                  }`}
                                >
                                  <Bookmark className="w-4 h-4 fill-current" />
                                </button>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                                {offer.description}
                              </p>
                            </div>

                            {/* Remuneration & Perks Bar */}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              {offer.remuneration && (
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${
                                    offer.isRemunerationEstimated
                                      ? "border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300"
                                      : "border-emerald-500 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-950 dark:text-emerald-200"
                                  }`}
                                >
                                  <Coins className="w-3.5 h-3.5" />
                                  <span>
                                    {offer.remuneration}{" "}
                                    <span className="font-normal text-[11px] opacity-85">
                                      {offer.isRemunerationEstimated
                                        ? `(Barème ${offer.companyGroup || "entreprise"})`
                                        : "(Affiché dans l'offre)"}
                                    </span>
                                  </span>
                                </span>
                              )}

                              {offer.perks &&
                                offer.perks.map((perk) => (
                                  <span
                                    key={perk}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium border border-amber-200/80 dark:border-amber-800/50 bg-amber-50/60 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300"
                                  >
                                    <Gift className="w-3 h-3" />
                                    <span>{perk}</span>
                                  </span>
                                ))}
                            </div>

                            {/* Detailed Group Perks Box (when available from Top Data Employers DB) */}
                            {offer.perksDetailed && (
                              <div className="p-3.5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-[#131d19] space-y-2">
                                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                  <span>
                                    Détail Salaires, Primes & Avantages Groupe ({offer.companyGroup || offer.company})
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
                                  {offer.perksDetailed.bonus && (
                                    <div>
                                      <span className="font-semibold text-emerald-800 dark:text-emerald-300">💰 Gratification & Primes : </span>
                                      {offer.perksDetailed.bonus}
                                    </div>
                                  )}
                                  {offer.perksDetailed.meal && (
                                    <div>
                                      <span className="font-semibold text-emerald-800 dark:text-emerald-300">🍽️ Restauration : </span>
                                      {offer.perksDetailed.meal}
                                    </div>
                                  )}
                                  {offer.perksDetailed.transport && (
                                    <div>
                                      <span className="font-semibold text-emerald-800 dark:text-emerald-300">🚆 Transport & Mobilité : </span>
                                      {offer.perksDetailed.transport}
                                    </div>
                                  )}
                                  {offer.perksDetailed.cse && (
                                    <div>
                                      <span className="font-semibold text-emerald-800 dark:text-emerald-300">🎁 CSE & Avantages : </span>
                                      {offer.perksDetailed.cse}
                                    </div>
                                  )}
                                  {offer.perksDetailed.remote && (
                                    <div>
                                      <span className="font-semibold text-emerald-800 dark:text-emerald-300">🏠 Télétravail : </span>
                                      {offer.perksDetailed.remote}
                                    </div>
                                  )}
                                  {offer.perksDetailed.hiring && (
                                    <div>
                                      <span className="font-semibold text-emerald-800 dark:text-emerald-300">🚀 Pré-embauche CDI : </span>
                                      {offer.perksDetailed.hiring}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Required Skills */}
                            <div className="space-y-2 pt-1">
                              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Compétences & Outils ({offer.matchedSkills?.length || 0}/
                                {offer.requiredSkills.length} présents dans votre profil)
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {offer.requiredSkills.map((skill) => {
                                  const isMatched = offer.matchedSkills?.includes(skill);
                                  return (
                                    <span
                                      key={skill}
                                      className={`px-3 py-1 text-xs font-medium rounded-full border ${
                                        isMatched
                                          ? "border-emerald-500/50 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-500/40 font-semibold"
                                          : "border-gray-200 dark:border-[#2E2E2E] bg-gray-50 dark:bg-[#141414] text-gray-600 dark:text-gray-400"
                                      }`}
                                    >
                                      {skill} {isMatched ? "✓" : ""}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Missions */}
                            <div className="space-y-1.5 pt-1">
                              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Missions principales
                              </div>
                              <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200 list-disc list-inside">
                                {offer.missions.map((mission, idx) => (
                                  <li key={idx} className="leading-relaxed">
                                    {mission}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Right Action Box: Match Score + Verified Email Status + One-Click Postuler */}
                          <div className="lg:w-72 shrink-0 flex flex-col justify-between gap-4 p-5 rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-gray-50/80 dark:bg-[#151515]">
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                                  Compatibilité CV
                                </span>
                                <span
                                  className={`text-lg font-bold px-2.5 py-0.5 rounded-lg ${
                                    score >= 80
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                      : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                                  }`}
                                >
                                  {score}%
                                </span>
                              </div>
                              <div className="w-full h-2 bg-gray-200 dark:bg-[#2E2E2E] rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    score >= 80 ? "bg-emerald-500" : "bg-indigo-600"
                                  }`}
                                  style={{ width: `${score}%` }}
                                />
                              </div>

                              {/* Recruitment Contact Transparency Box */}
                              <div className="pt-2 space-y-1.5">
                                {offer.emailVerified ? (
                                  <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                                    <span>Email direct vérifié dans l&apos;annonce</span>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span>Portail RH + Mail entreprise suggéré</span>
                                  </div>
                                )}
                                <p className="text-[11px] font-mono text-gray-600 dark:text-gray-400 truncate">
                                  {offer.contactEmail}
                                </p>
                                {!offer.emailVerified && (
                                  <a
                                    href={`https://www.google.com/search?q=${encodeURIComponent(
                                      `email recrutement stage "${offer.company}"`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                                  >
                                    <Search className="w-3 h-3" />
                                    <span>Vérifier le contact RH sur Google</span>
                                  </a>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-[#2A2A2A]">
                              <button
                                onClick={() => handleClickPostuler(offer)}
                                disabled={isApplyingThis}
                                className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>
                                  {isApplyingThis
                                    ? "Génération & Envoi..."
                                    : alreadyApplied
                                    ? "Postuler à nouveau"
                                    : "Postuler (Lettre + Mail)"}
                                </span>
                              </button>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    setActiveDraftModal({
                                      offer,
                                      draft: generateApplicationDraft(offer, {
                                        ...profile,
                                        fullName: userConfig.fullName || profile.fullName,
                                        email: userConfig.email || profile.email,
                                      }),
                                    })
                                  }
                                  className="flex-1 py-2 px-2.5 text-[11px] font-semibold rounded-xl border border-gray-200 dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E] text-gray-700 dark:text-gray-200 hover:bg-gray-50 inline-flex items-center justify-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Lettre & Mail</span>
                                </button>
                                <a
                                  href={offer.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 py-2 px-2.5 text-[11px] font-semibold rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 inline-flex items-center justify-center gap-1"
                                >
                                  <span>Portail Offre</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>

                              {alreadyApplied && (
                                <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1 pt-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Ajouté à votre suivi CRM</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {/* Load More Offers Pagination Button */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={isLoadingMore || isScraping}
                  onClick={() =>
                    triggerScraping(
                      profile.keywords,
                      profile.cvRawText,
                      searchQuery,
                      filters.city,
                      filters.radiusKm,
                      25,
                      false,
                      currentOffset + 25
                    )
                  }
                  className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold rounded-2xl border border-indigo-300 dark:border-indigo-800 bg-white dark:bg-[#1E1E1E] text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 shadow-sm disabled:opacity-50 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {isLoadingMore
                      ? "Chargement de 25 nouvelles offres..."
                      : "Charger 25 offres supplémentaires en direct"}
                  </span>
                </button>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: CRM AUTOMATISÉ & SUIVI DES RÉPONSES */}
        {activeTab === "crm" && (
          <section className="p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1E1E1E] shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 dark:border-[#2A2A2A] pb-5">
              <div>
                <h1 className="text-lg font-bold text-[#111827] dark:text-[#E5E7EB]">
                  Suivi des Candidatures & Synchronisation Google Sheets
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Suivez vos candidatures, vos relances et cochez les réponses positives auxquelles vous avez répondu.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap items-center gap-1 border border-gray-200 dark:border-[#2E2E2E] rounded-xl p-1 bg-gray-50 dark:bg-[#121212]">
                  {[
                    { id: "ALL", label: `Toutes (${crmEntries.length})` },
                    { id: "TO_REPLY", label: `À répondre ! (${stats.positiveUnreplied})` },
                    { id: "Entretien", label: `Réponses + (${stats.positive})` },
                    { id: "En attente", label: "En attente" },
                    { id: "Envoyé", label: "Envoyé" },
                    { id: "Refus", label: `Refus (${stats.refused})` },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setCrmStatusFilter(st.id)}
                      className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                        crmStatusFilter === st.id
                          ? "bg-indigo-600 text-white font-semibold"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={exportCrmToCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E] text-gray-700 dark:text-gray-200 hover:bg-gray-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exporter CSV</span>
                </button>

                <a
                  href={userConfig.googleSheetUrl || GOOGLE_SHEET_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Ouvrir mon Google Sheet</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Quick Add Manual Application Form */}
            <form
              onSubmit={handleAddManualCrmEntry}
              className="p-4 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-gray-50/70 dark:bg-[#141414] flex flex-col sm:flex-row items-center gap-3"
            >
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 shrink-0">
                + Ajouter une candidature externe :
              </span>
              <input
                type="text"
                value={newCrmCompany}
                onChange={(e) => setNewCrmCompany(e.target.value)}
                placeholder="Entreprise (ex: CHU Lille, Renault...)"
                className="w-full sm:w-48 px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E]"
              />
              <input
                type="text"
                value={newCrmRole}
                onChange={(e) => setNewCrmRole(e.target.value)}
                placeholder="Poste (ex: Stage Psychologue, Data...)"
                className="w-full sm:flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E]"
              />
              <input
                type="text"
                value={newCrmUrl}
                onChange={(e) => setNewCrmUrl(e.target.value)}
                placeholder="Lien de l'offre (optionnel)"
                className="w-full sm:w-52 px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E]"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shrink-0"
              >
                Ajouter
              </button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-[#2E2E2E] text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
                    <th className="py-3 px-4">Entreprise</th>
                    <th className="py-3 px-4">Poste</th>
                    <th className="py-3 px-4">Date d&apos;envoi</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4">Action / Suivi Réponse Positive</th>
                    <th className="py-3 px-4">Lien</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#262626] text-sm">
                  {filteredCrmEntries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-gray-50/80 dark:hover:bg-[#161616] transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-[#111827] dark:text-[#E5E7EB]">
                        {entry.company}
                      </td>
                      <td className="py-3.5 px-4 text-gray-700 dark:text-gray-300">
                        {entry.role}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                        {entry.sentDate}
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
                          className={`text-xs font-semibold px-3 py-1.5 rounded-xl border cursor-pointer focus:outline-none ${getStatusBadgeClasses(
                            entry.status
                          )}`}
                        >
                          <option value="Envoyé">Envoyé</option>
                          <option value="En attente">En attente</option>
                          <option value="Entretien">Entretien (Réponse +)</option>
                          <option value="Refus">Refus</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4">
                        {entry.status === "Entretien" ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleRepliedToPositive(
                                entry.id,
                                entry.repliedToPositive
                              )
                            }
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                              entry.repliedToPositive
                                ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                                : "border-rose-400 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200 animate-pulse"
                            }`}
                          >
                            {entry.repliedToPositive ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Répondu au recruteur ✓</span>
                              </>
                            ) : (
                              <>
                                <BellRing className="w-3.5 h-3.5" />
                                <span>À répondre ! (Cliquer si répondu)</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">
                            {entry.responseDate}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <a
                          href={entry.offerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <span>Offre</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
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
          <section className="p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1E1E1E] shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-[#2A2A2A] pb-5">
              <div>
                <h1 className="text-lg font-bold text-[#111827] dark:text-[#E5E7EB]">
                  Routine de Suivi Nocturne (CRON Quotidien — 23h50)
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Analyse automatique des réponses par mail pour le compte principal Antigravity, ou ajout direct au Google Sheet pour les utilisateurs externes.
                </p>
              </div>

              {isMainAntigravityAccount ? (
                <button
                  onClick={handleRunNightlySyncNow}
                  disabled={isRunningCron}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>
                    {isRunningCron
                      ? "Analyse Gmail en cours..."
                      : "Tester le scan Gmail maintenant"}
                  </span>
                </button>
              ) : (
                <span className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200">
                  Suivi auto des mails désactivé (Compte externe)
                </span>
              )}
            </div>

            {!isMainAntigravityAccount && (
              <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <p className="font-bold">
                  Mode Utilisateur Externe ({userConfig.email})
                </p>
                <p>
                  Comme le scan nocturne repose sur l&apos;automation Antigravity personnelle de Maxime, le scan automatique de boîte mail est désactivé pour votre compte. En revanche, chaque offre où vous postulez est automatiquement ajoutée à votre tableau de suivi et à votre Google Sheet connecté !
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#141414]">
                <div className="text-xs font-semibold uppercase text-gray-500">
                  Planification CRON
                </div>
                <div className="text-sm font-mono font-bold mt-1 text-indigo-600 dark:text-indigo-400">
                  CRON_TZ=Europe/Paris 50 23 * * *
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Exécution tous les soirs à 23h50
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#141414]">
                <div className="text-xs font-semibold uppercase text-gray-500">
                  Compte Actif
                </div>
                <div className="text-sm font-mono font-bold mt-1">
                  {userConfig.email}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {isMainAntigravityAccount
                    ? "Scan Gmail + Maj Google Sheet actifs"
                    : "Ajout Google Sheet actif (Maj statut manuelle en 1 clic)"}
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#141414]">
                <div className="text-xs font-semibold uppercase text-gray-500">
                  Détection des Réponses
                </div>
                <div className="text-xs mt-1 space-y-1">
                  <div>• Créneau / visio / RDV → <span className="font-semibold text-emerald-600">Entretien (À répondre !)</span></div>
                  <div>• Suite défavorable → <span className="font-semibold text-rose-600">Refus</span></div>
                  <div>• Sans réponse → <span className="font-semibold text-amber-600">En attente</span></div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* MODAL 1: MON COMPTE & CONNEXION GOOGLE SHEET PERSONNEL (Multi-User Support) */}
      {showWorkspaceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-200 dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E] p-6 sm:p-8 space-y-6 my-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-[#2A2A2A] pb-4">
              <div>
                <span className="text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Espace Personnel Multi-Utilisateurs
                </span>
                <h2 className="text-lg font-bold text-[#111827] dark:text-white mt-2">
                  Configurer mon Profil, mon Gmail & mon Google Sheet
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Chaque utilisateur dispose de ses propres statistiques, de son CV et de son propre Google Sheet de suivi.
                </p>
              </div>
              <button
                onClick={() => setShowWorkspaceModal(false)}
                className="p-1.5 rounded-xl border border-gray-200 dark:border-[#2E2E2E] text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveWorkspaceConfig} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Votre Prénom & Nom
                  </label>
                  <input
                    type="text"
                    required
                    value={userConfig.fullName}
                    onChange={(e) =>
                      setUserConfig({ ...userConfig, fullName: e.target.value })
                    }
                    placeholder="Ex: Marie Dupont"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#2E2E2E] bg-gray-50 dark:bg-[#121212]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Votre Adresse Gmail / Email
                  </label>
                  <input
                    type="email"
                    required
                    value={userConfig.email}
                    onChange={(e) =>
                      setUserConfig({ ...userConfig, email: e.target.value })
                    }
                    placeholder="Ex: marie.dupont@gmail.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#2E2E2E] bg-gray-50 dark:bg-[#121212]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Lien de votre Google Sheet de suivi
                </label>
                <input
                  type="url"
                  value={userConfig.googleSheetUrl}
                  onChange={(e) =>
                    setUserConfig({ ...userConfig, googleSheetUrl: e.target.value })
                  }
                  placeholder="https://docs.google.com/spreadsheets/d/VOTRE_ID/edit"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#2E2E2E] bg-gray-50 dark:bg-[#121212]"
                />
              </div>

              <div className="p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-[#161822] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                    Ajout automatique des lignes dans votre propre Google Sheet (Optionnel — 60 sec)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(APPS_SCRIPT_SNIPPET);
                      setCopiedScript(true);
                      setTimeout(() => setCopiedScript(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-600 text-white"
                  >
                    {copiedScript ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedScript ? "Script copié !" : "Copier le mini-script"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                  Si vous n&apos;êtes pas sur le compte de Maxime et souhaitez que chaque clic sur « Postuler » ajoute automatiquement une ligne dans <strong>votre propre Google Sheet</strong> : ouvrez votre Sheet → <em>Extensions &gt; Apps Script</em> → collez le mini-script ci-dessus → cliquez sur <em>Déployer &gt; Application Web (Accès : Tout le monde)</em> et collez l&apos;URL ci-dessous :
                </p>
                <input
                  type="url"
                  value={userConfig.googleAppsScriptWebhookUrl}
                  onChange={(e) =>
                    setUserConfig({
                      ...userConfig,
                      googleAppsScriptWebhookUrl: e.target.value,
                    })
                  }
                  placeholder="https://script.google.com/macros/s/.../exec (Optionnel)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#2E2E2E] bg-white dark:bg-[#121212]"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#2A2A2A]">
                <button
                  type="button"
                  onClick={() => setShowWorkspaceModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-[#2E2E2E]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Enregistrer mon Espace</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ONE-CLICK APPLICATION PREVIEW & SEND */}
      {activeDraftModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl border border-gray-200 dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E] p-6 sm:p-8 space-y-5 my-8 max-h-[92vh] overflow-y-auto shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-[#2A2A2A] pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    Candidature Personnalisée · Offre × CV
                  </span>
                  {activeDraftModal.offer.emailVerified ? (
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      ✓ Email vérifié dans l&apos;annonce
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      Contact RH suggéré (modifiable) + Portail officiel
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-[#111827] dark:text-white mt-2">
                  {activeDraftModal.offer.company} — {activeDraftModal.offer.title}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Candidat : <span className="font-semibold">{userConfig.fullName}</span> ({userConfig.email})
                </p>
              </div>
              <button
                onClick={() => setActiveDraftModal(null)}
                className="p-1.5 rounded-xl border border-gray-200 dark:border-[#2E2E2E] text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Email du recruteur (modifiable avant envoi)
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
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-gray-200 dark:border-[#2E2E2E] bg-gray-50 dark:bg-[#121212]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-[#2E2E2E] bg-gray-50 dark:bg-[#121212]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Mail d&apos;accompagnement personnalisé
                </label>
                <textarea
                  rows={5}
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
                  className="w-full p-3 text-xs leading-relaxed rounded-xl border border-gray-200 dark:border-[#2E2E2E] bg-gray-50 dark:bg-[#121212]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Lettre de Motivation générée sur-mesure
                </label>
                <textarea
                  rows={10}
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
                  className="w-full p-3 text-xs leading-relaxed rounded-xl border border-gray-200 dark:border-[#2E2E2E] bg-gray-50 dark:bg-[#121212]"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-[#2A2A2A]">
              <div className="flex items-center gap-2">
                <a
                  href={activeDraftModal.offer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-[#2E2E2E] text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                >
                  <span>Portail officiel de l&apos;offre</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveDraftModal(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-[#2E2E2E] text-gray-600 dark:text-gray-400"
                >
                  Fermer
                </button>

                {!isMainAntigravityAccount && (
                  <button
                    onClick={() =>
                      executeSendApplication(
                        activeDraftModal.offer,
                        activeDraftModal.draft,
                        true
                      )
                    }
                    disabled={applyingOfferId === activeDraftModal.offer.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Ouvrir dans mon Gmail + Ajouter au Sheet</span>
                  </button>
                )}

                <button
                  onClick={() =>
                    executeSendApplication(
                      activeDraftModal.offer,
                      activeDraftModal.draft,
                      false
                    )
                  }
                  disabled={applyingOfferId === activeDraftModal.offer.id}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {applyingOfferId === activeDraftModal.offer.id
                      ? "Enregistrement..."
                      : isMainAntigravityAccount
                      ? "Envoyer via Gmail & Ajouter au Sheet"
                      : "Enregistrer dans mon Suivi / Sheet"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] py-4 px-4 sm:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
          <div>
            StagePilot — Plateforme Universelle de Recherche & Suivi de Stages · Profil actif :{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {userConfig.fullName} ({userConfig.email})
            </span>
          </div>
          <div className="font-mono text-[11px]">
            Multi-Secteurs · Extraction CV PDF · Google Sheets CRM
          </div>
        </div>
      </footer>
    </div>
  );
}
