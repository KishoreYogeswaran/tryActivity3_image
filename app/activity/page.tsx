'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ActivityFlow from '@/components/ActivityFlow';

export default function ActivityPage() {
  const [activityData, setActivityData] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const data = sessionStorage.getItem('activityData');
    if (!data) {
      router.push('/');
      return;
    }
    setActivityData(JSON.parse(data));
  }, [router]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted || !activityData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-brand-bg)' }}>
        <div className="text-center">
          <p className="text-gray-600">Loading activity...</p>
        </div>
      </div>
    );
  }

  return <ActivityFlow activityData={activityData} />;
}

