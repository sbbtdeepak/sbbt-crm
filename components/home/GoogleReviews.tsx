export default function GoogleReviews() {
  return (
    <section className="bg-white py-6 sm:py-10 text-slate-900" aria-label="Google rating">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-1 mb-2" aria-label="4.9 out of 5 stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.069-3.292a1 1 0 00-.364-1.118L2.78 8.77c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">Google Rating</h2>
          <p className="mt-1 text-2xl font-bold text-indigo-600 sm:text-3xl">4.9 / 5</p>
          <p className="mt-1 text-sm text-slate-600">Trusted by hundreds of homeowners.</p>
        </div>
      </div>
    </section>
  );
}