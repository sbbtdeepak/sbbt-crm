"use client";

import Link from "next/link";

const companyLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Packages", href: "/packages" },
  { name: "Projects", href: "/projects" },
  { name: "Blogs", href: "/blogs" },
  { name: "Refer & Earn", href: "/refer-and-earn" },
  { name: "Join Us", href: "/join-us" },
  { name: "Contact", href: "/contact" },
];

const legalLinks = [
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms & Conditions", href: "/terms" },
  { name: "Refund Policy", href: "/refund" },
  { name: "Cancellation Policy", href: "/cancellation" },
  { name: "Disclaimer", href: "/disclaimer" },
  { name: "Cookie Policy", href: "/cookies" },
  { name: "Sitemap", href: "/sitemap" },
];

export default function Footer() {
  return (
    <footer id="footer" className="bg-white text-slate-900">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">SBBT</h2>
          <p className="mt-4 text-slate-600">Shree Badree Build Tech Pvt Ltd</p>
          <p className="mt-2 text-slate-500">Premium Residential Construction</p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Company
          </h3>
          <ul className="space-y-3 text-slate-600">
            {companyLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href} className="transition hover:text-indigo-600">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Legal
          </h3>
          <ul className="space-y-3 text-slate-600">
            {legalLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href} className="transition hover:text-indigo-600">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Contact
          </h3>
          <p className="text-slate-600">Delhi NCR</p>
          <p className="mt-2 text-slate-600">info@sbbt.in</p>
          <p className="mt-2 text-slate-600">+91 XXXXX XXXXX</p>
          <Link
            href="/quote"
            className="mt-4 inline-block rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Let's Build
          </Link>
        </div>
      </div>

      <div className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        &copy; 2026 Shree Badree Build Tech Pvt Ltd
      </div>
    </footer>
  );
}