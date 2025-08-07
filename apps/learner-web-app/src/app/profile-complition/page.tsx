'use client';

import React, { Suspense } from 'react';
import EditProfile from '@learner/components/EditProfile/EditProfile';
import { useSearchParams } from 'next/navigation';

const ProfileComplitionInner = () => {
  const searchParams = useSearchParams();
  const isComplition = searchParams.get('isComplition');
  return <EditProfile completeProfile={isComplition ? true : false} />;
};

const ProfileComplitionPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileComplitionInner />
    </Suspense>
  );
};

export default ProfileComplitionPage;
