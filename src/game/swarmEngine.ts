import { soundEngine } from '../audio/soundEngine';
import { ARENA_HEIGHT, ARENA_WIDTH } from './stages';
import { FloatingText, Particle, RingWave, SwarmPreset } from './types';

export type SwarmTileKind =
  | 'block'
  | 'bomb'
  | 'laser_h'
  | 'laser_v'
  | 'splitter'
  | 'add_ball';

export interface SwarmTile {
  id: number;
  col: number;
  row: number;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: SwarmTileKind;
  hp: number;
  maxHp: number;
  hitFlash: number;
  triggered?: boolean;
}

export interface SwarmBall {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
  trail: Array<{ x: number; y: number }>;
  bounces: number;
  returning: boolean;
  splitterCooldown: number;
}

export interface LaserBeam {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  alpha: number;
  color: string;
}

export interface SwarmWorld {
  tiles: SwarmTile[];
  balls: SwarmBall[];
  particles: Particle[];
  rings: RingWave[];
  lasers: LaserBeam[];
  floatingTexts: FloatingText[];
  launcherX: number;
  launcherY: number;
  nextLauncherX: number | null;
  aimAngle: number;
  wave: number;
  swarmSize: number;
  pendingAddBalls: number;
  ballsToFire: number;
  fireTimer: number;
  fireAngle: number;
  phase: 'AIMING' | 'FIRING' | 'ADVANCING' | 'GAME_OVER';
  advanceProgress: number;
  score: number;
  combo: number;
  maxCombo: number;
  feverActive: boolean;
  speedMultiplier: number;
  shakeAmount: number;
  preset: SwarmPreset;
  nextId: number;
  time: number;
}

const COLS = 8;
const MARGIN_X = 36;
const TOP_BAR_Y = 34;
const CELL_GAP = 8;
const CELL_W = (ARENA_WIDTH - MARGIN_X * 2 - CELL_GAP * (COLS - 1)) / COLS;
const CELL_H = 44;
const ROW_STEP = CELL_H + CELL_GAP;
const DANGER_Y = ARENA_HEIGHT - 86;
const LAUNCHER_Y = ARENA_HEIGHT - 36;
const BALL_SPEED = 780;
const MAX_SWARM_ACTIVE = 130;

function cellPos(col: number, row: number): { x: number; y: number } {
  return {
    x: MARGIN_X + col * (CELL_W + CELL_GAP),
    y: TOP_BAR_Y + row * ROW_STEP,
  };
}

function getBlockColor(hp: number): { fill: string; stroke: string; text: string } {
  if (hp >= 35) return { fill: '#7C3AED', stroke: '#A78BFA', text: '#F5F3FF' };
  if (hp >= 20) return { fill: '#E11D48', stroke: '#FB7185', text: '#FFF1F2' };
  if (hp >= 10) return { fill: '#D97706', stroke: '#FBBF24', text: '#FFFBEB' };
  if (hp >= 5) return { fill: '#0284C7', stroke: '#38BDF8', text: '#F0F9FF' };
  return { fill: '#059669', stroke: '#34D399', text: '#ECFDF5' };
}

export function createSwarmWorld(preset: SwarmPreset = 'CLASSIC'): SwarmWorld {
  const startSwarm =
    preset === 'EXTREME100'
      ? 100
      : preset === 'TWIN_GALAXIES'
      ? 44
      : preset === 'DIAMOND_GALAXY'
      ? 36
      : preset === 'PRISM_TUNNEL'
      ? 34
      : preset === 'VOLLEY30'
      ? 30
      : preset === 'LASER_MATRIX'
      ? 28
      : preset === 'FORTRESS'
      ? 24
      : preset === 'BOMB_GARDEN'
      ? 18
      : 8;
  const startWave =
    preset === 'EXTREME100'
      ? 8
      : preset === 'FORTRESS' || preset === 'TWIN_GALAXIES'
      ? 5
      : preset === 'LASER_MATRIX' || preset === 'PRISM_TUNNEL'
      ? 4
      : preset === 'VOLLEY30' || preset === 'DIAMOND_GALAXY'
      ? 3
      : 1;

  const world: SwarmWorld = {
    tiles: [],
    balls: [],
    particles: [],
    rings: [],
    lasers: [],
    floatingTexts: [],
    launcherX: ARENA_WIDTH / 2,
    launcherY: LAUNCHER_Y,
    nextLauncherX: null,
    aimAngle: -Math.PI / 2,
    wave: startWave,
    swarmSize: startSwarm,
    pendingAddBalls: 0,
    ballsToFire: 0,
    fireTimer: 0,
    fireAngle: -Math.PI / 2,
    phase: 'AIMING',
    advanceProgress: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    feverActive: false,
    speedMultiplier: 1,
    shakeAmount: 0,
    preset,
    nextId: 1,
    time: 0,
  };

  const rows =
    preset === 'EXTREME100' ||
    preset === 'FORTRESS' ||
    preset === 'DIAMOND_GALAXY' ||
    preset === 'LASER_MATRIX' ||
    preset === 'PRISM_TUNNEL' ||
    preset === 'TWIN_GALAXIES'
      ? 4
      : preset === 'VOLLEY30' || preset === 'BOMB_GARDEN'
      ? 3
      : 2;
  for (let r = rows - 1; r >= 0; r--) {
    spawnSwarmRow(world, r, startWave + r * 2, preset);
  }
  return world;
}

function spawnSwarmRow(
  world: SwarmWorld,
  row: number,
  wave: number,
  preset: SwarmPreset = 'CLASSIC'
) {
  let placedBallOrb = false;
  let placedBlocks = 0;
  const baseHp = Math.max(2, Math.round(wave * 2.4 + 2));

  // Pick 1 guaranteed add_ball column
  const orbCol = Math.floor(Math.random() * COLS);

  for (let col = 0; col < COLS; col++) {
    const pos = cellPos(col, row);

    if (col === orbCol && !placedBallOrb) {
      placedBallOrb = true;
      world.tiles.push({
        id: world.nextId++,
        col,
        row,
        x: pos.x,
        y: pos.y,
        w: CELL_W,
        h: CELL_H,
        kind: 'add_ball',
        hp: 1,
        maxHp: 1,
        hitFlash: 0,
      });
      continue;
    }

    const roll = Math.random();
    if (preset === 'FORTRESS' && (row + col) % 2 === 1 && roll < 0.45) {
      continue;
    }
    if (preset === 'DIAMOND_GALAXY') {
      const distCenter = Math.abs(col - 3.5) + Math.abs((row % 4) - 1.5);
      if (distCenter > 4.2 && roll < 0.65) continue;
    }
    if (preset === 'PRISM_TUNNEL' && (col === 3 || col === 4) && row % 2 === 0) {
      continue;
    }
    if (preset === 'TWIN_GALAXIES' && (col === 3 || col === 4)) {
      if (roll < 0.72) continue;
    }
    if (
      preset !== 'BOMB_GARDEN' &&
      preset !== 'DIAMOND_GALAXY' &&
      preset !== 'LASER_MATRIX' &&
      preset !== 'PRISM_TUNNEL' &&
      preset !== 'TWIN_GALAXIES' &&
      roll < 0.24 &&
      placedBlocks >= 2
    ) {
      continue;
    }

    let kind: SwarmTileKind = 'block';
    let hp = baseHp + Math.floor(Math.random() * Math.max(2, Math.floor(wave * 0.9)));

    const specialRoll = Math.random();
    if (preset === 'BOMB_GARDEN') {
      if (specialRoll < 0.34) {
        kind = 'bomb';
        hp = Math.max(2, Math.floor(baseHp * 0.55));
      } else if (specialRoll < 0.5) {
        kind = 'splitter';
        hp = 1;
      } else if (specialRoll < 0.62) {
        kind = Math.random() > 0.5 ? 'laser_h' : 'laser_v';
        hp = 1;
      }
    } else if (preset === 'PRISM_TUNNEL') {
      if (col === 2 || col === 5) {
        kind = specialRoll < 0.4 ? 'splitter' : 'laser_v';
        hp = 1;
      } else if (specialRoll < 0.24) {
        kind = 'bomb';
        hp = Math.max(2, Math.floor(baseHp * 0.65));
      } else {
        hp = Math.round(baseHp * 1.35);
      }
    } else if (preset === 'TWIN_GALAXIES') {
      if (specialRoll < 0.22) {
        kind = 'bomb';
        hp = Math.max(2, Math.floor(baseHp * 0.65));
      } else if (specialRoll < 0.36) {
        kind = 'splitter';
        hp = 1;
      } else if (specialRoll < 0.48) {
        kind = 'laser_h';
        hp = 1;
      } else {
        hp = Math.round(baseHp * 1.45);
      }
    } else if (preset === 'LASER_MATRIX') {
      if ((row + col) % 3 === 0) {
        kind = col % 2 === 0 ? 'laser_h' : 'laser_v';
        hp = 1;
      } else if (specialRoll < 0.16) {
        kind = 'splitter';
        hp = 1;
      } else if (specialRoll < 0.28) {
        kind = 'bomb';
        hp = Math.max(2, Math.floor(baseHp * 0.65));
      }
    } else if (preset === 'DIAMOND_GALAXY') {
      if (specialRoll < 0.18) {
        kind = 'splitter';
        hp = 1;
      } else if (specialRoll < 0.32) {
        kind = 'bomb';
        hp = Math.max(2, Math.floor(baseHp * 0.7));
      } else if (specialRoll < 0.42) {
        kind = Math.random() > 0.5 ? 'laser_h' : 'laser_v';
        hp = 1;
      } else {
        hp = Math.round(baseHp * 1.2);
      }
    } else if (preset === 'FORTRESS') {
      if (specialRoll < 0.16) {
        kind = Math.random() > 0.5 ? 'laser_h' : 'laser_v';
        hp = 1;
      } else if (specialRoll < 0.24) {
        kind = 'bomb';
        hp = Math.max(2, Math.floor(baseHp * 0.65));
      } else {
        hp = Math.round(baseHp * 1.85);
      }
    } else {
      if (specialRoll < 0.085) {
        kind = 'bomb';
        hp = Math.max(2, Math.floor(baseHp * 0.65));
      } else if (specialRoll < 0.145) {
        kind = Math.random() > 0.5 ? 'laser_h' : 'laser_v';
        hp = 1;
      } else if (specialRoll < 0.19) {
        kind = 'splitter';
        hp = 1;
      } else if (Math.random() < 0.18) {
        hp = Math.round(baseHp * 1.7);
      }
    }

    placedBlocks++;
    world.tiles.push({
      id: world.nextId++,
      col,
      row,
      x: pos.x,
      y: pos.y,
      w: CELL_W,
      h: CELL_H,
      kind,
      hp,
      maxHp: hp,
      hitFlash: 0,
    });
  }
}

export function launchSwarmVolley(world: SwarmWorld) {
  if (world.phase !== 'AIMING') return;
  world.phase = 'FIRING';
  world.nextLauncherX = null;
  world.ballsToFire = world.swarmSize;
  world.fireTimer = 0;
  world.fireAngle = Math.max(-Math.PI + 0.16, Math.min(-0.16, world.aimAngle));
  world.combo = 0;
  world.feverActive = false;
  world.speedMultiplier = 1;
}

export function recallSwarmBalls(world: SwarmWorld) {
  if (world.phase !== 'FIRING') return;
  world.ballsToFire = 0;
  for (const b of world.balls) {
    b.returning = true;
  }
}

function addParticles(
  world: SwarmWorld,
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
    const spd = speed * (0.4 + Math.random() * 0.8);
    world.particles.push({
      x,
      y,
      vx: Math.cos(a) * spd,
      vy: Math.sin(a) * spd,
      radius: 2 + Math.random() * 3,
      color,
      alpha: 1,
      decay: 1.8 + Math.random() * 1.1,
    });
  }
}

function addFloating(
  world: SwarmWorld,
  x: number,
  y: number,
  text: string,
  color: string
) {
  if (world.floatingTexts.length >= 10) {
    world.floatingTexts.shift();
  }
  world.floatingTexts.push({
    x,
    y,
    vy: -38,
    text,
    color,
    alpha: 0.9,
    scale: 1,
  });
}

function damageTile(
  world: SwarmWorld,
  tile: SwarmTile,
  dmg: number,
  reducedMotion: boolean,
  depth = 0
) {
  if (tile.hp <= 0) return;
  tile.hp -= dmg;
  tile.hitFlash = 1;

  if (tile.hp <= 0) {
    const cx = tile.x + tile.w / 2;
    const cy = tile.y + tile.h / 2;

    if (tile.kind === 'bomb') {
      soundEngine.playBombExplosion();
      if (!reducedMotion) {
        world.shakeAmount = Math.min(12, world.shakeAmount + 7);
      }
      world.rings.push({
        x: cx,
        y: cy,
        radius: 12,
        maxRadius: 76,
        color: '#FB7185',
        alpha: 0.55,
      });
      addParticles(world, cx, cy, '#FB7185', 10, 175, reducedMotion);
      addParticles(world, cx, cy, '#FDE047', 6, 125, reducedMotion);
      addFloating(world, cx, cy - 8, '+300', '#FDA4AF');

      const bonus = 300;
      world.score += bonus;

      if (depth < 4) {
        const blastRadius = 148;
        const blastDmg = Math.max(4, Math.ceil(world.wave * 1.6));
        for (const other of world.tiles) {
          if (other.id === tile.id || other.hp <= 0) continue;
          if (other.kind === 'add_ball' || other.kind === 'laser_h' || other.kind === 'laser_v' || other.kind === 'splitter') {
            continue;
          }
          const ox = other.x + other.w / 2;
          const oy = other.y + other.h / 2;
          if (Math.hypot(ox - cx, oy - cy) <= blastRadius) {
            damageTile(world, other, blastDmg, reducedMotion, depth + 1);
          }
        }
      }
    } else {
      soundEngine.playBlockBreak(world.combo);
      const col = getBlockColor(tile.maxHp);
      addParticles(world, cx, cy, col.stroke, 10, 210, reducedMotion);
      const pts = (world.feverActive ? 80 : 40) + tile.maxHp * 5;
      world.score += pts;
    }
  } else {
    world.score += world.feverActive ? 20 : 10;
  }
}

export function stepSwarmWorld(
  world: SwarmWorld,
  rawDt: number,
  reducedMotion: boolean,
  zenMode = false
): { gameOver: boolean } {
  const dt = rawDt * (world.phase === 'FIRING' ? world.speedMultiplier : 1);
  world.time += rawDt;

  if (zenMode) {
    world.shakeAmount = 0;
    world.feverActive = false;
  } else if (world.shakeAmount > 0) {
    world.shakeAmount = Math.max(0, world.shakeAmount - rawDt * 34);
  }

  for (const t of world.tiles) {
    if (t.hitFlash > 0) {
      t.hitFlash = Math.max(0, t.hitFlash - rawDt * 8);
    }
  }

  // Firing stream of balls
  if (world.phase === 'FIRING') {
    if (world.ballsToFire > 0) {
      world.fireTimer -= dt;
      while (world.ballsToFire > 0 && world.fireTimer <= 0) {
        world.fireTimer += 0.052;
        world.ballsToFire--;
        soundEngine.playLaunch();
        world.balls.push({
          id: world.nextId++,
          x: world.launcherX,
          y: world.launcherY,
          vx: Math.cos(world.fireAngle) * BALL_SPEED,
          vy: Math.sin(world.fireAngle) * BALL_SPEED,
          radius: 7.5,
          hue: world.feverActive ? 45 : 195,
          trail: [],
          bounces: 0,
          returning: false,
          splitterCooldown: 0,
        });
      }
    }

    const substeps = 4;
    const subDt = dt / substeps;
    const toRemove = new Set<number>();
    const toAdd: SwarmBall[] = [];

    for (const ball of world.balls) {
      if (ball.splitterCooldown > 0) {
        ball.splitterCooldown = Math.max(0, ball.splitterCooldown - dt);
      }

      if (ball.returning) {
        const targetX = world.nextLauncherX ?? world.launcherX;
        const dx = targetX - ball.x;
        const dy = world.launcherY - ball.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 24) {
          toRemove.add(ball.id);
        } else {
          ball.x += (dx / dist) * 1250 * dt;
          ball.y += (dy / dist) * 1250 * dt;
        }
        continue;
      }

      ball.trail.push({ x: ball.x, y: ball.y });
      if (ball.trail.length > 9) ball.trail.shift();

      for (let s = 0; s < substeps; s++) {
        ball.x += ball.vx * subDt;
        ball.y += ball.vy * subDt;

        // Walls
        if (ball.x - ball.radius < 18) {
          ball.x = 18 + ball.radius;
          ball.vx = Math.abs(ball.vx);
        } else if (ball.x + ball.radius > ARENA_WIDTH - 18) {
          ball.x = ARENA_WIDTH - 18 - ball.radius;
          ball.vx = -Math.abs(ball.vx);
        }

        if (ball.y - ball.radius < 18) {
          ball.y = 18 + ball.radius;
          ball.vy = Math.abs(ball.vy);
        }

        // Prevent nearly horizontal infinite loops
        if (Math.abs(ball.vy) < 70 && ball.y < LAUNCHER_Y - 30) {
          ball.vy += (ball.vy >= 0 ? 1 : -1) * 45;
          const spd = Math.hypot(ball.vx, ball.vy);
          ball.vx = (ball.vx / spd) * BALL_SPEED;
          ball.vy = (ball.vy / spd) * BALL_SPEED;
        }

        // Bottom return line
        if (ball.y >= LAUNCHER_Y) {
          if (world.nextLauncherX === null) {
            world.nextLauncherX = Math.max(
              52,
              Math.min(ARENA_WIDTH - 52, ball.x)
            );
          }
          ball.returning = true;
          break;
        }

        // Tile collisions
        for (const tile of world.tiles) {
          if (tile.hp <= 0) continue;

          if (
            tile.kind === 'add_ball' ||
            tile.kind === 'laser_h' ||
            tile.kind === 'laser_v' ||
            tile.kind === 'splitter'
          ) {
            const cx = tile.x + tile.w / 2;
            const cy = tile.y + tile.h / 2;
            const dist = Math.hypot(ball.x - cx, ball.y - cy);
            if (dist < ball.radius + 16) {
              if (tile.kind === 'add_ball' && !tile.triggered) {
                tile.triggered = true;
                tile.hp = 0;
                world.pendingAddBalls += 1;
                soundEngine.playPickup();
                addParticles(world, cx, cy, '#34D399', 12, 200, reducedMotion);
                addFloating(world, cx, cy - 12, '+1 BALL', '#6EE7B7');
              } else if (
                (tile.kind === 'laser_h' || tile.kind === 'laser_v') &&
                ball.splitterCooldown <= 0
              ) {
                tile.triggered = true;
                tile.hitFlash = 1;
                ball.splitterCooldown = 0.14;
                soundEngine.playLaser();

                if (tile.kind === 'laser_h') {
                  world.lasers.push({
                    x1: 20,
                    y1: cy,
                    x2: ARENA_WIDTH - 20,
                    y2: cy,
                    alpha: 1,
                    color: '#22D3EE',
                  });
                  for (const target of world.tiles) {
                    if (
                      target.hp > 0 &&
                      (target.kind === 'block' || target.kind === 'bomb') &&
                      Math.abs(target.y + target.h / 2 - cy) < CELL_H * 0.6
                    ) {
                      damageTile(world, target, 2, reducedMotion);
                    }
                  }
                } else {
                  world.lasers.push({
                    x1: cx,
                    y1: 20,
                    x2: cx,
                    y2: LAUNCHER_Y,
                    alpha: 1,
                    color: '#38BDF8',
                  });
                  for (const target of world.tiles) {
                    if (
                      target.hp > 0 &&
                      (target.kind === 'block' || target.kind === 'bomb') &&
                      Math.abs(target.x + target.w / 2 - cx) < CELL_W * 0.6
                    ) {
                      damageTile(world, target, 2, reducedMotion);
                    }
                  }
                }
              } else if (
                tile.kind === 'splitter' &&
                ball.splitterCooldown <= 0 &&
                world.balls.length + toAdd.length < MAX_SWARM_ACTIVE
              ) {
                tile.triggered = true;
                tile.hitFlash = 1;
                ball.splitterCooldown = 0.25;
                soundEngine.playSplitter();
                const angle = Math.atan2(ball.vy, ball.vx) + (Math.random() > 0.5 ? 0.35 : -0.35);
                toAdd.push({
                  id: world.nextId++,
                  x: cx,
                  y: cy,
                  vx: Math.cos(angle) * BALL_SPEED,
                  vy: Math.sin(angle) * BALL_SPEED,
                  radius: 7.5,
                  hue: 275,
                  trail: [],
                  bounces: ball.bounces,
                  returning: false,
                  splitterCooldown: 0.3,
                });
                addParticles(world, cx, cy, '#C084FC', 10, 180, reducedMotion);
              }
            }
            continue;
          }

          // Solid block / bomb AABB collision
          const closestX = Math.max(tile.x, Math.min(ball.x, tile.x + tile.w));
          const closestY = Math.max(tile.y, Math.min(ball.y, tile.y + tile.h));
          const dx = ball.x - closestX;
          const dy = ball.y - closestY;
          const distSq = dx * dx + dy * dy;

          if (distSq < ball.radius * ball.radius) {
            const dist = Math.sqrt(distSq);
            let nx = 0;
            let ny = 0;
            if (dist > 0.0001) {
              nx = dx / dist;
              ny = dy / dist;
            } else {
              const cx = tile.x + tile.w / 2;
              const cy = tile.y + tile.h / 2;
              if (Math.abs(ball.x - cx) / tile.w > Math.abs(ball.y - cy) / tile.h) {
                nx = ball.x > cx ? 1 : -1;
              } else {
                ny = ball.y > cy ? 1 : -1;
              }
            }

            ball.x = closestX + nx * (ball.radius + 0.5);
            ball.y = closestY + ny * (ball.radius + 0.5);

            const dot = ball.vx * nx + ball.vy * ny;
            if (dot < 0) {
              ball.vx = ball.vx - 2 * dot * nx;
              ball.vy = ball.vy - 2 * dot * ny;
            }

            ball.bounces++;
            world.combo++;
            if (world.combo > world.maxCombo) {
              world.maxCombo = world.combo;
            }
            if (!zenMode && world.combo >= 25 && !world.feverActive) {
              world.feverActive = true;
              addFloating(world, ARENA_WIDTH / 2, 160, 'FEVER 2x!', '#FDE047');
            }
            if (world.feverActive) {
              ball.hue = (ball.hue + 28) % 360;
            }

            soundEngine.playPegHit(world.combo, false);
            const dmg = world.feverActive ? 2 : 1;
            damageTile(world, tile, dmg, reducedMotion);
            break;
          }
        }
      }
    }

    if (toRemove.size > 0) {
      world.balls = world.balls.filter((b) => !toRemove.has(b.id));
    }
    if (toAdd.length > 0) {
      world.balls.push(...toAdd);
    }

    // Remove dead blocks cleanly
    world.tiles = world.tiles.filter((t) => t.hp > 0);

    // Check if volley finished
    if (world.ballsToFire <= 0 && world.balls.length === 0) {
      // Remove triggered lasers/splitters at end of turn
      world.tiles = world.tiles.filter((t) => !t.triggered);
      if (world.nextLauncherX !== null) {
        world.launcherX = world.nextLauncherX;
      }
      world.swarmSize += world.pendingAddBalls;
      world.pendingAddBalls = 0;

      // Board clear bonus!
      const remainingBlocks = world.tiles.filter(
        (t) => t.kind === 'block' || t.kind === 'bomb'
      ).length;
      if (remainingBlocks === 0) {
        world.score += 1000;
        soundEngine.playStageClear();
        addFloating(world, ARENA_WIDTH / 2, 240, 'ALL CLEAR! +1000', '#34D399');
      }

      world.wave += 1;
      world.phase = 'ADVANCING';
      world.advanceProgress = 0;

      // Shift existing rows down & spawn new wave at row 0
      for (const t of world.tiles) {
        t.row += 1;
      }
      spawnSwarmRow(world, 0, world.wave, world.preset);
    }
  } else if (world.phase === 'ADVANCING') {
    world.advanceProgress = Math.min(1, world.advanceProgress + rawDt * 4.5);
    for (const t of world.tiles) {
      const targetY = cellPos(t.col, t.row).y;
      t.y += (targetY - t.y) * Math.min(1, rawDt * 18);
    }
    if (world.advanceProgress >= 1) {
      for (const t of world.tiles) {
        t.y = cellPos(t.col, t.row).y;
      }

      // Check danger line breach
      if (zenMode) {
        world.tiles = world.tiles.filter((t) => {
          if (t.y + t.h >= DANGER_Y) {
            if (t.kind === 'block' || t.kind === 'bomb') {
              const cx = t.x + t.w / 2;
              const cy = t.y + t.h / 2;
              for (let k = 0; k < (reducedMotion ? 2 : 6); k++) {
                const a = Math.random() * Math.PI * 2;
                const spd = 40 + Math.random() * 90;
                world.particles.push({
                  x: cx,
                  y: cy,
                  vx: Math.cos(a) * spd,
                  vy: Math.sin(a) * spd,
                  radius: 2.2,
                  color: '#5EEAD4',
                  alpha: 0.9,
                  decay: 1.5,
                });
              }
            }
            return false;
          }
          return true;
        });
        world.phase = 'AIMING';
      } else {
        const breached = world.tiles.some(
          (t) => (t.kind === 'block' || t.kind === 'bomb') && t.y + t.h >= DANGER_Y
        );
        if (breached) {
          world.phase = 'GAME_OVER';
          return { gameOver: true };
        }
        world.phase = 'AIMING';
      }
    }
  }

  // Update visual FX
  for (let i = world.particles.length - 1; i >= 0; i--) {
    const p = world.particles[i];
    p.x += p.vx * rawDt;
    p.y += p.vy * rawDt;
    p.vy += 240 * rawDt;
    p.alpha -= p.decay * rawDt;
    if (p.alpha <= 0) world.particles.splice(i, 1);
  }
  for (let i = world.rings.length - 1; i >= 0; i--) {
    const r = world.rings[i];
    r.radius += (r.maxRadius - r.radius) * Math.min(1, rawDt * 9) + 60 * rawDt;
    r.alpha -= rawDt * 2.4;
    if (r.alpha <= 0) world.rings.splice(i, 1);
  }
  for (let i = world.lasers.length - 1; i >= 0; i--) {
    world.lasers[i].alpha -= rawDt * 4.5;
    if (world.lasers[i].alpha <= 0) world.lasers.splice(i, 1);
  }
  for (let i = world.floatingTexts.length - 1; i >= 0; i--) {
    const ft = world.floatingTexts[i];
    ft.y += ft.vy * rawDt;
    ft.alpha -= rawDt * 1.1;
    if (ft.alpha <= 0) world.floatingTexts.splice(i, 1);
  }

  return { gameOver: false };
}

export function renderSwarmWorld(
  ctx: CanvasRenderingContext2D,
  world: SwarmWorld,
  zenMode = false
) {
  ctx.save();

  if (!zenMode && world.shakeAmount > 0.1) {
    ctx.translate(
      (Math.random() - 0.5) * world.shakeAmount,
      (Math.random() - 0.5) * world.shakeAmount
    );
  }

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, ARENA_HEIGHT);
  bg.addColorStop(0, '#0B1222');
  bg.addColorStop(1, '#080D18');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

  if (!zenMode && world.feverActive) {
    const feverGlow = ctx.createRadialGradient(
      ARENA_WIDTH / 2,
      ARENA_HEIGHT / 2,
      60,
      ARENA_WIDTH / 2,
      ARENA_HEIGHT / 2,
      480
    );
    feverGlow.addColorStop(0, 'rgba(245, 158, 11, 0.10)');
    feverGlow.addColorStop(1, 'rgba(11, 17, 32, 0)');
    ctx.fillStyle = feverGlow;
    ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
  }

  // Arena Frame
  ctx.strokeStyle =
    !zenMode && world.feverActive
      ? 'rgba(251, 191, 36, 0.45)'
      : 'rgba(148, 163, 184, 0.18)';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, ARENA_WIDTH - 36, ARENA_HEIGHT - 28);

  // Danger line (hidden in Zen Mode)
  if (!zenMode) {
    ctx.save();
    ctx.strokeStyle = 'rgba(251, 113, 133, 0.38)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([7, 7]);
    ctx.beginPath();
    ctx.moveTo(22, DANGER_Y);
    ctx.lineTo(ARENA_WIDTH - 22, DANGER_Y);
    ctx.stroke();
    ctx.restore();
  }

  // Aim trajectory preview (with 1st bounce!)
  if (world.phase === 'AIMING') {
    let ax = world.launcherX;
    let ay = world.launcherY;
    let vx = Math.cos(world.aimAngle) * 14;
    let vy = Math.sin(world.aimAngle) * 14;

    for (let i = 0; i < 34; i++) {
      ax += vx;
      ay += vy;
      if (ax < 25 || ax > ARENA_WIDTH - 25) {
        vx = -vx;
        ax = Math.max(25, Math.min(ARENA_WIDTH - 25, ax));
      }
      if (ay < 25) break;
      ctx.fillStyle = `rgba(248, 250, 252, ${Math.max(0.08, 0.65 - i * 0.017)})`;
      ctx.beginPath();
      ctx.arc(ax, ay, Math.max(1.8, 3.6 - i * 0.05), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Lasers
  for (const l of world.lasers) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, l.alpha);
    ctx.strokeStyle = l.color;
    ctx.shadowColor = l.color;
    ctx.shadowBlur = 16;
    ctx.lineWidth = 8 * l.alpha;
    ctx.beginPath();
    ctx.moveTo(l.x1, l.y1);
    ctx.lineTo(l.x2, l.y2);
    ctx.stroke();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5 * l.alpha;
    ctx.stroke();
    ctx.restore();
  }

  // Tiles
  for (const tile of world.tiles) {
    if (tile.hp <= 0) continue;
    const cx = tile.x + tile.w / 2;
    const cy = tile.y + tile.h / 2;

    if (tile.kind === 'add_ball') {
      const pulse = 1 + Math.sin(world.time * 5) * 0.08;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(pulse, pulse);
      ctx.strokeStyle = '#34D399';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(52, 211, 153, 0.6)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+1', 0, 0.5);
      ctx.restore();
      continue;
    }

    if (tile.kind === 'laser_h' || tile.kind === 'laser_v') {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = '#22D3EE';
      ctx.fillStyle = tile.hitFlash > 0.1 ? '#FFFFFF' : 'rgba(8, 51, 68, 0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#A5F3FC';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      if (tile.kind === 'laser_h') {
        ctx.moveTo(-9, 0);
        ctx.lineTo(9, 0);
      } else {
        ctx.moveTo(0, -9);
        ctx.lineTo(0, 9);
      }
      ctx.stroke();
      ctx.restore();
      continue;
    }

    if (tile.kind === 'splitter') {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = tile.hitFlash > 0.1 ? '#FFFFFF' : '#A855F7';
      ctx.strokeStyle = '#E9D5FF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-12, -12, 24, 24, 4);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      continue;
    }

    // Block or Bomb
    ctx.save();
    const isBomb = tile.kind === 'bomb';
    const colors = isBomb
      ? { fill: '#991B1B', stroke: '#FB7185', text: '#FFE4E6' }
      : getBlockColor(tile.hp);

    ctx.fillStyle = tile.hitFlash > 0.15 ? '#FFFFFF' : colors.fill;
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 2;

    if (isBomb) {
      ctx.shadowColor = 'rgba(251, 113, 133, 0.45)';
      ctx.shadowBlur = 10;
    }

    ctx.beginPath();
    ctx.roundRect(tile.x, tile.y, tile.w, tile.h, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = tile.hitFlash > 0.15 ? '#0F172A' : colors.text;
    ctx.font = '700 15px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isBomb ? `★ ${tile.hp}` : String(tile.hp), cx, cy + 1);
    ctx.restore();
  }

  // Rings
  for (const r of world.rings) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, r.alpha);
    ctx.strokeStyle = r.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Balls
  for (const b of world.balls) {
    if (b.trail.length > 1) {
      for (let i = 1; i < b.trail.length; i++) {
        const p0 = b.trail[i - 1];
        const p1 = b.trail[i];
        const frac = i / b.trail.length;
        ctx.strokeStyle = `hsla(${b.hue}, 95%, 68%, ${frac * 0.5})`;
        ctx.lineWidth = b.radius * frac * 1.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
    }

    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = `hsla(${b.hue}, 95%, 68%, 0.8)`;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Launcher Base
  ctx.save();
  ctx.fillStyle = '#38BDF8';
  ctx.shadowColor = 'rgba(56, 189, 248, 0.7)';
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(world.launcherX, world.launcherY, 11, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#E0F2FE';
  ctx.font = '700 12px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(
    `${world.phase === 'FIRING' ? world.ballsToFire : world.swarmSize}x`,
    world.launcherX,
    world.launcherY + 25
  );
  ctx.restore();

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

  // Floating texts (hidden in Zen Mode)
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
