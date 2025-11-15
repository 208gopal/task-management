import { FaUsers, FaRegCheckSquare, FaChartBar, FaCode, FaRegLightbulb, FaTrophy } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useEffect, useMemo, useState } from 'react';

type Colors = {
  navy: { darkest: string; darker: string; dark: string; medium: string; light: string };
  primary: string;
  accent: string;
  border: string;
  muted: string;
  white: string;
};

const DARK_COLORS: Colors = {
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

const LIGHT_COLORS: Colors = {
  navy: {
    darkest: 'hsl(0, 0%, 100%)',
    darker: 'hsl(0, 0%, 98%)',
    dark: 'hsl(0, 0%, 96%)',
    medium: 'hsl(0, 0%, 94%)',
    light: 'hsl(0, 0%, 92%)',
  },
  primary: 'hsl(210, 80%, 45%)',
  accent: 'hsl(260, 70%, 50%)',
  border: 'hsl(0, 0%, 86%)',
  muted: 'hsl(220, 10%, 35%)',
  white: 'hsl(220, 20%, 10%)',
};

const acmLogo = "https://bvcoe.acm.org/static/media/ACM-BVP-logo.6425d80f.png";

export default function Home({
  onLogin,
  onSignup,
}: {
  onLogin: () => void;
  onSignup: () => void;
}) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('theme_dark');
      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    // Clear hash on mount to prevent unwanted scrolling
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    
    // Handle hash navigation only when clicking anchor links, not on page load
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        // Only scroll if hash navigation happens after page is loaded
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };
    
    // Listen for hash changes from anchor link clicks
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    try { localStorage.setItem('theme_dark', JSON.stringify(isDarkMode)); } catch {}
    document.body.style.backgroundColor = isDarkMode ? DARK_COLORS.navy.darkest : LIGHT_COLORS.navy.darkest;
  }, [isDarkMode]);

  const COLORS = useMemo<Colors>(() => (isDarkMode ? DARK_COLORS : LIGHT_COLORS), [isDarkMode]);

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    aboutSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.navy.darkest }}>
      <Navbar
        mode="home"
        onLogoClick={() => {}}
        onLoginClick={onLogin}
        onSignupClick={onSignup}
      />

      <section className="relative px-4 py-20 sm:py-32" style={{ background: `linear-gradient(135deg, ${COLORS.navy.darker}, ${COLORS.navy.dark})` }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-glow-pulse" style={{ backgroundColor: `${COLORS.primary}15` }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-glow-pulse" style={{ backgroundColor: `${COLORS.accent}15`, animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in-up" style={{ color: COLORS.white }}>
            Association for Computing
            <span className="block mt-2" style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              and Machinery
            </span>
          </h1>
          <p className="text-xl sm:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s', color: COLORS.muted }}>
            Empowering the next generation of tech innovators at BVCOE through collaboration, innovation, and technical excellence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <button onClick={onLogin} className="px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg flex items-center justify-center transform hover:scale-105 hover:shadow-xl" style={{ backgroundColor: COLORS.primary, color: COLORS.white }}>
              Access Dashboard
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button onClick={scrollToAbout} className="px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg transform hover:scale-105 hover:shadow-xl border" style={{ backgroundColor: 'transparent', color: COLORS.white, borderColor: COLORS.primary }}>
              Learn More
            </button>
          </div>
        </div>
      </section>

      <section id="about" className="px-4 py-20" style={{ backgroundColor: COLORS.navy.darker }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 animate-fade-in-up" style={{ color: COLORS.white }}>About ACM BVCOE</h2>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed animate-fade-in mb-12" style={{ animationDelay: '0.2s', color: COLORS.muted }}>
              We are a vibrant community of computing enthusiasts at Bharati Vidyapeeth's College of Engineering,
              dedicated to advancing knowledge in computing, fostering innovation, and building technical excellence
              through collaborative learning and hands-on projects.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <FaCode className="text-white" size={28} />, title: 'Technical Workshops', description: 'Regular hands-on workshops covering cutting-edge technologies, programming languages, and industry best practices to enhance your technical skills.' },
              { icon: <FaRegLightbulb className="text-white" size={28} />, title: 'Innovation Projects', description: 'Collaborate on real-world projects, hackathons, and competitions that challenge your creativity and problem-solving abilities.' },
              { icon: <FaTrophy className="text-white" size={28} />, title: 'Competitive Programming', description: 'Join our competitive programming sessions, participate in coding contests, and sharpen your algorithmic thinking with fellow enthusiasts.' },
            ].map((feature, idx) => (
              <div key={idx} className="border rounded-xl p-8 hover:border-blue-400/50 transition-all transform hover:scale-105 hover:shadow-xl" style={{ backgroundColor: COLORS.navy.darkest, borderColor: COLORS.border }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-lg" style={{ backgroundColor: COLORS.primary }}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: COLORS.white }}>{feature.title}</h3>
                <p className="leading-relaxed" style={{ color: COLORS.muted }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="px-4 py-20" style={{ backgroundColor: COLORS.navy.darkest }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 animate-fade-in-up" style={{ color: COLORS.white }}>Platform Features</h2>
            <p className="text-xl max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s', color: COLORS.muted }}>
              Our task management system streamlines collaboration and ensures efficient workflow across all ACM BVCOE initiatives
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <FaUsers className="text-white" size={28} />, title: 'Hierarchical Management', description: 'Core members assign to department heads, with built-in oversight and workflow control.' },
              { icon: <FaRegCheckSquare className="text-white" size={28} />, title: 'Smart Task Tracking', description: 'Accept, reject, or complete tasks with built-in deadline monitoring and status updates.' },
              { icon: <FaChartBar className="text-white" size={28} />, title: 'Performance Insights', description: 'Real-time analytics and progress tracking for better team performance.' },
            ].map((feature, idx) => (
              <div key={idx} className="border rounded-xl p-8 hover:border-blue-400/50 transition-all transform hover:scale-105 hover:shadow-xl" style={{ backgroundColor: COLORS.navy.darker, borderColor: COLORS.border }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-lg" style={{ backgroundColor: COLORS.primary }}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: COLORS.white }}>{feature.title}</h3>
                <p className="leading-relaxed" style={{ color: COLORS.muted }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="team" className="px-4 py-20" style={{ backgroundColor: COLORS.navy.darker }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 animate-fade-in-up" style={{ color: COLORS.white }}>Our Core Team</h2>
            <p className="text-xl max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s', color: COLORS.muted }}>
              Meet the dedicated leaders driving our community forward
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { name: 'Satvik Phour', role: 'Chairperson ACM', img: 'https://bvcoe.acm.org/static/media/Satvik.e30a3550.jpg', description: "Steering ACM BVCOE's strategic vision and fostering a culture of technical excellence and innovation" },
              { name: 'Harsh Raj', role: 'Vice Chairperson ACM', img: 'https://bvcoe.acm.org/static/media/HarshRaj.f239c0ac.JPG', description: 'Supporting leadership initiatives and coordinating cross-functional teams to drive organizational success' },
              { name: 'Sanskar Kannaujia', role: 'General Secretary', img: 'https://bvcoe.acm.org/static/media/Sanskar.eeeeb9bf.webp', description: 'Managing day-to-day operations and ensuring seamless communication across all ACM chapters and events' },
              { name: 'Harshit Bareja', role: 'Vice Chair ACM-W', img: 'https://bvcoe.acm.org/static/media/Harshit.8e48aef6.JPG', description: 'Championing diversity in computing and leading initiatives to empower women in technology' },
              { name: 'Teena Kaintura', role: 'WebMaster ACM', img: 'https://bvcoe.acm.org/static/media/Teena.a1f2bb7a.jpg', description: 'Maintaining digital infrastructure and creating innovative web solutions for the ACM community' },
              { name: 'Manya Sharma', role: 'General Secretary ACM', img: 'https://bvcoe.acm.org/static/media/Manya.afac2d5c.png', description: 'Coordinating member activities and organizing technical workshops to enhance skill development' },
              { name: 'Hitesh', role: 'Treasurer ACM', img: 'https://bvcoe.acm.org/static/media/hitesh.6a82ccbf.jpg', description: 'Managing financial resources and ensuring transparent budget allocation for all ACM initiatives' },
              { name: 'Riya Raj', role: 'Membership Chair ACM', img: 'https://bvcoe.acm.org/static/media/Riya.2f2238f9.jpg', description: 'Building community engagement and onboarding new members into the ACM BVCOE family' },
            ].map((member, idx) => (
              <div key={idx} className="border rounded-xl p-8 text-center hover:border-blue-400/50 transition-all transform hover:scale-105 hover:shadow-xl" style={{ backgroundColor: COLORS.navy.darkest, borderColor: COLORS.border }}>
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-6 overflow-hidden ring-4 shadow-lg" style={{ boxShadow: `0 0 0 4px ${COLORS.primary}33` }}>
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: COLORS.white }}>{member.name}</h3>
                <p className="font-semibold mb-4" style={{ color: COLORS.primary }}>{member.role}</p>
                <p className="leading-relaxed" style={{ color: COLORS.muted }}>
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${COLORS.primary}e6, ${COLORS.accent}e6)` }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: `${COLORS.primary}40` }}></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: `${COLORS.accent}40` }}></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 animate-fade-in-up" style={{ color: COLORS.white }}>Ready to Begin?</h2>
          <p className="text-xl mb-8 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s', color: COLORS.white }}>
            Join ACM BVCOE today and become part of our vibrant community advancing computing education and innovation
          </p>
          <button onClick={onSignup} className="px-10 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 hover:shadow-xl animate-scale-in-up" style={{ animationDelay: '0.4s', backgroundColor: COLORS.white, color: COLORS.primary }}>
            Join Now
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}


