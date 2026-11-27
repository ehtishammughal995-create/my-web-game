import { soundEngine } from '../audio/soundEngine';
import { ARENA_HEIGHT, ARENA_WIDTH } from './stages';
import {
  FloatingText,
  Particle,
  RingWave,
  VacuumPreset,
} from './types';

export type VacuumItemKind =
  | 'gem'
  | 'ring'
  | 'star'
  | 'pinata'
  | 'magnet'
  | 'monolith';

export interface VacuumItem {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  tier: number; // minimum hole tier needed to swallow (1..5)
  hue: number;
  kind: VacuumItemKind;
  angle: number;
  spin: number;
  beingPulled: boolean;
  swallowScale: number; // 1 -> 0 as pulled into center
}

export interface VacuumWorld {
  items: VacuumItem[];
  particles: Particle[];
  waves: RingWave[];
  floatingTexts: FloatingText[];
  preset: VacuumPreset;
  holeX: number;
  holeY: number;
  targetX: number;
  targetY: number;
  holeRadius: number;
  targetRadius: number;
  mass: number;
  tier: number;
  magnetTimer: number;
  pulseTimer: number;
  swallowedCount: number;
  totalInitialItems: number;
  stageClears: number;
  score: number;
  combo: number;
  comboTimer: number;
  maxCombo: number;
  shakeAmount: number;
  clearDelayTimer: number;
  nextId: number;
  time: number;
}

export const VACUUM_LEVEL_NAMES: Array<{
  id: VacuumPreset;
  label: string;
  desc: string;
}> = [
  { id: 'CLASSIC', label: '01. Neon Buffet', desc: 'Balanced gems & blocks' },
  { id: 'MANDALA', label: '02. Crystal Mandala', desc: 'Concentric jewel rings' },
  { id: 'PINATA', label: '03. Pinata Vault', desc: 'Exploding gem chests' },
  { id: 'METEOR', label: '04. Meteor Storm', desc: 'Swirling cosmic orbits' },
  { id: 'SHADOW_SWARM', label: '05. Shadow Swarm (Creepy)', desc: 'Circling monoliths & void eyes' },
  { id: 'ASMR_PEARLS', label: '06. Velvet ASMR Pearls', desc: 'Silky spiral pearl chains' },
  { id: 'CRYSTAL_RINGS', label: '07. Crystal Halo Rings', desc: 'Rotating orbital gem rings' },
  { id: 'NEON_METROPOLIS', label: '08. Neon Metropolis', desc: 'Grid towers & pinata plazas' },
  { id: 'EXTREME', label: '09. Galactic Supernova', desc: '260+ rapid-growth feast' },
];

export const VACUUM_TIERS = [
  { tier: 1, name: 'Spark', minRadius: 20, minMass: 0 },
  { tier: 2, name: 'Comet', minRadius: 29, minMass: 24 },
  { tier: 3, name: 'Nebula', minRadius: 40, minMass: 68 },
  { tier: 4, name: 'Nova', minRadius: 53, minMass: 138 },
  { tier: 5, name: 'Titan', minRadius: 68, minMass: 240 },
  { tier: 6, name: 'Galaxy', minRadius: 84, minMass: 380 },
];

function computeTierFromMass(mass: number): { tier: number; radius: number } {
  let active = VACUUM_TIERS[0];
  for (const t of VACUUM_TIERS) {
    if (mass >= t.minMass) active = t;
  }
  const idx = active.tier - 1;
  const next = VACUUM_TIERS[idx + 1];
  let radius = active.minRadius;
  if (next) {
    const frac = Math.max(
      0,
      Math.min(1, (mass - active.minMass) / Math.max(1, next.minMass - active.minMass))
    );
    radius = active.minRadius + (next.minRadius - active.minRadius) * frac;
  } else {
    radius = Math.min(104, active.minRadius + (mass - active.minMass) * 0.05);
  }
  return { tier: active.tier, radius };
}

function makeItem(
  id: number,
  x: number,
  y: number,
  tier: number,
  kind: VacuumItemKind,
  hue: number,
  vx = 0,
  vy = 0
): VacuumItem {
  const radius =
    kind === 'pinata'
      ? 16
      : kind === 'magnet'
      ? 14
      : 6.5 + (tier - 1) * 4.8;
  return {
    id,
    x,
    y,
    vx,
    vy,
    radius,
    tier,
    hue,
    kind,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 2.2,
    beingPulled: false,
    swallowScale: 1,
  };
}

export function createVacuumWorld(
  preset: VacuumPreset = 'CLASSIC',
  keepScore = 0,
  keepMaxCombo = 0,
  keepClears = 0
): VacuumWorld {
  const items: VacuumItem[] = [];
  let nextId = 1;
  const cx = ARENA_WIDTH / 2;
  const cy = ARENA_HEIGHT / 2;

  const isSafeFromCenter = (x: number, y: number, minD = 52) =>
    Math.hypot(x - cx, y - cy) >= minD;

  if (preset === 'MANDALA') {
    const rings = [
      { count: 14, r: 75, tier: 1, kind: 'gem' as const },
      { count: 22, r: 120, tier: 1, kind: 'ring' as const },
      { count: 28, r: 168, tier: 2, kind: 'star' as const },
      { count: 32, r: 215, tier: 2, kind: 'gem' as const },
      { count: 28, r: 260, tier: 3, kind: 'monolith' as const },
      { count: 16, r: 300, tier: 4, kind: 'monolith' as const },
    ];
    for (let ri = 0; ri < rings.length; ri++) {
      const ring = rings[ri];
      for (let i = 0; i < ring.count; i++) {
        const a = (i / ring.count) * Math.PI * 2 + ri * 0.22;
        const x = cx + Math.cos(a) * ring.r * 1.15;
        const y = cy + Math.sin(a) * ring.r * 0.86;
        if (x < 36 || x > ARENA_WIDTH - 36 || y < 36 || y > ARENA_HEIGHT - 36) {
          continue;
        }
        const kind = i % 11 === 0 && ri >= 1 ? 'magnet' : ring.kind;
        items.push(
          makeItem(nextId++, x, y, ring.tier, kind, (ri * 52 + i * 11) % 360)
        );
      }
    }
  } else if (preset === 'PINATA') {
    const clusters = [
      { x: 185, y: 155 },
      { x: 615, y: 155 },
      { x: 185, y: 465 },
      { x: 615, y: 465 },
      { x: 400, y: 130 },
      { x: 400, y: 490 },
      { x: 130, y: 310 },
      { x: 670, y: 310 },
    ];
    for (const c of clusters) {
      items.push(makeItem(nextId++, c.x, c.y, 2, 'pinata', 38));
      for (let k = 0; k < 14; k++) {
        const a = (k / 14) * Math.PI * 2;
        const rad = 32 + (k % 2) * 18;
        items.push(
          makeItem(
            nextId++,
            c.x + Math.cos(a) * rad,
            c.y + Math.sin(a) * rad,
            1,
            k % 3 === 0 ? 'star' : 'gem',
            (k * 28 + c.x) % 360
          )
        );
      }
    }
    for (let i = 0; i < 45; i++) {
      const x = 60 + Math.random() * (ARENA_WIDTH - 120);
      const y = 60 + Math.random() * (ARENA_HEIGHT - 120);
      if (!isSafeFromCenter(x, y)) continue;
      items.push(makeItem(nextId++, x, y, 1, 'ring', (i * 25) % 360));
    }
  } else if (preset === 'METEOR') {
    for (let i = 0; i < 165; i++) {
      const x = 50 + Math.random() * (ARENA_WIDTH - 100);
      const y = 50 + Math.random() * (ARENA_HEIGHT - 100);
      if (!isSafeFromCenter(x, y)) continue;
      const tier = i < 85 ? 1 : i < 130 ? 2 : i < 152 ? 3 : 4;
      const kind: VacuumItemKind =
        i % 24 === 5
          ? 'magnet'
          : i % 19 === 0
          ? 'pinata'
          : tier >= 3
          ? 'monolith'
          : i % 2 === 0
          ? 'star'
          : 'gem';
      const ang = Math.atan2(y - cy, x - cx) + Math.PI / 2;
      const spd = 28 + Math.random() * 44;
      items.push(
        makeItem(
          nextId++,
          x,
          y,
          tier,
          kind,
          (tier * 65 + i * 9) % 360,
          Math.cos(ang) * spd,
          Math.sin(ang) * spd
        )
      );
    }
  } else if (preset === 'SHADOW_SWARM') {
    for (let i = 0; i < 185; i++) {
      const ringT = i / 185;
      const angle = ringT * Math.PI * 10;
      const rad = 68 + ringT * 218;
      const x = cx + Math.cos(angle) * rad * 1.15;
      const y = cy + Math.sin(angle) * rad * 0.84;
      if (x < 34 || x > ARENA_WIDTH - 34 || y < 34 || y > ARENA_HEIGHT - 34) {
        continue;
      }
      const tier = i < 90 ? 1 : i < 138 ? 2 : i < 168 ? 3 : 4;
      const kind: VacuumItemKind =
        i % 25 === 0
          ? 'magnet'
          : i % 19 === 0
          ? 'pinata'
          : tier >= 3
          ? 'monolith'
          : i % 2 === 0
          ? 'ring'
          : 'star';
      const tangent = angle + Math.PI / 2;
      const spd = 22 + (i % 5) * 6;
      items.push(
        makeItem(
          nextId++,
          x,
          y,
          tier,
          kind,
          i % 3 === 0 ? 348 : 272 + (i % 24),
          Math.cos(tangent) * spd,
          Math.sin(tangent) * spd
        )
      );
    }
  } else if (preset === 'ASMR_PEARLS') {
    const arms = 3;
    for (let arm = 0; arm < arms; arm++) {
      for (let i = 0; i < 60; i++) {
        const t = i / 60;
        const a = t * Math.PI * 4.5 + (arm * Math.PI * 2) / arms;
        const rad = 58 + t * 235;
        const x = cx + Math.cos(a) * rad * 1.14;
        const y = cy + Math.sin(a) * rad * 0.85;
        if (x < 34 || x > ARENA_WIDTH - 34 || y < 34 || y > ARENA_HEIGHT - 34) {
          continue;
        }
        const tier = t < 0.45 ? 1 : t < 0.72 ? 2 : t < 0.9 ? 3 : 4;
        const kind: VacuumItemKind =
          i % 22 === 10
            ? 'magnet'
            : i % 16 === 0
            ? 'star'
            : 'gem';
        items.push(
          makeItem(
            nextId++,
            x,
            y,
            tier,
            kind,
            (185 + arm * 45 + i * 3) % 360
          )
        );
      }
    }
  } else if (preset === 'CRYSTAL_RINGS') {
    const radii = [76, 128, 182, 236];
    const counts = [14, 22, 30, 34];
    for (let rIdx = 0; rIdx < radii.length; rIdx++) {
      const r = radii[rIdx];
      const n = counts[rIdx];
      const tier = rIdx + 1;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const x = cx + Math.cos(a) * r * 1.15;
        const y = cy + Math.sin(a) * r * 0.85;
        if (x < 34 || x > ARENA_WIDTH - 34 || y < 34 || y > ARENA_HEIGHT - 34) {
          continue;
        }
        const tangent = a + (rIdx % 2 === 0 ? Math.PI / 2 : -Math.PI / 2);
        const spd = 18 + rIdx * 6;
        const kind: VacuumItemKind =
          i % 15 === 0
            ? 'pinata'
            : i % 11 === 4
            ? 'magnet'
            : tier >= 3
            ? 'monolith'
            : i % 2 === 0
            ? 'ring'
            : 'star';
        items.push(
          makeItem(
            nextId++,
            x,
            y,
            tier,
            kind,
            (170 + rIdx * 48 + i * 7) % 360,
            Math.cos(tangent) * spd,
            Math.sin(tangent) * spd
          )
        );
      }
    }
  } else if (preset === 'NEON_METROPOLIS') {
    // Symmetric city blocks with pinata plazas
    const plazas = [
      { x: 185, y: 155 },
      { x: 615, y: 155 },
      { x: 185, y: 465 },
      { x: 615, y: 465 },
    ];
    for (const p of plazas) {
      items.push(makeItem(nextId++, p.x, p.y, 2, 'pinata', 310));
    }
    for (let gx = 95; gx <= ARENA_WIDTH - 95; gx += 46) {
      for (let gy = 85; gy <= ARENA_HEIGHT - 85; gy += 46) {
        if (!isSafeFromCenter(gx, gy, 62)) continue;
        const isPlaza = plazas.some((p) => Math.hypot(gx - p.x, gy - p.y) < 30);
        if (isPlaza) continue;
        const dist = Math.hypot(gx - cx, gy - cy);
        const tier = dist < 130 ? 1 : dist < 210 ? 2 : dist < 290 ? 3 : 4;
        const idx = Math.round(gx + gy);
        const kind: VacuumItemKind =
          idx % 23 === 0
            ? 'magnet'
            : tier >= 3
            ? 'monolith'
            : tier === 2
            ? 'star'
            : 'gem';
        items.push(
          makeItem(
            nextId++,
            gx,
            gy,
            tier,
            kind,
            (tier * 60 + ((gx * 3 + gy) % 90)) % 360
          )
        );
      }
    }
  } else if (preset === 'EXTREME') {
    for (let i = 0; i < 260; i++) {
      const x = 44 + Math.random() * (ARENA_WIDTH - 88);
      const y = 44 + Math.random() * (ARENA_HEIGHT - 88);
      if (!isSafeFromCenter(x, y, 48)) continue;
      const tier =
        i < 120 ? 1 : i < 185 ? 2 : i < 225 ? 3 : i < 248 ? 4 : 5;
      const kind: VacuumItemKind =
        i % 26 === 3
          ? 'magnet'
          : i % 18 === 0
          ? 'pinata'
          : tier >= 4
          ? 'monolith'
          : i % 3 === 0
          ? 'ring'
          : i % 2 === 0
          ? 'star'
          : 'gem';
      items.push(
        makeItem(
          nextId++,
          x,
          y,
          tier,
          kind,
          (i * 17 + tier * 40) % 360,
          (Math.random() - 0.5) * 26,
          (Math.random() - 0.5) * 26
        )
      );
    }
  } else {
    // CLASSIC
    for (let i = 0; i < 145; i++) {
      const x = 48 + Math.random() * (ARENA_WIDTH - 96);
      const y = 48 + Math.random() * (ARENA_HEIGHT - 96);
      if (!isSafeFromCenter(x, y, 54)) continue;
      const tier = i < 75 ? 1 : i < 115 ? 2 : i < 136 ? 3 : 4;
      const kind: VacuumItemKind =
        i % 28 === 4
          ? 'magnet'
          : i % 22 === 0
          ? 'pinata'
          : tier >= 3
          ? 'monolith'
          : i % 3 === 0
          ? 'ring'
          : i % 2 === 0
          ? 'star'
          : 'gem';
      items.push(
        makeItem(nextId++, x, y, tier, kind, (i * 23 + tier * 35) % 360)
      );
    }
  }

  return {
    items,
    particles: [],
    waves: [],
    floatingTexts: [],
    preset,
    holeX: cx,
    holeY: cy,
    targetX: cx,
    targetY: cy,
    holeRadius: VACUUM_TIERS[0].minRadius,
    targetRadius: VACUUM_TIERS[0].minRadius,
    mass: 0,
    tier: 1,
    magnetTimer: 0,
    pulseTimer: 0,
    swallowedCount: 0,
    totalInitialItems: items.length,
    stageClears: keepClears,
    score: keepScore,
    combo: 0,
    comboTimer: 0,
    maxCombo: keepMaxCombo,
    shakeAmount: 0,
    clearDelayTimer: 0,
    nextId,
    time: 0,
  };
}

export function triggerVacuumPulse(
  world: VacuumWorld,
  reducedMotion: boolean
) {
  world.pulseTimer = 1.4;
  soundEngine.playSpring();
  if (!reducedMotion) {
    world.waves.push({
      x: world.holeX,
      y: world.holeY,
      radius: world.holeRadius + 6,
      maxRadius: Math.min(115, world.holeRadius * 2.2),
      color: '#38BDF8',
      alpha: 0.45,
    });
  }
}

export function stepVacuumWorld(
  world: VacuumWorld,
  dt: number,
  reducedMotion: boolean
) {
  world.time += dt;
  if (world.magnetTimer > 0) world.magnetTimer = Math.max(0, world.magnetTimer - dt);
  if (world.pulseTimer > 0) world.pulseTimer = Math.max(0, world.pulseTimer - dt);
  if (world.shakeAmount > 0) world.shakeAmount = Math.max(0, world.shakeAmount - dt * 24);

  if (world.comboTimer > 0) {
    world.comboTimer -= dt;
    if (world.comboTimer <= 0) world.combo = 0;
  }

  // Smooth black hole cursor chase
  const followRate = Math.min(1, dt * 13);
  world.holeX += (world.targetX - world.holeX) * followRate;
  world.holeY += (world.targetY - world.holeY) * followRate;
  world.holeX = Math.max(24, Math.min(ARENA_WIDTH - 24, world.holeX));
  world.holeY = Math.max(24, Math.min(ARENA_HEIGHT - 24, world.holeY));

  world.holeRadius += (world.targetRadius - world.holeRadius) * Math.min(1, dt * 8);

  const pullMult =
    (world.magnetTimer > 0 ? 1.85 : 1) * (world.pulseTimer > 0 ? 1.55 : 1);
  const pullRange = world.holeRadius * 2.9 * pullMult;

  for (let i = world.items.length - 1; i >= 0; i--) {
    const it = world.items[i];
    it.angle += it.spin * dt;

    if (!it.beingPulled && (it.vx !== 0 || it.vy !== 0)) {
      it.x += it.vx * dt;
      it.y += it.vy * dt;
      if (it.x < 30 || it.x > ARENA_WIDTH - 30) it.vx *= -1;
      if (it.y < 30 || it.y > ARENA_HEIGHT - 30) it.vy *= -1;
      it.x = Math.max(28, Math.min(ARENA_WIDTH - 28, it.x));
      it.y = Math.max(28, Math.min(ARENA_HEIGHT - 28, it.y));
    }

    const dx = world.holeX - it.x;
    const dy = world.holeY - it.y;
    const dist = Math.hypot(dx, dy);
    const canSwallow = it.tier <= world.tier;

    if (canSwallow && dist < pullRange) {
      it.beingPulled = true;
      const inv = 1 / Math.max(1, dist);
      const nx = dx * inv;
      const ny = dy * inv;
      // Tangential swirl + radial suction
      const tx = -ny;
      const ty = nx;
      const suction = (320 + world.holeRadius * 4.5) * pullMult;
      it.vx = it.vx * 0.82 + (nx * suction + tx * suction * 0.42) * dt * 8;
      it.vy = it.vy * 0.82 + (ny * suction + ty * suction * 0.42) * dt * 8;
      it.x += it.vx * dt;
      it.y += it.vy * dt;

      if (dist < world.holeRadius * 1.15) {
        it.swallowScale = Math.max(0.15, dist / (world.holeRadius * 1.15));
      }

      if (dist < Math.max(16, world.holeRadius * 0.62)) {
        // SWALLOWED!
        world.items.splice(i, 1);
        world.swallowedCount += 1;
        world.combo += 1;
        world.comboTimer = 1.6;
        if (world.combo > world.maxCombo) world.maxCombo = world.combo;

        const massGain =
          it.kind === 'pinata'
            ? 7
            : it.kind === 'magnet'
            ? 4
            : it.tier * 2.4;
        const prevTier = world.tier;
        world.mass += massGain;
        const nextStats = computeTierFromMass(world.mass);
        world.tier = nextStats.tier;
        world.targetRadius = nextStats.radius;

        const pts =
          (it.kind === 'pinata' ? 350 : it.tier * 65) +
          Math.min(180, world.combo * 8);
        world.score += pts;

        soundEngine.playPegHit(
          Math.min(24, world.combo),
          it.tier >= 3 || it.kind === 'pinata'
        );

        if (world.tier > prevTier) {
          soundEngine.playStageClear();
          if (!reducedMotion) world.shakeAmount = 2.5;
          world.waves.push({
            x: world.holeX,
            y: world.holeY,
            radius: world.holeRadius,
            maxRadius: Math.min(95, world.holeRadius * 2.0),
            color: '#FDE047',
            alpha: 0.5,
          });
          world.floatingTexts.push({
            x: world.holeX,
            y: world.holeY - world.holeRadius - 10,
            vy: -32,
            text: `TIER ${world.tier}`,
            color: '#FDE047',
            alpha: 1,
            scale: 1.05,
          });
        }

        if (it.kind === 'magnet') {
          world.magnetTimer = 4.5;
          soundEngine.playSplitter();
          world.floatingTexts.push({
            x: it.x,
            y: it.y - 10,
            vy: -32,
            text: 'PULL+',
            color: '#38BDF8',
            alpha: 1,
            scale: 1,
          });
        }

        if (it.kind === 'pinata') {
          soundEngine.playBumper();
          if (!reducedMotion) world.shakeAmount = Math.max(world.shakeAmount, 4);
          for (let g = 0; g < 12; g++) {
            const a = (g / 12) * Math.PI * 2;
            const spd = 140 + Math.random() * 110;
            world.items.push(
              makeItem(
                world.nextId++,
                it.x + Math.cos(a) * 18,
                it.y + Math.sin(a) * 18,
                1,
                g % 2 === 0 ? 'star' : 'gem',
                (g * 30) % 360,
                Math.cos(a) * spd,
                Math.sin(a) * spd
              )
            );
          }
        }

        const pCount = reducedMotion ? 2 : 6;
        for (let k = 0; k < pCount; k++) {
          const a = Math.random() * Math.PI * 2;
          const spd = 50 + Math.random() * 110;
          world.particles.push({
            x: world.holeX + Math.cos(a) * world.holeRadius * 0.5,
            y: world.holeY + Math.sin(a) * world.holeRadius * 0.5,
            vx: Math.cos(a) * spd,
            vy: Math.sin(a) * spd,
            radius: 2.2,
            color: `hsl(${it.hue}, 95%, 70%)`,
            alpha: 1,
            decay: 2.4,
          });
        }
      }
    } else if (!canSwallow && dist < world.holeRadius + it.radius + 4) {
      // Gently nudge larger locked monoliths aside so they stay visible
      const inv = 1 / Math.max(1, dist);
      it.x = world.holeX - dx * inv * (world.holeRadius + it.radius + 4);
      it.y = world.holeY - dy * inv * (world.holeRadius + it.radius + 4);
    }
  }

  // Stage Clear check -> load next level preset smoothly!
  if (world.items.length === 0) {
    world.clearDelayTimer += dt;
    if (world.clearDelayTimer === dt) {
      soundEngine.playStageClear();
      world.score += 1500;
      world.floatingTexts.push({
        x: ARENA_WIDTH / 2,
        y: ARENA_HEIGHT / 2,
        vy: -20,
        text: 'CLEARED +1,500',
        color: '#34D399',
        alpha: 1,
        scale: 1.05,
      });
    }
    if (world.clearDelayTimer >= 1.35) {
      const order: VacuumPreset[] = [
        'CLASSIC',
        'MANDALA',
        'PINATA',
        'METEOR',
        'SHADOW_SWARM',
        'ASMR_PEARLS',
        'CRYSTAL_RINGS',
        'NEON_METROPOLIS',
        'EXTREME',
      ];
      const nextPreset =
        order[(order.indexOf(world.preset) + 1) % order.length];
      const next = createVacuumWorld(
        nextPreset,
        world.score,
        world.maxCombo,
        world.stageClears + 1
      );
      Object.assign(world, next);
      return;
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
    w.radius += 220 * dt;
    w.alpha -= dt * 1.9;
    if (w.alpha <= 0) world.waves.splice(i, 1);
  }
  if (world.floatingTexts.length > 8) {
    world.floatingTexts.splice(0, world.floatingTexts.length - 8);
  }
  for (let i = world.floatingTexts.length - 1; i >= 0; i--) {
    const ft = world.floatingTexts[i];
    ft.y += ft.vy * dt;
    ft.alpha -= dt * 1.25;
    if (ft.alpha <= 0) world.floatingTexts.splice(i, 1);
  }
}

export function renderVacuumWorld(
  ctx: CanvasRenderingContext2D,
  world: VacuumWorld
) {
  ctx.save();
  if (world.shakeAmount > 0.1) {
    ctx.translate(
      (Math.random() - 0.5) * world.shakeAmount,
      (Math.random() - 0.5) * world.shakeAmount
    );
  }

  const bg = ctx.createRadialGradient(
    world.holeX,
    world.holeY,
    25,
    ARENA_WIDTH / 2,
    ARENA_HEIGHT / 2,
    520
  );
  bg.addColorStop(0, '#171C3A');
  bg.addColorStop(1, '#060914');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

  // Subtle starfield grid
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
  ctx.lineWidth = 1;
  for (let x = 80; x < ARENA_WIDTH; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 18);
    ctx.lineTo(x, ARENA_HEIGHT - 18);
    ctx.stroke();
  }
  for (let y = 80; y < ARENA_HEIGHT; y += 80) {
    ctx.beginPath();
    ctx.moveTo(18, y);
    ctx.lineTo(ARENA_WIDTH - 18, y);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, ARENA_WIDTH - 36, ARENA_HEIGHT - 28);

  // Pull aura ring
  const pullMult =
    (world.magnetTimer > 0 ? 1.85 : 1) * (world.pulseTimer > 0 ? 1.55 : 1);
  const auraR = world.holeRadius * 2.7 * pullMult;
  ctx.save();
  ctx.strokeStyle =
    world.magnetTimer > 0
      ? 'rgba(56, 189, 248, 0.35)'
      : 'rgba(167, 139, 250, 0.18)';
  ctx.lineWidth = world.magnetTimer > 0 ? 2 : 1.2;
  ctx.setLineDash([7, 7]);
  ctx.beginPath();
  ctx.arc(world.holeX, world.holeY, auraR, world.time * 0.8, world.time * 0.8 + Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Render swallowable items
  for (const it of world.items) {
    const locked = it.tier > world.tier;
    const r = it.radius * it.swallowScale;
    ctx.save();
    ctx.translate(it.x, it.y);
    ctx.rotate(it.angle);
    ctx.globalAlpha = locked ? 0.45 : 1;

    const color =
      it.kind === 'pinata'
        ? '#FBBF24'
        : it.kind === 'magnet'
        ? '#38BDF8'
        : `hsl(${it.hue}, 92%, 65%)`;
    ctx.fillStyle = color;
    ctx.strokeStyle = locked ? '#475569' : '#FFFFFF';
    ctx.lineWidth = it.kind === 'pinata' || it.kind === 'magnet' ? 2 : 1.3;

    if (!locked) {
      ctx.shadowColor = color;
      ctx.shadowBlur = it.tier >= 3 ? 12 : 6;
    }

    if (it.kind === 'ring') {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    } else if (it.kind === 'star' || it.kind === 'pinata') {
      const spikes = it.kind === 'pinata' ? 6 : 4;
      ctx.beginPath();
      for (let s = 0; s < spikes * 2; s++) {
        const sr = s % 2 === 0 ? r : r * 0.48;
        const a = (s / (spikes * 2)) * Math.PI * 2;
        if (s === 0) ctx.moveTo(Math.cos(a) * sr, Math.sin(a) * sr);
        else ctx.lineTo(Math.cos(a) * sr, Math.sin(a) * sr);
      }
      ctx.closePath();
      ctx.fill();
      if (it.kind === 'pinata') ctx.stroke();
    } else if (it.kind === 'monolith') {
      ctx.beginPath();
      ctx.roundRect(-r * 0.85, -r * 0.85, r * 1.7, r * 1.7, 4);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      if (it.kind === 'magnet') ctx.stroke();
    }
    ctx.restore();
  }

  // Shockwaves
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

  // Event Horizon Black Hole (center player!)
  ctx.save();
  const outerGlow = ctx.createRadialGradient(
    world.holeX,
    world.holeY,
    world.holeRadius * 0.55,
    world.holeX,
    world.holeY,
    world.holeRadius * 1.65
  );
  outerGlow.addColorStop(0, '#000000');
  outerGlow.addColorStop(
    0.58,
    world.magnetTimer > 0 ? 'rgba(56, 189, 248, 0.85)' : 'rgba(245, 158, 11, 0.82)'
  );
  outerGlow.addColorStop(1, 'rgba(139, 92, 246, 0)');
  ctx.fillStyle = outerGlow;
  ctx.beginPath();
  ctx.arc(world.holeX, world.holeY, world.holeRadius * 1.65, 0, Math.PI * 2);
  ctx.fill();

  // Accretion spin arcs
  ctx.strokeStyle = world.magnetTimer > 0 ? '#7DD3FC' : '#FDE047';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(
    world.holeX,
    world.holeY,
    world.holeRadius + 4,
    world.time * 3.2,
    world.time * 3.2 + Math.PI * 1.2
  );
  ctx.stroke();

  ctx.strokeStyle = '#C084FC';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(
    world.holeX,
    world.holeY,
    world.holeRadius + 7,
    -world.time * 2.4,
    -world.time * 2.4 + Math.PI * 0.9
  );
  ctx.stroke();

  // Pitch-black singularity void
  ctx.fillStyle = '#03050C';
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(world.holeX, world.holeY, world.holeRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Particles & Floating Texts
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
    ctx.font = `700 ${Math.round(12 * Math.min(1.08, ft.scale))}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }

  ctx.restore();
}
