import { soundEngine } from '../audio/soundEngine';
import { ARENA_HEIGHT, ARENA_WIDTH } from './stages';
import { Particle, PondPreset } from './types';

export const POND_LEVELS: Array<{
  id: PondPreset;
  label: string;
  desc: string;
}> = [
  { id: 'SAKURA_RAIN', label: '01. Sakura Rain', desc: 'Spring raindrops & blossom ripples' },
  { id: 'LOTUS_GARDEN', label: '02. Lotus Garden', desc: 'Drifting lily pads & golden Koi' },
  { id: 'LANTERN_DRIFT', label: '03. Lantern Drift', desc: 'Warm twilight paper lanterns' },
  { id: 'KOI_SPIRAL', label: '04. Koi Spiral', desc: 'Gentle whirlpool current dance' },
  { id: 'BAMBOO_FALLS', label: '05. Bamboo Falls', desc: 'Stepping stones & stream drops' },
  { id: 'STARLIGHT_TIDE', label: '06. Starlight Tide', desc: 'Moonlit sapphire reflections' },
  { id: 'PHANTOM_MIST', label: '07. Phantom Mist', desc: 'Moon-ghost Koi & eerie chimes' },
  { id: 'IMPERIAL_SANCTUARY', label: '08. Imperial Sanctuary', desc: '9 royal Koi, lanterns & blossoms' },
];

export type KoiPalette = 'kohaku' | 'gold' | 'sanke' | 'moonlight' | 'crimson' | 'emerald';

export interface KoiFish {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  baseSpeed: number;
  swimPhase: number;
  size: number;
  palette: KoiPalette;
  segments: Array<{ x: number; y: number }>;
  targetX: number | null;
  targetY: number | null;
  curiosityTimer: number;
}

export interface PondRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  width: number;
}

export interface PondLotus {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rot: number;
  rotSpeed: number;
  hasFlower: boolean;
  flowerHue: number;
  glow: number;
}

export interface PondPetal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotSpeed: number;
  size: number;
  hue: number;
  alpha: number;
}

export interface PondLantern {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
  hue: number;
}

export interface KoiPondWorld {
  preset: PondPreset;
  kois: KoiFish[];
  ripples: PondRipple[];
  lotuses: PondLotus[];
  petals: PondPetal[];
  lanterns: PondLantern[];
  particles: Particle[];
  rainTimer: number;
  score: number;
  combo: number;
  maxCombo: number;
  ripplesCreated: number;
  time: number;
  nextId: number;
}

function makeKoi(
  id: number,
  x: number,
  y: number,
  angle: number,
  size: number,
  palette: KoiPalette
): KoiFish {
  const segCount = 9;
  const segments: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < segCount; i++) {
    segments.push({
      x: x - Math.cos(angle) * i * size * 0.42,
      y: y - Math.sin(angle) * i * size * 0.42,
    });
  }
  return {
    id,
    x,
    y,
    angle,
    speed: 48 + Math.random() * 18,
    baseSpeed: 46 + Math.random() * 14,
    swimPhase: Math.random() * Math.PI * 2,
    size,
    palette,
    segments,
    targetX: null,
    targetY: null,
    curiosityTimer: 0,
  };
}

export function createPondWorld(
  preset: PondPreset = 'SAKURA_RAIN'
): KoiPondWorld {
  const world: KoiPondWorld = {
    preset,
    kois: [],
    ripples: [],
    lotuses: [],
    petals: [],
    lanterns: [],
    particles: [],
    rainTimer: 0.45,
    score: 0,
    combo: 0,
    maxCombo: 0,
    ripplesCreated: 0,
    time: 0,
    nextId: 1,
  };

  const palettes: KoiPalette[] =
    preset === 'PHANTOM_MIST'
      ? ['moonlight', 'emerald', 'moonlight', 'sanke', 'moonlight', 'gold']
      : ['kohaku', 'gold', 'sanke', 'crimson', 'kohaku', 'emerald', 'gold', 'moonlight', 'crimson'];

  const koiCount =
    preset === 'IMPERIAL_SANCTUARY'
      ? 9
      : preset === 'KOI_SPIRAL' || preset === 'STARLIGHT_TIDE'
      ? 7
      : 6;

  for (let i = 0; i < koiCount; i++) {
    const angle = (i / koiCount) * Math.PI * 2 + 0.4;
    const r = 95 + (i % 3) * 55;
    const x = ARENA_WIDTH / 2 + Math.cos(angle) * r;
    const y = ARENA_HEIGHT / 2 + Math.sin(angle) * r * 0.75;
    world.kois.push(
      makeKoi(
        world.nextId++,
        x,
        y,
        angle + Math.PI / 2,
        15 + (i % 3) * 2.5,
        palettes[i % palettes.length]
      )
    );
  }

  const lotusCount = preset === 'LOTUS_GARDEN' ? 9 : preset === 'IMPERIAL_SANCTUARY' ? 8 : 5;
  for (let i = 0; i < lotusCount; i++) {
    const lx = 110 + ((i * 137) % (ARENA_WIDTH - 220));
    const ly = 95 + ((i * 113) % (ARENA_HEIGHT - 190));
    world.lotuses.push({
      x: lx,
      y: ly,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      radius: 20 + (i % 3) * 5,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.14,
      hasFlower: i % 2 === 0 || preset === 'LOTUS_GARDEN',
      flowerHue: preset === 'STARLIGHT_TIDE' ? 205 : preset === 'PHANTOM_MIST' ? 275 : 335,
      glow: 0,
    });
  }

  if (
    preset === 'LANTERN_DRIFT' ||
    preset === 'STARLIGHT_TIDE' ||
    preset === 'IMPERIAL_SANCTUARY'
  ) {
    const count = preset === 'LANTERN_DRIFT' ? 6 : 4;
    for (let i = 0; i < count; i++) {
      world.lanterns.push({
        x: 100 + i * 115,
        y: 120 + (i % 3) * 145,
        vx: 8 + Math.random() * 6,
        vy: -2 + Math.random() * 4,
        size: 15 + (i % 2) * 3,
        phase: Math.random() * Math.PI * 2,
        hue: preset === 'STARLIGHT_TIDE' ? 195 : 36 + (i % 3) * 8,
      });
    }
  }

  const petalCount = preset === 'SAKURA_RAIN' || preset === 'IMPERIAL_SANCTUARY' ? 24 : 12;
  for (let i = 0; i < petalCount; i++) {
    world.petals.push({
      x: Math.random() * ARENA_WIDTH,
      y: Math.random() * ARENA_HEIGHT,
      vx: 10 + Math.random() * 14,
      vy: 6 + Math.random() * 10,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 1.4,
      size: 4 + Math.random() * 3,
      hue: preset === 'PHANTOM_MIST' ? 195 : 340,
      alpha: 0.45 + Math.random() * 0.35,
    });
  }

  return world;
}

export function spawnPondRippleAt(
  world: KoiPondWorld,
  x: number,
  y: number,
  playAudio = true
) {
  const cx = Math.max(24, Math.min(ARENA_WIDTH - 24, x));
  const cy = Math.max(24, Math.min(ARENA_HEIGHT - 24, y));

  if (world.ripples.length < 28) {
    const color =
      world.preset === 'STARLIGHT_TIDE'
        ? '#7DD3FC'
        : world.preset === 'PHANTOM_MIST'
        ? '#C4B5FD'
        : world.preset === 'LANTERN_DRIFT'
        ? '#FDE68A'
        : '#BAE6FD';
    world.ripples.push({
      x: cx,
      y: cy,
      radius: 4,
      maxRadius: 96,
      alpha: 0.62,
      color,
      width: 2.0,
    });
  }

  world.ripplesCreated += 1;
  world.combo += 1;
  if (world.combo > world.maxCombo) world.maxCombo = world.combo;
  world.score += 18;

  if (playAudio) {
    const note = Math.floor((cx / ARENA_WIDTH) * 14);
    soundEngine.playWaterDrop(note, 0.72);
  }

  // Attract nearby Koi toward ripple & gently drift lotus leaves away
  for (const k of world.kois) {
    const d = Math.hypot(cx - k.x, cy - k.y);
    if (d < 290) {
      k.targetX = cx;
      k.targetY = cy;
      k.curiosityTimer = 3.2;
      k.speed = Math.min(82, k.baseSpeed + 26);
    }
  }
  for (const l of world.lotuses) {
    const dx = l.x - cx;
    const dy = l.y - cy;
    const d = Math.hypot(dx, dy);
    if (d < 110 && d > 1) {
      l.vx += (dx / d) * 14;
      l.vy += (dy / d) * 14;
      l.glow = 0.85;
    }
  }
}

export function scatterPondPetals(world: KoiPondWorld) {
  soundEngine.playWaterDrop(12, 0.85);
  for (let i = 0; i < 6; i++) {
    const rx = 110 + Math.random() * (ARENA_WIDTH - 220);
    const ry = 90 + Math.random() * (ARENA_HEIGHT - 180);
    spawnPondRippleAt(world, rx, ry, false);
  }
  for (let i = 0; i < 14; i++) {
    if (world.petals.length > 48) world.petals.shift();
    world.petals.push({
      x: Math.random() * ARENA_WIDTH,
      y: Math.random() * ARENA_HEIGHT,
      vx: 14 + Math.random() * 16,
      vy: 8 + Math.random() * 12,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 1.8,
      size: 4.5 + Math.random() * 3.5,
      hue: world.preset === 'STARLIGHT_TIDE' ? 195 : 340,
      alpha: 0.75,
    });
  }
  world.score += 65;
}

export function clearPondRipples(world: KoiPondWorld) {
  world.ripples = [];
  world.particles = [];
}

export function stepPondWorld(
  world: KoiPondWorld,
  dt: number,
  rainEnabled: boolean,
  whirlpoolEnabled: boolean,
  reducedMotion: boolean
) {
  const cdt = Math.min(0.032, dt);
  world.time += cdt;

  // Gentle ambient raindrops
  if (rainEnabled) {
    world.rainTimer -= cdt;
    if (world.rainTimer <= 0) {
      world.rainTimer = world.preset === 'SAKURA_RAIN' ? 0.65 : 1.05;
      const rx = 70 + Math.random() * (ARENA_WIDTH - 140);
      const ry = 65 + Math.random() * (ARENA_HEIGHT - 130);
      if (world.ripples.length < 24) {
        world.ripples.push({
          x: rx,
          y: ry,
          radius: 3,
          maxRadius: 72,
          alpha: 0.44,
          color: '#BAE6FD',
          width: 1.5,
        });
      }
      if (Math.random() < 0.55) {
        soundEngine.playWaterDrop(Math.floor(Math.random() * 14), 0.36);
      }
    }
  }

  // Ripples expand cleanly & fade out smoothly
  for (let i = world.ripples.length - 1; i >= 0; i--) {
    const r = world.ripples[i];
    r.radius += 54 * cdt;
    r.alpha -= 0.34 * cdt;
    if (r.alpha <= 0 || r.radius >= r.maxRadius) {
      world.ripples.splice(i, 1);
    }
  }

  // Floating lotus lily pads
  for (const l of world.lotuses) {
    l.rot += l.rotSpeed * cdt;
    l.vx *= 1 - 0.85 * cdt;
    l.vy *= 1 - 0.85 * cdt;
    l.x += l.vx * cdt;
    l.y += l.vy * cdt;
    if (l.glow > 0) l.glow = Math.max(0, l.glow - cdt * 1.4);

    if (l.x < 50) { l.x = 50; l.vx = Math.abs(l.vx); }
    if (l.x > ARENA_WIDTH - 50) { l.x = ARENA_WIDTH - 50; l.vx = -Math.abs(l.vx); }
    if (l.y < 50) { l.y = 50; l.vy = Math.abs(l.vy); }
    if (l.y > ARENA_HEIGHT - 50) { l.y = ARENA_HEIGHT - 50; l.vy = -Math.abs(l.vy); }
  }

  // Paper lanterns
  for (const lan of world.lanterns) {
    lan.phase += cdt * 1.6;
    lan.x += (lan.vx + Math.sin(lan.phase) * 4) * cdt;
    lan.y += (lan.vy + Math.cos(lan.phase * 0.8) * 3) * cdt;
    if (lan.x > ARENA_WIDTH + 30) lan.x = -30;
    if (lan.y < 40) lan.vy = Math.abs(lan.vy);
    if (lan.y > ARENA_HEIGHT - 40) lan.vy = -Math.abs(lan.vy);
  }

  // Drifting blossoms
  for (const p of world.petals) {
    p.rot += p.rotSpeed * cdt;
    p.x += p.vx * cdt;
    p.y += p.vy * cdt;
    if (p.x > ARENA_WIDTH + 14) p.x = -14;
    if (p.y > ARENA_HEIGHT + 14) p.y = -14;
  }

  // Koi steering & silky spine kinematics
  const whirlOn = whirlpoolEnabled || world.preset === 'KOI_SPIRAL';
  for (const k of world.kois) {
    k.speed += (k.baseSpeed - k.speed) * 0.9 * cdt;
    k.swimPhase += cdt * (4.2 + k.speed * 0.045);

    if (k.curiosityTimer > 0) {
      k.curiosityTimer -= cdt;
      if (k.curiosityTimer <= 0) {
        k.targetX = null;
        k.targetY = null;
      }
    }

    let desiredAngle = k.angle;
    if (k.targetX !== null && k.targetY !== null) {
      const dx = k.targetX - k.x;
      const dy = k.targetY - k.y;
      if (Math.hypot(dx, dy) < 28) {
        k.targetX = null;
        k.targetY = null;
      } else {
        desiredAngle = Math.atan2(dy, dx);
      }
    } else if (whirlOn) {
      const dx = k.x - ARENA_WIDTH / 2;
      const dy = k.y - ARENA_HEIGHT / 2;
      const dist = Math.hypot(dx, dy) || 1;
      const tangentAngle = Math.atan2(dx, -dy);
      const pull = Math.max(-0.45, Math.min(0.45, (dist - 150) * 0.004));
      desiredAngle = tangentAngle - pull;
    } else {
      // Gentle meandering curve + soft pond wall turn
      desiredAngle = k.angle + Math.sin(world.time * 0.7 + k.id * 1.9) * 0.55 * cdt;
      const pad = 75;
      if (k.x < pad || k.x > ARENA_WIDTH - pad || k.y < pad || k.y > ARENA_HEIGHT - pad) {
        desiredAngle = Math.atan2(ARENA_HEIGHT / 2 - k.y, ARENA_WIDTH / 2 - k.x);
      }
    }

    let diff = desiredAngle - k.angle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    k.angle += Math.max(-2.1 * cdt, Math.min(2.1 * cdt, diff));

    k.x += Math.cos(k.angle) * k.speed * cdt;
    k.y += Math.sin(k.angle) * k.speed * cdt;

    // Trail wake ripple occasionally when turning fast
    if (!reducedMotion && Math.random() < 0.03 && world.ripples.length < 24) {
      world.ripples.push({
        x: k.x,
        y: k.y,
        radius: 3,
        maxRadius: 34,
        alpha: 0.22,
        color: '#7DD3FC',
        width: 1.0,
      });
    }

    // Update spine segments
    k.segments[0].x = k.x;
    k.segments[0].y = k.y;
    const segLen = k.size * 0.44;
    for (let s = 1; s < k.segments.length; s++) {
      const prev = k.segments[s - 1];
      const cur = k.segments[s];
      const dx = cur.x - prev.x;
      const dy = cur.y - prev.y;
      const d = Math.hypot(dx, dy) || 1;
      const sway = Math.sin(k.swimPhase - s * 0.65) * (s * 0.22);
      const nx = dx / d;
      const ny = dy / d;
      cur.x = prev.x + nx * segLen - ny * sway * 0.14;
      cur.y = prev.y + ny * segLen + nx * sway * 0.14;
    }

    // Gently brush lotus flowers for chime sparkles
    for (const l of world.lotuses) {
      if (Math.hypot(k.x - l.x, k.y - l.y) < l.radius + k.size * 0.5 && l.glow <= 0.05) {
        l.glow = 0.85;
        world.score += 12;
        if (Math.random() < 0.35) {
          soundEngine.playWaterDrop(Math.floor((l.x / ARENA_WIDTH) * 14), 0.35);
        }
      }
    }
  }
}

function getKoiColors(palette: KoiPalette): { body: string; accent: string; fin: string } {
  switch (palette) {
    case 'gold':
      return { body: '#FBBF24', accent: '#FEF08A', fin: 'rgba(253, 224, 71, 0.55)' };
    case 'sanke':
      return { body: '#F8FAFC', accent: '#EF4444', fin: 'rgba(226, 232, 240, 0.55)' };
    case 'moonlight':
      return { body: '#E0F2FE', accent: '#818CF8', fin: 'rgba(186, 230, 253, 0.5)' };
    case 'crimson':
      return { body: '#FB7185', accent: '#F8FAFC', fin: 'rgba(253, 164, 175, 0.55)' };
    case 'emerald':
      return { body: '#6EE7B7', accent: '#0F766E', fin: 'rgba(167, 243, 208, 0.5)' };
    default:
      return { body: '#F8FAFC', accent: '#F97316', fin: 'rgba(255, 237, 213, 0.58)' };
  }
}

export function renderPondWorld(
  ctx: CanvasRenderingContext2D,
  world: KoiPondWorld,
  zenMode = false
) {
  ctx.save();

  // Deep translucent pond water gradient
  const bg = ctx.createRadialGradient(
    ARENA_WIDTH / 2,
    ARENA_HEIGHT / 2,
    30,
    ARENA_WIDTH / 2,
    ARENA_HEIGHT / 2,
    520
  );
  if (world.preset === 'LANTERN_DRIFT') {
    bg.addColorStop(0, '#0F2537');
    bg.addColorStop(1, '#050C17');
  } else if (world.preset === 'PHANTOM_MIST') {
    bg.addColorStop(0, '#132033');
    bg.addColorStop(1, '#070B14');
  } else if (world.preset === 'STARLIGHT_TIDE') {
    bg.addColorStop(0, '#0E2845');
    bg.addColorStop(1, '#050D1E');
  } else {
    bg.addColorStop(0, '#0D2B3E');
    bg.addColorStop(1, '#05131E');
  }
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

  // Faint underwater caustics shimmer
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.strokeStyle = '#7DD3FC';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) {
    const r = 110 + i * 95 + Math.sin(world.time * 0.6 + i) * 14;
    ctx.beginPath();
    ctx.arc(ARENA_WIDTH / 2, ARENA_HEIGHT / 2, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // Stepping stones in BAMBOO_FALLS
  if (world.preset === 'BAMBOO_FALLS') {
    ctx.save();
    for (const [sx, sy, sr] of [
      [180, 180, 32],
      [620, 210, 28],
      [250, 420, 34],
      [560, 440, 30],
    ] as const) {
      ctx.fillStyle = 'rgba(30, 41, 59, 0.72)';
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  // Swim Koi fish (below surface ripples & lotus leaves!)
  for (const k of world.kois) {
    const { body, accent, fin } = getKoiColors(k.palette);
    ctx.save();

    // Subtle pond depth shadow
    ctx.save();
    ctx.globalAlpha = 0.26;
    ctx.fillStyle = '#020617';
    for (let s = 0; s < k.segments.length; s++) {
      const seg = k.segments[s];
      const rad = k.size * (1 - s / k.segments.length) * 0.56;
      ctx.beginPath();
      ctx.arc(seg.x + 8, seg.y + 10, Math.max(2, rad), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Flowing pectoral & tail fins
    const head = k.segments[0];
    const neck = k.segments[1];
    const finAngle = Math.atan2(head.y - neck.y, head.x - neck.x);
    ctx.save();
    ctx.translate(neck.x, neck.y);
    ctx.rotate(finAngle);
    ctx.fillStyle = fin;
    const flap = Math.sin(k.swimPhase) * 0.22;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(0, side * k.size * 0.58, k.size * 0.45, k.size * 0.22, side * (0.65 + flap), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Tail fan
    const tail = k.segments[k.segments.length - 1];
    const preTail = k.segments[k.segments.length - 2];
    const tailAngle = Math.atan2(tail.y - preTail.y, tail.x - preTail.x);
    ctx.save();
    ctx.translate(tail.x, tail.y);
    ctx.rotate(tailAngle);
    ctx.fillStyle = fin;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(k.size * 0.6, -k.size * 0.48, k.size * 0.95, -k.size * 0.34);
    ctx.quadraticCurveTo(k.size * 0.52, 0, k.size * 0.95, k.size * 0.34);
    ctx.quadraticCurveTo(k.size * 0.6, k.size * 0.48, 0, 0);
    ctx.fill();
    ctx.restore();

    // Smooth segmented body
    for (let s = k.segments.length - 1; s >= 0; s--) {
      const seg = k.segments[s];
      const t = s / (k.segments.length - 1);
      const rad = Math.max(2.2, k.size * (0.58 * Math.sin((1 - t * 0.85) * Math.PI * 0.65)));
      ctx.fillStyle = s === 1 || s === 4 ? accent : body;
      ctx.beginPath();
      ctx.arc(seg.x, seg.y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Water Ripples
  for (const r of world.ripples) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, r.alpha);
    ctx.strokeStyle = r.color;
    ctx.lineWidth = r.width;
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
    ctx.stroke();

    if (r.radius > 16) {
      ctx.globalAlpha = Math.max(0, r.alpha * 0.45);
      ctx.lineWidth = Math.max(0.8, r.width * 0.6);
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius * 0.62, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Floating Lily Pads & Lotus Flowers
  for (const l of world.lotuses) {
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.rotate(l.rot);
    ctx.fillStyle = l.glow > 0.1 ? 'rgba(52, 211, 153, 0.72)' : 'rgba(16, 185, 129, 0.48)';
    ctx.strokeStyle = 'rgba(167, 243, 208, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, l.radius, 0.22, Math.PI * 2 - 0.22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (l.hasFlower) {
      const petals = 6;
      ctx.shadowColor = `hsl(${l.flowerHue}, 90%, 72%)`;
      ctx.shadowBlur = 8 + l.glow * 10;
      for (let p = 0; p < petals; p++) {
        ctx.save();
        ctx.rotate((p / petals) * Math.PI * 2);
        ctx.fillStyle = `hsla(${l.flowerHue}, 92%, ${74 + l.glow * 12}%, 0.9)`;
        ctx.beginPath();
        ctx.ellipse(0, -l.radius * 0.28, l.radius * 0.18, l.radius * 0.32, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.arc(0, 0, l.radius * 0.14, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Glowing Floating Lanterns
  for (const lan of world.lanterns) {
    ctx.save();
    ctx.translate(lan.x, lan.y);
    const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, lan.size * 2.2);
    glow.addColorStop(0, `hsla(${lan.hue}, 95%, 74%, 0.55)`);
    glow.addColorStop(1, `hsla(${lan.hue}, 95%, 60%, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, lan.size * 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `hsl(${lan.hue}, 95%, 72%)`;
    ctx.strokeStyle = '#FEF9C3';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-lan.size * 0.65, -lan.size * 0.65, lan.size * 1.3, lan.size * 1.3, 4);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Drifting Sakura / Mist Petals
  for (const p of world.petals) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = `hsl(${p.hue}, 92%, 82%)`;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size, p.size * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (!zenMode) {
    ctx.save();
    ctx.fillStyle = 'rgba(226, 232, 240, 0.42)';
    ctx.font = '600 11px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Tap or glide across the water to guide the Koi', ARENA_WIDTH / 2, ARENA_HEIGHT - 16);
    ctx.restore();
  }

  ctx.restore();
}
