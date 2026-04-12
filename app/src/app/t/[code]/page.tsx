'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Ring tap redirect - /t/[code] redirects to the linked user's profile
export default function RingRedirect() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  useEffect(() => {
    // For MVP: ring codes map directly to usernames
    // In production, look up the ring code in the database
    // For now, redirect to the code as a username
    router.replace(`/${code}`);
  }, [code, router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
    </main>
  );
}
