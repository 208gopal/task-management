import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api, { setAuthToken } from '../lib/api';
import Navbar from '../components/Navbar';

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

type Role = 'member' | 'core-member' | 'head-of-dept';

export default function Login({
  onBackHome,
  onGoSignup,
  onLoginSuccess,
}: {
  onBackHome: () => void;
  onGoSignup: () => void;
  onLoginSuccess: (email: string, role: Role) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailInput = (document.getElementById('email') as HTMLInputElement).value;
    const passwordInput = (document.getElementById('password') as HTMLInputElement).value;

    if (!emailInput || !passwordInput) {
      alert('Please enter your email address and password');
      return;
    }

    try {
      const response = await api.post('/auth/login', {
        email: emailInput,
        password: passwordInput,
      });
      const token = response.data?.token as string | undefined;
      if (token) {
        setAuthToken(token);
        try { localStorage.setItem('auth_token', token); } catch {}
      }
      const respRole = (response.data?.user?.role as Role) || 'member';
      onLoginSuccess(emailInput, respRole);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Login failed';
      alert(message);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.navy.darkest }}>
      <Navbar mode="authMinimal" onLogoClick={onBackHome} />

      <div className="flex items-center justify-center px-4 py-16 animate-fade-in">
        <div className="border rounded-2xl p-9 w-full max-w-xl shadow-2xl hover:shadow-xl transition-all duration-300" style={{ backgroundColor: COLORS.navy.darker, borderColor: COLORS.border }}>
          <h2 className="text-4xl font-bold mb-2" style={{ color: COLORS.white }}>Welcome Back</h2>
          <p className="mb-8 text-base" style={{ color: COLORS.muted }}>Sign in to your ACM BVCOE account</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-lg font-medium mb-2" style={{ color: COLORS.white }}>Email Address</label>
              <input type="email" id="email" required className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all" style={{ backgroundColor: COLORS.navy.darkest, borderColor: COLORS.border, color: COLORS.white }} placeholder="your.email@example.com" />
            </div>

            <div>
              <label htmlFor="password" className="block text-lg font-medium mb-2" style={{ color: COLORS.white }}>Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} id="password" required className="w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition-all" style={{ backgroundColor: COLORS.navy.darkest, borderColor: COLORS.border, color: COLORS.white }} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors" style={{ color: COLORS.muted }}>
                  {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg text-xl" style={{ backgroundColor: COLORS.primary, color: COLORS.white }}>
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-lg" style={{ color: COLORS.muted }}>
              Don't have an account?{' '}
              <button onClick={onGoSignup} className="font-medium transition-colors hover:text-white" style={{ color: COLORS.primary }}>
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


