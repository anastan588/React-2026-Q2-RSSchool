import Loader from '@/components/Loader';

export default function Loading() {
  return (
    <div className="w-full max-w-350 mx-auto min-h-[600px] flex items-center justify-center">
      <Loader query="" />
    </div>
  );
}
