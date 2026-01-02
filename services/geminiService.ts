import { GoogleGenAI } from "@google/genai";

// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateZombieNote = async (table: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        You are acting as the leader of the Zombies from Plants vs Zombies. 
        Write a short, funny, poorly written note (misspelled words, simple grammar) to a child who is learning the ${table} times multiplication table (구구단 ${table}단).
        The note should be playful and challenging. 
        IMPORTANT: Do NOT use violent language. Do NOT say "eat brains". Instead, say something like "we will take your garden" or "we want to play".
        Max 2-3 sentences.
        Output in Korean language since the child is Korean.
        Example style: "Hello... we hear u like math... ${table}x${table} is... hard? We coming to garden."
      `,
    });
    return response.text || "수학... 어렵다... 우리가 정원을... 가져간다...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "구구단... 공부했나... 우리가 간다... (좀비들이 오고 있습니다!)";
  }
};

export const generateMathEncouragement = async (isCorrect: boolean, table: number): Promise<string> => {
  try {
    const prompt = isCorrect 
      ? `Give a super short, high-energy praise in Korean for a child mastering the ${table} times table. Do not use English words. Output strictly in Korean. (e.g., "정말 대단해요!", "천재인가봐요!")`
      : `Give a super short, gentle encouragement in Korean to try again for the ${table} times table. Do not use English words. Output strictly in Korean. (e.g., "할 수 있어요!", "다시 도전!")`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || (isCorrect ? "최고예요!" : "다시 해봐요!");
  } catch (error) {
    return isCorrect ? "참 잘했어요!" : "화이팅!";
  }
};