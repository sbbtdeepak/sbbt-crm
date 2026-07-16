import Header from "@/components/layout/Header";

const packages = [
  {
    name: "Basic",
    price: "₹1,99,000",
    description: "Essential construction package for standard homes.",
    features: [
      "Architectural planning",
      "Basic structural design",
      "Standard materials",
      "Project supervision",
    ],
  },
  {
    name: "Standard",
    price: "₹3,49,000",
    description: "Our most popular package with premium finishes.",
    features: [
      "Everything in Basic",
      "3D interior design",
      "Premium materials",
      "Dedicated project manager",
    ],
  },
  {
    name: "Premium",
    price: "₹5,99,000",
    description: "End-to-end luxury construction and interiors.",
    features: [
      "Everything in Standard",
      "Smart home integration",
      "Luxury finishes",
      "Turnkey handover",
    ],
  },
];

export default function PackagesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-28 max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-950">
            Our <span className="text-indigo-600">Packages</span>
          </h1>
          <p className="mt-3 text-slate-500">
            Choose the construction package that fits your dream project.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className="rounded-2xl bg-white p-8 shadow-md border border-slate-100 hover:shadow-xl transition"
            >
              <h2 className="text-2xl font-semibold text-slate-950">{pkg.name}</h2>
              <p className="mt-2 text-3xl font-bold text-indigo-600">{pkg.price}</p>
              <p className="mt-3 text-slate-500">{pkg.description}</p>
              <ul className="mt-6 space-y-3">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-center text-slate-700">
                    <span className="mr-2 text-emerald-600">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <footer className="bg-slate-900 py-8 text-center text-sm text-slate-400">
        &copy; 2026 SBBT Construction. All rights reserved.
      </footer>
    </div>
  );
}