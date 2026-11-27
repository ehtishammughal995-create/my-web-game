import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  BUCKET_Y,
  LAUNCHER_X,
  LAUNCHER_Y,
} from './stages';
import { computeAimPreview, SimWorld } from './physics';
import { FunModifiers, Peg, PlayMode, ToyBrush } from './types';

interface RenderOptions {
  aimAngle: number;
  canAim: boolean;
  modifiers: FunModifiers;
  playMode: PlayMode;
  activeBrush: ToyBrush;
  hoverPos: { x: number; y: number } | null;
}

const PORTAL_COLORS = ['#A78BFA', '#38BDF8', '#FB7185', '#34D399'];

export function renderArena(
  ctx: CanvasRenderingContext2D,
  world: SimWorld,
  opts: RenderOptions
) {
  ctx.save();

  // Subtle camera micro-shake on heavy bumper hits
  if (world.shakeAmount > 0.1) {
    const sx = (Math.random() - 0.5) * world.shakeAmount;
    const sy = (Math.random() - 0.5) * world.shakeAmount;
    ctx.translate(sx, sy);
  }

  // 1. Arena Background Surface (60% clean deep slate canvas)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, ARENA_HEIGHT);
  bgGrad.addColorStop(0, '#0D1526');
  bgGrad.addColorStop(1, '#090E1A');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

  // Subtle radial spotlight from launcher
  const spot = ctx.createRadialGradient(
    LAUNCHER_X,
    LAUNCHER_Y + 40,
    20,
    LAUNCHER_X,
    280,
    460
  );
  spot.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
  spot.addColorStop(0.6, 'rgba(245, 158, 11, 0.03)');
  spot.addColorStop(1, 'rgba(11, 17, 32, 0)');
  ctx.fillStyle = spot;
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

  // Clean minimalist dot grid for spatial feel
  ctx.fillStyle = 'rgba(148, 163, 184, 0.09)';
  for (let gx = 48; gx < ARENA_WIDTH - 32; gx += 48) {
    for (let gy = 88; gy < ARENA_HEIGHT - 48; gy += 48) {
      ctx.beginPath();
      ctx.arc(gx, gy, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Crisp inner arena boundary frame
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, ARENA_WIDTH - 32, ARENA_HEIGHT - 24);

  // Wind indicator streaks when windX != 0
  if (Math.abs(world.windX) > 1) {
    ctx.save();
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.14)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      const y = 140 + i * 74;
      const offset = ((world.time * world.windX * 2.5 + i * 130) % (ARENA_WIDTH - 80));
      const x = 40 + (offset < 0 ? offset + ARENA_WIDTH - 80 : offset);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 28, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 2. Aim Trajectory Preview
  if (opts.canAim) {
    const previewPts = computeAimPreview(
      opts.aimAngle,
      world.gravity,
      world.windX,
      world.pegs,
      opts.modifiers
    );
    previewPts.forEach((pt, idx) => {
      const alpha = Math.max(0.08, 0.55 - idx * 0.024);
      ctx.fillStyle = `rgba(248, 250, 252, ${alpha})`;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1.8, 3.6 - idx * 0.08), 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // 3. Expanding Ring Waves
  for (const r of world.rings) {
    ctx.save();
    ctx.strokeStyle = r.color;
    ctx.globalAlpha = Math.max(0, r.alpha);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 4. Pegs & Toys
  for (const peg of world.pegs) {
    drawPeg(ctx, peg, world.time);
  }

  // 5. Sandbox Hover Placement Ghost
  if (opts.playMode === 'SANDBOX' && opts.hoverPos) {
    drawSandboxGhost(ctx, opts.hoverPos.x, opts.hoverPos.y, opts.activeBrush, world.pegs);
  }

  // 6. Moving Catch Bucket
  drawBucket(ctx, world.bucketX, BUCKET_Y, world.bucketWidth, opts.modifiers.magnetBucket);

  // 7. Top Launcher Cannon
  drawLauncher(ctx, opts.aimAngle, opts.canAim, opts.modifiers);

  // 8. Marbles & Trails
  for (const ball of world.balls) {
    // Trail
    if (ball.trail.length > 1) {
      for (let i = 1; i < ball.trail.length; i++) {
        const prev = ball.trail[i - 1];
        const curr = ball.trail[i];
        const frac = i / ball.trail.length;
        ctx.strokeStyle = opts.modifiers.rainbowTrail
          ? `hsla(${(ball.hue + i * 18) % 360}, 92%, 64%, ${frac * 0.55})`
          : `hsla(${ball.hue}, 90%, 66%, ${frac * 0.42})`;
        ctx.lineWidth = ball.radius * frac * 1.3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(curr.x, curr.y);
        ctx.stroke();
      }
    }

    // Marble body
    ctx.save();
    const grad = ctx.createRadialGradient(
      ball.x - ball.radius * 0.35,
      ball.y - ball.radius * 0.35,
      ball.radius * 0.15,
      ball.x,
      ball.y,
      ball.radius
    );
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.35, `hsl(${ball.hue}, 95%, 72%)`);
    grad.addColorStop(1, `hsl(${ball.hue}, 82%, 44%)`);

    ctx.shadowColor = `hsla(${ball.hue}, 95%, 65%, 0.55)`;
    ctx.shadowBlur = 12;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 9. Particles
  for (const p of world.particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 10. Floating Score Popups
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

function drawPeg(ctx: CanvasRenderingContext2D, peg: Peg, time: number) {
  const pulseScale = 1 + peg.hitFlash * 0.22;

  ctx.save();
  ctx.translate(peg.x, peg.y);

  if (peg.kind === 'spinner') {
    ctx.rotate(peg.angle);
    // Bar
    ctx.fillStyle = peg.hitFlash > 0.1 ? '#FDE68A' : '#CBD5E1';
    ctx.beginPath();
    ctx.roundRect(-peg.armLength, -5.5, peg.armLength * 2, 11, 5.5);
    ctx.fill();

    // End caps
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(-peg.armLength + 5, 0, 4, 0, Math.PI * 2);
    ctx.arc(peg.armLength - 5, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    // Axle center
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
    return;
  }

  ctx.scale(pulseScale, pulseScale);

  if (peg.kind === 'portal') {
    const color = PORTAL_COLORS[((peg.portalGroup ?? 1) - 1) % PORTAL_COLORS.length];
    ctx.rotate(time * 2.2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(0, 0, peg.radius - 2, 0, Math.PI * 1.4);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, peg.radius - 7, Math.PI, Math.PI * 2.4);
    ctx.stroke();

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.arc(0, 0, peg.radius - 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return;
  }

  if (peg.kind === 'bumper') {
    ctx.shadowColor = 'rgba(16, 185, 129, 0.45)';
    ctx.shadowBlur = peg.hitFlash > 0.1 ? 18 : 8;

    ctx.fillStyle = peg.hitFlash > 0.2 ? '#6EE7B7' : '#10B981';
    ctx.beginPath();
    ctx.arc(0, 0, peg.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#064E3B';
    ctx.beginPath();
    ctx.arc(0, 0, peg.radius - 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#A7F3D0';
    ctx.beginPath();
    ctx.arc(0, 0, peg.radius - 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return;
  }

  if (peg.kind === 'bomb') {
    ctx.shadowColor = 'rgba(251, 113, 133, 0.65)';
    ctx.shadowBlur = peg.hitFlash > 0.1 ? 22 : 10;

    ctx.fillStyle = peg.hitFlash > 0.2 ? '#FFE4E6' : '#E11D48';
    ctx.beginPath();
    ctx.arc(0, 0, peg.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#FDA4AF';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#FFF1F2';
    ctx.font = '700 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', 0, 1);

    ctx.restore();
    return;
  }

  if (peg.kind === 'spring') {
    ctx.shadowColor = 'rgba(251, 113, 133, 0.45)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = peg.hitFlash > 0.2 ? '#FDA4AF' : '#FB7185';
    ctx.beginPath();
    ctx.arc(0, 0, peg.radius, 0, Math.PI * 2);
    ctx.fill();

    // Upward chevron
    ctx.strokeStyle = '#FFF1F2';
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-6, 3);
    ctx.lineTo(0, -4);
    ctx.lineTo(6, 3);
    ctx.stroke();

    ctx.restore();
    return;
  }

  if (peg.kind === 'splitter') {
    const active = peg.hit;
    ctx.shadowColor = 'rgba(34, 211, 238, 0.5)';
    ctx.shadowBlur = active ? 16 : 9;
    ctx.rotate(Math.PI / 4 + (active ? 0.3 : 0));
    const s = peg.radius * 1.25;
    ctx.fillStyle = active ? '#A5F3FC' : '#22D3EE';
    ctx.beginPath();
    ctx.roundRect(-s / 2, -s / 2, s, s, 4);
    ctx.fill();

    ctx.fillStyle = '#083344';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return;
  }

  if (peg.kind === 'target') {
    ctx.shadowColor = peg.hit ? 'rgba(253, 224, 71, 0.7)' : 'rgba(245, 158, 11, 0.45)';
    ctx.shadowBlur = peg.hit ? 16 : 8;

    const grad = ctx.createRadialGradient(-4, -4, 2, 0, 0, peg.radius);
    if (peg.hit) {
      grad.addColorStop(0, '#FEF9C3');
      grad.addColorStop(1, '#FBBF24');
    } else {
      grad.addColorStop(0, '#FDE68A');
      grad.addColorStop(0.45, '#F59E0B');
      grad.addColorStop(1, '#B45309');
    }

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, peg.radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner ring indicator for color-blind distinction
    ctx.strokeStyle = peg.hit ? '#FFFFFF' : 'rgba(255, 251, 235, 0.65)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, peg.radius * 0.52, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
    return;
  }

  // Normal peg
  if (peg.hit) {
    ctx.shadowColor = 'rgba(56, 189, 248, 0.55)';
    ctx.shadowBlur = 12;
  }
  const grad = ctx.createRadialGradient(-3, -3, 1.5, 0, 0, peg.radius);
  if (peg.hit) {
    grad.addColorStop(0, '#E0F2FE');
    grad.addColorStop(1, '#38BDF8');
  } else {
    grad.addColorStop(0, '#94A3B8');
    grad.addColorStop(0.55, '#475569');
    grad.addColorStop(1, '#1E293B');
  }
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, peg.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = peg.hit ? '#BAE6FD' : 'rgba(148, 163, 184, 0.45)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.restore();
}

function drawBucket(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  width: number,
  magnetActive: boolean
) {
  ctx.save();
  const half = width / 2;

  // Catch zone glow
  const glow = ctx.createLinearGradient(bx - half, by - 14, bx - half, by + 18);
  glow.addColorStop(0, magnetActive ? 'rgba(56, 189, 248, 0.35)' : 'rgba(16, 185, 129, 0.28)');
  glow.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(bx - half + 8, by - 14, width - 16, 28);

  // Bucket tray
  ctx.strokeStyle = magnetActive ? '#38BDF8' : '#34D399';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(bx - half, by - 10);
  ctx.lineTo(bx - half + 12, by + 10);
  ctx.lineTo(bx + half - 12, by + 10);
  ctx.lineTo(bx + half, by - 10);
  ctx.stroke();

  // Label inside bucket
  ctx.fillStyle = magnetActive ? '#BAE6FD' : '#A7F3D0';
  ctx.font = '600 10px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('+1 BALL', bx, by + 4);

  ctx.restore();
}

function drawLauncher(
  ctx: CanvasRenderingContext2D,
  aimAngle: number,
  canAim: boolean,
  modifiers: FunModifiers
) {
  ctx.save();
  ctx.translate(LAUNCHER_X, LAUNCHER_Y);

  // Mounting arch
  ctx.fillStyle = '#1E293B';
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -4, 24, 0, Math.PI, false);
  ctx.fill();
  ctx.stroke();

  // Rotating barrel
  ctx.rotate(aimAngle);
  ctx.fillStyle = canAim ? '#F8FAFC' : '#64748B';
  ctx.beginPath();
  ctx.roundRect(0, -7, 28, 14, 5);
  ctx.fill();

  // Loaded marble indicator at tip
  if (canAim) {
    ctx.fillStyle = modifiers.multiBall ? '#38BDF8' : '#F59E0B';
    ctx.beginPath();
    ctx.arc(10, 0, modifiers.giantMarble ? 6 : 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawSandboxGhost(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  brush: ToyBrush,
  pegs: Peg[]
) {
  ctx.save();
  if (brush === 'eraser') {
    const hovered = pegs.find((p) => Math.hypot(p.x - x, p.y - y) < Math.max(24, p.radius + 10));
    ctx.strokeStyle = hovered ? '#FB7185' : 'rgba(251, 113, 133, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    return;
  }

  const clampedX = Math.max(48, Math.min(ARENA_WIDTH - 48, x));
  const clampedY = Math.max(115, Math.min(ARENA_HEIGHT - 95, y));
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = '#F8FAFC';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  const r = brush === 'bumper' ? 23 : brush === 'portal' ? 19 : brush === 'spring' ? 17 : 14;
  ctx.beginPath();
  ctx.arc(clampedX, clampedY, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
