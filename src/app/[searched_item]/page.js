'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function SearchedItemPage() {
  const { searched_item } = useParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <main style={{ maxWidth: 800, margin: '2rem auto', padding: 20 }}>
      {/* Go Back Button */}
      <button
        onClick={() => router.push('/')}
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
        ← Go Back
      </button>

      <h1>Results for: <span style={{ color: '#0070f3' }}>{searched_item}</span></h1>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {products.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {products.map((p, i) => (
            <li key={i} style={{ marginBottom: 24, borderBottom: '1px solid #eee', paddingBottom: 16 }}>
              <img src={p.image} alt={p.title} style={{ width: 120, height: 'auto', float: 'left', marginRight: 16 }} />
              <div>
                <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 'bold', fontSize: 18 }}>{p.title}</a>
                <div>Price: {p.price}</div>
                <div>Rating: {p.rating}</div>
                <div>Reviews: {p.reviews}</div>
                <a
                  href={p.url}
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
              <div style={{ clear: 'both' }}></div>
            </li>
          ))}
        </ul>
      )}
      {!loading && products.length === 0 && !error && (
        <div>No products found.</div>
      )}
    </main>
  );
}
