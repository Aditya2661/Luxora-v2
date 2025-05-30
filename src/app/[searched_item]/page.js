'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import Navbar from '../Navbar';
import Footer from '../Footer.js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const LOADING_GIF = "/images/giphy.webp";
const CRYING_EMOJI = "/images/cry.png";
const amazonLogo = "/images/amazon.jpg"; // Make sure these are in public/images/
const flipkartLogo = "/images/flip.jpg";

const getSourceLogo = (source) => {
  if (!source) return amazonLogo;
  const s = source.toLowerCase();
  if (s.includes('flipkart')) return flipkartLogo;
  return amazonLogo;
};

export default function SearchedItemPage() {
  const { searched_item } = useParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState({});
  const [carted, setCarted] = useState({});
  const [sort, setSort] = useState('none'); // 'none', 'lowToHigh', 'highToLow'

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

  // Price sorting function
  function sortProducts(products, sort) {
    if (sort === 'none') return products;

    // Helper to extract price as a number (or null if invalid)
    const getPrice = (prod) => {
      if (!prod.price || prod.price === 'N/A') return null;
      return parseFloat(prod.price.replace(/[^0-9.-]+/g, '') || 0);
    };

    return [...products].sort((a, b) => {
      const priceA = getPrice(a);
      const priceB = getPrice(b);

      // Both prices valid: sort by price
      if (priceA !== null && priceB !== null) {
        return sort === 'lowToHigh' ? priceA - priceB : priceB - priceA;
      }
      // Only one price valid: valid price first
      if (priceA === null && priceB !== null) return 1;
      if (priceA !== null && priceB === null) return -1;
      // Both prices invalid: keep original order
      return 0;
    });
  }

  return (
    <div className="min-h-screen w-full bg-white">
      <Navbar />
      <main className="px-4 max-w-5xl mx-auto">
        <button
          onClick={() => router.push('/')}
          className="mb-6 mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          ← Go Back
        </button>
        <h1 className="text-gray-800 text-l font-bold mb-2">
          Results for: <span className="text-blue-600">{searched_item}</span>
        </h1>
        {/* Price Sort Controls */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSort('lowToHigh')}
            className={`px-3 py-1 rounded text-sm font-medium ${sort === 'lowToHigh' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
          >
            Price: Low to High
          </button>
          <button
            onClick={() => setSort('highToLow')}
            className={`px-3 py-1 rounded text-sm font-medium ${sort === 'highToLow' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
          >
            Price: High to Low
          </button>
          <button
            onClick={() => setSort('none')}
            className={`px-3 py-1 rounded text-sm font-medium ${sort === 'none' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
          >
            Reset
          </button>
        </div>
        {loading ? (
          // Centered loading GIF
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <Image
              src={LOADING_GIF}
              alt="Loading..."
              width={112}
              height={112}
              className="w-28 h-28 object-contain"
            />
            <span className="mt-4 text-gray-700 text-lg font-semibold">Loading...</span>
          </div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : products.length === 0 ? (
          // Centered crying emoji and message
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <Image
              src={CRYING_EMOJI}
              alt="No products found"
              width={128}
              height={128}
              className="w-32 h-32 object-contain"
            />
            <span className="mt-4 text-gray-600 text-xl font-semibold text-center">No products found</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortProducts(products, sort).map((p, i) => (
              <div
                key={i}
                className="relative flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-3"
              >
                {/* Source Logo (top left corner) */}
                <div className="absolute top-2 left-2 z-10 bg-white rounded shadow p-1">
                  <Image
                    src={getSourceLogo(p.source)}
                    alt={p.source}
                    width={24}
                    height={24}
                    className="h-6 w-auto object-contain"
                  />
                </div>
                {/* Large Product Image */}
                <Image
                  src={p.image}
                  alt={p.title}
                  width={192}
                  height={192}
                  className="w-48 h-48 object-contain mb-3"
                />
                {/* Product Title */}
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-800 text-md text-center hover:text-blue-600 mb-1 line-clamp-2"
                >
                  {p.title}
                </a>
                {/* Price (no "Price:" label) */}
                <div className="mb-2 text-gray-600 font-semibold">
                  Price: {p.price}
                </div>
                {/* Vertical Rating and Reviews */}
                <div className="flex flex-col items-center gap-1 mb-2 w-full">
                  <span className="text-sm text-gray-600">Rating: {p.rating}</span>
                  <span className="text-sm text-gray-600">Reviews: {p.reviews}</span>
                </div>
                {/* Buy Now Button */}
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg font-bold text-center hover:bg-orange-600 transition"
                >
                  Buy Now
                </a>
                {/* Like Button */}
                <button
                  onClick={() => handleLike(p)}
                  className={`absolute top-2 right-12 text-2xl transition ${liked[p.url] ? 'text-pink-600' : 'text-gray-400 hover:text-pink-400'}`}
                  aria-label={liked[p.url] ? "Unlike" : "Like"}
                >
                  {liked[p.url] ? '♥' : '♡'}
                </button>
                {/* Add to Cart Button */}
                <button
                  onClick={() => handleCart(p)}
                  className={`absolute top-2 right-4 text-2xl transition ${carted[p.url] ? 'text-blue-600' : 'text-gray-400 hover:text-blue-400'}`}
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
      <Footer />
    </div>
  );
}
