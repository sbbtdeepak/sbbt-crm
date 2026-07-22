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
  const [brandName, setBrandName] = useState("SBBT");
  const [logoUrl, setLogoUrl] = useState("");
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    getCompanyPublicData().then(data => {
      setBrandName(data.brand_name);
      setLogoUrl(data.logo_url || "");
    }).catch(() => {});
  }, []);

  return (
    <>
      {/* Desktop-only glass strip header */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 mt-3">
          <div
            className={[
              "flex items-center justify-between px-5 py-2.5 rounded-2xl backdrop-blur-xl shadow-lg shadow-black/10",
              isHomePage
                ? "bg-white/85 border border-white/30"
                : "bg-white/90 border border-slate-200/60",
            ].join(" ")}
          >
            {/* Logo - left */}
            <Link
              href="/"
              className="flex items-center gap-2 flex-shrink-0"
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={brandName}
                  className="h-8 w-8 rounded-lg object-cover ring-2 ring-slate-100"
                />
              ) : (
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">{brandName?.charAt(0) || "S"}</span>
                </div>
              )}
              <span className="font-bold text-xl tracking-tight text-slate-900">{brandName}</span>
            </Link>

            {/* Navigation - centered */}
            <nav className="flex items-center justify-center gap-0.5 flex-1 px-4">
              {menus.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={[
                      "px-3.5 py-2 text-sm font-medium rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "text-slate-800 hover:text-white hover:bg-indigo-600/90 hover:shadow-md",
                    ].join(" ")}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* CTA - right */}
            <Link
              href="/quote"
              className="flex-shrink-0 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-600/30 active:scale-95"
            >
              {`Let\u2019s Build`}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <div className="md:hidden">
        <MobileBottomNav />
      </div>
    </>
  );
}