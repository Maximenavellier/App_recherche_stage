"use client";

import React from "react";
import { Filter, MapPin, SlidersHorizontal, Clock, GraduationCap, Coins, Gift, ShieldCheck } from "lucide-react";
import { SearchFilters, DEFAULT_FILTERS } from "@/lib/types";

export interface FiltersDrawerProps {
  showFiltersPanel: boolean;
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  offersCount: number;
}

export function FiltersDrawer({ showFiltersPanel, filters, setFilters, offersCount }: FiltersDrawerProps) {
  if (!showFiltersPanel) return null;
  return (
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
  );
}
