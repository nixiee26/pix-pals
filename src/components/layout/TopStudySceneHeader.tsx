import React from 'react';
import { UserProfile } from '../../types';
import { PixelMascot } from '../mascot/PixelMascot';

interface TopStudySceneHeaderProps {
  profile: UserProfile;
  onOpenStore?: () => void;
}

export const TopStudySceneHeader: React.FC<TopStudySceneHeaderProps> = ({
  profile,
  onOpenStore,
}) => {
  const xpPercentage = Math.min(100, Math.round((profile.xp / profile.xpToNextLevel) * 100));

  return (
    <div className="relative w-full max-w-full h-[140px] md:h-[160px] overflow-hidden rounded-t-xl md:rounded-xl border-2 border-[#2c221e] bg-[#f0dfd1] shadow-pixel-sm mb-6 select-none">
      <div className="absolute inset-0 bg-gradient-to-b from-[#e39c7e] via-[#f7c297] to-[#8fb8a2] opacity-90" />

      {/* Pixel Clouds & Twilight Stars */}
      <div className="absolute top-3 left-16 w-12 h-3 bg-white/40 rounded-full" />
      <div className="absolute top-6 left-32 w-20 h-4 bg-white/30 rounded-full" />
      <div className="absolute top-2 left-64 w-8 h-2 bg-white/50 rounded-full" />
      <div className="absolute top-4 left-96 w-14 h-3 bg-white/35 rounded-full" />

      {/* 2. Window Frame with Cozy Timber & Hanging Vines */}
      <div className="absolute inset-x-0 top-0 h-4 bg-[#7a5338] border-b-2 border-[#2c221e]" />
      
      {/* Hanging Ivy Leaves */}
      <div className="absolute top-4 left-[35%] text-xs text-[#3d6e3b] font-pixel tracking-widest hidden sm:block">
        🌿🌿🌿
      </div>
      <div className="absolute top-4 left-72 text-xs text-[#3d6e3b] font-pixel tracking-widest">
        🌿🌿
      </div>
      <div className="absolute top-4 right-[32%] text-xs text-[#3d6e3b] font-pixel tracking-widest hidden lg:block">
        🌿🌿🌿🌿
      </div>

      {/* 3. Study Desk Surface */}
      <div className="absolute inset-x-0 bottom-0 h-9 md:h-11 bg-[#ab7a55] border-t-2 border-[#2c221e] flex items-center px-4">
        {/* Desk items: Potted plant, Books, Sleeping Cat, Mug, Laptop */}
        <div className="relative flex items-end gap-3 md:gap-5 -top-4 md:-top-5">
          {/* Potted Plant 1 */}
          <div className="text-xl md:text-2xl drop-shadow-sm">🪴</div>

          {/* Plant 2 */}
          <div className="text-lg md:text-xl drop-shadow-sm hidden sm:block">🌱</div>

          {/* Sleeping Companion Mascot curled up on desk (Reference 1) */}
          <div className="relative cursor-pointer transition-transform hover:scale-105">
            <PixelMascot id={profile.selectedMascot} state="sleeping" size={54} />
          </div>

          {/* Cat Mug */}
          <div className="w-6 h-6 md:w-7 md:h-7 bg-[#ffffff] border-2 border-[#2c221e] rounded-sm flex items-center justify-center text-[10px] font-bold shadow-sm">
            🐱
          </div>

          {/* Laptop with Cat Logo */}
          <div className="relative w-12 h-9 md:w-14 md:h-10 bg-[#3d3a37] border-2 border-[#2c221e] rounded-t flex flex-col items-center justify-center">
            <div className="w-3 h-3 text-[8px] flex items-center justify-center">
              🐾
            </div>
            <div className="absolute -bottom-1 w-14 md:w-16 h-1.5 bg-[#544e47] border border-[#2c221e] rounded-sm" />
          </div>

          {/* Book Stack */}
          <div className="flex flex-col gap-0.5 hidden sm:flex">
            <div className="w-8 h-2 bg-[#4a6fa5] border border-[#2c221e] rounded-xs" />
            <div className="w-9 h-2.5 bg-[#df793b] border border-[#2c221e] rounded-xs" />
            <div className="w-10 h-2 bg-[#488053] border border-[#2c221e] rounded-xs" />
          </div>

          {/* Plant 3 */}
          <div className="text-xl drop-shadow-sm hidden md:block">🪴</div>
        </div>
      </div>

      {/* Mini "A Brighter You" Framed Wall Art (from reference mock) */}
      <div className="absolute top-5 right-[22%] hidden xl:flex flex-col items-center justify-center w-16 h-20 bg-[#faeedf] border-2 border-[#2c221e] shadow-sm p-1 text-center">
        <span className="font-retro text-xs text-[#6e4e37] leading-tight font-bold">
          A<br />Brighter<br />You
        </span>
        <span className="text-[10px] text-[#e06d53]">❤️</span>
      </div>

      {/* 4. Top-Right Stats Panel (Matching Reference 1 exactly!) */}
      <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-white/95 backdrop-blur-xs border-2 border-[#2c221e] rounded-md p-2 md:p-2.5 shadow-pixel-sm flex flex-col gap-1.5 min-w-[170px] md:min-w-[190px]">
        {/* Level & XP */}
        <div className="flex items-center gap-2">
          {/* Pixel Star Icon */}
          <div className="w-6 h-6 flex-shrink-0">
            <PixelMascot id="star" size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="font-pixel text-[10px] text-[#2c221e]">Lv. {profile.level}</span>
              <span className="text-[9px] text-[#847367] font-semibold">
                {profile.xp}/{profile.xpToNextLevel} XP
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-[#ebe1d5] border border-[#2c221e] rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#2c4875] to-[#4a6fa5] transition-all duration-500"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Coins & Streak row */}
        <div className="flex items-center justify-between gap-2 pt-0.5 border-t border-[#f0e6dc]">
          {/* Coin Pill */}
          <div className="flex items-center gap-1.5 bg-[#fcf3d9] border border-[#2c221e] px-2 py-0.5 rounded text-xs font-bold">
            <span className="text-sm">🪙</span>
            <span className="font-pixel text-[10px] text-[#2c221e]">{profile.coins}</span>
            <button
              onClick={onOpenStore}
              title="Visit Store to unlock items"
              className="ml-0.5 w-3.5 h-3.5 bg-[#488053] text-white text-[9px] flex items-center justify-center rounded-xs hover:bg-[#3b6b44]"
            >
              +
            </button>
          </div>

          {/* Streak Pill */}
          <div className="flex items-center gap-1 bg-[#faeedf] border border-[#2c221e] px-2 py-0.5 rounded text-xs font-bold">
            <span>📅</span>
            <span className="font-pixel text-[9px] text-[#2c221e]">{profile.streak}d</span>
            <span className="text-xs">🔥</span>
          </div>
        </div>
      </div>
    </div>
  );
};
