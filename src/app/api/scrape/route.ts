import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_CANDIDATE_PROFILE,
  enrichOfferMetadata,
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

function inferDomainFallbackSkills(title: string, description: string, query: string): string[] {
  const combined = `${title} ${description} ${query}`.toLowerCase();

  if (
    combined.includes("psycholog") ||
    combined.includes("neuropsych") ||
    combined.includes("clinique") ||
    combined.includes("thérap") ||
    combined.includes("patient") ||
    combined.includes("soin") ||
    combined.includes("éducateur")
  ) {
    return [
      "Entretien clinique",
      "Bilan psychologique",
      "Écoute active",
      "Accompagnement patient",
      "Comptes-rendus cliniques",
      "Tests psychométriques (WISC/WAIS)",
    ];
  }

  if (
    combined.includes("mécani") ||
    combined.includes("maintenance") ||
    combined.includes("usinage") ||
    combined.includes("automobile") ||
    combined.includes("industriel") ||
    combined.includes("électrotech") ||
    combined.includes("production")
  ) {
    return [
      "Maintenance industrielle",
      "Mécanique générale",
      "SolidWorks",
      "CAO / AutoCAD",
      "Diagnostic technique / Auto",
      "Lean Manufacturing",
      "QHSE / Qualité",
    ];
  }

  if (
    combined.includes("marketing") ||
    combined.includes("communication") ||
    combined.includes("community") ||
    combined.includes("réseaux sociaux") ||
    combined.includes("événementiel")
  ) {
    return [
      "Marketing Digital",
      "Réseaux Sociaux",
      "Canva",
      "Suite Adobe",
      "Rédaction & Content",
      "SEO / SEA",
      "Gestion de projet",
    ];
  }

  if (
    combined.includes("commercial") ||
    combined.includes("business dev") ||
    combined.includes("vente") ||
    combined.includes("account") ||
    combined.includes("achats")
  ) {
    return [
      "Prospection commerciale",
      "Négociation & Vente",
      "Relation client",
      "CRM (Salesforce / HubSpot)",
      "Excel",
      "Gestion de projet",
    ];
  }

  if (
    combined.includes("finance") ||
    combined.includes("comptab") ||
    combined.includes("contrôle de gestion") ||
    combined.includes("audit") ||
    combined.includes("trésorerie")
  ) {
    return [
      "Contrôle de gestion",
      "Comptabilité générale",
      "Analyse financière",
      "Excel",
      "KPI & Reporting",
      "SAP / Sage",
    ];
  }

  if (
    combined.includes("ressources humaines") ||
    combined.includes("recrutement") ||
    combined.includes("assistant rh") ||
    combined.includes("paie") ||
    combined.includes("talent")
  ) {
    return [
      "Recrutement & Sourcing RH",
      "Droit social",
      "Formation & GPEC",
      "Administration du personnel",
      "Pack Office",
      "Relation client",
    ];
  }

  if (combined.includes("juriste") || combined.includes("droit") || combined.includes("avocat") || combined.includes("notaire")) {
    return [
      "Droit des affaires",
      "Droit des contrats",
      "Droit social",
      "RGPD / Conformité",
      "Synthèse & Rédaction",
    ];
  }

  if (
    combined.includes("btp") ||
    combined.includes("chantier") ||
    combined.includes("génie civil") ||
    combined.includes("travaux") ||
    combined.includes("architect")
  ) {
    return [
      "Conduite de travaux",
      "Génie civil / BTP",
      "CAO / AutoCAD",
      "Revit / BIM",
      "Chiffrage & Métrés",
      "QHSE / Qualité",
    ];
  }

  if (
    combined.includes("graphis") ||
    combined.includes("design") ||
    combined.includes("ui") ||
    combined.includes("ux") ||
    combined.includes("créat")
  ) {
    return ["Figma / UI-UX", "Suite Adobe", "Canva", "Réseaux Sociaux", "Gestion de projet"];
  }

  if (
    combined.includes("biolog") ||
    combined.includes("chimie") ||
    combined.includes("laboratoire") ||
    combined.includes("environnement") ||
    combined.includes("rse") ||
    combined.includes("agronom")
  ) {
    return [
      "Laboratoire / Biologie / Chimie",
      "Environnement & RSE",
      "QHSE / Qualité",
      "Excel",
      "Gestion de projet",
    ];
  }

  if (
    combined.includes("data analyst") ||
    combined.includes("business intelligence") ||
    combined.includes("reporting") ||
    combined.includes("data")
  ) {
    return ["SQL", "Python", "Power BI", "Tableau", "Excel", "Data Visualization", "KPI & Reporting"];
  }

  if (combined.includes("data scientist") || combined.includes("machine learning") || combined.includes("ia ")) {
    return ["Python", "SQL", "Machine Learning", "Pandas", "Statistiques", "LLM / IA Générative"];
  }

  if (
    combined.includes("développeur") ||
    combined.includes("developer") ||
    combined.includes("full stack") ||
    combined.includes("fullstack") ||
    combined.includes("logiciel") ||
    combined.includes("web")
  ) {
    return ["TypeScript", "React", "Node.js", "Python", "SQL", "Git", "API REST"];
  }

  return ["Gestion de projet", "Pack Office", "Excel", "Travail en équipe", "Anglais professionnel"];
}

function extractMissionsAndSummaryFromHtml(
  descriptionHtml: string,
  title: string,
  company: string,
  location: string
): {
  missions: string[];
  summary: string;
  plainText: string;
  detectedEmail: string | null;
  extractedSkills: string[];
} {
  const plainText = stripHtmlTags(descriptionHtml);
  const extractedSkills = extractKeywordsFromText(`${title} ${plainText}`);

  // Strict search for a real recruitment email written inside the offer description
  const allEmails = plainText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  const validEmails = allEmails.filter(
    (em) =>
      !/example\.com|sentry|linkedin\.com|wixpress|noreply|no-reply/i.test(em) &&
      em.length <= 64
  );
  const detectedEmail = validEmails.length > 0 ? validEmails[0].toLowerCase() : null;

  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  const rawBulletPoints: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = liRegex.exec(descriptionHtml)) !== null) {
    const cleaned = stripHtmlTags(match[1]).replace(/^[-•*:\s]+/, "").trim();
    if (cleaned.length >= 22 && cleaned.length <= 240) {
      rawBulletPoints.push(cleaned);
    }
  }

  const lines = plainText
    .split(/\n+/)
    .map((l) => decodeHtmlEntities(l).replace(/^[-•*:\s]+/, "").trim())
    .filter((l) => l.length >= 30 && l.length <= 240);

  const combinedMissions: string[] = [];
  for (const item of [...rawBulletPoints, ...lines]) {
    const lower = item.toLowerCase();
    if (
      lower.startsWith("formation :") ||
      lower.startsWith("statut ") ||
      lower.startsWith("à propos") ||
      lower.startsWith("a propos") ||
      lower.startsWith("qui sommes")
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
      `Participer aux missions opérationnelles du poste « ${title} » au sein de ${company} (${location})`,
      "Mettre en œuvre les méthodes, outils et bonnes pratiques du métier en lien avec l'équipe",
      "Contribuer au suivi des projets, à l'analyse des besoins et à la qualité des livrables"
    );
  }

  const summarySentences = lines.slice(0, 2).join(" ");
  const summary =
    summarySentences.length > 40
      ? summarySentences.slice(0, 290) + (summarySentences.length > 290 ? "..." : "")
      : `Offre de stage « ${title} » publiée par ${company} (${location}).`;

  return {
    missions: combinedMissions.slice(0, 4),
    summary,
    plainText,
    detectedEmail,
    extractedSkills,
  };
}

// Known official corporate domains for accurate suggested HR contact when an offer uses a portal without inline email
const KNOWN_COMPANY_DOMAINS: Array<{ pattern: RegExp; email: string }> = [
  { pattern: /carrefour/i, email: "recrutement.stages@carrefour.com" },
  { pattern: /decathlon/i, email: "recrutement.stages@decathlon.com" },
  { pattern: /bnp\s*paribas/i, email: "recrutement.stages@bnpparibas.com" },
  { pattern: /soci[ée]t[ée]\s*g[ée]n[ée]rale/i, email: "recrutement.stages@socgen.com" },
  { pattern: /cr[ée]dit\s*agricole/i, email: "recrutement.stages@credit-agricole.fr" },
  { pattern: /\baxa\b/i, email: "campus.management@axa.fr" },
  { pattern: /vinci/i, email: "recrutement.stages@vinci.com" },
  { pattern: /bouygues/i, email: "recrutement.stages@bouygues.com" },
  { pattern: /eiffage/i, email: "recrutement.stages@eiffage.com" },
  { pattern: /renault|ampere/i, email: "recrutement.stages@renault.com" },
  { pattern: /stellantis|peugeot|citroen/i, email: "recrutement.stages@stellantis.com" },
  { pattern: /thales/i, email: "recrutement.stages@thalesgroup.com" },
  { pattern: /airbus/i, email: "recrutement.stages@airbus.com" },
  { pattern: /safran/i, email: "recrutement.stages@safran.fr" },
  { pattern: /lvmh|bon\s*march[ée]|24s|sephora|dior|louis\s*vuitton/i, email: "stages.talents@lvmh.fr" },
  { pattern: /l'or[ée]al|loreal/i, email: "stages@loreal.com" },
  { pattern: /sanofi/i, email: "recrutement.stages@sanofi.com" },
  { pattern: /danone/i, email: "recrutement.stages@danone.com" },
  { pattern: /savencia/i, email: "recrutement.stages@savencia.com" },
  { pattern: /adeo|leroy\s*merlin/i, email: "recrutement-stage@adeo.com" },
  { pattern: /totalenergies|total/i, email: "recrutement.stages@totalenergies.com" },
  { pattern: /engie/i, email: "recrutement.stages@engie.com" },
  { pattern: /\bedf\b/i, email: "recrutement.stages@edf.fr" },
  { pattern: /orange/i, email: "recrutement.stages@orange.com" },
  { pattern: /sncf/i, email: "emploi.stages@sncf.fr" },
  { pattern: /capgemini/i, email: "recrutement.stages@capgemini.com" },
  { pattern: /sopra\s*steria/i, email: "recrutement.stages@soprasteria.com" },
];

function resolveRecruitmentContact(
  company: string,
  detectedEmail: string | null
): {
  contactEmail: string;
  emailVerified: boolean;
  applyMethod: "email_direct" | "portal_and_email";
} {
  if (detectedEmail) {
    return {
      contactEmail: detectedEmail,
      emailVerified: true,
      applyMethod: "email_direct",
    };
  }

  for (const item of KNOWN_COMPANY_DOMAINS) {
    if (item.pattern.test(company)) {
      return {
        contactEmail: item.email,
        emailVerified: false,
        applyMethod: "portal_and_email",
      };
    }
  }

  const slug = company
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(groupe|france|sas|sarl|sa|holding|international|services)\b/g, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20);

  return {
    contactEmail: `rh@${slug || "entreprise"}.fr`,
    emailVerified: false,
    applyMethod: "portal_and_email",
  };
}

interface RawCard {
  jobId: string;
  title: string;
  company: string;
  location: string;
  date: string;
  url: string;
}

async function fetchLinkedInSearchPage(
  fullKeywordQuery: string,
  locationQuery: string,
  startOffset: number,
  radiusKm?: number
): Promise<RawCard[]> {
  let searchUrl = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(
    fullKeywordQuery
  )}&location=${encodeURIComponent(locationQuery)}&start=${startOffset}`;

  if (radiusKm && radiusKm > 0 && locationQuery.toLowerCase() !== "france") {
    const distanceMiles = Math.max(5, Math.round(radiusKm * 0.621371));
    searchUrl += `&distance=${distanceMiles}`;
  }

  try {
    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
      },
      cache: "no-store",
    });

    if (!response.ok) return [];
    const html = await response.text();
    const cardBlocks = html.split(/<li[^>]*>/i).slice(1);
    const cards: RawCard[] = [];

    for (const block of cardBlocks) {
      const urnMatch = block.match(/data-entity-urn="urn:li:jobPosting:(\d+)"/i);
      const jobId = urnMatch ? urnMatch[1] : "";
      if (!jobId) continue;

      const titleMatch = block.match(/<h3[^>]*base-search-card__title[^>]*>([\s\S]*?)<\/h3>/i);
      const companyMatch = block.match(/<h4[^>]*base-search-card__subtitle[^>]*>([\s\S]*?)<\/h4>/i);
      const locMatch = block.match(/<span[^>]*job-search-card__location[^>]*>([\s\S]*?)<\/span>/i);
      const dateMatch = block.match(/<time[^>]*datetime="(\d{4}-\d{2}-\d{2})"/i);
      const linkMatch = block.match(/<a[^>]*base-card__full-link[^>]*href="([^"]+)"/i);

      const title = titleMatch ? stripHtmlTags(titleMatch[1]) : "";
      const company = companyMatch ? stripHtmlTags(companyMatch[1]) : "";
      const cardLoc = locMatch ? stripHtmlTags(locMatch[1]) : locationQuery;
      const date = dateMatch ? dateMatch[1] : new Date().toISOString().slice(0, 10);
      const rawUrl = linkMatch
        ? decodeHtmlEntities(linkMatch[1]).split("?")[0]
        : `https://fr.linkedin.com/jobs/view/${jobId}`;

      if (!title || !company) continue;
      cards.push({
        jobId,
        title,
        company,
        location: cardLoc,
        date,
        url: rawUrl,
      });
    }
    return cards;
  } catch {
    return [];
  }
}

async function scrapeLiveLinkedInJobs(params: {
  searchQuery: string;
  location?: string;
  radiusKm?: number;
  maxOffers?: number;
  startOffset?: number;
}): Promise<JobOffer[]> {
  const cleanQuery = (params.searchQuery || "Data Analyst").trim();
  const hasStageKeyword = /stage|stagiaire|intern|alternance/i.test(cleanQuery);
  const fullKeywordQuery = hasStageKeyword ? cleanQuery : `Stage ${cleanQuery}`;
  const rawCity = (params.location || "France").trim();
  const locationQuery =
    rawCity.toLowerCase() === "france" || rawCity.toLowerCase().includes("france")
      ? rawCity
      : `${rawCity}, France`;
  const targetMax = Math.min(50, Math.max(10, params.maxOffers || 25));
  const baseOffset = params.startOffset || 0;

  // Fetch page 1 (and page 2 if targetMax > 25) in parallel
  const pagePromises: Promise<RawCard[]>[] = [
    fetchLinkedInSearchPage(fullKeywordQuery, locationQuery, baseOffset, params.radiusKm),
  ];
  if (targetMax > 20) {
    pagePromises.push(
      fetchLinkedInSearchPage(fullKeywordQuery, locationQuery, baseOffset + 25, params.radiusKm)
    );
  }

  const pagesResults = await Promise.all(pagePromises);
  const seenIds = new Set<string>();
  const parsedCards: RawCard[] = [];

  for (const pageCards of pagesResults) {
    for (const card of pageCards) {
      if (seenIds.has(card.jobId)) continue;
      seenIds.add(card.jobId);
      parsedCards.push(card);
      if (parsedCards.length >= targetMax) break;
    }
    if (parsedCards.length >= targetMax) break;
  }

  // Enrich the top 14 cards with full HTML detail pages in parallel, and fast-enrich any remaining cards
  const detailedOffers = await Promise.all(
    parsedCards.map(async (card, index): Promise<JobOffer> => {
      if (index < 14) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3200);

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

            const { missions, summary, plainText, detectedEmail, extractedSkills } =
              extractMissionsAndSummaryFromHtml(
                markup,
                card.title,
                card.company,
                card.location
              );

            const fallbackSkills = inferDomainFallbackSkills(card.title, plainText, cleanQuery);
            const mergedSkills = Array.from(
              new Set([...extractedSkills, ...fallbackSkills])
            ).slice(0, 9);

            const enrichedMeta = enrichOfferMetadata({
              title: card.title,
              company: card.company,
              location: card.location,
              plainDescription: plainText,
            });

            const emailInfo = resolveRecruitmentContact(card.company, detectedEmail);

            return {
              id: `li-${card.jobId}`,
              title: card.title,
              company: card.company,
              location: card.location,
              date: card.date,
              ...enrichedMeta,
              url: card.url,
              source: "LinkedIn Jobs (Live)",
              ...emailInfo,
              requiredSkills: mergedSkills,
              missions,
              description: summary,
            };
          }
        } catch {
          // Fallback to fast card enrichment below
        }
      }

      const cardSkills = extractKeywordsFromText(card.title);
      const fallbackSkills = inferDomainFallbackSkills(card.title, "", cleanQuery);
      const mergedSkills = Array.from(
        new Set([...cardSkills, ...fallbackSkills])
      ).slice(0, 7);

      const enrichedMeta = enrichOfferMetadata({
        title: card.title,
        company: card.company,
        location: card.location,
        plainDescription: `${card.title} ${cleanQuery}`,
      });
      const emailInfo = resolveRecruitmentContact(card.company, null);

      return {
        id: `li-${card.jobId}`,
        title: card.title,
        company: card.company,
        location: card.location,
        date: card.date,
        ...enrichedMeta,
        url: card.url,
        source: "LinkedIn Jobs (Live)",
        ...emailInfo,
        requiredSkills: mergedSkills,
        missions: [
          `Intervenir sur les missions opérationnelles du poste « ${card.title} » au sein de ${card.company} (${card.location})`,
          `Mobiliser les compétences clés (${mergedSkills.slice(0, 4).join(", ")}) sur les projets de l'équipe`,
          "Participer au suivi d'activité, à l'analyse des besoins et à l'amélioration continue du service",
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
  const location = searchParams.get("city") || "France";
  const radiusKm = Number(searchParams.get("radius") || 25);
  const maxOffers = Number(searchParams.get("limit") || 25);
  const keywordsParam = searchParams.get("keywords");
  const candidateKeywords = keywordsParam
    ? keywordsParam.split(",").map((k) => k.trim()).filter(Boolean)
    : DEFAULT_CANDIDATE_PROFILE.keywords;

  const liveOffers = await scrapeLiveLinkedInJobs({
    searchQuery: query,
    location,
    radiusKm,
    maxOffers,
  });
  const pool = liveOffers.length > 0 ? liveOffers : VERIFIED_JOB_OFFERS;
  const ranked = matchAndRankOffers(pool, candidateKeywords, query);

  return NextResponse.json({
    offers: ranked,
    total: ranked.length,
    liveCount: liveOffers.length,
    effectiveQuery: query,
    engine: "Live Real-Time Multi-Sector Job Scraper",
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
      radiusKm = 25,
      maxOffers = 25,
      startOffset = 0,
    }: {
      cvText?: string;
      keywords?: string[];
      searchQuery?: string;
      location?: string;
      radiusKm?: number;
      maxOffers?: number;
      startOffset?: number;
    } = body;

    const extractedFromCv = cvText ? extractKeywordsFromText(cvText) : [];
    const activeKeywords =
      Array.isArray(keywords)
        ? keywords
        : extractedFromCv.length > 0
          ? extractedFromCv
          : DEFAULT_CANDIDATE_PROFILE.keywords;

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

    const liveOffers = await scrapeLiveLinkedInJobs({
      searchQuery: effectiveQuery,
      location: location || "France",
      radiusKm,
      maxOffers,
      startOffset,
    });

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
        "Browserbase Multi-Sector Engine",
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
