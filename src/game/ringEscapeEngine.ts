import { soundEngine } from '../audio/soundEngine';
import { ARENA_HEIGHT, ARENA_WIDTH } from './stages';
import {
  FloatingText,
  Particle,
  RingEscapeSettings,
  RingLevelPreset,
  RingWave,
} from './types';

export interface ConcentricRing {
  id: number;
  baseRadius: number;
  radius: number;
  thickness: number;
  angle: number;
  spinSpeed: number;
  gapSize: number;
  gapCount: number;
  color: string;
  broken: boolean;
  hitFlash: number;
  pulseAngle: number;
  pulseAlpha: number;
}

export interface RingBall {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
  trail: Array<{ x: number; y: number }>;
  bounces: number;
}

export interface RingEscapeWorld {
  rings: ConcentricRing[];
  balls: RingBall[];
  particles: Particle[];
  waves: RingWave[];
  floatingTexts: FloatingText[];
  centerX: number;
  centerY: number;
  playerAngleOffset: number;
  targetAngleOffset: number;
  level: number;
  preset: RingLevelPreset;
  score: number;
  combo: number;
  maxCombo: number;
  recentEscapeCount: number;
  recentEscapeTimer: number;
  slowMoTimer: number;
  shakeAmount: number;
  levelClearTimer: number;
  clockTickTimer: number;
  eyeAngle: number;
  nextId: number;
  time: number;
}

export const RING_LEVEL_CATALOG: Array<{
  id: RingLevelPreset;
  label: string;
  tag: 'Classic' | 'Creepy' | 'ASMR' | 'Extreme';
}> = [
  { id: 'CLASSIC', label: '01. Classic 6-Ring', tag: 'Classic' },
  { id: 'MEGA10', label: '02. Mega 10-Ring', tag: 'Classic' },
  { id: 'TORNADO', label: '03. Tornado Spin', tag: 'Classic' },
  { id: 'CHAOS5', label: '04. 5-Ball Chaos', tag: 'Classic' },
  { id: 'DOUBLE_GAP', label: '05. Dual-Gate Spin', tag: 'Classic' },
  { id: 'GALAXY_SWIRL', label: '06. Galaxy Swirl 8x', tag: 'ASMR' },
  { id: 'BLACKHOLE', label: '07. 12-Ring Extreme', tag: 'Extreme' },
  { id: 'HYPER20', label: '08. 20-Ball Hypernova', tag: 'Extreme' },
  { id: 'PHANTOM_PULSE', label: '09. Phantom Pulse', tag: 'Creepy' },
  { id: 'BLOOD_MOON', label: '10. Blood Moon Eclipse', tag: 'Creepy' },
  { id: 'SPIDER_WEB', label: '11. Spider Web Trap', tag: 'Creepy' },
  { id: 'CURSED_CLOCK', label: '12. Cursed Clockwork', tag: 'Creepy' },
  { id: 'SHADOW_EYE', label: '13. Watching Eye', tag: 'Creepy' },
  { id: 'HAUNTED_ECHO', label: '14. Haunted Echo', tag: 'Creepy' },
  { id: 'CRYSTAL_RAIN', label: '15. Crystal ASMR Rain', tag: 'ASMR' },
  { id: 'VELVET_ASMR', label: '16. Velvet Mandala', tag: 'ASMR' },
  { id: 'NEON_SERPENT', label: '17. Neon Serpent Coil', tag: 'ASMR' },
  { id: 'VOID_VORTEX', label: '18. Void Whisper', tag: 'Creepy' },
  { id: 'MIRROR_MAZE', label: '19. Shattered Mirror', tag: 'Creepy' },
  { id: 'CURSED_PENDULUM', label: '20. Cursed Pendulum', tag: 'Creepy' },
  { id: 'WHISPER_CHAMBER', label: '21. Whisper Chamber', tag: 'Creepy' },
  { id: 'AMBER_SANCTUARY', label: '22. Amber Sanctuary', tag: 'ASMR' },
  { id: 'PRISM_CITADEL', label: '23. Prism Citadel', tag: 'ASMR' },
  { id: 'ABYSS_30', label: '24. 30-Ball Abyss Extreme', tag: 'Extreme' },
  { id: 'VIRAL_25', label: '25. 25-Ring Rainbow Tunnel', tag: 'ASMR' },
  { id: 'TIKTOK_35', label: '26. 35-Ring Viral Spiral', tag: 'Extreme' },
  { id: 'PINHOLE_SNIPER', label: '27. Tiny Pinholes', tag: 'Extreme' },
  { id: 'TRIPLE_TORNADO', label: '28. Triple-Gap Tornado', tag: 'Extreme' },
  { id: 'NEON_PULSE_20', label: '29. 20-Ring Neon Pulse', tag: 'ASMR' },
  { id: 'PHANTOM_30', label: '30. 30-Ring Phantom Abyss', tag: 'Creepy' },
  { id: 'GAUNTLET_40', label: '31. 40-Ring Gauntlet', tag: 'Extreme' },
  { id: 'RAINBOW_50', label: '32. 50-Ring Rainbow Core', tag: 'ASMR' },
];

const RING_PALETTE = [
  '#F59E0B',
  '#10B981',
  '#38BDF8',
  '#A78BFA',
  '#FB7185',
  '#22D3EE',
  '#FBBF24',
  '#34D399',
  '#818CF8',
  '#F472B6',
];

const CREEPY_PALETTES: Partial<Record<RingLevelPreset, string[]>> = {
  PHANTOM_PULSE: ['#5EEAD4', '#2DD4BF', '#94A3B8', '#A78BFA', '#67E8F9'],
  BLOOD_MOON: ['#DC2626', '#FB7185', '#F97316', '#991B1B', '#FBBF24'],
  SPIDER_WEB: ['#E2E8F0', '#94A3B8', '#A78BFA', '#C084FC', '#F472B6'],
  CURSED_CLOCK: ['#D97706', '#FBBF24', '#10B981', '#78350F', '#F59E0B'],
  SHADOW_EYE: ['#E11D48', '#A855F7', '#F43F5E', '#7C3AED', '#FBBF24'],
  HAUNTED_ECHO: ['#2DD4BF', '#818CF8', '#94A3B8', '#38BDF8', '#C084FC'],
  CRYSTAL_RAIN: ['#67E8F9', '#F9A8D4', '#A7F3D0', '#BAE6FD', '#DDD6FE'],
  VELVET_ASMR: ['#F472B6', '#C084FC', '#60A5FA', '#34D399', '#FBBF24'],
  NEON_SERPENT: ['#22C55E', '#10B981', '#22D3EE', '#A3E635', '#34D399'],
  VOID_VORTEX: ['#7C3AED', '#6366F1', '#EC4899', '#4C1D95', '#38BDF8'],
  MIRROR_MAZE: ['#E2E8F0', '#38BDF8', '#FB7185', '#BAE6FD', '#F472B6'],
  CURSED_PENDULUM: ['#FB923C', '#F59E0B', '#991B1B', '#E11D48', '#FDE047'],
  WHISPER_CHAMBER: ['#94A3B8', '#64748B', '#818CF8', '#2DD4BF', '#C084FC'],
  AMBER_SANCTUARY: ['#FDE047', '#FBBF24', '#F59E0B', '#34D399', '#FDBA74'],
  PRISM_CITADEL: ['#38BDF8', '#22D3EE', '#A78BFA', '#F472B6', '#5EEAD4'],
  ABYSS_30: ['#DC2626', '#9333EA', '#EC4899', '#38BDF8', '#F59E0B'],
  VIRAL_25: ['#F43F5E', '#FB923C', '#FACC15', '#34D399', '#38BDF8', '#A78BFA'],
  TIKTOK_35: ['#22D3EE', '#F472B6', '#FBBF24', '#34D399', '#818CF8'],
  PINHOLE_SNIPER: ['#FDE047', '#FB7185', '#38BDF8', '#34D399', '#F97316'],
  TRIPLE_TORNADO: ['#38BDF8', '#10B981', '#F59E0B', '#EC4899', '#A855F7'],
  NEON_PULSE_20: ['#2DD4BF', '#22D3EE', '#A855F7', '#F472B6', '#FACC15'],
  PHANTOM_30: ['#94A3B8', '#5EEAD4', '#6366F1', '#DC2626', '#CBD5E1'],
  GAUNTLET_40: ['#FB7185', '#F97316', '#FACC15', '#22D3EE', '#A855F7'],
  RAINBOW_50: ['#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6', '#A855F7', '#EC4899'],
};

const EERIE_PRESETS = new Set<RingLevelPreset>([
  'PHANTOM_PULSE',
  'BLOOD_MOON',
  'SPIDER_WEB',
  'CURSED_CLOCK',
  'SHADOW_EYE',
  'HAUNTED_ECHO',
  'VOID_VORTEX',
  'MIRROR_MAZE',
  'CURSED_PENDULUM',
  'WHISPER_CHAMBER',
  'ABYSS_30',
  'PHANTOM_30',
]);

function normalizeAngle(a: number): number {
  let res = a % (Math.PI * 2);
  if (res < 0) res += Math.PI * 2;
  return res;
}

function isAngleInGap(angle: number, gapCenter: number, gapHalf: number): boolean {
  const diff = Math.abs(
    normalizeAngle(angle - gapCenter + Math.PI) - Math.PI
  );
  return diff < gapHalf;
}

function isAngleInAnyGap(
  angle: number,
  gapCenter: number,
  gapHalf: number,
  gapCount: number
): boolean {
  const step = (Math.PI * 2) / gapCount;
  for (let g = 0; g < gapCount; g++) {
    if (isAngleInGap(angle, gapCenter + g * step, gapHalf)) {
      return true;
    }
  }
  return false;
}

interface PresetSpec {
  ringCount: number;
  startR: number;
  stepR: number;
  thickness: number;
  speedScale: number;
  gapSizeBase: number;
  gapCount: number;
  ballCount: number;
  ballRadius: number;
  ballSpeed: number;
  fibonacciPhase?: boolean;
}

function getPresetSpec(preset: RingLevelPreset, megaTenRings: boolean): PresetSpec {
  switch (preset) {
    case 'RAINBOW_50':
      return {
        ringCount: 50,
        startR: 28,
        stepR: 5.25,
        thickness: 2.3,
        speedScale: 0.92,
        gapSizeBase: 0.84,
        gapCount: 2,
        ballCount: 8,
        ballRadius: 5.2,
        ballSpeed: 235,
        fibonacciPhase: true,
      };
    case 'GAUNTLET_40':
      return {
        ringCount: 40,
        startR: 30,
        stepR: 6.5,
        thickness: 2.8,
        speedScale: 1.38,
        gapSizeBase: 0.72,
        gapCount: 2,
        ballCount: 12,
        ballRadius: 5.8,
        ballSpeed: 265,
      };
    case 'TIKTOK_35':
      return {
        ringCount: 35,
        startR: 32,
        stepR: 7.4,
        thickness: 3.1,
        speedScale: 1.28,
        gapSizeBase: 0.78,
        gapCount: 1,
        ballCount: 6,
        ballRadius: 6,
        ballSpeed: 255,
        fibonacciPhase: true,
      };
    case 'PHANTOM_30':
      return {
        ringCount: 30,
        startR: 34,
        stepR: 8.6,
        thickness: 3.4,
        speedScale: 1.16,
        gapSizeBase: 0.74,
        gapCount: 2,
        ballCount: 8,
        ballRadius: 6.4,
        ballSpeed: 245,
      };
    case 'VIRAL_25':
      return {
        ringCount: 25,
        startR: 36,
        stepR: 10.2,
        thickness: 4.1,
        speedScale: 0.98,
        gapSizeBase: 0.88,
        gapCount: 1,
        ballCount: 10,
        ballRadius: 6.5,
        ballSpeed: 240,
        fibonacciPhase: true,
      };
    case 'NEON_PULSE_20':
      return {
        ringCount: 20,
        startR: 38,
        stepR: 12.6,
        thickness: 4.8,
        speedScale: 1.05,
        gapSizeBase: 0.86,
        gapCount: 2,
        ballCount: 12,
        ballRadius: 6.8,
        ballSpeed: 238,
      };
    case 'TRIPLE_TORNADO':
      return {
        ringCount: 16,
        startR: 40,
        stepR: 15.6,
        thickness: 5.5,
        speedScale: 1.82,
        gapSizeBase: 0.64,
        gapCount: 3,
        ballCount: 7,
        ballRadius: 7.2,
        ballSpeed: 275,
      };
    case 'PINHOLE_SNIPER':
      return {
        ringCount: 14,
        startR: 44,
        stepR: 17.5,
        thickness: 6,
        speedScale: 1.15,
        gapSizeBase: 0.48,
        gapCount: 1,
        ballCount: 5,
        ballRadius: 6.8,
        ballSpeed: 265,
      };
    case 'ABYSS_30':
      return {
        ringCount: 15,
        startR: 42,
        stepR: 16.5,
        thickness: 5.5,
        speedScale: 1.45,
        gapSizeBase: 0.72,
        gapCount: 2,
        ballCount: 30,
        ballRadius: 6.2,
        ballSpeed: 270,
      };
    case 'VELVET_ASMR':
      return {
        ringCount: 14,
        startR: 44,
        stepR: 17.5,
        thickness: 5.5,
        speedScale: 0.88,
        gapSizeBase: 0.85,
        gapCount: 1,
        ballCount: 6,
        ballRadius: 7.5,
        ballSpeed: 235,
        fibonacciPhase: true,
      };
    case 'VOID_VORTEX':
      return {
        ringCount: 13,
        startR: 44,
        stepR: 19,
        thickness: 6,
        speedScale: 1.65,
        gapSizeBase: 0.66,
        gapCount: 3,
        ballCount: 5,
        ballRadius: 7.5,
        ballSpeed: 275,
      };
    case 'BLACKHOLE':
      return {
        ringCount: 12,
        startR: 46,
        stepR: 20.5,
        thickness: 6,
        speedScale: 2.1,
        gapSizeBase: 0.78,
        gapCount: 1,
        ballCount: 3,
        ballRadius: 8.5,
        ballSpeed: 285,
      };
    case 'SPIDER_WEB':
      return {
        ringCount: 11,
        startR: 48,
        stepR: 22,
        thickness: 6,
        speedScale: 1.32,
        gapSizeBase: 0.68,
        gapCount: 2,
        ballCount: 4,
        ballRadius: 7.8,
        ballSpeed: 255,
      };
    case 'CRYSTAL_RAIN':
      return {
        ringCount: 10,
        startR: 52,
        stepR: 24,
        thickness: 6.5,
        speedScale: 0.92,
        gapSizeBase: 0.96,
        gapCount: 2,
        ballCount: 12,
        ballRadius: 7.2,
        ballSpeed: 225,
      };
    case 'NEON_SERPENT':
      return {
        ringCount: 10,
        startR: 52,
        stepR: 24,
        thickness: 7,
        speedScale: 1.48,
        gapSizeBase: 0.64,
        gapCount: 3,
        ballCount: 10,
        ballRadius: 7.2,
        ballSpeed: 255,
        fibonacciPhase: true,
      };
    case 'HYPER20':
      return {
        ringCount: 10,
        startR: 58,
        stepR: 24,
        thickness: 7,
        speedScale: 1.35,
        gapSizeBase: 0.88,
        gapCount: 1,
        ballCount: 20,
        ballRadius: 7,
        ballSpeed: 250,
      };
    case 'MEGA10':
      return {
        ringCount: 10,
        startR: 58,
        stepR: 24,
        thickness: 7,
        speedScale: 1.0,
        gapSizeBase: 0.88,
        gapCount: 1,
        ballCount: 1,
        ballRadius: 8.5,
        ballSpeed: 245,
      };
    case 'BLOOD_MOON':
      return {
        ringCount: 9,
        startR: 56,
        stepR: 26,
        thickness: 7.5,
        speedScale: 1.55,
        gapSizeBase: 0.82,
        gapCount: 1,
        ballCount: 4,
        ballRadius: 8.2,
        ballSpeed: 265,
      };
    case 'MIRROR_MAZE':
      return {
        ringCount: 9,
        startR: 56,
        stepR: 26,
        thickness: 7.5,
        speedScale: 1.38,
        gapSizeBase: 0.78,
        gapCount: 2,
        ballCount: 4,
        ballRadius: 8,
        ballSpeed: 250,
      };
    case 'GALAXY_SWIRL':
      return {
        ringCount: 9,
        startR: 54,
        stepR: 27,
        thickness: 8,
        speedScale: 1.55,
        gapSizeBase: 0.9,
        gapCount: 1,
        ballCount: 8,
        ballRadius: 8,
        ballSpeed: 250,
      };
    case 'SHADOW_EYE':
      return {
        ringCount: 8,
        startR: 64,
        stepR: 28,
        thickness: 8,
        speedScale: 1.28,
        gapSizeBase: 0.84,
        gapCount: 2,
        ballCount: 4,
        ballRadius: 8.2,
        ballSpeed: 250,
      };
    case 'CURSED_CLOCK':
      return {
        ringCount: 8,
        startR: 60,
        stepR: 29,
        thickness: 8.5,
        speedScale: 1.15,
        gapSizeBase: 0.86,
        gapCount: 1,
        ballCount: 3,
        ballRadius: 8.5,
        ballSpeed: 245,
      };
    case 'HAUNTED_ECHO':
      return {
        ringCount: 8,
        startR: 62,
        stepR: 29,
        thickness: 7.5,
        speedScale: 0.84,
        gapSizeBase: 0.92,
        gapCount: 1,
        ballCount: 3,
        ballRadius: 8.5,
        ballSpeed: 225,
      };
    case 'DOUBLE_GAP':
      return {
        ringCount: 8,
        startR: 60,
        stepR: 30,
        thickness: 8.5,
        speedScale: 1.1,
        gapSizeBase: 0.82,
        gapCount: 2,
        ballCount: 4,
        ballRadius: 8.5,
        ballSpeed: 245,
      };
    case 'PHANTOM_PULSE':
      return {
        ringCount: 7,
        startR: 66,
        stepR: 32,
        thickness: 8,
        speedScale: 1.08,
        gapSizeBase: 0.9,
        gapCount: 1,
        ballCount: 3,
        ballRadius: 8.5,
        ballSpeed: 240,
      };
    case 'CURSED_PENDULUM':
      return {
        ringCount: 11,
        startR: 48,
        stepR: 22,
        thickness: 6.5,
        speedScale: 1.24,
        gapSizeBase: 0.78,
        gapCount: 2,
        ballCount: 5,
        ballRadius: 7.8,
        ballSpeed: 245,
        fibonacciPhase: true,
      };
    case 'WHISPER_CHAMBER':
      return {
        ringCount: 12,
        startR: 46,
        stepR: 20,
        thickness: 6,
        speedScale: 0.95,
        gapSizeBase: 0.82,
        gapCount: 1,
        ballCount: 4,
        ballRadius: 8,
        ballSpeed: 220,
      };
    case 'AMBER_SANCTUARY':
      return {
        ringCount: 10,
        startR: 52,
        stepR: 24,
        thickness: 6.5,
        speedScale: 0.86,
        gapSizeBase: 0.94,
        gapCount: 2,
        ballCount: 9,
        ballRadius: 7.5,
        ballSpeed: 215,
        fibonacciPhase: true,
      };
    case 'PRISM_CITADEL':
      return {
        ringCount: 12,
        startR: 46,
        stepR: 20.5,
        thickness: 6,
        speedScale: 1.18,
        gapSizeBase: 0.84,
        gapCount: 3,
        ballCount: 14,
        ballRadius: 7,
        ballSpeed: 235,
      };
    case 'TORNADO':
      return {
        ringCount: 7,
        startR: 70,
        stepR: 34,
        thickness: 9,
        speedScale: 1.75,
        gapSizeBase: 0.92,
        gapCount: 1,
        ballCount: 1,
        ballRadius: 8.5,
        ballSpeed: 255,
      };
    case 'CHAOS5':
      return {
        ringCount: megaTenRings ? 10 : 6,
        startR: megaTenRings ? 58 : 78,
        stepR: megaTenRings ? 24 : 38,
        thickness: megaTenRings ? 7 : 9.5,
        speedScale: 1.0,
        gapSizeBase: 0.94,
        gapCount: 1,
        ballCount: 5,
        ballRadius: 8.5,
        ballSpeed: 245,
      };
    case 'CLASSIC':
    default:
      return {
        ringCount: megaTenRings ? 10 : 6,
        startR: megaTenRings ? 58 : 78,
        stepR: megaTenRings ? 24 : 38,
        thickness: megaTenRings ? 7 : 9.5,
        speedScale: 1.0,
        gapSizeBase: megaTenRings ? 0.88 : 0.94,
        gapCount: 1,
        ballCount: 1,
        ballRadius: 8.5,
        ballSpeed: 245,
      };
  }
}

export function createRingEscapeWorld(
  level = 1,
  keepScore = 0,
  keepMaxCombo = 0,
  megaTenRings = false,
  preset: RingLevelPreset = 'CLASSIC',
  customRingCount = 0
): RingEscapeWorld {
  const centerX = ARENA_WIDTH / 2;
  const centerY = ARENA_HEIGHT / 2;
  const spec = getPresetSpec(preset, megaTenRings);
  const palette = CREEPY_PALETTES[preset] ?? RING_PALETTE;
  const rings: ConcentricRing[] = [];

  const ringCount =
    customRingCount && customRingCount >= 3
      ? Math.min(60, Math.round(customRingCount))
      : spec.ringCount;
  const useAutoFit = customRingCount >= 3;
  const startR = useAutoFit ? (ringCount > 24 ? 26 : 36) : spec.startR;
  const maxOuter = 285;
  const stepR = useAutoFit
    ? (maxOuter - startR) / Math.max(1, ringCount - 1)
    : spec.stepR;
  const thickness = useAutoFit
    ? Math.max(2.1, Math.min(9.5, stepR * 0.44))
    : spec.thickness;
  const ballRadius = useAutoFit
    ? Math.max(4.8, Math.min(spec.ballRadius, stepR * 0.65))
    : spec.ballRadius;

  for (let i = 0; i < ringCount; i++) {
    const radius = startR + i * stepR;
    const dir = spec.fibonacciPhase ? 1 : i % 2 === 0 ? 1 : -1;
    const baseSpin = (0.72 + i * 0.085 + (level - 1) * 0.11) * spec.speedScale;
    const gapSize = Math.max(
      0.34,
      spec.gapSizeBase - level * 0.025 - i * (ringCount > 20 ? 0.005 : 0.012)
    );

    rings.push({
      id: i + 1,
      baseRadius: radius,
      radius,
      thickness,
      angle: spec.fibonacciPhase ? i * 0.28 : i * 1.1,
      spinSpeed: dir * baseSpin,
      gapSize,
      gapCount: spec.gapCount,
      color: palette[i % palette.length],
      broken: false,
      hitFlash: 0,
      pulseAngle: 0,
      pulseAlpha: 0,
    });
  }

  const balls: RingBall[] = [];
  for (let b = 0; b < spec.ballCount; b++) {
    const startAngle = (b / spec.ballCount) * Math.PI * 2 + Math.random() * 0.3;
    balls.push({
      id: b + 1,
      x: centerX + Math.cos(startAngle) * 12,
      y: centerY + Math.sin(startAngle) * 12,
      vx: Math.cos(startAngle) * spec.ballSpeed,
      vy: Math.sin(startAngle) * spec.ballSpeed - 42,
      radius: ballRadius,
      hue:
        preset === 'BLOOD_MOON'
          ? (345 + b * 14) % 360
          : preset === 'VOID_VORTEX'
          ? (255 + b * 22) % 360
          : preset === 'NEON_SERPENT'
          ? (130 + b * 16) % 360
          : (45 + b * 36) % 360,
      trail: [],
      bounces: 0,
    });
  }

  return {
    rings,
    balls,
    particles: [],
    waves: [],
    floatingTexts: [],
    centerX,
    centerY,
    playerAngleOffset: 0,
    targetAngleOffset: 0,
    level,
    preset,
    score: keepScore,
    combo: 0,
    maxCombo: keepMaxCombo,
    recentEscapeCount: 0,
    recentEscapeTimer: 0,
    slowMoTimer: 0,
    shakeAmount: 0,
    levelClearTimer: 0,
    clockTickTimer: 0,
    eyeAngle: 0,
    nextId: spec.ballCount + 10,
    time: 0,
  };
}

export function addCustomRingToWorld(world: RingEscapeWorld): number {
  const active = world.rings.filter((r) => !r.broken);
  if (world.rings.length >= 60) return active.length;

  const palette = CREEPY_PALETTES[world.preset] ?? RING_PALETTE;
  const nextTotal = world.rings.length + 1;
  const startR = nextTotal > 24 ? 26 : 36;
  const maxOuter = 285;
  const stepR = (maxOuter - startR) / Math.max(1, nextTotal - 1);
  const thickness = Math.max(2.1, Math.min(9.5, stepR * 0.44));

  for (let i = 0; i < world.rings.length; i++) {
    world.rings[i].baseRadius = startR + i * stepR;
    world.rings[i].radius = world.rings[i].baseRadius;
    world.rings[i].thickness = thickness;
  }

  const last = world.rings[world.rings.length - 1];
  const idx = world.rings.length;
  world.rings.push({
    id: idx + 1,
    baseRadius: startR + idx * stepR,
    radius: startR + idx * stepR,
    thickness,
    angle: last ? last.angle + 0.45 : 0,
    spinSpeed: (idx % 2 === 0 ? 1 : -1) * (0.9 + idx * 0.06),
    gapSize: last ? last.gapSize : 0.82,
    gapCount: last ? last.gapCount : 1,
    color: palette[idx % palette.length],
    broken: false,
    hitFlash: 0.6,
    pulseAngle: 0,
    pulseAlpha: 0,
  });

  soundEngine.playPlaceToy();
  return world.rings.filter((r) => !r.broken).length;
}

export function removeCustomRingFromWorld(world: RingEscapeWorld): number {
  if (world.rings.length <= 3) return world.rings.filter((r) => !r.broken).length;
  world.rings.pop();

  const count = world.rings.length;
  const startR = count > 24 ? 26 : 36;
  const maxOuter = 285;
  const stepR = (maxOuter - startR) / Math.max(1, count - 1);
  const thickness = Math.max(2.1, Math.min(9.5, stepR * 0.44));

  for (let i = 0; i < count; i++) {
    world.rings[i].baseRadius = startR + i * stepR;
    world.rings[i].radius = world.rings[i].baseRadius;
    world.rings[i].thickness = thickness;
  }

  soundEngine.playPlaceToy();
  return world.rings.filter((r) => !r.broken).length;
}

export function spawnRingBall(world: RingEscapeWorld) {
  if (world.balls.length >= 34) return;
  const a = Math.random() * Math.PI * 2;
  soundEngine.playLaunch();
  world.balls.push({
    id: world.nextId++,
    x: world.centerX + (Math.random() - 0.5) * 16,
    y: world.centerY + (Math.random() - 0.5) * 16,
    vx: Math.cos(a) * 265,
    vy: Math.sin(a) * 265,
    radius: 8.2,
    hue: (45 + world.balls.length * 36) % 360,
    trail: [],
    bounces: 0,
  });
}

export function triggerRingPulse(world: RingEscapeWorld, reducedMotion: boolean) {
  soundEngine.playSpring();
  world.waves.push({
    x: world.centerX,
    y: world.centerY,
    radius: 14,
    maxRadius: 115,
    color: world.preset === 'BLOOD_MOON' ? '#FB7185' : '#38BDF8',
    alpha: 0.45,
  });

  if (!reducedMotion) {
    world.shakeAmount = Math.min(8, world.shakeAmount + 3.5);
  }

  for (const b of world.balls) {
    const dx = b.x - world.centerX;
    const dy = b.y - world.centerY;
    const dist = Math.max(8, Math.hypot(dx, dy));
    b.vx += (dx / dist) * 185;
    b.vy += (dy / dist) * 185 - 120;
    const spd = Math.hypot(b.vx, b.vy);
    if (spd > 680) {
      b.vx = (b.vx / spd) * 680;
      b.vy = (b.vy / spd) * 680;
    }
  }
}

function addBurst(
  world: RingEscapeWorld,
  x: number,
  y: number,
  color: string,
  count: number,
  speed: number,
  reducedMotion: boolean
) {
  const actual = reducedMotion ? Math.min(4, count) : count;
  for (let i = 0; i < actual; i++) {
    const a = Math.random() * Math.PI * 2;
    const spd = speed * (0.4 + Math.random() * 0.8);
    world.particles.push({
      x,
      y,
      vx: Math.cos(a) * spd,
      vy: Math.sin(a) * spd,
      radius: 2 + Math.random() * 2.8,
      color,
      alpha: 1,
      decay: 1.4 + Math.random(),
    });
  }
}

export function stepRingEscapeWorld(
  world: RingEscapeWorld,
  rawDt: number,
  settings: RingEscapeSettings,
  reducedMotion: boolean
) {
  let timeScale = 1;
  if (world.slowMoTimer > 0) {
    world.slowMoTimer = Math.max(0, world.slowMoTimer - rawDt);
    timeScale = 0.42;
  }
  const dt = rawDt * timeScale;
  world.time += rawDt;

  if (world.recentEscapeTimer > 0) {
    world.recentEscapeTimer = Math.max(0, world.recentEscapeTimer - rawDt);
    if (world.recentEscapeTimer <= 0) {
      world.recentEscapeCount = 0;
    }
  }

  if (world.shakeAmount > 0) {
    world.shakeAmount = Math.max(0, world.shakeAmount - rawDt * 32);
  }

  world.playerAngleOffset +=
    (world.targetAngleOffset - world.playerAngleOffset) * Math.min(1, rawDt * 14);

  // Track nearest ball for Shadow Eye
  if (world.preset === 'SHADOW_EYE' && world.balls.length > 0) {
    const b0 = world.balls[0];
    const targetAng = Math.atan2(b0.y - world.centerY, b0.x - world.centerX);
    const diff = normalizeAngle(targetAng - world.eyeAngle + Math.PI) - Math.PI;
    world.eyeAngle += diff * Math.min(1, rawDt * 8);
  }

  // Clockwork ratchet step for Cursed Clock
  let clockPulseBoost = 1;
  if (world.preset === 'CURSED_CLOCK') {
    world.clockTickTimer += dt;
    if (world.clockTickTimer >= 0.45) {
      world.clockTickTimer -= 0.45;
      soundEngine.playAsmrRingTap(world.rings.length, true);
    }
    clockPulseBoost = world.clockTickTimer < 0.12 ? 3.2 : 0.18;
  }

  const isEerie = EERIE_PRESETS.has(world.preset);
  const breatheActive =
    world.preset === 'PHANTOM_PULSE' || world.preset === 'HAUNTED_ECHO';

  for (const ring of world.rings) {
    if (ring.broken) continue;
    ring.angle += ring.spinSpeed * clockPulseBoost * dt;
    if (breatheActive) {
      ring.radius =
        ring.baseRadius + Math.sin(world.time * 2.2 + ring.id * 0.6) * 5.5;
    } else {
      ring.radius = ring.baseRadius;
    }
    if (ring.hitFlash > 0) {
      ring.hitFlash = Math.max(0, ring.hitFlash - rawDt * 5);
    }
    if (ring.pulseAlpha > 0) {
      ring.pulseAlpha = Math.max(0, ring.pulseAlpha - rawDt * 2.6);
    }
  }

  if (world.levelClearTimer > 0) {
    world.levelClearTimer -= rawDt;
    if (world.levelClearTimer <= 0) {
      const next = createRingEscapeWorld(
        world.level + 1,
        world.score,
        world.maxCombo,
        settings.megaTenRings,
        world.preset,
        settings.customRingCount
      );
      Object.assign(world, next);
      return;
    }
  }

  const gravity =
    settings.lowGravity ||
    world.preset === 'CRYSTAL_RAIN' ||
    world.preset === 'HAUNTED_ECHO'
      ? 185
      : 395;
  const substeps = 4;
  const subDt = dt / substeps;
  const ballsToAdd: RingBall[] = [];

  for (const ball of world.balls) {
    ball.trail.push({ x: ball.x, y: ball.y });
    const maxTrail =
      world.preset === 'HAUNTED_ECHO' || world.preset === 'VELVET_ASMR'
        ? 28
        : 20;
    if (ball.trail.length > maxTrail) ball.trail.shift();

    for (let s = 0; s < substeps; s++) {
      ball.vy += gravity * subDt;

      // Subtle central swirl whisper for Void Vortex
      if (world.preset === 'VOID_VORTEX') {
        const vdx = ball.x - world.centerX;
        const vdy = ball.y - world.centerY;
        const vdist = Math.max(24, Math.hypot(vdx, vdy));
        ball.vx += (-vdy / vdist) * 165 * subDt;
        ball.vy += (vdx / vdist) * 165 * subDt;
      }

      ball.x += ball.vx * subDt;
      ball.y += ball.vy * subDt;

      // Outer arena bounce
      if (ball.x - ball.radius < 20) {
        ball.x = 20 + ball.radius;
        ball.vx = Math.abs(ball.vx) * 0.94;
      } else if (ball.x + ball.radius > ARENA_WIDTH - 20) {
        ball.x = ARENA_WIDTH - 20 - ball.radius;
        ball.vx = -Math.abs(ball.vx) * 0.94;
      }
      if (ball.y - ball.radius < 20) {
        ball.y = 20 + ball.radius;
        ball.vy = Math.abs(ball.vy) * 0.94;
      } else if (ball.y + ball.radius > ARENA_HEIGHT - 20) {
        ball.y = ARENA_HEIGHT - 20 - ball.radius;
        ball.vy = -Math.max(255, Math.abs(ball.vy) * 0.95);
      }

      const dx = ball.x - world.centerX;
      const dy = ball.y - world.centerY;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      for (let rIdx = 0; rIdx < world.rings.length; rIdx++) {
        const ring = world.rings[rIdx];
        if (ring.broken) continue;

        const innerWall = ring.radius - ring.thickness / 2 - ball.radius;
        const outerWall = ring.radius + ring.thickness / 2 + ball.radius;
        const effectiveGapCenter =
          ring.angle + (settings.autoSteer ? 0 : world.playerAngleOffset);
        const inGap = isAngleInAnyGap(
          angle,
          effectiveGapCenter,
          ring.gapSize / 2,
          ring.gapCount
        );

        if (dist >= innerWall && dist <= outerWall) {
          if (inGap) {
            ring.broken = true;
            soundEngine.playRingBreak(rIdx);
            world.combo += 1;
            if (world.combo > world.maxCombo) world.maxCombo = world.combo;

            // Mirror Maze: reverse remaining ring spins when a ring shatters!
            if (world.preset === 'MIRROR_MAZE') {
              for (const rem of world.rings) {
                if (!rem.broken) rem.spinSpeed = -rem.spinSpeed;
              }
            }

            world.recentEscapeCount += 1;
            world.recentEscapeTimer = 0.85;
            const streakBonus =
              world.recentEscapeCount > 1 ? world.recentEscapeCount : 1;
            const pts = 500 * world.level * streakBonus;
            world.score += pts;

            if (world.recentEscapeCount >= 2 && !reducedMotion) {
              world.slowMoTimer = 0.16;
            }
            if (!reducedMotion) {
              world.shakeAmount = Math.min(11, world.shakeAmount + 4.5);
            }

            const sparkCount = reducedMotion ? 10 : 38;
            for (let k = 0; k < sparkCount; k++) {
              const sa = (k / sparkCount) * Math.PI * 2;
              const sx = world.centerX + Math.cos(sa) * ring.radius;
              const sy = world.centerY + Math.sin(sa) * ring.radius;
              world.particles.push({
                x: sx,
                y: sy,
                vx: Math.cos(sa) * (95 + Math.random() * 155),
                vy: Math.sin(sa) * (95 + Math.random() * 155),
                radius: 2.5 + Math.random() * 2.2,
                color: ring.color,
                alpha: 1,
                decay: 1.45,
              });
            }

            if (world.waves.length < 6) {
              world.waves.push({
                x: world.centerX,
                y: world.centerY,
                radius: ring.radius,
                maxRadius: ring.radius + 26,
                color: ring.color,
                alpha: 0.45,
              });
            }

            if (world.floatingTexts.length < 7) {
              world.floatingTexts.push({
                x: ball.x,
                y: ball.y - 14,
                vy: -36,
                text: `+${pts}`,
                color: ring.color,
                alpha: 0.9,
                scale: 1,
              });
            }

            if (
              settings.multiplyOnEscape &&
              world.balls.length + ballsToAdd.length < 30
            ) {
              const na = Math.random() * Math.PI * 2;
              ballsToAdd.push({
                id: world.nextId++,
                x: world.centerX,
                y: world.centerY,
                vx: Math.cos(na) * 245,
                vy: Math.sin(na) * 245,
                radius: Math.min(9, ball.radius),
                hue: (ball.hue + 65) % 360,
                trail: [],
                bounces: 0,
              });
            }

            if (world.rings.every((r) => r.broken)) {
              world.levelClearTimer = 1.35;
              world.slowMoTimer = 0.24;
              soundEngine.playStageClear();
              world.score += 2000;
              world.floatingTexts.push({
                x: world.centerX,
                y: world.centerY,
                vy: -24,
                text: `CLEAR +2000`,
                color: '#FDE047',
                alpha: 0.95,
                scale: 1,
              });
            }
          } else if (dist > 0.001) {
            const nx = dx / dist;
            const ny = dy / dist;
            const fromInside = dist < ring.radius;

            if (fromInside) {
              ball.x = world.centerX + nx * (innerWall - 0.5);
            } else {
              ball.x = world.centerX + nx * (outerWall + 0.5);
            }

            const dot = ball.vx * nx + ball.vy * ny;
            if ((fromInside && dot > 0) || (!fromInside && dot < 0)) {
              const bounceBoost = settings.accelerateOnBounce ? 1.055 : 1.02;
              ball.vx = (ball.vx - 2 * dot * nx) * bounceBoost;
              ball.vy = (ball.vy - 2 * dot * ny) * bounceBoost;

              const spd = Math.hypot(ball.vx, ball.vy);
              const maxSpd = settings.accelerateOnBounce ? 690 : 540;
              const minSpd = 230;
              if (spd > maxSpd) {
                ball.vx = (ball.vx / spd) * maxSpd;
                ball.vy = (ball.vy / spd) * maxSpd;
              } else if (spd < minSpd && spd > 0.01) {
                ball.vx = (ball.vx / spd) * minSpd;
                ball.vy = (ball.vy / spd) * minSpd;
              }

              ring.hitFlash = 1;
              ring.pulseAngle = angle;
              ring.pulseAlpha = 1;
              ball.bounces += 1;
              ball.hue = (ball.hue + 14) % 360;
              world.combo += 1;
              if (world.combo > world.maxCombo) world.maxCombo = world.combo;
              world.score += 30;

              if (settings.growOnBounce && ball.radius < 20) {
                ball.radius += 0.25;
              }

              soundEngine.playAsmrRingTap(rIdx + ball.bounces, isEerie);

              // Haunted Echo emits extra spectral ripple on bounce
              if (world.preset === 'HAUNTED_ECHO' && !reducedMotion) {
                world.waves.push({
                  x: ball.x,
                  y: ball.y,
                  radius: 6,
                  maxRadius: 46,
                  color: ring.color,
                  alpha: 0.5,
                });
              }

              addBurst(
                world,
                ball.x,
                ball.y,
                ring.color,
                6,
                145,
                reducedMotion
              );
            }
          }
        }
      }
    }
  }

  if (ballsToAdd.length > 0) {
    world.balls.push(...ballsToAdd);
  }

  for (let i = world.particles.length - 1; i >= 0; i--) {
    const p = world.particles[i];
    p.x += p.vx * rawDt;
    p.y += p.vy * rawDt;
    p.alpha -= p.decay * rawDt;
    if (p.alpha <= 0) world.particles.splice(i, 1);
  }
  for (let i = world.waves.length - 1; i >= 0; i--) {
    const w = world.waves[i];
    w.radius += 125 * rawDt;
    w.alpha -= rawDt * 1.75;
    if (w.alpha <= 0) world.waves.splice(i, 1);
  }
  for (let i = world.floatingTexts.length - 1; i >= 0; i--) {
    const ft = world.floatingTexts[i];
    ft.y += ft.vy * rawDt;
    ft.alpha -= rawDt * 1.05;
    if (ft.alpha <= 0) world.floatingTexts.splice(i, 1);
  }
}

export function renderRingEscapeWorld(
  ctx: CanvasRenderingContext2D,
  world: RingEscapeWorld,
  settings: RingEscapeSettings
) {
  ctx.save();

  if (world.shakeAmount > 0.1) {
    ctx.translate(
      (Math.random() - 0.5) * world.shakeAmount,
      (Math.random() - 0.5) * world.shakeAmount
    );
  }

  const bg = ctx.createRadialGradient(
    world.centerX,
    world.centerY,
    24,
    world.centerX,
    world.centerY,
    460
  );
  if (world.preset === 'BLOOD_MOON' || world.preset === 'ABYSS_30') {
    bg.addColorStop(0, '#2B0C1A');
    bg.addColorStop(1, '#07060D');
  } else if (
    world.preset === 'PHANTOM_PULSE' ||
    world.preset === 'HAUNTED_ECHO'
  ) {
    bg.addColorStop(0, '#0C242B');
    bg.addColorStop(1, '#060A14');
  } else if (
    world.preset === 'SPIDER_WEB' ||
    world.preset === 'SHADOW_EYE' ||
    world.preset === 'VOID_VORTEX'
  ) {
    bg.addColorStop(0, '#1D1234');
    bg.addColorStop(1, '#070712');
  } else {
    bg.addColorStop(0, '#14203B');
    bg.addColorStop(1, '#080D1A');
  }
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, ARENA_WIDTH - 36, ARENA_HEIGHT - 28);

  // Thematic Center Decor for Creepy & ASMR Arenas
  if (world.preset === 'SPIDER_WEB') {
    ctx.save();
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.14)';
    ctx.lineWidth = 1;
    const spokes = 12;
    for (let s = 0; s < spokes; s++) {
      const a = (s / spokes) * Math.PI * 2 + world.playerAngleOffset * 0.25;
      ctx.beginPath();
      ctx.moveTo(world.centerX, world.centerY);
      ctx.lineTo(
        world.centerX + Math.cos(a) * 285,
        world.centerY + Math.sin(a) * 285
      );
      ctx.stroke();
    }
    ctx.restore();
  } else if (world.preset === 'BLOOD_MOON') {
    ctx.save();
    const moonPulse = 32 + Math.sin(world.time * 2.5) * 3;
    const moonGrad = ctx.createRadialGradient(
      world.centerX,
      world.centerY,
      8,
      world.centerX,
      world.centerY,
      moonPulse + 26
    );
    moonGrad.addColorStop(0, 'rgba(220, 38, 38, 0.55)');
    moonGrad.addColorStop(0.6, 'rgba(153, 27, 27, 0.2)');
    moonGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(world.centerX, world.centerY, moonPulse + 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#09050A';
    ctx.strokeStyle = '#FB7185';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(world.centerX, world.centerY, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  } else if (world.preset === 'SHADOW_EYE') {
    ctx.save();
    ctx.translate(world.centerX, world.centerY);
    ctx.strokeStyle = 'rgba(225, 29, 72, 0.45)';
    ctx.fillStyle = 'rgba(15, 10, 26, 0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 42, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const lookX = Math.cos(world.eyeAngle) * 8;
    const lookY = Math.sin(world.eyeAngle) * 4;
    ctx.fillStyle = '#E11D48';
    ctx.beginPath();
    ctx.arc(lookX, lookY, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#05050A';
    ctx.beginPath();
    ctx.ellipse(lookX, lookY, 4.5, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (world.preset === 'CURSED_CLOCK') {
    ctx.save();
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.2)';
    ctx.lineWidth = 2;
    for (let t = 0; t < 12; t++) {
      const a = (t / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(
        world.centerX + Math.cos(a) * 265,
        world.centerY + Math.sin(a) * 265
      );
      ctx.lineTo(
        world.centerX + Math.cos(a) * 282,
        world.centerY + Math.sin(a) * 282
      );
      ctx.stroke();
    }
    ctx.restore();
  } else {
    // Subtle ASMR center halo across all modes
    ctx.save();
    const coreGrad = ctx.createRadialGradient(
      world.centerX,
      world.centerY,
      2,
      world.centerX,
      world.centerY,
      54
    );
    coreGrad.addColorStop(0, 'rgba(56, 189, 248, 0.16)');
    coreGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(world.centerX, world.centerY, 54, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Shockwaves
  for (const w of world.waves) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, w.alpha);
    ctx.strokeStyle = w.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Concentric Rings (supports 1, 2, or 3 symmetric gaps!)
  for (const ring of world.rings) {
    if (ring.broken) continue;
    const gapCenter =
      ring.angle + (settings.autoSteer ? 0 : world.playerAngleOffset);
    const step = (Math.PI * 2) / ring.gapCount;

    ctx.save();
    ctx.strokeStyle = ring.hitFlash > 0.15 ? '#FFFFFF' : ring.color;
    ctx.shadowColor = ring.color;
    ctx.shadowBlur = ring.hitFlash > 0.15 ? 24 : 11;
    ctx.lineWidth = ring.thickness;
    ctx.lineCap = 'round';

    for (let g = 0; g < ring.gapCount; g++) {
      const arcStart = gapCenter + g * step + ring.gapSize / 2;
      const arcEnd = gapCenter + (g + 1) * step - ring.gapSize / 2;
      if (arcEnd > arcStart + 0.02) {
        ctx.beginPath();
        ctx.arc(world.centerX, world.centerY, ring.radius, arcStart, arcEnd);
        ctx.stroke();
      }
    }

    // Hit ripple highlight arc at impact point
    if (ring.pulseAlpha > 0.04) {
      ctx.globalAlpha = ring.pulseAlpha;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = ring.thickness + 3;
      const arcSpan = 0.45 * (1.2 - ring.pulseAlpha * 0.5);
      ctx.beginPath();
      ctx.arc(
        world.centerX,
        world.centerY,
        ring.radius,
        ring.pulseAngle - arcSpan,
        ring.pulseAngle + arcSpan
      );
      ctx.stroke();
    }
    ctx.restore();
  }

  // Balls & silky comet ribbons
  for (const b of world.balls) {
    if (b.trail.length > 1) {
      for (let i = 1; i < b.trail.length; i++) {
        const p0 = b.trail[i - 1];
        const p1 = b.trail[i];
        const frac = i / b.trail.length;
        ctx.strokeStyle = `hsla(${(b.hue + i * 9) % 360}, 95%, 68%, ${frac * 0.58})`;
        ctx.lineWidth = b.radius * frac * 1.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
    }

    ctx.save();
    const grad = ctx.createRadialGradient(
      b.x - b.radius * 0.3,
      b.y - b.radius * 0.3,
      2,
      b.x,
      b.y,
      b.radius
    );
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.4, `hsl(${b.hue}, 95%, 70%)`);
    grad.addColorStop(1, `hsl(${b.hue}, 85%, 45%)`);
    ctx.shadowColor = `hsla(${b.hue}, 95%, 68%, 0.8)`;
    ctx.shadowBlur = 15;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
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

  // Floating texts
  for (const ft of world.floatingTexts) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, ft.alpha);
    ctx.font = '700 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }

  ctx.restore();
}
