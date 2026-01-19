import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Default voice (Rachel)

export async function generateAudio(text, index) {
    try {
        if (!text || text === "Summary generation failed.") {
            console.log(`Skipping audio for product ${index} due to invalid text.`);
            return;
        }

        const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

        const response = await axios({
            method: 'post',
            url: url,
            data: {
                text: text,
                model_id: "eleven_monolingual_v1",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5
                }
            },
            headers: {
                'Accept': 'audio/mpeg',
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Type': 'application/json'
            },
            responseType: 'stream'
        });

        const audioDir = path.join(__dirname, 'audio');
        if (!fs.existsSync(audioDir)) {
            fs.mkdirSync(audioDir);
        }

        const outputPath = path.join(audioDir, `product-${index}.mp3`);
        const writer = fs.createWriteStream(outputPath);

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log(`Audio saved: ${outputPath}`);
                resolve(outputPath);
            });
            writer.on('error', reject);
        });

    } catch (error) {
        console.error(`Error generating audio for product ${index}:`, error.message);
        if (error.response && error.response.data) {
            // Since responseType is stream, we need to read the stream to get the error message
            try {
                const stream = error.response.data;
                let errorData = '';
                stream.on('data', chunk => errorData += chunk);
                stream.on('end', () => console.error('Response data:', errorData));
            } catch (e) {
                console.error('Could not read error stream.');
            }
        }
    }
}
