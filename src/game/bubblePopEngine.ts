import { soundEngine } from '../audio/soundEngine';
import { ARENA_HEIGHT, ARENA_WIDTH } from './stages';
import { BubblePreset, FloatingText, Particle, RingWave } from './types';

export interface BubbleCell {
  id: number;
  row: number;
  col: number;
  x: number;
  y: number;
  radius: number;
  hue: number;
  kind: 'normal' | 'star' | 'bomb';
  popped: boolean;
  popAnim: number; // 0..1 bounce when popping or inflating
  respawnTimer: number;
}

export interface BubblePopWorld {
  bubbles: BubbleCell[];
  particles: Particle[];
  waves: RingWave[];
  floatingTexts: FloatingText[];
  preset: BubblePreset;
  cols: number;
  rows: number;
  poppedCount: number;
  sheetsCleared: number;
  score: number;
  combo: number;
  maxCombo: number;
  time: number;
}

export function createBubblePopWorld(
  preset: BubblePreset = 'CLASSIC',
  keepScore = 0,
  keepMaxCombo = 0,
  keepSheets = 0
): BubblePopWorld {
  const isDense =
    preset === 'EXTREME108' ||
    preset === 'RAINBOW_WAVE' ||
    preset === 'PHANTOM_EYE' ||
    preset === 'LOTUS_BLOOM';
  const cols = isDense ? 12 : 8;
  const rows = isDense ? 9 : 6;
  const radius = isDense ? 23 : 33;
  const spacingX = isDense ? 56 : 80;
  const spacingY = isDense ? 56 : 80;
  const startX = ARENA_WIDTH / 2 - ((cols - 1) * spacingX) / 2;
  const startY = ARENA_HEIGHT / 2 - ((rows - 1) * spacingY) / 2;

  const bubbles: BubbleCell[] = [];
  let id = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let kind: BubbleCell['kind'] = 'normal';
      let customHue =
        preset === 'RAINBOW_WAVE'
          ? (r * 36 + c * 30 + keepSheets * 45) % 360
          : (r * 28 + c * 22 + keepSheets * 45) % 360;
      const roll = Math.random();
      if (preset === 'MEGA_CHAIN') {
        kind = roll < 0.28 ? 'bomb' : roll < 0.44 ? 'star' : 'normal';
      } else if (preset === 'LOTUS_BLOOM') {
        const ring = Math.round(Math.hypot(c - 5.5, r - 4));
        customHue = (320 + ring * 28 + keepSheets * 20) % 360;
        kind = ring === 0 ? 'bomb' : ring % 2 === 0 && (r + c) % 4 === 0 ? 'star' : 'normal';
      } else if (preset === 'NEBULA_RUSH') {
        customHue = (210 + c * 18 + r * 22) % 360;
        kind = roll < 0.16 ? 'bomb' : roll < 0.34 ? 'star' : 'normal';
      } else if (preset === 'RAINBOW_WAVE') {
        kind = (r + c) % 7 === 0 ? 'star' : roll < 0.08 ? 'bomb' : 'normal';
      } else if (preset === 'PHANTOM_EYE') {
        const distEye = Math.hypot((c - 5.5) * 0.85, r - 4);
        if (distEye < 1.35) {
          kind = 'bomb';
          customHue = 348;
        } else if (distEye < 2.8) {
          kind = (r + c) % 2 === 0 ? 'star' : 'normal';
          customHue = 278;
        } else {
          kind = roll < 0.08 ? 'bomb' : 'normal';
          customHue = 195 + (c * 8);
        }
      } else if (preset === 'BOMBS' && roll < 0.16) {
        kind = 'bomb';
      } else if (preset === 'EXTREME108' && roll < 0.12) {
        kind = 'bomb';
      } else if (roll < 0.14) {
        kind = 'star';
      }
      bubbles.push({
        id: id++,
        row: r,
        col: c,
        x: startX + c * spacingX,
        y: startY + r * spacingY,
        radius,
        hue: customHue,
        kind,
        popped: false,
        popAnim: 1,
        respawnTimer: 0,
      });
    }
  }

  return {
    bubbles,
    particles: [],
    waves: [],
    floatingTexts: [],
    preset,
    cols,
    rows,
    poppedCount: 0,
    sheetsCleared: keepSheets,
    score: keepScore,
    combo: 0,
    maxCombo: keepMaxCombo,
    time: 0,
  };
}

function popSingleBubble(
  world: BubblePopWorld,
  b: BubbleCell,
  reducedMotion: boolean
) {
  if (b.popped) return;
  b.popped = true;
  b.popAnim = 0;
  b.respawnTimer =
    world.preset === 'RUSH' || world.preset === 'NEBULA_RUSH' ? 3.0 : 0;
  world.poppedCount += 1;
  world.combo += 1;
  if (world.combo > world.maxCombo) world.maxCombo = world.combo;

  const pts = (b.kind === 'star' ? 150 : b.kind === 'bomb' ? 200 : 40) + Math.min(120, world.combo * 4);
  world.score += pts;

  soundEngine.playPegHit(world.combo, b.kind !== 'normal');

  if (!reducedMotion && world.waves.length < 10) {
    world.waves.push({
      x: b.x,
      y: b.y,
      radius: b.radius * 0.4,
      maxRadius: b.kind === 'bomb' ? 52 : b.radius * 1.45,
      color: b.kind === 'bomb' ? '#FB7185' : `hsl(${b.hue}, 90%, 68%)`,
      alpha: 0.45,
    });
  }

  const pCount = reducedMotion ? 2 : 7;
  for (let i = 0; i < pCount; i++) {
    const a = (i / pCount) * Math.PI * 2 + Math.random() * 0.4;
    const spd = 70 + Math.random() * 140;
    world.particles.push({
      x: b.x,
      y: b.y,
      vx: Math.cos(a) * spd,
      vy: Math.sin(a) * spd,
      radius: 2.4,
      color: b.kind === 'star' ? '#FDE047' : `hsl(${b.hue}, 95%, 70%)`,
      alpha: 1,
      decay: 1.9,
    });
  }

  // Chain bomb pops 3x3 neighbors; Rainbow Wave star bubbles pop cross row & column!
  if (b.kind === 'bomb') {
    for (const other of world.bubbles) {
      if (
        !other.popped &&
        Math.abs(other.row - b.row) <= 1 &&
        Math.abs(other.col - b.col) <= 1
      ) {
        popSingleBubble(world, other, reducedMotion);
      }
    }
  } else if (b.kind === 'star' && world.preset === 'RAINBOW_WAVE') {
    for (const other of world.bubbles) {
      if (!other.popped && (other.row === b.row || other.col === b.col)) {
        popSingleBubble(world, other, reducedMotion);
      }
    }
  }
}

export function popBubbleAt(
  world: BubblePopWorld,
  x: number,
  y: number,
  reducedMotion: boolean
) {
  for (const b of world.bubbles) {
    if (b.popped) continue;
    if (Math.hypot(b.x - x, b.y - y) <= b.radius + 5) {
      popSingleBubble(world, b, reducedMotion);
      break;
    }
  }
}

export function stepBubblePopWorld(
  world: BubblePopWorld,
  dt: number,
  reducedMotion: boolean
) {
  world.time += dt;

  for (const b of world.bubbles) {
    if (!b.popped && b.popAnim < 1) {
      b.popAnim = Math.min(1, b.popAnim + dt * 5);
    }
    if (b.popped && (world.preset === 'RUSH' || world.preset === 'NEBULA_RUSH')) {
      b.respawnTimer -= dt;
      if (b.respawnTimer <= 0) {
        b.popped = false;
        b.popAnim = 0.1;
        b.hue = (b.hue + 55) % 360;
      }
    }
  }

  // Check full sheet clear -> celebratory burst & fresh sheet!
  if (
    world.preset !== 'RUSH' &&
    world.preset !== 'NEBULA_RUSH' &&
    world.bubbles.every((b) => b.popped)
  ) {
    soundEngine.playStageClear();
    const bonus = 1000 + world.sheetsCleared * 250;
    world.score += bonus;
    world.floatingTexts.push({
      x: ARENA_WIDTH / 2,
      y: ARENA_HEIGHT / 2,
      vy: -22,
      text: `Sheet Clear +${bonus}`,
      color: '#34D399',
      alpha: 0.95,
      scale: 1.0,
    });
    const next = createBubblePopWorld(
      world.preset,
      world.score,
      world.maxCombo,
      world.sheetsCleared + 1
    );
    next.floatingTexts = world.floatingTexts;
    Object.assign(world, next);
    return;
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
    w.radius += 190 * dt;
    w.alpha -= dt * 2.2;
    if (w.alpha <= 0) world.waves.splice(i, 1);
  }
  for (let i = world.floatingTexts.length - 1; i >= 0; i--) {
    const ft = world.floatingTexts[i];
    ft.y += ft.vy * dt;
    ft.alpha -= dt * 0.9;
    if (ft.alpha <= 0) world.floatingTexts.splice(i, 1);
  }
}

export function renderBubblePopWorld(
  ctx: CanvasRenderingContext2D,
  world: BubblePopWorld
) {
  ctx.save();

  const bg = ctx.createRadialGradient(
    ARENA_WIDTH / 2,
    ARENA_HEIGHT / 2,
    40,
    ARENA_WIDTH / 2,
    ARENA_HEIGHT / 2,
    460
  );
  bg.addColorStop(0, '#122238');
  bg.addColorStop(1, '#080D1A');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, ARENA_WIDTH - 36, ARENA_HEIGHT - 28);

  for (const b of world.bubbles) {
    ctx.save();
    if (b.popped) {
      // Dim recessed pop socket
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius * 0.78, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      continue;
    }

    const r = b.radius * (0.65 + 0.35 * b.popAnim);
    const fillHue = b.kind === 'bomb' ? 348 : b.kind === 'star' ? 45 : b.hue;
    ctx.fillStyle = `hsla(${fillHue}, 88%, 58%, 0.82)`;
    ctx.strokeStyle =
      b.kind === 'bomb'
        ? '#FDA4AF'
        : b.kind === 'star'
        ? '#FEF08A'
        : `hsl(${fillHue}, 95%, 78%)`;
    ctx.lineWidth = 2.2;
    ctx.shadowColor = `hsl(${fillHue}, 95%, 62%)`;
    ctx.shadowBlur = b.kind === 'normal' ? 8 : 15;

    ctx.beginPath();
    ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Glossy top crescent
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.ellipse(b.x - r * 0.25, b.y - r * 0.28, r * 0.35, r * 0.18, -0.5, 0, Math.PI * 2);
    ctx.fill();

    if (b.kind === 'bomb') {
      ctx.font = `700 ${Math.round(r * 0.65)}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('3x3', b.x, b.y + 2);
    } else if (b.kind === 'star') {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(b.x, b.y, r * 0.24, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

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
