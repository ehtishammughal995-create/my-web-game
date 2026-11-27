import { useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Gem,
  Lock,
  Palette,
  Play,
  Sliders,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ARENA_THEMES,
  mixHexColors,
  SOUNDSCAPE_LAYER_META,
  SOUNDSCAPE_PRESETS,
  TRAIL_FX_LIST,
} from '../game/cosmetics';
import {
  ALL_CLEAR_BONUS_SHARDS,
  DailyChallengeDef,
  getTimeUntilMidnightText,
} from '../game/dailyChallenges';
import {
  ArenaThemeId,
  CustomParticleShape,
  CustomTrailConfig,
  CustomTrailMixMode,
  DailyChallengeState,
  PlayMode,
  SoundscapeMixerConfig,
  TrailFxId,
} from '../game/types';
import { GameLogo } from './GameLogos';

export type ModalTab = 'CHALLENGES' | 'COSMETICS';

interface DailyChallengesModalProps {
  open: boolean;
  activeTab: ModalTab;
  challenges: DailyChallengeDef[];
  dailyState: DailyChallengeState;
  shards: number;
  unlockedCosmetics: string[];
  equippedTheme: ArenaThemeId;
  equippedFx: TrailFxId;
  customTrail: CustomTrailConfig;
  soundscape: SoundscapeMixerConfig;
  reducedMotion: boolean;
  onChangeTab: (tab: ModalTab) => void;
  onClose: () => void;
  onJumpToGame: (mode: PlayMode) => void;
  onClaimChallenge: (challengeId: string) => void;
  onClaimAllClearBonus: () => void;
  onUnlockTheme: (id: ArenaThemeId, cost: number) => void;
  onEquipTheme: (id: ArenaThemeId) => void;
  onUnlockFx: (id: TrailFxId, cost: number) => void;
  onEquipFx: (id: TrailFxId) => void;
  onUpdateCustomTrail: (next: CustomTrailConfig, equip?: boolean) => void;
  onUpdateSoundscape: (next: SoundscapeMixerConfig) => void;
}

const COLOR_PRESETS: Array<{ label: string; a: string; b: string }> = [
  { label: 'Aurora', a: '#38BDF8', b: '#F472B6' },
  { label: 'Velvet Peach', a: '#FB923C', b: '#FDE047' },
  { label: 'Mint Lotus', a: '#34D399', b: '#22D3EE' },
  { label: 'Cosmic Plum', a: '#C084FC', b: '#FB7185' },
];

function CustomTrailPreviewCanvas({
  config,
  active,
  reducedMotion,
}: {
  config: CustomTrailConfig;
  active: boolean;
  reducedMotion: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cfgRef = useRef(config);
  cfgRef.current = config;
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 150,
    y: 65,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      life: number;
      maxLife: number;
      shape: CustomParticleShape;
    }> = [];

    let rafId = 0;
    let lastTime = performance.now();
    let tPhase = 0;
    let emitAccum = 0;
    let counter = 0;

    const spawnOne = (x: number, y: number, burst = false) => {
      const cfg = cfgRef.current;
      const count = burst ? 8 : 1;
      for (let i = 0; i < count; i++) {
        counter = (counter + 1) % 360;
        const angle = Math.random() * Math.PI * 2;
        const spd =
          cfg.shape === 'bubbles'
            ? 14 + Math.random() * 26
            : burst
            ? 45 + Math.random() * 90
            : 12 + Math.random() * 34;

        let color = cfg.primaryColor;
        if (cfg.mixMode === 'blend') {
          color = mixHexColors(cfg.primaryColor, cfg.secondaryColor, Math.random());
        } else if (cfg.mixMode === 'alternate') {
          color = counter % 2 === 0 ? cfg.primaryColor : cfg.secondaryColor;
        } else {
          color = `hsl(${(counter * 17) % 360}, 95%, 68%)`;
        }

        const maxLife = Math.max(0.2, 0.7 / cfg.decaySpeed);
        particles.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: Math.cos(angle) * spd,
          vy:
            cfg.shape === 'bubbles'
              ? Math.sin(angle) * spd * 0.5 - 32
              : Math.sin(angle) * spd,
          size: (burst ? 5.2 : 4.1) * cfg.particleSize,
          color,
          life: maxLife,
          maxLife,
          shape: cfg.shape,
        });
      }
      if (particles.length > 90) {
        particles.splice(0, particles.length - 90);
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.033, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      const W = 320;
      const H = 128;

      tPhase += dt * (reducedMotion ? 0.8 : 2.1);
      emitAccum += dt;

      const emitterX = pointerRef.current.active
        ? pointerRef.current.x
        : W / 2 + Math.sin(tPhase) * 105;
      const emitterY = pointerRef.current.active
        ? pointerRef.current.y
        : H / 2 + Math.sin(tPhase * 2) * 32;

      if (emitAccum >= 0.032) {
        emitAccum = 0;
        spawnOne(emitterX, emitterY, false);
      }

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#090F1E';
      ctx.fillRect(0, 0, W, H);

      // Subtle grid lines
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
      ctx.lineWidth = 1;
      for (let gx = 32; gx < W; gx += 32) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, H);
        ctx.stroke();
      }
      for (let gy = 32; gy < H; gy += 32) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(W, gy);
        ctx.stroke();
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const ratio = p.life / p.maxLife;
        ctx.save();
        ctx.globalAlpha = Math.max(0, ratio * 0.94);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;

        if (p.shape === 'glow') {
          const r = Math.max(2, p.size * (0.7 + ratio * 0.9));
          ctx.shadowColor = p.color;
          ctx.shadowBlur = r * 2.2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'sparks') {
          const spd = Math.hypot(p.vx, p.vy) || 1;
          const len = p.size * 2 * ratio + 3;
          const nx = p.vx / spd;
          const ny = p.vy / spd;
          ctx.lineWidth = Math.max(1.5, p.size * 0.42);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p.x - nx * len, p.y - ny * len);
          ctx.lineTo(p.x + nx * len * 0.4, p.y + ny * len * 0.4);
          ctx.stroke();
        } else if (p.shape === 'bubbles') {
          const r = Math.max(2.5, p.size * (0.9 + (1 - ratio) * 0.55));
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(p.x - r * 0.3, p.y - r * 0.3, Math.max(1, r * 0.22), 0, Math.PI * 2);
          ctx.fill();
        } else {
          const r = p.size * (0.75 + ratio * 0.65);
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(p.x - r, p.y);
          ctx.lineTo(p.x + r, p.y);
          ctx.moveTo(p.x, p.y - r);
          ctx.lineTo(p.x, p.y + r);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Emitter dot
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(emitterX, emitterY, 3, 0, Math.PI * 2);
      ctx.fill();

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={128}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        pointerRef.current = {
          x: ((e.clientX - rect.left) / rect.width) * 320,
          y: ((e.clientY - rect.top) / rect.height) * 128,
          active: true,
        };
      }}
      onPointerLeave={() => {
        pointerRef.current.active = false;
      }}
      className={`w-full h-32 rounded-lg border cursor-crosshair touch-none ${
        active ? 'border-emerald-400/60' : 'border-slate-800'
      }`}
    />
  );
}

export function DailyChallengesModal({
  open,
  activeTab,
  challenges,
  dailyState,
  shards,
  unlockedCosmetics,
  equippedTheme,
  equippedFx,
  customTrail,
  soundscape,
  reducedMotion,
  onChangeTab,
  onClose,
  onJumpToGame,
  onClaimChallenge,
  onClaimAllClearBonus,
  onUnlockTheme,
  onEquipTheme,
  onUnlockFx,
  onEquipFx,
  onUpdateCustomTrail,
  onUpdateSoundscape,
}: DailyChallengesModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const completedCount = challenges.filter(
    (c) => (dailyState.progressById[c.id] ?? 0) >= c.target
  ).length;
  const claimedCount = challenges.filter((c) =>
    dailyState.claimedIds.includes(c.id)
  ).length;
  const allCompleted = completedCount === challenges.length && challenges.length > 0;
  const resetInText = getTimeUntilMidnightText();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Daily Challenges and Cosmetic Vault"
            initial={reducedMotion ? false : { opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl rounded-xl border border-slate-700/80 bg-[#131C2E] p-5 shadow-2xl sm:p-6 max-h-[90vh] flex flex-col"
          >
            {/* Header Row */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-amber-400">
                    {dailyState.dateKey}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-num">Resets in {resetInText}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-num">
                    Streak {dailyState.streakDays}d
                  </span>
                </div>
                <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-white sm:text-2xl [text-wrap:balance]">
                  {activeTab === 'CHALLENGES'
                    ? 'Daily Challenges'
                    : 'Cosmetic Vault'}
                </h2>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
                  <Gem className="h-4 w-4 text-amber-400" aria-hidden="true" />
                  <span className="font-mono-num">
                    {shards.toLocaleString()} Shards
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close modal"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-800/70 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Segmented Tab Switcher */}
            <div className="mt-4 flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1 w-fit">
              <button
                type="button"
                onClick={() => onChangeTab('CHALLENGES')}
                className={`inline-flex h-9 items-center gap-2 rounded-md px-4 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  activeTab === 'CHALLENGES'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  Daily Goals ({completedCount}/{challenges.length})
                </span>
              </button>
              <button
                type="button"
                onClick={() => onChangeTab('COSMETICS')}
                className={`inline-flex h-9 items-center gap-2 rounded-md px-4 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  activeTab === 'COSMETICS'
                    ? 'bg-sky-400 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Palette className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  Cosmetic Vault ({unlockedCosmetics.length}/
                  {ARENA_THEMES.length + TRAIL_FX_LIST.length})
                </span>
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="mt-5 flex-1 overflow-y-auto pr-1 space-y-5">
              {activeTab === 'CHALLENGES' && (
                <>
                  {/* Daily Grand Bonus Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-400">
                        Daily Completion Bonus ·{' '}
                        <span className="font-mono-num text-slate-200">
                          {claimedCount}/{challenges.length} Claimed
                        </span>
                      </div>
                      <div className="mt-0.5 font-display text-sm font-bold text-white">
                        Complete all {challenges.length} daily challenges for +
                        {ALL_CLEAR_BONUS_SHARDS} bonus Star Shards
                      </div>
                    </div>

                    {dailyState.bonusClaimed ? (
                      <div className="inline-flex h-10 items-center gap-1.5 text-xs font-semibold text-emerald-400 whitespace-nowrap shrink-0">
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        <span>Bonus Claimed</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={!allCompleted}
                        onClick={onClaimAllClearBonus}
                        className={`inline-flex h-10 items-center gap-1.5 rounded-lg px-4 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                          allCompleted
                            ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
                            : 'border border-slate-800 bg-slate-900 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Gem className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>
                          {allCompleted
                            ? `Claim +${ALL_CLEAR_BONUS_SHARDS} Shards`
                            : `${completedCount}/${challenges.length} Done`}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Challenge Rows */}
                  <div className="flex flex-col gap-3">
                    {challenges.map((ch) => {
                      const raw = dailyState.progressById[ch.id] ?? 0;
                      const current = Math.min(ch.target, raw);
                      const pct = Math.min(
                        100,
                        Math.round((current / ch.target) * 100)
                      );
                      const isDone = current >= ch.target;
                      const isClaimed = dailyState.claimedIds.includes(ch.id);

                      return (
                        <div
                          key={ch.id}
                          className={`rounded-xl border p-4 transition-colors ${
                            isClaimed
                              ? 'border-emerald-500/30 bg-emerald-950/15'
                              : isDone
                              ? 'border-amber-400/60 bg-amber-500/10'
                              : 'border-slate-800 bg-slate-900/55'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/80">
                                <GameLogo mode={ch.mode} className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                                  <span className="font-mono-num font-semibold text-amber-300">
                                    +{ch.reward} Shards
                                  </span>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-mono-num">
                                    {current.toLocaleString()} /{' '}
                                    {ch.target.toLocaleString()}
                                  </span>
                                </div>
                                <h3 className="mt-0.5 font-display text-sm font-bold text-white">
                                  {ch.title}
                                </h3>
                                <p className="mt-0.5 text-xs text-slate-400">
                                  {ch.desc}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {isClaimed ? (
                                <span className="inline-flex h-10 items-center gap-1.5 px-3 text-xs font-semibold text-emerald-400 whitespace-nowrap">
                                  <CheckCircle2
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                  />
                                  <span>Claimed</span>
                                </span>
                              ) : isDone ? (
                                <button
                                  type="button"
                                  onClick={() => onClaimChallenge(ch.id)}
                                  className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-amber-400 px-4 text-xs font-semibold text-slate-950 hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                                >
                                  <Gem className="h-3.5 w-3.5" aria-hidden="true" />
                                  <span>Claim +{ch.reward}</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onJumpToGame(ch.mode);
                                    onClose();
                                  }}
                                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-4 text-xs font-semibold text-slate-100 hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                                >
                                  <Play
                                    className="h-3.5 w-3.5 fill-current"
                                    aria-hidden="true"
                                  />
                                  <span>Play</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-3 flex items-center gap-3">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-950">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isClaimed || isDone
                                    ? 'bg-emerald-400'
                                    : 'bg-amber-400'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="font-mono-num w-10 text-right text-xs font-semibold text-slate-300">
                              {pct}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {activeTab === 'COSMETICS' && (
                <>
                  {/* Arena Themes */}
                  <section>
                    <div className="mb-3 flex items-baseline justify-between">
                      <h3 className="font-display text-sm font-bold text-white">
                        Arena Backdrop Themes
                      </h3>
                      <span className="text-xs text-slate-400">
                        Transforms canvas rim &amp; atmosphere across all 22 games
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {ARENA_THEMES.map((theme) => {
                        const unlocked = unlockedCosmetics.includes(theme.id);
                        const equipped = equippedTheme === theme.id;
                        const canAfford = shards >= theme.cost;

                        return (
                          <div
                            key={theme.id}
                            className={`flex flex-col justify-between rounded-xl border p-3.5 transition-colors ${
                              equipped
                                ? 'border-sky-400/70 bg-sky-950/25'
                                : 'border-slate-800 bg-slate-900/55'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className="h-10 w-10 shrink-0 rounded-lg border border-white/15"
                                style={{
                                  background: `linear-gradient(135deg, ${theme.swatchA}, ${theme.swatchB})`,
                                }}
                                aria-hidden="true"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="font-display text-sm font-bold text-white">
                                  {theme.name}
                                </div>
                                <div className="mt-0.5 text-xs text-slate-400">
                                  {theme.desc}
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                              <span className="font-mono-num text-xs font-semibold text-slate-300">
                                {unlocked
                                  ? equipped
                                    ? 'Equipped'
                                    : 'Unlocked'
                                  : `${theme.cost} Shards`}
                              </span>
                              {equipped ? (
                                <span className="inline-flex h-9 items-center gap-1.5 px-3 text-xs font-semibold text-sky-300 whitespace-nowrap">
                                  <CheckCircle2
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                  />
                                  <span>Active</span>
                                </span>
                              ) : unlocked ? (
                                <button
                                  type="button"
                                  onClick={() => onEquipTheme(theme.id)}
                                  className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 px-3.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors whitespace-nowrap"
                                >
                                  Equip
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={!canAfford}
                                  onClick={() => onUnlockTheme(theme.id, theme.cost)}
                                  className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                                    canAfford
                                      ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                                      : 'border border-slate-800 bg-slate-900 text-slate-500 cursor-not-allowed'
                                  }`}
                                >
                                  <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                                  <span>Unlock</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <div className="h-px w-full bg-slate-800" />

                  {/* Trail & Spark FX */}
                  <section>
                    <div className="mb-3 flex items-baseline justify-between">
                      <h3 className="font-display text-sm font-bold text-white">
                        Pointer &amp; Burst FX Finishes
                      </h3>
                      <span className="text-xs text-slate-400">
                        Adds reactive starlight, gold foil, or prism bursts on every move
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {TRAIL_FX_LIST.filter((fx) => fx.id !== 'fx_custom').map((fx) => {
                        const unlocked = unlockedCosmetics.includes(fx.id);
                        const equipped = equippedFx === fx.id;
                        const canAfford = shards >= fx.cost;

                        return (
                          <div
                            key={fx.id}
                            className={`flex flex-col justify-between rounded-xl border p-3.5 transition-colors ${
                              equipped
                                ? 'border-emerald-400/70 bg-emerald-950/20'
                                : 'border-slate-800 bg-slate-900/55'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15"
                                style={{
                                  background: `radial-gradient(circle at 30% 30%, ${fx.swatchB}, ${fx.swatchA})`,
                                }}
                                aria-hidden="true"
                              >
                                <Sparkles className="h-4 w-4 text-slate-950" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-display text-sm font-bold text-white">
                                  {fx.name}
                                </div>
                                <div className="mt-0.5 text-xs text-slate-400">
                                  {fx.desc}
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                              <span className="font-mono-num text-xs font-semibold text-slate-300">
                                {unlocked
                                  ? equipped
                                    ? 'Equipped'
                                    : 'Unlocked'
                                  : `${fx.cost} Shards`}
                              </span>
                              {equipped ? (
                                <span className="inline-flex h-9 items-center gap-1.5 px-3 text-xs font-semibold text-emerald-300 whitespace-nowrap">
                                  <CheckCircle2
                                    className="h-3.5 w-3.5"
                                    aria-hidden="true"
                                  />
                                  <span>Active</span>
                                </span>
                              ) : unlocked ? (
                                <button
                                  type="button"
                                  onClick={() => onEquipFx(fx.id)}
                                  className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 px-3.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors whitespace-nowrap"
                                >
                                  Equip
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={!canAfford}
                                  onClick={() => onUnlockFx(fx.id, fx.cost)}
                                  className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                                    canAfford
                                      ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                                      : 'border border-slate-800 bg-slate-900 text-slate-500 cursor-not-allowed'
                                  }`}
                                >
                                  <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                                  <span>Unlock</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <div className="h-px w-full bg-slate-800" />

                  {/* Custom Particle Trail Studio */}
                  <section className="rounded-xl border border-slate-800 bg-slate-900/55 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Sliders className="h-4 w-4 text-sky-400" aria-hidden="true" />
                          <h3 className="font-display text-sm font-bold text-white">
                            Custom Particle Trail Studio
                          </h3>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-400">
                          Mix two colors, pick your ASMR particle shape, and tune trail fade speed. Move pointer across preview to test.
                        </p>
                      </div>
                      {equippedFx === 'fx_custom' ? (
                        <span className="inline-flex h-9 items-center gap-1.5 px-3 text-xs font-semibold text-emerald-300 whitespace-nowrap shrink-0">
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                          <span>Custom Trail Active</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onEquipFx('fx_custom')}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-400 px-3.5 text-xs font-semibold text-slate-950 hover:bg-emerald-300 transition-colors whitespace-nowrap shrink-0"
                        >
                          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Equip Custom Trail</span>
                        </button>
                      )}
                    </div>

                    <div className="mt-3.5 grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Live Interactive Canvas Preview */}
                      <div className="flex flex-col gap-2.5">
                        <CustomTrailPreviewCanvas
                          config={customTrail}
                          active={equippedFx === 'fx_custom'}
                          reducedMotion={reducedMotion}
                        />
                        <div className="flex flex-wrap items-center gap-1.5">
                          {COLOR_PRESETS.map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() =>
                                onUpdateCustomTrail(
                                  {
                                    ...customTrail,
                                    primaryColor: preset.a,
                                    secondaryColor: preset.b,
                                    mixMode:
                                      customTrail.mixMode === 'rainbow'
                                        ? 'blend'
                                        : customTrail.mixMode,
                                  },
                                  true
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-950/70 px-2 py-1 text-[11px] font-medium text-slate-300 hover:border-slate-700 hover:text-white transition-colors whitespace-nowrap"
                            >
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{
                                  background: `linear-gradient(135deg, ${preset.a}, ${preset.b})`,
                                }}
                              />
                              <span>{preset.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Studio Controls */}
                      <div className="flex flex-col gap-3">
                        {/* Colors & Mix Mode */}
                        <div className="grid grid-cols-2 gap-2">
                          <label className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-xs text-slate-300">
                            <span>Color A</span>
                            <input
                              type="color"
                              value={customTrail.primaryColor}
                              onChange={(e) =>
                                onUpdateCustomTrail(
                                  { ...customTrail, primaryColor: e.target.value },
                                  true
                                )
                              }
                              className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                            />
                          </label>
                          <label className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-xs text-slate-300">
                            <span>Color B</span>
                            <input
                              type="color"
                              value={customTrail.secondaryColor}
                              onChange={(e) =>
                                onUpdateCustomTrail(
                                  { ...customTrail, secondaryColor: e.target.value },
                                  true
                                )
                              }
                              className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                            />
                          </label>
                        </div>

                        {/* Mix Mode */}
                        <div className="grid grid-cols-3 gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
                          {(
                            [
                              { id: 'blend', label: 'Blend' },
                              { id: 'alternate', label: 'Alternate' },
                              { id: 'rainbow', label: 'Prism' },
                            ] as Array<{ id: CustomTrailMixMode; label: string }>
                          ).map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() =>
                                onUpdateCustomTrail(
                                  { ...customTrail, mixMode: m.id },
                                  true
                                )
                              }
                              className={`rounded-md py-1 text-xs font-semibold transition-colors whitespace-nowrap ${
                                customTrail.mixMode === m.id
                                  ? 'bg-sky-400 text-slate-950'
                                  : 'text-slate-300 hover:text-white'
                              }`}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>

                        {/* Particle Shape */}
                        <div className="grid grid-cols-4 gap-1.5">
                          {(
                            [
                              { id: 'glow', label: 'Glow' },
                              { id: 'sparks', label: 'Sparks' },
                              { id: 'bubbles', label: 'Bubbles' },
                              { id: 'stars', label: 'Stars' },
                            ] as Array<{ id: CustomParticleShape; label: string }>
                          ).map((sh) => (
                            <button
                              key={sh.id}
                              type="button"
                              onClick={() =>
                                onUpdateCustomTrail(
                                  { ...customTrail, shape: sh.id },
                                  true
                                )
                              }
                              className={`rounded-lg border py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                                customTrail.shape === sh.id
                                  ? 'border-emerald-400 bg-emerald-400 text-slate-950'
                                  : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              {sh.label}
                            </button>
                          ))}
                        </div>

                        {/* Decay Speed & Size Sliders */}
                        <div className="grid grid-cols-2 gap-3 pt-0.5">
                          <label className="flex flex-col gap-1 text-[11px] text-slate-300">
                            <div className="flex items-center justify-between">
                              <span>Fade Speed</span>
                              <span className="font-mono-num text-slate-400">
                                {customTrail.decaySpeed.toFixed(1)}x
                              </span>
                            </div>
                            <input
                              type="range"
                              min={0.5}
                              max={2.4}
                              step={0.1}
                              value={customTrail.decaySpeed}
                              onChange={(e) =>
                                onUpdateCustomTrail(
                                  {
                                    ...customTrail,
                                    decaySpeed: parseFloat(e.target.value),
                                  },
                                  true
                                )
                              }
                              className="accent-sky-400 cursor-pointer"
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-[11px] text-slate-300">
                            <div className="flex items-center justify-between">
                              <span>Particle Size</span>
                              <span className="font-mono-num text-slate-400">
                                {customTrail.particleSize.toFixed(1)}x
                              </span>
                            </div>
                            <input
                              type="range"
                              min={0.6}
                              max={1.8}
                              step={0.1}
                              value={customTrail.particleSize}
                              onChange={(e) =>
                                onUpdateCustomTrail(
                                  {
                                    ...customTrail,
                                    particleSize: parseFloat(e.target.value),
                                  },
                                  true
                                )
                              }
                              className="accent-emerald-400 cursor-pointer"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </section>

                  <div className="h-px w-full bg-slate-800" />

                  {/* Soundscape Mixer */}
                  <section className="rounded-xl border border-slate-800 bg-slate-900/55 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Volume2 className="h-4 w-4 text-teal-300" aria-hidden="true" />
                          <h3 className="font-display text-sm font-bold text-white">
                            Soundscape Mixer
                          </h3>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-400">
                          Layer gentle ambient textures beneath game notes and chimes.
                        </p>
                      </div>

                      <button
                        type="button"
                        aria-pressed={soundscape.enabled}
                        onClick={() =>
                          onUpdateSoundscape({
                            ...soundscape,
                            enabled: !soundscape.enabled,
                          })
                        }
                        className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                          soundscape.enabled
                            ? 'bg-teal-400 text-slate-950 hover:bg-teal-300'
                            : 'border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        {soundscape.enabled ? (
                          <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        <span>{soundscape.enabled ? 'Ambience On' : 'Turn On Ambience'}</span>
                      </button>
                    </div>

                    {/* Presets & Master Volume */}
                    <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {SOUNDSCAPE_PRESETS.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() =>
                              onUpdateSoundscape({
                                ...soundscape,
                                enabled: true,
                                layers: { ...preset.layers },
                              })
                            }
                            className="rounded-md border border-slate-800 bg-slate-950/70 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:border-teal-400/50 hover:text-white transition-colors whitespace-nowrap"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>

                      <label className="flex items-center gap-2.5 text-xs text-slate-300">
                        <span className="whitespace-nowrap">Mix Level</span>
                        <input
                          type="range"
                          min={0.1}
                          max={1}
                          step={0.05}
                          value={soundscape.masterVolume}
                          onChange={(e) =>
                            onUpdateSoundscape({
                              ...soundscape,
                              enabled: true,
                              masterVolume: parseFloat(e.target.value),
                            })
                          }
                          className="w-24 accent-teal-400 cursor-pointer"
                        />
                        <span className="font-mono-num w-9 text-right text-slate-400">
                          {Math.round(soundscape.masterVolume * 100)}%
                        </span>
                      </label>
                    </div>

                    {/* 4 Ambient Texture Sliders */}
                    <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {SOUNDSCAPE_LAYER_META.map((layer) => {
                        const val = soundscape.layers[layer.id];
                        return (
                          <label
                            key={layer.id}
                            className="flex flex-col gap-1.5 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2.5 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-slate-100">
                                {layer.label}
                              </span>
                              <span className="font-mono-num text-[11px] text-slate-400">
                                {Math.round(val * 100)}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={1}
                              step={0.02}
                              value={val}
                              onChange={(e) =>
                                onUpdateSoundscape({
                                  ...soundscape,
                                  enabled: true,
                                  layers: {
                                    ...soundscape.layers,
                                    [layer.id]: parseFloat(e.target.value),
                                  },
                                })
                              }
                              className={`${layer.accentClass} cursor-pointer`}
                            />
                            <span className="text-[11px] text-slate-400">
                              {layer.desc}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </section>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
