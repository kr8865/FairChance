import { motion } from 'framer-motion';
import { Layout } from '../components/Layout';

export default function HowItWorksPage() {
  const steps = [
    {
      step: '01',
      title: 'Subscribe',
      description:
        'Choose monthly (₹999) or yearly (₹9,999 — ~17% off). Pick a charity and set your contribution percentage—minimum 10%, more if you’d like.',
      badge: 'Flexible Plans',
    },
    {
      step: '02',
      title: 'Log your scores',
      description:
        'Enter your last five Stableford scores (1–45 points each) with dates. We keep a rolling window of five—new entries replace the oldest.',
      badge: 'Rolling Window',
    },
    {
      step: '03',
      title: 'Monthly draws',
      description:
        'Winning numbers for 3-, 4-, and 5-number tiers are published monthly. Active subscribers with five logged scores are entered automatically.',
      badge: 'Auto-Entry',
      prizes: [
        { match: '5-Match', detail: 'All 5 scores match', pool: '40% jackpot (rolls over)' },
        { match: '4-Match', detail: '4 scores match', pool: '35% of prize pool' },
        { match: '3-Match', detail: '3 scores match', pool: '25% of prize pool' },
      ],
    },
    {
      step: '04',
      title: 'Win & verify',
      description:
        'Winners upload a scorecard screenshot proof. Admins verify and process payouts. Prize pool equals 25% of active subscriber revenue each month.',
      badge: 'Verified Payouts',
    },
  ];

  return (
    <Layout>
      <div className="relative min-h-screen overflow-hidden bg-[#f7f8f3] text-slate-900 py-20 px-4 sm:px-6 lg:px-8">
        {/* Soft Ambient Background Glows */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-200/35 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-amber-100/50 blur-[130px] rounded-full pointer-events-none" />

        <div className="relative mx-auto max-w-4xl z-10">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center px-3.5 py-1 text-xs font-semibold tracking-widest text-emerald-800 uppercase rounded-full bg-emerald-100/70 border border-emerald-200">
              Fairway & Fund
            </span>
            <h1 className="text-4xl sm:text-6xl font-serif font-semibold tracking-tight text-slate-900">
              How it works
            </h1>
            <p className="text-slate-600 text-lg font-light">
              A modern impact platform where your golf scores unlock prize draws and charitable giving.
            </p>
          </div>

          {/* Pricing Highlight Bar */}
          <div className="mt-10 max-w-lg mx-auto rounded-3xl bg-white/80 p-5 backdrop-blur-xl border border-white shadow-lg shadow-slate-200/50 flex items-center justify-around text-center">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Monthly</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">₹999 <span className="text-xs font-normal text-slate-500">/ mo</span></p>
            </div>
            <div className="h-8 w-[1px] bg-slate-200" />
            <div>
              <div className="flex items-center gap-1.5 justify-center">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Yearly</p>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">Save 17%</span>
              </div>
              <p className="text-xl font-bold text-slate-900 mt-0.5">₹9,999 <span className="text-xs font-normal text-slate-500">/ yr</span></p>
            </div>
          </div>

          {/* Step Cards */}
          <div className="mt-14 space-y-6">
            {steps.map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="rounded-[2rem] border border-white/80 bg-white/70 p-8 backdrop-blur-xl shadow-md shadow-slate-200/40 hover:bg-white transition"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex items-center gap-3 md:flex-col md:items-start">
                    <span className="text-4xl font-serif font-bold text-emerald-600">
                      {item.step}
                    </span>
                    <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {item.badge}
                    </span>
                  </div>

                  <div className="flex-1 space-y-2">
                    <h2 className="text-2xl font-serif font-semibold text-slate-900">
                      {item.title}
                    </h2>
                    <p className="text-slate-600 leading-relaxed font-normal text-sm sm:text-base">
                      {item.description}
                    </p>

                    {item.prizes && (
                      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                        {item.prizes.map((prize, pIdx) => (
                          <div key={pIdx} className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60">
                            <span className="block text-xs font-bold text-emerald-700">{prize.match}</span>
                            <span className="block text-xs font-semibold text-slate-800 mt-0.5">{prize.pool}</span>
                            <span className="block text-[11px] text-slate-500 mt-0.5">{prize.detail}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}