'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Navbar() {
  const [user, setUser] = useState(undefined);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setUser(data.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Nav items for logged in and not logged in
  const navLinks = user === undefined ? (
    <span className="text-gray-800 text-base">Loading...</span>
  ) : !user ? (
    <>
      <button
        onClick={() => { setMenuOpen(false); router.push('/login'); }}
        className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 rounded"
      >
        Login
      </button>
      <button
        onClick={() => { setMenuOpen(false); router.push('/signUp'); }}
        className="w-full text-left px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition"
      >
        Sign Up
      </button>
    </>
  ) : (
    <>
      <button
        onClick={() => { setMenuOpen(false); router.push('/dashboard'); }}
        className="w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-50 rounded"
      >
        Dashboard
      </button>
      <button
        onClick={() => { setMenuOpen(false); router.push('/about'); }}
        className="w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-50 rounded"
      >
        About
      </button>
      <button
        onClick={() => { setMenuOpen(false); router.push('/cart'); }}
        className="w-full text-left px-4 py-2 text-gray-800 hover:bg-blue-50 rounded"
      >
        Cart
      </button>
    </>
  );

  return (
    <>
      <nav className="flex justify-between items-center mx-5 px-8 py-4 bg-white border-b border-gray-200 mb-8">
        <div>
          <span className="font-bold text-2xl text-blue-600">Luxora</span>
        </div>
        {/* Desktop Nav */}
        <div className="hidden md:flex gap-6">
          {user === undefined ? (
            <span className="text-gray-800 text-base">Loading...</span>
          ) : !user ? (
            <>
              <button
                onClick={() => router.push('/login')}
                className="bg-none border-none text-blue-600 text-base cursor-pointer hover:underline"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/signUp')}
                className="bg-blue-600 text-white rounded px-4 py-2 text-base font-bold hover:bg-blue-700 transition"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-800 bg-none border-none px-4 py-2 text-base cursor-pointer hover:underline"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/about')}
                className="bg-none border-none text-gray-800 text-base cursor-pointer hover:underline"
              >
                About
              </button>
              <button
                onClick={() => router.push('/cart')}
                className="bg-none border-none text-gray-800 text-base cursor-pointer hover:underline"
              >
                Cart
              </button>
            </>
          )}
        </div>
        {/* Hamburger for mobile */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(true)}
            className="text-gray-800 focus:outline-none"
            aria-label="Open menu"
          >
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* Side menu for mobile */}
      <div
        className={`fixed inset-0 z-50 bg-black bg-opacity-40 transition-opacity duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      />

      <aside className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-[60] transform transition-transform duration-300 ${menuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <span className="font-bold text-xl text-blue-600">Luxora</span>
          <button
            onClick={() => setMenuOpen(false)}
            className="text-gray-800 focus:outline-none"
            aria-label="Close menu"
          >
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="flex flex-col gap-2 px-4 py-6">
          {navLinks}
        </div>
      </aside>
    </>
  );
}
