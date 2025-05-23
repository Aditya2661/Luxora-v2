import { NextResponse } from 'next/server';
import { chromium } from 'playwright';

async function extractAmazonProducts(searchQuery) {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  
  const page = await context.newPage();
  const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}`;

  try {
    await page.goto(amazonUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('[data-component-type="s-search-result"]', { timeout: 10000 });

    const productElements = await page.$$('[data-component-type="s-search-result"]');
    const products = [];

    for (const [index, el] of productElements.entries()) {
      if (index >= 15) break;

      try {
        const title = await el.$eval('h2 span', (n) => n.textContent.trim()).catch(() => 'N/A');

        let price = await el.$eval('span.a-price > span.a-offscreen', (n) => n.textContent.trim()).catch(() => null);
        if (!price) {
          const priceWhole = await el.$eval('.a-price-whole', (n) =>
            n.textContent.replace(/[^\d]/g, '')
          ).catch(() => '');
          const priceFraction = await el.$eval('.a-price-fraction', (n) => n.textContent.trim()).catch(() => '');
          price = priceWhole ? `$${priceWhole}${priceFraction ? '.' + priceFraction : ''}` : 'N/A';
        }

        let url = await el.$eval('h2 a', (n) => n.getAttribute('href')).catch(() => null);
        if (url && !url.startsWith('http')) {
          url = `https://www.amazon.com${url}`;
        }
        if (!url) url = 'N/A';

        const rating = await el.$eval('.a-icon-alt', (n) => n.textContent.trim()).catch(() => 'N/A');
        const reviews = await el.$eval('.a-row.a-size-small span.a-size-base', (n) =>
          n.textContent.trim()
        ).catch(() => 'N/A');
        const image = await el.$eval('img.s-image', (n) => n.src).catch(() => 'N/A');

        if (title !== 'N/A') {
          products.push({ title, price, rating, reviews, url, image, source: 'Amazon' });
        }
      } catch (err) {
        console.error(`Error extracting Amazon product ${index}:`, err.message);
      }
    }

    await browser.close();
    return products;
  } catch (error) {
    console.error('Amazon scraping error:', error.message);
    await browser.close();
    return [];
  }
}

async function discoverFlipkartSelectors(page) {
  return await page.evaluate(() => {
    // Look for containers that likely contain product information
    const candidateSelectors = [
      'div[data-id]',
      'a[data-id]',
      'div[class*="_"]:has(img):has(a[href*="/p/"])',
      'div[class*="_"]:has(img):has([class*="price"])',
      'a[href*="/p/"]',
      'div[class*="_"] > a[href*="/p/"]'
    ];

    const results = [];
    
    for (const selector of candidateSelectors) {
      try {
        const elements = document.querySelectorAll(selector);
        if (elements.length >= 3) { // At least 3 products
          // Check if these elements actually contain product-like content
          let validCount = 0;
          for (let i = 0; i < Math.min(5, elements.length); i++) {
            const el = elements[i];
            const hasImage = el.querySelector('img');
            const hasLink = el.querySelector('a[href*="/p/"]') || el.matches('a[href*="/p/"]');
            const hasPrice = el.textContent.includes('₹');
            
            if ((hasImage || hasLink) && hasPrice) {
              validCount++;
            }
          }
          
          if (validCount >= 2) {
            results.push({
              selector,
              count: elements.length,
              validCount,
              score: validCount / Math.min(5, elements.length)
            });
          }
        }
      } catch (e) {
        // Skip invalid selectors
      }
    }

    // Also try to find common class patterns
    const productContainers = [];
    const allDivs = document.querySelectorAll('div[class*="_"]');
    
    Array.from(allDivs).forEach(div => {
      const hasImg = div.querySelector('img');
      const hasLink = div.querySelector('a[href*="/p/"]');
      const hasPrice = div.textContent.includes('₹');
      
      if (hasImg && (hasLink || hasPrice)) {
        const classes = div.className.split(' ').filter(c => c.includes('_'));
        classes.forEach(cls => {
          const existing = productContainers.find(p => p.className === cls);
          if (existing) {
            existing.count++;
          } else {
            productContainers.push({ className: cls, count: 1 });
          }
        });
      }
    });

    const topClasses = productContainers
      .filter(p => p.count >= 3)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { 
      selectorResults: results.sort((a, b) => b.score - a.score),
      classResults: topClasses
    };
  });
}

async function extractFlipkartProducts(searchQuery) {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1366, height: 768 },
  });

  const page = await context.newPage();
  const flipkartUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(searchQuery)}`;

  try {
    console.log('Navigating to Flipkart:', flipkartUrl);
    await page.goto(flipkartUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Handle popups
    const popupSelectors = [
      'button._2KpZ6l._2doB4z',
      'button[class*="close"]',
      'span._30XB9F',
      'button._2AkmmA'
    ];

    for (const selector of popupSelectors) {
      try {
        await page.click(selector, { timeout: 2000 });
        await page.waitForTimeout(1000);
        break;
      } catch (e) {
        // Continue to next
      }
    }

    // Wait for content to load
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(3000);

    // Discover current selectors
    console.log('Discovering Flipkart selectors...');
    const discovery = await discoverFlipkartSelectors(page);
    console.log('Discovery results:', JSON.stringify(discovery, null, 2));

    let productElements = [];
    
    // Try discovered selectors first
    for (const result of discovery.selectorResults) {
      try {
        console.log(`Trying selector: ${result.selector} (score: ${result.score})`);
        productElements = await page.$$(result.selector);
        if (productElements.length >= 3) {
          console.log(`✅ Found ${productElements.length} products with: ${result.selector}`);
          break;
        }
      } catch (e) {
        console.log(`❌ Selector failed: ${result.selector}`);
      }
    }

    // Try class-based selectors
    if (!productElements.length) {
      for (const classResult of discovery.classResults) {
        try {
          const selector = `div.${classResult.className}`;
          console.log(`Trying class selector: ${selector}`);
          productElements = await page.$$(selector);
          if (productElements.length >= 3) {
            console.log(`✅ Found ${productElements.length} products with class: ${classResult.className}`);
            break;
          }
        } catch (e) {
          console.log(`❌ Class selector failed: ${selector}`);
        }
      }
    }

    // Ultimate fallback
    if (!productElements.length) {
      console.log('🔄 Using fallback approach...');
      const fallbackSelectors = [
        'a[href*="/p/"]',
        'div:has(img):has(a)',
        'div[class*="_"]:has(img)',
        'div[class*="_"]:has(a)'
      ];

      for (const selector of fallbackSelectors) {
        try {
          productElements = await page.$$(selector);
          if (productElements.length >= 3) {
            console.log(`✅ Fallback found ${productElements.length} elements with: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }

    if (!productElements.length) {
      console.log('❌ No product elements found');
      await browser.close();
      return [];
    }

    console.log(`Processing ${productElements.length} Flipkart elements...`);

    const extractProductData = async (el) => {
      return await el.evaluate((element) => {
        const getText = (selectors) => {
          const selectorList = Array.isArray(selectors) ? selectors : [selectors];
          for (const selector of selectorList) {
            try {
              const elem = element.querySelector(selector);
              if (elem && elem.textContent.trim()) {
                return elem.textContent.trim();
              }
            } catch (e) {
              continue;
            }
          }
          return 'N/A';
        };

        const getAttr = (selectors, attr) => {
          const selectorList = Array.isArray(selectors) ? selectors : [selectors];
          for (const selector of selectorList) {
            try {
              const elem = element.querySelector(selector);
              if (elem && elem.getAttribute(attr)) {
                return elem.getAttribute(attr);
              }
            } catch (e) {
              continue;
            }
          }
          return 'N/A';
        };

        // Enhanced selectors
        const titleSelectors = [
          'a[title]',
          'a[href*="/p/"]',
          'div[class*="title"] a',
          'h1', 'h2', 'h3',
          'a:first-of-type',
          'div[class*="_"] a[href*="/p/"]'
        ];

        const priceSelectors = [
          '[class*="price"]',
          'span:contains("₹")',
          'div:contains("₹")'
        ];

        let title = getText(titleSelectors);
        
        // If title is still N/A, try getting it from href attribute
        if (title === 'N/A') {
          const titleFromHref = getAttr(['a[href*="/p/"]'], 'title');
          if (titleFromHref !== 'N/A') {
            title = titleFromHref;
          }
        }

        let price = getText(priceSelectors);
        
        // If price not found, look for ₹ in all text
        if (price === 'N/A') {
          const allText = element.textContent;
          const priceMatch = allText.match(/₹[\d,]+/);
          if (priceMatch) {
            price = priceMatch[0];
          }
        }

        const rating = getText(['[class*="rating"]', '[class*="star"]', 'span[class*="_"]:contains(".")']);
        const reviews = getText(['[class*="review"]', 'span:contains("(")']);

        let url = getAttr(['a[href*="/p/"]', 'a'], 'href');
        if (url !== 'N/A' && !url.startsWith('http')) {
          url = `https://www.flipkart.com${url}`;
        }

        const image = getAttr(['img'], 'src') || getAttr(['img'], 'data-src');

        return { title, price, rating, reviews, url, image, source: 'Flipkart' };
      });
    };

    const products = [];
    const maxProducts = Math.min(productElements.length, 15);

    for (let i = 0; i < maxProducts; i++) {
      try {
        const product = await extractProductData(productElements[i]);
        
        // More lenient validation
        if (product.title !== 'N/A' || product.price !== 'N/A') {
          products.push(product);
        }
      } catch (err) {
        console.error(`Error extracting Flipkart product ${i}:`, err.message);
      }
    }

    console.log(`✅ Successfully extracted ${products.length} Flipkart products`);
    await browser.close();
    return products;

  } catch (error) {
    console.error('❌ Flipkart scraping error:', error.message);
    await browser.close();
    return [];
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const searchQuery = body.search || 'iphones';

    console.log(`🔍 Searching for: "${searchQuery}"`);

    const [amazonData, flipkartData] = await Promise.all([
      extractAmazonProducts(searchQuery),
      extractFlipkartProducts(searchQuery),
    ]);

    console.log(`📊 Results - Amazon: ${amazonData.length}, Flipkart: ${flipkartData.length}`);

    const combined = [...amazonData, ...flipkartData];

    return NextResponse.json({ 
      data: combined,
      metadata: {
        amazon: amazonData.length,
        flipkart: flipkartData.length,
        total: combined.length
      }
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error in combined scraper:', error);
    return NextResponse.json({ 
      error: error.message,
      suggestion: 'One or both sites may have updated their structure. Check the logs for more details.'
    }, { status: 500 });
  }
}