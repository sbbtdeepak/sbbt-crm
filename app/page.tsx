"use client";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Build Your <span className="text-indigo-600">Dream Space</span> with SBBT
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                Premium construction services tailored to your needs.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href="/quote" className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition shadow-lg shadow-green-200">
                  Get Quote Now
                </a>
                <a href="/admin" className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition">
                  Admin Login
                </a>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Construction"
                className="rounded-2xl shadow-2xl object-cover w-full h-96"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 text-center text-sm">
        <p>&copy; 2026 SBBT Construction. All rights reserved.</p>
      </footer>
    </div>
  );
}