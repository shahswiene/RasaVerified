'use client';

import { ReactNode, useEffect } from 'react';
import { ConvexProvider } from 'convex/react';
import { convexClient } from '@/lib/convexClient';

interface ConvexClientProviderProps {
  children: ReactNode;
}

export function ConvexClientProvider({ children }: ConvexClientProviderProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[ui] Convex client initialized');
    }
  }, []);

  return <ConvexProvider client={convexClient}>{children}</ConvexProvider>;
}
