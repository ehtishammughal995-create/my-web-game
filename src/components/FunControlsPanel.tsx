import {
  CheckCircle2,
  Clock,
  Eraser,
  FastForward,
  Flame,
  Layers,
  Magnet,
  Orbit,
  Play,
  PlusCircle,
  Radio,
  RotateCcw,
  Sparkles,
  Target,
  Trash2,
  Wind,
  Zap,
} from 'lucide-react';
import { BEAT_LEVELS } from '../game/beatPulseEngine';
import { CHIME_PRESET_NAMES } from '../game/chimeEngine';
import { SAND_LEVEL_NAMES } from '../game/chromaSandEngine';
import { HEX_LEVELS } from '../game/hexRippleEngine';
import { TRACK_PRESET_NAMES } from '../game/marbleRunEngine';
import { MERGE_TIERS } from '../game/orbMergeEngine';
import { PENDULUM_LEVELS, PendulumVoice } from '../game/pendulumEngine';
import { POND_LEVELS } from '../game/koiPondEngine';
import { LASER_LEVEL_NAMES } from '../game/prismLaserEngine';
import { RING_LEVEL_CATALOG } from '../game/ringEscapeEngine';
import { VACUUM_LEVEL_NAMES } from '../game/vacuumEngine';
import { VORTEX_LEVELS } from '../game/vortexPaintEngine';
import {
  BeatLevelId,
  BloomPreset,
  BloomSettings,
  BubblePreset,
  ChimeActionMode,
  ChimePreset,
  ChimeScaleId,
  ChimeVoiceId,
  DominoPreset,
  FunModifiers,
  HexLevelId,
  HexRippleSettings,
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
  VacuumPreset,
  VortexLevelId,
} from '../game/types';

export type SandboxActionMode = 'PLACE' | 'SHOOT';
export type OrbitActionMode = 'SHOOT' | 'ADD_WELL' | 'ADD_REPULSOR';
export type DominoActionMode = 'TOPPLE' | 'DRAW';

interface FunControlsPanelProps {
  playMode: PlayMode;
  modifiers: FunModifiers;
  swarmPreset: SwarmPreset;
  ringSettings: RingEscapeSettings;
  ringPreset: RingLevelPreset;
  bloomPreset: BloomPreset;
  bloomSettings: BloomSettings;
  orbitSettings: OrbitSettings;
  orbitLevel: number;
  slicePreset: SlicePreset;
  sliceSettings: SliceSettings;
  hexLevel: HexLevelId;
  hexSettings: HexRippleSettings;
  dominoPreset: DominoPreset;
  dominoActionMode: DominoActionMode;
  beatLevel: BeatLevelId;
  beatAutoPlay: boolean;
  vortexLevel: VortexLevelId;
  vortexSwirl: boolean;
  vortexRepel: boolean;
  laserLevel: number;
  laserSolvedLevels: number[];
  laserAutoRotate: boolean;
  mergePreset: MergePreset;
  plinkoPreset: PlinkoPreset;
  bubblePreset: BubblePreset;
  vacuumPreset: VacuumPreset;
  sandPreset: SandPreset;
  sandBrush: SandBrush;
  sandAutoFountain: boolean;
  chimePreset: ChimePreset;
  chimeActionMode: ChimeActionMode;
  chimeVoice: ChimeVoiceId;
  chimeScale: ChimeScaleId;
  chimeAutoFlow: boolean;
  trackPreset: TrackPreset;
  trackActionMode: TrackActionMode;
  trackAutoFlow: boolean;
  pendulumPreset: PendulumPreset;
  pendulumVoice: PendulumVoice;
  pendulumTrails: boolean;
  pendulumAutoPulse: boolean;
  pondPreset: PondPreset;
  pondRain: boolean;
  pondWhirlpool: boolean;
  sandboxPreset: SandboxPreset;
  activeBrush: ToyBrush;
  sandboxActionMode: SandboxActionMode;
  orbitActionMode: OrbitActionMode;
  swarmFiring: boolean;
  swarmSpeedMult: number;
  zenMode: boolean;
  onToggleZenMode: () => void;
  onToggleModifier: (key: keyof FunModifiers) => void;
  onSelectSwarmPreset: (preset: SwarmPreset) => void;
  onToggleRingSetting: (key: keyof RingEscapeSettings) => void;
  onSelectRingPreset: (preset: RingLevelPreset) => void;
  onSelectBloomPreset: (preset: BloomPreset) => void;
  onToggleBloomSetting: (key: keyof BloomSettings) => void;
  onToggleOrbitSetting: (key: keyof OrbitSettings) => void;
  onSelectOrbitLevel: (level: number) => void;
  onSelectSlicePreset: (preset: SlicePreset) => void;
  onToggleSliceSetting: (key: keyof SliceSettings) => void;
  onSelectHexLevel: (levelId: HexLevelId) => void;
  onToggleHexSetting: (key: keyof HexRippleSettings) => void;
  onSelectDominoPreset: (preset: DominoPreset) => void;
  onSetDominoActionMode: (mode: DominoActionMode) => void;
  onDominoStartTopple: () => void;
  onSelectBeatLevel: (id: BeatLevelId) => void;
  onToggleBeatAutoPlay: () => void;
  onSelectVortexLevel: (id: VortexLevelId) => void;
  onToggleVortexSwirl: () => void;
  onToggleVortexRepel: () => void;
  onVortexBurst: () => void;
  onSelectLaserLevel: (level: number) => void;
  onToggleLaserAutoRotate: () => void;
  onLaserReset: () => void;
  onSelectMergePreset: (preset: MergePreset) => void;
  onMergeDrop: () => void;
  onMergeShake: () => void;
  onMergeReset: () => void;
  onSelectPlinkoPreset: (preset: PlinkoPreset) => void;
  onPlinkoDrop: (count: number) => void;
  onPlinkoReset: () => void;
  onSelectBubblePreset: (preset: BubblePreset) => void;
  onBubbleReset: () => void;
  onSelectVacuumPreset: (preset: VacuumPreset) => void;
  onVacuumPulse: () => void;
  onVacuumReset: () => void;
  onSelectSandPreset: (preset: SandPreset) => void;
  onSelectSandBrush: (brush: SandBrush) => void;
  onToggleSandAutoFountain: () => void;
  onSandBurst: () => void;
  onSandClearWalls: () => void;
  onSandReset: () => void;
  onSelectChimePreset: (preset: ChimePreset) => void;
  onSelectChimeActionMode: (mode: ChimeActionMode) => void;
  onSelectChimeVoice: (voice: ChimeVoiceId) => void;
  onSelectChimeScale: (scale: ChimeScaleId) => void;
  onToggleChimeAutoFlow: () => void;
  onChimeShower: () => void;
  onChimeStrumAll: () => void;
  onChimeReset: () => void;
  onSelectTrackPreset: (preset: TrackPreset) => void;
  onSelectTrackActionMode: (mode: TrackActionMode) => void;
  onToggleTrackAutoFlow: () => void;
  onTrackDropWave: () => void;
  onTrackReset: () => void;
  onSelectPendulumPreset: (preset: PendulumPreset) => void;
  onSelectPendulumVoice: (voice: PendulumVoice) => void;
  onTogglePendulumTrails: () => void;
  onTogglePendulumAutoPulse: () => void;
  onPendulumPulse: () => void;
  onPendulumClearTrails: () => void;
  onPendulumReset: () => void;
  onSelectPondPreset: (preset: PondPreset) => void;
  onTogglePondRain: () => void;
  onTogglePondWhirlpool: () => void;
  onPondScatterPetals: () => void;
  onPondClearRipples: () => void;
  onPondReset: () => void;
  onSelectSandboxPreset: (preset: SandboxPreset) => void;
  onSelectBrush: (brush: ToyBrush) => void;
  onSetSandboxActionMode: (mode: SandboxActionMode) => void;
  onSetOrbitActionMode: (mode: OrbitActionMode) => void;
  onSwarmToggleSpeed: () => void;
  onSwarmRecall: () => void;
  onSwarmRestart: () => void;
  onRingSpawnBall: () => void;
  onRingPulse: () => void;
  onRingNextLevel: () => void;
  onBloomReset: () => void;
  onOrbitConstellation: () => void;
  onOrbitClearTrails: () => void;
  onOrbitReset: () => void;
  onSliceReset: () => void;
  onHexReset: () => void;
  onLaunchSingle: () => void;
  onLaunchAvalanche: () => void;
  onLaunchSupernova: () => void;
  onClearAllPegs: () => void;
}

const TOY_BRUSHES: Array<{
  id: ToyBrush;
  label: string;
  hint: string;
  swatch: string;
}> = [
  { id: 'bumper', label: 'Bumper', hint: 'Power bounce', swatch: 'bg-emerald-500' },
  { id: 'bomb', label: 'Blast Bomb', hint: 'Shockwave', swatch: 'bg-rose-500' },
  { id: 'splitter', label: 'Prism Split', hint: 'Doubles ball', swatch: 'bg-cyan-400' },
  { id: 'spring', label: 'Spring Pad', hint: 'Boosts up', swatch: 'bg-pink-400' },
  { id: 'portal', label: 'Portal Pair', hint: 'Warps ball', swatch: 'bg-violet-400' },
  { id: 'spinner', label: 'Windmill', hint: 'Spinning bar', swatch: 'bg-slate-300' },
  { id: 'target', label: 'Amber Peg', hint: '250 pts', swatch: 'bg-amber-500' },
  { id: 'eraser', label: 'Eraser', hint: 'Remove toy', swatch: 'bg-rose-900' },
];

const MODIFIER_ITEMS: Array<{
  key: keyof FunModifiers;
  label: string;
  desc: string;
  icon: typeof Zap;
}> = [
  { key: 'multiBall', label: 'Triple Shot', desc: 'Fire 3 marbles per drop', icon: Layers },
  { key: 'giantMarble', label: 'Heavy Marble', desc: 'Larger high-impact spheres', icon: Target },
  { key: 'lowGravity', label: 'Moon Float', desc: 'Dreamy low-gravity drift', icon: Orbit },
  { key: 'magnetBucket', label: 'Magnet Tray', desc: 'Widens bottom catch rail', icon: Magnet },
  { key: 'superBounce', label: 'Super Bounce', desc: 'Extra energetic rebounds', icon: Zap },
  { key: 'rainbowTrail', label: 'Prism Trails', desc: 'Color-shifting comet paths', icon: Flame },
  { key: 'slowMo', label: 'Slow-Mo', desc: '0.36x cinematic time-dilation', icon: Clock },
];

export function FunControlsPanel({
  playMode,
  modifiers,
  swarmPreset,
  ringSettings,
  ringPreset,
  bloomPreset,
  bloomSettings,
  orbitSettings,
  orbitLevel,
  slicePreset,
  sliceSettings,
  hexLevel,
  hexSettings,
  dominoPreset,
  dominoActionMode,
  beatLevel,
  beatAutoPlay,
  vortexLevel,
  vortexSwirl,
  vortexRepel,
  laserLevel,
  laserSolvedLevels,
  laserAutoRotate,
  mergePreset,
  plinkoPreset,
  bubblePreset,
  vacuumPreset,
  sandPreset,
  sandBrush,
  sandAutoFountain,
  chimePreset,
  chimeActionMode,
  chimeVoice,
  chimeScale,
  chimeAutoFlow,
  trackPreset,
  trackActionMode,
  trackAutoFlow,
  pendulumPreset,
  pendulumVoice,
  pendulumTrails,
  pendulumAutoPulse,
  pondPreset,
  pondRain,
  pondWhirlpool,
  sandboxPreset,
  activeBrush,
  sandboxActionMode,
  orbitActionMode,
  swarmFiring,
  swarmSpeedMult,
  zenMode,
  onToggleZenMode,
  onToggleModifier,
  onSelectSwarmPreset,
  onToggleRingSetting,
  onSelectRingPreset,
  onSelectBloomPreset,
  onToggleBloomSetting,
  onToggleOrbitSetting,
  onSelectOrbitLevel,
  onSelectSlicePreset,
  onToggleSliceSetting,
  onSelectHexLevel,
  onToggleHexSetting,
  onSelectDominoPreset,
  onSetDominoActionMode,
  onDominoStartTopple,
  onSelectBeatLevel,
  onToggleBeatAutoPlay,
  onSelectVortexLevel,
  onToggleVortexSwirl,
  onToggleVortexRepel,
  onVortexBurst,
  onSelectLaserLevel,
  onToggleLaserAutoRotate,
  onLaserReset,
  onSelectMergePreset,
  onMergeDrop,
  onMergeShake,
  onMergeReset,
  onSelectPlinkoPreset,
  onPlinkoDrop,
  onPlinkoReset,
  onSelectBubblePreset,
  onBubbleReset,
  onSelectVacuumPreset,
  onVacuumPulse,
  onVacuumReset,
  onSelectSandPreset,
  onSelectSandBrush,
  onToggleSandAutoFountain,
  onSandBurst,
  onSandClearWalls,
  onSandReset,
  onSelectChimePreset,
  onSelectChimeActionMode,
  onSelectChimeVoice,
  onSelectChimeScale,
  onToggleChimeAutoFlow,
  onChimeShower,
  onChimeStrumAll,
  onChimeReset,
  onSelectTrackPreset,
  onSelectTrackActionMode,
  onToggleTrackAutoFlow,
  onTrackDropWave,
  onTrackReset,
  onSelectPendulumPreset,
  onSelectPendulumVoice,
  onTogglePendulumTrails,
  onTogglePendulumAutoPulse,
  onPendulumPulse,
  onPendulumClearTrails,
  onPendulumReset,
  onSelectPondPreset,
  onTogglePondRain,
  onTogglePondWhirlpool,
  onPondScatterPetals,
  onPondClearRipples,
  onPondReset,
  onSelectSandboxPreset,
  onSelectBrush,
  onSetSandboxActionMode,
  onSetOrbitActionMode,
  onSwarmToggleSpeed,
  onSwarmRecall,
  onSwarmRestart,
  onRingSpawnBall,
  onRingPulse,
  onRingNextLevel,
  onBloomReset,
  onOrbitConstellation,
  onOrbitClearTrails,
  onOrbitReset,
  onSliceReset,
  onHexReset,
  onLaunchSingle,
  onLaunchAvalanche,
  onLaunchSupernova,
  onClearAllPegs,
}: FunControlsPanelProps) {
  const zenHintByMode: Record<PlayMode, string> = {
    SWARM: 'Hides scores, fever alerts & danger line · Endless',
    RINGS: 'Hides scores & floating popups · Pure ASMR flow',
    BLOOM: 'Unlimited taps · No wave retries or score counters',
    ORBIT: 'Hides scores & popups · Dreamy gravity ribbons',
    SLICE: 'Removes hazards, lives & scores · Endless slicing',
    HEX: 'Hides scores & popups · Pure musical hex waves',
    DOMINO: 'Hides scores & popups · Calm chain topples',
    PULSE: 'No combo breaks, shake or scores · Pure rhythm',
    VORTEX: 'Hides scores & well quotas · Ambient fluid swirls',
    LASER: 'Hides scores & pressure UI · Calm beam tuning',
    MERGE: 'Hides scores & shake · Gentle cosmic merges',
    PLINKO: 'Hides scores & multipliers · Soothing chime drops',
    BUBBLE: 'Hides scores & popups · Endless ASMR popping',
    VACUUM: 'Hides scores, combo timers & shake · Smooth pull',
    SAND: 'Hides scores & chalice multipliers · ASMR dunes',
    CHIME: 'Hides note names & scores · Pure ambient harp',
    TRACK: 'Hides scores & popups · Pure kinetic coaster flow',
    PENDULUM: 'Hides scores & popups · Hypnotic harmonic waves',
    POND: 'Hides scores & hints · Pure meditative Koi garden',
    SANDBOX: 'Hides scores & popups · Pure physics toybox',
  };

  return (
    <aside className="flex w-full flex-col gap-5 rounded-xl border border-slate-800/90 bg-[#131C2E] p-4 lg:w-[330px] lg:shrink-0">
      <section className="flex flex-col gap-2">
        <button
          type="button"
          aria-pressed={zenMode}
          onClick={onToggleZenMode}
          className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors ${
            zenMode
              ? 'border-teal-400/60 bg-teal-950/45 text-teal-100'
              : 'border-slate-800 bg-slate-900/60 text-slate-200 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <Wind
              className={`h-4 w-4 shrink-0 ${
                zenMode ? 'text-teal-300' : 'text-slate-400'
              }`}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold">
                Zen Mode (ASMR)
              </div>
              <div className="truncate text-[11px] text-slate-400">
                {zenHintByMode[playMode]}
              </div>
            </div>
          </div>
          <span
            className={`font-mono-num shrink-0 text-[11px] font-semibold whitespace-nowrap ${
              zenMode ? 'text-teal-300' : 'text-slate-500'
            }`}
          >
            {zenMode ? 'ON' : 'OFF'}
          </span>
        </button>

        {playMode !== 'SANDBOX' && (
          <button
            type="button"
            aria-pressed={modifiers.slowMo}
            onClick={() => onToggleModifier('slowMo')}
            className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors ${
              modifiers.slowMo
                ? 'border-indigo-400/60 bg-indigo-950/45 text-indigo-100'
                : 'border-slate-800 bg-slate-900/50 text-slate-200 hover:bg-slate-800/75 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <Clock
                className={`h-4 w-4 shrink-0 ${
                  modifiers.slowMo ? 'text-indigo-300' : 'text-slate-400'
                }`}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold">
                  Slow-Mo (0.36x)
                </div>
                <div className="truncate text-[11px] text-slate-400">
                  Cinematic time-dilation for collisions &amp; chimes
                </div>
              </div>
            </div>
            <span
              className={`font-mono-num shrink-0 text-[11px] font-semibold whitespace-nowrap ${
                modifiers.slowMo ? 'text-indigo-300' : 'text-slate-500'
              }`}
            >
              {modifiers.slowMo ? 'ON' : 'OFF'}
            </span>
          </button>
        )}
      </section>

      <div className="h-px w-full bg-slate-800" />

      {playMode === 'SWARM' && (
        <>
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                Swarm Intensity Levels (9 Modes)
              </h2>
              <span className="text-xs text-slate-400">Up to Extreme</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'CLASSIC', label: '8x Start' },
                  { id: 'VOLLEY30', label: '30x Volley' },
                  { id: 'FORTRESS', label: 'Armor Fortress' },
                  { id: 'BOMB_GARDEN', label: 'Bomb Garden' },
                  { id: 'DIAMOND_GALAXY', label: 'Diamond Galaxy' },
                  { id: 'LASER_MATRIX', label: 'Laser Matrix' },
                  { id: 'PRISM_TUNNEL', label: 'Prism Tunnel' },
                  { id: 'TWIN_GALAXIES', label: 'Twin Galaxies' },
                  { id: 'EXTREME100', label: '100x Blitz Extreme' },
                ] as const
              ).map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => onSelectSwarmPreset(lvl.id)}
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                    lvl.id === 'EXTREME100' ? 'col-span-2' : ''
                  } ${
                    swarmPreset === lvl.id
                      ? lvl.id === 'EXTREME100'
                        ? 'border-rose-400 bg-rose-500 text-slate-950'
                        : 'border-amber-400 bg-amber-500 text-slate-950'
                      : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
                <div className="font-semibold text-emerald-400">+1 Orbs</div>
                <div className="mt-0.5 text-slate-400">
                  Grow swarm up to 130 balls
                </div>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
                <div className="font-semibold text-rose-400">Blast Bombs</div>
                <div className="mt-0.5 text-slate-400">
                  Chain explosions clear rows
                </div>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
                <div className="font-semibold text-cyan-400">Laser Nodes</div>
                <div className="mt-0.5 text-slate-400">
                  Slice whole rows &amp; columns
                </div>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
                <div className="font-semibold text-amber-400">Fever 2x</div>
                <div className="mt-0.5 text-slate-400">
                  25+ bounces deals 2x damage
                </div>
              </div>
            </div>
          </section>

          <div className="h-px w-full bg-slate-800" />

          <section className="flex flex-col gap-2">
            <h2 className="font-display text-sm font-semibold text-slate-100">
              Volley Controls
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={!swarmFiring}
                onClick={onSwarmToggleSpeed}
                className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors whitespace-nowrap ${
                  swarmFiring
                    ? swarmSpeedMult > 1
                      ? 'border-amber-400 bg-amber-500 text-slate-950'
                      : 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700'
                    : 'border-slate-800 bg-slate-900/40 text-slate-600 cursor-not-allowed'
                }`}
              >
                <FastForward className="h-3.5 w-3.5" />
                <span>{swarmSpeedMult > 1 ? '2x Speed On' : '2x Speed'}</span>
              </button>
              <button
                type="button"
                disabled={!swarmFiring}
                onClick={onSwarmRecall}
                className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors whitespace-nowrap ${
                  swarmFiring
                    ? 'border-sky-500/60 bg-sky-950/60 text-sky-200 hover:bg-sky-900/60'
                    : 'border-slate-800 bg-slate-900/40 text-slate-600 cursor-not-allowed'
                }`}
              >
                <span>Recall Stream</span>
              </button>
            </div>
            <button
              type="button"
              onClick={onSwarmRestart}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/70 px-3 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>New Run</span>
            </button>
          </section>
        </>
      )}

      {playMode === 'RINGS' && (
        <>
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                Ring Escape Arenas (24 Modes)
              </h2>
              <span className="text-xs text-slate-400">ASMR · Creepy · Extreme</span>
            </div>
            <div className="grid max-h-[268px] grid-cols-2 gap-1.5 overflow-y-auto pr-1">
              {RING_LEVEL_CATALOG.map((item) => {
                const active = ringPreset === item.id;
                const activeStyle =
                  item.tag === 'Extreme'
                    ? 'border-rose-400 bg-rose-500 text-slate-950'
                    : item.tag === 'Creepy'
                    ? 'border-red-400/80 bg-red-950/75 text-red-100'
                    : item.tag === 'ASMR'
                    ? 'border-teal-400/75 bg-teal-950/60 text-teal-100'
                    : 'border-emerald-400/70 bg-emerald-950/50 text-emerald-200';
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectRingPreset(item.id)}
                    className={`flex flex-col items-start rounded-lg border px-2.5 py-1.5 text-left transition-colors ${
                      active
                        ? activeStyle
                        : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <span className="w-full truncate text-xs font-semibold">
                      {item.label}
                    </span>
                    <span
                      className={`text-[10px] font-medium ${
                        active
                          ? item.tag === 'Extreme'
                            ? 'text-slate-900'
                            : 'text-slate-300'
                          : item.tag === 'Creepy'
                          ? 'text-rose-400/90'
                          : item.tag === 'ASMR'
                          ? 'text-teal-400/90'
                          : item.tag === 'Extreme'
                          ? 'text-amber-400/90'
                          : 'text-slate-500'
                      }`}
                    >
                      {item.tag}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onRingSpawnBall}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-emerald-400 px-3 text-xs font-semibold text-slate-950 hover:bg-emerald-300 transition-colors whitespace-nowrap"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>+1 Marble</span>
              </button>
              <button
                type="button"
                onClick={onRingPulse}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-sky-400 px-3 text-xs font-semibold text-slate-950 hover:bg-sky-300 transition-colors whitespace-nowrap"
              >
                <Radio className="h-3.5 w-3.5" />
                <span>Pulse Burst</span>
              </button>
            </div>
            <button
              type="button"
              onClick={onRingNextLevel}
              className="mt-2 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/70 px-3 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Fresh Rings</span>
            </button>
          </section>

          <div className="h-px w-full bg-slate-800" />

          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                Satisfying Physics
              </h2>
              <span className="text-xs text-slate-400">Live toggles</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {(
                [
                  {
                    key: 'accelerateOnBounce',
                    label: 'Speed Up on Bounce',
                    desc: 'Builds wild momentum before escape',
                  },
                  {
                    key: 'growOnBounce',
                    label: 'Grow on Bounce',
                    desc: 'Marbles swell bigger with each hit',
                  },
                  {
                    key: 'multiplyOnEscape',
                    label: 'Multiply on Escape',
                    desc: 'Shattered rings spawn +1 marble',
                  },
                  {
                    key: 'autoSteer',
                    label: 'Auto-Spin (Watch Mode)',
                    desc: 'Hands-free hypnotic video loop',
                  },
                  {
                    key: 'lowGravity',
                    label: 'Floaty Orbit',
                    desc: 'Slower, smoother dreamy arcs',
                  },
                ] as const
              ).map((item) => {
                const enabled = ringSettings[item.key];
                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={enabled}
                    onClick={() => onToggleRingSetting(item.key)}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors ${
                      enabled
                        ? 'border-emerald-400/50 bg-emerald-950/40 text-emerald-100'
                        : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="truncate text-xs font-semibold">
                        {item.label}
                      </div>
                      <div className="truncate text-[11px] text-slate-400">
                        {item.desc}
                      </div>
                    </div>
                    <span
                      className={`font-mono-num shrink-0 text-[11px] font-semibold ${
                        enabled ? 'text-emerald-300' : 'text-slate-500'
                      }`}
                    >
                      {enabled ? 'ON' : 'OFF'}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}

      {playMode === 'BLOOM' && (
        <>
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                Bloom Density Levels (9 Modes)
              </h2>
              <span className="text-xs text-slate-400">1-Tap Chains</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'CLASSIC', label: 'Classic 30' },
                  { id: 'SUPERCELL', label: '55-Orb Cell' },
                  { id: 'CLUSTER_BOMBS', label: 'Mega Cluster' },
                  { id: 'HYPER_SWARM', label: 'Hyper Drift' },
                  { id: 'ASMR_NEBULA', label: 'ASMR Nebula' },
                  { id: 'GALAXY_SPIRAL', label: 'Galaxy Spiral' },
                  { id: 'SAKURA_DRIFT', label: 'Sakura Drift' },
                  { id: 'DIAMOND_REACTOR', label: 'Diamond Reactor' },
                  { id: 'EXTREME100', label: '100-Orb Nova Extreme' },
                ] as const
              ).map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => onSelectBloomPreset(lvl.id)}
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                    lvl.id === 'EXTREME100' ? 'col-span-2' : ''
                  } ${
                    bloomPreset === lvl.id
                      ? lvl.id === 'EXTREME100'
                        ? 'border-rose-400 bg-rose-500 text-slate-950'
                        : 'border-violet-400 bg-violet-400 text-slate-950'
                      : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onBloomReset}
              className="mt-3 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-violet-400 px-3 text-xs font-semibold text-slate-950 hover:bg-violet-300 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Fresh Wave</span>
            </button>
          </section>

          <div className="h-px w-full bg-slate-800" />

          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                Chain Modifiers
              </h2>
              <span className="text-xs text-slate-400">Live toggles</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {(
                [
                  {
                    key: 'chaosEndless',
                    label: 'Endless Chaos Mode',
                    desc: 'Unlimited clicks & continuous orbs',
                  },
                  {
                    key: 'megaRadius',
                    label: 'Mega Bloom Radius',
                    desc: 'Larger shockwaves for huge chains',
                  },
                  {
                    key: 'magnetDrift',
                    label: 'Bloom Magnet',
                    desc: 'Orbs drift toward active light rings',
                  },
                ] as const
              ).map((item) => {
                const enabled = bloomSettings[item.key];
                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={enabled}
                    onClick={() => onToggleBloomSetting(item.key)}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors ${
                      enabled
                        ? 'border-violet-400/50 bg-violet-950/40 text-violet-100'
                        : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="truncate text-xs font-semibold">
                        {item.label}
                      </div>
                      <div className="truncate text-[11px] text-slate-400">
                        {item.desc}
                      </div>
                    </div>
                    <span
                      className={`font-mono-num shrink-0 text-[11px] font-semibold ${
                        enabled ? 'text-violet-300' : 'text-slate-500'
                      }`}
                    >
                      {enabled ? 'ON' : 'OFF'}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}

      {playMode === 'ORBIT' && (
        <>
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                Cosmic Systems (10 Levels)
              </h2>
              <span className="text-xs text-slate-400">10 = Tri-Star</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => onSelectOrbitLevel(lvl)}
                  className={`font-mono-num rounded-lg border py-2 text-xs font-semibold transition-colors ${
                    ((orbitLevel - 1) % 10) + 1 === lvl
                      ? lvl >= 9
                        ? 'border-amber-400 bg-amber-400 text-slate-950'
                        : 'border-rose-400 bg-rose-500 text-slate-950'
                      : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {lvl < 10 ? `0${lvl}` : lvl}
                </button>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-slate-900 p-1 border border-slate-800">
              {(
                [
                  { id: 'SHOOT', label: 'Shoot' },
                  { id: 'ADD_WELL', label: '+ Well' },
                  { id: 'ADD_REPULSOR', label: '- Push' },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => onSetOrbitActionMode(mode.id)}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    orbitActionMode === mode.id
                      ? 'bg-rose-400 text-slate-950 font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onOrbitConstellation}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-rose-400 px-3 text-xs font-semibold text-slate-950 hover:bg-rose-300 transition-colors whitespace-nowrap"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>6-Comet Fan</span>
              </button>
              <button
                type="button"
                onClick={onOrbitClearTrails}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 px-3 text-xs font-semibold text-slate-100 hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                Clear Trails
              </button>
            </div>
            <button
              type="button"
              onClick={onOrbitReset}
              className="mt-2 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/70 px-3 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Orbit</span>
            </button>
          </section>

          <div className="h-px w-full bg-slate-800" />

          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                Orbit Settings
              </h2>
              <span className="text-xs text-slate-400">Live toggles</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {(
                [
                  {
                    key: 'paintTrails',
                    label: 'Paint Spirograph Art',
                    desc: 'Leave glowing orbital ribbons behind',
                  },
                  {
                    key: 'multiComet',
                    label: '3x Comet Spread',
                    desc: 'Launch 3 comets per click',
                  },
                  {
                    key: 'strongGravity',
                    label: 'Deep Gravity Pull',
                    desc: 'Tighter high-speed orbital loops',
                  },
                ] as const
              ).map((item) => {
                const enabled = orbitSettings[item.key];
                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={enabled}
                    onClick={() => onToggleOrbitSetting(item.key)}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors ${
                      enabled
                        ? 'border-rose-400/50 bg-rose-950/40 text-rose-100'
                        : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="truncate text-xs font-semibold">
                        {item.label}
                      </div>
                      <div className="truncate text-[11px] text-slate-400">
                        {item.desc}
                      </div>
                    </div>
                    <span
                      className={`font-mono-num shrink-0 text-[11px] font-semibold ${
                        enabled ? 'text-rose-300' : 'text-slate-500'
                      }`}
                    >
                      {enabled ? 'ON' : 'OFF'}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}

      {playMode === 'SLICE' && (
        <>
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                Blade Slice Intensity (7 Modes)
              </h2>
              <span className="text-xs text-slate-400">Katana FX</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'CLASSIC', label: 'Classic' },
                  { id: 'BLITZ', label: 'Prism Storm' },
                  { id: 'PINATA', label: 'Pinata Splitters' },
                  { id: 'GRAVITY_FLIP', label: 'Zero-G Side' },
                  { id: 'SAKURA_RAIN', label: 'Sakura Rain' },
                  { id: 'COMET_FRENZY', label: 'Comet Frenzy' },
                  { id: 'EXTREME', label: 'Overdrive Extreme' },
                ] as const
              ).map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => onSelectSlicePreset(lvl.id)}
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                    lvl.id === 'EXTREME' ? 'col-span-2' : ''
                  } ${
                    slicePreset === lvl.id
                      ? lvl.id === 'EXTREME'
                        ? 'border-rose-400 bg-rose-500 text-slate-950'
                        : 'border-cyan-400 bg-cyan-400 text-slate-950'
                      : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-slate-300">
              Hold and swipe to unleash plasma razor slashes. Cyan slows time,
              Purple erupts double prism fountains!
            </p>
            <button
              type="button"
              onClick={onSliceReset}
              className="mt-3 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-cyan-400 px-3 text-xs font-semibold text-slate-950 hover:bg-cyan-300 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Fresh Slice Run</span>
            </button>
          </section>

          <div className="h-px w-full bg-slate-800" />

          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                Slice Modes
              </h2>
              <span className="text-xs text-slate-400">Live toggles</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {(
                [
                  {
                    key: 'fastWave',
                    label: 'Hyper Rush Waves',
                    desc: 'Extra prisms launched per second',
                  },
                ] as const
              ).map((item) => {
                const enabled = sliceSettings[item.key];
                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={enabled}
                    onClick={() => onToggleSliceSetting(item.key)}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors ${
                      enabled
                        ? 'border-cyan-400/50 bg-cyan-950/40 text-cyan-100'
                        : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="truncate text-xs font-semibold">
                        {item.label}
                      </div>
                      <div className="truncate text-[11px] text-slate-400">
                        {item.desc}
                      </div>
                    </div>
                    <span
                      className={`font-mono-num shrink-0 text-[11px] font-semibold ${
                        enabled ? 'text-cyan-300' : 'text-slate-500'
                      }`}
                    >
                      {enabled ? 'ON' : 'OFF'}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}

      {playMode === 'HEX' && (
        <>
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                Hex Ripple Patterns (11 Grids)
              </h2>
              <span className="text-xs text-slate-400">11 = Solar Flower</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {HEX_LEVELS.map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => onSelectHexLevel(lvl.id)}
                  className={`rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                    hexLevel === lvl.id
                      ? lvl.id === 'EXTREME'
                        ? 'border-rose-400 bg-rose-950/50 text-white'
                        : 'border-teal-400/70 bg-teal-950/40 text-white'
                      : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800/70'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-slate-300">
              Tap any hexagon to send a musical wave ripple across its
              neighbors. Switch on Full-Board Shockwave + Rainbow Cycle for
              infinite ASMR waves!
            </p>
            <button
              type="button"
              onClick={onHexReset}
              className="mt-3 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-teal-400 px-3 text-xs font-semibold text-slate-950 hover:bg-teal-300 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Hex Grid</span>
            </button>
          </section>

          <div className="h-px w-full bg-slate-800" />

          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                Wave Options
              </h2>
              <span className="text-xs text-slate-400">Live toggles</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {(
                [
                  {
                    key: 'fullBoardWave',
                    label: 'Full-Board Shockwave',
                    desc: 'Ripples travel across every hex ring',
                  },
                  {
                    key: 'rainbowCycle',
                    label: 'Rainbow ASMR Cycle',
                    desc: 'Each wave shifts colors endlessly',
                  },
                ] as const
              ).map((item) => {
                const enabled = hexSettings[item.key];
                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={enabled}
                    onClick={() => onToggleHexSetting(item.key)}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors ${
                      enabled
                        ? 'border-teal-400/50 bg-teal-950/40 text-teal-100'
                        : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="truncate text-xs font-semibold">
                        {item.label}
                      </div>
                      <div className="truncate text-[11px] text-slate-400">
                        {item.desc}
                      </div>
                    </div>
                    <span
                      className={`font-mono-num shrink-0 text-[11px] font-semibold ${
                        enabled ? 'text-teal-300' : 'text-slate-500'
                      }`}
                    >
                      {enabled ? 'ON' : 'OFF'}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}

      {playMode === 'DOMINO' && (
        <>
          <section>
            <h2 className="font-display text-sm font-semibold text-slate-100">
              Domino Flow
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
              Load any of the 14 blueprints or draw your own domino snake, then
              tap a piece or hit Topple Chain Now!
            </p>

            <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg bg-slate-900 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => onSetDominoActionMode('TOPPLE')}
                className={`py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  dominoActionMode === 'TOPPLE'
                    ? 'bg-amber-400 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Click to Topple
              </button>
              <button
                type="button"
                onClick={() => onSetDominoActionMode('DRAW')}
                className={`py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  dominoActionMode === 'DRAW'
                    ? 'bg-sky-400 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Draw Path
              </button>
            </div>

            <button
              type="button"
              onClick={onDominoStartTopple}
              className="mt-3 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 text-xs font-semibold text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Topple Chain Now</span>
            </button>
          </section>

          <div className="h-px w-full bg-slate-800" />

          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                14 Domino Blueprints
              </h2>
              <span className="text-xs text-slate-400">Up to 210 tiles</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'SPIRAL', label: 'Grand Spiral' },
                  { id: 'SERPENT', label: 'S-Wave Snake' },
                  { id: 'RINGS', label: 'Triple Rings' },
                  { id: 'HELIX', label: 'Twin Helix' },
                  { id: 'STARBURST', label: '8-Arm Starburst' },
                  { id: 'HEARTWAVE', label: 'Heart Cascade' },
                  { id: 'AURORA_WAVE', label: 'Aurora Wave' },
                  { id: 'LOTUS_PETALS', label: 'Lotus Petals' },
                  { id: 'DOUBLE_SPIRAL', label: 'Double Spiral' },
                  { id: 'BUTTERFLY', label: 'Twin Butterfly' },
                  { id: 'SPIDERWEB', label: 'Spiderweb Trap' },
                  { id: 'GHOST_RING', label: 'Ghost Eye Ring' },
                  { id: 'MEGALOOP', label: '210-Tile Megaloop' },
                  { id: 'CUSTOM', label: 'Blank Canvas' },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectDominoPreset(preset.id)}
                  className={`rounded-lg border px-2.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                    dominoPreset === preset.id
                      ? preset.id === 'MEGALOOP'
                        ? 'border-rose-400 bg-rose-500 text-slate-950'
                        : 'border-amber-400/60 bg-slate-800 text-white'
                      : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {playMode === 'PULSE' && (
        <>
          <section>
            <h2 className="font-display text-sm font-semibold text-slate-100">
              Beat Pulse Grooves (9 Levels)
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
              Click or press Space right as glowing notes cross the golden ring
              to trigger radial shockwaves and harmonic chords!
            </p>
            <div className="mt-3 flex flex-col gap-1.5">
              {BEAT_LEVELS.map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => onSelectBeatLevel(lvl.id)}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors ${
                    beatLevel === lvl.id
                      ? lvl.id === 'EXTREME'
                        ? 'border-rose-400 bg-rose-950/50 text-white'
                        : 'border-pink-400/70 bg-pink-950/40 text-white'
                      : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800/70'
                  }`}
                >
                  <span className="text-xs font-semibold">{lvl.name}</span>
                  <span className="text-[11px] text-slate-400">{lvl.bpmDesc}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="h-px w-full bg-slate-800" />

          <section>
            <button
              type="button"
              aria-pressed={beatAutoPlay}
              onClick={onToggleBeatAutoPlay}
              className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors ${
                beatAutoPlay
                  ? 'border-pink-400/50 bg-pink-950/40 text-pink-100'
                  : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800/70'
              }`}
            >
              <div>
                <div className="text-xs font-semibold">Auto-Showcase Mode</div>
                <div className="text-[11px] text-slate-400">
                  Perfect timing symphony for relaxing or recording
                </div>
              </div>
              <span className="font-mono-num text-[11px] font-semibold">
                {beatAutoPlay ? 'ON' : 'OFF'}
              </span>
            </button>
          </section>
        </>
      )}

      {playMode === 'VORTEX' && (
        <>
          <section>
            <h2 className="font-display text-sm font-semibold text-slate-100">
              Vortex Fluid Paint
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
              Move your mouse or finger to pull stardust particles into the
              collectors. Click anywhere to burst a swirling wave!
            </p>
            <div className="mt-3 flex flex-col gap-1.5">
              {VORTEX_LEVELS.map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => onSelectVortexLevel(lvl.id)}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors ${
                    vortexLevel === lvl.id
                      ? lvl.id === 'EXTREME'
                        ? 'border-rose-400 bg-rose-950/50 text-white'
                        : 'border-indigo-400/70 bg-indigo-950/40 text-white'
                      : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800/70'
                  }`}
                >
                  <span className="text-xs font-semibold">{lvl.name}</span>
                  <span className="text-[11px] text-slate-400">{lvl.desc}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onVortexBurst}
              className="mt-3 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-400 px-3 text-xs font-semibold text-slate-950 hover:bg-indigo-300 transition-colors whitespace-nowrap"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Center Shockwave</span>
            </button>
          </section>

          <div className="h-px w-full bg-slate-800" />

          <section className="flex flex-col gap-1.5">
            <button
              type="button"
              aria-pressed={vortexSwirl}
              onClick={onToggleVortexSwirl}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors ${
                vortexSwirl
                  ? 'border-indigo-400/50 bg-indigo-950/40 text-indigo-100'
                  : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800/70'
              }`}
            >
              <div>
                <div className="text-xs font-semibold">Vortex Swirl Current</div>
                <div className="text-[11px] text-slate-400">
                  Spins particles in spiral currents around cursor
                </div>
              </div>
              <span className="font-mono-num text-[11px] font-semibold">
                {vortexSwirl ? 'ON' : 'OFF'}
              </span>
            </button>
            <button
              type="button"
              aria-pressed={vortexRepel}
              onClick={onToggleVortexRepel}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors ${
                vortexRepel
                  ? 'border-rose-400/50 bg-rose-950/40 text-rose-100'
                  : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800/70'
              }`}
            >
              <div>
                <div className="text-xs font-semibold">Repel Blast Mode</div>
                <div className="text-[11px] text-slate-400">
                  Push stardust away instead of attracting
                </div>
              </div>
              <span className="font-mono-num text-[11px] font-semibold">
                {vortexRepel ? 'ON' : 'OFF'}
              </span>
            </button>
          </section>
        </>
      )}

      {playMode === 'LASER' && (
        <>
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                Prism Laser Levels (11 Stages)
              </h2>
              <span className="text-xs text-slate-400">11 = Royal Crown</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {LASER_LEVEL_NAMES.map((name, idx) => {
                const lvl = idx + 1;
                const active = ((laserLevel - 1) % LASER_LEVEL_NAMES.length) + 1 === lvl;
                const solved = laserSolvedLevels.includes(lvl);
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => onSelectLaserLevel(lvl)}
                    className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                      active
                        ? lvl === 7 || lvl === 9 || lvl === 11
                          ? 'border-rose-400 bg-rose-950/50 text-white'
                          : 'border-sky-400/70 bg-sky-950/40 text-white'
                        : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <span className="truncate">{name}</span>
                    {solved && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-label="Cleared" />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-slate-300">
              Drag any mirror or pink splitter to aim smoothly (or tap to rotate
              15°). Charge every crystal to 100% to clear the stage!
            </p>
            <button
              type="button"
              onClick={onLaserReset}
              className="mt-3 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-sky-400 px-3 text-xs font-semibold text-slate-950 hover:bg-sky-300 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Mirrors</span>
            </button>
          </section>

          <div className="h-px w-full bg-slate-800" />

          <section>
            <button
              type="button"
              aria-pressed={laserAutoRotate}
              onClick={onToggleLaserAutoRotate}
              className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors ${
                laserAutoRotate
                  ? 'border-sky-400/50 bg-sky-950/40 text-sky-100'
                  : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800/70'
              }`}
            >
              <div>
                <div className="text-xs font-semibold">Kaleidoscope Auto-Spin</div>
                <div className="text-[11px] text-slate-400">
                  Mirrors rotate continuously for hypnotic laser lightshows
                </div>
              </div>
              <span className="font-mono-num text-[11px] font-semibold">
                {laserAutoRotate ? 'ON' : 'OFF'}
              </span>
            </button>
          </section>
        </>
      )}

      {playMode === 'MERGE' && (
        <>
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                Orb Merge Modes (10 Bowls)
              </h2>
              <span className="text-xs text-slate-400">9 Cosmic Tiers</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'CLASSIC', label: 'Classic Bowl' },
                  { id: 'DIVIDER', label: 'Twin Bowl' },
                  { id: 'BOUNCE_PEGS', label: 'Bumper Bowl' },
                  { id: 'TINY_WELL', label: 'Tiny Challenge' },
                  { id: 'TWIN_PINBALL', label: 'Pinball Funnel' },
                  { id: 'PORTAL_BOWL', label: 'Portal Warp' },
                  { id: 'ZEN_FOUNTAIN', label: 'Zen Fountain' },
                  { id: 'LOTUS_CUP', label: 'Lotus Cup' },
                  { id: 'PRISM_FUNNEL', label: 'Prism Funnel' },
                  { id: 'EXTREME', label: 'Orb Storm Extreme' },
                ] as const
              ).map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => onSelectMergePreset(lvl.id)}
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                    mergePreset === lvl.id
                      ? lvl.id === 'EXTREME'
                        ? 'border-rose-400 bg-rose-500 text-slate-950'
                        : 'border-fuchsia-400 bg-fuchsia-400 text-slate-950'
                      : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onMergeDrop}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-fuchsia-400 px-3 text-xs font-semibold text-slate-950 hover:bg-fuchsia-300 transition-colors whitespace-nowrap"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Drop Orb</span>
              </button>
              <button
                type="button"
                onClick={onMergeShake}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-sky-400 px-3 text-xs font-semibold text-slate-950 hover:bg-sky-300 transition-colors whitespace-nowrap"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Jostle Bowl</span>
              </button>
            </div>
            <button
              type="button"
              onClick={onMergeReset}
              className="mt-2 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/70 px-3 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Empty Bowl</span>
            </button>
          </section>

          <div className="h-px w-full bg-slate-800" />

          <section>
            <h2 className="mb-2.5 font-display text-sm font-semibold text-slate-100">
              Evolution Chain (1 → 9)
            </h2>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              {MERGE_TIERS.map((t, idx) => (
                <div
                  key={t.name}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-2 py-1.5"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: `hsl(${t.hue}, 92%, 64%)` }}
                  />
                  <span className="font-mono-num text-slate-400">{idx + 1}.</span>
                  <span className="truncate font-medium text-slate-200">{t.name}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {playMode === 'PLINKO' && (
        <>
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                Zen Plinko Boards (12 Stages)
              </h2>
              <span className="text-xs text-slate-400">Up to 200x</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'CLASSIC', label: 'Classic 9-Row' },
                  { id: 'FUNNEL', label: 'Hourglass Funnel' },
                  { id: 'BUMPERS', label: 'Neon Bumpers' },
                  { id: 'DIAMOND_MAZE', label: 'Diamond Matrix' },
                  { id: 'JACKPOT_RAIN', label: '200x Mega Vault' },
                  { id: 'PORTAL_GALAXY', label: 'Portal Galaxy' },
                  { id: 'ASMR_RAIN', label: 'ASMR Chime Grid' },
                  { id: 'SILK_WATERFALL', label: 'Silk Waterfall' },
                  { id: 'CHIME_PYRAMID', label: 'Chime Pyramid' },
                  { id: 'LOTUS_CASCADES', label: 'Lotus Cascades' },
                  { id: 'COSMIC_JACKPOT', label: 'Cosmic Jackpot' },
                  { id: 'EXTREME14', label: '13-Row Extreme 200x' },
                ] as const
              ).map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => onSelectPlinkoPreset(lvl.id)}
                  className={`rounded-lg border px-2.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                    plinkoPreset === lvl.id
                      ? lvl.id === 'EXTREME14'
                        ? 'border-rose-400 bg-rose-500 text-slate-950'
                        : 'border-amber-400 bg-amber-400 text-slate-950'
                      : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-slate-300">
              Move anywhere along the top rail and tap to drop musical marbles
              through pegs, neon bumpers, and warp portals into 100x-200x slots!
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onPlinkoDrop(1)}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-amber-400 px-3 text-xs font-semibold text-slate-950 hover:bg-amber-300 transition-colors whitespace-nowrap"
              >
                Drop 1x Ball
              </button>
              <button
                type="button"
                onClick={() => onPlinkoDrop(5)}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-sky-400 px-3 text-xs font-semibold text-slate-950 hover:bg-sky-300 transition-colors whitespace-nowrap"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>5x Burst</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => onPlinkoDrop(25)}
              className="mt-2 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-rose-500 px-3 text-xs font-semibold text-slate-950 hover:bg-rose-400 transition-colors whitespace-nowrap"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>25x Golden Rain!</span>
            </button>
            <button
              type="button"
              onClick={onPlinkoReset}
              className="mt-2 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/70 px-3 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Plinko</span>
            </button>
          </section>
        </>
      )}

      {playMode === 'BUBBLE' && (
        <>
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                Pop Sheet Modes (9 Sheets)
              </h2>
              <span className="text-xs text-slate-400">ASMR Pop</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'CLASSIC', label: '48-Pop Sheet' },
                  { id: 'BOMBS', label: '3x3 Chain Bombs' },
                  { id: 'RUSH', label: 'Auto-Refill Rush' },
                  { id: 'RAINBOW_WAVE', label: 'Prism Cross Wave' },
                  { id: 'MEGA_CHAIN', label: 'Chain Inferno' },
                  { id: 'PHANTOM_EYE', label: 'Phantom Eye (Creepy)' },
                  { id: 'LOTUS_BLOOM', label: 'Lotus Bloom' },
                  { id: 'NEBULA_RUSH', label: 'Nebula Rush' },
                  { id: 'EXTREME108', label: '108-Pop Extreme' },
                ] as const
              ).map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => onSelectBubblePreset(lvl.id)}
                  className={`rounded-lg border px-2.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                    lvl.id === 'EXTREME108' ? 'col-span-2' : ''
                  } ${
                    bubblePreset === lvl.id
                      ? lvl.id === 'EXTREME108'
                        ? 'border-rose-400 bg-rose-500 text-slate-950'
                        : 'border-emerald-400 bg-emerald-400 text-slate-950'
                      : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-slate-300">
              Tap or swipe straight across bubbles for rising harmonic pops,
              cross-row star cascades, and 3x3 bomb shockwaves!
            </p>
            <button
              type="button"
              onClick={onBubbleReset}
              className="mt-3 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-400 px-3 text-xs font-semibold text-slate-950 hover:bg-emerald-300 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Fresh Pop Sheet</span>
            </button>
          </section>
        </>
      )}

      {playMode === 'VACUUM' && (
        <>
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                Star Vacuum Levels (9 Galaxies)
              </h2>
              <span className="text-xs text-slate-400">6 Size Tiers</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {VACUUM_LEVEL_NAMES.map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => onSelectVacuumPreset(lvl.id)}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors ${
                    vacuumPreset === lvl.id
                      ? lvl.id === 'EXTREME'
                        ? 'border-rose-400 bg-rose-950/50 text-white'
                        : 'border-violet-400/70 bg-violet-950/40 text-white'
                      : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800/70'
                  }`}
                >
                  <span className="text-xs font-semibold">{lvl.label}</span>
                  <span className="text-[11px] text-slate-400">{lvl.desc}</span>
                </button>
              ))}
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-slate-300">
              Glide your black hole over smaller gems and rings to grow bigger
              and unlock giant monoliths. Click anywhere for a magnetic Pull
              Shockwave!
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onVacuumPulse}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-violet-400 px-3 text-xs font-semibold text-slate-950 hover:bg-violet-300 transition-colors whitespace-nowrap"
              >
                <Radio className="h-3.5 w-3.5" />
                <span>Pull Wave</span>
              </button>
              <button
                type="button"
                onClick={onVacuumReset}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 text-xs font-semibold text-slate-100 hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Void</span>
              </button>
            </div>
          </section>
        </>
      )}

      {playMode === 'SAND' && (
        <>
          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                Chroma Sand Boards (9 Stages)
              </h2>
              <span className="text-xs text-slate-400">Up to 50x Cups</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {SAND_LEVEL_NAMES.map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => onSelectSandPreset(lvl.id)}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors ${
                    sandPreset === lvl.id
                      ? lvl.id === 'EXTREME_FOUNTAIN'
                        ? 'border-rose-400 bg-rose-950/50 text-white'
                        : 'border-amber-400/70 bg-amber-950/35 text-white'
                      : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800/70'
                  }`}
                >
                  <span className="text-xs font-semibold">{lvl.label}</span>
                  <span className="text-[11px] text-slate-400">{lvl.desc}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="h-px w-full bg-slate-800" />

          <section>
            <h2 className="mb-2.5 font-display text-sm font-semibold text-slate-100">
              Sand &amp; Sculpt Brushes
            </h2>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'pour', label: 'Pour Sand', hint: 'Rainbow stream' },
                  { id: 'stir', label: 'Stir Vortex', hint: 'Swirl grains' },
                  { id: 'wall', label: 'Draw Wall', hint: 'Sculpt funnels' },
                  { id: 'bounce', label: 'Bounce Pad', hint: 'Springy ramp' },
                  { id: 'eraser', label: 'Eraser', hint: 'Clear strokes' },
                ] as const
              ).map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onSelectSandBrush(b.id)}
                  className={`rounded-lg border px-2.5 py-2 text-left transition-colors ${
                    b.id === 'eraser' ? 'col-span-2' : ''
                  } ${
                    sandBrush === b.id
                      ? 'border-amber-400 bg-amber-400 text-slate-950'
                      : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-semibold">{b.label}</div>
                  <div
                    className={`text-[11px] ${
                      sandBrush === b.id ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {b.hint}
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              aria-pressed={sandAutoFountain}
              onClick={onToggleSandAutoFountain}
              className={`mt-2.5 flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors ${
                sandAutoFountain
                  ? 'border-amber-400/50 bg-amber-950/35 text-amber-100'
                  : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div>
                <div className="text-xs font-semibold">Auto Rainbow Fountain</div>
                <div className="text-[11px] text-slate-400">
                  Continuous top spout while you sculpt
                </div>
              </div>
              <span className="font-mono-num text-[11px] font-semibold">
                {sandAutoFountain ? 'ON' : 'OFF'}
              </span>
            </button>

            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onSandBurst}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-amber-400 px-3 text-xs font-semibold text-slate-950 hover:bg-amber-300 transition-colors whitespace-nowrap"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>3x Fountain</span>
              </button>
              <button
                type="button"
                onClick={onSandClearWalls}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 text-xs font-semibold text-slate-100 hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                <Eraser className="h-3.5 w-3.5" />
                <span>Clear Lines</span>
              </button>
            </div>
            <button
              type="button"
              onClick={onSandReset}
              className="mt-2 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/70 px-3 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Sand Board</span>
            </button>
          </section>
        </>
      )}

      {playMode === 'CHIME' && (
        <>
          <section>
            <div className="mb-2.5 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                11 Musical Stage Layouts
              </h2>
              <span className="text-xs text-slate-400">Watch &amp; play</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(CHIME_PRESET_NAMES) as ChimePreset[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onSelectChimePreset(p)}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    p === 'GRAND_SYMPHONY' ? 'col-span-2' : ''
                  } ${
                    chimePreset === p
                      ? p === 'GRAND_SYMPHONY'
                        ? 'border-amber-400 bg-amber-400 text-slate-950'
                        : 'border-cyan-400/70 bg-cyan-950/50 text-cyan-200'
                      : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {CHIME_PRESET_NAMES[p]}
                </button>
              ))}
            </div>
          </section>

          <div className="h-px w-full bg-slate-800" />

          <section>
            <div className="mb-2.5 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                Interaction Tool
              </h2>
              <span className="text-xs text-slate-400">Click or drag</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: 'DROP_STRUM', label: 'Drop & Strum' },
                  { id: 'DRAW_BAR', label: 'Draw Chime' },
                  { id: 'ERASE', label: 'Erase Bar' },
                ] as Array<{ id: ChimeActionMode; label: string }>
              ).map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => onSelectChimeActionMode(tool.id)}
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                    chimeActionMode === tool.id
                      ? 'border-emerald-400 bg-emerald-400 text-slate-950'
                      : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {tool.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
              {chimeActionMode === 'DROP_STRUM'
                ? 'Tap anywhere to drop luminous pearls, or drag across bars and pendulums to strum them.'
                : chimeActionMode === 'DRAW_BAR'
                ? 'Drag across the stage to draw a custom tuned chime bar. Shorter bars ring higher notes.'
                : 'Tap or drag over any chime bar to dissolve it.'}
            </p>
          </section>

          <div className="h-px w-full bg-slate-800" />

          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                Instrument &amp; Scale
              </h2>
              <span className="text-xs text-slate-400">Live sound</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'kalimba', label: 'Crystal Kalimba' },
                  { id: 'marimba', label: 'Warm Marimba' },
                  { id: 'glass', label: 'Glass Harp' },
                  { id: 'bowl', label: 'Singing Bowl' },
                ] as Array<{ id: ChimeVoiceId; label: string }>
              ).map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onSelectChimeVoice(v.id)}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    chimeVoice === v.id
                      ? 'border-sky-400/80 bg-sky-950/60 text-sky-200'
                      : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'PENTATONIC', label: 'Pentatonic' },
                  { id: 'LYDIAN', label: 'Lydian Dream' },
                  { id: 'HIRAJOSHI', label: 'Hirajoshi Zen' },
                  { id: 'MIDNIGHT', label: 'Midnight Minor' },
                ] as Array<{ id: ChimeScaleId; label: string }>
              ).map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => onSelectChimeScale(sc.id)}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    chimeScale === sc.id
                      ? 'border-violet-400/80 bg-violet-950/50 text-violet-200'
                      : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {sc.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              aria-pressed={chimeAutoFlow}
              onClick={onToggleChimeAutoFlow}
              className={`mt-3 flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                chimeAutoFlow
                  ? 'border-emerald-400/60 bg-emerald-950/40 text-emerald-100'
                  : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>Auto-Stream Pearls</span>
              <span className="font-mono-num text-[11px]">
                {chimeAutoFlow ? 'ON' : 'OFF'}
              </span>
            </button>

            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onChimeShower}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-cyan-400 px-3 text-xs font-semibold text-slate-950 hover:bg-cyan-300 transition-colors whitespace-nowrap"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Pearl Shower</span>
              </button>
              <button
                type="button"
                onClick={onChimeStrumAll}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-amber-400 px-3 text-xs font-semibold text-slate-950 hover:bg-amber-300 transition-colors whitespace-nowrap"
              >
                <Radio className="h-3.5 w-3.5" />
                <span>Strum Chord</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onChimeReset}
              className="mt-2 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/70 px-3 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Stage</span>
            </button>
          </section>
        </>
      )}

      {playMode === 'TRACK' && (
        <>
          <section>
            <div className="mb-2.5 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                10 Marble Run Courses
              </h2>
              <span className="text-xs text-slate-400">Easy-to-watch flow</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(TRACK_PRESET_NAMES) as TrackPreset[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onSelectTrackPreset(p)}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    trackPreset === p
                      ? p === 'GRAND_COASTER'
                        ? 'border-amber-400 bg-amber-400 text-slate-950'
                        : 'border-emerald-400/70 bg-emerald-950/50 text-emerald-200'
                      : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {TRACK_PRESET_NAMES[p]}
                </button>
              ))}
            </div>
          </section>

          <div className="h-px w-full bg-slate-800" />

          <section>
            <div className="mb-2.5 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                Track Builder Tools
              </h2>
              <span className="text-xs text-slate-400">Click or drag</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'DROP', label: 'Drop Marbles' },
                  { id: 'DRAW_RAIL', label: 'Draw Chute' },
                  { id: 'PLACE_SEESAW', label: 'Add Seesaw' },
                  { id: 'PLACE_BELL', label: 'Add Bell' },
                  { id: 'ERASE', label: 'Erase Piece' },
                ] as Array<{ id: TrackActionMode; label: string }>
              ).map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => onSelectTrackActionMode(tool.id)}
                  className={`rounded-lg border px-2.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                    tool.id === 'ERASE' ? 'col-span-2' : ''
                  } ${
                    trackActionMode === tool.id
                      ? 'border-emerald-400 bg-emerald-400 text-slate-950'
                      : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {tool.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
              {trackActionMode === 'DROP'
                ? 'Tap anywhere on stage to drop smooth glass marbles onto the chutes and seesaws.'
                : trackActionMode === 'DRAW_RAIL'
                ? 'Drag across gaps to guide slow-rolling marbles into the Goal Cup (quick-tap to drop a marble or flip a seesaw).'
                : trackActionMode === 'PLACE_SEESAW'
                ? 'Click anywhere to add a balanced rocking seesaw splitter.'
                : trackActionMode === 'PLACE_BELL'
                ? 'Click anywhere to place a warm tuned bell bumper.'
                : 'Tap or drag over any rail, seesaw, or bell to remove it.'}
            </p>
          </section>

          <div className="h-px w-full bg-slate-800" />

          <section>
            <button
              type="button"
              aria-pressed={trackAutoFlow}
              onClick={onToggleTrackAutoFlow}
              className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                trackAutoFlow
                  ? 'border-emerald-400/60 bg-emerald-950/40 text-emerald-100'
                  : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>Auto-Drop Marbles</span>
              <span className="font-mono-num text-[11px]">
                {trackAutoFlow ? 'ON' : 'OFF'}
              </span>
            </button>

            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onTrackDropWave}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-emerald-400 px-3 text-xs font-semibold text-slate-950 hover:bg-emerald-300 transition-colors whitespace-nowrap"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>5x Wave</span>
              </button>
              <button
                type="button"
                onClick={onTrackReset}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 text-xs font-semibold text-slate-100 hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Course</span>
              </button>
            </div>
          </section>
        </>
      )}

      {playMode === 'PENDULUM' && (
        <>
          <section>
            <div className="mb-2.5 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                8 Harmonic Pendulums
              </h2>
              <span className="text-xs text-slate-400">Watch &amp; pluck</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {PENDULUM_LEVELS.map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => onSelectPendulumPreset(lvl.id)}
                  className={`rounded-lg border px-2.5 py-2 text-left transition-colors ${
                    lvl.id === 'GRAND_KALEIDOSCOPE' ? 'col-span-2' : ''
                  } ${
                    pendulumPreset === lvl.id
                      ? lvl.id === 'GRAND_KALEIDOSCOPE'
                        ? 'border-amber-400 bg-amber-400 text-slate-950'
                        : 'border-sky-400/70 bg-sky-950/50 text-sky-100'
                      : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="truncate text-xs font-semibold">{lvl.label}</div>
                  <div
                    className={`truncate text-[10px] ${
                      pendulumPreset === lvl.id && lvl.id === 'GRAND_KALEIDOSCOPE'
                        ? 'text-slate-900'
                        : 'text-slate-400'
                    }`}
                  >
                    {lvl.desc}
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-slate-300">
              Drag any glowing sphere to pull its arc, click anywhere to ripple
              a wave, or sit back and watch harmonic phase weaves align!
            </p>
          </section>

          <div className="h-px w-full bg-slate-800" />

          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                Acoustic Timbre &amp; Flow
              </h2>
              <span className="text-xs text-slate-400">Live sound</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: 'chime', label: 'Chime' },
                  { id: 'cradle', label: 'Cradle' },
                  { id: 'ethereal', label: 'Ethereal' },
                ] as Array<{ id: PendulumVoice; label: string }>
              ).map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onSelectPendulumVoice(v.id)}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    pendulumVoice === v.id
                      ? 'border-amber-400 bg-amber-400 text-slate-950'
                      : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            <div className="mt-2.5 flex flex-col gap-1.5">
              <button
                type="button"
                aria-pressed={pendulumAutoPulse}
                onClick={onTogglePendulumAutoPulse}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                  pendulumAutoPulse
                    ? 'border-emerald-400/60 bg-emerald-950/40 text-emerald-100'
                    : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>Auto Wave Sustain</span>
                <span className="font-mono-num text-[11px]">
                  {pendulumAutoPulse ? 'ON' : 'OFF'}
                </span>
              </button>
              <button
                type="button"
                aria-pressed={pendulumTrails}
                onClick={onTogglePendulumTrails}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                  pendulumTrails
                    ? 'border-sky-400/60 bg-sky-950/40 text-sky-100'
                    : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>Silk Light Trails</span>
                <span className="font-mono-num text-[11px]">
                  {pendulumTrails ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onPendulumPulse}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-sky-400 px-3 text-xs font-semibold text-slate-950 hover:bg-sky-300 transition-colors whitespace-nowrap"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Sync Wave</span>
              </button>
              <button
                type="button"
                onClick={onPendulumClearTrails}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 text-xs font-semibold text-slate-100 hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                <Eraser className="h-3.5 w-3.5" />
                <span>Clear Trails</span>
              </button>
            </div>
            <button
              type="button"
              onClick={onPendulumReset}
              className="mt-2 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/70 px-3 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Pendulums</span>
            </button>
          </section>
        </>
      )}

      {playMode === 'POND' && (
        <>
          <section>
            <div className="mb-2.5 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                8 Koi Sanctuary Ponds
              </h2>
              <span className="text-xs text-slate-400">Water &amp; Koi ASMR</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {POND_LEVELS.map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => onSelectPondPreset(lvl.id)}
                  className={`rounded-lg border px-2.5 py-2 text-left transition-colors ${
                    lvl.id === 'IMPERIAL_SANCTUARY' ? 'col-span-2' : ''
                  } ${
                    pondPreset === lvl.id
                      ? lvl.id === 'IMPERIAL_SANCTUARY'
                        ? 'border-amber-400 bg-amber-400 text-slate-950'
                        : 'border-teal-400/70 bg-teal-950/50 text-teal-100'
                      : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="truncate text-xs font-semibold">{lvl.label}</div>
                  <div
                    className={`truncate text-[10px] ${
                      pondPreset === lvl.id && lvl.id === 'IMPERIAL_SANCTUARY'
                        ? 'text-slate-900'
                        : 'text-slate-400'
                    }`}
                  >
                    {lvl.desc}
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-slate-300">
              Tap or glide across the pond to send crystal water droplets. Koi
              swirl curiously toward your ripples and nudge lotus blossoms!
            </p>
          </section>

          <div className="h-px w-full bg-slate-800" />

          <section>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                Pond Atmosphere
              </h2>
              <span className="text-xs text-slate-400">Ambient water</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                aria-pressed={pondRain}
                onClick={onTogglePondRain}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                  pondRain
                    ? 'border-teal-400/60 bg-teal-950/40 text-teal-100'
                    : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>Gentle Rain Drops</span>
                <span className="font-mono-num text-[11px]">
                  {pondRain ? 'ON' : 'OFF'}
                </span>
              </button>
              <button
                type="button"
                aria-pressed={pondWhirlpool}
                onClick={onTogglePondWhirlpool}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                  pondWhirlpool
                    ? 'border-cyan-400/60 bg-cyan-950/40 text-cyan-100'
                    : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>Koi Spiral Current</span>
                <span className="font-mono-num text-[11px]">
                  {pondWhirlpool ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onPondScatterPetals}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-teal-400 px-3 text-xs font-semibold text-slate-950 hover:bg-teal-300 transition-colors whitespace-nowrap"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Scatter Petals</span>
              </button>
              <button
                type="button"
                onClick={onPondClearRipples}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 text-xs font-semibold text-slate-100 hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                <Wind className="h-3.5 w-3.5" />
                <span>Calm Water</span>
              </button>
            </div>
            <button
              type="button"
              onClick={onPondReset}
              className="mt-2 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/70 px-3 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Pond</span>
            </button>
          </section>
        </>
      )}

      {playMode === 'SANDBOX' && (
        <>
          <section>
            <div className="mb-2.5 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                9 Toybox Presets
              </h2>
              <span className="text-xs text-slate-400">Up to Extreme</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'STARTER', label: 'Starter Mix' },
                  { id: 'PINBALL', label: 'Pinball Frenzy' },
                  { id: 'PORTALS', label: 'Portal Matrix' },
                  { id: 'WINDMILLS', label: 'Windmill Chaos' },
                  { id: 'GALAXY_FUNNEL', label: 'Galaxy Funnel' },
                  { id: 'PORTAL_PINBALL', label: 'Portal Pinball' },
                  { id: 'CASCADE_TOWER', label: 'Cascade Tower' },
                  { id: 'PINBALL_GALAXY', label: 'Pinball Galaxy' },
                  { id: 'EXTREME', label: 'Extreme Supernova' },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectSandboxPreset(p.id)}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                    p.id === 'EXTREME' ? 'col-span-2' : ''
                  } ${
                    sandboxPreset === p.id
                      ? p.id === 'EXTREME'
                        ? 'border-rose-400 bg-rose-500 text-slate-950'
                        : 'border-sky-400/70 bg-sky-950/50 text-sky-200'
                      : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </section>

          <div className="h-px w-full bg-slate-800" />

          <section>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                Toybox Builder
              </h2>
              <div className="flex items-center gap-1 rounded-lg bg-slate-900 p-0.5 border border-slate-800">
                <button
                  type="button"
                  onClick={() => onSetSandboxActionMode('PLACE')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    sandboxActionMode === 'PLACE'
                      ? 'bg-sky-400 text-slate-950 font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Place Toys
                </button>
                <button
                  type="button"
                  onClick={() => onSetSandboxActionMode('SHOOT')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    sandboxActionMode === 'SHOOT'
                      ? 'bg-amber-400 text-slate-950 font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Aim &amp; Shoot
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {TOY_BRUSHES.map((toy) => {
                const selected =
                  sandboxActionMode === 'PLACE' && activeBrush === toy.id;
                return (
                  <button
                    key={toy.id}
                    type="button"
                    onClick={() => {
                      onSetSandboxActionMode('PLACE');
                      onSelectBrush(toy.id);
                    }}
                    className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors ${
                      selected
                        ? 'border-sky-400/70 bg-slate-800 text-white'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    {toy.id === 'eraser' ? (
                      <Eraser className="h-4 w-4 shrink-0 text-rose-400" />
                    ) : (
                      <span
                        className={`h-3 w-3 shrink-0 rounded-full ${toy.swatch}`}
                      />
                    )}
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold">
                        {toy.label}
                      </div>
                      <div className="truncate text-[11px] text-slate-400">
                        {toy.hint}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onLaunchSingle}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-amber-500 px-3 text-xs font-semibold text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap"
              >
                Drop 1 Marble
              </button>
              <button
                type="button"
                onClick={onLaunchAvalanche}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-sky-400 px-3 text-xs font-semibold text-slate-950 hover:bg-sky-300 transition-colors whitespace-nowrap"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>15x Shower</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onLaunchSupernova}
              className="mt-2 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-rose-500 px-3 text-xs font-semibold text-slate-950 hover:bg-rose-400 transition-colors whitespace-nowrap"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>50x Supernova Drop!</span>
            </button>

            <button
              type="button"
              onClick={onClearAllPegs}
              className="mt-2 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/70 px-3 text-xs font-medium text-rose-200 hover:bg-rose-950/60 hover:border-rose-700/60 transition-colors whitespace-nowrap"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Empty Board</span>
            </button>
          </section>

          <div className="h-px w-full bg-slate-800" />

          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-100">
                Fun Modifiers
              </h2>
              <span className="text-xs text-slate-400">Live toggles</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
              {MODIFIER_ITEMS.map((item) => {
                const Icon = item.icon;
                const enabled = modifiers[item.key];
                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={enabled}
                    onClick={() => onToggleModifier(item.key)}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors ${
                      enabled
                        ? 'border-emerald-400/50 bg-emerald-950/40 text-emerald-100'
                        : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          enabled ? 'text-emerald-400' : 'text-slate-400'
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="truncate text-xs font-semibold">
                          {item.label}
                        </div>
                        <div className="truncate text-[11px] text-slate-400">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`font-mono-num shrink-0 text-[11px] font-semibold ${
                        enabled ? 'text-emerald-300' : 'text-slate-500'
                      }`}
                    >
                      {enabled ? 'ON' : 'OFF'}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}
    </aside>
  );
}
