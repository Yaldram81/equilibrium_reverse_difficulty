
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function getAdaptiveHint(difficulty: number, failCount: number) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The player is currently at difficulty level ${difficulty} and has failed ${failCount} times in a row. Provide a short, cryptic but helpful piece of advice (max 15 words) that sounds like an ancient game master helping a struggling player.`,
      config: {
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hint: { type: Type.STRING }
          },
          required: ["hint"]
        }
      }
    });

    const data = JSON.parse(response.text || '{"hint": "Patience is your greatest weapon."}');
    return data.hint as string;
  } catch (error) {
    console.error("Gemini Hint Error:", error);
    return "Focus on the center. The flow is predictable.";
  }
}
