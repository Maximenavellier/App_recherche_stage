import { ContractTypeFilter, OfferContractType, JobOffer } from "./types";

export interface CompanyPerkProfile {
  namePatterns: string[];
  companyGroup: string;
  remunerationRange: string;
  remunerationMin: number;
  perks: string[];
  perksDetailed: {
    meal?: string;
    transport?: string;
    bonus?: string;
    cse?: string;
    remote?: string;
    hiring?: string;
  };
  careersDomain: string;
  defaultContactEmail: string;
}

export const TOP_DATA_EMPLOYERS_DB: CompanyPerkProfile[] = [
  // 1. Galaxie Mulliez / AFM (Hauts-de-France / Lille priority)
  {
    namePatterns: [
      "decathlon",
      "decathlon digital",
      "leroy merlin",
      "adeo",
      "auchan",
      "boulanger",
      "kiabi",
      "cofidis",
      "norauto",
      "mobivia",
      "chronodrive",
      "saint maclou",
      "flunch",
    ],
    companyGroup: "Galaxie Mulliez (AFM)",
    remunerationRange: "1 250 € - 1 550 € / mois",
    remunerationMin: 1250,
    perks: [
      "Prime / Gratification majorée AFM",
      "Tickets Restaurant (Swile/Carte) ou RIE",
      "Transport remboursé 50% à 80% + Indemnité vélo",
      "Avantages CSE & Réductions enseignes Mulliez",
      "Télétravail (1 à 2j/semaine)",
      "Forte politique de pré-embauche Data",
    ],
    perksDetailed: {
      meal: "Tickets Restaurant Swile (10€/jour) ou RIE d'entreprise",
      transport: "Remboursement Pass Navigo/Pass Transport 80% + Forfait mobilités durables / vélo",
      bonus: "Gratification de stage attractive + prime de participation / intéressement groupe si applicable",
      cse: "Accès complet aux offres CSE (chèques vacances, billetterie, réductions enseignes Mulliez)",
      remote: "1 à 2 jours de télétravail par semaine avec équipement fourni",
      hiring: "Vivier prioritaire de pré-embauche CDI / Graduate Programs AFM",
    },
    careersDomain: "adeo.com / decathlon.net / auchan.fr",
    defaultContactEmail: "recrutement.stages@adeo-decathlon.fr",
  },

  // 2. Banques & Assurances Tier-1 (Top grilles salariales France)
  {
    namePatterns: [
      "bnp paribas",
      "société générale",
      "societe generale",
      "crédit agricole",
      "credit agricole",
      "cacib",
      "lcl",
      "axa",
      "natixis",
      "bpce",
      "crédit mutuel",
      "credit mutuel",
      "cic",
      "boursorama",
      "boursobank",
      "maif",
      "macif",
      "cnp assurances",
      "sg",
    ],
    companyGroup: "Banques & Assurances",
    remunerationRange: "1 450 € - 1 850 € / mois",
    remunerationMin: 1450,
    perks: [
      "Grille bancaire majorée (jusqu'à 1 850€/mois)",
      "Accès RIE subventionné ou Tickets Restaurant",
      "Remboursement Navigo / Transport 50% à 100%",
      "Avantages CSE Banque (Chèques vacances, sport, culture)",
      "Télétravail hybride (jusqu'à 2j/sem)",
      "Vivier Tremplin / Pré-embauche CDI Graduate",
    ],
    perksDetailed: {
      meal: "Restaurant Interentreprise (RIE) haut de gamme ou Tickets Restaurant subventionnés à 60%",
      transport: "Prise en charge transport jusqu'à 100% (Pass Navigo / abonnements régionaux)",
      bonus: "Grille de stage haut de gamme (jusqu'à 1 850 € / mois selon école et année)",
      cse: "Avantages CSE bancaires exclusifs (chèques culture, sport, billetterie subventionnée)",
      remote: "Télétravail hybride (1 à 2 jours par semaine)",
      hiring: "Programme Graduate / Tremplin jeune diplômé avec accès prioritaire CDI",
    },
    careersDomain: "bnpparibas.com / societegenerale.com / credit-agricole.com",
    defaultContactEmail: "recrutement.stages@banque-assurance.fr",
  },

  // 3. Retail, Luxe & FMCG
  {
    namePatterns: [
      "carrefour",
      "fnac",
      "darty",
      "cdiscount",
      "lvmh",
      "sephora",
      "le bon marché",
      "l'oréal",
      "loreal",
      "danone",
      "lesaffre",
      "roquette",
      "bonduelle",
    ],
    companyGroup: "Retail, Luxe & FMCG",
    remunerationRange: "1 300 € - 1 650 € / mois",
    remunerationMin: 1300,
    perks: [
      "Gratification attractive (1 300€ - 1 650€ / mois)",
      "Tickets Restaurant ou RIE d'entreprise",
      "Remboursement transport 50%",
      "Remises sur produits & Marques du groupe",
      "Télétravail hybride",
      "Opportunités internationales & Pré-embauche",
    ],
    perksDetailed: {
      meal: "Tickets Restaurant ou RIE d'entreprise",
      transport: "Remboursement transport 50% + Forfait mobilités douces",
      bonus: "Gratification compétitive secteur Retail / Luxe",
      cse: "Boutique d'entreprise / Ventes privées / Avantages CSE",
      remote: "Télétravail hybride (1 à 2 jours/semaine)",
      hiring: "Forte dynamique de pré-embauche et tremplin carrière",
    },
    careersDomain: "carrefour.com / loreal.com / lvmh.fr",
    defaultContactEmail: "stages@retail-fmcg.fr",
  },

  // 4. Tech, Scale-ups Data & Industrie
  {
    namePatterns: [
      "ovhcloud",
      "dataiku",
      "doctolib",
      "back market",
      "manomano",
      "mirakl",
      "veepee",
      "artefact",
      "ekimetrics",
      "capgemini",
      "sopra",
      "edf",
      "engie",
      "totalenergies",
      "sncf",
      "thales",
      "airbus",
    ],
    companyGroup: "Tech & Scale-up Data",
    remunerationRange: "1 300 € - 1 700 € / mois",
    remunerationMin: 1300,
    perks: [
      "Rémunération Tech attractive (1 300€ - 1 700€)",
      "Matériel dernier cri (MacBook / Dell pro)",
      "Tickets Restaurant (Swile)",
      "Télétravail flexible (jusqu'à 3j/semaine)",
      "Budgets formation & Conférences",
      "Ambiance Scale-up & Équipe Data pointue",
    ],
    perksDetailed: {
      meal: "Tickets Restaurant Swile pris en charge à 60%",
      transport: "Transport remboursé 50% + abonnement mobilités douces",
      bonus: "Gratification attractive + primes de performance ou RTT",
      cse: "Avantages CSE Tech (activités, sport, subventions)",
      remote: "Télétravail flexible (jusqu'à 3 jours par semaine)",
      hiring: "Accès direct aux opportunités CDI Software & Data Engineer",
    },
    careersDomain: "ovhcloud.com / dataiku.com / doctolib.fr",
    defaultContactEmail: "tech.recrutement@scaleup.fr",
  },
];

export function lookupCompanyPerkProfile(companyName: string): CompanyPerkProfile | null {
  if (!companyName) return null;
  const lower = companyName.toLowerCase().trim();
  for (const profile of TOP_DATA_EMPLOYERS_DB) {
    for (const pattern of profile.namePatterns) {
      if (lower.includes(pattern)) {
        return profile;
      }
    }
  }
  return null;
}

export function validateStageOrAlternance(
  title: string,
  description: string,
  filterMode: ContractTypeFilter = "STAGE_ONLY"
): { isValid: boolean; contractType: OfferContractType; reason?: string } {
  const combined = `${title} ${description}`.toLowerCase();
  const titleLower = title.toLowerCase();

  // 1. Strict rejection of permanent / experienced contracts
  // unless explicitly permitted as "Stage pré-embauche CDI" or similar
  const isExplicitPreHiringStage =
    /\b(stage\s+pr[ée]-?embauche|stage\s+de\s+fin\s+d['’][ée]tudes\s*\(?\s*pr[ée]-?cdi\)?)\b/.test(
      titleLower
    ) ||
    (/\bstage\b/.test(titleLower) && /\b(pr[ée]-?embauche|cdi\s+[àa]\s+cl[ôo]ture)\b/.test(combined));

  const permanentMarkersRegex =
    /\b(cdi|cdd|freelance|ind[ée]pendant|int[ée]rim|prestataire|consultant\s+senior|senior|lead\s+data|staff\s+data|manager|directeur|head\s+of|v\.?i\.?e|temps\s+plein\s+cdi)\b/;

  if (permanentMarkersRegex.test(titleLower) && !isExplicitPreHiringStage) {
    return {
      isValid: false,
      contractType: "Stage",
      reason: "Rejeté : l'intitulé indique un contrat permanent ou senior (CDI, CDD, Freelance, Senior).",
    };
  }

  // 2. Detect Stage vs Alternance
  const hasStageMarker =
    /\b(stage|stagiaire|internship|intern|pfe|fin\s+d['’][ée]tudes)\b/.test(combined) ||
    /\bstage\b/.test(titleLower);

  const hasAlternanceMarker =
    /\b(alternance|alternant|apprentissage|apprenti|contrat\s+pro|contrat\s+de\s+professionnalisation)\b/.test(
      combined
    ) || /\b(alternance|alternant|apprenti)\b/.test(titleLower);

  // Default inferred contract type
  const contractType: OfferContractType = hasAlternanceMarker && !hasStageMarker ? "Alternance" : "Stage";

  // 3. Evaluate filterMode
  if (filterMode === "STAGE_ONLY") {
    // Must be a Stage, and NOT pure alternance without stage
    const isPureAlternanceOnly =
      /\b(alternance\s+uniquement|uniquement\s+en\s+alternance)\b/.test(combined) ||
      (/\b(alternance|alternant|apprenti)\b/.test(titleLower) && !hasStageMarker);

    if (!hasStageMarker || isPureAlternanceOnly) {
      return {
        isValid: false,
        contractType: "Alternance",
        reason: "Filtré : mode STAGE_ONLY actif, offre incompatible ou réservée à l'alternance.",
      };
    }
  } else if (filterMode === "ALTERNANCE_ONLY") {
    if (!hasAlternanceMarker) {
      return {
        isValid: false,
        contractType: "Stage",
        reason: "Filtré : mode ALTERNANCE_ONLY actif, offre sans alternance détectée.",
      };
    }
  } else {
    // STAGE_AND_ALTERNANCE: accept either stage or alternance
    if (!hasStageMarker && !hasAlternanceMarker) {
      return {
        isValid: false,
        contractType: "Stage",
        reason: "Filtré : ni stage ni alternance détectés dans l'offre.",
      };
    }
  }

  return {
    isValid: true,
    contractType,
  };
}

export function deduplicateOffers(offers: JobOffer[]): JobOffer[] {
  const seenMap = new Map<string, JobOffer>();

  for (const offer of offers) {
    // Normalize company + title + location for robust deduplication
    const cleanCompany = (offer.company || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .trim();

    const cleanTitle = (offer.title || "")
      .toLowerCase()
      .replace(/\b(h\/f|f\/h|m\/f|stage|alternance|\-)\b/g, "")
      .replace(/[^a-z0-9]/g, "")
      .trim();

    const cleanCity = (offer.location || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 10);

    const dedupeKey = `${cleanCompany}_${cleanTitle}_${cleanCity}`;

    if (seenMap.has(dedupeKey)) {
      const existing = seenMap.get(dedupeKey)!;
      // Merge sources
      const sources = new Set<string>([
        existing.source,
        ...(existing.mergedSources || []),
        offer.source,
        ...(offer.mergedSources || []),
      ]);
      sources.delete("Merged");

      // Keep the one with verified email or longer description / better metadata
      const preferredEmail = existing.emailVerified ? existing.contactEmail : (offer.contactEmail || existing.contactEmail);
      const preferredUrl = existing.url.includes("linkedin") ? offer.url || existing.url : existing.url;

      seenMap.set(dedupeKey, {
        ...existing,
        url: preferredUrl,
        contactEmail: preferredEmail,
        emailVerified: existing.emailVerified || offer.emailVerified,
        mergedSources: Array.from(sources),
        perks: Array.from(new Set([...(existing.perks || []), ...(offer.perks || [])])),
        missions: existing.missions.length >= offer.missions.length ? existing.missions : offer.missions,
      });
    } else {
      seenMap.set(dedupeKey, {
        ...offer,
        mergedSources: [offer.source],
      });
    }
  }

  return Array.from(seenMap.values());
}
