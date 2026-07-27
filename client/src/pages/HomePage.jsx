import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Trophy, 
  HeartHandshake, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Target, 
  TrendingUp, 
  ShieldCheck,
  Award
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { api, formatMoney } from '../lib/api';

/* ---------------------------------------------------------------- */
/* Animated & Decorative Visual Background Components                */
/* ---------------------------------------------------------------- */

function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Floating Animated Ambient Light Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.25, 0.4, 0.25],
          x: [0, 30, 0],
          y: [0, -20, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.3, 0.15],
          x: [0, -40, 0],
          y: [0, 30, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 -right-20 h-[30rem] w-[30rem] rounded-full bg-amber-300/20 blur-3xl"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.25, 1],
          opacity: [0.2, 0.35, 0.2] 
        }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-20 left-1/3 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl"
      />

      {/* Subtle Architectural Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:28px_28px]" />
    </div>
  );
}

function FloatingVisualCard() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      {/* Main Glassmorphism Feature Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/80 p-6 sm:p-8 shadow-xl shadow-emerald-950/5 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100/80 text-emerald-700">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Scoring Entry</p>
              <h4 className="font-serif text-base font-bold text-slate-900">Stableford Round #5</h4>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 border border-emerald-200/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
            <ShieldCheck size={12} strokeWidth={2.5} /> Verified
          </span>
        </div>

        {/* Score Grid Visual */}
        <div className="mt-5 grid grid-cols-5 gap-2 text-center">
          {[38, 41, 39, 44, 42].map((pts, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="rounded-xl border border-slate-200/70 bg-slate-50/80 p-2.5 shadow-2xs transition-colors hover:border-emerald-300 hover:bg-emerald-50/50"
            >
              <span className="block text-[10px] font-bold uppercase text-slate-400">R{idx + 1}</span>
              <span className="font-serif text-lg font-bold text-slate-800">{pts}</span>
            </motion.div>
          ))}
        </div>

        {/* Automated Contribution Tracker Bar */}
        <div className="mt-6 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-900 p-4 text-white shadow-md shadow-emerald-900/10">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-200">
              <HeartHandshake size={14} className="text-emerald-400" /> Active Donation Split
            </span>
            <span className="font-serif text-amber-300">15% Allocated</span>
          </div>
          <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-emerald-950/50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '75%' }}
              transition={{ duration: 1.2, delay: 0.5 }}
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400"
            />
          </div>
        </div>
      </motion.div>

      {/* Floating Accent Badge 1: Winner Pool */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-5 -right-4 sm:-right-6 rounded-2xl border border-white/80 bg-white/90 p-3.5 shadow-lg shadow-slate-200/50 backdrop-blur-md hidden sm:flex items-center gap-3"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <Trophy size={18} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly Prize Pool</p>
          <p className="font-serif text-sm font-bold text-slate-900">25% Active Revenue</p>
        </div>
      </motion.div>

      {/* Floating Accent Badge 2: Verified Impact */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute -bottom-6 -left-4 sm:-left-6 rounded-2xl border border-white/80 bg-white/90 p-3.5 shadow-lg shadow-slate-200/50 backdrop-blur-md hidden sm:flex items-center gap-3"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <Sparkles size={18} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Guaranteed Impact</p>
          <p className="font-serif text-sm font-bold text-emerald-800">10%+ To Your Charity</p>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Main Page Component                                              */
/* ---------------------------------------------------------------- */

export default function HomePage() {
  const { data: featured = [] } = useQuery({
    queryKey: ['charities', 'featured'],
    queryFn: api.getFeaturedCharities,
  });

  return (
    <Layout>
      <div className="relative min-h-screen bg-[#f7f8f3] text-slate-900 overflow-hidden">
        <AnimatedBackground />

        {/* HERO SECTION */}
        <section className="relative pt-12 sm:pt-16 pb-16 sm:pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              
              {/* Left Column: Headline & Action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-7 space-y-6"
              >
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-100/80 px-3 py-1 text-xs font-bold tracking-wider text-emerald-800 uppercase backdrop-blur-sm">
                  <Sparkles size={12} className="text-emerald-600" />
                  Play With Purpose
                </div>

                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-slate-900">
                  Your scores.<br />
                  <span className="text-emerald-700 underline decoration-amber-400/60 decoration-wavy decoration-2">
                    Their future.
                  </span>
                </h1>

                <p className="max-w-xl text-base sm:text-lg text-slate-600 leading-relaxed">
                  Subscribe, log your last five Stableford rounds, and automatically enter monthly prize draws — while directing 10%+ of your membership to a charity of your choice.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all duration-150 hover:bg-emerald-700 active:scale-[0.98]"
                  >
                    Start Giving Back
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="/how-it-works"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 shadow-2xs backdrop-blur-md transition-all duration-150 hover:bg-white hover:border-slate-300 active:scale-[0.98]"
                  >
                    See How It Works
                  </Link>
                </div>

                {/* Compact Stat Cards Row */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="pt-4 grid grid-cols-3 gap-3 max-w-lg"
                >
                  {[
                    { label: 'To Charity', value: '10%+', sub: 'Minimum split' },
                    { label: 'Prize Pool', value: '25%', sub: 'Active revenue' },
                    { label: 'Your Entries', value: '5 Scores', sub: 'Rolling window' },
                  ].map((stat) => (
                    <div 
                      key={stat.label} 
                      className="rounded-2xl border border-white/80 bg-white/70 p-3 text-center shadow-xs backdrop-blur-md hover:border-emerald-200/80 transition-all"
                    >
                      <p className="font-serif text-xl sm:text-2xl font-bold text-emerald-700">{stat.value}</p>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-800">{stat.label}</p>
                      <p className="text-[10px] text-slate-500">{stat.sub}</p>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right Column: Visual Mockup Showcase */}
              <div className="lg:col-span-5">
                <FloatingVisualCard />
              </div>

            </div>
          </div>
        </section>

        {/* IMPACT PARTNERS / CHARITIES SECTION */}
        <section className="relative border-y border-slate-200/60 bg-white/60 py-12 sm:py-16 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-800">
                  Direct Contributions
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                  Impact Partners
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Featured charities making a difference through our community.
                </p>
              </div>
              <Link
                to="/charities"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
              >
                Browse all charities <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {featured.map((charity, i) => (
                <motion.div
                  key={charity._id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={`/charities/${charity.slug}`}
                    className="group flex flex-col justify-between h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-0 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200"
                  >
                    {charity.coverImageUrl && (
                      <div className="aspect-[16/9] overflow-hidden bg-slate-100 relative">
                        <img
                          src={charity.coverImageUrl}
                          alt={charity.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                    <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="font-serif text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {charity.name}
                        </h3>
                        <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {charity.shortDescription}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Raised</span>
                        <span className="font-serif text-sm font-bold text-emerald-700">
                          {formatMoney(charity.totalRaisedSnapshot)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS & PRIZE TIERS SECTION */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
              
              {/* Three Steps */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-800">
                    Simple Process
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                    Three Steps To Impact
                  </h2>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      step: '01',
                      title: 'Subscribe & Choose Your Cause',
                      desc: 'Pick monthly or yearly. Select a charity and set your contribution — minimum 10%, or more if you wish.',
                      icon: HeartHandshake
                    },
                    {
                      step: '02',
                      title: 'Log Your Last 5 Scores',
                      desc: 'Enter Stableford points from your recent golf rounds. We keep your latest five updated in a rolling window.',
                      icon: Target
                    },
                    {
                      step: '03',
                      title: 'Win & Give Simultaneously',
                      desc: 'Monthly draws for 3, 4, and 5-number matches. Unclaimed jackpots roll forward automatically.',
                      icon: Trophy
                    },
                  ].map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <div
                        key={item.step}
                        className="flex items-start gap-4 rounded-2xl border border-white/80 bg-white/80 p-4 shadow-2xs backdrop-blur-md hover:border-emerald-200 transition-all"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-serif font-bold text-sm">
                          {item.step}
                        </div>
                        <div>
                          <h3 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Prize Tiers Card Module */}
              <div className="lg:col-span-5">
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-7 text-white shadow-xl shadow-slate-900/10 relative overflow-hidden">
                  {/* Subtle Background Glow */}
                  <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />

                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400">
                        <Award size={18} />
                      </div>
                      <h3 className="font-serif text-lg font-bold text-white">This Month's Tiers</h3>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
                      Automated
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      { tier: '5-Match Tier', pct: '40%', note: 'Jackpot — rolls over if unclaimed', highlight: true },
                      { tier: '4-Match Tier', pct: '35%', note: 'Split equally among winners', highlight: false },
                      { tier: '3-Match Tier', pct: '25%', note: 'Split equally among winners', highlight: false },
                    ].map((t) => (
                      <div
                        key={t.tier}
                        className={`flex items-center justify-between rounded-xl p-3 border transition-colors ${
                          t.highlight
                            ? 'bg-slate-800/90 border-emerald-500/40'
                            : 'bg-slate-800/40 border-slate-800'
                        }`}
                      >
                        <div>
                          <p className="font-serif text-sm font-bold text-white">{t.tier}</p>
                          <p className="text-[11px] text-slate-400">{t.note}</p>
                        </div>
                        <span className="font-serif text-lg font-bold text-amber-400">{t.pct}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800 text-center">
                    <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                      <CheckCircle2 size={13} className="text-emerald-400" />
                      Fair transparent draws executed monthly
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}