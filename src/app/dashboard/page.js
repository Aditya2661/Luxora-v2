'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/'); // redirect if not logged in
        return;
      }
      const { data } = await supabase
        .from('users')
        .select('name, email, phone_number')
        .eq('id', user.id)
        .single();
      setUserProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <span className="text-gray-500 text-lg">Loading...</span>
    </div>
  );

  return (
    <main className="max-w-lg mx-auto mt-12 p-8 rounded-xl bg-gray-50 shadow-lg relative">
      {/* Logout Button - Top Left */}
      <button
        onClick={handleLogout}
        className="absolute top-6 left-6 bg-red-500 hover:bg-red-600 text-white rounded px-4 py-2 font-bold shadow transition"
      >
        Logout
      </button>
      <h1 className="text-3xl font-extrabold text-center mb-8 text-blue-700">Dashboard</h1>
      {userProfile ? (
        <div className="mb-8 text-center space-y-3 bg-white rounded-lg p-6 shadow">
          <div className="text-lg">
            <span className="font-semibold text-gray-700">Name:</span> {userProfile.name}
          </div>
          <div className="text-lg">
            <span className="font-semibold text-gray-700">Email:</span> {userProfile.email}
          </div>
          <div className="text-lg">
            <span className="font-semibold text-gray-700">Phone:</span> {userProfile.phone_number}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">User profile not found.</div>
      )}
      <div className="text-center">
        <button
          onClick={() => router.push('/dashboard/likedItem')}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-lg transition"
        >
          View Liked Items
        </button>
      </div>
    </main>
  );
}
