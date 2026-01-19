# Backend Assessment: AI Product Scraper & Summarizer

This project is a Node.js automation script designed to scrape product data from a website, generate AI-powered summaries, and convert those summaries into audio speech.

## Features
- **Web Scraping**: EXTRACTS product titles and detailed descriptions from [Books to Scrape](https://books.toscrape.com).
- **AI Summarization**: Uses **OpenAI (GPT-3.5 Turbo)** to generate concise, engaging summaries of the book descriptions.
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
1. **Scraping**: The script visits `books.toscrape.com`, collects links for the first 5 books, and visits each page to scrape the full description.
2. **Summarization**: It sends the description to OpenAI to get a 1-2 sentence summary.
3. **Audio Generation**: It sends the summary to ElevenLabs to generate an MP3 file.
4. **Saving**: 
   - Audio files are saved in the `./audio` folder.
   - Data is saved in `./data/products.json` and `./data/products_with_summaries.json`.

## Target Website
The script scrapes: **[https://books.toscrape.com](https://books.toscrape.com)**
- This is a safe parsing sandbox for scraping purposes.
- Specifically, it targets the title (`.product_main h1`) and the product description (paragraph following `#product_description`).

## Design Choices

### 1. Modular Architecture
The codebase is split into dedicated modules to ensure separation of concerns and maintainability:
- `scrape.js`: Handles all web scraping logic using `axios` and `cheerio`.
- `summarize.js`: Manages interaction with the OpenAI API.
- `tts.js`: Handles the Text-to-Speech conversion via ElevenLabs API.
- `index.js`: Orchestrates the flow between these modules.

### 2. Sequential Processing
The script processes products sequentially (one by one) rather than in parallel. 
**Reasoning**: This is a deliberate choice to:
- Respect the target server's resources (polite scraping).
- Avoid hitting API rate limits for OpenAI and ElevenLabs.
- Provide clear, step-by-step console output for easier debugging.

### 3. Error Handling
The script includes try-catch blocks at both the module and main execution levels. If a specific step fails (e.g., audio generation for one product), it logs the error and attempts to continue or fail gracefully depending on the severity, ensuring the entire process doesn't crash unexpectedly on minor issues.

### 4. Technology Stack
- **Cheerio**: Selected for its speed and efficient jQuery-like syntax for parsing static HTML.
- **OpenAI (GPT-3.5 Turbo)**: Chosen for its balance of high-quality summarization and cost-effectiveness.
- **ElevenLabs**: Used for its superior voice quality compared to standard TTS engines.
- **Axios**: Used for consistent HTTP requests across scraping and API calls.
