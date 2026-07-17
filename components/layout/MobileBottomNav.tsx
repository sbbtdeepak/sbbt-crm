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
        <div className="mx-4 mb-4 rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-300/60 shadow-xl shadow-slate-900/10">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left items */}
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center justify-center rounded-xl px-3 py-2 transition ${
                    isActive ? "text-indigo-600" : "text-slate-700 hover:text-indigo-600"
                  }`}
                >
                  <span className="text-xs font-medium">{item.name}</span>
                </Link>
              );
            })}

            {/* More Button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="flex flex-col items-center justify-center rounded-xl px-3 py-2 text-slate-700 hover:text-indigo-600 transition"
              aria-label="Open menu"
            >
              <svg className="h-5 w-5 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="text-xs font-medium">More</span>
            </button>
          </div>
        </div>

        {/* Center Floating Button */}
        <Link
          href="/quote"
          className="absolute -top-6 left-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-600/30 transition-transform hover:scale-110 active:scale-95"
          aria-label="Let's Build"
        >
          <span className="text-xs font-semibold">Build</span>
        </Link>
      </nav>

      {/* Bottom Sheet Menu */}
      <BottomSheet isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}