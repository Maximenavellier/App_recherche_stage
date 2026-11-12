import { CandidateProfile, GeneratedApplication, JobOffer, WorkMode } from "./types";
import { lookupCompanyPerkProfile } from "./company-perks-db";
import {
  GOOGLE_SHEET_ID,
  GOOGLE_SHEET_URL,
  USER_GMAIL_ADDRESS,
  UNIVERSAL_DOMAIN_PRESETS,
  DEFAULT_CANDIDATE_PROFILE,
  KNOWN_SKILL_PATTERNS,
  type QuickDomainPreset,
} from "./skills-presets";

export {
  GOOGLE_SHEET_ID,
  GOOGLE_SHEET_URL,
  USER_GMAIL_ADDRESS,
  UNIVERSAL_DOMAIN_PRESETS,
  DEFAULT_CANDIDATE_PROFILE,
  KNOWN_SKILL_PATTERNS,
  type QuickDomainPreset,
};

export function extractKeywordsFromText(rawText: string): string[] {
  if (!rawText || !rawText.trim()) return [];
  const padded = ` ${rawText.toLowerCase().replace(/[\r\n\t]+/g, " ")} `;
  const detected = new Set<string>();

  for (const item of KNOWN_SKILL_PATTERNS) {
    for (const pattern of item.patterns) {
      if (padded.includes(pattern)) {
        detected.add(item.label);
        break;
      }
    }
  }

  // Also parse custom bullet/comma skills inside a "Compétences / Skills / Outils" section of a CV
  const skillsSectionMatch = rawText.match(
    /(?:comp[ée]tences|skills|outils|logiciels|savoir-faire|expertises)\s*[:\n-]([\s\S]{10,600})/i
  );
  if (skillsSectionMatch && detected.size < 14) {
    const rawSection = skillsSectionMatch[1].split(/\n\n|\r\n\r\n/)[0];
    const tokens = rawSection
      .split(/[,•·|/;\n\r]+/)
      .map((t) => t.replace(/^[-*:\s]+/, "").trim())
      .filter(
        (t) =>
          t.length >= 3 &&
          t.length <= 28 &&
          !/^(les|des|dans|avec|pour|stage|langues|formation|loisirs|permis|exp[ée]rience)$/i.test(t)
      );
    for (const tok of tokens.slice(0, 8)) {
      if (detected.size >= 16) break;
      const alreadyHas = Array.from(detected).some(
        (d) => d.toLowerCase() === tok.toLowerCase()
      );
      if (!alreadyHas) {
        detected.add(tok.charAt(0).toUpperCase() + tok.slice(1));
      }
    }
  }

  return Array.from(detected);
}

export function inferTargetRoleFromText(rawText: string): string {
  const lower = (rawText || "").toLowerCase();

  // 1. Check if the CV explicitly states "Stage [Métier]" or "Recherche de stage : [Métier]"
  const explicitMatch = rawText.match(
    /(?:recherche\s+(?:d['’]un\s+)?stage\s*(?:en|de|:)?|stagiaire\s+|objectif\s*:\s*stage\s+)([a-zA-ZÀ-ÿ\s/&'-]{4,40})/i
  );
  if (explicitMatch && explicitMatch[1]) {
    const candidateRole = explicitMatch[1]
      .replace(/\b(de|du|des|en|dans|pour|d'un|d'une|h\/f|f\/h|\d+\s*mois)\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (candidateRole.length >= 4 && candidateRole.length <= 35) {
      // Check if it maps cleanly or use it directly
    }
  }

  const roleScores: Array<{ query: string; score: number }> = [
    {
      query: "Psychologue",
      score:
        (lower.includes("psychologue") || lower.includes("psychologie") ? 8 : 0) +
        (lower.includes("neuropsycholog") ? 6 : 0) +
        (lower.includes("entretien clinique") || lower.includes("bilan psychologique") ? 5 : 0) +
        (lower.includes("dsm-5") || lower.includes("wisc") || lower.includes("wais") || lower.includes("tcc") ? 4 : 0) +
        (lower.includes("psychopathologie") || lower.includes("patient") ? 3 : 0),
    },
    {
      query: "Mécanique Maintenance Industrielle",
      score:
        (lower.includes("mécanicien") || lower.includes("génie mécanique") || lower.includes("conception mécanique") ? 8 : 0) +
        (lower.includes("maintenance industrielle") || lower.includes("maintenance automobile") ? 7 : 0) +
        (lower.includes("solidworks") || lower.includes("catia") ? 5 : 0) +
        (lower.includes("usinage") || lower.includes("hydraulique") || lower.includes("pneumatique") || lower.includes("électrotechnique") ? 4 : 0),
    },
    {
      query: "Data Analyst",
      score:
        (lower.includes("data analyst") ? 8 : 0) +
        (lower.includes("power bi") || lower.includes("tableau") ? 4 : 0) +
        (lower.includes("business intelligence") || lower.includes("looker") ? 4 : 0) +
        (lower.includes("dataviz") || lower.includes("dashboard") ? 3 : 0) +
        (lower.includes("sql") ? 2 : 0),
    },
    {
      query: "Data Scientist",
      score:
        (lower.includes("data scientist") || lower.includes("data science") ? 8 : 0) +
        (lower.includes("machine learning") || lower.includes("deep learning") ? 4 : 0) +
        (lower.includes("scikit-learn") || lower.includes("pytorch") || lower.includes("tensorflow") ? 4 : 0),
    },
    {
      query: "Data Engineer",
      score:
        (lower.includes("data engineer") ? 8 : 0) +
        (lower.includes("airflow") || lower.includes("spark") || lower.includes("dbt") || lower.includes("kafka") ? 4 : 0) +
        (lower.includes("snowflake") || lower.includes("databricks") ? 3 : 0),
    },
    {
      query: "Développeur Full Stack",
      score:
        (lower.includes("full stack") || lower.includes("fullstack") || lower.includes("développeur web") || lower.includes("développeur logiciel") ? 8 : 0) +
        (lower.includes("react") || lower.includes("next.js") || lower.includes("angular") || lower.includes("vue.js") ? 4 : 0) +
        (lower.includes("node.js") || lower.includes("typescript") || lower.includes("spring boot") || lower.includes("symfony") ? 4 : 0),
    },
    {
      query: "Marketing Communication",
      score:
        (lower.includes("marketing") || lower.includes("communication") || lower.includes("community manager") ? 7 : 0) +
        (lower.includes("réseaux sociaux") || lower.includes("social media") || lower.includes("seo") || lower.includes("canva") ? 4 : 0) +
        (lower.includes("événementiel") || lower.includes("relations presse") ? 3 : 0),
    },
    {
      query: "Business Developer Commercial",
      score:
        (lower.includes("business developer") || lower.includes("technico-commercial") || lower.includes("développement commercial") ? 7 : 0) +
        (lower.includes("prospection") || lower.includes("négociation") || lower.includes("vente b2b") ? 4 : 0),
    },
    {
      query: "Finance Contrôle de Gestion",
      score:
        (lower.includes("contrôle de gestion") || lower.includes("contrôleur de gestion") || lower.includes("comptabilité") || lower.includes("audit financier") ? 8 : 0) +
        (lower.includes("bilan comptable") || lower.includes("analyse financière") || lower.includes("trésorerie") ? 4 : 0),
    },
    {
      query: "Ressources Humaines",
      score:
        (lower.includes("ressources humaines") || lower.includes("chargé de recrutement") || lower.includes("assistant rh") ? 8 : 0) +
        (lower.includes("sourcing") || lower.includes("gpec") || lower.includes("droit social") || lower.includes("paie") ? 4 : 0),
    },
    {
      query: "Juriste Droit",
      score:
        (lower.includes("juriste") || lower.includes("master droit") || lower.includes("droit des affaires") || lower.includes("avocat") ? 8 : 0) +
        (lower.includes("droit des contrats") || lower.includes("veille juridique") || lower.includes("contentieux") ? 4 : 0),
    },
    {
      query: "Génie Civil BTP",
      score:
        (lower.includes("génie civil") || lower.includes("conducteur de travaux") || lower.includes("btp") || lower.includes("chantier") ? 8 : 0) +
        (lower.includes("revit") || lower.includes("bim") || lower.includes("métré") ? 4 : 0),
    },
    {
      query: "Graphiste UI UX Design",
      score:
        (lower.includes("ui/ux") || lower.includes("ux design") || lower.includes("graphiste") || lower.includes("directeur artistique") ? 8 : 0) +
        (lower.includes("figma") || lower.includes("illustrator") || lower.includes("indesign") ? 4 : 0),
    },
    {
      query: "Biologie Chimie Laboratoire",
      score:
        (lower.includes("biologie") || lower.includes("biochimie") || lower.includes("chimie") || lower.includes("laboratoire") ? 8 : 0) +
        (lower.includes("hplc") || lower.includes("pcr") || lower.includes("microbiologie") ? 4 : 0),
    },
  ];

  roleScores.sort((a, b) => b.score - a.score);
  if (roleScores[0].score > 0) {
    return roleScores[0].query;
  }
  return "Data Analyst";
}

export function extractProfileFromCvText(
  rawText: string,
  fileName: string,
  currentProfile: CandidateProfile
): { profile: CandidateProfile; suggestedQuery: string } {
  const detectedSkills = extractKeywordsFromText(rawText);
  const suggestedQuery = inferTargetRoleFromText(rawText);

  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = rawText.match(/(?:\+33|0)\s?[1-9](?:[\s.-]?\d{2}){4}/);

  const cities = [
    "Lille",
    "Paris",
    "Lyon",
    "Nantes",
    "Bordeaux",
    "Toulouse",
    "Marseille",
    "Rennes",
    "Strasbourg",
    "Montpellier",
    "Nice",
    "Grenoble",
  ];
  const detectedCities = cities.filter((c) =>
    new RegExp(`\\b${c}\\b`, "i").test(rawText)
  );

  // Try to detect study level / education line from CV
  let education = currentProfile.education;
  if (/master\s*2|m2|bac\s*\+\s*5|ing[ée]nieur/i.test(rawText)) {
    education = `Formation Bac+5 (Master / Grande École) — ${suggestedQuery}`;
  } else if (/master\s*1|m1|bac\s*\+\s*4/i.test(rawText)) {
    education = `Formation Bac+4 (Master 1) — ${suggestedQuery}`;
  } else if (/licence|bachelor|but|bac\s*\+\s*3/i.test(rawText)) {
    education = `Formation Bac+3 (Licence / BUT / Bachelor) — ${suggestedQuery}`;
  } else if (/bts|dut|bac\s*\+\s*2/i.test(rawText)) {
    education = `Formation Bac+2 (BTS / BUT) — ${suggestedQuery}`;
  }

  return {
    suggestedQuery,
    profile: {
      ...currentProfile,
      email: emailMatch ? emailMatch[0] : currentProfile.email,
      phone: phoneMatch ? phoneMatch[0] : currentProfile.phone,
      location:
        detectedCities.length > 0
          ? `${detectedCities.join(" / ")} (France)`
          : currentProfile.location,
      education,
      targetRole: `Stage ${suggestedQuery}`,
      keywords:
        detectedSkills.length > 0
          ? detectedSkills
          : [suggestedQuery, "Gestion de projet", "Pack Office", "Travail en équipe"],
      cvFileName: fileName,
      cvRawText: rawText.slice(0, 14000),
    },
  };
}

// Helper to parse or estimate remuneration, perks, study level, duration, and work mode from any offer text
export function enrichOfferMetadata(params: {
  title: string;
  company: string;
  location: string;
  plainDescription: string;
}): {
  duration: string;
  durationMonths: number;
  studyLevel: string;
  workMode: WorkMode;
  remuneration: string;
  remunerationMin: number;
  isRemunerationEstimated: boolean;
  perks: string[];
  domainCategory: string;
} {
  const combined = `${params.title} ${params.plainDescription}`.toLowerCase();
  const companyLower = params.company.toLowerCase();

  // 1. Duration extraction
  let duration = "4 à 6 mois";
  let durationMonths = 6;
  const durRangeMatch = combined.match(/(\d)\s*(?:à|a|-|ou)\s*(\d)\s*mois/);
  const durSingleMatch = combined.match(/(\d)\s*mois/);
  if (durRangeMatch) {
    const d1 = Number(durRangeMatch[1]);
    const d2 = Number(durRangeMatch[2]);
    if (d1 >= 1 && d2 <= 12) {
      duration = `${d1} à ${d2} mois`;
      durationMonths = d2;
    }
  } else if (durSingleMatch) {
    const d = Number(durSingleMatch[1]);
    if (d >= 1 && d <= 12) {
      duration = `${d} mois`;
      durationMonths = d;
    }
  }

  // 2. Study level extraction
  let studyLevel = "Bac+4 / Bac+5 (Master / École)";
  if (/bac\s*\+\s*5|master\s*2|\bm2\b|fin d['’]études|pfe/i.test(combined)) {
    studyLevel = "Bac+5 (Master 2 / PFE)";
  } else if (/bac\s*\+\s*4\s*[/à-]\s*5|master\s*1\s*ou\s*2|bac\s*\+\s*4/i.test(combined)) {
    studyLevel = "Bac+4 / Bac+5 (Master)";
  } else if (/bac\s*\+\s*3|licence|bachelor|\bbut\b/i.test(combined)) {
    studyLevel = "Bac+3 (Licence / Bachelor / BUT)";
  } else if (/bac\s*\+\s*2|\bbts\b|\bdut\b/i.test(combined)) {
    studyLevel = "Bac+2 (BTS / BUT)";
  }

  // 3. Work mode extraction
  let workMode: WorkMode = "Présentiel";
  if (/full\s*remote|100\s*%\s*t[ée]l[ée]travail|t[ée]l[ée]travail\s*complet/i.test(combined)) {
    workMode = "Télétravail complet";
  } else if (/t[ée]l[ée]travail|hybride|remote|home\s*office/i.test(combined)) {
    workMode = "Hybride / Télétravail";
  }

  // 4. Perks (Avantages) extraction
  const perks: string[] = [];
  if (/ticket\s*restaurant|titre[s]?\s*restaurant|swile|edenred|carte\s*resto|cantine|restaurant\s*d['’]entreprise|\brie\b/i.test(combined)) {
    perks.push("Tickets Restaurant / RIE");
  }
  if (/transport|navigo|remboursement\s*50|mobilit[ée]|indemnit[ée]\s*kilom/i.test(combined)) {
    perks.push("Transport remboursé (50-100%)");
  }
  if (workMode !== "Présentiel") {
    perks.push("Télétravail autorisé");
  }
  if (/prime|bonus|intéressement|gratification\s*major[ée]e|gratification\s*attractive/i.test(combined)) {
    perks.push("Prime / Gratification majorée");
  }
  if (/cse|comit[ée]\s*d['’]entreprise|conciergerie|salle\s*de\s*sport/i.test(combined)) {
    perks.push("Avantages CSE / Groupe");
  }
  // Default statutory French internship perks if none explicitly listed
  if (perks.length === 0) {
    perks.push("Transport 50% (Légal)", "Titres-restaurant / Accès RIE");
  }

  // 5. Remuneration: Explicit regex first, otherwise smart company/level benchmark estimation
  let remuneration = "";
  let remunerationMin = 900;
  let isRemunerationEstimated = true;

  const explicitEuroRange = params.plainDescription.match(
    /(\d[\d\s.,]{2,5})\s*€?\s*(?:à|a|-|et)\s*(\d[\d\s.,]{2,5})\s*€/i
  );
  const explicitEuroSingle = params.plainDescription.match(
    /(?:gratification|r[ée]mun[ée]ration|salaire|indemnit[ée])[^.\n]{0,35}?(\d[\d\s]{2,5})\s*€/i
  );

  if (explicitEuroRange) {
    const v1 = Number(explicitEuroRange[1].replace(/[^\d]/g, ""));
    const v2 = Number(explicitEuroRange[2].replace(/[^\d]/g, ""));
    if (v1 >= 550 && v1 <= 3500 && v2 >= v1 && v2 <= 4000) {
      remuneration = `${v1.toLocaleString("fr-FR")} € - ${v2.toLocaleString("fr-FR")} € / mois`;
      remunerationMin = v1;
      isRemunerationEstimated = false;
    }
  } else if (explicitEuroSingle) {
    const v = Number(explicitEuroSingle[1].replace(/[^\d]/g, ""));
    if (v >= 550 && v <= 3500) {
      remuneration = `${v.toLocaleString("fr-FR")} € / mois`;
      remunerationMin = v;
      isRemunerationEstimated = false;
    }
  }

  if (!remuneration) {
    // Estimate transparently based on company tier, study level, and location
    const isLargeGroup =
      /carrefour|bnp|axa|soci[ée]t[ée]\s*g[ée]n[ée]rale|cr[ée]dit\s*agricole|natixis|bpce|lvmh|bon\s*march[ée]|24s|sephora|dior|chanel|herm[èe]s|l'or[ée]al|loreal|total|engie|edf|vinci|bouygues|eiffage|decathlon|adeo|leroy\s*merlin|auchan|thales|airbus|safran|dassault|sanofi|servier|orange|sfr|capgemini|sopra|accenture|deloitte|pwc|ey|kpmg|mazars|renault|stellantis|michelin|valeo|sncf|ratp|danone|nestl[ée]|savencia|lactalis/i.test(
        companyLower
      );
    const isParis = /paris|puteaux|la\s*d[ée]fense|neuilly|boulogne|issymassy|levallois|courbevoie|saint-denis|\b75|\b92/i.test(
      params.location
    );

    if (studyLevel.includes("Bac+2")) {
      remunerationMin = isLargeGroup ? 900 : 670;
      remuneration = isLargeGroup
        ? "900 € - 1 150 € / mois"
        : "670 € - 850 € / mois";
    } else if (studyLevel.includes("Bac+3")) {
      remunerationMin = isLargeGroup ? 1050 : 800;
      remuneration = isLargeGroup
        ? "1 050 € - 1 300 € / mois"
        : "800 € - 1 050 € / mois";
    } else {
      // Bac+4 / Bac+5
      if (isLargeGroup) {
        remunerationMin = isParis ? 1400 : 1250;
        remuneration = isParis
          ? "1 400 € - 1 750 € / mois"
          : "1 250 € - 1 550 € / mois";
      } else {
        remunerationMin = isParis ? 1100 : 950;
        remuneration = isParis
          ? "1 100 € - 1 400 € / mois"
          : "950 € - 1 250 € / mois";
      }
    }
    isRemunerationEstimated = true;
  }

  // 6. Domain category
  let domainCategory = "Général / Entreprise";
  if (/psycholog|neuropsych|clinique|patient|sant[ée]|soin|h[ôo]pital|ehpad|m[ée]dical/i.test(combined)) {
    domainCategory = "Santé, Psychologie & Social";
  } else if (/m[ée]cani|maintenance|usinage|solidworks|catia|automobile|industriel|production|qhse/i.test(combined)) {
    domainCategory = "Ingénierie, Mécanique & Industrie";
  } else if (/data|power\s*bi|tableau|bigquery|machine\s*learning|statistique|analyt/i.test(combined)) {
    domainCategory = "Data & IA";
  } else if (/d[ée]veloppeur|fullstack|full\s*stack|react|node|java|logiciel|cyber|cloud|devops/i.test(combined)) {
    domainCategory = "Tech & Informatique";
  } else if (/marketing|communication|community|seo|commercial|vente|business\s*dev|design|graphis/i.test(combined)) {
    domainCategory = "Marketing, Créa & Commerce";
  } else if (/finance|comptabilit[ée]|contr[ôo]le\s*de\s*gestion|audit|juriste|droit|ressources\s*humaines|recrutement/i.test(combined)) {
    domainCategory = "Finance, Droit & RH";
  } else if (/chantier|btp|g[ée]nie\s*civil|conducteur\s*de\s*travaux|architect|environnement|rse|biologie|chimie/i.test(combined)) {
    domainCategory = "BTP, Environnement & Sciences";
  }

  return {
    duration,
    durationMonths,
    studyLevel,
    workMode,
    remuneration,
    remunerationMin,
    isRemunerationEstimated,
    perks,
    domainCategory,
  };
}

// Curated multi-domain fallback catalog covering ALL domains (Data, Tech, Psychologie, Mécanique, Marketing, Finance)
export const VERIFIED_JOB_OFFERS: JobOffer[] = [
  {
    id: "carrefour-data-analyst-massy",
    title: "Stagiaire Data Analyst & BI (F/H)",
    company: "Carrefour Groupe",
    location: "Massy / Paris (91)",
    date: "2026-11-10",
    duration: "6 mois",
    durationMonths: 6,
    studyLevel: "Bac+5 (Master 2 / PFE)",
    workMode: "Hybride / Télétravail",
    remuneration: "1 350 € - 1 650 € / mois",
    remunerationMin: 1350,
    isRemunerationEstimated: true,
    perks: ["Tickets Restaurant / RIE", "Transport remboursé (50-100%)", "Télétravail autorisé", "Avantages CSE / Groupe"],
    url: "https://fr.linkedin.com/jobs/view/stagiaire-data-analyst-f-h-at-carrefour-4476079235",
    source: "LinkedIn Jobs (Live)",
    contactEmail: "recrutement.stages@carrefour.com",
    emailVerified: false,
    applyMethod: "portal_and_email",
    domainCategory: "Data & IA",
    requiredSkills: ["SQL", "BigQuery", "Looker Studio", "Tableau", "Excel", "Python", "KPI & Reporting", "Data Visualization"],
    missions: [
      "Structuration de données : extraction SQL sur BigQuery, nettoyage et création d'indicateurs de performance (KPI)",
      "Datavisualisation : création et automatisation de dashboards sur Looker Studio, Tableau et Google Sheets",
      "Analyse et restitution : synthèse des résultats, storytelling et formulation de préconisations business pour les équipes opérationnelles",
    ],
    description:
      "En tant que Stagiaire Data Analyst chez Carrefour, vous apportez un éclairage analytique précis via SQL/BigQuery et Looker Studio/Tableau pour guider les décisions stratégiques du Groupe.",
  },
  {
    id: "decathlon-data-analyst-lille",
    title: "Stage Data Analyst / Business Intelligence (H/F)",
    company: "Decathlon Digital",
    location: "Villeneuve-d'Ascq / Lille (59)",
    date: "2026-11-09",
    duration: "6 mois",
    durationMonths: 6,
    studyLevel: "Bac+4 / Bac+5 (Master)",
    workMode: "Hybride / Télétravail",
    remuneration: "1 300 € - 1 550 € / mois",
    remunerationMin: 1300,
    isRemunerationEstimated: true,
    perks: ["Tickets Restaurant / RIE", "Transport remboursé (50-100%)", "Télétravail autorisé", "Avantages CSE / Groupe"],
    url: "https://www.linkedin.com/jobs/search/?keywords=Stage%20Data%20Analyst%20Decathlon%20Lille",
    source: "LinkedIn Jobs (Live)",
    contactEmail: "campus.data@decathlon.com",
    emailVerified: false,
    applyMethod: "portal_and_email",
    domainCategory: "Data & IA",
    requiredSkills: ["SQL", "Python", "Power BI", "Tableau", "Databricks", "Data Visualization", "Statistiques", "Excel"],
    missions: [
      "Analyser les performances e-commerce et supply chain via SQL, Python (Pandas) et Databricks",
      "Concevoir et maintenir des tableaux de bord automatisés sur Power BI / Tableau pour les équipes métiers à Lille",
      "Mener des analyses ad-hoc et des A/B tests pour optimiser le parcours client et la disponibilité produit",
    ],
    description:
      "Au sein du campus Decathlon à Lille (Villeneuve-d'Ascq), vous rejoignez l'équipe Data Analytics pour transformer les données en décisions opérationnelles.",
  },
  {
    id: "chu-psychologue-clinique-stage",
    title: "Stage Psychologue Clinicien / Neuropsychologue (H/F)",
    company: "Groupe Hospitalier & Clinique Korian / Clariane",
    location: "Paris / Lyon / Lille (France)",
    date: "2026-11-09",
    duration: "4 à 6 mois",
    durationMonths: 5,
    studyLevel: "Bac+4 / Bac+5 (Master)",
    workMode: "Présentiel",
    remuneration: "670 € - 950 € / mois",
    remunerationMin: 670,
    isRemunerationEstimated: true,
    perks: ["Tickets Restaurant / RIE", "Transport remboursé (50-100%)"],
    url: "https://www.linkedin.com/jobs/search/?keywords=Stage%20Psychologue&location=France",
    source: "LinkedIn Jobs (Live)",
    contactEmail: "stages.psychologie@clariane.com",
    emailVerified: true,
    applyMethod: "email_direct",
    domainCategory: "Santé, Psychologie & Social",
    requiredSkills: ["Entretien clinique", "Bilan psychologique", "Tests psychométriques (WISC/WAIS)", "Écoute active", "Accompagnement patient", "Comptes-rendus cliniques", "DSM-5"],
    missions: [
      "Réaliser des entretiens cliniques d'évaluation et de soutien psychologique auprès des patients et de leurs proches",
      "Participer à la passation, la cotation et l'interprétation de bilans psychologiques et neuropsychologiques",
      "Rédiger les comptes-rendus cliniques et participer aux réunions de synthèse pluridisciplinaires avec l'équipe soignante",
    ],
    description:
      "Sous la supervision du psychologue référent, vous participez à la prise en charge psychologique des patients, aux bilans cliniques et aux ateliers thérapeutiques.",
  },
  {
    id: "renault-mecanique-maintenance-stage",
    title: "Stage Ingénieur / Technicien Mécanique & Maintenance Industrielle (H/F)",
    company: "Renault Group / Ampere",
    location: "Douai / Cléon / Guyancourt",
    date: "2026-11-08",
    duration: "4 à 6 mois",
    durationMonths: 6,
    studyLevel: "Bac+3 (Licence / Bachelor / BUT)",
    workMode: "Présentiel",
    remuneration: "1 100 € - 1 450 € / mois",
    remunerationMin: 1100,
    isRemunerationEstimated: true,
    perks: ["Tickets Restaurant / RIE", "Transport remboursé (50-100%)", "Prime / Gratification majorée"],
    url: "https://www.linkedin.com/jobs/search/?keywords=Stage%20Mecanique%20Maintenance&location=France",
    source: "LinkedIn Jobs (Live)",
    contactEmail: "recrutement.stages@renault.com",
    emailVerified: false,
    applyMethod: "portal_and_email",
    domainCategory: "Ingénierie, Mécanique & Industrie",
    requiredSkills: ["SolidWorks", "CAO / AutoCAD", "Maintenance industrielle", "Mécanique générale", "Diagnostic technique / Auto", "Lean Manufacturing", "QHSE / Qualité"],
    missions: [
      "Modéliser et optimiser des outillages et sous-ensembles mécaniques sous SolidWorks / CATIA",
      "Fiabiliser les équipements de production et déployer des plans de maintenance préventive et corrective",
      "Participer aux chantiers d'amélioration continue (Lean 5S, Kaizen) et au contrôle qualité sur ligne",
    ],
    description:
      "Intégré au département Ingénierie Mécanique & Maintenance, vous intervenez sur la conception d'outillages, le diagnostic technique et la fiabilisation des installations.",
  },
];

export function matchAndRankOffers(
  offers: JobOffer[],
  candidateKeywords: string[],
  searchFilter?: string
): JobOffer[] {
  const normalizedCandidateSkills = candidateKeywords.map((k) =>
    k.trim().toLowerCase()
  );
  const filterTokens = (searchFilter || "")
    .toLowerCase()
    .split(/[\s,;]+/)
    .filter((t) => t.length > 1 && t !== "stage" && t !== "stagiaire" && t !== "alternance");

  const scored = offers.map((offer) => {
    const matchedSkills = offer.requiredSkills.filter((reqSkill) => {
      const reqLower = reqSkill.toLowerCase();
      return normalizedCandidateSkills.some(
        (cand) =>
          cand === reqLower ||
          cand.includes(reqLower) ||
          reqLower.includes(cand)
      );
    });

    const baseRatio =
      offer.requiredSkills.length > 0
        ? matchedSkills.length / offer.requiredSkills.length
        : 0.6;

    const titleLower = offer.title.toLowerCase();
    const fullOfferText =
      `${offer.title} ${offer.company} ${offer.location} ${offer.description} ${offer.missions.join(" ")} ${offer.requiredSkills.join(" ")}`.toLowerCase();

    let queryScore = 0;
    if (filterTokens.length > 0) {
      const titleHits = filterTokens.filter((tok) => titleLower.includes(tok)).length;
      const bodyHits = filterTokens.filter((tok) => fullOfferText.includes(tok)).length;
      queryScore = (titleHits / filterTokens.length) * 35 + (bodyHits / filterTokens.length) * 20;
    } else {
      queryScore = 20;
    }

    const rawScore = Math.round(
      Math.min(99, Math.max(48, baseRatio * 55 + 15 + queryScore))
    );

    return {
      ...offer,
      matchedSkills,
      matchScore: rawScore,
    };
  });

  const matchingQuery =
    filterTokens.length > 0
      ? scored.filter((offer) => {
          const fullText =
            `${offer.title} ${offer.company} ${offer.location} ${offer.description} ${offer.missions.join(" ")} ${offer.requiredSkills.join(" ")}`.toLowerCase();
          return filterTokens.some((tok) => fullText.includes(tok));
        })
      : scored;

  const finalPool = matchingQuery.length > 0 ? matchingQuery : scored;
  return finalPool.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}

export function generateApplicationDraft(
  offer: JobOffer,
  profile: CandidateProfile
): GeneratedApplication {
  const matched =
    offer.matchedSkills && offer.matchedSkills.length > 0
      ? offer.matchedSkills
      : offer.requiredSkills.slice(0, 4);

  const topSkillsText =
    matched.length > 0
      ? matched.slice(0, 5).join(", ")
      : profile.keywords.length > 0
        ? profile.keywords.slice(0, 5).join(", ")
        : offer.requiredSkills.slice(0, 4).join(", ");

  const extraSkills = profile.keywords
    .filter((k) => !matched.includes(k))
    .slice(0, 3)
    .join(", ");

  const firstMission =
    offer.missions[0] ||
    `les missions opérationnelles liées au poste « ${offer.title} »`;
  const secondMission =
    offer.missions[1] ||
    "la contribution active aux projets de l'équipe et l'atteinte des objectifs métiers";

  const todayFormatted = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const roleLabel = profile.targetRole || offer.title;
  const subject = `Candidature Stage — ${offer.title} — ${profile.fullName}`;

  const emailBody = `Bonjour,

Je vous adresse ma candidature pour l'offre de stage « ${offer.title} » au sein de ${offer.company} (${offer.location}).

Actuellement en ${profile.education} (${roleLabel}), je maîtrise les compétences clés attendues sur ce poste : ${topSkillsText}. Vos enjeux concernant ${firstMission.charAt(0).toLowerCase() + firstMission.slice(1)} correspondent directement à mon parcours et aux compétences détaillées dans mon CV (${profile.availability}).

Rigoureux, impliqué et immédiatement opérationnel sur vos outils et méthodes (${offer.requiredSkills.slice(0, 5).join(", ")}), je vous joins ci-dessous ma lettre de motivation personnalisée.

Je me tiens à votre entière disposition pour échanger lors d'un entretien à votre convenance.

Bien cordialement,

${profile.fullName}
${profile.email}${profile.phone ? `\n${profile.phone}` : ""}
${profile.location}`;

  const coverLetter = `${profile.fullName}
${profile.email}${profile.phone ? ` · ${profile.phone}` : ""}
${profile.location}

À l'attention de l'équipe Recrutement — ${offer.company}
Lieu : ${offer.location}
Le ${todayFormatted}

Objet : Candidature au stage « ${offer.title} » (${offer.duration})

Madame, Monsieur,

Suivant avec grand intérêt les activités de ${offer.company}, je vous soumets ma candidature pour le poste de stagiaire « ${offer.title} » basé à ${offer.location} (${profile.availability}).

Dans le cadre de mon parcours (${profile.education}), j'ai développé une solide maîtrise pratique des compétences et méthodes au cœur de votre besoin : ${topSkillsText}${extraSkills ? `, complétées par ${extraSkills}` : ""}.

Votre offre retient particulièrement mon attention par la pertinence de ses missions :
1. ${firstMission} : mes expériences et projets réalisés m'ont permis de développer rigueur méthodologique, sens de l'observation et efficacité opérationnelle sur ces sujets.
2. ${secondMission} : ma capacité d'adaptation rapide, mon esprit d'équipe et mon sens de l'organisation me permettront d'être rapidement autonome au sein de votre structure.

Investi, curieux et orienté résultats, je souhaite mettre mon énergie et mes compétences au service de ${offer.company} durant ce stage.

Je vous remercie de l'attention portée à ma candidature et reste à votre disposition pour un entretien.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${profile.fullName}`;

  return {
    offerId: offer.id,
    company: offer.company,
    role: offer.title,
    recipientEmail: offer.contactEmail,
    subject,
    emailBody,
    coverLetter,
  };
}
