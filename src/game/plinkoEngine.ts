import { soundEngine } from '../audio/soundEngine';
import { ARENA_HEIGHT, ARENA_WIDTH } from './stages';
import { FloatingText, Particle, PlinkoPreset, RingWave } from './types';

export interface PlinkoPeg {
  x: number;
  y: number;
  radius: number;
  kind: 'normal' | 'bumper' | 'portal';
  hitFlash: number;
}

export interface PlinkoSlot {
  x: number;
  w: number;
  mult: number;
  color: string;
  flash: number;
}

export interface PlinkoBall {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
  trail: Array<{ x: number; y: number }>;
  hits: number;
  age: number;
}

export interface PlinkoWorld {
  pegs: PlinkoPeg[];
  slots: PlinkoSlot[];
  balls: PlinkoBall[];
  particles: Particle[];
  waves: RingWave[];
  floatingTexts: FloatingText[];
  preset: PlinkoPreset;
  aimX: number;
  score: number;
  combo: number;
  maxCombo: number;
  jackpots: number;
  shakeAmount: number;
  nextId: number;
  time: number;
}

const SLOT_CONFIG_9 = [
  { mult: 50, color: '#F43F5E' },
  { mult: 10, color: '#F59E0B' },
  { mult: 3, color: '#10B981' },
  { mult: 1, color: '#38BDF8' },
  { mult: 100, color: '#A855F7' },
  { mult: 1, color: '#38BDF8' },
  { mult: 3, color: '#10B981' },
  { mult: 10, color: '#F59E0B' },
  { mult: 50, color: '#F43F5E' },
];

export function createPlinkoWorld(preset: PlinkoPreset = 'CLASSIC'): PlinkoWorld {
  const pegs: PlinkoPeg[] = [];
  const rows =
    preset === 'EXTREME14' || preset === 'COSMIC_JACKPOT'
      ? 13
      : preset === 'DIAMOND_MAZE' || preset === 'PORTAL_GALAXY' || preset === 'CHIME_PYRAMID'
      ? 11
      : preset === 'BUMPERS' || preset === 'JACKPOT_RAIN' || preset === 'ASMR_RAIN' || preset === 'SILK_WATERFALL' || preset === 'LOTUS_CASCADES'
      ? 10
      : 9;
  const startY = 104;
  const endY = ARENA_HEIGHT - 96;
  const stepY = (endY - startY) / Math.max(1, rows - 1);
  const gapX =
    preset === 'EXTREME14' || preset === 'COSMIC_JACKPOT'
      ? 42
      : preset === 'DIAMOND_MAZE' || preset === 'PORTAL_GALAXY'
      ? 46
      : preset === 'SILK_WATERFALL' || preset === 'LOTUS_CASCADES'
      ? 54
      : 52;

  for (let r = 0; r < rows; r++) {
    let cols = r + 3;
    if (preset === 'FUNNEL') {
      cols = Math.max(4, Math.abs(r - Math.floor(rows / 2)) * 2 + 5);
    } else if (preset === 'DIAMOND_MAZE' || preset === 'LOTUS_CASCADES') {
      const mid = Math.floor(rows / 2);
      cols = (mid - Math.abs(r - mid)) * 2 + 4;
    } else if (preset === 'JACKPOT_RAIN' || preset === 'ASMR_RAIN') {
      cols = r % 2 === 0 ? 11 : 10;
    } else if (preset === 'SILK_WATERFALL') {
      cols = 9 + (r % 2);
    } else if (preset === 'CHIME_PYRAMID') {
      cols = r + 2;
    } else if (preset === 'PORTAL_GALAXY') {
      cols = 6 + (r % 3) * 2;
    } else if (preset === 'EXTREME14' || preset === 'COSMIC_JACKPOT') {
      cols = Math.min(14, r + 4);
    }

    const rowWidth = (cols - 1) * gapX;
    const startX = ARENA_WIDTH / 2 - rowWidth / 2;
    const y = startY + r * stepY;

    for (let c = 0; c < cols; c++) {
      const x = startX + c * gapX;
      if (x < 68 || x > ARENA_WIDTH - 68) continue;

      let kind: PlinkoPeg['kind'] = 'normal';
      if (preset === 'BUMPERS' && r % 3 === 1 && (c === 1 || c === cols - 2 || c === Math.floor(cols / 2))) {
        kind = 'bumper';
      } else if (preset === 'LOTUS_CASCADES' && r % 3 === 1 && c === Math.floor(cols / 2)) {
        kind = 'bumper';
      } else if (preset === 'COSMIC_JACKPOT' && (r === 4 || r === 8) && (c === 0 || c === cols - 1)) {
        kind = 'portal';
      } else if (preset === 'COSMIC_JACKPOT' && r % 3 === 2 && (c === 2 || c === cols - 3)) {
        kind = 'bumper';
      } else if (preset === 'DIAMOND_MAZE' && r === 5 && (c === 0 || c === cols - 1)) {
        kind = 'portal';
      } else if (preset === 'DIAMOND_MAZE' && r % 2 === 1 && c === Math.floor(cols / 2)) {
        kind = 'bumper';
      } else if (preset === 'PORTAL_GALAXY' && (r === 4 || r === 8) && (c === 0 || c === cols - 1)) {
        kind = 'portal';
      } else if (preset === 'PORTAL_GALAXY' && r % 2 === 1 && c === Math.floor(cols / 2)) {
        kind = 'bumper';
      } else if (preset === 'ASMR_RAIN' && r % 3 === 2 && (c === 1 || c === cols - 2)) {
        kind = 'bumper';
      } else if (preset === 'CHIME_PYRAMID' && r % 4 === 3 && (c === 0 || c === cols - 1)) {
        kind = 'portal';
      } else if (preset === 'JACKPOT_RAIN' && r % 2 === 0 && (c === 2 || c === cols - 3 || c === Math.floor(cols / 2))) {
        kind = 'bumper';
      } else if (preset === 'EXTREME14' && r === 5 && (c === 1 || c === cols - 2)) {
        kind = 'portal';
      } else if (preset === 'EXTREME14' && r % 4 === 2 && c === Math.floor(cols / 2)) {
        kind = 'bumper';
      }

      pegs.push({
        x,
        y,
        radius: kind === 'bumper' ? 11 : kind === 'portal' ? 12 : preset === 'EXTREME14' || preset === 'COSMIC_JACKPOT' ? 5.5 : 6.5,
        kind,
        hitFlash: 0,
      });
    }
  }

  const slotMargin = 54;
  const totalW = ARENA_WIDTH - slotMargin * 2;
  const slotW = totalW / SLOT_CONFIG_9.length;
  const slots: PlinkoSlot[] = SLOT_CONFIG_9.map((cfg, idx) => ({
    x: slotMargin + idx * slotW,
    w: slotW,
    mult:
      preset === 'EXTREME14' || preset === 'COSMIC_JACKPOT'
        ? cfg.mult * 2
        : preset === 'JACKPOT_RAIN' || preset === 'PORTAL_GALAXY'
        ? Math.max(25, cfg.mult * 2)
        : cfg.mult,
    color: cfg.color,
    flash: 0,
  }));

  return {
    pegs,
    slots,
    balls: [],
    particles: [],
    waves: [],
    floatingTexts: [],
    preset,
    aimX: ARENA_WIDTH / 2,
    score: 0,
    combo: 0,
    maxCombo: 0,
    jackpots: 0,
    shakeAmount: 0,
    nextId: 1,
    time: 0,
  };
}

export function dropPlinkoBalls(
  world: PlinkoWorld,
  x: number,
  count = 1
) {
  const clampedX = Math.max(120, Math.min(ARENA_WIDTH - 120, x));
  soundEngine.playLaunch();
  for (let i = 0; i < count; i++) {
    if (world.balls.length >= 90) break;
    const spread = count === 1 ? (Math.random() - 0.5) * 10 : ((i % 7) - 3) * 14;
    world.balls.push({
      id: world.nextId++,
      x: Math.max(90, Math.min(ARENA_WIDTH - 90, clampedX + spread)),
      y: 44 - Math.floor(i / 7) * 12,
      vx: (Math.random() - 0.5) * 55,
      vy: 45 + Math.random() * 25,
      radius: world.preset === 'EXTREME14' ? 6.5 : 8,
      hue: (world.nextId * 31) % 360,
      trail: [],
      hits: 0,
      age: 0,
    });
  }
}

export function stepPlinkoWorld(
  world: PlinkoWorld,
  dt: number,
  reducedMotion: boolean
) {
  world.time += dt;
  if (world.shakeAmount > 0) {
    world.shakeAmount = Math.max(0, world.shakeAmount - dt * 24);
  }

  for (const p of world.pegs) {
    if (p.hitFlash > 0) p.hitFlash = Math.max(0, p.hitFlash - dt * 4);
  }
  for (const s of world.slots) {
    if (s.flash > 0) s.flash = Math.max(0, s.flash - dt * 3);
  }

  const gravity = 760;
  const subSteps = 2;
  const subDt = dt / subSteps;

  for (let step = 0; step < subSteps; step++) {
    for (let bi = world.balls.length - 1; bi >= 0; bi--) {
      const b = world.balls[bi];
      b.age += subDt;
      b.vy += gravity * subDt;
      b.x += b.vx * subDt;
      b.y += b.vy * subDt;

      // Side walls
      if (b.x - b.radius < 46) {
        b.x = 46 + b.radius;
        b.vx = Math.abs(b.vx) * 0.72 + 25;
      } else if (b.x + b.radius > ARENA_WIDTH - 46) {
        b.x = ARENA_WIDTH - 46 - b.radius;
        b.vx = -Math.abs(b.vx) * 0.72 - 25;
      }

      // Peg collisions
      for (const peg of world.pegs) {
        const dx = b.x - peg.x;
        const dy = b.y - peg.y;
        const minDist = b.radius + peg.radius;
        const distSq = dx * dx + dy * dy;
        if (distSq < minDist * minDist && distSq > 0.001) {
          const dist = Math.sqrt(distSq);
          const nx = dx / dist;
          const ny = dy / dist;
          b.x = peg.x + nx * (minDist + 0.5);
          b.y = peg.y + ny * (minDist + 0.5);

          if (peg.kind === 'portal') {
            // Warp up high for a second cascade!
            b.y = 76;
            b.x = ARENA_WIDTH / 2 + (Math.random() - 0.5) * 140;
            b.vx = (Math.random() - 0.5) * 90;
            b.vy = 60;
            peg.hitFlash = 1;
            soundEngine.playPortal();
            break;
          }

          const dot = b.vx * nx + b.vy * ny;
          const restitution = peg.kind === 'bumper' ? 1.15 : 0.62;
          b.vx = (b.vx - 2 * dot * nx) * restitution + (Math.random() - 0.5) * 26;
          b.vy = (b.vy - 2 * dot * ny) * restitution;
          peg.hitFlash = 1;
          b.hits += 1;
          world.score += 5;

          if (b.hits % 2 === 1) {
            soundEngine.playPegHit(b.hits, peg.kind === 'bumper');
          }
          if (peg.kind === 'bumper' && !reducedMotion && world.waves.length < 8) {
            world.waves.push({
              x: peg.x,
              y: peg.y,
              radius: peg.radius,
              maxRadius: 28,
              color: '#34D399',
              alpha: 0.45,
            });
          }
        }
      }

      if (step === 0) {
        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > 9) b.trail.shift();
      }

      // Check bottom jackpot slots
      if (b.y >= ARENA_HEIGHT - 56) {
        const slot =
          world.slots.find((s) => b.x >= s.x && b.x <= s.x + s.w) ??
          world.slots[Math.floor(world.slots.length / 2)];

        slot.flash = 1;
        const feverMult = b.hits >= 8 ? 1.5 : 1;
        const pts = Math.round(slot.mult * 50 * feverMult);
        world.score += pts;
        world.combo += 1;
        if (world.combo > world.maxCombo) world.maxCombo = world.combo;
        const isJackpot = slot.mult >= 50;
        if (isJackpot) {
          world.jackpots += 1;
          soundEngine.playStageClear();
          if (!reducedMotion && world.waves.length < 6) {
            world.waves.push({
              x: slot.x + slot.w / 2,
              y: ARENA_HEIGHT - 36,
              radius: 12,
              maxRadius: 48,
              color: slot.color,
              alpha: 0.52,
            });
          }
        } else {
          soundEngine.playBucketCatch();
        }

        const pCount = reducedMotion ? 2 : isJackpot ? 8 : 4;
        for (let k = 0; k < pCount; k++) {
          const a = -Math.PI * Math.random();
          const spd = 65 + Math.random() * 105;
          world.particles.push({
            x: b.x,
            y: ARENA_HEIGHT - 44,
            vx: Math.cos(a) * spd,
            vy: Math.sin(a) * spd,
            radius: 2,
            color: slot.color,
            alpha: 0.85,
            decay: 1.8,
          });
        }

        if (world.floatingTexts.length < 10) {
          world.floatingTexts.push({
            x: b.x,
            y: ARENA_HEIGHT - 64,
            vy: -38,
            text: isJackpot ? `${slot.mult}x +${pts}` : feverMult > 1 ? `1.5x +${pts}` : `+${pts}`,
            color: isJackpot || feverMult > 1 ? '#FDE047' : slot.color,
            alpha: 0.9,
            scale: isJackpot ? 1.08 : 0.92,
          });
        }

        world.balls.splice(bi, 1);
      }
    }
  }

  for (let i = world.particles.length - 1; i >= 0; i--) {
    const p = world.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 260 * dt;
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
    ft.alpha -= dt * 1.1;
    if (ft.alpha <= 0) world.floatingTexts.splice(i, 1);
  }
}

export function renderPlinkoWorld(
  ctx: CanvasRenderingContext2D,
  world: PlinkoWorld,
  zenMode = false
) {
  ctx.save();
  if (!zenMode && world.shakeAmount > 0.1) {
    ctx.translate(
      (Math.random() - 0.5) * world.shakeAmount,
      (Math.random() - 0.5) * world.shakeAmount
    );
  }

  const bg = ctx.createRadialGradient(
    ARENA_WIDTH / 2,
    ARENA_HEIGHT / 2,
    40,
    ARENA_WIDTH / 2,
    ARENA_HEIGHT / 2,
    460
  );
  bg.addColorStop(0, '#161C36');
  bg.addColorStop(1, '#080B18');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
  ctx.lineWidth = 2;
  ctx.strokeRect(44, 18, ARENA_WIDTH - 88, ARENA_HEIGHT - 28);

  // Drop guide reticle at top
  ctx.save();
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
  ctx.setLineDash([4, 5]);
  ctx.beginPath();
  ctx.moveTo(world.aimX, 34);
  ctx.lineTo(world.aimX, 86);
  ctx.stroke();
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.arc(world.aimX, 38, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Bottom multiplier slots
  for (const s of world.slots) {
    ctx.save();
    ctx.fillStyle = s.flash > 0.1 ? s.color : `${s.color}33`;
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(s.x + 2, ARENA_HEIGHT - 54, s.w - 4, 38, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = s.flash > 0.2 ? '#0F172A' : '#F8FAFC';
    ctx.fillText(zenMode ? '♪' : `${s.mult}x`, s.x + s.w / 2, ARENA_HEIGHT - 30);
    ctx.restore();
  }

  // Pegs
  for (const p of world.pegs) {
    ctx.save();
    const glow = p.hitFlash > 0.1;
    ctx.fillStyle = glow
      ? '#FFFFFF'
      : p.kind === 'bumper'
      ? '#10B981'
      : p.kind === 'portal'
      ? '#A855F7'
      : '#CBD5E1';
    ctx.shadowColor =
      p.kind === 'bumper'
        ? '#10B981'
        : p.kind === 'portal'
        ? '#C084FC'
        : '#38BDF8';
    ctx.shadowBlur = glow ? 16 : p.kind === 'normal' ? 4 : 10;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius + p.hitFlash * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  for (const w of world.waves) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, w.alpha * 0.72);
    ctx.strokeStyle = w.color;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Balls & trails
  for (const b of world.balls) {
    if (b.trail.length > 1) {
      ctx.save();
      ctx.strokeStyle = `hsla(${b.hue}, 95%, 68%, 0.4)`;
      ctx.lineWidth = b.radius * 1.1;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(b.trail[0].x, b.trail[0].y);
      for (let i = 1; i < b.trail.length; i++) {
        ctx.lineTo(b.trail[i].x, b.trail[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.fillStyle = `hsl(${b.hue}, 95%, 68%)`;
    ctx.shadowColor = `hsl(${b.hue}, 95%, 65%)`;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(b.x - b.radius * 0.25, b.y - b.radius * 0.25, b.radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
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
    ctx.font = `700 ${Math.round(11.5 * ft.scale)}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }

  ctx.restore();
}
