
export enum GameStatus {
  TITLE = 'TITLE',
  MENU = 'MENU',
  STUDY = 'STUDY',
  LOADING_LEVEL = 'LOADING_LEVEL',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export enum PlantType {
  PEASHOOTER = 'PEASHOOTER',
  SUNFLOWER = 'SUNFLOWER',
  WALLNUT = 'WALLNUT',
  CHERRYBOMB = 'CHERRYBOMB',
  JALAPENO = 'JALAPENO' // New Booster Plant
}

export interface PlantConfig {
  type: PlantType;
  name: string;
  description: string;
  cost: number;
  hp: number;
  damage?: number;
  cooldown: number;
  svg: (level: number) => string;
  color: string;
  maxAmmo?: number;
}

export interface PlantEntity {
  id: string;
  type: PlantType;
  row: number;
  col: number;
  hp: number;
  maxHp: number;
  level: number;
  lastActionTime: number;
  lastHitTime?: number;
  ammo?: number;
  maxAmmo?: number;
}

export interface ZombieEntity {
  id: string;
  row: number;
  x: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  attackSpeed: number;
  isEating: boolean;
  type: 'NORMAL' | 'BUCKET' | 'CONE' | 'BOSS';
  svg: string;
  lastHitTime?: number;
  lastAttackTime: number;
  isFrozen?: boolean;
  isDying?: boolean;
  deathTime?: number;
  isElite?: boolean;
}

export interface ProjectileEntity {
  id: string;
  row: number;
  x: number;
  damage: number;
  level: number;
  isBoosted?: boolean; // New: visual flag for fire peas
}

export interface MathProblem {
  factorA: number;
  factorB: number;
  answer: number;
}

export interface MathHistoryItem {
  timestamp: number;
  factorA: number;
  factorB: number;
  userAnswer: number;
  isCorrect: boolean;
  timeTaken?: number;
}

export interface SunEntity {
  id: string;
  x: number;
  y: number;
  value: number;
  createdAt: number;
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

export interface Tile {
  row: number;
  col: number;
  variant: 0 | 1 | 2;
}

export interface MathStat {
  factorA: number;
  factorB: number;
  attempts: number;
  correct: number;
  avgTimeMs: number;
  lastAttemptAt: number;
  status: 'NEW' | 'LEARNING' | 'MASTERED' | 'STRUGGLING';
}

export interface DecorationItem {
  id: string;
  name: string;
  type: 'SKIN_PLANT' | 'SKIN_BG' | 'AURA' | 'ACCESSORY';
  cost: number;
  isOwned: boolean;
  isEquipped: boolean;
  assetUrl?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  totalScore: number;
  currency: number;
  inventory: DecorationItem[];
  mathStats: Record<string, MathStat>;
}
