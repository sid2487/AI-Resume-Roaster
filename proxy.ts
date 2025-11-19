import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const isAuth = !!req.nextauth.token;

    if (isAuth && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (!isAuth && pathname === "/") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },

  {
    callbacks: {
      authorized: () => true, 
    },
  }
);

export const config = {
  matcher: ["/((?!api).*)"],
};