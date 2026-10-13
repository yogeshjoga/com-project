import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const CRM_HOST = process.env.CRM_HOST ?? "crm.egirerobotics.com";
// When "true", /shop (the CRM e-commerce dashboard) only answers on the CRM host.
const CRM_ONLY = process.env.SHOP_ADMIN_ONLY_ON_CRM_HOST === "true";

export async function proxy(request: NextRequest) {
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "").split(":")[0];
  if (CRM_ONLY && host !== CRM_HOST && host !== "localhost" && host !== "127.0.0.1") {
    const url = new URL(request.nextUrl.pathname + request.nextUrl.search, `https://${CRM_HOST}`);
    return NextResponse.redirect(url);
  }

  // Refresh the Supabase session cookie so Server Components see a valid CRM login.
  let response = NextResponse.next({ request });
  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
      },
    },
  });
  await sb.auth.getUser();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/shop", "/shop/:path*"],
};
