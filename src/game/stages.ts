import { Peg, PegKind, SandboxPreset, StageConfig } from './types';

export const ARENA_WIDTH = 800;
export const ARENA_HEIGHT = 620;
export const LAUNCHER_X = ARENA_WIDTH / 2;
export const LAUNCHER_Y = 38;
export const BUCKET_Y = 588;

let nextPegId = 1;

export function makePeg(
  x: number,
  y: number,
  kind: PegKind,
  extra?: Partial<Peg>
): Peg {
  const radiusByKind: Record<PegKind, number> = {
    normal: 11,
    target: 14,
    bumper: 23,
    splitter: 15,
    spring: 17,
    portal: 19,
    spinner: 10,
    bomb: 18,
  };

  return {
    id: `peg-${nextPegId++}`,
    x,
    y,
    radius: radiusByKind[kind],
    kind,
    hit: false,
    hitTime: 0,
    hitFlash: 0,
    angle: extra?.angle ?? 0,
    angularVelocity: extra?.angularVelocity ?? (kind === 'spinner' ? 1.8 : 0),
    armLength: extra?.armLength ?? (kind === 'spinner' ? 46 : 0),
    portalGroup: extra?.portalGroup,
    isUserPlaced: extra?.isUserPlaced ?? false,
  };
}

export const STAGES: StageConfig[] = [
  {
    id: 'sunlit-grove',
    index: 0,
    name: 'Sunlit Grove',
    subtitle: 'Clear all amber pegs · Catch the gliding bucket for bonus marbles',
    accentColor: '#F59E0B',
    gravity: 540,
    windX: 0,
    startingBalls: 10,
    bucketSpeed: 135,
    buildPegs: () => {
      const pegs: Peg[] = [];
      // Gentle arched canopy
      const rows = [
        { y: 155, cols: 7, span: 440, offset: 0 },
        { y: 215, cols: 8, span: 500, offset: 0 },
        { y: 275, cols: 7, span: 440, offset: 0 },
        { y: 335, cols: 8, span: 500, offset: 0 },
        { y: 395, cols: 7, span: 440, offset: 0 },
        { y: 455, cols: 6, span: 380, offset: 0 },
      ];

      rows.forEach((row, rIdx) => {
        for (let c = 0; c < row.cols; c++) {
          const t = row.cols === 1 ? 0.5 : c / (row.cols - 1);
          const x = ARENA_WIDTH / 2 - row.span / 2 + t * row.span + row.offset;
          const arcY = row.y - Math.sin(t * Math.PI) * 18;
          const isTarget =
            (rIdx === 1 && (c === 2 || c === 5)) ||
            (rIdx === 2 && (c === 1 || c === 3 || c === 5)) ||
            (rIdx === 3 && (c === 2 || c === 5)) ||
            (rIdx === 4 && (c === 1 || c === 3 || c === 5));
          pegs.push(makePeg(x, arcY, isTarget ? 'target' : 'normal'));
        }
      });

      // Two cheerful bumpers & one center splitter
      pegs.push(makePeg(225, 490, 'bumper'));
      pegs.push(makePeg(575, 490, 'bumper'));
      pegs.push(makePeg(400, 232, 'splitter'));

      return pegs;
    },
  },
  {
    id: 'windmill-valley',
    index: 1,
    name: 'Windmill Valley',
    subtitle: 'Spinning paddles deflect your shot · Time your release for combos',
    accentColor: '#10B981',
    gravity: 540,
    windX: 0,
    startingBalls: 10,
    bucketSpeed: 160,
    buildPegs: () => {
      const pegs: Peg[] = [];

      // Three rotating windmills
      pegs.push(makePeg(240, 250, 'spinner', { angularVelocity: 1.9, armLength: 48 }));
      pegs.push(makePeg(560, 250, 'spinner', { angularVelocity: -1.9, armLength: 48 }));
      pegs.push(makePeg(400, 385, 'spinner', { angularVelocity: 2.3, armLength: 52 }));

      // Target clusters tucked behind and around windmills
      const targetCoords = [
        [155, 195],
        [240, 165],
        [325, 195],
        [475, 195],
        [560, 165],
        [645, 195],
        [170, 360],
        [630, 360],
        [315, 465],
        [485, 465],
        [400, 275],
      ];
      targetCoords.forEach(([x, y]) => pegs.push(makePeg(x, y, 'target')));

      // Supporting normal pegs
      const normalCoords = [
        [120, 275],
        [120, 325],
        [680, 275],
        [680, 325],
        [235, 435],
        [565, 435],
        [400, 175],
        [205, 495],
        [595, 495],
      ];
      normalCoords.forEach(([x, y]) => pegs.push(makePeg(x, y, 'normal')));

      // Springs at lower flanks to send marbles back up into the windmills
      pegs.push(makePeg(130, 480, 'spring'));
      pegs.push(makePeg(670, 480, 'spring'));

      return pegs;
    },
  },
  {
    id: 'crystal-cavern',
    index: 2,
    name: 'Crystal Cavern',
    subtitle: 'Twin portals warp marbles across the cave · Hit prisms to multiply',
    accentColor: '#38BDF8',
    gravity: 525,
    windX: 0,
    startingBalls: 11,
    bucketSpeed: 175,
    buildPegs: () => {
      const pegs: Peg[] = [];

      // Portal Pair 1 (left-top to right-mid)
      pegs.push(makePeg(145, 220, 'portal', { portalGroup: 1 }));
      pegs.push(makePeg(610, 340, 'portal', { portalGroup: 1 }));

      // Portal Pair 2 (right-top to left-mid)
      pegs.push(makePeg(655, 220, 'portal', { portalGroup: 2 }));
      pegs.push(makePeg(190, 340, 'portal', { portalGroup: 2 }));

      // Central diamond prism of splitters & targets
      pegs.push(makePeg(400, 185, 'splitter'));
      pegs.push(makePeg(325, 260, 'target'));
      pegs.push(makePeg(475, 260, 'target'));
      pegs.push(makePeg(400, 320, 'bumper'));
      pegs.push(makePeg(310, 385, 'target'));
      pegs.push(makePeg(490, 385, 'target'));
      pegs.push(makePeg(400, 445, 'splitter'));

      // Outer crystal rings
      const crystalRing = [
        [235, 165, 'normal'],
        [565, 165, 'normal'],
        [120, 300, 'target'],
        [680, 300, 'target'],
        [140, 425, 'target'],
        [660, 425, 'target'],
        [240, 485, 'target'],
        [560, 485, 'target'],
        [330, 505, 'normal'],
        [470, 505, 'normal'],
        [265, 290, 'normal'],
        [535, 290, 'normal'],
      ] as const;

      crystalRing.forEach(([x, y, kind]) => pegs.push(makePeg(x, y, kind)));

      return pegs;
    },
  },
  {
    id: 'bumper-arcade',
    index: 3,
    name: 'Bumper Arcade',
    subtitle: 'Pinball bumpers & spring pads keep marbles flying for massive chains',
    accentColor: '#FB7185',
    gravity: 560,
    windX: 0,
    startingBalls: 11,
    bucketSpeed: 190,
    buildPegs: () => {
      const pegs: Peg[] = [];

      // Bumper triangle
      pegs.push(makePeg(400, 210, 'bumper'));
      pegs.push(makePeg(275, 315, 'bumper'));
      pegs.push(makePeg(525, 315, 'bumper'));
      pegs.push(makePeg(400, 420, 'bumper'));

      // Springs in lower corners
      pegs.push(makePeg(115, 470, 'spring'));
      pegs.push(makePeg(685, 470, 'spring'));
      pegs.push(makePeg(400, 505, 'spring'));

      // Splitters on sides
      pegs.push(makePeg(165, 245, 'splitter'));
      pegs.push(makePeg(635, 245, 'splitter'));

      // Target pegs tucked in bumper pockets
      const targets = [
        [220, 175],
        [315, 155],
        [485, 155],
        [580, 175],
        [180, 350],
        [620, 350],
        [335, 275],
        [465, 275],
        [270, 435],
        [530, 435],
        [200, 485],
        [600, 485],
      ];
      targets.forEach(([x, y]) => pegs.push(makePeg(x, y, 'target')));

      // Normal filler pegs
      const normals = [
        [115, 305],
        [685, 305],
        [400, 315],
        [330, 375],
        [470, 375],
      ];
      normals.forEach(([x, y]) => pegs.push(makePeg(x, y, 'normal')));

      return pegs;
    },
  },
  {
    id: 'zero-g-drift',
    index: 4,
    name: 'Zero-G Drift',
    subtitle: 'Low gravity with gentle solar breeze · Watch marbles curve across orbit',
    accentColor: '#A78BFA',
    gravity: 310,
    windX: 28,
    startingBalls: 12,
    bucketSpeed: 155,
    buildPegs: () => {
      const pegs: Peg[] = [];

      // Concentric orbital ring around center spinner
      pegs.push(makePeg(400, 320, 'spinner', { angularVelocity: 1.5, armLength: 56 }));

      const innerCount = 8;
      for (let i = 0; i < innerCount; i++) {
        const a = (i / innerCount) * Math.PI * 2;
        const x = 400 + Math.cos(a) * 115;
        const y = 320 + Math.sin(a) * 105;
        pegs.push(makePeg(x, y, i % 2 === 0 ? 'target' : 'normal'));
      }

      const outerCount = 12;
      for (let i = 0; i < outerCount; i++) {
        const a = (i / outerCount) * Math.PI * 2 + 0.15;
        const x = 400 + Math.cos(a) * 205;
        const y = 320 + Math.sin(a) * 170;
        if (i === 2 || i === 8) {
          pegs.push(makePeg(x, y, 'splitter'));
        } else if (i === 5 || i === 11) {
          pegs.push(makePeg(x, y, 'bumper'));
        } else {
          pegs.push(makePeg(x, y, i % 2 === 1 ? 'target' : 'normal'));
        }
      }

      // Flanking portals
      pegs.push(makePeg(110, 200, 'portal', { portalGroup: 1 }));
      pegs.push(makePeg(690, 440, 'portal', { portalGroup: 1 }));

      return pegs;
    },
  },
];

export function buildSandboxStarterPegs(): Peg[] {
  return buildSandboxPreset('STARTER');
}

export function buildSandboxPreset(preset: SandboxPreset): Peg[] {
  const pegs: Peg[] = [];

  if (preset === 'EXTREME') {
    pegs.push(makePeg(400, 155, 'splitter'));
    pegs.push(makePeg(265, 215, 'splitter'));
    pegs.push(makePeg(535, 215, 'splitter'));
    pegs.push(makePeg(155, 195, 'portal', { portalGroup: 1 }));
    pegs.push(makePeg(645, 455, 'portal', { portalGroup: 1 }));
    pegs.push(makePeg(645, 195, 'portal', { portalGroup: 2 }));
    pegs.push(makePeg(155, 455, 'portal', { portalGroup: 2 }));
    pegs.push(makePeg(250, 310, 'spinner', { angularVelocity: 2.8, armLength: 54 }));
    pegs.push(makePeg(550, 310, 'spinner', { angularVelocity: -2.8, armLength: 54 }));
    pegs.push(makePeg(400, 290, 'bomb'));
    pegs.push(makePeg(325, 385, 'bomb'));
    pegs.push(makePeg(475, 385, 'bomb'));
    pegs.push(makePeg(400, 445, 'bumper'));
    pegs.push(makePeg(210, 485, 'spring'));
    pegs.push(makePeg(590, 485, 'spring'));
    pegs.push(makePeg(125, 360, 'bumper'));
    pegs.push(makePeg(675, 360, 'bumper'));
    return pegs;
  }

  if (preset === 'PINBALL') {
    pegs.push(makePeg(400, 185, 'bumper'));
    pegs.push(makePeg(260, 260, 'bumper'));
    pegs.push(makePeg(540, 260, 'bumper'));
    pegs.push(makePeg(330, 345, 'bomb'));
    pegs.push(makePeg(470, 345, 'bomb'));
    pegs.push(makePeg(150, 445, 'spring'));
    pegs.push(makePeg(400, 470, 'spring'));
    pegs.push(makePeg(650, 445, 'spring'));
    pegs.push(makePeg(210, 175, 'splitter'));
    pegs.push(makePeg(590, 175, 'splitter'));
    return pegs;
  }

  if (preset === 'PORTALS') {
    pegs.push(makePeg(145, 200, 'portal', { portalGroup: 1 }));
    pegs.push(makePeg(655, 425, 'portal', { portalGroup: 1 }));
    pegs.push(makePeg(655, 200, 'portal', { portalGroup: 2 }));
    pegs.push(makePeg(145, 425, 'portal', { portalGroup: 2 }));
    pegs.push(makePeg(400, 220, 'splitter'));
    pegs.push(makePeg(400, 330, 'splitter'));
    pegs.push(makePeg(280, 300, 'bumper'));
    pegs.push(makePeg(520, 300, 'bumper'));
    pegs.push(makePeg(400, 455, 'spring'));
    return pegs;
  }

  if (preset === 'WINDMILLS') {
    pegs.push(makePeg(245, 225, 'spinner', { angularVelocity: 2.2, armLength: 50 }));
    pegs.push(makePeg(555, 225, 'spinner', { angularVelocity: -2.2, armLength: 50 }));
    pegs.push(makePeg(400, 335, 'spinner', { angularVelocity: 2.5, armLength: 56 }));
    pegs.push(makePeg(245, 435, 'spinner', { angularVelocity: -2.0, armLength: 48 }));
    pegs.push(makePeg(555, 435, 'spinner', { angularVelocity: 2.0, armLength: 48 }));
    pegs.push(makePeg(400, 185, 'splitter'));
    pegs.push(makePeg(125, 465, 'spring'));
    pegs.push(makePeg(675, 465, 'spring'));
    return pegs;
  }

  if (preset === 'GALAXY_FUNNEL') {
    for (let i = 0; i < 4; i++) {
      pegs.push(makePeg(170 + i * 52, 185 + i * 52, 'spring'));
      pegs.push(makePeg(630 - i * 52, 185 + i * 52, 'spring'));
    }
    pegs.push(makePeg(400, 210, 'splitter'));
    pegs.push(makePeg(400, 390, 'bomb'));
    pegs.push(makePeg(400, 480, 'bumper'));
    return pegs;
  }

  if (preset === 'PORTAL_PINBALL') {
    pegs.push(makePeg(145, 195, 'portal', { portalGroup: 1 }));
    pegs.push(makePeg(655, 430, 'portal', { portalGroup: 1 }));
    pegs.push(makePeg(655, 195, 'portal', { portalGroup: 2 }));
    pegs.push(makePeg(145, 430, 'portal', { portalGroup: 2 }));
    pegs.push(makePeg(300, 275, 'spinner', { angularVelocity: 2.4, armLength: 48 }));
    pegs.push(makePeg(500, 275, 'spinner', { angularVelocity: -2.4, armLength: 48 }));
    pegs.push(makePeg(400, 200, 'splitter'));
    pegs.push(makePeg(400, 385, 'bumper'));
    pegs.push(makePeg(260, 455, 'bumper'));
    pegs.push(makePeg(540, 455, 'bumper'));
    return pegs;
  }

  if (preset === 'CASCADE_TOWER') {
    for (let i = 0; i < 4; i++) {
      const y = 165 + i * 75;
      pegs.push(makePeg(210 + i * 28, y, 'target'));
      pegs.push(makePeg(590 - i * 28, y, 'target'));
    }
    pegs.push(makePeg(400, 170, 'splitter'));
    pegs.push(makePeg(310, 260, 'spinner', { angularVelocity: 2.1, armLength: 46 }));
    pegs.push(makePeg(490, 260, 'spinner', { angularVelocity: -2.1, armLength: 46 }));
    pegs.push(makePeg(400, 355, 'bumper'));
    pegs.push(makePeg(225, 465, 'spring'));
    pegs.push(makePeg(575, 465, 'spring'));
    return pegs;
  }

  if (preset === 'PINBALL_GALAXY') {
    pegs.push(makePeg(150, 180, 'portal', { portalGroup: 1 }));
    pegs.push(makePeg(650, 445, 'portal', { portalGroup: 1 }));
    pegs.push(makePeg(650, 180, 'portal', { portalGroup: 2 }));
    pegs.push(makePeg(150, 445, 'portal', { portalGroup: 2 }));
    pegs.push(makePeg(400, 195, 'splitter'));
    pegs.push(makePeg(285, 290, 'bumper'));
    pegs.push(makePeg(515, 290, 'bumper'));
    pegs.push(makePeg(400, 360, 'spinner', { angularVelocity: 2.4, armLength: 52 }));
    pegs.push(makePeg(240, 460, 'spring'));
    pegs.push(makePeg(400, 490, 'spring'));
    pegs.push(makePeg(560, 460, 'spring'));
    pegs.push(makePeg(325, 215, 'target'));
    pegs.push(makePeg(475, 215, 'target'));
    return pegs;
  }

  pegs.push(makePeg(400, 210, 'splitter'));
  pegs.push(makePeg(265, 285, 'bumper'));
  pegs.push(makePeg(535, 285, 'bumper'));
  pegs.push(makePeg(400, 355, 'spinner', { angularVelocity: 1.8, armLength: 48 }));
  pegs.push(makePeg(165, 420, 'spring'));
  pegs.push(makePeg(635, 420, 'spring'));
  pegs.push(makePeg(170, 210, 'portal', { portalGroup: 1 }));
  pegs.push(makePeg(630, 210, 'portal', { portalGroup: 1 }));
  pegs.push(makePeg(320, 460, 'target'));
  pegs.push(makePeg(480, 460, 'target'));
  pegs.push(makePeg(225, 355, 'normal'));
  pegs.push(makePeg(575, 355, 'normal'));
  return pegs;
}
