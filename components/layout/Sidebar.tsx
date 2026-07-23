"use client";

import Link from "next/link";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "CMS", href: "/dashboard/cms" },
  { name: "Master Data", href: "/dashboard/master-data" },
  { name: "Packages", href: "/dashboard/packages" },
  { name: "Projects", href: "/dashboard/projects" },
  { name: "Leads", href: "/dashboard/leads" },
  { name: "Estimate Engine", href: "/dashboard/estimate-engine" },
  { name: "Quotations", href: "/dashboard/quotations" },
  { name: "Testimonials", href: "/dashboard/testimonials" },
  { name: "Blogs", href: "/dashboard/blogs" },
  { name: "SEO", href: "/dashboard/seo" },
  { name: "Media", href: "/dashboard/media" },
  { name: "Settings", href: "/dashboard/settings" },
  { name: "Profile", href: "/dashboard/profile" },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <span className="text-xl font-bold text-gray-900">SBBT Admin</span>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition"
              >
                {item.name}
              </Link>
            ))}
            <button
              className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition"
              onClick={() => {
                // Logout logic to be implemented
                window.location.href = "/admin";
              }}
            >
              Logout
            </button>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-white lg:shadow-lg lg:block">
        <div className="flex flex-col h-full">
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <span className="text-xl font-bold text-gray-900">SBBT Admin</span>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition"
              >
                {item.name}
              </Link>
            ))}
            <button
              className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition"
              onClick={() => {
                // Logout logic to be implemented
                window.location.href = "/admin";
              }}
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
    </>
  );
}
