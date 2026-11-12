import { CandidateProfile, GeneratedApplication, JobOffer, WorkMode } from "./types";

export const GOOGLE_SHEET_ID = "1JBLOBGtfYxMZPLlZUyLM1ZqAMwzZ-V4msZkr6KveBcY";
export const GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/edit`;
export const USER_GMAIL_ADDRESS = "maximenavellier12@gmail.com";

export interface QuickDomainPreset {
  label: string;
  query: string;
  category: string;
  defaultSkills: string[];
}

export const UNIVERSAL_DOMAIN_PRESETS: QuickDomainPreset[] = [
  {
    label: "📊 Data Analyst & BI",
    query: "Data Analyst",
    category: "Data & IA",
    defaultSkills: ["SQL", "Python", "Power BI", "Tableau", "Excel", "Data Visualization", "Statistiques"],
  },
  {
    label: "🤖 Data Scientist & IA",
    query: "Data Scientist",
    category: "Data & IA",
    defaultSkills: ["Python", "SQL", "Machine Learning", "Pandas", "Deep Learning", "Statistiques", "LLM / IA Générative"],
  },
  {
    label: "💻 Développeur Web / Logiciel",
    query: "Développeur Full Stack",
    category: "Tech & Informatique",
    defaultSkills: ["TypeScript", "React", "Node.js", "Python", "SQL", "Git", "API REST", "Docker"],
  },
  {
    label: "🧠 Psychologue & Santé",
    query: "Psychologue",
    category: "Santé, Psychologie & Social",
    defaultSkills: [
      "Entretien clinique",
      "Bilan psychologique",
      "Écoute active",
      "TCC",
      "DSM-5",
      "Tests psychométriques (WISC/WAIS)",
      "Accompagnement patient",
      "Comptes-rendus cliniques",
    ],
  },
  {
    label: "🔧 Mécanique & Industrie",
    query: "Mécanique Maintenance Industrielle",
    category: "Ingénierie, Mécanique & Industrie",
    defaultSkills: [
      "SolidWorks",
      "CAO / AutoCAD",
      "Maintenance industrielle",
      "Mécanique générale",
      "Diagnostic technique",
      "Hydraulique & Pneumatique",
      "Lean Manufacturing",
      "QHSE / Qualité",
    ],
  },
  {
    label: "📣 Marketing & Communication",
    query: "Marketing Communication",
    category: "Marketing, Créa & Commerce",
    defaultSkills: [
      "Marketing Digital",
      "Réseaux Sociaux",
      "Canva",
      "Suite Adobe",
      "SEO / SEA",
      "Rédaction & Content",
      "Google Analytics",
      "Gestion de projet",
    ],
  },
  {
    label: "💼 Commerce & Business Dev",
    query: "Business Developer Commercial",
    category: "Marketing, Créa & Commerce",
    defaultSkills: [
      "Prospection commerciale",
      "Négociation & Vente",
      "CRM (Salesforce / HubSpot)",
      "Relation client",
      "Excel",
      "Études de marché",
    ],
  },
  {
    label: "💰 Finance, Compta & Audit",
    query: "Finance Contrôle de Gestion Comptabilité",
    category: "Finance, Droit & RH",
    defaultSkills: [
      "Contrôle de gestion",
      "Comptabilité générale",
      "Analyse financière",
      "Excel",
      "Audit financier",
      "SAP / Sage",
      "KPI & Reporting",
    ],
  },
  {
    label: "👥 Ressources Humaines (RH)",
    query: "Ressources Humaines Recrutement",
    category: "Finance, Droit & RH",
    defaultSkills: [
      "Recrutement & Sourcing RH",
      "Entretiens candidats",
      "Droit social",
      "Formation & GPEC",
      "Administration du personnel",
      "Pack Office",
    ],
  },
  {
    label: "⚖️ Droit & Juriste",
    query: "Juriste Droit",
    category: "Finance, Droit & RH",
    defaultSkills: [
      "Droit des affaires",
      "Droit des contrats",
      "Droit social",
      "Veille juridique",
      "RGPD / Conformité",
      "Rédaction juridique",
    ],
  },
  {
    label: "🏗️ BTP, Génie Civil & Archi",
    query: "Génie Civil BTP Conduite de travaux",
    category: "BTP, Environnement & Sciences",
    defaultSkills: [
      "Conduite de travaux",
      "Génie civil / BTP",
      "AutoCAD",
      "Revit / BIM",
      "Chiffrage & Métrés",
      "QHSE / Sécurité chantier",
    ],
  },
  {
    label: "🎨 Design, Graphisme & UX",
    query: "Graphiste UI UX Design",
    category: "Marketing, Créa & Commerce",
    defaultSkills: [
      "Figma / UI-UX",
      "Suite Adobe",
      "Canva",
      "Direction artistique",
      "Prototypage",
      "Montage Vidéo",
    ],
  },
];

export const DEFAULT_CANDIDATE_PROFILE: CandidateProfile = {
  fullName: "Maxime Navellier",
  email: USER_GMAIL_ADDRESS,
  phone: "+33 6 00 00 00 00",
  location: "Lille / Paris (France)",
  education: "Formation Supérieure — Master / École / Université",
  targetRole: "Stage Data Analyst",
  availability: "Stage 4 à 6 mois — Dès que possible",
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
  ],
  cvFileName: "Importez n'importe quel CV (.pdf) pour personnaliser le métier et les compétences",
  cvRawText: `Maxime Navellier (${USER_GMAIL_ADDRESS})
Recherche de stage : Data Analyst, Business Intelligence, Data & IA.
Compétences : SQL, Python (Pandas, NumPy), Power BI, Tableau, Looker Studio, Excel avancé, BigQuery, Data Visualization, Statistiques.`,
};

export const KNOWN_SKILL_PATTERNS: Array<{ label: string; patterns: string[] }> = [
  // 1. Data Analysis / BI / Data Science
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
  { label: "ETL", patterns: ["etl", "elt", "talend", "informatica", "alteryx"] },
  { label: "Dataiku", patterns: ["dataiku"] },
  { label: "dbt", patterns: [" dbt "] },
  { label: "Airflow", patterns: ["airflow"] },
  { label: "Spark", patterns: ["spark", "pyspark"] },
  { label: "Databricks", patterns: ["databricks"] },
  { label: "Statistiques", patterns: ["statistique", "statistiques", "statistics", "économétrie", "probabilités", "a/b test", "spss"] },
  { label: "Data Visualization", patterns: ["dataviz", "data visualization", "datavisualisation", "dashboards", "tableaux de bord"] },
  { label: "KPI & Reporting", patterns: ["kpi", "indicateurs de performance", "reporting", "pilotage"] },
  { label: "Machine Learning", patterns: ["machine learning", "scikit-learn", "sklearn", "xgboost", "modélisation prédictive"] },
  { label: "Deep Learning", patterns: ["deep learning", "tensorflow", "pytorch", "keras"] },
  { label: "Google Analytics", patterns: ["google analytics", "ga4", "matomo", "piano analytics"] },

  // 2. Tech / Dev / Cloud / Cyber
  { label: "TypeScript", patterns: ["typescript"] },
  { label: "JavaScript", patterns: ["javascript", "es6"] },
  { label: "React", patterns: ["react", "reactjs", "react.js"] },
  { label: "Next.js", patterns: ["next.js", "nextjs"] },
  { label: "Node.js", patterns: ["node.js", "nodejs", "express", "nestjs"] },
  { label: "Java", patterns: [" java ", "java,", "java/", "spring boot", "jee"] },
  { label: "C# / .NET", patterns: ["c#", ".net", "dotnet"] },
  { label: "C / C++", patterns: ["c++", "langage c"] },
  { label: "PHP", patterns: ["php", "symfony", "laravel"] },
  { label: "Vue.js", patterns: ["vue.js", "vuejs", "nuxt"] },
  { label: "Angular", patterns: ["angular"] },
  { label: "HTML/CSS", patterns: ["html", "css", "tailwind"] },
  { label: "API REST", patterns: ["api rest", "rest api", "restful", "graphql", "fastapi"] },
  { label: "Docker", patterns: ["docker", "conteneur"] },
  { label: "Kubernetes", patterns: ["kubernetes", "k8s"] },
  { label: "Git", patterns: ["git", "github", "gitlab"] },
  { label: "CI/CD", patterns: ["ci/cd", "github actions", "gitlab ci", "jenkins"] },
  { label: "AWS", patterns: ["aws", "amazon web services"] },
  { label: "GCP", patterns: ["gcp", "google cloud"] },
  { label: "Azure", patterns: ["azure"] },
  { label: "Linux", patterns: ["linux", "bash", "unix"] },
  { label: "Cybersécurité", patterns: ["cybersécurité", "pentest", "iso 27001", "siem", "soc", "sécurité informatique"] },
  { label: "LLM / IA Générative", patterns: ["ia générative", "generative ai", "genai", "llm", "rag", "langchain", "openai"] },

  // 3. Psychologie, Santé, Médical & Social
  { label: "Entretien clinique", patterns: ["entretien clinique", "entretiens cliniques", "entretien d'aide", "anamnèse"] },
  { label: "Bilan psychologique", patterns: ["bilan psychologique", "bilans psychologiques", "évaluation psychologique", "bilan neuropsychologique"] },
  { label: "Tests psychométriques (WISC/WAIS)", patterns: ["wisc", "wais", "wppsi", "tests psychométriques", "psychométrie", "mmse", "moca", "rorschach", "tat"] },
  { label: "TCC", patterns: ["tcc", "thérapie cognitivo-comportementale", "thérapies cognitives"] },
  { label: "DSM-5", patterns: ["dsm-5", "dsm 5", "dsm", "cim-10", "cim-11", "psychopathologie"] },
  { label: "Neuropsychologie", patterns: ["neuropsychologie", "neuropsychologue", "fonctions exécutives", "remédiation cognitive"] },
  { label: "Écoute active", patterns: ["écoute active", "bienveillance", "empathie", "alliance thérapeutique"] },
  { label: "Accompagnement patient", patterns: ["accompagnement patient", "prise en charge", "suivi psychologique", "accompagnement éducatif", "suivi des patients"] },
  { label: "Comptes-rendus cliniques", patterns: ["compte-rendu clinique", "comptes-rendus", "rédaction de bilans", "synthèse clinique", "dossier patient"] },
  { label: "Animation de groupes", patterns: ["groupe de parole", "ateliers thérapeutiques", "animation de groupe", "médiation thérapeutique"] },
  { label: "Psychologie du travail / RPS", patterns: ["psychologie du travail", "risques psychosociaux", "rps", "qvt", "qualité de vie au travail", "ergonomie"] },
  { label: "Soins & Paramédical", patterns: ["soins infirmiers", "ergothérapie", "psychomotricité", "orthophonie", "kinésithérapie", "éducation spécialisée"] },

  // 4. Mécanique, Ingénierie, Maintenance, Automobile & Industrie
  { label: "SolidWorks", patterns: ["solidworks", "solid works"] },
  { label: "CATIA", patterns: ["catia"] },
  { label: "CAO / AutoCAD", patterns: ["autocad", "cao", "dao", "conception assistée", "creo", "inventor", "fusion 360"] },
  { label: "Maintenance industrielle", patterns: ["maintenance industrielle", "maintenance préventive", "maintenance corrective", "maintenance curative", "gmao"] },
  { label: "Mécanique générale", patterns: ["mécanique", "mécanicien", "assemblage mécanique", "conception mécanique", "systèmes mécaniques", "rdm", "résistance des matériaux"] },
  { label: "Diagnostic technique / Auto", patterns: ["diagnostic automobile", "diagnostic électronique", "diagnostic de panne", "recherche de panne", "véhicules", "moteur"] },
  { label: "Usinage & CNC", patterns: ["usinage", "cnc", "fraisage", "tournage", "commande numérique", " FAO ", "soudure", "chaudronnerie"] },
  { label: "Hydraulique & Pneumatique", patterns: ["hydraulique", "pneumatique"] },
  { label: "Électrotechnique & Automatisme", patterns: ["électrotechnique", "automatisme", "automate", "plc", "schneider", "siemens", "câblage", "électronique"] },
  { label: "Lean Manufacturing", patterns: ["lean", "5s", "kaizen", "amélioration continue", "six sigma", "kanbans", " TRS ", "smed"] },
  { label: "QHSE / Qualité", patterns: ["qhse", "hse", "qualité", "iso 9001", "iso 14001", "contrôle qualité", "métrologie", "sécurité industrielle", "amdec"] },
  { label: "Supply Chain & Logistique", patterns: ["supply chain", "logistique", "gestion des stocks", "approvisionnement", "ordonnancement", "planification"] },

  // 5. Marketing, Communication, Commerce & Création
  { label: "Marketing Digital", patterns: ["marketing digital", "webmarketing", "marketing opérationnel", "growth", "campagnes marketing"] },
  { label: "SEO / SEA", patterns: ["seo", "sea", "référencement", "google ads", "semrush"] },
  { label: "Réseaux Sociaux", patterns: ["réseaux sociaux", "social media", "community management", "instagram", "tiktok", "linkedin content"] },
  { label: "Canva", patterns: ["canva"] },
  { label: "Suite Adobe", patterns: ["photoshop", "illustrator", "indesign", "premiere pro", "after effects", "suite adobe", "creative cloud"] },
  { label: "Figma / UI-UX", patterns: ["figma", "ui/ux", "ux design", "ui design", "wireframe", "maquettage"] },
  { label: "Rédaction & Content", patterns: ["rédaction web", "copywriting", "création de contenu", "newsletter", "storytelling", "communiqué de presse"] },
  { label: "Prospection commerciale", patterns: ["prospection", "business development", "b2b", "b2c", "développement commercial", "phoning", "cold emailing"] },
  { label: "Négociation & Vente", patterns: ["négociation", "vente", "closing", "conseil client", "fidélisation"] },
  { label: "CRM (Salesforce / HubSpot)", patterns: ["salesforce", "hubspot", "zoho", "pipedrive", "crm"] },
  { label: "Événementiel & RP", patterns: ["événementiel", "relations presse", "relations publiques", "organisation d'événements"] },

  // 6. Finance, Comptabilité, Droit & RH
  { label: "Comptabilité générale", patterns: ["comptabilité", "bilan comptable", "saisie comptable", "clôture", "liasse fiscale", "facturation"] },
  { label: "Contrôle de gestion", patterns: ["contrôle de gestion", "budget", "forecast", "analyse des écarts", "calcul de coûts", "comptabilité analytique"] },
  { label: "Analyse financière", patterns: ["analyse financière", "modélisation financière", "trésorerie", "valorisation", "corporate finance", "m&a"] },
  { label: "Audit financier", patterns: ["audit financier", "audit interne", "commissariat aux comptes"] },
  { label: "SAP / Sage", patterns: [" sap ", "sage", "cegid", "erp"] },
  { label: "Recrutement & Sourcing RH", patterns: ["recrutement", "sourcing", "entretien rh", "intégration", "onboarding", "marque employeur"] },
  { label: "Formation & GPEC", patterns: ["gpec", "plan de formation", "gestion des carrières", "ressources humaines"] },
  { label: "Administration du personnel", patterns: ["paie", "administration du personnel", "contrats de travail", "silae", "adp"] },
  { label: "Droit des affaires", patterns: ["droit des affaires", "droit des sociétés", "droit commercial", "propriété intellectuelle"] },
  { label: "Droit des contrats", patterns: ["droit des contrats", "rédaction de contrats", "contentieux", "juridique"] },
  { label: "Droit social", patterns: ["droit social", "droit du travail", "relations sociales", "cse"] },
  { label: "RGPD / Conformité", patterns: ["rgpd", "conformité", "compliance", "dpo"] },

  // 7. BTP, Architecture, Biologie, Chimie & Environnement
  { label: "Génie civil / BTP", patterns: ["génie civil", "btp", "bâtiment", "travaux publics", "gros oeuvre", "second oeuvre", "structure béton"] },
  { label: "Conduite de travaux", patterns: ["conduite de travaux", "conducteur de travaux", "suivi de chantier", "chantier", "OPC"] },
  { label: "Revit / BIM", patterns: ["revit", "bim", "archicad", "sketchup"] },
  { label: "Chiffrage & Métrés", patterns: ["chiffrage", "métré", "étude de prix", "appels d'offres", "cctp"] },
  { label: "Environnement & RSE", patterns: ["bilan carbone", "rse", "développement durable", "transition écologique", "environnement", "acv"] },
  { label: "Laboratoire / Biologie / Chimie", patterns: ["biologie", "chimie", "microbiologie", "hplc", "pcr", "analyse de laboratoire", "paillasse", "bpl"] },

  // 8. Soft Skills & Transversal
  { label: "Gestion de projet", patterns: ["gestion de projet", "chefferie de projet", "pilotage de projet", "planning", "agile", "scrum"] },
  { label: "Pack Office", patterns: ["pack office", "word", "powerpoint", "office 365", "google workspace"] },
  { label: "Anglais professionnel", patterns: ["anglais", "english", "toeic", "toefl", "bilingue"] },
  { label: "Relation client", patterns: ["relation client", "service client", "accueil", "satisfaction client"] },
];

