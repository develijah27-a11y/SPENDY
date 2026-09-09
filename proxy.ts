import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;

  // Protected paths that require authentication
  const isProtectedPath =
    pathname.startsWith('/app') ||
    pathname.startsWith('/budgets') ||
    pathname.startsWith('/calendar') ||
    pathname.startsWith('/categories') ||
    pathname.startsWith('/coach') ||
    pathname.startsWith('/commute') ||
    pathname.startsWith('/debts') ||
    pathname.startsWith('/goals') ||
    pathname.startsWith('/income') ||
    pathname.startsWith('/inflation') ||
    pathname.startsWith('/investments') ||
    pathname.startsWith('/loans') ||
    pathname.startsWith('/recurring') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/review') ||
    pathname.startsWith('/runway') ||
    pathname.startsWith('/sacco') ||
    pathname.startsWith('/savings') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/sms-parser') ||
    pathname.startsWith('/spending') ||
    pathname.startsWith('/transactions') ||
    pathname.startsWith('/wallet');

  const isAuthPath =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isOnlineConfigured =
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl?.includes('your-project');

  let hasValidSession = false;

  if (isOnlineConfigured && supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // getUser() cryptographically verifies the JWT against Supabase Auth
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        hasValidSession = true;
      }
    } catch {
      hasValidSession = false;
    }
  }

  // Check for local/offline session cookie for demo or offline resilience
  if (!hasValidSession) {
    const offlineSessionCookie = request.cookies.get('spendy_auth_session_v1')?.value;
    if (offlineSessionCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(offlineSessionCookie));
        if (parsed?.user?.id) {
          hasValidSession = true;
        }
      } catch {
        // malformed cookie
      }
    }
  }

  // 1. Unauthenticated user trying to access protected financial area
  if (!hasValidSession && isProtectedPath) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Authenticated user accessing /login or /signup
  if (hasValidSession && isAuthPath) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/app';
    redirectUrl.searchParams.delete('redirectTo');
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, manifest.json, icons, fonts, static assets
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
