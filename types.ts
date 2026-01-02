export enum GameStatus {
  TITLE = 'TITLE', // New Title Screen
  MENU = 'MENU',
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

export interface SunEntity {
  id: string;
  x: number;
  y: number;
  value: number;
  createdAt: number; // For auto-collection
}

// Background Tile Type
export interface Tile {
  row: number;
  col: number;
  variant: 0 | 1 | 2; // 0: Grass, 1: Weed, 2: Dirt patch
}