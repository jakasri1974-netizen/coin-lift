import React from 'react';
import { ArrowUpRight, Github, Twitter, Disc as Discord, Send, Youtube, Sparkles } from 'lucide-react';

export default function Footer({ onNavigate }) {
  const footerLinks = {
    platform: [
      { label: 'How It Works', path: '/#how-it-works' },
      { label: 'Creators', path: '/creators' },
      { label: 'Projects', path: '/projects' },
      { label: 'Campaigns', path: '/campaigns' },
    ],
    company: [
      { label: 'About Us', path: '/about' },
      { label: 'Contact', path: '/contact' },
      { label: 'Careers', path: '/careers' },
    ],
    resources: [
      { label: 'Help Center', path: '/help' },
      { label: 'Documentation', path: '/docs' },
      { label: 'FAQ', path: '/faq' },
    ],
    legal: [
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Terms of Service', path: '/terms' },
      { label: 'Risk Disclosure', path: '/risk-disclosure' },
    ]
  };

  const handleLinkClick = (path, e) => {
    e.preventDefault();
    if (path.startsWith('/#')) {
      const sectionId = path.replace('/#', '');
      onNavigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      onNavigate(path);
    }
  };

  return (
    <footer className="bg-[#0e0c24] border-t border-purple-900/40 pt-16 pb-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 pb-12 border-b border-purple-900/40">
          
          {/* Brand Info (2 columns span) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-purple-500/20">
                <ArrowUpRight className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                CRYP<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">LIFT</span>
              </span>
            </div>

            <p className="text-purple-200/80 text-xs leading-relaxed max-w-sm font-medium">
              Connecting Creator Influence with Emerging Web3. A transparent creator marketplace designed for project awareness, audience discovery, and campaign tracking.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-8 h-8 rounded-xl bg-white/5 hover:bg-purple-600 hover:text-white border border-white/10 flex items-center justify-center transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-xl bg-white/5 hover:bg-purple-600 hover:text-white border border-white/10 flex items-center justify-center transition-all">
                <Discord className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-xl bg-white/5 hover:bg-purple-600 hover:text-white border border-white/10 flex items-center justify-center transition-all">
                <Send className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-xl bg-white/5 hover:bg-purple-600 hover:text-white border border-white/10 flex items-center justify-center transition-all">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-xl bg-white/5 hover:bg-purple-600 hover:text-white border border-white/10 flex items-center justify-center transition-all">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 1: Platform */}
          <div>
            <h4 className="font-extrabold text-white uppercase text-[11px] tracking-wider mb-4 font-mono">Platform</h4>
            <ul className="space-y-2.5 font-medium">
              {footerLinks.platform.map((item) => (
                <li key={item.label}>
                  <a href={item.path} onClick={(e) => handleLinkClick(item.path, e)} className="hover:text-pink-300 transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Company */}
          <div>
            <h4 className="font-extrabold text-white uppercase text-[11px] tracking-wider mb-4 font-mono">Company</h4>
            <ul className="space-y-2.5 font-medium">
              {footerLinks.company.map((item) => (
                <li key={item.label}>
                  <a href={item.path} onClick={(e) => handleLinkClick(item.path, e)} className="hover:text-pink-300 transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="font-extrabold text-white uppercase text-[11px] tracking-wider mb-4 font-mono">Resources</h4>
            <ul className="space-y-2.5 font-medium">
              {footerLinks.resources.map((item) => (
                <li key={item.label}>
                  <a href={item.path} onClick={(e) => handleLinkClick(item.path, e)} className="hover:text-pink-300 transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h4 className="font-extrabold text-white uppercase text-[11px] tracking-wider mb-4 font-mono">Legal</h4>
            <ul className="space-y-2.5 font-medium">
              {footerLinks.legal.map((item) => (
                <li key={item.label}>
                  <a href={item.path} onClick={(e) => handleLinkClick(item.path, e)} className="hover:text-pink-300 transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-purple-300/70 text-[11px] font-medium">
          <p>© 2026 CrypLift Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              All Systems Operational
            </span>
            <span>Web3 Creator Marketplace</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

