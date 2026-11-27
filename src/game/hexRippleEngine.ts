import { soundEngine } from '../audio/soundEngine';
import { ARENA_HEIGHT, ARENA_WIDTH } from './stages';
import { FloatingText, HexLevelId, HexRippleSettings, Particle } from './types';

export interface HexTile {
  id: number;
  q: number;
  r: number;
  x: number;
  y: number;
  colorIndex: number; // 0..3
  scale: number;
  flash: number;
}

export interface HexWaveEvent {
  centerQ: number;
  centerR: number;
  nextRadius: number;
  maxRadius: number;
  timer: number;
  colorIndex: number;
}

export interface HexRippleWorld {
  tiles: HexTile[];
  waves: HexWaveEvent[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  levelId: HexLevelId;
  hexRadius: number;
  score: number;
  combo: number;
  maxCombo: number;
  moves: number;
  level: number;
  time: number;
}

const HEX_COLORS = [
  { fill: '#0EA5E9', stroke: '#7DD3FC' }, // Sky
  { fill: '#F59E0B', stroke: '#FDE68A' }, // Amber
  { fill: '#10B981', stroke: '#6EE7B7' }, // Emerald
  { fill: '#A855F7', stroke: '#E9D5FF' }, // Violet
];

export const HEX_LEVELS: Array<{ id: HexLevelId; label: string }> = [
  { id: 'MANDALA', label: '01. Mandala Rings' },
  { id: 'LOTUS', label: '02. Twin Lotus' },
  { id: 'CHECKER', label: '03. Prism Mosaic' },
  { id: 'SPIRAL', label: '04. Spiral Hive' },
  { id: 'GALAXY', label: '05. Nebula Swirl' },
  { id: 'PRISM_CORE', label: '06. Resonant Diamond' },
  { id: 'SHADOW_WEB', label: '07. Shadow Web (Creepy)' },
  { id: 'ASMR_LOTUS', label: '08. Velvet ASMR Lotus' },
  { id: 'CRYSTAL_CROWN', label: '09. Crystal Crown' },
  { id: 'SOLAR_FLOWER', label: '10. Solar Flower' },
  { id: 'EXTREME', label: '11. Extreme 91-Hex Grid' },
];

function hexDistance(q1: number, r1: number, q2: number, r2: number): number {
  return (
    (Math.abs(q1 - q2) + Math.abs(q1 + r1 - q2 - r2) + Math.abs(r1 - r2)) / 2
  );
}

export function createHexWorld(
  level = 1,
  keepScore = 0,
  keepMaxCombo = 0,
  levelId: HexLevelId = 'MANDALA'
): HexRippleWorld {
  const tiles: HexTile[] = [];
  const isDense =
    levelId === 'EXTREME' ||
    levelId === 'PRISM_CORE' ||
    levelId === 'SHADOW_WEB' ||
    levelId === 'ASMR_LOTUS' ||
    levelId === 'CRYSTAL_CROWN' ||
    levelId === 'SOLAR_FLOWER';
  const gridRadius = isDense ? 5 : 4;
  const hexRadius = isDense ? 23 : 27;
  let id = 1;

  for (let q = -gridRadius; q <= gridRadius; q++) {
    const r1 = Math.max(-gridRadius, -q - gridRadius);
    const r2 = Math.min(gridRadius, -q + gridRadius);
    for (let r = r1; r <= r2; r++) {
      const x = ARENA_WIDTH / 2 + hexRadius * Math.sqrt(3) * (q + r / 2);
      const y = ARENA_HEIGHT / 2 + hexRadius * 1.5 * r;
      const dist = hexDistance(0, 0, q, r);
      let colorIndex = (dist + level) % HEX_COLORS.length;
      if (levelId === 'LOTUS') {
        const d1 = hexDistance(-2, 0, q, r);
        const d2 = hexDistance(2, 0, q, r);
        colorIndex = (Math.min(d1, d2) + level) % HEX_COLORS.length;
      } else if (levelId === 'CHECKER') {
        colorIndex = (((q - r) % 4) + 4 + level) % HEX_COLORS.length;
      } else if (levelId === 'SPIRAL') {
        const ang = Math.atan2(y - ARENA_HEIGHT / 2, x - ARENA_WIDTH / 2);
        const sector = Math.floor(((ang + Math.PI) / (Math.PI * 2)) * 6);
        colorIndex = (sector + dist + level) % HEX_COLORS.length;
      } else if (levelId === 'GALAXY') {
        const ang = Math.atan2(y - ARENA_HEIGHT / 2, x - ARENA_WIDTH / 2);
        colorIndex =
          Math.floor(((ang + Math.PI) / (Math.PI * 2)) * 4 + dist * 0.7) %
          HEX_COLORS.length;
      } else if (levelId === 'PRISM_CORE') {
        colorIndex = (Math.abs(q) + Math.abs(r) + level) % HEX_COLORS.length;
      } else if (levelId === 'SHADOW_WEB') {
        const onSpoke = q === 0 || r === 0 || q + r === 0;
        colorIndex = onSpoke
          ? 3
          : dist % 2 === 0
          ? 0
          : 1;
      } else if (levelId === 'ASMR_LOTUS') {
        const d1 = hexDistance(-3, 1, q, r);
        const d2 = hexDistance(3, -1, q, r);
        const d3 = hexDistance(0, 0, q, r);
        colorIndex = (Math.min(d1, d2, d3) + level) % HEX_COLORS.length;
      } else if (levelId === 'CRYSTAL_CROWN') {
        colorIndex = (Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) + (dist === 3 ? 2 : 0) + level) % HEX_COLORS.length;
      } else if (levelId === 'SOLAR_FLOWER') {
        const petal = (q * r >= 0 ? 0 : 1) + (dist <= 2 ? 2 : 0);
        colorIndex = (petal + dist + level) % HEX_COLORS.length;
      } else if (levelId === 'EXTREME') {
        colorIndex = (Math.abs(q * 2 + r) + dist + level) % HEX_COLORS.length;
      }
      tiles.push({
        id: id++,
        q,
        r,
        x,
        y,
        colorIndex,
        scale: 1,
        flash: 0,
      });
    }
  }

  return {
    tiles,
    waves: [],
    particles: [],
    floatingTexts: [],
    levelId,
    hexRadius,
    score: keepScore,
    combo: 0,
    maxCombo: keepMaxCombo,
    moves: 0,
    level,
    time: 0,
  };
}

export function triggerHexRippleAt(
  world: HexRippleWorld,
  x: number,
  y: number,
  settings: HexRippleSettings
) {
  let closest: HexTile | null = null;
  let bestDist = Infinity;
  for (const t of world.tiles) {
    const d = Math.hypot(t.x - x, t.y - y);
    if (d < bestDist && d <= world.hexRadius + 8) {
      bestDist = d;
      closest = t;
    }
  }
  if (!closest) return;

  world.moves += 1;
  world.combo = 0;

  const targetColor = (closest.colorIndex + 1) % HEX_COLORS.length;
  const isDense =
    world.levelId === 'EXTREME' ||
    world.levelId === 'PRISM_CORE' ||
    world.levelId === 'SHADOW_WEB' ||
    world.levelId === 'ASMR_LOTUS' ||
    world.levelId === 'CRYSTAL_CROWN' ||
    world.levelId === 'SOLAR_FLOWER';
  world.waves.push({
    centerQ: closest.q,
    centerR: closest.r,
    nextRadius: 0,
    maxRadius: settings.fullBoardWave ? (isDense ? 10 : 8) : 3,
    timer: 0,
    colorIndex: targetColor,
  });
}

export function stepHexWorld(
  world: HexRippleWorld,
  dt: number,
  settings: HexRippleSettings,
  reducedMotion: boolean
) {
  world.time += dt;

  for (const t of world.tiles) {
    t.scale += (1 - t.scale) * Math.min(1, dt * 12);
    if (t.flash > 0) {
      t.flash = Math.max(0, t.flash - dt * 5);
    }
  }

  for (let i = world.waves.length - 1; i >= 0; i--) {
    const w = world.waves[i];
    w.timer -= dt;
    if (w.timer <= 0) {
      w.timer = 0.068; // Crisp 68ms ring-by-ring musical domino ripple!
      const ringRadius = w.nextRadius;
      let hitAny = false;

      for (const t of world.tiles) {
        if (hexDistance(t.q, t.r, w.centerQ, w.centerR) === ringRadius) {
          hitAny = true;
          t.colorIndex = settings.rainbowCycle
            ? (t.colorIndex + 1) % HEX_COLORS.length
            : w.colorIndex;
          t.scale = 1.24;
          t.flash = 1;
          world.combo += 1;
          if (world.combo > world.maxCombo) world.maxCombo = world.combo;
          world.score += 35;

          const pCount = reducedMotion ? 1 : 3;
          for (let k = 0; k < pCount; k++) {
            const a = Math.random() * Math.PI * 2;
            world.particles.push({
              x: t.x,
              y: t.y,
              vx: Math.cos(a) * 85,
              vy: Math.sin(a) * 85,
              radius: 2,
              color: HEX_COLORS[t.colorIndex].stroke,
              alpha: 0.9,
              decay: 2.2,
            });
          }
        }
      }

      if (hitAny) {
        soundEngine.playPegHit(ringRadius + 1, ringRadius === 0);
      }

      w.nextRadius += 1;
      if (w.nextRadius > w.maxRadius) {
        world.waves.splice(i, 1);
      }
    }
  }

  // Check if entire hex board unified to one color!
  if (world.waves.length === 0 && world.tiles.length > 0 && !settings.rainbowCycle) {
    const firstColor = world.tiles[0].colorIndex;
    if (world.tiles.every((t) => t.colorIndex === firstColor)) {
      soundEngine.playStageClear();
      world.score += 1000;
      world.floatingTexts.push({
        x: ARENA_WIDTH / 2,
        y: ARENA_HEIGHT / 2,
        vy: -22,
        text: 'HARMONY +1000',
        color: '#FDE047',
        alpha: 1,
        scale: 1,
      });
      const next = createHexWorld(world.level + 1, world.score, world.maxCombo, world.levelId);
      Object.assign(world, next);
      return;
    }
  }

  for (let i = world.particles.length - 1; i >= 0; i--) {
    const p = world.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.alpha -= p.decay * dt;
    if (p.alpha <= 0) world.particles.splice(i, 1);
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

export function renderHexWorld(
  ctx: CanvasRenderingContext2D,
  world: HexRippleWorld
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
  bg.addColorStop(0, '#131D35');
  bg.addColorStop(1, '#080D1A');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, ARENA_WIDTH - 36, ARENA_HEIGHT - 28);

  // Hexagons
  for (const t of world.tiles) {
    const palette = HEX_COLORS[t.colorIndex];
    const r = (world.hexRadius - 3) * t.scale;

    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.fillStyle = t.flash > 0.25 ? '#FFFFFF' : palette.fill;
    ctx.strokeStyle = palette.stroke;
    ctx.lineWidth = 1.8;
    ctx.shadowColor = palette.fill;
    ctx.shadowBlur = t.flash > 0.1 ? 18 : 6;

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      const hx = Math.cos(a) * r;
      const hy = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.fill();
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
    ctx.globalAlpha = Math.max(0, ft.alpha * 0.88);
    ctx.font = '700 12.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }

  ctx.restore();
}
