import { PlayMode } from '../game/types';

interface LogoProps {
  mode: PlayMode;
  className?: string;
}

export function BrandEmblem({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="mm-bg" x1="2" y1="2" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="55%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
      </defs>
      <circle cx="18" cy="18" r="15.5" stroke="url(#mm-bg)" strokeWidth="2.5" />
      <circle cx="18" cy="18" r="9.5" stroke="#FDE68A" strokeWidth="1.5" strokeDasharray="16 6" />
      <circle cx="18" cy="18" r="4.5" fill="#FFFFFF" />
      <circle cx="26.5" cy="10.5" r="2.2" fill="#38BDF8" />
    </svg>
  );
}

export function GameLogo({ mode, className = 'w-5 h-5' }: LogoProps) {
  switch (mode) {
    case 'SWARM':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <rect x="4" y="4" width="10" height="7" rx="2" fill="#F59E0B" />
          <rect x="18" y="4" width="10" height="7" rx="2" fill="#FB7185" />
          <rect x="11" y="13" width="10" height="7" rx="2" fill="#38BDF8" />
          <circle cx="9" cy="25" r="3" fill="#FFFFFF" />
          <circle cx="16" cy="23" r="2.5" fill="#FDE68A" />
          <circle cx="23" cy="26" r="2.5" fill="#7DD3FC" />
        </svg>
      );

    case 'RINGS':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path d="M16 4 A12 12 0 1 1 6 10" stroke="#10B981" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M16 8.5 A7.5 7.5 0 1 0 22.5 12" stroke="#F59E0B" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="16" cy="16" r="3.4" fill="#FFFFFF" />
          <circle cx="25" cy="7" r="2" fill="#6EE7B7" />
        </svg>
      );

    case 'BLOOM':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <circle cx="16" cy="16" r="12" stroke="#A78BFA" strokeWidth="1.8" strokeOpacity="0.6" />
          <circle cx="16" cy="16" r="8" stroke="#C084FC" strokeWidth="2" />
          <circle cx="16" cy="16" r="4" fill="#F5D0FE" />
          <circle cx="24" cy="9" r="2.5" fill="#38BDF8" />
          <circle cx="8" cy="23" r="2.2" fill="#FBBF24" />
        </svg>
      );

    case 'ORBIT':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <ellipse cx="16" cy="16" rx="13" ry="5.5" transform="rotate(-28 16 16)" stroke="#FB7185" strokeWidth="2" />
          <ellipse cx="16" cy="16" rx="13" ry="5.5" transform="rotate(28 16 16)" stroke="#38BDF8" strokeWidth="1.6" strokeOpacity="0.8" />
          <circle cx="16" cy="16" r="4.5" fill="#F8FAFC" />
          <circle cx="26" cy="11" r="2.3" fill="#FDA4AF" />
        </svg>
      );

    case 'SLICE':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path d="M7 11 L21 7 L17 17 Z" fill="#22D3EE" />
          <path d="M15 19 L25 15 L21 26 Z" fill="#A5F3FC" />
          <path d="M4 26 L28 6" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M4 26 L28 6" stroke="#38BDF8" strokeWidth="5" strokeOpacity="0.3" strokeLinecap="round" />
        </svg>
      );

    case 'HEX':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <polygon points="16,4 22,7.5 22,14.5 16,18 10,14.5 10,7.5" fill="#14B8A6" stroke="#99F6E4" strokeWidth="1.4" />
          <polygon points="10,15 16,18.5 16,25.5 10,29 4,25.5 4,18.5" fill="#0EA5E9" stroke="#BAE6FD" strokeWidth="1.4" />
          <polygon points="22,15 28,18.5 28,25.5 22,29 16,25.5 16,18.5" fill="#F59E0B" stroke="#FDE68A" strokeWidth="1.4" />
        </svg>
      );

    case 'DOMINO':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <rect x="5" y="10" width="5" height="15" rx="1.5" transform="rotate(-24 7 18)" fill="#FB923C" stroke="#FFEDD5" strokeWidth="1.2" />
          <rect x="13" y="9" width="5" height="15" rx="1.5" transform="rotate(-12 15 17)" fill="#FBBF24" stroke="#FEF3C7" strokeWidth="1.2" />
          <rect x="21" y="9" width="5" height="15" rx="1.5" fill="#F8FAFC" />
        </svg>
      );

    case 'PULSE':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <circle cx="16" cy="16" r="12" stroke="#F472B6" strokeWidth="2" strokeDasharray="6 4" />
          <circle cx="16" cy="16" r="7.5" stroke="#EC4899" strokeWidth="2.2" />
          <circle cx="16" cy="16" r="3.5" fill="#FDF2F8" />
          <circle cx="16" cy="4" r="2.2" fill="#FDE047" />
          <circle cx="28" cy="16" r="2.2" fill="#38BDF8" />
        </svg>
      );

    case 'VORTEX':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path d="M16 16 C16 10, 24 10, 24 16 C24 23, 10 25, 8 16 C6 7, 21 4, 27 12" stroke="#818CF8" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="16" cy="16" r="3" fill="#C7D2FE" />
          <circle cx="9" cy="10" r="2" fill="#34D399" />
          <circle cx="24" cy="23" r="2" fill="#F472B6" />
        </svg>
      );

    case 'LASER':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path d="M4 25 L16 9 L27 21" stroke="#38BDF8" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 9 L26 6" stroke="#F472B6" strokeWidth="2.2" strokeLinecap="round" />
          <polygon points="16,4 20,9 16,14 12,9" fill="#E0F2FE" stroke="#7DD3FC" strokeWidth="1.2" />
          <circle cx="27" cy="21" r="2.8" fill="#FDE047" />
        </svg>
      );

    case 'MERGE':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <circle cx="11" cy="19" r="6" fill="#38BDF8" fillOpacity="0.85" stroke="#BAE6FD" strokeWidth="1.5" />
          <circle cx="21" cy="19" r="6" fill="#F472B6" fillOpacity="0.85" stroke="#FBCFE8" strokeWidth="1.5" />
          <circle cx="16" cy="11" r="5" fill="#FBBF24" stroke="#FEF3C7" strokeWidth="1.5" />
        </svg>
      );

    case 'PLINKO':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <circle cx="16" cy="6" r="3" fill="#FBBF24" />
          <circle cx="12" cy="14" r="1.8" fill="#94A3B8" />
          <circle cx="20" cy="14" r="1.8" fill="#94A3B8" />
          <circle cx="8" cy="20" r="1.8" fill="#34D399" />
          <circle cx="16" cy="20" r="1.8" fill="#94A3B8" />
          <circle cx="24" cy="20" r="1.8" fill="#34D399" />
          <rect x="5" y="25" width="6" height="4" rx="1" fill="#F43F5E" />
          <rect x="13" y="25" width="6" height="4" rx="1" fill="#A855F7" />
          <rect x="21" y="25" width="6" height="4" rx="1" fill="#F43F5E" />
        </svg>
      );

    case 'BUBBLE':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <circle cx="10" cy="10" r="4.5" fill="#38BDF8" stroke="#BAE6FD" strokeWidth="1.3" />
          <circle cx="22" cy="10" r="4.5" fill="#F472B6" stroke="#FBCFE8" strokeWidth="1.3" />
          <circle cx="10" cy="22" r="4.5" fill="#34D399" stroke="#A7F3D0" strokeWidth="1.3" />
          <circle cx="22" cy="22" r="4.5" fill="#FBBF24" stroke="#FEF3C7" strokeWidth="1.3" />
        </svg>
      );

    case 'VACUUM':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <circle cx="16" cy="16" r="12" stroke="#A855F7" strokeWidth="1.8" strokeDasharray="7 4" />
          <circle cx="16" cy="16" r="6" fill="#090D16" stroke="#FBBF24" strokeWidth="2.2" />
          <circle cx="7" cy="9" r="2.2" fill="#38BDF8" />
          <circle cx="25" cy="11" r="2" fill="#34D399" />
          <circle cx="23" cy="24" r="2.4" fill="#F472B6" />
        </svg>
      );

    case 'SAND':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path d="M5 27 Q16 14 27 27 Z" fill="#F59E0B" />
          <path d="M9 27 Q18 18 27 27 Z" fill="#EC4899" fillOpacity="0.85" />
          <circle cx="16" cy="6" r="2" fill="#38BDF8" />
          <circle cx="15" cy="11" r="1.7" fill="#34D399" />
          <circle cx="17" cy="15" r="1.7" fill="#FDE047" />
        </svg>
      );

    case 'CHIME':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <line x1="8" y1="6" x2="8" y2="23" stroke="#7DD3FC" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="14" y1="9" x2="14" y2="25" stroke="#34D399" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="20" y1="7" x2="20" y2="22" stroke="#FBBF24" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="26" y1="11" x2="26" y2="26" stroke="#F472B6" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="14" cy="14" r="3" fill="#FFFFFF" />
          <circle cx="23" cy="18" r="2.2" fill="#FDE68A" />
        </svg>
      );

    case 'TRACK':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path d="M4 9 Q16 14 27 8" stroke="#34D399" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M5 19 Q16 14 27 21" stroke="#FBBF24" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M6 27 Q18 22 28 27" stroke="#38BDF8" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="11" cy="10" r="2.7" fill="#FFFFFF" />
          <circle cx="21" cy="17" r="2.7" fill="#FDE68A" />
        </svg>
      );

    case 'PENDULUM':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <circle cx="16" cy="5" r="2" fill="#E2E8F0" />
          <path d="M16 5 L9 21" stroke="#94A3B8" strokeWidth="1.4" />
          <path d="M16 5 L16 24" stroke="#CBD5E1" strokeWidth="1.5" />
          <path d="M16 5 L23 19" stroke="#94A3B8" strokeWidth="1.4" />
          <path d="M7 22 Q16 29 25 20" stroke="#FBBF24" strokeWidth="1.6" strokeDasharray="3 3" strokeLinecap="round" />
          <circle cx="9" cy="21" r="3" fill="#38BDF8" stroke="#E0F2FE" strokeWidth="1.2" />
          <circle cx="16" cy="24" r="3.4" fill="#FBBF24" stroke="#FEF3C7" strokeWidth="1.2" />
          <circle cx="23" cy="19" r="3" fill="#F472B6" stroke="#FCE7F3" strokeWidth="1.2" />
        </svg>
      );

    case 'POND':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <circle cx="16" cy="16" r="12.5" stroke="#2DD4BF" strokeWidth="1.4" strokeOpacity="0.45" />
          <circle cx="16" cy="16" r="8" stroke="#5EEAD4" strokeWidth="1.5" strokeOpacity="0.7" />
          <path d="M9 20 C11 14, 15 10, 21 9 C20 14, 17 19, 12 22 Z" fill="#FB923C" stroke="#FED7AA" strokeWidth="1.1" />
          <circle cx="18.8" cy="11.2" r="1" fill="#0F172A" />
          <circle cx="23" cy="22" r="3.5" fill="#10B981" stroke="#A7F3D0" strokeWidth="1.2" />
          <circle cx="23" cy="22" r="1.4" fill="#F472B6" />
        </svg>
      );

    case 'VAULT':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <path
            d="M5 5 H27 V18 H20 M12 18 H5 V5"
            stroke="#94A3B8"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="11" cy="10" r="2.2" fill="#FBBF24" />
          <circle cx="21" cy="10" r="2.2" fill="#34D399" />
          <circle cx="16" cy="14" r="2" fill="#FFFFFF" />
          <rect x="9" y="25" width="14" height="3.2" rx="1.6" fill="#38BDF8" />
        </svg>
      );

    case 'BOX_LINES':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <rect x="6" y="4" width="20" height="24" rx="2.5" stroke="#64748B" strokeWidth="2" />
          <line x1="8" y1="12" x2="24" y2="12" stroke="#F472B6" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="8" y1="18" x2="24" y2="18" stroke="#38BDF8" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="8" y1="24" x2="24" y2="24" stroke="#34D399" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="13" cy="8" r="2.2" fill="#FFFFFF" />
          <circle cx="19" cy="8" r="2.2" fill="#FDE047" />
        </svg>
      );

    case 'SANDBOX':
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
          <circle cx="10" cy="11" r="4.5" fill="#10B981" stroke="#A7F3D0" strokeWidth="1.6" />
          <circle cx="22" cy="12" r="4" fill="#FB7185" stroke="#FFE4E6" strokeWidth="1.6" />
          <rect x="7" y="21" width="18" height="3.5" rx="1.75" transform="rotate(-14 16 22)" fill="#CBD5E1" />
          <circle cx="16" cy="22.5" r="2" fill="#38BDF8" />
        </svg>
      );
  }
}
