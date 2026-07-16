import Link from "next/link";

const menus = [
  { name: "Home", href: "/" },
  { name: "Packages", href: "/packages" },
  { name: "Projects", href: "/projects" },
  { name: "Testimonials", href: "/#testimonials" },
  { name: "Blogs", href: "/#blogs" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-lg shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        <Link href="/" className="text-2xl font-semibold text-slate-950">
          SBBT
        </Link>

        <nav className="hidden gap-8 md:flex">
          {menus.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="font-medium text-slate-700 transition hover:text-indigo-600"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <Link
          href="/quote"
          className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
        >
          Get Quote
        </Link>

      </div>

    </header>
  );
}