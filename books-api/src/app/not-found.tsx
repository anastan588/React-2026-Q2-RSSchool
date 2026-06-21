'use client'; // Обязательно, так как используются клиентские хуки навигации

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import Button from '@/components/Button';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-6 text-center transition-colors duration-500">
      <div className="max-w-md bg-card/70 backdrop-blur-xl p-10 rounded-3xl border border-border-custom shadow-xl animate-in fade-in zoom-in-95 duration-300">
        <h1 className="text-7xl font-black text-foreground mb-4 tracking-tight">404</h1>
        <p className="text-xl font-bold text-foreground mb-2">Page Not Found</p>
        <p className="text-muted text-sm mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            className="px-6 py-3 text-sm font-semibold rounded-xl border transition-all duration-300 ease-out bg-card/50 backdrop-blur-md border-border-custom text-foreground hover:bg-card hover:text-primary hover:border-primary/30 shadow-xs active:scale-98 cursor-pointer"
            onClick={() => router.back()}
          >
            Go Back
          </Button>

          <Link className="w-full sm:w-auto" href="/">
            <Button className="w-full px-6 py-3 text-sm font-semibold rounded-xl border transition-all duration-300 ease-out bg-card/50 backdrop-blur-md border-border-custom text-foreground hover:bg-card hover:text-primary hover:border-primary/30 shadow-xs hover:shadow-md active:scale-98 cursor-pointer">
              Return to Main App
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
