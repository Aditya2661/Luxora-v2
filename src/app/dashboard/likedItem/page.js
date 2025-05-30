'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LikedItemsPage() {
  const [likedItems, setLikedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchLikedItems = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/');

      const { data } = await supabase
        .from('liked_items')
        .select('*')
        .eq('user_id', user.id);

      setLikedItems(data || []);
      setLoading(false);
    };
    fetchLikedItems();
  }, [router]);

  const handleRemove = async (itemId) => {
    const { error } = await supabase
      .from('liked_items')
      .delete()
      .eq('id', itemId);

    if (!error) {
      setLikedItems((prev) => prev.filter(item => item.id !== itemId));
    } else {
      console.error('Error removing item:', error.message);
    }
  };

  if (loading) return <div className="py-20 text-center text-gray-500 text-lg">Loading...</div>;

  return (
    <div className='bg-white'>
    <main className="max-w-6xl mx-auto py-10 px-6 bg-gradient-to-br from-yellow-50 to-pink-100 min-h-screen font-sans">
      <button
        onClick={() => router.push('/dashboard')}
        className="mb-8 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition"
      >
        ← Back to Dashboard
      </button>

      <h1 className="text-4xl font-extrabold mb-10 text-center text-gray-800">Liked Items</h1>

      {likedItems.length === 0 ? (
        <div className="text-center text-gray-500 text-lg">No liked items found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {likedItems.map((item) => (
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
                {item.title}
              </a>
              <div className="text-sm text-gray-700 mb-1">💰 Price: {item.price}</div>
              <div className="text-sm text-gray-700 mb-1">⭐ Rating: {item.rating}</div>
              <div className="text-sm text-gray-700 mb-3">📝 Reviews: {item.reviews}</div>

              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold text-white mb-3 ${
                  item.source === 'Amazon' ? 'bg-[#232f3e]' : 'bg-[#2874f0]'
                }`}
              >
                {item.source}
              </span>

              <div className="flex gap-3 mt-auto">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium transition"
                >
                  Buy Now
                </a>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
    </div>
  );
}