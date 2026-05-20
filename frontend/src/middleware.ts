import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

const isAdminRoute = createRouteMatcher(["/dashboard/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const session = await auth.protect();

    if (isAdminRoute(req) && session.sessionClaims?.role !== "ADMIN") {
      return Response.redirect(new URL("/dashboard/student", req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!_next|static|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)).*)"],
};
