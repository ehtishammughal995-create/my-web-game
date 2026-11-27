import {
  ArenaThemeId,
  CustomTrailConfig,
  SoundscapeLayerId,
  SoundscapeMixerConfig,
  TrailFxId,
} from './types';

export interface ArenaThemeDef {
  id: ArenaThemeId;
  name: string;
  desc: string;
  cost: number;
  swatchA: string;
  swatchB: string;
  frameBorderClass: string;
  vignetteColor: string;
  rimColor: string;
  pageGlowStyle: string;
}

export interface TrailFxDef {
  id: TrailFxId;
  name: string;
  desc: string;
  cost: number;
  swatchA: string;
  swatchB: string;
  hueBase: number;
  rainbow: boolean;
  sparkShape: 'circle' | 'star' | 'diamond' | 'ring';
}

export const DEFAULT_CUSTOM_TRAIL: CustomTrailConfig = {
  primaryColor: '#38BDF8',
  secondaryColor: '#F472B6',
  mixMode: 'blend',
  shape: 'glow',
  decaySpeed: 1.0,
  particleSize: 1.1,
};

export function normalizeCustomTrail(
  raw?: Partial<CustomTrailConfig> | null
): CustomTrailConfig {
  return {
    primaryColor:
      typeof raw?.primaryColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(raw.primaryColor)
        ? raw.primaryColor
        : DEFAULT_CUSTOM_TRAIL.primaryColor,
    secondaryColor:
      typeof raw?.secondaryColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(raw.secondaryColor)
        ? raw.secondaryColor
        : DEFAULT_CUSTOM_TRAIL.secondaryColor,
    mixMode:
      raw?.mixMode === 'alternate' || raw?.mixMode === 'rainbow' || raw?.mixMode === 'blend'
        ? raw.mixMode
        : DEFAULT_CUSTOM_TRAIL.mixMode,
    shape:
      raw?.shape === 'glow' ||
      raw?.shape === 'sparks' ||
      raw?.shape === 'bubbles' ||
      raw?.shape === 'stars'
        ? raw.shape
        : DEFAULT_CUSTOM_TRAIL.shape,
    decaySpeed:
      typeof raw?.decaySpeed === 'number' && Number.isFinite(raw.decaySpeed)
        ? Math.max(0.45, Math.min(2.6, raw.decaySpeed))
        : DEFAULT_CUSTOM_TRAIL.decaySpeed,
    particleSize:
      typeof raw?.particleSize === 'number' && Number.isFinite(raw.particleSize)
        ? Math.max(0.6, Math.min(2.0, raw.particleSize))
        : DEFAULT_CUSTOM_TRAIL.particleSize,
  };
}

export function mixHexColors(hexA: string, hexB: string, t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const parse = (h: string) => {
    const clean = h.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
      return [56, 189, 248];
    }
    return [r, g, b];
  };
  const [r1, g1, b1] = parse(hexA);
  const [r2, g2, b2] = parse(hexB);
  const r = Math.round(r1 + (r2 - r1) * clamped);
  const g = Math.round(g1 + (g2 - g1) * clamped);
  const b = Math.round(b1 + (b2 - b1) * clamped);
  return `rgb(${r}, ${g}, ${b})`;
}

export const ARENA_THEMES: ArenaThemeDef[] = [
  {
    id: 'theme_midnight',
    name: 'Midnight Slate',
    desc: 'Classic crisp dark slate arena with cool rim highlight.',
    cost: 0,
    swatchA: '#0F172A',
    swatchB: '#38BDF8',
    frameBorderClass: 'border-slate-800',
    vignetteColor: 'rgba(56, 189, 248, 0.0)',
    rimColor: 'rgba(148, 163, 184, 0.14)',
    pageGlowStyle: '',
  },
  {
    id: 'theme_emerald',
    name: 'Emerald Meadow',
    desc: 'Deep forest emerald canopy glow with mint edge sheen.',
    cost: 50,
    swatchA: '#064E3B',
    swatchB: '#34D399',
    frameBorderClass: 'border-emerald-500/45',
    vignetteColor: 'rgba(16, 185, 129, 0.14)',
    rimColor: 'rgba(52, 211, 153, 0.42)',
    pageGlowStyle: 'rgba(16, 185, 129, 0.08)',
  },
  {
    id: 'theme_solar',
    name: 'Solar Amber',
    desc: 'Warm obsidian-gold horizon glow and gilded arena trim.',
    cost: 80,
    swatchA: '#451A03',
    swatchB: '#FBBF24',
    frameBorderClass: 'border-amber-400/50',
    vignetteColor: 'rgba(245, 158, 11, 0.15)',
    rimColor: 'rgba(251, 191, 36, 0.48)',
    pageGlowStyle: 'rgba(245, 158, 11, 0.08)',
  },
  {
    id: 'theme_sakura',
    name: 'Sakura Twilight',
    desc: 'Velvet dusk gradient with soft rose-petal corner bloom.',
    cost: 110,
    swatchA: '#4C0519',
    swatchB: '#FB7185',
    frameBorderClass: 'border-rose-400/50',
    vignetteColor: 'rgba(244, 63, 94, 0.15)',
    rimColor: 'rgba(251, 113, 133, 0.46)',
    pageGlowStyle: 'rgba(244, 63, 94, 0.08)',
  },
  {
    id: 'theme_aurora',
    name: 'Aurora Borealis',
    desc: 'Shimmering cyan-violet polar aurora frame and mist.',
    cost: 150,
    swatchA: '#1E1B4B',
    swatchB: '#22D3EE',
    frameBorderClass: 'border-cyan-400/55',
    vignetteColor: 'rgba(34, 211, 238, 0.16)',
    rimColor: 'rgba(167, 139, 250, 0.5)',
    pageGlowStyle: 'rgba(56, 189, 248, 0.09)',
  },
  {
    id: 'theme_crimson',
    name: 'Solar Eclipse',
    desc: 'High-contrast volcanic ruby rim with ember aura.',
    cost: 200,
    swatchA: '#450A0A',
    swatchB: '#F97316',
    frameBorderClass: 'border-orange-400/55',
    vignetteColor: 'rgba(249, 115, 22, 0.16)',
    rimColor: 'rgba(248, 113, 113, 0.5)',
    pageGlowStyle: 'rgba(249, 115, 22, 0.08)',
  },
];

export const TRAIL_FX_LIST: TrailFxDef[] = [
  {
    id: 'fx_classic',
    name: 'Pure Standard',
    desc: 'Clean untouched arcade cursor without extra trail sparks.',
    cost: 0,
    swatchA: '#94A3B8',
    swatchB: '#E2E8F0',
    hueBase: 200,
    rainbow: false,
    sparkShape: 'circle',
  },
  {
    id: 'fx_stardust',
    name: 'Stardust Ribbon',
    desc: 'Twinkling four-point starlight flakes follow every move and tap.',
    cost: 55,
    swatchA: '#7DD3FC',
    swatchB: '#F8FAFC',
    hueBase: 198,
    rainbow: false,
    sparkShape: 'star',
  },
  {
    id: 'fx_golden',
    name: 'Golden Foil',
    desc: 'Warm 24k gold dust and radiant amber shockwave rings.',
    cost: 90,
    swatchA: '#F59E0B',
    swatchB: '#FEF08A',
    hueBase: 42,
    rainbow: false,
    sparkShape: 'diamond',
  },
  {
    id: 'fx_prism',
    name: 'Prism Chrome',
    desc: 'Full-spectrum rainbow diamonds shimmer along your pointer.',
    cost: 135,
    swatchA: '#EC4899',
    swatchB: '#22D3EE',
    hueBase: 0,
    rainbow: true,
    sparkShape: 'diamond',
  },
  {
    id: 'fx_plasma',
    name: 'Plasma Halo',
    desc: 'Electric cyan-violet pulse rings radiate from every click.',
    cost: 180,
    swatchA: '#8B5CF6',
    swatchB: '#38BDF8',
    hueBase: 255,
    rainbow: false,
    sparkShape: 'ring',
  },
  {
    id: 'fx_custom',
    name: 'Custom Studio Trail',
    desc: 'Your handcrafted color mix, particle shape, and fade rhythm.',
    cost: 0,
    swatchA: '#38BDF8',
    swatchB: '#F472B6',
    hueBase: 205,
    rainbow: false,
    sparkShape: 'circle',
  },
];

export function getArenaTheme(id: ArenaThemeId): ArenaThemeDef {
  return ARENA_THEMES.find((t) => t.id === id) ?? ARENA_THEMES[0];
}

export function getTrailFx(id: TrailFxId): TrailFxDef {
  return TRAIL_FX_LIST.find((f) => f.id === id) ?? TRAIL_FX_LIST[0];
}

export const DEFAULT_SOUNDSCAPE_CONFIG: SoundscapeMixerConfig = {
  enabled: false,
  masterVolume: 0.65,
  layers: {
    rain: 0.45,
    cosmicWind: 0.25,
    deepSpace: 0.35,
    crystalStream: 0.2,
  },
};

export function normalizeSoundscapeConfig(
  raw?: Partial<SoundscapeMixerConfig> | null
): SoundscapeMixerConfig {
  const clamp01 = (v: unknown, fallback: number) =>
    typeof v === 'number' && Number.isFinite(v)
      ? Math.max(0, Math.min(1, v))
      : fallback;

  return {
    enabled: typeof raw?.enabled === 'boolean' ? raw.enabled : DEFAULT_SOUNDSCAPE_CONFIG.enabled,
    masterVolume: clamp01(raw?.masterVolume, DEFAULT_SOUNDSCAPE_CONFIG.masterVolume),
    layers: {
      rain: clamp01(raw?.layers?.rain, DEFAULT_SOUNDSCAPE_CONFIG.layers.rain),
      cosmicWind: clamp01(raw?.layers?.cosmicWind, DEFAULT_SOUNDSCAPE_CONFIG.layers.cosmicWind),
      deepSpace: clamp01(raw?.layers?.deepSpace, DEFAULT_SOUNDSCAPE_CONFIG.layers.deepSpace),
      crystalStream: clamp01(
        raw?.layers?.crystalStream,
        DEFAULT_SOUNDSCAPE_CONFIG.layers.crystalStream
      ),
    },
  };
}

export const SOUNDSCAPE_LAYER_META: Array<{
  id: SoundscapeLayerId;
  label: string;
  desc: string;
  accentClass: string;
}> = [
  {
    id: 'rain',
    label: 'Rain',
    desc: 'Warm soft rainfall & delicate water drops',
    accentClass: 'accent-sky-400',
  },
  {
    id: 'cosmicWind',
    label: 'Cosmic Wind',
    desc: 'Slow breathing solar breeze sweeps',
    accentClass: 'accent-teal-400',
  },
  {
    id: 'deepSpace',
    label: 'Deep Space',
    desc: 'Warm sub-harmonic nebula drone pad',
    accentClass: 'accent-indigo-400',
  },
  {
    id: 'crystalStream',
    label: 'Crystal Chimes',
    desc: 'Distant pentatonic wind-chime shimmer',
    accentClass: 'accent-amber-400',
  },
];

export const SOUNDSCAPE_PRESETS: Array<{
  label: string;
  layers: Record<SoundscapeLayerId, number>;
}> = [
  {
    label: 'Rainy Meadow',
    layers: { rain: 0.72, cosmicWind: 0.18, deepSpace: 0.15, crystalStream: 0.35 },
  },
  {
    label: 'Cosmic Drift',
    layers: { rain: 0.0, cosmicWind: 0.68, deepSpace: 0.55, crystalStream: 0.42 },
  },
  {
    label: 'Deep Space',
    layers: { rain: 0.0, cosmicWind: 0.32, deepSpace: 0.85, crystalStream: 0.18 },
  },
  {
    label: 'Glass Sanctuary',
    layers: { rain: 0.42, cosmicWind: 0.25, deepSpace: 0.3, crystalStream: 0.75 },
  },
];

