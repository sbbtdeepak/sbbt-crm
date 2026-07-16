"use client";

import type { MouseEventHandler } from "react";

interface DashboardHeaderProps {
  title: string;
  onMenuClick: MouseEventHandler<HTMLButtonElement>;
}

export default function DashboardHeader({ title, onMenuClick }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="Open sidebar"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        <div className="text-base font-semibold text-slate-900 sm:text-lg">{title}</div>

        <div className="hidden items-center gap-3 sm:flex">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            Dashboard
          </span>
        </div>
      </div>
    </header>
  );
}
