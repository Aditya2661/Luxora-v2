'use client';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 32px',
        background: '#fff',
        borderBottom: '1px solid #eee',
        marginBottom: 32,
      }}
    >
      {/* Left: Brand */}
      <div>
        <Link href="/" style={{ fontWeight: 'bold', fontSize: 24, color: '#0070f3', textDecoration: 'none' }}>
          Luxora
        </Link>
      </div>
      {/* Right: Nav Links */}
      <div style={{ display: 'flex', gap: 24 }}>
        <Link href="/about" style={{ color: '#333', textDecoration: 'none', fontSize: 16 }}>
          About
        </Link>
        <Link href="/dashboard" style={{ color: '#333', textDecoration: 'none', fontSize: 16 }}>
          Dashboard
        </Link>
      </div>
    </nav>
  );
}
