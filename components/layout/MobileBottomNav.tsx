"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import BottomSheet from "@/components/ui/BottomSheet";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Packages", href: "/packages" },
];

const moreItems = [
  { name: "Projects", href: "/projects" },
  { name: "More", href: "#" },
];

function NavIcon({ name, isActive }: { name: string; isActive: boolean }) {
  const color = isActive ? "text-emerald-600" : "text-slate-500";
  switch (name) {
    case "Home":
      return (
        <svg className={`h-5 w-5 ${color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    case "Packages":
      return (
        <svg className={`h-5 w-5 ${color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case "Projects":
      return (
        <svg className={`h-5 w-5 ${color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "More":
      return (
        <svg className="h-5 w-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="5" r="1.5" fill="currentColor" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <circle cx="12" cy="19" r="1.5" fill="currentColor" />
        </svg>
      );
    default:
      return null;
  }
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        <div className="mx-2 mb-2 rounded-2xl bg-white/75 backdrop-blur-2xl border border-white/40 shadow-2xl shadow-slate-900/5">
          <div className="flex items-center justify-around px-1" style={{ height: "58px" }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={[
                    "relative flex flex-col items-center justify-center rounded-xl px-2 py-1 transition-all duration-200 flex-1 min-w-0",
                    isActive ? "text-emerald-600" : "text-slate-500 hover:text-emerald-500",
                  ].join(" ")}
                >
                  <NavIcon name={item.name} isActive={isActive} />
                  <span className={[
                    "text-[9px] font-semibold tracking-tight mt-0.5 transition-colors",
                    isActive ? "text-emerald-600" : "text-slate-600",
                  ].join(" ")}>
                    {item.name}
                  </span>
                </Link>
              );
            })}

            {/* Center GET QUOTE Button */}
            <Link
              href="/quote"
              className="relative flex flex-col items-center justify-center flex-[1.2] min-w-0"
            >
              <div className="flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-transform duration-200 px-4 py-2.5">
                <span className="text-[11px] font-bold text-white tracking-tight">GET QUOTE</span>
              </div>
            </Link>

            {/* Projects */}
            <Link
              href="/projects"
              className={[
                "relative flex flex-col items-center justify-center rounded-xl px-2 py-1 transition-all duration-200 flex-1 min-w-0",
                pathname === "/projects" ? "text-emerald-600" : "text-slate-500 hover:text-emerald-500",
              ].join(" ")}
            >
              <svg className="h-5 w-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              <span className="text-[9px] font-semibold tracking-tight mt-0.5 text-slate-600">
                Projects
              </span>
            </Link>

            {/* More button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="relative flex flex-col items-center justify-center rounded-xl px-2 py-1 transition-all duration-200 flex-1 min-w-0"
              aria-label="Open menu"
            >
              <NavIcon name="More" isActive={false} />
              <span className="text-[9px] font-semibold tracking-tight mt-0.5 text-slate-600">
                More
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Safe area spacer */}
      <div className="h-[72px] md:hidden" />

      {/* Bottom Sheet Menu */}
      <BottomSheet isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}