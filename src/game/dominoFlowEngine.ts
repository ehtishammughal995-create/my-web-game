import { soundEngine } from '../audio/soundEngine';
import { ARENA_HEIGHT, ARENA_WIDTH } from './stages';
import { DominoPreset, FloatingText, Particle, RingWave } from './types';

export interface DominoPiece {
  id: number;
  x: number;
  y: number;
  angle: number; // orientation tangent along chain
  hue: number;
  state: 'standing' | 'falling' | 'fallen';
  fallProgress: number; // 0..1
  fallDirAngle: number;
}

export interface DominoWorld {
  pieces: DominoPiece[];
  particles: Particle[];
  waves: RingWave[];
  floatingTexts: FloatingText[];
  preset: DominoPreset;
  toppledCount: number;
  score: number;
  combo: number;
  maxCombo: number;
  running: boolean;
  lastDrawPoint: { x: number; y: number } | null;
  nextId: number;
  time: number;
}

function buildSpiral(): DominoPiece[] {
  const pieces: DominoPiece[] = [];
  const count = 95;
  const cx = ARENA_WIDTH / 2;
  const cy = ARENA_HEIGHT / 2;

  for (let i = 0; i < count; i++) {
    const t = i / count;
    const theta = t * Math.PI * 6.5;
    const r = 34 + t * 230;
    const x = cx + Math.cos(theta) * r;
    const y = cy + Math.sin(theta) * r * 0.88;
    pieces.push({
      id: i + 1,
      x,
      y,
      angle: theta + Math.PI / 2,
      hue: (i * 4.5) % 360,
      state: 'standing',
      fallProgress: 0,
      fallDirAngle: theta + Math.PI / 2,
    });
  }
  return pieces;
}

function buildSerpent(): DominoPiece[] {
  const pieces: DominoPiece[] = [];
  const rows = 5;
  let id = 1;

  for (let row = 0; row < rows; row++) {
    const y = 115 + row * 95;
    const goRight = row % 2 === 0;
    const steps = 22;
    for (let s = 0; s < steps; s++) {
      const t = s / (steps - 1);
      const x = goRight ? 110 + t * 580 : 690 - t * 580;
      const waveY = y + Math.sin(t * Math.PI * 2) * 16;
      pieces.push({
        id: id++,
        x,
        y: waveY,
        angle: goRight ? 0 : Math.PI,
        hue: (id * 4) % 360,
        state: 'standing',
        fallProgress: 0,
        fallDirAngle: goRight ? 0 : Math.PI,
      });
    }
    // Smooth curve connector to next row
    if (row < rows - 1) {
      const turnX = goRight ? 705 : 95;
      const midY = y + 47.5;
      for (let a = 1; a <= 4; a++) {
        const ang = (a / 5) * Math.PI - Math.PI / 2;
        const cx = turnX + Math.cos(ang) * (goRight ? 36 : -36);
        const cy = midY + Math.sin(ang) * 44;
        pieces.push({
          id: id++,
          x: cx,
          y: cy,
          angle: Math.PI / 2,
          hue: (id * 4) % 360,
          state: 'standing',
          fallProgress: 0,
          fallDirAngle: Math.PI / 2,
        });
      }
    }
  }
  return pieces;
}

function buildDiamondRing(): DominoPiece[] {
  const pieces: DominoPiece[] = [];
  const cx = ARENA_WIDTH / 2;
  const cy = ARENA_HEIGHT / 2;
  let id = 1;

  const rings = [85, 145, 210];
  rings.forEach((radius, rIdx) => {
    const count = 24 + rIdx * 12;
    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2;
      pieces.push({
        id: id++,
        x: cx + Math.cos(theta) * radius * 1.12,
        y: cy + Math.sin(theta) * radius * 0.9,
        angle: theta + Math.PI / 2,
        hue: (rIdx * 95 + i * 5) % 360,
        state: 'standing',
        fallProgress: 0,
        fallDirAngle: theta + Math.PI / 2,
      });
    }
  });
  return pieces;
}

function buildHelix(): DominoPiece[] {
  const pieces: DominoPiece[] = [];
  let id = 1;
  const steps = 46;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const x = 90 + t * 620;
    const y1 = ARENA_HEIGHT / 2 + Math.sin(t * Math.PI * 3.5) * 125;
    const y2 = ARENA_HEIGHT / 2 - Math.sin(t * Math.PI * 3.5) * 125;
    pieces.push({
      id: id++,
      x,
      y: y1,
      angle: 0,
      hue: (i * 7) % 360,
      state: 'standing',
      fallProgress: 0,
      fallDirAngle: 0,
    });
    pieces.push({
      id: id++,
      x,
      y: y2,
      angle: 0,
      hue: (180 + i * 7) % 360,
      state: 'standing',
      fallProgress: 0,
      fallDirAngle: 0,
    });
  }
  return pieces;
}

function buildStarburst(): DominoPiece[] {
  const pieces: DominoPiece[] = [];
  const cx = ARENA_WIDTH / 2;
  const cy = ARENA_HEIGHT / 2;
  let id = 1;
  const arms = 8;
  const perArm = 11;

  // Center trigger piece
  pieces.push({
    id: id++,
    x: cx,
    y: cy,
    angle: 0,
    hue: 45,
    state: 'standing',
    fallProgress: 0,
    fallDirAngle: 0,
  });

  for (let a = 0; a < arms; a++) {
    const ang = (a / arms) * Math.PI * 2;
    for (let s = 1; s <= perArm; s++) {
      const r = s * 23;
      pieces.push({
        id: id++,
        x: cx + Math.cos(ang) * r,
        y: cy + Math.sin(ang) * r * 0.88,
        angle: ang,
        hue: (a * 42 + s * 10) % 360,
        state: 'standing',
        fallProgress: 0,
        fallDirAngle: ang,
      });
    }
  }
  return pieces;
}

function buildHeartwave(): DominoPiece[] {
  const pieces: DominoPiece[] = [];
  const cx = ARENA_WIDTH / 2;
  const cy = ARENA_HEIGHT / 2 + 10;
  let id = 1;
  // Two nested parametric heart-curves + center bridge!
  for (const scale of [9.5, 14.5]) {
    const count = scale > 11 ? 76 : 48;
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      pieces.push({
        id: id++,
        x: cx + hx * scale,
        y: cy + hy * scale,
        angle: t,
        hue: (i * 5 + (scale > 11 ? 180 : 0)) % 360,
        state: 'standing',
        fallProgress: 0,
        fallDirAngle: t,
      });
    }
  }
  // Bridge connecting inner and outer heart at top cleft & bottom tip so both cascade in one wave
  for (const by of [cy - 54, cy - 72, cy + 162, cy + 190, cy + 218]) {
    pieces.push({
      id: id++,
      x: cx,
      y: by,
      angle: Math.PI / 2,
      hue: 340,
      state: 'standing',
      fallProgress: 0,
      fallDirAngle: Math.PI / 2,
    });
  }
  return pieces;
}

function buildMegaloop(): DominoPiece[] {
  const pieces: DominoPiece[] = [];
  const cx = ARENA_WIDTH / 2;
  const cy = ARENA_HEIGHT / 2;
  let id = 1;
  const arms = 2;
  for (let arm = 0; arm < arms; arm++) {
    const count = 105;
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const theta = t * Math.PI * 7.2 + arm * Math.PI;
      const r = 24 + t * 238;
      pieces.push({
        id: id++,
        x: cx + Math.cos(theta) * r,
        y: cy + Math.sin(theta) * r * 0.88,
        angle: theta + Math.PI / 2,
        hue: (i * 3.5 + arm * 180) % 360,
        state: 'standing',
        fallProgress: 0,
        fallDirAngle: theta + Math.PI / 2,
      });
    }
  }
  return pieces;
}

function buildSpiderweb(): DominoPiece[] {
  const pieces: DominoPiece[] = [];
  const cx = ARENA_WIDTH / 2;
  const cy = ARENA_HEIGHT / 2;
  let id = 1;

  // Center core trigger
  pieces.push({
    id: id++,
    x: cx,
    y: cy,
    angle: 0,
    hue: 285,
    state: 'standing',
    fallProgress: 0,
    fallDirAngle: 0,
  });

  // 8 radial silk spokes
  const spokes = 8;
  for (let s = 0; s < spokes; s++) {
    const ang = (s / spokes) * Math.PI * 2;
    for (let step = 1; step <= 9; step++) {
      const r = step * 26;
      pieces.push({
        id: id++,
        x: cx + Math.cos(ang) * r,
        y: cy + Math.sin(ang) * r * 0.88,
        angle: ang,
        hue: (270 + step * 9 + (s % 2) * 35) % 360,
        state: 'standing',
        fallProgress: 0,
        fallDirAngle: ang,
      });
    }
  }

  // Concentric silk ring connectors
  for (const r of [92, 168, 232]) {
    const count = Math.round(r * 0.16);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r * 0.88;
      if (pieces.some((p) => Math.hypot(p.x - x, p.y - y) < 20)) continue;
      pieces.push({
        id: id++,
        x,
        y,
        angle: a + Math.PI / 2,
        hue: (320 + i * 6) % 360,
        state: 'standing',
        fallProgress: 0,
        fallDirAngle: a + Math.PI / 2,
      });
    }
  }
  return pieces;
}

function buildGhostRing(): DominoPiece[] {
  const pieces: DominoPiece[] = [];
  const cx = ARENA_WIDTH / 2;
  const cy = ARENA_HEIGHT / 2;
  let id = 1;

  // Nested spectral figure-8 / infinity wave + outer ring
  const lemniscateCount = 86;
  for (let i = 0; i < lemniscateCount; i++) {
    const t = (i / lemniscateCount) * Math.PI * 2;
    const scale = 250 / (1 + Math.sin(t) * Math.sin(t));
    const x = cx + scale * Math.cos(t);
    const y = cy + scale * Math.sin(t) * Math.cos(t) * 1.15;
    pieces.push({
      id: id++,
      x,
      y,
      angle: t,
      hue: (175 + i * 3) % 360,
      state: 'standing',
      fallProgress: 0,
      fallDirAngle: t,
    });
  }

  // Outer ghostly crescent ring
  const outerCount = 52;
  for (let i = 0; i < outerCount; i++) {
    const a = (i / outerCount) * Math.PI * 2;
    pieces.push({
      id: id++,
      x: cx + Math.cos(a) * 285,
      y: cy + Math.sin(a) * 235,
      angle: a + Math.PI / 2,
      hue: (265 + i * 4) % 360,
      state: 'standing',
      fallProgress: 0,
      fallDirAngle: a + Math.PI / 2,
    });
  }

  return pieces;
}

function buildAuroraWave(): DominoPiece[] {
  const pieces: DominoPiece[] = [];
  let id = 1;
  // 3 parallel gentle aurora curtains sweeping side to side
  for (let row = 0; row < 3; row++) {
    const baseY = 165 + row * 145;
    const steps = 34;
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const x = 95 + t * 610;
      const y = baseY + Math.sin(t * Math.PI * 3 + row * 0.9) * 38;
      pieces.push({
        id: id++,
        x,
        y,
        angle: 0,
        hue: (165 + row * 48 + i * 3) % 360,
        state: 'standing',
        fallProgress: 0,
        fallDirAngle: 0,
      });
    }
  }
  return pieces;
}

function buildLotusPetals(): DominoPiece[] {
  const pieces: DominoPiece[] = [];
  const cx = ARENA_WIDTH / 2;
  const cy = ARENA_HEIGHT / 2;
  let id = 1;

  pieces.push({
    id: id++,
    x: cx,
    y: cy,
    angle: 0,
    hue: 48,
    state: 'standing',
    fallProgress: 0,
    fallDirAngle: 0,
  });

  // 6 blooming lotus curves radiating smoothly from center
  const petals = 6;
  for (let p = 0; p < petals; p++) {
    const baseA = (p / petals) * Math.PI * 2;
    for (let s = 1; s <= 16; s++) {
      const t = s / 16;
      const r = 24 + t * 215;
      const curve = Math.sin(t * Math.PI) * 0.42;
      const a = baseA + curve;
      pieces.push({
        id: id++,
        x: cx + Math.cos(a) * r,
        y: cy + Math.sin(a) * r * 0.88,
        angle: a,
        hue: (170 + p * 32 + s * 6) % 360,
        state: 'standing',
        fallProgress: 0,
        fallDirAngle: a,
      });
    }
  }
  return pieces;
}

function buildDoubleSpiral(): DominoPiece[] {
  const pieces: DominoPiece[] = [];
  const cx = ARENA_WIDTH / 2;
  const cy = ARENA_HEIGHT / 2;
  let id = 1;

  pieces.push({
    id: id++,
    x: cx,
    y: cy,
    angle: 0,
    hue: 48,
    state: 'standing',
    fallProgress: 0,
    fallDirAngle: 0,
  });

  // Two counter-interlocking spiral arms fanning outward from the heart
  for (let arm = 0; arm < 2; arm++) {
    const offset = arm * Math.PI;
    for (let i = 1; i <= 54; i++) {
      const t = i / 54;
      const a = offset + t * Math.PI * 3.8;
      const r = 24 + t * 225;
      pieces.push({
        id: id++,
        x: cx + Math.cos(a) * r,
        y: cy + Math.sin(a) * r * 0.85,
        angle: a + Math.PI / 2,
        hue: (arm * 165 + i * 4) % 360,
        state: 'standing',
        fallProgress: 0,
        fallDirAngle: a + Math.PI / 2,
      });
    }
  }
  return pieces;
}

function buildButterfly(): DominoPiece[] {
  const pieces: DominoPiece[] = [];
  const cx = ARENA_WIDTH / 2;
  const cy = ARENA_HEIGHT / 2;
  let id = 1;

  // Spine from center
  for (let s = -2; s <= 2; s++) {
    pieces.push({
      id: id++,
      x: cx,
      y: cy + s * 22,
      angle: 0,
      hue: 48,
      state: 'standing',
      fallProgress: 0,
      fallDirAngle: 0,
    });
  }

  // Twin symmetric butterfly wings (inner + outer loops)
  for (const side of [-1, 1]) {
    for (let ring = 0; ring < 2; ring++) {
      const steps = ring === 0 ? 28 : 42;
      const scale = ring === 0 ? 118 : 198;
      for (let i = 0; i < steps; i++) {
        const t = (i / steps) * Math.PI * 2;
        const r = scale * (0.75 + 0.35 * Math.cos(2 * t));
        const x = cx + side * (54 + Math.abs(Math.cos(t)) * r * 0.92);
        const y = cy + Math.sin(t) * r * 0.88;
        if (pieces.some((p) => Math.hypot(p.x - x, p.y - y) < 20)) continue;
        pieces.push({
          id: id++,
          x,
          y,
          angle: t,
          hue: (side > 0 ? 180 : 300) + i * 4,
          state: 'standing',
          fallProgress: 0,
          fallDirAngle: t,
        });
      }
    }
  }
  return pieces;
}

export function createDominoWorld(preset: DominoPreset = 'SPIRAL'): DominoWorld {
  const pieces =
    preset === 'SPIRAL'
      ? buildSpiral()
      : preset === 'SERPENT'
      ? buildSerpent()
      : preset === 'RINGS'
      ? buildDiamondRing()
      : preset === 'HELIX'
      ? buildHelix()
      : preset === 'STARBURST'
      ? buildStarburst()
      : preset === 'HEARTWAVE'
      ? buildHeartwave()
      : preset === 'MEGALOOP'
      ? buildMegaloop()
      : preset === 'SPIDERWEB'
      ? buildSpiderweb()
      : preset === 'GHOST_RING'
      ? buildGhostRing()
      : preset === 'AURORA_WAVE'
      ? buildAuroraWave()
      : preset === 'LOTUS_PETALS'
      ? buildLotusPetals()
      : preset === 'DOUBLE_SPIRAL'
      ? buildDoubleSpiral()
      : preset === 'BUTTERFLY'
      ? buildButterfly()
      : [];

  return {
    pieces,
    particles: [],
    waves: [],
    floatingTexts: [],
    preset,
    toppledCount: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    running: false,
    lastDrawPoint: null,
    nextId: pieces.length + 10,
    time: 0,
  };
}

export function addDominoAt(world: DominoWorld, x: number, y: number) {
  if (world.pieces.length >= 240) return;
  const clampedX = Math.max(48, Math.min(ARENA_WIDTH - 48, x));
  const clampedY = Math.max(48, Math.min(ARENA_HEIGHT - 48, y));

  if (world.lastDrawPoint) {
    const dx = clampedX - world.lastDrawPoint.x;
    const dy = clampedY - world.lastDrawPoint.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 22) return;
    const angle = Math.atan2(dy, dx);
    world.pieces.push({
      id: world.nextId++,
      x: clampedX,
      y: clampedY,
      angle,
      hue: (world.pieces.length * 6) % 360,
      state: 'standing',
      fallProgress: 0,
      fallDirAngle: angle,
    });
    soundEngine.playPlaceToy();
  } else {
    world.pieces.push({
      id: world.nextId++,
      x: clampedX,
      y: clampedY,
      angle: 0,
      hue: (world.pieces.length * 6) % 360,
      state: 'standing',
      fallProgress: 0,
      fallDirAngle: 0,
    });
    soundEngine.playPlaceToy();
  }
  world.lastDrawPoint = { x: clampedX, y: clampedY };
}

export function toppleNearestDomino(world: DominoWorld, x: number, y: number) {
  if (world.pieces.length === 0) return;
  let best: DominoPiece | null = null;
  let bestDist = Infinity;

  for (const p of world.pieces) {
    if (p.state !== 'standing') continue;
    const d = Math.hypot(p.x - x, p.y - y);
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }

  if (best && bestDist < 120) {
    best.state = 'falling';
    world.running = true;
    soundEngine.playLaunch();
  } else {
    // Topple first standing piece
    const first = world.pieces.find((p) => p.state === 'standing');
    if (first) {
      first.state = 'falling';
      world.running = true;
      soundEngine.playLaunch();
    }
  }
}

export function stepDominoWorld(
  world: DominoWorld,
  dt: number,
  reducedMotion: boolean
) {
  world.time += dt;

  const fallRate = 5.4; // super snappy ~185ms fall per domino!
  for (const p of world.pieces) {
    if (p.state === 'falling') {
      const prevProg = p.fallProgress;
      p.fallProgress = Math.min(1, p.fallProgress + fallRate * dt);

      // Trigger adjacent standing dominoes halfway through the fall
      if (prevProg < 0.45 && p.fallProgress >= 0.45) {
        for (const other of world.pieces) {
          if (other.id === p.id || other.state !== 'standing') continue;
          const d = Math.hypot(other.x - p.x, other.y - p.y);
          if (d <= 40) {
            other.state = 'falling';
            other.fallDirAngle = Math.atan2(other.y - p.y, other.x - p.x);
          }
        }
      }

      if (p.fallProgress >= 1) {
        p.state = 'fallen';
        world.toppledCount += 1;
        world.combo += 1;
        if (world.combo > world.maxCombo) world.maxCombo = world.combo;
        world.score += 50;

        soundEngine.playPegHit(world.combo, false);

        const pCount = reducedMotion ? 2 : 5;
        for (let k = 0; k < pCount; k++) {
          const a = Math.random() * Math.PI * 2;
          world.particles.push({
            x: p.x,
            y: p.y,
            vx: Math.cos(a) * 90,
            vy: Math.sin(a) * 90,
            radius: 2,
            color: `hsl(${p.hue}, 95%, 68%)`,
            alpha: 1,
            decay: 2.0,
          });
        }

        if (world.toppledCount === world.pieces.length) {
          soundEngine.playStageClear();
          world.score += 500;
          world.waves.push({
            x: ARENA_WIDTH / 2,
            y: ARENA_HEIGHT / 2,
            radius: 24,
            maxRadius: 110,
            color: '#34D399',
            alpha: 0.5,
          });
          world.floatingTexts.push({
            x: ARENA_WIDTH / 2,
            y: ARENA_HEIGHT / 2,
            vy: -20,
            text: `All ${world.pieces.length} Toppled +500`,
            color: '#6EE7B7',
            alpha: 0.95,
            scale: 1.0,
          });
        }
      }
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
    w.radius += 260 * dt;
    w.alpha -= dt * 1.4;
    if (w.alpha <= 0) world.waves.splice(i, 1);
  }
  for (let i = world.floatingTexts.length - 1; i >= 0; i--) {
    const ft = world.floatingTexts[i];
    ft.y += ft.vy * dt;
    ft.alpha -= dt * 0.9;
    if (ft.alpha <= 0) world.floatingTexts.splice(i, 1);
  }
}

export function renderDominoWorld(
  ctx: CanvasRenderingContext2D,
  world: DominoWorld
) {
  ctx.save();

  const bg = ctx.createRadialGradient(
    ARENA_WIDTH / 2,
    ARENA_HEIGHT / 2,
    30,
    ARENA_WIDTH / 2,
    ARENA_HEIGHT / 2,
    460
  );
  bg.addColorStop(0, '#141D35');
  bg.addColorStop(1, '#080C18');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, ARENA_WIDTH - 36, ARENA_HEIGHT - 28);

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

  // Draw Dominoes
  for (const p of world.pieces) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.fallDirAngle);

    const lean = p.fallProgress * 14;
    const alpha = p.state === 'fallen' ? 0.52 : 1;
    ctx.globalAlpha = alpha;

    ctx.fillStyle = `hsl(${p.hue}, 88%, ${p.state === 'falling' ? 76 : 58}%)`;
    ctx.strokeStyle = p.state === 'standing' ? '#FFFFFF' : `hsl(${p.hue}, 95%, 75%)`;
    ctx.lineWidth = 1.4;
    if (p.state === 'falling') {
      ctx.shadowColor = `hsl(${p.hue}, 95%, 66%)`;
      ctx.shadowBlur = 14;
    }

    const w = 7 + lean;
    const h = 19 - p.fallProgress * 6;
    ctx.beginPath();
    ctx.roundRect(-3.5 + lean * 0.5, -h / 2, w, h, 2.5);
    ctx.fill();
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

  ctx.restore();
}
