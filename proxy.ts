import { auth } from "@/lib/auth/server";

// Next.js 16: proxy.ts replaces middleware.ts.
export default auth.middleware({
  loginUrl: "/auth/sign-in",
});

export const config = {
  matcher: [
    // Protected areas (nutritionist console and patient area, steps 3-6)
    "/panel/:path*",
  ],
};
