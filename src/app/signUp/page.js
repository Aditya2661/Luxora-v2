'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import Image from 'next/image';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SignUpPage() {
  const [form, setForm] = useState({ name: '', email: '', phone_number: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Sign up with Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    // Insert user profile
    const user = data.user;
    if (user) {
      await supabase.from('users').insert([{
        id: user.id,
        name: form.name,
        phone_number: form.phone_number,
        email: form.email,
      }]);
      router.push('/login');
    } else {
      setError('Sign up failed. Please check your email for confirmation.');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left Side Image (hidden on md and below) */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-white">
        <Image
          src="/images/signup_img.jpg"
          alt="Signup Visual"
          width={800}
          height={800}
          className="max-w-full max-h-[80vh] object-contain"
        />
      </div>

      {/* Right Side Form */}
      <main className="flex flex-1 items-center justify-center bg-white py-12">
        <div className="w-full max-w-md mx-auto p-8 rounded-lg shadow">
          <h1 className="text-gray-800 text-2xl font-bold mb-6 text-center">Sign Up</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              required
              className="px-4 py-2 border text-gray-700 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="px-4 py-2 border text-gray-700 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="phone_number"
              placeholder="Phone Number"
              value={form.phone_number}
              onChange={handleChange}
              required
              className="px-4 py-2 border text-gray-700 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              className="px-4 py-2 border text-gray-700 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition"
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
            {error && <div className="text-red-600 text-sm">{error}</div>}
          </form>
          <div className="mt-4 text-center text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-semibold">
              Log In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
