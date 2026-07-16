import Link from "next/link";

export default function Footer() {
  return (
    <footer
      id="footer"
      className="bg-gray-900 text-white"
    >

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-4">

        <div>

          <h2 className="text-2xl font-bold">
            SBBT
          </h2>

          <p className="mt-4 text-gray-300">
            Shree Badree Build Tech Pvt Ltd
          </p>

          <p className="mt-2 text-gray-400">
            Premium Residential Construction
          </p>

        </div>

        <div>

          <h3 className="mb-4 font-bold">
            Company
          </h3>

          <ul className="space-y-3 text-gray-300">

            <li>
              <a href="/">Home</a>
            </li>

            <li>
              <a href="#packages">Packages</a>
            </li>

            <li>
              <a href="#projects">Projects</a>
            </li>

          </ul>

        </div>

        <div>

          <h3 className="mb-4 font-bold">
            Contact
          </h3>

          <p>Delhi NCR</p>

          <p className="mt-2">
            info@sbbt.in
          </p>

          <p className="mt-2">
            +91 XXXXX XXXXX
          </p>

        </div>

        <div>

          <h3 className="mb-4 font-bold">
            Quick Links
          </h3>

          <Link
            href="/admin"
            className="block"
          >
            Admin Login
          </Link>

          <Link
            href="/quote"
            className="mt-3 block"
          >
            Get Quote
          </Link>

        </div>

      </div>

      <div className="border-t border-gray-800 py-6 text-center text-sm text-gray-400">

        © 2026 Shree Badree Build Tech Pvt Ltd

      </div>

    </footer>
  );
}