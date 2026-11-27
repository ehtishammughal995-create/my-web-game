import { Eye, EyeOff, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { GameState, PlayMode } from '../game/types';
import { BrandEmblem } from './GameLogos';

interface TopBarProps {
  playMode: PlayMode;
  gameState: GameState;
  muted: boolean;
  cleanView: boolean;
  snapshotCount: number;
  onOpenHub: () => void;
  onChangeMode: (mode: PlayMode) => void;
  onOpenGallery: () => void;
  onOpenChallenges: () => void;
  onOpenCosmetics: () => void;
  onToggleMute: () => void;
  onToggleCleanView: () => void;
  onTogglePause: () => void;
}

export function TopBar({
  playMode,
  gameState,
  muted,
  cleanView,
  snapshotCount,
  onOpenHub,
  onChangeMode,
  onOpenGallery,
  onOpenChallenges,
  onOpenCosmetics,
  onToggleMute,
  onToggleCleanView,
  onTogglePause,
}: TopBarProps) {
  return (
    <header className="w-full border-b border-slate-800/90 bg-[#0F172A]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-4 px-4 py-2.5 sm:gap-8 sm:px-6">
        {/* Zone 1: Brand Emblem + Wordmark */}
        <button
          type="button"
          onClick={onOpenHub}
          className="inline-flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg"
        >
          <BrandEmblem className="h-7 w-7 shrink-0" />
          <span className="font-display text-lg font-bold tracking-tight text-slate-50 sm:text-xl">
            Marble Meadow
          </span>
        </button>

        {/* Zone 2: Clean 5-link Navigation */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300"
        >
          <button
            type="button"
            onClick={onOpenHub}
            className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            All 22 Games
          </button>
          <button
            type="button"
            onClick={() => onChangeMode('RINGS')}
            className={`hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
              playMode === 'RINGS' && gameState !== 'TITLE_MENU' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Rings
          </button>
          <button
            type="button"
            onClick={onOpenGallery}
            className="hover:text-teal-300 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Gallery{snapshotCount > 0 ? ` (${snapshotCount})` : ''}
          </button>
          <button
            type="button"
            onClick={onOpenChallenges}
            className="hover:text-amber-300 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Challenges
          </button>
          <button
            type="button"
            onClick={onOpenCosmetics}
            className="hover:text-sky-300 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Cosmetics
          </button>
        </nav>

        {/* Zone 3: Primary Utility Action Group */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Unmute sound' : 'Mute sound'}
            title={muted ? 'Unmute sound' : 'Mute sound'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-800/70 text-slate-200 hover:bg-slate-700/80 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={onToggleCleanView}
            aria-label={cleanView ? 'Show side controls' : 'Clean video view'}
            title={cleanView ? 'Show side controls' : 'Hide side panel for clean video recording'}
            className={`hidden sm:inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
              cleanView
                ? 'border-sky-400/60 bg-sky-950/60 text-sky-200'
                : 'border-slate-700/80 bg-slate-800/70 text-slate-200 hover:bg-slate-700/80 hover:text-white'
            }`}
          >
            {cleanView ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>{cleanView ? 'Show Panel' : 'Clean View'}</span>
          </button>

          <button
            type="button"
            onClick={
              gameState === 'PLAYING' || gameState === 'PAUSED'
                ? onTogglePause
                : onOpenHub
            }
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-slate-100 px-4 text-xs sm:text-sm font-semibold text-slate-950 hover:bg-white transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            {gameState === 'PAUSED' ? (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Resume</span>
              </>
            ) : gameState === 'PLAYING' ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <span>Games Hub</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
