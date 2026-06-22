import './globals.css';

import { Suspense } from 'react';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

import ErrorBoundary from '@/components/ErrorBoundary';
import HeaderWrapper from '@/components/HeaderWrapper';

import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Books Catalogue',
  description: 'Migrated to Next.js App Router',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500 relative">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers>
            <ErrorBoundary>
              <Suspense fallback={<div className="h-16 bg-card/20 animate-pulse w-full" />}>
                <HeaderWrapper />
              </Suspense>

              {children}
            </ErrorBoundary>

            <footer className="py-10 bg-card/40 border-t border-border-custom flex justify-center backdrop-blur-xs transition-colors duration-300 w-full mt-auto" />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
