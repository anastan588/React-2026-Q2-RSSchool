'use client';

import { useState } from 'react';

import Button from '@/components/Button';

export const ErrorButton = () => {
  const [, setCrashState] = useState();

  const handleCrash = () => {
    // ИСПРАВЛЕНО: Вызываем ошибку внутри асинхронного таймаута через триггер стейта.
    // Это изолирует сбой от серверного рендеринга (SSR) и заставляет
    // исключительно клиентский ErrorBoundary перехватить это исключение.
    setTimeout(() => {
      setCrashState(() => {
        throw new Error('Test Error: Application crashed as requested.');
      });
    }, 0);
  };

  return (
    <Button
      className="bg-red-500! shadow-red-500/20! text-xs py-2 px-4 rounded-lg font-semibold text-white hover:brightness-110 active:scale-98 transition-all"
      onClick={handleCrash}
    >
      Throw error
    </Button>
  );
};

export default ErrorButton;
