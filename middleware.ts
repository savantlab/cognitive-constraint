import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const url = request.nextUrl.clone();
  
  // Extract subdomain
  // In production: admin.cognitiveconstraint.com → "admin"
  // In development: admin.localhost:3000 → "admin"
  const subdomain = hostname.split(".")[0];
  
  // Admin subdomain → rewrite to /dashboard routes
  if (subdomain === "admin") {
    // If accessing root of admin subdomain, go to dashboard
    if (url.pathname === "/") {
      url.pathname = "/dashboard";
      return NextResponse.rewrite(url);
    }
    
    // If not already a dashboard route, prefix with /dashboard
    if (!url.pathname.startsWith("/dashboard")) {
      url.pathname = `/dashboard${url.pathname}`;
      return NextResponse.rewrite(url);
    }
    
    return NextResponse.next();
  }
  
  // API subdomain → rewrite to /api routes
  if (subdomain === "api") {
    // If accessing root of api subdomain
    if (url.pathname === "/") {
      return NextResponse.json({ 
        name: "Cognitive Constraint Journal API",
        version: "1.0.0",
      });
    }
    
    // If not already an api route, prefix with /api
    if (!url.pathname.startsWith("/api")) {
      url.pathname = `/api${url.pathname}`;
      return NextResponse.rewrite(url);
    }
    
    return NextResponse.next();
  }
  
  // Portal subdomain → rewrite to /portal routes
  if (subdomain === "portal") {
    // If accessing root of portal subdomain, go to portal
    if (url.pathname === "/") {
      url.pathname = "/portal";
      return NextResponse.rewrite(url);
    }
    
    // If not already a portal route, prefix with /portal
    if (!url.pathname.startsWith("/portal")) {
      url.pathname = `/portal${url.pathname}`;
      return NextResponse.rewrite(url);
    }
    
    return NextResponse.next();
  }
  
  // Main domain: block direct access to /dashboard
  const isMainDomain = 
    hostname.includes("cognitiveconstraint.com") || 
    hostname === "localhost:3000" ||
    hostname.startsWith("localhost:");
    
  if (isMainDomain && subdomain && !subdomain.match(/^(admin|api|portal)$/)) {
    // Block /dashboard access from main domain
    if (url.pathname.startsWith("/dashboard")) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
