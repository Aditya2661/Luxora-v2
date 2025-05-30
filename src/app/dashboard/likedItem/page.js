'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import Footer from '@/app/Footer';

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

  const handleBuyNow = (item) => {
    window.open(item.url, '_blank');
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="bg-white rounded p-2">
        <Image
          src="https://media.giphy.com/media/swhRkVYLJDrCE/giphy.gif?cid=ecf05e47ym6t64gyyu4lnhjzk458y2lks75nifdnmh28a7us&ep=v1_gifs_search&rid=giphy.gif&ct=g"
          alt="Loading..."
          width={200}
          height={200}
          className="h-60 w-50 object-contain"
        />
      </div>
    </div>
  );

  return (
    <div className='bg-gradient-to-br from-blue-50 to-purple-50'>
      <main className="max-w-5xl mx-auto py-10 px-4 sm:px-6 min-h-screen font-sans">
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-8 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-semibold mb-10 text-center text-gray-800">Liked Items</h1>

        {likedItems.length === 0 ? (
          <div className="text-center text-gray-500 text-lg">No liked items found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {likedItems.map((item) => (
              <div
                key={item.id}
                className="relative bg-white rounded-lg border border-gray-200 shadow-md hover:shadow-lg p-2 py-3 flex flex-col items-center text-center transition"
              >
                {/* Source Logo (top left corner) */}
                <div className="absolute top-3 left-3 z-10 bg-white rounded shadow p-1">
                  <Image
                    src={getSourceLogo(item.source)}
                    alt={item.source}
                    width={24}
                    height={24}
                    className="h-6 w-auto object-contain"
                  />
                </div>

                <Image
                  src={item.image_url}
                  alt={item.title}
                  width={160}
                  height={160}
                  className="w-40 h-40 object-contain mb-4"
                />
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-900 mb-2 hover:underline line-clamp-2"
                >
                  {truncateText(item.title, 60)}
                </a>
                <div className="text-xs text-gray-700 mb-1">💰 Price: {item.price}</div>
                <div className="text-xs text-gray-700 mb-1">⭐ Rating: {item.rating}</div>
                <div className="text-xs text-gray-700 mb-2">📝 Reviews: {item.reviews}</div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleBuyNow(item)}
                    className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-sm font-medium transition"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-sm font-medium transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer/>
    </div>
  );
}
