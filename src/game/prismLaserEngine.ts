import { soundEngine } from '../audio/soundEngine';
import { ARENA_HEIGHT, ARENA_WIDTH } from './stages';
import { FloatingText, Particle, RingWave } from './types';

export interface LaserMirror {
  id: number;
  x: number;
  y: number;
  angle: number;
  length: number;
  kind: 'mirror' | 'splitter';
  rotatable: boolean;
  hitFlash: number;
}

export interface LaserCrystal {
  id: number;
  x: number;
  y: number;
  radius: number;
  hue: number;
  lit: boolean;
  charge: number;
}

export interface LaserSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  hue: number;
  depth: number;
}

export interface PrismLaserWorld {
  emitterX: number;
  emitterY: number;
  emitterAngle: number;
  mirrors: LaserMirror[];
  crystals: LaserCrystal[];
  segments: LaserSegment[];
  particles: Particle[];
  waves: RingWave[];
  floatingTexts: FloatingText[];
  level: number;
  solvedLevels: number[];
  autoRotate: boolean;
  draggingMirrorId: number | null;
  dragStartPointerAngle: number;
  dragStartMirrorAngle: number;
  dragMoved: boolean;
  hoveredMirrorId: number | null;
  score: number;
  combo: number;
  maxCombo: number;
  clearTimer: number;
  time: number;
}

export const LASER_LEVEL_NAMES = [
  '01. Twin Mirrors',
  '02. Beam Splitter',
  '03. Diamond Vault',
  '04. Prism Labyrinth',
  '05. Twin Crossfire',
  '06. Solar Hexagon',
  '07. Extreme 10-Mirror Kaleidoscope',
  '08. Twin Cross Split',
  '09. Extreme Prism Star',
  '10. Twin Prism Loop',
  '11. Royal Diamond Crown',
];

const DEG15 = Math.PI / 12;

function buildLaserLevel(level: number): {
  emitterX: number;
  emitterY: number;
  emitterAngle: number;
  mirrors: LaserMirror[];
  crystals: LaserCrystal[];
} {
  const v = ((level - 1) % LASER_LEVEL_NAMES.length) + 1;

  if (v === 1) {
    // Solutions: M1 = -45deg (-3*DEG15), M2 = -45deg, M3 = +45deg
    return {
      emitterX: 95,
      emitterY: 480,
      emitterAngle: 0,
      mirrors: [
        { id: 1, x: 320, y: 480, angle: -5 * DEG15, length: 76, kind: 'mirror', rotatable: true, hitFlash: 0 },
        { id: 2, x: 320, y: 160, angle: -4 * DEG15, length: 76, kind: 'mirror', rotatable: true, hitFlash: 0 },
        { id: 3, x: 640, y: 160, angle: 1 * DEG15, length: 76, kind: 'mirror', rotatable: true, hitFlash: 0 },
      ],
      crystals: [
        { id: 1, x: 320, y: 320, radius: 18, hue: 45, lit: false, charge: 0 },
        { id: 2, x: 480, y: 160, radius: 18, hue: 165, lit: false, charge: 0 },
        { id: 3, x: 640, y: 400, radius: 20, hue: 320, lit: false, charge: 0 },
      ],
    };
  }

  if (v === 2) {
    // Solutions: S1 = -45deg, M2 = -45deg, S3 = +45deg, M4 = +45deg
    return {
      emitterX: 90,
      emitterY: 310,
      emitterAngle: 0,
      mirrors: [
        { id: 1, x: 280, y: 310, angle: -4 * DEG15, length: 70, kind: 'splitter', rotatable: true, hitFlash: 0 },
        { id: 2, x: 280, y: 140, angle: -1 * DEG15, length: 74, kind: 'mirror', rotatable: true, hitFlash: 0 },
        { id: 3, x: 540, y: 310, angle: 2 * DEG15, length: 70, kind: 'splitter', rotatable: true, hitFlash: 0 },
        { id: 4, x: 540, y: 490, angle: 1 * DEG15, length: 74, kind: 'mirror', rotatable: true, hitFlash: 0 },
      ],
      crystals: [
        { id: 1, x: 280, y: 225, radius: 18, hue: 285, lit: false, charge: 0 },
        { id: 2, x: 440, y: 140, radius: 18, hue: 190, lit: false, charge: 0 },
        { id: 3, x: 700, y: 310, radius: 18, hue: 45, lit: false, charge: 0 },
        { id: 4, x: 700, y: 490, radius: 18, hue: 145, lit: false, charge: 0 },
      ],
    };
  }

  if (v === 3) {
    // Diamond Vault: S1 (+45deg), M2 (+45deg), M3 (-45deg), M4 (+45deg), M5 (-45deg)
    return {
      emitterX: 400,
      emitterY: 555,
      emitterAngle: -Math.PI / 2,
      mirrors: [
        { id: 1, x: 400, y: 340, angle: 1 * DEG15, length: 70, kind: 'splitter', rotatable: true, hitFlash: 0 },
        { id: 2, x: 200, y: 340, angle: 2 * DEG15, length: 72, kind: 'mirror', rotatable: true, hitFlash: 0 },
        { id: 3, x: 200, y: 150, angle: -4 * DEG15, length: 72, kind: 'mirror', rotatable: true, hitFlash: 0 },
        { id: 4, x: 600, y: 150, angle: 1 * DEG15, length: 72, kind: 'mirror', rotatable: true, hitFlash: 0 },
        { id: 5, x: 600, y: 470, angle: -5 * DEG15, length: 72, kind: 'mirror', rotatable: true, hitFlash: 0 },
      ],
      crystals: [
        { id: 1, x: 400, y: 235, radius: 18, hue: 48, lit: false, charge: 0 },
        { id: 2, x: 200, y: 245, radius: 17, hue: 185, lit: false, charge: 0 },
        { id: 3, x: 400, y: 150, radius: 18, hue: 280, lit: false, charge: 0 },
        { id: 4, x: 600, y: 310, radius: 17, hue: 330, lit: false, charge: 0 },
        { id: 5, x: 495, y: 470, radius: 18, hue: 150, lit: false, charge: 0 },
      ],
    };
  }

  if (v === 4) {
    // Prism Labyrinth: S1 (+45), S2 (-45), M3 (+45), M4 (+45), M5 (-45)
    return {
      emitterX: 90,
      emitterY: 130,
      emitterAngle: 0,
      mirrors: [
        { id: 1, x: 290, y: 130, angle: 1 * DEG15, length: 70, kind: 'splitter', rotatable: true, hitFlash: 0 },
        { id: 2, x: 290, y: 410, angle: -5 * DEG15, length: 70, kind: 'splitter', rotatable: true, hitFlash: 0 },
        { id: 3, x: 145, y: 410, angle: 1 * DEG15, length: 72, kind: 'mirror', rotatable: true, hitFlash: 0 },
        { id: 4, x: 580, y: 130, angle: 2 * DEG15, length: 72, kind: 'mirror', rotatable: true, hitFlash: 0 },
        { id: 5, x: 580, y: 470, angle: -5 * DEG15, length: 72, kind: 'mirror', rotatable: true, hitFlash: 0 },
      ],
      crystals: [
        { id: 1, x: 290, y: 270, radius: 17, hue: 195, lit: false, charge: 0 },
        { id: 2, x: 290, y: 525, radius: 17, hue: 42, lit: false, charge: 0 },
        { id: 3, x: 145, y: 255, radius: 17, hue: 150, lit: false, charge: 0 },
        { id: 4, x: 435, y: 130, radius: 17, hue: 280, lit: false, charge: 0 },
        { id: 5, x: 580, y: 300, radius: 17, hue: 340, lit: false, charge: 0 },
        { id: 6, x: 420, y: 470, radius: 18, hue: 60, lit: false, charge: 0 },
      ],
    };
  }

  if (v === 5) {
    // Twin Crossfire: S1 (-45), M2 (-45), S3 (+45), M4 (-45), S5 (+45), M6 (+45)
    return {
      emitterX: 85,
      emitterY: 310,
      emitterAngle: 0,
      mirrors: [
        { id: 1, x: 220, y: 310, angle: -5 * DEG15, length: 68, kind: 'splitter', rotatable: true, hitFlash: 0 },
        { id: 2, x: 220, y: 130, angle: -1 * DEG15, length: 72, kind: 'mirror', rotatable: true, hitFlash: 0 },
        { id: 3, x: 520, y: 130, angle: 1 * DEG15, length: 68, kind: 'splitter', rotatable: true, hitFlash: 0 },
        { id: 4, x: 520, y: 500, angle: -5 * DEG15, length: 72, kind: 'mirror', rotatable: true, hitFlash: 0 },
        { id: 5, x: 380, y: 310, angle: 2 * DEG15, length: 68, kind: 'splitter', rotatable: true, hitFlash: 0 },
        { id: 6, x: 380, y: 440, angle: 1 * DEG15, length: 70, kind: 'mirror', rotatable: true, hitFlash: 0 },
      ],
      crystals: [
        { id: 1, x: 360, y: 130, radius: 16, hue: 190, lit: false, charge: 0 },
        { id: 2, x: 680, y: 130, radius: 16, hue: 42, lit: false, charge: 0 },
        { id: 3, x: 520, y: 225, radius: 16, hue: 300, lit: false, charge: 0 },
        { id: 4, x: 520, y: 395, radius: 16, hue: 155, lit: false, charge: 0 },
        { id: 5, x: 320, y: 500, radius: 16, hue: 25, lit: false, charge: 0 },
        { id: 6, x: 680, y: 310, radius: 17, hue: 335, lit: false, charge: 0 },
        { id: 7, x: 650, y: 440, radius: 17, hue: 215, lit: false, charge: 0 },
      ],
    };
  }

  if (v === 6) {
    // Solar Hexagon: Exact 30deg / 60deg regular hexagon loop!
    // S1 (+30 = 2*DEG15), M2 (+30 = 2*DEG15), M3 (-60 = -4*DEG15), M4 (0), M5 (+60 = 4*DEG15), M6 (-60 = -4*DEG15)
    return {
      emitterX: 400,
      emitterY: 550,
      emitterAngle: -Math.PI / 2,
      mirrors: [
        { id: 1, x: 400, y: 310, angle: 0, length: 68, kind: 'splitter', rotatable: true, hitFlash: 0 },
        { id: 2, x: 261.4, y: 390, angle: 4 * DEG15, length: 70, kind: 'mirror', rotatable: true, hitFlash: 0 },
        { id: 3, x: 261.4, y: 230, angle: -2 * DEG15, length: 70, kind: 'mirror', rotatable: true, hitFlash: 0 },
        { id: 4, x: 400, y: 150, angle: 2 * DEG15, length: 70, kind: 'mirror', rotatable: true, hitFlash: 0 },
        { id: 5, x: 538.6, y: 230, angle: 2 * DEG15, length: 70, kind: 'mirror', rotatable: true, hitFlash: 0 },
        { id: 6, x: 538.6, y: 390, angle: -2 * DEG15, length: 70, kind: 'mirror', rotatable: true, hitFlash: 0 },
      ],
      crystals: [
        { id: 1, x: 400, y: 225, radius: 17, hue: 48, lit: false, charge: 0 },
        { id: 2, x: 331, y: 350, radius: 16, hue: 175, lit: false, charge: 0 },
        { id: 3, x: 261.4, y: 310, radius: 16, hue: 280, lit: false, charge: 0 },
        { id: 4, x: 469, y: 190, radius: 16, hue: 335, lit: false, charge: 0 },
        { id: 5, x: 538.6, y: 310, radius: 16, hue: 140, lit: false, charge: 0 },
        { id: 6, x: 400, y: 470, radius: 18, hue: 205, lit: false, charge: 0 },
      ],
    };
  }

  if (v === 7) {
    // Level 7: Extreme 10-Mirror Kaleidoscope (100% mathematically verified solvable!)
    // Solutions: S1(-45), S2(+45), S3(-45), M4(+45), M5(-45), M6(-45), M7(+45), M8(-45), M9(+45), M10(-45)
    return {
      emitterX: 75,
      emitterY: 310,
      emitterAngle: 0,
      mirrors: [
        { id: 1, x: 200, y: 310, angle: -5 * DEG15, length: 64, kind: 'splitter', rotatable: true, hitFlash: 0 },
        { id: 2, x: 400, y: 310, angle: 1 * DEG15, length: 64, kind: 'splitter', rotatable: true, hitFlash: 0 },
        { id: 3, x: 600, y: 310, angle: -1 * DEG15, length: 64, kind: 'splitter', rotatable: true, hitFlash: 0 },
        { id: 4, x: 600, y: 115, angle: 1 * DEG15, length: 66, kind: 'mirror', rotatable: true, hitFlash: 0 },
        { id: 5, x: 310, y: 115, angle: -5 * DEG15, length: 66, kind: 'mirror', rotatable: true, hitFlash: 0 },
        { id: 6, x: 400, y: 515, angle: -1 * DEG15, length: 66, kind: 'mirror', rotatable: true, hitFlash: 0 },
        { id: 7, x: 120, y: 515, angle: 1 * DEG15, length: 66, kind: 'mirror', rotatable: true, hitFlash: 0 },
        { id: 8, x: 200, y: 180, angle: -5 * DEG15, length: 66, kind: 'mirror', rotatable: true, hitFlash: 0 },
        { id: 9, x: 695, y: 180, angle: 1 * DEG15, length: 66, kind: 'mirror', rotatable: true, hitFlash: 0 },
        { id: 10, x: 695, y: 480, angle: -5 * DEG15, length: 66, kind: 'mirror', rotatable: true, hitFlash: 0 },
      ],
      crystals: [
        { id: 1, x: 720, y: 310, radius: 16, hue: 190, lit: false, charge: 0 },
        { id: 2, x: 600, y: 215, radius: 15, hue: 45, lit: false, charge: 0 },
        { id: 3, x: 455, y: 115, radius: 15, hue: 280, lit: false, charge: 0 },
        { id: 4, x: 310, y: 225, radius: 15, hue: 155, lit: false, charge: 0 },
        { id: 5, x: 400, y: 415, radius: 15, hue: 335, lit: false, charge: 0 },
        { id: 6, x: 120, y: 380, radius: 15, hue: 25, lit: false, charge: 0 },
        { id: 7, x: 485, y: 180, radius: 15, hue: 95, lit: false, charge: 0 },
        { id: 8, x: 545, y: 480, radius: 16, hue: 225, lit: false, charge: 0 },
      ],
    };
  }

  if (v === 8) {
    // Stage 08: Twin Cross Split (Solutions: S1=+45deg, M2=+45deg, S3=+45deg, M4=+45deg, M5=+45deg)
    return {
      emitterX: 80,
      emitterY: 140,
      emitterAngle: 0,
      mirrors: [
        { id: 1, x: 260, y: 140, angle: 1 * DEG15, length: 68, kind: 'splitter', rotatable: true, hitFlash: 0 },
        { id: 2, x: 480, y: 140, angle: 1 * DEG15, length: 70, kind: 'mirror', rotatable: true, hitFlash: 0 },
        { id: 3, x: 480, y: 320, angle: 5 * DEG15, length: 68, kind: 'splitter', rotatable: true, hitFlash: 0 },
        { id: 4, x: 260, y: 480, angle: 1 * DEG15, length: 70, kind: 'mirror', rotatable: true, hitFlash: 0 },
        { id: 5, x: 690, y: 320, angle: 5 * DEG15, length: 70, kind: 'mirror', rotatable: true, hitFlash: 0 },
      ],
      crystals: [
        { id: 1, x: 370, y: 140, radius: 16, hue: 48, lit: false, charge: 0 },
        { id: 2, x: 260, y: 310, radius: 16, hue: 185, lit: false, charge: 0 },
        { id: 3, x: 480, y: 230, radius: 16, hue: 285, lit: false, charge: 0 },
        { id: 4, x: 480, y: 415, radius: 16, hue: 335, lit: false, charge: 0 },
        { id: 5, x: 585, y: 320, radius: 16, hue: 150, lit: false, charge: 0 },
        { id: 6, x: 410, y: 480, radius: 16, hue: 25, lit: false, charge: 0 },
        { id: 7, x: 690, y: 430, radius: 17, hue: 215, lit: false, charge: 0 },
      ],
    };
  }

  if (v === 9) {
    // Stage 09: Extreme Prism Star (Solutions: S1=-45, M2=+45, S3=-45, M4=+45, S5=-45, M6=-45, S7=-45)
    return {
      emitterX: 400,
      emitterY: 560,
      emitterAngle: -Math.PI / 2,
      mirrors: [
        { id: 1, x: 400, y: 310, angle: -5 * DEG15, length: 66, kind: 'splitter', rotatable: true, hitFlash: 0 },
        { id: 2, x: 400, y: 120, angle: 1 * DEG15, length: 68, kind: 'mirror', rotatable: true, hitFlash: 0 },
        { id: 3, x: 170, y: 120, angle: -1 * DEG15, length: 66, kind: 'splitter', rotatable: true, hitFlash: 0 },
        { id: 4, x: 170, y: 480, angle: 1 * DEG15, length: 68, kind: 'mirror', rotatable: true, hitFlash: 0 },
        { id: 5, x: 620, y: 310, angle: -1 * DEG15, length: 66, kind: 'splitter', rotatable: true, hitFlash: 0 },
        { id: 6, x: 620, y: 120, angle: -5 * DEG15, length: 68, kind: 'mirror', rotatable: true, hitFlash: 0 },
        { id: 7, x: 520, y: 480, angle: -1 * DEG15, length: 66, kind: 'splitter', rotatable: true, hitFlash: 0 },
      ],
      crystals: [
        { id: 1, x: 400, y: 440, radius: 16, hue: 190, lit: false, charge: 0 },
        { id: 2, x: 400, y: 215, radius: 16, hue: 45, lit: false, charge: 0 },
        { id: 3, x: 285, y: 120, radius: 16, hue: 280, lit: false, charge: 0 },
        { id: 4, x: 170, y: 300, radius: 16, hue: 155, lit: false, charge: 0 },
        { id: 5, x: 345, y: 480, radius: 16, hue: 335, lit: false, charge: 0 },
        { id: 6, x: 520, y: 395, radius: 16, hue: 25, lit: false, charge: 0 },
        { id: 7, x: 510, y: 310, radius: 16, hue: 95, lit: false, charge: 0 },
        { id: 8, x: 620, y: 215, radius: 16, hue: 225, lit: false, charge: 0 },
        { id: 9, x: 695, y: 120, radius: 17, hue: 310, lit: false, charge: 0 },
      ],
    };
  }

  if (v === 10) {
    // Stage 10: Twin Prism Loop (Solutions: S1=-45, M2=-45, S3=-45, S4=+45, M5=+45, M6=-45)
    return {
      emitterX: 90,
      emitterY: 470,
      emitterAngle: 0,
      mirrors: [
        { id: 1, x: 270, y: 470, angle: -5 * DEG15, length: 66, kind: 'splitter', rotatable: true, hitFlash: 0 },
        { id: 2, x: 630, y: 470, angle: -1 * DEG15, length: 68, kind: 'mirror', rotatable: true, hitFlash: 0 },
        { id: 3, x: 270, y: 150, angle: -1 * DEG15, length: 66, kind: 'splitter', rotatable: true, hitFlash: 0 },
        { id: 4, x: 630, y: 290, angle: 1 * DEG15, length: 66, kind: 'splitter', rotatable: true, hitFlash: 0 },
        { id: 5, x: 630, y: 150, angle: 5 * DEG15, length: 68, kind: 'mirror', rotatable: true, hitFlash: 0 },
        { id: 6, x: 150, y: 290, angle: -1 * DEG15, length: 68, kind: 'mirror', rotatable: true, hitFlash: 0 },
      ],
      crystals: [
        { id: 1, x: 450, y: 470, radius: 16, hue: 48, lit: false, charge: 0 },
        { id: 2, x: 270, y: 340, radius: 16, hue: 185, lit: false, charge: 0 },
        { id: 3, x: 270, y: 78, radius: 16, hue: 280, lit: false, charge: 0 },
        { id: 4, x: 630, y: 380, radius: 16, hue: 155, lit: false, charge: 0 },
        { id: 5, x: 450, y: 150, radius: 16, hue: 335, lit: false, charge: 0 },
        { id: 6, x: 410, y: 290, radius: 16, hue: 205, lit: false, charge: 0 },
        { id: 7, x: 150, y: 385, radius: 16, hue: 25, lit: false, charge: 0 },
        { id: 8, x: 145, y: 150, radius: 17, hue: 95, lit: false, charge: 0 },
      ],
    };
  }

  // Stage 11: Royal Diamond Crown (Solutions: S1=-45, S2=+45, M3=-45, S4=+45, M5=-45, M6=+45, M7=-45, M8=-45)
  return {
    emitterX: 400,
    emitterY: 555,
    emitterAngle: -Math.PI / 2,
    mirrors: [
      { id: 1, x: 400, y: 390, angle: -1 * DEG15, length: 66, kind: 'splitter', rotatable: true, hitFlash: 0 },
      { id: 2, x: 400, y: 195, angle: 1 * DEG15, length: 66, kind: 'splitter', rotatable: true, hitFlash: 0 },
      { id: 3, x: 630, y: 390, angle: -5 * DEG15, length: 68, kind: 'mirror', rotatable: true, hitFlash: 0 },
      { id: 4, x: 630, y: 130, angle: 5 * DEG15, length: 66, kind: 'splitter', rotatable: true, hitFlash: 0 },
      { id: 5, x: 170, y: 130, angle: -1 * DEG15, length: 68, kind: 'mirror', rotatable: true, hitFlash: 0 },
      { id: 6, x: 170, y: 470, angle: 1 * DEG15, length: 68, kind: 'mirror', rotatable: true, hitFlash: 0 },
      { id: 7, x: 540, y: 470, angle: -5 * DEG15, length: 68, kind: 'mirror', rotatable: true, hitFlash: 0 },
      { id: 8, x: 255, y: 195, angle: -1 * DEG15, length: 68, kind: 'mirror', rotatable: true, hitFlash: 0 },
    ],
    crystals: [
      { id: 1, x: 400, y: 300, radius: 16, hue: 190, lit: false, charge: 0 },
      { id: 2, x: 400, y: 92, radius: 16, hue: 48, lit: false, charge: 0 },
      { id: 3, x: 515, y: 390, radius: 16, hue: 280, lit: false, charge: 0 },
      { id: 4, x: 630, y: 260, radius: 16, hue: 155, lit: false, charge: 0 },
      { id: 5, x: 630, y: 65, radius: 16, hue: 335, lit: false, charge: 0 },
      { id: 6, x: 475, y: 130, radius: 16, hue: 25, lit: false, charge: 0 },
      { id: 7, x: 170, y: 295, radius: 16, hue: 95, lit: false, charge: 0 },
      { id: 8, x: 325, y: 470, radius: 16, hue: 225, lit: false, charge: 0 },
      { id: 9, x: 540, y: 275, radius: 16, hue: 310, lit: false, charge: 0 },
      { id: 10, x: 255, y: 325, radius: 17, hue: 175, lit: false, charge: 0 },
    ],
  };
}

export function createPrismLaserWorld(
  level = 1,
  keepScore = 0,
  keepMaxCombo = 0,
  solvedLevels: number[] = []
): PrismLaserWorld {
  const data = buildLaserLevel(level);
  const world: PrismLaserWorld = {
    ...data,
    segments: [],
    particles: [],
    waves: [],
    floatingTexts: [],
    level,
    solvedLevels: [...solvedLevels],
    autoRotate: false,
    draggingMirrorId: null,
    dragStartPointerAngle: 0,
    dragStartMirrorAngle: 0,
    dragMoved: false,
    hoveredMirrorId: null,
    score: keepScore,
    combo: 0,
    maxCombo: keepMaxCombo,
    clearTimer: 0,
    time: 0,
  };
  traceLaserBeams(world);
  return world;
}

function raySegmentIntersect(
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): { t: number; x: number; y: number; nx: number; ny: number } | null {
  const sx = x2 - x1;
  const sy = y2 - y1;
  const denom = dx * sy - dy * sx;
  if (Math.abs(denom) < 1e-6) return null;

  const qpx = x1 - ox;
  const qpy = y1 - oy;
  const t = (qpx * sy - qpy * sx) / denom;
  const u = (qpx * dy - qpy * dx) / denom;

  if (t > 4 && u >= 0 && u <= 1) {
    const len = Math.hypot(sx, sy) || 1;
    let nx = -sy / len;
    let ny = sx / len;
    if (dx * nx + dy * ny > 0) {
      nx = -nx;
      ny = -ny;
    }
    return { t, x: ox + dx * t, y: oy + dy * t, nx, ny };
  }
  return null;
}

function rayCircleIntersect(
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  cx: number,
  cy: number,
  r: number
): number | null {
  const fx = ox - cx;
  const fy = oy - cy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - r * r;
  const disc = b * b - 4 * c;
  if (disc < 0) return null;
  const sqrtD = Math.sqrt(disc);
  const t1 = (-b - sqrtD) / 2;
  const t2 = (-b + sqrtD) / 2;
  if (t1 > 4) return t1;
  if (t2 > 4) return t2;
  return null;
}

export function traceLaserBeams(world: PrismLaserWorld) {
  world.segments = [];
  for (const c of world.crystals) {
    c.lit = false;
  }

  interface RayTask {
    ox: number;
    oy: number;
    dx: number;
    dy: number;
    hue: number;
    depth: number;
  }

  const queue: RayTask[] = [
    {
      ox: world.emitterX,
      oy: world.emitterY,
      dx: Math.cos(world.emitterAngle),
      dy: Math.sin(world.emitterAngle),
      hue: 188,
      depth: 0,
    },
  ];

  let safety = 0;
  while (queue.length > 0 && safety < 42) {
    safety++;
    const ray = queue.shift()!;
    if (ray.depth > 14) continue;

    let bestT = 2000;
    let hitMirror: LaserMirror | null = null;
    let hitNormal = { nx: 0, ny: 0 };

    const walls = [
      [20, 20, ARENA_WIDTH - 20, 20],
      [ARENA_WIDTH - 20, 20, ARENA_WIDTH - 20, ARENA_HEIGHT - 20],
      [ARENA_WIDTH - 20, ARENA_HEIGHT - 20, 20, ARENA_HEIGHT - 20],
      [20, ARENA_HEIGHT - 20, 20, 20],
    ];
    for (const [wx1, wy1, wx2, wy2] of walls) {
      const hit = raySegmentIntersect(ray.ox, ray.oy, ray.dx, ray.dy, wx1, wy1, wx2, wy2);
      if (hit && hit.t < bestT) {
        bestT = hit.t;
      }
    }

    for (const m of world.mirrors) {
      const half = m.length / 2;
      const mx1 = m.x - Math.cos(m.angle) * half;
      const my1 = m.y - Math.sin(m.angle) * half;
      const mx2 = m.x + Math.cos(m.angle) * half;
      const my2 = m.y + Math.sin(m.angle) * half;
      const hit = raySegmentIntersect(ray.ox, ray.oy, ray.dx, ray.dy, mx1, my1, mx2, my2);
      if (hit && hit.t < bestT) {
        bestT = hit.t;
        hitMirror = m;
        hitNormal = { nx: hit.nx, ny: hit.ny };
      }
    }

    for (const c of world.crystals) {
      const ct = rayCircleIntersect(ray.ox, ray.oy, ray.dx, ray.dy, c.x, c.y, c.radius + 3);
      if (ct !== null && ct < bestT) {
        c.lit = true;
      }
    }

    const endX = ray.ox + ray.dx * bestT;
    const endY = ray.oy + ray.dy * bestT;
    world.segments.push({
      x1: ray.ox,
      y1: ray.oy,
      x2: endX,
      y2: endY,
      hue: ray.hue,
      depth: ray.depth,
    });

    if (hitMirror) {
      hitMirror.hitFlash = Math.max(hitMirror.hitFlash, 0.4);
      const dot = ray.dx * hitNormal.nx + ray.dy * hitNormal.ny;
      const rx = ray.dx - 2 * dot * hitNormal.nx;
      const ry = ray.dy - 2 * dot * hitNormal.ny;
      queue.push({
        ox: endX,
        oy: endY,
        dx: rx,
        dy: ry,
        hue: (ray.hue + 40) % 360,
        depth: ray.depth + 1,
      });

      if (hitMirror.kind === 'splitter') {
        queue.push({
          ox: endX + ray.dx * 4,
          oy: endY + ray.dy * 4,
          dx: ray.dx,
          dy: ray.dy,
          hue: (ray.hue + 145) % 360,
          depth: ray.depth + 1,
        });
      }
    }
  }
}

export function startLaserDragAt(
  world: PrismLaserWorld,
  x: number,
  y: number
) {
  let closest: LaserMirror | null = null;
  let bestD = 46;
  for (const m of world.mirrors) {
    const d = Math.hypot(m.x - x, m.y - y);
    if (d < bestD) {
      bestD = d;
      closest = m;
    }
  }

  if (closest) {
    world.draggingMirrorId = closest.id;
    world.dragStartPointerAngle = Math.atan2(y - closest.y, x - closest.x);
    world.dragStartMirrorAngle = closest.angle;
    world.dragMoved = false;
    return;
  }

  // Otherwise aim emitter toward click!
  world.draggingMirrorId = null;
  world.emitterAngle = Math.atan2(y - world.emitterY, x - world.emitterX);
  soundEngine.playPegHit(1, false);
  traceLaserBeams(world);
}

export function moveLaserDragAt(
  world: PrismLaserWorld,
  x: number,
  y: number
) {
  let hovered: LaserMirror | null = null;
  let bestD = 44;
  for (const m of world.mirrors) {
    const d = Math.hypot(m.x - x, m.y - y);
    if (d < bestD) {
      bestD = d;
      hovered = m;
    }
  }
  world.hoveredMirrorId = hovered ? hovered.id : null;

  if (world.draggingMirrorId === null) return;
  const mirror = world.mirrors.find((m) => m.id === world.draggingMirrorId);
  if (!mirror) return;

  const dist = Math.hypot(x - mirror.x, y - mirror.y);
  if (dist < 10) return;

  const curAngle = Math.atan2(y - mirror.y, x - mirror.x);
  let delta = curAngle - world.dragStartPointerAngle;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;

  if (Math.abs(delta) > 0.04) {
    world.dragMoved = true;
    const raw = world.dragStartMirrorAngle + delta;
    // Soft magnetic snap to 7.5-degree increments so aiming is both fluid AND laser-accurate!
    const snap = Math.PI / 24;
    mirror.angle = Math.round(raw / snap) * snap;
    mirror.hitFlash = 0.85;
    traceLaserBeams(world);
  }
}

export function endLaserDragAt(
  world: PrismLaserWorld,
  reducedMotion: boolean
) {
  if (world.draggingMirrorId === null) return;
  const mirror = world.mirrors.find((m) => m.id === world.draggingMirrorId);
  const wasClick = !world.dragMoved;
  world.draggingMirrorId = null;

  if (mirror && wasClick) {
    // Crisp 15-degree rotation per click
    mirror.angle = Math.round((mirror.angle + DEG15) / DEG15) * DEG15;
    mirror.hitFlash = 1;
    soundEngine.playPegHit(3, false);
    if (!reducedMotion) {
      world.waves.push({
        x: mirror.x,
        y: mirror.y,
        radius: 10,
        maxRadius: 46,
        color: mirror.kind === 'splitter' ? '#F472B6' : '#38BDF8',
        alpha: 0.85,
      });
    }
    traceLaserBeams(world);
  }

  const litCount = world.crystals.filter((c) => c.lit).length;
  if (litCount > 0) {
    world.combo = litCount;
    if (world.combo > world.maxCombo) world.maxCombo = world.combo;
    world.score += litCount * 40;
  }
}

export function stepPrismLaserWorld(
  world: PrismLaserWorld,
  dt: number,
  autoRotate: boolean,
  reducedMotion: boolean
): { levelJustCleared?: number } {
  world.time += dt;
  world.autoRotate = autoRotate;
  let levelJustCleared: number | undefined;

  if (autoRotate && world.clearTimer <= 0) {
    world.emitterAngle += dt * 0.45;
    for (let i = 0; i < world.mirrors.length; i++) {
      world.mirrors[i].angle += (i % 2 === 0 ? 1 : -1) * dt * 0.25;
    }
    traceLaserBeams(world);
  }

  for (const m of world.mirrors) {
    if (m.hitFlash > 0) m.hitFlash = Math.max(0, m.hitFlash - dt * 2.5);
  }

  for (const c of world.crystals) {
    if (c.lit) {
      const wasReady = c.charge >= 1;
      c.charge = Math.min(1, c.charge + dt * 2.8);
      if (!wasReady && c.charge >= 1) {
        soundEngine.playPegHit(c.id + 4, true);
        world.score += 300;
        const count = reducedMotion ? 4 : 14;
        for (let i = 0; i < count; i++) {
          const a = (i / count) * Math.PI * 2;
          world.particles.push({
            x: c.x,
            y: c.y,
            vx: Math.cos(a) * 145,
            vy: Math.sin(a) * 145,
            radius: 2.6,
            color: `hsl(${c.hue}, 95%, 70%)`,
            alpha: 1,
            decay: 1.4,
          });
        }
      }
    } else {
      c.charge = Math.max(0, c.charge - dt * 1.4);
    }
  }

  if (
    world.crystals.length > 0 &&
    world.crystals.every((c) => c.charge >= 0.99) &&
    world.clearTimer <= 0
  ) {
    world.clearTimer = 1.8;
    const stageNum = ((world.level - 1) % LASER_LEVEL_NAMES.length) + 1;
    if (!world.solvedLevels.includes(stageNum)) {
      world.solvedLevels.push(stageNum);
    }
    levelJustCleared = stageNum;
    soundEngine.playStageClear();
    world.score += 1500;
    world.waves.push({
      x: ARENA_WIDTH / 2,
      y: ARENA_HEIGHT / 2,
      radius: 20,
      maxRadius: 115,
      color: '#67E8F9',
      alpha: 0.5,
    });
    world.floatingTexts.push({
      x: ARENA_WIDTH / 2,
      y: ARENA_HEIGHT / 2 - 16,
      vy: -18,
      text: `Stage 0${stageNum} Clear +1500`,
      color: '#67E8F9',
      alpha: 0.95,
      scale: 1.0,
    });
  }

  if (world.clearTimer > 0) {
    world.clearTimer -= dt;
    if (world.clearTimer <= 0) {
      const next = createPrismLaserWorld(
        world.level + 1,
        world.score,
        world.maxCombo,
        world.solvedLevels
      );
      next.autoRotate = world.autoRotate;
      Object.assign(world, next);
      return { levelJustCleared };
    }
  }

  for (let i = world.particles.length - 1; i >= 0; i--) {
    const p = world.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.alpha -= p.decay * dt;
    if (p.alpha <= 0) world.particles.splice(i, 1);
  }
  for (let i = world.waves.length - 1; i >= 0; i--) {
    const w = world.waves[i];
    w.radius += 170 * dt;
    w.alpha -= dt * 1.6;
    if (w.alpha <= 0) world.waves.splice(i, 1);
  }
  for (let i = world.floatingTexts.length - 1; i >= 0; i--) {
    const ft = world.floatingTexts[i];
    ft.y += ft.vy * dt;
    ft.alpha -= dt * 0.75;
    if (ft.alpha <= 0) world.floatingTexts.splice(i, 1);
  }

  return { levelJustCleared };
}

export function renderPrismLaserWorld(
  ctx: CanvasRenderingContext2D,
  world: PrismLaserWorld,
  zenMode = false
) {
  ctx.save();

  const bg = ctx.createRadialGradient(
    ARENA_WIDTH / 2,
    ARENA_HEIGHT / 2,
    30,
    ARENA_WIDTH / 2,
    ARENA_HEIGHT / 2,
    470
  );
  bg.addColorStop(0, '#0F1F38');
  bg.addColorStop(1, '#070B16');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, ARENA_WIDTH - 36, ARENA_HEIGHT - 28);

  // Laser Beam Segments
  for (const s of world.segments) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = `hsla(${s.hue}, 95%, 62%, 0.45)`;
    ctx.shadowColor = `hsl(${s.hue}, 95%, 65%)`;
    ctx.shadowBlur = 16;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(s.x1, s.y1);
    ctx.lineTo(s.x2, s.y2);
    ctx.stroke();

    ctx.strokeStyle = '#FFFFFF';
    ctx.shadowBlur = 0;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(s.x1, s.y1);
    ctx.lineTo(s.x2, s.y2);
    ctx.stroke();
    ctx.restore();
  }

  // Crystals
  for (const c of world.crystals) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(world.time * (c.lit ? 2.2 : 0.6));
    const r = c.radius;
    ctx.fillStyle = c.lit
      ? `hsl(${c.hue}, 95%, 65%)`
      : `hsla(${c.hue}, 60%, 35%, 0.45)`;
    ctx.strokeStyle = c.lit ? '#FFFFFF' : `hsl(${c.hue}, 80%, 60%)`;
    ctx.lineWidth = 2.4;
    ctx.shadowColor = `hsl(${c.hue}, 95%, 65%)`;
    ctx.shadowBlur = c.lit ? 20 : 8;

    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.85, 0);
    ctx.lineTo(0, r);
    ctx.lineTo(-r * 0.85, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (c.charge > 0.05) {
      ctx.rotate(-world.time * (c.lit ? 2.2 : 0.6));
      ctx.strokeStyle = c.charge >= 0.99 ? '#34D399' : '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, r + 6, -Math.PI / 2, -Math.PI / 2 + c.charge * Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Mirrors & Splitters
  for (const m of world.mirrors) {
    const isActive =
      world.draggingMirrorId === m.id || world.hoveredMirrorId === m.id;
    const half = m.length / 2;
    const x1 = m.x - Math.cos(m.angle) * half;
    const y1 = m.y - Math.sin(m.angle) * half;
    const x2 = m.x + Math.cos(m.angle) * half;
    const y2 = m.y + Math.sin(m.angle) * half;

    ctx.save();
    if (isActive) {
      ctx.strokeStyle =
        m.kind === 'splitter'
          ? 'rgba(244, 114, 182, 0.35)'
          : 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(m.x, m.y, half + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.strokeStyle =
      m.kind === 'splitter'
        ? '#F472B6'
        : m.hitFlash > 0.2
        ? '#FFFFFF'
        : '#7DD3FC';
    ctx.shadowColor = m.kind === 'splitter' ? '#F472B6' : '#38BDF8';
    ctx.shadowBlur = isActive ? 18 : 12;
    ctx.lineWidth = isActive ? 7.5 : 6.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.fillStyle = m.kind === 'splitter' ? '#FCE7F3' : '#E0F2FE';
    ctx.beginPath();
    ctx.arc(m.x, m.y, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Emitter Cannon
  ctx.save();
  ctx.translate(world.emitterX, world.emitterY);
  ctx.rotate(world.emitterAngle);
  ctx.fillStyle = '#0EA5E9';
  ctx.strokeStyle = '#E0F2FE';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#38BDF8';
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.roundRect(-14, -10, 32, 20, 6);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  for (const w of world.waves) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, w.alpha);
    ctx.strokeStyle = w.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  for (const p of world.particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  for (const ft of world.floatingTexts) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, ft.alpha);
    ctx.font = '700 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }

  // Clear celebration banner inside canvas when stage is completed
  if (world.clearTimer > 0) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.84)';
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(ARENA_WIDTH / 2 - 190, 36, 380, 56, 12);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#67E8F9';
    ctx.fillText(
      zenMode
        ? 'Prism Harmonized · Next Pattern'
        : `Stage ${((world.level - 1) % LASER_LEVEL_NAMES.length) + 1} Cleared · Loading Next Prism`,
      ARENA_WIDTH / 2,
      69
    );
    ctx.restore();
  }

  ctx.restore();
}
