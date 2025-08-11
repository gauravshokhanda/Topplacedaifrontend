'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InterviewPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new setup page
    router.replace('/learner/interview/setup');
  }, [router]);

  return null;
}
