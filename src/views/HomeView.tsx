import React, { useState } from 'react';
import { Play, Plus, Target, CheckSquare, Calendar, BarChart2, ShoppingBag, ArrowRight } from 'lucide-react';
import { UserProfile, Subject, Task, FocusMode } from '../types';
import { PixelMascot } from '../components/mascot/PixelMascot';

interface HomeViewProps {
  profile: UserProfile;
  subjects: Subject[];
  tasks: Task[];
  onStartFocus: (mode: FocusMode, durationMinutes: number) => void;
  onNavigateTab: (tab: any) => void;
  onOpenAddTask: () => void;
  onUpdateGoal: (newGoalHours: number) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  profile,
  subjects,
  tasks,
  onStartFocus,
  onNavigateTab,
  onOpenAddTask,
  onUpdateGoal,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(45);
  const [selectedMode, setSelectedMode] = useState<FocusMode>('deep_work');
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [tempGoalHours, setTempGoalHours] = useState<number>(profile.todayGoalMinutes / 60);

  // Time & Weather formatting
  const todayDate = new Date();
  const dateStr = todayDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const weekdayStr = todayDate.toLocaleDateString('en-US', { weekday: 'short' });

  // Focus progress
  const completedHours = (profile.todayCompletedMinutes / 60).toFixed(1);
  const goalHours = (profile.todayGoalMinutes / 60).toFixed(0);
  const goalPercent = Math.min(100, Math.round((profile.todayCompletedMinutes / profile.todayGoalMinutes) * 100));

  const handleSelectPreset = (mode: FocusMode, minutes: number) => {
    setSelectedMode(mode);
    setSelectedDuration(minutes);
  };

  const handleSaveGoal = () => {
    onUpdateGoal(Math.max(0.5, tempGoalHours));
    setIsEditingGoal(false);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      {/* 1. Greeting Banner matching Reference 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#ffffff] border-2 border-[#2c221e] rounded-xl p-4 shadow-pixel-sm">
        <div>
          <h1 className="font-bold text-2xl text-[#2c221e] tracking-tight">
            Good Morning, {profile.name}!
          </h1>
          <p className="text-sm text-[#847367] flex items-center gap-1 font-medium mt-0.5">
            Small progress is still progress <span className="text-[#488053]">🌿</span>
          </p>
        </div>

        {/* Date & Weather Pill */}
        <div className="flex items-center gap-2 bg-[#fcfaf6] border border-[#2c221e] rounded-lg px-3 py-1.5 self-start sm:self-auto text-xs font-semibold text-[#5c4a3f]">
          <span className="text-lg">⛅</span>
          <div className="flex flex-col text-right">
            <span>{dateStr}</span>
            <span className="text-[11px] text-[#847367]">{weekdayStr} • 27°C</span>
          </div>
        </div>
      </div>

      {/* 2. Main Row: Ready to Focus Hero + Today's Goal & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Hero "Ready to Focus" pixel banner (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between relative rounded-xl border-2 border-[#2c221e] overflow-hidden shadow-pixel p-6 bg-gradient-to-b from-[#a4c2db] via-[#cfe0cf] to-[#e4eec4] min-h-[340px]">
          {/* Pixel Landscape Scenery Backdrop (Reference 1) */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            {/* Hills & Lake */}
            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#5a8755] to-transparent" />
            <div className="absolute bottom-16 right-4 text-3xl">🏔️</div>
            <div className="absolute bottom-6 left-6 text-3xl">🌲</div>
            <div className="absolute bottom-4 right-16 text-2xl">🌸</div>
          </div>

          {/* Card Content */}
          <div className="relative z-10 text-center">
            <h2 className="font-pixel text-lg md:text-xl text-[#2c221e] mb-1">
              Ready to Focus?
            </h2>
            <p className="text-xs md:text-sm text-[#544339] font-medium">
              Choose a session and let's go!
            </p>
          </div>

          {/* Duration Selector Pills */}
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 my-4">
            {/* 25 min Pomodoro */}
            <button
              onClick={() => handleSelectPreset('pomodoro', 25)}
              className={`px-4 py-2.5 rounded-lg border-2 border-[#2c221e] text-xs font-bold transition-all shadow-xs ${
                selectedMode === 'pomodoro' && selectedDuration === 25
                  ? 'bg-[#d9ead3] text-[#1e3d23] shadow-pixel-sm scale-105'
                  : 'bg-white text-[#2c221e] hover:bg-[#fbf7f0]'
              }`}
            >
              <div className="font-pixel text-[11px]">25 min</div>
              <div className="text-[10px] text-[#847367]">Focus</div>
            </button>

            {/* 45 min Deep Work (active by default in mock) */}
            <button
              onClick={() => handleSelectPreset('deep_work', 45)}
              className={`px-5 py-2.5 rounded-lg border-2 border-[#2c221e] text-xs font-bold transition-all shadow-xs ${
                selectedMode === 'deep_work' && selectedDuration === 45
                  ? 'bg-[#b6d7a8] text-[#1e3d23] shadow-pixel-sm scale-105'
                  : 'bg-white text-[#2c221e] hover:bg-[#fbf7f0]'
              }`}
            >
              <div className="font-pixel text-[11px]">45 min</div>
              <div className="text-[10px] text-[#345b37]">Deep Work</div>
            </button>

            {/* Custom Preset */}
            <button
              onClick={() => handleSelectPreset('custom', 60)}
              className={`px-4 py-2.5 rounded-lg border-2 border-[#2c221e] text-xs font-bold transition-all shadow-xs ${
                selectedMode === 'custom'
                  ? 'bg-[#fcf3d9] text-[#2c221e] shadow-pixel-sm scale-105'
                  : 'bg-white text-[#2c221e] hover:bg-[#fbf7f0]'
              }`}
            >
              <div className="font-pixel text-[11px]">Custom</div>
              <div className="text-[10px] text-[#847367]">⚙️ Options</div>
            </button>
          </div>

          {/* Primary CTA Button: START FOCUS */}
          <div className="relative z-10 flex flex-col items-center gap-3">
            <button
              onClick={() => onStartFocus(selectedMode, selectedDuration)}
              className="w-full max-w-xs flex items-center justify-center gap-2 py-3.5 px-6 pixel-btn-primary text-base font-pixel tracking-wide text-white uppercase"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Start Focus</span>
            </button>
            <p className="text-[11px] text-[#4f3e35] italic font-medium">
              "A focused mind can achieve anything" 🐾
            </p>
          </div>
        </div>

        {/* Right Column: Today's Goal & Quick Actions (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Today's Goal Card */}
          <div className="bg-[#ffffff] border-2 border-[#2c221e] rounded-xl p-4 shadow-pixel-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#df793b]" />
                <h3 className="font-bold text-sm text-[#2c221e]">Today's Goal</h3>
              </div>
              <button
                onClick={() => setIsEditingGoal(!isEditingGoal)}
                className="text-xs text-[#847367] hover:text-[#2c221e] underline font-semibold"
              >
                {isEditingGoal ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {isEditingGoal ? (
              <div className="flex items-center gap-2 my-2">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="12"
                  value={tempGoalHours}
                  onChange={(e) => setTempGoalHours(parseFloat(e.target.value) || 1)}
                  className="w-20 px-2 py-1 border-2 border-[#2c221e] rounded text-sm font-bold"
                />
                <span className="text-xs font-semibold">hours</span>
                <button
                  onClick={handleSaveGoal}
                  className="px-3 py-1 bg-[#488053] text-white rounded text-xs font-bold hover:bg-[#3b6b44]"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="text-xs text-[#5c4a3f] mb-2 font-medium">
                Focus for <span className="font-bold text-[#2c221e] text-sm">{goalHours} hours</span>
              </div>
            )}

            {/* Progress bar */}
            <div className="w-full h-3 bg-[#f0e6dc] border border-[#2c221e] rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-[#488053] transition-all duration-500 rounded-full"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
            <div className="text-right text-[11px] font-bold text-[#847367]">
              {completedHours} / {goalHours} hrs
            </div>

            {/* Mascot Cheer Bubble */}
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#f2e7db]">
              <div className="w-9 h-9 flex-shrink-0">
                <PixelMascot id="bear" size={36} />
              </div>
              <div className="relative bg-[#faeedf] border border-[#2c221e] rounded-md px-3 py-1.5 text-xs font-bold text-[#634832] shadow-xs">
                You've got this! ❤️
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-[#ffffff] border-2 border-[#2c221e] rounded-xl p-4 shadow-pixel-sm">
            <h3 className="font-bold text-sm text-[#2c221e] mb-3 flex items-center gap-1.5">
              <span>⚡</span> Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onOpenAddTask}
                className="flex items-center gap-2 p-2.5 bg-[#fcfaf6] border border-[#2c221e] rounded-lg text-xs font-bold hover:bg-[#faeedf] transition-all shadow-xs text-left"
              >
                <Plus className="w-4 h-4 text-[#488053]" />
                <span>Add Task</span>
              </button>

              <button
                onClick={() => onNavigateTab('planner')}
                className="flex items-center gap-2 p-2.5 bg-[#fcfaf6] border border-[#2c221e] rounded-lg text-xs font-bold hover:bg-[#faeedf] transition-all shadow-xs text-left"
              >
                <Calendar className="w-4 h-4 text-[#4a6fa5]" />
                <span>Plan for Today</span>
              </button>

              <button
                onClick={() => onNavigateTab('progress')}
                className="flex items-center gap-2 p-2.5 bg-[#fcfaf6] border border-[#2c221e] rounded-lg text-xs font-bold hover:bg-[#faeedf] transition-all shadow-xs text-left"
              >
                <BarChart2 className="w-4 h-4 text-[#df793b]" />
                <span>View Progress</span>
              </button>

              <button
                onClick={() => onNavigateTab('store')}
                className="flex items-center gap-2 p-2.5 bg-[#fcfaf6] border border-[#2c221e] rounded-lg text-xs font-bold hover:bg-[#faeedf] transition-all shadow-xs text-left"
              >
                <ShoppingBag className="w-4 h-4 text-[#845ec2]" />
                <span>Open Store</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. My Subjects Row (Matching Reference 1) */}
      <div className="bg-[#ffffff] border-2 border-[#2c221e] rounded-xl p-4 shadow-pixel-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📖</span>
            <h3 className="font-bold text-base text-[#2c221e]">My Subjects</h3>
          </div>
          <button
            onClick={() => onNavigateTab('planner')}
            className="flex items-center gap-1 text-xs font-bold text-[#488053] hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {subjects.map((sub) => {
            const subjectTasks = tasks.filter((t) => t.subjectId === sub.id);
            const activeCount = subjectTasks.filter((t) => !t.completed).length;

            return (
              <div
                key={sub.id}
                onClick={() => onNavigateTab('planner')}
                className="cursor-pointer bg-[#fbf8f2] border border-[#2c221e] rounded-lg p-3 hover:bg-[#f5eee3] transition-all shadow-xs"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 bg-white border border-[#2c221e] rounded flex items-center justify-center text-sm shadow-xs">
                    {sub.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#2c221e] leading-tight">
                      {sub.name}
                    </h4>
                    <p className="text-[10px] text-[#847367]">
                      {activeCount} {activeCount === 1 ? 'task' : 'tasks'}
                    </p>
                  </div>
                </div>
                {/* Micro progress bar */}
                <div className="w-full h-1.5 bg-[#e8ded3] rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-[#488053]"
                    style={{
                      width: `${
                        subjectTasks.length > 0
                          ? Math.round(
                              ((subjectTasks.length - activeCount) /
                                subjectTasks.length) *
                                100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Bottom Cards: Motivation, Today's Tip, and Unlock More */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Motivation Card */}
        <div className="bg-[#ffffff] border-2 border-[#2c221e] rounded-xl p-4 shadow-pixel-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#df793b] mb-2">
              <span>❤️</span> Motivation
            </div>
            <p className="text-xs text-[#4a3b32] font-semibold italic leading-relaxed">
              "Discipline today creates the life you dream about tomorrow."
            </p>
          </div>
          <div className="self-end text-2xl mt-3">🪴</div>
        </div>

        {/* Today's Tip Card */}
        <div className="bg-[#ffffff] border-2 border-[#2c221e] rounded-xl p-4 shadow-pixel-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#e59d23] mb-2">
              <span>💡</span> Today's Tip
            </div>
            <p className="text-xs text-[#4a3b32] font-semibold leading-relaxed">
              It's not about being perfect, it's about being consistent.
            </p>
          </div>
          <div className="self-end text-2xl mt-3">🌱</div>
        </div>

        {/* Unlock More Promo Card */}
        <div
          onClick={() => onNavigateTab('store')}
          className="cursor-pointer bg-[#fffaf0] border-2 border-[#2c221e] rounded-xl p-4 shadow-pixel-sm flex flex-col justify-between hover:bg-[#faeedf] transition-all"
        >
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2c221e] mb-1">
              <span>🪙</span> Unlock More
            </div>
            <p className="text-[11px] text-[#847367] font-medium">
              Spend coins to get cute themes, sounds, and more!
            </p>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#f0e4d7]">
            <div className="flex items-center gap-2 text-lg">
              <span>🐱</span>
              <span>🪴</span>
              <span>🌌</span>
              <span>🌸</span>
            </div>
            <span className="w-6 h-6 bg-[#2c221e] text-white rounded flex items-center justify-center text-xs font-bold">
              →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
