
import { GoogleGenAI, Type } from "@google/genai";

// Initialize AI lazily
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const LOCAL_HINTS = [
  "Patience is your greatest weapon, seeker.",
  "Focus on the center. The flow is predictable.",
  "Every failure is a lesson carved in silicon.",
  "Do not chase the light; let the light come to you.",
  "The rhythm is within you, not the screen.",
  "Even the master was once a clumsy novice.",
  "Precision outweighs speed in the halls of logic.",
  "The matrix yields to the calm mind.",
  "Observe the patterns before you strike.",
  "Your struggle is the fuel for your eventual triumph.",
  "Stability is found in the eye of the storm.",
  "Wait for the signal; the void will answer."
];

// Simple circuit breaker to avoid hitting quota limits repeatedly
let apiCooldownUntil = 0;

export async function getAdaptiveHint(difficulty: number, failCount: number) {
  // 1. Check if we are in a cooldown period
  if (Date.now() < apiCooldownUntil) {
    console.log("Gemini API in cooldown. Using local wisdom.");
    return LOCAL_HINTS[Math.floor(Math.random() * LOCAL_HINTS.length)];
  }

  // 2. Check for API key presence
  if (!process.env.API_KEY || process.env.API_KEY === '') {
    return LOCAL_HINTS[Math.floor(Math.random() * LOCAL_HINTS.length)];
  }

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The player is currently at difficulty level ${difficulty.toFixed(0)} and has failed ${failCount} times in a row. Provide a short, cryptic but helpful piece of advice (max 12 words) that sounds like an ancient digital game master. Focus on the concept of 'Equilibrium'.`,
      config: {
        temperature: 0.9,
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

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");

    const data = JSON.parse(text);
    return data.hint || LOCAL_HINTS[Math.floor(Math.random() * LOCAL_HINTS.length)];
  } catch (error: any) {
    // 3. Handle 429 specifically with a cooldown
    if (error?.message?.includes('429') || error?.status === 429) {
      console.warn("Gemini Quota Exhausted. Cooling down for 60 seconds.");
      apiCooldownUntil = Date.now() + 60000; // 1 minute cooldown
    } else {
      console.error("Gemini Hint Error:", error);
    }
    
    // Fallback to a random local hint
    return LOCAL_HINTS[Math.floor(Math.random() * LOCAL_HINTS.length)];
  }
}
