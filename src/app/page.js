'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Navbar from './Navbar';
import Footer from './Footer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [query, setQuery] = useState('');
  const [user, setUser] = useState(undefined);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setUser(data.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
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
    <div className="flex flex-col min-h-screen bg-white font-poppins">
      <Navbar />
      
      {/* Hero Section */}
      <section className="flex-1 bg-gradient-to-b from-blue-50 to-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find the Best Deals Online with <span className="text-blue-600">Luxora</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Compare products from Flipkart and Amazon in one place.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center">
            <input
              type="text"
              placeholder="Search for laptops, phones, gadgets..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              required
              className="flex-1 px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-md text-base font-semibold hover:bg-blue-700 transition cursor-pointer"
            >
              Search karo
            </button>
          </form>

          
        </div>
      </section>

      <section className="bg-white py-10 px-4 border-t">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Compare Prices</h3>
            <p className="text-gray-600 text-sm">Get the best prices across platforms instantly.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Verified Listings</h3>
            <p className="text-gray-600 text-sm">Only reliable products are shown, with real-time updates.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Personal Dashboard</h3>
            <p className="text-gray-600 text-sm">Track your searches, history and favorites easily.</p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
