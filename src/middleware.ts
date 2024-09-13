import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = ["/login", "/register"];

  // Weiterleitung von der Startseite zum Chat, wenn ein Token vorhanden ist
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  // Weiterleitung zu /login, wenn kein Token vorhanden ist und die Route nicht öffentlich ist
  if (!token && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Weiterleitung zum Chat, wenn ein Token vorhanden ist und der Benutzer versucht,
  // auf Login oder Register zuzugreifen
  if (token && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
