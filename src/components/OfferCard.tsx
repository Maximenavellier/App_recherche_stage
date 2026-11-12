"use client";

import React from "react";
import {
  ExternalLink,
  Mail,
  Search,
  Send,
  AlertCircle,
  Building2,
  Calendar,
  Eye,
  MapPin,
  GraduationCap,
  Coins,
  Gift,
  Bookmark,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { JobOffer, CandidateProfile, GeneratedApplication, UserWorkspaceConfig } from "@/lib/types";
import { generateApplicationDraft } from "@/lib/offers-data";

export interface OfferCardProps {
  offer: JobOffer;
  alreadyApplied: boolean;
  isApplyingThis: boolean;
  isFav: boolean;
  score: number;
  sourceBadge: { label: string; classes: string };
  userConfig: UserWorkspaceConfig;
  profile: CandidateProfile;
  toggleFavorite: (id: string) => void;
  handleClickPostuler: (offer: JobOffer) => void;
  setActiveDraftModal: (val: { offer: JobOffer; draft: GeneratedApplication } | null) => void;
}

export function OfferCard({
  offer,
  alreadyApplied,
  isApplyingThis,
  isFav,
  score,
  sourceBadge,
  userConfig,
  profile,
  toggleFavorite,
  handleClickPostuler,
  setActiveDraftModal,
}: OfferCardProps) {
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
}
