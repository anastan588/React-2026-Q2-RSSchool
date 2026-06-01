import Button from '@/components/Button';
import { useTheme } from '@/context/ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border backdrop-blur-md bg-card/60 border-border-custom text-foreground hover:bg-card hover:text-primary hover:border-primary/30 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
      onClick={toggleTheme}
    >
      <span className="uppercase tracking-wider font-black text-current">
        {theme === 'light' ? 'Dark theme' : 'Light theme'}
      </span>
    </Button>
  );
};

export default ThemeToggle;
