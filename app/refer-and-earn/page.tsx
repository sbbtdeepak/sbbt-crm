"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ReferEarn from "@/components/home/ReferEarn";
import FAQ from "@/components/home/FAQ";
import CTA from "@/components/home/CTA";

export default function ReferAndEarnPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="md:pt-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="text-center">
            <h1 className="text-lg font-bold text-slate-950 sm:text-xl lg:text-2xl">
              Refer & Earn
            </h1>
            <p className="mt-1.5 text-xs text-slate-600 max-w-xl mx-auto sm:text-sm">
              Share SBBT with your friends and family. Earn rewards when their
              construction project starts with us.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works - using existing ReferEarn component */}
      <ReferEarn />

      {/* Reward Structure */}
      <section className="bg-white py-8">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-base font-bold text-slate-900 text-center mb-6 sm:text-lg">
            Reward Structure
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 text-center">
              <div className="text-lg font-bold text-emerald-600 mb-1">₹10,000</div>
              <p className="text-slate-600 text-xs">For Basic Package referrals</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 text-center shadow-md">
              <div className="text-lg font-bold text-indigo-600 mb-1">₹25,000</div>
              <p className="text-slate-600 text-xs">For Premium Package referrals</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 text-center">
              <div className="text-lg font-bold text-emerald-600 mb-1">₹50,000</div>
              <p className="text-slate-600 text-xs">For Luxury Package referrals</p>
            </div>
          </div>
        </div>
      </section>

      {/* Terms & Conditions */}
      <section className="bg-slate-50 py-8">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-base font-bold text-slate-900 mb-4 sm:text-lg">
            Terms & Conditions
          </h2>
          <ul className="space-y-1.5 text-slate-600 text-xs">
            <li>• Reward is credited only after the referred project reaches foundation completion.</li>
            <li>• The referred party must mention your name during initial inquiry.</li>
            <li>• You can refer unlimited customers - no cap on rewards.</li>
            <li>• Rewards are not transferable and cannot be exchanged for cash.</li>
            <li>• SBBT reserves the right to modify reward amounts without prior notice.</li>
            <li>• Existing customers and partners are not eligible for this program.</li>
          </ul>
        </div>
      </section>

      {/* Referral Form (UI only) */}
      <section className="bg-white py-8">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-base font-bold text-slate-900 text-center mb-4 sm:text-lg">
            Submit a Referral
          </h2>
          <form className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Your Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Friend's Name
              </label>
              <input
                type="text"
                placeholder="Enter your friend's name"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Friend's Phone
              </label>
              <input
                type="tel"
                placeholder="Enter your friend's phone number"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-emerald-600 px-4 py-2 font-semibold text-white shadow-md hover:bg-emerald-500 transition text-xs"
            >
              Submit Referral
            </button>
          </form>
        </div>
      </section>

      <FAQ />

      <CTA />

      <Footer />
    </>
  );
}