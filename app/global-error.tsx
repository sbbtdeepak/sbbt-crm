"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center">
          <h2 className="text-xl font-bold">Something went wrong!</h2>
          <p className="mt-2 text-gray-600">{error.message}</p>
        </div>
      </body>
    </html>
  );
}