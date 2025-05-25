'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }
    router.push('/');
    setLoading(false);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left Side Form */}
      <main className="flex flex-1 items-center justify-center bg-white py-12">
        <div className="w-full max-w-md mx-auto p-8 rounded-lg shadow">
          <h1 className="text-2xl text-gray-800 font-bold mb-6 text-center">Log In</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              className="px-4 py-2 border text-gray-800 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition"
            >
              {loading ? 'Logging In...' : 'Log In'}
            </button>
            {error && <div className="text-red-600 text-sm">{error}</div>}
          </form>
          <div className="mt-4 text-center text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="text-blue-600 hover:underline font-semibold">
              Sign Up
            </a>
          </div>
        </div>
      </main>
      {/* Right Side Image (hidden on md and below) */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-white">
        <img
          src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80"
          alt="Login Visual"
          className="max-w-full max-h-[80vh] object-contain"
        />
      </div>
    </div>
  );
}
