"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import MobileBottomNav from "./MobileBottomNav";
import { getCompanyPublicData } from "@/app/dashboard/cms/actions";

const menus = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Packages", href: "/packages" },
  { name: "Projects", href: "/projects" },
  { name: "Blogs", href: "/blogs" },
  { name: "Refer & Earn", href: "/refer-and-earn" },
  { name: "Join Us", href: "/join-us" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [brandName, setBrandName] = useState("SBBT");
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    getCompanyPublicData().then(data => setBrandName(data.brand_name)).catch(() => {});
  }, []);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isHomePage ? "bg-transparent" : "border-b border-slate-200 bg-white/95 backdrop-blur-lg shadow-sm"
      }`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 md:px-6 md:py-3">
          <Link href="/" className={`font-semibold transition ${
            isHomePage ? "text-white text-xl md:text-2xl" : "text-slate-950 text-xl md:text-2xl"
          }`}>
            {brandName}
          </Link>

          <nav className="hidden gap-8 md:flex">
            {menus.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`font-medium transition ${
                    isActive
                      ? "text-indigo-600"
                      : isHomePage
                      ? "text-white/80 hover:text-white"
                      : "text-slate-700 hover:text-indigo-600"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/quote"
            className={`hidden rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 md:inline-block ${
              isHomePage ? "bg-white/20 backdrop-blur-sm" : ""
            }`}
          >
            Let's Build
          </Link>

          {/* Hamburger only visible on non-homepage for mobile */}
          {!isHomePage && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center rounded-lg p-1.5 text-slate-700 hover:bg-slate-100 md:hidden"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Mobile bottom nav spacer - always shown on mobile */}
      <div className="md:hidden">
        <MobileBottomNav />
      </div>
    </>
  );
}