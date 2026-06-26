import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.toLowerCase() === "/admin") {
    return NextResponse.redirect(new URL("/admin/questions", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/ADMIN", "/admin"]
};
