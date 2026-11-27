import { soundEngine } from '../audio/soundEngine';
import { ARENA_HEIGHT, ARENA_WIDTH } from './stages';
import { FloatingText, Particle, TrackPreset } from './types';

export const TRACK_PRESET_NAMES: Record<TrackPreset, string> = {
  MEADOW_SLIDE: 'Meadow Slide',
  SEESAW_SPLIT: 'Seesaw Split',
  PENDULUM_GATES: 'Tuned Organ',
  DOUBLE_HELIX: 'Twin Ribbon',
  GALAXY_FUNNEL: 'Spiral Funnel',
  RAINBOW_ORGAN: 'Cascade Steps',
  PINBALL_CHUTES: 'Pinball Cascade',
  LOTUS_SWITCHBACK: 'Lotus Switchback',
  CLOCKWORK_TOWER: 'Clockwork Tower',
  GRAND_COASTER: 'Grand Coaster',
};

export interface TrackSegment {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  hue: number;
  restitution: number;
  noteIndex: number;
  hitFlash: number;
  isUser?: boolean;
}

export interface TrackSeesaw {
  id: number;
  cx: number;
  cy: number;
  halfLen: number;
  angle: number;
  angularVel: number;
  maxAngle: number;
  hue: number;
  hitFlash: number;
  isUser?: boolean;
}

export interface TrackBell {
  id: number;
  x: number;
  y: number;
  radius: number;
  noteIndex: number;
  hue: number;
  hitFlash: number;
  isUser?: boolean;
}

export interface TrackStar {
  id: number;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  respawnTimer: number;
  pulsePhase: number;
}

export interface TrackHintArc {
  x1: number;
  y1: number;
  cx: number;
  cy: number;
  x2: number;
  y2: number;
}

export interface TrackGoalCup {
  id: number;
  x: number;
  y: number;
  width: number;
  hue: number;
  caught: number;
  flash: number;
}

export interface TrackEmitter {
  x: number;
  y: number;
  vx: number;
  vy: number;
  interval: number;
  timer: number;
  hueBase: number;
}

export interface TrackMarble {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
  trail: Array<{ x: number; y: number }>;
  age: number;
  chimesHit: number;
  lastTapCooldown: number;
}

export interface MarbleRunWorld {
  preset: TrackPreset;
  segments: TrackSegment[];
  seesaws: TrackSeesaw[];
  bells: TrackBell[];
  stars: TrackStar[];
  hintArcs: TrackHintArc[];
  cups: TrackGoalCup[];
  emitters: TrackEmitter[];
  marbles: TrackMarble[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  drawDraft: { x1: number; y1: number; x2: number; y2: number } | null;
  score: number;
  combo: number;
  maxCombo: number;
  chimesPlayed: number;
  goalCaught: number;
  goalTarget: number;
  coursesCleared: number;
  clearTimer: number;
  time: number;
  nextId: number;
  gravity: number;
}

const PRESET_ORDER: TrackPreset[] = [
  'MEADOW_SLIDE',
  'SEESAW_SPLIT',
  'PENDULUM_GATES',
  'DOUBLE_HELIX',
  'GALAXY_FUNNEL',
  'RAINBOW_ORGAN',
  'PINBALL_CHUTES',
  'LOTUS_SWITCHBACK',
  'CLOCKWORK_TOWER',
  'GRAND_COASTER',
];

function addPolylineCurve(
  world: MarbleRunWorld,
  points: Array<[number, number]>,
  hueStart: number,
  hueStep: number,
  restitution = 0.04,
  noteStart = 12
) {
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    world.segments.push({
      id: world.nextId++,
      x1,
      y1,
      x2,
      y2,
      hue: (hueStart + i * hueStep + 360) % 360,
      restitution,
      noteIndex: Math.max(0, Math.min(14, noteStart - (i % 6))),
      hitFlash: 0,
    });
  }
}

/**
 * Adds a gentle, shallow-elevation quadratic Bezier chute.
 */
function addSmoothChute(
  world: MarbleRunWorld,
  x1: number,
  y1: number,
  cx: number,
  cy: number,
  x2: number,
  y2: number,
  steps: number,
  hueStart: number,
  hueStep = 5,
  restitution = 0.04,
  noteStart = 12
) {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const inv = 1 - t;
    const px = inv * inv * x1 + 2 * inv * t * cx + t * t * x2;
    const py = inv * inv * y1 + 2 * inv * t * cy + t * t * y2;
    pts.push([px, py]);
  }
  addPolylineCurve(world, pts, hueStart, hueStep, restitution, noteStart);
}

function addFunnelCatch(
  world: MarbleRunWorld,
  cx: number,
  cupY: number,
  cupWidth: number,
  hue: number
) {
  const half = cupWidth * 0.5;
  addPolylineCurve(
    world,
    [
      [cx - half - 36, cupY - 34],
      [cx - half + 6, cupY - 6],
    ],
    hue,
    6,
    0.04,
    6
  );
  addPolylineCurve(
    world,
    [
      [cx + half + 36, cupY - 34],
      [cx + half - 6, cupY - 6],
    ],
    hue + 20,
    6,
    0.04,
    7
  );
}

export function createMarbleRunWorld(
  preset: TrackPreset = 'MEADOW_SLIDE',
  keepScore = 0,
  keepMaxCombo = 0,
  keepClears = 0
): MarbleRunWorld {
  const world: MarbleRunWorld = {
    preset,
    segments: [],
    seesaws: [],
    bells: [],
    stars: [],
    hintArcs: [],
    cups: [],
    emitters: [],
    marbles: [],
    particles: [],
    floatingTexts: [],
    drawDraft: null,
    score: keepScore,
    combo: 0,
    maxCombo: keepMaxCombo,
    chimesPlayed: 0,
    goalCaught: 0,
    goalTarget: 8,
    coursesCleared: keepClears,
    clearTimer: 0,
    time: 0,
    nextId: 1,
    // Gentle, watchable gravity so marbles glide slowly instead of rocketing down
    gravity: 215,
  };

  if (preset === 'MEADOW_SLIDE') {
    world.goalTarget = 8;
    world.emitters.push({
      x: 112,
      y: 44,
      vx: 20,
      vy: 6,
      interval: 1.35,
      timer: 0.15,
      hueBase: 175,
    });

    // Gentle shallow S-curves (low elevation gradient -> calm rolling pace)
    addSmoothChute(world, 72, 86, 250, 134, 495, 148, 10, 175, 5, 0.04, 13);
    addSmoothChute(world, 575, 192, 415, 242, 225, 258, 10, 215, 5, 0.04, 10);

    // Partial lower catch leading into the Goal Cup on the right — player bridges the middle gap!
    addSmoothChute(world, 395, 444, 470, 482, 536, 496, 7, 162, 5, 0.04, 6);

    // Dashed curiosity hint showing where a bridge chute connects left drop to right collector
    world.hintArcs.push({ x1: 185, y1: 306, cx: 295, cy: 374, x2: 396, y2: 432 });

    // Optional Star Gates along the route
    world.stars.push(
      { id: world.nextId++, x: 292, y: 368, radius: 13, collected: false, respawnTimer: 0, pulsePhase: 0 },
      { id: world.nextId++, x: 472, y: 454, radius: 13, collected: false, respawnTimer: 0, pulsePhase: 1.5 }
    );

    world.bells.push(
      { id: world.nextId++, x: 545, y: 146, radius: 11, noteIndex: 12, hue: 185, hitFlash: 0 },
      { id: world.nextId++, x: 175, y: 266, radius: 11, noteIndex: 9, hue: 150, hitFlash: 0 }
    );

    world.cups.push({
      id: world.nextId++,
      x: 565,
      y: 552,
      width: 118,
      hue: 162,
      caught: 0,
      flash: 0,
    });
    addFunnelCatch(world, 565, 552, 118, 162);
  } else if (preset === 'SEESAW_SPLIT') {
    world.goalTarget = 8;
    world.emitters.push({
      x: 400,
      y: 42,
      vx: 0,
      vy: 8,
      interval: 1.25,
      timer: 0.15,
      hueBase: 195,
    });

    // Top gentle seesaw + upper split rails
    world.seesaws.push({
      id: world.nextId++,
      cx: 400,
      cy: 128,
      halfLen: 72,
      angle: 0.18,
      angularVel: 0,
      maxAngle: 0.36,
      hue: 48,
      hitFlash: 0,
    });

    addSmoothChute(world, 340, 178, 280, 206, 218, 218, 6, 175, 5, 0.04, 12);
    addSmoothChute(world, 460, 178, 520, 206, 582, 218, 6, 305, 5, 0.04, 12);

    // Lower tilted ramps pointing INWARD toward the center gap — player draws chutes or adds seesaws to route outward to twin Goal Cups!
    addSmoothChute(world, 62, 286, 175, 326, 265, 340, 7, 195, 5, 0.04, 9);
    addSmoothChute(world, 738, 286, 625, 326, 535, 340, 7, 315, 5, 0.04, 9);

    world.hintArcs.push(
      { x1: 348, y1: 372, cx: 265, cy: 432, x2: 192, y2: 492 },
      { x1: 452, y1: 372, cx: 535, cy: 432, x2: 608, y2: 492 }
    );

    world.stars.push(
      { id: world.nextId++, x: 256, y: 422, radius: 13, collected: false, respawnTimer: 0, pulsePhase: 0 },
      { id: world.nextId++, x: 544, y: 422, radius: 13, collected: false, respawnTimer: 0, pulsePhase: 1.2 }
    );

    world.bells.push(
      { id: world.nextId++, x: 400, y: 245, radius: 12, noteIndex: 11, hue: 48, hitFlash: 0 }
    );

    world.cups.push(
      { id: world.nextId++, x: 185, y: 552, width: 116, hue: 175, caught: 0, flash: 0 },
      { id: world.nextId++, x: 615, y: 552, width: 116, hue: 305, caught: 0, flash: 0 }
    );
    addFunnelCatch(world, 185, 552, 116, 175);
    addFunnelCatch(world, 615, 552, 116, 305);
  } else if (preset === 'PENDULUM_GATES') {
    world.goalTarget = 8;
    world.emitters.push(
      { x: 112, y: 44, vx: 22, vy: 6, interval: 1.4, timer: 0.12, hueBase: 160 },
      { x: 688, y: 44, vx: -22, vy: 6, interval: 1.4, timer: 0.82, hueBase: 285 }
    );

    // 3 shallow musical xylophone steps per side stopping at x=255 and x=545
    for (let i = 0; i < 3; i++) {
      const y1 = 96 + i * 64;
      const y2 = y1 + 24;
      const lx1 = 74 + i * 56;
      const lx2 = lx1 + 102;
      addSmoothChute(world, lx1, y1, (lx1 + lx2) * 0.5, y2 - 2, lx2, y2, 5, 155 + i * 20, 6, 0.06, 13 - i * 2);

      const rx1 = ARENA_WIDTH - lx1;
      const rx2 = ARENA_WIDTH - lx2;
      addSmoothChute(world, rx1, y1, (rx1 + rx2) * 0.5, y2 - 2, rx2, y2, 5, 310 - i * 20, 6, 0.06, 14 - i * 2);
    }

    // Center seesaw above the Goal Cup — marbles tip off both sides unless player catches & funnels them home!
    world.seesaws.push({
      id: world.nextId++,
      cx: 400,
      cy: 422,
      halfLen: 72,
      angle: 0.18,
      angularVel: 0,
      maxAngle: 0.36,
      hue: 48,
      hitFlash: 0,
    });

    world.hintArcs.push(
      { x1: 258, y1: 444, cx: 316, cy: 492, x2: 374, y2: 514 },
      { x1: 542, y1: 444, cx: 484, cy: 492, x2: 426, y2: 514 }
    );

    world.stars.push(
      { id: world.nextId++, x: 325, y: 345, radius: 13, collected: false, respawnTimer: 0, pulsePhase: 0 },
      { id: world.nextId++, x: 475, y: 345, radius: 13, collected: false, respawnTimer: 0, pulsePhase: 1.1 }
    );

    world.bells.push(
      { id: world.nextId++, x: 400, y: 205, radius: 12, noteIndex: 11, hue: 190, hitFlash: 0 }
    );

    world.cups.push({
      id: world.nextId++,
      x: 400,
      y: 552,
      width: 128,
      hue: 48,
      caught: 0,
      flash: 0,
    });
    addFunnelCatch(world, 400, 552, 128, 48);
  } else if (preset === 'DOUBLE_HELIX') {
    world.goalTarget = 8;
    world.emitters.push(
      { x: 118, y: 44, vx: 22, vy: 6, interval: 1.4, timer: 0.15, hueBase: 190 },
      { x: 682, y: 44, vx: -22, vy: 6, interval: 1.4, timer: 0.85, hueBase: 325 }
    );

    // Gentle weaving twin ribbons stopping mid-arena so player completes the return sweep to Goal Cup
    addSmoothChute(world, 72, 86, 200, 128, 355, 144, 9, 180, 5, 0.04, 13);
    addSmoothChute(world, 398, 190, 515, 232, 625, 248, 9, 335, 5, 0.04, 11);

    addSmoothChute(world, 728, 86, 600, 128, 445, 144, 9, 315, 5, 0.04, 14);
    addSmoothChute(world, 402, 190, 285, 232, 175, 248, 9, 200, 5, 0.04, 10);

    world.hintArcs.push(
      { x1: 14, y1: 344, cx: 195, cy: 430, x2: 372, y2: 492 },
      { x1: 786, y1: 344, cx: 605, cy: 430, x2: 428, y2: 492 }
    );

    world.stars.push(
      { id: world.nextId++, x: 225, y: 405, radius: 13, collected: false, respawnTimer: 0, pulsePhase: 0 },
      { id: world.nextId++, x: 575, y: 405, radius: 13, collected: false, respawnTimer: 0, pulsePhase: 1.4 }
    );

    world.bells.push(
      { id: world.nextId++, x: 400, y: 112, radius: 11, noteIndex: 12, hue: 48, hitFlash: 0 },
      { id: world.nextId++, x: 400, y: 335, radius: 12, noteIndex: 8, hue: 185, hitFlash: 0 }
    );

    world.cups.push({
      id: world.nextId++,
      x: 400,
      y: 552,
      width: 126,
      hue: 195,
      caught: 0,
      flash: 0,
    });
    addFunnelCatch(world, 400, 552, 126, 195);
  } else if (preset === 'GALAXY_FUNNEL') {
    world.goalTarget = 8;
    world.emitters.push(
      { x: 116, y: 44, vx: 22, vy: 6, interval: 1.4, timer: 0.12, hueBase: 190 },
      { x: 684, y: 44, vx: -22, vy: 6, interval: 1.4, timer: 0.82, hueBase: 280 }
    );

    // Shallow upper funnels -> center seesaw -> outward wing slides
    addSmoothChute(world, 74, 88, 190, 140, 350, 158, 9, 185, 5, 0.04, 12);
    addSmoothChute(world, 726, 88, 610, 140, 450, 158, 9, 285, 5, 0.04, 13);

    world.seesaws.push({
      id: world.nextId++,
      cx: 400,
      cy: 224,
      halfLen: 68,
      angle: 0.18,
      angularVel: 0,
      maxAngle: 0.36,
      hue: 48,
      hitFlash: 0,
    });

    addSmoothChute(world, 355, 272, 255, 310, 170, 326, 7, 160, 5, 0.04, 9);
    addSmoothChute(world, 445, 272, 545, 310, 630, 326, 7, 320, 5, 0.04, 10);

    // Player adds lower spiral return chutes to guide outer streams back to center cup
    world.hintArcs.push(
      { x1: 48, y1: 386, cx: 205, cy: 460, x2: 365, y2: 492 },
      { x1: 752, y1: 386, cx: 595, cy: 460, x2: 435, y2: 492 }
    );

    world.stars.push(
      { id: world.nextId++, x: 225, y: 432, radius: 13, collected: false, respawnTimer: 0, pulsePhase: 0.4 },
      { id: world.nextId++, x: 575, y: 432, radius: 13, collected: false, respawnTimer: 0, pulsePhase: 1.8 }
    );

    world.bells.push(
      { id: world.nextId++, x: 265, y: 215, radius: 11, noteIndex: 11, hue: 195, hitFlash: 0 },
      { id: world.nextId++, x: 535, y: 215, radius: 11, noteIndex: 12, hue: 310, hitFlash: 0 }
    );

    world.cups.push({
      id: world.nextId++,
      x: 400,
      y: 552,
      width: 126,
      hue: 265,
      caught: 0,
      flash: 0,
    });
    addFunnelCatch(world, 400, 552, 126, 265);
  } else if (preset === 'RAINBOW_ORGAN') {
    world.goalTarget = 8;
    world.emitters.push({
      x: 105,
      y: 44,
      vx: 26,
      vy: 6,
      interval: 1.25,
      timer: 0.1,
      hueBase: 35,
    });

    // 5 gentle cascading rainbow xylophone steps moving right
    for (let i = 0; i < 5; i++) {
      const x1 = 72 + i * 68;
      const y1 = 96 + i * 40;
      const x2 = x1 + 92;
      const y2 = y1 + 18;
      addSmoothChute(world, x1, y1, (x1 + x2) * 0.5, y1 + 12, x2, y2, 4, (i * 42) % 360, 4, 0.06, 14 - i);
    }

    // Partial return ramp on the left leading into the Goal Cup at x=190
    addSmoothChute(world, 345, 456, 275, 488, 215, 500, 6, 200, 6, 0.04, 5);

    world.hintArcs.push({ x1: 620, y1: 360, cx: 475, cy: 424, x2: 332, y2: 454 });

    world.stars.push(
      { id: world.nextId++, x: 475, y: 392, radius: 13, collected: false, respawnTimer: 0, pulsePhase: 0 },
      { id: world.nextId++, x: 272, y: 465, radius: 13, collected: false, respawnTimer: 0, pulsePhase: 1.6 }
    );

    world.bells.push(
      { id: world.nextId++, x: 265, y: 102, radius: 11, noteIndex: 12, hue: 185, hitFlash: 0 },
      { id: world.nextId++, x: 435, y: 182, radius: 11, noteIndex: 8, hue: 46, hitFlash: 0 }
    );

    world.cups.push({
      id: world.nextId++,
      x: 185,
      y: 552,
      width: 122,
      hue: 45,
      caught: 0,
      flash: 0,
    });
    addFunnelCatch(world, 185, 552, 122, 45);
  } else if (preset === 'PINBALL_CHUTES') {
    world.goalTarget = 10;
    world.emitters.push(
      { x: 215, y: 42, vx: 14, vy: 8, interval: 1.35, timer: 0.15, hueBase: 175 },
      { x: 585, y: 42, vx: -14, vy: 8, interval: 1.35, timer: 0.8, hueBase: 310 }
    );

    // Top twin chutes feeding central seesaw
    addSmoothChute(world, 150, 86, 240, 124, 342, 136, 7, 175, 5, 0.04, 13);
    addSmoothChute(world, 650, 86, 560, 124, 458, 136, 7, 310, 5, 0.04, 14);

    world.seesaws.push(
      {
        id: world.nextId++,
        cx: 400,
        cy: 192,
        halfLen: 72,
        angle: 0.18,
        angularVel: 0,
        maxAngle: 0.36,
        hue: 48,
        hitFlash: 0,
      },
      {
        id: world.nextId++,
        cx: 400,
        cy: 394,
        halfLen: 58,
        angle: -0.18,
        angularVel: 0,
        maxAngle: 0.36,
        hue: 195,
        hitFlash: 0,
      }
    );

    // Mid-wing funnels pull marbles back toward the lower seesaw — player bridges outward to the twin cups!
    addSmoothChute(world, 200, 292, 280, 332, 348, 346, 6, 185, 5, 0.04, 10);
    addSmoothChute(world, 600, 292, 520, 332, 452, 346, 6, 300, 5, 0.04, 11);

    world.hintArcs.push(
      { x1: 336, y1: 424, cx: 230, cy: 464, x2: 135, y2: 494 },
      { x1: 464, y1: 424, cx: 570, cy: 464, x2: 665, y2: 494 }
    );

    world.stars.push(
      { id: world.nextId++, x: 232, y: 446, radius: 13, collected: false, respawnTimer: 0, pulsePhase: 0 },
      { id: world.nextId++, x: 568, y: 446, radius: 13, collected: false, respawnTimer: 0, pulsePhase: 1.2 },
      { id: world.nextId++, x: 400, y: 310, radius: 13, collected: false, respawnTimer: 0, pulsePhase: 2.1 }
    );

    world.bells.push(
      { id: world.nextId++, x: 400, y: 108, radius: 12, noteIndex: 13, hue: 48, hitFlash: 0 },
      { id: world.nextId++, x: 400, y: 265, radius: 12, noteIndex: 9, hue: 195, hitFlash: 0 }
    );

    world.cups.push(
      { id: world.nextId++, x: 122, y: 552, width: 112, hue: 175, caught: 0, flash: 0 },
      { id: world.nextId++, x: 678, y: 552, width: 112, hue: 310, caught: 0, flash: 0 }
    );
    addFunnelCatch(world, 122, 552, 112, 175);
    addFunnelCatch(world, 678, 552, 112, 310);
  } else if (preset === 'LOTUS_SWITCHBACK') {
    world.goalTarget = 10;
    world.emitters.push(
      { x: 165, y: 44, vx: 20, vy: 6, interval: 1.4, timer: 0.12, hueBase: 325 },
      { x: 635, y: 44, vx: -20, vy: 6, interval: 1.4, timer: 0.82, hueBase: 170 }
    );

    // Upper inward petal chutes converging toward center bell
    addSmoothChute(world, 108, 86, 215, 134, 338, 152, 8, 320, 5, 0.04, 13);
    addSmoothChute(world, 692, 86, 585, 134, 462, 152, 8, 175, 5, 0.04, 14);

    // Mid opposing lotus petals sweeping outward
    addSmoothChute(world, 372, 224, 265, 272, 148, 294, 8, 190, 5, 0.04, 10);
    addSmoothChute(world, 428, 224, 535, 272, 652, 294, 8, 305, 5, 0.04, 11);

    // Partial lower catch leading to center Goal Cup — player bridges outer petal tips inward!
    world.hintArcs.push(
      { x1: 116, y1: 336, cx: 235, cy: 422, x2: 368, y2: 486 },
      { x1: 684, y1: 336, cx: 565, cy: 422, x2: 432, y2: 486 }
    );

    world.stars.push(
      { id: world.nextId++, x: 245, y: 405, radius: 13, collected: false, respawnTimer: 0, pulsePhase: 0 },
      { id: world.nextId++, x: 555, y: 405, radius: 13, collected: false, respawnTimer: 0, pulsePhase: 1.4 },
      { id: world.nextId++, x: 400, y: 202, radius: 13, collected: false, respawnTimer: 0, pulsePhase: 2.2 }
    );

    world.bells.push(
      { id: world.nextId++, x: 400, y: 145, radius: 12, noteIndex: 13, hue: 48, hitFlash: 0 },
      { id: world.nextId++, x: 110, y: 294, radius: 11, noteIndex: 8, hue: 195, hitFlash: 0 },
      { id: world.nextId++, x: 690, y: 294, radius: 11, noteIndex: 9, hue: 325, hitFlash: 0 }
    );

    world.cups.push({
      id: world.nextId++,
      x: 400,
      y: 552,
      width: 130,
      hue: 318,
      caught: 0,
      flash: 0,
    });
    addFunnelCatch(world, 400, 552, 130, 318);
  } else if (preset === 'CLOCKWORK_TOWER') {
    world.goalTarget = 10;
    world.emitters.push({
      x: 400,
      y: 42,
      vx: 0,
      vy: 8,
      interval: 1.25,
      timer: 0.12,
      hueBase: 44,
    });

    // Vertical clockwork column of 3 seesaws + side catch rails
    world.seesaws.push(
      { id: world.nextId++, cx: 400, cy: 122, halfLen: 70, angle: 0.2, angularVel: 0, maxAngle: 0.36, hue: 46, hitFlash: 0 },
      { id: world.nextId++, cx: 245, cy: 256, halfLen: 64, angle: -0.18, angularVel: 0, maxAngle: 0.36, hue: 185, hitFlash: 0 },
      { id: world.nextId++, cx: 555, cy: 256, halfLen: 64, angle: 0.18, angularVel: 0, maxAngle: 0.36, hue: 285, hitFlash: 0 }
    );

    addSmoothChute(world, 336, 174, 286, 198, 250, 204, 5, 48, 5, 0.04, 13);
    addSmoothChute(world, 464, 174, 514, 198, 550, 204, 5, 290, 5, 0.04, 14);

    // Outer side chutes sweep down toward lower corners — player connects back toward twin cups
    addSmoothChute(world, 176, 304, 132, 338, 102, 352, 5, 175, 5, 0.04, 10);
    addSmoothChute(world, 624, 304, 668, 338, 698, 352, 5, 315, 5, 0.04, 11);

    world.hintArcs.push(
      { x1: 14, y1: 396, cx: 98, cy: 468, x2: 178, y2: 500 },
      { x1: 786, y1: 396, cx: 702, cy: 468, x2: 622, y2: 500 },
      { x1: 304, y1: 304, cx: 268, cy: 412, x2: 222, y2: 496 },
      { x1: 496, y1: 304, cx: 532, cy: 412, x2: 578, y2: 496 }
    );

    world.stars.push(
      { id: world.nextId++, x: 155, y: 440, radius: 13, collected: false, respawnTimer: 0, pulsePhase: 0.2 },
      { id: world.nextId++, x: 645, y: 440, radius: 13, collected: false, respawnTimer: 0, pulsePhase: 1.5 }
    );

    world.bells.push(
      { id: world.nextId++, x: 400, y: 318, radius: 13, noteIndex: 10, hue: 46, hitFlash: 0 }
    );

    world.cups.push(
      { id: world.nextId++, x: 205, y: 552, width: 118, hue: 175, caught: 0, flash: 0 },
      { id: world.nextId++, x: 595, y: 552, width: 118, hue: 285, caught: 0, flash: 0 }
    );
    addFunnelCatch(world, 205, 552, 118, 175);
    addFunnelCatch(world, 595, 552, 118, 285);
  } else {
    // GRAND_COASTER
    world.goalTarget = 10;
    world.emitters.push(
      { x: 140, y: 42, vx: 22, vy: 6, interval: 1.45, timer: 0.1, hueBase: 175 },
      { x: 400, y: 42, vx: 0, vy: 8, interval: 1.55, timer: 0.6, hueBase: 45 },
      { x: 660, y: 42, vx: -22, vy: 6, interval: 1.45, timer: 1.1, hueBase: 305 }
    );

    addSmoothChute(world, 82, 88, 155, 132, 232, 146, 7, 175, 5, 0.04, 13);
    addSmoothChute(world, 718, 88, 645, 132, 568, 146, 7, 305, 5, 0.04, 14);

    world.seesaws.push(
      { id: world.nextId++, cx: 400, cy: 144, halfLen: 68, angle: 0.18, angularVel: 0, maxAngle: 0.36, hue: 48, hitFlash: 0 },
      { id: world.nextId++, cx: 245, cy: 238, halfLen: 64, angle: -0.18, angularVel: 0, maxAngle: 0.36, hue: 185, hitFlash: 0 },
      { id: world.nextId++, cx: 555, cy: 238, halfLen: 64, angle: 0.18, angularVel: 0, maxAngle: 0.36, hue: 320, hitFlash: 0 }
    );

    // Mid coaster guides sweep outward — player builds the final bridge chutes inward to the Goal Cup!
    addSmoothChute(world, 378, 294, 285, 332, 195, 348, 6, 48, 5, 0.04, 10);
    addSmoothChute(world, 422, 294, 515, 332, 605, 348, 6, 315, 5, 0.04, 11);

    world.hintArcs.push(
      { x1: 112, y1: 382, cx: 235, cy: 446, x2: 362, y2: 492 },
      { x1: 688, y1: 382, cx: 565, cy: 446, x2: 438, y2: 492 }
    );

    world.stars.push(
      { id: world.nextId++, x: 245, y: 422, radius: 13, collected: false, respawnTimer: 0, pulsePhase: 0.2 },
      { id: world.nextId++, x: 555, y: 422, radius: 13, collected: false, respawnTimer: 0, pulsePhase: 1.5 }
    );

    world.bells.push(
      { id: world.nextId++, x: 400, y: 245, radius: 12, noteIndex: 11, hue: 46, hitFlash: 0 }
    );

    world.cups.push({
      id: world.nextId++,
      x: 400,
      y: 552,
      width: 128,
      hue: 48,
      caught: 0,
      flash: 0,
    });
    addFunnelCatch(world, 400, 552, 128, 48);
  }

  return world;
}

export function spawnTrackMarbleAt(
  world: MarbleRunWorld,
  x: number,
  y: number,
  count = 1
) {
  // Interactive touch: clicking directly near a seesaw flips it playfully!
  for (const sw of world.seesaws) {
    if (Math.hypot(x - sw.cx, y - sw.cy) <= sw.halfLen + 16) {
      const side = x >= sw.cx ? 1 : -1;
      sw.angularVel += side * 2.2;
      sw.hitFlash = 1;
      soundEngine.playSeesawTip();
    }
  }

  soundEngine.playChimeSpawn();
  for (let i = 0; i < count; i++) {
    if (world.marbles.length >= 42) {
      world.marbles.shift();
    }
    const spread = count === 1 ? 0 : (i - (count - 1) / 2) * 18;
    world.marbles.push({
      id: world.nextId++,
      x: Math.max(26, Math.min(ARENA_WIDTH - 26, x + (Math.random() - 0.5) * 8)),
      y: Math.max(22, Math.min(ARENA_HEIGHT - 40, y)),
      vx: spread + (Math.random() - 0.5) * 8,
      vy: 6 + Math.random() * 8,
      radius: 8,
      hue: (world.time * 40 + i * 42) % 360,
      trail: [],
      age: 0,
      chimesHit: 0,
      lastTapCooldown: 0,
    });
  }
}

export function addUserTrackRail(
  world: MarbleRunWorld,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): boolean {
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 22) return false;
  if (world.segments.length >= 110) {
    const idx = world.segments.findIndex((s) => s.isUser);
    if (idx >= 0) world.segments.splice(idx, 1);
  }
  const noteIndex = Math.max(0, Math.min(14, Math.round((1 - Math.min(1, len / 220)) * 14)));
  world.segments.push({
    id: world.nextId++,
    x1,
    y1,
    x2,
    y2,
    hue: (175 + noteIndex * 16) % 360,
    restitution: 0.04,
    noteIndex,
    hitFlash: 0,
    isUser: true,
  });
  soundEngine.playPlaceToy();
  return true;
}

export function addUserTrackSeesaw(
  world: MarbleRunWorld,
  x: number,
  y: number
) {
  if (world.seesaws.length >= 14) {
    const idx = world.seesaws.findIndex((s) => s.isUser);
    if (idx >= 0) world.seesaws.splice(idx, 1);
  }
  world.seesaws.push({
    id: world.nextId++,
    cx: Math.max(70, Math.min(ARENA_WIDTH - 70, x)),
    cy: Math.max(70, Math.min(ARENA_HEIGHT - 90, y)),
    halfLen: 64,
    angle: 0.16,
    angularVel: 0,
    maxAngle: 0.36,
    hue: 48,
    hitFlash: 0,
    isUser: true,
  });
  soundEngine.playPlaceToy();
}

export function addUserTrackBell(
  world: MarbleRunWorld,
  x: number,
  y: number
) {
  if (world.bells.length >= 16) {
    const idx = world.bells.findIndex((b) => b.isUser);
    if (idx >= 0) world.bells.splice(idx, 1);
  }
  const noteIndex = Math.max(0, Math.min(14, Math.floor((1 - y / ARENA_HEIGHT) * 14)));
  world.bells.push({
    id: world.nextId++,
    x: Math.max(40, Math.min(ARENA_WIDTH - 40, x)),
    y: Math.max(40, Math.min(ARENA_HEIGHT - 70, y)),
    radius: 14,
    noteIndex,
    hue: (170 + noteIndex * 18) % 360,
    hitFlash: 0,
    isUser: true,
  });
  soundEngine.playPlaceToy();
}

export function eraseTrackAt(world: MarbleRunWorld, x: number, y: number): boolean {
  const bellIdx = world.bells.findIndex((b) => Math.hypot(b.x - x, b.y - y) <= b.radius + 10);
  if (bellIdx >= 0) {
    world.bells.splice(bellIdx, 1);
    soundEngine.playPlaceToy();
    return true;
  }
  const seesawIdx = world.seesaws.findIndex((s) => Math.hypot(s.cx - x, s.cy - y) <= s.halfLen);
  if (seesawIdx >= 0) {
    world.seesaws.splice(seesawIdx, 1);
    soundEngine.playPlaceToy();
    return true;
  }
  const segIdx = world.segments.findIndex((seg) => {
    const dx = seg.x2 - seg.x1;
    const dy = seg.y2 - seg.y1;
    const l2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((x - seg.x1) * dx + (y - seg.y1) * dy) / l2));
    return Math.hypot(x - (seg.x1 + t * dx), y - (seg.y1 + t * dy)) <= 16;
  });
  if (segIdx >= 0) {
    world.segments.splice(segIdx, 1);
    soundEngine.playPlaceToy();
    return true;
  }
  return false;
}

function collideMarbleWithSegment(
  world: MarbleRunWorld,
  m: TrackMarble,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  restitution: number,
  noteIndex: number,
  hue: number,
  reducedMotion: boolean,
  subDt: number,
  onHit?: (tPos: number, impactSpeed: number) => void
): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((m.x - x1) * dx + (m.y - y1) * dy) / l2));
  const cx = x1 + t * dx;
  const cy = y1 + t * dy;
  const distX = m.x - cx;
  const distY = m.y - cy;
  const dist = Math.hypot(distX, distY);
  const minDist = m.radius + 4;

  if (dist < minDist && dist > 0.0001) {
    const nx = distX / dist;
    const ny = distY / dist;
    m.x = cx + nx * (minDist + 0.12);
    m.y = cy + ny * (minDist + 0.12);

    const vn = m.vx * nx + m.vy * ny;
    if (vn < 0) {
      const effRestitution = Math.abs(vn) > 95 ? restitution : 0;
      const vnAfter = -effRestitution * vn;

      // Decompose velocity along slope unit tangent (tx, ty) for authentic surface friction
      const segLen = Math.sqrt(l2);
      const tx = dx / segLen;
      const ty = dy / segLen;
      let vt = m.vx * tx + m.vy * ty;

      // Slope surface friction: Coulomb impact braking + time-normalized rolling surface drag
      const normalImpulse = Math.abs(vn);
      if (normalImpulse > 22) {
        const coulombFriction = Math.min(Math.abs(vt) * 0.26, (normalImpulse - 22) * 0.24);
        if (vt > 0) vt -= coulombFriction;
        else if (vt < 0) vt += coulombFriction;
      }

      // Time-normalized viscous surface friction naturally caps downhill marble speed
      const slopeSteepness = Math.abs(ty);
      const frictionRate = 0.85 + slopeSteepness * 1.15;
      vt *= Math.max(0.75, 1 - frictionRate * subDt);

      // Gentle static-unstick roll nudge only when nearly stalled on a sloped rail
      const downDir = ty >= 0 ? 1 : -1;
      if (Math.abs(vt) < 28 && slopeSteepness > 0.03) {
        vt += downDir * 52 * subDt;
      }

      m.vx = vt * tx + vnAfter * nx;
      m.vy = vt * ty + vnAfter * ny;

      onHit?.(t, Math.abs(vn));

      if (Math.abs(vn) > 62 && m.lastTapCooldown <= 0) {
        m.lastTapCooldown = 0.14;
        m.chimesHit += 1;
        world.chimesPlayed += 1;
        world.combo += 1;
        if (world.combo > world.maxCombo) world.maxCombo = world.combo;
        world.score += 25 + Math.min(50, world.combo * 2);

        const intensity = Math.min(0.85, 0.25 + Math.abs(vn) / 280);
        soundEngine.playTrackWoodTap(noteIndex, intensity);

        if (!reducedMotion && world.particles.length < 80) {
          for (let k = 0; k < 2; k++) {
            const a = Math.random() * Math.PI * 2;
            world.particles.push({
              x: cx,
              y: cy,
              vx: Math.cos(a) * 32,
              vy: Math.sin(a) * 32 - 10,
              radius: 1.5,
              color: `hsl(${hue}, 90%, 72%)`,
              alpha: 0.45,
              decay: 2.4,
            });
          }
        }
      }
      return true;
    }
  }
  return false;
}

export function stepMarbleRunWorld(
  world: MarbleRunWorld,
  dt: number,
  autoFlow: boolean,
  reducedMotion: boolean,
  zenMode: boolean
): { courseJustCleared?: boolean } {
  world.time += dt;
  let courseJustCleared = false;

  for (const seg of world.segments) {
    if (seg.hitFlash > 0) seg.hitFlash = Math.max(0, seg.hitFlash - dt * 2.8);
  }
  for (const s of world.seesaws) {
    if (s.hitFlash > 0) s.hitFlash = Math.max(0, s.hitFlash - dt * 2.8);
    // Gentle, hypnotic spring restore
    s.angularVel += -s.angle * 2.2 * dt;
    s.angularVel *= 1 - Math.min(0.9, dt * 3.2);
    const prevAngle = s.angle;
    s.angle += s.angularVel * dt;
    if (s.angle > s.maxAngle) {
      s.angle = s.maxAngle;
      if (Math.abs(s.angularVel) > 0.35 && Math.abs(prevAngle - s.maxAngle) > 0.01) {
        soundEngine.playSeesawTip();
      }
      s.angularVel *= -0.18;
    } else if (s.angle < -s.maxAngle) {
      s.angle = -s.maxAngle;
      if (Math.abs(s.angularVel) > 0.35 && Math.abs(prevAngle + s.maxAngle) > 0.01) {
        soundEngine.playSeesawTip();
      }
      s.angularVel *= -0.18;
    }
  }
  for (const bell of world.bells) {
    if (bell.hitFlash > 0) bell.hitFlash = Math.max(0, bell.hitFlash - dt * 2.5);
  }
  for (const star of world.stars) {
    star.pulsePhase += dt * 3;
    if (star.collected) {
      star.respawnTimer -= dt;
      if (star.respawnTimer <= 0) {
        star.collected = false;
      }
    }
  }
  for (const cup of world.cups) {
    if (cup.flash > 0) cup.flash = Math.max(0, cup.flash - dt * 2.5);
  }

  if (autoFlow && world.clearTimer <= 0) {
    for (const em of world.emitters) {
      em.timer -= dt;
      if (em.timer <= 0) {
        em.timer = em.interval;
        if (world.marbles.length < 32) {
          world.marbles.push({
            id: world.nextId++,
            x: em.x + (Math.random() - 0.5) * 4,
            y: em.y,
            vx: em.vx + (Math.random() - 0.5) * 4,
            vy: em.vy,
            radius: 8,
            hue: (em.hueBase + world.time * 20) % 360,
            trail: [],
            age: 0,
            chimesHit: 0,
            lastTapCooldown: 0,
          });
        }
      }
    }
  }

  const substeps = 4;
  const subDt = dt / substeps;
  for (let i = world.marbles.length - 1; i >= 0; i--) {
    const m = world.marbles[i];
    m.age += dt;
    if (m.lastTapCooldown > 0) m.lastTapCooldown = Math.max(0, m.lastTapCooldown - dt);
    if (m.age > 24) {
      world.marbles.splice(i, 1);
      continue;
    }

    let caughtByCup = false;
    for (let s = 0; s < substeps; s++) {
      m.vy += world.gravity * subDt;
      m.vx *= 1 - 0.04 * subDt;

      // Calm velocity cap so marbles roll gracefully and are easy to watch
      const spd = Math.hypot(m.vx, m.vy);
      if (spd > 245) {
        const scale = 245 / spd;
        m.vx *= scale;
        m.vy *= scale;
      }

      m.x += m.vx * subDt;
      m.y += m.vy * subDt;

      // Side bounds
      if (m.x < m.radius + 16) {
        m.x = m.radius + 16;
        m.vx = Math.abs(m.vx) * 0.48;
      } else if (m.x > ARENA_WIDTH - m.radius - 16) {
        m.x = ARENA_WIDTH - m.radius - 16;
        m.vx = -Math.abs(m.vx) * 0.48;
      }

      // Curved rails
      for (const seg of world.segments) {
        collideMarbleWithSegment(
          world,
          m,
          seg.x1,
          seg.y1,
          seg.x2,
          seg.y2,
          seg.restitution,
          seg.noteIndex,
          seg.hue,
          reducedMotion,
          subDt,
          () => {
            seg.hitFlash = 1;
          }
        );
      }

      // Tipping seesaw rockers
      for (const sw of world.seesaws) {
        const cos = Math.cos(sw.angle);
        const sin = Math.sin(sw.angle);
        const x1 = sw.cx - cos * sw.halfLen;
        const y1 = sw.cy - sin * sw.halfLen;
        const x2 = sw.cx + cos * sw.halfLen;
        const y2 = sw.cy + sin * sw.halfLen;
        collideMarbleWithSegment(
          world,
          m,
          x1,
          y1,
          x2,
          y2,
          0.06,
          8,
          sw.hue,
          reducedMotion,
          subDt,
          (tPos, impactSpeed) => {
            sw.hitFlash = 1;
            const torque = (tPos - 0.5) * 2;
            sw.angularVel += torque * (0.95 + impactSpeed * 0.003);
          }
        );
      }

      // Tuned bells (soft sideways/upward chime glance)
      for (const bell of world.bells) {
        const dx = m.x - bell.x;
        const dy = m.y - bell.y;
        const dist = Math.hypot(dx, dy);
        const minDist = m.radius + bell.radius;
        if (dist < minDist && dist > 0.0001) {
          const rawNx = dx / dist;
          const ny = dy / dist;
          const nx = Math.abs(rawNx) < 0.25 ? (m.x >= bell.x ? 0.35 : -0.35) : rawNx;
          const nLen = Math.hypot(nx, ny) || 1;
          const unx = nx / nLen;
          const uny = ny / nLen;
          m.x = bell.x + unx * (minDist + 0.8);
          m.y = bell.y + uny * (minDist + 0.8);
          const vn = m.vx * unx + m.vy * uny;
          if (vn < 0) {
            m.vx -= 1.15 * vn * unx;
            m.vy -= 1.15 * vn * uny;
            if (uny < -0.5) {
              m.vx += (unx >= 0 ? 1 : -1) * 42;
            }
          }
          if (bell.hitFlash < 0.5) {
            bell.hitFlash = 1;
            world.chimesPlayed += 1;
            world.combo += 1;
            if (world.combo > world.maxCombo) world.maxCombo = world.combo;
            world.score += 50 + Math.min(80, world.combo * 2);
            soundEngine.playTrackWoodTap(bell.noteIndex, 0.8);
          }
        }
      }

      // Collectible Star Gates
      for (const star of world.stars) {
        if (!star.collected && Math.hypot(m.x - star.x, m.y - star.y) <= m.radius + star.radius) {
          star.collected = true;
          star.respawnTimer = 4.0;
          world.score += 150;
          world.chimesPlayed += 1;
          world.combo += 1;
          if (world.combo > world.maxCombo) world.maxCombo = world.combo;
          soundEngine.playPegHit(world.combo + 4, true);

          if (!reducedMotion && world.particles.length < 80) {
            for (let k = 0; k < 5; k++) {
              const a = (k / 5) * Math.PI * 2;
              world.particles.push({
                x: star.x,
                y: star.y,
                vx: Math.cos(a) * 48,
                vy: Math.sin(a) * 48,
                radius: 2,
                color: '#FDE047',
                alpha: 0.85,
                decay: 2.2,
              });
            }
          }
          if (!zenMode && world.floatingTexts.length < 6) {
            world.floatingTexts.push({
              x: star.x,
              y: star.y - 16,
              vy: -24,
              text: '+150',
              color: '#FDE047',
              alpha: 0.9,
              scale: 0.95,
            });
          }
        }
      }

      // Gentle Goal Cup mouth funneling so rim-grazing marbles settle cleanly in
      for (const cup of world.cups) {
        if (
          m.vy > 0 &&
          m.y >= cup.y - 42 &&
          m.y < cup.y &&
          Math.abs(m.x - cup.x) <= cup.width * 0.56
        ) {
          m.vx += (cup.x - m.x) * 3.8 * subDt;
        }
      }

      // Goal Cups detection
      for (const cup of world.cups) {
        if (
          Math.abs(m.x - cup.x) <= cup.width * 0.48 &&
          m.y >= cup.y - 16 &&
          m.y <= cup.y + 24
        ) {
          cup.caught += 1;
          cup.flash = 1;
          world.goalCaught += 1;
          world.combo += 1;
          if (world.combo > world.maxCombo) world.maxCombo = world.combo;
          world.score += 120;
          soundEngine.playBucketCatch();

          if (!reducedMotion && world.particles.length < 80) {
            for (let k = 0; k < 4; k++) {
              const a = -Math.PI * Math.random();
              world.particles.push({
                x: m.x,
                y: cup.y - 10,
                vx: Math.cos(a) * 52,
                vy: Math.sin(a) * 52,
                radius: 2,
                color: `hsl(${cup.hue}, 90%, 72%)`,
                alpha: 0.75,
                decay: 2.2,
              });
            }
          }
          if (!zenMode && world.floatingTexts.length < 6) {
            world.floatingTexts.push({
              x: cup.x,
              y: cup.y - 24,
              vy: -24,
              text: '+120',
              color: '#6EE7B7',
              alpha: 0.85,
              scale: 0.9,
            });
          }

          caughtByCup = true;
          break;
        }
      }
      if (caughtByCup) break;
    }

    if (caughtByCup) {
      world.marbles.splice(i, 1);
      continue;
    }

    m.trail.push({ x: m.x, y: m.y });
    if (m.trail.length > 9) m.trail.shift();

    if (m.y > ARENA_HEIGHT + 24) {
      world.marbles.splice(i, 1);
    }
  }

  // Gentle marble-to-marble clink & separation
  for (let i = 0; i < world.marbles.length; i++) {
    const a = world.marbles[i];
    for (let j = i + 1; j < world.marbles.length; j++) {
      const b = world.marbles[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const minDist = a.radius + b.radius;
      const d2 = dx * dx + dy * dy;
      if (d2 < minDist * minDist && d2 > 0.001) {
        const d = Math.sqrt(d2);
        const nx = dx / d;
        const ny = dy / d;
        const overlap = (minDist - d) * 0.5;
        a.x -= nx * overlap;
        a.y -= ny * overlap;
        b.x += nx * overlap;
        b.y += ny * overlap;

        const rvx = b.vx - a.vx;
        const rvy = b.vy - a.vy;
        const vn = rvx * nx + rvy * ny;
        if (vn < 0) {
          const jImp = -0.62 * vn;
          a.vx -= jImp * nx;
          a.vy -= jImp * ny;
          b.vx += jImp * nx;
          b.vy += jImp * ny;
          if (Math.abs(vn) > 65 && a.lastTapCooldown <= 0) {
            a.lastTapCooldown = 0.16;
            b.lastTapCooldown = 0.16;
            soundEngine.playTrackWoodTap(11, Math.min(0.4, Math.abs(vn) / 400));
          }
        }
      }
    }
  }

  // Course completion -> calm transition to next course!
  if (world.goalCaught >= world.goalTarget && world.clearTimer <= 0) {
    world.clearTimer = 1.65;
    courseJustCleared = true;
    soundEngine.playStageClear();
    world.score += 400;
    if (!zenMode) {
      world.floatingTexts.push({
        x: ARENA_WIDTH / 2,
        y: ARENA_HEIGHT / 2 - 20,
        vy: -18,
        text: `${TRACK_PRESET_NAMES[world.preset]} Clear! +400`,
        color: '#6EE7B7',
        alpha: 0.95,
        scale: 1.0,
      });
    }
  }

  if (world.clearTimer > 0) {
    world.clearTimer -= dt;
    if (world.clearTimer <= 0) {
      const nextPreset =
        PRESET_ORDER[(PRESET_ORDER.indexOf(world.preset) + 1) % PRESET_ORDER.length];
      const next = createMarbleRunWorld(
        nextPreset,
        world.score,
        world.maxCombo,
        world.coursesCleared + 1
      );
      Object.assign(world, next);
      return { courseJustCleared };
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
    ft.alpha -= dt * 1.4;
    if (ft.alpha <= 0) world.floatingTexts.splice(i, 1);
  }

  return { courseJustCleared };
}

export function renderMarbleRunWorld(
  ctx: CanvasRenderingContext2D,
  world: MarbleRunWorld,
  zenMode: boolean
) {
  const bg = ctx.createRadialGradient(
    ARENA_WIDTH * 0.5,
    ARENA_HEIGHT * 0.35,
    30,
    ARENA_WIDTH * 0.5,
    ARENA_HEIGHT * 0.5,
    ARENA_WIDTH * 0.72
  );
  bg.addColorStop(0, '#111C2E');
  bg.addColorStop(1, '#070C15');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

  // Subtle course goal progress pill on top center when not in zenMode
  if (!zenMode) {
    const pct = Math.min(1, world.goalCaught / Math.max(1, world.goalTarget));
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(ARENA_WIDTH / 2 - 96, 12, 192, 24, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(52, 211, 153, 0.25)';
    ctx.beginPath();
    ctx.roundRect(ARENA_WIDTH / 2 - 94, 14, Math.max(8, 188 * pct), 20, 10);
    ctx.fill();

    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#D1FAE5';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      `Goal Cup ${Math.min(world.goalCaught, world.goalTarget)}/${world.goalTarget}`,
      ARENA_WIDTH / 2,
      24.5
    );
    ctx.restore();
  }

  // Subtle dashed bridge hint arcs (faint curiosity cue, fades out once player builds)
  const userBuiltCount =
    world.segments.filter((s) => s.isUser).length +
    world.seesaws.filter((s) => s.isUser).length;
  if (world.hintArcs.length > 0 && userBuiltCount < 2) {
    ctx.save();
    ctx.setLineDash([6, 7]);
    ctx.lineDashOffset = -world.time * 18;
    ctx.strokeStyle =
      userBuiltCount === 0
        ? 'rgba(56, 189, 248, 0.26)'
        : 'rgba(56, 189, 248, 0.14)';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    for (const h of world.hintArcs) {
      ctx.beginPath();
      ctx.moveTo(h.x1, h.y1);
      ctx.quadraticCurveTo(h.cx, h.cy, h.x2, h.y2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Collectible Star Gates
  for (const star of world.stars) {
    if (star.collected) continue;
    const pulse = 1 + Math.sin(star.pulsePhase) * 0.1;
    ctx.save();
    ctx.translate(star.x, star.y);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = 'rgba(253, 224, 71, 0.16)';
    ctx.strokeStyle = '#FDE047';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let k = 0; k < 10; k++) {
      const r = k % 2 === 0 ? star.radius : star.radius * 0.45;
      const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
      if (k === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Emitters
  for (const em of world.emitters) {
    ctx.save();
    ctx.fillStyle = `hsla(${em.hueBase}, 86%, 68%, 0.18)`;
    ctx.beginPath();
    ctx.arc(em.x, em.y, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `hsl(${em.hueBase}, 90%, 74%)`;
    ctx.beginPath();
    ctx.arc(em.x, em.y, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Goal Catcher Cups
  for (const cup of world.cups) {
    const half = cup.width * 0.5;
    ctx.save();
    ctx.fillStyle = `hsla(${cup.hue}, 82%, 52%, ${0.18 + cup.flash * 0.26})`;
    ctx.strokeStyle = `hsl(${cup.hue}, 88%, ${64 + cup.flash * 20}%)`;
    ctx.lineWidth = 2.6;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(cup.x - half, cup.y - 14);
    ctx.lineTo(cup.x - half + 10, cup.y + 18);
    ctx.lineTo(cup.x + half - 10, cup.y + 18);
    ctx.lineTo(cup.x + half, cup.y - 14);
    ctx.stroke();
    ctx.fill();

    if (!zenMode) {
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#E2E8F0';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${cup.caught}`, cup.x, cup.y + 4);
    }
    ctx.restore();
  }

  // Track rails
  ctx.save();
  ctx.lineCap = 'round';
  for (const seg of world.segments) {
    const light = 58 + seg.hitFlash * 24;
    ctx.strokeStyle = `hsl(${seg.hue}, 82%, ${light}%)`;
    ctx.lineWidth = 7 + seg.hitFlash * 1.5;
    ctx.beginPath();
    ctx.moveTo(seg.x1, seg.y1);
    ctx.lineTo(seg.x2, seg.y2);
    ctx.stroke();

    ctx.strokeStyle = seg.hitFlash > 0.2 ? '#FFFFFF' : 'rgba(248, 250, 252, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(seg.x1, seg.y1);
    ctx.lineTo(seg.x2, seg.y2);
    ctx.stroke();
  }
  ctx.restore();

  // Tipping seesaw rockers
  for (const sw of world.seesaws) {
    const cos = Math.cos(sw.angle);
    const sin = Math.sin(sw.angle);
    const x1 = sw.cx - cos * sw.halfLen;
    const y1 = sw.cy - sin * sw.halfLen;
    const x2 = sw.cx + cos * sw.halfLen;
    const y2 = sw.cy + sin * sw.halfLen;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = `hsl(${sw.hue}, 90%, ${62 + sw.hitFlash * 20}%)`;
    ctx.lineWidth = 8.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.arc(sw.cx, sw.cy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Tuned bells
  for (const bell of world.bells) {
    ctx.save();
    const color = `hsl(${bell.hue}, 90%, ${66 + bell.hitFlash * 20}%)`;
    ctx.fillStyle = `hsla(${bell.hue}, 84%, 56%, ${0.22 + bell.hitFlash * 0.3})`;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(bell.x, bell.y, bell.radius + bell.hitFlash * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.arc(bell.x, bell.y, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Marbles with soft tapered ribbon trails
  for (const m of world.marbles) {
    if (m.trail.length > 1) {
      for (let t = 1; t < m.trail.length; t++) {
        const p0 = m.trail[t - 1];
        const p1 = m.trail[t];
        const ratio = t / m.trail.length;
        ctx.strokeStyle = `hsla(${m.hue}, 90%, 70%, ${ratio * 0.32})`;
        ctx.lineWidth = m.radius * 1.05 * ratio;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
    }

    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `hsl(${m.hue}, 92%, 68%)`;
    ctx.lineWidth = 2.4;
    ctx.stroke();
    ctx.restore();
  }

  if (world.drawDraft) {
    const d = world.drawDraft;
    ctx.save();
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(d.x1, d.y1);
    ctx.lineTo(d.x2, d.y2);
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
    for (const ft of world.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = '700 12px "JetBrains Mono", monospace';
      ctx.fillStyle = ft.color;
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }
}
