'use client';

import { useState, useEffect } from 'react';
import { MessageSquareQuote, Star, Check, X } from 'lucide-react';
import { fetchReviewsData } from '../../services/adminService';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      setLoading(true);
      const res = await fetchReviewsData();
      setReviews(res);
      setLoading(false);
    }
    loadReviews();
  }, []);

  function handleApprove(id) {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
  }

  function handleReject(id) {
    setReviews(prev => prev.filter(r => r.id !== id));
  }

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">
          PRODUCT REVIEWS MODERATION QUEUE
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Moderate verified customer feedback, star ratings, and community product testimonials.
        </p>
      </div>

      {/* Reviews List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {reviews.map((rev) => (
            <div key={rev.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{rev.product}</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic font-medium">"{rev.comment}"</p>
                <div className="text-[10px] font-mono text-slate-500">By {rev.author} • {rev.date}</div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold uppercase border ${
                  rev.status === 'Approved'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400'
                }`}>
                  {rev.status}
                </span>

                {rev.status !== 'Approved' && (
                  <button
                    onClick={() => handleApprove(rev.id)}
                    className="p-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold"
                    title="Approve Review"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => handleReject(rev.id)}
                  className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold"
                  title="Reject & Delete"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
