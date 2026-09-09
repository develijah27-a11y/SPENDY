'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const PRIORITY_ROUTES = [
  '/app',
  '/transactions',
  '/budgets',
  '/goals',
  '/sacco',
  '/accounts',
];

const SECONDARY_ROUTES = [
  '/commute',
  '/runway',
  '/inflation',
  '/sms-parser',
  '/reports',
  '/coach',
  '/recurring',
  '/debts',
  '/categories',
  '/settings',
];

/**
 * High-Performance Background Route Preloader
 * Proactively preloads route chunks into the Next.js router cache so page transitions happen in 0ms.
 */
export function RoutePreloader() {
  const router = useRouter();
  const hasPreloaded = useRef(false);

  useEffect(() => {
    if (hasPreloaded.current) return;
    hasPreloaded.current = true;

    // Warm up priority routes immediately
    PRIORITY_ROUTES.forEach((route, idx) => {
      setTimeout(() => {
        try {
          router.prefetch(route);
        } catch (_) {}
      }, idx * 60);
    });

    // Warm up secondary routes during idle window
    const prefetchSecondary = () => {
      SECONDARY_ROUTES.forEach((route, idx) => {
        setTimeout(() => {
          try {
            router.prefetch(route);
          } catch (_) {}
        }, 400 + idx * 80);
      });
    };

    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => {
          prefetchSecondary();
        });
      } else {
        setTimeout(prefetchSecondary, 600);
      }
    }
  }, [router]);

  return null;
}
