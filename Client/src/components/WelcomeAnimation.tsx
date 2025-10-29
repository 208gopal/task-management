import { useEffect } from 'react';
import AdminDashboard from './AdminDashboard';

const acmLogo = "https://bvcoe.acm.org/static/media/ACM-BVP-logo.6425d80f.png";

interface WelcomeAnimationProps {
  onComplete: () => void;
}

export default function WelcomeAnimation({ onComplete }: WelcomeAnimationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1128] via-[#0f1941] to-[#1a2850] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="text-center z-10 animate-welcome-fade-in">
        <div className="mb-8 flex justify-center animate-welcome-scale">
          <img src={acmLogo} alt="ACM BVCOE Logo" className="h-32 w-auto" />
        </div>

        <h1 className="text-6xl font-bold text-white mb-4 animate-welcome-slide-up">
          Welcome to ACM 
        </h1>

        <p className="text-2xl text-blue-300 animate-welcome-slide-up" style={{ animationDelay: '0.3s' }}>
          Loading your dashboard...
        </p>

        <div className="mt-8 flex justify-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}
