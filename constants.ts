
import { PlantConfig, PlantType } from "./types";
import { 
  SVG_PEASHOOTER, 
  SVG_SUNFLOWER, 
  SVG_WALLNUT, 
  SVG_CHERRYBOMB,
  SVG_ZOMBIE_NORMAL,
  SVG_ZOMBIE_CONE,
  SVG_ZOMBIE_BUCKET,
  SVG_ZOMBIE_BOSS
} from "./assets";

export const ROWS = 5;
export const COLS = 9;
// OPTIMIZATION: Lowered FPS to 30 for older iPad Mini performance
export const FPS = 30;
export const TICK_RATE = 1000 / FPS;

// --- GAME BALANCING PARAMETERS ---
export const REVENGE_THRESHOLD = 5; // Mistakes required to trigger Revenge
export const REVENGE_PROBLEM_COUNT = 5; // Number of problems in Revenge Phase 2
export const FREEZE_THRESHOLD = 10; // Correct answers to trigger Auto-Freeze
export const MAX_ZOMBIES_ON_SCREEN = 12; // Optimization Cap

// --- NUMBER COLOR SYSTEM ---
// Consistent colors for 0-9 to help pattern recognition
export const getNumberColorClass = (num: number): string => {
  const n = num % 10;
  switch (n) {
    case 1: return "text-stone-500"; // Gray
    case 2: return "text-red-600";   // Red
    case 3: return "text-orange-500"; // Orange
    case 4: return "text-amber-500";  // Yellow/Gold (Readable)
    case 5: return "text-green-600";  // Green
    case 6: return "text-blue-600";   // Blue
    case 7: return "text-indigo-600"; // Indigo
    case 8: return "text-pink-600";   // Pink
    case 9: return "text-teal-600";   // Teal
    case 0: return "text-slate-400";  // Light Gray
    default: return "text-stone-800";
  }
};

export const PLANT_CONFIGS: Record<PlantType, PlantConfig> = {
  [PlantType.PEASHOOTER]: {
    type: PlantType.PEASHOOTER,
    name: "Pea Shooter",
    description: "콩을 발사하여 좀비를 공격합니다.",
    cost: 50,
    hp: 100,
    damage: 20,
    cooldown: 3500, // NERFED: Slower fire rate (3.5s) to force upgrades/math
    svg: SVG_PEASHOOTER,
    color: "bg-green-500",
    maxAmmo: 30 // Active Math: Must reload after 30 shots
  },
  [PlantType.SUNFLOWER]: {
    type: PlantType.SUNFLOWER,
    name: "Healer Flower",
    description: "주변 3x3 좀비의 방어력을 깎고 식물을 치료합니다.",
    cost: 25,
    hp: 80,
    cooldown: 2000, // Heal rate
    svg: SVG_SUNFLOWER,
    color: "bg-yellow-400"
    // No ammo for sunflower, acts as passive aura
  },
  [PlantType.WALLNUT]: {
    type: PlantType.WALLNUT,
    name: "Wall Nut",
    description: "단단한 껍질로 좀비를 막아냅니다.",
    cost: 50,
    hp: 400,
    cooldown: 0,
    svg: SVG_WALLNUT,
    color: "bg-amber-700"
  },
  [PlantType.CHERRYBOMB]: {
    type: PlantType.CHERRYBOMB,
    name: "Cherry Bomb",
    description: "주변 좀비들을 한방에 폭파시킵니다.",
    cost: 150,
    hp: 1000, 
    damage: 500,
    cooldown: 0, 
    svg: SVG_CHERRYBOMB,
    color: "bg-red-600"
  }
};

// Boss added. HP is high. Takes 2 rows.
export const ZOMBIE_VARIANTS = [
  { type: 'NORMAL', hp: 60, speed: 0.05, damage: 15, attackSpeed: 1000, svg: SVG_ZOMBIE_NORMAL }, 
  { type: 'CONE', hp: 120, speed: 0.06, damage: 15, attackSpeed: 1000, svg: SVG_ZOMBIE_CONE },
  { type: 'BUCKET', hp: 200, speed: 0.04, damage: 25, attackSpeed: 1200, svg: SVG_ZOMBIE_BUCKET },
  // ZOMBOSS: Reduced HP from 2500 to 1000 for better balance
  { type: 'BOSS', hp: 1000, speed: 0.02, damage: 100, attackSpeed: 2000, svg: SVG_ZOMBIE_BOSS },
] as const;

export const INITIAL_SUN = 150;
export const INITIAL_LIVES = 3;
