import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Sparkles, Search, Heart, ArrowUpRight } from 'lucide-react';
import { Layout } from '../components/Layout';
import { api, formatMoney } from '../lib/api';

const CATEGORIES = ['All', 'youth', 'sport', 'environment', 'community', 'health', 'mental-health'];

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

export default function CharitiesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const params = new URLSearchParams();
  if (search) params.set('q', search);
  if (category !== 'All') params.set('category', category);
  const queryString = params.toString();

  const { data: charities = [], isLoading } = useQuery({
    queryKey: ['charities', search, category],
    queryFn: () => api.getCharities(queryString || undefined),
  });

  return (
    <Layout>
      <div className="relative min-h-screen overflow-hidden bg-[#f7f8f3] text-slate-900 py-16 px-4 sm:px-6 lg:px-8">
        <FloatingBlobs />

        <div className="relative mx-auto max-w-7xl z-10">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold tracking-widest text-emerald-800 uppercase rounded-full bg-emerald-100/70 border border-emerald-200">
              <Sparkles size={12} className="text-emerald-600" /> Causes & Impact
            </span>
            <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-slate-900">
              Charity directory
            </h1>
            <p className="text-slate-600 text-sm sm:text-base font-light">
              Browse causes supported by our community or make direct contributions to fuel change.
            </p>
          </div>

          {/* Controls: Search & Categories */}
          <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-white/70 backdrop-blur-xl p-4 rounded-3xl border border-white shadow-lg shadow-slate-200/50">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100/80 text-sm text-slate-900 placeholder:text-slate-400 border border-slate-200/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition"
                placeholder="Search causes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const isActive = category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-all duration-300 ${
                      isActive
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                        : 'bg-slate-200/60 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid Content */}
          {isLoading ? (
            <div className="mt-16 text-center text-slate-500 font-medium">
              Loading causes...
            </div>
          ) : charities.length === 0 ? (
            <div className="mt-16 text-center rounded-3xl bg-white/60 backdrop-blur-md p-12 border border-slate-200/60 shadow-sm max-w-md mx-auto">
              <Heart className="mx-auto text-slate-400 mb-3" size={32} />
              <p className="text-slate-700 font-medium">No charities match your search.</p>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or keywords.</p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {charities.map((charity) => (
                <Link
                  key={charity._id}
                  to={`/charities/${charity.slug}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-white/80 p-5 backdrop-blur-xl border border-white shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-300 hover:-translate-y-1"
                >
                  <div>
                    {charity.coverImageUrl && (
                      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-slate-100">
                        <img
                          src={charity.coverImageUrl}
                          alt={charity.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="pt-5">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="font-serif text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition">
                          {charity.name}
                        </h2>
                        {charity.isFeatured && (
                          <span className="shrink-0 rounded-full bg-amber-100/90 border border-amber-200/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {charity.shortDescription}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Total Raised
                      </span>
                      <span className="font-serif text-base font-bold text-emerald-700">
                        {formatMoney(charity.totalRaisedSnapshot)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 group-hover:translate-x-0.5 transition">
                      <span>View Cause</span>
                      <ArrowUpRight size={14} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}