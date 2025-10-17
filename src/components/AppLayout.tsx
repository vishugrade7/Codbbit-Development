
'use client';

import { useTheme } from '@/components/ThemeProvider';
import { useEffect, useState, type ReactNode } from 'react';
import Aurora from '@/components/Aurora';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { usePathname } from 'next/navigation';

export function AppLayout({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const noFooterPaths = ['/login', '/signup'];
  const showFooter = !noFooterPaths.includes(pathname);

  return (
    <>
      <Header />
      {isClient && theme === 'glass' && (
        <Aurora
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      )}
      <main className="pt-16 md:pt-0">{children}</main>
      {showFooter && <Footer />}
    </>
  );
}
