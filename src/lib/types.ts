export type ContractTypeFilter = "STAGE_ONLY" | "STAGE_AND_ALTERNANCE" | "ALTERNANCE_ONLY";
export type OfferContractType = "Stage" | "Alternance";

export type ApplicationStatus = "Envoyé" | "En attente" | "Entretien" | "Refus";

export type WorkMode = "Présentiel" | "Hybride / Télétravail" | "Télétravail complet";

export interface JobOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  date: string;
  duration: string;
  durationMonths?: number;
  studyLevel?: string;
  workMode?: WorkMode;
  remuneration?: string;
  remunerationMin?: number;
  isRemunerationEstimated?: boolean;
  perks?: string[];
  url: string;
  source:
    | "Welcome to the Jungle"
    | "HelloWork"
    | "LinkedIn"
    | "LinkedIn Jobs (Live)"
    | "JobTeaser"
    | "ADEO Careers"
    | "Browserbase Live"
    | string;
  contactEmail: string;
  emailVerified?: boolean;
  applyMethod?: "email_direct" | "portal_and_email";
  domainCategory?: string;
  requiredSkills: string[];
  missions: string[];
  description: string;
  matchScore?: number;
  matchedSkills?: string[];
  contractType?: OfferContractType;
  companyGroup?: string;
  isTopDataEmployer?: boolean;
  perksDetailed?: {
    meal?: string;
    transport?: string;
    bonus?: string;
    cse?: string;
    remote?: string;
    hiring?: string;
  };
  mergedSources?: string[];
}

export interface SearchFilters {
  city: string;
  radiusKm: number;
  durationFilter: "ALL" | "1-2" | "3-4" | "5-6";
  studyLevelFilter: "ALL" | "BAC+2" | "BAC+3" | "BAC+4" | "BAC+5";
  workModeFilter: "ALL" | "Présentiel" | "Hybride / Télétravail" | "Télétravail complet";
  minRemuneration: number;
  requiredPerk: string;
  maxOffers: number;
  onlyVerifiedEmails: boolean;
  onlyFavorites: boolean;
  contractTypeFilter: ContractTypeFilter;
}

export interface CandidateProfile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  education: string;
  targetRole: string;
  availability: string;
  keywords: string[];
  cvFileName?: string;
  cvRawText: string;
}

export interface UserWorkspaceConfig {
  fullName: string;
  email: string;
  googleSheetUrl: string;
  googleSheetId: string;
  googleAppsScriptWebhookUrl: string;
  autoMailScanEnabled: boolean;
}

export interface CrmEntry {
  id: string;
  rowNumber?: number;
  company: string;
  role: string;
  sentDate: string;
  offerUrl: string;
  status: ApplicationStatus;
  responseDate: string;
  recipientEmail: string;
  repliedToPositive?: boolean;
  remuneration?: string;
  location?: string;
  notes?: string;
}

export interface GeneratedApplication {
  offerId: string;
  company: string;
  role: string;
  recipientEmail: string;
  subject: string;
  emailBody: string;
  coverLetter: string;
}

export interface NightlySyncLog {
  timestamp: string;
  scannedMessages: number;
  updatedRows: Array<{
    company: string;
    role: string;
    previousStatus: ApplicationStatus;
    newStatus: ApplicationStatus;
    responseDate: string;
    emailSubject: string;
    snippet: string;
  }>;
  summary: string;
}

export const DEFAULT_FILTERS: SearchFilters = {
  city: "Lille / Hauts-de-France (Priorité) + France",
  radiusKm: 25,
  durationFilter: "ALL",
  studyLevelFilter: "ALL",
  workModeFilter: "ALL",
  minRemuneration: 0,
  requiredPerk: "ALL",
  maxOffers: 35,
  onlyVerifiedEmails: false,
  onlyFavorites: false,
  contractTypeFilter: "STAGE_ONLY",
};

export function getSourceBadgeStyle(source: string): { label: string; classes: string } {
  const s = (source || "").toLowerCase();
  if (s.includes("welcome") || s.includes("wttj")) {
    return {
      label: "🌟 Welcome to the Jungle",
      classes:
        "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/60",
    };
  }
  if (s.includes("mulliez") || s.includes("afm")) {
    return {
      label: "🏢 Portail Galaxie Mulliez / AFM",
      classes:
        "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700/60",
    };
  }
  if (s.includes("banque") || s.includes("assurance")) {
    return {
      label: "🏦 Portail Banques & Assurances",
      classes:
        "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/60",
    };
  }
  if (s.includes("1jeune") || s.includes("gouv")) {
    return {
      label: "🇫🇷 1jeune1solution.gouv",
      classes:
        "bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700/60",
    };
  }
  if (s.includes("stage.fr")) {
    return {
      label: "🎓 Stage.fr",
      classes:
        "bg-violet-50 text-violet-800 border-violet-300 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-700/60",
    };
  }
  if (s.includes("indeed")) {
    return {
      label: "🔎 Indeed",
      classes:
        "bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-700/60",
    };
  }
  if (s.includes("linkedin")) {
    return {
      label: "💼 LinkedIn Jobs",
      classes:
        "bg-indigo-50 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-700/60",
    };
  }
  return {
    label: `🌐 ${source}`,
    classes:
      "bg-teal-50 text-teal-800 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-700/60",
  };
}

