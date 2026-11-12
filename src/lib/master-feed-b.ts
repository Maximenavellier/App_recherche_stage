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

export const MASTER_FEED_PART_B: JobOffer[] = [
  make(
    "feed-edhec-data-analyst-roubaix-3m",
    "Stage Data Analyst Enseignement Supérieur & Admissions (F/H) - 3 à 4 mois",
    "EDHEC Business School",
    "Roubaix / Lille (59)",
    "3 à 4 mois",
    "1 150 € - 1 400 € / mois",
    1150,
    ["Gratification attractive Grande École", "Tickets Restaurant", "Transport 50%", "Campus EDHEC Roubaix"],
    "https://www.google.com/search?q=EDHEC+Data+Analyst+stage+Roubaix&ibp=htl;jobs",
    "JobTeaser",
    "recrutement.stages@edhec.edu",
    ["SQL", "Power BI", "Excel", "Data Visualization", "Statistiques"],
    "Stage de 3 à 4 mois sur le campus de l'EDHEC à Roubaix pour suivre et optimiser les flux de candidatures internationales."
  ),
  make(
    "feed-univ-lille-data-analyst-3m",
    "Stage Data Analyst & Tableaux de Bord BI (F/H) - 3 à 4 mois",
    "Université de Lille / Direction du Numérique",
    "Lille / Villeneuve-d'Ascq (59)",
    "3 à 4 mois",
    "850 € - 1 050 € / mois",
    850,
    ["Gratification légale conventionnée", "Remboursement transport 75%", "Cadre universitaire dynamique"],
    "https://www.1jeune1solution.gouv.fr/stages?motCle=Data+Analyst+Universite+Lille",
    "1jeune1solution",
    "stages.direction-numerique@univ-lille.fr",
    ["SQL", "Power BI", "Metabase", "Excel", "Python"],
    "Participer à l'élaboration des indicateurs de scolarité, recherche et vie étudiante pour l'Université de Lille pendant 3 à 4 mois."
  ),
  make(
    "feed-mobivia-norauto-data-analyst-3m",
    "Stage Data Analyst Mobilités & Parc Auto (F/H) - 3 à 4 mois",
    "Mobivia / Norauto",
    "Villeneuve-d'Ascq / Lille (59)",
    "3 à 4 mois",
    "1 200 € - 1 450 € / mois",
    1200,
    ["Gratification groupe Mulliez/Mobivia", "Tickets Restaurant", "Transport 80%", "Télétravail hybride"],
    "https://www.stage.fr/offres-stage?q=Data+Analyst+Mobivia&l=Villeneuve-d-Ascq",
    "Stage.fr",
    "recrutement.stages@mobivia.com",
    ["SQL", "Python", "Power BI", "Data Visualization", "Excel"],
    "Stage de 3 à 4 mois au siège Mobivia à Villeneuve-d'Ascq pour analyser les données télématiques et d'entretien automobile."
  ),
  make(
    "feed-lesaffre-data-bi-analyst-3m",
    "Stage Data & BI Analyst Fermentation (F/H) - 3 à 4 mois",
    "Lesaffre",
    "Marcq-en-Barœul / Lille (59)",
    "3 à 4 mois",
    "1 250 € - 1 500 € / mois",
    1250,
    ["Gratification attractive industrie", "Tickets Restaurant", "Transport 50%", "Campus mondial Lesaffre"],
    "https://www.hellowork.com/fr-fr/emploi/recherche.html?k=Data+Analyst+Lesaffre&l=Marcq-en-Baroeul&c=Stage",
    "HelloWork",
    "recrutement.stages@lesaffre.com",
    ["SQL", "Power BI", "Excel", "KPI & Reporting", "Statistiques"],
    "Au siège mondial de Lesaffre à Marcq-en-Barœul, accompagnez la direction Data dans la construction de dashboards industriels sur 3 à 4 mois."
  ),
  make(
    "feed-exotec-data-analyst-croix-3m",
    "Stage Data Analyst Flotte Robots & Télémétrie (F/H) - 3 à 4 mois",
    "Exotec",
    "Croix / Lille (59)",
    "3 à 4 mois",
    "1 350 € - 1 650 € / mois",
    1350,
    ["Gratification Licorne Industrielle", "Tickets Restaurant Swile", "Transport 80%", "Accès pré-embauche"],
    "https://fr.indeed.com/jobs?q=Exotec+Data+Analyst&l=Croix",
    "Indeed",
    "recrutement.stages@exotec.com",
    ["SQL", "Python", "Tableau", "Time-series data", "Git"],
    "Stage de 3 à 4 mois chez la première licorne industrielle française à Croix pour monitorer les données opérationnelles des robots Skypod."
  ),
  make(
    "feed-sncf-data-analyst-lille-3m",
    "Stage Data Analyst TER & Flux Voyageurs (F/H) - 3 à 4 mois",
    "SNCF Voyageurs",
    "Lille Flandres / Hauts-de-France (59)",
    "3 à 4 mois",
    "1 200 € - 1 450 € / mois",
    1200,
    ["Gratification conventionnelle SNCF", "Facilités de transport ferroviaire", "Accès RIE SNCF"],
    "https://www.1jeune1solution.gouv.fr/stages?motCle=Data+Analyst+SNCF+Lille",
    "1jeune1solution",
    "emploi.stages@sncf.fr",
    ["SQL", "Python", "Power BI", "Data Visualization", "Excel"],
    "Stage de 3 à 4 mois à la direction régionale SNCF Voyageurs de Lille pour analyser la ponctualité et la fréquentation des lignes TER Hauts-de-France."
  ),
  make(
    "feed-edf-data-analyst-lille-3m",
    "Stage Data Analyst Énergies & Analyse Consommation (F/H) - 3 à 4 mois",
    "EDF Commerce Nord",
    "Lille (59)",
    "3 à 4 mois",
    "1 200 € - 1 450 € / mois",
    1200,
    ["Gratification groupe EDF", "Tickets Restaurant / RIE", "Transport remboursé 50%", "Télétravail"],
    "https://www.hellowork.com/fr-fr/emploi/recherche.html?k=Data+Analyst+EDF&l=Lille&c=Stage",
    "HelloWork",
    "recrutement.stages@edf.fr",
    ["SQL", "Python", "Power BI", "Statistiques", "Excel"],
    "Stage de 3 à 4 mois chez EDF Commerce à Lille pour modéliser les courbes de charge et la consommation énergétique régionale."
  ),
  make(
    "feed-maif-data-analyst-lille-3m",
    "Stage Data Analyst Sociétaires & RSE (F/H) - 3 à 4 mois",
    "MAIF",
    "Lille / Roubaix (59)",
    "3 à 4 mois",
    "1 250 € - 1 500 € / mois",
    1250,
    ["Gratification mutuelle attractive", "Tickets Restaurant Swile", "Transport 80%", "Télétravail flexible"],
    "https://fr.indeed.com/jobs?q=MAIF+Data+Analyst&l=Lille",
    "Indeed",
    "stages@maif.fr",
    ["SQL", "Python", "Power BI", "Statistiques", "Excel"],
    "Contribuer au suivi des engagements d'entreprise à mission et à l'analyse de satisfaction des sociétaires sur 3 à 4 mois."
  ),
  make(
    "feed-kpmg-data-analyst-lille-3m",
    "Stage Data & Digital Analytics Audit (F/H) - 3 à 4 mois",
    "KPMG France",
    "Marcq-en-Barœul / Lille (59)",
    "3 à 4 mois",
    "1 300 € - 1 550 € / mois",
    1300,
    ["Gratification cabinet Big Four", "Tickets Restaurant Swile", "Transport 50%", "Accès pré-embauche"],
    "https://www.google.com/search?q=KPMG+Data+Analyst+stage+Lille&ibp=htl;jobs",
    "JobTeaser",
    "recrutement.stages@kpmg.fr",
    ["Alteryx", "Power BI", "SQL", "Excel", "Analyse financière"],
    "Stage de 3 à 4 mois au bureau KPMG de Marcq-en-Barœul pour automatiser l'analyse de données financières lors des missions d'audit."
  ),
  make(
    "feed-dataiku-stage-solution-analyst",
    "Stage Solution & Data Analyst (F/H) - 4 à 6 mois",
    "Dataiku",
    "Paris (75)",
    "4 à 6 mois",
    "1 400 € - 1 700 € / mois",
    1400,
    ["Gratification Tech IA", "MacBook Pro M-series", "Tickets Restaurant Swile", "Transport 50%"],
    "https://www.welcometothejungle.com/fr/companies/dataiku/jobs/stage-data-science-ai-solution-analyst",
    "Welcome to the Jungle",
    "tech.recrutement@scaleup.fr",
    ["Dataiku", "Python", "SQL", "Machine Learning", "Data Visualization"],
    "Travaillez chez l'un des leaders mondiaux des plateformes d'IA pour déployer des solutions de data science et analytics."
  ),
  make(
    "feed-sephora-data-analyst-crm",
    "Stage Data Analyst E-Commerce & CRM Beauté (F/H) - 4 à 6 mois",
    "Sephora / LVMH",
    "Neuilly-sur-Seine / Paris (92)",
    "4 à 6 mois",
    "1 350 € - 1 650 € / mois",
    1350,
    ["Gratification Luxe / Retail", "Tickets Restaurant Swile", "Transport 50%", "Ventes privées LVMH"],
    "https://www.welcometothejungle.com/fr/companies/sephora/jobs/stage-data-analyst-crm-neuilly",
    "Welcome to the Jungle",
    "stages.talents@lvmh.fr",
    ["SQL", "Python", "Tableau", "Marketing Digital", "Statistiques"],
    "Au siège EME de Sephora, travaillez sur des données retail et beauté de premier plan au sein du groupe LVMH."
  ),
  make(
    "feed-backmarket-data-analyst-ops",
    "Stage Data Analyst ReCommerce & Supply (F/H) - 4 à 6 mois",
    "Back Market",
    "Paris / Télétravail (France)",
    "4 à 6 mois",
    "1 300 € - 1 600 € / mois",
    1300,
    ["Gratification Scale-up", "MacBook Pro", "Tickets Restaurant Swile", "Télétravail flexible"],
    "https://www.welcometothejungle.com/fr/companies/back-market/jobs/stage-data-analyst-ops-paris",
    "Welcome to the Jungle",
    "tech.recrutement@scaleup.fr",
    ["SQL", "dbt", "Tableau", "Python", "Git"],
    "Rejoignez la licorne française du reconditionné pour analyser les indicateurs de qualité marchande et supply."
  ),
  make(
    "feed-deloitte-data-analyst-audit",
    "Stage Data Analyst Audit & Conseil Financier (F/H) - 4 à 6 mois",
    "Deloitte France",
    "Lille / Paris (France)",
    "4 à 6 mois",
    "1 400 € - 1 700 € / mois",
    1400,
    ["Gratification Big Four", "Tickets Restaurant Swile", "Transport 50%", "Pré-embauche CDI Audit"],
    "https://www.google.com/search?q=Deloitte+Data+Analyst+stage+Lille&ibp=htl;jobs",
    "JobTeaser",
    "recrutement.stages@deloitte.fr",
    ["SQL", "Power BI", "Alteryx", "Python", "Contrôle de gestion"],
    "Démarrez votre carrière dans un cabinet d'audit d'envergure mondiale avec une forte perspective d'embauche."
  ),
  make(
    "feed-alstom-data-ingenierie",
    "Stage Data Analyst & Ingénierie Ferroviaire (F/H) - 4 à 6 mois",
    "Alstom Transport",
    "Valenciennes / Lille (59)",
    "4 à 6 mois",
    "1 250 € - 1 500 € / mois",
    1250,
    ["Gratification industrie", "RIE Alstom", "Transport 50%", "Avantages CSE Alstom"],
    "https://jobs.smartrecruiters.com/Alstom/stage-conception-mecanique-valenciennes",
    "Portail Entreprise",
    "recrutement.stages@alstom.com",
    ["SQL", "Python", "Power BI", "KPI & Reporting", "Excel"],
    "Sur le site de Valenciennes Petite-Forêt, centre d'excellence ferroviaire, analysez les données de tests et production des rames."
  ),
];
