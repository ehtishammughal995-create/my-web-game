import { soundEngine } from '../audio/soundEngine';
import { ARENA_HEIGHT, ARENA_WIDTH } from './stages';
import { FloatingText, MergePreset, Particle, RingWave } from './types';

export interface MergeOrb {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  tier: number; // 0..8
  radius: number;
  hue: number;
  flash: number;
}

export interface OrbMergeWorld {
  orbs: MergeOrb[];
  particles: Particle[];
  waves: RingWave[];
  floatingTexts: FloatingText[];
  preset: MergePreset;
  aimX: number;
  nextTier: number;
  dropCooldown: number;
  autoRainTimer: number;
  score: number;
  combo: number;
  maxCombo: number;
  highestTier: number;
  shakeAmount: number;
  nextId: number;
  time: number;
}

export const MERGE_TIERS = [
  { name: 'Spark', radius: 14, hue: 190 },
  { name: 'Mint', radius: 19, hue: 150 },
  { name: 'Amber', radius: 24, hue: 42 },
  { name: 'Coral', radius: 30, hue: 10 },
  { name: 'Rose', radius: 36, hue: 330 },
  { name: 'Violet', radius: 43, hue: 270 },
  { name: 'Cobalt', radius: 50, hue: 220 },
  { name: 'Nova', radius: 58, hue: 54 },
  { name: 'Singularity', radius: 68, hue: 300 },
];

const BOWL_LEFT = 175;
const BOWL_RIGHT = 625;
const BOWL_TOP = 92;
const BOWL_BOTTOM = 582;

export function createOrbMergeWorld(
  preset: MergePreset = 'CLASSIC'
): OrbMergeWorld {
  const world: OrbMergeWorld = {
    orbs: [],
    particles: [],
    waves: [],
    floatingTexts: [],
    preset,
    aimX: ARENA_WIDTH / 2,
    nextTier: Math.floor(Math.random() * 3),
    dropCooldown: 0,
    autoRainTimer: 0.4,
    score: 0,
    combo: 0,
    maxCombo: 0,
    highestTier: 0,
    shakeAmount: 0,
    nextId: 1,
    time: 0,
  };

  // Seed a few starter orbs so the bowl immediately looks fun & merges fast!
  const seedCount = preset === 'EXTREME' ? 8 : 4;
  for (let i = 0; i < seedCount; i++) {
    const tier = i % 3;
    const t = MERGE_TIERS[tier];
    world.orbs.push({
      id: world.nextId++,
      x: BOWL_LEFT + 70 + ((i * 85) % (BOWL_RIGHT - BOWL_LEFT - 140)),
      y: BOWL_BOTTOM - 40 - Math.floor(i / 3) * 48,
      vx: (Math.random() - 0.5) * 40,
      vy: 0,
      tier,
      radius: t.radius,
      hue: t.hue,
      flash: 0,
    });
  }

  return world;
}

export function dropMergeOrb(
  world: OrbMergeWorld,
  x: number,
  force = false
) {
  if (!force && world.dropCooldown > 0) return;
  if (world.orbs.length >= 65) return;

  const t = MERGE_TIERS[world.nextTier];
  const { left: bowlLeft, right: bowlRight } = getBowlBounds(world.preset);
  const clampedX = Math.max(
    bowlLeft + t.radius + 6,
    Math.min(bowlRight - t.radius - 6, x)
  );

  soundEngine.playLaunch();
  world.orbs.push({
    id: world.nextId++,
    x: clampedX,
    y: BOWL_TOP,
    vx: (Math.random() - 0.5) * 28,
    vy: 90,
    tier: world.nextTier,
    radius: t.radius,
    hue: t.hue,
    flash: 0.5,
  });

  world.nextTier = Math.floor(Math.random() * (world.preset === 'EXTREME' ? 4 : 3));
  world.dropCooldown = world.preset === 'EXTREME' ? 0.14 : 0.28;
  world.combo = 0;
}

const MERGE_PEGS = [
  { x: 305, y: 265, r: 12 },
  { x: 495, y: 265, r: 12 },
  { x: 400, y: 345, r: 14 },
];

const TWIN_PINBALL_PEGS = [
  { x: 255, y: 225, r: 13 },
  { x: 545, y: 225, r: 13 },
  { x: 400, y: 270, r: 16 },
  { x: 315, y: 380, r: 12 },
  { x: 485, y: 380, r: 12 },
];

const LOTUS_PEGS = [
  { x: 255, y: 315, r: 14 },
  { x: 545, y: 315, r: 14 },
  { x: 400, y: 245, r: 16 },
];

const PRISM_RAMPS = [
  { x1: 175, y1: 235, x2: 315, y2: 310 },
  { x1: 625, y1: 235, x2: 485, y2: 310 },
];

function getBowlBounds(preset: MergePreset) {
  if (preset === 'TINY_WELL') {
    return { left: 265, right: 535 };
  }
  return { left: BOWL_LEFT, right: BOWL_RIGHT };
}

export function shakeMergeBowl(world: OrbMergeWorld) {
  soundEngine.playSpring();
  world.shakeAmount = 8;
  for (const o of world.orbs) {
    o.vy -= 180 + Math.random() * 140;
    o.vx += (Math.random() - 0.5) * 260;
    o.flash = 0.6;
  }
}

export function stepOrbMergeWorld(
  world: OrbMergeWorld,
  dt: number,
  reducedMotion: boolean
) {
  world.time += dt;
  if (world.dropCooldown > 0) world.dropCooldown = Math.max(0, world.dropCooldown - dt);
  if (world.shakeAmount > 0) world.shakeAmount = Math.max(0, world.shakeAmount - dt * 28);
  const { left: bowlLeft, right: bowlRight } = getBowlBounds(world.preset);

  if (
    world.preset === 'EXTREME' ||
    world.preset === 'ZEN_FOUNTAIN' ||
    world.preset === 'PRISM_FUNNEL'
  ) {
    world.autoRainTimer -= dt;
    const cap = world.preset === 'EXTREME' ? 44 : 28;
    if (world.autoRainTimer <= 0 && world.orbs.length < cap) {
      world.autoRainTimer =
        world.preset === 'ZEN_FOUNTAIN'
          ? 1.15
          : world.preset === 'PRISM_FUNNEL'
          ? 1.3
          : 0.72;
      const rx = bowlLeft + 40 + Math.random() * (bowlRight - bowlLeft - 80);
      dropMergeOrb(world, rx, true);
    }
  }

  const gravity =
    world.preset === 'EXTREME'
      ? 680
      : world.preset === 'ZEN_FOUNTAIN'
      ? 360
      : 540;
  const substeps = 4;
  const subDt = dt / substeps;
  const mergedIds = new Set<number>();

  for (let s = 0; s < substeps; s++) {
    for (const o of world.orbs) {
      if (mergedIds.has(o.id)) continue;
      if (o.flash > 0 && s === 0) o.flash = Math.max(0, o.flash - dt * 3);

      o.vy += gravity * subDt;
      o.vx *= 1 - Math.min(0.4, subDt * 0.45);
      o.x += o.vx * subDt;
      o.y += o.vy * subDt;

      // Bowl Walls (with vertical surface friction)
      if (o.x - o.radius < bowlLeft) {
        o.x = bowlLeft + o.radius;
        o.vx = Math.abs(o.vx) * 0.52;
        o.vy *= 0.94;
      } else if (o.x + o.radius > bowlRight) {
        o.x = bowlRight - o.radius;
        o.vx = -Math.abs(o.vx) * 0.52;
        o.vy *= 0.94;
      }
      if (o.y + o.radius > BOWL_BOTTOM) {
        o.y = BOWL_BOTTOM - o.radius;
        o.vy = -Math.abs(o.vy) * 0.36;
        o.vx *= 0.91;
      }

      // Optional Center Divider Peg in DIVIDER preset
      if (world.preset === 'DIVIDER') {
        const divX = ARENA_WIDTH / 2;
        const divTop = 370;
        if (o.y + o.radius > divTop) {
          const dx = o.x - divX;
          if (Math.abs(dx) < o.radius + 7) {
            o.x = divX + (dx >= 0 ? 1 : -1) * (o.radius + 7);
            o.vx = -o.vx * 0.56;
            o.vy *= 0.93;
          }
        }
      }

      // Angled prism funnel shelves in PRISM_FUNNEL preset with tangential slope friction
      if (world.preset === 'PRISM_FUNNEL') {
        for (const r of PRISM_RAMPS) {
          const sx = r.x2 - r.x1;
          const sy = r.y2 - r.y1;
          const lenSq = sx * sx + sy * sy;
          const t = Math.max(0, Math.min(1, ((o.x - r.x1) * sx + (o.y - r.y1) * sy) / lenSq));
          const cx = r.x1 + sx * t;
          const cy = r.y1 + sy * t;
          const dx = o.x - cx;
          const dy = o.y - cy;
          const dist = Math.hypot(dx, dy);
          const minD = o.radius + 5;
          if (dist < minD && dist > 0.0001) {
            const nx = dx / dist;
            const ny = dy / dist;
            o.x = cx + nx * (minD + 0.3);
            o.y = cy + ny * (minD + 0.3);
            const vn = o.vx * nx + o.vy * ny;
            if (vn < 0) {
              const sLen = Math.sqrt(lenSq);
              const tx = sx / sLen;
              const ty = sy / sLen;
              const vt = (o.vx * tx + o.vy * ty) * 0.85;
              const vnAfter = -0.35 * vn;
              o.vx = vt * tx + vnAfter * nx;
              o.vy = vt * ty + vnAfter * ny;
            }
          }
        }
      }

      // Pinball bumpers inside the bowl in BOUNCE_PEGS, TWIN_PINBALL, PORTAL_BOWL, or LOTUS_CUP presets
      if (
        world.preset === 'BOUNCE_PEGS' ||
        world.preset === 'TWIN_PINBALL' ||
        world.preset === 'PORTAL_BOWL' ||
        world.preset === 'LOTUS_CUP'
      ) {
        const pegSet =
          world.preset === 'TWIN_PINBALL'
            ? TWIN_PINBALL_PEGS
            : world.preset === 'LOTUS_CUP'
            ? LOTUS_PEGS
            : MERGE_PEGS;
        for (const peg of pegSet) {
          const dx = o.x - peg.x;
          const dy = o.y - peg.y;
          const dist = Math.hypot(dx, dy);
          const minDist = o.radius + peg.r;
          if (dist < minDist && dist > 0.001) {
            if (world.preset === 'PORTAL_BOWL' && peg.y > 300) {
              o.y = BOWL_TOP + 22;
              o.x = ARENA_WIDTH / 2 + (Math.random() - 0.5) * 110;
              o.vy = 85;
              o.flash = 1;
              soundEngine.playPortal();
              continue;
            }
            const nx = dx / dist;
            const ny = dy / dist;
            o.x = peg.x + nx * minDist;
            o.y = peg.y + ny * minDist;
            const dot = o.vx * nx + o.vy * ny;
            const bounce =
              world.preset === 'TWIN_PINBALL'
                ? 1.06
                : world.preset === 'LOTUS_CUP'
                ? 0.78
                : 0.92;
            o.vx = (o.vx - 2 * dot * nx) * bounce;
            o.vy = (o.vy - 2 * dot * ny) * bounce - (world.preset === 'LOTUS_CUP' ? 8 : 20);
          }
        }
      }

      if (world.preset === 'ZEN_FOUNTAIN' || world.preset === 'LOTUS_CUP') {
        const distCenter = Math.abs(o.x - ARENA_WIDTH / 2);
        const radiusZone = world.preset === 'LOTUS_CUP' ? 38 : 48;
        const lift = world.preset === 'LOTUS_CUP' ? 310 : 520;
        if (distCenter < radiusZone && o.y > 280) {
          o.vy -= lift * subDt;
        }
      }
    }

    // Circle-circle collisions & merges
    for (let i = 0; i < world.orbs.length; i++) {
      const a = world.orbs[i];
      if (mergedIds.has(a.id)) continue;

      for (let j = i + 1; j < world.orbs.length; j++) {
        const b = world.orbs[j];
        if (mergedIds.has(b.id)) continue;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        const minDist = a.radius + b.radius;

        if (dist < minDist) {
          if (a.tier === b.tier && a.tier < MERGE_TIERS.length - 1) {
            // MERGE UP!
            mergedIds.add(a.id);
            mergedIds.add(b.id);
            const nextTier = a.tier + 1;
            const cfg = MERGE_TIERS[nextTier];
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;

            world.orbs.push({
              id: world.nextId++,
              x: mx,
              y: my,
              vx: (a.vx + b.vx) * 0.4,
              vy: -95,
              tier: nextTier,
              radius: cfg.radius,
              hue: cfg.hue,
              flash: 1,
            });

            world.combo += 1;
            if (world.combo > world.maxCombo) world.maxCombo = world.combo;
            if (nextTier > world.highestTier) world.highestTier = nextTier;
            const pts = (nextTier + 1) * 120 * Math.min(6, world.combo);
            world.score += pts;

            soundEngine.playPegHit(nextTier + 3, nextTier >= 5);
            if (!reducedMotion) {
              world.shakeAmount = Math.min(4.5, world.shakeAmount + 1.5 + nextTier * 0.25);
            }

            world.waves.push({
              x: mx,
              y: my,
              radius: cfg.radius * 0.6,
              maxRadius: cfg.radius + 24,
              color: `hsl(${cfg.hue}, 95%, 68%)`,
              alpha: 0.48,
            });

            const pCount = reducedMotion ? 2 : 6;
            for (let k = 0; k < pCount; k++) {
              const pa = (k / pCount) * Math.PI * 2;
              const spd = 48 + Math.random() * 75;
              world.particles.push({
                x: mx,
                y: my,
                vx: Math.cos(pa) * spd,
                vy: Math.sin(pa) * spd,
                radius: 2,
                color: `hsl(${cfg.hue}, 95%, 72%)`,
                alpha: 0.9,
                decay: 1.9,
              });
            }

            world.floatingTexts.push({
              x: mx,
              y: my - cfg.radius * 0.85,
              vy: -32,
              text: `+${pts}`,
              color: `hsl(${cfg.hue}, 95%, 78%)`,
              alpha: 1,
              scale: 1,
            });
            break;
          } else if (dist > 0.001) {
            // Elastic separation
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = minDist - dist;
            const totalMass = a.radius * a.radius + b.radius * b.radius;
            const ratioA = (b.radius * b.radius) / totalMass;
            const ratioB = (a.radius * a.radius) / totalMass;

            a.x -= nx * overlap * ratioA;
            a.y -= ny * overlap * ratioA;
            b.x += nx * overlap * ratioB;
            b.y += ny * overlap * ratioB;

            const rvx = b.vx - a.vx;
            const rvy = b.vy - a.vy;
            const velAlongNormal = rvx * nx + rvy * ny;
            if (velAlongNormal < 0) {
              const jImp = -(1 + 0.35) * velAlongNormal;
              a.vx -= jImp * ratioA * nx;
              a.vy -= jImp * ratioA * ny;
              b.vx += jImp * ratioB * nx;
              b.vy += jImp * ratioB * ny;
            }
          }
        }
      }
    }
  }

  if (mergedIds.size > 0) {
    world.orbs = world.orbs.filter((o) => !mergedIds.has(o.id));
  }

  // Overflow relief if bowl fills way over the rim
  if (world.orbs.length > 52) {
    world.orbs.splice(0, 6);
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
    w.radius += 130 * dt;
    w.alpha -= dt * 2.1;
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

export function renderOrbMergeWorld(
  ctx: CanvasRenderingContext2D,
  world: OrbMergeWorld
) {
  ctx.save();

  if (world.shakeAmount > 0.1) {
    ctx.translate(
      (Math.random() - 0.5) * world.shakeAmount,
      (Math.random() - 0.5) * world.shakeAmount
    );
  }

  const bg = ctx.createRadialGradient(
    ARENA_WIDTH / 2,
    ARENA_HEIGHT / 2,
    30,
    ARENA_WIDTH / 2,
    ARENA_HEIGHT / 2,
    470
  );
  bg.addColorStop(0, '#1B1838');
  bg.addColorStop(1, '#080B18');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

  const { left: bowlLeft, right: bowlRight } = getBowlBounds(world.preset);
  // Bowl container
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(bowlLeft, BOWL_TOP + 24);
  ctx.lineTo(bowlLeft, BOWL_BOTTOM);
  ctx.lineTo(bowlRight, BOWL_BOTTOM);
  ctx.lineTo(bowlRight, BOWL_TOP + 24);
  ctx.stroke();
  ctx.fill();

  if (world.preset === 'DIVIDER') {
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(ARENA_WIDTH / 2, 370);
    ctx.lineTo(ARENA_WIDTH / 2, BOWL_BOTTOM);
    ctx.stroke();
  }

  if (world.preset === 'PRISM_FUNNEL') {
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#38BDF8';
    ctx.shadowBlur = 10;
    for (const r of PRISM_RAMPS) {
      ctx.beginPath();
      ctx.moveTo(r.x1, r.y1);
      ctx.lineTo(r.x2, r.y2);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  if (
    world.preset === 'BOUNCE_PEGS' ||
    world.preset === 'TWIN_PINBALL' ||
    world.preset === 'PORTAL_BOWL' ||
    world.preset === 'LOTUS_CUP'
  ) {
    const pegSet =
      world.preset === 'TWIN_PINBALL'
        ? TWIN_PINBALL_PEGS
        : world.preset === 'LOTUS_CUP'
        ? LOTUS_PEGS
        : MERGE_PEGS;
    const isTwin = world.preset === 'TWIN_PINBALL';
    const isPortal = world.preset === 'PORTAL_BOWL';
    const isLotus = world.preset === 'LOTUS_CUP';
    for (const peg of pegSet) {
      const warpPeg = isPortal && peg.y > 300;
      ctx.fillStyle = warpPeg ? '#A855F7' : isLotus ? '#F472B6' : isTwin ? '#22D3EE' : '#10B981';
      ctx.strokeStyle = warpPeg ? '#F3E8FF' : isLotus ? '#FCE7F3' : isTwin ? '#CFFAFE' : '#A7F3D0';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = warpPeg ? '#C084FC' : isLotus ? '#EC4899' : isTwin ? '#22D3EE' : '#10B981';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(peg.x, peg.y, peg.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  if (world.preset === 'ZEN_FOUNTAIN' || world.preset === 'LOTUS_CUP') {
    const color = world.preset === 'LOTUS_CUP' ? '244, 114, 182' : '45, 212, 191';
    const jet = ctx.createLinearGradient(ARENA_WIDTH / 2, BOWL_BOTTOM, ARENA_WIDTH / 2, 220);
    jet.addColorStop(0, `rgba(${color}, 0.24)`);
    jet.addColorStop(1, `rgba(${color}, 0)`);
    ctx.fillStyle = jet;
    ctx.fillRect(ARENA_WIDTH / 2 - 42, 220, 84, BOWL_BOTTOM - 220);
  }
  ctx.restore();

  // Drop Preview Orb + Guide Line
  const nextCfg = MERGE_TIERS[world.nextTier];
  const previewX = Math.max(
    bowlLeft + nextCfg.radius + 6,
    Math.min(bowlRight - nextCfg.radius - 6, world.aimX)
  );
  ctx.save();
  ctx.strokeStyle = 'rgba(226, 232, 240, 0.22)';
  ctx.setLineDash([5, 6]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(previewX, BOWL_TOP - 28);
  ctx.lineTo(previewX, BOWL_BOTTOM - 20);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = `hsl(${nextCfg.hue}, 92%, 64%)`;
  ctx.shadowColor = `hsl(${nextCfg.hue}, 95%, 64%)`;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(previewX, BOWL_TOP - 32, nextCfg.radius, 0, Math.PI * 2);
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

  // Orbs
  for (const o of world.orbs) {
    ctx.save();
    const grad = ctx.createRadialGradient(
      o.x - o.radius * 0.3,
      o.y - o.radius * 0.3,
      2,
      o.x,
      o.y,
      o.radius
    );
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.45, `hsl(${o.hue}, 94%, 66%)`);
    grad.addColorStop(1, `hsl(${o.hue}, 82%, 40%)`);
    ctx.fillStyle = grad;
    ctx.strokeStyle = o.flash > 0.15 ? '#FFFFFF' : `hsl(${o.hue}, 95%, 78%)`;
    ctx.lineWidth = 2;
    ctx.shadowColor = `hsla(${o.hue}, 95%, 64%, 0.65)`;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `700 ${Math.max(10, Math.round(o.radius * 0.42))}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${o.tier + 1}`, o.x, o.y + 1);
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
