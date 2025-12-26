
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, EstimationItem, GroundingSource } from "../types";

const API_KEY = process.env.API_KEY || "";

const callWithRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.message?.includes('429') || error.status === 429)) {
      console.warn(`API Rate limit hit. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(res => setTimeout(res, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

const processItemsWithSearch = async (rawItems: any[]): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Mode 1: Try with Google Search (Grounding)
  try {
    const searchPrompt = `根據以下水電材料清單，使用 Google 搜尋目前台灣市場的最低價格、推薦廠牌、規格及供應商資訊。
    清單：${JSON.stringify(rawItems)}
    
    請回傳一個 JSON 陣列，每個物件包含：id, name, spec, quantity, unit, marketPrice (數字), brand (建議廠牌), remarks (相關備註或注意事項), supplier, sourceUrl (網址)。`;

    const searchResponse = await callWithRetry(() => ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: searchPrompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              spec: { type: Type.STRING },
              quantity: { type: Type.NUMBER },
              unit: { type: Type.STRING },
              marketPrice: { type: Type.NUMBER },
              brand: { type: Type.STRING },
              remarks: { type: Type.STRING },
              supplier: { type: Type.STRING },
              sourceUrl: { type: Type.STRING }
            },
            required: ["id", "name", "spec", "quantity", "unit", "marketPrice", "brand", "remarks", "supplier", "sourceUrl"]
          }
        }
      }
    }), 1, 1000); // Fewer retries for search to fail fast

    const items: EstimationItem[] = JSON.parse(searchResponse.text || "[]");

    const groundingChunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web!.title || "參考連結",
        uri: chunk.web!.uri || "#"
      }));

    return { items, sources };

  } catch (error) {
    console.warn("Search grounding failed or rate limited, falling back to pure AI estimation...", error);

    // Mode 2: Fallback to Pure AI (Internal Knowledge)
    // This uses standard tokens which are much harder to hit limits on
    const basicPrompt = `你是一位專業的台灣水電估價師。請根據以下清單，憑藉你的專業知識與市場經驗，估算目前台灣市場的合理價格（含稅）。
    
    清單：${JSON.stringify(rawItems)}
    
    請直接回傳 JSON 陣列 (不要 Markdown)，格式與前面定義相同。來源請標註為「AI 估算資料庫」。`;

    const basicResponse = await callWithRetry(() => ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: basicPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              spec: { type: Type.STRING },
              quantity: { type: Type.NUMBER },
              unit: { type: Type.STRING },
              marketPrice: { type: Type.NUMBER },
              brand: { type: Type.STRING },
              remarks: { type: Type.STRING },
              supplier: { type: Type.STRING },
              sourceUrl: { type: Type.STRING }
            },
            required: ["id", "name", "spec", "quantity", "unit", "marketPrice", "brand", "remarks", "supplier", "sourceUrl"]
          }
        }
      }
    }));

    const items: EstimationItem[] = JSON.parse(basicResponse.text || "[]");
    return { items, sources: [{ title: "AI 內部估價資料庫 (離線模式)", uri: "#" }] };
  }
};

export const analyzeImageAndSearch = async (base64Image: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const ocrResponse = await callWithRetry(() => ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: [
      {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: "辨識水電材料估價清單。列出名稱、規格、數量及單位。" }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            spec: { type: Type.STRING },
            quantity: { type: Type.NUMBER },
            unit: { type: Type.STRING }
          },
          required: ["name", "spec", "quantity", "unit"]
        }
      }
    }
  }));

  const rawItems = JSON.parse(ocrResponse.text || "[]");
  return processItemsWithSearch(rawItems);
};

export const analyzeTextAndSearch = async (textInput: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const parseResponse = await callWithRetry(() => ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: `提取水電材料清單：\n"${textInput}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            spec: { type: Type.STRING },
            quantity: { type: Type.NUMBER },
            unit: { type: Type.STRING }
          },
          required: ["name", "spec", "quantity", "unit"]
        }
      }
    }
  }));

  const rawItems = JSON.parse(parseResponse.text || "[]");
  return processItemsWithSearch(rawItems);
};
