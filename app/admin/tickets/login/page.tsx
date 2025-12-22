'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TicketsLoginPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to main login page
    router.replace('/admin/login');
  }, [router]);
  
  return null;
}

