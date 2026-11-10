import { NextRequest, NextResponse } from "next/server";
import {
  getCachedCrmEntries,
  getSyncLogs,
  readCrmFromGoogleSheets,
  saveCachedCrmEntries,
} from "@/lib/google-workspace";
import { GOOGLE_SHEET_ID, GOOGLE_SHEET_URL, USER_GMAIL_ADDRESS } from "@/lib/offers-data";
import { ApplicationStatus } from "@/lib/types";

export async function GET() {
  const crmData = await readCrmFromGoogleSheets();
  const logs = getSyncLogs();

  return NextResponse.json({
    entries: crmData.entries,
    source: crmData.source,
    spreadsheetId: GOOGLE_SHEET_ID,
    spreadsheetUrl: GOOGLE_SHEET_URL,
    connectedAccount: USER_GMAIL_ADDRESS,
    cronSchedule: "50 23 * * * (Europe/Paris - 23h50)",
    logs,
  });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, responseDate }: { id: string; status: ApplicationStatus; responseDate?: string } = body;

    const current = getCachedCrmEntries();
    const updated = current.map((entry) =>
      entry.id === id
        ? {
            ...entry,
            status,
            responseDate:
              responseDate ||
              (status !== "Envoyé" ? new Date().toISOString().slice(0, 10) : entry.responseDate),
          }
        : entry
    );

    saveCachedCrmEntries(updated);

    return NextResponse.json({
      success: true,
      entries: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Impossible de mettre à jour le statut CRM", details: String(error) },
      { status: 500 }
    );
  }
}
