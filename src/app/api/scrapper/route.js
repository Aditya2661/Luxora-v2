import { NextResponse } from 'next/server';
import { chromium } from 'playwright';
async function extractPrice(el) {
  // Try the most common price location
  let price = await el.$eval('span.a-price > span.a-offscreen', n => n.textContent.trim()).catch(() => null);

  // Try old price (strike-through)
  if (!price) {
    price = await el.$eval('span.a-price.a-text-price > span.a-offscreen', n => n.textContent.trim()).catch(() => null);
  }

  // Try deal price (medium size)
  if (!price) {
    price = await el.$eval('span.a-price.a-text-price.a-size-medium > span.a-offscreen', n => n.textContent.trim()).catch(() => null);
  }

  // Try split price (whole + fraction)
  if (!price) {
    const priceWhole = await el.$eval('.a-price-whole', n => n.textContent.replace(/[^\d]/g, '')).catch(() => '');
    const priceFraction = await el.$eval('.a-price-fraction', n => n.textContent.trim()).catch(() => '');
    if (priceWhole && priceFraction) {
      price = `$${priceWhole}.${priceFraction}`;
    } else if (priceWhole) {
      price = `$${priceWhole}`;
    }
  }

  // Try .a-color-price (rare, but appears for some deals)
  if (!price) {
    price = await el.$eval('.a-color-price', n => n.textContent.trim()).catch(() => null);
  }

  // Try .a-row .a-color-base (very rare)
  if (!price) {
    price = await el.$eval('.a-row .a-color-base', n => n.textContent.trim()).catch(() => null);
  }

  // Clean up price (remove extra text, keep only $ and numbers)
  if (price) {
    const match = price.match(/[\$£€]\s?[\d,]+(\.\d{2})?/);
    if (match) {
      price = match[0].replace(/\s+/g, '');
    }
  }

  // Return price or 'N/A'
  return price || 'N/A';
}

export async function POST(request) {
  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36'
    });
    const page = await context.newPage();

    const searchQuery = 'iphones';
    const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}`;

    await page.goto(amazonUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-component-type="s-search-result"]');

    const productElements = await page.$$('[data-component-type="s-search-result"]');
    const products = [];
    
    for (const [index, el] of productElements.entries()) {
  if (index >= 15) break;

  // Title
  const title = await el.$eval('h2 span', n => n.textContent.trim()).catch(() => 'N/A');

  // Improved Price Extraction
  const price = await extractPrice(el);
  

  // Improved URL Extraction
  let url = await el.$eval('h2 a', n => n.getAttribute('href')).catch(() => null);
  if (url && !url.startsWith('http')) {
    url = `https://www.amazon.com${url}`;
  }
  if (!url || url === 'N/A') {
    // Try alternative selectors
    url = await el.$eval('a.a-link-normal', n => n.getAttribute('href')).catch(() => null);
    if (url && !url.startsWith('http')) {
      url = `https://www.amazon.com${url}`;
    }
  }
  if (!url) url = 'N/A';

  // Rating
  const rating = await el.$eval('.a-icon-alt', n => n.textContent.trim()).catch(() => 'N/A');

  // Reviews
  const reviews = await el.$eval('.a-row.a-size-small span.a-size-base', n => n.textContent.trim()).catch(() => 'N/A');

  // Image
  const image = await el.$eval('img.s-image', n => n.src).catch(() => 'N/A');

  products.push({ title, price, rating, reviews, url, image });
}




    await browser.close();

    return NextResponse.json({ data: products }, { status: 200 });
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
