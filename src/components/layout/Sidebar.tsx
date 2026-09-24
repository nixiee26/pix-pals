import React from 'react';
import { Home, Calendar, Clock, BarChart2, ShoppingBag, User, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { PixelMascot } from '../mascot/PixelMascot';
import { MascotId } from '../../types';

export type NavTab = 'home' | 'planner' | 'focus' | 'progress' | 'store' | 'profile';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  mascotId: MascotId;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  mascotId,
  isCollapsed,
  onToggleCollapse,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'planner', label: 'Planner', icon: <Calendar className="w-4 h-4" /> },
    { id: 'focus', label: 'Focus', icon: <Clock className="w-4 h-4" /> },
    { id: 'progress', label: 'Progress', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'store', label: 'Store', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <aside
      className={`min-h-screen bg-[#2c221e] text-[#f7eedf] flex flex-col justify-between border-r-2 border-[#1c1512] select-none transition-all duration-300 relative z-20 ${
        isCollapsed ? 'w-20 p-2.5 items-center' : 'w-60 p-4'
      }`}
    >
      {/* 1. Header & Brand */}
      <div className="w-full flex flex-col">
        {/* Top bar with Toggle Button */}
        <div className={`flex items-center pb-4 border-b border-[#47372f] ${isCollapsed ? 'flex-col gap-2' : 'justify-between'}`}>
          <div className={`flex items-center gap-2.5 ${isCollapsed ? 'flex-col text-center' : ''}`}>
            <div className="w-8 h-8 flex-shrink-0 cursor-pointer" onClick={onToggleCollapse} title="Toggle Sidebar">
              <PixelMascot id="star" size={32} />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-pixel text-sm tracking-wider text-[#ffd152] uppercase">
                  PIX PALS
                </h1>
                <p className="text-[10px] text-[#baa494] font-medium leading-none mt-1">
                  Small focus. Big dreams. ⭐
                </p>
              </div>
            )}
          </div>

          {/* Collapse Toggle Button */}
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="p-1.5 rounded-lg text-[#baa494] hover:text-[#ffd152] hover:bg-[#3d312a] border border-transparent hover:border-[#1c1512] transition-colors"
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* 2. Nav Items */}
        <nav className="mt-5 flex flex-col gap-2 w-full">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center rounded-lg text-sm font-bold transition-all ${
                  isCollapsed
                    ? 'justify-center p-3'
                    : 'gap-3 px-3 py-2.5 text-left'
                } ${
                  isActive
                    ? 'bg-[#d9ead3] text-[#1e3d23] border-2 border-[#1a1512] shadow-pixel-sm font-extrabold translate-x-0.5'
                    : 'text-[#e6d8cb] hover:bg-[#3d312a] hover:text-white border-2 border-transparent'
                }`}
              >
                <div className={`p-0.5 rounded ${isActive ? 'text-[#1e3d23]' : 'text-[#baa494]'}`}>
                  {item.icon}
                </div>
                {!isCollapsed && <span className="tracking-wide">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. Bottom Companion Card */}
      {isCollapsed ? (
        <div className="w-full flex flex-col items-center pb-2 pt-4 border-t border-[#47372f]">
          <div className="cursor-pointer transition-transform hover:scale-110" onClick={onToggleCollapse} title="Expand to see companion">
            <PixelMascot id={mascotId} state="encouraging" size={38} />
          </div>
          <span className="text-[10px] mt-1 text-[#ffd152]">❤️</span>
        </div>
      ) : (
        <div className="relative mt-8 rounded-lg overflow-hidden border-2 border-[#1c1512] bg-gradient-to-t from-[#36593a] via-[#488053] to-[#7693b8] p-3 text-center shadow-pixel-sm">
          <div className="absolute top-2 left-2 text-[10px] text-white/50 font-pixel">✨</div>
          <div className="absolute top-5 right-2 text-[10px] text-white/50 font-pixel">✨</div>

          {/* Speech Bubble */}
          <div className="relative z-10 inline-block bg-[#fffcf5] text-[#2c221e] border-2 border-[#2c221e] rounded-md px-3 py-1 text-xs font-bold shadow-xs mb-2">
            Keep going! ❤️
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#fffcf5] border-r-2 border-b-2 border-[#2c221e] rotate-45" />
          </div>

          {/* Mascot sitting amongst flowers */}
          <div className="relative z-10 flex flex-col items-center mt-1">
            <PixelMascot id={mascotId} state="encouraging" size={54} />
            <div className="flex gap-2 text-xs -mt-1">
              <span>🌸</span>
              <span>🌿</span>
              <span>🌼</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
