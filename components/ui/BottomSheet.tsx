"use client";

import { useEffect } from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Blogs", href: "/blogs" },
  { name: "Refer & Earn", href: "/refer-and-earn" },
  { name: "Join Us", href: "/join-us" },
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Terms", href: "/terms" },
];

export default function BottomSheet({ isOpen, onClose }: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-50 md:hidden"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden animate-slide-up">
        <div className="bg-white/95 backdrop-blur-xl border-t border-slate-200 rounded-t-3xl shadow-2xl">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 pb-4 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">Menu</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              aria-label="Close menu"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menu Items */}
          <div className="px-4 py-4 space-y-1">
            {MENU_ITEMS.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={onClose}
                className="flex items-center px-4 py-3.5 rounded-xl text-slate-700 font-medium hover:bg-slate-100 transition"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}