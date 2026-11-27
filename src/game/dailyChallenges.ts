import { DailyChallengeState, HudSnapshot, PlayMode } from './types';

export type ChallengeMetricKind =
  | 'best_score'
  | 'cumulative_action'
  | 'max_tier';

export interface DailyChallengeDef {
  id: string;
  mode: PlayMode;
  title: string;
  desc: string;
  target: number;
  reward: number;
  metric: ChallengeMetricKind;
}

export const ALL_CLEAR_BONUS_SHARDS = 75;

const CHALLENGE_POOL: DailyChallengeDef[] = [
  {
    id: 'swarm_score_5000',
    mode: 'SWARM',
    title: 'Score 5,000 in Swarm Breaker',
    desc: 'Smash numbered blocks in a single Swarm run to reach 5,000 points.',
    target: 5000,
    reward: 60,
    metric: 'best_score',
  },
  {
    id: 'bubble_pop_100',
    mode: 'BUBBLE',
    title: 'Pop 100 Bubbles',
    desc: 'Tap or swipe 100 silicone bubbles across any Pop Sheet mode.',
    target: 100,
    reward: 50,
    metric: 'cumulative_action',
  },
  {
    id: 'rings_escape_10',
    mode: 'RINGS',
    title: 'Escape 10 Rotating Rings',
    desc: 'Slip marbles through 10 spinning ring gaps in Ring Escape.',
    target: 10,
    reward: 55,
    metric: 'cumulative_action',
  },
  {
    id: 'plinko_jackpots_3',
    mode: 'PLINKO',
    title: 'Land 3 Plinko Jackpots',
    desc: 'Drop marbles into outer 50x, 100x, or 200x jackpot slots 3 times.',
    target: 3,
    reward: 65,
    metric: 'cumulative_action',
  },
  {
    id: 'bloom_pop_60',
    mode: 'BLOOM',
    title: 'Pop 60 Orbs in Bloom Chain',
    desc: 'Chain expanding light rings to pop 60 drifting orbs today.',
    target: 60,
    reward: 50,
    metric: 'cumulative_action',
  },
  {
    id: 'slice_prisms_35',
    mode: 'SLICE',
    title: 'Slice 35 Neon Prisms',
    desc: 'Cut through 35 flying prisms with your plasma katana.',
    target: 35,
    reward: 55,
    metric: 'cumulative_action',
  },
  {
    id: 'domino_topple_120',
    mode: 'DOMINO',
    title: 'Topple 120 Dominoes',
    desc: 'Trigger satisfying domino cascades totaling 120 fallen tiles.',
    target: 120,
    reward: 50,
    metric: 'cumulative_action',
  },
  {
    id: 'pulse_perfect_20',
    mode: 'PULSE',
    title: 'Hit 20 Perfect Beats',
    desc: 'Time 20 hits right on the golden ring in Beat Pulse.',
    target: 20,
    reward: 60,
    metric: 'cumulative_action',
  },
  {
    id: 'merge_tier_5',
    mode: 'MERGE',
    title: 'Reach Tier 5 in Orb Merge',
    desc: 'Fuse matching orbs up to Tier 5 (Nova) inside the bowl.',
    target: 5,
    reward: 65,
    metric: 'max_tier',
  },
  {
    id: 'laser_clear_2',
    mode: 'LASER',
    title: 'Clear 2 Prism Laser Stages',
    desc: 'Align mirrors and charge all crystals on 2 Prism Laser stages.',
    target: 2,
    reward: 70,
    metric: 'cumulative_action',
  },
  {
    id: 'orbit_score_3500',
    mode: 'ORBIT',
    title: 'Score 3,500 in Gravity Orbit',
    desc: 'Swing comets through gravity wells to collect 3,500 points.',
    target: 3500,
    reward: 55,
    metric: 'best_score',
  },
  {
    id: 'hex_moves_18',
    mode: 'HEX',
    title: 'Send 18 Hex Ripples',
    desc: 'Tap 18 tiles in Hex Ripple to weave musical color waves.',
    target: 18,
    reward: 45,
    metric: 'cumulative_action',
  },
  {
    id: 'vortex_score_3000',
    mode: 'VORTEX',
    title: 'Score 3,000 in Vortex Paint',
    desc: 'Pull stardust sparks into energy wells to hit 3,000 points.',
    target: 3000,
    reward: 55,
    metric: 'best_score',
  },
  {
    id: 'sandbox_score_4000',
    mode: 'SANDBOX',
    title: 'Score 4,000 in Avalanche Lab',
    desc: 'Build a toybox contraption and score 4,000 points in one board.',
    target: 4000,
    reward: 55,
    metric: 'best_score',
  },
  {
    id: 'plinko_score_4500',
    mode: 'PLINKO',
    title: 'Score 4,500 in Zen Plinko',
    desc: 'Drop marbles through bumpers and portals for 4,500 points.',
    target: 4500,
    reward: 60,
    metric: 'best_score',
  },
  {
    id: 'slice_score_3000',
    mode: 'SLICE',
    title: 'Score 3,000 in Blade Slice',
    desc: 'Chain multi-prism katana slashes to score 3,000 in one run.',
    target: 3000,
    reward: 60,
    metric: 'best_score',
  },
  {
    id: 'vacuum_swallow_80',
    mode: 'VACUUM',
    title: 'Swallow 80 Treasures in Star Vacuum',
    desc: 'Sweep your gravity black hole across 80 cosmic gems and blocks.',
    target: 80,
    reward: 60,
    metric: 'cumulative_action',
  },
  {
    id: 'sand_score_4000',
    mode: 'SAND',
    title: 'Score 4,000 in Chroma Sand',
    desc: 'Channel rainbow sand streams into multiplier cups for 4,000 points.',
    target: 4000,
    reward: 55,
    metric: 'best_score',
  },
  {
    id: 'chime_notes_80',
    mode: 'CHIME',
    title: 'Ring 80 Notes in Chime Cascade',
    desc: 'Listen to cascades or strum crystal bars to chime 80 harmonious notes.',
    target: 80,
    reward: 55,
    metric: 'cumulative_action',
  },
  {
    id: 'track_chimes_60',
    mode: 'TRACK',
    title: 'Ride 60 Chimes in Marble Run',
    desc: 'Watch or build kinetic tracks and hit 60 chimes and seesaws.',
    target: 60,
    reward: 55,
    metric: 'cumulative_action',
  },
  {
    id: 'pendulum_notes_90',
    mode: 'PENDULUM',
    title: 'Play 90 Harmonic Swings',
    desc: 'Watch or strum 90 pendulum chimes and cradle clacks in Harmonic Pendulum.',
    target: 90,
    reward: 55,
    metric: 'cumulative_action',
  },
  {
    id: 'pond_ripples_40',
    mode: 'POND',
    title: 'Weave 40 Koi Pond Ripples',
    desc: 'Tap the water 40 times in Zen Koi & Ripples to summon golden fish.',
    target: 40,
    reward: 50,
    metric: 'cumulative_action',
  },
  {
    id: 'vault_points_120',
    mode: 'VAULT',
    title: 'Devour 120 Gems in Vault Breach',
    desc: 'Slip bouncing balls into the concrete vault and multiply to eat 120 treasure gems.',
    target: 120,
    reward: 60,
    metric: 'cumulative_action',
  },
  {
    id: 'box_lines_25',
    mode: 'BOX_LINES',
    title: 'Shatter 25 Barrier Lines',
    desc: 'Multiply falling gravity balls to crack 25 numbered glass lines in Box Breaker.',
    target: 25,
    reward: 60,
    metric: 'cumulative_action',
  },
];

export function getLocalDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getPreviousDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  dt.setDate(dt.getDate() - 1);
  return getLocalDateKey(dt);
}

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function getDailyChallengesForDate(dateKey: string): DailyChallengeDef[] {
  // Always ensure first launch / 2026-11-25 highlights the flagship Swarm + Bubble goals
  // alongside 2 other rotating challenges, and rotate across the full pool on other days.
  if (dateKey === '2026-11-25') {
    return [
      CHALLENGE_POOL[0], // Score 5,000 in Swarm Breaker
      CHALLENGE_POOL[1], // Pop 100 Bubbles
      CHALLENGE_POOL[2], // Escape 10 Rotating Rings
      CHALLENGE_POOL[3], // Land 3 Plinko Jackpots
    ];
  }

  let seed = hashString(`marble-meadow-daily-${dateKey}`);
  const nextRand = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const remaining = [...CHALLENGE_POOL];
  const picked: DailyChallengeDef[] = [];
  const usedModes = new Set<PlayMode>();

  // Guarantee at least 1 score milestone and 1 tactile cumulative action challenge
  const scoreChoices = remaining.filter((c) => c.metric === 'best_score');
  const firstPick = scoreChoices[Math.floor(nextRand() * scoreChoices.length)];
  picked.push(firstPick);
  usedModes.add(firstPick.mode);

  const actionChoices = remaining.filter(
    (c) => c.metric === 'cumulative_action' && !usedModes.has(c.mode)
  );
  const secondPick = actionChoices[Math.floor(nextRand() * actionChoices.length)];
  picked.push(secondPick);
  usedModes.add(secondPick.mode);

  while (picked.length < 4 && remaining.length > 0) {
    const candidates = remaining.filter((c) => !usedModes.has(c.mode));
    if (candidates.length === 0) break;
    const pick = candidates[Math.floor(nextRand() * candidates.length)];
    picked.push(pick);
    usedModes.add(pick.mode);
  }

  return picked;
}

export function createFreshDailyState(dateKey = getLocalDateKey()): DailyChallengeState {
  return {
    dateKey,
    progressById: {},
    claimedIds: [],
    bonusClaimed: false,
    streakDays: 0,
    lastCompletedDate: null,
  };
}

export function normalizeDailyState(
  existing: Partial<DailyChallengeState> | undefined,
  todayKey = getLocalDateKey()
): DailyChallengeState {
  if (!existing || !existing.dateKey) {
    return createFreshDailyState(todayKey);
  }
  if (existing.dateKey === todayKey) {
    return {
      dateKey: todayKey,
      progressById: existing.progressById ?? {},
      claimedIds: existing.claimedIds ?? [],
      bonusClaimed: existing.bonusClaimed ?? false,
      streakDays: existing.streakDays ?? 0,
      lastCompletedDate: existing.lastCompletedDate ?? null,
    };
  }

  const yesterdayKey = getPreviousDateKey(todayKey);
  const keepStreak =
    existing.lastCompletedDate === yesterdayKey ||
    existing.lastCompletedDate === todayKey;

  return {
    dateKey: todayKey,
    progressById: {},
    claimedIds: [],
    bonusClaimed: false,
    streakDays: keepStreak ? existing.streakDays ?? 0 : 0,
    lastCompletedDate: existing.lastCompletedDate ?? null,
  };
}

export function extractActionCounter(mode: PlayMode, snapshot: HudSnapshot): number {
  switch (mode) {
    case 'BUBBLE':
      return snapshot.swarmSize; // world.poppedCount
    case 'RINGS':
      return Math.max(0, snapshot.targetsTotal - snapshot.targetsRemaining); // broken rings on current board
    case 'BLOOM':
      return snapshot.targetsRemaining; // world.poppedThisWave
    case 'SLICE':
      return snapshot.swarmSize; // world.slicedTotal
    case 'DOMINO':
      return snapshot.activeBalls; // world.toppledCount
    case 'PULSE':
      return snapshot.swarmSize; // world.perfectHits
    case 'HEX':
      return snapshot.swarmSize; // world.moves
    case 'PLINKO':
      return snapshot.waveOrLevel; // world.jackpots
    case 'MERGE':
      return snapshot.waveOrLevel; // highestTier + 1
    case 'VACUUM':
      return snapshot.swarmSize; // world.swallowedCount
    case 'SAND':
      return snapshot.swarmSize; // world.collectedTotal
    case 'CHIME':
      return snapshot.swarmSize; // world.notesPlayed
    case 'TRACK':
      return snapshot.swarmSize; // world.chimesPlayed
    case 'PENDULUM':
      return snapshot.swarmSize; // world.notesPlayed
    case 'POND':
      return snapshot.swarmSize; // world.ripplesCreated
    case 'VAULT':
      return snapshot.swarmSize; // world.eatenCount
    case 'BOX_LINES':
      return snapshot.swarmSize; // world.linesBroken
    default:
      return 0;
  }
}

export function getTimeUntilMidnightText(now = new Date()): string {
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0
  );
  const diffMs = Math.max(0, tomorrow.getTime() - now.getTime());
  const totalMins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return `${hrs}h ${String(mins).padStart(2, '0')}m`;
}
