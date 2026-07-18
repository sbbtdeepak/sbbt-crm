export default function GoogleReviews() {
  const reviews = [
    {
      name: "Rajesh Kumar",
      rating: 5,
      review: "Excellent construction quality and transparent pricing. SBBT delivered our dream home on time with great attention to detail.",
      date: "2 weeks ago",
    },
    {
      name: "Priya Sharma",
      rating: 5,
      review: "Professional team with amazing workmanship. The entire process was smooth and they kept us updated throughout.",
      date: "1 month ago",
    },
    {
      name: "Amit Patel",
      rating: 4,
      review: "Great experience overall. Quality materials and timely completion. Highly recommend for residential construction.",
      date: "2 months ago",
    },
  ];

  return (
    <section className="bg-white py-6 sm:py-10 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.32em] text-indigo-600 sm:text-sm">
            Google Reviews
          </p>
          <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-950 sm:text-2xl">
            See what our customers say about Shree Badree Build Tech Pvt Ltd.
          </h2>
        </div>

        {/* Overall Rating */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className="h-4 w-4 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.069-3.292a1 1 0 00-.364-1.118L2.78 8.77c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <div className="text-lg font-bold text-slate-950">4.8 / 5</div>
          <div className="text-xs text-slate-600">64+ Reviews</div>
        </div>

        {/* Review Cards */}
        <div className="mt-4">
          {/* Mobile Swipe */}
          <div className="md:hidden">
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {reviews.map((review, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition duration-300 snap-start flex-shrink-0 w-64"
                >
                  <div className="flex mb-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`h-3 w-3 ${star <= review.rating ? "text-yellow-400" : "text-slate-300"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.069-3.292a1 1 0 00-.364-1.118L2.78 8.77c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 mb-2">&ldquo;{review.review}&rdquo;</p>
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-200">
                    <div>
                      <p className="font-semibold text-slate-900 text-xs">{review.name}</p>
                      <p className="text-[9px] text-slate-500">{review.date}</p>
                    </div>
                    <svg className="h-4 w-4 text-[#4285f4]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.9 7.22-2.41l-3.57-2.77c-.98.66-2.22 1.01-3.45 1.01-2.22 0-4.12-.86-5.52-2.19-1.89 1.28-3.11 3.22-3.11 5.51 0 .54.08 1.07.22 1.58L12 23z" />
                      <path d="M4.92 14.42c-.22-.66-.35-1.36-.35-2.08s.13-1.42.35-2.08C7.68 6.64 9.64 5.5 12 5.5c1.45 0 2.58.52 3.49 1.41l2.57-2.57C17.08 2.14 14.69.5 12 .5 7.48.5 3.46 3.17 1.92 6.75c-.22.66-.35 1.36-.35 2.08s.13 1.42.35 2.08c1.54 3.58 5.56 6.2 9.08 6.2 5.52 0 8.85-3.88 9.08-6.2.14-.51.2-1.04.2-1.58h-12v-4.26h5.92c-.26-1.37-1.04-2.53-2.21-3.31V4.51c1.45.92 2.58 2.53 2.58 4.55 0 2.02-.81 3.87-2.12 5.17l2.57 2.57c-.17.17-.36.34-.56.49-1.87 1.53-4.32 2.44-7.02 2.44-5.52 0-8.85-3.88-9.08-6.2z" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-4">
            {reviews.map((review, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition duration-300"
              >
                <div className="flex mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`h-3 w-3 ${star <= review.rating ? "text-yellow-400" : "text-slate-300"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.069-3.292a1 1 0 00-.364-1.118L2.78 8.77c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs text-slate-700 mb-3">&ldquo;{review.review}&rdquo;</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <div>
                    <p className="font-semibold text-slate-900 text-xs">{review.name}</p>
                    <p className="text-[9px] text-slate-500">{review.date}</p>
                  </div>
                  <svg className="h-4 w-4 text-[#4285f4]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.9 7.22-2.41l-3.57-2.77c-.98.66-2.22 1.01-3.45 1.01-2.22 0-4.12-.86-5.52-2.19-1.89 1.28-3.11 3.22-3.11 5.51 0 .54.08 1.07.22 1.58L12 23z" />
                    <path d="M4.92 14.42c-.22-.66-.35-1.36-.35-2.08s.13-1.42.35-2.08C7.68 6.64 9.64 5.5 12 5.5c1.45 0 2.58.52 3.49 1.41l2.57-2.57C17.08 2.14 14.69.5 12 .5 7.48.5 3.46 3.17 1.92 6.75c-.22.66-.35 1.36-.35 2.08s.13 1.42.35 2.08c1.54 3.58 5.56 6.2 9.08 6.2 5.52 0 8.85-3.88 9.08-6.2.14-.51.2-1.04.2-1.58h-12v-4.26h5.92c-.26-1.37-1.04-2.53-2.21-3.31V4.51c1.45.92 2.58 2.53 2.58 4.55 0 2.02-.81 3.87-2.12 5.17l2.57 2.57c-.17.17-.36.34-.56.49-1.87 1.53-4.32 2.44-7.02 2.44-5.52 0-8.85-3.88-9.08-6.2z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-4 flex flex-row gap-2 justify-center">
          <a
            href="#"
            className="flex-1 max-w-[160px] rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 transition text-center"
          >
            View All Reviews
          </a>
          <a
            href="#"
            className="flex-1 max-w-[160px] rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50 transition text-center"
          >
            Write a Review
          </a>
        </div>
      </div>
    </section>
  );
}