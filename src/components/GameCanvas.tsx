import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { soundEngine } from '../audio/soundEngine';
import {
  BeatPulseWorld,
  createBeatPulseWorld,
  renderBeatPulseWorld,
  stepBeatPulseWorld,
  triggerBeatHit,
} from '../game/beatPulseEngine';
import {
  BloomWorld,
  createBloomWorld,
  renderBloomWorld,
  rippleBloomOrbsNear,
  stepBloomWorld,
  triggerBloomAt,
} from '../game/bloomChainEngine';
import {
  BubblePopWorld,
  createBubblePopWorld,
  popBubbleAt,
  renderBubblePopWorld,
  stepBubblePopWorld,
} from '../game/bubblePopEngine';
import {
  createDominoWorld,
  DominoWorld,
  addDominoAt,
  renderDominoWorld,
  stepDominoWorld,
  toppleNearestDomino,
} from '../game/dominoFlowEngine';
import {
  addGravityNode,
  createOrbitWorld,
  launchComet,
  launchCometConstellation,
  OrbitWorld,
  renderOrbitWorld,
  stepOrbitWorld,
} from '../game/gravityOrbitEngine';
import {
  createHexWorld,
  HexRippleWorld,
  renderHexWorld,
  stepHexWorld,
  triggerHexRippleAt,
} from '../game/hexRippleEngine';
import {
  createOrbMergeWorld,
  dropMergeOrb,
  OrbMergeWorld,
  renderOrbMergeWorld,
  shakeMergeBowl,
  stepOrbMergeWorld,
} from '../game/orbMergeEngine';
import {
  createBall,
  getLaunchVelocity,
  placeToyPeg,
  SimWorld,
  spawnFloatingText,
  spawnParticles,
  spawnRing,
  stepSimulation,
} from '../game/physics';
import {
  createPlinkoWorld,
  dropPlinkoBalls,
  PlinkoWorld,
  renderPlinkoWorld,
  stepPlinkoWorld,
} from '../game/plinkoEngine';
import {
  createPrismLaserWorld,
  endLaserDragAt,
  moveLaserDragAt,
  PrismLaserWorld,
  renderPrismLaserWorld,
  startLaserDragAt,
  stepPrismLaserWorld,
} from '../game/prismLaserEngine';
import { renderArena } from '../game/renderer';
import {
  createRingEscapeWorld,
  renderRingEscapeWorld,
  RingEscapeWorld,
  spawnRingBall,
  stepRingEscapeWorld,
  triggerRingPulse,
} from '../game/ringEscapeEngine';
import {
  addBladePoint,
  createSliceWorld,
  renderSliceWorld,
  SliceWorld,
  stepSliceWorld,
} from '../game/sliceEngine';
import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  buildSandboxPreset,
  buildSandboxStarterPegs,
  LAUNCHER_X,
  LAUNCHER_Y,
} from '../game/stages';
import {
  createSwarmWorld,
  launchSwarmVolley,
  recallSwarmBalls,
  renderSwarmWorld,
  stepSwarmWorld,
  SwarmWorld,
} from '../game/swarmEngine';
import { getArenaTheme, getTrailFx, mixHexColors } from '../game/cosmetics';
import {
  applySandBrushAt,
  burstSandFountain,
  ChromaSandWorld,
  createChromaSandWorld,
  renderChromaSandWorld,
  stepChromaSandWorld,
} from '../game/chromaSandEngine';
import {
  addUserChimeBar,
  ChimeWorld,
  createChimeWorld,
  eraseChimeAt,
  renderChimeWorld,
  spawnChimeMarbleAt,
  stepChimeWorld,
  strumAllChimes,
  strumChimesNear,
} from '../game/chimeEngine';
import {
  addUserTrackBell,
  addUserTrackRail,
  addUserTrackSeesaw,
  createMarbleRunWorld,
  eraseTrackAt,
  MarbleRunWorld,
  renderMarbleRunWorld,
  spawnTrackMarbleAt,
  stepMarbleRunWorld,
} from '../game/marbleRunEngine';
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
  SandboxPreset,
  SandBrush,
  SandPreset,
  SlicePreset,
  SliceSettings,
  SwarmPreset,
  ToyBrush,
  TrackActionMode,
  TrackPreset,
  TrailFxId,
  VacuumPreset,
  VortexLevelId,
} from '../game/types';
import {
  clearPendulumTrails,
  createPendulumWorld,
  endPendulumDrag,
  interactPendulumAt,
  movePendulumDragAt,
  PendulumVoice,
  PendulumWorld,
  pulsePendulumWave,
  renderPendulumWorld,
  stepPendulumWorld,
} from '../game/pendulumEngine';
import {
  clearPondRipples,
  createPondWorld,
  KoiPondWorld,
  renderPondWorld,
  scatterPondPetals,
  spawnPondRippleAt,
  stepPondWorld,
} from '../game/koiPondEngine';
import {
  createVacuumWorld,
  renderVacuumWorld,
  stepVacuumWorld,
  triggerVacuumPulse,
  VacuumWorld,
} from '../game/vacuumEngine';
import {
  burstVortexAt,
  createVortexWorld,
  renderVortexWorld,
  stepVortexWorld,
  VortexPaintWorld,
} from '../game/vortexPaintEngine';
import {
  DominoActionMode,
  OrbitActionMode,
  SandboxActionMode,
} from './FunControlsPanel';

export interface GameCanvasHandle {
  resetSwarm: () => void;
  loadSwarmPreset: (preset: SwarmPreset) => void;
  toggleSwarmSpeed: () => number;
  recallSwarm: () => void;
  resetRings: (megaTen?: boolean) => void;
  loadRingPreset: (preset: RingLevelPreset) => void;
  spawnRingBall: () => void;
  pulseRings: () => void;
  resetBloom: () => void;
  loadBloomPreset: (preset: BloomPreset) => void;
  resetOrbit: () => void;
  loadOrbitLevel: (level: number) => void;
  launchOrbitConstellation: () => void;
  clearOrbitTrails: () => void;
  resetSlice: () => void;
  loadSlicePreset: (preset: SlicePreset) => void;
  resetHex: () => void;
  loadHexLevel: (levelId: HexLevelId) => void;
  loadDominoPreset: (preset: DominoPreset) => void;
  toppleDominoes: () => void;
  loadBeatLevel: (id: BeatLevelId) => void;
  loadVortexLevel: (id: VortexLevelId) => void;
  burstVortex: () => void;
  loadLaserLevel: (level: number) => void;
  loadMergePreset: (preset: MergePreset) => void;
  dropMerge: () => void;
  shakeMerge: () => void;
  loadPlinkoPreset: (preset: PlinkoPreset) => void;
  dropPlinkoBatch: (count: number) => void;
  loadBubblePreset: (preset: BubblePreset) => void;
  loadVacuumPreset: (preset: VacuumPreset) => void;
  pulseVacuum: () => void;
  loadSandPreset: (preset: SandPreset) => void;
  burstSand: () => void;
  clearSandWalls: () => void;
  loadChimePreset: (preset: ChimePreset) => void;
  dropChimeShower: () => void;
  strumChimes: () => void;
  loadTrackPreset: (preset: TrackPreset) => void;
  dropTrackWave: () => void;
  loadPendulumPreset: (preset: PendulumPreset) => void;
  pulsePendulum: (dir?: number) => void;
  clearPendulumTrails: () => void;
  loadPondPreset: (preset: PondPreset) => void;
  scatterPondPetals: () => void;
  clearPondRipples: () => void;
  loadSandboxStarter: () => void;
  loadSandboxPreset: (preset: SandboxPreset) => void;
  clearSandboxBoard: () => void;
  launchSingle: () => void;
  launchAvalanche: () => void;
  launchSupernova: () => void;
  nudgeAim: (deltaRad: number) => void;
  triggerComboExplosion: (milestone: number, isMajor25: boolean) => void;
  captureSnapshot: () => string | null;
}

interface GameCanvasProps {
  gameState: GameState;
  playMode: PlayMode;
  modifiers: FunModifiers;
  ringSettings: RingEscapeSettings;
  bloomSettings: BloomSettings;
  orbitSettings: OrbitSettings;
  sliceSettings: SliceSettings;
  hexSettings: HexRippleSettings;
  dominoActionMode: DominoActionMode;
  beatAutoPlay: boolean;
  vortexSwirl: boolean;
  vortexRepel: boolean;
  laserAutoRotate: boolean;
  sandBrush: SandBrush;
  sandAutoFountain: boolean;
  chimeActionMode: ChimeActionMode;
  chimeVoice: ChimeVoiceId;
  chimeScale: ChimeScaleId;
  chimeAutoFlow: boolean;
  trackActionMode: TrackActionMode;
  trackAutoFlow: boolean;
  pendulumTrails: boolean;
  pendulumAutoPulse: boolean;
  pendulumVoice: PendulumVoice;
  pondRain: boolean;
  pondWhirlpool: boolean;
  activeBrush: ToyBrush;
  sandboxActionMode: SandboxActionMode;
  orbitActionMode: OrbitActionMode;
  equippedTheme: ArenaThemeId;
  equippedFx: TrailFxId;
  customTrail: CustomTrailConfig;
  reducedMotion: boolean;
  zenMode: boolean;
  onHudChange: (snapshot: HudSnapshot) => void;
  onSwarmPhaseChange: (firing: boolean, speedMult: number) => void;
  onLaserSolvedChange?: (solved: number[]) => void;
  onLaserStageCleared?: () => void;
  onGameOver: (snapshot: HudSnapshot) => void;
}

export const GameCanvas = forwardRef<GameCanvasHandle, GameCanvasProps>(
  function GameCanvas(
    {
      gameState,
      playMode,
      modifiers,
      ringSettings,
      bloomSettings,
      orbitSettings,
      sliceSettings,
      hexSettings,
      dominoActionMode,
      beatAutoPlay,
      vortexSwirl,
      vortexRepel,
      laserAutoRotate,
      sandBrush,
      sandAutoFountain,
      chimeActionMode,
      chimeVoice,
      chimeScale,
      chimeAutoFlow,
      trackActionMode,
      trackAutoFlow,
      pendulumTrails,
      pendulumAutoPulse,
      pendulumVoice,
      pondRain,
      pondWhirlpool,
      activeBrush,
      sandboxActionMode,
      orbitActionMode,
      equippedTheme,
      equippedFx,
      customTrail,
      reducedMotion,
      zenMode,
      onHudChange,
      onSwarmPhaseChange,
      onLaserSolvedChange,
      onLaserStageCleared,
      onGameOver,
    },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const pointerDownRef = useRef<boolean>(false);

    const swarmRef = useRef<SwarmWorld>(createSwarmWorld());
    const ringWorldRef = useRef<RingEscapeWorld>(createRingEscapeWorld(1));
    const bloomRef = useRef<BloomWorld>(createBloomWorld(1));
    const orbitRef = useRef<OrbitWorld>(createOrbitWorld(1));
    const sliceRef = useRef<SliceWorld>(createSliceWorld());
    const hexRef = useRef<HexRippleWorld>(createHexWorld(1));
    const dominoRef = useRef<DominoWorld>(createDominoWorld('SPIRAL'));
    const beatPulseRef = useRef<BeatPulseWorld>(createBeatPulseWorld('SUNLIT'));
    const vortexRef = useRef<VortexPaintWorld>(createVortexWorld('NEBULA'));
    const laserRef = useRef<PrismLaserWorld>(createPrismLaserWorld(1));
    const mergeRef = useRef<OrbMergeWorld>(createOrbMergeWorld('CLASSIC'));
    const plinkoRef = useRef<PlinkoWorld>(createPlinkoWorld('CLASSIC'));
    const bubbleRef = useRef<BubblePopWorld>(createBubblePopWorld('CLASSIC'));
    const vacuumRef = useRef<VacuumWorld>(createVacuumWorld('CLASSIC'));
    const sandRef = useRef<ChromaSandWorld>(createChromaSandWorld('RAINBOW_DUNE'));
    const chimeRef = useRef<ChimeWorld>(createChimeWorld('CASCADE_HARP'));
    const trackRef = useRef<MarbleRunWorld>(createMarbleRunWorld('MEADOW_SLIDE'));
    const pendulumRef = useRef<PendulumWorld>(createPendulumWorld('PHASE_WAVE'));
    const pondRef = useRef<KoiPondWorld>(createPondWorld('SAKURA_RAIN'));
    const sandboxRef = useRef<SimWorld>({
      pegs: buildSandboxStarterPegs(),
      balls: [],
      particles: [],
      rings: [],
      floatingTexts: [],
      bucketX: ARENA_WIDTH / 2,
      bucketDir: 1,
      bucketWidth: 128,
      bucketSpeed: 150,
      gravity: 540,
      windX: 0,
      nextBallId: 1,
      shakeAmount: 0,
      time: 0,
    });

    const aimAngleRef = useRef<number>(Math.PI / 2);
    const hoverPosRef = useRef<{ x: number; y: number } | null>(null);
    const sandboxScoreRef = useRef({ score: 0, combo: 0, maxCombo: 0 });
    const lastHudPushRef = useRef<number>(0);
    const lastSwarmFiringRef = useRef<boolean>(false);
    const fxSparksRef = useRef<
      Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        hue: number;
        colorStr?: string;
        life: number;
        maxLife: number;
        shape: 'circle' | 'star' | 'diamond' | 'ring' | 'glow' | 'sparks' | 'bubbles';
      }>
    >([]);
    const comboBurstsRef = useRef<{
      particles: Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        hue: number;
        life: number;
        maxLife: number;
        shape: 'circle' | 'star' | 'diamond';
        drag: number;
        gravity: number;
      }>;
      rings: Array<{
        x: number;
        y: number;
        radius: number;
        maxRadius: number;
        hue: number;
        alpha: number;
        lineWidth: number;
      }>;
      callouts: Array<{
        x: number;
        y: number;
        vy: number;
        text: string;
        hue: number;
        life: number;
        maxLife: number;
        scale: number;
      }>;
    }>({
      particles: [],
      rings: [],
      callouts: [],
    });
    const fxHueCounterRef = useRef<number>(0);

    const propsRef = useRef({
      gameState,
      playMode,
      modifiers,
      ringSettings,
      bloomSettings,
      orbitSettings,
      sliceSettings,
      hexSettings,
      dominoActionMode,
      beatAutoPlay,
      vortexSwirl,
      vortexRepel,
      laserAutoRotate,
      sandBrush,
      sandAutoFountain,
      chimeActionMode,
      chimeVoice,
      chimeScale,
      chimeAutoFlow,
      trackActionMode,
      trackAutoFlow,
      pendulumTrails,
      pendulumAutoPulse,
      pendulumVoice,
      pondRain,
      pondWhirlpool,
      activeBrush,
      sandboxActionMode,
      orbitActionMode,
      equippedTheme,
      equippedFx,
      customTrail,
      reducedMotion,
      zenMode,
      onHudChange,
      onSwarmPhaseChange,
      onLaserSolvedChange,
      onLaserStageCleared,
      onGameOver,
    });
    propsRef.current = {
      gameState,
      playMode,
      modifiers,
      ringSettings,
      bloomSettings,
      orbitSettings,
      sliceSettings,
      hexSettings,
      dominoActionMode,
      beatAutoPlay,
      vortexSwirl,
      vortexRepel,
      laserAutoRotate,
      sandBrush,
      sandAutoFountain,
      chimeActionMode,
      chimeVoice,
      chimeScale,
      chimeAutoFlow,
      trackActionMode,
      trackAutoFlow,
      pendulumTrails,
      pendulumAutoPulse,
      pendulumVoice,
      pondRain,
      pondWhirlpool,
      activeBrush,
      sandboxActionMode,
      orbitActionMode,
      equippedTheme,
      equippedFx,
      customTrail,
      reducedMotion,
      zenMode,
      onHudChange,
      onSwarmPhaseChange,
      onLaserSolvedChange,
      onLaserStageCleared,
      onGameOver,
    };

    const spawnCosmeticFx = (x: number, y: number, burst: boolean) => {
      const fx = getTrailFx(propsRef.current.equippedFx);
      if (fx.id === 'fx_classic') return;
      if (propsRef.current.reducedMotion && !burst) return;

      if (fx.id === 'fx_custom') {
        const cfg = propsRef.current.customTrail;
        const count = burst ? (propsRef.current.reducedMotion ? 4 : 12) : 2;
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const spd =
            cfg.shape === 'bubbles'
              ? burst
                ? 30 + Math.random() * 80
                : 10 + Math.random() * 24
              : burst
              ? 60 + Math.random() * 155
              : 14 + Math.random() * 38;
          fxHueCounterRef.current = (fxHueCounterRef.current + 19) % 360;
          let colorStr: string | undefined;
          let hue = fxHueCounterRef.current;
          if (cfg.mixMode === 'blend') {
            colorStr = mixHexColors(cfg.primaryColor, cfg.secondaryColor, Math.random());
          } else if (cfg.mixMode === 'alternate') {
            colorStr =
              (fxHueCounterRef.current + i) % 2 === 0
                ? cfg.primaryColor
                : cfg.secondaryColor;
          } else {
            hue = fxHueCounterRef.current;
          }
          const baseLife = burst ? 0.72 : 0.52;
          const maxLife = Math.max(0.2, baseLife / cfg.decaySpeed);
          const shapeMap =
            cfg.shape === 'stars'
              ? 'star'
              : cfg.shape === 'glow'
              ? 'glow'
              : cfg.shape === 'sparks'
              ? 'sparks'
              : 'bubbles';
          fxSparksRef.current.push({
            x: x + (Math.random() - 0.5) * 8,
            y: y + (Math.random() - 0.5) * 8,
            vx: Math.cos(angle) * spd,
            vy:
              cfg.shape === 'bubbles'
                ? Math.sin(angle) * spd * 0.6 - 38
                : Math.sin(angle) * spd,
            size: (burst ? 5.6 : 4.1) * cfg.particleSize,
            hue,
            colorStr,
            life: maxLife,
            maxLife,
            shape: shapeMap,
          });
        }
        if (fxSparksRef.current.length > 160) {
          fxSparksRef.current.splice(0, fxSparksRef.current.length - 160);
        }
        return;
      }

      const count = burst ? (propsRef.current.reducedMotion ? 3 : 10) : 2;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = burst ? 55 + Math.random() * 140 : 12 + Math.random() * 36;
        fxHueCounterRef.current = (fxHueCounterRef.current + 19) % 360;
        const hue = fx.rainbow
          ? fxHueCounterRef.current
          : fx.hueBase + (Math.random() - 0.5) * 28;
        const maxLife = fx.sparkShape === 'ring' && burst ? 0.55 : burst ? 0.65 : 0.45;
        fxSparksRef.current.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          size: fx.sparkShape === 'ring' ? (burst ? 26 : 10) : burst ? 4.5 : 3.2,
          hue,
          life: maxLife,
          maxLife,
          shape: fx.sparkShape,
        });
      }
      if (fxSparksRef.current.length > 140) {
        fxSparksRef.current.splice(0, fxSparksRef.current.length - 140);
      }
    };

    const pushHud = (force = false) => {
      const now = performance.now();
      if (!force && now - lastHudPushRef.current < 80) return;
      lastHudPushRef.current = now;

      const mode = propsRef.current.playMode;
      if (mode === 'SWARM') {
        const w = swarmRef.current;
        const blocksLeft = w.tiles.filter(
          (t) => t.kind === 'block' || t.kind === 'bomb'
        ).length;
        propsRef.current.onHudChange({
          score: w.score,
          combo: w.combo,
          maxCombo: w.maxCombo,
          waveOrLevel: w.wave,
          swarmSize: w.swarmSize,
          activeBalls: w.balls.length + w.ballsToFire,
          targetsRemaining: blocksLeft,
          targetsTotal: w.tiles.length,
          feverActive: w.feverActive,
        });

        const isFiring = w.phase === 'FIRING';
        if (isFiring !== lastSwarmFiringRef.current) {
          lastSwarmFiringRef.current = isFiring;
          propsRef.current.onSwarmPhaseChange(isFiring, w.speedMultiplier);
        }
      } else if (mode === 'RINGS') {
        const w = ringWorldRef.current;
        const intact = w.rings.filter((r) => !r.broken).length;
        propsRef.current.onHudChange({
          score: w.score,
          combo: w.combo,
          maxCombo: w.maxCombo,
          waveOrLevel: w.level,
          swarmSize: w.balls.length,
          activeBalls: w.balls.length,
          targetsRemaining: intact,
          targetsTotal: w.rings.length,
          feverActive: w.balls.length >= 4,
        });
      } else if (mode === 'BLOOM') {
        const w = bloomRef.current;
        propsRef.current.onHudChange({
          score: w.score,
          combo: w.combo,
          maxCombo: w.maxCombo,
          waveOrLevel: w.level,
          swarmSize: w.tapsLeft,
          activeBalls: w.blooms.length,
          targetsRemaining: w.poppedThisWave,
          targetsTotal: w.goalNeeded,
          feverActive: w.combo >= 12,
        });
      } else if (mode === 'ORBIT') {
        const w = orbitRef.current;
        propsRef.current.onHudChange({
          score: w.score,
          combo: w.combo,
          maxCombo: w.maxCombo,
          waveOrLevel: w.level,
          swarmSize: w.nodes.length,
          activeBalls: w.comets.length,
          targetsRemaining: w.crystals.length,
          targetsTotal: 12,
          feverActive: w.comets.length >= 4,
        });
      } else if (mode === 'SLICE') {
        const w = sliceRef.current;
        propsRef.current.onHudChange({
          score: w.score,
          combo: w.combo,
          maxCombo: w.maxCombo,
          waveOrLevel: w.lives,
          swarmSize: w.slicedTotal,
          activeBalls: w.targets.length,
          targetsRemaining: w.lives,
          targetsTotal: 3,
          feverActive: w.frenzyTimer > 0 || w.slowMoTimer > 0,
        });
      } else if (mode === 'HEX') {
        const w = hexRef.current;
        propsRef.current.onHudChange({
          score: w.score,
          combo: w.combo,
          maxCombo: w.maxCombo,
          waveOrLevel: w.level,
          swarmSize: w.moves,
          activeBalls: w.waves.length,
          targetsRemaining: w.tiles.length,
          targetsTotal: w.tiles.length,
          feverActive: w.waves.length >= 2,
        });
      } else if (mode === 'DOMINO') {
        const w = dominoRef.current;
        propsRef.current.onHudChange({
          score: w.score,
          combo: w.combo,
          maxCombo: w.maxCombo,
          waveOrLevel: 1,
          swarmSize: w.pieces.length,
          activeBalls: w.toppledCount,
          targetsRemaining: w.pieces.length - w.toppledCount,
          targetsTotal: w.pieces.length,
          feverActive: w.running,
        });
      } else if (mode === 'PULSE') {
        const w = beatPulseRef.current;
        propsRef.current.onHudChange({
          score: w.score,
          combo: w.combo,
          maxCombo: w.maxCombo,
          waveOrLevel: 1,
          swarmSize: w.perfectHits,
          activeBalls: w.notes.length,
          targetsRemaining: w.combo,
          targetsTotal: 6,
          feverActive: w.combo >= 8,
        });
      } else if (mode === 'VORTEX') {
        const w = vortexRef.current;
        propsRef.current.onHudChange({
          score: w.score,
          combo: w.combo,
          maxCombo: w.maxCombo,
          waveOrLevel: w.stageClears + 1,
          swarmSize: w.sparks.length,
          activeBalls: w.collectors.reduce((acc, c) => acc + c.count, 0),
          targetsRemaining: w.collectors.reduce((acc, c) => acc + c.goal, 0),
          targetsTotal: w.collectors.length,
          feverActive: w.waves.length > 0 || w.stageClears > 0,
        });
      } else if (mode === 'LASER') {
        const w = laserRef.current;
        const lit = w.crystals.filter((c) => c.lit).length;
        propsRef.current.onHudChange({
          score: w.score,
          combo: w.combo,
          maxCombo: w.maxCombo,
          waveOrLevel: w.level,
          swarmSize: w.mirrors.length,
          activeBalls: lit,
          targetsRemaining: w.crystals.length - lit,
          targetsTotal: w.crystals.length,
          feverActive: lit === w.crystals.length && w.crystals.length > 0,
        });
      } else if (mode === 'MERGE') {
        const w = mergeRef.current;
        propsRef.current.onHudChange({
          score: w.score,
          combo: w.combo,
          maxCombo: w.maxCombo,
          waveOrLevel: w.highestTier + 1,
          swarmSize: w.orbs.length,
          activeBalls: w.orbs.length,
          targetsRemaining: w.highestTier + 1,
          targetsTotal: 9,
          feverActive: w.combo >= 3,
        });
      } else if (mode === 'PLINKO') {
        const w = plinkoRef.current;
        propsRef.current.onHudChange({
          score: w.score,
          combo: w.combo,
          maxCombo: w.maxCombo,
          waveOrLevel: w.jackpots,
          swarmSize: w.balls.length,
          activeBalls: w.balls.length,
          targetsRemaining: w.jackpots,
          targetsTotal: w.slots.length,
          feverActive: w.balls.length >= 10,
        });
      } else if (mode === 'BUBBLE') {
        const w = bubbleRef.current;
        const left = w.bubbles.filter((b) => !b.popped).length;
        propsRef.current.onHudChange({
          score: w.score,
          combo: w.combo,
          maxCombo: w.maxCombo,
          waveOrLevel: w.sheetsCleared + 1,
          swarmSize: w.poppedCount,
          activeBalls: w.bubbles.length - left,
          targetsRemaining: left,
          targetsTotal: w.bubbles.length,
          feverActive: w.combo >= 8,
        });
      } else if (mode === 'VACUUM') {
        const w = vacuumRef.current;
        propsRef.current.onHudChange({
          score: w.score,
          combo: w.combo,
          maxCombo: w.maxCombo,
          waveOrLevel: w.tier,
          swarmSize: w.swallowedCount,
          activeBalls: w.items.length,
          targetsRemaining: w.items.length,
          targetsTotal: w.totalInitialItems,
          feverActive: w.magnetTimer > 0 || w.combo >= 10,
        });
      } else if (mode === 'SAND') {
        const w = sandRef.current;
        propsRef.current.onHudChange({
          score: w.score,
          combo: w.combo,
          maxCombo: w.maxCombo,
          waveOrLevel: w.grains.length,
          swarmSize: w.collectedTotal,
          activeBalls: w.grains.length,
          targetsRemaining: w.barriers.length,
          targetsTotal: w.chalices.length,
          feverActive: w.grains.length >= 450,
        });
      } else if (mode === 'CHIME') {
        const w = chimeRef.current;
        propsRef.current.onHudChange({
          score: w.score,
          combo: w.combo,
          maxCombo: w.maxCombo,
          waveOrLevel: w.bars.length + w.pendulums.length,
          swarmSize: w.notesPlayed,
          activeBalls: w.marbles.length + w.pendulums.length,
          targetsRemaining: w.bars.length,
          targetsTotal: w.bars.length + w.pendulums.length,
          feverActive: w.marbles.length >= 12 || w.combo >= 15,
        });
      } else if (mode === 'TRACK') {
        const w = trackRef.current;
        propsRef.current.onHudChange({
          score: w.score,
          combo: w.combo,
          maxCombo: w.maxCombo,
          waveOrLevel: w.coursesCleared + 1,
          swarmSize: w.chimesPlayed,
          activeBalls: w.marbles.length,
          targetsRemaining: w.goalCaught,
          targetsTotal: w.goalTarget,
          feverActive: w.marbles.length >= 10 || w.combo >= 15,
        });
      } else if (mode === 'PENDULUM') {
        const w = pendulumRef.current;
        propsRef.current.onHudChange({
          score: w.score,
          combo: w.combo,
          maxCombo: w.maxCombo,
          waveOrLevel: 1,
          swarmSize: w.notesPlayed,
          activeBalls: Math.max(w.bobs.length, w.doubleArms.length * 2),
          targetsRemaining: w.bobs.length,
          targetsTotal: Math.max(1, w.bobs.length),
          feverActive: w.combo >= 12 || w.bobs.some((b) => b.glow > 0.5),
        });
      } else if (mode === 'POND') {
        const w = pondRef.current;
        propsRef.current.onHudChange({
          score: w.score,
          combo: w.combo,
          maxCombo: w.maxCombo,
          waveOrLevel: w.kois.length,
          swarmSize: w.ripplesCreated,
          activeBalls: w.kois.length,
          targetsRemaining: w.lotuses.length,
          targetsTotal: w.kois.length + w.lotuses.length,
          feverActive: w.ripples.length >= 4,
        });
      } else {
        const w = sandboxRef.current;
        propsRef.current.onHudChange({
          score: sandboxScoreRef.current.score,
          combo: sandboxScoreRef.current.combo,
          maxCombo: sandboxScoreRef.current.maxCombo,
          waveOrLevel: 1,
          swarmSize: w.pegs.length,
          activeBalls: w.balls.length,
          targetsRemaining: w.pegs.filter((p) => p.kind === 'target').length,
          targetsTotal: w.pegs.length,
          feverActive: w.balls.length >= 8,
        });
      }
    };

    const fireSandboxBall = () => {
      const { gameState: gs, modifiers: mods } = propsRef.current;
      if (gs !== 'PLAYING') return;
      const world = sandboxRef.current;
      if (world.balls.length >= 28) return;

      soundEngine.unlock();
      soundEngine.playLaunch();
      const count = mods.multiBall ? 3 : 1;
      for (let i = 0; i < count; i++) {
        const spread = count === 1 ? 0 : (i - 1) * 0.14;
        const angle = aimAngleRef.current + spread;
        const { vx, vy } = getLaunchVelocity(angle);
        const hue = (40 + world.nextBallId * 37) % 360;
        world.balls.push(
          createBall(
            world.nextBallId++,
            LAUNCHER_X + Math.cos(angle) * 26,
            LAUNCHER_Y + Math.sin(angle) * 26,
            vx,
            vy,
            mods,
            hue
          )
        );
      }
      pushHud(true);
    };

    useImperativeHandle(ref, () => ({
      resetSwarm: () => {
        swarmRef.current = createSwarmWorld('CLASSIC');
        lastSwarmFiringRef.current = false;
        propsRef.current.onSwarmPhaseChange(false, 1);
        pushHud(true);
      },
      loadSwarmPreset: (preset: SwarmPreset) => {
        swarmRef.current = createSwarmWorld(preset);
        lastSwarmFiringRef.current = false;
        propsRef.current.onSwarmPhaseChange(false, 1);
        pushHud(true);
      },
      toggleSwarmSpeed: () => {
        const w = swarmRef.current;
        w.speedMultiplier = w.speedMultiplier > 1 ? 1 : 2.2;
        propsRef.current.onSwarmPhaseChange(w.phase === 'FIRING', w.speedMultiplier);
        return w.speedMultiplier;
      },
      recallSwarm: () => {
        recallSwarmBalls(swarmRef.current);
      },
      resetRings: (megaTen?: boolean) => {
        const useTen = megaTen ?? propsRef.current.ringSettings.megaTenRings;
        ringWorldRef.current = createRingEscapeWorld(
          1,
          0,
          0,
          useTen,
          useTen ? 'MEGA10' : 'CLASSIC'
        );
        pushHud(true);
      },
      loadRingPreset: (preset: RingLevelPreset) => {
        const useTen = preset === 'MEGA10' || propsRef.current.ringSettings.megaTenRings;
        ringWorldRef.current = createRingEscapeWorld(1, 0, 0, useTen, preset);
        pushHud(true);
      },
      spawnRingBall: () => {
        soundEngine.unlock();
        spawnRingBall(ringWorldRef.current);
        pushHud(true);
      },
      pulseRings: () => {
        soundEngine.unlock();
        triggerRingPulse(ringWorldRef.current, propsRef.current.reducedMotion);
      },
      resetBloom: () => {
        bloomRef.current = createBloomWorld(1, 0, 0, bloomRef.current.preset);
        pushHud(true);
      },
      loadBloomPreset: (preset: BloomPreset) => {
        bloomRef.current = createBloomWorld(1, 0, 0, preset);
        pushHud(true);
      },
      resetOrbit: () => {
        orbitRef.current = createOrbitWorld(1);
        pushHud(true);
      },
      loadOrbitLevel: (level: number) => {
        orbitRef.current = createOrbitWorld(level);
        pushHud(true);
      },
      launchOrbitConstellation: () => {
        soundEngine.unlock();
        launchCometConstellation(orbitRef.current);
        pushHud(true);
      },
      clearOrbitTrails: () => {
        orbitRef.current.paintedRibbonSegments = [];
      },
      resetSlice: () => {
        sliceRef.current = createSliceWorld(sliceRef.current.preset);
        pushHud(true);
      },
      loadSlicePreset: (preset: SlicePreset) => {
        sliceRef.current = createSliceWorld(preset);
        pushHud(true);
      },
      resetHex: () => {
        hexRef.current = createHexWorld(1, 0, 0, hexRef.current.levelId);
        pushHud(true);
      },
      loadHexLevel: (levelId: HexLevelId) => {
        hexRef.current = createHexWorld(1, 0, 0, levelId);
        pushHud(true);
      },
      loadDominoPreset: (preset: DominoPreset) => {
        dominoRef.current = createDominoWorld(preset);
        pushHud(true);
      },
      toppleDominoes: () => {
        soundEngine.unlock();
        toppleNearestDomino(dominoRef.current, 0, 0);
        pushHud(true);
      },
      loadBeatLevel: (id: BeatLevelId) => {
        beatPulseRef.current = createBeatPulseWorld(id);
        pushHud(true);
      },
      loadVortexLevel: (id: VortexLevelId) => {
        vortexRef.current = createVortexWorld(id);
        vortexRef.current.repelMode = propsRef.current.vortexRepel;
        pushHud(true);
      },
      burstVortex: () => {
        soundEngine.unlock();
        burstVortexAt(vortexRef.current, ARENA_WIDTH / 2, ARENA_HEIGHT / 2);
        pushHud(true);
      },
      loadLaserLevel: (level: number) => {
        laserRef.current = createPrismLaserWorld(
          level,
          0,
          0,
          laserRef.current.solvedLevels
        );
        pushHud(true);
      },
      loadMergePreset: (preset: MergePreset) => {
        mergeRef.current = createOrbMergeWorld(preset);
        pushHud(true);
      },
      dropMerge: () => {
        soundEngine.unlock();
        dropMergeOrb(mergeRef.current, mergeRef.current.aimX, true);
        pushHud(true);
      },
      shakeMerge: () => {
        soundEngine.unlock();
        shakeMergeBowl(mergeRef.current);
        pushHud(true);
      },
      loadPlinkoPreset: (preset: PlinkoPreset) => {
        plinkoRef.current = createPlinkoWorld(preset);
        pushHud(true);
      },
      dropPlinkoBatch: (count: number) => {
        soundEngine.unlock();
        dropPlinkoBalls(plinkoRef.current, plinkoRef.current.aimX, count);
        pushHud(true);
      },
      loadBubblePreset: (preset: BubblePreset) => {
        bubbleRef.current = createBubblePopWorld(preset);
        pushHud(true);
      },
      loadVacuumPreset: (preset: VacuumPreset) => {
        vacuumRef.current = createVacuumWorld(preset);
        pushHud(true);
      },
      pulseVacuum: () => {
        soundEngine.unlock();
        triggerVacuumPulse(vacuumRef.current, propsRef.current.reducedMotion);
        pushHud(true);
      },
      loadSandPreset: (preset: SandPreset) => {
        sandRef.current = createChromaSandWorld(preset);
        sandRef.current.autoFountain = propsRef.current.sandAutoFountain;
        pushHud(true);
      },
      burstSand: () => {
        soundEngine.unlock();
        burstSandFountain(sandRef.current);
        pushHud(true);
      },
      clearSandWalls: () => {
        sandRef.current.barriers = sandRef.current.barriers.filter((b) => !b.isUser);
        pushHud(true);
      },
      loadChimePreset: (preset: ChimePreset) => {
        chimeRef.current = createChimeWorld(preset);
        pushHud(true);
      },
      dropChimeShower: () => {
        soundEngine.unlock();
        spawnChimeMarbleAt(chimeRef.current, ARENA_WIDTH * 0.3, 60, 4);
        spawnChimeMarbleAt(chimeRef.current, ARENA_WIDTH * 0.5, 50, 4);
        spawnChimeMarbleAt(chimeRef.current, ARENA_WIDTH * 0.7, 60, 4);
        pushHud(true);
      },
      strumChimes: () => {
        soundEngine.unlock();
        strumAllChimes(
          chimeRef.current,
          propsRef.current.chimeVoice,
          propsRef.current.chimeScale,
          propsRef.current.reducedMotion,
          propsRef.current.zenMode
        );
        pushHud(true);
      },
      loadTrackPreset: (preset: TrackPreset) => {
        trackRef.current = createMarbleRunWorld(preset);
        pushHud(true);
      },
      dropTrackWave: () => {
        soundEngine.unlock();
        spawnTrackMarbleAt(trackRef.current, ARENA_WIDTH * 0.28, 44, 2);
        spawnTrackMarbleAt(trackRef.current, ARENA_WIDTH * 0.5, 42, 1);
        spawnTrackMarbleAt(trackRef.current, ARENA_WIDTH * 0.72, 44, 2);
        pushHud(true);
      },
      loadPendulumPreset: (preset: PendulumPreset) => {
        pendulumRef.current = createPendulumWorld(preset);
        pushHud(true);
      },
      pulsePendulum: (dir = 1) => {
        soundEngine.unlock();
        pulsePendulumWave(pendulumRef.current, dir);
        pushHud(true);
      },
      clearPendulumTrails: () => {
        clearPendulumTrails(pendulumRef.current);
      },
      loadPondPreset: (preset: PondPreset) => {
        pondRef.current = createPondWorld(preset);
        pushHud(true);
      },
      scatterPondPetals: () => {
        soundEngine.unlock();
        scatterPondPetals(pondRef.current);
        pushHud(true);
      },
      clearPondRipples: () => {
        clearPondRipples(pondRef.current);
      },
      loadSandboxStarter: () => {
        sandboxRef.current.pegs = buildSandboxStarterPegs();
        sandboxRef.current.balls = [];
        sandboxRef.current.particles = [];
        sandboxRef.current.rings = [];
        sandboxRef.current.floatingTexts = [];
        sandboxScoreRef.current = { score: 0, combo: 0, maxCombo: 0 };
        pushHud(true);
      },
      loadSandboxPreset: (preset: SandboxPreset) => {
        sandboxRef.current.pegs = buildSandboxPreset(preset);
        sandboxRef.current.balls = [];
        sandboxRef.current.particles = [];
        sandboxRef.current.rings = [];
        sandboxRef.current.floatingTexts = [];
        sandboxScoreRef.current = { score: 0, combo: 0, maxCombo: 0 };
        pushHud(true);
      },
      clearSandboxBoard: () => {
        sandboxRef.current.pegs = [];
        sandboxRef.current.balls = [];
        sandboxRef.current.particles = [];
        sandboxRef.current.rings = [];
        sandboxRef.current.floatingTexts = [];
        sandboxScoreRef.current.combo = 0;
        pushHud(true);
      },
      launchSingle: () => {
        const mode = propsRef.current.playMode;
        if (mode === 'SWARM') {
          soundEngine.unlock();
          launchSwarmVolley(swarmRef.current);
          pushHud(true);
        } else if (mode === 'RINGS') {
          soundEngine.unlock();
          spawnRingBall(ringWorldRef.current);
          pushHud(true);
        } else if (mode === 'BLOOM') {
          soundEngine.unlock();
          triggerBloomAt(
            bloomRef.current,
            ARENA_WIDTH / 2,
            ARENA_HEIGHT / 2,
            propsRef.current.bloomSettings,
            propsRef.current.zenMode
          );
          pushHud(true);
        } else if (mode === 'ORBIT') {
          soundEngine.unlock();
          launchComet(orbitRef.current, propsRef.current.orbitSettings);
          pushHud(true);
        } else if (mode === 'DOMINO') {
          soundEngine.unlock();
          toppleNearestDomino(dominoRef.current, 0, 0);
          pushHud(true);
        } else if (mode === 'HEX') {
          soundEngine.unlock();
          triggerHexRippleAt(
            hexRef.current,
            ARENA_WIDTH / 2,
            ARENA_HEIGHT / 2,
            propsRef.current.hexSettings
          );
          pushHud(true);
        } else if (mode === 'PULSE') {
          soundEngine.unlock();
          triggerBeatHit(beatPulseRef.current, null, null, propsRef.current.reducedMotion);
          pushHud(true);
        } else if (mode === 'VORTEX') {
          soundEngine.unlock();
          burstVortexAt(vortexRef.current, ARENA_WIDTH / 2, ARENA_HEIGHT / 2);
          pushHud(true);
        } else if (mode === 'LASER') {
          soundEngine.unlock();
          laserRef.current.emitterAngle += 0.14;
          startLaserDragAt(
            laserRef.current,
            laserRef.current.emitterX + Math.cos(laserRef.current.emitterAngle) * 200,
            laserRef.current.emitterY + Math.sin(laserRef.current.emitterAngle) * 200
          );
          pushHud(true);
        } else if (mode === 'MERGE') {
          soundEngine.unlock();
          dropMergeOrb(mergeRef.current, mergeRef.current.aimX, true);
          pushHud(true);
        } else if (mode === 'PLINKO') {
          soundEngine.unlock();
          dropPlinkoBalls(plinkoRef.current, plinkoRef.current.aimX, 1);
          pushHud(true);
        } else if (mode === 'BUBBLE') {
          soundEngine.unlock();
          const unpopped = bubbleRef.current.bubbles.find((b) => !b.popped);
          if (unpopped) {
            popBubbleAt(
              bubbleRef.current,
              unpopped.x,
              unpopped.y,
              propsRef.current.reducedMotion
            );
            pushHud(true);
          }
        } else if (mode === 'VACUUM') {
          soundEngine.unlock();
          triggerVacuumPulse(vacuumRef.current, propsRef.current.reducedMotion);
          pushHud(true);
        } else if (mode === 'SAND') {
          soundEngine.unlock();
          burstSandFountain(sandRef.current);
          pushHud(true);
        } else if (mode === 'CHIME') {
          soundEngine.unlock();
          spawnChimeMarbleAt(chimeRef.current, ARENA_WIDTH * 0.5, 55, 5);
          pushHud(true);
        } else if (mode === 'TRACK') {
          soundEngine.unlock();
          spawnTrackMarbleAt(trackRef.current, ARENA_WIDTH * 0.5, 44, 3);
          pushHud(true);
        } else if (mode === 'PENDULUM') {
          soundEngine.unlock();
          pulsePendulumWave(pendulumRef.current, 1);
          pushHud(true);
        } else if (mode === 'POND') {
          soundEngine.unlock();
          spawnPondRippleAt(pondRef.current, ARENA_WIDTH * 0.5, ARENA_HEIGHT * 0.5, true);
          pushHud(true);
        } else if (mode === 'SANDBOX') {
          fireSandboxBall();
        }
      },
      launchAvalanche: () => {
        if (propsRef.current.gameState !== 'PLAYING') return;
        const world = sandboxRef.current;
        soundEngine.unlock();
        soundEngine.playLaunch();
        for (let i = 0; i < 15; i++) {
          if (world.balls.length >= 40) break;
          const spread = ((i % 7) - 3) * 0.16;
          const angle = Math.PI / 2 + spread;
          const { vx, vy } = getLaunchVelocity(angle);
          const hue = (i * 28) % 360;
          world.balls.push(
            createBall(
              world.nextBallId++,
              LAUNCHER_X + Math.cos(angle) * (24 + Math.floor(i / 7) * 14),
              LAUNCHER_Y + Math.sin(angle) * (24 + Math.floor(i / 7) * 14),
              vx * (0.9 + (i % 3) * 0.08),
              vy * (0.9 + (i % 3) * 0.08),
              propsRef.current.modifiers,
              hue
            )
          );
        }
        pushHud(true);
      },
      launchSupernova: () => {
        if (propsRef.current.gameState !== 'PLAYING') return;
        const world = sandboxRef.current;
        soundEngine.unlock();
        soundEngine.playStageClear();
        for (let i = 0; i < 50; i++) {
          if (world.balls.length >= 65) break;
          const spread = ((i % 13) - 6) * 0.13;
          const angle = Math.PI / 2 + spread;
          const { vx, vy } = getLaunchVelocity(angle);
          const hue = (i * 19) % 360;
          world.balls.push(
            createBall(
              world.nextBallId++,
              LAUNCHER_X + Math.cos(angle) * (20 + Math.floor(i / 13) * 14),
              LAUNCHER_Y + Math.sin(angle) * (20 + Math.floor(i / 13) * 14),
              vx * (0.85 + (i % 4) * 0.08),
              vy * (0.85 + (i % 4) * 0.08),
              propsRef.current.modifiers,
              hue
            )
          );
        }
        pushHud(true);
      },
      nudgeAim: (deltaRad: number) => {
        const mode = propsRef.current.playMode;
        if (mode === 'SWARM') {
          swarmRef.current.aimAngle = Math.max(
            -Math.PI + 0.16,
            Math.min(-0.16, swarmRef.current.aimAngle + deltaRad)
          );
        } else if (mode === 'RINGS') {
          ringWorldRef.current.targetAngleOffset += deltaRad * 2.2;
        } else if (mode === 'ORBIT') {
          orbitRef.current.aimAngle = Math.max(
            -1.25,
            Math.min(1.25, orbitRef.current.aimAngle + deltaRad)
          );
        } else {
          aimAngleRef.current = Math.max(
            0.2,
            Math.min(Math.PI - 0.2, aimAngleRef.current + deltaRad)
          );
        }
      },
      triggerComboExplosion: (milestone: number, isMajor25: boolean) => {
        const rm = propsRef.current.reducedMotion;
        const zm = propsRef.current.zenMode;
        const mode = propsRef.current.playMode;

        soundEngine.playComboExplosion(isMajor25);

        let originX = ARENA_WIDTH / 2;
        let originY = ARENA_HEIGHT / 2;
        if (mode === 'VACUUM') {
          originX = vacuumRef.current.holeX;
          originY = vacuumRef.current.holeY;
        } else if (mode === 'RINGS') {
          originX = ringWorldRef.current.centerX;
          originY = ringWorldRef.current.centerY;
        } else if (hoverPosRef.current) {
          originX = hoverPosRef.current.x;
          originY = hoverPosRef.current.y;
        }

        const baseHue = isMajor25 ? 42 : (milestone * 13) % 360;
        const count = rm ? 4 : isMajor25 ? 14 : 8;
        const shapes: Array<'circle' | 'star' | 'diamond'> = [
          'circle',
          'diamond',
          'star',
        ];

        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
          const speed = isMajor25
            ? 45 + Math.random() * 85
            : 35 + Math.random() * 65;
          const maxLife = isMajor25
            ? 0.45 + Math.random() * 0.22
            : 0.36 + Math.random() * 0.18;
          comboBurstsRef.current.particles.push({
            x: originX,
            y: originY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: isMajor25 ? 2.0 + Math.random() * 1.4 : 1.7 + Math.random() * 1.0,
            hue: isMajor25 ? (i * 18 + baseHue) % 360 : (baseHue + (i % 4) * 20) % 360,
            life: maxLife,
            maxLife,
            shape: shapes[i % shapes.length],
            drag: 3.2,
            gravity: 35,
          });
        }

        comboBurstsRef.current.rings.push({
          x: originX,
          y: originY,
          radius: 10,
          maxRadius: isMajor25 ? 58 : 38,
          hue: baseHue,
          alpha: isMajor25 ? 0.45 : 0.34,
          lineWidth: isMajor25 ? 1.8 : 1.4,
        });

        if (!zm) {
          comboBurstsRef.current.callouts.push({
            x: originX,
            y: Math.max(64, originY - 18),
            vy: -24,
            text: `${milestone}x`,
            hue: isMajor25 ? 45 : baseHue,
            life: 0.68,
            maxLife: 0.68,
            scale: isMajor25 ? 1.08 : 0.94,
          });
        }

        if (comboBurstsRef.current.particles.length > 60) {
          comboBurstsRef.current.particles.splice(
            0,
            comboBurstsRef.current.particles.length - 60
          );
        }
        if (comboBurstsRef.current.rings.length > 4) {
          comboBurstsRef.current.rings.splice(
            0,
            comboBurstsRef.current.rings.length - 4
          );
        }
        if (comboBurstsRef.current.callouts.length > 3) {
          comboBurstsRef.current.callouts.splice(
            0,
            comboBurstsRef.current.callouts.length - 3
          );
        }
      },
      captureSnapshot: () => {
        const src = canvasRef.current;
        if (!src) return null;
        try {
          const out = document.createElement('canvas');
          out.width = 480;
          out.height = 372;
          const octx = out.getContext('2d');
          if (!octx) return null;
          octx.drawImage(src, 0, 0, out.width, out.height);
          return out.toDataURL('image/jpeg', 0.86);
        } catch {
          return null;
        }
      },
    }));

    useEffect(() => {
      let rafId = 0;
      let lastTime = performance.now();

      const loop = (now: number) => {
        const rawDt = (now - lastTime) / 1000;
        lastTime = now;
        const dt = Math.min(0.033, Math.max(0.001, rawDt));

        const {
          gameState: gs,
          playMode: pm,
          modifiers: mods,
          ringSettings: rs,
          bloomSettings: bs,
          orbitSettings: os,
          sliceSettings: ss,
          hexSettings: hs,
          beatAutoPlay: beatAuto,
          vortexSwirl: vSwirl,
          vortexRepel: vRepel,
          laserAutoRotate: laserAuto,
          sandAutoFountain: sAuto,
          chimeVoice: cVoice,
          chimeScale: cScale,
          chimeAutoFlow: cAutoFlow,
          trackAutoFlow: tAutoFlow,
          pendulumTrails: pTrails,
          pendulumAutoPulse: pAutoPulse,
          pendulumVoice: pVoice,
          pondRain: pRain,
          pondWhirlpool: pWhirl,
          activeBrush: brush,
          sandboxActionMode: sbMode,
          reducedMotion: rm,
          zenMode: zm,
        } = propsRef.current;

        const effectiveSliceSettings = zm ? { ...ss, zenMode: true } : ss;
        const physicsDt = mods.slowMo ? dt * 0.36 : dt;

        if (gs === 'PLAYING') {
          if (pm === 'SWARM') {
            const { gameOver } = stepSwarmWorld(swarmRef.current, physicsDt, rm, zm);
            pushHud(false);
            if (gameOver && !zm) {
              pushHud(true);
              const w = swarmRef.current;
              propsRef.current.onGameOver({
                score: w.score,
                combo: w.combo,
                maxCombo: w.maxCombo,
                waveOrLevel: w.wave,
                swarmSize: w.swarmSize,
                activeBalls: 0,
                targetsRemaining: w.tiles.length,
                targetsTotal: w.tiles.length,
                feverActive: w.feverActive,
              });
            }
          } else if (pm === 'RINGS') {
            stepRingEscapeWorld(ringWorldRef.current, physicsDt, rs, rm);
            pushHud(false);
          } else if (pm === 'BLOOM') {
            stepBloomWorld(bloomRef.current, physicsDt, bs, rm, zm);
            pushHud(false);
          } else if (pm === 'ORBIT') {
            stepOrbitWorld(orbitRef.current, physicsDt, os, rm);
            pushHud(false);
          } else if (pm === 'SLICE') {
            const { gameOver } = stepSliceWorld(
              sliceRef.current,
              physicsDt,
              effectiveSliceSettings
            );
            pushHud(false);
            if (gameOver && !zm) {
              pushHud(true);
              const w = sliceRef.current;
              propsRef.current.onGameOver({
                score: w.score,
                combo: w.combo,
                maxCombo: w.maxCombo,
                waveOrLevel: 0,
                swarmSize: w.slicedTotal,
                activeBalls: 0,
                targetsRemaining: 0,
                targetsTotal: 3,
                feverActive: false,
              });
            }
          } else if (pm === 'HEX') {
            stepHexWorld(hexRef.current, physicsDt, hs, rm);
            pushHud(false);
          } else if (pm === 'DOMINO') {
            stepDominoWorld(dominoRef.current, physicsDt, rm);
            pushHud(false);
          } else if (pm === 'PULSE') {
            stepBeatPulseWorld(beatPulseRef.current, physicsDt, beatAuto, rm, zm);
            pushHud(false);
          } else if (pm === 'VORTEX') {
            vortexRef.current.repelMode = vRepel;
            stepVortexWorld(vortexRef.current, physicsDt, vSwirl);
            pushHud(false);
          } else if (pm === 'LASER') {
            const { levelJustCleared } = stepPrismLaserWorld(
              laserRef.current,
              physicsDt,
              laserAuto,
              rm
            );
            if (levelJustCleared !== undefined) {
              propsRef.current.onLaserSolvedChange?.([...laserRef.current.solvedLevels]);
              propsRef.current.onLaserStageCleared?.();
            }
            pushHud(false);
          } else if (pm === 'MERGE') {
            stepOrbMergeWorld(mergeRef.current, physicsDt, rm);
            pushHud(false);
          } else if (pm === 'PLINKO') {
            stepPlinkoWorld(plinkoRef.current, physicsDt, rm);
            pushHud(false);
          } else if (pm === 'BUBBLE') {
            stepBubblePopWorld(bubbleRef.current, physicsDt, rm);
            pushHud(false);
          } else if (pm === 'VACUUM') {
            stepVacuumWorld(vacuumRef.current, physicsDt, rm);
            pushHud(false);
          } else if (pm === 'SAND') {
            sandRef.current.autoFountain = sAuto;
            stepChromaSandWorld(sandRef.current, physicsDt, rm);
            pushHud(false);
          } else if (pm === 'CHIME') {
            stepChimeWorld(chimeRef.current, physicsDt, cAutoFlow, cVoice, cScale, rm, zm);
            pushHud(false);
          } else if (pm === 'TRACK') {
            stepMarbleRunWorld(trackRef.current, physicsDt, tAutoFlow, rm, zm);
            pushHud(false);
          } else if (pm === 'PENDULUM') {
            stepPendulumWorld(pendulumRef.current, physicsDt, pAutoPulse, pVoice, rm);
            pushHud(false);
          } else if (pm === 'POND') {
            stepPondWorld(pondRef.current, physicsDt, pRain, pWhirl, rm);
            pushHud(false);
          } else {
            const world = sandboxRef.current;
            stepSimulation(world, physicsDt, mods, rm, {
              onPegHit: (peg, _ball, combo) => {
                const isTarget = peg.kind === 'target';
                soundEngine.playPegHit(combo, isTarget);
                const pts = (isTarget ? 250 : 50) * Math.max(1, Math.min(8, combo));
                sandboxScoreRef.current.score += pts;
                sandboxScoreRef.current.combo += 1;
                if (sandboxScoreRef.current.combo > sandboxScoreRef.current.maxCombo) {
                  sandboxScoreRef.current.maxCombo = sandboxScoreRef.current.combo;
                }
                spawnParticles(
                  world,
                  peg.x,
                  peg.y,
                  isTarget ? '#FBBF24' : '#38BDF8',
                  8,
                  180,
                  rm
                );
                if (!zm) {
                  spawnFloatingText(
                    world,
                    peg.x,
                    peg.y - 14,
                    `+${pts}`,
                    isTarget ? '#FDE68A' : '#BAE6FD'
                  );
                }
              },
              onBumperHit: (peg) => {
                soundEngine.playBumper();
                sandboxScoreRef.current.score += 120;
                sandboxScoreRef.current.combo += 1;
                if (sandboxScoreRef.current.combo > sandboxScoreRef.current.maxCombo) {
                  sandboxScoreRef.current.maxCombo = sandboxScoreRef.current.combo;
                }
                spawnParticles(world, peg.x, peg.y, '#34D399', 12, 220, rm);
                spawnRing(world, peg.x, peg.y, '#10B981', 54);
              },
              onSpringHit: (peg) => {
                soundEngine.playSpring();
                sandboxScoreRef.current.score += 100;
                sandboxScoreRef.current.combo += 1;
                if (sandboxScoreRef.current.combo > sandboxScoreRef.current.maxCombo) {
                  sandboxScoreRef.current.maxCombo = sandboxScoreRef.current.combo;
                }
                spawnParticles(world, peg.x, peg.y, '#FB7185', 10, 210, rm);
                spawnRing(world, peg.x, peg.y, '#FB7185', 46);
              },
              onSplitterHit: (peg) => {
                soundEngine.playSplitter();
                sandboxScoreRef.current.score += 300;
                sandboxScoreRef.current.combo += 1;
                if (sandboxScoreRef.current.combo > sandboxScoreRef.current.maxCombo) {
                  sandboxScoreRef.current.maxCombo = sandboxScoreRef.current.combo;
                }
                spawnParticles(world, peg.x, peg.y, '#22D3EE', 14, 240, rm);
                spawnRing(world, peg.x, peg.y, '#22D3EE', 58);
              },
              onPortalWarp: (from, to) => {
                soundEngine.playPortal();
                sandboxScoreRef.current.score += 150;
                spawnRing(world, from.x, from.y, '#A78BFA', 44);
                spawnRing(world, to.x, to.y, '#38BDF8', 50);
              },
              onBucketCatch: (ball) => {
                soundEngine.playBucketCatch();
                sandboxScoreRef.current.score += 500;
                sandboxScoreRef.current.combo += 1;
                if (sandboxScoreRef.current.combo > sandboxScoreRef.current.maxCombo) {
                  sandboxScoreRef.current.maxCombo = sandboxScoreRef.current.combo;
                }
                spawnParticles(world, ball.x, ARENA_HEIGHT - 28, '#34D399', 16, 230, rm);
                if (!zm) {
                  spawnFloatingText(
                    world,
                    ball.x,
                    ARENA_HEIGHT - 46,
                    'CATCH +500',
                    '#6EE7B7'
                  );
                }
              },
              onBallLost: () => {
                if (world.balls.length <= 1) {
                  sandboxScoreRef.current.combo = 0;
                }
              },
            });

            if (world.balls.length === 0) {
              sandboxScoreRef.current.combo = 0;
            }
            for (const p of world.pegs) {
              if (p.hit && world.time - p.hitTime > 0.28) {
                p.hit = false;
              }
            }
            pushHud(false);
          }

          if (zm) {
            swarmRef.current.floatingTexts = [];
            swarmRef.current.shakeAmount = 0;
            ringWorldRef.current.floatingTexts = [];
            ringWorldRef.current.shakeAmount = 0;
            bloomRef.current.floatingTexts = [];
            orbitRef.current.floatingTexts = [];
            sliceRef.current.floatingTexts = [];
            sliceRef.current.shakeAmount = 0;
            hexRef.current.floatingTexts = [];
            dominoRef.current.floatingTexts = [];
            beatPulseRef.current.floatingTexts = [];
            beatPulseRef.current.shakeAmount = 0;
            vortexRef.current.floatingTexts = [];
            laserRef.current.floatingTexts = [];
            mergeRef.current.floatingTexts = [];
            mergeRef.current.shakeAmount = 0;
            plinkoRef.current.floatingTexts = [];
            plinkoRef.current.shakeAmount = 0;
            bubbleRef.current.floatingTexts = [];
            vacuumRef.current.floatingTexts = [];
            vacuumRef.current.shakeAmount = 0;
            sandRef.current.floatingTexts = [];
            chimeRef.current.floatingTexts = [];
            trackRef.current.floatingTexts = [];
            sandboxRef.current.floatingTexts = [];
            sandboxRef.current.shakeAmount = 0;
          }
        }

        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const dpr = window.devicePixelRatio || 1;
            const targetW = ARENA_WIDTH * dpr;
            const targetH = ARENA_HEIGHT * dpr;
            if (canvas.width !== targetW || canvas.height !== targetH) {
              canvas.width = targetW;
              canvas.height = targetH;
            }
            ctx.save();
            ctx.scale(dpr, dpr);

            if (pm === 'SWARM') {
              renderSwarmWorld(ctx, swarmRef.current, zm);
            } else if (pm === 'RINGS') {
              renderRingEscapeWorld(ctx, ringWorldRef.current, rs);
            } else if (pm === 'BLOOM') {
              renderBloomWorld(ctx, bloomRef.current);
            } else if (pm === 'ORBIT') {
              renderOrbitWorld(ctx, orbitRef.current, os);
            } else if (pm === 'SLICE') {
              renderSliceWorld(ctx, sliceRef.current);
            } else if (pm === 'HEX') {
              renderHexWorld(ctx, hexRef.current);
            } else if (pm === 'DOMINO') {
              renderDominoWorld(ctx, dominoRef.current);
            } else if (pm === 'PULSE') {
              renderBeatPulseWorld(ctx, beatPulseRef.current);
            } else if (pm === 'VORTEX') {
              renderVortexWorld(ctx, vortexRef.current, zm);
            } else if (pm === 'LASER') {
              renderPrismLaserWorld(ctx, laserRef.current, zm);
            } else if (pm === 'MERGE') {
              renderOrbMergeWorld(ctx, mergeRef.current);
            } else if (pm === 'PLINKO') {
              renderPlinkoWorld(ctx, plinkoRef.current, zm);
            } else if (pm === 'BUBBLE') {
              renderBubblePopWorld(ctx, bubbleRef.current);
            } else if (pm === 'VACUUM') {
              renderVacuumWorld(ctx, vacuumRef.current);
            } else if (pm === 'SAND') {
              renderChromaSandWorld(ctx, sandRef.current, zm);
            } else if (pm === 'CHIME') {
              renderChimeWorld(ctx, chimeRef.current, cScale, zm);
            } else if (pm === 'TRACK') {
              renderMarbleRunWorld(ctx, trackRef.current, zm);
            } else if (pm === 'PENDULUM') {
              renderPendulumWorld(ctx, pendulumRef.current, pTrails, zm);
            } else if (pm === 'POND') {
              renderPondWorld(ctx, pondRef.current, zm);
            } else {
              renderArena(ctx, sandboxRef.current, {
                aimAngle: aimAngleRef.current,
                canAim: gs === 'PLAYING' && sbMode === 'SHOOT',
                modifiers: mods,
                playMode: 'SANDBOX',
                activeBrush: sbMode === 'PLACE' ? brush : 'eraser',
                hoverPos: sbMode === 'PLACE' ? hoverPosRef.current : null,
              });
            }

            // Apply equipped Arena Backdrop Theme atmospheric rim & glow
            const theme = getArenaTheme(propsRef.current.equippedTheme);
            if (theme.id !== 'theme_midnight') {
              ctx.save();
              ctx.globalCompositeOperation = 'screen';
              const cornerGlow = ctx.createRadialGradient(
                ARENA_WIDTH / 2,
                ARENA_HEIGHT / 2,
                ARENA_WIDTH * 0.24,
                ARENA_WIDTH / 2,
                ARENA_HEIGHT / 2,
                ARENA_WIDTH * 0.68
              );
              cornerGlow.addColorStop(0, 'rgba(0,0,0,0)');
              cornerGlow.addColorStop(1, theme.vignetteColor);
              ctx.fillStyle = cornerGlow;
              ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
              ctx.restore();

              ctx.save();
              ctx.strokeStyle = theme.rimColor;
              ctx.lineWidth = 2.5;
              ctx.strokeRect(8, 8, ARENA_WIDTH - 16, ARENA_HEIGHT - 16);
              ctx.restore();
            }

            // Step & render equipped Pointer / Burst FX particles
            if (fxSparksRef.current.length > 0) {
              ctx.save();
              for (let i = fxSparksRef.current.length - 1; i >= 0; i--) {
                const sp = fxSparksRef.current[i];
                sp.life -= physicsDt;
                if (sp.life <= 0) {
                  fxSparksRef.current.splice(i, 1);
                  continue;
                }
                sp.x += sp.vx * physicsDt;
                sp.y += sp.vy * physicsDt;
                const t = sp.life / sp.maxLife;
                ctx.globalAlpha = Math.max(0, t * 0.92);
                const color = sp.colorStr ?? `hsl(${sp.hue}, 94%, 68%)`;
                ctx.fillStyle = color;
                ctx.strokeStyle = color;

                if (sp.shape === 'ring') {
                  const rad = sp.size * (1.25 - t * 0.85);
                  ctx.lineWidth = 2;
                  ctx.beginPath();
                  ctx.arc(sp.x, sp.y, Math.max(2, rad), 0, Math.PI * 2);
                  ctx.stroke();
                } else if (sp.shape === 'glow') {
                  const r = Math.max(2, sp.size * (0.7 + t * 0.9));
                  ctx.save();
                  ctx.shadowColor = color;
                  ctx.shadowBlur = r * 2.4;
                  ctx.beginPath();
                  ctx.arc(sp.x, sp.y, r, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.restore();
                } else if (sp.shape === 'sparks') {
                  const spd = Math.hypot(sp.vx, sp.vy) || 1;
                  const len = sp.size * 2.1 * t + 3;
                  const nx = sp.vx / spd;
                  const ny = sp.vy / spd;
                  ctx.lineWidth = Math.max(1.5, sp.size * 0.42);
                  ctx.lineCap = 'round';
                  ctx.beginPath();
                  ctx.moveTo(sp.x - nx * len, sp.y - ny * len);
                  ctx.lineTo(sp.x + nx * len * 0.4, sp.y + ny * len * 0.4);
                  ctx.stroke();
                } else if (sp.shape === 'bubbles') {
                  const r = Math.max(2.5, sp.size * (0.9 + (1 - t) * 0.55));
                  ctx.lineWidth = 1.6;
                  ctx.beginPath();
                  ctx.arc(sp.x, sp.y, r, 0, Math.PI * 2);
                  ctx.stroke();
                  ctx.fillStyle = '#FFFFFF';
                  ctx.beginPath();
                  ctx.arc(sp.x - r * 0.32, sp.y - r * 0.32, Math.max(1, r * 0.22), 0, Math.PI * 2);
                  ctx.fill();
                } else if (sp.shape === 'diamond') {
                  const r = sp.size * (0.6 + t * 0.6);
                  ctx.beginPath();
                  ctx.moveTo(sp.x, sp.y - r);
                  ctx.lineTo(sp.x + r, sp.y);
                  ctx.lineTo(sp.x, sp.y + r);
                  ctx.lineTo(sp.x - r, sp.y);
                  ctx.closePath();
                  ctx.fill();
                } else if (sp.shape === 'star') {
                  const r = sp.size * (0.7 + t * 0.7);
                  ctx.lineWidth = 1.6;
                  ctx.beginPath();
                  ctx.moveTo(sp.x - r, sp.y);
                  ctx.lineTo(sp.x + r, sp.y);
                  ctx.moveTo(sp.x, sp.y - r);
                  ctx.lineTo(sp.x, sp.y + r);
                  ctx.stroke();
                } else {
                  ctx.beginPath();
                  ctx.arc(sp.x, sp.y, sp.size * t, 0, Math.PI * 2);
                  ctx.fill();
                }
              }
              ctx.restore();
            }

            // Step & render subtle Combo Milestone accents
            const cb = comboBurstsRef.current;
            if (cb.rings.length > 0 || cb.particles.length > 0 || cb.callouts.length > 0) {
              ctx.save();
              for (let i = cb.rings.length - 1; i >= 0; i--) {
                const r = cb.rings[i];
                r.radius += (r.maxRadius - r.radius) * Math.min(1, physicsDt * 8) + 42 * physicsDt;
                r.alpha -= physicsDt * 1.9;
                if (r.alpha <= 0 || r.radius >= r.maxRadius) {
                  cb.rings.splice(i, 1);
                  continue;
                }
                ctx.save();
                ctx.globalAlpha = Math.max(0, r.alpha);
                ctx.strokeStyle = `hsl(${r.hue}, 90%, 70%)`;
                ctx.lineWidth = r.lineWidth;
                ctx.beginPath();
                ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
              }

              for (let i = cb.particles.length - 1; i >= 0; i--) {
                const cp = cb.particles[i];
                cp.life -= physicsDt;
                if (cp.life <= 0) {
                  cb.particles.splice(i, 1);
                  continue;
                }
                const damp = Math.max(0, 1 - cp.drag * physicsDt);
                cp.vx *= damp;
                cp.vy = cp.vy * damp + cp.gravity * physicsDt;
                cp.x += cp.vx * physicsDt;
                cp.y += cp.vy * physicsDt;

                const t = cp.life / cp.maxLife;
                ctx.save();
                ctx.globalAlpha = Math.max(0, Math.min(0.82, t));
                ctx.fillStyle = `hsl(${cp.hue}, 90%, 70%)`;

                if (cp.shape === 'star') {
                  const rad = cp.size * (0.5 + t * 0.55);
                  ctx.beginPath();
                  for (let s = 0; s < 8; s++) {
                    const sr = s % 2 === 0 ? rad : rad * 0.42;
                    const a = (s / 8) * Math.PI * 2;
                    const px = cp.x + Math.cos(a) * sr;
                    const py = cp.y + Math.sin(a) * sr;
                    if (s === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                  }
                  ctx.closePath();
                  ctx.fill();
                } else if (cp.shape === 'diamond') {
                  const rad = cp.size * (0.5 + t * 0.5);
                  ctx.beginPath();
                  ctx.moveTo(cp.x, cp.y - rad);
                  ctx.lineTo(cp.x + rad * 0.85, cp.y);
                  ctx.lineTo(cp.x, cp.y + rad);
                  ctx.lineTo(cp.x - rad * 0.85, cp.y);
                  ctx.closePath();
                  ctx.fill();
                } else {
                  ctx.beginPath();
                  ctx.arc(cp.x, cp.y, Math.max(1, cp.size * t), 0, Math.PI * 2);
                  ctx.fill();
                }
                ctx.restore();
              }

              for (let i = cb.callouts.length - 1; i >= 0; i--) {
                const c = cb.callouts[i];
                c.life -= physicsDt;
                if (c.life <= 0) {
                  cb.callouts.splice(i, 1);
                  continue;
                }
                c.y += c.vy * physicsDt;
                const t = c.life / c.maxLife;
                ctx.save();
                ctx.globalAlpha = Math.max(0, Math.min(0.88, t * 1.25));
                ctx.font = `700 ${Math.round(13 * c.scale)}px "JetBrains Mono", monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = `hsl(${c.hue}, 92%, 75%)`;
                ctx.strokeStyle = 'rgba(15, 23, 42, 0.78)';
                ctx.lineWidth = 2.5;
                ctx.strokeText(c.text, c.x, c.y);
                ctx.fillText(c.text, c.x, c.y);
                ctx.restore();
              }
              ctx.restore();
            }

            ctx.restore();
          }
        }

        rafId = requestAnimationFrame(loop);
      };

      rafId = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(rafId);
    }, []);

    const getArenaCoords = (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: ARENA_WIDTH / 2, y: ARENA_HEIGHT / 2 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((clientX - rect.left) / rect.width) * ARENA_WIDTH,
        y: ((clientY - rect.top) / rect.height) * ARENA_HEIGHT,
      };
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const pt = getArenaCoords(e.clientX, e.clientY);
      hoverPosRef.current = pt;
      if (propsRef.current.gameState === 'PLAYING') {
        spawnCosmeticFx(pt.x, pt.y, false);
      }

      const mode = propsRef.current.playMode;
      if (mode === 'SWARM') {
        const w = swarmRef.current;
        const dx = pt.x - w.launcherX;
        const dy = Math.min(-32, pt.y - w.launcherY);
        const angle = Math.atan2(dy, dx);
        w.aimAngle = Math.max(-Math.PI + 0.16, Math.min(-0.16, angle));
      } else if (mode === 'RINGS') {
        const normX = (pt.x / ARENA_WIDTH - 0.5) * Math.PI * 2.2;
        ringWorldRef.current.targetAngleOffset = normX;
      } else if (mode === 'BLOOM') {
        if (propsRef.current.gameState === 'PLAYING') {
          rippleBloomOrbsNear(bloomRef.current, pt.x, pt.y);
        }
      } else if (mode === 'ORBIT') {
        const w = orbitRef.current;
        const dx = Math.max(24, pt.x - w.launcherX);
        const dy = pt.y - w.launcherY;
        w.aimAngle = Math.max(-1.25, Math.min(1.25, Math.atan2(dy, dx)));
      } else if (mode === 'SLICE') {
        if (propsRef.current.gameState === 'PLAYING' && pointerDownRef.current) {
          const effSlice = propsRef.current.zenMode
            ? { ...propsRef.current.sliceSettings, zenMode: true }
            : propsRef.current.sliceSettings;
          addBladePoint(
            sliceRef.current,
            pt.x,
            pt.y,
            effSlice,
            propsRef.current.reducedMotion
          );
          pushHud(false);
        }
      } else if (mode === 'DOMINO') {
        if (propsRef.current.gameState === 'PLAYING' && pointerDownRef.current) {
          if (propsRef.current.dominoActionMode === 'DRAW') {
            addDominoAt(dominoRef.current, pt.x, pt.y);
            pushHud(false);
          } else if (
            dominoRef.current.pieces.some(
              (p) => p.state === 'standing' && Math.hypot(p.x - pt.x, p.y - pt.y) <= 34
            )
          ) {
            toppleNearestDomino(dominoRef.current, pt.x, pt.y);
            pushHud(false);
          }
        }
      } else if (mode === 'VORTEX') {
        vortexRef.current.pointerX = pt.x;
        vortexRef.current.pointerY = pt.y;
        vortexRef.current.pointerActive = true;
      } else if (mode === 'LASER') {
        moveLaserDragAt(laserRef.current, pt.x, pt.y);
      } else if (mode === 'MERGE') {
        mergeRef.current.aimX = pt.x;
      } else if (mode === 'PLINKO') {
        plinkoRef.current.aimX = pt.x;
      } else if (mode === 'BUBBLE') {
        if (propsRef.current.gameState === 'PLAYING' && pointerDownRef.current) {
          popBubbleAt(
            bubbleRef.current,
            pt.x,
            pt.y,
            propsRef.current.reducedMotion
          );
          pushHud(false);
        }
      } else if (mode === 'VACUUM') {
        vacuumRef.current.targetX = pt.x;
        vacuumRef.current.targetY = pt.y;
      } else if (mode === 'SAND') {
        sandRef.current.pointerX = pt.x;
        sandRef.current.pointerY = pt.y;
        if (propsRef.current.gameState === 'PLAYING' && pointerDownRef.current) {
          applySandBrushAt(
            sandRef.current,
            propsRef.current.sandBrush,
            pt.x,
            pt.y
          );
          pushHud(false);
        }
      } else if (mode === 'CHIME') {
        if (propsRef.current.gameState === 'PLAYING' && pointerDownRef.current) {
          const action = propsRef.current.chimeActionMode;
          if (action === 'DRAW_BAR' && chimeRef.current.drawDraft) {
            chimeRef.current.drawDraft.x2 = pt.x;
            chimeRef.current.drawDraft.y2 = pt.y;
          } else if (action === 'ERASE') {
            eraseChimeAt(chimeRef.current, pt.x, pt.y);
          } else {
            strumChimesNear(
              chimeRef.current,
              pt.x,
              pt.y,
              propsRef.current.chimeVoice,
              propsRef.current.chimeScale,
              propsRef.current.reducedMotion,
              propsRef.current.zenMode
            );
          }
          pushHud(false);
        }
      } else if (mode === 'TRACK') {
        if (propsRef.current.gameState === 'PLAYING' && pointerDownRef.current) {
          const action = propsRef.current.trackActionMode;
          if (action === 'DRAW_RAIL' && trackRef.current.drawDraft) {
            trackRef.current.drawDraft.x2 = pt.x;
            trackRef.current.drawDraft.y2 = pt.y;
          } else if (action === 'ERASE') {
            eraseTrackAt(trackRef.current, pt.x, pt.y);
          }
          pushHud(false);
        }
      } else if (mode === 'PENDULUM') {
        if (propsRef.current.gameState === 'PLAYING' && pointerDownRef.current) {
          movePendulumDragAt(pendulumRef.current, pt.x, pt.y);
          pushHud(false);
        }
      } else if (mode === 'POND') {
        if (propsRef.current.gameState === 'PLAYING' && pointerDownRef.current) {
          if (Math.random() < 0.35) {
            spawnPondRippleAt(pondRef.current, pt.x, pt.y, false);
            pushHud(false);
          }
        }
      } else {
        const dx = pt.x - LAUNCHER_X;
        const dy = Math.max(20, pt.y - LAUNCHER_Y);
        const angle = Math.atan2(dy, dx);
        aimAngleRef.current = Math.max(0.18, Math.min(Math.PI - 0.18, angle));
      }
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      pointerDownRef.current = true;
      if (propsRef.current.gameState !== 'PLAYING') return;
      soundEngine.unlock();
      const pt = getArenaCoords(e.clientX, e.clientY);
      spawnCosmeticFx(pt.x, pt.y, true);
      const mode = propsRef.current.playMode;

      if (mode === 'SWARM') {
        const w = swarmRef.current;
        const dx = pt.x - w.launcherX;
        const dy = Math.min(-32, pt.y - w.launcherY);
        w.aimAngle = Math.max(-Math.PI + 0.16, Math.min(-0.16, Math.atan2(dy, dx)));
        launchSwarmVolley(w);
        pushHud(true);
        return;
      }

      if (mode === 'RINGS') {
        spawnRingBall(ringWorldRef.current);
        pushHud(true);
        return;
      }

      if (mode === 'BLOOM') {
        triggerBloomAt(
          bloomRef.current,
          pt.x,
          pt.y,
          propsRef.current.bloomSettings,
          propsRef.current.zenMode
        );
        pushHud(true);
        return;
      }

      if (mode === 'ORBIT') {
        const action = propsRef.current.orbitActionMode;
        if (action === 'ADD_WELL') {
          addGravityNode(orbitRef.current, pt.x, pt.y, false);
        } else if (action === 'ADD_REPULSOR') {
          addGravityNode(orbitRef.current, pt.x, pt.y, true);
        } else {
          const w = orbitRef.current;
          const dx = Math.max(24, pt.x - w.launcherX);
          const dy = pt.y - w.launcherY;
          w.aimAngle = Math.max(-1.25, Math.min(1.25, Math.atan2(dy, dx)));
          launchComet(w, propsRef.current.orbitSettings);
        }
        pushHud(true);
        return;
      }

      if (mode === 'SLICE') {
        sliceRef.current.bladeTrail = [{ x: pt.x, y: pt.y, age: 0 }];
        return;
      }

      if (mode === 'HEX') {
        triggerHexRippleAt(
          hexRef.current,
          pt.x,
          pt.y,
          propsRef.current.hexSettings
        );
        pushHud(true);
        return;
      }

      if (mode === 'DOMINO') {
        if (propsRef.current.dominoActionMode === 'DRAW') {
          dominoRef.current.lastDrawPoint = null;
          addDominoAt(dominoRef.current, pt.x, pt.y);
        } else {
          toppleNearestDomino(dominoRef.current, pt.x, pt.y);
        }
        pushHud(true);
        return;
      }

      if (mode === 'PULSE') {
        triggerBeatHit(
          beatPulseRef.current,
          pt.x,
          pt.y,
          propsRef.current.reducedMotion
        );
        pushHud(true);
        return;
      }

      if (mode === 'VORTEX') {
        vortexRef.current.pointerX = pt.x;
        vortexRef.current.pointerY = pt.y;
        vortexRef.current.pointerActive = true;
        burstVortexAt(vortexRef.current, pt.x, pt.y);
        pushHud(true);
        return;
      }

      if (mode === 'LASER') {
        startLaserDragAt(laserRef.current, pt.x, pt.y);
        pushHud(true);
        return;
      }

      if (mode === 'MERGE') {
        mergeRef.current.aimX = pt.x;
        dropMergeOrb(mergeRef.current, pt.x, false);
        pushHud(true);
        return;
      }

      if (mode === 'PLINKO') {
        plinkoRef.current.aimX = pt.x;
        dropPlinkoBalls(plinkoRef.current, pt.x, 1);
        pushHud(true);
        return;
      }

      if (mode === 'BUBBLE') {
        popBubbleAt(
          bubbleRef.current,
          pt.x,
          pt.y,
          propsRef.current.reducedMotion
        );
        pushHud(true);
        return;
      }

      if (mode === 'VACUUM') {
        vacuumRef.current.targetX = pt.x;
        vacuumRef.current.targetY = pt.y;
        triggerVacuumPulse(vacuumRef.current, propsRef.current.reducedMotion);
        pushHud(true);
        return;
      }

      if (mode === 'SAND') {
        sandRef.current.lastDrawPt = null;
        sandRef.current.pouring = propsRef.current.sandBrush === 'pour';
        applySandBrushAt(
          sandRef.current,
          propsRef.current.sandBrush,
          pt.x,
          pt.y
        );
        pushHud(true);
        return;
      }

      if (mode === 'CHIME') {
        const action = propsRef.current.chimeActionMode;
        if (action === 'DRAW_BAR') {
          chimeRef.current.drawDraft = { x1: pt.x, y1: pt.y, x2: pt.x, y2: pt.y };
        } else if (action === 'ERASE') {
          eraseChimeAt(chimeRef.current, pt.x, pt.y);
        } else {
          spawnChimeMarbleAt(chimeRef.current, pt.x, pt.y, 3);
          strumChimesNear(
            chimeRef.current,
            pt.x,
            pt.y,
            propsRef.current.chimeVoice,
            propsRef.current.chimeScale,
            propsRef.current.reducedMotion,
            propsRef.current.zenMode
          );
        }
        pushHud(true);
        return;
      }

      if (mode === 'TRACK') {
        const action = propsRef.current.trackActionMode;
        if (action === 'DRAW_RAIL') {
          trackRef.current.drawDraft = { x1: pt.x, y1: pt.y, x2: pt.x, y2: pt.y };
        } else if (action === 'PLACE_SEESAW') {
          addUserTrackSeesaw(trackRef.current, pt.x, pt.y);
        } else if (action === 'PLACE_BELL') {
          addUserTrackBell(trackRef.current, pt.x, pt.y);
        } else if (action === 'ERASE') {
          eraseTrackAt(trackRef.current, pt.x, pt.y);
        } else {
          spawnTrackMarbleAt(trackRef.current, pt.x, pt.y, 2);
        }
        pushHud(true);
        return;
      }

      if (mode === 'PENDULUM') {
        interactPendulumAt(pendulumRef.current, pt.x, pt.y);
        pushHud(true);
        return;
      }

      if (mode === 'POND') {
        spawnPondRippleAt(pondRef.current, pt.x, pt.y, true);
        pushHud(true);
        return;
      }

      // Sandbox placement or shooting
      if (propsRef.current.sandboxActionMode === 'PLACE' && pt.y >= 96) {
        const world = sandboxRef.current;
        const brush = propsRef.current.activeBrush;
        if (brush === 'eraser') {
          const before = world.pegs.length;
          world.pegs = world.pegs.filter(
            (p) => Math.hypot(p.x - pt.x, p.y - pt.y) > Math.max(24, p.radius + 10)
          );
          if (world.pegs.length !== before) {
            soundEngine.playPlaceToy();
            pushHud(true);
          }
        } else {
          world.pegs = placeToyPeg(world.pegs, pt.x, pt.y, brush);
          soundEngine.playPlaceToy();
          pushHud(true);
        }
        return;
      }

      fireSandboxBall();
    };

    const handlePointerUp = () => {
      pointerDownRef.current = false;
      dominoRef.current.lastDrawPoint = null;
      sandRef.current.pouring = false;
      sandRef.current.lastDrawPt = null;
      if (propsRef.current.playMode === 'CHIME' && chimeRef.current.drawDraft) {
        const d = chimeRef.current.drawDraft;
        addUserChimeBar(chimeRef.current, d.x1, d.y1, d.x2, d.y2);
        chimeRef.current.drawDraft = null;
        pushHud(true);
      }
      if (propsRef.current.playMode === 'TRACK' && trackRef.current.drawDraft) {
        const d = trackRef.current.drawDraft;
        const added = addUserTrackRail(trackRef.current, d.x1, d.y1, d.x2, d.y2);
        if (!added) {
          spawnTrackMarbleAt(trackRef.current, d.x1, d.y1, 1);
        }
        trackRef.current.drawDraft = null;
        pushHud(true);
      }
      if (propsRef.current.playMode === 'LASER') {
        endLaserDragAt(laserRef.current, propsRef.current.reducedMotion);
        pushHud(true);
      }
      if (propsRef.current.playMode === 'PENDULUM') {
        endPendulumDrag(pendulumRef.current);
      }
    };

    const activeTheme = getArenaTheme(equippedTheme);

    return (
      <div
        className={`relative w-full overflow-hidden rounded-xl border ${activeTheme.frameBorderClass} bg-[#080D1A] shadow-2xl transition-colors`}
      >
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={() => {
            pointerDownRef.current = false;
            hoverPosRef.current = null;
            dominoRef.current.lastDrawPoint = null;
            vortexRef.current.pointerActive = false;
          }}
          className="block w-full aspect-[800/620] touch-none select-none cursor-crosshair"
        />
      </div>
    );
  }
);
