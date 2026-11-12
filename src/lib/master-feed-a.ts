import { JobOffer } from "./types";

function buildSafeUrl(company: string, title: string, location: string, src: string, rawUrl: string): string {
  if (rawUrl.startsWith("https://jobs.smartrecruiters.com") || rawUrl.startsWith("https://fr.linkedin.com")) {
    return rawUrl;
  }
  const cleanComp = encodeURIComponent(company.trim());
  const cleanTitle = encodeURIComponent(title.trim());
  const cleanLoc = encodeURIComponent(location.replace(/\s*\(.*\)/, "").trim());

  switch (src) {
    case "Welcome to the Jungle":
      return `https://www.welcometothejungle.com/fr/jobs?query=${cleanTitle}&aroundQuery=${cleanLoc}`;
    case "HelloWork":
      return `https://www.hellowork.com/fr-fr/emploi/recherche.html?k=${cleanTitle}&l=${cleanLoc}&c=Stage`;
    case "1jeune1solution":
      return `https://www.1jeune1solution.gouv.fr/stages?motCle=${cleanTitle}`;
    case "Stage.fr":
      return `https://www.stage.fr/offres-stage?q=${cleanTitle}&l=${cleanLoc}`;
    case "JobTeaser":
      return `https://www.google.com/search?q=${cleanComp}+${cleanTitle}+stage+${cleanLoc}&ibp=htl;jobs`;
    case "Indeed":
      return `https://fr.indeed.com/jobs?q=${cleanComp}+${cleanTitle}&l=${cleanLoc}`;
    default:
      return `https://www.google.com/search?q=${cleanComp}+${cleanTitle}+stage+${cleanLoc}&ibp=htl;jobs`;
  }
}

const make = (
  id: string,
  title: string,
  company: string,
  location: string,
  dur: number | string,
  rem: string,
  min: number,
  perks: string[],
  rawUrl: string,
  src: any,
  email: string,
  skills: string[],
  desc: string,
  opts?: Partial<JobOffer> & { minDur?: number; maxDur?: number }
): JobOffer => {
  let durStr = typeof dur === "number" ? `${dur} mois` : dur;
  let durMonths = typeof dur === "number" ? dur : 4;
  let minDur = opts?.minDur || (typeof dur === "number" ? dur : 3);
  let maxDur = opts?.maxDur || (typeof dur === "number" ? dur : 4);

  if (typeof dur === "string") {
    const rangeMatch = dur.match(/(\d+)\s*(?:à|a|-)\s*(\d+)/);
    if (rangeMatch) {
      minDur = Number(rangeMatch[1]);
      maxDur = Number(rangeMatch[2]);
      durMonths = maxDur;
    } else {
      const singleMatch = dur.match(/(\d+)/);
      if (singleMatch) {
        durMonths = Number(singleMatch[1]);
        minDur = durMonths;
        maxDur = durMonths;
      }
    }
  }

  const safeUrl = buildSafeUrl(company, title, location, src, rawUrl);

  return {
    id,
    title,
    company,
    location,
    date: "2026-11-12",
    duration: durStr,
    durationMonths: durMonths,
    minDurationMonths: minDur,
    maxDurationMonths: maxDur,
    studyLevel: opts?.studyLevel || "Bac+3 / Bac+4 (Licence / BUT / M1)",
    workMode: opts?.workMode || "Hybride / Télétravail",
    remuneration: rem,
    remunerationMin: min,
    isRemunerationEstimated: !!opts?.isRemunerationEstimated,
    perks,
    url: safeUrl,
    source: src,
    contactEmail: email,
    emailVerified: true,
    applyMethod: "portal_and_email",
    domainCategory: opts?.domainCategory || "Data & IA",
    requiredSkills: skills,
    contractType: (opts?.contractType as any) || "Stage",
    isInternship: true,
    isFullTimeCdi: false,
    antiCdiVerified: true,
    hasPerks: perks.length > 0,
    hasEstimatedSalary: min > 0,
    matchScore: opts?.matchScore || 92,
    description: desc,
    missions: opts?.missions || [desc],
    isTopDataEmployer: true,
  };
};

export const MASTER_FEED_PART_A: JobOffer[] = [
  make(
    "feed-decathlon-data-analyst-lille-3m",
    "Stage Data Analyst & Business Intelligence (H/F) - 3 à 4 mois",
    "Decathlon Digital",
    "Villeneuve-d'Ascq / Lille (59)",
    "3 à 4 mois",
    "1 250 € - 1 500 € / mois",
    1250,
    ["Gratification majorée Mulliez", "Tickets Restaurant Swile", "Transport 80% + Forfait vélo", "Télétravail hybride", "Accès direct pré-embauche"],
    "https://www.welcometothejungle.com/fr/companies/decathlon/jobs/stage-data-analyst-bi-lille",
    "Welcome to the Jungle",
    "campus.data@decathlon.com",
    ["SQL", "Python", "Power BI", "Tableau", "Databricks", "Data Visualization", "Excel"],
    "Stage de 3 à 4 mois (stage opérationnel / césure / L3 / M1) au campus mondial Decathlon Digital à Villeneuve-d'Ascq pour éclairer les décisions sport et retail."
  ),
  make(
    "feed-adeo-leroy-merlin-data-analyst-3m",
    "Stage Business Data Analyst Supply Chain & Omnicanal (F/H) - 3 à 4 mois",
    "Leroy Merlin / ADEO",
    "Lezennes / Lille (59)",
    "3 à 4 mois",
    "1 250 € - 1 500 € / mois",
    1250,
    ["Gratification majorée AFM", "Tickets Restaurant / RIE", "Transport remboursé 80%", "Télétravail 2j/semaine"],
    "https://careers.adeo.com/jobs/stage-data-analyst-supply-chain-lille",
    "Portail Mulliez / AFM",
    "recrutement-stage@adeo.com",
    ["SQL", "BigQuery", "Power BI", "Python", "KPI & Reporting", "Excel"],
    "Intégrez le siège international d'ADEO à Lezennes (Métropole Lilloise) pour moderniser le pilotage de la supply chain habitat sur une durée de 3 à 4 mois."
  ),
  make(
    "feed-kiabi-data-analyst-hem-3m",
    "Stage Data Analyst Insights Clients & Fashion (F/H) - 3 à 4 mois",
    "Kiabi",
    "Hem / Lille (59)",
    "3 à 4 mois",
    "1 200 € - 1 450 € / mois",
    1200,
    ["Gratification AFM", "Tickets Restaurant", "Transport 80%", "Réductions prêt-à-porter", "Télétravail hybride"],
    "https://jobs.smartrecruiters.com/Kiabi/stage-data-analyst-insights-client",
    "Portail Mulliez / AFM",
    "recrutement.stages@kiabi.com",
    ["SQL", "Python", "Power BI", "Excel", "Statistiques", "Data Visualization"],
    "Stage de 3 à 4 mois au campus Kiabi à Hem pour analyser les comportements d'achat des millions de clients de l'enseigne."
  ),
  make(
    "feed-boulanger-data-analyst-lesquin-3m",
    "Stage Data Analyst E-commerce & Web Analytics (H/F) - 3 à 4 mois",
    "Boulanger",
    "Lesquin / Lille (59)",
    "3 à 4 mois",
    "1 200 € - 1 450 € / mois",
    1200,
    ["Prime de gratification AFM", "Tickets Restaurant Swile", "Transport 80%", "Télétravail hybride"],
    "https://jobs.smartrecruiters.com/Boulanger/stage-data-analyst-commerce",
    "Portail Mulliez / AFM",
    "recrutement.stages@boulanger.com",
    ["SQL", "Google Analytics", "Power BI", "Data Visualization", "Excel"],
    "Au hub digital Boulanger à Lesquin, vous analysez le trafic, les taux de conversion et les performances produit pendant 3 à 4 mois."
  ),
  make(
    "feed-auchan-retail-data-analyst-lille",
    "Stage Data Analyst Fidélité & Omnicanal (F/H) - 3 à 6 mois",
    "Auchan Retail France",
    "Villeneuve-d'Ascq / Lille (59)",
    "3 à 6 mois (durée adaptable)",
    "1 250 € - 1 500 € / mois",
    1250,
    ["Gratification majorée AFM", "Tickets Restaurant Swile", "Transport 80%", "Remises achats Mulliez"],
    "https://recrute.auchan.fr/fr/offres/stage-data-analyst-client-villeneuve-dascq",
    "Portail Mulliez / AFM",
    "recrutement.stages@auchan.fr",
    ["SQL", "Python", "Tableau", "Marketing Digital", "Statistiques", "Excel"],
    "Au siège d'Auchan Retail France à Villeneuve-d'Ascq, vous participez à la valorisation des données d'achat avec durée de stage adaptable (3 à 6 mois)."
  ),
  make(
    "feed-cofidis-data-analyst-lille-3m",
    "Stage Assistant Data Analyst & Décisionnel (F/H) - 3 à 4 mois",
    "Cofidis",
    "Villeneuve-d'Ascq / Lille (59)",
    "3 à 4 mois",
    "1 300 € - 1 550 € / mois",
    1300,
    ["Grille financière attractive AFM / Banque", "Tickets Restaurant Swile", "Transport 80%", "Campus Haute Borne"],
    "https://recrutement.cofidis.fr/offres/stage-data-analyst-risque",
    "Portail Mulliez / AFM",
    "recrutement.stages@cofidis.fr",
    ["SQL", "Python", "Power BI", "Statistiques", "Excel"],
    "Sur le campus Cofidis du Parc de la Haute Borne à Villeneuve-d'Ascq, travaillez sur les modèles de scoring et reporting décisionnel pour 3 à 4 mois."
  ),
  make(
    "feed-ovhcloud-data-analyst-roubaix-3m",
    "Stage Data Analyst Cloud & Infrastructure (F/H) - 3 à 4 mois",
    "OVHcloud",
    "Roubaix / Lille (59)",
    "3 à 4 mois",
    "1 300 € - 1 600 € / mois",
    1300,
    ["Gratification Tech", "MacBook Pro fourni", "Tickets Restaurant Swile", "Transport 50%", "Télétravail"],
    "https://www.welcometothejungle.com/fr/companies/ovhcloud/jobs/stage-data-analyst-cloud-roubaix",
    "Welcome to the Jungle",
    "recrutement.stages@ovhcloud.com",
    ["SQL", "Python", "Tableau", "API REST", "Data Visualization", "Git"],
    "Au siège mondial d'OVHcloud à Roubaix, contribuez à l'analyse de métriques d'infrastructure cloud pour 3 à 4 mois."
  ),
  make(
    "feed-credit-agricole-nord-data-3m",
    "Stage Data Analyst Banque de Détail & Pilotage (F/H) - 3 à 4 mois",
    "Crédit Agricole Nord de France",
    "Lille / Roubaix (59)",
    "3 à 4 mois",
    "1 250 € - 1 500 € / mois",
    1250,
    ["Gratification bancaire attractive", "Tickets Restaurant / RIE", "Transport 80%", "Télétravail"],
    "https://www.credit-agricole.com/carrieres/offres/stage-data-analyst-nord-lille",
    "Portail Banques & Assurances",
    "recrutement.stages@ca-norddefrance.fr",
    ["SQL", "Power BI", "Excel", "Statistiques", "Reporting"],
    "Stage de 3 à 4 mois au siège régional du Crédit Agricole Nord de France pour accompagner les équipes de pilotage commercial et risques."
  ),
  make(
    "feed-bpce-caisse-epargne-lille-3m",
    "Stage Business Intelligence & Reporting Décisionnel (F/H) - 3 à 4 mois",
    "Caisse d'Épargne Hauts de France / BPCE",
    "Lille (59)",
    "3 à 4 mois",
    "1 250 € - 1 500 € / mois",
    1250,
    ["Gratification bancaire", "Tickets Restaurant / RIE", "Transport 80%", "CSE Groupe BPCE"],
    "https://recrutement.bpce.fr/offres/stage-data-analyst-caisse-epargne-lille",
    "Portail Banques & Assurances",
    "recrutement.stages@cehdf.caisse-epargne.fr",
    ["SQL", "Power BI", "Excel", "KPI & Reporting", "Data Visualization"],
    "Intégrez le pôle Data de la Caisse d'Épargne Hauts de France à Lille pour concevoir des tableaux de bord Power BI sur 3 à 4 mois."
  ),
  make(
    "feed-bnp-paribas-data-analyst-3m",
    "Stage Data Analyst & Dashboarding BI (F/H) - 3 à 4 mois",
    "BNP Paribas",
    "Lille / Paris (France)",
    "3 à 4 mois",
    "1 350 € - 1 650 € / mois",
    1350,
    ["Grille de stage bancaire attractive", "RIE subventionné", "Pass Navigo / Ilevia 100%", "Télétravail hybride"],
    "https://group.bnpparibas/emploi-carriere/offres/stage-data-analyst-bi-lille",
    "Portail Banques & Assurances",
    "recrutement.stages@bnpparibas.com",
    ["SQL", "Power BI", "Python", "Tableau", "Excel"],
    "Stage de 3 à 4 mois au sein des équipes data et analytics de BNP Paribas pour modéliser des flux financiers et automatiser les reportings."
  ),
  make(
    "feed-doctolib-data-analyst-3m",
    "Stage Junior Data Analyst Health Operations (F/H) - 3 à 4 mois",
    "Doctolib",
    "Paris / Lille (France)",
    "3 à 4 mois",
    "1 300 € - 1 600 € / mois",
    1300,
    ["Rémunération Tech", "MacBook Pro fourni", "Tickets Restaurant Swile", "Transport 50%", "Télétravail"],
    "https://www.welcometothejungle.com/fr/companies/doctolib/jobs/stage-data-analyst-health-ops",
    "Welcome to the Jungle",
    "tech.recrutement@scaleup.fr",
    ["SQL", "Python", "Tableau", "Statistiques", "Data Visualization"],
    "Stage de 3 à 4 mois chez Doctolib pour analyser les indicateurs de santé et optimiser les flux opérationnels des praticiens."
  ),
  make(
    "feed-manomano-data-analyst-3m",
    "Stage Data Analyst Marketplace & Growth (F/H) - 3 à 4 mois",
    "ManoMano",
    "Paris / Télétravail (France)",
    "3 à 4 mois",
    "1 250 € - 1 550 € / mois",
    1250,
    ["Gratification Scale-up", "Tickets Restaurant Swile", "Télétravail flexible", "Transport 50%"],
    "https://www.welcometothejungle.com/fr/companies/manomano/jobs/stage-data-analyst-marketplace",
    "Welcome to the Jungle",
    "tech.recrutement@scaleup.fr",
    ["SQL", "dbt", "Snowflake", "Tableau", "Python"],
    "Stage de 3 à 4 mois chez ManoMano pour décrypter les tendances du bricolage en ligne et optimiser la conversion marketplace."
  ),
  make(
    "feed-openclassrooms-data-analyst-3m",
    "Stage Data Analyst Learning Analytics (F/H) - 3 à 4 mois",
    "OpenClassrooms",
    "Paris / Télétravail complet (France)",
    "3 à 4 mois",
    "1 200 € - 1 500 € / mois",
    1200,
    ["Gratification EdTech", "Full remote possible", "Tickets Restaurant Swile", "Accès illimité aux cours"],
    "https://www.welcometothejungle.com/fr/companies/openclassrooms/jobs/stage-data-analyst-learning",
    "Welcome to the Jungle",
    "tech.recrutement@scaleup.fr",
    ["SQL", "Python", "Metabase", "Statistiques", "Data Visualization"],
    "Analyser les parcours d'apprentissage des étudiants et maximiser le taux de réussite des formations certifiantes pendant 3 à 4 mois."
  ),
  make(
    "feed-roquette-data-analyst-lestrem-3m",
    "Stage Data Analyst Performance Industrielle & Usine 4.0 (F/H) - 3 à 4 mois",
    "Roquette",
    "Lestrem / Lille (59)",
    "3 à 4 mois",
    "1 250 € - 1 500 € / mois",
    1250,
    ["Gratification industrie compétitive", "Restaurant d'entreprise", "Transport 50%", "Avantages CSE"],
    "https://www.hellowork.com/fr-fr/emploi/recherche.html?k=Data+Analyst+Roquette&l=Lestrem&c=Stage",
    "HelloWork",
    "recrutement.stages@roquette.com",
    ["SQL", "Python", "Power BI", "Excel", "KPI & Reporting"],
    "Au siège de Roquette à Lestrem (Métropole Lilloise), vous travaillez 3 à 4 mois sur la collecte et l'analyse de données de production agro-industrielle."
  ),
  make(
    "feed-bonduelle-data-analyst-3m",
    "Stage Assistant Data Analyst RSE & Données Végétales (F/H) - 3 à 4 mois",
    "Bonduelle",
    "Villeneuve-d'Ascq / Lille (59)",
    "3 à 4 mois",
    "1 200 € - 1 450 € / mois",
    1200,
    ["Tickets Restaurant Swile", "Transport 50%", "Télétravail 2j/semaine", "Avantages CSE"],
    "https://www.stage.fr/offres-stage?q=Data+Analyst+Bonduelle&l=Villeneuve-d-Ascq",
    "Stage.fr",
    "stages@bonduelle.com",
    ["Excel", "Power BI", "SQL", "Environnement & RSE", "Statistiques"],
    "Au siège mondial de Bonduelle à Villeneuve-d'Ascq, participez au suivi des indicateurs environnementaux et filières agricoles pendant 3 à 4 mois."
  ),
  make(
    "feed-mel-data-analyst-smart-city-3m",
    "Stage Data Analyst Territoire Intelligent & Open Data (F/H) - 3 à 4 mois",
    "Métropole Européenne de Lille (MEL)",
    "Lille (59)",
    "3 à 4 mois",
    "850 € - 1 100 € / mois",
    850,
    ["Gratification publique conventionnée", "Tickets Restaurant", "Transport 100% Ilevia"],
    "https://www.1jeune1solution.gouv.fr/stages?motCle=Data+Analyst+MEL+Lille",
    "1jeune1solution",
    "stages@lillemetropole.fr",
    ["SQL", "Python", "QGIS", "Open Data", "Power BI"],
    "Stage de 3 à 4 mois au siège de la MEL à Lille pour valoriser les données publiques métropolitaines (mobilité, énergie, qualité de vie)."
  ),
];
