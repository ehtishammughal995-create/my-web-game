import { soundEngine } from '../audio/soundEngine';
import { ARENA_HEIGHT, ARENA_WIDTH } from './stages';
import { Particle, PendulumPreset } from './types';

export const PENDULUM_LEVELS: Array<{
  id: PendulumPreset;
  label: string;
  desc: string;
}> = [
  { id: 'PHASE_WAVE', label: '01. Phase Wave', desc: '15 harmonic spheres braiding in sync' },
  { id: 'NEWTON_CRADLE', label: "02. Newton's Cradle", desc: 'Elastic momentum clack transfer' },
  { id: 'HARMONOGRAPH', label: '03. Harmonograph', desc: 'Dual-frequency silk ribbon spirograph' },
  { id: 'LOTUS_ROSETTE', label: '04. Lotus Rosette', desc: '12 radial petals breathing in rhythm' },
  { id: 'GALAXY_SWIRL', label: '05. Galaxy Swirl', desc: 'Concentric Lissajous orbital waves' },
  { id: 'PHANTOM_CLOCK', label: '06. Phantom Clock', desc: 'Midnight pendulum chimes & arcs' },
  { id: 'DOUBLE_CHAOS', label: '07. Twin Chaos', desc: 'Coupled double pendulums painting ribbons' },
  { id: 'GRAND_KALEIDOSCOPE', label: '08. Kaleidoscope', desc: '6-fold symmetrical mandala weave' },
];

export type PendulumVoice = 'chime' | 'cradle' | 'ethereal';

export interface PendulumBob {
  id: number;
  anchorX: number;
  anchorY: number;
  length: number;
  angle: number;
  angVel: number;
  omega: number;
  basePhase: number;
  radius: number;
  hue: number;
  noteIndex: number;
  glow: number;
  x: number;
  y: number;
  trail: Array<{ x: number; y: number }>;
}

export interface DoublePendulumArm {
  anchorX: number;
  anchorY: number;
  l1: number;
  l2: number;
  a1: number;
  a2: number;
  v1: number;
  v2: number;
  hue: number;
  trail: Array<{ x: number; y: number }>;
}

export interface PendulumPulseRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export interface PendulumWorld {
  preset: PendulumPreset;
  bobs: PendulumBob[];
  doubleArms: DoublePendulumArm[];
  ribbonPoints: Array<{ x: number; y: number; hue: number }>;
  harmPhaseA: number;
  harmPhaseB: number;
  harmFreqRatio: number;
  harmDamp: number;
  harmCenterX: number;
  harmCenterY: number;
  harmAmpX: number;
  harmAmpY: number;
  pulses: PendulumPulseRing[];
  particles: Particle[];
  dragBobIndex: number | null;
  score: number;
  combo: number;
  maxCombo: number;
  notesPlayed: number;
  time: number;
  sustainTimer: number;
  nextId: number;
}

function updateBobCartesian(bob: PendulumBob, world: PendulumWorld) {
  if (world.preset === 'LOTUS_ROSETTE' || world.preset === 'GALAXY_SWIRL') {
    const baseAngle = bob.basePhase;
    const radial = bob.length + Math.sin(bob.angle) * (world.preset === 'LOTUS_ROSETTE' ? 62 : 48);
    const sweep = baseAngle + Math.cos(bob.angle * 0.5) * (world.preset === 'GALAXY_SWIRL' ? 0.45 : 0.22);
    bob.x = bob.anchorX + Math.cos(sweep) * radial;
    bob.y = bob.anchorY + Math.sin(sweep) * radial;
  } else {
    bob.x = bob.anchorX + Math.sin(bob.angle) * bob.length;
    bob.y = bob.anchorY + Math.cos(bob.angle) * bob.length;
  }
}

export function createPendulumWorld(
  preset: PendulumPreset = 'PHASE_WAVE'
): PendulumWorld {
  const world: PendulumWorld = {
    preset,
    bobs: [],
    doubleArms: [],
    ribbonPoints: [],
    harmPhaseA: 0.35,
    harmPhaseB: 1.25,
    harmFreqRatio: preset === 'GRAND_KALEIDOSCOPE' ? 1.503 : 1.498,
    harmDamp: 0.004,
    harmCenterX: ARENA_WIDTH / 2,
    harmCenterY: ARENA_HEIGHT / 2 + 10,
    harmAmpX: preset === 'GRAND_KALEIDOSCOPE' ? 180 : 215,
    harmAmpY: preset === 'GRAND_KALEIDOSCOPE' ? 180 : 185,
    pulses: [],
    particles: [],
    dragBobIndex: null,
    score: 0,
    combo: 0,
    maxCombo: 0,
    notesPlayed: 0,
    time: 0,
    sustainTimer: 0,
    nextId: 1,
  };

  if (preset === 'PHASE_WAVE') {
    const count = 15;
    for (let i = 0; i < count; i++) {
      const length = 155 + i * 19;
      const omega = 2.0 + i * 0.14;
      const bob: PendulumBob = {
        id: world.nextId++,
        anchorX: ARENA_WIDTH / 2 + (i - (count - 1) / 2) * 28,
        anchorY: 64,
        length,
        angle: 0.62,
        angVel: 0,
        omega,
        basePhase: 0,
        radius: 10.5,
        hue: (170 + i * 14) % 360,
        noteIndex: i % 15,
        glow: 0,
        x: 0,
        y: 0,
        trail: [],
      };
      updateBobCartesian(bob, world);
      world.bobs.push(bob);
    }
  } else if (preset === 'NEWTON_CRADLE') {
    const count = 7;
    const radius = 21;
    const spacing = radius * 2;
    const startX = ARENA_WIDTH / 2 - ((count - 1) * spacing) / 2;
    for (let i = 0; i < count; i++) {
      const bob: PendulumBob = {
        id: world.nextId++,
        anchorX: startX + i * spacing,
        anchorY: 108,
        length: 280,
        angle: i === 0 ? -0.68 : i === 1 ? -0.68 : 0,
        angVel: 0,
        omega: 3.1,
        basePhase: 0,
        radius,
        hue: 185 + i * 20,
        noteIndex: 4 + i,
        glow: i < 2 ? 0.8 : 0,
        x: 0,
        y: 0,
        trail: [],
      };
      updateBobCartesian(bob, world);
      world.bobs.push(bob);
    }
  } else if (preset === 'LOTUS_ROSETTE') {
    const count = 12;
    for (let i = 0; i < count; i++) {
      const basePhase = (i / count) * Math.PI * 2;
      const bob: PendulumBob = {
        id: world.nextId++,
        anchorX: ARENA_WIDTH / 2,
        anchorY: ARENA_HEIGHT / 2 + 8,
        length: 145,
        angle: basePhase,
        angVel: 0,
        omega: 1.7 + (i % 3) * 0.25,
        basePhase,
        radius: 11,
        hue: (300 + i * 16) % 360,
        noteIndex: (i * 2) % 15,
        glow: 0,
        x: 0,
        y: 0,
        trail: [],
      };
      updateBobCartesian(bob, world);
      world.bobs.push(bob);
    }
  } else if (preset === 'GALAXY_SWIRL') {
    const count = 16;
    for (let i = 0; i < count; i++) {
      const basePhase = (i / count) * Math.PI * 2;
      const bob: PendulumBob = {
        id: world.nextId++,
        anchorX: ARENA_WIDTH / 2,
        anchorY: ARENA_HEIGHT / 2 + 6,
        length: 82 + i * 11,
        angle: i * 0.42,
        angVel: 0,
        omega: 1.55 + i * 0.11,
        basePhase,
        radius: 8.5,
        hue: (190 + i * 12) % 360,
        noteIndex: i % 15,
        glow: 0,
        x: 0,
        y: 0,
        trail: [],
      };
      updateBobCartesian(bob, world);
      world.bobs.push(bob);
    }
  } else if (preset === 'PHANTOM_CLOCK') {
    const count = 12;
    for (let i = 0; i < count; i++) {
      const bob: PendulumBob = {
        id: world.nextId++,
        anchorX: ARENA_WIDTH / 2,
        anchorY: 74,
        length: 165 + i * 22,
        angle: (i % 2 === 0 ? 1 : -1) * 0.56,
        angVel: 0,
        omega: 1.65 + i * 0.13,
        basePhase: 0,
        radius: 10,
        hue: 38 + i * 10,
        noteIndex: 14 - i,
        glow: 0,
        x: 0,
        y: 0,
        trail: [],
      };
      updateBobCartesian(bob, world);
      world.bobs.push(bob);
    }
  } else if (preset === 'DOUBLE_CHAOS') {
    world.doubleArms.push(
      {
        anchorX: ARENA_WIDTH / 2 - 90,
        anchorY: 220,
        l1: 112,
        l2: 108,
        a1: Math.PI * 0.68,
        a2: Math.PI * 0.92,
        v1: 0,
        v2: 0.35,
        hue: 185,
        trail: [],
      },
      {
        anchorX: ARENA_WIDTH / 2 + 90,
        anchorY: 220,
        l1: 112,
        l2: 108,
        a1: -Math.PI * 0.68,
        a2: -Math.PI * 0.88,
        v1: 0,
        v2: -0.35,
        hue: 315,
        trail: [],
      }
    );
  }

  return world;
}

export function interactPendulumAt(
  world: PendulumWorld,
  x: number,
  y: number
) {
  if (world.preset === 'HARMONOGRAPH' || world.preset === 'GRAND_KALEIDOSCOPE') {
    const nx = (x - world.harmCenterX) / 240;
    const ny = (y - world.harmCenterY) / 220;
    world.harmPhaseA += nx * 0.85;
    world.harmPhaseB += ny * 0.85;
    world.harmFreqRatio = 1.25 + ((x / ARENA_WIDTH) * 0.75);
    world.notesPlayed += 1;
    world.combo += 1;
    if (world.combo > world.maxCombo) world.maxCombo = world.combo;
    world.score += 35;
    soundEngine.playPendulumClick(Math.floor((x / ARENA_WIDTH) * 14), false, 0.75);
    world.pulses.push({
      x,
      y,
      radius: 8,
      maxRadius: 68,
      alpha: 0.6,
      color: `hsl(${(world.time * 55) % 360}, 90%, 72%)`,
    });
    return;
  }

  if (world.preset === 'DOUBLE_CHAOS') {
    let bestArm = world.doubleArms[0];
    let bestD = Infinity;
    for (const arm of world.doubleArms) {
      const d = Math.hypot(x - arm.anchorX, y - arm.anchorY);
      if (d < bestD) {
        bestD = d;
        bestArm = arm;
      }
    }
    if (bestArm) {
      const side = x >= bestArm.anchorX ? 1 : -1;
      bestArm.v1 += side * 1.8;
      bestArm.v2 -= side * 2.6;
      world.notesPlayed += 1;
      world.combo += 1;
      if (world.combo > world.maxCombo) world.maxCombo = world.combo;
      world.score += 45;
      soundEngine.playPendulumClick(8, false, 0.78);
      world.pulses.push({
        x,
        y,
        radius: 10,
        maxRadius: 72,
        alpha: 0.55,
        color: `hsl(${bestArm.hue}, 92%, 70%)`,
      });
    }
    return;
  }

  // Find closest bob to drag/pluck
  let closestIdx = -1;
  let closestDist = 64;
  world.bobs.forEach((b, idx) => {
    const d = Math.hypot(x - b.x, y - b.y);
    if (d < closestDist) {
      closestDist = d;
      closestIdx = idx;
    }
  });

  if (closestIdx >= 0) {
    world.dragBobIndex = closestIdx;
    const b = world.bobs[closestIdx];
    b.glow = 1;
    soundEngine.playPendulumClick(b.noteIndex, world.preset === 'NEWTON_CRADLE', 0.65);
  } else {
    // Gentle wave ripple kick at clicked horizontal position
    pulsePendulumWave(world, x >= ARENA_WIDTH / 2 ? 1 : -1);
  }
}

export function movePendulumDragAt(
  world: PendulumWorld,
  x: number,
  y: number
) {
  if (world.dragBobIndex === null) return;
  const bob = world.bobs[world.dragBobIndex];
  if (!bob) return;

  if (world.preset === 'LOTUS_ROSETTE' || world.preset === 'GALAXY_SWIRL') {
    const d = Math.hypot(x - bob.anchorX, y - bob.anchorY);
    bob.angle = Math.max(-1.2, Math.min(1.2, (d - bob.length) / 55));
    bob.angVel = 0;
  } else {
    const angle = Math.atan2(x - bob.anchorX, Math.max(25, y - bob.anchorY));
    bob.angle = Math.max(-1.15, Math.min(1.15, angle));
    bob.angVel = 0;
  }
  bob.glow = 1;
  updateBobCartesian(bob, world);
}

export function endPendulumDrag(world: PendulumWorld) {
  if (world.dragBobIndex !== null) {
    const b = world.bobs[world.dragBobIndex];
    if (b) {
      b.angVel = -Math.sin(b.angle) * 0.4;
      world.notesPlayed += 1;
      world.score += 30;
    }
    world.dragBobIndex = null;
  }
}

export function pulsePendulumWave(world: PendulumWorld, dir = 1) {
  if (world.preset === 'HARMONOGRAPH' || world.preset === 'GRAND_KALEIDOSCOPE') {
    world.harmPhaseA += 0.65 * dir;
    world.harmPhaseB += 0.42;
    world.ribbonPoints = [];
    soundEngine.playPendulumClick(10, false, 0.8);
    return;
  }
  if (world.preset === 'DOUBLE_CHAOS') {
    for (const arm of world.doubleArms) {
      arm.v1 += dir * 1.4;
      arm.v2 -= dir * 2.1;
    }
    soundEngine.playPendulumClick(9, false, 0.8);
    return;
  }
  if (world.preset === 'NEWTON_CRADLE') {
    const leftCount = dir > 0 ? 2 : 0;
    const rightStart = world.bobs.length - 2;
    world.bobs.forEach((b, idx) => {
      if (dir > 0 && idx < leftCount) {
        b.angle = -0.72;
        b.angVel = 0;
        b.glow = 1;
      } else if (dir < 0 && idx >= rightStart) {
        b.angle = 0.72;
        b.angVel = 0;
        b.glow = 1;
      } else {
        b.angle = 0;
        b.angVel = 0;
      }
      updateBobCartesian(b, world);
    });
    soundEngine.playPendulumClick(6, true, 0.85);
    return;
  }

  // Re-sync phase wave!
  world.bobs.forEach((b, idx) => {
    b.angle = 0.62 * dir;
    b.angVel = 0;
    b.glow = 0.9;
    b.trail = [];
    updateBobCartesian(b, world);
    if (idx === 0) {
      soundEngine.playPendulumClick(b.noteIndex, false, 0.8);
    }
  });
  world.notesPlayed += 1;
  world.score += 50;
}

export function clearPendulumTrails(world: PendulumWorld) {
  for (const b of world.bobs) b.trail = [];
  for (const a of world.doubleArms) a.trail = [];
  world.ribbonPoints = [];
}

export function stepPendulumWorld(
  world: PendulumWorld,
  dt: number,
  autoPulse: boolean,
  voice: PendulumVoice,
  reducedMotion: boolean
) {
  world.time += dt;
  const clampedDt = Math.min(0.032, dt);

  // Decay visual pulses & particles
  for (let i = world.pulses.length - 1; i >= 0; i--) {
    const p = world.pulses[i];
    p.radius += 110 * clampedDt;
    p.alpha -= 1.45 * clampedDt;
    if (p.alpha <= 0) world.pulses.splice(i, 1);
  }
  for (let i = world.particles.length - 1; i >= 0; i--) {
    const p = world.particles[i];
    p.x += p.vx * clampedDt;
    p.y += p.vy * clampedDt;
    p.alpha -= p.decay * clampedDt;
    if (p.alpha <= 0) world.particles.splice(i, 1);
  }

  if (world.preset === 'HARMONOGRAPH' || world.preset === 'GRAND_KALEIDOSCOPE') {
    const steps = 4;
    const subDt = clampedDt / steps;
    for (let s = 0; s < steps; s++) {
      const t = world.time - clampedDt + (s + 1) * subDt;
      const damp = autoPulse ? 1 : Math.exp(-world.harmDamp * t * 3);
      const x =
        world.harmCenterX +
        Math.sin(t * 1.85 + world.harmPhaseA) * world.harmAmpX * damp * 0.68 +
        Math.sin(t * 1.85 * world.harmFreqRatio + 0.4) * world.harmAmpX * damp * 0.32;
      const y =
        world.harmCenterY +
        Math.cos(t * 1.85 * 1.003 + world.harmPhaseB) * world.harmAmpY * damp * 0.68 +
        Math.cos(t * 1.85 * (world.harmFreqRatio + 0.5) - 0.3) * world.harmAmpY * damp * 0.32;

      world.ribbonPoints.push({ x, y, hue: (t * 28) % 360 });
      if (world.ribbonPoints.length > 520) {
        world.ribbonPoints.shift();
      }
    }
    if (Math.floor((world.time - clampedDt) * 2.2) !== Math.floor(world.time * 2.2)) {
      const last = world.ribbonPoints[world.ribbonPoints.length - 1];
      if (last) {
        const note = Math.floor((last.x / ARENA_WIDTH) * 14);
        world.notesPlayed += 1;
        world.combo += 1;
        if (world.combo > world.maxCombo) world.maxCombo = world.combo;
        world.score += 15;
        soundEngine.playPendulumClick(note, voice === 'cradle', 0.42);
      }
    }
    return;
  }

  if (world.preset === 'DOUBLE_CHAOS') {
    const g = 280;
    const m1 = 1.0;
    const m2 = 1.0;
    const substeps = 6;
    const h = clampedDt / substeps;
    for (const arm of world.doubleArms) {
      for (let s = 0; s < substeps; s++) {
        const { l1, l2, a1, a2, v1, v2 } = arm;
        const delta = a1 - a2;
        const denom1 = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * delta));
        const denom2 = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * delta));
        const acc1 =
          (-g * (2 * m1 + m2) * Math.sin(a1) -
            m2 * g * Math.sin(a1 - 2 * a2) -
            2 * Math.sin(delta) * m2 * (v2 * v2 * l2 + v1 * v1 * l1 * Math.cos(delta))) /
          denom1;
        const acc2 =
          (2 *
            Math.sin(delta) *
            (v1 * v1 * l1 * (m1 + m2) +
              g * (m1 + m2) * Math.cos(a1) +
              v2 * v2 * l2 * m2 * Math.cos(delta))) /
          denom2;

        arm.v1 = (arm.v1 + acc1 * h) * (autoPulse ? 0.9999 : 0.9985);
        arm.v2 = (arm.v2 + acc2 * h) * (autoPulse ? 0.9999 : 0.9985);
        arm.v1 = Math.max(-7.5, Math.min(7.5, arm.v1));
        arm.v2 = Math.max(-9.5, Math.min(9.5, arm.v2));
        arm.a1 += arm.v1 * h;
        arm.a2 += arm.v2 * h;
      }
      const x1 = arm.anchorX + arm.l1 * Math.sin(arm.a1);
      const y1 = arm.anchorY + arm.l1 * Math.cos(arm.a1);
      const x2 = x1 + arm.l2 * Math.sin(arm.a2);
      const y2 = y1 + arm.l2 * Math.cos(arm.a2);
      arm.trail.push({ x: x2, y: y2 });
      if (arm.trail.length > 180) arm.trail.shift();

      if (Math.floor((world.time - clampedDt) * 3.1) !== Math.floor(world.time * 3.1)) {
        const note = Math.abs(Math.floor(((x2 - 120) / 560) * 14));
        world.notesPlayed += 1;
        world.combo += 1;
        if (world.combo > world.maxCombo) world.maxCombo = world.combo;
        world.score += 18;
        soundEngine.playPendulumClick(note, voice === 'cradle', 0.45);
      }
    }
    return;
  }

  if (world.preset === 'NEWTON_CRADLE') {
    const substeps = 8;
    const h = clampedDt / substeps;
    for (let s = 0; s < substeps; s++) {
      for (let i = 0; i < world.bobs.length; i++) {
        const b = world.bobs[i];
        if (b.glow > 0 && s === 0) b.glow = Math.max(0, b.glow - clampedDt * 2.5);
        if (world.dragBobIndex === i) continue;

        const acc = -(b.omega * b.omega) * Math.sin(b.angle);
        b.angVel += acc * h;
        b.angVel *= autoPulse ? 0.99992 : 0.9985;
        b.angle += b.angVel * h;
        updateBobCartesian(b, world);
      }

      // Elastic sphere-to-sphere impulse exchange (Newton's Cradle transfer)
      for (let i = 0; i < world.bobs.length - 1; i++) {
        const a = world.bobs[i];
        const b = world.bobs[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        const minDist = a.radius + b.radius - 0.5;
        if (dist < minDist) {
          const overlapAngle = (minDist - dist) / a.length;
          a.angle -= overlapAngle * 0.5;
          b.angle += overlapAngle * 0.5;

          const relVel = a.angVel - b.angVel;
          if (relVel > 0.01) {
            const e = 0.992;
            const va = a.angVel;
            const vb = b.angVel;
            a.angVel = (va + vb - e * (va - vb)) * 0.5;
            b.angVel = (va + vb + e * (va - vb)) * 0.5;

            if (relVel > 0.45) {
              a.glow = 1;
              b.glow = 1;
              world.notesPlayed += 1;
              world.combo += 1;
              if (world.combo > world.maxCombo) world.maxCombo = world.combo;
              world.score += 25;
              const isClack = voice !== 'ethereal';
              soundEngine.playPendulumClick(
                b.noteIndex,
                isClack,
                Math.min(0.95, 0.35 + relVel * 0.35)
              );
              if (!reducedMotion && world.pulses.length < 10) {
                world.pulses.push({
                  x: (a.x + b.x) * 0.5,
                  y: (a.y + b.y) * 0.5,
                  radius: 10,
                  maxRadius: 56,
                  alpha: 0.55,
                  color: '#E0F2FE',
                });
              }
            }
          }
          updateBobCartesian(a, world);
          updateBobCartesian(b, world);
        }
      }
    }

    // Gentle sustain check if all balls calm down and autoPulse is active
    if (autoPulse) {
      const totalEnergy = world.bobs.reduce(
        (acc, b) => acc + Math.abs(b.angle) + Math.abs(b.angVel),
        0
      );
      if (totalEnergy < 0.25) {
        world.sustainTimer += clampedDt;
        if (world.sustainTimer > 0.8 && world.dragBobIndex === null) {
          world.sustainTimer = 0;
          world.bobs[0].angle = -0.68;
          world.bobs[0].angVel = 0;
          updateBobCartesian(world.bobs[0], world);
        }
      } else {
        world.sustainTimer = 0;
      }
    }

    for (const b of world.bobs) {
      b.trail.push({ x: b.x, y: b.y });
      if (b.trail.length > 14) b.trail.shift();
    }
    return;
  }

  // Harmonic phase waves, Lotus Rosette, Galaxy Swirl, Phantom Clock
  for (let i = 0; i < world.bobs.length; i++) {
    const b = world.bobs[i];
    if (b.glow > 0) b.glow = Math.max(0, b.glow - clampedDt * 2.2);
    if (world.dragBobIndex === i) continue;

    const prevAngle = b.angle;
    if (world.preset === 'LOTUS_ROSETTE' || world.preset === 'GALAXY_SWIRL') {
      b.angle += b.omega * clampedDt * (autoPulse ? 1 : 0.72);
      if (Math.sin(prevAngle) <= 0 && Math.sin(b.angle) > 0) {
        b.glow = 0.85;
        world.notesPlayed += 1;
        world.combo += 1;
        if (world.combo > world.maxCombo) world.maxCombo = world.combo;
        world.score += 18;
        if (i % 2 === 0) {
          soundEngine.playPendulumClick(b.noteIndex, voice === 'cradle', 0.48);
        }
      }
    } else {
      const prevVel = b.angVel;
      const acc = -(b.omega * b.omega) * Math.sin(b.angle);
      b.angVel += acc * clampedDt;
      b.angVel *= autoPulse ? 1.0 : 0.996;
      b.angle += b.angVel * clampedDt;

      // Normalize amplitude in autoPulse so wave stays perpetual & hypnotic
      if (autoPulse && Math.abs(b.angVel) > 0.01 && Math.sign(prevVel) !== Math.sign(b.angVel)) {
        b.angle = Math.sign(b.angle) * 0.62;
      }

      // Chime softly when crossing vertical equilibrium (angle = 0)
      if ((prevAngle < 0 && b.angle >= 0) || (prevAngle > 0 && b.angle <= 0)) {
        b.glow = 1;
        world.notesPlayed += 1;
        world.combo += 1;
        if (world.combo > world.maxCombo) world.maxCombo = world.combo;
        world.score += 20;
        soundEngine.playPendulumClick(b.noteIndex, voice === 'cradle', 0.5);
        if (!reducedMotion && world.pulses.length < 14) {
          world.pulses.push({
            x: b.x,
            y: b.y,
            radius: 6,
            maxRadius: 36,
            alpha: 0.42,
            color: `hsl(${b.hue}, 95%, 72%)`,
          });
        }
      }
    }

    updateBobCartesian(b, world);
    b.trail.push({ x: b.x, y: b.y });
    if (b.trail.length > 22) b.trail.shift();
  }
}

export function renderPendulumWorld(
  ctx: CanvasRenderingContext2D,
  world: PendulumWorld,
  showTrails: boolean,
  zenMode = false
) {
  ctx.save();

  const bg = ctx.createRadialGradient(
    ARENA_WIDTH / 2,
    ARENA_HEIGHT / 2,
    40,
    ARENA_WIDTH / 2,
    ARENA_HEIGHT / 2,
    500
  );
  bg.addColorStop(0, world.preset === 'PHANTOM_CLOCK' ? '#171128' : '#111936');
  bg.addColorStop(1, '#060913');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

  // Subtle decorative guide arcs / clock rings
  ctx.save();
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
  ctx.lineWidth = 1.25;
  if (
    world.preset === 'LOTUS_ROSETTE' ||
    world.preset === 'GALAXY_SWIRL' ||
    world.preset === 'GRAND_KALEIDOSCOPE' ||
    world.preset === 'HARMONOGRAPH'
  ) {
    for (const r of [90, 165, 240]) {
      ctx.beginPath();
      ctx.arc(ARENA_WIDTH / 2, ARENA_HEIGHT / 2 + 8, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else {
    // Top mounting beam
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.32)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(110, world.preset === 'NEWTON_CRADLE' ? 108 : 64);
    ctx.lineTo(ARENA_WIDTH - 110, world.preset === 'NEWTON_CRADLE' ? 108 : 64);
    ctx.stroke();

    if (world.preset === 'PHANTOM_CLOCK') {
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.14)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(ARENA_WIDTH / 2, 260, 195, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();

  // Harmonograph / Kaleidoscope Ribbon
  if (
    (world.preset === 'HARMONOGRAPH' || world.preset === 'GRAND_KALEIDOSCOPE') &&
    world.ribbonPoints.length > 1
  ) {
    const folds = world.preset === 'GRAND_KALEIDOSCOPE' ? 6 : 1;
    for (let f = 0; f < folds; f++) {
      ctx.save();
      if (folds > 1) {
        ctx.translate(world.harmCenterX, world.harmCenterY);
        ctx.rotate((f / folds) * Math.PI * 2);
        ctx.translate(-world.harmCenterX, -world.harmCenterY);
      }
      for (let i = 1; i < world.ribbonPoints.length; i++) {
        const p0 = world.ribbonPoints[i - 1];
        const p1 = world.ribbonPoints[i];
        const t = i / world.ribbonPoints.length;
        ctx.strokeStyle = `hsla(${(p1.hue + f * 35) % 360}, 92%, 68%, ${0.08 + t * 0.72})`;
        ctx.lineWidth = 1.2 + t * 2.4;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    const head = world.ribbonPoints[world.ribbonPoints.length - 1];
    if (head) {
      ctx.save();
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(world.harmCenterX, 54);
      ctx.lineTo(head.x, head.y);
      ctx.stroke();

      ctx.fillStyle = `hsl(${head.hue}, 95%, 72%)`;
      ctx.shadowColor = `hsl(${head.hue}, 95%, 68%)`;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(head.x, head.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Double Chaotic Pendulums
  for (const arm of world.doubleArms) {
    const x1 = arm.anchorX + arm.l1 * Math.sin(arm.a1);
    const y1 = arm.anchorY + arm.l1 * Math.cos(arm.a1);
    const x2 = x1 + arm.l2 * Math.sin(arm.a2);
    const y2 = y1 + arm.l2 * Math.cos(arm.a2);

    if (showTrails && arm.trail.length > 1) {
      for (let i = 1; i < arm.trail.length; i++) {
        const t = i / arm.trail.length;
        ctx.strokeStyle = `hsla(${(arm.hue + i * 0.7) % 360}, 92%, 68%, ${t * 0.7})`;
        ctx.lineWidth = 1.4 + t * 2.4;
        ctx.beginPath();
        ctx.moveTo(arm.trail[i - 1].x, arm.trail[i - 1].y);
        ctx.lineTo(arm.trail[i].x, arm.trail[i].y);
        ctx.stroke();
      }
    }

    ctx.save();
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(arm.anchorX, arm.anchorY);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    for (const [bx, by, r] of [
      [arm.anchorX, arm.anchorY, 5],
      [x1, y1, 9],
      [x2, y2, 12],
    ] as const) {
      ctx.fillStyle = r === 5 ? '#E2E8F0' : `hsl(${arm.hue}, 92%, 66%)`;
      ctx.shadowColor = `hsl(${arm.hue}, 95%, 64%)`;
      ctx.shadowBlur = r === 5 ? 0 : 12;
      ctx.beginPath();
      ctx.arc(bx, by, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Wave / Cradle / Rosette Pendulums
  if (world.bobs.length > 1 && world.preset !== 'NEWTON_CRADLE') {
    // Connecting silk harmonic spine
    ctx.save();
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.22)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    world.bobs.forEach((b, idx) => {
      if (idx === 0) ctx.moveTo(b.x, b.y);
      else ctx.lineTo(b.x, b.y);
    });
    if (world.preset === 'LOTUS_ROSETTE') ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  for (const b of world.bobs) {
    if (showTrails && b.trail.length > 1) {
      ctx.save();
      for (let i = 1; i < b.trail.length; i++) {
        const t = i / b.trail.length;
        ctx.strokeStyle = `hsla(${b.hue}, 92%, 68%, ${t * 0.42})`;
        ctx.lineWidth = 1.2 + t * 2.2;
        ctx.beginPath();
        ctx.moveTo(b.trail[i - 1].x, b.trail[i - 1].y);
        ctx.lineTo(b.trail[i].x, b.trail[i].y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Suspension wire
    ctx.save();
    ctx.strokeStyle =
      world.preset === 'NEWTON_CRADLE'
        ? 'rgba(203, 213, 225, 0.55)'
        : 'rgba(148, 163, 184, 0.24)';
    ctx.lineWidth = world.preset === 'NEWTON_CRADLE' ? 1.6 : 1.1;
    ctx.beginPath();
    ctx.moveTo(b.anchorX, b.anchorY);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();

    // Glowing Sphere
    const grad = ctx.createRadialGradient(
      b.x - b.radius * 0.32,
      b.y - b.radius * 0.32,
      2,
      b.x,
      b.y,
      b.radius
    );
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.45, `hsl(${b.hue}, 92%, ${62 + b.glow * 16}%)`);
    grad.addColorStop(1, `hsl(${b.hue}, 82%, 34%)`);
    ctx.fillStyle = grad;
    ctx.shadowColor = `hsla(${b.hue}, 95%, 65%, ${0.4 + b.glow * 0.55})`;
    ctx.shadowBlur = 10 + b.glow * 12;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();

    if (b.glow > 0.1) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${b.glow * 0.7})`;
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }
    ctx.restore();
  }

  // Pulse rings & sparkles
  for (const p of world.pulses) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
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

  if (!zenMode) {
    ctx.save();
    ctx.fillStyle = 'rgba(226, 232, 240, 0.45)';
    ctx.font = '600 11px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Drag spheres or tap to weave harmonic waves', ARENA_WIDTH / 2, ARENA_HEIGHT - 16);
    ctx.restore();
  }

  ctx.restore();
}
