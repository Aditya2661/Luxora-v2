'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Navbar from '../Navbar';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// You can use your own GIF/image URLs here:
const LOADING_GIF = "https://cdn.jsdelivr.net/gh/napthedev/assets-cdn/buffering-dark.gif";
const CRYING_EMOJI = "https://em-content.zobj.net/source/microsoft-teams/363/loudly-crying-face_1f62d.png";

export default function SearchedItemPage() {
  const { searched_item } = useParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState({});
  const [carted, setCarted] = useState({});

  // Fetch products
  useEffect(() => {
    if (!searched_item) return;
    setLoading(true);
    setError('');
    setProducts([]);
    fetch('/api/scrapper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ search: searched_item }),
    })
      .then(res => res.json())
      .then(data => {
        setProducts(data.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch products.');
        setLoading(false);
      });
  }, [searched_item]);

  // Fetch liked/carted items
  useEffect(() => {
    const fetchUserItems = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Liked
      const { data: likedData } = await supabase
        .from('liked_items')
        .select('url')
        .eq('user_id', user.id);
      const likedMap = {};
      (likedData || []).forEach(item => { likedMap[item.url] = true; });
      setLiked(likedMap);
      // Carted
      const { data: cartData } = await supabase
        .from('cart_items')
        .select('url')
        .eq('user_id', user.id);
      const cartMap = {};
      (cartData || []).forEach(item => { cartMap[item.url] = true; });
      setCarted(cartMap);
    };
    fetchUserItems();
  }, [searched_item]);

  const handleLike = async (product) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please sign in to like products.');
      return;
    }
    if (liked[product.url]) {
      await supabase
        .from('liked_items')
        .delete()
        .eq('user_id', user.id)
        .eq('url', product.url)
        .eq('source', product.source || 'Amazon');
      setLiked(prev => ({ ...prev, [product.url]: false }));
    } else {
      await supabase.from('liked_items').upsert([{
        user_id: user.id,
        source: product.source || 'Amazon',
        url: product.url,
        title: product.title,
        price: product.price,
        image_url: product.image,
        rating: product.rating,
        reviews: product.reviews,
      }], { onConflict: ['user_id', 'source', 'url'] });
      setLiked(prev => ({ ...prev, [product.url]: true }));
    }
  };

  const handleCart = async (product) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please sign in to add to cart.');
      return;
    }
    if (carted[product.url]) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('url', product.url)
        .eq('source', product.source || 'Amazon');
      setCarted(prev => ({ ...prev, [product.url]: false }));
    } else {
      await supabase.from('cart_items').upsert([{
        user_id: user.id,
        source: product.source || 'Amazon',
        url: product.url,
        title: product.title,
        price: product.price,
        image_url: product.image,
        rating: product.rating,
        reviews: product.reviews,
        quantity: 1,
      }], { onConflict: ['user_id', 'source', 'url'] });
      setCarted(prev => ({ ...prev, [product.url]: true }));
    }
  };

  return (
    <div className="min-h-screen w-full bg-white">
      <Navbar />
      <main className="px-4 max-w-7xl mx-auto">
        <button
          onClick={() => router.push('/')}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition"
        >
          ← Go Back
        </button>
        <h1 className="text-gray-800 text-l font-bold mb-6">
          Results for: <span className="text-blue-600">{searched_item}</span>
        </h1>
        {loading ? (
          // Centered buffering GIF
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <img
              src={LOADING_GIF}
              alt="Loading..."
              className="w-20 h-20 md:w-28 md:h-28"
            />
            <span className="mt-4 text-gray-700 text-lg font-semibold">Loading...</span>
          </div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : products.length === 0 ? (
          // Centered crying emoji and message
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <img
              src={CRYING_EMOJI}
              alt="No products found"
              className="w-24 h-24 md:w-32 md:h-32"
            />
            <span className="mt-4 text-gray-600 text-xl font-semibold text-center">No products found</span>
          </div>
        ) : (
          
          <div className="grid grid-cols-1 sm:grid-cols-2 bg-gray-300 lg:grid-cols-3 gap-5">
  {products.map((p, i) => (
    <div
      key={i}
      className="relative flex flex-col items-center bg-white border border-gray-200 rounded-md shadow hover:shadow-lg transition p-3"
    >
      <img src={p.image} alt={p.title} className="w-28 h-28 object-contain mb-2" />
      <a
        href={p.url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-gray-800 text-base text-center hover:text-blue-600 mb-1 line-clamp-2"
      >
        {p.title}
      </a>
      <div className="mb-0.5 text-sm">
        Price: <span className="text-gray-700 font-semibold">{p.price}</span>
      </div>
      <div className="text-gray-500 mb-0.5 text-sm">Rating: {p.rating}</div>
      <div className="text-gray-500 mb-1 text-sm">Reviews: {p.reviews}</div>
      <a
        href={p.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-1 px-3 py-1.5 bg-orange-500 text-white rounded font-bold text-sm hover:bg-yellow-600 transition"
      >
        Buy Now
      </a>
      {/* Like Button */}
      <button
        onClick={() => handleLike(p)}
        className={`absolute top-2 right-10 text-xl transition ${liked[p.url] ? 'text-pink-600' : 'text-gray-400 hover:text-pink-400'}`}
        aria-label={liked[p.url] ? "Unlike" : "Like"}
      >
        {liked[p.url] ? '♥' : '♡'}
      </button>
      {/* Add to Cart Button */}
      <button
        onClick={() => handleCart(p)}
        className={`absolute top-2 right-2 text-xl transition ${carted[p.url] ? 'text-blue-600' : 'text-gray-400 hover:text-blue-400'}`}
        aria-label={carted[p.url] ? "Remove from cart" : "Add to cart"}
        title={carted[p.url] ? "Remove from cart" : "Add to cart"}
      >
        {carted[p.url] ? '🛒' : '🛍️'}
      </button>
    </div>
  ))}
</div>

        )}
      </main>
    </div>
  );
}
