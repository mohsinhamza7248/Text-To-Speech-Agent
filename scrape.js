import puppeteer from 'puppeteer';

const BASE_URL = 'https://www.getmymettle.com';
const COLLECTION_URL = `${BASE_URL}/collections/whey-protein`;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const randomDelay = () => delay(1000 + Math.random() * 2000);

export async function scrapeProducts() {
  let browser = null;

  try {

    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    });

    const page = await browser.newPage();

    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    });

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });

    await page.goto(COLLECTION_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await delay(5000);

    await randomDelay();

    const productLinks = await page.evaluate(() => {
      const links = [];
      const productCards = document.querySelectorAll('.product-card a[href*="/products/"], .grid-product__link, .product-item a[href*="/products/"], a.product-card__link, .product-title a, h3 a[href*="/products/"]');

      productCards.forEach((card, index) => {
        if (index < 5) {
          const href = card.getAttribute('href');
          if (href && href.includes('/products/') && !links.includes(href)) {
            const fullUrl = href.startsWith('http') ? href : `https://www.getmymettle.com${href}`;
            if (!links.includes(fullUrl)) {
              links.push(fullUrl);
            }
          }
        }
      });

      if (links.length === 0) {
        const allLinks = document.querySelectorAll('a[href*="/products/"]');
        allLinks.forEach((link, index) => {
          if (links.length < 5) {
            const href = link.getAttribute('href');
            if (href && href.includes('/products/') && !href.includes('quick') && !href.includes('view')) {
              const fullUrl = href.startsWith('http') ? href : `https://www.getmymettle.com${href}`;
              if (!links.includes(fullUrl)) {
                links.push(fullUrl);
              }
            }
          }
        });
      }

      return links.slice(0, 5);
    });

    if (productLinks.length === 0) {
      throw new Error('No product links found on the collection page');
    }

    const products = [];

    for (const link of productLinks) {
      await randomDelay();

      try {
        await page.goto(link, {
          waitUntil: 'domcontentloaded',
          timeout: 60000
        });

        await delay(3000);

        const product = await page.evaluate(() => {
          const titleSelectors = [
            '.product__title',
            '.product-single__title',
            '.product-title',
            'h1.title',
            '.ProductMeta__Title',
            'h1'
          ];

          let title = '';
          for (const selector of titleSelectors) {
            const el = document.querySelector(selector);
            if (el && el.textContent.trim()) {
              title = el.textContent.trim();
              break;
            }
          }

          const descriptionSelectors = [
            '.t4s-image-text-des',
            '.t4s-image-text-content',
            '.t4s-col-text .t4s-rte',
            '.t4s-product-description',
            '.t4s-product__description',
            '.t4s-rte',
            '.t4s-accordion__content',
            '[data-accordion-content]',
            '.product__description',
            '.product-single__description',
            '.product-description',
            '.rte',
            '.ProductMeta__Description',
            '[data-product-description]',
            '.product-details__description',
            '.product_description'
          ];

          let description = '';
          for (const selector of descriptionSelectors) {
            const el = document.querySelector(selector);
            if (el && el.textContent.trim()) {
              description = el.textContent.trim();
              break;
            }
          }

          if (!description) {
            const accordionPanels = document.querySelectorAll('[class*="accordion"] [class*="content"], [class*="accor"] [class*="content"], .t4s-pr-accord__content, [data-t4s-accordion-content]');
            const texts = [];
            accordionPanels.forEach(panel => {
              const text = panel.textContent.trim();
              if (text && text.length > 50) {
                texts.push(text);
              }
            });
            if (texts.length > 0) {
              description = texts.slice(0, 3).join(' ');
            }
          }

          if (!description) {
            const productInfoSelectors = [
              '.product-info-content',
              '.t4s-product-info',
              '[class*="product-info"]',
              '[class*="product-details"]',
              'section[class*="product"] p'
            ];
            for (const selector of productInfoSelectors) {
              const elements = document.querySelectorAll(selector);
              if (elements.length > 0) {
                const texts = Array.from(elements).map(el => el.textContent.trim()).filter(t => t.length > 50);
                if (texts.length > 0) {
                  description = texts.join(' ');
                  break;
                }
              }
            }
          }

          if (!description) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
              description = metaDesc.getAttribute('content') || '';
            }
          }

          if (!description) {
            const mainContent = document.querySelector('main, #MainContent, .main-content, #shopify-section-product-template');
            if (mainContent) {
              const paragraphs = mainContent.querySelectorAll('p');
              const texts = Array.from(paragraphs).map(p => p.textContent.trim()).filter(t => t.length > 100);
              if (texts.length > 0) {
                description = texts.slice(0, 2).join(' ');
              }
            }
          }

          return { title, description };
        });

        if (product.title) {
          products.push({
            name: product.title,
            description: product.description || 'No description available.',
            url: link
          });
          console.log(`  Title: ${product.title}`);
        }
      } catch (productError) {
        console.error(`Error scraping ${link}: ${productError.message}`);
      }
    }

    return products;

  } catch (error) {
    console.error('Error during scraping:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
