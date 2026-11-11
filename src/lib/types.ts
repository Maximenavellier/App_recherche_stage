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
