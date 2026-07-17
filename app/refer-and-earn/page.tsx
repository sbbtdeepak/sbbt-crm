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
      <section className="pt-28 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-950 sm:text-5xl">
              Refer & Earn
            </h1>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Share SBBT with your friends and family. Earn rewards when their
              construction project starts with us.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works - using existing ReferEarn component */}
      <ReferEarn />

      {/* Reward Structure */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Reward Structure
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">₹10,000</div>
              <p className="text-slate-600">For Basic Package referrals</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 p-8 text-center scale-105 shadow-xl">
              <div className="text-4xl font-bold text-indigo-600 mb-2">₹25,000</div>
              <p className="text-slate-600">For Premium Package referrals</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">₹50,000</div>
              <p className="text-slate-600">For Luxury Package referrals</p>
            </div>
          </div>
        </div>
      </section>

      {/* Terms & Conditions */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">
            Terms & Conditions
          </h2>
          <div className="prose prose-slate max-w-none">
            <ul className="space-y-4 text-slate-600">
              <li>Reward is credited only after the referred project reaches foundation completion.</li>
              <li>The referred party must mention your name during initial inquiry.</li>
              <li>You can refer unlimited customers - no cap on rewards.</li>
              <li>Rewards are not transferable and cannot be exchanged for cash.</li>
              <li>SBBT reserves the right to modify reward amounts without prior notice.</li>
              <li>Existing customers and partners are not eligible for this program.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Referral Form (UI only) */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">
            Submit a Referral
          </h2>
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Friend's Name
              </label>
              <input
                type="text"
                placeholder="Enter your friend's name"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Friend's Phone
              </label>
              <input
                type="tel"
                placeholder="Enter your friend's phone number"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-emerald-600 px-6 py-4 font-semibold text-white shadow-lg hover:bg-emerald-500 transition"
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