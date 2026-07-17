"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    question: "What is the starting construction cost?",
    answer:
      "Our construction packages start from ₹1,699 per square foot for the Basic package. The final cost depends on your plot size, number of floors, and selected package. Use our Construction Cost Estimator above to get an instant ballpark estimate.",
  },
  {
    question: "How is the construction cost calculated?",
    answer:
      "The estimated cost is calculated as: Built-up Area (Plot Size × Number of Floors) × Package Rate per sqft. This gives you a rough estimate. A detailed BOQ (Bill of Quantities) is provided after the site visit and design finalisation.",
  },
  {
    question: "Which brands are used?",
    answer:
      "We use only trusted brands including UltraTech Cement, TATA Steel, Asian Paints, Kajaria Tiles, Havells Electricals, Jaquar Bath Fittings, and many more. All materials meet IS standards and are sourced directly from authorised dealers.",
  },
  {
    question: "How long does construction take?",
    answer:
      "Construction timelines depend on the built-up area. Typically, a standard home takes 6–9 months, while larger projects may take 9–15 months. A detailed timeline is shared after the project plan is finalised.",
  },
  {
    question: "Do you provide structural warranty?",
    answer:
      "Yes. We offer a structural warranty of up to 10 years depending on the package you choose. Basic comes with 5 years, Premium with 7 years, and Luxury with 10 years of structural warranty.",
  },
  {
    question: "Can I customize my package?",
    answer:
      "Absolutely. While our packages cover standard requirements, we offer full customisation. You can select a Custom Quote package and our team will work with you to create a tailored plan that fits your specific needs and budget.",
  },
  {
    question: "Do you help with approvals?",
    answer:
      "Yes, we assist with all necessary government approvals and building plan sanctions. Our team handles the documentation and coordination with local authorities to ensure a smooth approval process.",
  },
  {
    question: "Do you provide daily updates?",
    answer:
      "Yes. A dedicated site engineer is assigned to your project who provides daily monitoring and weekly progress updates with photos and reports. You will always know the status of your construction.",
  },
  {
    question: "Do you provide interior work?",
    answer:
      "Yes, our Premium and Luxury packages include interior design and execution. From modular kitchens and wardrobes to false ceilings and bathroom fittings, we handle complete interior work as part of the package.",
  },
  {
    question: "Can I get a free quotation?",
    answer:
      "Yes. You can request a free, no-obligation quotation by clicking the 'Get Detailed Quote' button below any estimate result, or by visiting our Quote page. Our team will get back to you with a detailed breakdown.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white py-24 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Section header */}
        <div className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.32em] text-indigo-600">
            FAQ
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Frequently Asked Questions
          </h2>
        </div>

        {/* Accordion */}
        <div className="mt-12 space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-slate-200 transition-colors hover:border-slate-300"
              >
                <button
                  onClick={() => toggle(index)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-slate-50"
                  aria-expanded={isOpen}
                >
                  <span className="pr-4 text-sm font-semibold text-slate-900 sm:text-base">
                    {item.question}
                  </span>
                  <svg
                    className={`h-5 w-5 flex-shrink-0 text-slate-400 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="border-t border-slate-100 px-6 py-4 text-sm leading-7 text-slate-600">
                    {item.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}