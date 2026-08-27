'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Globe, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@ulixies.com');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/');
    }, 600);
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#111111] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl border border-[#E5E5E5] p-8 space-y-6 shadow-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#111111] text-white flex items-center justify-center font-black text-xl mx-auto">
            U
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#111111]">ULIXIES ADMIN PORTAL</h1>
          <div className="inline-flex items-center space-x-1.5 text-xs font-mono font-bold text-[#707072] uppercase px-3 py-1 rounded-full bg-[#F5F5F5] border border-[#E5E5E5]">
            <Globe className="w-3.5 h-3.5 text-black" />
            <span>admin.ulixies.com</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#111111] font-bold uppercase mb-1.5">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707072]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F5F5F5] border border-[#E5E5E5] focus:border-black rounded-xl pl-9 pr-4 py-3 text-[#111111] outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#111111] font-bold uppercase mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707072]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F5F5F5] border border-[#E5E5E5] focus:border-black rounded-xl pl-9 pr-4 py-3 text-[#111111] outline-none font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-full bg-[#111111] hover:bg-gray-800 text-white font-bold uppercase text-xs tracking-wider shadow-lg transition-all mt-2"
          >
            <span>{loading ? 'AUTHENTICATING...' : 'SIGN IN TO DASHBOARD'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-[11px] font-mono text-[#707072]">
          Protected monorepo admin subdomain boundary.
        </div>
      </div>
    </div>
  );
}
