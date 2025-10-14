
'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeProvider, useTheme } from '@/components/ThemeProvider';
import Script from 'next/script';
import Aurora from '@/components/Aurora';
import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { AuthGuard } from '@/components/AuthGuard';
import { usePathname } from 'next/navigation';
import { Footer } from '@/components/Footer';

function AppLayout({ children }: { children: React.ReactNode }) {
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
          <title>Codbbit</title>
          <meta name="description" content="A playground for Salesforce Apex coding challenges." />
          <link rel="icon" href="/logo.png" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&family=Inter:wght@100..900&family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground" style={{
        // @ts-ignore
        '--font-inter': '"Inter", sans-serif',
        '--font-space-grotesk': '"Space Grotesk", monospace',
        '--font-comfortaa': '"Comfortaa", sans-serif',
      }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <AuthGuard>
              <Header />
              <AppLayout>
                {children}
              </AppLayout>
            </AuthGuard>
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      </body>
    </html>
  );
}
