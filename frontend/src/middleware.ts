import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    const isAdminRoute = pathname.startsWith("/dashboard/admin");

    if (isAdminRoute && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/student", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const pathname = req.nextUrl.pathname;

        if (pathname.startsWith("/dashboard")) {
          return !!token;
        }

        return true;
      },
    },
  },
);

export const config = {
  matcher: ["/((?!_next|static|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)).*)"],
};
