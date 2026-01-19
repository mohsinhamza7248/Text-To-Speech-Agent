import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function summarizeProduct(description) {
    try {
        if (!description || description === "No description available.") {
            return "No description available to summarize.";
        }

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that summarizes book descriptions."
                },
                {
                    role: "user",
                    content: `Summarize this book description into exactly 1-2 sentences. Do not include any introductory text like 'Here is a summary':\n\n${description}`
                }
            ],
            max_tokens: 100,
            temperature: 0.7,
        });

        const summary = response.choices[0].message.content.trim();
        return summary;

    } catch (error) {
        console.error('Error during summarization:', error.message);
        // Return original description or error message on failure to allow flow to continue
        return "Summary generation failed.";
    }
}
