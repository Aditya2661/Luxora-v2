# Luxora

**Luxora** is a modern web application that helps users search, compare, and track products from top online retailers like Amazon and Flipkart. Built with Next.js, Tailwind CSS, Supabase, and Playwright, Luxora provides a seamless, personalized shopping experience with real-time price comparisons, user authentication, and a dashboard for managing liked and carted items.

---

## Features

- **Product Search & Comparison:**  
  - Search for products across multiple retailers.
  - Compare prices, ratings, and reviews in a unified interface.
- **User Authentication:**  
  - Secure signup and login using Supabase Auth.
  - User profiles and session management.
- **Personal Dashboard:**  
  - View and manage liked items.
  - Track items added to your cart.
- **Real-Time Data:**  
  - Scrape and display the latest product data.
  - Automatic updates for prices and availability.
- **Responsive Design:**  
  - Optimized for desktop and mobile devices.
  - Modern UI with Tailwind CSS.

---

## Technologies Used

| Technology      | Purpose                                      |
|-----------------|----------------------------------------------|
| Next.js         | Frontend framework and server-side rendering |
| React           | UI components and state management           |
| Tailwind CSS    | Responsive styling and utility-first design  |
| Supabase        | Authentication, database, and backend logic  |
| Playwright      | Web scraping for product data                |
| Redis           | Caching for faster search results            |
                      

---

## Getting Started

### 1. Clone the Repository

git clone https://github.com/Aditya2661/Luxora-v2.git
cd Luxora-v2

### 2. Install Dependencies

npm install


### 3. Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
REDIS_URL=your-redis-url
NODE_ENV=production


- **Supabase URL and Anon Key:**  
  - Get these from your Supabase project dashboard under API settings[1][3].
- **Redis URL:**  
  - Get this from your Redis service provider (e.g., Render Key-Value).
- **NODE_ENV:**  
  - Set to `production` for deployment; Next.js will use `development` locally by default.

---

### 4. Run the Development Server
npm run dev

