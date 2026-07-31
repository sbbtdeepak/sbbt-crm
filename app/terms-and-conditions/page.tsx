import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/shared/PageHero";
import CTA from "@/components/home/CTA";

export const metadata: Metadata = {
  title: "Terms & Conditions | Shree Badree Build Tech Pvt. Ltd.",
  description:
    "Review the terms and conditions governing the use of Shree Badree Build Tech Pvt. Ltd. (SBBT) website and services, including customer responsibilities, payment terms, and dispute resolution.",
  alternates: {
    canonical: "https://sbbt.in/terms-and-conditions",
  },
};

export default function TermsAndConditionsPage() {
  return (
    <>
      <Header />
      <PageHero title="Terms & Conditions" subtitle="Terms governing the use of our website and services provided by Shree Badree Build Tech Pvt. Ltd." />

      {/* Main Content */}
      <section className="bg-white py-10">
        <div className="mx-auto max-w-4xl px-6">
          <div className="prose prose-sm prose-slate max-w-none">
            <h2 className="text-lg font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              By accessing or using the website of Shree Badree Build Tech Pvt. Ltd. (&ldquo;SBBT,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our website or services.
            </p>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              These terms apply to all visitors, users, and customers who access or interact with our website, submit inquiries, or engage our construction, interior design, and renovation services.
            </p>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">2. Company Information</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              Shree Badree Build Tech Pvt. Ltd. is a registered company in India, specialising in residential and commercial construction, turnkey projects, interior design, and renovation services. Our registered office address is available on our website and can be provided upon request.
            </p>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">3. Use of the Website</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">You agree to use our website only for lawful purposes and in a manner that does not:</p>
            <ul className="list-disc pl-5 text-slate-600 text-xs space-y-1.5 mb-4">
              <li>Violate any applicable Indian laws or regulations.</li>
              <li>Infringe upon the rights of others, including intellectual property rights.</li>
              <li>Transmit any harmful code, viruses, or malicious content.</li>
              <li>Attempt to gain unauthorised access to our systems or user data.</li>
              <li>Engage in any activity that disrupts or interferes with the website&rsquo;s functionality.</li>
            </ul>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">4. Services and Contracts</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              The information, packages, and project descriptions on this website are for informational purposes and do not constitute a binding offer. A formal contract for construction or design services is established only when both parties sign a written agreement. Until such an agreement is executed, no contractual relationship exists.
            </p>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              All services are subject to site inspection, feasibility assessment, and mutual agreement on scope, timeline, and pricing.
            </p>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">5. Customer Responsibilities</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">As a customer or user of our services, you agree to:</p>
            <ul className="list-disc pl-5 text-slate-600 text-xs space-y-1.5 mb-4">
              <li>Provide accurate and complete information during inquiries and consultations.</li>
              <li>Obtain necessary approvals, permits, and permissions required for your project.</li>
              <li>Ensure site access and availability as needed for project execution.</li>
              <li>Make timely payments as per the agreed payment schedule.</li>
              <li>Communicate any changes in requirements or scope promptly.</li>
            </ul>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">6. Payment Terms</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              Payment terms, including milestones, amounts, and schedules, will be specified in the individual project contract. All payments are to be made in Indian Rupees (INR) unless otherwise agreed. Late payments may result in project delays and are subject to interest charges as per the contract terms.
            </p>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">7. Intellectual Property</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              All content on this website, including text, images, graphics, logos, designs, project descriptions, and software, is the intellectual property of Shree Badree Build Tech Pvt. Ltd. unless otherwise stated. You may not reproduce, distribute, modify, or republish any content without our prior written consent.
            </p>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              Design concepts, architectural drawings, and project plans provided during consultations remain the intellectual property of SBBT until full payment is received and the project is completed.
            </p>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">8. Warranties and Disclaimers</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              SBBT provides its services with reasonable skill and care, in accordance with industry standards. However, we make no warranties regarding:
            </p>
            <ul className="list-disc pl-5 text-slate-600 text-xs space-y-1.5 mb-4">
              <li>Completion timelines, which may be affected by factors beyond our control (weather, material availability, regulatory approvals, etc.).</li>
              <li>Exact matching of design renderings to final outcomes, as variations may occur during construction.</li>
              <li>Uninterrupted access to our website or digital services.</li>
            </ul>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">9. Limitation of Liability</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              To the maximum extent permitted by Indian law, SBBT shall not be liable for any indirect, incidental, special, or consequential damages arising from:
            </p>
            <ul className="list-disc pl-5 text-slate-600 text-xs space-y-1.5 mb-4">
              <li>The use or inability to use our website or services.</li>
              <li>Delays in project completion caused by external factors.</li>
              <li>Any errors or omissions in website content.</li>
              <li>Third-party actions or force majeure events.</li>
            </ul>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              Our total liability for any claim shall not exceed the total amount paid by you for the specific service giving rise to the claim.
            </p>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">10. Termination</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              We reserve the right to suspend or terminate your access to our website or services at any time, without notice, if you breach these Terms and Conditions. Upon termination, your right to use the website will cease immediately.
            </p>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">11. Governing Law and Dispute Resolution</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              These Terms and Conditions are governed by the laws of India. Any disputes arising out of or relating to these terms or our services shall be subject to the exclusive jurisdiction of the courts in Delhi/NCR, India.
            </p>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              We encourage amicable resolution of disputes through negotiation before resorting to legal proceedings.
            </p>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">12. Changes to Terms</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting on this page. Your continued use of the website after changes constitutes acceptance of the updated terms.
            </p>

            <h2 className="text-lg font-bold text-slate-900 mb-4 mt-8">13. Contact Us</h2>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              If you have any questions or concerns about these Terms and Conditions, please contact us:
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