// app/layout.tsx
import './globals.css';

import { Suspense } from 'react';
import type { Metadata } from 'next';

import ErrorBoundary from '@/components/ErrorBoundary'; // ДОБАВЛЕНО: Импортируем глобальный предохранитель
import HeaderWrapper from '@/components/HeaderWrapper';

import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Books Catalogue',
  description: 'Migrated to Next.js App Router',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500 relative">
        <Providers>
          {/* 
            ИСПРАВЛЕНО: Оборачиваем все интерактивное содержимое в ErrorBoundary.
            Теперь, когда ErrorButton внутри страницы выбрасывает исключение, 
            этот компонент перехватит его и покажет красивый интерфейс заглушки.
          */}
          <ErrorBoundary>
            {/* 
              ИСПРАВЛЕНО: Оборачиваем HeaderWrapper в Suspense. 
              Это критически важно в Next.js App Router, когда клиентский компонент внутри Layout 
              использует хук `useSearchParams()`. Это предотвращает блокировку компиляции всего SSR макета.
            */}
            <Suspense fallback={<div className="h-16 bg-card/20 animate-pulse w-full" />}>
              <HeaderWrapper />
            </Suspense>

            {children}
          </ErrorBoundary>

          <footer className="py-10 bg-card/40 border-t border-border-custom flex justify-center backdrop-blur-xs transition-colors duration-300 w-full mt-auto" />
        </Providers>
      </body>
    </html>
  );
}
