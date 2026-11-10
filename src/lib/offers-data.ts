import { CandidateProfile, GeneratedApplication, JobOffer } from "./types";

export const GOOGLE_SHEET_ID = "1JBLOBGtfYxMZPLlZUyLM1ZqAMwzZ-V4msZkr6KveBcY";
export const GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/edit`;
export const USER_GMAIL_ADDRESS = "maximenavellier12@gmail.com";

export const DEFAULT_CANDIDATE_PROFILE: CandidateProfile = {
  fullName: "Maxime Navellier",
  email: "maximenavellier12@gmail.com",
  phone: "+33 6 00 00 00 00",
  location: "Lille / Paris (Mobilité nationale)",
  education: "Formation Ingénieur / Master Informatique, Développement Full-Stack & IA",
  targetRole: "Stagiaire Développeur Full-Stack / Ingénieur IA & Data",
  availability: "Stage 4 à 6 mois — Démarrage dès que possible (2026 / 2027)",
  keywords: [
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Python",
    "Java",
    "SQL",
    "PostgreSQL",
    "Docker",
    "Git",
    "CI/CD",
    "API REST",
    "IA Générative",
    "LLM",
    "Tailwind CSS",
  ],
  cvFileName: "CV_Maxime_Navellier_FullStack_IA.pdf",
  cvRawText: `Maxime Navellier — Développeur Full-Stack & Automatisation IA (maximenavellier12@gmail.com)
Localisation : Lille (59) / Paris | Recherche de stage Développeur Full-Stack, Logiciel, Data & IA.
Compétences techniques :
- Langages : TypeScript, JavaScript (ES6+), Python, Java, SQL, HTML5/CSS3
- Frontend : React, Next.js (App Router), Tailwind CSS, Svelte, interfaces SaaS B2B
- Backend & Data : Node.js, Express, NestJS, FastAPI, PostgreSQL, MySQL, Redis, API REST, Prisma
- IA & Automatisation : Agents autonomes, LLM (OpenAI / Gemini / Vertex AI), RAG, LangChain, Browserbase, automatisation de workflows (CRON, Google Workspace APIs)
- DevOps & Outils : Git, GitHub Actions (CI/CD), Docker, Linux, Cloud (GCP, AWS, Vercel), Tests automatisés (Jest, Playwright).`,
};

export const VERIFIED_JOB_OFFERS: JobOffer[] = [
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
    requiredSkills: [
      "TypeScript",
      "React",
      "Node.js",
      "Java",
      "API REST",
      "SQL",
      "Git",
      "Docker",
      "CI/CD",
    ],
    missions: [
      "Concevoir et développer des fonctionnalités Full-Stack au sein des produits digitaux du groupe ADEO",
      "Construire des API REST performantes et sécurisées consommées par les équipes métiers internationales",
      "Participer aux revues de code, à l'écriture de tests automatisés et aux déploiements CI/CD sur le Cloud",
      "Collaborer en méthodologie Agile avec les Product Owners, UX Designers et Tech Leads à Lille/Ronchin",
    ],
    description:
      "Au sein du siège mondial d'ADEO à Ronchin (métropole lilloise), vous intégrez une feature team produit pour développer des applications web critiques à fort trafic.",
  },
  {
    id: "axa-ai-engineer-wasquehal",
    title: "AI Engineer & Full-Stack (F/H) - Stage",
    company: "AXA France (AI Factory)",
    location: "Wasquehal / Lille (59)",
    date: "2026-11-05",
    duration: "6 mois",
    remuneration: "1 400 € - 1 700 € / mois",
    url: "https://welcometothejungle.com/fr/companies/axa/jobs/ai-engineer-f-h-stage_wasquehal_3bjmb7gf",
    source: "Welcome to the Jungle",
    contactEmail: "campus.management@axa.fr",
    requiredSkills: [
      "Python",
      "TypeScript",
      "LLM",
      "IA Générative",
      "API REST",
      "Docker",
      "CI/CD",
      "Git",
    ],
    missions: [
      "Intégrer une squad pluridisciplinaire de 10 personnes au sein de l'entité AI Factory d'AXA à Wasquehal",
      "Faire évoluer la plateforme d'agents IA (RAG, MCP, LangGraph, bases vectorielles) en termes de robustesse et d'impact métier",
      "Développer des outils, interfaces et pipelines IA (APIs REST, tests unitaires, intégration continue, conteneurisation, monitoring)",
      "Collaborer avec les équipes Data, Cloud et Front-End pour industrialiser les cas d'usage IA générative",
    ],
    description:
      "AXA France accélère sa transformation digitale au sein de son entité AI Factory basée à Wasquehal (Lille). Vous rejoignez l'équipe AI Platform pour industrialiser des agents autonomes et APIs métier.",
  },
  {
    id: "hellowork-fullstack-ia-test-nord",
    title: "Stage - Développeur Fullstack & IA Appliquée au Test (H/F)",
    company: "Pôle R&D Digital Nord (via HelloWork)",
    location: "Lille (59)",
    date: "2026-11-05",
    duration: "6 mois",
    remuneration: "1 300 € / mois",
    url: "https://www.hellowork.com/fr-fr/emploi/recherche.html?k=Developpeur+fullstack+stage&l=Lille",
    source: "HelloWork",
    contactEmail: "recrutement.lille@hellowork-tech.fr",
    requiredSkills: [
      "TypeScript",
      "React",
      "Node.js",
      "Python",
      "IA Générative",
      "Playwright",
      "Docker",
      "Git",
    ],
    missions: [
      "Développer une plateforme web Full-Stack permettant d'automatiser la génération et l'exécution de scénarios de tests via LLM",
      "Concevoir l'interface de pilotage en React / TypeScript et le moteur d'exécution en Node.js / Python",
      "Analyser automatiquement les rapports d'exécution pour détecter les régressions et suggérer des correctifs",
      "Intégrer l'outil directement dans les pipelines CI/CD des équipes de développement lilloises",
    ],
    description:
      "Offre issue de votre alerte HelloWork Lille (59) : conception d'un outil interne combinant développement Full-Stack moderne et agents IA d'automatisation de tests.",
  },
  {
    id: "galadrim-fullstack-ia-paris",
    title: "Développeur Full Stack & IA — Logiciel SaaS (Stage de fin d'études)",
    company: "Galadrim",
    location: "Paris (75) — Télétravail partiel",
    date: "2026-11-08",
    duration: "6 mois",
    remuneration: "1 400 € - 2 000 € / mois",
    url: "https://welcometothejungle.com/fr/companies/galadrim/jobs/developpeur-full-stack-logiciel-de-paie-stage-de-fin-d-etude_paris",
    source: "Welcome to the Jungle",
    contactEmail: "recrutement@galadrim.fr",
    requiredSkills: [
      "TypeScript",
      "React",
      "Tailwind CSS",
      "Node.js",
      "PostgreSQL",
      "Docker",
      "IA Générative",
      "Git",
    ],
    missions: [
      "Participer à la conception et au développement de nouvelles fonctionnalités Full-Stack de l'idée à la mise en production",
      "Identifier des opportunités d'innovation et implémenter des briques intégrant de l'IA dans le produit SaaS",
      "Travailler sur une stack moderne : React, Tailwind CSS, Node.js (Adonis/NestJS), PostgreSQL et Docker",
      "Déployer chaque semaine des fonctionnalités à fort impact avec revues de code et tests automatisés",
    ],
    description:
      "Galadrim conçoit des produits web, mobiles et IA sur mesure. Encadré par un Tech Lead expérimenté, vous intervenez sur tout le cycle Full-Stack et IA.",
  },
  {
    id: "making-science-data-ai-paris",
    title: "Data & AI Engineer - Stage (F/H)",
    company: "Making Science France",
    location: "Paris (75) — Télétravail occasionnel",
    date: "2026-11-04",
    duration: "6 mois",
    remuneration: "1 400 € / mois",
    url: "https://welcometothejungle.com/en/companies/makingscience/jobs/data-consultant-stage-paris-f-h_paris",
    source: "Welcome to the Jungle",
    contactEmail: "talent.fr@makingscience.com",
    requiredSkills: [
      "Python",
      "SQL",
      "LLM",
      "IA Générative",
      "API REST",
      "Docker",
      "Git",
    ],
    missions: [
      "Concevoir et déployer des agents IA capables d'utiliser des outils et données clients (Vertex AI, LangGraph, MCP)",
      "Développer des cas d'usage basés sur les LLM (Gemini) : RAG, extraction et structuration de données, génération de contenus",
      "Construire et automatiser des pipelines d'ingestion et de transformation de données sur GCP (Python, Cloud Run, BigQuery)",
      "Accompagner la mise en production industrielle avec un haut niveau de rigueur logicielle",
    ],
    description:
      "Au sein de l'équipe Data & AI de Making Science Paris, vous concevez et mettez en production des solutions Data et Agents IA autonomes sur Google Cloud Platform.",
  },
  {
    id: "adeo-data-engineer-lille",
    title: "[STAGE] Data & Analytics Engineer - H/F",
    company: "ADEO Siège",
    location: "Ronchin / Lille (59)",
    date: "2026-11-02",
    duration: "6 mois",
    remuneration: "1 200 € - 1 500 € / mois",
    url: "https://jobs.adeoservices.com/jobs/stage-data-engineer-h-f",
    source: "ADEO Careers",
    contactEmail: "recrutement-data@adeo.com",
    requiredSkills: [
      "Python",
      "SQL",
      "PostgreSQL",
      "Git",
      "CI/CD",
      "Docker",
      "API REST",
    ],
    missions: [
      "Concevoir et industrialiser des pipelines de données fiables pour les plateformes Data du groupe ADEO",
      "Développer des connecteurs API et automatiser les contrôles de qualité de données en Python et SQL",
      "Optimiser les modèles de données et accompagner les équipes métiers dans l'exploitation analytique",
      "Maintenir l'intégration continue (CI/CD) et la documentation technique des flux",
    ],
    description:
      "Issu de vos alertes ADEO Connect : rejoignez la direction Data & IA d'ADEO à Lille/Ronchin pour construire les pipelines analytiques et data products du groupe.",
  },
  {
    id: "sii-stage-data-fullstack-lille",
    title: "Stage Ingénieur Développement Full-Stack & Data (H/F)",
    company: "Groupe SII (Agence Nord)",
    location: "Lille (59)",
    date: "2026-11-03",
    duration: "6 mois",
    remuneration: "1 100 € - 1 200 € / mois",
    url: "https://welcometothejungle.com/fr/companies/sii/jobs/stage-data-engineer-h-f_lille_GS_1mKpzlL",
    source: "Welcome to the Jungle",
    contactEmail: "recrutement.lille@sii.fr",
    requiredSkills: [
      "Python",
      "TypeScript",
      "React",
      "SQL",
      "Docker",
      "Git",
      "CI/CD",
    ],
    missions: [
      "Intervenir sur le développement d'applications web Full-Stack et d'outils d'analyse de données pour les grands comptes du Nord",
      "Développer des interfaces de visualisation modernes et des APIs back-end sécurisées",
      "Mettre en œuvre les bonnes pratiques DevOps, Cloud et Craftsmanship (revues de code, CI/CD, conteneurisation)",
      "Participer aux travaux d'intégration d'intelligence artificielle dans les processus logiciels",
    ],
    description:
      "L'agence SII Lille accompagne ses clients grands comptes sur toute la chaîne de valeur numérique : Développement Full Stack, Cloud, DevOps, Data et IA.",
  },
  {
    id: "airbus-fullstack-ai-finops",
    title: "Stage Développeur Fullstack & Ingénieur AI — Outillage Cloud Souverain (H/F)",
    company: "Airbus Defence and Space",
    location: "Sophia-Antipolis / Hybride",
    date: "2026-11-08",
    duration: "6 mois",
    remuneration: "1 350 € - 1 600 € / mois",
    url: "https://hellowork.com/fr-fr/emplois/85082924.html",
    source: "HelloWork",
    contactEmail: "stages.cyber-cloud@airbus.com",
    requiredSkills: [
      "TypeScript",
      "React",
      "Python",
      "Node.js",
      "IA Générative",
      "Docker",
      "API REST",
      "SQL",
    ],
    missions: [
      "Développer une plateforme Full-Stack spécialisée FinOps pour les environnements de Cloud Souverain d'Airbus Defence and Space",
      "Intégrer des modèles d'Intelligence Artificielle pour automatiser l'analyse des coûts, détecter les anomalies et générer des recommandations prédictives",
      "Concevoir un tableau de bord SaaS B2B ergonomique pour les ingénieurs Cloud et opérations",
      "Respecter les exigences de sécurité, d'isolation et de déploiement conteneurisé propres aux infrastructures souveraines",
    ],
    description:
      "Au sein du département Customer Cloud/IT Platforms Engineering & Solutions d'Airbus DS, vous développez une plateforme Full-Stack et IA d'optimisation Cloud.",
  },
  {
    id: "natixis-fullstack-ia-paris",
    title: "Stage 6 mois - Développeur Full Stack & IA (F/H)",
    company: "Natixis Corporate & Investment Banking (Groupe BPCE)",
    location: "Paris (75)",
    date: "2026-11-01",
    duration: "6 mois",
    remuneration: "1 500 € - 1 800 € / mois",
    url: "https://welcometothejungle.com/fr/companies/natixis/jobs/stage-6-mois-developpeur-full-stack-ia-f-h_paris",
    source: "Welcome to the Jungle",
    contactEmail: "recrutement.stages-it@natixis.com",
    requiredSkills: [
      "TypeScript",
      "Python",
      "Node.js",
      "React",
      "SQL",
      "API REST",
      "LLM",
      "Docker",
      "Git",
      "CI/CD",
    ],
    missions: [
      "Industrialiser une application d'analyse intelligente des flux métiers et demandes de support basée sur les LLM",
      "Développer le back-end (Node.js / Python, API REST, base SQL) et l'interface web de supervision Full-Stack",
      "Assurer la robustesse, la sécurité, les tests automatisés et l'intégration dans les chaînes CI/CD et Docker de la banque",
      "Collaborer avec les équipes IT Fixed Income et les utilisateurs métiers pour affiner la précision des modèles IA",
    ],
    description:
      "Vous rejoignez les équipes IT de Natixis à Paris pour industrialiser une plateforme Full-Stack et IA générative au cœur du système d'information.",
  },
  {
    id: "ohana-nextjs-typescript-remote",
    title: "Stage Développeur Full Stack TypeScript / Next.js (H/F)",
    company: "OHana Entreprise",
    location: "Paris / Télétravail complet",
    date: "2026-11-01",
    duration: "4 à 6 mois",
    remuneration: "1 000 € - 1 300 € / mois",
    url: "https://join.com/companies/ohanaentreprisecom/16841358-stage-developpeur-full-stack-h-f",
    source: "Browserbase Live",
    contactEmail: "careers@ohana-entreprise.com",
    requiredSkills: [
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "PostgreSQL",
      "Tailwind CSS",
      "Docker",
      "Git",
      "CI/CD",
      "API REST",
    ],
    missions: [
      "Développer des applications web B2B du front-end (Next.js App Router, React, Tailwind CSS) au back-end (Node.js / FastAPI)",
      "Concevoir les schémas de bases de données PostgreSQL (Prisma / Drizzle) et les API REST associées",
      "Écrire du code propre et testé (Jest, Playwright) et participer aux revues de code quotidiennes",
      "Contribuer à la mise en production continue via GitHub Actions et Docker",
    ],
    description:
      "Stage Développeur Full Stack en télétravail / Paris sur une stack 100% alignée avec votre profil : TypeScript, React, Next.js App Router, Node.js, PostgreSQL et Tailwind CSS.",
  },
];

const KNOWN_TECH_KEYWORDS = [
  "TypeScript",
  "JavaScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "Java",
  "SQL",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Docker",
  "Kubernetes",
  "Git",
  "CI/CD",
  "GitHub Actions",
  "API REST",
  "GraphQL",
  "Tailwind CSS",
  "Svelte",
  "Vue",
  "Angular",
  "NestJS",
  "Express",
  "FastAPI",
  "Django",
  "Spring Boot",
  "IA Générative",
  "LLM",
  "RAG",
  "LangChain",
  "Playwright",
  "Jest",
  "AWS",
  "GCP",
  "Azure",
  "Linux",
  "Prisma",
];

export function extractKeywordsFromText(rawText: string): string[] {
  if (!rawText || !rawText.trim()) return [];
  const normalized = rawText.toLowerCase();
  const detected = new Set<string>();

  for (const skill of KNOWN_TECH_KEYWORDS) {
    const pattern = skill.toLowerCase();
    if (normalized.includes(pattern)) {
      detected.add(skill);
    }
  }

  if (normalized.includes("nextjs") || normalized.includes("next.js")) {
    detected.add("Next.js");
  }
  if (normalized.includes("nodejs") || normalized.includes("node.js")) {
    detected.add("Node.js");
  }
  if (normalized.includes("tailwind")) {
    detected.add("Tailwind CSS");
  }
  if (
    normalized.includes("intelligence artificielle") ||
    normalized.includes("agent") ||
    normalized.includes("openai") ||
    normalized.includes("gemini")
  ) {
    detected.add("IA Générative");
    detected.add("LLM");
  }
  if (normalized.includes("rest") || normalized.includes("api")) {
    detected.add("API REST");
  }

  return Array.from(detected);
}

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
    .filter((t) => t.length > 1);

  const scored = offers
    .map((offer) => {
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
          : 0.5;

      // Bonus for location match (Lille / Nord / Paris) or keyword hits in title/missions
      const fullOfferText =
        `${offer.title} ${offer.company} ${offer.location} ${offer.missions.join(" ")} ${offer.requiredSkills.join(" ")}`.toLowerCase();

      let tokenBonus = 0;
      if (filterTokens.length > 0) {
        const matchedTokens = filterTokens.filter((tok) =>
          fullOfferText.includes(tok)
        );
        tokenBonus = (matchedTokens.length / filterTokens.length) * 15;
      }

      const rawScore = Math.round(Math.min(99, baseRatio * 88 + 10 + tokenBonus));

      return {
        ...offer,
        matchedSkills,
        matchScore: rawScore,
      };
    })
    .filter((offer) => {
      if (filterTokens.length === 0) return true;
      const fullOfferText =
        `${offer.title} ${offer.company} ${offer.location} ${offer.missions.join(" ")} ${offer.requiredSkills.join(" ")}`.toLowerCase();
      return filterTokens.some((tok) => fullOfferText.includes(tok));
    });

  return scored.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}

export function generateApplicationDraft(
  offer: JobOffer,
  profile: CandidateProfile
): GeneratedApplication {
  const matched =
    offer.matchedSkills && offer.matchedSkills.length > 0
      ? offer.matchedSkills
      : offer.requiredSkills.slice(0, 4);

  const topSkillsText = matched.slice(0, 5).join(", ");
  const extraSkills = profile.keywords
    .filter((k) => !matched.includes(k))
    .slice(0, 3)
    .join(", ");

  const firstMission =
    offer.missions[0] ||
    "le développement et l'industrialisation de vos solutions logicielles";
  const secondMission =
    offer.missions[1] ||
    "la conception d'architectures robustes et l'automatisation des flux";

  const todayFormatted = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const subject = `Candidature Stage — ${offer.title} — ${profile.fullName}`;

  const emailBody = `Bonjour,

Je vous adresse ma candidature pour l'offre de stage « ${offer.title} » au sein de ${offer.company} (${offer.location}).

Actuellement en ${profile.education}, je me spécialise dans le développement Full-Stack et l'automatisation par l'IA. Vos enjeux concernant ${firstMission.charAt(0).toLowerCase() + firstMission.slice(1)} correspondent directement aux projets techniques que je développe au quotidien avec ${topSkillsText}.

J'ai conçu et déployé plusieurs applications cloud en production combinant interfaces web réactives, APIs back-end structurées et agents d'automatisation autonomes. Vous trouverez ci-dessous ma lettre de motivation détaillée ainsi que mon CV complet présentant mes réalisations.

Je me tiens à votre entière disposition pour échanger lors d'un entretien à votre convenance.

Bien cordialement,

${profile.fullName}
${profile.email}
${profile.location}`;

  const coverLetter = `${profile.fullName}
${profile.email}
${profile.location}

À l'attention de l'équipe Recrutement Tech — ${offer.company}
Lieu : ${offer.location}
Le ${todayFormatted}

Objet : Candidature au stage « ${offer.title} » (${offer.duration})

Madame, Monsieur,

Suivant avec grand intérêt les réalisations techniques de ${offer.company}, je vous soumets ma candidature pour le poste de stagiaire « ${offer.title} » basé à ${offer.location}.

Dans le cadre de mon parcours (${profile.education}), j'ai acquis une solide maîtrise pratique des technologies au cœur de votre stack : ${topSkillsText}${extraSkills ? `, complétées par ${extraSkills}` : ""}. Cette polyvalence me permet d'intervenir de manière opérationnelle sur l'ensemble du cycle de vie d'un produit logiciel, de l'architecture back-end et base de données jusqu'à la conception d'interfaces utilisateur sobres, rapides et maintenables.

Votre offre a particulièrement retenu mon attention par la clarté de ses défis techniques :
1. ${firstMission} : j'ai récemment développé et déployé des plateformes Full-Stack et des pipelines d'automatisation cloud mettant en œuvre ces mêmes exigences de fiabilité et de performance.
2. ${secondMission} : mon habitude du travail avec Git, Docker, les chaînes CI/CD et les tests automatisés me permettra de m'intégrer rapidement aux standards d'ingénierie de vos équipes.

Rigoureux, autonome et orienté vers l'impact concret en production, je souhaite mettre mon énergie et mes compétences techniques au service de ${offer.company} durant ce stage de ${offer.duration}.

Je vous remercie de l'attention portée à ma candidature et reste à votre disposition pour un entretien technique.

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
