---
description: Mandatory security standards, JWT validation, and session hygiene for Spendy
globs: ["**/*.ts", "**/*.tsx"]
---

# Spendy Security & Authentication Standard

This rule outlines mandatory security policies for the Spendy codebase. Antigravity and developers must strictly uphold these principles when modifying or adding features.

## 1. Edge Route Protection (Next.js Middleware)
- All financial, analytical, and user-specific routes (`/app`, `/budgets`, `/categories`, `/goals`, `/income`, `/investments`, `/loans`, `/reports`, `/review`, `/savings`, `/settings`, `/spending`, `/transactions`, `/wallet`, `/calendar`, `/coach`, `/commute`, `/debts`, `/inflation`, `/recurring`, `/runway`, `/sacco`, `/sms-parser`) MUST be protected at the edge via `middleware.ts`.
- The middleware must invoke `@supabase/ssr` `supabase.auth.getUser()` to cryptographically validate the JWT against the authentication authority, rather than blindly trusting unverified client claims.
- Unauthenticated requests to protected paths must be redirected to `/login?redirectTo=<target>`.
- Authenticated requests visiting `/login` or `/signup` must be redirected directly to `/app`.

## 2. API Route Authorization
- Every Next.js Route Handler in `/app/api/**` that reads, calculates, or mutates user data must verify caller identity using `createClientServer()` (`supabase.auth.getUser()`).
- Requests lacking a verified session or valid authorization token must be rejected immediately with HTTP 401 Unauthorized (`{ error: 'Unauthorized: Valid session or token required' }`).

## 3. Session Hygiene & Cookie Synchronization
- Authentication tokens must be transported via secure, SameSite-compliant cookies managed by Supabase SSR.
- When local or offline fallback modes are active, authentication cookies must be maintained in sync with client storage so that edge middleware and UI components remain strictly consistent.
- On user sign-out, all local authentication tokens, cookies, and cached profile data must be cleared completely.

## 4. Credential Handling
- Passwords must NEVER be stored in plaintext anywhere in the application, including local storage, session storage, or telemetry logs.
- Client-side offline fallback credential verification must utilize standard salted cryptographic hashing (e.g. Web Crypto API `SHA-256`).
- All local credential comparisons must be timing-safe and strictly validate matching password hashes before issuing sessions.
