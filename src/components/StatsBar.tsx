"use client";

import React from "react";
import { Send, Clock, CheckCircle2, BellRing, X } from "lucide-react";

export interface StatsBarProps {
  stats: {
    total: number;
    waiting: number;
    positive: number;
    refused: number;
    positiveUnreplied: number;
  };
  setActiveTab: (tab: "offers" | "crm" | "cron") => void;
  setCrmStatusFilter: (filter: string) => void;
}

export function StatsBar({ stats, setActiveTab, setCrmStatusFilter }: StatsBarProps) {
  return (
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div
            onClick={() => {
              setActiveTab("crm");
              setCrmStatusFilter("ALL");
            }}
            className="p-4 rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1E1E1E] shadow-sm hover:border-indigo-400 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              <span>Candidatures</span>
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <Send className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl font-bold text-[#111827] dark:text-white">
              {stats.total}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 truncate">
              Total envoyées / suivies
            </p>
          </div>

          <div
            onClick={() => {
              setActiveTab("crm");
              setCrmStatusFilter("En attente");
            }}
            className="p-4 rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1E1E1E] shadow-sm hover:border-amber-400 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              <span>Sans réponse</span>
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <Clock className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats.waiting}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 truncate">
              En attente de retour RH
            </p>
          </div>

          <div
            onClick={() => {
              setActiveTab("crm");
              setCrmStatusFilter("Entretien");
            }}
            className="p-4 rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1E1E1E] shadow-sm hover:border-emerald-400 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              <span>Réponses +</span>
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.positive}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 truncate">
              Entretiens / Retours positifs
            </p>
          </div>

          <div
            onClick={() => {
              setActiveTab("crm");
              setCrmStatusFilter("TO_REPLY");
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
              stats.positiveUnreplied > 0
                ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 dark:border-emerald-500/70"
                : "border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1E1E1E]"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
              <span>À répondre !</span>
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                <BellRing className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {stats.positiveUnreplied}
            </div>
            <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1 truncate">
              Réponse + non répondue
            </p>
          </div>

          <div
            onClick={() => {
              setActiveTab("crm");
              setCrmStatusFilter("Refus");
            }}
            className="p-4 rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1E1E1E] shadow-sm hover:border-rose-400 transition-all cursor-pointer col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              <span>Refus</span>
              <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                <X className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {stats.refused}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 truncate">
              Candidatures clôturées
            </p>
          </div>
        </section>
  );
}
