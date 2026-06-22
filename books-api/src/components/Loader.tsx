import type { LoaderProps } from '@/types/types';

const Loader = ({ query }: LoaderProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse text-muted">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
      <p className="text-lg font-medium">
        {query ? <>Searching for &quot;{query}&quot;...</> : <>Loading books catalogue...</>}
      </p>
    </div>
  );
};

export default Loader;
