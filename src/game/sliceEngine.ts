import { soundEngine } from '../audio/soundEngine';
import { ARENA_HEIGHT, ARENA_WIDTH } from './stages';
import { FloatingText, Particle, RingWave, SlicePreset, SliceSettings } from './types';

export type SliceTargetKind = 'prism' | 'gold' | 'freeze' | 'frenzy' | 'hazard';

export interface SlashLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  alpha: number;
}

export interface SliceTarget {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  sides: number;
  angle: number;
  spin: number;
  hue: number;
  kind: SliceTargetKind;
  sliced: boolean;
}

export interface SlicedHalf {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  angle: number;
  spin: number;
  hue: number;
  alpha: number;
  side: -1 | 1;
}

export interface BladePoint {
  x: number;
  y: number;
  age: number;
}

export interface SliceWorld {
  targets: SliceTarget[];
  halves: SlicedHalf[];
  bladeTrail: BladePoint[];
  slashLines: SlashLine[];
  particles: Particle[];
  waves: RingWave[];
  floatingTexts: FloatingText[];
  preset: SlicePreset;
  spawnTimer: number;
  frenzyTimer: number;
  slowMoTimer: number;
  sliceComboCount: number;
  sliceComboTimer: number;
  score: number;
  combo: number;
  maxCombo: number;
  slicedTotal: number;
  lives: number;
  shakeAmount: number;
  nextId: number;
  time: number;
}

export function createSliceWorld(preset: SlicePreset = 'CLASSIC'): SliceWorld {
  return {
    targets: [],
    halves: [],
    bladeTrail: [],
    slashLines: [],
    particles: [],
    waves: [],
    floatingTexts: [],
    preset,
    spawnTimer: 0.25,
    frenzyTimer: preset === 'EXTREME' || preset === 'COMET_FRENZY' ? 1.8 : 0,
    slowMoTimer: 0,
    sliceComboCount: 0,
    sliceComboTimer: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    slicedTotal: 0,
    lives: 3,
    shakeAmount: 0,
    nextId: 1,
    time: 0,
  };
}

function spawnTarget(
  world: SliceWorld,
  settings: SliceSettings,
  fromCorner = false
) {
  let x = fromCorner
    ? Math.random() > 0.5
      ? 90
      : ARENA_WIDTH - 90
    : 110 + Math.random() * (ARENA_WIDTH - 220);
  let y = ARENA_HEIGHT + 24;
  const targetX = ARENA_WIDTH / 2 + (Math.random() - 0.5) * 260;
  let vx = (targetX - x) * (0.55 + Math.random() * 0.45);
  let vy = -(590 + Math.random() * 170);

  if (world.preset === 'GRAVITY_FLIP') {
    const fromLeft = Math.random() > 0.5;
    x = fromLeft ? -20 : ARENA_WIDTH + 20;
    y = 140 + Math.random() * 340;
    vx = (fromLeft ? 1 : -1) * (240 + Math.random() * 130);
    vy = -(160 + Math.random() * 120);
  } else if (world.preset === 'SAKURA_RAIN') {
    // Gentle floating arcs down from upper sky
    x = 90 + Math.random() * (ARENA_WIDTH - 180);
    y = -24;
    vx = (Math.random() - 0.5) * 90;
    vy = 115 + Math.random() * 65;
  } else if (world.preset === 'COMET_FRENZY') {
    const fromLeft = Math.random() > 0.5;
    x = fromLeft ? -24 : ARENA_WIDTH + 24;
    y = 180 + Math.random() * 280;
    vx = (fromLeft ? 1 : -1) * (310 + Math.random() * 140);
    vy = -(310 + Math.random() * 140);
  }

  let kind: SliceTargetKind = 'prism';
  const roll = Math.random();
  if (!settings.zenMode && world.preset !== 'SAKURA_RAIN' && roll < 0.14) {
    kind = 'hazard';
  } else if (world.preset === 'PINATA' && roll < 0.48) {
    kind = 'gold';
  } else if (world.preset === 'SAKURA_RAIN' && roll < 0.35) {
    kind = 'freeze';
  } else if (roll < 0.22) {
    kind = 'freeze';
  } else if (roll < 0.3 || (world.preset === 'COMET_FRENZY' && roll < 0.45)) {
    kind = 'frenzy';
  } else if (roll < 0.42) {
    kind = 'gold';
  }

  const hue =
    kind === 'gold'
      ? 45
      : kind === 'freeze'
      ? 190
      : kind === 'frenzy'
      ? 295
      : kind === 'hazard'
      ? 350
      : world.preset === 'SAKURA_RAIN'
      ? 330 + Math.random() * 25
      : (150 + Math.random() * 160) % 360;

  world.targets.push({
    id: world.nextId++,
    x,
    y,
    vx,
    vy,
    radius:
      world.preset === 'PINATA' && kind === 'gold'
        ? 40
        : kind === 'gold'
        ? 28
        : kind === 'hazard'
        ? 22
        : 25,
    sides: kind === 'gold' ? 6 : kind === 'hazard' ? 4 : 3 + Math.floor(Math.random() * 4),
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * (world.preset === 'SAKURA_RAIN' ? 2.1 : 4.5),
    hue,
    kind,
    sliced: false,
  });
}

function segmentCircleHit(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  r: number
): boolean {
  const abx = bx - ax;
  const aby = by - ay;
  const lenSq = abx * abx + aby * aby;
  if (lenSq < 4) {
    return Math.hypot(cx - bx, cy - by) <= r;
  }
  const t = Math.max(0, Math.min(1, ((cx - ax) * abx + (cy - ay) * aby) / lenSq));
  const px = ax + abx * t;
  const py = ay + aby * t;
  return Math.hypot(cx - px, cy - py) <= r;
}

export function addBladePoint(
  world: SliceWorld,
  x: number,
  y: number,
  settings: SliceSettings,
  reducedMotion: boolean
) {
  const prev = world.bladeTrail[world.bladeTrail.length - 1];
  world.bladeTrail.push({ x, y, age: 0 });
  if (world.bladeTrail.length > 22) {
    world.bladeTrail.shift();
  }
  if (!prev) return;

  const moveDist = Math.hypot(x - prev.x, y - prev.y);
  if (moveDist < 4) return;

  // Shed crisp katana sparks along fast swipes
  if (!reducedMotion && moveDist > 16) {
    world.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 90,
      vy: (Math.random() - 0.5) * 90,
      radius: 1.8,
      color: '#BAE6FD',
      alpha: 0.9,
      decay: 2.8,
    });
  }

  const cutAngle = Math.atan2(y - prev.y, x - prev.x);

  for (const t of world.targets) {
    if (t.sliced) continue;
    if (segmentCircleHit(prev.x, prev.y, x, y, t.x, t.y, t.radius + 10)) {
      t.sliced = true;

      if (t.kind === 'hazard' && !settings.zenMode) {
        soundEngine.playBombExplosion();
        world.lives = Math.max(0, world.lives - 1);
        world.combo = 0;
        if (!reducedMotion) {
          world.shakeAmount = 5.5;
        }
        world.waves.push({
          x: t.x,
          y: t.y,
          radius: 10,
          maxRadius: 54,
          color: '#FB7185',
          alpha: 0.55,
        });
        world.floatingTexts.push({
          x: t.x,
          y: t.y - 10,
          vy: -32,
          text: '-1 LIFE',
          color: '#FDA4AF',
          alpha: 1,
          scale: 1,
        });
        continue;
      }

      world.slicedTotal += 1;
      world.combo += 1;
      world.sliceComboCount += 1;
      world.sliceComboTimer = 0.22;
      if (world.combo > world.maxCombo) world.maxCombo = world.combo;

      const base = t.kind === 'gold' ? 250 : 100;
      const pts = base * Math.min(8, world.sliceComboCount);
      world.score += pts;

      soundEngine.playBlockBreak(world.combo);

      if (t.kind === 'freeze') {
        world.slowMoTimer = 2.6;
        soundEngine.playPortal();
        world.floatingTexts.push({
          x: t.x,
          y: t.y - 18,
          vy: -30,
          text: 'SLOW-MO',
          color: '#A5F3FC',
          alpha: 1,
          scale: 1,
        });
      } else if (t.kind === 'frenzy') {
        world.frenzyTimer = 3.2;
        soundEngine.playStageClear();
        world.floatingTexts.push({
          x: t.x,
          y: t.y - 18,
          vy: -30,
          text: 'FRENZY',
          color: '#F5D0FE',
          alpha: 1,
          scale: 1,
        });
      }

      if (world.preset === 'PINATA' && t.kind === 'gold' && t.radius >= 34) {
        for (let m = 0; m < 4; m++) {
          const ma = (m / 4) * Math.PI * 2 + 0.4;
          world.targets.push({
            id: world.nextId++,
            x: t.x + Math.cos(ma) * 18,
            y: t.y + Math.sin(ma) * 18,
            vx: Math.cos(ma) * 195,
            vy: Math.sin(ma) * 195 - 240,
            radius: 19,
            sides: 5,
            angle: ma,
            spin: 6,
            hue: (m * 75 + 30) % 360,
            kind: 'prism',
            sliced: false,
          });
        }
      }

      // Spawn two clean halves flying perpendicular to cut angle
      const perpX = -Math.sin(cutAngle);
      const perpY = Math.cos(cutAngle);
      for (const side of [-1, 1] as const) {
        world.halves.push({
          x: t.x + perpX * side * 6,
          y: t.y + perpY * side * 6,
          vx: t.vx * 0.7 + perpX * side * 145,
          vy: Math.min(t.vy * 0.7, -80) + perpY * side * 145,
          radius: t.radius,
          angle: cutAngle,
          spin: side * 4.5,
          hue: t.hue,
          alpha: 1,
          side,
        });
      }

      // Razor slash flash line through the sliced target
      if (!reducedMotion) {
        world.slashLines.push({
          x1: t.x - Math.cos(cutAngle) * 75,
          y1: t.y - Math.sin(cutAngle) * 75,
          x2: t.x + Math.cos(cutAngle) * 75,
          y2: t.y + Math.sin(cutAngle) * 75,
          color: `hsl(${t.hue}, 95%, 78%)`,
          alpha: 0.65,
        });
      }

      world.waves.push({
        x: t.x,
        y: t.y,
        radius: 8,
        maxRadius: 34,
        color: `hsl(${t.hue}, 95%, 68%)`,
        alpha: 0.45,
      });

      const pCount = reducedMotion ? 2 : 6;
      for (let k = 0; k < pCount; k++) {
        const pa = Math.random() * Math.PI * 2;
        const pspd = 55 + Math.random() * 95;
        world.particles.push({
          x: t.x,
          y: t.y,
          vx: Math.cos(pa) * pspd,
          vy: Math.sin(pa) * pspd,
          radius: 1.8 + Math.random() * 1.4,
          color: `hsl(${t.hue}, 95%, 70%)`,
          alpha: 0.9,
          decay: 2.0,
        });
      }

      world.floatingTexts.push({
        x: t.x,
        y: t.y - 8,
        vy: -34,
        text: world.sliceComboCount >= 2 ? `+${pts} (${world.sliceComboCount}x)` : `+${pts}`,
        color: `hsl(${t.hue}, 95%, 78%)`,
        alpha: 1,
        scale: 1,
      });
    }
  }
}

export function stepSliceWorld(
  world: SliceWorld,
  rawDt: number,
  settings: SliceSettings
): { gameOver: boolean } {
  world.time += rawDt;

  if (world.shakeAmount > 0) {
    world.shakeAmount = Math.max(0, world.shakeAmount - rawDt * 34);
  }
  if (world.slowMoTimer > 0) {
    world.slowMoTimer = Math.max(0, world.slowMoTimer - rawDt);
  }
  if (world.frenzyTimer > 0) {
    world.frenzyTimer = Math.max(0, world.frenzyTimer - rawDt);
  }
  if (world.sliceComboTimer > 0) {
    world.sliceComboTimer -= rawDt;
    if (world.sliceComboTimer <= 0) world.sliceComboCount = 0;
  }

  const dt = rawDt * (world.slowMoTimer > 0 ? 0.45 : 1);

  // Fade blade trail
  for (let i = world.bladeTrail.length - 1; i >= 0; i--) {
    world.bladeTrail[i].age += rawDt;
    if (world.bladeTrail[i].age > 0.16) {
      world.bladeTrail.splice(i, 1);
    }
  }

  // Spawn wave targets
  world.spawnTimer -= rawDt;
  if (world.spawnTimer <= 0) {
    if (world.frenzyTimer > 0) {
      spawnTarget(world, settings, true);
      if (world.preset === 'EXTREME' || world.preset === 'COMET_FRENZY') {
        spawnTarget(world, settings, true);
      }
      world.spawnTimer = world.preset === 'EXTREME' ? 0.14 : 0.19;
    } else {
      const baseBurst =
        world.preset === 'EXTREME'
          ? 4 + Math.floor(Math.random() * 2)
          : world.preset === 'COMET_FRENZY'
          ? 3 + Math.floor(Math.random() * 2)
          : world.preset === 'BLITZ' || settings.fastWave
          ? 2 + Math.floor(Math.random() * 2)
          : 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < baseBurst; i++) {
        spawnTarget(world, settings, world.preset === 'EXTREME' && i % 2 === 0);
      }
      world.spawnTimer =
        world.preset === 'EXTREME'
          ? 0.65
          : world.preset === 'COMET_FRENZY' || world.preset === 'BLITZ' || settings.fastWave
          ? 0.78
          : world.preset === 'SAKURA_RAIN'
          ? 0.88
          : 1.15;
    }
  }

  const gravity =
    world.preset === 'SAKURA_RAIN'
      ? 55
      : world.preset === 'GRAVITY_FLIP'
      ? 145
      : 460;
  for (const t of world.targets) {
    t.vy += gravity * dt;
    t.x += t.vx * dt;
    t.y += t.vy * dt;
    t.angle += t.spin * dt;
  }
  world.targets = world.targets.filter(
    (t) => !t.sliced && t.y < ARENA_HEIGHT + 50 && t.x > -70 && t.x < ARENA_WIDTH + 70
  );

  for (let i = world.halves.length - 1; i >= 0; i--) {
    const h = world.halves[i];
    h.vy += gravity * dt;
    h.x += h.vx * dt;
    h.y += h.vy * dt;
    h.angle += h.spin * dt;
    h.alpha -= rawDt * 1.15;
    if (h.alpha <= 0 || h.y > ARENA_HEIGHT + 40) {
      world.halves.splice(i, 1);
    }
  }

  for (let i = world.particles.length - 1; i >= 0; i--) {
    const p = world.particles[i];
    p.x += p.vx * rawDt;
    p.y += p.vy * rawDt;
    p.vy += 200 * rawDt;
    p.alpha -= p.decay * rawDt;
    if (p.alpha <= 0) world.particles.splice(i, 1);
  }
  for (let i = world.waves.length - 1; i >= 0; i--) {
    const w = world.waves[i];
    w.radius += 120 * rawDt;
    w.alpha -= rawDt * 2.2;
    if (w.alpha <= 0) world.waves.splice(i, 1);
  }
  for (let i = world.slashLines.length - 1; i >= 0; i--) {
    world.slashLines[i].alpha -= rawDt * 4.2;
    if (world.slashLines[i].alpha <= 0) world.slashLines.splice(i, 1);
  }
  if (world.floatingTexts.length > 8) {
    world.floatingTexts.splice(0, world.floatingTexts.length - 8);
  }
  for (let i = world.floatingTexts.length - 1; i >= 0; i--) {
    const ft = world.floatingTexts[i];
    ft.y += ft.vy * rawDt;
    ft.alpha -= rawDt * 1.25;
    if (ft.alpha <= 0) world.floatingTexts.splice(i, 1);
  }

  return { gameOver: !settings.zenMode && world.lives <= 0 };
}

function drawPolygon(
  ctx: CanvasRenderingContext2D,
  radius: number,
  sides: number
) {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2;
    const x = Math.cos(a) * radius;
    const y = Math.sin(a) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export function renderSliceWorld(
  ctx: CanvasRenderingContext2D,
  world: SliceWorld
) {
  ctx.save();

  if (world.shakeAmount > 0.1) {
    ctx.translate(
      (Math.random() - 0.5) * world.shakeAmount,
      (Math.random() - 0.5) * world.shakeAmount
    );
  }

  const bg = ctx.createLinearGradient(0, 0, 0, ARENA_HEIGHT);
  bg.addColorStop(0, world.slowMoTimer > 0 ? '#0D1E36' : '#0B1222');
  bg.addColorStop(1, '#070B16');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

  ctx.strokeStyle =
    world.slowMoTimer > 0
      ? 'rgba(34, 211, 238, 0.45)'
      : 'rgba(148, 163, 184, 0.16)';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, ARENA_WIDTH - 36, ARENA_HEIGHT - 28);

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

  // Flying Targets
  for (const t of world.targets) {
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.rotate(t.angle);

    ctx.shadowColor = `hsla(${t.hue}, 95%, 64%, 0.7)`;
    ctx.shadowBlur = t.kind === 'prism' ? 12 : 18;
    ctx.fillStyle = `hsl(${t.hue}, 88%, 55%)`;
    ctx.strokeStyle = t.kind === 'hazard' ? '#FFE4E6' : '#FFFFFF';
    ctx.lineWidth = 2;

    drawPolygon(ctx, t.radius, t.sides);
    ctx.fill();
    ctx.stroke();

    if (t.kind === 'hazard') {
      ctx.fillStyle = '#FFE4E6';
      ctx.font = '700 14px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✕', 0, 1);
    } else if (t.kind === 'gold' || t.kind === 'freeze' || t.kind === 'frenzy') {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Sliced Halves
  for (const h of world.halves) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, h.alpha);
    ctx.translate(h.x, h.y);
    ctx.rotate(h.angle);
    ctx.fillStyle = `hsl(${h.hue}, 90%, 62%)`;
    ctx.beginPath();
    ctx.arc(
      0,
      0,
      h.radius,
      h.side === 1 ? 0 : Math.PI,
      h.side === 1 ? Math.PI : Math.PI * 2
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Razor Slash Flash Lines
  for (const sl of world.slashLines) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, sl.alpha);
    ctx.strokeStyle = '#FFFFFF';
    ctx.shadowColor = sl.color;
    ctx.shadowBlur = 16;
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sl.x1, sl.y1);
    ctx.lineTo(sl.x2, sl.y2);
    ctx.stroke();
    ctx.restore();
  }

  // Dual-Layer Plasma Katana Blade Ribbon
  if (world.bladeTrail.length > 1) {
    for (let i = 1; i < world.bladeTrail.length; i++) {
      const p0 = world.bladeTrail[i - 1];
      const p1 = world.bladeTrail[i];
      const frac = i / world.bladeTrail.length;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.strokeStyle =
        world.frenzyTimer > 0
          ? `rgba(244, 114, 182, ${frac * 0.55})`
          : `rgba(56, 189, 248, ${frac * 0.5})`;
      ctx.shadowColor = world.frenzyTimer > 0 ? '#F472B6' : '#38BDF8';
      ctx.shadowBlur = 18;
      ctx.lineWidth = frac * 15;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 255, 255, ${frac * 0.96})`;
      ctx.shadowBlur = 0;
      ctx.lineWidth = frac * 5.2;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
      ctx.restore();
    }
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
