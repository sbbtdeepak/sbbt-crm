"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Packages", href: "/packages" },
  { name: "Projects", href: "/projects" },
  { name: "Contact", href: "/contact" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 mx-4 mb-4 rounded-2xl bg-white/80 backdrop-blur-lg shadow-lg border border-slate-200/50 md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center rounded-xl p-2 transition ${
                isActive ? "text-indigo-600" : "text-slate-600 hover:text-indigo-600"
              }`}
            >
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}

        {/* Center Floating Button */}
        <Link
          href="/quote"
          className="absolute -top-6 left-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-600/30 transition-transform hover:scale-110 active:scale-95"
          aria-label="Let's Build"
        >
          <span className="text-xs font-semibold">Build</span>
        </Link>
      </div>
    </nav>
  );
}