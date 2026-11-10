export type ApplicationStatus = "Envoyé" | "En attente" | "Entretien" | "Refus";

export interface JobOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  date: string;
  duration: string;
  remuneration?: string;
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
  requiredSkills: string[];
  missions: string[];
  description: string;
  matchScore?: number;
  matchedSkills?: string[];
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
