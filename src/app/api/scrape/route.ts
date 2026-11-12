import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_CANDIDATE_PROFILE,
  extractKeywordsFromText,
  inferTargetRoleFromText,
  matchAndRankOffers,
} from "@/lib/offers-data";
import {
  scrapeAllSources,
  computeLocationPriority,
} from "@/lib/multi-source-scraper";
import { ContractTypeFilter, JobOffer } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "Data Analyst";
    const location = searchParams.get("city") || "France";
    const radiusKm = Number(searchParams.get("radius") || 25);
    const maxOffers = Number(searchParams.get("limit") || 25);
    const contractTypeFilter =
      (searchParams.get("contractType") as ContractTypeFilter) || "STAGE_ONLY";
    const keywordsParam = searchParams.get("keywords");
    const candidateKeywords = keywordsParam
      ? keywordsParam.split(",").map((k) => k.trim()).filter(Boolean)
      : DEFAULT_CANDIDATE_PROFILE.keywords;

    const scrapeResult = await scrapeAllSources({
      searchQuery: query,
      location,
      radiusKm,
      maxOffers,
      contractTypeFilter,
    });

    const ranked = matchAndRankOffers(scrapeResult.offers, candidateKeywords, query);

    // Apply secondary score boost:
    // +8 points for isTopDataEmployer
    // +6 points for matching user's priority city like Lille/Nord when location includes Lille
    const isLilleRequested = /lille|hauts-de-france|nord|priorit[ée]/i.test(location);

    const boosted = ranked.map((offer) => {
      let score = offer.matchScore || 50;
      if (offer.isTopDataEmployer) {
        score += 8;
      }
      const locLower = (offer.location || "").toLowerCase();
      const isLilleOrNord =
        /\b(lille|villeneuve[\s-]?d['’]?ascq|lezennes|roubaix|lesquin|hem|tourcoing|marcq|seclin|douai|valenciennes|59|hauts[\s-]?de[\s-]?france|nord)\b/i.test(
          locLower
        );
      if (isLilleRequested && isLilleOrNord) {
        score += 6;
      }
      return {
        ...offer,
        matchScore: Math.min(99, score),
      };
    });

    boosted.sort((a, b) => {
      const diff = (b.matchScore || 0) - (a.matchScore || 0);
      if (diff !== 0) return diff;
      const pA = computeLocationPriority(a.location, location);
      const pB = computeLocationPriority(b.location, location);
      return pB - pA;
    });

    const liveCount = boosted.filter(
      (o) =>
        o.source === "LinkedIn" ||
        o.source === "HelloWork" ||
        o.source === "JobTeaser" ||
        o.source === "Stage.fr" ||
        o.source === "France Travail" ||
        o.source === "1jeune1solution" ||
        o.source === "SmartRecruiters" ||
        o.source === "Portail Mulliez / AFM" ||
        (Array.isArray(o.mergedSources) && o.mergedSources.some((s) => /LinkedIn|HelloWork|JobTeaser|Stage\.fr/i.test(s)))
    ).length;

    return NextResponse.json({
      offers: boosted,
      total: boosted.length,
      liveCount,
      effectiveQuery: query,
      sourceBreakdown: scrapeResult.sourceBreakdown,
      rejectedCdiCount: scrapeResult.rejectedCdiCount,
      engine: "StagePilot Multi-Source Real-Time Scraper",
      scannedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erreur lors du scraping multi-sources",
        details: String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      cvText = "",
      keywords = [],
      searchQuery = "",
      location = "France",
      radiusKm = 25,
      maxOffers = 25,
      startOffset = 0,
      contractTypeFilter = "STAGE_ONLY",
    }: {
      cvText?: string;
      keywords?: string[];
      searchQuery?: string;
      location?: string;
      radiusKm?: number;
      maxOffers?: number;
      startOffset?: number;
      contractTypeFilter?: ContractTypeFilter;
    } = body;

    const extractedFromCv = cvText ? extractKeywordsFromText(cvText) : [];
    const activeKeywords =
      Array.isArray(keywords) && keywords.length > 0
        ? keywords
        : extractedFromCv.length > 0
          ? extractedFromCv
          : DEFAULT_CANDIDATE_PROFILE.keywords;

    let effectiveQuery = (searchQuery || "").trim();
    if (!effectiveQuery) {
      if (cvText && cvText.trim().length > 20) {
        effectiveQuery = inferTargetRoleFromText(cvText);
      } else if (activeKeywords.length > 0) {
        effectiveQuery = inferTargetRoleFromText(activeKeywords.join(" "));
      } else {
        effectiveQuery = "Data Analyst";
      }
    }

    const scrapeResult = await scrapeAllSources({
      searchQuery: effectiveQuery,
      location: location || "France",
      radiusKm,
      maxOffers,
      startOffset,
      contractTypeFilter: (contractTypeFilter as ContractTypeFilter) || "STAGE_ONLY",
    });

    const ranked = matchAndRankOffers(
      scrapeResult.offers,
      activeKeywords,
      effectiveQuery
    );

    // Secondary scoring & prioritization boost
    const isLilleRequested = /lille|hauts-de-france|nord|priorit[ée]/i.test(location);

    const boosted = ranked.map((offer) => {
      let score = offer.matchScore || 50;
      if (offer.isTopDataEmployer) {
        score += 8;
      }
      const locLower = (offer.location || "").toLowerCase();
      const isLilleOrNord =
        /\b(lille|villeneuve[\s-]?d['’]?ascq|lezennes|roubaix|lesquin|hem|tourcoing|marcq|seclin|douai|valenciennes|59|hauts[\s-]?de[\s-]?france|nord)\b/i.test(
          locLower
        );
      if (isLilleRequested && isLilleOrNord) {
        score += 6;
      }
      return {
        ...offer,
        matchScore: Math.min(99, score),
      };
    });

    boosted.sort((a, b) => {
      const diff = (b.matchScore || 0) - (a.matchScore || 0);
      if (diff !== 0) return diff;
      const pA = computeLocationPriority(a.location, location);
      const pB = computeLocationPriority(b.location, location);
      return pB - pA;
    });

    const liveCount = boosted.filter(
      (o) =>
        o.source === "LinkedIn" ||
        o.source === "HelloWork" ||
        o.source === "JobTeaser" ||
        o.source === "Stage.fr" ||
        o.source === "France Travail" ||
        o.source === "1jeune1solution" ||
        o.source === "SmartRecruiters" ||
        o.source === "Portail Mulliez / AFM" ||
        (Array.isArray(o.mergedSources) && o.mergedSources.some((s) => /LinkedIn|HelloWork|JobTeaser|Stage\.fr/i.test(s)))
    ).length;

    return NextResponse.json({
      offers: boosted,
      total: boosted.length,
      liveCount,
      effectiveQuery,
      detectedKeywords: activeKeywords,
      extractedFromCv,
      sourceBreakdown: scrapeResult.sourceBreakdown,
      rejectedCdiCount: scrapeResult.rejectedCdiCount,
      scannedSources: Object.keys(scrapeResult.sourceBreakdown),
      scannedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erreur lors du scraping multi-sources et du matching des offres",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
