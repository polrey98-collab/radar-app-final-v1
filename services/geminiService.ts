
import { GoogleGenAI, Type } from "@google/genai";
import { StockData, HealthSectorData, DividendData, PortfolioItem } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// Using gemini-2.5-flash for search tasks as it's efficient
const SEARCH_MODEL = "gemini-2.5-flash";

// Helper to reliably extract JSON from model response
const cleanJson = (text: string) => {
  try {
    if (!text) return "[]";
    
    // 1. Locate the outer brackets of a JSON array
    const startIndex = text.indexOf('[');
    const endIndex = text.lastIndexOf(']');

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      return text.substring(startIndex, endIndex + 1);
    }

    // 2. Fallback: Try regex if direct index fails (e.g. inside markdown block)
    const jsonBlock = text.match(/```json\s*(\[[\s\S]*?\])\s*```/);
    if (jsonBlock && jsonBlock[1]) {
      return jsonBlock[1];
    }
    
    return "[]";
  } catch (e) {
    console.error("JSON Clean Error:", e);
    return "[]";
  }
};

export const analyzeStocks = async (currentStocks: StockData[]): Promise<StockData[]> => {
  try {
    const stockNames = currentStocks.map(s => s.name).join(", ");
    const prompt = `
      You are an expert financial analyst. I have the following stocks in my portfolio radar: ${stockNames}.
      
      Perform the following steps for EACH stock:
      1. Use Google Search to find the REAL-TIME current market price (e.g. for Repsol, Inditex, etc.). Do NOT use historical data, find the latest price.
      2. Based on the NEW live market price and recent market news/trends, calculate optimized "Exit Price" (Sell Target) and "Accumulative Price" (Buy Target) to maximize portfolio profits.
         - The Exit Price should be a realistic profit-taking level above the current price.
         - The Accumulative Price should be a strong support level or good entry point below (or near) the current price.
      3. Provide a brief recommendation (Buy, Sell, Hold, Accumulate).

      CRITICAL OUTPUT RULE:
      - You MUST return ONLY a valid JSON array.
      - Do NOT use Markdown formatting (no \`\`\`json).
      - Do NOT add conversational text.
      
      JSON Schema:
      [
        {
          "name": string (exact match from input list),
          "marketPrice": number (the live price you found),
          "currency": string (e.g. EUR, USD, CHF),
          "exitPrice": number (optimized sell target),
          "accumulativePrice": number (optimized buy target),
          "recommendation": string
        }
      ]
    `;

    const response = await ai.models.generateContent({
      model: SEARCH_MODEL,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const jsonStr = cleanJson(response.text || "[]");
    const data = JSON.parse(jsonStr);
    
    // Merge new data with old data
    return currentStocks.map(stock => {
      const updated = data.find((d: any) => d.name.toLowerCase().includes(stock.name.toLowerCase()) || stock.name.toLowerCase().includes(d.name.toLowerCase()));
      if (updated) {
        return { ...stock, ...updated, updated: true };
      }
      return stock;
    });

  } catch (error) {
    console.error("Error analyzing stocks:", error);
    throw error;
  }
};

export const fetchDividends = async (companies: string[]): Promise<DividendData[]> => {
  const allDividends: DividendData[] = [];
  
  try {
    const prompt = `
      Task: Identify the usual dividend payment months for these companies: ${companies.join(", ")}.

      INSTRUCTIONS:
      1. Search broadly using Google Search for dividend calendars.
      2. CONSENSUS & FALLBACK: If you find specific confirmed dates for 2024/2025, use them. If NOT, use your INTERNAL KNOWLEDGE of the company's historical payment pattern (e.g. "Usually pays in January"). 
      3. TRANSLATE: Convert all months to English (e.g. "Enero" -> "January").
      4. COMPLETENESS: You MUST return a result for EVERY company in the list. Do not return an empty list.
      
      CRITICAL OUTPUT RULE:
      - Return ONLY a raw JSON array. 
      - Do NOT use Markdown formatting.
      
      JSON Schema:
      [{
        "name": "Company Name",
        "paymentMonths": ["January", "July"]
      }]
    `;

    const response = await ai.models.generateContent({
      model: SEARCH_MODEL,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const jsonStr = cleanJson(response.text || "[]");
    const data = JSON.parse(jsonStr);
    
    // Validate data structure roughly
    if (Array.isArray(data)) {
        const validData = data.filter((d: any) => d.name && Array.isArray(d.paymentMonths));
        allDividends.push(...validData);
    }

  } catch (error) {
    console.error("Error fetching dividends:", error);
    return [];
  }

  return allDividends;
};

export const analyzeHealthSector = async (sectorData: HealthSectorData[]): Promise<HealthSectorData[]> => {
  try {
    const prompt = `
      Analyze the following Health Sector companies: ${sectorData.map(c => c.company).join(", ")}.
      
      STRATEGY CONTEXT:
      These stocks are being tracked as 'Defensive Assets' for a potential Tech Sector Bubble Burst.
      We need to know if the CURRENT price represents a good entry point to hedge against tech volatility.
      
      INSTRUCTIONS:
      1. Find their REAL-TIME current stock price.
      2. Set a "Target Price" based on growth probability.
      3. DETERMINE BUY SIGNAL:
         - "BUY NOW": If price is attractive/undervalued and good specifically for defensive rotation.
         - "ACCUMULATE": If price is fair.
         - "WAIT": If price is too high/overbought, even for a defensive stock.
      4. Defensive Note: Briefly explain WHY (e.g. "Low volatility, high dividend" or "Currently overvalued").

      CRITICAL OUTPUT RULE:
      - Return ONLY a raw JSON array. 
      - Do NOT use Markdown formatting.
      
      JSON Schema:
      [
        {
          "company": "Company Name",
          "currentPrice": 100.50,
          "currency": "EUR",
          "targetPrice": 120.00,
          "buySignal": "BUY NOW", 
          "defensiveNote": "Strong balance sheet, good hedge."
        }
      ]
    `;

    const response = await ai.models.generateContent({
      model: SEARCH_MODEL,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const jsonStr = cleanJson(response.text || "[]");
    const updates = JSON.parse(jsonStr);
    
    return sectorData.map(item => {
      const update = updates.find((u: any) => u.company.toLowerCase().includes(item.company.toLowerCase()) || item.company.toLowerCase().includes(u.company.toLowerCase()));
      return update ? { ...item, ...update } : item;
    });
  } catch (error) {
    console.error("Health sector analysis error:", error);
    throw error;
  }
};

export const analyzePortfolio = async (items: PortfolioItem[], onProgress?: (percent: number) => void): Promise<PortfolioItem[]> => {
  try {
    // Reduced batch size to 1 to prevent quota limits (Rate Limit) - EXTREME CONSERVATISM
    const BATCH_SIZE = 1;
    const allUpdates: any[] = [];
    
    const chunks = [];
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      chunks.push(items.slice(i, i + BATCH_SIZE));
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const isinCode = chunk[0].isin || "";
      const companyName = chunk[0].company || "";
      
      // Simplified prompt to reduce token count and strictly focus on one task
      const prompt = `
Analiza la siguiente cartera: ${JSON.stringify(portfolioData)}.

TU ROL: Analista Cuantitativo de Hedge Fund.

INSTRUCCIONES DE MONEDA (CRÍTICO):
⚠️ TODOS los precios deben ser en EUROS (€). Si cotiza en USD/GBP, convierte el precio.

REGLAS PARA LA ACCIÓN (Lógica Stock Radar):
1. Estima un "Precio de Entrada Ideal" (Soporte fuerte/Valor intrínseco) y un "Precio Objetivo de Venta" (Resistencia/Sobrevaloración).
2. Si Precio Actual <= Precio Entrada -> Action: "ACUMULAR"
3. Si Precio Actual >= Precio Objetivo -> Action: "VENDER"
4. Si está en medio -> Action: "MANTENER"

FORMATO DE RESPUESTA JSON (Estricto):
Devuelve un array de objetos con:
{
  "isin": "ISIN original",
  "action": "ACUMULAR | VENDER | MANTENER",
  "currentPrice": (Número en EUR),
  "forecast3to5Years": "FORMATO CORTO: 'Tendencia: [Alcista/Bajista/Lateral] | CAGR est.: [XX]% anual'. (Máx 10 palabras)",
  "optimizationTip": "FORMATO TÁCTICO: 'Entrada ideal: [XX]€ | Salida: [XX]€ | [Motivo corto]'. (Máx 15 palabras)"
}
`;

      try {
        // Increased delay to 6 seconds to strictly adhere to free tier rate limits (~10 requests/min safe zone)
        if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 6000));
        }

        const response = await ai.models.generateContent({
          model: SEARCH_MODEL,
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }]
          }
        });

        // Debug logging
        console.log(`Batch ${i} raw response:`, response.text);

        const jsonStr = cleanJson(response.text || "[]");
        const chunkUpdates = JSON.parse(jsonStr);
        if (Array.isArray(chunkUpdates)) {
          allUpdates.push(...chunkUpdates);
        }
      } catch (err: any) {
        console.error("Error processing batch", i, err);
        // Throw user-friendly error if quota exceeded
        if (err.message && (err.message.includes('quota') || err.message.includes('429'))) {
           throw new Error("Se ha excedido el límite de uso de la API (Quota Exceeded). Por favor espera un minuto.");
        }
      }

      if (onProgress) {
        onProgress(Math.round(((i + 1) / chunks.length) * 100));
      }
    }

    console.log("All Updates Merged:", allUpdates);

    return items.map(item => {
       // Normalize ISINs for comparison, robust against case/whitespace
       const itemIsin = (item.isin || '').trim().toUpperCase();
       
       const update = allUpdates.find((u: any) => (u.isin || '').trim().toUpperCase() === itemIsin);
       
       if (update) {
         return {
           ...item,
           company: update.company || item.company,
           currentPrice: update.currentPrice,
           currentValue: (update.currentPrice || 0) * item.quantity, 
           action: update.action || "MANTENER",
           forecast3to5Years: update.forecast3to5Years || "-",
           optimizationTip: update.optimizationTip || "-"
         };
       }
       return item;
    });

  } catch (error: any) {
    console.error("Portfolio analysis error:", error);
    // Propagate the specific error message
    throw error;
  }
};

export const editVisionImage = async (base64Data: string, prompt: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          { text: prompt }
        ]
      }
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
        const parts = candidates[0].content?.parts;
        if (parts) {
            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                    return part.inlineData.data;
                }
            }
        }
    }
    
    throw new Error("No image generated");
  } catch (error) {
    console.error("Vision Board generation error:", error);
    throw error;
  }
};
