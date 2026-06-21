import { ClientOnly } from './client';

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export function generateStaticParams() {
  return [
    { slug: [] }, // Главная страница "/"
    { slug: ['about'] }, // Страница "/about"
  ];
}

// export const dynamicParams = false;

export default async function Page({ params }: PageProps) {
  // Передаем промис params в клиентский компонент
  return <ClientOnly params={params} />;
}
