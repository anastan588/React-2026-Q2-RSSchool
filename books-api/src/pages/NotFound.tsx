import { Link, useNavigate } from 'react-router';

import Button from '@/components/Button';
import useSearchStorage from '@/hooks/StorageHook';

export const NotFound = () => {
  const navigate = useNavigate();
  const { storagePage } = useSearchStorage();

  const mainAppReturnUrl = storagePage > 1 ? `/?page=${storagePage}` : '/';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="max-w-md bg-white p-10 rounded-3xl border border-zinc-200 shadow-sm animate-in fade-in zoom-in-95 duration-200">
        <h1 className="text-7xl font-black text-slate-800 mb-4 tracking-tight">404</h1>
        <p className="text-xl font-bold text-zinc-700 mb-2">Page Not Found</p>
        <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            className="px-6 py-3 text-sm bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-all"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>

          <Link to={mainAppReturnUrl}>
            <Button className="w-full sm:w-auto px-6 py-3 text-sm bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-md transition-all">
              Return to Main App
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
