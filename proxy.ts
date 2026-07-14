import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/contact",
  "/projects",
  "/blogs",
  "/privacy-policy",
  "/terms",
  "/refer-earn",
];

const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore Next.js internals and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Public & auth pages
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    AUTH_ROUTES.includes(pathname)
  ) {
    return NextResponse.next();
  }

  console.log(
  "PATH:",
  pathname,
  "COOKIES:",
  request.cookies.getAll().map((c) => c.name)
);

return NextResponse.next();

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};