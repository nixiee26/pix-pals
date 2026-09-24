import React, { useState } from 'react';
import { ShoppingBag, Check, Lock, Sparkles, Tag } from 'lucide-react';
import { StoreItem, StoreCategory, UserProfile } from '../types';
import { PixelMascot } from '../components/mascot/PixelMascot';

interface StoreViewProps {
  profile: UserProfile;
  storeItems: StoreItem[];
  onPurchaseItem: (item: StoreItem) => void;
  onEquipItem: (item: StoreItem) => void;
}

export const StoreView: React.FC<StoreViewProps> = ({
  profile,
  storeItems,
  onPurchaseItem,
  onEquipItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<StoreCategory | 'all'>('all');

  const filteredItems = storeItems.filter(item => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const categories: { id: StoreCategory | 'all'; label: string; icon: string }[] = [
    { id: 'all', label: 'All Items', icon: '✨' },
    { id: 'theme', label: 'Cozy Rooms', icon: '🏡' },
    { id: 'timer', label: 'Timer Skins', icon: '📟' },
    { id: 'audio', label: 'Audio Packs', icon: '🌧️' },
    { id: 'vision_board', label: 'Vision Board', icon: '🖼️' },
    { id: 'mascot_outfit', label: 'Companion Gear', icon: '👓' },
  ];

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 pb-12 select-none">
      {/* 1. Top Header with Coin Balance and Mascot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-2 border-[#2c221e] rounded-xl p-4 shadow-pixel-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10">
            <PixelMascot id={profile.selectedMascot} state="celebrating" size={40} />
          </div>
          <div>
            <h1 className="font-pixel text-base text-[#2c221e]">Cozy Reward Bazaar</h1>
            <p className="text-xs text-[#847367] font-medium mt-0.5">
              Spend your honestly earned focus coins on tranquil themes, timer styles, and companion gifts.
            </p>
          </div>
        </div>

        {/* Coin Bank Pill */}
        <div className="flex items-center gap-2 bg-[#fcf3d9] border-2 border-[#2c221e] rounded-xl px-4 py-2 shadow-pixel-sm self-start sm:self-auto">
          <span className="text-xl">🪙</span>
          <div>
            <div className="text-[10px] text-[#847367] font-bold uppercase tracking-wider">
              Your Coins
            </div>
            <div className="font-pixel text-base text-[#2c221e]">
              {profile.coins}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border-2 transition-all whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-[#faeedf] border-[#2c221e] shadow-pixel-sm translate-x-0.5 font-extrabold'
                : 'bg-white border-[#ded3c5] text-[#5c4a3f] hover:bg-[#fcfaf6]'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* 3. Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map(item => {
          const canAfford = profile.coins >= item.price;

          return (
            <div
              key={item.id}
              className={`bg-white border-2 border-[#2c221e] rounded-xl p-4 shadow-pixel-sm flex flex-col justify-between transition-all ${
                item.isEquipped ? 'ring-2 ring-[#488053] bg-[#fcfdfc]' : ''
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-12 h-12 bg-[#faeedf] border-2 border-[#2c221e] rounded-xl flex items-center justify-center text-2xl shadow-xs">
                    {item.icon}
                  </div>
                  {item.isEquipped ? (
                    <span className="text-[10px] font-pixel bg-[#d9ead3] text-[#1e3d23] border border-[#2c221e] px-2 py-0.5 rounded">
                      EQUIPPED
                    </span>
                  ) : item.isOwned ? (
                    <span className="text-[10px] font-pixel bg-[#e7eef7] text-[#2c4875] border border-[#2c221e] px-2 py-0.5 rounded">
                      OWNED
                    </span>
                  ) : (
                    <div className="flex items-center gap-1 bg-[#fcf3d9] border border-[#2c221e] px-2 py-0.5 rounded font-pixel text-xs text-[#2c221e]">
                      <span>🪙</span>
                      <span>{item.price}</span>
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-sm text-[#2c221e] mb-1">
                  {item.name}
                </h3>
                <p className="text-xs text-[#847367] leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-[#f0e6dc]">
                {item.isOwned ? (
                  item.isEquipped ? (
                    <button
                      disabled
                      className="w-full py-2 bg-[#d9ead3] text-[#1e3d23] border border-[#2c221e] rounded-lg text-xs font-bold cursor-default flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Active
                    </button>
                  ) : (
                    <button
                      onClick={() => onEquipItem(item)}
                      className="w-full py-2 bg-[#ffffff] hover:bg-[#faeedf] text-[#2c221e] border-2 border-[#2c221e] rounded-lg text-xs font-bold shadow-xs transition-all"
                    >
                      Equip Item
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => onPurchaseItem(item)}
                    disabled={!canAfford}
                    className={`w-full py-2 rounded-lg text-xs font-bold border-2 border-[#2c221e] flex items-center justify-center gap-1.5 transition-all ${
                      canAfford
                        ? 'pixel-btn-primary'
                        : 'bg-[#e8ded3] text-[#847367] cursor-not-allowed opacity-60'
                    }`}
                  >
                    {!canAfford ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Need {item.price - profile.coins} more coins</span>
                      </>
                    ) : (
                      <>
                        <span>Unlock for {item.price} Coins</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
