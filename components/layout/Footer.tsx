"use client";

import Link from "next/link";

const servicesLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Packages", href: "/packages" },
  { name: "Projects", href: "/projects" },
  { name: "Blogs", href: "/blogs" },
  { name: "Refer & Earn", href: "/refer-and-earn" },
  { name: "Join Us", href: "/join-us" },
];

const legalLinks = [
  { name: "Privacy", href: "/privacy" },
  { name: "Terms", href: "/terms" },
  { name: "Refund", href: "/refund" },
  { name: "Cancellation", href: "/cancellation" },
  { name: "Cookies", href: "/cookies" },
];

export default function Footer() {
  return (
    <footer id="footer" className="bg-white text-slate-900 border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5">
        {/* 3 columns - both mobile and desktop */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {/* Column 1: Company + Social */}
          <div className="col-span-1">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="h-5 w-5 rounded bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-[10px]">S</span>
              </div>
              <span className="text-xs font-semibold text-slate-950">SBBT</span>
            </div>
            <p className="text-[9px] text-slate-500 mb-1.5">
              Shree Badree Build Tech Pvt Ltd
            </p>
            <div className="flex gap-1">
              <a href="#" aria-label="Facebook" className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-indigo-100 hover:text-indigo-600">
                <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
              </a>
              <a href="#" aria-label="Instagram" className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-indigo-100 hover:text-indigo-600">
                <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.784.013 3.807.058.975.045 1.504.207 1.857.344.467.182.8.398 1.15.748.35.35.683.566 1.15.748.137.353.3.882.344 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.643 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748a3.098 3.098 0 001.153-1.772 3.097 3.097 0 01-1.153-1.772 3.098 3.098 0 00-1.15-.915.636-.247 1.363-.416 2.427-.465 1.067-.048 1.407-.06 4.123-.06h-.08c2.597 0 2.917.01 3.96.058.976.045 1.505.207 1.858.344.466.182.8.398 1.15.748.35.35.683.566 1.15.748.137.353.3.882.344 1.857.344 1.024.047 1.351.058 3.807.058v.08c0 2.426-.01 2.784-.058 3.807-.044.975-.206 1.504-.343 1.857-.182.466-.398.8-.748 1.15-.35.35-.683.566-1.15.748-.353.137-.882.3-1.857.344-1.024.048-1.351.058-3.807.058h-.63c-2.43 0-2.784-.013-3.807-.058-.975-.045-1.504-.207-1.857-.344-.466-.182-.8-.398-1.15-.748-.35-.35-.566-.683-.748-1.15-.137-.353-.3-.882-.344-1.857-.047-1.024-.058-1.37-.058-4.123v-.08c0-2.643.011-2.784.058-3.807.045-1.023.207-1.504.344-1.857.182-.466.398-.8.748-1.15.35-.35.683-.566 1.15-.748.353-.137.882-.3 1.857-.344 1.055-.048 1.407-.06 4.123-.06zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/></svg>
              </a>
              <a href="#" aria-label="YouTube" className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-indigo-100 hover:text-indigo-600">
                <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-indigo-100 hover:text-indigo-600">
                <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.564v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Company Links */}
          <div>
            <h3 className="text-[8px] font-semibold uppercase tracking-[0.15em] text-indigo-600 mb-1">Company</h3>
            <div className="flex flex-col gap-0">
              {servicesLinks.map((link) => (
                <Link key={link.name} href={link.href} className="text-[9px] text-slate-500 transition hover:text-indigo-600">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3 className="text-[8px] font-semibold uppercase tracking-[0.15em] text-indigo-600 mb-1">Contact</h3>
            <div className="flex flex-col gap-0 text-[9px] text-slate-500">
              <p>+91 XXXXX XXXXX</p>
              <p>info@sbbt.in</p>
              <p>Delhi NCR</p>
              <a href="#" className="text-emerald-600 hover:text-emerald-700 transition">WhatsApp</a>
            </div>
          </div>
        </div>

        {/* Legal links row - compact */}
        <div className="mt-2 flex flex-wrap justify-center gap-x-1.5 gap-y-0 border-t border-slate-100 pt-1.5">
          {legalLinks.map((link) => (
            <Link key={link.name} href={link.href} className="text-[8px] text-slate-400 transition hover:text-indigo-600">
              {link.name}
            </Link>
          ))}
        </div>

        <p className="mt-1.5 text-center text-[8px] text-slate-400">
          &copy; 2026 Shree Badree Build Tech Pvt Ltd
        </p>
      </div>
    </footer>
  );
}