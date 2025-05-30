'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Footer from '../Footer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCartItems = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      const { data } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);
      setCartItems(data || []);
      setLoading(false);
    };
    fetchCartItems();
  }, [router]);

  const handleRemove = async (item) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('url', item.url)
      .eq('source', item.source || 'Amazon');
    setCartItems(prev => prev.filter(ci => ci.url !== item.url));
  };

  const handleBuyNow = (item) => {
    router.push('/checkout'); // Replace with actual logic if needed
  };

  return (
    <div className="bg-white">
      <main className="max-w-6xl mx-auto py-10 px-6 bg-gradient-to-br from-purple-100 to-blue-100 min-h-screen font-sans">
        <button
          onClick={() => router.push('/')}
          className="mb-8 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition"
        >
          ← Go Back
        </button>
        <h1 className="text-4xl font-extrabold mb-10 text-center text-gray-800">Your Cart</h1>

        {loading && <div className="text-lg text-gray-600">Loading...</div>}

        {!loading && cartItems.length === 0 && (
          <div className="text-gray-600 mt-10 text-center text-lg">Your cart is empty.</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg p-5 flex flex-col items-center text-center transition"
            >
              <img
                src={item.image_url}
                alt={item.title}
                className="w-40 h-40 object-contain mb-4"
              />
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-lg text-gray-900 mb-2 hover:underline line-clamp-2"
              >
                {truncateText(item.title, 60)}
              </a>
              <div className="text-sm text-gray-700 mb-1">💰 Price: {item.price}</div>
              <div className="text-sm text-gray-700 mb-1">⭐ Rating: {item.rating}</div>
              <div className="text-sm text-gray-700 mb-1">📝 Reviews: {item.reviews}</div>
              <div className="text-sm text-gray-700 mb-3">📦 Quantity: {item.quantity}</div>

              <span
                className={`px-3 py-1 rounded-md text-sm font-semibold text-white mb-3 ${
                  item.source === 'Amazon' ? 'bg-[#232f3e]' : 'bg-[#2874f0]'
                }`}
              >
                {item.source}
              </span>

              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => handleBuyNow(item)}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium transition"
                >
                  Buy Now
                </button>
                <button
                  onClick={() => handleRemove(item)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer/>
    </div>
  );
}