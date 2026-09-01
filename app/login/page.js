'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInUser, signUpUser, getCurrentUser, signOutUser } from '@/services/storeService';
import { isAdminUser } from '@/lib/adminConfig';
import { ShieldCheck, LogOut } from 'lucide-react';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getCurrentUser().then(setCurrentUser);
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (isSignUp) {
        await signUpUser(email, password, fullName);
        setMessage('Account created successfully! Check your email to confirm, or sign in now.');
        setIsSignUp(false);
      } else {
        const { user } = await signInUser(email, password);
        router.push(isAdminUser(user) ? '/admin' : '/orders');
      }
    } catch (err) {
      setMessage(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
    setMessage('Signed out successfully.');
  };

  if (currentUser) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <div className="inline-flex p-3 bg-[#F5F5F5] rounded-full border border-[#E5E5E5] mb-4">
          <ShieldCheck className="w-8 h-8 text-black" />
        </div>
        <h1 className="text-2xl font-black uppercase">Athlete Active</h1>
        <p className="text-xs font-mono text-gray-500 mt-1">{currentUser.email}</p>
        {isAdminUser(currentUser) && (
          <button
            onClick={() => router.push('/admin')}
            className="mt-8 px-6 py-3 bg-[#CCFF00] text-black rounded-full text-xs font-bold uppercase flex items-center justify-center gap-2 mx-auto hover:bg-[#b8e600]"
          >
            <ShieldCheck className="w-4 h-4" /> Enter Admin Tower
          </button>
        )}
        <button
          onClick={handleSignOut}
          className="mt-4 px-6 py-3 bg-[#111111] text-white rounded-full text-xs font-bold uppercase flex items-center justify-center gap-2 mx-auto hover:bg-gray-800"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20 text-center">
      <h1 className="text-3xl font-black uppercase tracking-tight">
        {isSignUp ? 'Create Athlete Account' : 'Athlete Sign In'}
      </h1>
      <p className="text-xs text-gray-500 mt-2">
        {isSignUp ? 'Enter your details to create your passport.' : 'Enter your credentials to manage orders and saved gear.'}
      </p>

      <form onSubmit={handleAuth} className="mt-8 space-y-4 text-left">
        {isSignUp && (
          <div>
            <label className="text-[11px] font-bold uppercase block mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="Michael Jordan"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded border border-[#E5E5E5] text-sm focus:border-black outline-none"
            />
          </div>
        )}
        <div>
          <label className="text-[11px] font-bold uppercase block mb-1">Email Address</label>
          <input
            type="email"
            required
            placeholder="athlete@nike.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded border border-[#E5E5E5] text-sm focus:border-black outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase block mb-1">Password</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded border border-[#E5E5E5] text-sm focus:border-black outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-[#111111] text-white font-bold text-xs uppercase tracking-wider rounded-full hover:bg-gray-800 transition-colors"
        >
          {loading ? 'Processing...' : isSignUp ? 'Create Passport' : 'Sign In'}
        </button>
      </form>

      {message && <p className="text-xs font-mono mt-4 text-red-600">{message}</p>}

      <button
        onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }}
        className="text-xs font-bold underline mt-6 hover:text-gray-600 block mx-auto"
      >
        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
      </button>
    </div>
  );
}