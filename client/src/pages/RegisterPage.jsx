import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import AuthLayout from '../components/AuthLayout';
import { useAuthStore } from '../store/authStore';
import { api, formatMoney } from '../lib/api';

export function FloatingBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/30 blur-3xl animate-float" />
      <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-amber-500/20 blur-3xl animate-float-slow" />
      <div className="absolute bottom-[-6rem] left-1/4 h-72 w-72 rounded-full bg-emerald-600/20 blur-3xl animate-float" />
      <div className="absolute inset-0 bg-mesh-emerald" />
    </div>
  );
}

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    charityId: '',
    contributionPercent: 10,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const { data: charities = [], isLoading: charitiesLoading, isError: charitiesError } = useQuery({
    queryKey: ['charities', 'all'],
    queryFn: () => api.getCharities(),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.charityId) {
      setError('Please choose a charity to support before continuing.');
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate('/pricing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="relative min-h-screen overflow-hidden bg-[#f7f8f3] text-slate-900">
        <FloatingBlobs />

        <AuthLayout 
          mode="split" 
          headline="Play golf. Change lives." 
          subline="Track your scores. Win monthly prizes. Support charities."
        >
          <div className="relative z-10 space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wider text-emerald-800 uppercase rounded-full bg-emerald-100/60 border border-emerald-200/80 mb-3">
                <Sparkles size={12} className="text-emerald-600" /> Fairway & Fund
              </span>
              <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">Create an account</h2>
              <p className="mt-1 text-sm text-slate-600">Join the club that plays for something bigger.</p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50/90 p-3.5 text-sm text-red-700"
                >
                  <AlertCircle size={18} className="shrink-0 text-red-500" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First & Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">First name</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Jane"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Last name</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    minLength={8}
                    className="w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Charity Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Choose a charity to support</label>
                {charitiesLoading ? (
                  <div className="flex items-center justify-center p-4 rounded-xl bg-white/50 border border-slate-200">
                    <Loader2 className="animate-spin text-emerald-600" size={18} />
                    <span className="ml-2 text-xs text-slate-600">Loading causes...</span>
                  </div>
                ) : charitiesError ? (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl">Could not load charities.</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2 max-h-48 overflow-y-auto pr-1">
                    {charities.map((charity) => {
                      const selected = form.charityId === charity._id;
                      return (
                        <button
                          key={charity._id}
                          type="button"
                          onClick={() => setForm({ ...form, charityId: charity._id })}
                          className={`rounded-xl border p-3 text-left transition ${
                            selected
                              ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                              : 'border-slate-200/80 bg-white/60 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <h3 className="text-xs font-bold text-slate-900">{charity.name}</h3>
                            {selected && <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />}
                          </div>
                          <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">{charity.shortDescription}</p>
                          <p className="mt-1.5 text-[10px] font-semibold text-emerald-700">
                            {formatMoney(charity.totalRaisedSnapshot)} raised
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Contribution Percentage */}
              <div className="rounded-xl bg-slate-100/60 border border-slate-200/80 p-3 space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-700">Charitable Allocation</label>
                  <span className="text-xs font-bold text-emerald-800 px-2 py-0.5 rounded-full bg-emerald-100">
                    {form.contributionPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={form.contributionPercent}
                  onChange={(e) => setForm({ ...form, contributionPercent: Number(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-500">
                  Minimum 10% of your recurring membership is directly allocated to your chosen charity.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || charitiesLoading || !form.charityId}
                className="w-full rounded-2xl bg-emerald-500 py-3.5 px-6 font-medium text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-emerald-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </AuthLayout>
      </div>
    </Layout>
  );
}