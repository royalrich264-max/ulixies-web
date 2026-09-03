'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { updateUserPassword } from '@/services/storeService';
import { KeyRound } from 'lucide-react';

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await updateUserPassword(password);
      setDone(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setMessage(err.message || 'Could not update password.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <div className="inline-flex p-3 bg-[#F5F5F5] rounded-full border border-[#E5E5E5] mb-4">
          <KeyRound className="w-8 h-8 text-black" />
        </div>
        <h1 className="text-2xl font-black uppercase">Password Updated</h1>
        <p className="text-xs text-gray-500 mt-2">Redirecting you to sign in...</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-black uppercase">Reset Password</h1>
        <p className="text-xs text-gray-500 mt-2">
          This link is invalid or has expired. Request a new one from the sign in page.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="mt-8 px-6 py-3 bg-[#111111] text-white rounded-full text-xs font-bold uppercase hover:bg-gray-800"
        >
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20 text-center">
      <h1 className="text-3xl font-black uppercase tracking-tight">Set New Password</h1>
      <p className="text-xs text-gray-500 mt-2">Enter a new password for your account.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
        <div>
          <label className="text-[11px] font-bold uppercase block mb-1">New Password</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded border border-[#E5E5E5] text-sm focus:border-black outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase block mb-1">Confirm Password</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 rounded border border-[#E5E5E5] text-sm focus:border-black outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-[#111111] text-white font-bold text-xs uppercase tracking-wider rounded-full hover:bg-gray-800 transition-colors"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>

      {message && <p className="text-xs font-mono mt-4 text-red-600">{message}</p>}
    </div>
  );
}
