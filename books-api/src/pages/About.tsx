import { Link } from 'react-router';

import Button from '@/components/Button';

export const About = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="max-w-xl bg-white p-10 rounded-3xl border border-zinc-200 shadow-sm animate-in fade-in zoom-in-95 duration-200">
        <h1 className="text-3xl font-black text-slate-800 mb-6 tracking-tight">About Books Catalogue</h1>
        <section className="mb-8 text-left border-b border-zinc-100 pb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-3">Author Information</h2>
          <p className="text-zinc-700 font-medium mb-1">
            Developer:
            <a
              href="https://github.com/anastan588"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-bold transition-colors group"
            >
              <span>Anastasiya Andronava (anastan588)</span>
            </a>
          </p>
          <p className="text-zinc-500 text-sm leading-relaxed">
            This book searching app interacts with the Open Library API.
          </p>
        </section>

        <section className="mb-8 text-left">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-3">Education Platform</h2>
          <p className="text-zinc-600 text-sm leading-relaxed mb-4">
            Developed as a project of RS School React Course.
          </p>
          <a
            className="text-indigo-600 hover:text-indigo-800 font-bold text-sm underline transition-colors"
            href="https://rs.school/courses/reactjs"
            rel="noopener noreferrer"
            target="_blank"
          >
            RS School React Course Official Site
          </a>
        </section>

        <div className="flex justify-center gap-3">
          <Link to="/">
            <Button className="px-6 py-3 text-sm bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-md transition-all">
              Back to main page
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
