import dynamic from 'next/dynamic';

const LivingLens = dynamic(() => import('../components/LivingLens'), { ssr: false });

export default function Home() {
  return <LivingLens />;
}
