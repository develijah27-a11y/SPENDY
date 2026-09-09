'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const CORE_ROUTES = [
  '/app',
  '/transactions',
  '/budgets',
  '/goals',
  '/sacco',
  '/commute',
  '/runway',
  '/inflation',
  '/sms-parser',
  '/reports',
  '/coach',
  '/accounts',
  '/recurring',
  '/debts',
  '/login',
  '/signup',
];

/**
 * Non-blocking Background Route Preloader
 * Warms up Next.js route chunks during idle browser cycles so navigation transitions are instant.
 */
export function RoutePreloader() {
  const router = useRouter();
  const hasPreloaded = useRef(false);

  useEffect(() => {
    if (hasPreloaded.current) return;
    hasPreloaded.current = true;

    // Utilize idle time to avoid contention with main-thread interactivity
    const prefetchRoutes = () => {
      let delay = 200;
      CORE_ROUTES.forEach((route) => {
        setTimeout(() => {
          try {
            router.prefetch(route);
          } catch (_) {
            // Silently ignore prefetch errors
          }
        }, delay);
        delay += 120; // Stagger prefetch requests
      });
    };

    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => {
          prefetchRoutes();
        });
      } else {
        setTimeout(prefetchRoutes, 500);
      }
    }
  }, [router]);

  return null;
}
