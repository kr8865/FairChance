import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Target,
  HeartHandshake,
  PlusCircle,
  UploadCloud,
  CheckCircle2,
  Circle,
  Sparkles,
  Settings2,
  Calendar,
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { api, formatMoney } from '../lib/api';
import { useAuthStore } from '../store/authStore';

/* ---------------------------------------------------------------- */
/* Shared Visual Primitives & Theme Components                      */
/* ---------------------------------------------------------------- */

function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Floating Animated Ambient Glows */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.25, 0.4, 0.25],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-16 -left-16 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.3, 0.15],
          x: [0, -40, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 -right-16 h-[26rem] w-[26rem] rounded-full bg-amber-300/20 blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-16 left-1/3 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl"
      />

      {/* Architectural Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
    </div>
  );
}

function Panel({ className = '', children }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white/85 p-4 sm:p-5 backdrop-blur-md border border-white/80 shadow-xs transition-all duration-200 ${className}`}>
      {children}
    </div>
  );
}

function Eyebrow({ children }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-emerald-800 uppercase rounded-full bg-emerald-100/80 border border-emerald-200/60">
      {children}
    </span>
  );
}

function PrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all duration-150 hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function OutlineButton({ children, className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-all duration-150 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10';

/* ---------------------------------------------------------------- */

export default function DashboardPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('overview');
  const [score, setScore] = useState({ stablefordPoints: 36, playedAt: new Date().toISOString().slice(0, 10) });
  const [showScoreForm, setShowScoreForm] = useState(false);
  const [settings, setSettings] = useState({ contributionPercent: 10, charityId: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: api.getDashboard,
  });

  const { data: charities = [] } = useQuery({
    queryKey: ['charities', 'all'],
    queryFn: () => api.getCharities(),
    enabled: tab === 'settings',
  });

  const addScore = useMutation({
    mutationFn: () =>
      api.addScore({
        stablefordPoints: score.stablefordPoints,
        playedAt: new Date(score.playedAt).toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowScoreForm(false);
    },
  });

  const uploadProof = useMutation({
    mutationFn: ({ id, file }) => api.uploadProof(id, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
  });

  const updateProfile = useMutation({
    mutationFn: (body) => api.updateProfile(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      alert('Settings saved!');
    },
  });

  const cancelSub = useMutation({
    mutationFn: api.cancelSubscription,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
  });

  const openBillingPortal = useMutation({
    mutationFn: api.billingPortal,
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });

  if (isLoading || !data) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center bg-[#f7f8f3]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        </div>
      </Layout>
    );
  }

  const isActive = data.subscription?.status === 'active' || data.subscription?.status === 'trialing';
  const charityName = data.user?.charityPreference?.charityId?.name ?? 'Not selected';

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'settings', label: 'Settings' },
  ];

  const stats = [
    {
      label: 'Subscription',
      value: isActive ? 'Active' : 'Inactive',
      sub: data.subscription?.currentPeriodEnd
        ? `Renews ${new Date(data.subscription.currentPeriodEnd).toLocaleDateString()}`
        : 'Subscribe to enter draws',
      icon: Sparkles,
      color: isActive ? 'text-emerald-700' : 'text-rose-600',
    },
    {
      label: 'Scores Logged',
      value: `${data.scores.length}/5`,
      sub: data.scoresNeeded > 0 ? `${data.scoresNeeded} more needed for entry` : 'Eligible for draw',
      icon: Target,
      color: 'text-amber-700',
    },
    {
      label: 'Charity Contribution',
      value: `${data.user.charityPreference.contributionPercent}%`,
      sub: charityName,
      icon: HeartHandshake,
      color: 'text-emerald-700',
    },
    {
      label: 'Total Winnings',
      value: formatMoney(data.totalWon),
      sub: `${data.winnings.length} win(s) recorded`,
      icon: Trophy,
      color: 'text-amber-700',
    },
  ];

  return (
    <Layout>
      <div className="relative min-h-screen bg-[#f7f8f3] text-slate-900 py-6 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <AnimatedBackground />

        <div className="relative mx-auto max-w-6xl z-10 space-y-4">
          {/* Header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 pb-4">
            <div>
              <Eyebrow>Member Ledger</Eyebrow>
              <h1 className="mt-1 text-2xl sm:text-3xl font-serif font-bold tracking-tight text-slate-900">
                Welcome back, {user?.profile?.firstName || 'Golfer'}
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
                Track your entries, golf scores, and charity impact.
              </p>
            </div>
            {!isActive && (
              <Link to="/pricing" className="self-start sm:self-center">
                <PrimaryButton>
                  <Sparkles size={13} /> Activate Subscription
                </PrimaryButton>
              </Link>
            )}
          </div>

          {/* Navigation Tab Pills */}
          <div className="flex gap-1 rounded-xl bg-white/80 p-1 backdrop-blur-md border border-white/80 shadow-2xs w-fit">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  if (t.id === 'settings' && data.user) {
                    setSettings({
                      contributionPercent: data.user.charityPreference.contributionPercent,
                      charityId:
                        data.user.charityPreference.charityId?._id ??
                        data.user.charityPreference.charityId ??
                        '',
                    });
                  }
                }}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all duration-150 ${
                  tab === t.id
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="space-y-4">
              {/* Stat Cards */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Panel key={stat.label}>
                      <div className="flex items-start justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          {stat.label}
                        </span>
                        <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                          <Icon size={15} />
                        </div>
                      </div>
                      <p className={`mt-1 font-serif text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500 truncate">{stat.sub}</p>
                    </Panel>
                  );
                })}
              </div>

              {/* Scores & Draw Participation */}
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Score Log Panel */}
                <Panel>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                        <Target size={15} />
                      </div>
                      <h2 className="font-serif text-base font-bold text-slate-900">Your Recent Scores</h2>
                    </div>
                    {isActive && (
                      <button
                        onClick={() => setShowScoreForm(!showScoreForm)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
                      >
                        <PlusCircle size={14} />
                        {showScoreForm ? 'Cancel' : 'Add Score'}
                      </button>
                    )}
                  </div>

                  {/* Add Score Form */}
                  <AnimatePresence>
                    {showScoreForm && (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden border-b border-slate-100 py-3"
                        onSubmit={(e) => {
                          e.preventDefault();
                          addScore.mutate();
                        }}
                      >
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                              Stableford Points (1–45)
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={45}
                              className={inputClass}
                              value={score.stablefordPoints}
                              onChange={(e) => setScore({ ...score, stablefordPoints: Number(e.target.value) })}
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                              Date Played
                            </label>
                            <input
                              type="date"
                              className={inputClass}
                              value={score.playedAt}
                              onChange={(e) => setScore({ ...score, playedAt: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <PrimaryButton type="submit" disabled={addScore.isPending}>
                            {addScore.isPending ? 'Saving...' : 'Save Score'}
                          </PrimaryButton>
                          {addScore.isError && (
                            <p className="text-xs text-rose-600 font-medium">
                              {addScore.error instanceof Error ? addScore.error.message : 'Failed to save score'}
                            </p>
                          )}
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Scores List */}
                  <div className="mt-3 space-y-2">
                    {data.scores.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-xs font-semibold text-slate-500">No scores logged yet.</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Log 5 recent Stableford rounds to qualify for draws.
                        </p>
                      </div>
                    ) : (
                      data.scores.map((s, i) => (
                        <motion.div
                          key={s._id}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/80 px-3.5 py-2 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 font-serif font-bold text-xs">
                              R{i + 1}
                            </span>
                            <span className="font-serif text-lg font-bold text-slate-800">
                              {s.stablefordPoints} pts
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                            <Calendar size={12} className="text-slate-400" />
                            {new Date(s.playedAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                          </span>
                        </motion.div>
                      ))
                    )}
                  </div>
                </Panel>

                {/* Draw Participation Panel */}
                <Panel>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                        <Trophy size={15} />
                      </div>
                      <h2 className="font-serif text-base font-bold text-slate-900">Draw Participation</h2>
                    </div>
                  </div>

                  {data.currentDraw ? (
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">Current Draw Period</span>
                        <span className="font-serif font-bold text-xs text-slate-800">
                          {data.currentDraw.periodKey}
                        </span>
                      </div>

                      <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
                        <p
                          className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                            data.isEntered || data.isEligible ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {data.isEntered || data.isEligible ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                          {data.isEntered
                            ? 'Entered in published draw'
                            : data.isEligible
                              ? 'Eligible — awaiting next draw publish'
                              : 'Not eligible — log 5 scores with active subscription'}
                        </p>
                      </div>

                      {data.currentDraw.prizePoolSnapshot && (
                        <div className="flex items-center justify-between rounded-xl bg-emerald-900 text-white p-3">
                          <span className="text-xs text-emerald-200 font-medium">Active Prize Pool</span>
                          <span className="font-serif text-base font-bold text-amber-300">
                            {formatMoney(data.currentDraw.prizePoolSnapshot.totalPool)}
                          </span>
                        </div>
                      )}

                      {data.currentDraw.winningNumbers && (
                        <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs space-y-1.5">
                          <p className="font-bold text-slate-700">Winning Numbers</p>
                          <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-600">
                            <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                              <span className="block font-bold text-emerald-800">5-Match</span>
                              {data.currentDraw.winningNumbers.tier5.join(', ')}
                            </div>
                            <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                              <span className="block font-bold text-emerald-800">4-Match</span>
                              {data.currentDraw.winningNumbers.tier4.join(', ')}
                            </div>
                            <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                              <span className="block font-bold text-emerald-800">3-Match</span>
                              {data.currentDraw.winningNumbers.tier3.join(', ')}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-xs font-semibold text-slate-500">No published draws yet.</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Check back soon for upcoming monthly draws.</p>
                    </div>
                  )}
                </Panel>
              </div>

              {/* Winnings History Card */}
              {data.winnings.length > 0 && (
                <Panel>
                  <h2 className="font-serif text-base font-bold text-slate-900 mb-3">Recorded Winnings</h2>
                  <div className="space-y-2">
                    {data.winnings.map((w) => (
                      <div
                        key={w._id}
                        className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                            <Trophy size={16} />
                          </div>
                          <div>
                            <p className="font-serif text-sm font-bold text-slate-900">
                              {w.tier}-Match · <span className="text-emerald-700">{formatMoney(w.prizeAmount)}</span>
                            </p>
                            <p className="text-[11px] text-slate-500 capitalize">
                              Verification: {w.verificationStatus.replace('_', ' ')} · Payout: {w.payoutStatus}
                            </p>
                          </div>
                        </div>

                        {w.verificationStatus === 'pending_proof' && (
                          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition">
                            <UploadCloud size={13} />
                            Upload Proof
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadProof.mutate({ id: w._id, file });
                              }}
                            />
                          </label>
                        )}

                        {w.verificationStatus === 'rejected' && w.proof?.rejectionReason && (
                          <p className="text-xs text-rose-600 font-medium">Reason: {w.proof.rejectionReason}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Panel>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {tab === 'settings' && (
            <div className="max-w-2xl space-y-4">
              <Panel>
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                    <HeartHandshake size={15} />
                  </div>
                  <h2 className="font-serif text-base font-bold text-slate-900">Charity Preference</h2>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Chosen Charity
                    </label>
                    <select
                      className={inputClass}
                      value={settings.charityId}
                      onChange={(e) => setSettings({ ...settings, charityId: e.target.value })}
                    >
                      <option value="">Select a charity</option>
                      {charities.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Contribution Percentage
                      </label>
                      <span className="font-serif font-bold text-xs text-emerald-700">
                        {settings.contributionPercent}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      step={5}
                      value={settings.contributionPercent}
                      onChange={(e) =>
                        setSettings({ ...settings, contributionPercent: Number(e.target.value) })
                      }
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <PrimaryButton
                    onClick={() => updateProfile.mutate(settings)}
                    disabled={updateProfile.isPending}
                  >
                    {updateProfile.isPending ? 'Saving...' : 'Save Preferences'}
                  </PrimaryButton>
                </div>
              </Panel>

              {isActive && (
                <Panel>
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                      <Settings2 size={15} />
                    </div>
                    <h2 className="font-serif text-base font-bold text-slate-900">Subscription & Billing</h2>
                  </div>

                  <div className="mt-3 space-y-2 text-xs text-slate-600">
                    <p>
                      Current Plan:{' '}
                      <span className="font-semibold text-slate-900 capitalize">
                        {data.subscription?.plan ?? '—'}
                      </span>
                    </p>
                    <p>
                      Status:{' '}
                      <span className="font-semibold text-emerald-700 capitalize">
                        {data.subscription?.status}
                      </span>
                    </p>
                    {data.subscription?.cancelAtPeriodEnd && (
                      <p className="font-semibold text-rose-600">
                        Cancels at the end of current billing period
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                    {!data.subscription?.cancelAtPeriodEnd && (
                      <OutlineButton
                        onClick={() => {
                          if (confirm('Cancel subscription at period end?')) cancelSub.mutate();
                        }}
                        disabled={cancelSub.isPending}
                      >
                        Cancel Subscription
                      </OutlineButton>
                    )}
                    <PrimaryButton
                      onClick={() => openBillingPortal.mutate()}
                      disabled={openBillingPortal.isPending}
                    >
                      Manage Billing Portal
                    </PrimaryButton>
                  </div>
                </Panel>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}