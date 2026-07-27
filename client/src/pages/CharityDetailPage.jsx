import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Layout } from '../components/Layout';
import { api, formatMoney } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export default function CharityDetailPage() {
  const { slug } = useParams();
  const { user } = useAuthStore();
  const [donationAmount, setDonationAmount] = useState(25);
  const queryClient = useQueryClient();

  const { data: charity, isLoading } = useQuery({
    queryKey: ['charity', slug],
    queryFn: () => api.getCharity(slug),
    enabled: !!slug,
  });

  const donate = useMutation({
    mutationFn: () => api.oneTimeDonation({ charityId: charity._id, amount: donationAmount * 100 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charity', slug] });
      alert('Thank you for your donation!');
    },
  });

  if (isLoading || !charity) {
    return (
      <Layout>
        <div className="mx-auto max-w-4xl px-4 py-20 text-center text-ink-400">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {charity.coverImageUrl && (
          <div className="aspect-[21/9] overflow-hidden rounded-2xl">
            <img src={charity.coverImageUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
          <h1 className="font-display text-4xl font-bold">{charity.name}</h1>
          <p className="mt-2 text-sage-400">{formatMoney(charity.totalRaisedSnapshot)} raised through Fairway Forward</p>
          <p className="mt-6 text-lg text-ink-300">{charity.fullDescription}</p>

          {charity.events && charity.events.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-bold">Upcoming events</h2>
              <div className="mt-4 space-y-4">
                {charity.events.map((event) => (
                  <div key={event.title} className="card">
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-sm text-ink-400">
                      {new Date(event.eventDate).toLocaleDateString('en-GB', { dateStyle: 'long' })}
                      {event.location && ` · ${event.location}`}
                    </p>
                    {event.description && <p className="mt-2 text-sm text-ink-300">{event.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {user && (
            <div className="card mt-10">
              <h2 className="font-display text-lg font-bold">Make a one-time donation</h2>
              <p className="mt-2 text-sm text-ink-400">Independent of your subscription — 100% allocated to this charity.</p>
              <div className="mt-4 flex flex-wrap items-end gap-4">
                <div>
                  <label className="label">Amount (£)</label>
                  <input
                    type="number"
                    min={1}
                    className="input w-32"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(Number(e.target.value))}
                  />
                </div>
                <button
                  className="btn-primary"
                  onClick={() => donate.mutate()}
                  disabled={donate.isPending}
                >
                  {donate.isPending ? 'Processing...' : 'Donate now'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
