"use client";

import React from "react";
import {
  CheckCircle2,
  ExternalLink,
  FileSpreadsheet,
  Play,
  BellRing,
  Download,
} from "lucide-react";
import { ApplicationStatus, CrmEntry, UserWorkspaceConfig } from "@/lib/types";
import { GOOGLE_SHEET_URL } from "@/lib/offers-data";

export interface CrmAndCronTabsProps {
  activeTab: "offers" | "crm" | "cron";
  crmEntries: CrmEntry[];
  filteredCrmEntries: CrmEntry[];
  crmStatusFilter: string;
  setCrmStatusFilter: (filter: string) => void;
  stats: {
    total: number;
    waiting: number;
    positive: number;
    refused: number;
    positiveUnreplied: number;
  };
  exportCrmToCsv: () => void;
  userConfig: UserWorkspaceConfig;
  handleAddManualCrmEntry: (e: React.FormEvent) => void;
  newCrmCompany: string;
  setNewCrmCompany: (v: string) => void;
  newCrmRole: string;
  setNewCrmRole: (v: string) => void;
  newCrmUrl: string;
  setNewCrmUrl: (v: string) => void;
  handleUpdateCrmStatus: (id: string, s: ApplicationStatus) => void;
  handleToggleRepliedToPositive: (id: string, currentVal?: boolean) => void;
  isMainAntigravityAccount: boolean;
  handleRunNightlySyncNow: () => Promise<void>;
  isRunningCron: boolean;
  getStatusBadgeClasses: (status: ApplicationStatus) => string;
}

export function CrmAndCronTabs({
  activeTab,
  crmEntries,
  filteredCrmEntries,
  crmStatusFilter,
  setCrmStatusFilter,
  stats,
  exportCrmToCsv,
  userConfig,
  handleAddManualCrmEntry,
  newCrmCompany,
  setNewCrmCompany,
  newCrmRole,
  setNewCrmRole,
  newCrmUrl,
  setNewCrmUrl,
  handleUpdateCrmStatus,
  handleToggleRepliedToPositive,
  isMainAntigravityAccount,
  handleRunNightlySyncNow,
  isRunningCron,
  getStatusBadgeClasses,
}: CrmAndCronTabsProps) {
  if (activeTab === "offers") return null;

  return (
    <>
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
    </>
  );
}
