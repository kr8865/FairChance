import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { Layout } from '../components/Layout';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

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

export default function PricingPage() {
  const [plan, setPlan] = useState('monthly');
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: plans } = useQuery({ queryKey: ['plans'], queryFn: api.getPlans });

  const subscribe = useMutation({
    mutationFn: () => api.subscribe(plan),
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      navigate('/dashboard?subscribed=1');
    },
  });

  const handleSubscribe = () => {
    if (!user) {
      navigate('/register');
      return;
    }
    subscribe.mutate();
  };

  const features = [
    'Monthly prize draw auto-entry',
    'Rolling 5-score Stableford tracking',
    '10%+ contribution to your chosen charity',
    'Verified scorecard payouts & transparent prize pool',
  ];

  return (
    <Layout>
      <div className="relative min-h-screen overflow-hidden bg-[#f7f8f3] text-slate-900 py-16 px-4 sm:px-6 lg:px-8">
        <FloatingBlobs />

        <div className="relative mx-auto max-w-4xl z-10">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold tracking-widest text-emerald-800 uppercase rounded-full bg-emerald-100/70 border border-emerald-200">
              <Sparkles size={12} className="text-emerald-600" /> Fairway & Fund
            </span>
            <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-slate-900">
              Simple, purposeful pricing
            </h1>
            <p className="text-slate-600 text-sm sm:text-base font-light">
              Every plan includes prize draw entry, score tracking, and direct charitable giving.
            </p>
          </div>

          {/* Toggle Button */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex p-1.5 rounded-full bg-slate-200/70 backdrop-blur-md border border-slate-300/50 shadow-inner">
              {['monthly', 'yearly'].map((p) => {
                const isActive = plan === p;
                return (
                  <button
                    key={p}
                    onClick={() => setPlan(p)}
                    className={`relative rounded-full px-6 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                      isActive
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {p}
                    {p === 'yearly' && (
                      <span className="ml-1.5 rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-300/40">
                        Save ₹1,989
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card */}
          <motion.div
            key={plan}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mx-auto mt-10 max-w-md rounded-[2.5rem] bg-white/80 p-8 sm:p-10 backdrop-blur-xl border border-white shadow-xl shadow-slate-200/50 text-center"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200">
                {plan} Billing
              </span>
              {plan === 'yearly' && (
                <span className="text-xs font-bold text-amber-800 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-200">
                  {plans?.yearly?.discount ?? 'Save ₹1,989'} vs monthly
                </span>
              )}
            </div>

            {/* Price Tag in INR (Rupees) */}
            <div className="mt-4 flex items-baseline justify-center gap-1">
              <span className="font-serif text-5xl font-extrabold text-slate-900">
                {plan === 'monthly' ? plans?.monthly?.label ?? '₹999' : plans?.yearly?.label ?? '₹9,999'}
              </span>
              <span className="text-sm font-medium text-slate-500">
                /{plan === 'monthly' ? 'mo' : 'yr'}
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Cancel or switch anytime. Flexible membership.
            </p>

            {/* Features */}
            <div className="mt-8 text-left border-t border-slate-100 pt-6 space-y-3.5">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-emerald-100 p-1 text-emerald-700 shrink-0">
                    <Check size={14} strokeWidth={2.5} />
                  </div>
                  <span className="text-xs font-medium text-slate-700 leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>

            {/* Error state */}
            <AnimatePresence>
              {subscribe.isError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200"
                >
                  <AlertCircle size={16} className="shrink-0 text-red-500" />
                  <span>{subscribe.error instanceof Error ? subscribe.error.message : 'Subscription failed'}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleSubscribe}
              disabled={subscribe.isPending}
              className="mt-8 w-full rounded-2xl bg-emerald-500 py-3.5 px-6 font-medium text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {subscribe.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : user ? (
                'Subscribe now'
              ) : (
                'Get started'
              )}
            </motion.button>

            {/* Footer Notice */}
            <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
              <span>
                {plans?.stripeEnabled
                  ? 'Secure payment processing powered by Stripe.'
                  : 'Demo mode: subscription activates instantly without real billing.'}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}