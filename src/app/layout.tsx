import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StagePilot — Plateforme d'Automatisation de Recherche & Candidature de Stages",
  description:
    "Outil SaaS B2B de scraping d'offres via Browserbase, matching CV, candidature One-Click Gmail (maximenavellier12@gmail.com) et suivi CRM Google Sheets automatisé.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('stagepilot-theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#F9FAFB] text-[#111827] dark:bg-[#121212] dark:text-[#E5E7EB] transition-colors duration-150">
        {children}
      </body>
    </html>
  );
}
