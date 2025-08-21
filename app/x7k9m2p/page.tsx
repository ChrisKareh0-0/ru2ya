'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        router.push('/x7k9m2p/dashboard');
      } else {
        const data = await response.json();
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] opacity-5"></div>
      
      <div className="relative backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl p-8 shadow-2xl shadow-black/20 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-[#7C805A] mb-2 font-elegant">Admin Access</h1>
          <p className="text-[#7C805A] opacity-80">Secure portal for ru2ya management</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-[#7C805A] mb-2 font-light">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/30 border border-white/40 text-[#7C805A] placeholder-[#7C805A]/60 focus:outline-none focus:ring-2 focus:ring-[#7C805A] focus:border-transparent backdrop-blur-sm font-light"
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#7C805A] mb-2 font-light">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/30 border border-white/40 text-[#7C805A] placeholder-[#7C805A]/60 focus:outline-none focus:ring-2 focus:ring-[#7C805A] focus:border-transparent backdrop-blur-sm font-light"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-600/20 border border-red-500/30 text-red-600 text-sm font-light">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-[#7C805A] hover:bg-[#6A7150] text-[#F5E6D3] font-light focus:outline-none focus:ring-2 focus:ring-[#7C805A] focus:ring-offset-2 focus:ring-offset-[#F5E6D3] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/30"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-[#7C805A] opacity-60 font-light">
            Authorized personnel only
          </p>
        </div>
      </div>
    </div>
  );
}