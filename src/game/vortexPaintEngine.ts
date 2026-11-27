import { soundEngine } from '../audio/soundEngine';
import { ARENA_HEIGHT, ARENA_WIDTH } from './stages';
import { FloatingText, RingWave, VortexLevelId } from './types';

export interface FluidSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hue: number;
  radius: number;
}

export interface EnergyCollector {
  id: number;
  x: number;
  y: number;
  radius: number;
  hue: number;
  count: number;
  goal: number;
  flash: number;
}

export interface VortexPaintWorld {
  sparks: FluidSpark[];
  collectors: EnergyCollector[];
  waves: RingWave[];
  floatingTexts: FloatingText[];
  levelId: VortexLevelId;
  pointerX: number;
  pointerY: number;
  pointerActive: boolean;
  repelMode: boolean;
  score: number;
  combo: number;
  maxCombo: number;
  stageClears: number;
  time: number;
}

export const VORTEX_LEVELS: Array<{
  id: VortexLevelId;
  name: string;
  desc: string;
}> = [
  { id: 'NEBULA', name: 'Twin Nebula', desc: '2 glowing cosmic collectors' },
  { id: 'FUNNEL', name: 'Vortex Funnel', desc: 'Center core + corner pools' },
  { id: 'SYMPHONY', name: 'Quad Symphony', desc: '4 corner harmonic wells' },
  { id: 'GALAXY_ARM', name: 'Spiral Twin Core', desc: '3 aligned orbital wells' },
  { id: 'ECLIPSE_EYE', name: 'Eclipse Eye (Creepy)', desc: 'Crimson pupil + 6 iris wells' },
  { id: 'PHANTOM_LOTUS', name: 'Phantom Lotus (ASMR)', desc: '5 velvet spectral lotus wells' },
  { id: 'EXTREME', name: 'Extreme Singularity', desc: '6 cosmic wells · 340 sparks!' },
  { id: 'PRISM_OCTAGON', name: '8-Well Octagon', desc: '8 wells · 400 stardust sparks!' },
  { id: 'SILK_AURORA', name: 'Silk Aurora (Relax)', desc: '3 gentle pastel ribbon wells' },
  { id: 'ZEN_RIPPLE', name: 'Zen Ripple (ASMR)', desc: 'Single calm center moon well' },
  { id: 'AURORA_CROWN', name: 'Aurora Crown (ASMR)', desc: '6-petal halo + pearl core well' },
  { id: 'CRIMSON_NEBULA', name: 'Crimson Nebula', desc: 'Twin ruby vortexes & 4 sparks' },
];

function buildCollectors(levelId: VortexLevelId): EnergyCollector[] {
  if (levelId === 'NEBULA') {
    return [
      { id: 1, x: 240, y: 310, radius: 34, hue: 190, count: 0, goal: 45, flash: 0 },
      { id: 2, x: 560, y: 310, radius: 34, hue: 42, count: 0, goal: 45, flash: 0 },
    ];
  }
  if (levelId === 'FUNNEL') {
    return [
      { id: 1, x: 400, y: 310, radius: 38, hue: 280, count: 0, goal: 55, flash: 0 },
      { id: 2, x: 150, y: 150, radius: 28, hue: 160, count: 0, goal: 30, flash: 0 },
      { id: 3, x: 650, y: 470, radius: 28, hue: 340, count: 0, goal: 30, flash: 0 },
    ];
  }
  if (levelId === 'SYMPHONY') {
    return [
      { id: 1, x: 170, y: 155, radius: 30, hue: 190, count: 0, goal: 32, flash: 0 },
      { id: 2, x: 630, y: 155, radius: 30, hue: 45, count: 0, goal: 32, flash: 0 },
      { id: 3, x: 170, y: 465, radius: 30, hue: 150, count: 0, goal: 32, flash: 0 },
      { id: 4, x: 630, y: 465, radius: 30, hue: 320, count: 0, goal: 32, flash: 0 },
    ];
  }
  if (levelId === 'GALAXY_ARM') {
    return [
      { id: 1, x: 210, y: 195, radius: 31, hue: 205, count: 0, goal: 36, flash: 0 },
      { id: 2, x: 400, y: 310, radius: 36, hue: 48, count: 0, goal: 50, flash: 0 },
      { id: 3, x: 590, y: 425, radius: 31, hue: 320, count: 0, goal: 36, flash: 0 },
    ];
  }
  if (levelId === 'ECLIPSE_EYE') {
    const wells: EnergyCollector[] = [
      { id: 1, x: 400, y: 310, radius: 40, hue: 348, count: 0, goal: 65, flash: 0 },
    ];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      wells.push({
        id: i + 2,
        x: ARENA_WIDTH / 2 + Math.cos(a) * 195,
        y: ARENA_HEIGHT / 2 + Math.sin(a) * 135,
        radius: 26,
        hue: i % 2 === 0 ? 278 : 340,
        count: 0,
        goal: 32,
        flash: 0,
      });
    }
    return wells;
  }
  if (levelId === 'PHANTOM_LOTUS') {
    const wells: EnergyCollector[] = [];
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      wells.push({
        id: i + 1,
        x: ARENA_WIDTH / 2 + Math.cos(a) * 165,
        y: ARENA_HEIGHT / 2 + Math.sin(a) * 155,
        radius: 30,
        hue: 165 + i * 28,
        count: 0,
        goal: 38,
        flash: 0,
      });
    }
    return wells;
  }
  if (levelId === 'SILK_AURORA') {
    return [
      { id: 1, x: 205, y: 310, radius: 34, hue: 175, count: 0, goal: 34, flash: 0 },
      { id: 2, x: 400, y: 215, radius: 34, hue: 215, count: 0, goal: 34, flash: 0 },
      { id: 3, x: 595, y: 310, radius: 34, hue: 285, count: 0, goal: 34, flash: 0 },
    ];
  }
  if (levelId === 'ZEN_RIPPLE') {
    return [
      { id: 1, x: 400, y: 310, radius: 44, hue: 185, count: 0, goal: 80, flash: 0 },
    ];
  }
  if (levelId === 'AURORA_CROWN') {
    const crown: EnergyCollector[] = [
      { id: 1, x: 400, y: 310, radius: 34, hue: 185, count: 0, goal: 50, flash: 0 },
    ];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      crown.push({
        id: i + 2,
        x: ARENA_WIDTH / 2 + Math.cos(a) * 185,
        y: ARENA_HEIGHT / 2 + Math.sin(a) * 155,
        radius: 26,
        hue: (165 + i * 24) % 360,
        count: 0,
        goal: 34,
        flash: 0,
      });
    }
    return crown;
  }
  if (levelId === 'CRIMSON_NEBULA') {
    return [
      { id: 1, x: 255, y: 245, radius: 34, hue: 348, count: 0, goal: 48, flash: 0 },
      { id: 2, x: 545, y: 375, radius: 34, hue: 18, count: 0, goal: 48, flash: 0 },
      { id: 3, x: 255, y: 405, radius: 26, hue: 285, count: 0, goal: 32, flash: 0 },
      { id: 4, x: 545, y: 215, radius: 26, hue: 315, count: 0, goal: 32, flash: 0 },
    ];
  }
  const wellCount = levelId === 'PRISM_OCTAGON' ? 8 : 6;
  const ring: EnergyCollector[] = [];
  for (let i = 0; i < wellCount; i++) {
    const a = (i / wellCount) * Math.PI * 2;
    ring.push({
      id: i + 1,
      x: ARENA_WIDTH / 2 + Math.cos(a) * 215,
      y: ARENA_HEIGHT / 2 + Math.sin(a) * 182,
      radius: levelId === 'PRISM_OCTAGON' ? 25 : 28,
      hue: (i * (360 / wellCount)) % 360,
      count: 0,
      goal: 38,
      flash: 0,
    });
  }
  return ring;
}

export function createVortexWorld(
  levelId: VortexLevelId = 'NEBULA',
  keepScore = 0,
  keepClears = 0
): VortexPaintWorld {
  const sparks: FluidSpark[] = [];
  const sparkTotal =
    levelId === 'PRISM_OCTAGON'
      ? 400
      : levelId === 'PHANTOM_LOTUS' || levelId === 'AURORA_CROWN'
      ? 360
      : levelId === 'EXTREME'
      ? 340
      : levelId === 'ECLIPSE_EYE' || levelId === 'CRIMSON_NEBULA'
      ? 320
      : levelId === 'SILK_AURORA' || levelId === 'ZEN_RIPPLE'
      ? 185
      : 210;
  for (let i = 0; i < sparkTotal; i++) {
    sparks.push({
      x: 60 + Math.random() * (ARENA_WIDTH - 120),
      y: 60 + Math.random() * (ARENA_HEIGHT - 120),
      vx: (Math.random() - 0.5) * 60,
      vy: (Math.random() - 0.5) * 60,
      hue:
        levelId === 'ECLIPSE_EYE' || levelId === 'CRIMSON_NEBULA'
          ? (325 + (i / sparkTotal) * 60) % 360
          : levelId === 'SILK_AURORA' || levelId === 'ZEN_RIPPLE' || levelId === 'AURORA_CROWN'
          ? (165 + (i / sparkTotal) * 115) % 360
          : (170 + (i / sparkTotal) * 180) % 360,
      radius: 2.3 + Math.random() * 1.6,
    });
  }

  return {
    sparks,
    collectors: buildCollectors(levelId),
    waves: [],
    floatingTexts: [],
    levelId,
    pointerX: ARENA_WIDTH / 2,
    pointerY: ARENA_HEIGHT / 2,
    pointerActive: false,
    repelMode: false,
    score: keepScore,
    combo: 0,
    maxCombo: 0,
    stageClears: keepClears,
    time: 0,
  };
}

export function burstVortexAt(world: VortexPaintWorld, x: number, y: number) {
  soundEngine.playSpring();
  world.waves.push({
    x,
    y,
    radius: 12,
    maxRadius: 72,
    color: world.repelMode ? '#FB7185' : '#818CF8',
    alpha: 0.48,
  });

  for (const s of world.sparks) {
    const dx = s.x - x;
    const dy = s.y - y;
    const d = Math.max(18, Math.hypot(dx, dy));
    if (d < 220) {
      const push = (1 - d / 220) * 340 * (world.repelMode ? 1 : -1);
      // Add swirl tangent + radial burst
      s.vx += (dx / d) * push - (dy / d) * 140;
      s.vy += (dy / d) * push + (dx / d) * 140;
    }
  }
}

export function stepVortexWorld(
  world: VortexPaintWorld,
  dt: number,
  swirlForce: boolean
) {
  world.time += dt;

  for (const c of world.collectors) {
    if (c.flash > 0) c.flash = Math.max(0, c.flash - dt * 5);
  }

  for (const s of world.sparks) {
    if (world.pointerActive) {
      const dx = world.pointerX - s.x;
      const dy = world.pointerY - s.y;
      const dist = Math.max(20, Math.hypot(dx, dy));
      if (dist < 260) {
        const dir = world.repelMode ? -1 : 1;
        const pull = (1 - dist / 260) * 620 * dir;
        s.vx += (dx / dist) * pull * dt;
        s.vy += (dy / dist) * pull * dt;
        if (swirlForce) {
          s.vx += (-dy / dist) * 260 * dt;
          s.vy += (dx / dist) * 260 * dt;
        }
      }
    }

    // Gentle damping so particles glide like liquid silk
    s.vx *= 1 - Math.min(0.95, dt * 1.15);
    s.vy *= 1 - Math.min(0.95, dt * 1.15);

    s.x += s.vx * dt;
    s.y += s.vy * dt;

    if (s.x < 24) {
      s.x = 24;
      s.vx = Math.abs(s.vx) * 0.8;
    } else if (s.x > ARENA_WIDTH - 24) {
      s.x = ARENA_WIDTH - 24;
      s.vx = -Math.abs(s.vx) * 0.8;
    }
    if (s.y < 24) {
      s.y = 24;
      s.vy = Math.abs(s.vy) * 0.8;
    } else if (s.y > ARENA_HEIGHT - 24) {
      s.y = ARENA_HEIGHT - 24;
      s.vy = -Math.abs(s.vy) * 0.8;
    }

    // Check collector capture
    for (const c of world.collectors) {
      if (c.count >= c.goal) continue;
      if (Math.hypot(s.x - c.x, s.y - c.y) < c.radius) {
        c.count += 1;
        c.flash = 1;
        world.score += 20;
        world.combo += 1;
        if (world.combo > world.maxCombo) world.maxCombo = world.combo;
        soundEngine.playPegHit(c.count % 14, c.count === c.goal);

        // Respawn spark softly on opposite side
        s.x = ARENA_WIDTH - s.x + (Math.random() - 0.5) * 40;
        s.y = ARENA_HEIGHT - s.y + (Math.random() - 0.5) * 40;
        s.vx = (Math.random() - 0.5) * 80;
        s.vy = (Math.random() - 0.5) * 80;
        s.hue = (c.hue + Math.random() * 40) % 360;
        break;
      }
    }
  }

  // Check if all collectors filled
  if (world.collectors.every((c) => c.count >= c.goal)) {
    soundEngine.playStageClear();
    world.score += 1000;
    world.stageClears += 1;
    world.floatingTexts.push({
      x: ARENA_WIDTH / 2,
      y: ARENA_HEIGHT / 2,
      vy: -22,
      text: `Aurora Filled +1000`,
      color: '#6EE7B7',
      alpha: 0.95,
      scale: 1.0,
    });
    const order: VortexLevelId[] = [
      'NEBULA',
      'FUNNEL',
      'SYMPHONY',
      'GALAXY_ARM',
      'ECLIPSE_EYE',
      'PHANTOM_LOTUS',
      'EXTREME',
      'PRISM_OCTAGON',
      'SILK_AURORA',
      'ZEN_RIPPLE',
    ];
    const nextId = order[(order.indexOf(world.levelId) + 1) % order.length];
    world.levelId = nextId;
    world.collectors = buildCollectors(nextId);
  }

  for (let i = world.waves.length - 1; i >= 0; i--) {
    const w = world.waves[i];
    w.radius += 160 * dt;
    w.alpha -= dt * 2.1;
    if (w.alpha <= 0) world.waves.splice(i, 1);
  }
  for (let i = world.floatingTexts.length - 1; i >= 0; i--) {
    const ft = world.floatingTexts[i];
    ft.y += ft.vy * dt;
    ft.alpha -= dt * 1.0;
    if (ft.alpha <= 0) world.floatingTexts.splice(i, 1);
  }
}

export function renderVortexWorld(
  ctx: CanvasRenderingContext2D,
  world: VortexPaintWorld,
  zenMode = false
) {
  ctx.save();

  const bg = ctx.createRadialGradient(
    ARENA_WIDTH / 2,
    ARENA_HEIGHT / 2,
    24,
    ARENA_WIDTH / 2,
    ARENA_HEIGHT / 2,
    470
  );
  bg.addColorStop(0, '#111834');
  bg.addColorStop(1, '#070A14');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, ARENA_WIDTH - 36, ARENA_HEIGHT - 28);

  // Collectors
  for (const c of world.collectors) {
    const pct = Math.min(1, c.count / c.goal);
    ctx.save();
    ctx.strokeStyle = c.flash > 0.1 ? '#FFFFFF' : `hsl(${c.hue}, 90%, 62%)`;
    ctx.lineWidth = 3;
    ctx.shadowColor = `hsla(${c.hue}, 95%, 64%, 0.65)`;
    ctx.shadowBlur = c.flash > 0.1 ? 22 : 10;

    ctx.fillStyle = `hsla(${c.hue}, 80%, 50%, ${0.12 + pct * 0.25})`;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Progress ring
    if (pct > 0) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(
        c.x,
        c.y,
        c.radius + 6,
        -Math.PI / 2,
        -Math.PI / 2 + pct * Math.PI * 2
      );
      ctx.stroke();
    }

    if (!zenMode) {
      ctx.fillStyle = '#F8FAFC';
      ctx.font = '700 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${c.count}/${c.goal}`, c.x, c.y);
    }
    ctx.restore();
  }

  // Waves
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

  // Fluid Sparks
  for (const s of world.sparks) {
    ctx.fillStyle = `hsl(${s.hue}, 95%, 68%)`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Pointer Magnet Field Ring
  if (world.pointerActive) {
    ctx.save();
    ctx.strokeStyle = world.repelMode
      ? 'rgba(251, 113, 133, 0.45)'
      : 'rgba(129, 140, 248, 0.45)';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(world.pointerX, world.pointerY, 44, 0, Math.PI * 2);
    ctx.stroke();
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
