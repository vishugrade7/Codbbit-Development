
'use client';

import { useTheme } from '@/components/ThemeProvider';
import { useEffect, useState, type ReactNode } from 'react';
import Aurora from '@/components/Aurora';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { usePathname } from 'next/navigation';
import { useUser } from '@/firebase';

export function AppLayout({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const noFooterPaths = ['/login', '/signup'];
  const showFooter = !noFooterPaths.includes(pathname) && !user;

  return (
    <>
      <Header />
      <main className="pt-16 md:pt-0">{children}</main>
      {showFooter && <Footer />}
    </>
  );
}
