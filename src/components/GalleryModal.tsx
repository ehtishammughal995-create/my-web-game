import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Camera,
  Check,
  Download,
  Image as ImageIcon,
  Maximize2,
  Pencil,
  Play,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { PlayMode, SavedSnapshot } from '../game/types';
import { GameLogo } from './GameLogos';
import {
  LiveWallpaperCanvas,
  LiveWallpaperHandle,
  WallpaperPattern,
} from './LiveWallpaperCanvas';

interface GalleryModalProps {
  open: boolean;
  snapshots: SavedSnapshot[];
  canCapture: boolean;
  reducedMotion: boolean;
  onClose: () => void;
  onCaptureNow: () => void;
  onSaveWallpaperFrame?: (title: string, imageDataUrl: string) => void;
  onRenameSnapshot: (id: string, nextTitle: string) => void;
  onDeleteSnapshot: (id: string) => void;
  onJumpToGame: (mode: PlayMode) => void;
}

const MODE_LABELS: Record<PlayMode, string> = {
  SWARM: 'Swarm Breaker',
  RINGS: 'Ring Escape',
  BLOOM: 'Bloom Chain',
  ORBIT: 'Gravity Orbit',
  SLICE: 'Blade Slice',
  HEX: 'Hex Ripple',
  DOMINO: 'Domino Flow',
  PULSE: 'Beat Pulse',
  VORTEX: 'Vortex Paint',
  LASER: 'Prism Laser',
  MERGE: 'Orb Merge',
  PLINKO: 'Zen Plinko',
  BUBBLE: 'Pop Sheet',
  VACUUM: 'Star Vacuum',
  SAND: 'Chroma Sand',
  CHIME: 'Chime Cascade',
  TRACK: 'Marble Run',
  PENDULUM: 'Harmonic Pendulum',
  POND: 'Zen Koi Pond',
  VAULT: 'Vault Breach',
  BOX_LINES: 'Box Breaker',
  SANDBOX: 'Avalanche Lab',
};

const WALLPAPER_PATTERNS: Array<{
  id: WallpaperPattern;
  label: string;
}> = [
  { id: 'AURORA', label: 'Aurora Silk' },
  { id: 'SPIROGRAPH', label: 'Spirograph' },
  { id: 'NEBULA', label: 'Nebula Drift' },
  { id: 'SAKURA_MIST', label: 'Sakura Mist' },
];

export function GalleryModal({
  open,
  snapshots,
  canCapture,
  reducedMotion,
  onClose,
  onCaptureNow,
  onSaveWallpaperFrame,
  onRenameSnapshot,
  onDeleteSnapshot,
  onJumpToGame,
}: GalleryModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [liveWallpaperOpen, setLiveWallpaperOpen] = useState<boolean>(false);
  const [wallpaperPattern, setWallpaperPattern] =
    useState<WallpaperPattern>('AURORA');
  const [wallpaperSpeed, setWallpaperSpeed] = useState<'calm' | 'flow'>('calm');
  const [wallpaperHudVisible, setWallpaperHudVisible] = useState<boolean>(true);
  const wallpaperRef = useRef<LiveWallpaperHandle | null>(null);
  const idleTimerRef = useRef<number | null>(null);

  const bumpWallpaperHud = useCallback(() => {
    setWallpaperHudVisible(true);
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = window.setTimeout(() => {
      setWallpaperHudVisible(false);
    }, 3600);
  }, []);

  useEffect(() => {
    if (!open) {
      setEditingId(null);
      setSelectedId(null);
      setLiveWallpaperOpen(false);
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (liveWallpaperOpen) {
          setLiveWallpaperOpen(false);
        } else if (selectedId) {
          setSelectedId(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, selectedId, liveWallpaperOpen, onClose]);

  useEffect(() => {
    if (!liveWallpaperOpen) {
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      return;
    }
    bumpWallpaperHud();
    return () => {
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };
  }, [liveWallpaperOpen, bumpWallpaperHud]);

  const selectedShot = snapshots.find((s) => s.id === selectedId) ?? null;

  const startEdit = (shot: SavedSnapshot) => {
    setEditingId(shot.id);
    setDraftTitle(shot.title);
  };

  const commitEdit = (id: string) => {
    const trimmed = draftTitle.trim();
    if (trimmed.length > 0) {
      onRenameSnapshot(id, trimmed);
    }
    setEditingId(null);
  };

  const handleDownload = (shot: SavedSnapshot) => {
    const link = document.createElement('a');
    link.href = shot.imageDataUrl;
    const slug = shot.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    link.download = `${slug || 'marble-meadow-snapshot'}.jpg`;
    link.click();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/72 p-4 backdrop-blur-sm overflow-y-auto"
        >
          {/* Ambient generative backdrop behind the Gallery */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-60">
            <LiveWallpaperCanvas
              pattern={wallpaperPattern}
              flowSpeed="calm"
              reducedMotion={reducedMotion}
              interactive={false}
            />
          </div>

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Physics Snapshot Gallery"
            initial={reducedMotion ? false : { opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-4xl rounded-xl border border-slate-700/80 bg-[#131C2E]/92 p-5 shadow-2xl backdrop-blur-md sm:p-6 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="min-w-0">
                <div className="font-mono-num text-xs font-medium text-slate-400">
                  {snapshots.length} / 24 Saved Captures
                </div>
                <h2 className="mt-0.5 font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                  Physics Gallery
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setLiveWallpaperOpen(true)}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-indigo-400/60 bg-indigo-500/20 px-4 text-xs font-semibold text-indigo-100 hover:bg-indigo-500/30 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <Sparkles className="h-4 w-4 text-indigo-300" aria-hidden="true" />
                  <span>Live Wallpaper</span>
                </button>
                {canCapture && (
                  <button
                    type="button"
                    onClick={onCaptureNow}
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-amber-400 px-4 text-xs font-semibold text-slate-950 hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    <Camera className="h-4 w-4" aria-hidden="true" />
                    <span>Save Current Frame</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close gallery"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-800/70 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="mt-4 flex-1 overflow-y-auto pr-1">
              {snapshots.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700/80 bg-slate-900/50 px-6 py-14 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400">
                    <ImageIcon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-display text-base font-bold text-white">
                    No snapshots saved yet
                  </h3>
                  <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-400">
                    Open any of the 22 physics worlds—draw an Orbit spirograph, weave a
                    Harmonic Pendulum, or swirl the Zen Koi Pond—and click Snap in the HUD to
                    save your capture here, or launch Live Wallpaper for idle generative art.
                  </p>
                  <button
                    type="button"
                    onClick={() => setLiveWallpaperOpen(true)}
                    className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg border border-indigo-400/60 bg-indigo-500/20 px-4 text-xs font-semibold text-indigo-100 hover:bg-indigo-500/30 transition-colors whitespace-nowrap"
                  >
                    <Sparkles className="h-4 w-4 text-indigo-300" aria-hidden="true" />
                    <span>Launch Live Wallpaper</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {snapshots.map((shot) => {
                    const isEditing = editingId === shot.id;
                    const dateStr = new Date(shot.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    });

                    return (
                      <div
                        key={shot.id}
                        className="flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60"
                      >
                        <div className="group relative aspect-[800/620] w-full overflow-hidden bg-slate-950">
                          <img
                            src={shot.imageDataUrl}
                            alt={shot.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                          <button
                            type="button"
                            onClick={() => setSelectedId(shot.id)}
                            aria-label={`Inspect ${shot.title}`}
                            className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-slate-950/60 via-transparent to-transparent p-2.5 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                          >
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950/85 text-white border border-slate-700">
                              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                            </span>
                          </button>
                        </div>

                        <div className="flex flex-1 flex-col justify-between p-3.5">
                          <div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                              <GameLogo mode={shot.mode} className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate font-medium text-slate-300">
                                {MODE_LABELS[shot.mode]}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono-num shrink-0">{dateStr}</span>
                            </div>

                            {isEditing ? (
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  commitEdit(shot.id);
                                }}
                                className="mt-2 flex items-center gap-1.5"
                              >
                                <input
                                  type="text"
                                  value={draftTitle}
                                  maxLength={42}
                                  autoFocus
                                  onChange={(e) => setDraftTitle(e.target.value)}
                                  className="h-8 w-full min-w-0 rounded-md border border-amber-400/70 bg-slate-950 px-2.5 text-xs font-semibold text-white focus:outline-none"
                                />
                                <button
                                  type="submit"
                                  aria-label="Save name"
                                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                              </form>
                            ) : (
                              <h3 className="mt-1.5 truncate font-display text-sm font-bold text-white">
                                {shot.title}
                              </h3>
                            )}
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-1.5 border-t border-slate-800/80 pt-2.5">
                            <button
                              type="button"
                              onClick={() => {
                                onJumpToGame(shot.mode);
                                onClose();
                              }}
                              className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-700 bg-slate-800 px-2.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors whitespace-nowrap"
                            >
                              <Play className="h-3 w-3 fill-current" aria-hidden="true" />
                              <span>Play Mode</span>
                            </button>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => startEdit(shot)}
                                aria-label="Rename snapshot"
                                title="Rename"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownload(shot)}
                                aria-label="Download snapshot"
                                title="Download image"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteSnapshot(shot.id)}
                                aria-label="Delete snapshot"
                                title="Delete"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-rose-400 hover:bg-rose-950/60 hover:border-rose-700/60 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Lightbox Preview Overlay */}
            <AnimatePresence>
              {selectedShot && (
                <motion.div
                  initial={reducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reducedMotion ? undefined : { opacity: 0 }}
                  onClick={() => setSelectedId(null)}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm"
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-700 bg-[#131C2E] shadow-2xl"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <GameLogo mode={selectedShot.mode} className="h-4 w-4 shrink-0" />
                        <span className="truncate font-display text-sm font-bold text-white">
                          {selectedShot.title}
                        </span>
                        <span className="text-slate-600" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                          {MODE_LABELS[selectedShot.mode]}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedId(null)}
                        aria-label="Close preview"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <img
                      src={selectedShot.imageDataUrl}
                      alt={selectedShot.title}
                      className="w-full aspect-[800/620] object-contain bg-slate-950"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 px-4 py-3">
                      <span className="font-mono-num text-xs text-slate-400">
                        Score at capture: {selectedShot.score.toLocaleString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDownload(selectedShot)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 text-xs font-semibold text-slate-100 hover:bg-slate-700 whitespace-nowrap"
                        >
                          <Download className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Download</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteSnapshot(selectedShot.id);
                            setSelectedId(null);
                          }}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-800/60 bg-rose-950/50 px-3 text-xs font-semibold text-rose-200 hover:bg-rose-900/60 whitespace-nowrap"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Full-Screen Live Wallpaper Mode */}
            <AnimatePresence>
              {liveWallpaperOpen && (
                <motion.div
                  initial={reducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reducedMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.28 }}
                  onClick={(e) => e.stopPropagation()}
                  onPointerMove={bumpWallpaperHud}
                  onPointerDown={bumpWallpaperHud}
                  className="fixed inset-0 z-50 bg-slate-950 select-none"
                >
                  <LiveWallpaperCanvas
                    ref={wallpaperRef}
                    pattern={wallpaperPattern}
                    flowSpeed={wallpaperSpeed}
                    reducedMotion={reducedMotion}
                    interactive
                  />

                  <div
                    className={`pointer-events-auto fixed inset-x-0 bottom-5 z-10 flex justify-center px-4 transition-opacity duration-500 ${
                      wallpaperHudVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-950/82 px-3.5 py-2.5 shadow-2xl backdrop-blur-md">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {WALLPAPER_PATTERNS.map((p) => {
                          const active = wallpaperPattern === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setWallpaperPattern(p.id);
                                bumpWallpaperHud();
                              }}
                              className={`h-8 rounded-lg px-2.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                                active
                                  ? 'bg-indigo-400 text-slate-950'
                                  : 'border border-slate-700/80 bg-slate-900/75 text-slate-200 hover:bg-slate-800'
                              }`}
                            >
                              {p.label}
                            </button>
                          );
                        })}
                      </div>

                      <span className="hidden sm:inline text-slate-700" aria-hidden="true">
                        |
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setWallpaperSpeed((s) => (s === 'calm' ? 'flow' : 'calm'));
                          bumpWallpaperHud();
                        }}
                        className="inline-flex h-8 items-center rounded-lg border border-slate-700/80 bg-slate-900/75 px-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 whitespace-nowrap"
                      >
                        Tempo: {wallpaperSpeed === 'calm' ? 'Calm' : 'Flow'}
                      </button>

                      {onSaveWallpaperFrame && (
                        <button
                          type="button"
                          onClick={() => {
                            const url = wallpaperRef.current?.captureFrame();
                            if (!url) return;
                            const patLabel =
                              WALLPAPER_PATTERNS.find((p) => p.id === wallpaperPattern)
                                ?.label ?? 'Live Wallpaper';
                            onSaveWallpaperFrame(`Wallpaper · ${patLabel}`, url);
                            bumpWallpaperHud();
                          }}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-amber-400 px-3 text-xs font-semibold text-slate-950 hover:bg-amber-300 transition-colors whitespace-nowrap"
                        >
                          <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Save Frame</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setLiveWallpaperOpen(false)}
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-700/80 bg-slate-900/75 px-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white whitespace-nowrap"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Exit</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
