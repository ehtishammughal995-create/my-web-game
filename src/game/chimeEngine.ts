import { soundEngine } from '../audio/soundEngine';
import { ARENA_HEIGHT, ARENA_WIDTH } from './stages';
import {
  ChimePreset,
  ChimeScaleId,
  ChimeVoiceId,
  FloatingText,
  Particle,
  RingWave,
} from './types';

export const CHIME_PRESET_NAMES: Record<ChimePreset, string> = {
  CASCADE_HARP: 'Cascade Harp',
  PENDULUM_WAVE: 'Pendulum Wave',
  LOTUS_WHEEL: 'Lotus Wheel',
  SPIRAL_LOOM: 'Spiral Loom',
  TWIN_FOUNTAIN: 'Twin Fountain',
  RAIN_CANOPY: 'Rain Canopy',
  GALAXY_ORBIT: 'Galaxy Orbit',
  WATERFALL_STEPS: 'Waterfall Steps',
  BAMBOO_WIND: 'Bamboo Wind',
  AURORA_ARCH: 'Aurora Arch',
  GRAND_SYMPHONY: 'Grand Symphony',
};

const SCALE_TABLES: Record<ChimeScaleId, number[]> = {
  PENTATONIC: [
    261.63, 293.66, 329.63, 392.0, 440.0,
    523.25, 587.33, 659.25, 783.99, 880.0,
    1046.5, 1174.66, 1318.51, 1567.98, 1760.0,
  ],
  LYDIAN: [
    261.63, 293.66, 329.63, 369.99, 392.0,
    440.0, 493.88, 523.25, 587.33, 659.25,
    739.99, 783.99, 880.0, 987.77, 1046.5,
  ],
  HIRAJOSHI: [
    261.63, 293.66, 311.13, 392.0, 415.3,
    523.25, 587.33, 622.25, 783.99, 830.61,
    1046.5, 1174.66, 1244.51, 1567.98, 1661.22,
  ],
  MIDNIGHT: [
    220.0, 261.63, 293.66, 329.63, 392.0,
    440.0, 493.88, 523.25, 587.33, 659.25,
    783.99, 880.0, 987.77, 1046.5, 1318.51,
  ],
};

const SCALE_NOTE_NAMES: Record<ChimeScaleId, string[]> = {
  PENTATONIC: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6', 'E6', 'G6', 'A6'],
  LYDIAN: ['C4', 'D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G5', 'A5', 'B5', 'C6'],
  HIRAJOSHI: ['C4', 'D4', 'Eb4', 'G4', 'Ab4', 'C5', 'D5', 'Eb5', 'G5', 'Ab5', 'C6', 'D6', 'Eb6', 'G6', 'Ab6'],
  MIDNIGHT: ['A3', 'C4', 'D4', 'E4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'G5', 'A5', 'B5', 'C6', 'E6'],
};

export interface ChimeBar {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cx: number;
  cy: number;
  length: number;
  noteIndex: number;
  hue: number;
  hitFlash: number;
  vibrateAmp: number;
  vibratePhase: number;
  restitution: number;
  isUserDrawn: boolean;
  rotOriginX?: number;
  rotOriginY?: number;
  rotSpeed?: number;
  baseOffset?: { x1: number; y1: number; x2: number; y2: number };
  strumCooldown: number;
}

export interface ChimePendulum {
  id: number;
  anchorX: number;
  anchorY: number;
  length: number;
  angle: number;
  prevAngle: number;
  maxAngle: number;
  omega: number;
  phase: number;
  bobRadius: number;
  noteIndex: number;
  hue: number;
  hitFlash: number;
  strumCooldown: number;
}

export interface ChimeBell {
  id: number;
  x: number;
  y: number;
  radius: number;
  noteIndex: number;
  hue: number;
  hitFlash: number;
}

export interface ChimeEmitter {
  x: number;
  y: number;
  vx: number;
  vy: number;
  interval: number;
  timer: number;
  spreadX: number;
  hueBase: number;
}

export interface ChimeMarble {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
  trail: Array<{ x: number; y: number }>;
  age: number;
  bounces: number;
}

export interface ChimeWorld {
  preset: ChimePreset;
  bars: ChimeBar[];
  pendulums: ChimePendulum[];
  bells: ChimeBell[];
  emitters: ChimeEmitter[];
  marbles: ChimeMarble[];
  particles: Particle[];
  rings: RingWave[];
  floatingTexts: FloatingText[];
  drawDraft: { x1: number; y1: number; x2: number; y2: number } | null;
  score: number;
  combo: number;
  maxCombo: number;
  notesPlayed: number;
  time: number;
  nextId: number;
  gravity: number;
}

function makeBar(
  id: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  noteIndex: number,
  hue: number,
  isUserDrawn = false,
  restitution = 0.88
): ChimeBar {
  return {
    id,
    x1,
    y1,
    x2,
    y2,
    cx: (x1 + x2) * 0.5,
    cy: (y1 + y2) * 0.5,
    length: Math.hypot(x2 - x1, y2 - y1),
    noteIndex,
    hue,
    hitFlash: 0,
    vibrateAmp: 0,
    vibratePhase: 0,
    restitution,
    isUserDrawn,
    strumCooldown: 0,
  };
}

export function noteIndexFromLength(length: number): number {
  // Short bar -> higher pitch (14), long bar -> deep bass (0)
  const clamped = Math.max(36, Math.min(240, length));
  const norm = 1 - (clamped - 36) / (240 - 36);
  return Math.max(0, Math.min(14, Math.round(norm * 14)));
}

export function getNoteLabel(scale: ChimeScaleId, noteIndex: number): string {
  const names = SCALE_NOTE_NAMES[scale];
  return names[Math.abs(noteIndex) % names.length];
}

export function createChimeWorld(preset: ChimePreset = 'CASCADE_HARP'): ChimeWorld {
  const world: ChimeWorld = {
    preset,
    bars: [],
    pendulums: [],
    bells: [],
    emitters: [],
    marbles: [],
    particles: [],
    rings: [],
    floatingTexts: [],
    drawDraft: null,
    score: 0,
    combo: 0,
    maxCombo: 0,
    notesPlayed: 0,
    time: 0,
    nextId: 1,
    gravity: 390,
  };

  if (preset === 'CASCADE_HARP') {
    world.emitters.push(
      { x: 185, y: 52, vx: 38, vy: 10, interval: 1.05, timer: 0.15, spreadX: 6, hueBase: 190 },
      { x: 615, y: 52, vx: -38, vy: 10, interval: 1.05, timer: 0.68, spreadX: 6, hueBase: 315 }
    );

    // Left & right inward harmonic xylophone staircases
    for (let i = 0; i < 6; i++) {
      const y = 135 + i * 68;
      const lx = 115 + i * 44;
      const rx = ARENA_WIDTH - lx;
      const hueL = (185 + i * 24) % 360;
      const hueR = (330 - i * 22 + 360) % 360;
      world.bars.push(
        makeBar(world.nextId++, lx - 36, y - 10, lx + 38, y + 12, 13 - i * 2, hueL, false, 0.9),
        makeBar(world.nextId++, rx - 38, y + 12, rx + 36, y - 10, 14 - i * 2, hueR, false, 0.9)
      );
    }

    // Center harmonic bridge & twin catching bowls
    world.bars.push(
      makeBar(world.nextId++, 345, 535, 455, 535, 2, 48, false, 0.98),
      makeBar(world.nextId++, 205, 560, 295, 582, 4, 160, false, 0.94),
      makeBar(world.nextId++, 505, 582, 595, 560, 5, 210, false, 0.94)
    );
    world.bells.push(
      { id: world.nextId++, x: 400, y: 245, radius: 18, noteIndex: 9, hue: 46, hitFlash: 0 },
      { id: world.nextId++, x: 400, y: 395, radius: 22, noteIndex: 5, hue: 175, hitFlash: 0 }
    );
  } else if (preset === 'PENDULUM_WAVE') {
    world.gravity = 320;
    const count = 15;
    const anchorY = 66;
    for (let i = 0; i < count; i++) {
      const x = 120 + (i / (count - 1)) * (ARENA_WIDTH - 240);
      const len = 185 + i * 16;
      const freq = 0.85 + i * 0.048; // graded periods produce classic pendulum wave!
      world.pendulums.push({
        id: world.nextId++,
        anchorX: x,
        anchorY,
        length: len,
        angle: 0.44,
        prevAngle: 0.44,
        maxAngle: 0.44,
        omega: freq * Math.PI * 1.15,
        phase: 0,
        bobRadius: 11,
        noteIndex: 14 - i,
        hue: (180 + i * 13) % 360,
        hitFlash: 0,
        strumCooldown: 0,
      });
    }
    // Gentle lower chime floor so tapped marbles dance musically underneath
    for (let i = 0; i < 7; i++) {
      const bx = 110 + i * 96;
      const tilt = i % 2 === 0 ? 10 : -10;
      world.bars.push(
        makeBar(world.nextId++, bx - 36, 540 - tilt, bx + 36, 540 + tilt, i * 2, (42 + i * 32) % 360, false, 0.92)
      );
    }
    world.emitters.push({
      x: 400,
      y: 42,
      vx: 0,
      vy: 20,
      interval: 2.4,
      timer: 0.5,
      spreadX: 220,
      hueBase: 195,
    });
  } else if (preset === 'LOTUS_WHEEL') {
    const cx = ARENA_WIDTH / 2;
    const cy = 275;
    const petals = 8;
    for (let i = 0; i < petals; i++) {
      const a = (i / petals) * Math.PI * 2;
      const r1 = 36;
      const r2 = 128;
      const x1 = cx + Math.cos(a) * r1;
      const y1 = cy + Math.sin(a) * r1;
      const x2 = cx + Math.cos(a + 0.14) * r2;
      const y2 = cy + Math.sin(a + 0.14) * r2;
      const bar = makeBar(
        world.nextId++,
        x1,
        y1,
        x2,
        y2,
        (i * 2) % 15,
        (290 + i * 26) % 360,
        false,
        0.92
      );
      bar.rotOriginX = cx;
      bar.rotOriginY = cy;
      bar.rotSpeed = 0.55;
      bar.baseOffset = {
        x1: x1 - cx,
        y1: y1 - cy,
        x2: x2 - cx,
        y2: y2 - cy,
      };
      world.bars.push(bar);
    }
    // Outer wing chimes & lower catch harp
    world.bars.push(
      makeBar(world.nextId++, 115, 230, 215, 295, 11, 185, false, 0.92),
      makeBar(world.nextId++, 685, 230, 585, 295, 12, 320, false, 0.92),
      makeBar(world.nextId++, 165, 455, 310, 510, 6, 155, false, 0.92),
      makeBar(world.nextId++, 635, 455, 490, 510, 8, 45, false, 0.92),
      makeBar(world.nextId++, 325, 560, 475, 560, 2, 220, false, 0.96)
    );
    world.bells.push({ id: world.nextId++, x: cx, y: cy, radius: 22, noteIndex: 14, hue: 48, hitFlash: 0 });
    world.emitters.push(
      { x: 350, y: 48, vx: -14, vy: 15, interval: 0.95, timer: 0.1, spreadX: 16, hueBase: 175 },
      { x: 450, y: 48, vx: 14, vy: 15, interval: 0.95, timer: 0.55, spreadX: 16, hueBase: 300 }
    );
  } else if (preset === 'SPIRAL_LOOM') {
    world.emitters.push({
      x: 165,
      y: 48,
      vx: 70,
      vy: 15,
      interval: 0.95,
      timer: 0.1,
      spreadX: 12,
      hueBase: 165,
    });
    for (let i = 0; i < 6; i++) {
      const y = 135 + i * 74;
      const leftToRight = i % 2 === 0;
      const x1 = leftToRight ? 120 : 210;
      const x2 = leftToRight ? 590 : 680;
      const y1 = leftToRight ? y - 22 : y + 22;
      const y2 = leftToRight ? y + 22 : y - 22;
      world.bars.push(
        makeBar(world.nextId++, x1, y1, x2, y2, 13 - i * 2, (160 + i * 32) % 360, false, 0.84)
      );
      world.bells.push({
        id: world.nextId++,
        x: leftToRight ? 645 : 155,
        y: y + 26,
        radius: 17,
        noteIndex: 14 - i * 2,
        hue: (40 + i * 38) % 360,
        hitFlash: 0,
      });
    }
  } else if (preset === 'TWIN_FOUNTAIN') {
    world.gravity = 360;
    world.emitters.push(
      { x: 165, y: 565, vx: 145, vy: -485, interval: 0.85, timer: 0.1, spreadX: 14, hueBase: 190 },
      { x: 635, y: 565, vx: -145, vy: -485, interval: 0.85, timer: 0.5, spreadX: 14, hueBase: 325 }
    );
    // Overhead curved harp arch
    for (let i = 0; i < 7; i++) {
      const angle = Math.PI + (i / 6) * Math.PI;
      const cx = ARENA_WIDTH / 2 + Math.cos(angle) * 235;
      const cy = 285 + Math.sin(angle) * 160;
      const tx = -Math.sin(angle) * 34;
      const ty = Math.cos(angle) * 34;
      world.bars.push(
        makeBar(
          world.nextId++,
          cx - tx,
          cy - ty,
          cx + tx,
          cy + ty,
          (i * 2 + 2) % 15,
          (185 + i * 26) % 360,
          false,
          0.92
        )
      );
    }
    world.bells.push(
      { id: world.nextId++, x: 400, y: 270, radius: 24, noteIndex: 10, hue: 48, hitFlash: 0 },
      { id: world.nextId++, x: 315, y: 390, radius: 19, noteIndex: 6, hue: 168, hitFlash: 0 },
      { id: world.nextId++, x: 485, y: 390, radius: 19, noteIndex: 8, hue: 298, hitFlash: 0 }
    );
    world.bars.push(
      makeBar(world.nextId++, 285, 515, 385, 545, 3, 210, false, 0.94),
      makeBar(world.nextId++, 415, 545, 515, 515, 5, 340, false, 0.94)
    );
  } else if (preset === 'RAIN_CANOPY') {
    world.gravity = 295;
    world.emitters.push(
      { x: 220, y: 38, vx: 8, vy: 25, interval: 0.72, timer: 0.05, spreadX: 140, hueBase: 195 },
      { x: 580, y: 38, vx: -8, vy: 25, interval: 0.72, timer: 0.42, spreadX: 140, hueBase: 265 }
    );
    const leafCoords = [
      [130, 175, 225, 200, 12],
      [350, 160, 450, 160, 14],
      [575, 200, 670, 175, 13],
      [195, 295, 295, 270, 9],
      [505, 270, 605, 295, 10],
      [95, 415, 200, 445, 5],
      [330, 385, 470, 385, 7],
      [600, 445, 705, 415, 6],
      [230, 535, 345, 515, 3],
      [455, 515, 570, 535, 4],
    ];
    leafCoords.forEach(([x1, y1, x2, y2, note], idx) => {
      world.bars.push(
        makeBar(world.nextId++, x1, y1, x2, y2, note, (150 + idx * 24) % 360, false, 0.88)
      );
    });
  } else if (preset === 'GALAXY_ORBIT') {
    world.gravity = 320;
    world.emitters.push(
      { x: 255, y: 46, vx: 22, vy: 15, interval: 1.05, timer: 0.1, spreadX: 16, hueBase: 195 },
      { x: 545, y: 46, vx: -22, vy: 15, interval: 1.05, timer: 0.62, spreadX: 16, hueBase: 300 }
    );
    const cx = ARENA_WIDTH / 2;
    const cy = 315;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const x1 = cx + Math.cos(a) * 58;
      const y1 = cy + Math.sin(a) * 58;
      const x2 = cx + Math.cos(a + 0.35) * 145;
      const y2 = cy + Math.sin(a + 0.35) * 145;
      const bar = makeBar(world.nextId++, x1, y1, x2, y2, 4 + (i % 6) * 2, (185 + i * 28) % 360, false, 0.9);
      bar.rotOriginX = cx;
      bar.rotOriginY = cy;
      bar.rotSpeed = 0.38;
      bar.baseOffset = { x1: x1 - cx, y1: y1 - cy, x2: x2 - cx, y2: y2 - cy };
      world.bars.push(bar);
    }
    world.bells.push(
      { id: world.nextId++, x: cx, y: cy, radius: 22, noteIndex: 10, hue: 48, hitFlash: 0 },
      { id: world.nextId++, x: 145, y: 455, radius: 18, noteIndex: 6, hue: 175, hitFlash: 0 },
      { id: world.nextId++, x: 655, y: 455, radius: 18, noteIndex: 8, hue: 295, hitFlash: 0 }
    );
    world.bars.push(
      makeBar(world.nextId++, 210, 535, 345, 565, 3, 185, false, 0.92),
      makeBar(world.nextId++, 455, 565, 590, 535, 5, 315, false, 0.92)
    );
  } else if (preset === 'WATERFALL_STEPS') {
    world.gravity = 335;
    world.emitters.push({
      x: 135,
      y: 44,
      vx: 72,
      vy: 14,
      interval: 0.95,
      timer: 0.15,
      spreadX: 10,
      hueBase: 170,
    });
    for (let i = 0; i < 8; i++) {
      const x1 = 105 + i * 70;
      const y1 = 135 + i * 52;
      world.bars.push(
        makeBar(world.nextId++, x1 - 30, y1 - 8, x1 + 36, y1 + 10, 14 - i, (165 + i * 22) % 360, false, 0.88)
      );
    }
    world.bells.push(
      { id: world.nextId++, x: 650, y: 545, radius: 22, noteIndex: 4, hue: 48, hitFlash: 0 },
      { id: world.nextId++, x: 400, y: 235, radius: 18, noteIndex: 10, hue: 195, hitFlash: 0 }
    );
  } else if (preset === 'BAMBOO_WIND') {
    world.gravity = 310;
    world.emitters.push(
      { x: 180, y: 44, vx: 22, vy: 10, interval: 1.0, timer: 0.1, spreadX: 24, hueBase: 145 },
      { x: 620, y: 44, vx: -22, vy: 10, interval: 1.0, timer: 0.6, spreadX: 24, hueBase: 175 }
    );
    // Asymmetric bamboo chime tubes tilted gently inward and outward
    for (let i = 0; i < 6; i++) {
      const y = 132 + i * 68;
      const offset = (i % 2 === 0 ? -1 : 1) * 32;
      const lx = 215 + offset;
      const rx = 585 - offset;
      world.bars.push(
        makeBar(world.nextId++, lx - 58, y - 10, lx + 58, y + 12, 13 - i * 2, (135 + i * 16) % 360, false, 0.88),
        makeBar(world.nextId++, rx - 58, y + 12, rx + 58, y - 10, 14 - i * 2, (165 + i * 16) % 360, false, 0.88)
      );
    }
    world.bells.push(
      { id: world.nextId++, x: 400, y: 270, radius: 21, noteIndex: 11, hue: 150, hitFlash: 0 },
      { id: world.nextId++, x: 400, y: 440, radius: 23, noteIndex: 6, hue: 48, hitFlash: 0 }
    );
  } else if (preset === 'AURORA_ARCH') {
    world.gravity = 325;
    world.emitters.push(
      { x: 250, y: 44, vx: 12, vy: 14, interval: 0.92, timer: 0.12, spreadX: 28, hueBase: 185 },
      { x: 550, y: 44, vx: -12, vy: 14, interval: 0.92, timer: 0.58, spreadX: 28, hueBase: 285 }
    );
    // Double sweeping aurora harp arches
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const x = 110 + t * 580;
      const yTop = 210 - Math.sin(t * Math.PI) * 58;
      const tilt = (0.5 - t) * 28;
      world.bars.push(
        makeBar(world.nextId++, x - 28, yTop - tilt * 0.45, x + 28, yTop + tilt * 0.45, i + 4, (175 + i * 18) % 360, false, 0.9)
      );
    }
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      const x = 165 + t * 470;
      const yLow = 445 + Math.sin(t * Math.PI) * 52;
      const tilt = (t - 0.5) * 24;
      world.bars.push(
        makeBar(world.nextId++, x - 30, yLow - tilt * 0.45, x + 30, yLow + tilt * 0.45, 12 - i, (265 + i * 20) % 360, false, 0.92)
      );
    }
    world.bells.push(
      { id: world.nextId++, x: 400, y: 315, radius: 24, noteIndex: 9, hue: 190, hitFlash: 0 }
    );
  } else {
    // GRAND_SYMPHONY
    world.gravity = 385;
    world.emitters.push(
      { x: 165, y: 45, vx: 45, vy: 20, interval: 0.62, timer: 0.05, spreadX: 28, hueBase: 45 },
      { x: 400, y: 45, vx: 0, vy: 25, interval: 0.75, timer: 0.3, spreadX: 40, hueBase: 190 },
      { x: 635, y: 45, vx: -45, vy: 20, interval: 0.62, timer: 0.48, spreadX: 28, hueBase: 310 }
    );
    // Twin rotating center chimes
    for (const [cx, cy, dir] of [
      [275, 250, 0.7],
      [525, 250, -0.7],
    ] as const) {
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        const x1 = cx + Math.cos(a) * 18;
        const y1 = cy + Math.sin(a) * 18;
        const x2 = cx + Math.cos(a) * 74;
        const y2 = cy + Math.sin(a) * 74;
        const bar = makeBar(world.nextId++, x1, y1, x2, y2, 6 + i * 2, (195 + i * 38) % 360, false, 0.94);
        bar.rotOriginX = cx;
        bar.rotOriginY = cy;
        bar.rotSpeed = dir;
        bar.baseOffset = { x1: x1 - cx, y1: y1 - cy, x2: x2 - cx, y2: y2 - cy };
        world.bars.push(bar);
      }
    }
    // Lower cascade wings
    for (let i = 0; i < 4; i++) {
      const y = 370 + i * 52;
      const lx = 95 + i * 55;
      const rx = ARENA_WIDTH - lx;
      world.bars.push(
        makeBar(world.nextId++, lx - 34, y - 10, lx + 36, y + 10, 12 - i * 3, (35 + i * 28) % 360, false, 0.92),
        makeBar(world.nextId++, rx - 36, y + 10, rx + 34, y - 10, 13 - i * 3, (285 + i * 22) % 360, false, 0.92)
      );
    }
    world.bells.push(
      { id: world.nextId++, x: 400, y: 185, radius: 19, noteIndex: 13, hue: 48, hitFlash: 0 },
      { id: world.nextId++, x: 400, y: 360, radius: 22, noteIndex: 9, hue: 175, hitFlash: 0 },
      { id: world.nextId++, x: 400, y: 505, radius: 24, noteIndex: 5, hue: 315, hitFlash: 0 }
    );
  }

  return world;
}

function triggerNoteFeedback(
  world: ChimeWorld,
  x: number,
  y: number,
  noteIndex: number,
  hue: number,
  voice: ChimeVoiceId,
  scale: ChimeScaleId,
  intensity: number,
  reducedMotion: boolean,
  zenMode: boolean,
  allowSoftBloom = true
) {
  const freqs = SCALE_TABLES[scale];
  const freq = freqs[Math.abs(noteIndex) % freqs.length];
  soundEngine.playChimeNote(freq, voice, intensity);

  world.notesPlayed += 1;
  world.combo += 1;
  if (world.combo > world.maxCombo) world.maxCombo = world.combo;
  world.score += 35 + Math.min(120, world.combo * 4);

  const color = `hsl(${hue}, 88%, 68%)`;
  // Eye-comfort refinement: only spawn small, short-lived local blooms on strong direct hits, capped at 6 total
  if (allowSoftBloom && intensity >= 0.86 && !reducedMotion) {
    world.rings.push({
      x,
      y,
      radius: 6,
      maxRadius: 22,
      color,
      alpha: 0.34,
    });
  }

  const pCount = reducedMotion ? 1 : 4;
  for (let i = 0; i < pCount; i++) {
    const a = (i / pCount) * Math.PI * 2 + Math.random() * 0.5;
    const spd = 28 + Math.random() * 58;
    world.particles.push({
      x,
      y,
      vx: Math.cos(a) * spd,
      vy: Math.sin(a) * spd - 14,
      radius: 1.6 + Math.random() * 1.4,
      color,
      alpha: 0.58,
      decay: 2.2 + Math.random() * 0.6,
    });
  }

  if (!zenMode && world.floatingTexts.length < 12) {
    world.floatingTexts.push({
      x,
      y: y - 12,
      vy: -32,
      text: getNoteLabel(scale, noteIndex),
      color: '#F8FAFC',
      alpha: 0.85,
      scale: 0.82,
    });
  }

  if (world.rings.length > 6) world.rings.splice(0, world.rings.length - 6);
  if (world.particles.length > 140) world.particles.splice(0, world.particles.length - 140);
}

export function spawnChimeMarbleAt(
  world: ChimeWorld,
  x: number,
  y: number,
  count = 3
) {
  soundEngine.playChimeSpawn();
  for (let i = 0; i < count; i++) {
    if (world.marbles.length >= 65) {
      world.marbles.shift();
    }
    const spread = count === 1 ? 0 : (i - (count - 1) / 2) * 38;
    world.marbles.push({
      id: world.nextId++,
      x: Math.max(24, Math.min(ARENA_WIDTH - 24, x + (Math.random() - 0.5) * 14)),
      y: Math.max(20, Math.min(ARENA_HEIGHT - 30, y)),
      vx: spread + (Math.random() - 0.5) * 18,
      vy: -15 - Math.random() * 25,
      radius: 7.5,
      hue: (world.time * 42 + i * 38) % 360,
      trail: [],
      age: 0,
      bounces: 0,
    });
  }
}

export function addUserChimeBar(
  world: ChimeWorld,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): boolean {
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 24) return false;
  if (world.bars.length >= 44) {
    const oldestUserIdx = world.bars.findIndex((b) => b.isUserDrawn);
    if (oldestUserIdx >= 0) world.bars.splice(oldestUserIdx, 1);
  }
  const noteIdx = noteIndexFromLength(len);
  const hue = (180 + noteIdx * 15) % 360;
  world.bars.push(makeBar(world.nextId++, x1, y1, x2, y2, noteIdx, hue, true, 0.91));
  soundEngine.playPlaceToy();
  return true;
}

export function eraseChimeAt(world: ChimeWorld, x: number, y: number): boolean {
  const idx = world.bars.findIndex((b) => {
    const dx = b.x2 - b.x1;
    const dy = b.y2 - b.y1;
    const l2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((x - b.x1) * dx + (y - b.y1) * dy) / l2));
    const px = b.x1 + t * dx;
    const py = b.y1 + t * dy;
    return Math.hypot(x - px, y - py) <= 18;
  });
  if (idx >= 0) {
    world.bars.splice(idx, 1);
    soundEngine.playPlaceToy();
    return true;
  }
  return false;
}

export function strumChimesNear(
  world: ChimeWorld,
  x: number,
  y: number,
  voice: ChimeVoiceId,
  scale: ChimeScaleId,
  reducedMotion: boolean,
  zenMode: boolean
) {
  for (const bar of world.bars) {
    if (bar.strumCooldown > 0) continue;
    const dx = bar.x2 - bar.x1;
    const dy = bar.y2 - bar.y1;
    const l2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((x - bar.x1) * dx + (y - bar.y1) * dy) / l2));
    const px = bar.x1 + t * dx;
    const py = bar.y1 + t * dy;
    if (Math.hypot(x - px, y - py) <= 20) {
      bar.strumCooldown = 0.24;
      bar.hitFlash = 1;
      bar.vibrateAmp = 6;
      bar.vibratePhase = 0;
      triggerNoteFeedback(world, px, py, bar.noteIndex, bar.hue, voice, scale, 0.82, reducedMotion, zenMode);
    }
  }

  for (const p of world.pendulums) {
    if (p.strumCooldown > 0) continue;
    const bx = p.anchorX + Math.sin(p.angle) * p.length;
    const by = p.anchorY + Math.cos(p.angle) * p.length;
    if (Math.hypot(x - bx, y - by) <= 24) {
      p.strumCooldown = 0.28;
      p.hitFlash = 1;
      triggerNoteFeedback(world, bx, by, p.noteIndex, p.hue, voice, scale, 0.85, reducedMotion, zenMode);
    }
  }
}

export function strumAllChimes(
  world: ChimeWorld,
  voice: ChimeVoiceId,
  scale: ChimeScaleId,
  reducedMotion: boolean,
  zenMode: boolean
) {
  const count = Math.min(8, world.bars.length);
  for (let i = 0; i < count; i++) {
    const bar = world.bars[i];
    bar.hitFlash = 1;
    bar.vibrateAmp = 5;
    triggerNoteFeedback(
      world,
      bar.cx,
      bar.cy,
      bar.noteIndex,
      bar.hue,
      voice,
      scale,
      0.7,
      reducedMotion,
      zenMode
    );
  }
  if (count === 0 && world.pendulums.length > 0) {
    for (let i = 0; i < Math.min(6, world.pendulums.length); i++) {
      const p = world.pendulums[i];
      p.hitFlash = 1;
      const bx = p.anchorX + Math.sin(p.angle) * p.length;
      const by = p.anchorY + Math.cos(p.angle) * p.length;
      triggerNoteFeedback(world, bx, by, p.noteIndex, p.hue, voice, scale, 0.65, reducedMotion, zenMode);
    }
  }
}

export function stepChimeWorld(
  world: ChimeWorld,
  dt: number,
  autoFlow: boolean,
  voice: ChimeVoiceId,
  scale: ChimeScaleId,
  reducedMotion: boolean,
  zenMode: boolean
) {
  world.time += dt;

  // Update rotating bars & vibration decay
  for (const bar of world.bars) {
    if (bar.strumCooldown > 0) bar.strumCooldown = Math.max(0, bar.strumCooldown - dt);
    if (bar.hitFlash > 0) bar.hitFlash = Math.max(0, bar.hitFlash - dt * 2.8);
    if (bar.vibrateAmp > 0.05) {
      bar.vibrateAmp *= Math.pow(0.06, dt);
      bar.vibratePhase += dt * 44;
    } else {
      bar.vibrateAmp = 0;
    }
    if (bar.rotSpeed && bar.rotOriginX !== undefined && bar.rotOriginY !== undefined && bar.baseOffset) {
      const rot = world.time * bar.rotSpeed;
      const cos = Math.cos(rot);
      const sin = Math.sin(rot);
      bar.x1 = bar.rotOriginX + bar.baseOffset.x1 * cos - bar.baseOffset.y1 * sin;
      bar.y1 = bar.rotOriginY + bar.baseOffset.x1 * sin + bar.baseOffset.y1 * cos;
      bar.x2 = bar.rotOriginX + bar.baseOffset.x2 * cos - bar.baseOffset.y2 * sin;
      bar.y2 = bar.rotOriginY + bar.baseOffset.x2 * sin + bar.baseOffset.y2 * cos;
      bar.cx = (bar.x1 + bar.x2) * 0.5;
      bar.cy = (bar.y1 + bar.y2) * 0.5;
    }
  }

  // Update phase-locked pendulums (ring crystal note when crossing center equilibrium!)
  for (const p of world.pendulums) {
    if (p.strumCooldown > 0) p.strumCooldown = Math.max(0, p.strumCooldown - dt);
    if (p.hitFlash > 0) p.hitFlash = Math.max(0, p.hitFlash - dt * 2.4);
    p.prevAngle = p.angle;
    p.phase += p.omega * dt;
    p.angle = p.maxAngle * Math.cos(p.phase);

    if ((p.prevAngle < 0 && p.angle >= 0) || (p.prevAngle > 0 && p.angle <= 0)) {
      p.hitFlash = 1;
      const bx = p.anchorX + Math.sin(p.angle) * p.length;
      const by = p.anchorY + Math.cos(p.angle) * p.length;
      triggerNoteFeedback(world, bx, by, p.noteIndex, p.hue, voice, scale, 0.68, reducedMotion, zenMode, false);
    }
  }

  // Update bumper bells
  for (const bell of world.bells) {
    if (bell.hitFlash > 0) bell.hitFlash = Math.max(0, bell.hitFlash - dt * 2.8);
  }

  // Auto-emit gentle musical marble streams
  if (autoFlow) {
    for (const em of world.emitters) {
      em.timer -= dt;
      if (em.timer <= 0) {
        em.timer = em.interval;
        if (world.marbles.length < 52) {
          world.marbles.push({
            id: world.nextId++,
            x: em.x + (Math.random() - 0.5) * em.spreadX,
            y: em.y,
            vx: em.vx + (Math.random() - 0.5) * 14,
            vy: em.vy,
            radius: 7.5,
            hue: (em.hueBase + world.time * 18) % 360,
            trail: [],
            age: 0,
            bounces: 0,
          });
        }
      }
    }
  }

  // Step marbles with 2 substeps for crisp segment collision
  const substeps = 2;
  const subDt = dt / substeps;
  for (let i = world.marbles.length - 1; i >= 0; i--) {
    const m = world.marbles[i];
    m.age += dt;
    if (m.age > 18) {
      world.marbles.splice(i, 1);
      continue;
    }

    for (let s = 0; s < substeps; s++) {
      m.vy += world.gravity * subDt;
      m.vx *= 1 - 0.04 * subDt;
      m.x += m.vx * subDt;
      m.y += m.vy * subDt;

      // Soft arena side walls
      if (m.x < m.radius + 14) {
        m.x = m.radius + 14;
        m.vx = Math.abs(m.vx) * 0.85;
      } else if (m.x > ARENA_WIDTH - m.radius - 14) {
        m.x = ARENA_WIDTH - m.radius - 14;
        m.vx = -Math.abs(m.vx) * 0.85;
      }
      if (m.y < m.radius + 12) {
        m.y = m.radius + 12;
        m.vy = Math.abs(m.vy) * 0.8;
      }

      // Chime bar segment collisions
      for (const bar of world.bars) {
        const dx = bar.x2 - bar.x1;
        const dy = bar.y2 - bar.y1;
        const l2 = dx * dx + dy * dy || 1;
        const t = Math.max(0, Math.min(1, ((m.x - bar.x1) * dx + (m.y - bar.y1) * dy) / l2));
        const cx = bar.x1 + t * dx;
        const cy = bar.y1 + t * dy;
        const distX = m.x - cx;
        const distY = m.y - cy;
        const dist = Math.hypot(distX, distY);
        const minDist = m.radius + 5;

        if (dist < minDist && dist > 0.0001) {
          const nx = distX / dist;
          const ny = distY / dist;
          const vn = m.vx * nx + m.vy * ny;
          m.x = cx + nx * (minDist + 0.5);
          m.y = cy + ny * (minDist + 0.5);

          if (vn < 0) {
            // Normal bounce + tangential surface friction along the chime bar slope
            const segLen = Math.sqrt(l2);
            const tx = dx / segLen;
            const ty = dy / segLen;
            const vnAfter = -bar.restitution * vn;
            let vt = m.vx * tx + m.vy * ty;
            const normalHit = Math.abs(vn);
            if (normalHit > 24) {
              const coulomb = Math.min(Math.abs(vt) * 0.24, (normalHit - 24) * 0.16);
              if (vt > 0) vt -= coulomb;
              else if (vt < 0) vt += coulomb;
            }
            const slopeDragRate = 1.6 + Math.abs(ty) * 1.4;
            vt *= Math.max(0.75, 1 - slopeDragRate * subDt);
            m.vx = vt * tx + vnAfter * nx;
            m.vy = vt * ty + vnAfter * ny;
            // Subtle upward energy preservation on shallow bars
            if (Math.hypot(m.vx, m.vy) < 105) {
              m.vy -= 40;
            }
            if (bar.strumCooldown <= 0.08) {
              bar.strumCooldown = 0.1;
              bar.hitFlash = 1;
              bar.vibrateAmp = Math.min(7, Math.max(2.5, Math.abs(vn) * 0.02));
              bar.vibratePhase = 0;
              m.bounces += 1;
              const intensity = Math.min(1.05, 0.45 + Math.abs(vn) / 420);
              triggerNoteFeedback(
                world,
                cx,
                cy,
                bar.noteIndex,
                bar.hue,
                voice,
                scale,
                intensity,
                reducedMotion,
                zenMode
              );
            }
          }
        }
      }

      // Bumper bells
      for (const bell of world.bells) {
        const dx = m.x - bell.x;
        const dy = m.y - bell.y;
        const dist = Math.hypot(dx, dy);
        const minDist = m.radius + bell.radius;
        if (dist < minDist && dist > 0.0001) {
          const nx = dx / dist;
          const ny = dy / dist;
          m.x = bell.x + nx * (minDist + 1);
          m.y = bell.y + ny * (minDist + 1);
          const speed = Math.max(220, Math.hypot(m.vx, m.vy) * 1.05);
          m.vx = nx * speed;
          m.vy = ny * speed;
          bell.hitFlash = 1;
          triggerNoteFeedback(
            world,
            bell.x,
            bell.y,
            bell.noteIndex,
            bell.hue,
            voice,
            scale,
            0.9,
            reducedMotion,
            zenMode
          );
        }
      }
    }

    m.trail.push({ x: m.x, y: m.y });
    if (m.trail.length > 14) m.trail.shift();

    if (m.y > ARENA_HEIGHT + 24) {
      world.marbles.splice(i, 1);
    }
  }

  // Particles, rings, floating texts
  for (let i = world.particles.length - 1; i >= 0; i--) {
    const p = world.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.alpha -= p.decay * dt;
    if (p.alpha <= 0) world.particles.splice(i, 1);
  }
  for (let i = world.rings.length - 1; i >= 0; i--) {
    const r = world.rings[i];
    r.radius += (r.maxRadius - r.radius) * Math.min(1, dt * 8) + 22 * dt;
    r.alpha -= dt * 2.8;
    if (r.alpha <= 0) world.rings.splice(i, 1);
  }
  for (let i = world.floatingTexts.length - 1; i >= 0; i--) {
    const ft = world.floatingTexts[i];
    ft.y += ft.vy * dt;
    ft.alpha -= dt * 1.35;
    if (ft.alpha <= 0) world.floatingTexts.splice(i, 1);
  }
}

export function renderChimeWorld(
  ctx: CanvasRenderingContext2D,
  world: ChimeWorld,
  scale: ChimeScaleId,
  zenMode: boolean
) {
  // Deep velvet night backdrop
  const bg = ctx.createRadialGradient(
    ARENA_WIDTH * 0.5,
    ARENA_HEIGHT * 0.35,
    40,
    ARENA_WIDTH * 0.5,
    ARENA_HEIGHT * 0.5,
    ARENA_WIDTH * 0.72
  );
  bg.addColorStop(0, '#101B33');
  bg.addColorStop(1, '#070B16');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

  // Subtle ambient vertical string threads in Pendulum mode
  if (world.pendulums.length > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    for (const p of world.pendulums) {
      ctx.beginPath();
      ctx.moveTo(p.anchorX, p.anchorY);
      ctx.lineTo(p.anchorX, p.anchorY + p.length + 12);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Soft localized note blooms (gentle, non-distracting)
  for (const r of world.rings) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, r.alpha * 0.75);
    ctx.strokeStyle = r.color;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Emitters (glowing starlight nozzles)
  for (const em of world.emitters) {
    ctx.save();
    ctx.fillStyle = `hsla(${em.hueBase}, 90%, 72%, 0.22)`;
    ctx.beginPath();
    ctx.arc(em.x, em.y, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `hsl(${em.hueBase}, 94%, 76%)`;
    ctx.beginPath();
    ctx.arc(em.x, em.y, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Chime bars with damped physical flex curve & glow
  for (const bar of world.bars) {
    const dx = bar.x2 - bar.x1;
    const dy = bar.y2 - bar.y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const flex = Math.sin(bar.vibratePhase) * bar.vibrateAmp;
    const ctrlX = bar.cx + nx * flex;
    const ctrlY = bar.cy + ny * flex;

    ctx.save();
    const glowColor = `hsl(${bar.hue}, 94%, ${64 + bar.hitFlash * 28}%)`;
    ctx.strokeStyle = glowColor;
    ctx.lineCap = 'round';
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 8 + bar.hitFlash * 18;
    ctx.lineWidth = 7 + bar.hitFlash * 3;
    ctx.beginPath();
    ctx.moveTo(bar.x1, bar.y1);
    ctx.quadraticCurveTo(ctrlX, ctrlY, bar.x2, bar.y2);
    ctx.stroke();

    // Inner bright crystal core
    ctx.shadowBlur = 0;
    ctx.strokeStyle = bar.hitFlash > 0.25 ? '#FFFFFF' : 'rgba(255,255,255,0.68)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bar.x1, bar.y1);
    ctx.quadraticCurveTo(ctrlX, ctrlY, bar.x2, bar.y2);
    ctx.stroke();

    // End pegs
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.arc(bar.x1, bar.y1, 3.2, 0, Math.PI * 2);
    ctx.arc(bar.x2, bar.y2, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Bumper bells
  for (const bell of world.bells) {
    ctx.save();
    const color = `hsl(${bell.hue}, 94%, ${66 + bell.hitFlash * 25}%)`;
    ctx.fillStyle = `hsla(${bell.hue}, 88%, 55%, ${0.22 + bell.hitFlash * 0.45})`;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.6;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12 + bell.hitFlash * 18;
    ctx.beginPath();
    ctx.arc(bell.x, bell.y, bell.radius + bell.hitFlash * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(bell.x, bell.y, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Phase-locked pendulums with silky comet arc trails (no jarring wave rings)
  for (const p of world.pendulums) {
    const bx = p.anchorX + Math.sin(p.angle) * p.length;
    const by = p.anchorY + Math.cos(p.angle) * p.length;
    const color = `hsl(${p.hue}, 90%, ${68 + p.hitFlash * 22}%)`;

    ctx.save();
    ctx.strokeStyle = `hsla(${p.hue}, 80%, 70%, 0.34)`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(p.anchorX, p.anchorY);
    ctx.lineTo(bx, by);
    ctx.stroke();

    // Silky motion arc tail behind pendulum bob
    const velSign = p.angle >= p.prevAngle ? 1 : -1;
    for (let s = 1; s <= 7; s++) {
      const trailA = p.angle - velSign * s * 0.022;
      const tx = p.anchorX + Math.sin(trailA) * p.length;
      const ty = p.anchorY + Math.cos(trailA) * p.length;
      ctx.fillStyle = `hsla(${p.hue}, 90%, 72%, ${(1 - s / 8) * 0.22})`;
      ctx.beginPath();
      ctx.arc(tx, ty, p.bobRadius * (1 - s * 0.09), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(226, 232, 240, 0.5)';
    ctx.beginPath();
    ctx.arc(p.anchorX, p.anchorY, 2.4, 0, Math.PI * 2);
    ctx.fill();

    if (p.hitFlash > 0.08) {
      ctx.fillStyle = `hsla(${p.hue}, 94%, 76%, ${p.hitFlash * 0.28})`;
      ctx.beginPath();
      ctx.arc(bx, by, p.bobRadius + 7 * p.hitFlash, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowColor = color;
    ctx.shadowBlur = 10 + p.hitFlash * 12;
    ctx.fillStyle = p.hitFlash > 0.45 ? '#FFFFFF' : color;
    ctx.beginPath();
    ctx.arc(bx, by, p.bobRadius + p.hitFlash * 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Luminous glass marbles & trails
  for (const m of world.marbles) {
    if (m.trail.length > 1) {
      for (let t = 1; t < m.trail.length; t++) {
        const p0 = m.trail[t - 1];
        const p1 = m.trail[t];
        const ratio = t / m.trail.length;
        ctx.strokeStyle = `hsla(${m.hue}, 94%, 72%, ${ratio * 0.45})`;
        ctx.lineWidth = m.radius * 1.15 * ratio;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
    }
    ctx.save();
    const color = `hsl(${m.hue}, 96%, 72%)`;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // Draft bar preview when user drags to draw a custom chime bar
  if (world.drawDraft) {
    const d = world.drawDraft;
    const len = Math.hypot(d.x2 - d.x1, d.y2 - d.y1);
    const noteIdx = noteIndexFromLength(len);
    const hue = (180 + noteIdx * 15) % 360;
    ctx.save();
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = len >= 24 ? `hsl(${hue}, 94%, 72%)` : 'rgba(148, 163, 184, 0.5)';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(d.x1, d.y1);
    ctx.lineTo(d.x2, d.y2);
    ctx.stroke();
    ctx.setLineDash([]);

    if (len >= 24) {
      ctx.font = '700 12px "JetBrains Mono", monospace';
      ctx.fillStyle = '#F8FAFC';
      ctx.textAlign = 'center';
      ctx.fillText(getNoteLabel(scale, noteIdx), (d.x1 + d.x2) / 2, (d.y1 + d.y2) / 2 - 14);
    }
    ctx.restore();
  }

  // Particles
  for (const p of world.particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Note labels (hidden in Zen Mode)
  if (!zenMode) {
    for (const ft of world.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = '700 12px "JetBrains Mono", monospace';
      ctx.fillStyle = ft.color;
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }
}
