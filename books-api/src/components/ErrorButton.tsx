'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import Button from '@/components/Button';

export const ErrorButton = () => {
  const t = useTranslations('App');
  const [, setCrashState] = useState<boolean>(false);

  const handleCrash = () => {
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
      {t('throwError')}
    </Button>
  );
};

export default ErrorButton;
