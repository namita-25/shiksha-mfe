'use client';
import dynamic from 'next/dynamic';

const Search = dynamic(() => import('@learner/components/themantic/Search'), {
  ssr: false,
});

export default function PosPage() {
  return <Search />;
}
