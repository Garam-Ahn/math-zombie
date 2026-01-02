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

export const PLANT_CONFIGS: Record<PlantType, PlantConfig> = {
  [PlantType.PEASHOOTER]: {
    type: PlantType.PEASHOOTER,
    name: "Pea Shooter",
    description: "콩을 발사하여 좀비를 공격합니다.",
    cost: 50,
    hp: 100,
    damage: 20,
    cooldown: 3000, // NERFED: Slower fire rate to force math play
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

// Boss added. HP is high.
export const ZOMBIE_VARIANTS = [
  { type: 'NORMAL', hp: 60, speed: 0.05, damage: 15, attackSpeed: 1000, svg: SVG_ZOMBIE_NORMAL }, 
  { type: 'CONE', hp: 120, speed: 0.06, damage: 15, attackSpeed: 1000, svg: SVG_ZOMBIE_CONE },
  { type: 'BUCKET', hp: 200, speed: 0.04, damage: 25, attackSpeed: 1200, svg: SVG_ZOMBIE_BUCKET },
  { type: 'BOSS', hp: 800, speed: 0.03, damage: 40, attackSpeed: 1500, svg: SVG_ZOMBIE_BOSS },
] as const;

export const INITIAL_SUN = 150;
export const INITIAL_LIVES = 3;