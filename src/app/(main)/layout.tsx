
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BottomNav } from "@/components/bottom-nav";
import { TopNav } from "@/components/top-nav";
import { Footer } from '@/components/footer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    // This code now runs only on the client
    const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
    setIsOnboardingComplete(onboardingComplete);
    
    if (pathname !== '/onboarding' && !onboardingComplete) {
        router.replace('/onboarding');
    }
  }, [router, pathname]);
  
  // While we're checking, don't render anything to prevent content flash
  if (isOnboardingComplete === null || (isOnboardingComplete === false && pathname !== '/onboarding')) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <TopNav />
      <main className="flex-1 pt-16 pb-16 md:pb-0">{children}</main>
      <div className="hidden md:block">
        <Footer />
      </div>
      <BottomNav />
    </div>
  );
}
