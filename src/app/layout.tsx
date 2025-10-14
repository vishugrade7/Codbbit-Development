
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
import { Inter, Space_Grotesk, Comfortaa } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });
const comfortaa = Comfortaa({ subsets: ['latin'], variable: '--font-comfortaa' });


function AppLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${comfortaa.variable} font-body antialiased bg-background text-foreground`}>
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
