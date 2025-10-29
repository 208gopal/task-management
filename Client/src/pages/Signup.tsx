import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import api from '../lib/api';
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

export default function Signup({
  onBackHome,
  onGoLogin,
}: {
  onBackHome: () => void;
  onGoLogin: () => void;
}) {
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailInput = (document.getElementById('signup-email') as HTMLInputElement).value;
    const firstName = (document.getElementById('first-name') as HTMLInputElement).value;
    const lastName = (document.getElementById('last-name') as HTMLInputElement).value;
    const position = (document.getElementById('position') as HTMLSelectElement).value as Role;
    const branch = (document.getElementById('branch') as HTMLSelectElement).value;
    const year = (document.getElementById('year') as HTMLSelectElement).value;
    const section = (document.getElementById('section') as HTMLSelectElement).value;
    const department = (document.getElementById('department') as HTMLSelectElement).value;
    const phoneNumber = (document.getElementById('phone-number') as HTMLInputElement).value;
    const passwordInput = (document.getElementById('signup-password') as HTMLInputElement).value;

    if (!emailInput || !firstName || !lastName || !phoneNumber || !passwordInput || !branch || !year || !section || !department) {
      alert('Please fill in all required fields');
      return;
    }

    if (passwordInput.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    try {
      const body = new URLSearchParams();
      body.set('name', `${firstName} ${lastName}`.trim());
      body.set('email', emailInput);
      body.set('phone', phoneNumber);
      body.set('password', passwordInput);
      body.set('role', position);
      body.set('branch', branch);
      body.set('year', year);
      body.set('section', section);
      body.set('department', department);

      await api.post('/auth/signup', body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      alert('Signup successful. Awaiting admin approval. You can log in after approval.');
      onGoLogin();
    } catch (err: any) {
      console.log(err);
      const status = err?.response?.status;
      const serverMessage = err?.response?.data?.message;
      const message = `Signup failed${status ? ` (${status})` : ''}${serverMessage ? `: ${serverMessage}` : ''}`;
      alert(message);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.navy.darkest }}>
      <Navbar mode="authMinimal" onLogoClick={onBackHome} />

      <div className="flex items-center justify-center px-4 py-16 animate-fade-in">
        <div className="border rounded-2xl p-9 w-full max-w-xl shadow-2xl hover:shadow-xl transition-all duration-300" style={{ backgroundColor: COLORS.navy.darker, borderColor: COLORS.border }}>
          <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.white }}>Join ACM BVCOE</h2>
          <p className="mb-8" style={{ color: COLORS.muted }}>Create your account to get started</p>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first-name" className="block text-lg font-medium mb-2" style={{ color: COLORS.white }}>First Name</label>
                <input type="text" id="first-name" required className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all" style={{ backgroundColor: COLORS.navy.darkest, borderColor: COLORS.border, color: COLORS.white }} placeholder="First Name" />
              </div>
              <div>
                <label htmlFor="last-name" className="block text-lg font-medium mb-2" style={{ color: COLORS.white }}>Last Name</label>
                <input type="text" id="last-name" required className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all" style={{ backgroundColor: COLORS.navy.darkest, borderColor: COLORS.border, color: COLORS.white }} placeholder="Last Name" />
              </div>
            </div>

            <div>
              <label htmlFor="position" className="block text-lg font-medium mb-2" style={{ color: COLORS.white }}>Position</label>
              <select id="position" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all" style={{ backgroundColor: COLORS.navy.darkest, borderColor: COLORS.border, color: COLORS.white }}>
                <option value="member">Member</option>
                <option value="core-member">Core Member</option>
                <option value="head-of-dept">Head of Department</option>
              </select>
            </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="branch" className="block text-lg font-medium mb-2" style={{ color: COLORS.white }}>Branch</label>
              <select id="branch" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all" style={{ backgroundColor: COLORS.navy.darkest, borderColor: COLORS.border, color: COLORS.white }}>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="ICE">MECH</option>
              </select>
            </div>
            <div>
              <label htmlFor="year" className="block text-lg font-medium mb-2" style={{ color: COLORS.white }}>Year</label>
              <select id="year" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all" style={{ backgroundColor: COLORS.navy.darkest, borderColor: COLORS.border, color: COLORS.white }}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="section" className="block text-lg font-medium mb-2" style={{ color: COLORS.white }}>Section</label>
              <select id="section" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all" style={{ backgroundColor: COLORS.navy.darkest, borderColor: COLORS.border, color: COLORS.white }}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>
            <div>
              <label htmlFor="department" className="block text-lg font-medium mb-2" style={{ color: COLORS.white }}>ACM Department</label>
              <select id="department" className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all" style={{ backgroundColor: COLORS.navy.darkest, borderColor: COLORS.border, color: COLORS.white }}>
                <option value="Technical">Technical</option>
                <option value="Social Media">Social Media</option>
                <option value="Content & Documentation">Content & Documentation</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Event Management">Event Management</option>
              </select>
            </div>
          </div>

            <div>
              <label htmlFor="signup-email" className="block text-lg font-medium mb-2" style={{ color: COLORS.white }}>Email ID</label>
              <input type="email" id="signup-email" required className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all" style={{ backgroundColor: COLORS.navy.darkest, borderColor: COLORS.border, color: COLORS.white }} placeholder="your.email@example.com" />
            </div>

            <div>
              <label htmlFor="phone-number" className="block text-lg font-medium mb-2" style={{ color: COLORS.white }}>Phone Number</label>
              <input type="tel" id="phone-number" required className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all" style={{ backgroundColor: COLORS.navy.darkest, borderColor: COLORS.border, color: COLORS.white }} placeholder="+91 98765 43210" pattern="[+]?[0-9\s\-\(\)]{10,}" title="Please enter a valid phone number" />
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-lg font-medium mb-2" style={{ color: COLORS.white }}>Password</label>
              <div className="relative">
                <input type={showSignupPassword ? 'text' : 'password'} id="signup-password" required className="w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition-all" style={{ backgroundColor: COLORS.navy.darkest, borderColor: COLORS.border, color: COLORS.white }} placeholder="••••••••" />
                <button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors" style={{ color: COLORS.muted }}>
                  {showSignupPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg text-xl" style={{ backgroundColor: COLORS.primary, color: COLORS.white }}>
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-lg" style={{ color: COLORS.muted }}>
              Already have an account?{' '}
              <button onClick={onGoLogin} className="font-medium transition-colors hover:text-white" style={{ color: COLORS.primary }}>
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


