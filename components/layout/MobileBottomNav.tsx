"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import BottomSheet from "@/components/ui/BottomSheet";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Packages", href: "/packages" },
  { name: "Projects", href: "/projects" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        {/* Glassmorphism container */}
        <div className="mx-3 mb-3 rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-300/60 shadow-xl shadow-slate-900/10">
          <div className="flex items-center justify-between px-3 py-2">
            {/* Left items */}
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1 transition ${
                    isActive ? "text-indigo-600" : "text-slate-700 hover:text-indigo-600"
                  }`}
                >
                  <span className="text-[11px] font-medium">{item.name}</span>
                </Link>
              );
            })}

            {/* More Button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="flex flex-col items-center justify-center rounded-xl px-2.5 py-1 text-slate-700 hover:text-indigo-600 transition"
              aria-label="Open menu"
            >
              <svg className="h-5 w-5 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="text-[11px] font-medium">More</span>
            </button>
          </div>
        </div>

        {/* Center Floating Button — home icon + two-line label */}
        <Link
          href="/quote"
          className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-600/30 transition-transform hover:scale-110 active:scale-95"
          aria-label="Let's Build"
        >
          <svg className="h-4 w-4 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[7px] font-bold leading-tight text-center">Let's<br />Build</span>
        </Link>
      </nav>

      {/* Safe area spacer for notched devices */}
      <div className="h-14 md:hidden" />

      {/* Bottom Sheet Menu */}
      <BottomSheet isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}