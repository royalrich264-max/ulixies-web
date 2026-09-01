'use client';

import { useState, useEffect } from 'react';
import { submitSupportTicket, getCurrentUser } from '@/services/storeService';
import { LifeBuoy, CheckCircle2, Mail } from 'lucide-react';

export default function SupportPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) {
        setForm((prev) => ({
          ...prev,
          name: user.user_metadata?.full_name || prev.name,
          email: user.email || prev.email,
        }));
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await submitSupportTicket(form);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <CheckCircle2 className="w-14 h-14 text-black mx-auto mb-4" />
        <h1 className="text-2xl font-black uppercase tracking-tight">Message Sent</h1>
        <p className="text-sm text-gray-600 mt-2">
          Thanks, {form.name || 'athlete'} — our support team will reply to {form.email} as soon as possible.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm((prev) => ({ ...prev, subject: '', message: '' })); }}
          className="mt-8 px-6 py-3 bg-[#111111] text-white rounded-full text-xs font-bold uppercase hover:bg-gray-800"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-gray-400 mb-2">
        <LifeBuoy className="w-4 h-4 text-black" /> ATHLETE PASSPORT // CUSTOMER SUPPORT
      </div>
      <h1 className="text-3xl font-black uppercase tracking-tight">Contact Support</h1>
      <p className="text-sm text-gray-600 mt-2">
        Questions about an order, a return, or anything else — send us a message and a real person will get back to you.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase block mb-1">Your Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 rounded border border-[#E5E5E5] text-sm focus:border-black outline-none"
              placeholder="Jane Athlete"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded border border-[#E5E5E5] text-sm focus:border-black outline-none"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase block mb-1">Subject</label>
          <input
            type="text"
            required
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full px-4 py-3 rounded border border-[#E5E5E5] text-sm focus:border-black outline-none"
            placeholder="Order #ULX-000000 — wrong size shipped"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase block mb-1">Message</label>
          <textarea
            required
            rows={6}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full px-4 py-3 rounded border border-[#E5E5E5] text-sm focus:border-black outline-none"
            placeholder="Tell us what's going on..."
          />
        </div>

        {error && <p className="text-xs font-mono text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-[#111111] text-white font-bold text-xs uppercase tracking-wider rounded-full hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Mail className="w-4 h-4" /> {submitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
