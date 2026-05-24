import { Link } from 'react-router';

import Button from '@/components/Button';

export const About = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center transition-colors duration-500">
      <div className="max-w-xl bg-card/70 backdrop-blur-xl p-10 rounded-3xl border border-border-custom shadow-xl animate-in fade-in zoom-in-95 duration-300">
        <h1 className="text-3xl font-black text-foreground mb-6 tracking-tight">About Books Catalogue</h1>

        <section className="mb-8 text-left border-b border-border-custom pb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Author Information</h2>
          <p className="text-foreground font-medium mb-1">
            Developer:{' '}
            <a
              href="https://github.com/anastan588"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary hover:brightness-110 font-bold transition-all group"
            >
              <span className="underline decoration-primary/30 group-hover:decoration-primary">
                Anastasiya Andronava (anastan588)
              </span>
            </a>
          </p>
          <p className="text-muted text-sm leading-relaxed">
            This book searching app interacts with the Open Library API.
          </p>
        </section>

        <section className="mb-8 text-left">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Education Platform</h2>
          <p className="text-muted text-sm leading-relaxed mb-4">Developed as a project of RS School React Course.</p>
          <a
            className="text-primary hover:brightness-110 font-bold text-sm underline decoration-primary/30 hover:decoration-primary transition-all"
            href="https://rs.school/courses/reactjs"
            rel="noopener noreferrer"
            target="_blank"
          >
            RS School React Course Official Site
          </a>
        </section>

        <div className="flex justify-center gap-3">
          <Link to="/">
            <Button className="px-6 py-3 text-sm font-bold rounded-xl bg-primary text-white hover:brightness-110 transition-all shadow-md active:scale-98">
              Back to main page
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
