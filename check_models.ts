import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("API_KEY is missing via .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        const candidates = [
            "gemini-2.0-flash-exp",
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-pro"
        ];

        console.log("Testing models...");

        for (const modelName of candidates) {
            // Test Default
            try {
                console.log(`Testing ${modelName} (Default)...`);
                const m = genAI.getGenerativeModel({ model: modelName });
                await m.generateContent("Hello");
                console.log(`✅ ${modelName} is working!`);
            } catch (e: any) {
                console.log(`❌ ${modelName} failed (Default): ${e.message.split('\n')[0]}`);
            }

            // Test v1 (for 1.5 models)
            if (modelName.includes('1.5')) {
                try {
                    console.log(`Testing ${modelName} (v1)...`);
                    const m_v1 = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1' });
                    await m_v1.generateContent("Hello");
                    console.log(`✅ ${modelName} (v1) is working!`);
                } catch (e: any) {
                    console.log(`❌ ${modelName} failed (v1): ${e.message.split('\n')[0]}`);
                }
            }
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
