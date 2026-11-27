import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  FastForward,
  Gem,
  Image as ImageIcon,
  Play,
  PlusCircle,
  Radio,
  RotateCcw,
  Trophy,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { HapticCue, soundEngine } from './audio/soundEngine';
import {
  DailyChallengesModal,
  ModalTab,
} from './components/DailyChallengesModal';
import {
  DominoActionMode,
  FunControlsPanel,
  OrbitActionMode,
  SandboxActionMode,
} from './components/FunControlsPanel';
import { GalleryModal } from './components/GalleryModal';
import { GameCanvas, GameCanvasHandle } from './components/GameCanvas';
import { GameLogo } from './components/GameLogos';
import { TopBar } from './components/TopBar';
import {
  DEFAULT_CUSTOM_TRAIL,
  DEFAULT_SOUNDSCAPE_CONFIG,
  getArenaTheme,
  normalizeCustomTrail,
  normalizeSoundscapeConfig,
} from './game/cosmetics';
import {
  ALL_CLEAR_BONUS_SHARDS,
  createFreshDailyState,
  DailyChallengeDef,
  extractActionCounter,
  getDailyChallengesForDate,
  getLocalDateKey,
  normalizeDailyState,
} from './game/dailyChallenges';
import { PendulumVoice } from './game/pendulumEngine';
import { LASER_LEVEL_NAMES } from './game/prismLaserEngine';
import {
  ArenaThemeId,
  BeatLevelId,
  BloomPreset,
  BloomSettings,
  BubblePreset,
  ChimeActionMode,
  ChimePreset,
  ChimeScaleId,
  ChimeVoiceId,
  CustomTrailConfig,
  DominoPreset,
  FunModifiers,
  GameState,
  HexLevelId,
  HexRippleSettings,
  HudSnapshot,
  MergePreset,
  OrbitSettings,
  PendulumPreset,
  PlayMode,
  PlinkoPreset,
  PondPreset,
  RingEscapeSettings,
  RingLevelPreset,
  SandBrush,
  SandPreset,
  SandboxPreset,
  SavedProgress,
  SavedSnapshot,
  SlicePreset,
  SliceSettings,
  SoundscapeMixerConfig,
  SwarmPreset,
  ToyBrush,
  TrackActionMode,
  TrackPreset,
  TrailFxId,
  VacuumPreset,
  VortexLevelId,
} from './game/types';

type HapticKind = HapticCue | 'uiClick' | 'uiToggle' | 'uiSwipe';

const HAPTIC_PATTERNS: Record<HapticKind, number | number[]> = {
  uiClick: 8,
  uiToggle: [6, 18, 9],
  uiSwipe: [10, 20, 14],
  bounce: 6,
  collision: [11, 14, 13],
  chime: 8,
  pickup: [7, 14, 10],
  explosion: [18, 22, 26, 18, 12],
};

const STORAGE_KEY = 'marble-meadow-progress-v4';

const DEFAULT_ZEN_MODES: Record<PlayMode, boolean> = {
  SWARM: false,
  RINGS: false,
  BLOOM: false,
  ORBIT: false,
  SLICE: false,
  HEX: false,
  DOMINO: false,
  PULSE: false,
  VORTEX: false,
  LASER: false,
  MERGE: false,
  PLINKO: false,
  BUBBLE: false,
  VACUUM: false,
  SAND: false,
  CHIME: false,
  TRACK: false,
  PENDULUM: false,
  POND: false,
  SANDBOX: false,
};

const DEFAULT_PROGRESS: SavedProgress = {
  bestSwarmScore: 0,
  bestSwarmWave: 1,
  bestRingScore: 0,
  bestRingLevel: 1,
  bestBloomScore: 0,
  bestOrbitScore: 0,
  muted: false,
  shards: 0,
  unlockedCosmetics: ['theme_midnight', 'fx_classic', 'fx_custom'],
  equippedTheme: 'theme_midnight',
  equippedFx: 'fx_classic',
  customTrail: { ...DEFAULT_CUSTOM_TRAIL },
  soundscape: {
    ...DEFAULT_SOUNDSCAPE_CONFIG,
    layers: { ...DEFAULT_SOUNDSCAPE_CONFIG.layers },
  },
  snapshots: [],
  dailyState: createFreshDailyState(),
  zenModes: { ...DEFAULT_ZEN_MODES },
};

function loadProgress(): SavedProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<SavedProgress>;
    const unlocked = Array.isArray(parsed.unlockedCosmetics)
      ? parsed.unlockedCosmetics
      : [];
    const rawSnapshots = Array.isArray(parsed.snapshots) ? parsed.snapshots : [];
    const safeSnapshots: SavedSnapshot[] = rawSnapshots
      .filter(
        (s): s is SavedSnapshot =>
          Boolean(s) &&
          typeof s.id === 'string' &&
          typeof s.title === 'string' &&
          typeof s.imageDataUrl === 'string'
      )
      .slice(0, 24);
    return {
      bestSwarmScore: parsed.bestSwarmScore ?? 0,
      bestSwarmWave: parsed.bestSwarmWave ?? 1,
      bestRingScore: parsed.bestRingScore ?? 0,
      bestRingLevel: parsed.bestRingLevel ?? 1,
      bestBloomScore: parsed.bestBloomScore ?? 0,
      bestOrbitScore: parsed.bestOrbitScore ?? 0,
      muted: parsed.muted ?? false,
      shards: parsed.shards ?? 0,
      unlockedCosmetics: Array.from(
        new Set(['theme_midnight', 'fx_classic', 'fx_custom', ...unlocked])
      ),
      equippedTheme: parsed.equippedTheme ?? 'theme_midnight',
      equippedFx: parsed.equippedFx ?? 'fx_classic',
      customTrail: normalizeCustomTrail(parsed.customTrail),
      soundscape: normalizeSoundscapeConfig(parsed.soundscape),
      snapshots: safeSnapshots,
      dailyState: normalizeDailyState(parsed.dailyState),
      zenModes: {
        ...DEFAULT_ZEN_MODES,
        ...(parsed.zenModes ?? {}),
      },
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

const GAME_CATALOG: Array<{
  id: PlayMode;
  shortLabel: string;
  title: string;
  desc: string;
  accentBorder: string;
  activeBg: string;
}> = [
  {
    id: 'SWARM',
    shortLabel: 'Swarm',
    title: 'Swarm Breaker',
    desc: '9 modes including Diamond Galaxy, Laser Matrix & 100x Blitz.',
    accentBorder: 'border-amber-400/50',
    activeBg: 'bg-amber-500/15 border-amber-400/60',
  },
  {
    id: 'RINGS',
    shortLabel: 'Ring Escape',
    title: 'Ring Escape',
    desc: '24 ASMR, Creepy & Extreme arenas up to Blood Moon, Watching Eye & 30-Ball Abyss.',
    accentBorder: 'border-emerald-400/50',
    activeBg: 'bg-emerald-500/15 border-emerald-400/60',
  },
  {
    id: 'BLOOM',
    shortLabel: 'Bloom Chain',
    title: 'Bloom Chain',
    desc: '9 modes with ASMR Nebula, Galaxy Spiral & 100-orb expanding pops.',
    accentBorder: 'border-violet-400/50',
    activeBg: 'bg-violet-500/15 border-violet-400/60',
  },
  {
    id: 'ORBIT',
    shortLabel: 'Gravity Orbit',
    title: 'Gravity Orbit',
    desc: '10 cosmic star systems up to Binary Singularity Dance.',
    accentBorder: 'border-rose-400/50',
    activeBg: 'bg-rose-500/15 border-rose-400/60',
  },
  {
    id: 'SLICE',
    shortLabel: 'Blade Slice',
    title: 'Blade Slice',
    desc: '7 katana modes: Pinata Splitters, Zero-G Side & Overdrive.',
    accentBorder: 'border-cyan-400/50',
    activeBg: 'bg-cyan-500/15 border-cyan-400/60',
  },
  {
    id: 'HEX',
    shortLabel: 'Hex Ripple',
    title: 'Hex Ripple',
    desc: '11 hex grids including Shadow Web, ASMR Lotus & 91-Tile Hive.',
    accentBorder: 'border-teal-400/50',
    activeBg: 'bg-teal-500/15 border-teal-400/60',
  },
  {
    id: 'DOMINO',
    shortLabel: 'Domino Flow',
    title: 'Domino Flow',
    desc: '14 blueprints including Aurora Wave, Lotus Petals & 210-Tile Megaloop.',
    accentBorder: 'border-orange-400/50',
    activeBg: 'bg-orange-500/15 border-orange-400/60',
  },
  {
    id: 'PULSE',
    shortLabel: 'Beat Pulse',
    title: 'Beat Pulse',
    desc: '9 radial rhythm tracks up to 200 BPM Godspeed Overdrive.',
    accentBorder: 'border-pink-400/50',
    activeBg: 'bg-pink-500/15 border-pink-400/60',
  },
  {
    id: 'VORTEX',
    shortLabel: 'Vortex Paint',
    title: 'Vortex Paint',
    desc: '12 fluid swirl stages including Silk Aurora, Zen Ripple & 400-spark Octagon.',
    accentBorder: 'border-indigo-400/50',
    activeBg: 'bg-indigo-500/15 border-indigo-400/60',
  },
  {
    id: 'LASER',
    shortLabel: 'Prism Laser',
    title: 'Prism Laser',
    desc: '11 verified solvable mirror stages with smooth drag aiming.',
    accentBorder: 'border-sky-400/50',
    activeBg: 'bg-sky-500/15 border-sky-400/60',
  },
  {
    id: 'MERGE',
    shortLabel: 'Orb Merge',
    title: 'Orb Merge',
    desc: '10 bowls including Portal Warp, Zen Fountain & Jostle Bowl up 9 tiers.',
    accentBorder: 'border-fuchsia-400/50',
    activeBg: 'bg-fuchsia-500/15 border-fuchsia-400/60',
  },
  {
    id: 'PLINKO',
    shortLabel: 'Plinko Drop',
    title: 'Zen Plinko',
    desc: '12 boards: Silk Waterfall, Chime Pyramid & 25x golden rains up to 200x.',
    accentBorder: 'border-amber-300/50',
    activeBg: 'bg-amber-400/15 border-amber-300/60',
  },
  {
    id: 'BUBBLE',
    shortLabel: 'Pop Sheet',
    title: 'Pop Sheet',
    desc: '9 ASMR sheets including Phantom Eye, 108 bubbles & chain bombs.',
    accentBorder: 'border-emerald-300/50',
    activeBg: 'bg-emerald-400/15 border-emerald-300/60',
  },
  {
    id: 'VACUUM',
    shortLabel: 'Star Vacuum',
    title: 'Star Vacuum',
    desc: '9 galaxies including Shadow Swarm & Velvet Pearls — swallow 260+ treasures.',
    accentBorder: 'border-violet-400/50',
    activeBg: 'bg-violet-500/15 border-violet-400/60',
  },
  {
    id: 'SAND',
    shortLabel: 'Chroma Sand',
    title: 'Chroma Sand',
    desc: '9 sand boards with Stir Vortex swirl brush, pinball rails & 50x chalices.',
    accentBorder: 'border-orange-300/50',
    activeBg: 'bg-orange-400/15 border-orange-300/60',
  },
  {
    id: 'CHIME',
    shortLabel: 'Chime Harp',
    title: 'Chime Cascade',
    desc: '11 gentle eye-easy musical layouts, smooth pendulum waves & drawable chimes.',
    accentBorder: 'border-cyan-300/50',
    activeBg: 'bg-cyan-400/15 border-cyan-300/60',
  },
  {
    id: 'TRACK',
    shortLabel: 'Marble Run',
    title: 'Marble Run',
    desc: '10 soothing roller coasters with tipping seesaws, tuned bells & drawable chutes.',
    accentBorder: 'border-emerald-400/50',
    activeBg: 'bg-emerald-500/15 border-emerald-400/60',
  },
  {
    id: 'PENDULUM',
    shortLabel: 'Pendulum',
    title: 'Harmonic Pendulum',
    desc: '8 hypnotic phase waves, Newton cradles, harmonographs & lotus weaves.',
    accentBorder: 'border-sky-300/50',
    activeBg: 'bg-sky-400/15 border-sky-300/60',
  },
  {
    id: 'POND',
    shortLabel: 'Koi Pond',
    title: 'Zen Koi Pond',
    desc: '8 tranquil ponds with swirling Koi fish, lotus blossoms & crystal ripples.',
    accentBorder: 'border-teal-300/50',
    activeBg: 'bg-teal-400/15 border-teal-300/60',
  },
  {
    id: 'SANDBOX',
    shortLabel: 'Avalanche Lab',
    title: 'Avalanche Lab',
    desc: '9 presets, Galaxy Funnel, portals & 50x Supernova marble drops.',
    accentBorder: 'border-blue-400/50',
    activeBg: 'bg-blue-500/15 border-blue-400/60',
  },
];

export default function App() {
  const canvasRef = useRef<GameCanvasHandle | null>(null);
  const swipeStartXRef = useRef<number | null>(null);
  const lastMetricRef = useRef<{
    mode: PlayMode;
    actionCounter: number;
  } | null>(null);

  const [progress, setProgress] = useState<SavedProgress>(() => {
    const loaded = loadProgress();
    soundEngine.setMuted(loaded.muted);
    soundEngine.setSoundscapeConfig(loaded.soundscape, false);
    return loaded;
  });

  const [challengesOpen, setChallengesOpen] = useState<boolean>(false);
  const [challengesTab, setChallengesTab] = useState<ModalTab>('CHALLENGES');
  const [galleryOpen, setGalleryOpen] = useState<boolean>(false);
  const [snapshotToast, setSnapshotToast] = useState<string | null>(null);
  const [completedToast, setCompletedToast] = useState<DailyChallengeDef | null>(
    null
  );

  const todayChallenges = useMemo(
    () => getDailyChallengesForDate(progress.dailyState.dateKey),
    [progress.dailyState.dateKey]
  );

  const seenCompletedRef = useRef<Set<string>>(
    new Set(
      getDailyChallengesForDate(progress.dailyState.dateKey)
        .filter((c) => (progress.dailyState.progressById[c.id] ?? 0) >= c.target)
        .map((c) => c.id)
    )
  );
  const lastDailyDateRef = useRef<string>(progress.dailyState.dateKey);

  useEffect(() => {
    if (lastDailyDateRef.current !== progress.dailyState.dateKey) {
      seenCompletedRef.current.clear();
      lastDailyDateRef.current = progress.dailyState.dateKey;
    }

    let firstNew: DailyChallengeDef | null = null;
    for (const ch of todayChallenges) {
      const done = (progress.dailyState.progressById[ch.id] ?? 0) >= ch.target;
      if (done && !seenCompletedRef.current.has(ch.id)) {
        seenCompletedRef.current.add(ch.id);
        if (!progress.dailyState.claimedIds.includes(ch.id) && !firstNew) {
          firstNew = ch;
        }
      }
    }
    if (firstNew) {
      setCompletedToast(firstNew);
    }
  }, [progress.dailyState, todayChallenges]);

  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [playMode, setPlayMode] = useState<PlayMode>('SWARM');
  const [cleanView, setCleanView] = useState<boolean>(false);
  const [modeTransitionTick, setModeTransitionTick] = useState<number>(0);
  const [swipeDir, setSwipeDir] = useState<1 | -1>(1);

  const [swarmFiring, setSwarmFiring] = useState<boolean>(false);
  const [swarmSpeedMult, setSwarmSpeedMult] = useState<number>(1);

  const [swarmPreset, setSwarmPreset] = useState<SwarmPreset>('CLASSIC');
  const [ringPreset, setRingPreset] = useState<RingLevelPreset>('CLASSIC');
  const [bloomPreset, setBloomPreset] = useState<BloomPreset>('CLASSIC');
  const [orbitLevel, setOrbitLevel] = useState<number>(1);
  const [slicePreset, setSlicePreset] = useState<SlicePreset>('CLASSIC');
  const [hexLevel, setHexLevel] = useState<HexLevelId>('MANDALA');
  const [beatLevel, setBeatLevel] = useState<BeatLevelId>('SUNLIT');
  const [beatAutoPlay, setBeatAutoPlay] = useState<boolean>(false);
  const [vortexLevel, setVortexLevel] = useState<VortexLevelId>('NEBULA');
  const [vortexSwirl, setVortexSwirl] = useState<boolean>(true);
  const [vortexRepel, setVortexRepel] = useState<boolean>(false);
  const [laserLevel, setLaserLevel] = useState<number>(1);
  const [laserSolvedLevels, setLaserSolvedLevels] = useState<number[]>([]);
  const [laserAutoRotate, setLaserAutoRotate] = useState<boolean>(false);
  const [mergePreset, setMergePreset] = useState<MergePreset>('CLASSIC');
  const [plinkoPreset, setPlinkoPreset] = useState<PlinkoPreset>('CLASSIC');
  const [bubblePreset, setBubblePreset] = useState<BubblePreset>('CLASSIC');
  const [vacuumPreset, setVacuumPreset] = useState<VacuumPreset>('CLASSIC');
  const [sandPreset, setSandPreset] = useState<SandPreset>('RAINBOW_DUNE');
  const [sandBrush, setSandBrush] = useState<SandBrush>('pour');
  const [sandAutoFountain, setSandAutoFountain] = useState<boolean>(true);
  const [chimePreset, setChimePreset] = useState<ChimePreset>('CASCADE_HARP');
  const [chimeActionMode, setChimeActionMode] =
    useState<ChimeActionMode>('DROP_STRUM');
  const [chimeVoice, setChimeVoice] = useState<ChimeVoiceId>('kalimba');
  const [chimeScale, setChimeScale] = useState<ChimeScaleId>('PENTATONIC');
  const [chimeAutoFlow, setChimeAutoFlow] = useState<boolean>(true);
  const [trackPreset, setTrackPreset] = useState<TrackPreset>('MEADOW_SLIDE');
  const [trackActionMode, setTrackActionMode] =
    useState<TrackActionMode>('DRAW_RAIL');
  const [trackAutoFlow, setTrackAutoFlow] = useState<boolean>(true);
  const [pendulumPreset, setPendulumPreset] =
    useState<PendulumPreset>('PHASE_WAVE');
  const [pendulumVoice, setPendulumVoice] = useState<PendulumVoice>('chime');
  const [pendulumTrails, setPendulumTrails] = useState<boolean>(true);
  const [pendulumAutoPulse, setPendulumAutoPulse] = useState<boolean>(true);
  const [pondPreset, setPondPreset] = useState<PondPreset>('SAKURA_RAIN');
  const [pondRain, setPondRain] = useState<boolean>(true);
  const [pondWhirlpool, setPondWhirlpool] = useState<boolean>(false);
  const [sandboxPreset, setSandboxPreset] = useState<SandboxPreset>('STARTER');

  const [activeBrush, setActiveBrush] = useState<ToyBrush>('bumper');
  const [sandboxActionMode, setSandboxActionMode] =
    useState<SandboxActionMode>('PLACE');
  const [orbitActionMode, setOrbitActionMode] =
    useState<OrbitActionMode>('SHOOT');
  const [dominoPreset, setDominoPreset] = useState<DominoPreset>('SPIRAL');
  const [dominoActionMode, setDominoActionMode] =
    useState<DominoActionMode>('TOPPLE');

  const [modifiers, setModifiers] = useState<FunModifiers>({
    multiBall: false,
    giantMarble: false,
    lowGravity: false,
    magnetBucket: false,
    superBounce: true,
    rainbowTrail: true,
    slowMo: false,
  });

  const [ringSettings, setRingSettings] = useState<RingEscapeSettings>({
    growOnBounce: true,
    multiplyOnEscape: true,
    accelerateOnBounce: true,
    megaTenRings: false,
    autoSteer: false,
    lowGravity: false,
  });

  const [bloomSettings, setBloomSettings] = useState<BloomSettings>({
    chaosEndless: false,
    magnetDrift: true,
    megaRadius: false,
  });

  const [orbitSettings, setOrbitSettings] = useState<OrbitSettings>({
    paintTrails: true,
    multiComet: false,
    strongGravity: false,
  });

  const [sliceSettings, setSliceSettings] = useState<SliceSettings>({
    zenMode: false,
    fastWave: false,
  });

  const [hexSettings, setHexSettings] = useState<HexRippleSettings>({
    fullBoardWave: false,
    rainbowCycle: true,
  });

  const [hud, setHud] = useState<HudSnapshot>({
    score: 0,
    combo: 0,
    maxCombo: 0,
    waveOrLevel: 1,
    swarmSize: 8,
    activeBalls: 0,
    targetsRemaining: 0,
    targetsTotal: 0,
    feverActive: false,
  });

  const prevHudComboRef = useRef<{ mode: PlayMode; combo: number }>({
    mode: 'SWARM',
    combo: 0,
  });

  useEffect(() => {
    if (gameState !== 'PLAYING') {
      prevHudComboRef.current = { mode: playMode, combo: hud.combo };
      return;
    }

    const prev = prevHudComboRef.current;
    if (prev.mode !== playMode) {
      prevHudComboRef.current = { mode: playMode, combo: hud.combo };
      return;
    }

    const curCombo = hud.combo;
    const oldCombo = prev.combo;
    prevHudComboRef.current = { mode: playMode, combo: curCombo };

    if (curCombo > oldCombo && curCombo >= 10) {
      const crossed25 = Math.floor(curCombo / 25) > Math.floor(oldCombo / 25);
      const crossed10 = Math.floor(curCombo / 10) > Math.floor(oldCombo / 10);
      if (crossed25) {
        const milestone = Math.floor(curCombo / 25) * 25;
        canvasRef.current?.triggerComboExplosion(milestone, true);
      } else if (crossed10) {
        const milestone = Math.floor(curCombo / 10) * 10;
        canvasRef.current?.triggerComboExplosion(milestone, false);
      }
    }
  }, [hud.combo, playMode, gameState]);

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const lastPhysicsHapticAtRef = useRef<number>(0);

  const triggerHaptic = useCallback(
    (kind: HapticKind) => {
      if (reducedMotion) return;
      if (
        typeof navigator === 'undefined' ||
        typeof navigator.vibrate !== 'function'
      ) {
        return;
      }
      const isPhysics =
        kind === 'bounce' ||
        kind === 'collision' ||
        kind === 'chime' ||
        kind === 'explosion';
      if (isPhysics) {
        const now = performance.now();
        const cooldown =
          kind === 'explosion' ? 120 : kind === 'bounce' ? 50 : 65;
        if (now - lastPhysicsHapticAtRef.current < cooldown) {
          return;
        }
        lastPhysicsHapticAtRef.current = now;
      }
      try {
        navigator.vibrate(HAPTIC_PATTERNS[kind]);
      } catch {
        // Ignore browsers blocking vibration without recent gesture
      }
    },
    [reducedMotion]
  );

  useEffect(() => {
    soundEngine.setHapticListener((cue) => {
      triggerHaptic(cue);
    });
    return () => {
      soundEngine.setHapticListener(null);
    };
  }, [triggerHaptic]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota errors
    }
  }, [progress]);

  const handleStartMode = useCallback(
    (mode: PlayMode) => {
      soundEngine.unlock();
      triggerHaptic(mode !== playMode ? 'uiSwipe' : 'uiClick');
      if (mode !== playMode) {
        soundEngine.playPlaceToy();
        const oldIdx = GAME_CATALOG.findIndex((g) => g.id === playMode);
        const newIdx = GAME_CATALOG.findIndex((g) => g.id === mode);
        setSwipeDir(newIdx >= oldIdx ? 1 : -1);
      }
      setPlayMode(mode);
      setGameState('PLAYING');
      setModeTransitionTick((n) => n + 1);
      lastMetricRef.current = null;

      if (mode === 'SWARM') {
        canvasRef.current?.loadSwarmPreset(swarmPreset);
      } else if (mode === 'RINGS') {
        canvasRef.current?.loadRingPreset(ringPreset);
      } else if (mode === 'BLOOM') {
        canvasRef.current?.loadBloomPreset(bloomPreset);
      } else if (mode === 'ORBIT') {
        canvasRef.current?.loadOrbitLevel(orbitLevel);
      } else if (mode === 'SLICE') {
        canvasRef.current?.loadSlicePreset(slicePreset);
      } else if (mode === 'HEX') {
        canvasRef.current?.loadHexLevel(hexLevel);
      } else if (mode === 'DOMINO') {
        canvasRef.current?.loadDominoPreset(dominoPreset);
      } else if (mode === 'PULSE') {
        canvasRef.current?.loadBeatLevel(beatLevel);
      } else if (mode === 'VORTEX') {
        canvasRef.current?.loadVortexLevel(vortexLevel);
      } else if (mode === 'LASER') {
        canvasRef.current?.loadLaserLevel(laserLevel);
      } else if (mode === 'MERGE') {
        canvasRef.current?.loadMergePreset(mergePreset);
      } else if (mode === 'PLINKO') {
        canvasRef.current?.loadPlinkoPreset(plinkoPreset);
      } else if (mode === 'BUBBLE') {
        canvasRef.current?.loadBubblePreset(bubblePreset);
      } else if (mode === 'VACUUM') {
        canvasRef.current?.loadVacuumPreset(vacuumPreset);
      } else if (mode === 'SAND') {
        canvasRef.current?.loadSandPreset(sandPreset);
      } else if (mode === 'CHIME') {
        canvasRef.current?.loadChimePreset(chimePreset);
      } else if (mode === 'TRACK') {
        canvasRef.current?.loadTrackPreset(trackPreset);
      } else if (mode === 'PENDULUM') {
        canvasRef.current?.loadPendulumPreset(pendulumPreset);
      } else if (mode === 'POND') {
        canvasRef.current?.loadPondPreset(pondPreset);
      } else {
        canvasRef.current?.loadSandboxPreset(sandboxPreset);
      }
    },
    [
      playMode,
      triggerHaptic,
      swarmPreset,
      ringPreset,
      bloomPreset,
      orbitLevel,
      slicePreset,
      hexLevel,
      dominoPreset,
      beatLevel,
      vortexLevel,
      laserLevel,
      mergePreset,
      plinkoPreset,
      bubblePreset,
      vacuumPreset,
      sandPreset,
      chimePreset,
      trackPreset,
      pendulumPreset,
      pondPreset,
      sandboxPreset,
    ]
  );

  const handleSwipeStep = useCallback(
    (delta: 1 | -1) => {
      const idx = GAME_CATALOG.findIndex((g) => g.id === playMode);
      const nextIdx = (idx + delta + GAME_CATALOG.length) % GAME_CATALOG.length;
      setSwipeDir(delta);
      handleStartMode(GAME_CATALOG[nextIdx].id);
    },
    [playMode, handleStartMode]
  );

  const handleToggleMute = useCallback(() => {
    triggerHaptic('uiToggle');
    setProgress((prev) => {
      const nextMuted = !prev.muted;
      soundEngine.setMuted(nextMuted);
      return { ...prev, muted: nextMuted };
    });
  }, [triggerHaptic]);

  const handleTogglePause = useCallback(() => {
    triggerHaptic('uiToggle');
    setGameState((prev) => {
      if (prev === 'PLAYING') return 'PAUSED';
      if (prev === 'PAUSED') return 'PLAYING';
      return prev;
    });
  }, [triggerHaptic]);

  const handleToggleModifier = useCallback(
    (key: keyof FunModifiers) => {
      soundEngine.unlock();
      soundEngine.playPlaceToy();
      triggerHaptic('uiToggle');
      setModifiers((prev) => ({ ...prev, [key]: !prev[key] }));
    },
    [triggerHaptic]
  );

  const handleSelectSwarmPreset = useCallback((preset: SwarmPreset) => {
    soundEngine.unlock();
    soundEngine.playPlaceToy();
    setSwarmPreset(preset);
    canvasRef.current?.loadSwarmPreset(preset);
  }, []);

  const handleToggleRingSetting = useCallback(
    (key: keyof RingEscapeSettings) => {
      soundEngine.unlock();
      soundEngine.playPlaceToy();
      setRingSettings((prev) => {
        const nextVal = !prev[key];
        if (key === 'megaTenRings') {
          canvasRef.current?.resetRings(nextVal);
        }
        return { ...prev, [key]: nextVal };
      });
    },
    []
  );

  const handleSelectRingPreset = useCallback((preset: RingLevelPreset) => {
    soundEngine.unlock();
    soundEngine.playPlaceToy();
    setRingPreset(preset);
    setRingSettings((prev) => ({
      ...prev,
      megaTenRings:
        preset === 'MEGA10' || preset === 'HYPER20' || preset === 'ABYSS_30',
    }));
    canvasRef.current?.loadRingPreset(preset);
  }, []);

  const handleSelectBloomPreset = useCallback((preset: BloomPreset) => {
    soundEngine.unlock();
    soundEngine.playPlaceToy();
    setBloomPreset(preset);
    canvasRef.current?.loadBloomPreset(preset);
  }, []);

  const handleSelectOrbitLevel = useCallback((level: number) => {
    soundEngine.unlock();
    soundEngine.playPlaceToy();
    setOrbitLevel(level);
    canvasRef.current?.loadOrbitLevel(level);
  }, []);

  const handleSelectSlicePreset = useCallback((preset: SlicePreset) => {
    soundEngine.unlock();
    soundEngine.playPlaceToy();
    setSlicePreset(preset);
    canvasRef.current?.loadSlicePreset(preset);
  }, []);

  const handleSelectHexLevel = useCallback((levelId: HexLevelId) => {
    soundEngine.unlock();
    soundEngine.playPlaceToy();
    setHexLevel(levelId);
    canvasRef.current?.loadHexLevel(levelId);
  }, []);

  const handleSelectBeatLevel = useCallback((id: BeatLevelId) => {
    soundEngine.unlock();
    soundEngine.playPlaceToy();
    setBeatLevel(id);
    canvasRef.current?.loadBeatLevel(id);
  }, []);

  const handleSelectVortexLevel = useCallback((id: VortexLevelId) => {
    soundEngine.unlock();
    soundEngine.playPlaceToy();
    setVortexLevel(id);
    canvasRef.current?.loadVortexLevel(id);
  }, []);

  const handleSelectLaserLevel = useCallback((level: number) => {
    soundEngine.unlock();
    soundEngine.playPlaceToy();
    setLaserLevel(level);
    canvasRef.current?.loadLaserLevel(level);
  }, []);

  const handleSelectMergePreset = useCallback((preset: MergePreset) => {
    soundEngine.unlock();
    soundEngine.playPlaceToy();
    setMergePreset(preset);
    canvasRef.current?.loadMergePreset(preset);
  }, []);

  const handleSelectPlinkoPreset = useCallback((preset: PlinkoPreset) => {
    soundEngine.unlock();
    soundEngine.playPlaceToy();
    setPlinkoPreset(preset);
    canvasRef.current?.loadPlinkoPreset(preset);
  }, []);

  const handleSelectBubblePreset = useCallback((preset: BubblePreset) => {
    soundEngine.unlock();
    soundEngine.playPlaceToy();
    setBubblePreset(preset);
    canvasRef.current?.loadBubblePreset(preset);
  }, []);

  const handleSelectVacuumPreset = useCallback((preset: VacuumPreset) => {
    soundEngine.unlock();
    soundEngine.playPlaceToy();
    setVacuumPreset(preset);
    canvasRef.current?.loadVacuumPreset(preset);
  }, []);

  const handleSelectSandPreset = useCallback((preset: SandPreset) => {
    soundEngine.unlock();
    soundEngine.playPlaceToy();
    setSandPreset(preset);
    canvasRef.current?.loadSandPreset(preset);
  }, []);

  const handleSelectChimePreset = useCallback(
    (preset: ChimePreset) => {
      soundEngine.unlock();
      soundEngine.playPlaceToy();
      triggerHaptic('uiClick');
      setChimePreset(preset);
      canvasRef.current?.loadChimePreset(preset);
    },
    [triggerHaptic]
  );

  const handleSelectTrackPreset = useCallback(
    (preset: TrackPreset) => {
      soundEngine.unlock();
      soundEngine.playPlaceToy();
      triggerHaptic('uiClick');
      setTrackPreset(preset);
      canvasRef.current?.loadTrackPreset(preset);
    },
    [triggerHaptic]
  );

  const handleSelectPendulumPreset = useCallback(
    (preset: PendulumPreset) => {
      soundEngine.unlock();
      soundEngine.playPlaceToy();
      triggerHaptic('uiClick');
      setPendulumPreset(preset);
      canvasRef.current?.loadPendulumPreset(preset);
    },
    [triggerHaptic]
  );

  const handleSelectPondPreset = useCallback(
    (preset: PondPreset) => {
      soundEngine.unlock();
      soundEngine.playPlaceToy();
      triggerHaptic('uiClick');
      setPondPreset(preset);
      canvasRef.current?.loadPondPreset(preset);
    },
    [triggerHaptic]
  );

  const handleSelectSandboxPreset = useCallback(
    (preset: SandboxPreset) => {
      soundEngine.unlock();
      soundEngine.playPlaceToy();
      triggerHaptic('uiClick');
      setSandboxPreset(preset);
      canvasRef.current?.loadSandboxPreset(preset);
    },
    [triggerHaptic]
  );

  const handleToggleBloomSetting = useCallback(
    (key: keyof BloomSettings) => {
      soundEngine.unlock();
      soundEngine.playPlaceToy();
      triggerHaptic('uiToggle');
      setBloomSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    },
    [triggerHaptic]
  );

  const handleToggleOrbitSetting = useCallback(
    (key: keyof OrbitSettings) => {
      soundEngine.unlock();
      soundEngine.playPlaceToy();
      triggerHaptic('uiToggle');
      setOrbitSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    },
    [triggerHaptic]
  );

  const handleToggleSliceSetting = useCallback(
    (key: keyof SliceSettings) => {
      soundEngine.unlock();
      soundEngine.playPlaceToy();
      triggerHaptic('uiToggle');
      setSliceSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    },
    [triggerHaptic]
  );

  const handleToggleHexSetting = useCallback(
    (key: keyof HexRippleSettings) => {
      soundEngine.unlock();
      soundEngine.playPlaceToy();
      triggerHaptic('uiToggle');
      setHexSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    },
    [triggerHaptic]
  );

  const handleToggleZenMode = useCallback(() => {
    soundEngine.unlock();
    soundEngine.playPlaceToy();
    triggerHaptic('uiToggle');
    const nextVal = !progress.zenModes[playMode];
    if (playMode === 'SLICE') {
      setSliceSettings((s) => ({ ...s, zenMode: nextVal }));
    }
    setProgress((prev) => ({
      ...prev,
      zenModes: {
        ...prev.zenModes,
        [playMode]: !prev.zenModes[playMode],
      },
    }));
    if (gameState === 'GAME_OVER') {
      handleStartMode(playMode);
    }
  }, [playMode, gameState, progress.zenModes, handleStartMode, triggerHaptic]);

  const handleSelectDominoPreset = useCallback(
    (preset: DominoPreset) => {
      soundEngine.unlock();
      soundEngine.playPlaceToy();
      triggerHaptic('uiClick');
      setDominoPreset(preset);
      if (preset === 'CUSTOM') {
        setDominoActionMode('DRAW');
      } else {
        setDominoActionMode('TOPPLE');
      }
      canvasRef.current?.loadDominoPreset(preset);
    },
    [triggerHaptic]
  );

  const handleHudChange = useCallback(
    (snapshot: HudSnapshot) => {
      setHud(snapshot);
      if (playMode === 'LASER') {
        const stage = ((snapshot.waveOrLevel - 1) % LASER_LEVEL_NAMES.length) + 1;
        setLaserLevel((cur) => (cur === stage ? cur : stage));
      } else if (playMode === 'ORBIT') {
        const sys = ((snapshot.waveOrLevel - 1) % 10) + 1;
        setOrbitLevel((cur) => (cur === sys ? cur : sys));
      }

      const actionVal = extractActionCounter(playMode, snapshot);
      let actionDelta = 0;
      if (
        lastMetricRef.current &&
        lastMetricRef.current.mode === playMode &&
        actionVal >= lastMetricRef.current.actionCounter
      ) {
        actionDelta = actionVal - lastMetricRef.current.actionCounter;
      }
      lastMetricRef.current = { mode: playMode, actionCounter: actionVal };

      const todayKey = getLocalDateKey();
      const activePool = getDailyChallengesForDate(todayKey);
      const matchingChallenges = activePool.filter(
        (c) => c.mode === playMode && c.id !== 'laser_clear_2'
      );

      setProgress((prev) => {
        const normalizedDaily = normalizeDailyState(prev.dailyState, todayKey);
        const nextProgressById = { ...normalizedDaily.progressById };
        let dailyChanged = normalizedDaily.dateKey !== prev.dailyState.dateKey;

        for (const ch of matchingChallenges) {
          const prevVal = nextProgressById[ch.id] ?? 0;
          let nextVal = prevVal;
          if (ch.metric === 'best_score') {
            nextVal = Math.max(prevVal, snapshot.score);
          } else if (ch.metric === 'max_tier') {
            nextVal = Math.max(prevVal, actionVal);
          } else if (ch.metric === 'cumulative_action' && actionDelta > 0) {
            nextVal = prevVal + actionDelta;
          }

          if (nextVal !== prevVal) {
            nextProgressById[ch.id] = Math.min(ch.target * 2, nextVal);
            dailyChanged = true;
          }
        }

        const ringImproved =
          playMode === 'RINGS' &&
          (snapshot.score > prev.bestRingScore ||
            snapshot.waveOrLevel > prev.bestRingLevel);
        const bloomImproved =
          playMode === 'BLOOM' && snapshot.score > prev.bestBloomScore;
        const orbitImproved =
          playMode === 'ORBIT' && snapshot.score > prev.bestOrbitScore;

        if (!dailyChanged && !ringImproved && !bloomImproved && !orbitImproved) {
          return prev;
        }

        return {
          ...prev,
          bestRingScore: ringImproved
            ? Math.max(prev.bestRingScore, snapshot.score)
            : prev.bestRingScore,
          bestRingLevel: ringImproved
            ? Math.max(prev.bestRingLevel, snapshot.waveOrLevel)
            : prev.bestRingLevel,
          bestBloomScore: bloomImproved ? snapshot.score : prev.bestBloomScore,
          bestOrbitScore: orbitImproved ? snapshot.score : prev.bestOrbitScore,
          dailyState: dailyChanged
            ? { ...normalizedDaily, progressById: nextProgressById }
            : prev.dailyState,
        };
      });
    },
    [playMode]
  );

  const handleLaserStageCleared = useCallback(() => {
    const todayKey = getLocalDateKey();
    const activePool = getDailyChallengesForDate(todayKey);
    const laserCh = activePool.find((c) => c.id === 'laser_clear_2');
    if (!laserCh) return;

    setProgress((prev) => {
      const normalizedDaily = normalizeDailyState(prev.dailyState, todayKey);
      const prevVal = normalizedDaily.progressById[laserCh.id] ?? 0;
      const nextVal = Math.min(laserCh.target * 2, prevVal + 1);
      return {
        ...prev,
        dailyState: {
          ...normalizedDaily,
          progressById: {
            ...normalizedDaily.progressById,
            [laserCh.id]: nextVal,
          },
        },
      };
    });
  }, []);

  const handleClaimChallenge = useCallback(
    (challengeId: string) => {
      soundEngine.unlock();
      soundEngine.playStageClear();
      triggerHaptic('pickup');
      setProgress((prev) => {
        const todayKey = getLocalDateKey();
        const normalizedDaily = normalizeDailyState(prev.dailyState, todayKey);
        const pool = getDailyChallengesForDate(todayKey);
        const ch = pool.find((c) => c.id === challengeId);
        if (!ch) return prev;
        if (normalizedDaily.claimedIds.includes(challengeId)) return prev;
        if ((normalizedDaily.progressById[challengeId] ?? 0) < ch.target) {
          return prev;
        }

        const nextClaimed = [...normalizedDaily.claimedIds, challengeId];
        const allDone = pool.every(
          (item) => (normalizedDaily.progressById[item.id] ?? 0) >= item.target
        );
        const bumpStreak =
          allDone && normalizedDaily.lastCompletedDate !== todayKey;

        return {
          ...prev,
          shards: prev.shards + ch.reward,
          dailyState: {
            ...normalizedDaily,
            claimedIds: nextClaimed,
            streakDays: bumpStreak
              ? normalizedDaily.streakDays + 1
              : normalizedDaily.streakDays,
            lastCompletedDate: bumpStreak
              ? todayKey
              : normalizedDaily.lastCompletedDate,
          },
        };
      });
      setCompletedToast((cur) => (cur?.id === challengeId ? null : cur));
    },
    [triggerHaptic]
  );

  const handleClaimAllClearBonus = useCallback(() => {
    soundEngine.unlock();
    soundEngine.playStageClear();
    triggerHaptic('explosion');
    setProgress((prev) => {
      const todayKey = getLocalDateKey();
      const normalizedDaily = normalizeDailyState(prev.dailyState, todayKey);
      if (normalizedDaily.bonusClaimed) return prev;
      const pool = getDailyChallengesForDate(todayKey);
      const allDone = pool.every(
        (item) => (normalizedDaily.progressById[item.id] ?? 0) >= item.target
      );
      if (!allDone) return prev;

      const bumpStreak = normalizedDaily.lastCompletedDate !== todayKey;
      return {
        ...prev,
        shards: prev.shards + ALL_CLEAR_BONUS_SHARDS,
        dailyState: {
          ...normalizedDaily,
          bonusClaimed: true,
          streakDays: bumpStreak
            ? normalizedDaily.streakDays + 1
            : normalizedDaily.streakDays,
          lastCompletedDate: todayKey,
        },
      };
    });
  }, [triggerHaptic]);

  const handleUnlockTheme = useCallback(
    (id: ArenaThemeId, cost: number) => {
      soundEngine.unlock();
      soundEngine.playStageClear();
      triggerHaptic('pickup');
      setProgress((prev) => {
        if (prev.unlockedCosmetics.includes(id) || prev.shards < cost) {
          return prev;
        }
        return {
          ...prev,
          shards: prev.shards - cost,
          unlockedCosmetics: [...prev.unlockedCosmetics, id],
          equippedTheme: id,
        };
      });
    },
    [triggerHaptic]
  );

  const handleEquipTheme = useCallback(
    (id: ArenaThemeId) => {
      soundEngine.unlock();
      soundEngine.playPlaceToy();
      triggerHaptic('uiClick');
      setProgress((prev) => {
        if (!prev.unlockedCosmetics.includes(id)) return prev;
        return { ...prev, equippedTheme: id };
      });
    },
    [triggerHaptic]
  );

  const handleUnlockFx = useCallback(
    (id: TrailFxId, cost: number) => {
      soundEngine.unlock();
      soundEngine.playStageClear();
      triggerHaptic('pickup');
      setProgress((prev) => {
        if (prev.unlockedCosmetics.includes(id) || prev.shards < cost) {
          return prev;
        }
        return {
          ...prev,
          shards: prev.shards - cost,
          unlockedCosmetics: [...prev.unlockedCosmetics, id],
          equippedFx: id,
        };
      });
    },
    [triggerHaptic]
  );

  const handleEquipFx = useCallback(
    (id: TrailFxId) => {
      soundEngine.unlock();
      soundEngine.playPlaceToy();
      triggerHaptic('uiClick');
      setProgress((prev) => {
        if (!prev.unlockedCosmetics.includes(id)) return prev;
        return { ...prev, equippedFx: id };
      });
    },
    [triggerHaptic]
  );

  const handleUpdateCustomTrail = useCallback(
    (next: CustomTrailConfig, equip = false) => {
      setProgress((prev) => ({
        ...prev,
        customTrail: normalizeCustomTrail(next),
        equippedFx: equip ? 'fx_custom' : prev.equippedFx,
      }));
    },
    []
  );

  const handleUpdateSoundscape = useCallback((next: SoundscapeMixerConfig) => {
    const normalized = normalizeSoundscapeConfig(next);
    soundEngine.unlock();
    soundEngine.setSoundscapeConfig(normalized, true);
    setProgress((prev) => ({
      ...prev,
      soundscape: normalized,
    }));
  }, []);

  const handleCaptureSnapshot = useCallback(() => {
    const dataUrl = canvasRef.current?.captureSnapshot();
    if (!dataUrl) return;
    soundEngine.unlock();
    soundEngine.playPickup();
    triggerHaptic('pickup');

    const modeTitle =
      GAME_CATALOG.find((g) => g.id === playMode)?.title ?? playMode;
    const timestampLabel = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const newShot: SavedSnapshot = {
      id: `snap_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: `${modeTitle} · ${timestampLabel}`,
      mode: playMode,
      createdAt: Date.now(),
      score: hud.score,
      imageDataUrl: dataUrl,
    };
    setProgress((prev) => ({
      ...prev,
      snapshots: [newShot, ...prev.snapshots].slice(0, 24),
    }));
    setSnapshotToast(`Saved to Gallery: ${newShot.title}`);
  }, [playMode, hud.score, triggerHaptic]);

  const handleSaveWallpaperFrame = useCallback(
    (title: string, imageDataUrl: string) => {
      soundEngine.unlock();
      soundEngine.playPickup();
      triggerHaptic('pickup');
      const newShot: SavedSnapshot = {
        id: `snap_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title,
        mode: playMode,
        createdAt: Date.now(),
        score: hud.score,
        imageDataUrl,
      };
      setProgress((prev) => ({
        ...prev,
        snapshots: [newShot, ...prev.snapshots].slice(0, 24),
      }));
      setSnapshotToast(`Saved to Gallery: ${title}`);
    },
    [playMode, hud.score, triggerHaptic]
  );

  useEffect(() => {
    if (!snapshotToast) return;
    const t = window.setTimeout(() => setSnapshotToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [snapshotToast]);

  const handleRenameSnapshot = useCallback((id: string, nextTitle: string) => {
    setProgress((prev) => ({
      ...prev,
      snapshots: prev.snapshots.map((s) =>
        s.id === id ? { ...s, title: nextTitle } : s
      ),
    }));
  }, []);

  const handleDeleteSnapshot = useCallback(
    (id: string) => {
      soundEngine.unlock();
      soundEngine.playPlaceToy();
      triggerHaptic('uiClick');
      setProgress((prev) => ({
        ...prev,
        snapshots: prev.snapshots.filter((s) => s.id !== id),
      }));
    },
    [triggerHaptic]
  );

  const handleGameOver = useCallback(
    (snapshot: HudSnapshot) => {
      if (progress.zenModes[playMode]) return;
      setHud(snapshot);
      setGameState('GAME_OVER');
      if (playMode === 'SWARM') {
        setProgress((prev) => ({
          ...prev,
          bestSwarmScore: Math.max(prev.bestSwarmScore, snapshot.score),
          bestSwarmWave: Math.max(prev.bestSwarmWave, snapshot.waveOrLevel),
        }));
      }
    },
    [playMode, progress.zenModes]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (challengesOpen || galleryOpen) return;

      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (gameState === 'PLAYING' || gameState === 'PAUSED') {
          e.preventDefault();
          handleTogglePause();
        }
        return;
      }

      if (gameState !== 'PLAYING') return;

      if (e.key === '[') {
        e.preventDefault();
        handleSwipeStep(-1);
      } else if (e.key === ']') {
        e.preventDefault();
        handleSwipeStep(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        canvasRef.current?.nudgeAim(-0.08);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        canvasRef.current?.nudgeAim(0.08);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        if (playMode === 'RINGS') {
          e.preventDefault();
          triggerHaptic('uiClick');
          canvasRef.current?.pulseRings();
        }
      } else if (e.key === ' ') {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag !== 'BUTTON') {
          e.preventDefault();
          triggerHaptic('uiClick');
          canvasRef.current?.launchSingle();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleStartMode(playMode);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    challengesOpen,
    galleryOpen,
    gameState,
    playMode,
    handleTogglePause,
    handleStartMode,
    handleSwipeStep,
    triggerHaptic,
  ]);

  const modeMeta: Record<PlayMode, { title: string; subtitle: string }> = {
    SWARM: {
      title: 'Swarm Breaker',
      subtitle: '9 swarm modes including Diamond Galaxy, Laser Matrix & 100x Blitz',
    },
    RINGS: {
      title: 'Ring Escape',
      subtitle: 'Steer rotating gaps · 24 ASMR, Creepy & Extreme arenas',
    },
    BLOOM: {
      title: 'Bloom Chain',
      subtitle: '9 density levels with ASMR Nebula, Galaxy Spiral & 100-orb pops',
    },
    ORBIT: {
      title: 'Gravity Orbit',
      subtitle: '10 star systems up to Binary Singularity spirographs',
    },
    SLICE: {
      title: 'Blade Slice',
      subtitle: '7 katana modes · Pinata Splitters, Zero-G & Overdrive',
    },
    HEX: {
      title: 'Hex Ripple',
      subtitle: '11 hex patterns including Shadow Web & Velvet ASMR Lotus',
    },
    DOMINO: {
      title: 'Domino Flow',
      subtitle: '14 blueprints including Aurora Wave, Lotus Petals & 210-tile Megaloop',
    },
    PULSE: {
      title: 'Beat Pulse',
      subtitle: '9 radial rhythm tracks up to 200 BPM Godspeed',
    },
    VORTEX: {
      title: 'Vortex Paint',
      subtitle: '12 vortex stages including Silk Aurora, Zen Ripple & Eclipse Eye',
    },
    LASER: {
      title: 'Prism Laser',
      subtitle: '11 verified solvable mirror stages · Drag or tap to aim',
    },
    MERGE: {
      title: 'Orb Merge',
      subtitle: '10 bowls including Portal Warp, Zen Fountain & Jostle Bowl',
    },
    PLINKO: {
      title: 'Zen Plinko',
      subtitle: '12 boards · Silk Waterfall, Chime Pyramid & 25x drops up to 200x',
    },
    BUBBLE: {
      title: 'Pop Sheet',
      subtitle: '9 ASMR sheets · Phantom Eye, cross-row stars & 3x3 bombs',
    },
    VACUUM: {
      title: 'Star Vacuum',
      subtitle: '9 galaxies including Shadow Swarm & Velvet ASMR Pearls',
    },
    SAND: {
      title: 'Chroma Sand',
      subtitle: '9 boards with Stir Vortex swirl brush & 50x chalices',
    },
    CHIME: {
      title: 'Chime Cascade',
      subtitle: '11 gentle eye-easy musical layouts, smooth waves & drawable chimes',
    },
    TRACK: {
      title: 'Marble Run',
      subtitle: '10 soothing roller coasters · Seesaws, tuned bells & drawable chutes',
    },
    PENDULUM: {
      title: 'Harmonic Pendulum',
      subtitle: '8 phase waves, Newton cradles, harmonographs & glowing trails',
    },
    POND: {
      title: 'Zen Koi Pond',
      subtitle: '8 tranquil ponds · Swirling Koi fish, lotus petals & crystal ripples',
    },
    SANDBOX: {
      title: 'Avalanche Lab',
      subtitle: '9 presets, Galaxy Funnel, portals & 50x Supernova drops',
    },
  };

  const activeThemeDef = getArenaTheme(progress.equippedTheme);
  const isZenMode = Boolean(progress.zenModes[playMode]);
  const completedDailyCount = todayChallenges.filter(
    (c) => (progress.dailyState.progressById[c.id] ?? 0) >= c.target
  ).length;
  const claimableDailyCount = todayChallenges.filter(
    (c) =>
      (progress.dailyState.progressById[c.id] ?? 0) >= c.target &&
      !progress.dailyState.claimedIds.includes(c.id)
  ).length;

  return (
    <div
      className="min-h-screen flex flex-col bg-[#0B1120] text-slate-100"
      style={
        activeThemeDef.pageGlowStyle
          ? {
              backgroundImage: `radial-gradient(circle at 50% 0%, ${activeThemeDef.pageGlowStyle}, transparent 60%)`,
            }
          : undefined
      }
    >
      <TopBar
        playMode={playMode}
        gameState={gameState}
        muted={progress.muted}
        cleanView={cleanView}
        snapshotCount={progress.snapshots.length}
        onOpenHub={() => {
          triggerHaptic('uiClick');
          setGameState('TITLE_MENU');
        }}
        onChangeMode={handleStartMode}
        onOpenGallery={() => {
          triggerHaptic('uiClick');
          setGalleryOpen(true);
        }}
        onOpenChallenges={() => {
          triggerHaptic('uiClick');
          setChallengesTab('CHALLENGES');
          setChallengesOpen(true);
        }}
        onOpenCosmetics={() => {
          triggerHaptic('uiClick');
          setChallengesTab('COSMETICS');
          setChallengesOpen(true);
        }}
        onToggleMute={handleToggleMute}
        onToggleCleanView={() => {
          triggerHaptic('uiToggle');
          setCleanView((v) => !v);
        }}
        onTogglePause={handleTogglePause}
      />

      <main
        className={`mx-auto flex w-full flex-1 flex-col gap-4 px-4 py-4 sm:px-6 ${
          cleanView ? 'max-w-[960px]' : 'max-w-[1360px]'
        }`}
      >
        {/* Animated 20-Game Switcher Strip with Swipe Arrows & Spring Pill */}
        {!cleanView && (
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-800/90 bg-[#131C2E] p-1.5">
            <button
              type="button"
              onClick={() => handleSwipeStep(-1)}
              aria-label="Previous game"
              title="Swipe to previous game ([)"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div
              role="tablist"
              aria-label="Choose a game"
              className="flex flex-1 items-center gap-1 overflow-x-auto no-scrollbar"
            >
              {GAME_CATALOG.map((g) => {
                const active = playMode === g.id && gameState !== 'TITLE_MENU';
                return (
                  <button
                    key={g.id}
                    role="tab"
                    aria-selected={active}
                    type="button"
                    onClick={() => handleStartMode(g.id)}
                    className={`relative inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                      active ? 'text-white' : 'text-slate-400 hover:text-slate-100'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="active-game-pill"
                        transition={
                          reducedMotion
                            ? { duration: 0 }
                            : { type: 'spring', stiffness: 420, damping: 32 }
                        }
                        className={`absolute inset-0 rounded-lg border ${g.activeBg}`}
                      />
                    )}
                    <span className="relative z-10 inline-flex items-center gap-1.5">
                      <GameLogo mode={g.id} className="h-4 w-4 shrink-0" />
                      <span>{g.shortLabel}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => handleSwipeStep(1)}
              aria-label="Next game"
              title="Swipe to next game (])"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex flex-1 flex-col gap-5 lg:flex-row lg:items-start">
          {/* Dominant Arena Column */}
          <div className="flex flex-1 flex-col gap-3 min-w-0">
            {/* Swipe-enabled HUD Bar */}
            <div
              onPointerDown={(e) => {
                swipeStartXRef.current = e.clientX;
              }}
              onPointerUp={(e) => {
                if (swipeStartXRef.current === null) return;
                const dx = e.clientX - swipeStartXRef.current;
                swipeStartXRef.current = null;
                if (Math.abs(dx) > 65) {
                  handleSwipeStep(dx < 0 ? 1 : -1);
                }
              }}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/90 bg-[#131C2E] px-4 py-2.5 select-none"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={playMode}
                  initial={
                    reducedMotion ? false : { opacity: 0, x: swipeDir * 22 }
                  }
                  animate={{ opacity: 1, x: 0 }}
                  exit={
                    reducedMotion
                      ? undefined
                      : { opacity: 0, x: -swipeDir * 22 }
                  }
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="min-w-0 flex items-center gap-2.5"
                >
                  <GameLogo mode={playMode} className="h-5 w-5 shrink-0" />
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-50">
                    <span>{modeMeta[playMode].title}</span>
                    {hud.feverActive && !isZenMode && (
                      <>
                        <span className="text-slate-600" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-xs font-bold text-amber-400">
                          ACTIVE
                        </span>
                      </>
                    )}
                    {modifiers.slowMo && (
                      <>
                        <span className="text-slate-600" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-xs font-semibold text-indigo-300">
                          0.36x
                        </span>
                      </>
                    )}
                    {!cleanView && (
                      <>
                        <span className="hidden md:inline text-slate-600" aria-hidden="true">
                          ·
                        </span>
                        <span className="hidden md:inline text-xs font-normal text-slate-400 truncate max-w-[290px]">
                          {modeMeta[playMode].subtitle}
                        </span>
                      </>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                {isZenMode ? (
                  <span className="text-xs font-medium text-teal-300 whitespace-nowrap">
                    Zen Mode · ASMR Flow
                  </span>
                ) : (
                  <>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Score</span>
                  <span className="font-mono-num font-bold text-slate-50">
                    {hud.score.toLocaleString()}
                  </span>
                </div>

                <span className="text-slate-700" aria-hidden="true">
                  ·
                </span>

                {playMode === 'SWARM' && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Wave</span>
                      <span className="font-mono-num font-bold text-amber-400">
                        {hud.waveOrLevel}
                      </span>
                    </div>
                    <span className="text-slate-700" aria-hidden="true">
                      ·
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Swarm</span>
                      <span className="font-mono-num font-bold text-emerald-400">
                        {hud.swarmSize}x
                      </span>
                    </div>
                  </>
                )}

                {playMode === 'RINGS' && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Level</span>
                      <span className="font-mono-num font-bold text-emerald-400">
                        {hud.waveOrLevel}
                      </span>
                    </div>
                    <span className="text-slate-700" aria-hidden="true">
                      ·
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Rings</span>
                      <span className="font-mono-num font-bold text-amber-400">
                        {hud.targetsRemaining}/{hud.targetsTotal}
                      </span>
                    </div>
                  </>
                )}

                {playMode === 'BLOOM' && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Popped</span>
                      <span className="font-mono-num font-bold text-emerald-400">
                        {bloomSettings.chaosEndless
                          ? hud.targetsRemaining
                          : `${hud.targetsRemaining}/${hud.targetsTotal}`}
                      </span>
                    </div>
                    {!bloomSettings.chaosEndless && (
                      <>
                        <span className="text-slate-700" aria-hidden="true">
                          ·
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">Taps</span>
                          <span className="font-mono-num font-bold text-amber-400">
                            {hud.swarmSize}
                          </span>
                        </div>
                      </>
                    )}
                  </>
                )}

                {playMode === 'ORBIT' && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">System</span>
                      <span className="font-mono-num font-bold text-rose-400">
                        {String(((hud.waveOrLevel - 1) % 10) + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <span className="text-slate-700" aria-hidden="true">
                      ·
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Crystals</span>
                      <span className="font-mono-num font-bold text-amber-400">
                        {hud.targetsRemaining}
                      </span>
                    </div>
                  </>
                )}

                {playMode === 'SLICE' && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Sliced</span>
                      <span className="font-mono-num font-bold text-cyan-400">
                        {hud.swarmSize}
                      </span>
                    </div>
                    {!sliceSettings.zenMode && (
                      <>
                        <span className="text-slate-700" aria-hidden="true">
                          ·
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">Lives</span>
                          <span className="font-mono-num font-bold text-rose-400">
                            {hud.targetsRemaining}/3
                          </span>
                        </div>
                      </>
                    )}
                  </>
                )}

                {playMode === 'HEX' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Moves</span>
                    <span className="font-mono-num font-bold text-teal-400">
                      {hud.swarmSize}
                    </span>
                  </div>
                )}

                {playMode === 'DOMINO' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Toppled</span>
                    <span className="font-mono-num font-bold text-orange-400">
                      {hud.activeBalls}/{hud.swarmSize}
                    </span>
                  </div>
                )}

                {playMode === 'PULSE' && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Perfects</span>
                      <span className="font-mono-num font-bold text-pink-400">
                        {hud.swarmSize}
                      </span>
                    </div>
                    <span className="text-slate-700" aria-hidden="true">
                      ·
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Combo</span>
                      <span className="font-mono-num font-bold text-amber-400">
                        {hud.combo}x
                      </span>
                    </div>
                  </>
                )}

                {playMode === 'VORTEX' && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Aurora</span>
                      <span className="font-mono-num font-bold text-indigo-400">
                        {hud.waveOrLevel}
                      </span>
                    </div>
                    <span className="text-slate-700" aria-hidden="true">
                      ·
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Wells</span>
                      <span className="font-mono-num font-bold text-emerald-400">
                        {hud.activeBalls}/{hud.targetsRemaining}
                      </span>
                    </div>
                  </>
                )}

                {playMode === 'LASER' && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Stage</span>
                      <span className="font-mono-num font-bold text-sky-400">
                        {String(((hud.waveOrLevel - 1) % LASER_LEVEL_NAMES.length) + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <span className="text-slate-700" aria-hidden="true">
                      ·
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Cores Lit</span>
                      <span className="font-mono-num font-bold text-amber-400">
                        {hud.activeBalls}/{hud.targetsTotal}
                      </span>
                    </div>
                  </>
                )}

                {playMode === 'MERGE' && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Max Tier</span>
                      <span className="font-mono-num font-bold text-fuchsia-400">
                        {hud.waveOrLevel}/9
                      </span>
                    </div>
                    <span className="text-slate-700" aria-hidden="true">
                      ·
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Orbs</span>
                      <span className="font-mono-num font-bold text-amber-400">
                        {hud.activeBalls}
                      </span>
                    </div>
                  </>
                )}

                {playMode === 'PLINKO' && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Jackpots</span>
                      <span className="font-mono-num font-bold text-amber-400">
                        {hud.waveOrLevel}
                      </span>
                    </div>
                    <span className="text-slate-700" aria-hidden="true">
                      ·
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Marbles</span>
                      <span className="font-mono-num font-bold text-sky-400">
                        {hud.activeBalls}
                      </span>
                    </div>
                  </>
                )}

                {playMode === 'BUBBLE' && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Sheet</span>
                      <span className="font-mono-num font-bold text-emerald-400">
                        {hud.waveOrLevel}
                      </span>
                    </div>
                    <span className="text-slate-700" aria-hidden="true">
                      ·
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Popped</span>
                      <span className="font-mono-num font-bold text-amber-400">
                        {hud.activeBalls}/{hud.targetsTotal}
                      </span>
                    </div>
                  </>
                )}

                {playMode === 'VACUUM' && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Size Tier</span>
                      <span className="font-mono-num font-bold text-violet-400">
                        {hud.waveOrLevel}/6
                      </span>
                    </div>
                    <span className="text-slate-700" aria-hidden="true">
                      ·
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Swallowed</span>
                      <span className="font-mono-num font-bold text-amber-400">
                        {hud.swarmSize}
                      </span>
                    </div>
                  </>
                )}

                {playMode === 'SAND' && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Grains</span>
                      <span className="font-mono-num font-bold text-amber-400">
                        {hud.activeBalls}
                      </span>
                    </div>
                    <span className="text-slate-700" aria-hidden="true">
                      ·
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Caught</span>
                      <span className="font-mono-num font-bold text-emerald-400">
                        {hud.swarmSize.toLocaleString()}
                      </span>
                    </div>
                  </>
                )}

                {playMode === 'CHIME' && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Notes</span>
                      <span className="font-mono-num font-bold text-cyan-300">
                        {hud.swarmSize.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-slate-700" aria-hidden="true">
                      ·
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Active</span>
                      <span className="font-mono-num font-bold text-amber-400">
                        {hud.activeBalls}
                      </span>
                    </div>
                  </>
                )}

                {playMode === 'TRACK' && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Goal</span>
                      <span className="font-mono-num font-bold text-emerald-300">
                        {hud.targetsRemaining}/{hud.targetsTotal}
                      </span>
                    </div>
                    <span className="text-slate-700" aria-hidden="true">
                      ·
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Chimes</span>
                      <span className="font-mono-num font-bold text-cyan-300">
                        {hud.swarmSize.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-slate-700" aria-hidden="true">
                      ·
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Marbles</span>
                      <span className="font-mono-num font-bold text-amber-400">
                        {hud.activeBalls}
                      </span>
                    </div>
                  </>
                )}

                {playMode === 'PENDULUM' && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Notes</span>
                      <span className="font-mono-num font-bold text-sky-300">
                        {hud.swarmSize.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-slate-700" aria-hidden="true">
                      ·
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Swinging</span>
                      <span className="font-mono-num font-bold text-amber-400">
                        {hud.activeBalls}
                      </span>
                    </div>
                  </>
                )}

                {playMode === 'POND' && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Ripples</span>
                      <span className="font-mono-num font-bold text-teal-300">
                        {hud.swarmSize.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-slate-700" aria-hidden="true">
                      ·
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Koi</span>
                      <span className="font-mono-num font-bold text-amber-400">
                        {hud.activeBalls}
                      </span>
                    </div>
                  </>
                )}

                {playMode === 'SANDBOX' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Marbles</span>
                    <span className="font-mono-num font-bold text-sky-400">
                      {hud.activeBalls}
                    </span>
                  </div>
                )}

                <span className="text-slate-700" aria-hidden="true">
                  ·
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Best</span>
                  <span className="font-mono-num font-bold text-sky-400">
                    {hud.maxCombo}x
                  </span>
                </div>

                <span className="text-slate-700" aria-hidden="true">
                  ·
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setChallengesTab('CHALLENGES');
                    setChallengesOpen(true);
                  }}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    claimableDailyCount > 0
                      ? 'border-amber-400 bg-amber-500 text-slate-950 hover:bg-amber-400'
                      : 'border-slate-700 bg-slate-800/80 text-amber-300 hover:bg-slate-700'
                  }`}
                >
                  <Gem className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="font-mono-num">
                    {progress.shards} · {completedDailyCount}/{todayChallenges.length}
                  </span>
                </button>
                  </>
                )}

                {playMode === 'SWARM' && swarmFiring && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = canvasRef.current?.toggleSwarmSpeed() ?? 1;
                      setSwarmSpeedMult(next);
                    }}
                    className={`inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                      swarmSpeedMult > 1
                        ? 'bg-amber-500 text-slate-950'
                        : 'border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    <FastForward className="h-3.5 w-3.5" />
                    <span>{swarmSpeedMult > 1 ? '2x' : '1x'}</span>
                  </button>
                )}

                {playMode === 'RINGS' && (
                  <>
                    <button
                      type="button"
                      onClick={() => canvasRef.current?.spawnRingBall()}
                      className="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-400 px-2.5 text-xs font-semibold text-slate-950 hover:bg-emerald-300 transition-colors whitespace-nowrap"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span>+Marble</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => canvasRef.current?.pulseRings()}
                      className="inline-flex h-8 items-center gap-1 rounded-lg bg-sky-400 px-2.5 text-xs font-semibold text-slate-950 hover:bg-sky-300 transition-colors whitespace-nowrap"
                    >
                      <Radio className="h-3.5 w-3.5" />
                      <span>Pulse</span>
                    </button>
                  </>
                )}

                {gameState === 'PLAYING' && (
                  <button
                    type="button"
                    onClick={handleCaptureSnapshot}
                    title="Save snapshot to Gallery"
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-teal-500/50 bg-teal-950/50 px-2.5 text-xs font-semibold text-teal-200 hover:bg-teal-900/60 transition-colors whitespace-nowrap"
                  >
                    <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Snap</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleStartMode(playMode)}
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors whitespace-nowrap"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Interactive 60fps Game Canvas with Directional Swipe Transition */}
            <div className="relative overflow-hidden rounded-xl">
              <GameCanvas
                ref={canvasRef}
                gameState={gameState}
                playMode={playMode}
                modifiers={modifiers}
                ringSettings={ringSettings}
                bloomSettings={bloomSettings}
                orbitSettings={orbitSettings}
                sliceSettings={sliceSettings}
                hexSettings={hexSettings}
                dominoActionMode={dominoActionMode}
                beatAutoPlay={beatAutoPlay}
                vortexSwirl={vortexSwirl}
                vortexRepel={vortexRepel}
                laserAutoRotate={laserAutoRotate}
                sandBrush={sandBrush}
                sandAutoFountain={sandAutoFountain}
                chimeActionMode={chimeActionMode}
                chimeVoice={chimeVoice}
                chimeScale={chimeScale}
                chimeAutoFlow={chimeAutoFlow}
                trackActionMode={trackActionMode}
                trackAutoFlow={trackAutoFlow}
                pendulumTrails={pendulumTrails}
                pendulumAutoPulse={pendulumAutoPulse}
                pendulumVoice={pendulumVoice}
                pondRain={pondRain}
                pondWhirlpool={pondWhirlpool}
                activeBrush={activeBrush}
                sandboxActionMode={sandboxActionMode}
                orbitActionMode={orbitActionMode}
                equippedTheme={progress.equippedTheme}
                equippedFx={progress.equippedFx}
                customTrail={progress.customTrail}
                reducedMotion={reducedMotion}
                zenMode={isZenMode}
                onHudChange={handleHudChange}
                onSwarmPhaseChange={(firing, speed) => {
                  setSwarmFiring(firing);
                  setSwarmSpeedMult(speed);
                }}
                onLaserSolvedChange={setLaserSolvedLevels}
                onLaserStageCleared={handleLaserStageCleared}
                onGameOver={handleGameOver}
              />

              {/* Non-blocking Snapshot Saved Toast */}
              <AnimatePresence>
                {snapshotToast && (
                  <motion.div
                    initial={reducedMotion ? false : { opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reducedMotion ? undefined : { opacity: 0, y: -12 }}
                    transition={{ duration: 0.18 }}
                    className="pointer-events-auto absolute top-3 left-3 z-15 flex items-center gap-2.5 rounded-xl border border-teal-400/70 bg-slate-950/92 px-3 py-2 shadow-xl backdrop-blur-sm"
                  >
                    <ImageIcon className="h-4 w-4 text-teal-300 shrink-0" aria-hidden="true" />
                    <span className="truncate text-xs font-semibold text-white max-w-[210px]">
                      {snapshotToast}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSnapshotToast(null);
                        setGalleryOpen(true);
                      }}
                      className="inline-flex h-7 items-center rounded-md bg-teal-400 px-2.5 text-[11px] font-semibold text-slate-950 hover:bg-teal-300 transition-colors whitespace-nowrap"
                    >
                      View
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Non-blocking Daily Challenge Completed Toast (suppressed in Zen Mode) */}
              <AnimatePresence>
                {completedToast && gameState === 'PLAYING' && !isZenMode && (
                  <motion.div
                    initial={reducedMotion ? false : { opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reducedMotion ? undefined : { opacity: 0, y: -12 }}
                    transition={{ duration: 0.18 }}
                    className="pointer-events-auto absolute top-3 right-3 z-15 flex items-center gap-3 rounded-xl border border-amber-400/70 bg-slate-950/92 px-3.5 py-2.5 shadow-xl backdrop-blur-sm"
                  >
                    <Trophy
                      className="h-4 w-4 shrink-0 text-amber-400"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-amber-300">
                        Daily Challenge Complete
                      </div>
                      <div className="truncate text-xs font-bold text-white max-w-[200px]">
                        {completedToast.title}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleClaimChallenge(completedToast.id)}
                      className="inline-flex h-8 items-center gap-1 rounded-lg bg-amber-400 px-3 text-xs font-semibold text-slate-950 hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0"
                    >
                      <Gem className="h-3 w-3" aria-hidden="true" />
                      <span>Claim +{completedToast.reward}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompletedToast(null)}
                      aria-label="Dismiss notification"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Directional Swipe Sweep Curtain on Game Switch */}
              <AnimatePresence>
                {modeTransitionTick > 0 && !reducedMotion && gameState === 'PLAYING' && (
                  <motion.div
                    key={modeTransitionTick}
                    initial={{ x: `${swipeDir * 100}%`, opacity: 0.7 }}
                    animate={{ x: `${-swipeDir * 105}%`, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
                    className="pointer-events-none absolute inset-0 z-10 rounded-xl bg-gradient-to-r from-transparent via-sky-300/20 to-transparent border-x border-sky-300/35"
                  />
                )}
              </AnimatePresence>

              {/* Title Menu Hub Overlay (All 20 Games!) */}
              <AnimatePresence>
                {gameState === 'TITLE_MENU' && (
                  <motion.div
                    initial={reducedMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reducedMotion ? undefined : { opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-slate-950/88 p-4 backdrop-blur-sm overflow-y-auto"
                  >
                    <motion.div
                      initial={reducedMotion ? false : { opacity: 0, scale: 0.96, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={reducedMotion ? undefined : { opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="w-full max-w-4xl rounded-xl border border-slate-700/80 bg-[#131C2E] p-5 shadow-2xl sm:p-6"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="mb-1 text-xs font-semibold text-amber-400">
                            20 Satisfying Arcade, Physics &amp; Extreme Challenge Games
                          </div>
                          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl [text-wrap:balance]">
                            Pick any world to play, push into Extreme levels, and watch hypnotic reactions.
                          </h1>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setGalleryOpen(true)}
                            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-teal-400/50 bg-teal-500/15 px-3 text-xs font-semibold text-teal-200 hover:bg-teal-500/25 transition-colors whitespace-nowrap shrink-0"
                          >
                            <ImageIcon className="h-4 w-4 text-teal-300" aria-hidden="true" />
                            <span>
                              Gallery
                              {progress.snapshots.length > 0
                                ? ` (${progress.snapshots.length})`
                                : ''}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setChallengesTab('CHALLENGES');
                              setChallengesOpen(true);
                            }}
                            className="inline-flex h-10 items-center gap-2 rounded-lg border border-amber-400/60 bg-amber-500/15 px-3.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/25 transition-colors whitespace-nowrap shrink-0"
                          >
                            <Trophy className="h-4 w-4 text-amber-400" aria-hidden="true" />
                            <span>
                              Daily Goals ({completedDailyCount}/{todayChallenges.length})
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono-num text-amber-300">
                              {progress.shards} Shards
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-5">
                        {GAME_CATALOG.map((g, idx) => (
                          <motion.button
                            key={g.id}
                            type="button"
                            initial={
                              reducedMotion ? false : { opacity: 0, y: 10 }
                            }
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.2,
                              delay: reducedMotion ? 0 : idx * 0.02,
                            }}
                            whileHover={reducedMotion ? undefined : { y: -3, scale: 1.02 }}
                            whileTap={reducedMotion ? undefined : { scale: 0.97 }}
                            onClick={() => handleStartMode(g.id)}
                            className={`flex flex-col items-start rounded-xl border ${g.accentBorder} bg-slate-900/75 p-3 text-left hover:bg-slate-800 transition-colors`}
                          >
                            <GameLogo mode={g.id} className="h-7 w-7" />
                            <div className="mt-2 font-display text-sm font-bold text-white">
                              {g.title}
                            </div>
                            <div className="mt-1 text-[11px] leading-snug text-slate-400">
                              {g.desc}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pause Overlay */}
              <AnimatePresence>
                {gameState === 'PAUSED' && (
                  <motion.div
                    initial={reducedMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reducedMotion ? undefined : { opacity: 0 }}
                    transition={{ duration: 0.16 }}
                    className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-slate-950/75 p-4 backdrop-blur-sm"
                  >
                    <motion.div
                      initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={reducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.16 }}
                      className="w-full max-w-sm rounded-xl border border-slate-700 bg-[#131C2E] p-6 text-center shadow-2xl"
                    >
                      <h2 className="font-display text-2xl font-bold text-white">
                        Paused
                      </h2>
                      <p className="mt-2 text-sm text-slate-400">
                        Press P or Resume to jump right back into the action.
                      </p>
                      <div className="mt-6 flex flex-col gap-2.5">
                        <button
                          type="button"
                          onClick={() => setGameState('PLAYING')}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
                        >
                          <Play className="h-4 w-4 fill-current" />
                          <span>Resume Play</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartMode(playMode)}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors"
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span>Restart Mode</span>
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Game Over Modal (Swarm / Slice) */}
              <AnimatePresence>
                {gameState === 'GAME_OVER' && (
                  <motion.div
                    initial={reducedMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reducedMotion ? undefined : { opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-slate-950/82 p-4 backdrop-blur-sm"
                  >
                    <motion.div
                      initial={reducedMotion ? false : { opacity: 0, scale: 0.95, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={reducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.18 }}
                      className="w-full max-w-md rounded-xl border border-slate-700 bg-[#131C2E] p-6 shadow-2xl"
                    >
                      <div className="text-xs font-semibold text-rose-400">
                        {playMode === 'SLICE' ? 'Sliced Hazard' : 'Wave Reached Danger Line'}
                      </div>
                      <h2 className="mt-1 font-display text-2xl font-bold text-white">
                        {playMode === 'SLICE'
                          ? `Sliced ${hud.swarmSize} Prisms`
                          : `Run Complete — Wave ${hud.waveOrLevel}`}
                      </h2>

                      <div className="mt-5 grid grid-cols-2 gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm">
                        <div>
                          <div className="text-xs text-slate-400">Score</div>
                          <div className="font-mono-num mt-0.5 text-lg font-bold text-amber-400">
                            {hud.score.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400">Max Combo</div>
                          <div className="font-mono-num mt-0.5 text-lg font-bold text-sky-400">
                            {hud.maxCombo}x
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleStartMode(playMode)}
                          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap"
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span>Play Again</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setGameState('TITLE_MENU')}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors whitespace-nowrap"
                        >
                          <span>All 20 Games</span>
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Directional Swipe-Animated Side Panel */}
          {!cleanView && (
            <AnimatePresence mode="wait" custom={swipeDir}>
              <motion.div
                key={playMode}
                custom={swipeDir}
                initial={
                  reducedMotion ? false : { opacity: 0, x: swipeDir * 32 }
                }
                animate={{ opacity: 1, x: 0 }}
                exit={
                  reducedMotion
                    ? undefined
                    : { opacity: 0, x: -swipeDir * 24 }
                }
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 360, damping: 28 }
                }
                className="w-full lg:w-[330px] lg:shrink-0"
              >
                <FunControlsPanel
                  playMode={playMode}
                  modifiers={modifiers}
                  swarmPreset={swarmPreset}
                  ringSettings={ringSettings}
                  ringPreset={ringPreset}
                  bloomPreset={bloomPreset}
                  bloomSettings={bloomSettings}
                  orbitSettings={orbitSettings}
                  orbitLevel={orbitLevel}
                  slicePreset={slicePreset}
                  sliceSettings={sliceSettings}
                  hexLevel={hexLevel}
                  hexSettings={hexSettings}
                  dominoPreset={dominoPreset}
                  dominoActionMode={dominoActionMode}
                  beatLevel={beatLevel}
                  beatAutoPlay={beatAutoPlay}
                  vortexLevel={vortexLevel}
                  vortexSwirl={vortexSwirl}
                  vortexRepel={vortexRepel}
                  laserLevel={laserLevel}
                  laserSolvedLevels={laserSolvedLevels}
                  laserAutoRotate={laserAutoRotate}
                  mergePreset={mergePreset}
                  plinkoPreset={plinkoPreset}
                  bubblePreset={bubblePreset}
                  vacuumPreset={vacuumPreset}
                  sandPreset={sandPreset}
                  sandBrush={sandBrush}
                  sandAutoFountain={sandAutoFountain}
                  chimePreset={chimePreset}
                  chimeActionMode={chimeActionMode}
                  chimeVoice={chimeVoice}
                  chimeScale={chimeScale}
                  chimeAutoFlow={chimeAutoFlow}
                  trackPreset={trackPreset}
                  trackActionMode={trackActionMode}
                  trackAutoFlow={trackAutoFlow}
                  pendulumPreset={pendulumPreset}
                  pendulumVoice={pendulumVoice}
                  pendulumTrails={pendulumTrails}
                  pendulumAutoPulse={pendulumAutoPulse}
                  pondPreset={pondPreset}
                  pondRain={pondRain}
                  pondWhirlpool={pondWhirlpool}
                  sandboxPreset={sandboxPreset}
                  activeBrush={activeBrush}
                  sandboxActionMode={sandboxActionMode}
                  orbitActionMode={orbitActionMode}
                  swarmFiring={swarmFiring}
                  swarmSpeedMult={swarmSpeedMult}
                  zenMode={isZenMode}
                  onToggleZenMode={handleToggleZenMode}
                  onToggleModifier={handleToggleModifier}
                  onSelectSwarmPreset={handleSelectSwarmPreset}
                  onToggleRingSetting={handleToggleRingSetting}
                  onSelectRingPreset={handleSelectRingPreset}
                  onSelectBloomPreset={handleSelectBloomPreset}
                  onToggleBloomSetting={handleToggleBloomSetting}
                  onToggleOrbitSetting={handleToggleOrbitSetting}
                  onSelectOrbitLevel={handleSelectOrbitLevel}
                  onSelectSlicePreset={handleSelectSlicePreset}
                  onToggleSliceSetting={handleToggleSliceSetting}
                  onSelectHexLevel={handleSelectHexLevel}
                  onToggleHexSetting={handleToggleHexSetting}
                  onSelectDominoPreset={handleSelectDominoPreset}
                  onSetDominoActionMode={(m) => {
                    triggerHaptic('uiClick');
                    setDominoActionMode(m);
                  }}
                  onDominoStartTopple={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.toppleDominoes();
                  }}
                  onSelectBeatLevel={handleSelectBeatLevel}
                  onToggleBeatAutoPlay={() => {
                    soundEngine.unlock();
                    soundEngine.playPlaceToy();
                    triggerHaptic('uiToggle');
                    setBeatAutoPlay((v) => !v);
                  }}
                  onSelectVortexLevel={handleSelectVortexLevel}
                  onToggleVortexSwirl={() => {
                    soundEngine.unlock();
                    soundEngine.playPlaceToy();
                    triggerHaptic('uiToggle');
                    setVortexSwirl((v) => !v);
                  }}
                  onToggleVortexRepel={() => {
                    soundEngine.unlock();
                    soundEngine.playPlaceToy();
                    triggerHaptic('uiToggle');
                    setVortexRepel((v) => !v);
                  }}
                  onVortexBurst={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.burstVortex();
                  }}
                  onSelectLaserLevel={handleSelectLaserLevel}
                  onToggleLaserAutoRotate={() => {
                    soundEngine.unlock();
                    soundEngine.playPlaceToy();
                    triggerHaptic('uiToggle');
                    setLaserAutoRotate((v) => !v);
                  }}
                  onLaserReset={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.loadLaserLevel(laserLevel);
                  }}
                  onSelectMergePreset={handleSelectMergePreset}
                  onMergeDrop={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.dropMerge();
                  }}
                  onMergeShake={() => {
                    triggerHaptic('collision');
                    canvasRef.current?.shakeMerge();
                  }}
                  onMergeReset={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.loadMergePreset(mergePreset);
                  }}
                  onSelectPlinkoPreset={handleSelectPlinkoPreset}
                  onPlinkoDrop={(count) => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.dropPlinkoBatch(count);
                  }}
                  onPlinkoReset={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.loadPlinkoPreset(plinkoPreset);
                  }}
                  onSelectBubblePreset={handleSelectBubblePreset}
                  onBubbleReset={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.loadBubblePreset(bubblePreset);
                  }}
                  onSelectVacuumPreset={handleSelectVacuumPreset}
                  onVacuumPulse={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.pulseVacuum();
                  }}
                  onVacuumReset={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.loadVacuumPreset(vacuumPreset);
                  }}
                  onSelectSandPreset={handleSelectSandPreset}
                  onSelectSandBrush={(b) => {
                    triggerHaptic('uiClick');
                    setSandBrush(b);
                  }}
                  onToggleSandAutoFountain={() => {
                    soundEngine.unlock();
                    soundEngine.playPlaceToy();
                    triggerHaptic('uiToggle');
                    setSandAutoFountain((v) => !v);
                  }}
                  onSandBurst={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.burstSand();
                  }}
                  onSandClearWalls={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.clearSandWalls();
                  }}
                  onSandReset={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.loadSandPreset(sandPreset);
                  }}
                  onSelectChimePreset={handleSelectChimePreset}
                  onSelectChimeActionMode={(m) => {
                    triggerHaptic('uiClick');
                    setChimeActionMode(m);
                  }}
                  onSelectChimeVoice={(v) => {
                    soundEngine.unlock();
                    soundEngine.playPlaceToy();
                    triggerHaptic('uiClick');
                    setChimeVoice(v);
                  }}
                  onSelectChimeScale={(sc) => {
                    soundEngine.unlock();
                    soundEngine.playPlaceToy();
                    triggerHaptic('uiClick');
                    setChimeScale(sc);
                  }}
                  onToggleChimeAutoFlow={() => {
                    soundEngine.unlock();
                    soundEngine.playPlaceToy();
                    triggerHaptic('uiToggle');
                    setChimeAutoFlow((v) => !v);
                  }}
                  onChimeShower={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.dropChimeShower();
                  }}
                  onChimeStrumAll={() => {
                    triggerHaptic('chime');
                    canvasRef.current?.strumChimes();
                  }}
                  onChimeReset={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.loadChimePreset(chimePreset);
                  }}
                  onSelectTrackPreset={handleSelectTrackPreset}
                  onSelectTrackActionMode={(m) => {
                    triggerHaptic('uiClick');
                    setTrackActionMode(m);
                  }}
                  onToggleTrackAutoFlow={() => {
                    soundEngine.unlock();
                    soundEngine.playPlaceToy();
                    triggerHaptic('uiToggle');
                    setTrackAutoFlow((v) => !v);
                  }}
                  onTrackDropWave={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.dropTrackWave();
                  }}
                  onTrackReset={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.loadTrackPreset(trackPreset);
                  }}
                  onSelectPendulumPreset={handleSelectPendulumPreset}
                  onSelectPendulumVoice={(v) => {
                    soundEngine.unlock();
                    soundEngine.playPlaceToy();
                    triggerHaptic('uiClick');
                    setPendulumVoice(v);
                  }}
                  onTogglePendulumTrails={() => {
                    soundEngine.unlock();
                    soundEngine.playPlaceToy();
                    triggerHaptic('uiToggle');
                    setPendulumTrails((v) => !v);
                  }}
                  onTogglePendulumAutoPulse={() => {
                    soundEngine.unlock();
                    soundEngine.playPlaceToy();
                    triggerHaptic('uiToggle');
                    setPendulumAutoPulse((v) => !v);
                  }}
                  onPendulumPulse={() => {
                    soundEngine.unlock();
                    triggerHaptic('chime');
                    canvasRef.current?.pulsePendulum();
                  }}
                  onPendulumClearTrails={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.clearPendulumTrails();
                  }}
                  onPendulumReset={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.loadPendulumPreset(pendulumPreset);
                  }}
                  onSelectPondPreset={handleSelectPondPreset}
                  onTogglePondRain={() => {
                    soundEngine.unlock();
                    soundEngine.playPlaceToy();
                    triggerHaptic('uiToggle');
                    setPondRain((v) => !v);
                  }}
                  onTogglePondWhirlpool={() => {
                    soundEngine.unlock();
                    soundEngine.playPlaceToy();
                    triggerHaptic('uiToggle');
                    setPondWhirlpool((v) => !v);
                  }}
                  onPondScatterPetals={() => {
                    soundEngine.unlock();
                    triggerHaptic('pickup');
                    canvasRef.current?.scatterPondPetals();
                  }}
                  onPondClearRipples={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.clearPondRipples();
                  }}
                  onPondReset={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.loadPondPreset(pondPreset);
                  }}
                  onSelectSandboxPreset={handleSelectSandboxPreset}
                  onSelectBrush={(b) => {
                    triggerHaptic('uiClick');
                    setActiveBrush(b);
                  }}
                  onSetSandboxActionMode={(m) => {
                    triggerHaptic('uiClick');
                    setSandboxActionMode(m);
                  }}
                  onSetOrbitActionMode={(m) => {
                    triggerHaptic('uiClick');
                    setOrbitActionMode(m);
                  }}
                  onSwarmToggleSpeed={() => {
                    triggerHaptic('uiToggle');
                    const next = canvasRef.current?.toggleSwarmSpeed() ?? 1;
                    setSwarmSpeedMult(next);
                  }}
                  onSwarmRecall={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.recallSwarm();
                  }}
                  onSwarmRestart={() => handleStartMode('SWARM')}
                  onRingSpawnBall={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.spawnRingBall();
                  }}
                  onRingPulse={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.pulseRings();
                  }}
                  onRingNextLevel={() => handleStartMode('RINGS')}
                  onBloomReset={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.resetBloom();
                  }}
                  onOrbitConstellation={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.launchOrbitConstellation();
                  }}
                  onOrbitClearTrails={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.clearOrbitTrails();
                  }}
                  onOrbitReset={() => handleStartMode('ORBIT')}
                  onSliceReset={() => handleStartMode('SLICE')}
                  onHexReset={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.resetHex();
                  }}
                  onLaunchSingle={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.launchSingle();
                  }}
                  onLaunchAvalanche={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.launchAvalanche();
                  }}
                  onLaunchSupernova={() => {
                    triggerHaptic('explosion');
                    canvasRef.current?.launchSupernova();
                  }}
                  onClearAllPegs={() => {
                    triggerHaptic('uiClick');
                    canvasRef.current?.clearSandboxBoard();
                  }}
                />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      <DailyChallengesModal
        open={challengesOpen}
        activeTab={challengesTab}
        challenges={todayChallenges}
        dailyState={progress.dailyState}
        shards={progress.shards}
        unlockedCosmetics={progress.unlockedCosmetics}
        equippedTheme={progress.equippedTheme}
        equippedFx={progress.equippedFx}
        customTrail={progress.customTrail}
        soundscape={progress.soundscape}
        reducedMotion={reducedMotion}
        onChangeTab={setChallengesTab}
        onClose={() => setChallengesOpen(false)}
        onJumpToGame={handleStartMode}
        onClaimChallenge={handleClaimChallenge}
        onClaimAllClearBonus={handleClaimAllClearBonus}
        onUnlockTheme={handleUnlockTheme}
        onEquipTheme={handleEquipTheme}
        onUnlockFx={handleUnlockFx}
        onEquipFx={handleEquipFx}
        onUpdateCustomTrail={handleUpdateCustomTrail}
        onUpdateSoundscape={handleUpdateSoundscape}
      />

      <GalleryModal
        open={galleryOpen}
        snapshots={progress.snapshots}
        canCapture={gameState === 'PLAYING'}
        reducedMotion={reducedMotion}
        onClose={() => setGalleryOpen(false)}
        onCaptureNow={handleCaptureSnapshot}
        onSaveWallpaperFrame={handleSaveWallpaperFrame}
        onRenameSnapshot={handleRenameSnapshot}
        onDeleteSnapshot={handleDeleteSnapshot}
        onJumpToGame={handleStartMode}
      />
    </div>
  );
}
