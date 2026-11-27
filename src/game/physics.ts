import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  BUCKET_Y,
  LAUNCHER_X,
  LAUNCHER_Y,
  makePeg,
} from './stages';
import {
  Ball,
  FloatingText,
  FunModifiers,
  Particle,
  Peg,
  RingWave,
} from './types';

export interface SimCallbacks {
  onPegHit: (peg: Peg, ball: Ball, combo: number) => void;
  onBumperHit: (peg: Peg, ball: Ball) => void;
  onSpringHit: (peg: Peg, ball: Ball) => void;
  onSplitterHit: (peg: Peg, ball: Ball, spawned: Ball) => void;
  onPortalWarp: (from: Peg, to: Peg, ball: Ball) => void;
  onBucketCatch: (ball: Ball) => void;
  onBallLost: (ball: Ball) => void;
}

export interface SimWorld {
  pegs: Peg[];
  balls: Ball[];
  particles: Particle[];
  rings: RingWave[];
  floatingTexts: FloatingText[];
  bucketX: number;
  bucketDir: number;
  bucketWidth: number;
  bucketSpeed: number;
  gravity: number;
  windX: number;
  nextBallId: number;
  shakeAmount: number;
  time: number;
}

const MAX_ACTIVE_BALLS = 18;
const LAUNCH_SPEED = 700;

export function createBall(
  id: number,
  x: number,
  y: number,
  vx: number,
  vy: number,
  modifiers: FunModifiers,
  hue = 42,
  isClone = false
): Ball {
  return {
    id,
    x,
    y,
    vx,
    vy,
    radius: modifiers.giantMarble ? 13 : 9,
    hue,
    trail: [],
    combo: 0,
    stuckTimer: 0,
    portalCooldown: isClone ? 0.3 : 0,
    age: 0,
    isClone,
  };
}

export function getLaunchVelocity(aimAngle: number): { vx: number; vy: number } {
  // aimAngle in radians, 0 is straight right, PI/2 is straight down
  const clamped = Math.max(0.18, Math.min(Math.PI - 0.18, aimAngle));
  return {
    vx: Math.cos(clamped) * LAUNCH_SPEED,
    vy: Math.sin(clamped) * LAUNCH_SPEED,
  };
}

export function spawnParticles(
  world: SimWorld,
  x: number,
  y: number,
  color: string,
  count: number,
  speed = 190,
  reducedMotion = false
) {
  const actualCount = reducedMotion ? Math.min(3, count) : count;
  for (let i = 0; i < actualCount; i++) {
    const a = (Math.PI * 2 * i) / actualCount + (Math.random() - 0.5) * 0.6;
    const spd = speed * (0.45 + Math.random() * 0.75);
    world.particles.push({
      x,
      y,
      vx: Math.cos(a) * spd,
      vy: Math.sin(a) * spd,
      radius: 2 + Math.random() * 2.5,
      color,
      alpha: 1,
      decay: 1.5 + Math.random() * 1.1,
    });
  }
}

export function spawnRing(
  world: SimWorld,
  x: number,
  y: number,
  color: string,
  maxRadius = 32
) {
  world.rings.push({
    x,
    y,
    radius: 8,
    maxRadius,
    color,
    alpha: 0.5,
  });
}

export function spawnFloatingText(
  world: SimWorld,
  x: number,
  y: number,
  text: string,
  color: string
) {
  world.floatingTexts.push({
    x,
    y,
    vy: -36,
    text,
    color,
    alpha: 1,
    scale: 1,
  });
  if (world.floatingTexts.length > 10) {
    world.floatingTexts.shift();
  }
}

function closestPointOnSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
): { x: number; y: number } {
  const abx = bx - ax;
  const aby = by - ay;
  const lenSq = abx * abx + aby * aby;
  if (lenSq === 0) return { x: ax, y: ay };
  const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / lenSq));
  return { x: ax + abx * t, y: ay + aby * t };
}

export function stepSimulation(
  world: SimWorld,
  dt: number,
  modifiers: FunModifiers,
  reducedMotion: boolean,
  callbacks: SimCallbacks
) {
  world.time += dt;
  if (world.shakeAmount > 0) {
    world.shakeAmount = Math.max(0, world.shakeAmount - dt * 28);
  }

  // Update bucket width & position
  const targetWidth = modifiers.magnetBucket ? 174 : 128;
  world.bucketWidth += (targetWidth - world.bucketWidth) * Math.min(1, dt * 10);
  const halfBucket = world.bucketWidth / 2;
  world.bucketX += world.bucketDir * world.bucketSpeed * dt;
  if (world.bucketX < halfBucket + 24) {
    world.bucketX = halfBucket + 24;
    world.bucketDir = 1;
  } else if (world.bucketX > ARENA_WIDTH - halfBucket - 24) {
    world.bucketX = ARENA_WIDTH - halfBucket - 24;
    world.bucketDir = -1;
  }

  // Update pegs (spinners, hit flash decay, portal cooldown)
  for (const peg of world.pegs) {
    if (peg.kind === 'spinner') {
      peg.angle += peg.angularVelocity * dt;
    }
    if (peg.hitFlash > 0) {
      peg.hitFlash = Math.max(0, peg.hitFlash - dt * 3.5);
    }
    if (peg.portalCooldown && peg.portalCooldown > 0) {
      peg.portalCooldown = Math.max(0, peg.portalCooldown - dt);
    }
  }

  const gravity = modifiers.lowGravity ? world.gravity * 0.45 : world.gravity;
  const restitution = modifiers.superBounce ? 0.94 : 0.82;
  const substeps = 4;
  const subDt = dt / substeps;

  const ballsToRemove = new Set<number>();
  const ballsToAdd: Ball[] = [];

  for (const ball of world.balls) {
    ball.age += dt;
    if (ball.portalCooldown > 0) {
      ball.portalCooldown = Math.max(0, ball.portalCooldown - dt);
    }
    if (modifiers.rainbowTrail) {
      ball.hue = (ball.hue + dt * 240) % 360;
    }

    // Record trail point once per frame
    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > 14) {
      ball.trail.shift();
    }

    for (let s = 0; s < substeps; s++) {
      // Gravity + wind
      ball.vx += world.windX * subDt;
      ball.vy += gravity * subDt;

      // Magnet bucket pull when falling in lower zone
      if (modifiers.magnetBucket && ball.y > 410 && ball.vy > 0) {
        const dx = world.bucketX - ball.x;
        const dy = BUCKET_Y - ball.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 10 && dist < 240) {
          ball.vx += (dx / dist) * 380 * subDt;
        }
      }

      // Gentle air drag & speed cap
      const speedSq = ball.vx * ball.vx + ball.vy * ball.vy;
      const maxSpeed = 1080;
      if (speedSq > maxSpeed * maxSpeed) {
        const scale = maxSpeed / Math.sqrt(speedSq);
        ball.vx *= scale;
        ball.vy *= scale;
      }

      ball.x += ball.vx * subDt;
      ball.y += ball.vy * subDt;

      // Arena wall collisions
      if (ball.x - ball.radius < 16) {
        ball.x = 16 + ball.radius;
        ball.vx = Math.abs(ball.vx) * 0.88;
      } else if (ball.x + ball.radius > ARENA_WIDTH - 16) {
        ball.x = ARENA_WIDTH - 16 - ball.radius;
        ball.vx = -Math.abs(ball.vx) * 0.88;
      }

      if (ball.y - ball.radius < 16) {
        ball.y = 16 + ball.radius;
        ball.vy = Math.abs(ball.vy) * 0.85;
      }

      // Peg collisions
      for (const peg of world.pegs) {
        if (peg.kind === 'spinner') {
          const cos = Math.cos(peg.angle);
          const sin = Math.sin(peg.angle);
          const ax = peg.x - cos * peg.armLength;
          const ay = peg.y - sin * peg.armLength;
          const bx = peg.x + cos * peg.armLength;
          const by = peg.y + sin * peg.armLength;

          const cp = closestPointOnSegment(ball.x, ball.y, ax, ay, bx, by);
          const dx = ball.x - cp.x;
          const dy = ball.y - cp.y;
          const dist = Math.hypot(dx, dy);
          const minDist = ball.radius + 7;

          if (dist < minDist && dist > 0.0001) {
            const nx = dx / dist;
            const ny = dy / dist;
            ball.x = cp.x + nx * minDist;
            ball.y = cp.y + ny * minDist;

            // Tangential boost from spinner rotation
            const rx = cp.x - peg.x;
            const ry = cp.y - peg.y;
            const armVx = -peg.angularVelocity * ry;
            const armVy = peg.angularVelocity * rx;

            const relVx = ball.vx - armVx;
            const relVy = ball.vy - armVy;
            const dot = relVx * nx + relVy * ny;
            if (dot < 0) {
              const armLen = Math.hypot(bx - ax, by - ay) || 1;
              const tx = (bx - ax) / armLen;
              const ty = (by - ay) / armLen;
              const vnAfter = -restitution * dot;
              let vt = relVx * tx + relVy * ty;
              const normalHit = Math.abs(dot);
              const coulomb = Math.min(Math.abs(vt) * 0.22, normalHit * 0.15);
              if (vt > 0) vt -= coulomb;
              else if (vt < 0) vt += coulomb;
              vt *= 0.92;
              ball.vx = vt * tx + vnAfter * nx + armVx * 0.88;
              ball.vy = vt * ty + vnAfter * ny + armVy * 0.88;
              peg.hitFlash = 1;
              callbacks.onPegHit(peg, ball, ball.combo);
            }
          }
          continue;
        }

        const dx = ball.x - peg.x;
        const dy = ball.y - peg.y;
        const dist = Math.hypot(dx, dy);
        const minDist = ball.radius + peg.radius;

        if (dist < minDist) {
          if (peg.kind === 'portal') {
            if (ball.portalCooldown <= 0) {
              const partner = world.pegs.find(
                (p) =>
                  p.id !== peg.id &&
                  p.kind === 'portal' &&
                  (p.portalGroup ?? 1) === (peg.portalGroup ?? 1)
              );
              if (partner) {
                const spd = Math.max(320, Math.hypot(ball.vx, ball.vy));
                const outAngle = Math.atan2(ball.vy, ball.vx);
                ball.x = partner.x + Math.cos(outAngle) * (partner.radius + ball.radius + 6);
                ball.y = partner.y + Math.sin(outAngle) * (partner.radius + ball.radius + 6);
                ball.vx = Math.cos(outAngle) * spd;
                ball.vy = Math.sin(outAngle) * spd;
                ball.portalCooldown = 0.42;
                peg.hitFlash = 1;
                partner.hitFlash = 1;
                ball.combo += 1;
                callbacks.onPortalWarp(peg, partner, ball);
                break;
              }
            }
            continue;
          }

          const nx = dist > 0.001 ? dx / dist : 0;
          const ny = dist > 0.001 ? dy / dist : -1;

          // Push ball out of peg
          ball.x = peg.x + nx * (minDist + 0.4);
          ball.y = peg.y + ny * (minDist + 0.4);

          const dot = ball.vx * nx + ball.vy * ny;
          if (dot < 0) {
            if (peg.kind === 'bumper') {
              const bounceSpeed = Math.max(460, Math.hypot(ball.vx, ball.vy) * 1.06);
              ball.vx = nx * bounceSpeed;
              ball.vy = ny * bounceSpeed;
              peg.hitFlash = 1;
              ball.combo += 1;
              if (!reducedMotion) {
                world.shakeAmount = Math.min(7, world.shakeAmount + 2.5);
              }
              callbacks.onBumperHit(peg, ball);
            } else if (peg.kind === 'bomb') {
              const blastSpeed = Math.max(620, Math.hypot(ball.vx, ball.vy) * 1.25);
              ball.vx = nx * blastSpeed;
              ball.vy = ny * blastSpeed;
              peg.hitFlash = 1;
              ball.combo += 2;
              if (!reducedMotion) {
                world.shakeAmount = Math.min(6, world.shakeAmount + 2.5);
              }
              spawnParticles(world, peg.x, peg.y, '#FB7185', 9, 150, reducedMotion);
              spawnRing(world, peg.x, peg.y, '#FB7185', 48);
              spawnFloatingText(world, peg.x, peg.y - 12, '+250', '#FDA4AF');
              callbacks.onBumperHit(peg, ball);
            } else if (peg.kind === 'spring') {
              // Propel upward with crisp kick
              ball.vx = nx * 240 + ball.vx * 0.45;
              ball.vy = -Math.max(540, Math.abs(ball.vy) * 1.1 + 190);
              peg.hitFlash = 1;
              ball.combo += 1;
              callbacks.onSpringHit(peg, ball);
            } else {
              ball.vx = (ball.vx - (1 + restitution) * dot * nx);
              ball.vy = (ball.vy - (1 + restitution) * dot * ny);

              if (peg.kind === 'splitter' && !peg.hit) {
                peg.hit = true;
                peg.hitTime = world.time;
                peg.hitFlash = 1;
                ball.combo += 1;
                if (world.balls.length + ballsToAdd.length < MAX_ACTIVE_BALLS) {
                  const clone = createBall(
                    world.nextBallId++,
                    ball.x,
                    ball.y,
                    -ball.vx * 0.95 + (Math.random() - 0.5) * 90,
                    ball.vy * 0.9 - 60,
                    modifiers,
                    (ball.hue + 145) % 360,
                    true
                  );
                  clone.combo = ball.combo;
                  ballsToAdd.push(clone);
                  callbacks.onSplitterHit(peg, ball, clone);
                } else {
                  callbacks.onPegHit(peg, ball, ball.combo);
                }
              } else {
                const firstHit = !peg.hit;
                if (firstHit) {
                  peg.hit = true;
                  peg.hitTime = world.time;
                  ball.combo += 1;
                  callbacks.onPegHit(peg, ball, ball.combo);
                }
                peg.hitFlash = 1;
              }
            }
          }
        }
      }

      // Catch bucket check
      const bucketLeft = world.bucketX - halfBucket;
      const bucketRight = world.bucketX + halfBucket;
      const bucketTop = BUCKET_Y - 12;
      const bucketBottom = BUCKET_Y + 22;

      if (
        ball.y + ball.radius >= bucketTop &&
        ball.y - ball.radius <= bucketBottom &&
        ball.x >= bucketLeft &&
        ball.x <= bucketRight &&
        ball.vy > 0
      ) {
        ballsToRemove.add(ball.id);
        callbacks.onBucketCatch(ball);
        break;
      }

      // Fell below arena
      if (ball.y - ball.radius > ARENA_HEIGHT + 18) {
        ballsToRemove.add(ball.id);
        callbacks.onBallLost(ball);
        break;
      }
    }

    // Anti-stuck safeguard
    const currentSpeed = Math.hypot(ball.vx, ball.vy);
    if (currentSpeed < 32) {
      ball.stuckTimer += dt;
      if (ball.stuckTimer > 0.65) {
        ball.vx += (Math.random() > 0.5 ? 1 : -1) * 140;
        ball.vy -= 120;
        ball.stuckTimer = 0;
      }
    } else {
      ball.stuckTimer = 0;
    }
  }

  if (ballsToRemove.size > 0) {
    world.balls = world.balls.filter((b) => !ballsToRemove.has(b.id));
  }
  if (ballsToAdd.length > 0) {
    world.balls.push(...ballsToAdd);
  }

  // Update particles
  for (let i = world.particles.length - 1; i >= 0; i--) {
    const p = world.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 180 * dt;
    p.alpha -= p.decay * dt;
    if (p.alpha <= 0) {
      world.particles.splice(i, 1);
    }
  }

  // Update expanding ring waves
  for (let i = world.rings.length - 1; i >= 0; i--) {
    const r = world.rings[i];
    r.radius += (r.maxRadius - r.radius) * Math.min(1, dt * 8) + 45 * dt;
    r.alpha -= dt * 2.1;
    if (r.alpha <= 0 || r.radius >= r.maxRadius) {
      world.rings.splice(i, 1);
    }
  }

  // Update floating text
  for (let i = world.floatingTexts.length - 1; i >= 0; i--) {
    const ft = world.floatingTexts[i];
    ft.y += ft.vy * dt;
    ft.vy *= 0.96;
    ft.alpha -= dt * 1.15;
    if (ft.alpha <= 0) {
      world.floatingTexts.splice(i, 1);
    }
  }
}

export function computeAimPreview(
  aimAngle: number,
  gravity: number,
  windX: number,
  pegs: Peg[],
  modifiers: FunModifiers
): Array<{ x: number; y: number }> {
  const { vx: initVx, vy: initVy } = getLaunchVelocity(aimAngle);
  let x = LAUNCHER_X + Math.cos(aimAngle) * 24;
  let y = LAUNCHER_Y + Math.sin(aimAngle) * 24;
  let vx = initVx;
  let vy = initVy;

  const ballRadius = modifiers.giantMarble ? 13 : 9;
  const g = modifiers.lowGravity ? gravity * 0.45 : gravity;
  const stepDt = 1 / 90;
  const points: Array<{ x: number; y: number }> = [];
  let bounced = false;

  for (let i = 0; i < 65; i++) {
    vx += windX * stepDt;
    vy += g * stepDt;
    x += vx * stepDt;
    y += vy * stepDt;

    if (x - ballRadius < 16) {
      x = 16 + ballRadius;
      vx = Math.abs(vx) * 0.88;
    } else if (x + ballRadius > ARENA_WIDTH - 16) {
      x = ARENA_WIDTH - 16 - ballRadius;
      vx = -Math.abs(vx) * 0.88;
    }

    if (i % 3 === 0) {
      points.push({ x, y });
    }

    if (!bounced) {
      for (const peg of pegs) {
        if (peg.kind === 'spinner') continue;
        const dist = Math.hypot(x - peg.x, y - peg.y);
        if (dist < ballRadius + peg.radius) {
          bounced = true;
          break;
        }
      }
    }

    if (bounced || y > ARENA_HEIGHT - 80) {
      break;
    }
  }

  return points;
}

export function placeToyPeg(
  pegs: Peg[],
  x: number,
  y: number,
  kind: Peg['kind']
): Peg[] {
  const clampedX = Math.max(48, Math.min(ARENA_WIDTH - 48, x));
  const clampedY = Math.max(115, Math.min(ARENA_HEIGHT - 95, y));

  let portalGroup = 1;
  if (kind === 'portal') {
    const existingPortals = pegs.filter((p) => p.kind === 'portal');
    portalGroup = Math.floor(existingPortals.length / 2) + 1;
  }

  const newPeg = makePeg(clampedX, clampedY, kind, {
    portalGroup,
    isUserPlaced: true,
  });

  return [...pegs, newPeg];
}
