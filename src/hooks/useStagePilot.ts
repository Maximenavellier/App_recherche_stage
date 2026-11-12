"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  ApplicationStatus,
  CandidateProfile,
  CrmEntry,
  GeneratedApplication,
  JobOffer,
  NightlySyncLog,
  SearchFilters,
  UserWorkspaceConfig,
  DEFAULT_FILTERS,
} from "@/lib/types";
import {
  DEFAULT_CANDIDATE_PROFILE,
  generateApplicationDraft,
  GOOGLE_SHEET_ID,
  GOOGLE_SHEET_URL,
  USER_GMAIL_ADDRESS,
  VERIFIED_JOB_OFFERS,
  matchAndRankOffers,
} from "@/lib/offers-data";

export function useStagePilot() {
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
  return {
    theme,
    activeTab,
    setActiveTab,
    userConfig,
    setUserConfig,
    showWorkspaceModal,
    setShowWorkspaceModal,
    copiedScript,
    setCopiedScript,
    profile,
    setProfile,
    hasCustomCvLoaded,
    keywordInput,
    setKeywordInput,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    showFiltersPanel,
    setShowFiltersPanel,
    favoriteOfferIds,
    currentOffset,
    sourceBreakdown,
    rejectedCdiCount,
    selectedSourceFilter,
    setSelectedSourceFilter,
    sortBy,
    setSortBy,
    offers,
    isScraping,
    isLoadingMore,
    lastScrapedAt,
    cvUploadStatus,
    fileInputRef,
    applyingOfferId,
    activeDraftModal,
    setActiveDraftModal,
    notification,
    setNotification,
    crmEntries,
    crmStatusFilter,
    setCrmStatusFilter,
    isRunningCron,
    newCrmCompany,
    setNewCrmCompany,
    newCrmRole,
    setNewCrmRole,
    newCrmUrl,
    setNewCrmUrl,
    isMainAntigravityAccount,
    toggleTheme,
    displayedOffers,
    stats,
    activeFiltersCount,
    toggleFavorite,
    handleCvUpload,
    addKeyword,
    removeKeyword,
    clearAllKeywords,
    triggerScraping,
    handleClickPostuler,
    executeSendApplication,
    handleRunNightlySyncNow,
    handleUpdateCrmStatus,
    handleToggleRepliedToPositive,
    handleAddManualCrmEntry,
    exportCrmToCsv,
    handleSaveWorkspaceConfig,
    isOfferAlreadyApplied,
    filteredCrmEntries,
    getStatusBadgeClasses,
  };
}
