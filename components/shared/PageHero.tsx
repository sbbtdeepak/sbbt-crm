"use client";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  accentWord?: string;
}

export default function PageHero({ title, subtitle, accentWord }: PageHeroProps) {
  return (
    <section className="bg-indigo-900 text-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">
          {accentWord ? (
            <>
              {title.split(accentWord)[0]}
              <span className="text-indigo-200">{accentWord}</span>
              {title.split(accentWord)[1] || ""}
            </>
          ) : (
            title
          )}
        </h1>
        {subtitle && (
          <p className="text-indigo-200 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}