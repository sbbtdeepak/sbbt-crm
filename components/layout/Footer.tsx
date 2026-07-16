import Link from "next/link";

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
            <li>
              <a href="/" className="transition hover:text-indigo-600">Home</a>
            </li>
            <li>
              <a href="#packages" className="transition hover:text-indigo-600">Packages</a>
            </li>
            <li>
              <a href="#projects" className="transition hover:text-indigo-600">Projects</a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Contact
          </h3>
          <p className="text-slate-600">Delhi NCR</p>
          <p className="mt-2 text-slate-600">info@sbbt.in</p>
          <p className="mt-2 text-slate-600">+91 XXXXX XXXXX</p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Quick Links
          </h3>
          <Link href="/admin" className="block text-slate-600 transition hover:text-indigo-600">
            Admin Login
          </Link>
          <Link href="/quote" className="mt-3 inline-block rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500">
            Get Quote
          </Link>
        </div>
      </div>

      <div className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">

        © 2026 Shree Badree Build Tech Pvt Ltd

      </div>

    </footer>
  );
}