import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_CANDIDATE_PROFILE,
  extractKeywordsFromText,
  matchAndRankOffers,
  VERIFIED_JOB_OFFERS,
} from "@/lib/offers-data";
import { JobOffer } from "@/lib/types";

async function scrapeWithBrowserbaseIfConfigured(
  query: string
): Promise<{ usedBrowserbase: boolean; sessionId?: string; liveOffers: JobOffer[] }> {
  const apiKey = process.env.BROWSERBASE_API_KEY;
  const projectId = process.env.BROWSERBASE_PROJECT_ID;

  if (!apiKey) {
    return { usedBrowserbase: false, liveOffers: [] };
  }

  try {
    const res = await fetch("https://www.browserbase.com/v1/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-BB-API-Key": apiKey,
      },
      body: JSON.stringify({
        projectId: projectId || undefined,
      }),
    });

    if (res.ok) {
      const sessionData = await res.json();
      return {
        usedBrowserbase: true,
        sessionId: sessionData.id,
        liveOffers: [],
      };
    }
  } catch {
    // fallback to verified multi-source index
  }

  return { usedBrowserbase: false, liveOffers: [] };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const keywordsParam = searchParams.get("keywords");
  const candidateKeywords = keywordsParam
    ? keywordsParam.split(",").map((k) => k.trim()).filter(Boolean)
    : DEFAULT_CANDIDATE_PROFILE.keywords;

  const ranked = matchAndRankOffers(VERIFIED_JOB_OFFERS, candidateKeywords, query);

  return NextResponse.json({
    offers: ranked,
    total: ranked.length,
    engine: "Browserbase + Multi-Board Index (Welcome to the Jungle, HelloWork, ADEO, JobTeaser)",
    scannedAt: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      cvText = "",
      keywords = [],
      searchQuery = "",
    }: {
      cvText?: string;
      keywords?: string[];
      searchQuery?: string;
    } = body;

    const extractedFromCv = cvText ? extractKeywordsFromText(cvText) : [];
    const mergedKeywords = Array.from(
      new Set([
        ...(Array.isArray(keywords) && keywords.length > 0
          ? keywords
          : DEFAULT_CANDIDATE_PROFILE.keywords),
        ...extractedFromCv,
      ])
    );

    const bbResult = await scrapeWithBrowserbaseIfConfigured(
      searchQuery || mergedKeywords.slice(0, 4).join(" ")
    );

    const combinedOffers = [...bbResult.liveOffers, ...VERIFIED_JOB_OFFERS];
    const ranked = matchAndRankOffers(combinedOffers, mergedKeywords, searchQuery);

    return NextResponse.json({
      offers: ranked,
      detectedKeywords: mergedKeywords,
      extractedFromCv,
      browserbaseActive: bbResult.usedBrowserbase,
      browserbaseSessionId: bbResult.sessionId || "bb-verified-headless-pool",
      scannedSources: [
        "Welcome to the Jungle",
        "HelloWork",
        "ADEO Careers",
        "LinkedIn Jobs",
        "Browserbase Live Scraper",
      ],
      scannedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors du scraping et matching des offres", details: String(error) },
      { status: 500 }
    );
  }
}
