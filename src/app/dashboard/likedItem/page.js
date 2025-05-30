'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const getSourceLogo = (source) => {
  if (!source) return '/images/amazon.jpg';
  const s = source.toLowerCase();
  if (s.includes('flipkart')) return '/images/flip.jpg';
  return '/images/amazon.jpg';
};
function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}
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

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-white">
    <img
      src="https://media.giphy.com/media/swhRkVYLJDrCE/giphy.gif?cid=ecf05e47ym6t64gyyu4lnhjzk458y2lks75nifdnmh28a7us&ep=v1_gifs_search&rid=giphy.gif&ct=g"
      alt="Loading..."
      className="h-60 w-50 object-contain"
      style={{ background: 'white', borderRadius: '4px', padding: '2px' }}
    />
    </div>;

  return (
    <div className='bg-gradient-to-br from-blue-50 to-purple-50'>
    <main className="max-w-6xl mx-auto py-10 px-6  min-h-screen font-sans">
      <button
        onClick={() => router.push('/dashboard')}
        className="mb-8 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition"
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
              className="relative bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg p-5 flex flex-col items-center text-center transition"
            >
              {/* Source Logo (top left corner) */}
              <div className="absolute top-3 left-3 z-10 bg-white rounded shadow p-1">
                <img
                  src={getSourceLogo(item.source)}
                  alt={item.source}
                  className="h-6 w-auto object-contain"
                />
              </div>

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
              <div className="text-sm text-gray-700 mb-2">📝 Reviews: {item.reviews}</div>

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
      )}
    </main>
    </div>
  );
}