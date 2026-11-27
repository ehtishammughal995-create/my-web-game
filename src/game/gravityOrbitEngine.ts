import { soundEngine } from '../audio/soundEngine';
import { ARENA_HEIGHT, ARENA_WIDTH } from './stages';
import { FloatingText, OrbitSettings, Particle, RingWave } from './types';

export interface GravityNode {
  id: number;
  x: number;
  y: number;
  strength: number; // positive = attractor, negative = repulsor
  radius: number;
}

export interface OrbitCrystal {
  id: number;
  x: number;
  y: number;
  radius: number;
  hue: number;
  hitFlash: number;
}

export interface OrbitComet {
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

export interface OrbitWorld {
  nodes: GravityNode[];
  crystals: OrbitCrystal[];
  comets: OrbitComet[];
  paintedRibbonSegments: Array<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: string;
  }>;
  particles: Particle[];
  waves: RingWave[];
  floatingTexts: FloatingText[];
  launcherX: number;
  launcherY: number;
  aimAngle: number;
  level: number;
  score: number;
  combo: number;
  maxCombo: number;
  nextId: number;
  time: number;
}

function buildOrbitLevel(level: number): {
  nodes: GravityNode[];
  crystals: OrbitCrystal[];
} {
  const nodes: GravityNode[] = [];
  const crystals: OrbitCrystal[] = [];
  const variant = ((level - 1) % 10) + 1;

  if (variant === 1) {
    nodes.push({ id: 1, x: 300, y: 310, strength: 165000, radius: 20 });
    nodes.push({ id: 2, x: 520, y: 310, strength: 165000, radius: 20 });
  } else if (variant === 2) {
    nodes.push({ id: 1, x: 410, y: 235, strength: 195000, radius: 22 });
    nodes.push({ id: 2, x: 410, y: 405, strength: -140000, radius: 18 });
  } else if (variant === 3) {
    nodes.push({ id: 1, x: 400, y: 200, strength: 155000, radius: 19 });
    nodes.push({ id: 2, x: 270, y: 405, strength: 155000, radius: 19 });
    nodes.push({ id: 3, x: 530, y: 405, strength: 155000, radius: 19 });
  } else if (variant === 4) {
    nodes.push({ id: 1, x: 260, y: 185, strength: -135000, radius: 18 });
    nodes.push({ id: 2, x: 430, y: 310, strength: 210000, radius: 22 });
    nodes.push({ id: 3, x: 590, y: 435, strength: -135000, radius: 18 });
  } else if (variant === 5) {
    nodes.push({ id: 1, x: 410, y: 170, strength: 145000, radius: 18 });
    nodes.push({ id: 2, x: 575, y: 310, strength: 145000, radius: 18 });
    nodes.push({ id: 3, x: 410, y: 450, strength: 145000, radius: 18 });
    nodes.push({ id: 4, x: 255, y: 310, strength: -120000, radius: 17 });
  } else if (variant === 6) {
    nodes.push({ id: 1, x: 315, y: 215, strength: 225000, radius: 22 });
    nodes.push({ id: 2, x: 545, y: 405, strength: 225000, radius: 22 });
    nodes.push({ id: 3, x: 430, y: 310, strength: -175000, radius: 18 });
  } else if (variant === 7) {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      nodes.push({
        id: i + 1,
        x: 425 + Math.cos(a) * 140,
        y: 310 + Math.sin(a) * 140,
        strength: i % 2 === 0 ? 175000 : -115000,
        radius: 17,
      });
    }
  } else if (variant === 8) {
    // Level 8: Binary Singularity Dance (2 massive cores + 4 guard repulsors)
    nodes.push({ id: 1, x: 335, y: 310, strength: 245000, radius: 23 });
    nodes.push({ id: 2, x: 525, y: 310, strength: 245000, radius: 23 });
    nodes.push({ id: 3, x: 430, y: 145, strength: -140000, radius: 16 });
    nodes.push({ id: 4, x: 430, y: 475, strength: -140000, radius: 16 });
    nodes.push({ id: 5, x: 205, y: 310, strength: -125000, radius: 15 });
    nodes.push({ id: 6, x: 655, y: 310, strength: -125000, radius: 15 });
  } else if (variant === 9) {
    // Level 9: Halo Ring (4 alternating gravitational ring wells)
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      nodes.push({
        id: i + 1,
        x: 425 + Math.cos(a) * 145,
        y: 310 + Math.sin(a) * 135,
        strength: i % 2 === 0 ? 205000 : -130000,
        radius: 19,
      });
    }
  } else {
    // Level 10: Tri-Star Forge (3 outer attractors + central repulsor core)
    nodes.push({ id: 1, x: 425, y: 310, strength: -165000, radius: 20 });
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
      nodes.push({
        id: i + 2,
        x: 425 + Math.cos(a) * 165,
        y: 310 + Math.sin(a) * 145,
        strength: 215000,
        radius: 21,
      });
    }
  }

  const crystalCount =
    variant === 10
      ? 32
      : variant === 9 || variant === 8
      ? 28
      : variant === 7
      ? 24
      : variant === 6
      ? 18
      : 12 + (variant % 2) * 2;
  for (let i = 0; i < crystalCount; i++) {
    const a = (i / crystalCount) * Math.PI * 2;
    const rx = variant >= 6 ? 205 + (i % 3) * 44 : variant === 5 ? 190 + (i % 3) * 40 : 215 + (i % 2) * 55;
    const ry = variant >= 6 ? 170 + (i % 3) * 34 : variant === 5 ? 155 + (i % 3) * 30 : 165 + (i % 2) * 35;
    crystals.push({
      id: 100 + i,
      x: ARENA_WIDTH / 2 + 20 + Math.cos(a) * rx,
      y: ARENA_HEIGHT / 2 + Math.sin(a) * ry,
      radius: 11.5,
      hue: (35 + i * 24) % 360,
      hitFlash: 0,
    });
  }

  return { nodes, crystals };
}

export function createOrbitWorld(
  level = 1,
  keepScore = 0,
  keepMaxCombo = 0
): OrbitWorld {
  const { nodes, crystals } = buildOrbitLevel(level);
  return {
    nodes,
    crystals,
    comets: [],
    paintedRibbonSegments: [],
    particles: [],
    waves: [],
    floatingTexts: [],
    launcherX: 64,
    launcherY: ARENA_HEIGHT / 2,
    aimAngle: -0.45,
    level,
    score: keepScore,
    combo: 0,
    maxCombo: keepMaxCombo,
    nextId: 300,
    time: 0,
  };
}

export function launchComet(world: OrbitWorld, settings: OrbitSettings) {
  if (world.comets.length >= 24) return;
  soundEngine.playLaunch();
  const count = settings.multiComet ? 3 : 1;
  const speed = 340;
  for (let i = 0; i < count; i++) {
    const spread = count === 1 ? 0 : (i - 1) * 0.14;
    const ang = world.aimAngle + spread;
    world.comets.push({
      id: world.nextId++,
      x: world.launcherX + Math.cos(ang) * 20,
      y: world.launcherY + Math.sin(ang) * 20,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      radius: 7,
      hue: (185 + world.nextId * 31) % 360,
      trail: [],
      hits: 0,
      age: 0,
    });
  }
}

export function launchCometConstellation(world: OrbitWorld) {
  soundEngine.playLaunch();
  for (let i = 0; i < 6; i++) {
    if (world.comets.length >= 28) break;
    const ang = -0.85 + i * 0.34;
    world.comets.push({
      id: world.nextId++,
      x: world.launcherX + Math.cos(ang) * 22,
      y: world.launcherY + Math.sin(ang) * 22,
      vx: Math.cos(ang) * 335,
      vy: Math.sin(ang) * 335,
      radius: 7,
      hue: (i * 55) % 360,
      trail: [],
      hits: 0,
      age: 0,
    });
  }
}

export function addGravityNode(
  world: OrbitWorld,
  x: number,
  y: number,
  isRepulsor: boolean
) {
  if (world.nodes.length >= 8) {
    world.nodes.shift();
  }
  soundEngine.playPlaceToy();
  world.nodes.push({
    id: world.nextId++,
    x: Math.max(120, Math.min(ARENA_WIDTH - 70, x)),
    y: Math.max(70, Math.min(ARENA_HEIGHT - 70, y)),
    strength: isRepulsor ? -155000 : 175000,
    radius: isRepulsor ? 18 : 20,
  });
}

export function stepOrbitWorld(
  world: OrbitWorld,
  dt: number,
  settings: OrbitSettings,
  reducedMotion: boolean
) {
  world.time += dt;

  const gravScale = settings.strongGravity ? 1.4 : 1.0;
  const substeps = 4;
  const subDt = dt / substeps;
  const toRemove = new Set<number>();

  for (const comet of world.comets) {
    comet.age += dt;
    const prevX = comet.x;
    const prevY = comet.y;

    comet.trail.push({ x: comet.x, y: comet.y });
    if (comet.trail.length > 26) comet.trail.shift();

    for (let s = 0; s < substeps; s++) {
      let ax = 0;
      let ay = 0;
      for (const node of world.nodes) {
        const dx = node.x - comet.x;
        const dy = node.y - comet.y;
        const distSq = Math.max(900, dx * dx + dy * dy);
        const dist = Math.sqrt(distSq);
        const force = (node.strength * gravScale) / distSq;
        ax += (dx / dist) * force;
        ay += (dy / dist) * force;

        // Core bounce if comet hits the planet core itself
        if (dist < node.radius + comet.radius) {
          const nx = -dx / dist;
          const ny = -dy / dist;
          comet.x = node.x + nx * (node.radius + comet.radius + 1);
          comet.y = node.y + ny * (node.radius + comet.radius + 1);
          const dot = comet.vx * nx + comet.vy * ny;
          if (dot < 0) {
            comet.vx -= 1.85 * dot * nx;
            comet.vy -= 1.85 * dot * ny;
          }
        }
      }

      comet.vx += ax * subDt;
      comet.vy += ay * subDt;

      // Speed clamp for smooth stable orbits
      const spd = Math.hypot(comet.vx, comet.vy);
      if (spd > 640) {
        comet.vx = (comet.vx / spd) * 640;
        comet.vy = (comet.vy / spd) * 640;
      }

      comet.x += comet.vx * subDt;
      comet.y += comet.vy * subDt;

      // Arena elastic walls so comets stay inside longer
      if (comet.x - comet.radius < 20) {
        comet.x = 20 + comet.radius;
        comet.vx = Math.abs(comet.vx) * 0.92;
      } else if (comet.x + comet.radius > ARENA_WIDTH - 20) {
        comet.x = ARENA_WIDTH - 20 - comet.radius;
        comet.vx = -Math.abs(comet.vx) * 0.92;
      }
      if (comet.y - comet.radius < 20) {
        comet.y = 20 + comet.radius;
        comet.vy = Math.abs(comet.vy) * 0.92;
      } else if (comet.y + comet.radius > ARENA_HEIGHT - 20) {
        comet.y = ARENA_HEIGHT - 20 - comet.radius;
        comet.vy = -Math.abs(comet.vy) * 0.92;
      }

      // Shatter crystal targets
      for (let cIdx = world.crystals.length - 1; cIdx >= 0; cIdx--) {
        const cr = world.crystals[cIdx];
        if (Math.hypot(comet.x - cr.x, comet.y - cr.y) < comet.radius + cr.radius) {
          comet.hits += 1;
          world.combo += 1;
          if (world.combo > world.maxCombo) world.maxCombo = world.combo;
          const pts = 200 * Math.min(8, comet.hits);
          world.score += pts;

          soundEngine.playPegHit(world.combo, true);
          world.waves.push({
            x: cr.x,
            y: cr.y,
            radius: 8,
            maxRadius: 34,
            color: `hsl(${cr.hue}, 95%, 68%)`,
            alpha: 0.48,
          });
          const pCount = reducedMotion ? 2 : 5;
          for (let k = 0; k < pCount; k++) {
            const pa = Math.random() * Math.PI * 2;
            const pspd = 50 + Math.random() * 75;
            world.particles.push({
              x: cr.x,
              y: cr.y,
              vx: Math.cos(pa) * pspd,
              vy: Math.sin(pa) * pspd,
              radius: 1.8 + Math.random() * 1.3,
              color: `hsl(${cr.hue}, 95%, 70%)`,
              alpha: 0.9,
              decay: 2.0,
            });
          }
          world.floatingTexts.push({
            x: cr.x,
            y: cr.y - 10,
            vy: -32,
            text: `+${pts}`,
            color: `hsl(${cr.hue}, 95%, 78%)`,
            alpha: 1,
            scale: 1,
          });
          world.crystals.splice(cIdx, 1);
        }
      }
    }

    if (settings.paintTrails) {
      world.paintedRibbonSegments.push({
        x1: prevX,
        y1: prevY,
        x2: comet.x,
        y2: comet.y,
        color: `hsla(${comet.hue}, 92%, 65%, 0.28)`,
      });
      if (world.paintedRibbonSegments.length > 1400) {
        world.paintedRibbonSegments.shift();
      }
    }

    if (comet.age > 24) {
      toRemove.add(comet.id);
    }
  }

  if (toRemove.size > 0) {
    world.comets = world.comets.filter((c) => !toRemove.has(c.id));
  }

  // If all crystals shattered, advance to next cosmic constellation!
  if (world.crystals.length === 0) {
    soundEngine.playStageClear();
    world.score += 1200;
    world.level += 1;
    const next = buildOrbitLevel(world.level);
    world.nodes = next.nodes;
    world.crystals = next.crystals;
    world.floatingTexts.push({
      x: ARENA_WIDTH / 2,
      y: ARENA_HEIGHT / 2,
      vy: -22,
      text: `LEVEL ${world.level} +1200`,
      color: '#FDE047',
      alpha: 1,
      scale: 1,
    });
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
    w.radius += 110 * dt;
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

export function renderOrbitWorld(
  ctx: CanvasRenderingContext2D,
  world: OrbitWorld,
  settings: OrbitSettings
) {
  ctx.save();

  const bg = ctx.createRadialGradient(
    ARENA_WIDTH / 2,
    ARENA_HEIGHT / 2,
    30,
    ARENA_WIDTH / 2,
    ARENA_HEIGHT / 2,
    470
  );
  bg.addColorStop(0, '#101830');
  bg.addColorStop(1, '#070B16');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, ARENA_WIDTH - 36, ARENA_HEIGHT - 28);

  // Persistent painted spirograph trails
  if (settings.paintTrails && world.paintedRibbonSegments.length > 0) {
    ctx.save();
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    for (const seg of world.paintedRibbonSegments) {
      ctx.strokeStyle = seg.color;
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Gravity Wells & Repulsors
  for (const node of world.nodes) {
    const isAttractor = node.strength > 0;
    const baseColor = isAttractor ? '#38BDF8' : '#FB7185';
    ctx.save();
    const field = ctx.createRadialGradient(
      node.x,
      node.y,
      node.radius,
      node.x,
      node.y,
      node.radius * 4.5
    );
    field.addColorStop(
      0,
      isAttractor ? 'rgba(56, 189, 248, 0.22)' : 'rgba(251, 113, 133, 0.22)'
    );
    field.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = field;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius * 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Animated orbit ring
    ctx.strokeStyle = baseColor;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(
      node.x,
      node.y,
      node.radius + 12 + Math.sin(world.time * 3) * 2.5,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.globalAlpha = 1;
    ctx.fillStyle = isAttractor ? '#0F172A' : '#4C0519';
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 3;
    ctx.shadowColor = baseColor;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#F8FAFC';
    ctx.font = '700 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isAttractor ? '+' : '-', node.x, node.y + 0.5);
    ctx.restore();
  }

  // Crystal targets
  for (const cr of world.crystals) {
    ctx.save();
    ctx.translate(cr.x, cr.y);
    ctx.rotate(world.time * 1.4 + cr.id);
    ctx.fillStyle = `hsl(${cr.hue}, 92%, 62%)`;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.6;
    ctx.shadowColor = `hsla(${cr.hue}, 95%, 66%, 0.7)`;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(-cr.radius * 0.75, -cr.radius * 0.75, cr.radius * 1.5, cr.radius * 1.5, 3);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Aim guide from launcher
  ctx.save();
  for (let i = 1; i <= 14; i++) {
    const px = world.launcherX + Math.cos(world.aimAngle) * i * 16;
    const py = world.launcherY + Math.sin(world.aimAngle) * i * 16;
    ctx.fillStyle = `rgba(248, 250, 252, ${0.6 - i * 0.035})`;
    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Launcher node
  ctx.fillStyle = '#F59E0B';
  ctx.shadowColor = 'rgba(245, 158, 11, 0.75)';
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(world.launcherX, world.launcherY, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

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

  // Comets & tails
  for (const c of world.comets) {
    if (c.trail.length > 1) {
      for (let i = 1; i < c.trail.length; i++) {
        const p0 = c.trail[i - 1];
        const p1 = c.trail[i];
        const frac = i / c.trail.length;
        ctx.strokeStyle = `hsla(${c.hue}, 95%, 68%, ${frac * 0.6})`;
        ctx.lineWidth = c.radius * frac * 1.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
    }

    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = `hsla(${c.hue}, 95%, 70%, 0.85)`;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
    ctx.fill();
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
