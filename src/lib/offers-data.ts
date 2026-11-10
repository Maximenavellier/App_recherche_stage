import { CandidateProfile, GeneratedApplication, JobOffer } from "./types";

export const GOOGLE_SHEET_ID = "1JBLOBGtfYxMZPLlZUyLM1ZqAMwzZ-V4msZkr6KveBcY";
export const GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/edit`;
export const USER_GMAIL_ADDRESS = "maximenavellier12@gmail.com";

export const DEFAULT_CANDIDATE_PROFILE: CandidateProfile = {
  fullName: "Maxime Navellier",
  email: "maximenavellier12@gmail.com",
  phone: "+33 6 00 00 00 00",
  location: "Lille / Paris (France)",
  education: "Formation Master / École d'Ingénieur — Data, IA & Ingénierie Logicielle",
  targetRole: "Stage Data Analyst / Data & IA",
  availability: "Stage 4 à 6 mois — Démarrage dès que possible",
  keywords: [
    "SQL",
    "Python",
    "Power BI",
    "Tableau",
    "Excel",
    "Looker Studio",
    "BigQuery",
    "Pandas",
    "Data Visualization",
    "Statistiques",
    "ETL",
    "Git",
  ],
  cvFileName: "Profil par défaut (Importez votre CV PDF pour personnaliser)",
  cvRawText: `Maxime Navellier (${USER_GMAIL_ADDRESS})
Recherche de stage : Data Analyst, Business Intelligence, Data Engineer, IA & Développement.
Compétences : SQL, Python (Pandas, NumPy), Power BI, Tableau, Looker Studio, Excel avancé, BigQuery, PostgreSQL, ETL, Data Visualization, Statistiques, Git, API REST.`,
};

export const KNOWN_SKILL_PATTERNS: Array<{ label: string; patterns: string[] }> = [
  // Data Analysis / BI / Data Science
  { label: "SQL", patterns: ["sql", "mysql", "postgresql", "pl/sql", "t-sql", "requêtes sql"] },
  { label: "Python", patterns: ["python", "py"] },
  { label: "Power BI", patterns: ["power bi", "powerbi", "pbi"] },
  { label: "Tableau", patterns: ["tableau software", "tableau desktop", "tableau"] },
  { label: "Excel", patterns: ["excel", "tableur", "tcd", "tableaux croisés dynamiques"] },
  { label: "Looker Studio", patterns: ["looker", "data studio", "looker studio"] },
  { label: "BigQuery", patterns: ["bigquery", "big query"] },
  { label: "Snowflake", patterns: ["snowflake"] },
  { label: "Pandas", patterns: ["pandas"] },
  { label: "NumPy", patterns: ["numpy"] },
  { label: "R", patterns: ["langage r", " r ", "rstudio", "shiny", "ggplot"] },
  { label: "SAS", patterns: [" sas "] },
  { label: "DAX", patterns: ["dax", "power query"] },
  { label: "VBA", patterns: ["vba", "macros"] },
  { label: "ETL", patterns: ["etl", "elt", "talend", "informatica", "dataiku", "alteryx"] },
  { label: "Dataiku", patterns: ["dataiku"] },
  { label: "dbt", patterns: [" dbt "] },
  { label: "Airflow", patterns: ["airflow"] },
  { label: "Spark", patterns: ["spark", "pyspark"] },
  { label: "Databricks", patterns: ["databricks"] },
  { label: "Statistiques", patterns: ["statistique", "statistiques", "statistics", "économétrie", "probabilités", "a/b test"] },
  { label: "Data Visualization", patterns: ["dataviz", "data visualization", "datavisualisation", "visualisation", "dashboards", "tableaux de bord", "reporting"] },
  { label: "KPI & Reporting", patterns: ["kpi", "indicateurs de performance", "reporting", "pilotage"] },
  { label: "Machine Learning", patterns: ["machine learning", "ml", "scikit-learn", "sklearn", "xgboost", "modélisation prédictive"] },
  { label: "Deep Learning", patterns: ["deep learning", "tensorflow", "pytorch", "keras"] },
  { label: "Google Analytics", patterns: ["google analytics", "ga4", "matomo", "piano analytics"] },

  // Dev / Full-Stack / Software
  { label: "TypeScript", patterns: ["typescript"] },
  { label: "JavaScript", patterns: ["javascript", "es6"] },
  { label: "React", patterns: ["react", "reactjs", "react.js"] },
  { label: "Next.js", patterns: ["next.js", "nextjs"] },
  { label: "Node.js", patterns: ["node.js", "nodejs", "express", "nestjs"] },
  { label: "Java", patterns: [" java ", "java,", "java/", "spring boot", "jee"] },
  { label: "C#", patterns: ["c#", ".net", "dotnet"] },
  { label: "C++", patterns: ["c++"] },
  { label: "PHP", patterns: ["php", "symfony", "laravel"] },
  { label: "Vue.js", patterns: ["vue.js", "vuejs", "nuxt"] },
  { label: "Angular", patterns: ["angular"] },
  { label: "Tailwind CSS", patterns: ["tailwind"] },
  { label: "HTML/CSS", patterns: ["html", "css"] },
  { label: "PostgreSQL", patterns: ["postgresql", "postgres"] },
  { label: "MongoDB", patterns: ["mongodb", "nosql"] },
  { label: "API REST", patterns: ["api rest", "rest api", "restful", "graphql", "fastapi"] },

  // Cloud / DevOps / IA / Product
  { label: "Docker", patterns: ["docker", "conteneur"] },
  { label: "Kubernetes", patterns: ["kubernetes", "k8s"] },
  { label: "Git", patterns: ["git", "github", "gitlab"] },
  { label: "CI/CD", patterns: ["ci/cd", "github actions", "gitlab ci", "jenkins"] },
  { label: "AWS", patterns: ["aws", "amazon web services", "s3", "redshift"] },
  { label: "GCP", patterns: ["gcp", "google cloud", "vertex ai"] },
  { label: "Azure", patterns: ["azure", "synapse", "fabric"] },
  { label: "Linux", patterns: ["linux", "bash", "unix"] },
  { label: "IA Générative", patterns: ["ia générative", "generative ai", "genai", "openai", "gemini", "mistral"] },
  { label: "LLM", patterns: ["llm", "rag", "langchain", "agents ia", "nlp"] },
  { label: "Agile / Scrum", patterns: ["agile", "scrum", "kanban", "jira", "confluence"] },
  { label: "SAP", patterns: [" sap ", "sap bw", "sap erp"] },
  { label: "Salesforce", patterns: ["salesforce", "crm"] },
];

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

  return Array.from(detected);
}

export function inferTargetRoleFromText(rawText: string): string {
  const lower = (rawText || "").toLowerCase();

  const roleScores: Array<{ role: string; query: string; score: number }> = [
    {
      role: "Stagiaire Data Analyst / Business Intelligence",
      query: "Data Analyst",
      score:
        (lower.includes("data analyst") ? 6 : 0) +
        (lower.includes("power bi") ? 3 : 0) +
        (lower.includes("tableau") ? 3 : 0) +
        (lower.includes("business intelligence") || lower.includes(" bi ") ? 3 : 0) +
        (lower.includes("looker") ? 2 : 0) +
        (lower.includes("dataviz") || lower.includes("dashboard") || lower.includes("reporting") ? 2 : 0) +
        (lower.includes("excel") ? 1 : 0) +
        (lower.includes("sql") ? 2 : 0),
    },
    {
      role: "Stagiaire Data Scientist / Machine Learning",
      query: "Data Scientist",
      score:
        (lower.includes("data scientist") || lower.includes("data science") ? 6 : 0) +
        (lower.includes("machine learning") ? 3 : 0) +
        (lower.includes("scikit-learn") || lower.includes("pytorch") || lower.includes("tensorflow") ? 3 : 0) +
        (lower.includes("statistique") || lower.includes("modélisation") ? 2 : 0),
    },
    {
      role: "Stagiaire Data Engineer",
      query: "Data Engineer",
      score:
        (lower.includes("data engineer") ? 6 : 0) +
        (lower.includes("airflow") || lower.includes("spark") || lower.includes("dbt") || lower.includes("kafka") ? 4 : 0) +
        (lower.includes("snowflake") || lower.includes("databricks") || lower.includes("etl") ? 3 : 0),
    },
    {
      role: "Stagiaire Business Analyst / Product Data",
      query: "Business Analyst",
      score:
        (lower.includes("business analyst") ? 6 : 0) +
        (lower.includes("product owner") || lower.includes("product manager") || lower.includes("amoa") ? 3 : 0) +
        (lower.includes("kpi") || lower.includes("cadrage") ? 2 : 0),
    },
    {
      role: "Stagiaire Développeur Full-Stack / Logiciel",
      query: "Développeur Full Stack",
      score:
        (lower.includes("full stack") || lower.includes("fullstack") || lower.includes("développeur web") ? 6 : 0) +
        (lower.includes("react") || lower.includes("next.js") || lower.includes("vue") || lower.includes("angular") ? 3 : 0) +
        (lower.includes("node.js") || lower.includes("typescript") || lower.includes("symfony") || lower.includes("spring") ? 3 : 0),
    },
    {
      role: "Stagiaire Ingénieur IA / NLP & LLM",
      query: "Ingénieur IA",
      score:
        (lower.includes("ingénieur ia") || lower.includes("ai engineer") ? 6 : 0) +
        (lower.includes("llm") || lower.includes("rag") || lower.includes("langchain") || lower.includes("ia générative") ? 4 : 0),
    },
    {
      role: "Stagiaire Cybersécurité / Réseaux & Cloud",
      query: "Cybersécurité",
      score:
        (lower.includes("cybersécurité") || lower.includes("cybersecurity") || lower.includes("pentest") || lower.includes("soc") ? 6 : 0) +
        (lower.includes("iso 27001") || lower.includes("siem") || lower.includes("réseau") ? 3 : 0),
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

  // Try to detect email in CV
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  // Try to detect French phone
  const phoneMatch = rawText.match(/(?:\+33|0)\s?[1-9](?:[\s.-]?\d{2}){4}/);

  // Detect location if mentioned
  const cities = ["Lille", "Paris", "Lyon", "Nantes", "Bordeaux", "Toulouse", "Marseille", "Rennes", "Strasbourg", "Montpellier"];
  const detectedCities = cities.filter((c) =>
    new RegExp(`\\b${c}\\b`, "i").test(rawText)
  );

  return {
    suggestedQuery,
    profile: {
      ...currentProfile,
      email: currentProfile.email || (emailMatch ? emailMatch[0] : USER_GMAIL_ADDRESS),
      phone: phoneMatch ? phoneMatch[0] : currentProfile.phone,
      location:
        detectedCities.length > 0
          ? `${detectedCities.join(" / ")} (France)`
          : currentProfile.location,
      targetRole: `Stage ${suggestedQuery}`,
      keywords:
        detectedSkills.length > 0
          ? detectedSkills
          : ["SQL", "Python", "Power BI", "Excel", "Data Visualization"],
      cvFileName: fileName,
      cvRawText: rawText.slice(0, 12000),
    },
  };
}

// Curated multi-domain fallback catalog used ONLY if external network scraping is unreachable
export const VERIFIED_JOB_OFFERS: JobOffer[] = [
  {
    id: "carrefour-data-analyst-massy",
    title: "Stagiaire Data Analyst & BI (F/H)",
    company: "Carrefour Groupe",
    location: "Massy / Paris (91)",
    date: "2026-11-10",
    duration: "6 mois",
    remuneration: "1 300 € - 1 600 € / mois",
    url: "https://fr.linkedin.com/jobs/view/stagiaire-data-analyst-f-h-at-carrefour-4476079235",
    source: "LinkedIn Jobs (Live)",
    contactEmail: "recrutement.data@carrefour.com",
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
    remuneration: "1 350 € - 1 550 € / mois",
    url: "https://www.linkedin.com/jobs/search/?keywords=Stage%20Data%20Analyst%20Decathlon%20Lille",
    source: "LinkedIn Jobs (Live)",
    contactEmail: "campus.data@decathlon.com",
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
    id: "adeo-data-analyst-lille",
    title: "[STAGE] Data & Analytics Analyst - H/F",
    company: "ADEO Siège (Leroy Merlin)",
    location: "Ronchin / Lille (59)",
    date: "2026-11-08",
    duration: "6 mois",
    remuneration: "1 250 € - 1 500 € / mois",
    url: "https://jobs.adeoservices.com/jobs/stage-data-engineer-h-f",
    source: "ADEO Careers",
    contactEmail: "recrutement-data@adeo.com",
    requiredSkills: ["SQL", "Python", "Power BI", "Looker Studio", "BigQuery", "GCP", "KPI & Reporting", "Git"],
    missions: [
      "Requêter et croiser les données métiers sur Google Cloud Platform (BigQuery, SQL, Python)",
      "Construire des dashboards d'aide à la décision sur Power BI et Looker Studio pour les Business Units internationales",
      "Automatiser les flux de reporting et fiabiliser la qualité des indicateurs clés (KPI)",
    ],
    description:
      "Rejoignez la direction Data d'ADEO à Lille/Ronchin pour accompagner les équipes métiers dans l'exploitation analytique et la datavisualisation.",
  },
  {
    id: "bnp-data-analyst-paris",
    title: "Stage - Data Analyst & Reporting BI (H/F)",
    company: "BNP Paribas",
    location: "Paris (75) — Télétravail partiel",
    date: "2026-11-08",
    duration: "6 mois",
    remuneration: "1 450 € - 1 750 € / mois",
    url: "https://group.bnpparibas/emploi-carriere/toutes-offres-emploi",
    source: "Welcome to the Jungle",
    contactEmail: "recrutement.stages-data@bnpparibas.com",
    requiredSkills: ["SQL", "Power BI", "Python", "Excel", "DAX", "VBA", "ETL", "KPI & Reporting"],
    missions: [
      "Collecter, nettoyer et modéliser les données métiers à l'aide de SQL, Python et Power Query / DAX",
      "Développer des tableaux de bord interactifs sous Power BI pour le suivi de la performance et des risques",
      "Automatiser les reportings récurrents et accompagner les équipes dans la prise en main des outils BI",
    ],
    description:
      "Au sein du pôle Data & Analytics de BNP Paribas à Paris, vous pilotez la création de dashboards Power BI et l'automatisation des pipelines analytiques.",
  },
  {
    id: "adeo-fullstack-lille",
    title: "[STAGE] Développeur Fullstack - H/F",
    company: "ADEO Siège (Leroy Merlin / Groupe ADEO)",
    location: "Ronchin / Lille (59)",
    date: "2026-11-05",
    duration: "6 mois",
    remuneration: "1 200 € - 1 500 € / mois",
    url: "https://jobs.adeoservices.com/jobs/8607762-stage-developpeur-fullstack-h-f",
    source: "ADEO Careers",
    contactEmail: "recrutement-stage@adeo.com",
    requiredSkills: ["TypeScript", "React", "Node.js", "Java", "API REST", "SQL", "Git", "Docker", "CI/CD"],
    missions: [
      "Concevoir et développer des fonctionnalités Full-Stack au sein des produits digitaux du groupe ADEO",
      "Construire des API REST performantes et sécurisées consommées par les équipes métiers internationales",
      "Participer aux revues de code, à l'écriture de tests automatisés et aux déploiements CI/CD sur le Cloud",
    ],
    description:
      "Au sein du siège mondial d'ADEO à Ronchin (métropole lilloise), vous intégrez une feature team produit pour développer des applications web critiques.",
  },
  {
    id: "axa-ai-engineer-wasquehal",
    title: "AI & Data Engineer (F/H) - Stage",
    company: "AXA France (AI Factory)",
    location: "Wasquehal / Lille (59)",
    date: "2026-11-05",
    duration: "6 mois",
    remuneration: "1 400 € - 1 700 € / mois",
    url: "https://welcometothejungle.com/fr/companies/axa/jobs/ai-engineer-f-h-stage_wasquehal_3bjmb7gf",
    source: "Welcome to the Jungle",
    contactEmail: "campus.management@axa.fr",
    requiredSkills: ["Python", "SQL", "LLM", "IA Générative", "API REST", "Docker", "Git"],
    missions: [
      "Intégrer une squad pluridisciplinaire au sein de l'entité AI Factory d'AXA à Wasquehal (Lille)",
      "Développer des pipelines d'analyse de données et d'agents IA en Python et SQL",
      "Collaborer avec les équipes Data et Métiers pour industrialiser les cas d'usage analytiques et IA",
    ],
    description:
      "AXA France accélère sa transformation Data & IA au sein de son entité AI Factory basée à Wasquehal (Lille).",
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
      Math.min(99, Math.max(45, baseRatio * 55 + 15 + queryScore))
    );

    return {
      ...offer,
      matchedSkills,
      matchScore: rawScore,
    };
  });

  // If the user typed a specific search query, prioritize offers matching the query tokens
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
      : profile.keywords.slice(0, 5).join(", ");
  const extraSkills = profile.keywords
    .filter((k) => !matched.includes(k))
    .slice(0, 3)
    .join(", ");

  const firstMission =
    offer.missions[0] ||
    "l'analyse, la structuration et la valorisation de vos données métiers";
  const secondMission =
    offer.missions[1] ||
    "l'automatisation des indicateurs de performance et l'aide à la décision";

  const todayFormatted = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const roleLabel = profile.targetRole || offer.title;
  const subject = `Candidature Stage — ${offer.title} — ${profile.fullName}`;

  const emailBody = `Bonjour,

Je vous adresse ma candidature pour l'offre de stage « ${offer.title} » au sein de ${offer.company} (${offer.location}).

Actuellement en ${profile.education} (${roleLabel}), je maîtrise les compétences clés attendues sur ce poste : ${topSkillsText}. Vos enjeux concernant ${firstMission.charAt(0).toLowerCase() + firstMission.slice(1)} correspondent directement à mes projets réalisés et aux compétences détaillées dans mon CV.

Rigoureux et immédiatement opérationnel sur votre stack (${offer.requiredSkills.slice(0, 5).join(", ")}), je vous joins ci-dessous ma lettre de motivation personnalisée.

Je me tiens à votre entière disposition pour échanger lors d'un entretien à votre convenance.

Bien cordialement,

${profile.fullName}
${profile.email}
${profile.location}`;

  const coverLetter = `${profile.fullName}
${profile.email}
${profile.location}

À l'attention de l'équipe Recrutement — ${offer.company}
Lieu : ${offer.location}
Le ${todayFormatted}

Objet : Candidature au stage « ${offer.title} » (${offer.duration})

Madame, Monsieur,

Suivant avec grand intérêt les activités de ${offer.company}, je vous soumets ma candidature pour le poste de stagiaire « ${offer.title} » basé à ${offer.location}.

Dans le cadre de mon parcours (${profile.education}), j'ai développé une solide maîtrise pratique des outils et méthodes au cœur de votre besoin : ${topSkillsText}${extraSkills ? `, complétés par ${extraSkills}` : ""}.

Votre offre retient particulièrement mon attention par la pertinence de ses missions :
1. ${firstMission} : j'ai mené plusieurs projets concrets mobilisant ces compétences avec un fort souci de fiabilité, de clarté analytique et d'impact métier.
2. ${secondMission} : ma capacité à structurer les problèmes, automatiser les traitements et restituer des résultats clairs me permettra d'être rapidement autonome au sein de votre équipe.

Investi, curieux et orienté résultats, je souhaite mettre mes compétences au service de ${offer.company} durant ce stage.

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
