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
      if (!user) {
        router.push('/'); // redirect if not logged in
        return;
      }
      const { data, error } = await supabase
        .from('liked_items')
        .select('*')
        .eq('user_id', user.id);
      setLikedItems(data || []);
      setLoading(false);
    };
    fetchLikedItems();
  }, [router]);

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <main style={{ maxWidth: 1200, margin: '2rem auto', padding: 20 }}>
      <button
        onClick={() => router.push('/dashboard')}
        style={{
          marginBottom: 24,
          padding: '8px 16px',
          background: '#0070f3',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        ← Back to Dashboard
      </button>
      <h1>Liked Items</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(1, 1fr)',
          gap: 24,
        }}
        className="product-grid"
      >
        {likedItems.map((item, i) => (
          <div key={i} className="product-card" style={{
            border: '1px solid #eee',
            borderRadius: 8,
            padding: 16,
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <img src={item.image_url} alt={item.title} style={{ width: 150, height: 150, objectFit: 'contain', marginBottom: 12 }} />
            <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 'bold', fontSize: 18, textAlign: 'center', color: '#222', marginBottom: 8 }}>{item.title}</a>
            <div style={{ marginBottom: 4 }}>Price: {item.price}</div>
            <div style={{ marginBottom: 4 }}>Rating: {item.rating}</div>
            <div style={{ marginBottom: 8 }}>Reviews: {item.reviews}</div>
            <div style={{
              display: 'inline-block',
              marginTop: 8,
              padding: '4px 12px',
              background: item.source === 'Amazon' ? '#232f3e' : '#2874f0',
              color: '#fff',
              borderRadius: 4,
              fontSize: 14,
              fontWeight: 'bold'
            }}>
              {item.source}
            </div>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                marginTop: 8,
                padding: '8px 16px',
                background: '#ff9900',
                color: '#fff',
                borderRadius: 4,
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              Buy Now
            </a>
          </div>
        ))}
      </div>
      {/* Responsive grid styling */}
      <style jsx>{`
        @media (min-width: 600px) {
          .product-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (min-width: 900px) {
          .product-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>
      {!loading && likedItems.length === 0 && (
        <div>No liked items found.</div>
      )}
    </main>
  );
}
