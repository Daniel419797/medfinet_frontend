import { Moon, Sun } from '@phosphor-icons/react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

const ThemeToggle = ({ className = '', showLabel = false }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();
  const actionLabel = `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={actionLabel}
      className={`mf-icon-button ${className}`}
      title={actionLabel}
    >
      {theme === 'light' ? (
        <>
          <Moon size={20} />
          {showLabel && <span className="ml-2 text-sm">Dark Mode</span>}
        </>
      ) : (
        <>
          <Sun size={20} />
          {showLabel && <span className="ml-2 text-sm">Light Mode</span>}
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
