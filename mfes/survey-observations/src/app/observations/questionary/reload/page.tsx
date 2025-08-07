'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Suspense } from 'react';

const ReloadPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    router.back();
  }, [router]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <h1>Reload</h1>;{' '}
    </Suspense>
  );
};

export default ReloadPage;
