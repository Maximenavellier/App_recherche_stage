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
import { CandidateProfile, JobOffer, UserWorkspaceConfig } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      offer,
      offerId,
      profile = DEFAULT_CANDIDATE_PROFILE,
      userConfig,
      customSubject,
      customEmailBody,
      customCoverLetter,
      customRecipientEmail,
      previewOnly = false,
    }: {
      offer?: JobOffer;
      offerId?: string;
      profile?: CandidateProfile;
      userConfig?: UserWorkspaceConfig;
      customSubject?: string;
      customEmailBody?: string;
      customCoverLetter?: string;
      customRecipientEmail?: string;
      previewOnly?: boolean;
    } = body;

    const targetOffer =
      offer || VERIFIED_JOB_OFFERS.find((o) => o.id === offerId) || VERIFIED_JOB_OFFERS[0];

    const activeSenderEmail =
      userConfig?.email?.trim() || profile.email?.trim() || USER_GMAIL_ADDRESS;
    const isMainOwnerAccount =
      activeSenderEmail.toLowerCase() === USER_GMAIL_ADDRESS.toLowerCase();

    const draft = generateApplicationDraft(targetOffer, {
      ...profile,
      email: activeSenderEmail,
      fullName: userConfig?.fullName?.trim() || profile.fullName,
    });

    if (previewOnly) {
      return NextResponse.json({
        draft,
        senderEmail: activeSenderEmail,
      });
    }

    const finalSubject = customSubject || draft.subject;
    const finalEmailBody = customEmailBody || draft.emailBody;
    const finalCoverLetter = customCoverLetter || draft.coverLetter;
    const finalRecipient = customRecipientEmail || draft.recipientEmail;
    const todayIso = new Date().toISOString().slice(0, 10);

    const fullBody = `${finalEmailBody}\n\n----------------------------------------\nLETTRE DE MOTIVATION\n----------------------------------------\n\n${finalCoverLetter}`;
    const customGmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&authuser=${encodeURIComponent(
      activeSenderEmail
    )}&to=${encodeURIComponent(finalRecipient)}&su=${encodeURIComponent(
      finalSubject
    )}&body=${encodeURIComponent(fullBody)}`;

    // 1. Send via Antigravity Gmail bridge if owner account, else prepare instant Gmail Web compose
    let gmailResult = {
      mode: "cloud-queued" as "gmail-sent" | "gmail-draft" | "cloud-queued",
      message: `Candidature prête pour ${activeSenderEmail} et enregistrée dans votre Google Sheet CRM.`,
      gmailComposeUrl: customGmailComposeUrl,
    };

    if (isMainOwnerAccount) {
      gmailResult = await sendApplicationViaGmail({
        to: finalRecipient,
        subject: finalSubject,
        emailBody: finalEmailBody,
        coverLetter: finalCoverLetter,
      });
    }

    // 2. Append to User's Custom Google Sheet Webhook if provided, OR to the connected Google Sheet
    let syncedToCustomWebhook = false;
    if (userConfig?.googleAppsScriptWebhookUrl?.startsWith("https://script.google.com/")) {
      try {
        const webhookRes = await fetch(userConfig.googleAppsScriptWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company: targetOffer.company,
            role: targetOffer.title,
            sentDate: todayIso,
            offerUrl: targetOffer.url,
            status: "Envoyé",
            responseDate: "En attente",
            recipientEmail: finalRecipient,
            candidateEmail: activeSenderEmail,
          }),
        });
        syncedToCustomWebhook = webhookRes.ok;
      } catch {
        syncedToCustomWebhook = false;
      }
    }

    const crmResult = await appendApplicationToGoogleSheet({
      company: targetOffer.company,
      role: targetOffer.title,
      sentDate: todayIso,
      offerUrl: targetOffer.url,
      status: "Envoyé",
      responseDate: "En attente",
      recipientEmail: finalRecipient,
      repliedToPositive: false,
      remuneration: targetOffer.remuneration,
      location: targetOffer.location,
    });

    const effectiveSheetUrl = userConfig?.googleSheetUrl?.trim() || GOOGLE_SHEET_URL;
    const effectiveSheetId = userConfig?.googleSheetId?.trim() || GOOGLE_SHEET_ID;

    return NextResponse.json({
      success: true,
      senderEmail: activeSenderEmail,
      isMainOwnerAccount,
      gmail: {
        ...gmailResult,
        gmailComposeUrl: customGmailComposeUrl,
      },
      crmEntry: crmResult.entry,
      syncedToGoogleSheet: crmResult.syncedToGoogleSheet || syncedToCustomWebhook,
      spreadsheetId: effectiveSheetId,
      spreadsheetUrl: effectiveSheetUrl,
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
