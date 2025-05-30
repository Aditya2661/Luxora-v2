'use client';

import { useState, useEffect } from 'react';

export default function SplashScreen({ children }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for 2 seconds
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600">Luxora</div>
          <div className="text-gray-700 mt-4">Loading your experience...</div>
        </div>
      </div>
    );
  }

  return children;
}
