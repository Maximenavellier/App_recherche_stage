# StagePilot — Plateforme Cloud de Recherche & Candidature de Stages

Assistant personnel de placement B2B automatisé conçu pour **Maxime Navellier** (`maximenavellier12@gmail.com`).

## Architecture & Fonctionnalités

1. **Moteur de Scraping & Matching (`/api/scrape`)** :
   - Import de CV au format PDF (`.pdf`) ou texte avec extraction automatique des compétences.
   - Intégration Browserbase + indexation multi-sources (Welcome to the Jungle, HelloWork, ADEO Careers, JobTeaser, LinkedIn).
   - Calcul du score de compatibilité (%) et mise en évidence des compétences exigées matchées avec le profil.

2. **Système de Candidature "One-Click" (`/api/apply`)** :
   - Croisement automatique de l'offre (missions, compétences exigées, entreprise) et du CV du candidat.
   - Rédaction instantanée d'une **Lettre de Motivation** et d'un **Mail personnalisé**.
   - Envoi via le compte Gmail `maximenavellier12@gmail.com`.

3. **CRM Automatisé Google Sheets (`/api/crm`)** :
   - Synchronisé avec le Google Sheet : [CRM Candidatures Stages - Maxime Navellier](https://docs.google.com/spreadsheets/d/1JBLOBGtfYxMZPLlZUyLM1ZqAMwzZ-V4msZkr6KveBcY/edit) (`1JBLOBGtfYxMZPLlZUyLM1ZqAMwzZ-V4msZkr6KveBcY`).
   - Colonnes : `Entreprise`, `Poste`, `Date d'envoi`, `Lien de l'offre`, `Statut` (`Envoyé`, `En attente`, `Entretien`, `Refus`), `Date de réponse`, `Email Destinataire`.

4. **Routine de Suivi Nocturne (`23h50` CRON — `/api/cron/nightly-sync`)** :
   - Exécution quotidienne à **23h50 (`Europe/Paris`)**.
   - Analyse les réponses reçues sur `maximenavellier12@gmail.com` et met à jour le Google Sheet avec le statut (`Refus`, `Entretien`, `En attente`) et la date de réponse.

5. **Design & UI/UX B2B** :
   - Style minimaliste, professionnel et utilitaire (zéro dégradé, zéro effet néon).
   - Support natif **Mode Clair** (`#F9FAFB` / `#111827`) et **Mode Sombre** (`#121212` / `#1E1E1E` / `#E5E7EB`) avec bouton switch et synchronisation OS.
