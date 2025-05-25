'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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

  return (
    <main className="max-w-5xl mx-auto py-8 px-4">
      <button
        onClick={() => router.push('/')}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition"
      >
        ← Go Back
      </button>
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      {loading && <div>Loading...</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {cartItems.map((item, i) => (
          <div
            key={i}
            className="relative flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg transition p-6"
          >
            <img src={item.image_url} alt={item.title} className="w-36 h-36 object-contain mb-4" />
            <a href={item.url} target="_blank" rel="noopener noreferrer"
              className="font-bold text-lg text-center text-gray-800 hover:text-blue-600 mb-2 line-clamp-2">{item.title}</a>
            <div className="mb-1">Price: <span className="font-semibold">{item.price}</span></div>
            <div className="mb-1">Rating: {item.rating}</div>
            <div className="mb-2">Reviews: {item.reviews}</div>
            <div className="mb-2">Quantity: {item.quantity}</div>
            <button
              onClick={() => handleRemove(item)}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded font-bold hover:bg-red-600 transition"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      {!loading && cartItems.length === 0 && (
        <div className="text-gray-500 mt-8">Your cart is empty.</div>
      )}
    </main>
  );
}
