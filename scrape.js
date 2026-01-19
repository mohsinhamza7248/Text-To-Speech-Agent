import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://books.toscrape.com';

export async function scrapeProducts() {
  try {
    console.log('Fetching product list...');
    const { data } = await axios.get(BASE_URL);
    const $ = cheerio.load(data);

    const productLinks = [];

    // Get the first 5 product links
    $('.product_pod h3 a').each((index, element) => {
      if (index < 5) {
        const relativeLink = $(element).attr('href');
        // Handle potential relative paths if they change structure, but usually it's direct or "catalogue/..."
        // The base url is https://books.toscrape.com/index.html usually, links are "catalogue/..."
        // Let's resolve it properly.
        const fullLink = relativeLink.startsWith('catalogue')
          ? `${BASE_URL}/${relativeLink}`
          : `${BASE_URL}/catalogue/${relativeLink}`;

        productLinks.push(fullLink);
      }
    });

    console.log(`Found ${productLinks.length} products. Fetching details...`);

    const products = [];

    for (const link of productLinks) {
      console.log(`Scraping ${link}...`);
      const productPage = await axios.get(link);
      const $product = cheerio.load(productPage.data);

      const title = $product('.product_main h1').text().trim();
      // The description is usually in a <p> tag after the product_description div, but structure varies.
      // On books.toscrape.com, it's often: <div id="product_description" ...></div> <p>Description...</p>
      // Let's try to find the p tag that follows the product_description header.
      let description = $product('#product_description').next('p').text().trim();

      if (!description) {
        // Fallback if structure is different
        description = "No description available.";
      }

      products.push({
        name: title,
        description: description,
        url: link
      });
    }

    return products;

  } catch (error) {
    console.error('Error during scraping:', error.message);
    throw error;
  }
}

