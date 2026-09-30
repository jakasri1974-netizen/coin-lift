import React, { useState } from 'react';
import { Users, Layers, CheckCircle2, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignupPage({ onNavigate }) {
  const { register } = useAuth();
  const [role, setRole] = useState('creator'); // 'creator' or 'project'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [signedUp, setSignedUp] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      await register({ name, email, password, role });
      setSignedUp(true);
      setTimeout(() => {
        onNavigate('/dashboard');
      }, 1000);
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 bg-[#FAF8FF] min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg mx-auto px-4 relative z-10">
        
        <div className="rounded-3xl bg-white/90 border border-purple-100 p-8 shadow-xl shadow-purple-900/5 backdrop-blur-xl relative overflow-hidden">
          
          <div className="flex flex-col items-center text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 text-[11px] font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Join CrypLift Marketplace</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 font-sans">
              Create Your Account
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Select your role to unlock Web3 creator collaborations
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {signedUp ? (
            <div className="py-10 text-center space-y-3">
              <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
              <h3 className="text-xl font-bold text-slate-900">Account Created!</h3>
              <p className="text-xs text-slate-600">Welcome to CrypLift. Redirecting to workspace home...</p>
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
                      ? 'bg-purple-50 border-purple-500 text-purple-950 shadow-md shadow-purple-500/10'
                      : 'bg-white border-purple-100 text-slate-500 hover:text-slate-900 hover:border-purple-200'
                  }`}
                >
                  <Users className={`w-6 h-6 mb-2 ${role === 'creator' ? 'text-purple-600' : 'text-slate-400'}`} />
                  <p className="text-xs font-bold text-slate-900">I am a Creator</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Discover Web3 project briefs</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('project')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    role === 'project'
                      ? 'bg-pink-50 border-pink-500 text-pink-950 shadow-md shadow-pink-500/10'
                      : 'bg-white border-purple-100 text-slate-500 hover:text-slate-900 hover:border-purple-200'
                  }`}
                >
                  <Layers className={`w-6 h-6 mb-2 ${role === 'project' ? 'text-pink-600' : 'text-slate-400'}`} />
                  <p className="text-xs font-bold text-slate-900">I am a Project</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Launch creator campaigns</p>
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  {role === 'creator' ? 'Full Name / Channel Handle' : 'Project / Organization Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={role === 'creator' ? 'Alex Vance (@vance_crypto)' : 'NovaX Foundation'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white text-xs text-slate-800 p-3.5 rounded-xl border border-purple-100 focus:outline-none focus:border-purple-500 shadow-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="contact@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white text-xs text-slate-800 p-3.5 rounded-xl border border-purple-100 focus:outline-none focus:border-purple-500 shadow-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Create Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white text-xs text-slate-800 p-3.5 rounded-xl border border-purple-100 focus:outline-none focus:border-purple-500 shadow-sm"
                />
              </div>

              <div className="text-[11px] text-slate-500 leading-relaxed">
                By creating an account, you agree to CrypLift's{' '}
                <a href="#" className="text-purple-600 hover:underline font-medium">Terms of Service</a> and{' '}
                <a href="#" className="text-purple-600 hover:underline font-medium">Privacy Policy</a>.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#5146E5] via-[#7C3AED] to-[#A855F7] text-white font-bold text-xs shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-60"
              >
                <span>{loading ? 'Creating Account...' : `Get Started as ${role === 'creator' ? 'Creator' : 'Project'}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          )}

          <div className="mt-6 pt-4 border-t border-purple-100 text-center text-xs text-slate-600">
            Already have an account?{' '}
            <button onClick={() => onNavigate('/login')} className="text-purple-600 font-bold hover:underline">
              Log In
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
