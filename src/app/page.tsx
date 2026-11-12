"use client";

import React from "react";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileSpreadsheet,
  Mail,
  Moon,
  Plus,
  RefreshCw,
  Sparkles,
  Sun,
  X,
  AlertCircle,
  Terminal,
  Settings,
  UserCheck,
} from "lucide-react";
import { DEFAULT_FILTERS, getSourceBadgeStyle } from "@/lib/types";
import { GOOGLE_SHEET_URL, USER_GMAIL_ADDRESS } from "@/lib/offers-data";
import { StatsBar } from "@/components/StatsBar";
import { ControlPanel } from "@/components/ControlPanel";
import { OfferCard } from "@/components/OfferCard";
import { CrmAndCronTabs } from "@/components/CrmAndCronTabs";
import { ApplicationModals } from "@/components/ApplicationModals";
import { useStagePilot } from "@/hooks/useStagePilot";

export default function StagePilotDashboard() {
  const {
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
  } = useStagePilot();

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

        {/* Top Application Statistics Bar Component */}
        <StatsBar
          stats={stats}
          setActiveTab={setActiveTab}
          setCrmStatusFilter={setCrmStatusFilter}
        />

        {/* TAB 1: MOTEUR DE SCRAPING, FILTRES AVANCÉS & MATCHING UNIVERSEL */}
        {activeTab === "offers" && (
          <div className="space-y-6">
            {/* Control Panel: CV Upload + Universal Domains + Skills + Filters Component */}
            <ControlPanel
              profile={profile}
              setProfile={setProfile}
              hasCustomCvLoaded={hasCustomCvLoaded}
              keywordInput={keywordInput}
              setKeywordInput={setKeywordInput}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filters={filters}
              setFilters={setFilters}
              showFiltersPanel={showFiltersPanel}
              setShowFiltersPanel={setShowFiltersPanel}
              favoriteOfferIds={favoriteOfferIds}
              sourceBreakdown={sourceBreakdown}
              rejectedCdiCount={rejectedCdiCount}
              selectedSourceFilter={selectedSourceFilter}
              setSelectedSourceFilter={setSelectedSourceFilter}
              offers={offers}
              isScraping={isScraping}
              lastScrapedAt={lastScrapedAt}
              cvUploadStatus={cvUploadStatus}
              fileInputRef={fileInputRef}
              activeFiltersCount={activeFiltersCount}
              handleCvUpload={handleCvUpload}
              addKeyword={addKeyword}
              removeKeyword={removeKeyword}
              clearAllKeywords={clearAllKeywords}
              triggerScraping={triggerScraping}
              getSourceBadgeStyle={getSourceBadgeStyle}
            />

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
                      <OfferCard
                        key={offer.id}
                        offer={offer}
                        alreadyApplied={alreadyApplied}
                        isApplyingThis={isApplyingThis}
                        isFav={isFav}
                        score={score}
                        sourceBadge={sourceBadge}
                        userConfig={userConfig}
                        profile={profile}
                        toggleFavorite={toggleFavorite}
                        handleClickPostuler={handleClickPostuler}
                        setActiveDraftModal={setActiveDraftModal}
                      />
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
        {/* TAB 2 & 3: CRM AUTOMATISÉ & ROUTINE NOCTURNE */}
        <CrmAndCronTabs
          activeTab={activeTab}
          crmEntries={crmEntries}
          filteredCrmEntries={filteredCrmEntries}
          crmStatusFilter={crmStatusFilter}
          setCrmStatusFilter={setCrmStatusFilter}
          stats={stats}
          exportCrmToCsv={exportCrmToCsv}
          userConfig={userConfig}
          handleAddManualCrmEntry={handleAddManualCrmEntry}
          newCrmCompany={newCrmCompany}
          setNewCrmCompany={setNewCrmCompany}
          newCrmRole={newCrmRole}
          setNewCrmRole={setNewCrmRole}
          newCrmUrl={newCrmUrl}
          setNewCrmUrl={setNewCrmUrl}
          handleUpdateCrmStatus={handleUpdateCrmStatus}
          handleToggleRepliedToPositive={handleToggleRepliedToPositive}
          isMainAntigravityAccount={isMainAntigravityAccount}
          handleRunNightlySyncNow={handleRunNightlySyncNow}
          isRunningCron={isRunningCron}
          getStatusBadgeClasses={getStatusBadgeClasses}
        />
      </main>

      {/* MODALS: Multi-User Sheets & One-Click Application */}
      <ApplicationModals
        showWorkspaceModal={showWorkspaceModal}
        setShowWorkspaceModal={setShowWorkspaceModal}
        userConfig={userConfig}
        setUserConfig={setUserConfig}
        handleSaveWorkspaceConfig={handleSaveWorkspaceConfig}
        copiedScript={copiedScript}
        setCopiedScript={setCopiedScript}
        activeDraftModal={activeDraftModal}
        setActiveDraftModal={setActiveDraftModal}
        isMainAntigravityAccount={isMainAntigravityAccount}
        applyingOfferId={applyingOfferId}
        executeSendApplication={executeSendApplication}
      />

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


