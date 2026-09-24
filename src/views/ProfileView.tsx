import React, { useState } from 'react';
import { User, Shield, Volume2, Moon, Download, Upload, Trash2, Check, RefreshCw, AlertTriangle, Key } from 'lucide-react';
import { UserProfile, UserSettings, MascotId, BlockingProfile } from '../types';
import { PixelMascot } from '../components/mascot/PixelMascot';
import { storage } from '../services/storage';

interface ProfileViewProps {
  profile: UserProfile;
  settings: UserSettings;
  blockingProfiles: BlockingProfile[];
  onUpdateProfile: (profile: UserProfile) => void;
  onUpdateSettings: (settings: UserSettings) => void;
  onUpdateBlockingProfiles: (profiles: BlockingProfile[]) => void;
  onResetAllData: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  settings,
  blockingProfiles,
  onUpdateProfile,
  onUpdateSettings,
  onUpdateBlockingProfiles,
  onResetAllData,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'blocker' | 'settings'>('profile');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(profile.name);

  // New blocked domain state
  const [newDomain, setNewDomain] = useState('');
  const [targetProfileId, setTargetProfileId] = useState(blockingProfiles[0]?.id || '');

  // Reset confirmation
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');

  // Mascots available
  const mascots: { id: MascotId; name: string; desc: string }[] = [
    { id: 'calico_cat', name: 'Calico Cat', desc: 'Sleepy, cozy, loves tea and afternoon coding.' },
    { id: 'cat', name: 'Tabby Cat', desc: 'Attentive companion with curious striped ears.' },
    { id: 'bunny', name: 'Lop-eared Bunny', desc: 'Gentle, quiet, loves reading library books.' },
    { id: 'turtle', name: 'Steady Turtle', desc: 'Patience personified. Slow and steady wins the race.' },
    { id: 'star', name: 'Star Buddy', desc: 'Radiates cheerful optimism and keeps you smiling.' },
    { id: 'bear', name: 'Mini Bear', desc: 'Warm, steadfast, and ready to tackle tough tasks.' },
  ];

  const handleSelectMascot = (id: MascotId) => {
    onUpdateProfile({ ...profile, selectedMascot: id });
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdateProfile({ ...profile, name: tempName.trim() });
      setIsEditingName(false);
    }
  };

  const handleAddBlockedDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    let clean = newDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const updated = blockingProfiles.map(p => {
      if (p.id === targetProfileId && !p.blockedSites.includes(clean)) {
        return { ...p, blockedSites: [...p.blockedSites, clean] };
      }
      return p;
    });

    onUpdateBlockingProfiles(updated);
    setNewDomain('');
  };

  const handleRemoveBlockedDomain = (profileId: string, domain: string) => {
    const updated = blockingProfiles.map(p => {
      if (p.id === profileId) {
        return { ...p, blockedSites: p.blockedSites.filter(d => d !== domain) };
      }
      return p;
    });
    onUpdateBlockingProfiles(updated);
  };

  // Export JSON
  const handleExportBackup = () => {
    const jsonStr = storage.exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focus_buddy_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const ok = storage.importDataJSON(reader.result as string);
        if (ok) {
          window.location.reload();
        } else {
          alert('Invalid backup file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleConfirmReset = () => {
    if (resetConfirmText.trim().toUpperCase() === 'RESET') {
      onResetAllData();
      setIsResetModalOpen(false);
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-12 select-none">
      {/* 1. Top Header Card */}
      <div className="bg-white border-2 border-[#2c221e] rounded-xl p-5 shadow-pixel-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#faeedf] border-2 border-[#2c221e] rounded-xl flex items-center justify-center shadow-xs">
            <PixelMascot id={profile.selectedMascot} state="idle" size={50} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={e => setTempName(e.target.value)}
                    className="px-2 py-1 border-2 border-[#2c221e] rounded text-sm font-bold"
                  />
                  <button
                    onClick={handleSaveName}
                    className="px-2.5 py-1 bg-[#488053] text-white text-xs font-bold rounded"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="font-bold text-xl text-[#2c221e]">{profile.name}</h1>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-xs text-[#847367] hover:underline font-semibold"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
            <p className="text-xs text-[#847367] mt-0.5 font-medium">
              Level {profile.level} Scholar • {profile.streak} Day Streak 🔥
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-[#fcfaf6] border border-[#2c221e] rounded-lg p-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-[#2c221e] text-white'
                : 'text-[#847367] hover:text-[#2c221e]'
            }`}
          >
            Companion
          </button>
          <button
            onClick={() => setActiveTab('blocker')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
              activeTab === 'blocker'
                ? 'bg-[#2c221e] text-white'
                : 'text-[#847367] hover:text-[#2c221e]'
            }`}
          >
            Distraction Shield
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-[#2c221e] text-white'
                : 'text-[#847367] hover:text-[#2c221e]'
            }`}
          >
            Settings & Data
          </button>
        </div>
      </div>

      {/* 2. TAB 1: COMPANION SELECTION */}
      {activeTab === 'profile' && (
        <div className="flex flex-col gap-4">
          <div className="bg-white border-2 border-[#2c221e] rounded-xl p-5 shadow-pixel-sm">
            <h3 className="font-bold text-sm text-[#2c221e] mb-1">
              Choose Your Focus Companion
            </h3>
            <p className="text-xs text-[#847367] mb-4">
              Your companion quietly studies beside you during sessions and shares encouraging words.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {mascots.map(m => {
                const isSelected = profile.selectedMascot === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => handleSelectMascot(m.id)}
                    className={`cursor-pointer p-3.5 rounded-xl border-2 transition-all flex flex-col items-center text-center ${
                      isSelected
                        ? 'bg-[#faeedf] border-[#2c221e] shadow-pixel-sm ring-1 ring-[#df793b]'
                        : 'bg-white border-[#ded3c5] hover:bg-[#fcfaf6]'
                    }`}
                  >
                    <div className="w-14 h-14 mb-2">
                      <PixelMascot id={m.id} state="idle" size={56} />
                    </div>
                    <h4 className="font-bold text-xs text-[#2c221e]">{m.name}</h4>
                    <p className="text-[11px] text-[#847367] mt-1 leading-snug">{m.desc}</p>
                    {isSelected && (
                      <span className="mt-2 text-[9px] font-pixel bg-[#488053] text-white px-2 py-0.5 rounded">
                        ACTIVE
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB 2: DISTRACTION SHIELD & PROFILES */}
      {activeTab === 'blocker' && (
        <div className="flex flex-col gap-5">
          <div className="bg-white border-2 border-[#2c221e] rounded-xl p-5 shadow-pixel-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-[#2c221e] flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#488053]" /> Distraction Blocker Architecture
                </h3>
                <p className="text-xs text-[#847367] mt-0.5">
                  Configure websites and categories hard-blocked during focus sessions.
                </p>
              </div>
              <span className="text-[10px] font-bold bg-[#e5f0e6] text-[#2f5937] border border-[#2c221e] px-2 py-0.5 rounded">
                Extension Bridge Ready
              </span>
            </div>

            {/* Add Website form */}
            <form onSubmit={handleAddBlockedDomain} className="flex gap-2 mb-5">
              <select
                value={targetProfileId}
                onChange={e => setTargetProfileId(e.target.value)}
                className="px-3 py-2 border-2 border-[#2c221e] rounded-lg text-xs font-bold"
              >
                {blockingProfiles.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Add website (e.g. reddit.com or youtube.com)"
                value={newDomain}
                onChange={e => setNewDomain(e.target.value)}
                className="flex-1 px-3 py-2 border-2 border-[#2c221e] rounded-lg text-xs font-semibold"
              />

              <button
                type="submit"
                className="px-4 py-2 pixel-btn-primary rounded-lg text-xs font-bold"
              >
                Add Block
              </button>
            </form>

            {/* Profiles list */}
            <div className="flex flex-col gap-4">
              {blockingProfiles.map(prof => (
                <div key={prof.id} className="p-3.5 bg-[#fcfaf6] border border-[#2c221e] rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{prof.icon}</span>
                      <h4 className="font-bold text-xs text-[#2c221e]">{prof.name}</h4>
                    </div>
                    <span className="text-[10px] text-[#847367] font-semibold">
                      {prof.blockedSites.length} websites blocked
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {prof.blockedSites.map(site => (
                      <span
                        key={site}
                        className="inline-flex items-center gap-1.5 bg-white border border-[#2c221e] text-[11px] font-bold px-2 py-0.5 rounded"
                      >
                        <span>{site}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBlockedDomain(prof.id, site)}
                          className="text-[#baa494] hover:text-[#d9534f]"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 3: SETTINGS & DATA EXPORT */}
      {activeTab === 'settings' && (
        <div className="flex flex-col gap-5">
          {/* Notification & Quiet hours */}
          <div className="bg-white border-2 border-[#2c221e] rounded-xl p-5 shadow-pixel-sm">
            <h3 className="font-bold text-sm text-[#2c221e] mb-3 flex items-center gap-2">
              <Moon className="w-4 h-4 text-[#845ec2]" /> Quiet Hours & DND
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#5c4a3f] mb-1">
                  Quiet Hours Start
                </label>
                <input
                  type="time"
                  value={settings.quietHoursStart}
                  onChange={e => onUpdateSettings({ ...settings, quietHoursStart: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-[#2c221e] rounded-lg text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#5c4a3f] mb-1">
                  Quiet Hours End
                </label>
                <input
                  type="time"
                  value={settings.quietHoursEnd}
                  onChange={e => onUpdateSettings({ ...settings, quietHoursEnd: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-[#2c221e] rounded-lg text-xs font-bold"
                />
              </div>
            </div>
          </div>

          {/* Backup & Import */}
          <div className="bg-white border-2 border-[#2c221e] rounded-xl p-5 shadow-pixel-sm">
            <h3 className="font-bold text-sm text-[#2c221e] mb-1">
              Data Management & Backup
            </h3>
            <p className="text-xs text-[#847367] mb-4">
              All your study history, vision board items, and store unlocks are private to you.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExportBackup}
                className="px-4 py-2 border-2 border-[#2c221e] rounded-lg text-xs font-bold bg-[#ffffff] hover:bg-[#faeedf] flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" /> Export JSON Backup
              </button>

              <label className="px-4 py-2 border-2 border-[#2c221e] rounded-lg text-xs font-bold bg-[#ffffff] hover:bg-[#faeedf] flex items-center gap-1.5 shadow-xs cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> Restore JSON Backup
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => setIsResetModalOpen(true)}
                className="px-4 py-2 pixel-btn-danger rounded-lg text-xs font-bold flex items-center gap-1.5 ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" /> Reset Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-3 border-[#2c221e] rounded-xl p-6 shadow-pixel max-w-sm w-full text-center">
            <div className="text-3xl mb-2">⚠️</div>
            <h3 className="font-pixel text-sm text-[#c9302c] mb-2">
              Reset All Progress?
            </h3>
            <p className="text-xs text-[#5c4a3f] mb-4 leading-relaxed">
              This will erase all your logged focus sessions, tasks, and return your streak and XP to seed state.
              This cannot be undone.
            </p>

            <div className="mb-4">
              <label className="block text-[11px] font-bold text-[#847367] mb-1">
                Type <span className="text-[#2c221e]">"RESET"</span> to confirm:
              </label>
              <input
                type="text"
                placeholder="RESET"
                value={resetConfirmText}
                onChange={e => setResetConfirmText(e.target.value)}
                className="w-full px-3 py-2 border-2 border-[#2c221e] rounded text-center text-sm font-bold focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 border-2 border-[#2c221e] rounded-lg text-xs font-bold hover:bg-[#f5eee3]"
              >
                Cancel
              </button>
              <button
                disabled={resetConfirmText.trim().toUpperCase() !== 'RESET'}
                onClick={handleConfirmReset}
                className="px-4 py-2 pixel-btn-danger rounded-lg text-xs font-bold disabled:opacity-40"
              >
                Erase & Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
