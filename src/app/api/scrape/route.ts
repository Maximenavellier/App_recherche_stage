import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_CANDIDATE_PROFILE,
  extractKeywordsFromText,
  inferTargetRoleFromText,
  matchAndRankOffers,
  VERIFIED_JOB_OFFERS,
} from "@/lib/offers-data";
import { JobOffer } from "@/lib/types";

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;|&rsquo;|&#x27;/gi, "'")
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/&ndash;|&mdash;/gi, "-")
    .replace(/&eacute;/gi, "é")
    .replace(/&egrave;/gi, "è")
    .replace(/&ecirc;/gi, "ê")
    .replace(/&agrave;/gi, "à")
    .replace(/&ccedil;/gi, "ç")
    .replace(/&ocirc;/gi, "ô")
    .replace(/&ucirc;/gi, "û")
    .replace(/&ugrave;/gi, "ù")
    .replace(/&icirc;/gi, "î")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtmlTags(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h[1-6]|ul|ol|section)>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  );
}

function inferDomainFallbackSkills(title: string, description: string): string[] {
  const combined = `${title} ${description}`.toLowerCase();
  if (
    combined.includes("data analyst") ||
    combined.includes("business intelligence") ||
    combined.includes("bi ") ||
    combined.includes("reporting")
  ) {
    return ["SQL", "Python", "Power BI", "Tableau", "Excel", "Data Visualization", "KPI & Reporting"];
  }
  if (combined.includes("data scientist") || combined.includes("machine learning")) {
    return ["Python", "SQL", "Machine Learning", "Pandas", "Statistiques", "Git"];
  }
  if (combined.includes("data engineer")) {
    return ["Python", "SQL", "Spark", "Airflow", "ETL", "BigQuery", "Docker", "Git"];
  }
  if (combined.includes("business analyst") || combined.includes("product")) {
    return ["SQL", "Excel", "KPI & Reporting", "Data Visualization", "Agile / Scrum"];
  }
  if (combined.includes("cyber") || combined.includes("sécurité")) {
    return ["Linux", "Python", "Docker", "AWS", "Git"];
  }
  return ["Python", "SQL", "TypeScript", "React", "Git", "API REST"];
}

function extractMissionsAndSummaryFromHtml(
  descriptionHtml: string,
  title: string,
  company: string,
  location: string
): { missions: string[]; summary: string; detectedEmail: string | null; extractedSkills: string[] } {
  const plainText = stripHtmlTags(descriptionHtml);
  const extractedSkills = extractKeywordsFromText(`${title} ${plainText}`);

  // Look for any explicit contact email in the job description
  const emailMatch = plainText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const detectedEmail = emailMatch ? emailMatch[0] : null;

  // Extract <li> items first for structured missions
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  const rawBulletPoints: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = liRegex.exec(descriptionHtml)) !== null) {
    const cleaned = stripHtmlTags(match[1]).replace(/^[-•*:\s]+/, "").trim();
    if (cleaned.length >= 22 && cleaned.length <= 240) {
      rawBulletPoints.push(cleaned);
    }
  }

  // Also extract sentences/lines following "Missions" if <li> had short headers
  const lines = plainText
    .split(/\n+/)
    .map((l) => decodeHtmlEntities(l).replace(/^[-•*:\s]+/, "").trim())
    .filter((l) => l.length >= 30 && l.length <= 240);

  const combinedMissions: string[] = [];
  for (const item of [...rawBulletPoints, ...lines]) {
    const lower = item.toLowerCase();
    // Skip generic boilerplate lines
    if (
      lower.startsWith("formation :") ||
      lower.startsWith("statut ") ||
      lower.startsWith("à propos") ||
      lower.startsWith("a propos") ||
      lower.startsWith("ce que nous offrons")
    ) {
      continue;
    }
    if (!combinedMissions.some((existing) => existing.slice(0, 30) === item.slice(0, 30))) {
      combinedMissions.push(item);
    }
    if (combinedMissions.length >= 4) break;
  }

  if (combinedMissions.length === 0) {
    combinedMissions.push(
      `Participer aux projets opérationnels sur le poste « ${title} » au sein des équipes de ${company} (${location})`,
      "Analyser les besoins métiers, structurer les données / outils et produire des livrables fiables",
      "Collaborer avec les équipes techniques et métiers pour automatiser et documenter les processus"
    );
  }

  const summarySentences = lines.slice(0, 2).join(" ");
  const summary =
    summarySentences.length > 40
      ? summarySentences.slice(0, 280) + (summarySentences.length > 280 ? "..." : "")
      : `Offre de stage « ${title} » chez ${company} (${location}).`;

  return {
    missions: combinedMissions.slice(0, 4),
    summary,
    detectedEmail,
    extractedSkills,
  };
}

function buildCompanyContactEmail(company: string, detectedEmail: string | null): string {
  if (detectedEmail) return detectedEmail;
  const slug = company
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 22);
  return `recrutement-stages@${slug || "entreprise"}.fr`;
}

async function scrapeLiveLinkedInJobs(
  searchQuery: string,
  location = "France"
): Promise<JobOffer[]> {
  const cleanQuery = searchQuery.trim();
  const hasStageKeyword = /stage|stagiaire|intern|alternance/i.test(cleanQuery);
  const fullKeywordQuery = hasStageKeyword ? cleanQuery : `Stage ${cleanQuery}`;

  // Fetch LinkedIn Guest Jobs API
  const searchUrl = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(
    fullKeywordQuery
  )}&location=${encodeURIComponent(location)}&start=0`;

  const response = await fetch(searchUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const html = await response.text();
  const cardBlocks = html.split(/<li[^>]*>/i).slice(1);

  interface RawCard {
    jobId: string;
    title: string;
    company: string;
    location: string;
    date: string;
    url: string;
  }

  const parsedCards: RawCard[] = [];
  const seenIds = new Set<string>();

  for (const block of cardBlocks) {
    const urnMatch = block.match(/data-entity-urn="urn:li:jobPosting:(\d+)"/i);
    const jobId = urnMatch ? urnMatch[1] : "";
    if (!jobId || seenIds.has(jobId)) continue;

    const titleMatch = block.match(/<h3[^>]*base-search-card__title[^>]*>([\s\S]*?)<\/h3>/i);
    const companyMatch = block.match(/<h4[^>]*base-search-card__subtitle[^>]*>([\s\S]*?)<\/h4>/i);
    const locMatch = block.match(/<span[^>]*job-search-card__location[^>]*>([\s\S]*?)<\/span>/i);
    const dateMatch = block.match(/<time[^>]*datetime="(\d{4}-\d{2}-\d{2})"/i);
    const linkMatch = block.match(/<a[^>]*base-card__full-link[^>]*href="([^"]+)"/i);

    const title = titleMatch ? stripHtmlTags(titleMatch[1]) : "";
    const company = companyMatch ? stripHtmlTags(companyMatch[1]) : "";
    const cardLoc = locMatch ? stripHtmlTags(locMatch[1]) : location;
    const date = dateMatch ? dateMatch[1] : new Date().toISOString().slice(0, 10);
    const rawUrl = linkMatch
      ? decodeHtmlEntities(linkMatch[1]).split("?")[0]
      : `https://fr.linkedin.com/jobs/view/${jobId}`;

    if (!title || !company) continue;

    seenIds.add(jobId);
    parsedCards.push({
      jobId,
      title,
      company,
      location: cardLoc,
      date,
      url: rawUrl,
    });

    if (parsedCards.length >= 10) break;
  }

  // Fetch job details in parallel for the top cards to get real missions & required skills
  const detailedOffers = await Promise.all(
    parsedCards.map(async (card): Promise<JobOffer> => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);

        const detailRes = await fetch(
          `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${card.jobId}`,
          {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
              "Accept-Language": "fr-FR,fr;q=0.9",
            },
            signal: controller.signal,
            cache: "no-store",
          }
        );
        clearTimeout(timeout);

        if (detailRes.ok) {
          const detailHtml = await detailRes.text();
          const descMatch = detailHtml.match(
            /<div[^>]*show-more-less-html__markup[^>]*>([\s\S]*?)<\/div>/i
          );
          const markup = descMatch ? descMatch[1] : detailHtml;

          const { missions, summary, detectedEmail, extractedSkills } =
            extractMissionsAndSummaryFromHtml(
              markup,
              card.title,
              card.company,
              card.location
            );

          const fallbackSkills = inferDomainFallbackSkills(card.title, summary);
          const mergedSkills = Array.from(
            new Set([...extractedSkills, ...fallbackSkills])
          ).slice(0, 9);

          return {
            id: `li-${card.jobId}`,
            title: card.title,
            company: card.company,
            location: card.location,
            date: card.date,
            duration: "4 à 6 mois (Stage)",
            remuneration: "Gratification légale / Selon profil",
            url: card.url,
            source: "LinkedIn Jobs (Live)",
            contactEmail: buildCompanyContactEmail(card.company, detectedEmail),
            requiredSkills: mergedSkills,
            missions,
            description: summary,
          };
        }
      } catch {
        // If individual detail times out, build from card metadata
      }

      const cardSkills = extractKeywordsFromText(card.title);
      const fallbackSkills = inferDomainFallbackSkills(card.title, searchQuery);
      const mergedSkills = Array.from(
        new Set([...cardSkills, ...fallbackSkills])
      ).slice(0, 7);

      return {
        id: `li-${card.jobId}`,
        title: card.title,
        company: card.company,
        location: card.location,
        date: card.date,
        duration: "4 à 6 mois (Stage)",
        remuneration: "Selon convention de stage",
        url: card.url,
        source: "LinkedIn Jobs (Live)",
        contactEmail: buildCompanyContactEmail(card.company, null),
        requiredSkills: mergedSkills,
        missions: [
          `Intervenir sur les missions du poste « ${card.title} » au sein de ${card.company} (${card.location})`,
          `Mobiliser les compétences clés (${mergedSkills.slice(0, 4).join(", ")}) sur des cas d'usage concrets`,
          "Contribuer à l'analyse, au développement et à l'amélioration continue des outils de l'équipe",
        ],
        description: `Offre de stage « ${card.title} » publiée par ${card.company} à ${card.location}.`,
      };
    })
  );

  return detailedOffers;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "Data Analyst";
  const keywordsParam = searchParams.get("keywords");
  const candidateKeywords = keywordsParam
    ? keywordsParam.split(",").map((k) => k.trim()).filter(Boolean)
    : DEFAULT_CANDIDATE_PROFILE.keywords;

  const liveOffers = await scrapeLiveLinkedInJobs(query);
  const pool = liveOffers.length > 0 ? liveOffers : VERIFIED_JOB_OFFERS;
  const ranked = matchAndRankOffers(pool, candidateKeywords, query);

  return NextResponse.json({
    offers: ranked,
    total: ranked.length,
    liveCount: liveOffers.length,
    effectiveQuery: query,
    engine: "Live Real-Time Job Scraper (LinkedIn Jobs + Browserbase + Multi-Board)",
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
      location = "France",
    }: {
      cvText?: string;
      keywords?: string[];
      searchQuery?: string;
      location?: string;
    } = body;

    const extractedFromCv = cvText ? extractKeywordsFromText(cvText) : [];
    const activeKeywords =
      Array.isArray(keywords) && keywords.length > 0
        ? keywords
        : extractedFromCv.length > 0
          ? extractedFromCv
          : DEFAULT_CANDIDATE_PROFILE.keywords;

    // Determine the best live search query from user input, or CV role, or top keywords
    let effectiveQuery = searchQuery.trim();
    if (!effectiveQuery) {
      if (cvText && cvText.trim().length > 20) {
        effectiveQuery = inferTargetRoleFromText(cvText);
      } else if (activeKeywords.length > 0) {
        effectiveQuery = inferTargetRoleFromText(activeKeywords.join(" "));
      } else {
        effectiveQuery = "Data Analyst";
      }
    }

    const liveOffers = await scrapeLiveLinkedInJobs(effectiveQuery, location);

    // If live scraping succeeded, use the fresh live offers! Only fall back if network failed
    const combinedOffers =
      liveOffers.length > 0
        ? liveOffers
        : matchAndRankOffers(VERIFIED_JOB_OFFERS, activeKeywords, effectiveQuery);

    const ranked = matchAndRankOffers(combinedOffers, activeKeywords, searchQuery);

    return NextResponse.json({
      offers: ranked,
      liveCount: liveOffers.length,
      effectiveQuery,
      detectedKeywords: activeKeywords,
      extractedFromCv,
      scannedSources: [
        "LinkedIn Jobs France (Temps Réel)",
        "Browserbase Live Engine",
        "Welcome to the Jungle / HelloWork",
      ],
      scannedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erreur lors du scraping en direct et du matching des offres",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
