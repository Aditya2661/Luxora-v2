'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Navbar from './Navbar';
// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [query, setQuery] = useState('');
  const [user, setUser] = useState(undefined); // undefined: loading, null: not logged in, object: logged in
  const router = useRouter();

  // Check user authentication status on mount and on auth state change
  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) {
        setUser(data.user ?? null);
        console.log('Supabase user (on mount):', data.user);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      console.log('Supabase user (onAuthStateChange):', session?.user ?? null);
    });
    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to search for products.');
      return;
    }
    if (query.trim()) {
      router.push(`/${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className='bg-white h-screen'>
      <Navbar />
      <main className="max-w-xl mx-auto my-8 p-5 bg-white rounded shadow">
  
  <form onSubmit={handleSubmit} className="flex gap-2">
    <input
      type="text"
      placeholder="Search for products..."
      value={query}
      onChange={e => setQuery(e.target.value)}
      required
      className="flex-1 px-3 py-2 text-base text-gray-900 border border-black rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <button
      type="submit"
      className="px-4 py-2 text-base bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition"
    >
      Search karo
    </button>
  </form>
</main>
    </div>
  );
}
