import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MobileBrandHeader from "@/components/layout/MobileBrandHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Shree Badree Build Tech Pvt Ltd | Premium Construction Company",
    template: "%s | SBBT Construction",
  },
  description:
    "Premium residential and commercial construction company in Delhi NCR. Turnkey construction, interior design, and renovation services with transparent pricing and quality materials.",
  keywords: [
    "construction company",
    "residential construction",
    "turnkey construction",
    "home builder",
    "Delhi NCR construction",
    "SBBT",
    "Shree Badree Build Tech",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Shree Badree Build Tech Pvt Ltd",
    title: "Shree Badree Build Tech Pvt Ltd | Premium Construction Company",
    description:
      "Premium residential and commercial construction with transparent pricing and quality materials. Serving Delhi NCR since 2011.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SBBT Construction",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shree Badree Build Tech Pvt Ltd",
    description:
      "Premium residential and commercial construction company in Delhi NCR.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  metadataBase: new URL("https://www.sbbt.in"),
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col">
        {/* Skip to content link for keyboard users */}
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <MobileBrandHeader />
        <main id="main-content" className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}