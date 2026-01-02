
import { SaveData, MathHistoryItem } from "../types";

// Simple local service to handle "Revive Codes" which are just Base64 encoded JSON stats.

class SaveService {
  
  /**
   * Generates a code string from current game progress.
   */
  generateSaveCode(totalCoins: number, totalScore: number, history: MathHistoryItem[]): string {
    const summary: Record<string, { correct: number, attempts: number }> = {};
    
    history.forEach(h => {
        const key = `${h.factorA}x${h.factorB}`;
        if (!summary[key]) summary[key] = { correct: 0, attempts: 0 };
        summary[key].attempts++;
        if (h.isCorrect) summary[key].correct++;
    });

    const data: SaveData = {
        totalCoins,
        totalScore,
        historySummary: summary
    };

    try {
        const json = JSON.stringify(data);
        return btoa(json); // Simple Base64
    } catch (e) {
        console.error("Failed to generate save code", e);
        return "ERROR";
    }
  }

  /**
   * Parses a code string to restore data.
   */
  parseSaveCode(code: string): SaveData | null {
    try {
        const json = atob(code);
        const data = JSON.parse(json);
        if (typeof data.totalCoins === 'number' && typeof data.historySummary === 'object') {
            return data as SaveData;
        }
        return null;
    } catch (e) {
        return null;
    }
  }
}

export const saveService = new SaveService();
