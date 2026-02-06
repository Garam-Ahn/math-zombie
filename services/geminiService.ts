
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;

let ai: GoogleGenAI | null = null;

if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (error) {
    console.error("Gemini initialization failed:", error);
  }
}

export const generateZombieNote = async (table: number): Promise<string> => {
  if (!ai) {
    return "Math... hard... brain... sleepy...";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        You are acting as the leader of the Zombies from Plants vs Zombies. 
        Write a short, funny, poorly written note to a child learning the ${table} times multiplication table.
        IMPORTANT: Misspell words, use simple grammar, be playful. Do NOT use violent language. Do NOT say "eat brains". 
        Say something like "we will take your garden" or "we want your sunflowers".
        Max 2 sentences.
        Language: English.
      `,
    });
    return response.text || "Math too hard... we coming for garden!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Zombies are coming! Watch out!";
  }
};

export const generateMathEncouragement = async (isCorrect: boolean, table: number): Promise<string> => {
  if (!ai) {
    return isCorrect ? "AMAZING!" : "TRY AGAIN!";
  }

  try {
    const prompt = isCorrect 
      ? `Give a super short, high-energy praise for a child mastering the ${table} times table. (e.g., "UNSTOPPABLE!", "MATH GENIUS!")`
      : `Give a super short, gentle encouragement to try again for the ${table} times table. (e.g., "YOU GOT THIS!", "KEEP GOING!")`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || (isCorrect ? "BRAVO!" : "DON'T GIVE UP!");
  } catch (error) {
    return isCorrect ? "GREAT JOB!" : "KEEP TRYING!";
  }
};
