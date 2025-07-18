'use client';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { RootState } from '@/store/store';

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!auth.token || !auth.user) {
      router.replace('/');
    }
  }, [auth, router]);

  return <>{children}</>;
}
