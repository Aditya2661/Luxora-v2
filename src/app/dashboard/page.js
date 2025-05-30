'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Navbar from '../Navbar';
import Footer from '../Footer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}



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
        .select('name, email, phone_number, created_at')
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
    <div className="flex items-center justify-center min-h-screen bg-white">
    <img
      src="https://media.giphy.com/media/swhRkVYLJDrCE/giphy.gif?cid=ecf05e47ym6t64gyyu4lnhjzk458y2lks75nifdnmh28a7us&ep=v1_gifs_search&rid=giphy.gif&ct=g"
      alt="Loading..."
      className="h-60 w-50 object-contain"
      style={{ background: 'white', borderRadius: '4px', padding: '2px' }}
    />
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <main className=" ">
        <div className="flex flex-col bg-gray-100 p-10 mx-5 md:flex-row gap-8">
          {/* Left: User Info */}
          <div className="flex-1 ">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Dashboard</h1>
            {userProfile ? (
              <div className="space-y-3 bg-white rounded-lg p-6 shadow mb-6">
                <div className="text-lg">
                  <span className="font-semibold text-gray-800">Name: </span> <span className='text-gray-700'>{userProfile.name}</span>
                </div>
                <div className="text-lg">
                  <span className="font-semibold text-gray-800">Email:</span> <span className='text-gray-700'>{userProfile.email}</span>
                </div>
                <div className="text-lg">
                  <span className="font-semibold text-gray-800">Phone:</span> <span className='text-gray-700'>{userProfile.phone_number}</span>
                </div>
                <div className="text-lg">
                  <span className="font-semibold text-black">Joined:</span> <span className='text-gray-700'>{formatDate(userProfile.created_at)}</span> 
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 mb-6">User profile not found.</div>
            )}
            {/* Buttons: Responsive row/column */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/dashboard/likedItem')}
                className="flex-1 px-6 py-2 border text-gray-800 border-solid-blue hover:bg-blue-700 hover:text-white rounded font-bold text-lg transition"
              >
                Liked Items
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-6 py-2 bg-red-500 border border-solid hover:border-red-900 hover:bg-gray-100  hover:text-red-800 text-white rounded font-bold text-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
          {/* Right: Empty for now */}
          <div className="flex-1 hidden md:block" />
        </div>
      </main>
      <Footer/>
    </div>
  );
}
