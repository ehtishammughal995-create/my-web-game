import { soundEngine } from '../audio/soundEngine';
import { ARENA_HEIGHT, ARENA_WIDTH } from './stages';
import {
  FloatingText,
  Particle,
  RingWave,
  VaultGapSize,
  VaultMultiplyRule,
  VaultPreset,
} from './types';

export const VAULT_LEVELS: Array<{
  id: VaultPreset;
  label: string;
  desc: string;
}> = [
  { id: 'CLASSIC_BUNKER', label: '01. Concrete Square', desc: 'Top narrow chimney + 64 gold points' },
  { id: 'BOTTOM_KEYHOLE', label: '02. Bottom Keyhole', desc: 'Upward pingo shots into bottom gap' },
  { id: 'SIDE_SLIT', label: '03. Side Slit Vault', desc: 'Tiny side doorway & angled ricochet' },
  { id: 'SHIFTING_GATE', label: '04. Sliding Gate', desc: 'Narrow vault door slides left & right' },
  { id: 'TWIN_CHAMBER', label: '05. Twin Bunker', desc: 'Outer chamber guards inner core gems' },
  { id: 'FUNNEL_TRAP', label: '06. Concrete Funnel', desc: 'Steep stone chute into 1-way vault' },
  { id: 'ROTATING_FORTRESS', label: '07. Spinning Vault', desc: 'Rotating concrete room with 1 gap' },
  { id: 'MEGA_TREASURY', label: '08. 150-Gem Treasury', desc: 'Massive concrete room · hyper double' },
];

export interface ConcreteWall {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number;
  hitFlash: number;
  isSliding?: boolean;
  baseX1?: number;
  baseX2?: number;
  isInner?: boolean;
}

export interface PingoPeg {
  x: number;
  y: number;
  radius: number;
  color: string;
  hitFlash: number;
}

export interface VaultPoint {
  x: number;
  y: number;
  radius: number;
  value: number;
  hue: number;
  kind: 'gold' | 'emerald' | 'diamond';
  eaten: boolean;
  pulse: number;
}

export interface VaultBall {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
  insideVault: boolean;
  trail: Array<{ x: number; y: number }>;
  age: number;
}

export interface VaultBreachWorld {
  preset: VaultPreset;
  gapSize: VaultGapSize;
  multiplyRule: VaultMultiplyRule;
  walls: ConcreteWall[];
  pegs: PingoPeg[];
  points: VaultPoint[];
  balls: VaultBall[];
  particles: Particle[];
  waves: RingWave[];
  floatingTexts: FloatingText[];
  vaultRect: { x: number; y: number; w: number; h: number };
  vaultAngle: number;
  vaultSpinSpeed: number;
  launcherX: number;
  launcherY: number;
  aimAngle: number;
  targetAimAngle: number;
  paddleX: number;
  paddleWidth: number;
  autoFireTimer: number;
  score: number;
  combo: number;
  maxCombo: number;
  eatenCount: number;
  totalPoints: number;
  clearedTimer: number;
  shakeAmount: number;
  nextId: number;
  time: number;
}

const MAX_VAULT_BALLS = 180;

function getGapHalfPx(gapSize: VaultGapSize): number {
  if (gapSize === 'tiny') return 19;
  if (gapSize === 'wide') return 42;
  return 28;
}

function buildWallsAndPoints(
  preset: VaultPreset,
  gapSize: VaultGapSize
): {
  walls: ConcreteWall[];
  pegs: PingoPeg[];
  points: VaultPoint[];
  vaultRect: { x: number; y: number; w: number; h: number };
  vaultSpinSpeed: number;
} {
  const walls: ConcreteWall[] = [];
  const pegs: PingoPeg[] = [];
  const points: VaultPoint[] = [];
  const gapHalf = getGapHalfPx(gapSize);

  const cx = ARENA_WIDTH / 2;
  const vx = 230;
  const vy = 84;
  const vw = 340;
  const vh = 276;
  const vaultRect = { x: vx, y: vy, w: vw, h: vh };
  let vaultSpinSpeed = 0;

  const addWall = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    thickness = 16,
    isInner = false
  ) => {
    walls.push({ x1, y1, x2, y2, thickness, hitFlash: 0, isInner });
  };

  if (preset === 'CLASSIC_BUNKER') {
    // Top wall with centered narrow gap
    addWall(vx, vy, cx - gapHalf, vy, 18);
    addWall(cx + gapHalf, vy, vx + vw, vy, 18);
    // Left, right, bottom solid concrete
    addWall(vx, vy, vx, vy + vh, 18);
    addWall(vx + vw, vy, vx + vw, vy + vh, 18);
    addWall(vx, vy + vh, vx + vw, vy + vh, 18);
    // Side deflectors outside to guide pingo balls upward toward top gap
    addWall(90, 260, 185, 110, 12);
    addWall(ARENA_WIDTH - 90, 260, ARENA_WIDTH - 185, 110, 12);
  } else if (preset === 'BOTTOM_KEYHOLE') {
    // Solid top, left, right; bottom has one tight keyhole right above launcher
    addWall(vx, vy, vx + vw, vy, 18);
    addWall(vx, vy, vx, vy + vh, 18);
    addWall(vx + vw, vy, vx + vw, vy + vh, 18);
    addWall(vx, vy + vh, cx - gapHalf, vy + vh, 18);
    addWall(cx + gapHalf, vy + vh, vx + vw, vy + vh, 18);
  } else if (preset === 'SIDE_SLIT') {
    // Solid top, bottom, left; tiny right-side doorway
    const doorY = vy + vh * 0.5;
    addWall(vx, vy, vx + vw, vy, 18);
    addWall(vx, vy + vh, vx + vw, vy + vh, 18);
    addWall(vx, vy, vx, vy + vh, 18);
    addWall(vx + vw, vy, vx + vw, doorY - gapHalf, 18);
    addWall(vx + vw, doorY + gapHalf, vx + vw, vy + vh, 18);
    // Right bank rebound ramp
    addWall(660, 150, 745, 290, 12);
  } else if (preset === 'SHIFTING_GATE') {
    // Top wall left/right segments move smoothly
    walls.push({
      x1: vx,
      y1: vy,
      x2: cx - gapHalf,
      y2: vy,
      thickness: 18,
      hitFlash: 0,
      isSliding: true,
      baseX1: vx,
      baseX2: cx - gapHalf,
    });
    walls.push({
      x1: cx + gapHalf,
      y1: vy,
      x2: vx + vw,
      y2: vy,
      thickness: 18,
      hitFlash: 0,
      isSliding: true,
      baseX1: cx + gapHalf,
      baseX2: vx + vw,
    });
    addWall(vx, vy, vx, vy + vh, 18);
    addWall(vx + vw, vy, vx + vw, vy + vh, 18);
    addWall(vx, vy + vh, vx + vw, vy + vh, 18);
  } else if (preset === 'TWIN_CHAMBER') {
    // Outer bunker (bottom gap) + inner core room (top gap)
    addWall(vx, vy, vx + vw, vy, 16);
    addWall(vx, vy, vx, vy + vh, 16);
    addWall(vx + vw, vy, vx + vw, vy + vh, 16);
    addWall(vx, vy + vh, cx - gapHalf - 8, vy + vh, 16);
    addWall(cx + gapHalf + 8, vy + vh, vx + vw, vy + vh, 16);

    const ix = vx + 68;
    const iy = vy + 58;
    const iw = vw - 136;
    const ih = vh - 116;
    addWall(ix, iy, cx - gapHalf * 0.85, iy, 12, true);
    addWall(cx + gapHalf * 0.85, iy, ix + iw, iy, 12, true);
    addWall(ix, iy, ix, iy + ih, 12, true);
    addWall(ix + iw, iy, ix + iw, iy + ih, 12, true);
    addWall(ix, iy + ih, ix + iw, iy + ih, 12, true);
  } else if (preset === 'FUNNEL_TRAP') {
    // Funnel roof sloping into narrow top throat
    addWall(vx - 30, vy - 24, cx - gapHalf, vy + 24, 16);
    addWall(vx + vw + 30, vy - 24, cx + gapHalf, vy + 24, 16);
    addWall(vx, vy + 24, vx, vy + vh, 16);
    addWall(vx + vw, vy + 24, vx + vw, vy + vh, 16);
    addWall(vx, vy + vh, vx + vw, vy + vh, 16);
  } else if (preset === 'ROTATING_FORTRESS') {
    vaultSpinSpeed = 0.55;
    const half = 128;
    const cy = vy + vh / 2;
    // Relative to center, stored directly and rotated via world transform in step/collide?
    // Keep axis-aligned in local coordinates around (cx, cy) by updating endpoints in step!
    addWall(cx - half, cy - half, cx - gapHalf, cy - half, 16);
    addWall(cx + gapHalf, cy - half, cx + half, cy - half, 16);
    addWall(cx - half, cy - half, cx - half, cy + half, 16);
    addWall(cx + half, cy - half, cx + half, cy + half, 16);
    addWall(cx - half, cy + half, cx + half, cy + half, 16);
    vaultRect.x = cx - half;
    vaultRect.y = cy - half;
    vaultRect.w = half * 2;
    vaultRect.h = half * 2;
  } else {
    // MEGA_TREASURY
    const mvx = 185;
    const mvy = 72;
    const mvw = 430;
    const mvh = 300;
    vaultRect.x = mvx;
    vaultRect.y = mvy;
    vaultRect.w = mvw;
    vaultRect.h = mvh;
    addWall(mvx, mvy, cx - gapHalf, mvy, 18);
    addWall(cx + gapHalf, mvy, mvx + mvw, mvy, 18);
    addWall(mvx, mvy, mvx, mvy + mvh, 18);
    addWall(mvx + mvw, mvy, mvx + mvw, mvy + mvh, 18);
    addWall(mvx, mvy + mvh, mvx + mvw, mvy + mvh, 18);
  }

  // Pingo bumper pegs around the bottom & outer flanks
  const pingoCoords: Array<[number, number, string]> = [
    [108, 435, '#10B981'],
    [168, 485, '#38BDF8'],
    [245, 445, '#F59E0B'],
    [ARENA_WIDTH - 108, 435, '#10B981'],
    [ARENA_WIDTH - 168, 485, '#38BDF8'],
    [ARENA_WIDTH - 245, 445, '#F59E0B'],
    [122, 345, '#A78BFA'],
    [ARENA_WIDTH - 122, 345, '#A78BFA'],
  ];
  for (const [px, py, color] of pingoCoords) {
    pegs.push({ x: px, y: py, radius: 14, color, hitFlash: 0 });
  }

  // Fill the concrete room with juicy collectible material / points!
  const cols = preset === 'MEGA_TREASURY' ? 15 : preset === 'ROTATING_FORTRESS' ? 8 : 10;
  const rows = preset === 'MEGA_TREASURY' ? 10 : preset === 'ROTATING_FORTRESS' ? 8 : 7;
  const padX = 36;
  const padY = 44;
  const usableW = vaultRect.w - padX * 2;
  const usableH = vaultRect.h - padY * 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = vaultRect.x + padX + (cols === 1 ? usableW / 2 : (c / (cols - 1)) * usableW);
      const py = vaultRect.y + padY + (rows === 1 ? usableH / 2 : (r / (rows - 1)) * usableH);
      const isDiamond = (r + c) % 7 === 0;
      const isEmerald = !isDiamond && (r + c) % 3 === 0;
      points.push({
        x: px,
        y: py,
        radius: isDiamond ? 8.5 : 7,
        value: isDiamond ? 250 : isEmerald ? 140 : 90,
        hue: isDiamond ? 195 : isEmerald ? 152 : 44,
        kind: isDiamond ? 'diamond' : isEmerald ? 'emerald' : 'gold',
        eaten: false,
        pulse: Math.random() * Math.PI * 2,
      });
    }
  }

  return { walls, pegs, points, vaultRect, vaultSpinSpeed };
}

export function createVaultWorld(
  preset: VaultPreset = 'CLASSIC_BUNKER',
  gapSize: VaultGapSize = 'normal',
  multiplyRule: VaultMultiplyRule = 'DOUBLE'
): VaultBreachWorld {
  const { walls, pegs, points, vaultRect, vaultSpinSpeed } = buildWallsAndPoints(
    preset,
    gapSize
  );
  const world: VaultBreachWorld = {
    preset,
    gapSize,
    multiplyRule,
    walls,
    pegs,
    points,
    balls: [],
    particles: [],
    waves: [],
    floatingTexts: [],
    vaultRect,
    vaultAngle: 0,
    vaultSpinSpeed,
    launcherX: ARENA_WIDTH / 2,
    launcherY: ARENA_HEIGHT - 36,
    aimAngle: -Math.PI / 2 + 0.16,
    targetAimAngle: -Math.PI / 2 + 0.16,
    paddleX: ARENA_WIDTH / 2,
    paddleWidth: 130,
    autoFireTimer: 0.25,
    score: 0,
    combo: 0,
    maxCombo: 0,
    eatenCount: 0,
    totalPoints: points.length,
    clearedTimer: 0,
    shakeAmount: 0,
    nextId: 1,
    time: 0,
  };

  // Launch 2 starter pingo balls immediately for instant satisfaction
  fireVaultBall(world, -Math.PI / 2 - 0.18);
  fireVaultBall(world, -Math.PI / 2 + 0.22);
  return world;
}

export function fireVaultBall(world: VaultBreachWorld, angleOverride?: number) {
  if (world.balls.length >= MAX_VAULT_BALLS) return;
  const angle = angleOverride ?? world.aimAngle;
  const speed = 560;
  soundEngine.playLaunch();
  world.balls.push({
    id: world.nextId++,
    x: world.launcherX + Math.cos(angle) * 26,
    y: world.launcherY + Math.sin(angle) * 26,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: 7.8,
    hue: (40 + world.nextId * 29) % 360,
    insideVault: false,
    trail: [],
    age: 0,
  });
}

export function fireVaultVolley(world: VaultBreachWorld, count = 5) {
  soundEngine.playLaunch();
  for (let i = 0; i < count; i++) {
    if (world.balls.length >= MAX_VAULT_BALLS) break;
    const spread = ((i - (count - 1) / 2) * 0.22);
    fireVaultBall(world, -Math.PI / 2 + spread);
  }
}

function addDust(
  world: VaultBreachWorld,
  x: number,
  y: number,
  color: string,
  count: number,
  speed: number,
  reducedMotion: boolean
) {
  const n = reducedMotion ? Math.min(3, count) : count;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const spd = speed * (0.35 + Math.random() * 0.85);
    world.particles.push({
      x,
      y,
      vx: Math.cos(a) * spd,
      vy: Math.sin(a) * spd,
      radius: 1.8 + Math.random() * 2.2,
      color,
      alpha: 1,
      decay: 1.8 + Math.random() * 0.8,
    });
  }
}

export function stepVaultWorld(
  world: VaultBreachWorld,
  dt: number,
  autoFire: boolean,
  reducedMotion: boolean,
  zenMode: boolean
) {
  world.time += dt;
  if (world.shakeAmount > 0) {
    world.shakeAmount = Math.max(0, world.shakeAmount - dt * 28);
  }

  // Smooth aim sweep if autoFire is enabled
  if (autoFire) {
    world.aimAngle = -Math.PI / 2 + Math.sin(world.time * 1.35) * 0.62;
    world.autoFireTimer -= dt;
    if (world.autoFireTimer <= 0) {
      world.autoFireTimer = world.balls.length < 18 ? 1.45 : 3.2;
      if (world.balls.length < 40) {
        fireVaultBall(world);
      }
    }
  } else {
    world.aimAngle += (world.targetAimAngle - world.aimAngle) * Math.min(1, dt * 12);
  }

  // Sliding gate wall animation
  if (world.preset === 'SHIFTING_GATE') {
    const shift = Math.sin(world.time * 1.4) * 95;
    const gapHalf = getGapHalfPx(world.gapSize);
    const vx = world.vaultRect.x;
    const vw = world.vaultRect.w;
    const cx = ARENA_WIDTH / 2 + shift;
    if (world.walls.length >= 2) {
      world.walls[0].x1 = vx;
      world.walls[0].x2 = Math.max(vx + 20, cx - gapHalf);
      world.walls[1].x1 = Math.min(vx + vw - 20, cx + gapHalf);
      world.walls[1].x2 = vx + vw;
    }
  }

  // Rotating fortress concrete walls
  if (world.preset === 'ROTATING_FORTRESS' && world.walls.length >= 5) {
    const dAngle = world.vaultSpinSpeed * dt;
    world.vaultAngle += dAngle;
    const cx = world.vaultRect.x + world.vaultRect.w / 2;
    const cy = world.vaultRect.y + world.vaultRect.h / 2;
    const cos = Math.cos(dAngle);
    const sin = Math.sin(dAngle);
    for (const w of world.walls) {
      const rx1 = w.x1 - cx;
      const ry1 = w.y1 - cy;
      w.x1 = cx + rx1 * cos - ry1 * sin;
      w.y1 = cy + rx1 * sin + ry1 * cos;
      const rx2 = w.x2 - cx;
      const ry2 = w.y2 - cy;
      w.x2 = cx + rx2 * cos - ry2 * sin;
      w.y2 = cy + rx2 * sin + ry2 * cos;
    }
  }

  for (const w of world.walls) {
    if (w.hitFlash > 0) w.hitFlash = Math.max(0, w.hitFlash - dt * 5);
  }
  for (const p of world.pegs) {
    if (p.hitFlash > 0) p.hitFlash = Math.max(0, p.hitFlash - dt * 5);
  }

  if (world.clearedTimer > 0) {
    world.clearedTimer -= dt;
    if (world.clearedTimer <= 0) {
      const idx = VAULT_LEVELS.findIndex((l) => l.id === world.preset);
      const nextPreset = VAULT_LEVELS[(idx + 1) % VAULT_LEVELS.length].id;
      const keepScore = world.score;
      const keepMax = world.maxCombo;
      const next = createVaultWorld(nextPreset, world.gapSize, world.multiplyRule);
      next.score = keepScore;
      next.maxCombo = keepMax;
      Object.assign(world, next);
      return;
    }
  }

  const gravity = 460;
  const substeps = 3;
  const subDt = dt / substeps;
  const spawned: VaultBall[] = [];

  for (let bIdx = world.balls.length - 1; bIdx >= 0; bIdx--) {
    const ball = world.balls[bIdx];
    ball.age += dt;
    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > 14) ball.trail.shift();

    for (let s = 0; s < substeps; s++) {
      ball.vy += gravity * subDt;
      ball.x += ball.vx * subDt;
      ball.y += ball.vy * subDt;

      // Arena bounds
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
      }

      // Bottom pingo trampoline floor & launcher paddle bounce!
      const pHalf = world.paddleWidth / 2;
      if (
        ball.vy > 0 &&
        ball.y + ball.radius >= world.launcherY - 6 &&
        ball.y - ball.radius <= world.launcherY + 12 &&
        Math.abs(ball.x - world.paddleX) <= pHalf + ball.radius
      ) {
        ball.y = world.launcherY - 6 - ball.radius;
        const offset = (ball.x - world.paddleX) / pHalf;
        ball.vy = -Math.max(480, Math.abs(ball.vy) * 1.04);
        ball.vx += offset * 175;
        soundEngine.playPegHit(world.combo, false);
        addDust(world, ball.x, ball.y, '#38BDF8', 5, 110, reducedMotion);
      } else if (ball.y + ball.radius > ARENA_HEIGHT - 16) {
        // Bottom bounce floor keeps balls rebounding back into the pingo pegs!
        ball.y = ARENA_HEIGHT - 16 - ball.radius;
        ball.vy = -Math.max(360, Math.abs(ball.vy) * 0.91);
        ball.vx += (Math.random() - 0.5) * 75;
      }

      // Concrete walls collision
      for (const wall of world.walls) {
        const wx = wall.x2 - wall.x1;
        const wy = wall.y2 - wall.y1;
        const lenSq = wx * wx + wy * wy;
        if (lenSq < 1) continue;
        const t = Math.max(
          0,
          Math.min(1, ((ball.x - wall.x1) * wx + (ball.y - wall.y1) * wy) / lenSq)
        );
        const cx = wall.x1 + t * wx;
        const cy = wall.y1 + t * wy;
        const dx = ball.x - cx;
        const dy = ball.y - cy;
        const dist = Math.hypot(dx, dy);
        const minDist = ball.radius + wall.thickness * 0.5;

        if (dist < minDist && dist > 0.0001) {
          const nx = dx / dist;
          const ny = dy / dist;
          ball.x = cx + nx * (minDist + 0.5);
          ball.y = cy + ny * (minDist + 0.5);
          const dot = ball.vx * nx + ball.vy * ny;
          if (dot < 0) {
            const rest = ball.insideVault ? 0.96 : 0.92;
            ball.vx = (ball.vx - 2 * dot * nx) * rest;
            ball.vy = (ball.vy - 2 * dot * ny) * rest;
            // Maintain lively bounce energy inside vault
            if (ball.insideVault) {
              const spd = Math.hypot(ball.vx, ball.vy);
              if (spd < 240 && spd > 0.1) {
                ball.vx = (ball.vx / spd) * 265;
                ball.vy = (ball.vy / spd) * 265;
              }
            }
            wall.hitFlash = 0.85;
            if (ball.age > 0.08 && world.particles.length < 180) {
              addDust(world, cx, cy, '#CBD5E1', 3, 95, reducedMotion);
            }
          }
        }
      }

      // Pingo pegs collision
      for (const peg of world.pegs) {
        const dx = ball.x - peg.x;
        const dy = ball.y - peg.y;
        const dist = Math.hypot(dx, dy);
        const minDist = ball.radius + peg.radius;
        if (dist < minDist && dist > 0.001) {
          const nx = dx / dist;
          const ny = dy / dist;
          ball.x = peg.x + nx * (minDist + 0.5);
          ball.y = peg.y + ny * (minDist + 0.5);
          const dot = ball.vx * nx + ball.vy * ny;
          if (dot < 0) {
            ball.vx = (ball.vx - 2 * dot * nx) * 1.06;
            ball.vy = (ball.vy - 2 * dot * ny) * 1.06 - 45;
            peg.hitFlash = 1;
            soundEngine.playBumper();
            addDust(world, peg.x, peg.y, peg.color, 5, 130, reducedMotion);
          }
        }
      }

      // Check if ball is inside vault bounds
      const r = world.vaultRect;
      ball.insideVault =
        ball.x > r.x + 6 &&
        ball.x < r.x + r.w - 6 &&
        ball.y > r.y + 6 &&
        ball.y < r.y + r.h - 6;

      // Eat vault points -> DOUBLE / MULTIPLY BALL!
      for (const pt of world.points) {
        if (pt.eaten) continue;
        if (Math.hypot(ball.x - pt.x, ball.y - pt.y) <= ball.radius + pt.radius + 2) {
          pt.eaten = true;
          world.eatenCount += 1;
          world.combo += 1;
          if (world.combo > world.maxCombo) world.maxCombo = world.combo;
          world.score += pt.value * (1 + Math.floor(world.combo / 8));
          soundEngine.playChimeNote(world.combo % 15, 'kalimba');
          addDust(
            world,
            pt.x,
            pt.y,
            pt.kind === 'diamond' ? '#38BDF8' : pt.kind === 'emerald' ? '#34D399' : '#FBBF24',
            7,
            170,
            reducedMotion
          );

          if (!zenMode && world.floatingTexts.length < 7) {
            world.floatingTexts.push({
              x: pt.x,
              y: pt.y - 8,
              vy: -32,
              text:
                world.multiplyRule === 'TRIPLE'
                  ? 'x3!'
                  : world.multiplyRule === 'DOUBLE'
                  ? 'x2!'
                  : '+1',
              color: '#FDE047',
              alpha: 0.92,
              scale: 1,
            });
          }

          // Multiply inside concrete room!
          const clonesToSpawn =
            world.multiplyRule === 'TRIPLE' ? 2 : 1;
          for (let c = 0; c < clonesToSpawn; c++) {
            if (world.balls.length + spawned.length >= MAX_VAULT_BALLS) break;
            const spread = (Math.random() - 0.5) * 1.4;
            const spd = Math.max(260, Math.hypot(ball.vx, ball.vy));
            const baseA = Math.atan2(ball.vy, ball.vx) + spread + (c === 0 ? 0.55 : -0.55);
            spawned.push({
              id: world.nextId++,
              x: ball.x + Math.cos(baseA) * 4,
              y: ball.y + Math.sin(baseA) * 4,
              vx: Math.cos(baseA) * spd,
              vy: Math.sin(baseA) * spd - 35,
              radius: ball.radius,
              hue: (ball.hue + 28 + c * 40) % 360,
              insideVault: ball.insideVault,
              trail: [],
              age: 0,
            });
          }
        }
      }

      // Clamp max velocity
      const spd = Math.hypot(ball.vx, ball.vy);
      if (spd > 680) {
        ball.vx = (ball.vx / spd) * 680;
        ball.vy = (ball.vy / spd) * 680;
      }
    }
  }

  if (spawned.length > 0) {
    world.balls.push(...spawned);
  }

  if (
    world.clearedTimer === 0 &&
    world.points.length > 0 &&
    world.points.every((p) => p.eaten)
  ) {
    world.clearedTimer = 1.65;
    soundEngine.playStageClear();
    world.score += 2500;
    world.waves.push({
      x: ARENA_WIDTH / 2,
      y: world.vaultRect.y + world.vaultRect.h / 2,
      radius: 25,
      maxRadius: 260,
      color: '#FBBF24',
      alpha: 0.7,
    });
    if (!zenMode) {
      world.floatingTexts.push({
        x: ARENA_WIDTH / 2,
        y: world.vaultRect.y + world.vaultRect.h / 2,
        vy: -20,
        text: 'VAULT LOOTED +2500!',
        color: '#FDE047',
        alpha: 1,
        scale: 1.2,
      });
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
    w.radius += 210 * dt;
    w.alpha -= dt * 1.4;
    if (w.alpha <= 0) world.waves.splice(i, 1);
  }
  for (let i = world.floatingTexts.length - 1; i >= 0; i--) {
    const ft = world.floatingTexts[i];
    ft.y += ft.vy * dt;
    ft.alpha -= dt * 1.1;
    if (ft.alpha <= 0) world.floatingTexts.splice(i, 1);
  }
}

export function renderVaultWorld(
  ctx: CanvasRenderingContext2D,
  world: VaultBreachWorld,
  zenMode: boolean
) {
  ctx.save();
  const bg = ctx.createRadialGradient(
    ARENA_WIDTH / 2,
    240,
    40,
    ARENA_WIDTH / 2,
    310,
    520
  );
  bg.addColorStop(0, '#131D33');
  bg.addColorStop(1, '#070B14');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, ARENA_WIDTH - 36, ARENA_HEIGHT - 28);

  // Subtle vault interior blueprint tint
  ctx.save();
  if (world.preset === 'ROTATING_FORTRESS') {
    const cx = world.vaultRect.x + world.vaultRect.w / 2;
    const cy = world.vaultRect.y + world.vaultRect.h / 2;
    ctx.translate(cx, cy);
    ctx.rotate(world.vaultAngle);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
    ctx.fillRect(
      -world.vaultRect.w / 2,
      -world.vaultRect.h / 2,
      world.vaultRect.w,
      world.vaultRect.h
    );
  } else {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
    ctx.fillRect(
      world.vaultRect.x,
      world.vaultRect.y,
      world.vaultRect.w,
      world.vaultRect.h
    );
  }
  ctx.restore();

  // Collectible points inside concrete fortress
  for (const pt of world.points) {
    if (pt.eaten) continue;
    const pulse = 1 + Math.sin(world.time * 4.2 + pt.pulse) * 0.12;
    const r = pt.radius * pulse;
    ctx.save();
    ctx.shadowColor = `hsl(${pt.hue}, 95%, 60%)`;
    ctx.shadowBlur = 10;
    ctx.fillStyle = `hsl(${pt.hue}, 92%, 62%)`;
    ctx.beginPath();
    if (pt.kind === 'diamond') {
      ctx.moveTo(pt.x, pt.y - r * 1.15);
      ctx.lineTo(pt.x + r * 0.95, pt.y);
      ctx.lineTo(pt.x, pt.y + r * 1.15);
      ctx.lineTo(pt.x - r * 0.95, pt.y);
      ctx.closePath();
    } else {
      ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(pt.x - r * 0.28, pt.y - r * 0.28, Math.max(1.2, r * 0.25), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Tough Concrete Walls
  for (const w of world.walls) {
    ctx.save();
    ctx.lineCap = 'square';
    ctx.lineWidth = w.thickness;
    ctx.strokeStyle =
      w.hitFlash > 0.2
        ? '#E2E8F0'
        : w.isInner
        ? '#475569'
        : '#64748B';
    ctx.beginPath();
    ctx.moveTo(w.x1, w.y1);
    ctx.lineTo(w.x2, w.y2);
    ctx.stroke();

    // Inner bevel & concrete texture highlight
    ctx.lineWidth = Math.max(2, w.thickness * 0.28);
    ctx.strokeStyle = w.hitFlash > 0.2 ? '#FFFFFF' : '#94A3B8';
    ctx.beginPath();
    ctx.moveTo(w.x1, w.y1);
    ctx.lineTo(w.x2, w.y2);
    ctx.stroke();

    // Steel rivets at wall endpoints
    ctx.fillStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.arc(w.x1, w.y1, 2.6, 0, Math.PI * 2);
    ctx.arc(w.x2, w.y2, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Pingo bumper pegs
  for (const p of world.pegs) {
    ctx.save();
    ctx.shadowColor = p.color;
    ctx.shadowBlur = p.hitFlash > 0.15 ? 20 : 8;
    ctx.fillStyle = p.hitFlash > 0.15 ? '#FFFFFF' : p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius + p.hitFlash * 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Bottom Pingo Launcher & Deflector Paddle
  ctx.save();
  ctx.fillStyle = '#1E293B';
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(
    world.paddleX - world.paddleWidth / 2,
    world.launcherY - 5,
    world.paddleWidth,
    10,
    5
  );
  ctx.fill();
  ctx.stroke();

  // Launcher cannon barrel
  ctx.translate(world.launcherX, world.launcherY);
  ctx.rotate(world.aimAngle);
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.roundRect(0, -6, 28, 12, 4);
  ctx.fill();
  ctx.restore();

  // Waves
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

  // Balls & trails
  for (const b of world.balls) {
    if (b.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(b.trail[0].x, b.trail[0].y);
      for (let i = 1; i < b.trail.length; i++) {
        ctx.lineTo(b.trail[i].x, b.trail[i].y);
      }
      ctx.strokeStyle = `hsla(${b.hue}, 92%, 66%, 0.34)`;
      ctx.lineWidth = b.radius * 0.85;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
    ctx.fillStyle = `hsl(${b.hue}, 95%, 68%)`;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(b.x - b.radius * 0.28, b.y - b.radius * 0.28, b.radius * 0.32, 0, Math.PI * 2);
    ctx.fill();
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

  if (!zenMode) {
    for (const ft of world.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = '700 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  ctx.restore();
}
