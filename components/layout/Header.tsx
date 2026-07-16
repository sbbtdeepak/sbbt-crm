import Link from "next/link";

const menus = [
  { name: "Home", href: "/" },
  { name: "Packages", href: "#packages" },
  { name: "Projects", href: "#projects" },
  { name: "Testimonials", href: "#testimonials" },
  { name: "Blogs", href: "#blogs" },
  { name: "Contact", href: "#footer" },
];

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b">

      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        <Link
          href="/"
          className="text-2xl font-bold text-indigo-700"
        >
          SBBT
        </Link>

        <nav className="hidden gap-8 md:flex">

          {menus.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="font-medium text-gray-700 transition hover:text-indigo-600"
            >
              {item.name}
            </a>
          ))}

        </nav>

        <Link
          href="/quote"
          className="rounded-lg bg-green-600 px-5 py-3 text-white hover:bg-green-700"
        >
          Get Quote
        </Link>

      </div>

    </header>
  );
}