
import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  verifyAdminSessionToken,
} from "./lib/admin-auth";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow login and logout
  if (
    pathname === "/admin/login" ||
    pathname === "/api/admin/login" ||
    pathname === "/api/admin/logout"
  ) {
    return NextResponse.next();
  }

  const isAdminPage =
    pathname === "/admin" || pathname.startsWith("/admin/");

  const isAdminApi = pathname.startsWith("/api/admin/");

  const isRecipeCreateApi =
    pathname === "/api/recipes" && request.method === "POST";

  if (!isAdminPage && !isAdminApi && !isRecipeCreateApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE)?.value;

  if (verifyAdminSessionToken(token)) {
    return NextResponse.next();
  }

  if (isAdminApi || isRecipeCreateApi) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized. Please login first.",
      },
      { status: 401 }
    );
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/recipes",
  ],
};
