
export enum GameStatus {
  TITLE = 'TITLE', // New Title Screen
  MENU = 'MENU',
  STUDY = 'STUDY', // New Study Mode (Zen Garden)
  LOADING_LEVEL = 'LOADING_LEVEL',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export enum PlantType {
  PEASHOOTER = 'PEASHOOTER', // Basic shooter
  SUNFLOWER = 'SUNFLOWER',   // Generates sun (points/currency)
  WALLNUT = 'WALLNUT',       // High health blocker
  CHERRYBOMB = 'CHERRYBOMB'  // Explodes area
}

export interface PlantConfig {
  type: PlantType;
  name: string;
  description: string; // Added description
  cost: number; // In Sun
  hp: number;
  damage?: number;
  cooldown: number; // milliseconds
  svg: (level: number) => string; // CHANGED: SVG is now a function of level
  color: string;
  maxAmmo?: number; // New: Ammo limit
}

export interface PlantEntity {
  id: string;
  type: PlantType;
  row: number;
  col: number;
  hp: number;
  maxHp: number;
  level: number; // Added level (default 1)
  lastActionTime: number;
  lastHitTime?: number; // For hit animation
  ammo?: number; // New: Current ammo
  maxAmmo?: number; // New: Max ammo capacity
}

export interface ZombieEntity {
  id: string;
  row: number;
  x: number; // Percentage 0-100 across screen
  hp: number;
  maxHp: number;
  speed: number;
  damage: number; // Damage per HIT (not per tick)
  attackSpeed: number; // ms between attacks
  isEating: boolean;
  type: 'NORMAL' | 'BUCKET' | 'CONE' | 'BOSS';
  svg: string;
  lastHitTime?: number; // For hit animation
  lastAttackTime: number; // For attack interval
  isFrozen?: boolean; // New status effect
  isDying?: boolean; // New: For death animation
  deathTime?: number; // New: When did it start dying
  isElite?: boolean; // New: Visual marker for scaled up zombies
}

export interface ProjectileEntity {
  id: string;
  row: number;
  x: number;
  damage: number;
  level: number; // Visual size based on level
}

export interface MathProblem {
  factorA: number;
  factorB: number;
  answer: number;
}

// New Interface for Data Tracking
export interface MathHistoryItem {
  timestamp: number;
  factorA: number;
  factorB: number;
  userAnswer: number; // What the user typed
  isCorrect: boolean;
  timeTaken?: number; // Optional: could track speed later
}

export interface SunEntity {
  id: string;
  x: number;
  y: number;
  value: number;
  createdAt: number; // For auto-collection
}

export interface VisualCoin {
  id: string;
  x: number;
  y: number;
  value: number;
  createdAt: number;
}

export interface SaveData {
  totalCoins: number;
  totalScore: number;
  historySummary: Record<string, { correct: number, attempts: number }>;
}

// Background Tile Type
export interface Tile {
  row: number;
  col: number;
  variant: 0 | 1 | 2; // 0: Grass, 1: Weed, 2: Dirt patch
}

// --- FUTURE FIREBASE INTEGRATION TYPES ---

export interface MathStat {
  factorA: number;
  factorB: number;
  attempts: number;
  correct: number;
  avgTimeMs: number;
  lastAttemptAt: number;
  status: 'NEW' | 'LEARNING' | 'MASTERED' | 'STRUGGLING'; // For parents to see
}

export interface DecorationItem {
  id: string;
  name: string;
  type: 'SKIN_PLANT' | 'SKIN_BG' | 'AURA' | 'ACCESSORY';
  cost: number; // Currency cost
  isOwned: boolean;
  isEquipped: boolean;
  assetUrl?: string; // Or SVG string
}

export interface UserProfile {
  uid: string;
  displayName: string;
  totalScore: number; // Cumulative score -> Currency
  currency: number; // Spendable points
  inventory: DecorationItem[];
  mathStats: Record<string, MathStat>; // Key e.g., "2x9"
}
