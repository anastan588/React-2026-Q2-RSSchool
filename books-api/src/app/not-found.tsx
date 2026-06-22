'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import Button from '@/components/Button';
import { Link } from '@/i18n/routing';

export const NotFound = () => {
  const router = useRouter();
  const t = useTranslations('NotFound');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-6 text-center transition-colors duration-500">
      <div className="max-w-md bg-card/70 backdrop-blur-xl p-10 rounded-3xl border border-border-custom shadow-xl animate-in fade-in zoom-in-95 duration-300">
        <h1 className="text-7xl font-black text-foreground mb-4 tracking-tight">{t('title')}</h1>
        <p className="text-xl font-bold text-foreground mb-2">{t('subtitle')}</p>
        <p className="text-muted text-sm mb-8 leading-relaxed">{t('description')}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            className="px-6 py-3 text-sm font-semibold rounded-xl border transition-all duration-300 ease-out bg-card/50 backdrop-blur-md border-border-custom text-foreground hover:bg-card hover:text-primary hover:border-primary/30 shadow-xs active:scale-98 cursor-pointer"
            onClick={() => router.back()}
          >
            {t('goBack')}
          </Button>

          <Link className="w-full sm:w-auto" href="/">
            <Button className="w-full px-6 py-3 text-sm font-semibold rounded-xl border transition-all duration-300 ease-out bg-card/50 backdrop-blur-md border-border-custom text-foreground hover:bg-card hover:text-primary hover:border-primary/30 shadow-xs hover:shadow-md active:scale-98 cursor-pointer">
              {t('returnHome')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
