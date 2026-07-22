"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCompanyPublicData } from "@/app/dashboard/cms/actions";
import type { CompanyPublicData } from "@/app/dashboard/cms/actions";

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
  const [company, setCompany] = useState<CompanyPublicData | null>(null);

  useEffect(() => {
    getCompanyPublicData().then(setCompany).catch(() => {});
  }, []);

  const brandName = company?.brand_name || "SBBT";
  const legalName = company?.legal_name || "Shree Badree Build Tech Pvt Ltd";
  const phone = company?.phone || "+91 XXXXX XXXXX";
  const email = company?.email || "info@sbbt.in";
  const address = company?.address || "Delhi NCR";
  const logoUrl = company?.logo_url || "";

  return (
    <footer id="footer" className="bg-white text-slate-900 border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Desktop: 3-column grid (unchanged) */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-8">
          {/* Column 1: Company + Social */}
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 mb-2">
              {logoUrl ? (
                <img src={logoUrl} alt={brandName} className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{brandName.charAt(0)}</span>
                </div>
              )}
              <span className="text-base font-semibold text-slate-950">{brandName}</span>
            </div>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              {legalName}
            </p>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              {address}
            </p>
            <div className="flex gap-2">
              <a href="#" aria-label="Facebook" className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-indigo-100 hover:text-indigo-600">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
              </a>
              <a href="#" aria-label="Instagram" className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-indigo-100 hover:text-indigo-600">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.784.013 3.807.058.975.045 1.504.207 1.857.344.467.182.8.398 1.15.748.35.35.683.566 1.15.748.137.353.3.882.344 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.643 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748a3.098 3.098 0 001.153-1.772 3.097 3.097 0 01-1.153-1.772 3.098 3.098 0 00-1.15-.915.636-.247 1.363-.416 2.427-.465 1.067-.048 1.407-.06 4.123-.06h-.08c2.597 0 2.917.01 3.96.058.976.045 1.505.207 1.858.344.466.182.8.398 1.15.748.35.35.683.566 1.15.748.137.353.3.882.344 1.857.344 1.024.047 1.351.058 3.807.058v.08c0 2.426-.01 2.784-.058 3.807-.044.975-.206 1.504-.343 1.857-.182.466-.398.8-.748 1.15-.35.35-.683.566-1.15.748-.353.137-.882.3-1.857.344-1.024.048-1.351.058-3.807.058h-.63c-2.43 0-2.784-.013-3.807-.058-.975-.045-1.504-.207-1.857-.344-.466-.182-.8-.398-1.15-.748-.35-.35-.566-.683-.748-1.15-.137-.353-.3-.882-.344-1.857-.047-1.024-.058-1.37-.058-4.123v-.08c0-2.643.011-2.784.058-3.807.045-1.023.207-1.504.344-1.857.182-.466.398-.8.748-1.15.35-.35.683-.566 1.15-.748.353-.137.882-.3 1.857-.344 1.055-.048 1.407-.06 4.123-.06zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/></svg>
              </a>
              <a href="#" aria-label="YouTube" className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-indigo-100 hover:text-indigo-600">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-indigo-100 hover:text-indigo-600">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.564v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Company Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-3">Quick Links</h3>
            <div className="flex flex-col gap-1.5">
              {servicesLinks.map((link) => (
                <Link key={link.name} href={link.href} className="text-sm text-slate-600 transition hover:text-indigo-600">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-3">Contact</h3>
            <div className="flex flex-col gap-1.5 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <svg className="h-4 w-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                {phone}
              </p>
              <p className="flex items-center gap-2">
                <svg className="h-4 w-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                {email}
              </p>
              {company?.whatsapp && (
                <a href={`https://wa.me/${company.whatsapp.replace(/\D/g, '')}`} className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Mobile: Row-based layout */}
        <div className="flex flex-col items-center text-center gap-5 sm:hidden">
          {/* ROW 1: Logo + Company */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 mb-1">
              {logoUrl ? (
                <img src={logoUrl} alt={brandName} className="h-10 w-10 rounded-xl object-cover" />
              ) : (
                <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{brandName.charAt(0)}</span>
                </div>
              )}
              <span className="text-lg font-bold text-slate-950">{brandName}</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">{legalName}</p>
            <p className="text-xs text-slate-500 max-w-xs">{address}</p>
          </div>

          {/* Separator */}
          <div className="w-16 h-px bg-slate-200" />

          {/* ROW 2: Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-2">Quick Links</h3>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5">
              {servicesLinks.map((link) => (
                <Link key={link.name} href={link.href} className="text-sm text-slate-600 transition hover:text-indigo-600">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Separator */}
          <div className="w-16 h-px bg-slate-200" />

          {/* ROW 3: Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-2">Contact</h3>
            <div className="flex flex-col items-center gap-1.5 text-sm text-slate-600">
              <p>{phone}</p>
              <p>{email}</p>
              {company?.whatsapp && (
                <a href={`https://wa.me/${company.whatsapp.replace(/\D/g, '')}`} className="text-emerald-600 hover:text-emerald-700 transition font-medium">
                  WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* ROW 4: Social Icons */}
          <div className="flex gap-3">
            <a href="#" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-indigo-100 hover:text-indigo-600">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
            </a>
            <a href="#" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-indigo-100 hover:text-indigo-600">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.784.013 3.807.058.975.045 1.504.207 1.857.344.467.182.8.398 1.15.748.35.35.683.566 1.15.748.137.353.3.882.344 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.643 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748a3.098 3.098 0 001.153-1.772 3.097 3.097 0 01-1.153-1.772 3.098 3.098 0 00-1.15-.915.636-.247 1.363-.416 2.427-.465 1.067-.048 1.407-.06 4.123-.06h-.08c2.597 0 2.917.01 3.96.058.976.045 1.505.207 1.858.344.466.182.8.398 1.15.748.35.35.683.566 1.15.748.137.353.3.882.344 1.857.344 1.024.047 1.351.058 3.807.058v.08c0 2.426-.01 2.784-.058 3.807-.044.975-.206 1.504-.343 1.857-.182.466-.398.8-.748 1.15-.35.35-.683.566-1.15.748-.353.137-.882.3-1.857.344-1.024.048-1.351.058-3.807.058h-.63c-2.43 0-2.784-.013-3.807-.058-.975-.045-1.504-.207-1.857-.344-.466-.182-.8-.398-1.15-.748-.35-.35-.566-.683-.748-1.15-.137-.353-.3-.882-.344-1.857-.047-1.024-.058-1.37-.058-4.123v-.08c0-2.643.011-2.784.058-3.807.045-1.023.207-1.504.344-1.857.182-.466.398-.8.748-1.15.35-.35.683-.566 1.15-.748.353-.137.882-.3 1.857-.344 1.055-.048 1.407-.06 4.123-.06zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/></svg>
            </a>
            <a href="#" aria-label="YouTube" className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-indigo-100 hover:text-indigo-600">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            <a href="#" aria-label="LinkedIn" className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-indigo-100 hover:text-indigo-600">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.564v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          </div>
        </div>

        {/* Legal links row - shared */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap justify-center gap-x-3 gap-y-1">
          {legalLinks.map((link) => (
            <Link key={link.name} href={link.href} className="text-xs text-slate-400 transition hover:text-indigo-600">
              {link.name}
            </Link>
          ))}
        </div>

        <p className="mt-3 text-center text-xs text-slate-400">
          &copy; 2026 {legalName}
        </p>
      </div>
    </footer>
  );
}