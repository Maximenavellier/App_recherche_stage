"use client";

import React from "react";
import {
  Filter,
  Globe,
  Plus,
  RefreshCw,
  Search,
  Upload,
  Trash2,
  SlidersHorizontal,
  Bookmark,
  ShieldCheck,
  X,
} from "lucide-react";
import { CandidateProfile, JobOffer, SearchFilters } from "@/lib/types";
import { UNIVERSAL_DOMAIN_PRESETS, DEFAULT_CANDIDATE_PROFILE } from "@/lib/offers-data";
import { FiltersDrawer } from "./FiltersDrawer";

export interface ControlPanelProps {
  profile: CandidateProfile;
  setProfile: React.Dispatch<React.SetStateAction<CandidateProfile>>;
  hasCustomCvLoaded: boolean;
  keywordInput: string;
  setKeywordInput: (v: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  showFiltersPanel: boolean;
  setShowFiltersPanel: React.Dispatch<React.SetStateAction<boolean>>;
  favoriteOfferIds: string[];
  sourceBreakdown: Record<string, number>;
  rejectedCdiCount: number;
  selectedSourceFilter: string;
  setSelectedSourceFilter: (v: string) => void;
  offers: JobOffer[];
  isScraping: boolean;
  lastScrapedAt: string;
  cvUploadStatus: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  activeFiltersCount: number;
  handleCvUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  addKeyword: (e: React.FormEvent) => void;
  removeKeyword: (kw: string) => void;
  clearAllKeywords: () => void;
  triggerScraping: (
    customKeywords?: string[],
    customCvText?: string,
    customSearch?: string,
    customCity?: string,
    customRadius?: number,
    customLimit?: number,
    appendMode?: boolean,
    nextOffset?: number
  ) => Promise<void>;
  getSourceBadgeStyle: (source: string) => { label: string; classes: string };
}

export function ControlPanel({
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
  sourceBreakdown,
  rejectedCdiCount,
  selectedSourceFilter,
  setSelectedSourceFilter,
  offers,
  isScraping,
  lastScrapedAt,
  cvUploadStatus,
  fileInputRef,
  activeFiltersCount,
  handleCvUpload,
  addKeyword,
  removeKeyword,
  clearAllKeywords,
  triggerScraping,
  getSourceBadgeStyle,
}: ControlPanelProps) {
  return (
    <>
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

              {/* Expandable Advanced Filters Drawer Component */}
              <FiltersDrawer
                showFiltersPanel={showFiltersPanel}
                filters={filters}
                setFilters={setFilters}
                offersCount={offers.length}
              />
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
    </>
  );
}
