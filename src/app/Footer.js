const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-100 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:justify-between gap-8">
        {/* Brand and description */}
        <div className="flex-1 mb-8 md:mb-0">
          <div className="text-2xl font-bold text-blue-400 mb-2">Luxora</div>
          <p className="text-gray-400 max-w-xs">
            Your one-stop shop for the best deals and products. Discover, like, and shop with ease.
          </p>
        </div>
        {/* Navigation */}
        <div className="flex-1 mb-8 md:mb-0">
          <h4 className="font-semibold text-lg mb-3">Quick Links</h4>
          <ul className="space-y-2">
            <li><a href="/" className="hover:text-blue-400 transition">Home</a></li>
            <li><a href="/dashboard" className="hover:text-blue-400 transition">Dashboard</a></li>
            <li><a href="/about" className="hover:text-blue-400 transition">About</a></li>
            <li><a href="/cart" className="hover:text-blue-400 transition">Cart</a></li>
          </ul>
        </div>
        {/* Social and contact */}
        <div className="flex-1">
          <h4 className="font-semibold text-lg mb-3">Connect</h4>
          <div className="flex space-x-4 mb-3">
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.56a9.93 9.93 0 0 1-2.83.78A4.93 4.93 0 0 0 23.34 3c-.95.56-2 .97-3.12 1.19A4.92 4.92 0 0 0 16.62 2c-2.73 0-4.94 2.2-4.94 4.92 0 .39.04.76.12 1.12C7.69 7.85 4.07 6.13 1.64 3.16c-.43.74-.67 1.6-.67 2.51 0 1.73.88 3.25 2.22 4.14a4.94 4.94 0 0 1-2.23-.62v.06c0 2.42 1.72 4.44 4 4.9-.42.11-.86.17-1.32.17-.32 0-.62-.03-.92-.08.62 1.94 2.42 3.36 4.56 3.4A9.89 9.89 0 0 1 0 21.54a13.94 13.94 0 0 0 7.56 2.21c9.05 0 14-7.5 14-14 0-.21 0-.42-.02-.63A9.93 9.93 0 0 0 24 4.56z"/></svg>
            </a>
            <a href="https://github.com/Aditya2661" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .5A11.5 11.5 0 0 0 .5 12c0 5.09 3.29 9.38 7.86 10.89.58.11.79-.25.79-.56v-2.2c-3.2.7-3.87-1.54-3.87-1.54-.53-1.36-1.3-1.72-1.3-1.72-1.06-.73.08-.72.08-.72 1.17.08 1.79 1.21 1.79 1.21 1.04 1.78 2.74 1.27 3.41.97.11-.75.41-1.27.74-1.56-2.56-.29-5.26-1.28-5.26-5.68 0-1.25.44-2.27 1.17-3.07-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.17a11.1 11.1 0 0 1 2.9-.39c.99 0 1.98.13 2.9.39 2.21-1.48 3.18-1.17 3.18-1.17.62 1.58.23 2.75.12 3.04.73.8 1.17 1.82 1.17 3.07 0 4.41-2.7 5.39-5.27 5.67.42.36.79 1.08.79 2.18v3.23c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z"/></svg>
            </a>
            {/* Add more social icons as needed */}
          </div>
          <div className="text-gray-400 text-sm">
            Email: <a href="mailto:" className="hover:text-blue-400">support@luxora.com</a>
          </div>
        </div>
      </div>
      <div className="mt-8 border-t border-gray-700 pt-4 text-center text-gray-500 text-xs">
        &copy; {currentYear} Luxora. All rights reserved.
      </div>
    </footer>
  );
}
