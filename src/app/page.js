'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './Navbar';
export default function Home() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <>
    <Navbar/>
    <main style={{ maxWidth: 600, margin: '2rem auto', padding: 20 }}>
      <h1>Amazon Product Search</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="Search for products..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          required
          style={{ flex: 1, padding: 8, fontSize: 16 }}
        />
        <button type="submit" style={{ padding: '8px 16px', fontSize: 16 }}>
          Search
        </button>
      </form>
    </main>
    </>
  );
}
