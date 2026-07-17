"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import MobileBottomNav from "./MobileBottomNav";

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
  const pathname = usePathname();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-lg shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-semibold text-slate-950">
            SBBT
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
            className="hidden rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 md:inline-block"
          >
            Let's Build
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
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
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 md:hidden ${
          mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        <div
          className={`absolute left-0 top-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
            <span className="text-xl font-semibold text-slate-950">SBBT</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col gap-2 p-4">
            {menus.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-lg px-4 py-3 text-base font-medium transition ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
            <div className="mt-4 border-t border-slate-200 pt-4">
              <Link
                href="/quote"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-full bg-emerald-600 px-4 py-3 text-center font-semibold text-white"
              >
                Let's Build
              </Link>
            </div>
          </nav>
        </div>
      </div>

      <div className="md:hidden">
        <MobileBottomNav />
      </div>
    </>
  );
}