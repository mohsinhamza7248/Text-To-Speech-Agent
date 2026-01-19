import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { scrapeProducts } from './scrape.js';
import { summarizeProduct } from './summarize.js';
import { generateAudio } from './tts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log('Start Backend ');

    try {
        // Step 1: Scrape
        console.log('\n[Step 1/4] Scraping products.');
        const products = await scrapeProducts();

        if (products.length === 0) {
            throw new Error('No products found during scraping.');
        }

        // Step 2: Store Data
        console.log('\n[Step 2/4] Saving raw data.');
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }
        fs.writeFileSync(path.join(dataDir, 'products.json'), JSON.stringify(products, null, 2));
        console.log('Data saved to data/products.json');

        // Step 3 & 4: Summarize and Text to Speech
        console.log('\n[Step 3/4 & 4/4] Summarizing and Generating Audio');

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const index = i + 1;

            console.log(`\nProcessing Product ${index}: ${product.name}`);

            // Summarize
            console.log(`Generating summary`);
            const summary = await summarizeProduct(product.description);
            console.log(`Summary: ${summary}`);

            product.summary = summary;

            console.log(`Generating audio`);
            await generateAudio(summary, index);
        }

        // Save updated products with summaries
        fs.writeFileSync(path.join(dataDir, 'products_with_summaries.json'), JSON.stringify(products, null, 2));
        console.log('\nUpdated data saved to data/products_with_summaries.json');

        console.log('\n --Execution Completed Successfully');

    } catch (error) {
        console.error('\n --Execution Failed');
        console.error(error);
        process.exit(1);
    }
}

main();
