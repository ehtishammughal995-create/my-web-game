import { soundEngine } from '../audio/soundEngine';
import { ARENA_HEIGHT, ARENA_WIDTH } from './stages';
import { BeatLevelId, FloatingText, Particle, RingWave } from './types';

export interface BeatNote {
  id: number;
  lane: number; // 0..5 radial lanes
  dist: number; // starts at ~275, hits target ring at 82
  speed: number;
  hue: number;
  hit: boolean;
  missed: boolean;
}

export interface BeatPulseWorld {
  notes: BeatNote[];
  particles: Particle[];
  waves: RingWave[];
  floatingTexts: FloatingText[];
  levelId: BeatLevelId;
  centerX: number;
  centerY: number;
  targetRadius: number;
  laneFlash: number[]; // 6 lanes
  spawnTimer: number;
  beatStep: number;
  score: number;
  combo: number;
  maxCombo: number;
  perfectHits: number;
  shakeAmount: number;
  nextId: number;
  time: number;
}

const LANE_HUES = [330, 42, 160, 195, 265, 12];

export const BEAT_LEVELS: Array<{
  id: BeatLevelId;
  name: string;
  bpmDesc: string;
  interval: number;
  speed: number;
}> = [
  { id: 'SUNLIT', name: 'Sunlit Groove', bpmDesc: '105 BPM · Relaxed', interval: 0.56, speed: 145 },
  { id: 'LOFI_HEARTBEAT', name: 'Lo-Fi Heartbeat', bpmDesc: '88 BPM · Chill ASMR', interval: 0.66, speed: 126 },
  { id: 'CASCADE', name: 'Twin Cascade', bpmDesc: '122 BPM · Dual Lanes', interval: 0.48, speed: 175 },
  { id: 'WALTZ', name: 'Orbit Waltz', bpmDesc: '132 BPM · Spiral', interval: 0.42, speed: 195 },
  { id: 'DISCO_RING', name: 'Disco Sweep', bpmDesc: '138 BPM · Ring Chase', interval: 0.39, speed: 205 },
  { id: 'HYPER', name: 'Hyper Synth', bpmDesc: '150 BPM · Fast!', interval: 0.34, speed: 225 },
  { id: 'CHAOS_POLY', name: 'Tri-Chord Fury', bpmDesc: '172 BPM · 3-Lane Chords', interval: 0.31, speed: 245 },
  { id: 'CELESTIAL_RUSH', name: 'Celestial Rush', bpmDesc: '184 BPM · Starlight Cascade', interval: 0.27, speed: 258 },
  { id: 'EXTREME', name: 'Godspeed Overdrive', bpmDesc: '200 BPM · Extreme!', interval: 0.23, speed: 275 },
];

export function createBeatPulseWorld(levelId: BeatLevelId = 'SUNLIT'): BeatPulseWorld {
  return {
    notes: [],
    particles: [],
    waves: [],
    floatingTexts: [],
    levelId,
    centerX: ARENA_WIDTH / 2,
    centerY: ARENA_HEIGHT / 2,
    targetRadius: 84,
    laneFlash: [0, 0, 0, 0, 0, 0],
    spawnTimer: 0.25,
    beatStep: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    perfectHits: 0,
    shakeAmount: 0,
    nextId: 1,
    time: 0,
  };
}

export function triggerBeatHit(
  world: BeatPulseWorld,
  x: number | null,
  y: number | null,
  reducedMotion: boolean
) {
  let targetLane: number | null = null;
  if (x !== null && y !== null) {
    const dx = x - world.centerX;
    const dy = y - world.centerY;
    if (Math.hypot(dx, dy) > 28) {
      let ang = Math.atan2(dy, dx);
      if (ang < 0) ang += Math.PI * 2;
      targetLane = Math.round((ang / (Math.PI * 2)) * 6) % 6;
    }
  }

  // Find closest note near targetRadius (in targetLane if clicked on a lane, or any lane if Space/Center!)
  let bestNote: BeatNote | null = null;
  let bestDiff = Infinity;

  for (const n of world.notes) {
    if (n.hit || n.missed) continue;
    if (targetLane !== null && n.lane !== targetLane) continue;
    const diff = Math.abs(n.dist - world.targetRadius);
    if (diff < bestDiff && diff <= 48) {
      bestDiff = diff;
      bestNote = n;
    }
  }

  // Fallback: if clicked slightly off-lane, still catch nearest note inside timing window!
  if (!bestNote) {
    for (const n of world.notes) {
      if (n.hit || n.missed) continue;
      const diff = Math.abs(n.dist - world.targetRadius);
      if (diff < bestDiff && diff <= 42) {
        bestDiff = diff;
        bestNote = n;
      }
    }
  }

  world.waves.push({
    x: world.centerX,
    y: world.centerY,
    radius: world.targetRadius - 6,
    maxRadius: world.targetRadius + 30,
    color: bestNote ? `hsl(${bestNote.hue}, 95%, 68%)` : '#64748B',
    alpha: bestNote ? 0.48 : 0.25,
  });

  if (!bestNote) {
    world.combo = 0;
    return;
  }

  bestNote.hit = true;
  const isPerfect = bestDiff <= 20;
  world.combo += 1;
  if (world.combo > world.maxCombo) world.maxCombo = world.combo;
  if (isPerfect) world.perfectHits += 1;

  const pts = (isPerfect ? 200 : 100) * Math.min(8, Math.max(1, Math.floor(world.combo / 3) + 1));
  world.score += pts;
  world.laneFlash[bestNote.lane] = 1;

  if (!reducedMotion && isPerfect) {
    world.shakeAmount = Math.min(6, world.shakeAmount + 2.5);
  }

  soundEngine.playPegHit(world.combo, isPerfect);

  const laneAng = (bestNote.lane / 6) * Math.PI * 2;
  const nx = world.centerX + Math.cos(laneAng) * world.targetRadius;
  const ny = world.centerY + Math.sin(laneAng) * world.targetRadius;

  const pCount = reducedMotion ? 2 : 6;
  for (let i = 0; i < pCount; i++) {
    const pa = Math.random() * Math.PI * 2;
    const pspd = 45 + Math.random() * 85;
    world.particles.push({
      x: nx,
      y: ny,
      vx: Math.cos(pa) * pspd,
      vy: Math.sin(pa) * pspd,
      radius: 1.8 + Math.random() * 1.4,
      color: `hsl(${bestNote.hue}, 95%, 70%)`,
      alpha: 0.9,
      decay: 2.0,
    });
  }

  world.floatingTexts.push({
    x: nx,
    y: ny - 10,
    vy: -32,
    text: `+${pts}`,
    color: isPerfect ? '#FDE047' : '#A7F3D0',
    alpha: 1,
    scale: 1,
  });
  if (world.floatingTexts.length > 8) {
    world.floatingTexts.shift();
  }
}

export function stepBeatPulseWorld(
  world: BeatPulseWorld,
  dt: number,
  autoPlay: boolean,
  reducedMotion: boolean,
  zenMode = false
) {
  world.time += dt;
  if (zenMode) {
    world.shakeAmount = 0;
  } else if (world.shakeAmount > 0) {
    world.shakeAmount = Math.max(0, world.shakeAmount - dt * 28);
  }

  for (let i = 0; i < 6; i++) {
    if (world.laneFlash[i] > 0) {
      world.laneFlash[i] = Math.max(0, world.laneFlash[i] - dt * 5);
    }
  }

  const levelCfg = BEAT_LEVELS.find((l) => l.id === world.levelId) ?? BEAT_LEVELS[0];
  world.spawnTimer -= dt;
  if (world.spawnTimer <= 0) {
    world.spawnTimer = levelCfg.interval;
    world.beatStep += 1;

    const lane =
      world.levelId === 'WALTZ' ||
      world.levelId === 'HYPER' ||
      world.levelId === 'DISCO_RING' ||
      world.levelId === 'CELESTIAL_RUSH'
        ? world.beatStep % 6
        : world.levelId === 'LOFI_HEARTBEAT'
        ? (world.beatStep * 2) % 6
        : Math.floor(Math.random() * 6);

    world.notes.push({
      id: world.nextId++,
      lane,
      dist: 270,
      speed: levelCfg.speed,
      hue: LANE_HUES[lane],
      hit: false,
      missed: false,
    });

    if (
      (world.levelId === 'CASCADE' && world.beatStep % 3 === 0) ||
      (world.levelId === 'LOFI_HEARTBEAT' && world.beatStep % 4 === 0) ||
      ((world.levelId === 'EXTREME' || world.levelId === 'CELESTIAL_RUSH') && world.beatStep % 2 === 0)
    ) {
      const opposite = (lane + 3) % 6;
      world.notes.push({
        id: world.nextId++,
        lane: opposite,
        dist: 270,
        speed: levelCfg.speed,
        hue: LANE_HUES[opposite],
        hit: false,
        missed: false,
      });
    } else if (world.levelId === 'CHAOS_POLY' && world.beatStep % 2 === 0) {
      for (const offset of [2, 4]) {
        const triLane = (lane + offset) % 6;
        world.notes.push({
          id: world.nextId++,
          lane: triLane,
          dist: 270,
          speed: levelCfg.speed,
          hue: LANE_HUES[triLane],
          hit: false,
          missed: false,
        });
      }
    }
  }

  for (const n of world.notes) {
    if (n.hit || n.missed) continue;
    n.dist -= n.speed * dt;

    if (autoPlay && Math.abs(n.dist - world.targetRadius) <= 7) {
      triggerBeatHit(world, null, null, reducedMotion);
    } else if (n.dist < world.targetRadius - 36) {
      n.missed = true;
      if (!zenMode) {
        world.combo = 0;
      }
    }
  }

  world.notes = world.notes.filter((n) => !n.hit && !n.missed);

  for (let i = world.particles.length - 1; i >= 0; i--) {
    const p = world.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.alpha -= p.decay * dt;
    if (p.alpha <= 0) world.particles.splice(i, 1);
  }
  for (let i = world.waves.length - 1; i >= 0; i--) {
    const w = world.waves[i];
    w.radius += 140 * dt;
    w.alpha -= dt * 2.2;
    if (w.alpha <= 0) world.waves.splice(i, 1);
  }
  for (let i = world.floatingTexts.length - 1; i >= 0; i--) {
    const ft = world.floatingTexts[i];
    ft.y += ft.vy * dt;
    ft.alpha -= dt * 1.15;
    if (ft.alpha <= 0) world.floatingTexts.splice(i, 1);
  }
}

export function renderBeatPulseWorld(
  ctx: CanvasRenderingContext2D,
  world: BeatPulseWorld
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
    20,
    world.centerX,
    world.centerY,
    460
  );
  bg.addColorStop(0, '#1D1536');
  bg.addColorStop(1, '#080B18');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, ARENA_WIDTH - 36, ARENA_HEIGHT - 28);

  // 6 Radial Lanes
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const flash = world.laneFlash[i];
    ctx.save();
    ctx.strokeStyle =
      flash > 0.1
        ? `hsla(${LANE_HUES[i]}, 95%, 70%, ${0.35 + flash * 0.6})`
        : 'rgba(148, 163, 184, 0.14)';
    ctx.lineWidth = 2 + flash * 3;
    ctx.beginPath();
    ctx.moveTo(
      world.centerX + Math.cos(ang) * 32,
      world.centerY + Math.sin(ang) * 32
    );
    ctx.lineTo(
      world.centerX + Math.cos(ang) * 275,
      world.centerY + Math.sin(ang) * 275
    );
    ctx.stroke();
    ctx.restore();
  }

  // Target Pulse Ring
  const beatGlow = 1 + Math.sin(world.time * 6) * 0.03;
  ctx.save();
  ctx.strokeStyle = '#FDE047';
  ctx.shadowColor = 'rgba(253, 224, 71, 0.5)';
  ctx.shadowBlur = 14;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(
    world.centerX,
    world.centerY,
    world.targetRadius * beatGlow,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  // Center Core
  ctx.fillStyle = '#F472B6';
  ctx.shadowColor = '#F472B6';
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.arc(world.centerX, world.centerY, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

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

  // Incoming Beat Notes
  for (const n of world.notes) {
    const ang = (n.lane / 6) * Math.PI * 2;
    const nx = world.centerX + Math.cos(ang) * n.dist;
    const ny = world.centerY + Math.sin(ang) * n.dist;
    const inZone = Math.abs(n.dist - world.targetRadius) <= 22;

    ctx.save();
    ctx.fillStyle = inZone ? '#FFFFFF' : `hsl(${n.hue}, 95%, 64%)`;
    ctx.strokeStyle = `hsl(${n.hue}, 95%, 78%)`;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = `hsla(${n.hue}, 95%, 68%, 0.85)`;
    ctx.shadowBlur = inZone ? 20 : 12;
    ctx.beginPath();
    ctx.arc(nx, ny, inZone ? 14 : 11.5, 0, Math.PI * 2);
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
    ctx.globalAlpha = Math.max(0, ft.alpha * 0.88);
    ctx.font = '700 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }

  ctx.restore();
}
