// app/[[...slug]]/loading.tsx
import Loader from '@/components/Loader';

// ИСПРАВЛЕНО: Убраны все пропсы и async/await, так как Next.js не передает searchParams в loading.tsx.
// Компонент теперь полностью безопасен и никогда не вызовет TypeError.
export default function Loading() {
  return (
    <div className="w-full max-w-[1400px] mx-auto min-h-[600px] flex items-center justify-center">
      {/* Передаем пустую строку, чтобы сработал ваш дефолтный текст "Loading books catalogue..." */}
      <Loader query="" />
    </div>
  );
}
