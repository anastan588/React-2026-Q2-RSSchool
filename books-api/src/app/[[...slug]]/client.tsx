'use client';

import { use, useSyncExternalStore } from 'react';

import App from '@/App';
import NotFound from '@/app/not-found';
import Loader from '@/components/Loader';
import About from '@/pages/About';
import BookDetails from '@/pages/BookDetails';

interface ClientOnlyProps {
  params: Promise<{ slug?: string[] }>;
}

// Пустые функции-заглушки для подписки, так как сервер/клиент не меняются в процессе жизни страницы
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export const ClientOnly = ({ params }: ClientOnlyProps) => {
  // 1. Распаковываем параметры маршрута
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug || [];

  // 2. Определяем, где мы находимся (сервер или клиент) без useState и useEffect.
  // На сервере вернет false, в браузере — true. Без каскадных рендеров!
  const isMounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  // 3. До полной загрузки в браузере рендерим нейтральное состояние.
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader query="books" />
      </div>
    );
  }

  // 4. Логика роутинга (выполняется строго на клиенте после успешной гидратации)

  // Корневой маршрут: "/"
  if (slug.length === 0) {
    return <App />;
  }

  // Вложенный маршрут: "/details/:id" -> ["details", "id_книги"]
  if (slug[0] === 'details' && slug.length === 2) {
    const bookId = slug[1];
    return (
      <App>
        <BookDetails id={bookId} />
      </App>
    );
  }

  // Маршрут: "/about" -> ["about"]
  if (slug[0] === 'about' && slug.length === 1) {
    return <About />;
  }

  // Все остальные несовпадающие пути -> Глобальная 404
  return <NotFound />;
};
