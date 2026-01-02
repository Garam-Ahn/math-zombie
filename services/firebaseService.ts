import { MathHistoryItem, UserProfile, MathStat } from "../types";

// This is a placeholder service. 
// In the future, this will connect to Firebase Firestore and Auth.

class FirebaseService {
  private mockProfile: UserProfile = {
    uid: 'guest',
    displayName: 'Guest Player',
    totalScore: 0,
    currency: 0,
    inventory: [],
    mathStats: {}
  };

  /**
   * Logs a session of math problems to accumulate stats.
   * Logic: Updates 'status' (Mastered/Struggling) based on recent performance.
   */
  async syncProgress(history: MathHistoryItem[]): Promise<void> {
    console.log("🔥 [Firebase] Syncing Math Progress...", history.length, "items");
    
    history.forEach(item => {
      const key = `${item.factorA}x${item.factorB}`;
      if (!this.mockProfile.mathStats[key]) {
        this.mockProfile.mathStats[key] = {
          factorA: item.factorA,
          factorB: item.factorB,
          attempts: 0,
          correct: 0,
          avgTimeMs: 0,
          lastAttemptAt: 0,
          status: 'NEW'
        };
      }
      
      const stat = this.mockProfile.mathStats[key];
      stat.attempts++;
      if (item.isCorrect) stat.correct++;
      stat.lastAttemptAt = item.timestamp;
      
      // Simple logic for status update (Placeholder)
      const accuracy = stat.correct / stat.attempts;
      if (stat.attempts > 5) {
        if (accuracy > 0.9) stat.status = 'MASTERED';
        else if (accuracy < 0.6) stat.status = 'STRUGGLING';
        else stat.status = 'LEARNING';
      }
    });
    
    console.log("🔥 [Firebase] Stats Updated:", this.mockProfile.mathStats);
  }

  /**
   * Adds score to user wallet as currency.
   */
  async addScore(amount: number): Promise<void> {
    this.mockProfile.totalScore += amount;
    this.mockProfile.currency += amount;
    console.log(`🔥 [Firebase] Added ${amount} score. Total: ${this.mockProfile.currency}`);
  }

  /**
   * Get formatted report for parents.
   */
  getReport() {
    const struggling = Object.values(this.mockProfile.mathStats).filter(s => s.status === 'STRUGGLING');
    const mastered = Object.values(this.mockProfile.mathStats).filter(s => s.status === 'MASTERED');
    return {
      struggling,
      mastered,
      totalSolved: Object.values(this.mockProfile.mathStats).reduce((acc, s) => acc + s.correct, 0)
    };
  }
}

export const firebaseService = new FirebaseService();
