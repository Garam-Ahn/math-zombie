
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
export const FPS = 60;
export const TICK_RATE = 1000 / FPS;

// --- GAME BALANCING PARAMETERS ---
export const REVENGE_THRESHOLD = 5; // Mistakes required to trigger Revenge
export const REVENGE_PROBLEM_COUNT = 5; // Number of problems in Revenge Phase 2
export const FREEZE_THRESHOLD = 10; // Correct answers to trigger Auto-Freeze

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
    color: "bg-green-500"
  },
  [PlantType.SUNFLOWER]: {
    type: PlantType.SUNFLOWER,
    name: "Healer Flower",
    description: "주변(상하좌우) 식물의 체력을 회복시킵니다.",
    cost: 25,
    hp: 80,
    cooldown: 2000, // Heal rate
    svg: SVG_SUNFLOWER,
    color: "bg-yellow-400"
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
  { type: 'BOSS', hp: 800, speed: 0.03, damage: 40, attackSpeed: 1500, svg: SVG_ZOMBIE_BOSS },
] as const;

export const INITIAL_SUN = 150;
export const INITIAL_LIVES = 3;
