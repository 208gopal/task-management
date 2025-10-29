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

const acmLogo = "https://bvcoe.acm.org/static/media/ACM-BVP-logo.6425d80f.png";

export default function Footer() {
  return (
    <footer className="border-t px-4 py-12" style={{ backgroundColor: COLORS.navy.darkest, borderColor: COLORS.border }}>
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <img src={acmLogo} alt="ACM BVCOE Logo" className="h-8 w-auto" />
          <div className="text-2xl font-bold" style={{ color: COLORS.white }}>ACM BVCOE</div>
        </div>
        <p style={{ color: COLORS.muted }}>© 2025 ACM Society of BVCOE. All rights reserved.</p>
      </div>
    </footer>
  );
}


