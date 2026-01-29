# Backend Assessment: AI Product Scraper & Summarizer

This project is a Node.js automation script designed to scrape product data from a **real-world, production e-commerce website**, generate AI-powered summaries, and convert those summaries into audio speech.

## Features
- **Web Scraping**: Extracts product information from [GetMyMettle](https://www.getmymettle.com), a production fitness supplements e-commerce site.
- **Anti-Scraping Measures Handling**: Uses Puppeteer with anti-detection techniques to handle real-world website challenges.
- **AI Summarization**: Uses **OpenAI (GPT-3.5 Turbo)** to generate concise, engaging summaries of product descriptions.
- **Text-to-Speech (TTS)**: Converts the generated summaries into MP3 audio files using the **ElevenLabs API**.
- **Data Persistence**: Saves raw and processed data to JSON files and audio to a local directory.

## Prerequisites
- Node.js (v14 or higher)
- OpenAI API Key
- ElevenLabs API Key

## Installation

1. **Clone the repository** (or download source):
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your API keys:
   ```env
   OPENAI_API_KEY=sk-...
   ELEVENLABS_API_KEY=...
   ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM  # Optional: Default is 'Rachel'
   ```

## Usage

Run the main script:
```bash
node index.js
```

### Execution Flow
1. **Scraping**: The script launches a headless browser, navigates to GetMyMettle's whey protein collection, and scrapes the first 5 products with their full details.
2. **Summarization**: It sends each product description to OpenAI to get a 2-3 sentence summary focused on key benefits.
3. **Audio Generation**: It sends each summary to ElevenLabs to generate an MP3 file.
4. **Saving**: 
   - Audio files are saved in the `./audio` folder.
   - Data is saved in `./data/products.json` and `./data/products_with_summaries.json`.

## Target Website

The script scrapes: **[https://www.getmymettle.com](https://www.getmymettle.com)**

### Why GetMyMettle?
- **Real Production Website**: This is an active e-commerce site selling fitness supplements, not a sandbox for scraping practice.
- **Shopify-Based**: Built on Shopify, it represents a common real-world e-commerce architecture.
- **JavaScript-Rendered Content**: Many elements load dynamically, requiring browser automation rather than simple HTTP requests.
- **Anti-Scraping Challenges**: As a production site, it may implement measures like bot detection, rate limiting, and dynamic content loading.

### Data Extracted
- **Product Title**: The main product name
- **Product Description**: Detailed information including ingredients, usage instructions, and benefits
- **URL**: Direct link to the product page

## Design Choices

### 1. Puppeteer for Browser Automation
 **Puppeteer** to launch a real headless browser.

**Reasoning**:
- GetMyMettle is a Shopify-based site with JavaScript-rendered content that won't be accessible via simple HTTP requests.
- Puppeteer can wait for dynamic content to load before extracting data.
- It allows us to implement anti-detection measures to avoid being blocked.

### 2. Anti-Detection Measures
The scraper implements several techniques to avoid detection:
- **Custom User Agent**: Mimics a real Chrome browser.
- **Webdriver Property Masking**: Hides the `navigator.webdriver` property that bots typically expose.
- **Random Delays**: Introduces human-like delays (1-3 seconds) between requests to avoid rate limiting.
- **Realistic HTTP Headers**: Sets proper Accept-Language and Accept headers.

### 3. Robust Selector Strategy
The scraper uses multiple CSS selectors for each data point (title, description, price) and falls back through them.

**Reasoning**:
- Shopify themes vary significantly in their HTML structure.
- Production websites frequently update their layouts.
- Fallback selectors increase resilience against minor layout changes.

### 4. Modular Architecture
The codebase is split into dedicated modules to ensure separation of concerns and maintainability:
- `scrape.js`: Handles all web scraping logic using Puppeteer.
- `summarize.js`: Manages interaction with the OpenAI API.
- `tts.js`: Handles the Text-to-Speech conversion via ElevenLabs API.
- `index.js`: Orchestrates the flow between these modules.

### 5. Sequential Processing
The script processes products sequentially (one by one) rather than in parallel.

**Reasoning**:
- Respects the target server's resources (polite scraping).
- Avoids triggering rate limits or bot detection.
- Prevents hitting API rate limits for OpenAI and ElevenLabs.
- Provides clear, step-by-step console output for easier debugging.

### 6. Error Handling
The script includes try-catch blocks at both the module and main execution levels. If a specific step fails (e.g., one product fails to scrape), it logs the error and continues with the remaining products, ensuring partial success is better than total failure.

### 7. Technology Stack
- **Puppeteer**: Selected for its ability to handle JavaScript-rendered content and implement anti-detection measures.
- **OpenAI (GPT-3.5 Turbo)**: Chosen for its balance of high-quality summarization and cost-effectiveness.
- **ElevenLabs**: Used for its superior voice quality compared to standard TTS engines.
- **Axios**: Used for API calls to OpenAI and ElevenLabs.

## Challenges of Scraping Production Websites

Unlike sandbox sites designed for scraping practice, production websites present real challenges:

1. **Dynamic Content**: Content loaded via JavaScript requires browser automation.
2. **Anti-Bot Measures**: Sites may block automated requests or detect bot behavior.
3. **Rate Limiting**: Aggressive scraping may result in IP blocks.
4. **Layout Changes**: Production sites update frequently, breaking hardcoded selectors.
5. **Legal Considerations**: Always respect the website's `robots.txt` and Terms of Service.

This implementation addresses these challenges through Puppeteer with anti-detection measures, random delays, and fallback selectors.

## Output Examples

After running the script, you'll find:
- `./data/products.json`: Raw scraped product data
- `./data/products_with_summaries.json`: Products with AI-generated summaries
- `./audio/product-1.mp3` through `./audio/product-5.mp3`: TTS audio files
