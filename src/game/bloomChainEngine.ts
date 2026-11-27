import { soundEngine } from '../audio/soundEngine';
import { ARENA_HEIGHT, ARENA_WIDTH } from './stages';
import { BloomPreset, BloomSettings, FloatingText, Particle } from './types';

export interface DriftOrb {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
  kind: 'normal' | 'mega' | 'prism';
  popped: boolean;
}

export interface ExpandingBloom {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  holdTimer: number;
  shrinking: boolean;
  hue: number;
  chainDepth: number;
}

export interface BloomWorld {
  orbs: DriftOrb[];
  blooms: ExpandingBloom[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  level: number;
  preset: BloomPreset;
  tapsLeft: number;
  goalNeeded: number;
  poppedThisWave: number;
  totalOrbsWave: number;
  score: number;
  combo: number;
  maxCombo: number;
  waveBannerTimer: number;
  nextId: number;
  time: number;
}

function createOrb(
  id: number,
  speedScale = 1,
  preset: BloomPreset = 'CLASSIC',
  index = 0,
  total = 30
): DriftOrb {
  const angle = Math.random() * Math.PI * 2;
  const spd = (48 + Math.random() * 58) * speedScale;
  const roll = Math.random();
  const kind =
    preset === 'CLUSTER_BOMBS' || preset === 'ASMR_NEBULA'
      ? roll < 0.36
        ? 'mega'
        : roll < 0.72
        ? 'prism'
        : 'normal'
      : roll < 0.14
      ? 'mega'
      : roll < 0.24
      ? 'prism'
      : 'normal';

  let x = 56 + Math.random() * (ARENA_WIDTH - 112);
  let y = 56 + Math.random() * (ARENA_HEIGHT - 112);
  let vx = Math.cos(angle) * spd;
  let vy = Math.sin(angle) * spd;

  if (preset === 'GALAXY_SPIRAL') {
    const t = index / Math.max(1, total);
    const spiralAngle = t * Math.PI * 8;
    const rad = 28 + t * 225;
    x = ARENA_WIDTH / 2 + Math.cos(spiralAngle) * rad;
    y = ARENA_HEIGHT / 2 + Math.sin(spiralAngle) * rad * 0.78;
    vx = -Math.sin(spiralAngle) * 32 * speedScale;
    vy = Math.cos(spiralAngle) * 32 * speedScale;
  } else if (preset === 'DIAMOND_REACTOR') {
    const ring = index % 3;
    const a = (index / Math.max(1, total)) * Math.PI * 2;
    const r = 75 + ring * 78;
    x = ARENA_WIDTH / 2 + Math.cos(a) * r;
    y = ARENA_HEIGHT / 2 + Math.sin(a) * r * 0.78;
  }

  return {
    id,
    x,
    y,
    vx,
    vy,
    radius: kind === 'mega' ? 15 : 11,
    hue:
      preset === 'SAKURA_DRIFT'
        ? kind === 'mega'
          ? 340
          : kind === 'prism'
          ? 315
          : 332 + (index % 4) * 8
        : preset === 'DIAMOND_REACTOR'
        ? 185 + (index % 5) * 22
        : preset === 'ASMR_NEBULA'
        ? kind === 'mega'
          ? 168
          : kind === 'prism'
          ? 275
          : 192 + (index % 5) * 14
        : kind === 'mega'
        ? 44
        : kind === 'prism'
        ? 285
        : 175 + Math.random() * 65,
    kind,
    popped: false,
  };
}

export function createBloomWorld(
  level = 1,
  keepScore = 0,
  keepMaxCombo = 0,
  preset: BloomPreset = 'CLASSIC'
): BloomWorld {
  const baseCount =
    preset === 'EXTREME100'
      ? 100
      : preset === 'HYPER_SWARM'
      ? 70
      : preset === 'DIAMOND_REACTOR'
      ? 68
      : preset === 'GALAXY_SPIRAL'
      ? 64
      : preset === 'SUPERCELL'
      ? 55
      : preset === 'SAKURA_DRIFT'
      ? 52
      : preset === 'ASMR_NEBULA'
      ? 48
      : preset === 'CLUSTER_BOMBS'
      ? 42
      : Math.min(54, 16 + (level - 1) * 5);
  const totalOrbs = baseCount;
  const goalNeeded =
    preset === 'EXTREME100'
      ? 72
      : preset === 'HYPER_SWARM' || preset === 'DIAMOND_REACTOR'
      ? 48
      : preset === 'GALAXY_SPIRAL'
      ? 44
      : preset === 'SUPERCELL'
      ? 38
      : preset === 'SAKURA_DRIFT'
      ? 34
      : preset === 'ASMR_NEBULA'
      ? 30
      : preset === 'CLUSTER_BOMBS'
      ? 30
      : Math.max(8, Math.floor(totalOrbs * Math.min(0.84, 0.58 + level * 0.03)));
  const orbs: DriftOrb[] = [];
  const spdScale =
    preset === 'HYPER_SWARM'
      ? 1.85
      : preset === 'ASMR_NEBULA' || preset === 'SAKURA_DRIFT'
      ? 0.62
      : preset === 'GALAXY_SPIRAL'
      ? 0.85
      : preset === 'EXTREME100' || preset === 'DIAMOND_REACTOR'
      ? 1.25
      : 1 + (level - 1) * 0.06;
  for (let i = 0; i < totalOrbs; i++) {
    orbs.push(createOrb(i + 1, spdScale, preset, i, totalOrbs));
  }

  return {
    orbs,
    blooms: [],
    particles: [],
    floatingTexts: [],
    level,
    preset,
    tapsLeft: preset === 'EXTREME100' ? 2 : preset === 'ASMR_NEBULA' || preset === 'SAKURA_DRIFT' ? 4 : 3,
    goalNeeded,
    poppedThisWave: 0,
    totalOrbsWave: totalOrbs,
    score: keepScore,
    combo: 0,
    maxCombo: keepMaxCombo,
    waveBannerTimer: 0,
    nextId: totalOrbs + 10,
    time: 0,
  };
}

export function rippleBloomOrbsNear(
  world: BloomWorld,
  x: number,
  y: number
) {
  for (const orb of world.orbs) {
    if (orb.popped) continue;
    const dx = orb.x - x;
    const dy = orb.y - y;
    const dist = Math.hypot(dx, dy);
    if (dist > 6 && dist < 95) {
      const push = (1 - dist / 95) * 28;
      orb.vx += (dx / dist) * push;
      orb.vy += (dy / dist) * push;
      const spd = Math.hypot(orb.vx, orb.vy);
      if (spd > 180) {
        orb.vx = (orb.vx / spd) * 180;
        orb.vy = (orb.vy / spd) * 180;
      }
    }
  }
}

export function triggerBloomAt(
  world: BloomWorld,
  x: number,
  y: number,
  settings: BloomSettings,
  zenMode = false
) {
  const endless = settings.chaosEndless || zenMode;
  if (!endless && world.tapsLeft <= 0) return;

  if (!endless) {
    world.tapsLeft -= 1;
    world.combo = 0;
  }

  soundEngine.playLaunch();
  world.blooms.push({
    x,
    y,
    radius: 10,
    maxRadius: settings.megaRadius ? 86 : 62,
    holdTimer: 1.05,
    shrinking: false,
    hue: 45,
    chainDepth: 1,
  });
}

export function stepBloomWorld(
  world: BloomWorld,
  dt: number,
  settings: BloomSettings,
  reducedMotion: boolean,
  zenMode = false
) {
  world.time += dt;
  const endless = settings.chaosEndless || zenMode;

  // Chaos endless or Zen mode: keep board lush with floating orbs
  if (endless && world.orbs.length < 36) {
    while (world.orbs.length < 38) {
      world.orbs.push(createOrb(world.nextId++, 1.1));
    }
  }

  // Wave clear / retry check in Challenge mode
  if (!endless && world.waveBannerTimer > 0) {
    world.waveBannerTimer -= dt;
    if (world.waveBannerTimer <= 0) {
      if (world.poppedThisWave >= world.goalNeeded) {
        const next = createBloomWorld(
          world.level + 1,
          world.score + 500,
          world.maxCombo,
          world.preset
        );
        Object.assign(world, next);
      } else {
        const retry = createBloomWorld(
          world.level,
          world.score,
          world.maxCombo,
          world.preset
        );
        Object.assign(world, retry);
      }
      return;
    }
  }

  // Move drifting orbs
  for (const orb of world.orbs) {
    if (orb.popped) continue;

    if (settings.magnetDrift && world.blooms.length > 0) {
      const target = world.blooms[0];
      const dx = target.x - orb.x;
      const dy = target.y - orb.y;
      const d = Math.hypot(dx, dy);
      if (d > 20 && d < 220) {
        orb.vx += (dx / d) * 65 * dt;
        orb.vy += (dy / d) * 65 * dt;
      }
    }

    orb.x += orb.vx * dt;
    orb.y += orb.vy * dt;

    if (orb.x - orb.radius < 22) {
      orb.x = 22 + orb.radius;
      orb.vx = Math.abs(orb.vx);
    } else if (orb.x + orb.radius > ARENA_WIDTH - 22) {
      orb.x = ARENA_WIDTH - 22 - orb.radius;
      orb.vx = -Math.abs(orb.vx);
    }
    if (orb.y - orb.radius < 22) {
      orb.y = 22 + orb.radius;
      orb.vy = Math.abs(orb.vy);
    } else if (orb.y + orb.radius > ARENA_HEIGHT - 22) {
      orb.y = ARENA_HEIGHT - 22 - orb.radius;
      orb.vy = -Math.abs(orb.vy);
    }
  }

  // Update expanding blooms & check collisions
  for (let i = world.blooms.length - 1; i >= 0; i--) {
    const b = world.blooms[i];
    if (!b.shrinking) {
      if (b.radius < b.maxRadius) {
        b.radius = Math.min(b.maxRadius, b.radius + 190 * dt);
      } else {
        b.holdTimer -= dt;
        if (b.holdTimer <= 0) b.shrinking = true;
      }
    } else {
      b.radius -= 130 * dt;
      if (b.radius <= 2) {
        world.blooms.splice(i, 1);
        continue;
      }
    }

    // Pop touching orbs
    for (const orb of world.orbs) {
      if (orb.popped) continue;
      const dist = Math.hypot(orb.x - b.x, orb.y - b.y);
      if (dist <= b.radius + orb.radius) {
        orb.popped = true;
        world.poppedThisWave += 1;
        world.combo += 1;
        if (world.combo > world.maxCombo) world.maxCombo = world.combo;

        const nextDepth = b.chainDepth + 1;
        const pts = (orb.kind === 'mega' ? 120 : 60) * Math.min(12, nextDepth);
        world.score += pts;

        soundEngine.playPegHit(world.combo, orb.kind !== 'normal');

        const baseMax = settings.megaRadius ? 82 : 58;
        const bloomMax = orb.kind === 'mega' ? baseMax * 1.45 : baseMax;

        world.blooms.push({
          x: orb.x,
          y: orb.y,
          radius: orb.radius,
          maxRadius: bloomMax,
          holdTimer: 1.0,
          shrinking: false,
          hue: orb.hue,
          chainDepth: nextDepth,
        });

        if (orb.kind === 'prism') {
          for (let k = 0; k < 2; k++) {
            const ang = Math.random() * Math.PI * 2;
            world.blooms.push({
              x: orb.x + Math.cos(ang) * 34,
              y: orb.y + Math.sin(ang) * 34,
              radius: 8,
              maxRadius: 48,
              holdTimer: 0.75,
              shrinking: false,
              hue: (orb.hue + 80 + k * 70) % 360,
              chainDepth: nextDepth,
            });
          }
        }

        const pCount = reducedMotion ? 2 : 5;
        for (let k = 0; k < pCount; k++) {
          const pa = Math.random() * Math.PI * 2;
          const pspd = 45 + Math.random() * 80;
          world.particles.push({
            x: orb.x,
            y: orb.y,
            vx: Math.cos(pa) * pspd,
            vy: Math.sin(pa) * pspd,
            radius: 1.8 + Math.random() * 1.3,
            color: `hsl(${orb.hue}, 92%, 68%)`,
            alpha: 0.9,
            decay: 2.0,
          });
        }

        world.floatingTexts.push({
          x: orb.x,
          y: orb.y - 8,
          vy: -30,
          text: nextDepth >= 4 ? `+${pts} (${nextDepth}x)` : `+${pts}`,
          color: `hsl(${orb.hue}, 95%, 78%)`,
          alpha: 1,
          scale: 1,
        });
      }
    }
  }

  world.orbs = world.orbs.filter((o) => !o.popped);

  // Check end of wave in Challenge mode
  if (
    !endless &&
    world.tapsLeft <= 0 &&
    world.blooms.length === 0 &&
    world.waveBannerTimer <= 0
  ) {
    world.waveBannerTimer = 1.35;
    if (world.poppedThisWave >= world.goalNeeded) {
      soundEngine.playStageClear();
      world.floatingTexts.push({
        x: ARENA_WIDTH / 2,
        y: ARENA_HEIGHT / 2,
        vy: -20,
        text: `CLEARED +500`,
        color: '#34D399',
        alpha: 1,
        scale: 1,
      });
    } else {
      world.floatingTexts.push({
        x: ARENA_WIDTH / 2,
        y: ARENA_HEIGHT / 2,
        vy: -20,
        text: `NEED ${world.goalNeeded} — RETRY`,
        color: '#FB7185',
        alpha: 1,
        scale: 1,
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

export function renderBloomWorld(
  ctx: CanvasRenderingContext2D,
  world: BloomWorld
) {
  ctx.save();

  const bg = ctx.createRadialGradient(
    ARENA_WIDTH / 2,
    ARENA_HEIGHT / 2,
    40,
    ARENA_WIDTH / 2,
    ARENA_HEIGHT / 2,
    470
  );
  bg.addColorStop(0, '#161C34');
  bg.addColorStop(1, '#080C18');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, ARENA_WIDTH - 36, ARENA_HEIGHT - 28);

  // Expanding Blooms
  for (const b of world.blooms) {
    ctx.save();
    const grad = ctx.createRadialGradient(b.x, b.y, 4, b.x, b.y, b.radius);
    grad.addColorStop(0, `hsla(${b.hue}, 95%, 72%, 0.14)`);
    grad.addColorStop(0.75, `hsla(${b.hue}, 95%, 64%, 0.28)`);
    grad.addColorStop(1, `hsla(${b.hue}, 95%, 68%, 0.55)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `hsla(${b.hue}, 95%, 76%, 0.85)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Drifting Orbs
  for (const orb of world.orbs) {
    ctx.save();
    const grad = ctx.createRadialGradient(
      orb.x - orb.radius * 0.3,
      orb.y - orb.radius * 0.3,
      1.5,
      orb.x,
      orb.y,
      orb.radius
    );
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.45, `hsl(${orb.hue}, 95%, 68%)`);
    grad.addColorStop(1, `hsl(${orb.hue}, 82%, 44%)`);
    ctx.shadowColor = `hsla(${orb.hue}, 95%, 66%, 0.65)`;
    ctx.shadowBlur = orb.kind === 'normal' ? 10 : 16;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
    ctx.fill();

    if (orb.kind === 'mega') {
      ctx.strokeStyle = '#FEF3C7';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.radius + 3.5, 0, Math.PI * 2);
      ctx.stroke();
    } else if (orb.kind === 'prism') {
      ctx.strokeStyle = '#F3E8FF';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(
        orb.x - orb.radius * 0.7,
        orb.y - orb.radius * 0.7,
        orb.radius * 1.4,
        orb.radius * 1.4
      );
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

  // Floating texts
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
