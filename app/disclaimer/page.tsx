import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/shared/PageHero";
import CTA from "@/components/home/CTA";

export const metadata: Metadata = {
  title: "Disclaimer | Shree Badree Build Tech Pvt. Ltd.",
  description:
    "Important information about the use of this website and the services provided by Shree Badree Build Tech Pvt. Ltd. (SBBT), including project representations, pricing, and liability limitations.",
  alternates: {
    canonical: "https://sbbt.in/disclaimer",
  },
};

export default function DisclaimerPage() {
  return (
    <>
      <Header />
      <PageHero title="Disclaimer" subtitle="Important information about the use of this website and the services provided by Shree Badree Build Tech Pvt. Ltd." />

      {/* Main Content */}
      <section className="bg-white py-10">
        <div className="mx-auto max-w-4xl px-6">
          <div className="prose prose-sm prose-slate max-w-none">
            <h2 className="text-lg font-bold text-slate-900 mb-4">1. General Information</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              The information provided on this website by Shree Badree Build Tech Pvt. Ltd. (&ldquo;SBBT,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is for general informational and promotional purposes only. While we strive to keep the information accurate and up to date, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, products, services, or related graphics on this website for any purpose.
            </p>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              Any reliance you place on such information is strictly at your own risk. We disclaim all liability arising from reliance on the content of this website.
            </p>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">2. No Professional Advice</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              The content on this website, including blogs, project descriptions, package details, and FAQs, is for informational purposes only and does not constitute professional advice, architectural consultation, structural engineering guidance, or legal advice. You should consult qualified professionals for advice specific to your construction, renovation, or interior design project.
            </p>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">3. Project Representations</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              Images, renderings, layouts, and descriptions of projects displayed on this website are for illustrative purposes only. Actual project outcomes may vary due to site conditions, material availability, client requirements, regulatory approvals, and other factors. SBBT reserves the right to modify designs, materials, and specifications as necessary.
            </p>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">4. Pricing and Packages</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              The pricing and package information displayed on this website is indicative and may change without prior notice. Final pricing is determined based on site evaluation, project scope, material selection, and other factors specific to each project. All prices are subject to applicable taxes and terms agreed upon in the final contract.
            </p>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              Customisations, upgrades, or additional services beyond the stated package scope may incur extra charges.
            </p>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">5. External Links</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              This website may contain links to third-party websites, including Google Maps, social media platforms, and partner sites. These links are provided for your convenience. We do not endorse, control, or assume responsibility for the content, privacy policies, or practices of any third-party websites.
            </p>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">6. Availability and Interruptions</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              We strive to ensure uninterrupted access to our website, but we do not guarantee that the website will be available at all times. We may suspend, withdraw, or restrict the availability of all or any part of our website for business, technical, or operational reasons without notice.
            </p>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">7. Limitation of Liability</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              To the fullest extent permitted by applicable Indian law, Shree Badree Build Tech Pvt. Ltd. shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of your access to, use of, or inability to use this website, including but not limited to damages for loss of profits, data, or business opportunities.
            </p>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">8. Indemnification</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              By using this website, you agree to indemnify, defend, and hold harmless Shree Badree Build Tech Pvt. Ltd., its directors, employees, and affiliates from any claims, damages, liabilities, costs, or expenses arising out of your use of the website or violation of these terms.
            </p>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">9. Updates to This Disclaimer</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              We may update this Disclaimer from time to time. Changes will be posted on this page with a revised &ldquo;Last Updated&rdquo; date. Continued use of the website after changes constitutes acceptance of the updated disclaimer.
            </p>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">10. Contact Us</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              If you have any questions about this Disclaimer, please contact us:
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <p><strong>Shree Badree Build Tech Pvt. Ltd.</strong></p>
              <p>Email: info@sbbt.in</p>
              <p>Website: https://www.sbbt.in</p>
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