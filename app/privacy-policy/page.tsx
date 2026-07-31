import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/shared/PageHero";
import CTA from "@/components/home/CTA";

export const metadata: Metadata = {
  title: "Privacy Policy | Shree Badree Build Tech Pvt. Ltd.",
  description:
    "Learn how Shree Badree Build Tech Pvt. Ltd. (SBBT) collects, uses, and protects your personal information. Our privacy policy covers data collection, usage, and your rights under Indian law.",
  alternates: {
    canonical: "https://sbbt.in/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <PageHero title="Privacy Policy" subtitle="How Shree Badree Build Tech Pvt. Ltd. collects, uses, and protects your personal information." />

      {/* Main Content */}
      <section className="bg-white py-10">
        <div className="mx-auto max-w-4xl px-6">
          <div className="prose prose-sm prose-slate max-w-none">
            <h2 className="text-lg font-bold text-slate-900 mb-4">1. Introduction</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              Shree Badree Build Tech Pvt. Ltd. (&ldquo;SBBT,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to safeguarding your privacy. This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you visit our website, fill out our contact forms, or engage our construction and interior design services.
            </p>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              By using our website and services, you consent to the practices described in this policy. If you do not agree with any part of this policy, please refrain from using our website or providing your personal information.
            </p>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">2. Information We Collect</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              We may collect the following types of information:
            </p>
            <ul className="list-disc pl-5 text-slate-600 text-xs space-y-1.5 mb-4">
              <li><strong>Personal Identification Information:</strong> Name, email address, phone number, mailing address, and property location details provided through our contact forms, quote requests, or referral programs.</li>
              <li><strong>Project Information:</strong> Details about your construction project, plot location, budget preferences, and requirements shared during consultations.</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information, pages visited, and time spent on our website collected through cookies and analytics tools.</li>
              <li><strong>Communication Data:</strong> Records of emails, phone calls, and messages exchanged with our team.</li>
            </ul>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">3. How We Use Your Information</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc pl-5 text-slate-600 text-xs space-y-1.5 mb-4">
              <li>To respond to your inquiries, quote requests, and service bookings.</li>
              <li>To provide and manage construction, interior design, and renovation services.</li>
              <li>To communicate project updates, timelines, and site visit schedules.</li>
              <li>To improve our website, services, and customer experience.</li>
              <li>To send promotional offers, newsletters, and referral program updates (with your consent).</li>
              <li>To comply with legal obligations and regulatory requirements under Indian law.</li>
            </ul>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">4. Data Sharing and Disclosure</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information with:
            </p>
            <ul className="list-disc pl-5 text-slate-600 text-xs space-y-1.5 mb-4">
              <li><strong>Service Providers:</strong> Trusted third-party vendors who assist us in operating our website, processing data, and delivering services (e.g., hosting, analytics, email delivery).</li>
              <li><strong>Legal Authorities:</strong> When required by law, court order, or government regulation to comply with legal processes.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the business transaction.</li>
            </ul>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">5. Data Retention</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              We retain your personal information only as long as necessary to fulfil the purposes outlined in this policy, or as required by applicable Indian laws. When the retention period expires, your data will be securely deleted or anonymised.
            </p>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">6. Data Security</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              We implement reasonable technical and organisational security measures to protect your personal information from unauthorised access, alteration, disclosure, or destruction. These include encrypted data transmission, secure server infrastructure, and access controls. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security.
            </p>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">7. Your Rights</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              Under the Information Technology Act, 2000 and applicable Indian data protection laws, you have the right to:
            </p>
            <ul className="list-disc pl-5 text-slate-600 text-xs space-y-1.5 mb-4">
              <li>Access the personal information we hold about you.</li>
              <li>Request correction of inaccurate or incomplete data.</li>
              <li>Request deletion of your personal information, subject to legal obligations.</li>
              <li>Withdraw consent for marketing communications at any time.</li>
              <li>Lodge a complaint with the relevant data protection authority.</li>
            </ul>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              To exercise these rights, please contact us at the details provided below.
            </p>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">8. Cookies and Tracking</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              Our website uses cookies and similar tracking technologies to enhance your browsing experience, analyse site traffic, and understand user behaviour. You can control cookie preferences through your browser settings. Disabling cookies may affect certain features of our website.
            </p>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">9. Third-Party Links</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              Our website may contain links to third-party websites, such as Google Maps, social media platforms, or payment gateways. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.
            </p>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">10. Updates to This Policy</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. The updated policy will be posted on this page with a revised &ldquo;Last Updated&rdquo; date. We encourage you to review this page periodically.
            </p>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">11. Contact Us</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <p><strong>Shree Badree Build Tech Pvt. Ltd.</strong></p>
              <p>Email: info@sbbt.in</p>
              <p>Website: https://www.sbbt.in</p>
              <p>Phone: Available on our website</p>
            </div>
            <p className="text-slate-500 text-xs mt-4 italic">Last Updated: July 2026</p>
          </div>
        </div>
      </section>

      <CTA />
      <Footer />
    </>
  );
}