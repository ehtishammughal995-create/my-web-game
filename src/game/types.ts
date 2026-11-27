export type GameState =
  | 'TITLE_MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'ROUND_SUMMARY'
  | 'GAME_OVER';

export type PlayMode =
  | 'SWARM'
  | 'RINGS'
  | 'BLOOM'
  | 'ORBIT'
  | 'SLICE'
  | 'HEX'
  | 'DOMINO'
  | 'PULSE'
  | 'VORTEX'
  | 'LASER'
  | 'MERGE'
  | 'PLINKO'
  | 'BUBBLE'
  | 'VACUUM'
  | 'SAND'
  | 'CHIME'
  | 'TRACK'
  | 'PENDULUM'
  | 'POND'
  | 'VAULT'
  | 'BOX_LINES'
  | 'SANDBOX';

export type PegKind =
  | 'normal'
  | 'target'
  | 'bumper'
  | 'splitter'
  | 'spring'
  | 'portal'
  | 'spinner'
  | 'bomb';

export type ToyBrush =
  | 'target'
  | 'normal'
  | 'bumper'
  | 'splitter'
  | 'spring'
  | 'portal'
  | 'spinner'
  | 'bomb'
  | 'eraser';

export interface Peg {
  id: string;
  x: number;
  y: number;
  radius: number;
  kind: PegKind;
  hit: boolean;
  hitTime: number;
  hitFlash: number;
  angle: number;
  angularVelocity: number;
  armLength: number;
  portalGroup?: number;
  portalCooldown?: number;
  isUserPlaced?: boolean;
}

export interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
  trail: Array<{ x: number; y: number }>;
  combo: number;
  stuckTimer: number;
  portalCooldown: number;
  age: number;
  isClone?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
}

export interface RingWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
}

export interface FloatingText {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
}

export interface FunModifiers {
  multiBall: boolean;
  giantMarble: boolean;
  lowGravity: boolean;
  magnetBucket: boolean;
  superBounce: boolean;
  rainbowTrail: boolean;
  slowMo: boolean;
}

export interface RingEscapeSettings {
  growOnBounce: boolean;
  multiplyOnEscape: boolean;
  accelerateOnBounce: boolean;
  megaTenRings: boolean;
  autoSteer: boolean;
  lowGravity: boolean;
  customRingCount: number;
}

export interface BloomSettings {
  chaosEndless: boolean;
  magnetDrift: boolean;
  megaRadius: boolean;
}

export interface OrbitSettings {
  paintTrails: boolean;
  multiComet: boolean;
  strongGravity: boolean;
}

export interface SliceSettings {
  zenMode: boolean;
  fastWave: boolean;
}

export interface HexRippleSettings {
  fullBoardWave: boolean;
  rainbowCycle: boolean;
}

export type DominoPreset =
  | 'SPIRAL'
  | 'SERPENT'
  | 'RINGS'
  | 'HELIX'
  | 'STARBURST'
  | 'HEARTWAVE'
  | 'MEGALOOP'
  | 'SPIDERWEB'
  | 'GHOST_RING'
  | 'AURORA_WAVE'
  | 'LOTUS_PETALS'
  | 'DOUBLE_SPIRAL'
  | 'BUTTERFLY'
  | 'CUSTOM';

export type SwarmPreset =
  | 'CLASSIC'
  | 'VOLLEY30'
  | 'FORTRESS'
  | 'BOMB_GARDEN'
  | 'DIAMOND_GALAXY'
  | 'LASER_MATRIX'
  | 'PRISM_TUNNEL'
  | 'TWIN_GALAXIES'
  | 'EXTREME100';
export type RingLevelPreset =
  | 'CLASSIC'
  | 'MEGA10'
  | 'TORNADO'
  | 'CHAOS5'
  | 'DOUBLE_GAP'
  | 'GALAXY_SWIRL'
  | 'BLACKHOLE'
  | 'HYPER20'
  | 'PHANTOM_PULSE'
  | 'BLOOD_MOON'
  | 'SPIDER_WEB'
  | 'CURSED_CLOCK'
  | 'SHADOW_EYE'
  | 'HAUNTED_ECHO'
  | 'CRYSTAL_RAIN'
  | 'VELVET_ASMR'
  | 'NEON_SERPENT'
  | 'VOID_VORTEX'
  | 'MIRROR_MAZE'
  | 'CURSED_PENDULUM'
  | 'WHISPER_CHAMBER'
  | 'AMBER_SANCTUARY'
  | 'PRISM_CITADEL'
  | 'ABYSS_30'
  | 'VIRAL_25'
  | 'TIKTOK_35'
  | 'PINHOLE_SNIPER'
  | 'TRIPLE_TORNADO'
  | 'NEON_PULSE_20'
  | 'PHANTOM_30'
  | 'GAUNTLET_40'
  | 'RAINBOW_50';
export type BloomPreset =
  | 'CLASSIC'
  | 'SUPERCELL'
  | 'CLUSTER_BOMBS'
  | 'HYPER_SWARM'
  | 'ASMR_NEBULA'
  | 'GALAXY_SPIRAL'
  | 'SAKURA_DRIFT'
  | 'DIAMOND_REACTOR'
  | 'EXTREME100';
export type SlicePreset =
  | 'CLASSIC'
  | 'BLITZ'
  | 'PINATA'
  | 'GRAVITY_FLIP'
  | 'SAKURA_RAIN'
  | 'COMET_FRENZY'
  | 'EXTREME';
export type HexLevelId =
  | 'MANDALA'
  | 'LOTUS'
  | 'CHECKER'
  | 'SPIRAL'
  | 'GALAXY'
  | 'PRISM_CORE'
  | 'SHADOW_WEB'
  | 'ASMR_LOTUS'
  | 'CRYSTAL_CROWN'
  | 'SOLAR_FLOWER'
  | 'EXTREME';
export type BeatLevelId =
  | 'SUNLIT'
  | 'CASCADE'
  | 'WALTZ'
  | 'DISCO_RING'
  | 'HYPER'
  | 'CHAOS_POLY'
  | 'LOFI_HEARTBEAT'
  | 'CELESTIAL_RUSH'
  | 'EXTREME';
export type VortexLevelId =
  | 'NEBULA'
  | 'FUNNEL'
  | 'SYMPHONY'
  | 'GALAXY_ARM'
  | 'ECLIPSE_EYE'
  | 'PHANTOM_LOTUS'
  | 'EXTREME'
  | 'PRISM_OCTAGON'
  | 'SILK_AURORA'
  | 'ZEN_RIPPLE'
  | 'AURORA_CROWN'
  | 'CRIMSON_NEBULA';
export type SandboxPreset =
  | 'STARTER'
  | 'PINBALL'
  | 'PORTALS'
  | 'WINDMILLS'
  | 'GALAXY_FUNNEL'
  | 'PORTAL_PINBALL'
  | 'CASCADE_TOWER'
  | 'PINBALL_GALAXY'
  | 'EXTREME';
export type MergePreset =
  | 'CLASSIC'
  | 'DIVIDER'
  | 'BOUNCE_PEGS'
  | 'TINY_WELL'
  | 'TWIN_PINBALL'
  | 'PORTAL_BOWL'
  | 'ZEN_FOUNTAIN'
  | 'LOTUS_CUP'
  | 'PRISM_FUNNEL'
  | 'EXTREME';
export type PlinkoPreset =
  | 'CLASSIC'
  | 'FUNNEL'
  | 'BUMPERS'
  | 'DIAMOND_MAZE'
  | 'JACKPOT_RAIN'
  | 'PORTAL_GALAXY'
  | 'ASMR_RAIN'
  | 'SILK_WATERFALL'
  | 'CHIME_PYRAMID'
  | 'LOTUS_CASCADES'
  | 'COSMIC_JACKPOT'
  | 'EXTREME14';
export type BubblePreset =
  | 'CLASSIC'
  | 'BOMBS'
  | 'RUSH'
  | 'RAINBOW_WAVE'
  | 'MEGA_CHAIN'
  | 'PHANTOM_EYE'
  | 'LOTUS_BLOOM'
  | 'NEBULA_RUSH'
  | 'EXTREME108';
export type VacuumPreset =
  | 'CLASSIC'
  | 'MANDALA'
  | 'PINATA'
  | 'METEOR'
  | 'SHADOW_SWARM'
  | 'ASMR_PEARLS'
  | 'CRYSTAL_RINGS'
  | 'NEON_METROPOLIS'
  | 'EXTREME';
export type SandPreset =
  | 'RAINBOW_DUNE'
  | 'HOURGLASS'
  | 'SIEVE'
  | 'WINDMILL'
  | 'PRISM_PINBALL'
  | 'GALAXY_FUNNEL'
  | 'LOTUS_GARDEN'
  | 'TORNADO_FUNNEL'
  | 'EXTREME_FOUNTAIN';
export type SandBrush = 'pour' | 'wall' | 'bounce' | 'stir' | 'eraser';

export type ChimePreset =
  | 'CASCADE_HARP'
  | 'PENDULUM_WAVE'
  | 'LOTUS_WHEEL'
  | 'SPIRAL_LOOM'
  | 'TWIN_FOUNTAIN'
  | 'RAIN_CANOPY'
  | 'GALAXY_ORBIT'
  | 'WATERFALL_STEPS'
  | 'BAMBOO_WIND'
  | 'AURORA_ARCH'
  | 'GRAND_SYMPHONY';

export type ChimeScaleId = 'PENTATONIC' | 'LYDIAN' | 'HIRAJOSHI' | 'MIDNIGHT';
export type ChimeVoiceId = 'kalimba' | 'marimba' | 'glass' | 'bowl';
export type ChimeActionMode = 'DROP_STRUM' | 'DRAW_BAR' | 'ERASE';

export type TrackPreset =
  | 'MEADOW_SLIDE'
  | 'SEESAW_SPLIT'
  | 'PENDULUM_GATES'
  | 'DOUBLE_HELIX'
  | 'GALAXY_FUNNEL'
  | 'RAINBOW_ORGAN'
  | 'PINBALL_CHUTES'
  | 'LOTUS_SWITCHBACK'
  | 'CLOCKWORK_TOWER'
  | 'GRAND_COASTER';

export type TrackActionMode =
  | 'DROP'
  | 'DRAW_RAIL'
  | 'PLACE_SEESAW'
  | 'PLACE_BELL'
  | 'ERASE';

export type PendulumPreset =
  | 'PHASE_WAVE'
  | 'NEWTON_CRADLE'
  | 'HARMONOGRAPH'
  | 'LOTUS_ROSETTE'
  | 'GALAXY_SWIRL'
  | 'PHANTOM_CLOCK'
  | 'DOUBLE_CHAOS'
  | 'GRAND_KALEIDOSCOPE';

export type PondPreset =
  | 'SAKURA_RAIN'
  | 'LOTUS_GARDEN'
  | 'LANTERN_DRIFT'
  | 'KOI_SPIRAL'
  | 'BAMBOO_FALLS'
  | 'STARLIGHT_TIDE'
  | 'PHANTOM_MIST'
  | 'IMPERIAL_SANCTUARY';

export type VaultPreset =
  | 'CLASSIC_BUNKER'
  | 'BOTTOM_KEYHOLE'
  | 'SIDE_SLIT'
  | 'SHIFTING_GATE'
  | 'TWIN_CHAMBER'
  | 'FUNNEL_TRAP'
  | 'ROTATING_FORTRESS'
  | 'MEGA_TREASURY';

export type VaultGapSize = 'tiny' | 'normal' | 'wide';
export type VaultMultiplyRule = 'DOUBLE' | 'ADD_1' | 'TRIPLE';

export type BoxLinesPreset =
  | 'CLASSIC_DOUBLE'
  | 'EXPONENTIAL_TOWER'
  | 'TWIN_CHAMBER'
  | 'TRIPLE_SWARM'
  | 'SHATTER_CASCADE'
  | 'FOUR_PILLARS'
  | 'ASMR_GLASS'
  | 'SIX_BOX_VIRAL';

export type BoxLinesHitRule =
  | 'DOUBLE_HIT'
  | 'ADD_1'
  | 'ADD_2'
  | 'TRIPLE_HIT'
  | 'DOUBLE_BREAK'
  | 'NO_SPLIT';

export interface BoxLinesConfig {
  boxCount: number;
  linesPerBox: number;
  hitRule: BoxLinesHitRule;
  baseHits: number;
  gravityScale: 'calm' | 'normal' | 'heavy';
}

export interface StageConfig {
  id: string;
  index: number;
  name: string;
  subtitle: string;
  accentColor: string;
  gravity: number;
  windX: number;
  startingBalls: number;
  bucketSpeed: number;
  buildPegs: () => Peg[];
}

export interface HudSnapshot {
  score: number;
  combo: number;
  maxCombo: number;
  waveOrLevel: number;
  swarmSize: number;
  activeBalls: number;
  targetsRemaining: number;
  targetsTotal: number;
  feverActive: boolean;
}

export type ArenaThemeId =
  | 'theme_midnight'
  | 'theme_emerald'
  | 'theme_solar'
  | 'theme_sakura'
  | 'theme_aurora'
  | 'theme_crimson';

export type TrailFxId =
  | 'fx_classic'
  | 'fx_stardust'
  | 'fx_golden'
  | 'fx_prism'
  | 'fx_plasma'
  | 'fx_custom';

export type CustomParticleShape = 'glow' | 'sparks' | 'bubbles' | 'stars';
export type CustomTrailMixMode = 'blend' | 'alternate' | 'rainbow';

export interface CustomTrailConfig {
  primaryColor: string;
  secondaryColor: string;
  mixMode: CustomTrailMixMode;
  shape: CustomParticleShape;
  decaySpeed: number;
  particleSize: number;
}

export interface SavedSnapshot {
  id: string;
  title: string;
  mode: PlayMode;
  createdAt: number;
  score: number;
  imageDataUrl: string;
}

export interface DailyChallengeState {
  dateKey: string;
  progressById: Record<string, number>;
  claimedIds: string[];
  bonusClaimed: boolean;
  streakDays: number;
  lastCompletedDate: string | null;
}

export type SoundscapeLayerId =
  | 'rain'
  | 'cosmicWind'
  | 'deepSpace'
  | 'crystalStream';

export interface SoundscapeMixerConfig {
  enabled: boolean;
  masterVolume: number;
  layers: Record<SoundscapeLayerId, number>;
}

export interface SavedProgress {
  bestSwarmScore: number;
  bestSwarmWave: number;
  bestRingScore: number;
  bestRingLevel: number;
  bestBloomScore: number;
  bestOrbitScore: number;
  muted: boolean;
  shards: number;
  unlockedCosmetics: string[];
  equippedTheme: ArenaThemeId;
  equippedFx: TrailFxId;
  customTrail: CustomTrailConfig;
  soundscape: SoundscapeMixerConfig;
  snapshots: SavedSnapshot[];
  dailyState: DailyChallengeState;
  zenModes: Record<PlayMode, boolean>;
}


