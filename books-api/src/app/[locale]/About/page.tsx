import { getTranslations } from 'next-intl/server';

import Button from '@/components/Button';
import { Link, routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const About = async () => {
  const t = await getTranslations('About');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center transition-colors duration-500">
      <div className="max-w-xl bg-card/70 backdrop-blur-xl p-10 rounded-3xl border border-border-custom shadow-xl animate-in fade-in zoom-in-95 duration-300">
        <h1 className="text-3xl font-black text-foreground mb-6 tracking-tight">{t('title')}</h1>

        <section className="mb-8 text-left border-b border-border-custom pb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">{t('authorHeading')}</h2>
          <p className="text-foreground font-medium mb-1">
            {t('developerLabel')}{' '}
            <a
              className="inline-flex items-center gap-1.5 text-primary hover:brightness-110 font-bold transition-all group"
              href="https://github.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="underline decoration-primary/30 group-hover:decoration-primary">
                Anastasiya Andronava (anastan588)
              </span>
            </a>
          </p>
          <p className="text-muted text-sm leading-relaxed">{t('appDescription')}</p>
        </section>

        <section className="mb-8 text-left">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">{t('educationHeading')}</h2>
          <p className="text-muted text-sm leading-relaxed mb-4">{t('courseDescription')}</p>
          <a
            className="text-primary hover:brightness-110 font-bold text-sm underline decoration-primary/30 hover:decoration-primary transition-all"
            href="https://rs.school"
            rel="noopener noreferrer"
            target="_blank"
          >
            {t('courseLink')}
          </a>
        </section>

        <div className="flex justify-center gap-3">
          <Link href="/">
            <Button className="px-6 py-3 text-sm font-bold rounded-xl bg-primary text-white hover:brightness-110 transition-all shadow-md active:scale-98">
              {t('backButton')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
