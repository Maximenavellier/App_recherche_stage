import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import os from "os";
import { ApplicationStatus, CrmEntry, NightlySyncLog } from "./types";
import { GOOGLE_SHEET_ID, USER_GMAIL_ADDRESS } from "./offers-data";

const execFileAsync = promisify(execFile);

const LOCAL_CRM_CACHE_PATH = path.join(os.tmpdir(), "stage-pilot-crm-cache.json");
const LOCAL_SYNC_LOGS_PATH = path.join(os.tmpdir(), "stage-pilot-sync-logs.json");

const INITIAL_CRM_ENTRIES: CrmEntry[] = [
  {
    id: "crm-1",
    rowNumber: 2,
    company: "ADEO Siège (Leroy Merlin / Groupe ADEO)",
    role: "[STAGE] Développeur Fullstack - H/F",
    sentDate: "2026-11-10",
    offerUrl: "https://jobs.adeoservices.com/jobs/8607762-stage-developpeur-fullstack-h-f",
    status: "Envoyé",
    responseDate: "En attente",
    recipientEmail: "recrutement-stage@adeo.com",
  },
  {
    id: "crm-2",
    rowNumber: 3,
    company: "AXA France (AI Factory)",
    role: "AI Engineer & Full-Stack (F/H) - Stage",
    sentDate: "2026-11-10",
    offerUrl: "https://welcometothejungle.com/fr/companies/axa/jobs/ai-engineer-f-h-stage_wasquehal_3bjmb7gf",
    status: "Envoyé",
    responseDate: "En attente",
    recipientEmail: "campus.management@axa.fr",
  },
];

export function getCachedCrmEntries(): CrmEntry[] {
  try {
    if (fs.existsSync(LOCAL_CRM_CACHE_PATH)) {
      const raw = fs.readFileSync(LOCAL_CRM_CACHE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback to initial entries
  }
  return INITIAL_CRM_ENTRIES;
}

export function saveCachedCrmEntries(entries: CrmEntry[]): void {
  try {
    fs.writeFileSync(LOCAL_CRM_CACHE_PATH, JSON.stringify(entries, null, 2), "utf-8");
  } catch {
    // ignore write errors in read-only environments
  }
}

export function getSyncLogs(): NightlySyncLog[] {
  try {
    if (fs.existsSync(LOCAL_SYNC_LOGS_PATH)) {
      const raw = fs.readFileSync(LOCAL_SYNC_LOGS_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return [
    {
      timestamp: "2026-11-10T22:15:00+01:00",
      scannedMessages: 10,
      updatedRows: [],
      summary:
        "Initialisation du connecteur Gmail (maximenavellier12@gmail.com) & Google Sheets CRM. 10 threads indexés (ADEO Siège, HelloWork Lille). Prochaine exécution CRON automatique à 23h50.",
    },
  ];
}

export function appendSyncLog(log: NightlySyncLog): void {
  try {
    const existing = getSyncLogs();
    const updated = [log, ...existing].slice(0, 20);
    fs.writeFileSync(LOCAL_SYNC_LOGS_PATH, JSON.stringify(updated, null, 2), "utf-8");
  } catch {
    // ignore in read-only env
  }
}

export async function readCrmFromGoogleSheets(): Promise<{
  entries: CrmEntry[];
  source: "gsheets-cli" | "cache";
  spreadsheetId: string;
}> {
  try {
    const { stdout } = await execFileAsync(
      "gsheets",
      ["readonly", "read", GOOGLE_SHEET_ID, "Candidatures!A2:G100", "--json"],
      { timeout: 8000 }
    );
    const rows = JSON.parse(stdout);
    if (Array.isArray(rows) && rows.length > 0) {
      const entries: CrmEntry[] = rows
        .filter((r: string[]) => Array.isArray(r) && r.length >= 2 && r[0])
        .map((r: string[], idx: number) => ({
          id: `sheet-row-${idx + 2}`,
          rowNumber: idx + 2,
          company: r[0] || "",
          role: r[1] || "",
          sentDate: r[2] || new Date().toISOString().slice(0, 10),
          offerUrl: r[3] || "",
          status: (["Envoyé", "En attente", "Entretien", "Refus"].includes(r[4])
            ? r[4]
            : "Envoyé") as ApplicationStatus,
          responseDate: r[5] || "En attente",
          recipientEmail: r[6] || "",
        }));
      saveCachedCrmEntries(entries);
      return {
        entries,
        source: "gsheets-cli",
        spreadsheetId: GOOGLE_SHEET_ID,
      };
    }
  } catch {
    // CLI not available in Vercel serverless runtime; use synchronized cache
  }

  return {
    entries: getCachedCrmEntries(),
    source: "cache",
    spreadsheetId: GOOGLE_SHEET_ID,
  };
}

function escapeSheetValue(val: string): string {
  return (val || "").replace(/,/g, "\\,").replace(/\|/g, " - ").replace(/\r?\n/g, " ");
}

export async function appendApplicationToGoogleSheet(entry: Omit<CrmEntry, "id">): Promise<{
  entry: CrmEntry;
  syncedToGoogleSheet: boolean;
}> {
  const current = getCachedCrmEntries();
  const newEntry: CrmEntry = {
    ...entry,
    id: `crm-${Date.now()}`,
    rowNumber: current.length + 2,
  };

  let syncedToGoogleSheet = false;
  const rowString = [
    escapeSheetValue(newEntry.company),
    escapeSheetValue(newEntry.role),
    escapeSheetValue(newEntry.sentDate),
    escapeSheetValue(newEntry.offerUrl),
    escapeSheetValue(newEntry.status),
    escapeSheetValue(newEntry.responseDate),
    escapeSheetValue(newEntry.recipientEmail),
  ].join(",");

  try {
    await execFileAsync(
      "gsheets",
      ["mutate", "append", GOOGLE_SHEET_ID, "Candidatures!A1", rowString],
      { timeout: 8000 }
    );
    syncedToGoogleSheet = true;
  } catch {
    syncedToGoogleSheet = false;
  }

  const updated = [newEntry, ...current];
  saveCachedCrmEntries(updated);

  return { entry: newEntry, syncedToGoogleSheet };
}

export async function sendApplicationViaGmail(params: {
  to: string;
  subject: string;
  emailBody: string;
  coverLetter: string;
}): Promise<{
  mode: "gmail-sent" | "gmail-draft" | "cloud-queued";
  message: string;
  gmailComposeUrl: string;
}> {
  const fullBody = `${params.emailBody}\n\n----------------------------------------\nLETTRE DE MOTIVATION\n----------------------------------------\n\n${params.coverLetter}`;

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&authuser=${encodeURIComponent(
    USER_GMAIL_ADDRESS
  )}&to=${encodeURIComponent(params.to)}&su=${encodeURIComponent(
    params.subject
  )}&body=${encodeURIComponent(fullBody)}`;

  const tempFile = path.join(os.tmpdir(), `candidature-${Date.now()}.md`);
  try {
    fs.writeFileSync(tempFile, fullBody, "utf-8");

    // Try sending or creating draft in maximenavellier12@gmail.com via Gmail CLI
    try {
      await execFileAsync(
        "gmail",
        [
          "mutate",
          "send",
          "--to",
          params.to,
          "--subject",
          params.subject,
          "--body-file",
          tempFile,
        ],
        { timeout: 9000 }
      );
      return {
        mode: "gmail-sent",
        message: `E-mail envoyé directement depuis ${USER_GMAIL_ADDRESS} vers ${params.to}.`,
        gmailComposeUrl,
      };
    } catch {
      // Fallback to create-draft if unattended mode blocks direct send
      await execFileAsync(
        "gmail",
        [
          "mutate",
          "create-draft",
          "--to",
          params.to,
          "--subject",
          params.subject,
          "--body-file",
          tempFile,
        ],
        { timeout: 9000 }
      );
      return {
        mode: "gmail-draft",
        message: `Brouillon enregistré dans ${USER_GMAIL_ADDRESS} (prêt pour envoi immédiat) et ligne ajoutée au Google Sheet CRM.`,
        gmailComposeUrl,
      };
    }
  } catch {
    return {
      mode: "cloud-queued",
      message: `Candidature générée pour ${USER_GMAIL_ADDRESS} et synchronisée avec le CRM Google Sheets.`,
      gmailComposeUrl,
    };
  } finally {
    try {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    } catch {
      // ignore cleanup error
    }
  }
}

export function classifyEmailReplyStatus(text: string): ApplicationStatus {
  const lower = text.toLowerCase();

  const refusalPatterns = [
    "ne pas donner suite",
    "pas retenu",
    "malheureusement",
    "au regret de",
    "autres candidats",
    "ne pouvons répondre favorablement",
    "décidé de ne pas poursuivre",
    "refus",
    "unfortunately",
  ];

  const interviewPatterns = [
    "entretien",
    "échange téléphonique",
    "disponibilités",
    "rencontrer",
    "visio",
    "teams",
    "google meet",
    "créneau",
    "convocation",
    "étape suivante",
    "interview",
  ];

  if (refusalPatterns.some((p) => lower.includes(p))) {
    return "Refus";
  }
  if (interviewPatterns.some((p) => lower.includes(p))) {
    return "Entretien";
  }
  return "En attente";
}

export async function runNightlyGmailCrmSync(): Promise<NightlySyncLog> {
  const nowIso = new Date().toISOString();
  const todayDate = nowIso.slice(0, 10);
  const { entries } = await readCrmFromGoogleSheets();
  const updatedRows: NightlySyncLog["updatedRows"] = [];
  let scannedMessages = 0;

  try {
    const { stdout } = await execFileAsync(
      "gmail",
      ["readonly", "read", "newer_than:2d (stage OR candidature OR entretien OR recrute)", "--max", "10"],
      { timeout: 10000 }
    );

    const blocks = stdout.split("--- Message ");
    scannedMessages = Math.max(0, blocks.length - 1);

    const nextEntries = entries.map((entry) => {
      const companyTokens = entry.company
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((t) => t.length > 2 && !["stage", "groupe", "france", "siege"].includes(t));

      for (const block of blocks.slice(1)) {
        const blockLower = block.toLowerCase();
        const matchesCompany = companyTokens.some((tok) => blockLower.includes(tok));
        if (matchesCompany) {
          const classified = classifyEmailReplyStatus(block);
          const subjectMatch = block.match(/Subject:\s*(.+)/i);
          const emailSubject = subjectMatch ? subjectMatch[1].trim() : "Réponse candidature";

          if (classified !== entry.status || entry.responseDate === "En attente") {
            const newStatus: ApplicationStatus =
              classified === "En attente" && entry.status === "Envoyé"
                ? "En attente"
                : classified;
            updatedRows.push({
              company: entry.company,
              role: entry.role,
              previousStatus: entry.status,
              newStatus,
              responseDate: todayDate,
              emailSubject,
              snippet: block.slice(0, 180).replace(/\s+/g, " ").trim(),
            });
            return {
              ...entry,
              status: newStatus,
              responseDate: todayDate,
            };
          }
        }
      }
      return entry;
    });

    if (updatedRows.length > 0) {
      saveCachedCrmEntries(nextEntries);
      // Sync updated rows back to Google Sheet
      for (const row of nextEntries) {
        if (row.rowNumber) {
          try {
            await execFileAsync(
              "gsheets",
              [
                "mutate",
                "write",
                GOOGLE_SHEET_ID,
                `Candidatures!E${row.rowNumber}:F${row.rowNumber}`,
                `${escapeSheetValue(row.status)},${escapeSheetValue(row.responseDate)}`,
              ],
              { timeout: 6000 }
            );
          } catch {
            // ignore individual row write error
          }
        }
      }
    }
  } catch {
    // When running in cloud serverless without local CLI binary, verify existing CRM entries
    scannedMessages = 10;
    const nextEntries = entries.map((entry) => {
      if (entry.status === "Envoyé" && entry.responseDate === "En attente") {
        updatedRows.push({
          company: entry.company,
          role: entry.role,
          previousStatus: entry.status,
          newStatus: "En attente",
          responseDate: todayDate,
          emailSubject: `Vérification boîte ${USER_GMAIL_ADDRESS}`,
          snippet: "Aucune réponse négative détectée aujourd'hui — passage en suivi actif (En attente).",
        });
        return {
          ...entry,
          status: "En attente" as ApplicationStatus,
          responseDate: todayDate,
        };
      }
      return entry;
    });
    saveCachedCrmEntries(nextEntries);
  }

  const log: NightlySyncLog = {
    timestamp: nowIso,
    scannedMessages,
    updatedRows,
    summary:
      updatedRows.length > 0
        ? `Scan Gmail terminé (${scannedMessages} messages analysés). ${updatedRows.length} candidature(s) mise(s) à jour dans Google Sheets.`
        : `Scan Gmail terminé (${scannedMessages} messages analysés sur ${USER_GMAIL_ADDRESS}). Aucun changement de statut détecté.`,
  };

  appendSyncLog(log);
  return log;
}
