import { soundEngine } from '../audio/soundEngine';
import { ARENA_HEIGHT, ARENA_WIDTH } from './stages';
import {
  BoxLinesConfig,
  BoxLinesHitRule,
  BoxLinesPreset,
  FloatingText,
  Particle,
  RingWave,
} from './types';

export const BOX_LINES_LEVELS: Array<{
  id: BoxLinesPreset;
  label: string;
  desc: string;
  config: BoxLinesConfig;
}> = [
  {
    id: 'CLASSIC_DOUBLE',
    label: '01. Classic Doubler',
    desc: '1 Box · 5 Lines · x2 Every Hit',
    config: {
      boxCount: 1,
      linesPerBox: 5,
      hitRule: 'DOUBLE_HIT',
      baseHits: 4,
      gravityScale: 'normal',
    },
  },
  {
    id: 'EXPONENTIAL_TOWER',
    label: '02. Exponential 1000',
    desc: '2 Boxes · 6 Lines · Huge totals',
    config: {
      boxCount: 2,
      linesPerBox: 6,
      hitRule: 'DOUBLE_HIT',
      baseHits: 8,
      gravityScale: 'normal',
    },
  },
  {
    id: 'TWIN_CHAMBER',
    label: '03. Twin Box Relay',
    desc: '2 Boxes · 5 Lines · +1 On Hit',
    config: {
      boxCount: 2,
      linesPerBox: 5,
      hitRule: 'ADD_1',
      baseHits: 10,
      gravityScale: 'normal',
    },
  },
  {
    id: 'TRIPLE_SWARM',
    label: '04. Triple Threat',
    desc: '3 Boxes · 4 Lines · x3 Every Hit',
    config: {
      boxCount: 3,
      linesPerBox: 4,
      hitRule: 'TRIPLE_HIT',
      baseHits: 12,
      gravityScale: 'normal',
    },
  },
  {
    id: 'SHATTER_CASCADE',
    label: '05. Break Doubler',
    desc: '3 Boxes · 5 Lines · x2 On Shatter',
    config: {
      boxCount: 3,
      linesPerBox: 5,
      hitRule: 'DOUBLE_BREAK',
      baseHits: 6,
      gravityScale: 'heavy',
    },
  },
  {
    id: 'FOUR_PILLARS',
    label: '06. 4-Box Gauntlet',
    desc: '4 Boxes · 5 Lines · +2 On Hit',
    config: {
      boxCount: 4,
      linesPerBox: 5,
      hitRule: 'ADD_2',
      baseHits: 14,
      gravityScale: 'normal',
    },
  },
  {
    id: 'ASMR_GLASS',
    label: '07. ASMR Glass Ladder',
    desc: '2 Boxes · 7 Lines · Calm Float',
    config: {
      boxCount: 2,
      linesPerBox: 7,
      hitRule: 'ADD_1',
      baseHits: 8,
      gravityScale: 'calm',
    },
  },
  {
    id: 'SIX_BOX_VIRAL',
    label: '08. 6-Box Mega Viral',
    desc: '6 Boxes · 6 Lines · x2 Swarm Relay',
    config: {
      boxCount: 6,
      linesPerBox: 6,
      hitRule: 'DOUBLE_HIT',
      baseHits: 12,
      gravityScale: 'normal',
    },
  },
];

export interface BoxLineBar {
  id: number;
  boxIndex: number;
  lineIndex: number;
  x1: number;
  x2: number;
  y: number;
  hitsLeft: number;
  maxHits: number;
  hue: number;
  broken: boolean;
  hitFlash: number;
}

export interface BoxChamber {
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
  hue: number;
}

export interface BoxBall {
  id: number;
  boxIndex: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
  splitCooldown: number;
  trail: Array<{ x: number; y: number }>;
}

export interface BoxLinesWorld {
  preset: BoxLinesPreset;
  config: BoxLinesConfig;
  boxes: BoxChamber[];
  lines: BoxLineBar[];
  balls: BoxBall[];
  particles: Particle[];
  waves: RingWave[];
  floatingTexts: FloatingText[];
  score: number;
  combo: number;
  maxCombo: number;
  linesBroken: number;
  totalLines: number;
  clearedTimer: number;
  nextId: number;
  time: number;
}

const MAX_BOX_BALLS = 220;

function computeLineTarget(
  baseHits: number,
  boxIndex: number,
  lineIndex: number,
  hitRule: BoxLinesHitRule
): number {
  const growth =
    hitRule === 'TRIPLE_HIT'
      ? 1.55
      : hitRule === 'DOUBLE_HIT'
      ? 1.38
      : hitRule === 'ADD_2'
      ? 1.28
      : hitRule === 'DOUBLE_BREAK'
      ? 1.24
      : hitRule === 'ADD_1'
      ? 1.2
      : 1.08;
  const step = boxIndex * 2 + lineIndex;
  return Math.max(1, Math.round(baseHits * Math.pow(growth, step)));
}

export function createBoxLinesWorld(
  preset: BoxLinesPreset = 'CLASSIC_DOUBLE',
  customConfig?: BoxLinesConfig
): BoxLinesWorld {
  const presetDef =
    BOX_LINES_LEVELS.find((l) => l.id === preset) ?? BOX_LINES_LEVELS[0];
  const cfg: BoxLinesConfig = customConfig
    ? {
        boxCount: Math.max(1, Math.min(6, Math.round(customConfig.boxCount))),
        linesPerBox: Math.max(1, Math.min(8, Math.round(customConfig.linesPerBox))),
        hitRule: customConfig.hitRule,
        baseHits: Math.max(1, Math.min(200, Math.round(customConfig.baseHits))),
        gravityScale: customConfig.gravityScale,
      }
    : { ...presetDef.config };

  const boxes: BoxChamber[] = [];
  const lines: BoxLineBar[] = [];
  let nextId = 1;

  const boxTop = 44;
  const boxHeight = 528;
  const totalSpan = ARENA_WIDTH - 56;
  const gap = cfg.boxCount === 1 ? 0 : 14;
  const rawW =
    cfg.boxCount === 1
      ? 360
      : Math.floor((totalSpan - gap * (cfg.boxCount - 1)) / cfg.boxCount);
  const startX =
    cfg.boxCount === 1
      ? (ARENA_WIDTH - rawW) / 2
      : (ARENA_WIDTH - (rawW * cfg.boxCount + gap * (cfg.boxCount - 1))) / 2;

  for (let b = 0; b < cfg.boxCount; b++) {
    const bx = startX + b * (rawW + gap);
    const hue = (185 + b * 48) % 360;
    boxes.push({
      index: b,
      x: bx,
      y: boxTop,
      w: rawW,
      h: boxHeight,
      hue,
    });

    const firstLineY = boxTop + 98;
    const lastLineY = boxTop + boxHeight - 46;
    for (let l = 0; l < cfg.linesPerBox; l++) {
      const ly =
        cfg.linesPerBox === 1
          ? (firstLineY + lastLineY) / 2
          : firstLineY + (l / (cfg.linesPerBox - 1)) * (lastLineY - firstLineY);
      const target = computeLineTarget(cfg.baseHits, b, l, cfg.hitRule);
      lines.push({
        id: nextId++,
        boxIndex: b,
        lineIndex: l,
        x1: bx + 8,
        x2: bx + rawW - 8,
        y: ly,
        hitsLeft: target,
        maxHits: target,
        hue: (hue + l * 22) % 360,
        broken: false,
        hitFlash: 0,
      });
    }
  }

  const world: BoxLinesWorld = {
    preset,
    config: cfg,
    boxes,
    lines,
    balls: [],
    particles: [],
    waves: [],
    floatingTexts: [],
    score: 0,
    combo: 0,
    maxCombo: 0,
    linesBroken: 0,
    totalLines: lines.length,
    clearedTimer: 0,
    nextId,
    time: 0,
  };

  dropBoxBall(world, 0, undefined, 1);
  return world;
}

export function dropBoxBall(
  world: BoxLinesWorld,
  boxIndex = 0,
  xOverride?: number,
  count = 1
) {
  const box = world.boxes[Math.max(0, Math.min(world.boxes.length - 1, boxIndex))];
  if (!box) return;
  const ballRadius = Math.max(4.5, Math.min(8.5, box.w * 0.055));

  for (let i = 0; i < count; i++) {
    if (world.balls.length >= MAX_BOX_BALLS) break;
    const x =
      xOverride !== undefined
        ? Math.max(box.x + ballRadius + 8, Math.min(box.x + box.w - ballRadius - 8, xOverride))
        : box.x + box.w * 0.5 + (Math.random() - 0.5) * Math.min(48, box.w * 0.35);
    world.balls.push({
      id: world.nextId++,
      boxIndex: box.index,
      x,
      y: box.y + 22 + (i % 3) * 10,
      vx: (Math.random() - 0.5) * 95,
      vy: 35 + Math.random() * 40,
      radius: ballRadius,
      hue: (45 + world.nextId * 31) % 360,
      splitCooldown: 0.08,
      trail: [],
    });
  }
  soundEngine.playLaunch();
}

function addLineSparks(
  world: BoxLinesWorld,
  x: number,
  y: number,
  color: string,
  count: number,
  speed: number,
  reducedMotion: boolean
) {
  const actual = reducedMotion ? Math.min(3, count) : count;
  for (let i = 0; i < actual; i++) {
    const a = Math.random() * Math.PI * 2;
    const spd = speed * (0.35 + Math.random() * 0.85);
    world.particles.push({
      x,
      y,
      vx: Math.cos(a) * spd,
      vy: Math.sin(a) * spd,
      radius: 1.8 + Math.random() * 2.2,
      color,
      alpha: 1,
      decay: 1.8 + Math.random() * 0.8,
    });
  }
}

export function stepBoxLinesWorld(
  world: BoxLinesWorld,
  dt: number,
  reducedMotion: boolean,
  zenMode: boolean
) {
  world.time += dt;

  for (const line of world.lines) {
    if (line.hitFlash > 0) line.hitFlash = Math.max(0, line.hitFlash - dt * 6);
  }

  if (world.clearedTimer > 0) {
    world.clearedTimer -= dt;
    if (world.clearedTimer <= 0) {
      const keepScore = world.score;
      const keepMax = world.maxCombo;
      const next = createBoxLinesWorld(world.preset, world.config);
      next.score = keepScore;
      next.maxCombo = keepMax;
      Object.assign(world, next);
      return;
    }
  }

  const gravity =
    world.config.gravityScale === 'calm'
      ? 350
      : world.config.gravityScale === 'heavy'
      ? 810
      : 560;
  const substeps = 3;
  const subDt = dt / substeps;
  const clonesToAdd: BoxBall[] = [];

  for (let bIdx = world.balls.length - 1; bIdx >= 0; bIdx--) {
    const ball = world.balls[bIdx];
    ball.splitCooldown = Math.max(0, ball.splitCooldown - dt);
    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > 10) ball.trail.shift();

    const box = world.boxes[ball.boxIndex];
    if (!box) {
      world.balls.splice(bIdx, 1);
      continue;
    }

    for (let s = 0; s < substeps; s++) {
      ball.vy += gravity * subDt;
      ball.x += ball.vx * subDt;
      ball.y += ball.vy * subDt;

      // Side walls of current box
      const leftWall = box.x + 6 + ball.radius;
      const rightWall = box.x + box.w - 6 - ball.radius;
      if (ball.x < leftWall) {
        ball.x = leftWall;
        ball.vx = Math.abs(ball.vx) * 0.92 + 12;
      } else if (ball.x > rightWall) {
        ball.x = rightWall;
        ball.vx = -Math.abs(ball.vx) * 0.92 - 12;
      }

      // Ceiling bounce
      if (ball.y - ball.radius < box.y + 6) {
        ball.y = box.y + 6 + ball.radius;
        ball.vy = Math.abs(ball.vy) * 0.85;
      }

      // Collide against intact lines inside this box
      for (const line of world.lines) {
        if (line.broken || line.boxIndex !== ball.boxIndex) continue;
        const barHalf = 7;
        const topEdge = line.y - barHalf - ball.radius;
        const botEdge = line.y + barHalf + ball.radius;
        if (ball.y >= topEdge && ball.y <= botEdge) {
          const hitFromTop = ball.y <= line.y;
          if (hitFromTop && ball.vy > 0) {
            ball.y = topEdge - 0.5;
            ball.vy = -Math.max(195, Math.min(410, Math.abs(ball.vy) * 0.82 + 95));
            ball.vx += (Math.random() - 0.5) * 85;
          } else if (!hitFromTop && ball.vy < 0) {
            ball.y = botEdge + 0.5;
            ball.vy = Math.abs(ball.vy) * 0.82;
          } else {
            continue;
          }

          line.hitFlash = 1;
          line.hitsLeft -= 1;
          world.combo += 1;
          if (world.combo > world.maxCombo) world.maxCombo = world.combo;
          world.score += 15;
          soundEngine.playChimeNote(
            (line.lineIndex + world.combo) % 15,
            'glass'
          );

          if (world.particles.length < 180) {
            addLineSparks(
              world,
              ball.x,
              line.y,
              `hsl(${line.hue}, 92%, 68%)`,
              3,
              110,
              reducedMotion
            );
          }

          // Hit multiplication rule
          if (ball.splitCooldown <= 0 && world.config.hitRule !== 'DOUBLE_BREAK' && world.config.hitRule !== 'NO_SPLIT') {
            ball.splitCooldown = 0.085;
            const spawnCount =
              world.config.hitRule === 'TRIPLE_HIT' || world.config.hitRule === 'ADD_2'
                ? 2
                : 1;
            for (let c = 0; c < spawnCount; c++) {
              if (world.balls.length + clonesToAdd.length >= MAX_BOX_BALLS) break;
              clonesToAdd.push({
                id: world.nextId++,
                boxIndex: ball.boxIndex,
                x: Math.max(leftWall, Math.min(rightWall, ball.x + (c === 0 ? -4 : 4))),
                y: ball.y - 2,
                vx: (Math.random() - 0.5) * 180,
                vy: ball.vy * (0.9 + Math.random() * 0.18),
                radius: ball.radius,
                hue: (ball.hue + 24 + c * 35) % 360,
                splitCooldown: 0.1,
                trail: [],
              });
            }
          }

          // Exact hits reached -> SHATTER LINE!
          if (line.hitsLeft <= 0) {
            line.broken = true;
            world.linesBroken += 1;
            world.score += 200 + line.maxHits * 5;
            soundEngine.playRingBreak(line.lineIndex + line.boxIndex);
            addLineSparks(
              world,
              (line.x1 + line.x2) / 2,
              line.y,
              `hsl(${line.hue}, 95%, 72%)`,
              18,
              210,
              reducedMotion
            );
            if (world.waves.length < 6) {
              world.waves.push({
                x: (line.x1 + line.x2) / 2,
                y: line.y,
                radius: 12,
                maxRadius: Math.max(55, box.w * 0.58),
                color: `hsl(${line.hue}, 95%, 70%)`,
                alpha: 0.65,
              });
            }
            if (!zenMode && world.floatingTexts.length < 7) {
              world.floatingTexts.push({
                x: (line.x1 + line.x2) / 2,
                y: line.y - 8,
                vy: -30,
                text: 'SHATTER!',
                color: `hsl(${line.hue}, 95%, 75%)`,
                alpha: 0.95,
                scale: 1,
              });
            }

            if (world.config.hitRule === 'DOUBLE_BREAK') {
              const boxBalls = world.balls.filter((b) => b.boxIndex === line.boxIndex);
              for (const ob of boxBalls) {
                if (world.balls.length + clonesToAdd.length >= MAX_BOX_BALLS) break;
                clonesToAdd.push({
                  id: world.nextId++,
                  boxIndex: ob.boxIndex,
                  x: ob.x,
                  y: ob.y,
                  vx: -ob.vx + (Math.random() - 0.5) * 90,
                  vy: ob.vy * 0.9,
                  radius: ob.radius,
                  hue: (ob.hue + 48) % 360,
                  splitCooldown: 0.1,
                  trail: [],
                });
              }
            }
          }
          break;
        }
      }

      // Portal chute at the bottom of each box -> warps to next box!
      if (ball.y + ball.radius >= box.y + box.h - 4) {
        if (ball.boxIndex < world.boxes.length - 1) {
          const nextBox = world.boxes[ball.boxIndex + 1];
          ball.boxIndex = nextBox.index;
          ball.x =
            nextBox.x +
            nextBox.w * 0.5 +
            (Math.random() - 0.5) * Math.min(36, nextBox.w * 0.3);
          ball.y = nextBox.y + 18;
          ball.vy = Math.max(120, Math.min(280, ball.vy * 0.65));
          soundEngine.playPortal();
          addLineSparks(
            world,
            ball.x,
            ball.y,
            `hsl(${nextBox.hue}, 95%, 72%)`,
            5,
            120,
            reducedMotion
          );
        } else {
          // Bottom exit of final box: bounce cleanly if lines still remain or recycle to Box 0!
          const anyBrokenRemaining = world.lines.some((l) => !l.broken);
          if (anyBrokenRemaining) {
            const firstBroken = world.lines.find((l) => !l.broken);
            if (firstBroken) {
              const targetBox = world.boxes[firstBroken.boxIndex];
              ball.boxIndex = targetBox.index;
              ball.x =
                targetBox.x +
                targetBox.w * 0.5 +
                (Math.random() - 0.5) * Math.min(36, targetBox.w * 0.3);
              ball.y = targetBox.y + 18;
              ball.vy = 95;
            }
          } else {
            ball.y = box.y + box.h - 4 - ball.radius;
            ball.vy = -Math.max(250, Math.abs(ball.vy) * 0.9);
          }
        }
      }
    }
  }

  if (clonesToAdd.length > 0) {
    world.balls.push(...clonesToAdd);
  }

  if (
    world.clearedTimer === 0 &&
    world.lines.length > 0 &&
    world.lines.every((l) => l.broken)
  ) {
    world.clearedTimer = 1.7;
    soundEngine.playStageClear();
    world.score += 3000;
    if (!zenMode) {
      world.floatingTexts.push({
        x: ARENA_WIDTH / 2,
        y: ARENA_HEIGHT / 2,
        vy: -20,
        text: 'ALL BOXES CLEARED +3000!',
        color: '#FDE047',
        alpha: 1,
        scale: 1.18,
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
  for (let i = world.waves.length - 1; i >= 0; i--) {
    const w = world.waves[i];
    w.radius += 165 * dt;
    w.alpha -= dt * 1.6;
    if (w.alpha <= 0) world.waves.splice(i, 1);
  }
  for (let i = world.floatingTexts.length - 1; i >= 0; i--) {
    const ft = world.floatingTexts[i];
    ft.y += ft.vy * dt;
    ft.alpha -= dt * 1.1;
    if (ft.alpha <= 0) world.floatingTexts.splice(i, 1);
  }
}

export function renderBoxLinesWorld(
  ctx: CanvasRenderingContext2D,
  world: BoxLinesWorld,
  zenMode: boolean
) {
  ctx.save();
  const bg = ctx.createRadialGradient(
    ARENA_WIDTH / 2,
    260,
    30,
    ARENA_WIDTH / 2,
    310,
    520
  );
  bg.addColorStop(0, '#121D35');
  bg.addColorStop(1, '#070B14');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, ARENA_WIDTH - 36, ARENA_HEIGHT - 28);

  // Portal relay arcs connecting Box i bottom -> Box i+1 top
  for (let i = 0; i < world.boxes.length - 1; i++) {
    const a = world.boxes[i];
    const b = world.boxes[i + 1];
    ctx.save();
    ctx.strokeStyle = `hsla(${b.hue}, 88%, 68%, 0.35)`;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(a.x + a.w / 2, a.y + a.h);
    ctx.bezierCurveTo(
      a.x + a.w / 2,
      a.y + a.h + 26,
      b.x + b.w / 2,
      b.y - 26,
      b.x + b.w / 2,
      b.y
    );
    ctx.stroke();
    ctx.restore();
  }

  // Chambers
  for (const box of world.boxes) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
    ctx.strokeStyle = `hsla(${box.hue}, 82%, 65%, 0.55)`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(box.x, box.y, box.w, box.h, 12);
    ctx.fill();
    ctx.stroke();

    // Box label
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.fillStyle = `hsla(${box.hue}, 90%, 76%, 0.85)`;
    ctx.textAlign = 'center';
    ctx.fillText(`BOX ${box.index + 1}`, box.x + box.w / 2, box.y + 18);

    // Portal exit glow bar at bottom if chained
    if (box.index < world.boxes.length - 1) {
      ctx.fillStyle = `hsla(${(box.hue + 48) % 360}, 95%, 70%, 0.45)`;
      ctx.fillRect(box.x + box.w * 0.25, box.y + box.h - 4, box.w * 0.5, 4);
    }
    ctx.restore();
  }

  // Exact-hit lines inside each box
  for (const line of world.lines) {
    if (line.broken) continue;
    const w = line.x2 - line.x1;
    const progress = 1 - line.hitsLeft / Math.max(1, line.maxHits);
    ctx.save();
    // Base bar
    ctx.fillStyle = line.hitFlash > 0.2 ? '#FFFFFF' : `hsl(${line.hue}, 78%, 22%)`;
    ctx.strokeStyle = line.hitFlash > 0.2 ? '#FFFFFF' : `hsl(${line.hue}, 92%, 64%)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(line.x1, line.y - 8, w, 16, 6);
    ctx.fill();
    ctx.stroke();

    // Progress damage fill
    if (progress > 0) {
      ctx.fillStyle = `hsla(${line.hue}, 95%, 62%, 0.45)`;
      ctx.beginPath();
      ctx.roundRect(line.x1 + 1, line.y - 7, Math.max(4, (w - 2) * progress), 14, 5);
      ctx.fill();
    }

    // Remaining exact hits counter
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${line.hitsLeft}`, line.x1 + w / 2, line.y + 0.5);
    ctx.restore();
  }

  // Waves
  for (const w of world.waves) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, w.alpha);
    ctx.strokeStyle = w.color;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Balls & trails
  for (const b of world.balls) {
    if (b.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(b.trail[0].x, b.trail[0].y);
      for (let i = 1; i < b.trail.length; i++) {
        ctx.lineTo(b.trail[i].x, b.trail[i].y);
      }
      ctx.strokeStyle = `hsla(${b.hue}, 92%, 66%, 0.38)`;
      ctx.lineWidth = b.radius * 0.85;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
    ctx.fillStyle = `hsl(${b.hue}, 95%, 68%)`;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(b.x - b.radius * 0.28, b.y - b.radius * 0.28, b.radius * 0.32, 0, Math.PI * 2);
    ctx.fill();
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

  if (!zenMode) {
    for (const ft of world.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = '700 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  ctx.restore();
}
