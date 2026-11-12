"use client";

import React from "react";
import { ExternalLink, Mail, Send, Copy, Check, UserCheck, X } from "lucide-react";
import { JobOffer, GeneratedApplication, UserWorkspaceConfig } from "@/lib/types";

export const APPS_SCRIPT_SNIPPET = `function doPost(e) {
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

export interface ApplicationModalsProps {
  showWorkspaceModal: boolean;
  setShowWorkspaceModal: (v: boolean) => void;
  userConfig: UserWorkspaceConfig;
  setUserConfig: React.Dispatch<React.SetStateAction<UserWorkspaceConfig>>;
  handleSaveWorkspaceConfig: (e: React.FormEvent) => void;
  copiedScript: boolean;
  setCopiedScript: (v: boolean) => void;
  activeDraftModal: { offer: JobOffer; draft: GeneratedApplication } | null;
  setActiveDraftModal: (v: { offer: JobOffer; draft: GeneratedApplication } | null) => void;
  isMainAntigravityAccount: boolean;
  applyingOfferId: string | null;
  executeSendApplication: (offer: JobOffer, draft: GeneratedApplication, openGmailTab?: boolean) => Promise<void>;
}

export function ApplicationModals({
  showWorkspaceModal,
  setShowWorkspaceModal,
  userConfig,
  setUserConfig,
  handleSaveWorkspaceConfig,
  copiedScript,
  setCopiedScript,
  activeDraftModal,
  setActiveDraftModal,
  isMainAntigravityAccount,
  applyingOfferId,
  executeSendApplication,
}: ApplicationModalsProps) {
  return (
    <>
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
    </>
  );
}
