import React from 'react';
import { Home, Calendar, Clock, BarChart2, ShoppingBag, User } from 'lucide-react';
import { NavTab } from './Sidebar';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'planner', label: 'Plan', icon: <Calendar className="w-5 h-5" /> },
    { id: 'focus', label: 'Focus', icon: <Clock className="w-5 h-5" /> },
    { id: 'progress', label: 'Stats', icon: <BarChart2 className="w-5 h-5" /> },
    { id: 'store', label: 'Store', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'profile', label: 'Me', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#2c221e] border-t-2 border-[#1c1512] z-50 px-2 py-1 flex items-center justify-around select-none">
      {navItems.map((item) => {
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded transition-all ${
              isActive
                ? 'text-[#ffd152] font-bold scale-105'
                : 'text-[#baa494] hover:text-[#f7eedf]'
            }`}
          >
            <div className={isActive ? 'text-[#ffd152]' : ''}>
              {item.icon}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
