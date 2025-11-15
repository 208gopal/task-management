import { useState } from 'react';
import { IoMenuOutline, IoCloseOutline } from 'react-icons/io5';

const acmLogo = "https://bvcoe.acm.org/static/media/ACM-BVP-logo.6425d80f.png";

const COLORS = {
  navy: {
    darkest: 'hsl(220, 45%, 8%)',
    darker: 'hsl(220, 40%, 12%)',
    dark: 'hsl(220, 35%, 16%)',
    medium: 'hsl(220, 30%, 20%)',
    light: 'hsl(220, 25%, 25%)',
  },
  primary: 'hsl(210, 80%, 55%)',
  accent: 'hsl(260, 70%, 60%)',
  border: 'hsl(220, 25%, 30%)',
  muted: 'hsl(220, 20%, 70%)',
  white: 'hsl(0, 0%, 100%)',
};

export default function Navbar({
  mode,
  onLogoClick,
  onLoginClick,
  onSignupClick,
}: {
  mode: 'home' | 'authMinimal';
  onLogoClick: () => void;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (mode === 'authMinimal') {
    return (
      <nav className="backdrop-blur-md border-b sticky top-0 z-50 shadow-lg" style={{ backgroundColor: `${COLORS.navy.darker}e6`, borderColor: COLORS.border }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={onLogoClick} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <img src={acmLogo} alt="ACM BVCOE Logo" className="h-10 w-auto -mr-1" />
              <span className="text-3xl font-bold" style={{ color: COLORS.white }}>ACM</span>
            </button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="backdrop-blur-md border-b sticky top-0 z-50 shadow-lg animate-fade-in" style={{ backgroundColor: `${COLORS.navy.darker}e6`, borderColor: COLORS.border }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <img src={acmLogo} alt="ACM BVCOE Logo" className="h-10 w-auto" />
            <div className="text-2xl font-bold" style={{ color: COLORS.white }}>ACM</div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="#about" 
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('about');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="font-medium transition-colors hover:text-blue-300" 
              style={{ color: COLORS.white }}
            >
              About
            </a>
            <a 
              href="#features" 
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('features');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="font-medium transition-colors hover:text-blue-300" 
              style={{ color: COLORS.white }}
            >
              Features
            </a>
            <a 
              href="#team" 
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById('team');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="font-medium transition-colors hover:text-blue-300" 
              style={{ color: COLORS.white }}
            >
              Team
            </a>
            <div className="flex items-center space-x-4">
              <button onClick={onLoginClick} className="font-medium transition-colors hover:text-blue-300" style={{ color: COLORS.white }}>
                Login
              </button>
              <button onClick={onSignupClick} className="px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 hover:shadow-lg" style={{ backgroundColor: COLORS.primary, color: COLORS.white }}>
                Sign Up
              </button>
            </div>
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-lg transition-colors hover:bg-blue-900/20" style={{ color: COLORS.white }}>
            {isMenuOpen ? <IoCloseOutline size={24} /> : <IoMenuOutline size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t animate-fade-in" style={{ borderColor: COLORS.border }}>
            <a 
              href="#about" 
              onClick={(e) => {
                e.preventDefault();
                setIsMenuOpen(false);
                const element = document.getElementById('about');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="block transition-colors hover:text-blue-300" 
              style={{ color: COLORS.white }}
            >
              About
            </a>
            <a 
              href="#features" 
              onClick={(e) => {
                e.preventDefault();
                setIsMenuOpen(false);
                const element = document.getElementById('features');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="block transition-colors hover:text-blue-300" 
              style={{ color: COLORS.white }}
            >
              Features
            </a>
            <a 
              href="#team" 
              onClick={(e) => {
                e.preventDefault();
                setIsMenuOpen(false);
                const element = document.getElementById('team');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="block transition-colors hover:text-blue-300" 
              style={{ color: COLORS.white }}
            >
              Team
            </a>
            <div className="pt-4 space-y-3 border-t" style={{ borderColor: COLORS.border }}>
              <button onClick={onLoginClick} className="block w-full text-left font-medium transition-colors hover:text-blue-300" style={{ color: COLORS.white }}>
                Login
              </button>
              <button onClick={onSignupClick} className="block w-full px-6 py-2 rounded-lg font-medium transition-colors text-center hover:shadow-lg" style={{ backgroundColor: COLORS.primary, color: COLORS.white }}>
                Sign Up
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}



