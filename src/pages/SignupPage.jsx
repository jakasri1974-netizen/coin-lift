import React, { useState } from 'react';
import { ArrowUpRight, Users, Layers, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

export default function SignupPage({ onNavigate }) {
  const [role, setRole] = useState('creator'); // 'creator' or 'project'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [signedUp, setSignedUp] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSignedUp(true);
    setTimeout(() => {
      onNavigate('/');
    }, 1500);
  };

  return (
    <div className="pt-28 pb-20 bg-[#05070e] min-h-screen flex items-center justify-center">
      <div className="w-full max-w-lg mx-auto px-4">
        
        <div className="rounded-3xl bg-[#090e1a] border border-white/10 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          
          <div className="flex flex-col items-center text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Join COINLIFT Marketplace</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white font-sans">
              Create Your Account
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select your role to unlock Web3 creator collaborations
            </p>
          </div>

          {signedUp ? (
            <div className="py-10 text-center space-y-3">
              <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-xl font-bold text-white">Account Created!</h3>
              <p className="text-xs text-slate-400">Welcome to COINLIFT. Redirecting to workspace home...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Role Selector Cards */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setRole('creator')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    role === 'creator'
                      ? 'bg-purple-500/15 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                      : 'bg-[#05070e] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className={`w-6 h-6 mb-2 ${role === 'creator' ? 'text-purple-400' : 'text-slate-500'}`} />
                  <p className="text-xs font-bold text-white">I am a Creator</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Discover Web3 project briefs</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('project')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    role === 'project'
                      ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                      : 'bg-[#05070e] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className={`w-6 h-6 mb-2 ${role === 'project' ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <p className="text-xs font-bold text-white">I am a Project</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Launch creator campaigns</p>
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  {role === 'creator' ? 'Full Name / Channel Handle' : 'Project / Organization Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={role === 'creator' ? 'Alex Vance (@vance_crypto)' : 'NovaX Foundation'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#05070e] text-xs text-white p-3.5 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="contact@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#05070e] text-xs text-white p-3.5 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Create Password</label>
                <input
                  type="password"
                  required
                  placeholder="At least 8 characters..."
                  className="w-full bg-[#05070e] text-xs text-white p-3.5 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed">
                By creating an account, you agree to COINLIFT's{' '}
                <a href="#" className="text-cyan-400 hover:underline">Terms of Service</a> and{' '}
                <a href="#" className="text-cyan-400 hover:underline">Privacy Policy</a>.
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2"
              >
                <span>Get Started as {role === 'creator' ? 'Creator' : 'Project'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          )}

          <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <button onClick={() => onNavigate('/login')} className="text-cyan-400 font-bold hover:underline">
              Log In
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
