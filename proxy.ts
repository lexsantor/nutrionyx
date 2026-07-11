import { auth } from "@/lib/auth/server";

// Next.js 16: proxy.ts replaces middleware.ts.
export default auth.middleware({
  loginUrl: "/auth/sign-in",
});

export const config = {
  matcher: [
    // Protected areas (platform admin, nutritionist console, patient area)
    "/admin/:path*",
    "/panel/:path*",
    "/mi-espacio/:path*",
  ],
};
