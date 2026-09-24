import React from 'react';
import { MascotId } from '../../types';

export interface PixelMascotProps {
  id: MascotId;
  state?: 'idle' | 'sleeping' | 'studying' | 'celebrating' | 'encouraging';
  size?: number; // size in pixels
  className?: string;
  accessory?: string;
}

export const PixelMascot: React.FC<PixelMascotProps> = ({
  id = 'calico_cat',
  state = 'idle',
  size = 80,
  className = '',
}) => {
  // Render procedural pixel art for each mascot character based on reference designs
  const renderMascotSvg = () => {
    switch (id) {
      case 'bunny':
        return renderBunny(state);
      case 'turtle':
        return renderTurtle(state);
      case 'star':
        return renderStar(state);
      case 'bear':
        return renderBear(state);
      case 'cat':
      case 'calico_cat':
      default:
        return renderCat(state, id === 'cat' ? 'tabby' : 'calico');
    }
  };

  return (
    <div
      className={`inline-block relative select-none transition-transform duration-300 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 32 32"
        width="100%"
        height="100%"
        shapeRendering="crispEdges"
        className="w-full h-full drop-shadow-sm"
      >
        {renderMascotSvg()}
      </svg>
      {state === 'sleeping' && (
        <div className="absolute -top-3 right-0 font-pixel text-[10px] text-[#4a6fa5] animate-pulse">
          Zz
        </div>
      )}
    </div>
  );
};

// 1. Calico / Tabby Cat (Faithful to Reference 1 & 2)
function renderCat(state: string, variant: 'calico' | 'tabby') {
  const isSleeping = state === 'sleeping';
  const isStudying = state === 'studying';
  const isCelebrating = state === 'celebrating';

  const bodyColor = variant === 'calico' ? '#f4eee4' : '#d28c46';
  const patchColor = variant === 'calico' ? '#df793b' : '#945321';
  const darkPatch = variant === 'calico' ? '#332924' : '#6b3c18';

  if (isSleeping) {
    return (
      <g>
        {/* Curled up sleeping cat on desk */}
        <rect x="6" y="16" width="20" height="10" fill={bodyColor} />
        <rect x="5" y="18" width="22" height="7" fill={bodyColor} />
        <rect x="8" y="15" width="16" height="2" fill={bodyColor} />
        {/* Patches */}
        <rect x="7" y="16" width="6" height="5" fill={patchColor} />
        <rect x="18" y="17" width="7" height="6" fill={darkPatch} />
        {/* Outline */}
        <path d="M5 18H4v7h1v2h2v1h18v-1h2v-2h1v-7h-1v-2h-3v-1H7v1H5v2z" fill="#2c221e" fillRule="evenodd" />
        {/* Closed Eyes */}
        <rect x="8" y="21" width="3" height="1" fill="#2c221e" />
        <rect x="13" y="21" width="3" height="1" fill="#2c221e" />
        <rect x="11" y="22" width="2" height="1" fill="#f7998b" />
        {/* Paws tucked */}
        <rect x="9" y="25" width="4" height="2" fill="#ffffff" />
      </g>
    );
  }

  return (
    <g className={isCelebrating ? 'animate-bounce' : ''}>
      {/* Sitting Cat (Reference 1 & 2) */}
      {/* Ears */}
      <rect x="8" y="6" width="4" height="5" fill={bodyColor} />
      <rect x="9" y="7" width="2" height="3" fill="#ffb4a2" />
      <rect x="20" y="6" width="4" height="5" fill={patchColor} />
      <rect x="21" y="7" width="2" height="3" fill="#ffb4a2" />

      {/* Head */}
      <rect x="7" y="9" width="18" height="10" fill={bodyColor} />
      <rect x="17" y="9" width="8" height="6" fill={patchColor} />
      <rect x="7" y="9" width="5" height="4" fill={darkPatch} />

      {/* Eyes */}
      {isStudying ? (
        // Focused study expression + spectacles
        <>
          <rect x="9" y="13" width="4" height="3" fill="none" stroke="#2c221e" strokeWidth="1" />
          <rect x="19" y="13" width="4" height="3" fill="none" stroke="#2c221e" strokeWidth="1" />
          <line x1="13" y1="14" x2="19" y2="14" stroke="#2c221e" strokeWidth="1" />
          <rect x="10" y="14" width="2" height="1" fill="#2c221e" />
          <rect x="20" y="14" width="2" height="1" fill="#2c221e" />
        </>
      ) : (
        // Big cute eyes
        <>
          <rect x="10" y="12" width="3" height="4" fill="#2c221e" />
          <rect x="10" y="12" width="1" height="1" fill="#ffffff" />
          <rect x="19" y="12" width="3" height="4" fill="#2c221e" />
          <rect x="19" y="12" width="1" height="1" fill="#ffffff" />
        </>
      )}

      {/* Nose & Mouth */}
      <rect x="15" y="16" width="2" height="1" fill="#f7998b" />
      <rect x="14" y="17" width="1" height="1" fill="#2c221e" />
      <rect x="17" y="17" width="1" height="1" fill="#2c221e" />

      {/* Cheeks */}
      <rect x="8" y="15" width="2" height="2" fill="#ffb4a2" opacity="0.6" />
      <rect x="22" y="15" width="2" height="2" fill="#ffb4a2" opacity="0.6" />

      {/* Body */}
      <rect x="9" y="19" width="14" height="10" fill={bodyColor} />
      <rect x="16" y="19" width="7" height="9" fill={patchColor} />
      <rect x="9" y="21" width="5" height="7" fill={darkPatch} />
      <rect x="12" y="19" width="8" height="8" fill="#ffffff" />

      {/* Front Paws */}
      <rect x="11" y="27" width="4" height="3" fill="#ffffff" />
      <rect x="17" y="27" width="4" height="3" fill="#ffffff" />

      {/* Tail curving up */}
      <rect x="23" y="21" width="3" height="7" fill={bodyColor} />
      <rect x="24" y="18" width="3" height="4" fill={darkPatch} />

      {/* Outline Highlights */}
      <rect x="7" y="6" width="1" height="5" fill="#2c221e" />
      <rect x="24" y="6" width="1" height="5" fill="#2c221e" />
    </g>
  );
}

// 2. Lop-eared Bunny (Reference 3)
function renderBunny(state: string) {
  const isCelebrating = state === 'celebrating';
  const isStudying = state === 'studying';

  return (
    <g className={isCelebrating ? 'animate-bounce' : ''}>
      {/* Lop-ear left */}
      <rect x="6" y="10" width="5" height="12" fill="#a46d47" />
      <rect x="7" y="11" width="3" height="10" fill="#ba845a" />
      <rect x="5" y="12" width="2" height="7" fill="#8c5835" />

      {/* Head */}
      <rect x="11" y="7" width="14" height="12" fill="#ba845a" />
      <rect x="10" y="9" width="16" height="9" fill="#c9956d" />

      {/* Right Ear draped down */}
      <rect x="23" y="10" width="5" height="12" fill="#a46d47" />
      <rect x="24" y="11" width="3" height="10" fill="#8c5835" />

      {/* Big dark rabbit eye */}
      {isStudying ? (
        <>
          <rect x="17" y="12" width="4" height="2" fill="#2c221e" />
          <rect x="16" y="11" width="6" height="4" fill="none" stroke="#2c221e" strokeWidth="1" />
        </>
      ) : (
        <>
          <rect x="18" y="11" width="4" height="5" fill="#2c221e" />
          <rect x="18" y="11" width="2" height="2" fill="#ffffff" />
        </>
      )}

      {/* Cheeks & Muzzle */}
      <rect x="11" y="14" width="7" height="5" fill="#e0b892" />
      <rect x="14" y="15" width="2" height="2" fill="#2c221e" />
      <rect x="15" y="17" width="1" height="2" fill="#2c221e" />

      {/* Body */}
      <rect x="10" y="18" width="16" height="10" fill="#ba845a" />
      <rect x="20" y="20" width="7" height="8" fill="#8c5835" />

      {/* Paws */}
      <rect x="10" y="27" width="5" height="3" fill="#a46d47" />
      <rect x="17" y="27" width="5" height="3" fill="#a46d47" />
      <rect x="23" y="26" width="4" height="4" fill="#8c5835" />
    </g>
  );
}

// 3. Pixel Turtle (Reference 4)
function renderTurtle(state: string) {
  const isCelebrating = state === 'celebrating';
  return (
    <g className={isCelebrating ? 'animate-bounce' : ''}>
      {/* Shell */}
      <rect x="12" y="8" width="14" height="12" fill="#7d4b2e" />
      <rect x="13" y="9" width="12" height="10" fill="#9c633f" />
      <rect x="15" y="11" width="8" height="6" fill="#b87b52" />
      {/* Shell rim */}
      <rect x="9" y="17" width="18" height="4" fill="#3b7a32" />

      {/* Head */}
      <rect x="4" y="12" width="8" height="9" fill="#60c040" />
      <rect x="5" y="13" width="6" height="7" fill="#75db53" />
      {/* Eye */}
      <rect x="5" y="14" width="2" height="3" fill="#2c221e" />
      <rect x="9" y="14" width="2" height="3" fill="#2c221e" />
      <rect x="7" y="17" width="2" height="1" fill="#2c221e" />

      {/* Legs */}
      <rect x="5" y="21" width="4" height="4" fill="#60c040" />
      <rect x="16" y="21" width="4" height="4" fill="#60c040" />
      <rect x="24" y="20" width="4" height="4" fill="#4ea532" />
    </g>
  );
}

// 4. Pixel Star Buddy (Reference 5)
function renderStar(state: string) {
  const isCelebrating = state === 'celebrating';
  return (
    <g className={isCelebrating ? 'animate-bounce' : ''}>
      {/* Outer outline */}
      <path
        d="M13 2h6v4h4v4h6v6h-3v4h-3v4h-2v6h-4v-4h-2v4h-4v-6h-2v-4h-3v-4h-3v-6h6v-4h4v-4z"
        fill="#3b2014"
      />
      {/* Inner star gradient */}
      <rect x="13" y="4" width="6" height="4" fill="#ffe26d" />
      <rect x="9" y="8" width="14" height="10" fill="#ffd152" />
      <rect x="5" y="11" width="22" height="5" fill="#f8b62c" />
      <rect x="9" y="18" width="14" height="5" fill="#f39422" />
      <rect x="10" y="22" width="3" height="4" fill="#e07218" />
      <rect x="19" y="22" width="3" height="4" fill="#e07218" />

      {/* Cute face */}
      <rect x="11" y="14" width="2" height="3" fill="#3b2014" />
      <rect x="19" y="14" width="2" height="3" fill="#3b2014" />
      <rect x="15" y="16" width="2" height="2" fill="#3b2014" />

      {/* Pink Rosy Cheeks */}
      <rect x="9" y="16" width="3" height="2" fill="#ff7f7f" />
      <rect x="20" y="16" width="3" height="2" fill="#ff7f7f" />

      {/* Sparkles */}
      <rect x="24" y="5" width="2" height="2" fill="#fff" />
      <rect x="5" y="7" width="2" height="2" fill="#fff" />
    </g>
  );
}

// 5. Mini Cozy Bear
function renderBear(state: string) {
  const isCelebrating = state === 'celebrating';
  return (
    <g className={isCelebrating ? 'animate-bounce' : ''}>
      {/* Ears */}
      <circle cx="8" cy="8" r="4" fill="#7a5230" />
      <circle cx="8" cy="8" r="2" fill="#e0b892" />
      <circle cx="24" cy="8" r="4" fill="#7a5230" />
      <circle cx="24" cy="8" r="2" fill="#e0b892" />

      {/* Head */}
      <rect x="6" y="9" width="20" height="14" fill="#8b5e34" rx="2" />
      <rect x="11" y="14" width="10" height="7" fill="#e0b892" rx="1" />

      {/* Eyes & Nose */}
      <rect x="10" y="13" width="2" height="2" fill="#2c221e" />
      <rect x="20" y="13" width="2" height="2" fill="#2c221e" />
      <rect x="15" y="15" width="2" height="2" fill="#2c221e" />

      {/* Body */}
      <rect x="8" y="21" width="16" height="9" fill="#7a5230" rx="2" />
      <rect x="12" y="23" width="8" height="6" fill="#e0b892" rx="1" />
    </g>
  );
}
