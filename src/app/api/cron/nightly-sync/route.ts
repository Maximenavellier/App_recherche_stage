import { NextResponse } from "next/server";
import { readCrmFromGoogleSheets, runNightlyGmailCrmSync } from "@/lib/google-workspace";
import { GOOGLE_SHEET_ID, GOOGLE_SHEET_URL, USER_GMAIL_ADDRESS } from "@/lib/offers-data";

export async function GET() {
  const syncLog = await runNightlyGmailCrmSync();
  const crmData = await readCrmFromGoogleSheets();

  return NextResponse.json({
    ok: true,
    routine: "Routine de Suivi Nocturne (23h50 Europe/Paris)",
    account: USER_GMAIL_ADDRESS,
    spreadsheetId: GOOGLE_SHEET_ID,
    spreadsheetUrl: GOOGLE_SHEET_URL,
    syncLog,
    entries: crmData.entries,
  });
}

export async function POST() {
  return GET();
}
