import { useEffect, useState } from 'react';
// icons used only within Home page now
import { setAuthToken } from './lib/api';
import Dashboard from './components/Dashboard';
import WelcomeAnimation from './components/WelcomeAnimation';
import AdminDashboard from './components/AdminDashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';

// Colors and logo are now defined within page/components

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'login' | 'signup' | 'dashboard' | 'welcome'>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'member' | 'core-member' | 'head-of-dept'>('member');
  const [userEmail, setUserEmail] = useState('');
  // local states for removed inline forms (kept UI unchanged via pages)

  useEffect(() => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        setAuthToken(token);
      }
    } catch {}
    // Initialize history state for in-app navigation
    try {
      if (!window.history.state || !window.history.state.view) {
        window.history.replaceState({ view: 'home' }, '');
      }
    } catch {}
    
    const onPopState = (e: PopStateEvent) => {
      const view = (e.state && e.state.view) as typeof currentView | undefined;
      if (view === 'login' || view === 'signup' || view === 'home' || view === 'dashboard' || view === 'welcome') {
        setCurrentView(view);
        // Ensure we scroll to top when changing main views
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      } else {
        setCurrentView('home');
      }
    };
    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('home');
    setUserRole('member');
    setUserEmail('');
    try { localStorage.removeItem('auth_token'); } catch {}
    setAuthToken(null);
  };

  const handleLoginSuccess = (email: string, role: 'member' | 'core-member' | 'head-of-dept') => {
    setUserEmail(email);
    setUserRole(role);
    setIsAuthenticated(true);
    setCurrentView('welcome');
  };

  const goHome = () => {
    try {
      if (window.location.hash) {
        window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
      }
      window.history.pushState({ view: 'home' }, '');
    } catch {}
    setCurrentView('home');
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, 0);
  };
  const goLogin = () => {
    try { window.history.pushState({ view: 'login' }, ''); } catch {}
    setCurrentView('login');
  };
  const goSignup = () => {
    try { window.history.pushState({ view: 'signup' }, ''); } catch {}
    setCurrentView('signup');
  };

  const handleWelcomeComplete = () => {
    setCurrentView('dashboard');
  };

  // home page handles its own scrolling

  if (currentView === 'welcome') {
    return <WelcomeAnimation onComplete={handleWelcomeComplete} />;
  }

  // Fixed: Conditionally render AdminDashboard for core members and heads of department
  if (isAuthenticated && currentView === 'dashboard') {
    const isAdminUser = userRole === 'core-member' || userRole === 'head-of-dept';
    
    return isAdminUser ? (
      <AdminDashboard onLogout={handleLogout} userRole={userRole} />
    ) : (
      <Dashboard onLogout={handleLogout} userRole={userRole} userEmail={userEmail} />
    );
  }

  if (currentView === 'login') {
    return (
      <Login
        onBackHome={goHome}
        onGoSignup={goSignup}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  if (currentView === 'signup') {
    return (
      <Signup
        onBackHome={goHome}
        onGoLogin={goLogin}
      />
    );
  }

  return (
    <Home onLogin={goLogin} onSignup={goSignup} />
  );
}

export default App;