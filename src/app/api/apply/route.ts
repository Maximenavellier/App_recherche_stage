import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_CANDIDATE_PROFILE,
  generateApplicationDraft,
  GOOGLE_SHEET_ID,
  GOOGLE_SHEET_URL,
  USER_GMAIL_ADDRESS,
  VERIFIED_JOB_OFFERS,
} from "@/lib/offers-data";
import {
  appendApplicationToGoogleSheet,
  sendApplicationViaGmail,
} from "@/lib/google-workspace";
import { CandidateProfile, JobOffer } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      offer,
      offerId,
      profile = DEFAULT_CANDIDATE_PROFILE,
      customSubject,
      customEmailBody,
      customCoverLetter,
      customRecipientEmail,
      previewOnly = false,
    }: {
      offer?: JobOffer;
      offerId?: string;
      profile?: CandidateProfile;
      customSubject?: string;
      customEmailBody?: string;
      customCoverLetter?: string;
      customRecipientEmail?: string;
      previewOnly?: boolean;
    } = body;

    const targetOffer =
      offer || VERIFIED_JOB_OFFERS.find((o) => o.id === offerId) || VERIFIED_JOB_OFFERS[0];

    const draft = generateApplicationDraft(targetOffer, profile);

    if (previewOnly) {
      return NextResponse.json({
        draft,
        senderEmail: USER_GMAIL_ADDRESS,
      });
    }

    const finalSubject = customSubject || draft.subject;
    const finalEmailBody = customEmailBody || draft.emailBody;
    const finalCoverLetter = customCoverLetter || draft.coverLetter;
    const finalRecipient = customRecipientEmail || draft.recipientEmail;

    // 1. Send or draft via Gmail (maximenavellier12@gmail.com)
    const gmailResult = await sendApplicationViaGmail({
      to: finalRecipient,
      subject: finalSubject,
      emailBody: finalEmailBody,
      coverLetter: finalCoverLetter,
    });

    // 2. Append to Google Sheet CRM
    const todayIso = new Date().toISOString().slice(0, 10);
    const crmResult = await appendApplicationToGoogleSheet({
      company: targetOffer.company,
      role: targetOffer.title,
      sentDate: todayIso,
      offerUrl: targetOffer.url,
      status: "Envoyé",
      responseDate: "En attente",
      recipientEmail: finalRecipient,
    });

    return NextResponse.json({
      success: true,
      senderEmail: USER_GMAIL_ADDRESS,
      gmail: gmailResult,
      crmEntry: crmResult.entry,
      syncedToGoogleSheet: crmResult.syncedToGoogleSheet,
      spreadsheetId: GOOGLE_SHEET_ID,
      spreadsheetUrl: GOOGLE_SHEET_URL,
      draft: {
        ...draft,
        subject: finalSubject,
        emailBody: finalEmailBody,
        coverLetter: finalCoverLetter,
        recipientEmail: finalRecipient,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de la candidature", details: String(error) },
      { status: 500 }
    );
  }
}
