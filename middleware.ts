// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  // ❌ Token নাই → redirect
  if (!token) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  // ✅ Token আছে → allow
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
