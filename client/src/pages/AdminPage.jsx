import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  LayoutDashboard,
  Dices,
  HeartHandshake,
  Trophy,
  Users,
  Plus,
  Pencil,
  Ban,
  CheckCircle2,
  XCircle,
  Wallet,
  ExternalLink,
  Star,
  Sparkles,
  ShieldAlert,
  Play,
  RotateCcw,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { api, formatMoney } from '../lib/api';

const EMPTY_CHARITY = {
  slug: '',
  name: '',
  shortDescription: '',
  fullDescription: '',
  categories: [],
  isFeatured: false,
  websiteUrl: '',
  coverImageUrl: '',
  logoUrl: '',
};

/* ---------------------------------------------------------------- */
/* Animated & High-Density UI Components                            */
/* ---------------------------------------------------------------- */

function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Animated Floating Gradients */}
      <div className="absolute -top-16 -left-16 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl animate-pulse duration-1000" />
      <div className="absolute top-1/2 -right-16 h-80 w-80 rounded-full bg-amber-400/15 blur-3xl animate-bounce duration-3000" />
      <div className="absolute -bottom-10 left-1/3 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl animate-pulse" />
      
      {/* Subtle Mesh Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
    </div>
  );
}

function CompactPanel({ className = '', children }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-white/85 p-4 sm:p-5 backdrop-blur-md border border-white/80 shadow-sm shadow-slate-200/50 hover:shadow-md hover:border-emerald-200/60 transition-all duration-200 ${className}`}>
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

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">{label}</label>
      <div>{children}</div>
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10';

function EmeraldButton({ children, className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 transition-all duration-150 hover:bg-emerald-700 hover:shadow-emerald-700/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
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

function TextButton({ children, tone = 'emerald', ...props }) {
  const toneClass =
    tone === 'red'
      ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50'
      : tone === 'amber'
      ? 'text-amber-700 hover:text-amber-800 hover:bg-amber-50'
      : 'text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50';

  return (
    <button className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all duration-150 ${toneClass}`} {...props}>
      {children}
    </button>
  );
}

function StatusBadge({ children, tone = 'neutral' }) {
  const tones = {
    amber: 'bg-amber-100/90 text-amber-800 border-amber-200',
    green: 'bg-emerald-100/90 text-emerald-800 border-emerald-200',
    red: 'bg-rose-100/90 text-rose-800 border-rose-200',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${tones[tone]}`}>
      {children}
    </span>
  );
}

/* ---------------------------------------------------------------- */

export default function AdminPage() {
  const [tab, setTab] = useState('overview');
  const [periodKey, setPeriodKey] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [drawMode, setDrawMode] = useState('random');
  const [simulation, setSimulation] = useState(null);
  const [charityForm, setCharityForm] = useState(EMPTY_CHARITY);
  const [editingCharity, setEditingCharity] = useState(null);
  const [showCharityForm, setShowCharityForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: reports } = useQuery({ queryKey: ['admin-reports'], queryFn: api.adminReports });
  const { data: draws = [] } = useQuery({ queryKey: ['admin-draws'], queryFn: api.adminDraws });
  const { data: charities = [] } = useQuery({ queryKey: ['admin-charities'], queryFn: api.adminCharities, enabled: tab === 'charities' });
  const { data: winners = [] } = useQuery({ queryKey: ['admin-winners'], queryFn: api.adminWinners, enabled: tab === 'winners' });
  const { data: users = [] } = useQuery({ queryKey: ['admin-users'], queryFn: api.adminUsers, enabled: tab === 'users' });

  const simulate = useMutation({
    mutationFn: () => api.adminSimulateDraw(periodKey, drawMode),
    onSuccess: (data) => {
      setSimulation(data);
      queryClient.invalidateQueries({ queryKey: ['admin-draws'] });
    },
  });

  const publish = useMutation({
    mutationFn: () => api.adminPublishDraw(periodKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-draws', 'admin-winners', 'admin-reports'] });
      alert('Draw published successfully!');
    },
  });

  const verify = useMutation({
    mutationFn: ({ id, status, rejectionReason }) =>
      api.adminVerifyWinner(id, { verificationStatus: status, rejectionReason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-winners'] }),
  });

  const payout = useMutation({
    mutationFn: (id) => api.adminPayoutWinner(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-winners'] }),
  });

  const createCharity = useMutation({
    mutationFn: (body) => api.adminCreateCharity(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-charities'] });
      setShowCharityForm(false);
      setCharityForm(EMPTY_CHARITY);
    },
  });

  const updateCharity = useMutation({
    mutationFn: ({ id, body }) => api.adminUpdateCharity(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-charities'] });
      setEditingCharity(null);
      setShowCharityForm(false);
    },
  });

  const deleteCharity = useMutation({
    mutationFn: (id) => api.adminDeleteCharity(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-charities'] }),
  });

  const activateSub = useMutation({
    mutationFn: ({ userId, plan }) => api.adminActivateSub(userId, plan),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const updateUserStatus = useMutation({
    mutationFn: ({ id, status }) => api.adminUpdateUserStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'draws', label: 'Draws', icon: Dices },
    { id: 'charities', label: 'Charities', icon: HeartHandshake },
    { id: 'winners', label: 'Winners', icon: Trophy },
    { id: 'users', label: 'Users', icon: Users },
  ];

  const openCreateCharity = () => {
    setEditingCharity(null);
    setCharityForm(EMPTY_CHARITY);
    setShowCharityForm(true);
  };

  const openEditCharity = (c) => {
    setEditingCharity(c._id);
    setCharityForm({
      slug: c.slug,
      name: c.name,
      shortDescription: c.shortDescription,
      fullDescription: c.fullDescription,
      categories: c.categories ?? [],
      isFeatured: c.isFeatured ?? false,
      websiteUrl: c.websiteUrl ?? '',
      coverImageUrl: c.coverImageUrl ?? '',
      logoUrl: c.logoUrl ?? '',
    });
    setShowCharityForm(true);
  };

  const saveCharity = () => {
    const body = {
      ...charityForm,
      categories: typeof charityForm.categories === 'string'
        ? charityForm.categories.split(',').map((s) => s.trim()).filter(Boolean)
        : charityForm.categories,
    };
    if (editingCharity) {
      updateCharity.mutate({ id: editingCharity, body });
    } else {
      createCharity.mutate(body);
    }
  };

  return (
    <Layout>
      <div className="relative min-h-screen bg-[#f7f8f3] text-slate-900 py-6 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <AnimatedBackground />

        <div className="relative mx-auto max-w-7xl z-10 space-y-4">
          {/* Top Bar Header (Compact) */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Eyebrow>
                  <Sparkles size={11} className="text-emerald-600" /> Control Center
                </Eyebrow>
              </div>
              <h1 className="mt-1 text-2xl sm:text-3xl font-serif font-bold tracking-tight text-slate-900">
                Admin Console
              </h1>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 shadow-2xs transition hover:bg-slate-50"
            >
              <ArrowLeft size={13} />
              Return to Site
            </Link>
          </div>

          {/* Navigation Tab Pills (Compact) */}
          <div className="flex flex-wrap gap-1.5 rounded-xl bg-white/80 p-1 backdrop-blur-md border border-white/80 shadow-sm shadow-slate-200/30">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW */}
          {tab === 'overview' && reports && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: 'Total Members', value: reports.userCount, desc: 'Registered accounts', icon: Users },
                  { label: 'Active Subscriptions', value: reports.activeSubs, desc: 'Recurring donors', icon: Activity },
                  { label: 'Registered Causes', value: reports.charityCount, desc: 'Verified non-profits', icon: HeartHandshake },
                  { label: 'Draws Completed', value: reports.publishedDraws, desc: 'Published events', icon: Dices },
                  { label: 'Total Donations Pool', value: formatMoney(reports.totalDonations), desc: 'Raised to date', icon: TrendingUp },
                  { label: 'Pending Rollover Pool', value: formatMoney(reports.pendingRollover), desc: 'Carried over to next draw', icon: Trophy },
                ].map((s) => {
                  const CardIcon = s.icon;
                  return (
                    <CompactPanel key={s.label}>
                      <div className="flex items-start justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          {s.label}
                        </span>
                        <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                          <CardIcon size={15} />
                        </div>
                      </div>
                      <p className="mt-1 font-serif text-2xl font-bold text-slate-900">
                        {s.value}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">{s.desc}</p>
                    </CompactPanel>
                  );
                })}
              </div>

              {reports.latestDraw && (
                <CompactPanel className="border-emerald-200/80 bg-gradient-to-r from-white via-white to-emerald-50/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800">
                        Latest Executed Draw
                      </span>
                      <p className="font-serif text-lg font-bold text-slate-900 mt-0.5">
                        Period: {reports.latestDraw.periodKey}
                      </p>
                    </div>
                    <StatusBadge tone={reports.latestDraw.status === 'published' ? 'green' : 'amber'}>
                      {reports.latestDraw.status}
                    </StatusBadge>
                  </div>
                </CompactPanel>
              )}
            </div>
          )}

          {/* TAB 2: DRAWS */}
          {tab === 'draws' && (
            <div className="space-y-4">
              <CompactPanel>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                    <Dices size={16} />
                  </div>
                  <h2 className="font-serif text-base font-bold text-slate-900">Execute or Simulate Draw</h2>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Period Key (YYYY-MM)">
                    <input className={inputClass} value={periodKey} onChange={(e) => setPeriodKey(e.target.value)} />
                  </Field>

                  <Field label="Algorithm">
                    <select className={inputClass} value={drawMode} onChange={(e) => setDrawMode(e.target.value)}>
                      <option value="random">Standard Randomization</option>
                      <option value="weighted_frequency">Weighted by Activity</option>
                    </select>
                  </Field>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                  <OutlineButton onClick={() => simulate.mutate()} disabled={simulate.isPending}>
                    <RotateCcw size={13} />
                    {simulate.isPending ? 'Simulating...' : 'Simulate Preview'}
                  </OutlineButton>

                  <EmeraldButton onClick={() => publish.mutate()} disabled={publish.isPending}>
                    <Play size={13} />
                    {publish.isPending ? 'Publishing...' : 'Publish & Dispatch Winners'}
                  </EmeraldButton>
                </div>

                {simulation && (
                  <div className="mt-4 rounded-xl bg-slate-900 text-white p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
                        Simulation Output ({simulation.periodKey})
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
                        {simulation.eligibleEntries} Entries
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/80">
                      <span className="text-xs font-medium text-slate-300">Total Calculated Pool</span>
                      <span className="font-serif text-lg font-bold text-amber-400">
                        {formatMoney(simulation.prizePool.totalPool)}
                      </span>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-3">
                      {[5, 4, 3].map((tier) => (
                        <div key={tier} className="rounded-lg bg-slate-800 p-2.5 border border-slate-700/60 text-xs">
                          <span className="block text-[10px] font-bold text-emerald-400 uppercase">
                            {tier}-Match Tier
                          </span>
                          <p className="text-slate-400 font-mono text-[11px]">
                            {simulation.winningNumbers[`tier${tier}`].join(', ')}
                          </p>
                          <p className="mt-1 font-bold text-white">
                            {simulation.winners[`tier${tier}`].count} Winner(s)
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CompactPanel>

              <CompactPanel>
                <h2 className="font-serif text-base font-bold text-slate-900 mb-2">Historical Draw Records</h2>
                <div className="divide-y divide-slate-100">
                  {draws.map((d) => (
                    <div
                      key={d._id}
                      className="flex items-center justify-between py-2 text-xs hover:bg-slate-50/60 px-1 rounded-md"
                    >
                      <span className="font-semibold text-slate-800">{d.periodKey}</span>
                      <StatusBadge tone={d.status === 'published' ? 'green' : 'amber'}>
                        {d.status}
                      </StatusBadge>
                      {d.prizePoolSnapshot && (
                        <span className="font-serif font-bold text-emerald-700">
                          {formatMoney(d.prizePoolSnapshot.totalPool)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CompactPanel>
            </div>
          )}

          {/* TAB 3: CHARITIES */}
          {tab === 'charities' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <EmeraldButton onClick={openCreateCharity}>
                  <Plus size={14} /> Add Cause
                </EmeraldButton>
              </div>

              {showCharityForm && (
                <CompactPanel className="border-emerald-200">
                  <h2 className="font-serif text-base font-bold text-slate-900 mb-4">
                    {editingCharity ? 'Edit Cause' : 'Create New Cause'}
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {['slug', 'name', 'websiteUrl', 'coverImageUrl', 'logoUrl'].map((field) => (
                      <Field key={field} label={field.replace(/([A-Z])/g, ' $1')}>
                        <input
                          className={inputClass}
                          value={charityForm[field]}
                          onChange={(e) => setCharityForm({ ...charityForm, [field]: e.target.value })}
                        />
                      </Field>
                    ))}
                    <div className="sm:col-span-2">
                      <Field label="Short Summary">
                        <input
                          className={inputClass}
                          value={charityForm.shortDescription}
                          onChange={(e) => setCharityForm({ ...charityForm, shortDescription: e.target.value })}
                        />
                      </Field>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2 pt-2 border-t border-slate-100">
                    <EmeraldButton onClick={saveCharity}>Save</EmeraldButton>
                    <OutlineButton onClick={() => setShowCharityForm(false)}>Cancel</OutlineButton>
                  </div>
                </CompactPanel>
              )}

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {charities.map((c) => (
                  <CompactPanel key={c._id} className="flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif text-sm font-bold text-slate-900">{c.name}</h3>
                        <StatusBadge tone={c.isActive ? 'green' : 'neutral'}>
                          {c.isActive ? 'Active' : 'Inactive'}
                        </StatusBadge>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">{c.shortDescription}</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                      <TextButton onClick={() => openEditCharity(c)}>
                        <Pencil size={11} /> Edit
                      </TextButton>
                      {c.isActive && (
                        <TextButton tone="red" onClick={() => deleteCharity.mutate(c._id)}>
                          <Ban size={11} /> Deactivate
                        </TextButton>
                      )}
                    </div>
                  </CompactPanel>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: WINNERS */}
          {tab === 'winners' && (
            <div className="space-y-3">
              {winners.length === 0 ? (
                <CompactPanel className="text-center py-8">
                  <Trophy className="mx-auto text-slate-300 mb-2" size={24} />
                  <p className="text-xs font-semibold text-slate-700">No winners recorded yet.</p>
                </CompactPanel>
              ) : (
                winners.map((w) => (
                  <CompactPanel key={w._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                        <Trophy size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-sm font-bold text-slate-900">{w.tier}-Match Winner</span>
                          <span className="font-serif text-sm font-bold text-emerald-700">{formatMoney(w.prizeAmount)}</span>
                        </div>
                        <p className="text-xs text-slate-500">{w.userId?.email ?? 'Unknown User'} · {w.drawId?.periodKey ?? '—'}</p>
                      </div>
                    </div>

                    <div className="flex gap-1.5 self-start sm:self-center">
                      {w.verificationStatus === 'approved' && w.payoutStatus === 'pending' && (
                        <EmeraldButton className="!px-3 !py-1 !text-xs" onClick={() => payout.mutate(w._id)}>
                          <Wallet size={12} /> Mark Paid
                        </EmeraldButton>
                      )}
                    </div>
                  </CompactPanel>
                ))
              )}
            </div>
          )}

          {/* TAB 5: USERS */}
          {tab === 'users' && (
            <CompactPanel className="!p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Subscription</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-2.5 font-semibold text-slate-900">
                          {u.profile?.firstName || u.profile?.lastName ? `${u.profile?.firstName ?? ''} ${u.profile?.lastName ?? ''}` : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-slate-600 font-mono">{u.email}</td>
                        <td className="px-4 py-2.5 text-slate-700 capitalize font-medium">
                          {u.subscription?.status ?? 'none'}
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusBadge tone={u.status === 'active' || !u.status ? 'green' : 'red'}>
                            {u.status ?? 'active'}
                          </StatusBadge>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex justify-end gap-1">
                            {(!u.subscription || u.subscription.status !== 'active') && (
                              <TextButton onClick={() => activateSub.mutate({ userId: u.id, plan: 'monthly' })}>
                                Activate Sub
                              </TextButton>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CompactPanel>
          )}
        </div>
      </div>
    </Layout>
  );
}