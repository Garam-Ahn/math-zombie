
import { PlantConfig, PlantType } from "./types";
import { 
  SVG_PEASHOOTER, 
  SVG_SUNFLOWER, 
  SVG_WALLNUT, 
  SVG_CHERRYBOMB,
  SVG_JALAPENO,
  SVG_ZOMBIE_NORMAL,
  SVG_ZOMBIE_CONE,
  SVG_ZOMBIE_BUCKET,
  SVG_ZOMBIE_BOSS
} from "./assets";

export const ROWS = 5;
export const COLS = 9;
export const FPS = 30;
export const TICK_RATE = 1000 / FPS;

export const REVENGE_THRESHOLD = 5;
export const REVENGE_PROBLEM_COUNT = 5;
export const FREEZE_THRESHOLD = 10;
export const MAX_ZOMBIES_ON_SCREEN = 12;
export const PEASHOOTER_LIMIT = 5;

export const getNumberColorClass = (num: number): string => {
  const n = num % 10;
  switch (n) {
    case 1: return "text-stone-500";
    case 2: return "text-red-600";
    case 3: return "text-orange-500";
    case 4: return "text-amber-500";
    case 5: return "text-green-600";
    case 6: return "text-blue-600";
    case 7: return "text-indigo-600";
    case 8: return "text-pink-600";
    case 9: return "text-teal-600";
    case 0: return "text-slate-400";
    default: return "text-stone-800";
  }
};

export const PLANT_CONFIGS: Record<PlantType, PlantConfig> = {
  [PlantType.PEASHOOTER]: {
    type: PlantType.PEASHOOTER,
    name: "Pea Shooter",
    description: "강력한 콩을 발사합니다. (스플래시 데미지)",
    cost: 50,
    hp: 100,
    damage: 60,
    cooldown: 4500,
    svg: SVG_PEASHOOTER,
    color: "bg-green-500",
    maxAmmo: 15
  },
  [PlantType.JALAPENO]: {
    type: PlantType.JALAPENO,
    name: "Jalapeno",
    description: "인접한 피슈터를 강화해 화염 콩을 쏘게 합니다.",
    cost: 100,
    hp: 150,
    cooldown: 0,
    svg: SVG_JALAPENO,
    color: "bg-red-500",
    maxAmmo: 15
  },
  [PlantType.SUNFLOWER]: {
    type: PlantType.SUNFLOWER,
    name: "Healer Flower",
    description: "주변 3x3 좀비의 방어력을 깎고 식물을 치료합니다.",
    cost: 25,
    hp: 80,
    cooldown: 2000,
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

export const ZOMBIE_VARIANTS = [
  { type: 'NORMAL', hp: 60, speed: 0.05, damage: 15, attackSpeed: 1000, svg: SVG_ZOMBIE_NORMAL }, 
  { type: 'CONE', hp: 120, speed: 0.06, damage: 15, attackSpeed: 1000, svg: SVG_ZOMBIE_CONE },
  { type: 'BUCKET', hp: 200, speed: 0.04, damage: 25, attackSpeed: 1200, svg: SVG_ZOMBIE_BUCKET },
  { type: 'BOSS', hp: 1000, speed: 0.02, damage: 100, attackSpeed: 2000, svg: SVG_ZOMBIE_BOSS },
] as const;

export const INITIAL_SUN = 150;
export const INITIAL_LIVES = 3;
