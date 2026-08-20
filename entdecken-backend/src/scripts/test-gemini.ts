import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { GoogleGenerativeAI } from "@google/generative-ai";

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No GEMINI_API_KEY found in backend/.env");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  const modelsToTry = [
    "gemini-3.6-flash",
    "gemini-3.6-pro",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash-lite",
    "gemini-2.0-pro",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest"
  ];

  for (const modelName of modelsToTry) {
    console.log(`Testing model: ${modelName}...`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say hello!");
      console.log(`Success with ${modelName}:`, result.response.text());
      return;
    } catch (e: any) {
      console.error(`Failed with ${modelName}:`, e.message);
    }
  }
}

run().catch(console.error);
