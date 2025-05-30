'use client';
import Image from 'next/image';
import Navbar from '../Navbar';
import Footer from '../Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-5xl mx-auto px-2 py-12 space-y-20">
        {/* 1. What is Luxora (Image Left, Content Right) */}
        <section className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="md:w-1/2 flex justify-center md:justify-start">
            <Image
              src="/images/whatLuxora.jpg"
              alt="What is Luxora"
              width={400}
              height={300}
              className="max-w-sm rounded-lg shadow-lg object-cover"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-2xl font-extrabold text-blue-700 mb-4">What is Luxora</h2>
            <p className="text-gray-700 text-md leading-relaxed">
              Luxora is your one-stop shop for the best deals and products from top online retailers. We provide a seamless experience to discover, like, and shop your favorite items all in one place.
            </p>
          </div>
        </section>

        {/* 2. Why Luxora (Image Right, Content Left) */}
        <section className="flex flex-col md:flex-row-reverse items-center md:items-start gap-8">
          <div className="md:w-1/2 flex justify-center md:justify-end">
            <Image
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
              alt="Why Luxora"
              width={400}
              height={300}
              className="max-w-sm rounded-lg shadow-lg object-cover"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-2xl font-extrabold text-blue-700 mb-4">Why Luxora</h2>
            <p className="text-gray-700 text-md leading-relaxed">
              We simplify your shopping experience by aggregating products from multiple sources, providing real-time price comparisons, and enabling you to save and manage your favorite items effortlessly.
            </p>
          </div>
        </section>

        {/* 3. How it was made (Image Left, Content Right) */}
        <section className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="md:w-1/2 flex justify-center md:justify-start">
            <Image
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80"
              alt="How it was made"
              width={400}
              height={300}
              className="max-w-sm rounded-lg shadow-lg object-cover"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-2xl font-extrabold text-blue-700 mb-4">How it was made</h2>
            <p className="text-gray-700 text-md leading-relaxed">
              Luxora is built with Next.js for a fast and scalable frontend, Tailwind CSS for responsive styling, Supabase for backend services including authentication and database, Playwright for web scraping product data, and Redis for caching to ensure quick search results.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
