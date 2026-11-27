import { soundEngine } from '../audio/soundEngine';
import { ARENA_HEIGHT, ARENA_WIDTH } from './stages';
import {
  FloatingText,
  Particle,
  SandBrush,
  SandPreset,
} from './types';

export interface SandGrain {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
  settled: boolean;
}

export interface SandBarrier {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  kind: 'wall' | 'bounce';
  isUser?: boolean;
  flash: number;
}

export interface SandSpinner {
  x: number;
  y: number;
  length: number;
  angle: number;
  speed: number;
}

export interface SandChalice {
  x: number;
  w: number;
  mult: number;
  color: string;
  flash: number;
  count: number;
}

export interface ChromaSandWorld {
  grains: SandGrain[];
  barriers: SandBarrier[];
  spinners: SandSpinner[];
  chalices: SandChalice[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  preset: SandPreset;
  pointerX: number;
  pointerY: number;
  pouring: boolean;
  autoFountain: boolean;
  lastDrawPt: { x: number; y: number } | null;
  huePhase: number;
  score: number;
  collectedTotal: number;
  combo: number;
  maxCombo: number;
  time: number;
}

export const SAND_LEVEL_NAMES: Array<{
  id: SandPreset;
  label: string;
  desc: string;
}> = [
  { id: 'RAINBOW_DUNE', label: '01. Rainbow Dunes', desc: 'Cascading twin shelves' },
  { id: 'HOURGLASS', label: '02. Neon Hourglass', desc: 'Twin converging funnels' },
  { id: 'SIEVE', label: '03. Bounce Sieve', desc: 'Springy neon trampolines' },
  { id: 'WINDMILL', label: '04. Kinetic Turbines', desc: '3 spinning sand churners' },
  { id: 'PRISM_PINBALL', label: '05. Prism Pinball', desc: 'Zig-zag bounce rails + spinner' },
  { id: 'GALAXY_FUNNEL', label: '06. Galaxy Funnel', desc: 'Twin vortex chutes · 50x center' },
  { id: 'EXTREME_FOUNTAIN', label: '07. Triple Supernova', desc: '3 auto-spouts & 50x cups' },
  { id: 'LOTUS_GARDEN', label: '08. Lotus Cascade', desc: 'Layered calming petal shelves' },
  { id: 'TORNADO_FUNNEL', label: '09. Tornado Vanes', desc: 'Counter-rotating vortex blades' },
];

const CHALICE_DEFS_5 = [
  { mult: 10, color: '#F43F5E' },
  { mult: 3, color: '#38BDF8' },
  { mult: 25, color: '#F59E0B' },
  { mult: 3, color: '#38BDF8' },
  { mult: 10, color: '#10B981' },
];

export function createChromaSandWorld(
  preset: SandPreset = 'RAINBOW_DUNE'
): ChromaSandWorld {
  const barriers: SandBarrier[] = [];
  const spinners: SandSpinner[] = [];

  if (preset === 'RAINBOW_DUNE') {
    barriers.push(
      { x1: 110, y1: 175, x2: 335, y2: 245, kind: 'wall', flash: 0 },
      { x1: 690, y1: 175, x2: 465, y2: 245, kind: 'wall', flash: 0 },
      { x1: 230, y1: 355, x2: 400, y2: 410, kind: 'bounce', flash: 0 },
      { x1: 570, y1: 355, x2: 400, y2: 410, kind: 'bounce', flash: 0 }
    );
  } else if (preset === 'HOURGLASS') {
    barriers.push(
      { x1: 120, y1: 120, x2: 355, y2: 280, kind: 'wall', flash: 0 },
      { x1: 680, y1: 120, x2: 445, y2: 280, kind: 'wall', flash: 0 },
      { x1: 310, y1: 355, x2: 200, y2: 455, kind: 'bounce', flash: 0 },
      { x1: 490, y1: 355, x2: 600, y2: 455, kind: 'bounce', flash: 0 }
    );
  } else if (preset === 'SIEVE') {
    const pads = [
      [220, 210, 320, 185],
      [480, 185, 580, 210],
      [330, 295, 470, 295],
      [150, 395, 270, 370],
      [530, 370, 650, 395],
    ];
    for (const [x1, y1, x2, y2] of pads) {
      barriers.push({ x1, y1, x2, y2, kind: 'bounce', flash: 0 });
    }
  } else if (preset === 'WINDMILL') {
    barriers.push(
      { x1: 140, y1: 165, x2: 320, y2: 230, kind: 'wall', flash: 0 },
      { x1: 660, y1: 165, x2: 480, y2: 230, kind: 'wall', flash: 0 }
    );
    spinners.push(
      { x: 400, y: 245, length: 130, angle: 0, speed: 2.2 },
      { x: 245, y: 390, length: 115, angle: 0.8, speed: -2.6 },
      { x: 555, y: 390, length: 115, angle: 0.3, speed: 2.6 }
    );
  } else if (preset === 'PRISM_PINBALL') {
    barriers.push(
      { x1: 110, y1: 155, x2: 290, y2: 215, kind: 'bounce', flash: 0 },
      { x1: 690, y1: 155, x2: 510, y2: 215, kind: 'bounce', flash: 0 },
      { x1: 240, y1: 285, x2: 365, y2: 335, kind: 'bounce', flash: 0 },
      { x1: 560, y1: 285, x2: 435, y2: 335, kind: 'bounce', flash: 0 },
      { x1: 140, y1: 425, x2: 290, y2: 465, kind: 'wall', flash: 0 },
      { x1: 660, y1: 425, x2: 510, y2: 465, kind: 'wall', flash: 0 }
    );
    spinners.push(
      { x: 400, y: 225, length: 120, angle: 0.4, speed: 2.8 },
      { x: 400, y: 425, length: 140, angle: 1.2, speed: -2.5 }
    );
  } else if (preset === 'GALAXY_FUNNEL') {
    barriers.push(
      { x1: 95, y1: 135, x2: 335, y2: 265, kind: 'wall', flash: 0 },
      { x1: 705, y1: 135, x2: 465, y2: 265, kind: 'wall', flash: 0 },
      { x1: 315, y1: 365, x2: 215, y2: 455, kind: 'bounce', flash: 0 },
      { x1: 485, y1: 365, x2: 585, y2: 455, kind: 'bounce', flash: 0 }
    );
    spinners.push(
      { x: 400, y: 310, length: 110, angle: 0, speed: 3.4 },
      { x: 185, y: 330, length: 90, angle: 0.7, speed: -2.4 },
      { x: 615, y: 330, length: 90, angle: 0.2, speed: 2.4 }
    );
  } else if (preset === 'LOTUS_GARDEN') {
    barriers.push(
      { x1: 245, y1: 135, x2: 365, y2: 195, kind: 'wall', flash: 0 },
      { x1: 555, y1: 135, x2: 435, y2: 195, kind: 'wall', flash: 0 },
      { x1: 115, y1: 245, x2: 295, y2: 315, kind: 'wall', flash: 0 },
      { x1: 685, y1: 245, x2: 505, y2: 315, kind: 'wall', flash: 0 },
      { x1: 310, y1: 350, x2: 400, y2: 392, kind: 'bounce', flash: 0 },
      { x1: 490, y1: 350, x2: 400, y2: 392, kind: 'bounce', flash: 0 },
      { x1: 165, y1: 425, x2: 300, y2: 470, kind: 'wall', flash: 0 },
      { x1: 635, y1: 425, x2: 500, y2: 470, kind: 'wall', flash: 0 }
    );
    spinners.push({ x: 400, y: 265, length: 95, angle: 0, speed: 1.5 });
  } else if (preset === 'TORNADO_FUNNEL') {
    barriers.push(
      { x1: 90, y1: 120, x2: 280, y2: 225, kind: 'wall', flash: 0 },
      { x1: 710, y1: 120, x2: 520, y2: 225, kind: 'wall', flash: 0 },
      { x1: 150, y1: 380, x2: 305, y2: 455, kind: 'bounce', flash: 0 },
      { x1: 650, y1: 380, x2: 495, y2: 455, kind: 'bounce', flash: 0 }
    );
    spinners.push(
      { x: 400, y: 185, length: 120, angle: 0, speed: 2.9 },
      { x: 260, y: 295, length: 105, angle: 0.6, speed: -3.2 },
      { x: 540, y: 295, length: 105, angle: 1.2, speed: 3.2 },
      { x: 400, y: 405, length: 115, angle: 0.4, speed: -2.7 }
    );
  } else {
    // EXTREME_FOUNTAIN
    barriers.push(
      { x1: 120, y1: 195, x2: 250, y2: 255, kind: 'bounce', flash: 0 },
      { x1: 680, y1: 195, x2: 550, y2: 255, kind: 'bounce', flash: 0 },
      { x1: 300, y1: 445, x2: 500, y2: 445, kind: 'bounce', flash: 0 }
    );
    spinners.push(
      { x: 265, y: 335, length: 115, angle: 0, speed: 3.1 },
      { x: 535, y: 335, length: 115, angle: 1.1, speed: -3.1 }
    );
  }

  const margin = 64;
  const totalW = ARENA_WIDTH - margin * 2;
  const cupW = totalW / CHALICE_DEFS_5.length;
  const chalices: SandChalice[] = CHALICE_DEFS_5.map((c, idx) => ({
    x: margin + idx * cupW,
    w: cupW,
    mult:
      preset === 'EXTREME_FOUNTAIN' || preset === 'GALAXY_FUNNEL' || preset === 'TORNADO_FUNNEL'
        ? c.mult * 2
        : c.mult,
    color: c.color,
    flash: 0,
    count: 0,
  }));

  const world: ChromaSandWorld = {
    grains: [],
    barriers,
    spinners,
    chalices,
    particles: [],
    floatingTexts: [],
    preset,
    pointerX: ARENA_WIDTH / 2,
    pointerY: 92,
    pouring: false,
    autoFountain: true,
    lastDrawPt: null,
    huePhase: 0,
    score: 0,
    collectedTotal: 0,
    combo: 0,
    maxCombo: 0,
    time: 0,
  };

  // Seed a cheerful starter splash so the arena immediately feels alive
  pourSandAt(world, ARENA_WIDTH / 2, 74, 36);
  return world;
}

export function pourSandAt(
  world: ChromaSandWorld,
  x: number,
  y: number,
  count = 6
) {
  const clampedX = Math.max(44, Math.min(ARENA_WIDTH - 44, x));
  const clampedY = Math.max(32, Math.min(ARENA_HEIGHT - 120, y));

  for (let i = 0; i < count; i++) {
    if (world.grains.length >= 1650) {
      world.grains.shift();
    }
    world.huePhase = (world.huePhase + 1.1) % 360;
    world.grains.push({
      x: clampedX + (Math.random() - 0.5) * 18,
      y: clampedY + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 65,
      vy: 30 + Math.random() * 45,
      radius: 3.1 + Math.random() * 1.1,
      hue: (world.huePhase + Math.random() * 18) % 360,
      settled: false,
    });
  }
}

export function applySandBrushAt(
  world: ChromaSandWorld,
  brush: SandBrush,
  x: number,
  y: number
) {
  world.pointerX = x;
  world.pointerY = y;
  if (brush === 'pour') {
    pourSandAt(world, x, y, 8);
    return;
  }

  if (brush === 'stir') {
    const stirRadius = 115;
    let moved = 0;
    for (const g of world.grains) {
      const dx = g.x - x;
      const dy = g.y - y;
      const d = Math.hypot(dx, dy);
      if (d > 2 && d < stirRadius) {
        const force = (1 - d / stirRadius) * 260;
        const tx = -dy / d;
        const ty = dx / d;
        g.vx += tx * force + (dx / d) * force * 0.25;
        g.vy += ty * force - force * 0.65;
        moved++;
      }
    }
    if (moved > 0 && Math.random() < 0.35) {
      world.particles.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 60,
        vy: -50 - Math.random() * 50,
        radius: 2.2,
        color: `hsl(${(world.time * 120) % 360}, 95%, 70%)`,
        alpha: 0.9,
        decay: 2.0,
      });
    }
    return;
  }

  if (brush === 'eraser') {
    const before = world.barriers.length;
    world.barriers = world.barriers.filter((b) => {
      const mx = (b.x1 + b.x2) / 2;
      const my = (b.y1 + b.y2) / 2;
      return Math.hypot(mx - x, my - y) > 30;
    });
    if (world.barriers.length !== before) {
      soundEngine.playPlaceToy();
    }
    return;
  }

  if (y > ARENA_HEIGHT - 86 || y < 34) return;
  const prev = world.lastDrawPt;
  if (!prev) {
    world.lastDrawPt = { x, y };
    return;
  }
  const dist = Math.hypot(x - prev.x, y - prev.y);
  if (dist >= 16) {
    if (world.barriers.length < 180) {
      world.barriers.push({
        x1: prev.x,
        y1: prev.y,
        x2: x,
        y2: y,
        kind: brush === 'bounce' ? 'bounce' : 'wall',
        isUser: true,
        flash: 0.7,
      });
      soundEngine.playPlaceToy();
    }
    world.lastDrawPt = { x, y };
  }
}

export function burstSandFountain(world: ChromaSandWorld) {
  soundEngine.playStageClear();
  for (let i = 0; i < 3; i++) {
    const x = 180 + i * 220;
    pourSandAt(world, x, 58, 70);
  }
}

function collideSegment(
  g: SandGrain,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  restitution: number,
  extraPush = 0,
  tangentialFriction = 0.80
): boolean {
  const sx = x2 - x1;
  const sy = y2 - y1;
  const lenSq = sx * sx + sy * sy;
  if (lenSq < 1) return false;
  const t = Math.max(0, Math.min(1, ((g.x - x1) * sx + (g.y - y1) * sy) / lenSq));
  const cx = x1 + sx * t;
  const cy = y1 + sy * t;
  const dx = g.x - cx;
  const dy = g.y - cy;
  const minD = g.radius + 4;
  const dSq = dx * dx + dy * dy;
  if (dSq < minD * minD && dSq > 0.0001) {
    const d = Math.sqrt(dSq);
    const nx = dx / d;
    const ny = dy / d;
    g.x = cx + nx * (minD + 0.5);
    g.y = cy + ny * (minD + 0.5);
    const vn = g.vx * nx + g.vy * ny;
    if (vn < 0) {
      const segLen = Math.sqrt(lenSq);
      const tx = sx / segLen;
      const ty = sy / segLen;
      const vt = (g.vx * tx + g.vy * ty) * tangentialFriction;
      const vnAfter = -restitution * vn + extraPush;
      g.vx = vt * tx + vnAfter * nx;
      g.vy = vt * ty + vnAfter * ny;
    }
    return true;
  }
  return false;
}

export function stepChromaSandWorld(
  world: ChromaSandWorld,
  dt: number,
  reducedMotion: boolean
) {
  world.time += dt;

  if (world.pouring) {
    pourSandAt(world, world.pointerX, world.pointerY, 7);
  } else if (world.autoFountain && world.grains.length < 1350) {
    if (world.preset === 'EXTREME_FOUNTAIN') {
      const xs = [190, 400, 610];
      for (let i = 0; i < xs.length; i++) {
        pourSandAt(
          world,
          xs[i] + Math.sin(world.time * 2.2 + i * 2) * 55,
          44,
          3
        );
      }
    } else {
      const spoutX =
        ARENA_WIDTH / 2 + Math.sin(world.time * 1.4) * (world.preset === 'HOURGLASS' ? 40 : 145);
      pourSandAt(world, spoutX, 46, 4);
    }
  }

  for (const b of world.barriers) {
    if (b.flash > 0) b.flash = Math.max(0, b.flash - dt * 3);
  }
  for (const c of world.chalices) {
    if (c.flash > 0) c.flash = Math.max(0, c.flash - dt * 3);
  }
  for (const sp of world.spinners) {
    sp.angle += sp.speed * dt;
  }

  const gravity = 590;
  for (let i = world.grains.length - 1; i >= 0; i--) {
    const g = world.grains[i];
    g.vy += gravity * dt;
    g.vx *= 1 - Math.min(0.35, dt * 0.6);
    g.x += g.vx * dt;
    g.y += g.vy * dt;

    if (g.x < 32) {
      g.x = 32;
      g.vx = Math.abs(g.vx) * 0.55;
    } else if (g.x > ARENA_WIDTH - 32) {
      g.x = ARENA_WIDTH - 32;
      g.vx = -Math.abs(g.vx) * 0.55;
    }

    for (const b of world.barriers) {
      const hit = collideSegment(
        g,
        b.x1,
        b.y1,
        b.x2,
        b.y2,
        b.kind === 'bounce' ? 0.88 : 0.25,
        b.kind === 'bounce' ? 52 : 0,
        b.kind === 'bounce' ? 0.90 : 0.78
      );
      if (hit && b.kind === 'bounce') {
        b.flash = 1;
      }
    }

    for (const sp of world.spinners) {
      const half = sp.length / 2;
      const dx = Math.cos(sp.angle) * half;
      const dy = Math.sin(sp.angle) * half;
      const hit = collideSegment(
        g,
        sp.x - dx,
        sp.y - dy,
        sp.x + dx,
        sp.y + dy,
        0.75,
        130
      );
      if (hit) {
        g.vx += -Math.sin(sp.angle) * sp.speed * 42;
      }
    }

    // Bottom score chalices
    if (g.y >= ARENA_HEIGHT - 54) {
      const cup = world.chalices.find((c) => g.x >= c.x && g.x <= c.x + c.w);
      if (cup) {
        cup.flash = Math.min(1, cup.flash + 0.35);
        cup.count += 1;
        world.collectedTotal += 1;
        world.score += cup.mult * 2;
        world.combo += 1;
        if (world.combo > world.maxCombo) world.maxCombo = world.combo;

        if (world.collectedTotal % 18 === 0) {
          soundEngine.playPegHit(
            (world.collectedTotal / 18) % 16,
            cup.mult >= 20
          );
          if (!reducedMotion) {
            world.particles.push({
              x: g.x,
              y: ARENA_HEIGHT - 50,
              vx: (Math.random() - 0.5) * 90,
              vy: -90 - Math.random() * 80,
              radius: 2.5,
              color: cup.color,
              alpha: 1,
              decay: 2.1,
            });
          }
        }
        if (cup.mult >= 25 && cup.count % 25 === 0) {
          world.floatingTexts.push({
            x: cup.x + cup.w / 2,
            y: ARENA_HEIGHT - 68,
            vy: -42,
            text: `${cup.mult}x STREAM!`,
            color: '#FDE047',
            alpha: 1,
            scale: 1.05,
          });
        }
      }
      world.grains.splice(i, 1);
    }
  }

  for (let i = world.particles.length - 1; i >= 0; i--) {
    const p = world.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.alpha -= p.decay * dt;
    if (p.alpha <= 0) world.particles.splice(i, 1);
  }
  for (let i = world.floatingTexts.length - 1; i >= 0; i--) {
    const ft = world.floatingTexts[i];
    ft.y += ft.vy * dt;
    ft.alpha -= dt * 1.1;
    if (ft.alpha <= 0) world.floatingTexts.splice(i, 1);
  }
}

export function renderChromaSandWorld(
  ctx: CanvasRenderingContext2D,
  world: ChromaSandWorld,
  zenMode = false
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
  bg.addColorStop(0, '#121D34');
  bg.addColorStop(1, '#070B16');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 18, ARENA_WIDTH - 48, ARENA_HEIGHT - 28);

  // Bottom Chalice Cups
  for (const c of world.chalices) {
    ctx.save();
    ctx.fillStyle = c.flash > 0.15 ? `${c.color}66` : `${c.color}22`;
    ctx.strokeStyle = c.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(c.x + 3, ARENA_HEIGHT - 54, c.w - 6, 36, 7);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#F8FAFC';
    ctx.fillText(zenMode ? '♪' : `${c.mult}x`, c.x + c.w / 2, ARENA_HEIGHT - 31);
    ctx.restore();
  }

  // Barriers (walls & bounce pads)
  for (const b of world.barriers) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineWidth = b.kind === 'bounce' ? 7 : 6;
    ctx.strokeStyle =
      b.flash > 0.1
        ? '#FFFFFF'
        : b.kind === 'bounce'
        ? '#34D399'
        : '#94A3B8';
    if (b.kind === 'bounce') {
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 10;
    }
    ctx.beginPath();
    ctx.moveTo(b.x1, b.y1);
    ctx.lineTo(b.x2, b.y2);
    ctx.stroke();
    ctx.restore();
  }

  // Kinetic Windmill Spinners
  for (const sp of world.spinners) {
    const half = sp.length / 2;
    const dx = Math.cos(sp.angle) * half;
    const dy = Math.sin(sp.angle) * half;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#FBBF24';
    ctx.shadowColor = '#F59E0B';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(sp.x - dx, sp.y - dy);
    ctx.lineTo(sp.x + dx, sp.y + dy);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Rainbow Sand Grains
  for (const g of world.grains) {
    ctx.fillStyle = `hsl(${g.hue}, 95%, 64%)`;
    ctx.beginPath();
    ctx.arc(g.x, g.y, g.radius, 0, Math.PI * 2);
    ctx.fill();
  }

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
    ctx.globalAlpha = Math.max(0, ft.alpha);
    ctx.font = `700 ${Math.round(13 * ft.scale)}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }

  ctx.restore();
}
