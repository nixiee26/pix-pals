import React, { useState } from 'react';
import { BarChart2, Clock, Flame, Award, AlertCircle, TrendingUp, CheckCircle, ShieldAlert } from 'lucide-react';
import { FocusSession, Subject, Achievement, Badge, UserProfile } from '../types';
import { PixelMascot } from '../components/mascot/PixelMascot';

interface ProgressViewProps {
  profile: UserProfile;
  sessions: FocusSession[];
  subjects: Subject[];
  achievements: Achievement[];
  badges: Badge[];
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  profile,
  sessions,
  subjects,
  achievements,
  badges,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'procrastination' | 'achievements'>('overview');

  // Total Focus Calculation
  const totalCompletedMinutes = sessions
    .filter(s => s.status === 'completed')
    .reduce((acc, s) => acc + s.actualMinutes, 0);
  const totalHours = (totalCompletedMinutes / 60).toFixed(1);

  const completedSessionsCount = sessions.filter(s => s.status === 'completed').length;
  const emergencyUnlockedCount = sessions.filter(s => s.status === 'emergency_unlocked').length;

  // Procrastination metrics
  const delayedSessions = sessions.filter(s => (s.procrastinationDelayMinutes || 0) > 0);
  const averageDelay =
    delayedSessions.length > 0
      ? Math.round(
          delayedSessions.reduce((acc, s) => acc + (s.procrastinationDelayMinutes || 0), 0) /
            delayedSessions.length
        )
      : 0;

  // Group delays by reason
  const delayReasonsMap: { [key: string]: number } = {};
  sessions.forEach(s => {
    if (s.delayReason) {
      delayReasonsMap[s.delayReason] = (delayReasonsMap[s.delayReason] || 0) + 1;
    }
  });

  // Calculate past 7 days focus activity
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const past7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    const dayName = daysOfWeek[d.getDay()];
    const dateStr = d.toISOString().split('T')[0];

    // Find sessions on this day
    const dayMins = sessions
      .filter(s => s.actualStartTime.startsWith(dateStr) && s.status === 'completed')
      .reduce((acc, s) => acc + s.actualMinutes, 0);

    return {
      day: dayName,
      date: dateStr,
      minutes: dayMins,
      hours: (dayMins / 60).toFixed(1),
    };
  });

  const maxDayMinutes = Math.max(60, ...past7DaysData.map(d => d.minutes));

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 pb-12 select-none">
      {/* 1. Top Header Banner with Mascot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-2 border-[#2c221e] rounded-xl p-4 shadow-pixel-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10">
            <PixelMascot id="star" state="celebrating" size={40} />
          </div>
          <div>
            <h1 className="font-pixel text-base text-[#2c221e]">Focus & Consistency Analytics</h1>
            <p className="text-xs text-[#847367] font-medium mt-0.5">
              Reflect on your study habits, reduce hesitation, and celebrate genuine discipline.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-[#fcfaf6] border border-[#2c221e] rounded-lg p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1 rounded text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-[#2c221e] text-white shadow-xs'
                : 'text-[#847367] hover:text-[#2c221e]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('procrastination')}
            className={`px-3 py-1 rounded text-xs font-bold transition-all ${
              activeTab === 'procrastination'
                ? 'bg-[#2c221e] text-white shadow-xs'
                : 'text-[#847367] hover:text-[#2c221e]'
            }`}
          >
            Anti-Procrastination
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-3 py-1 rounded text-xs font-bold transition-all ${
              activeTab === 'achievements'
                ? 'bg-[#2c221e] text-white shadow-xs'
                : 'text-[#847367] hover:text-[#2c221e]'
            }`}
          >
            Badges ({achievements.filter(a => a.isUnlocked).length})
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-[#2c221e] rounded-xl p-3.5 shadow-pixel-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#847367] mb-1">
            <Clock className="w-4 h-4 text-[#4a6fa5]" /> Total Focus Time
          </div>
          <div className="text-2xl font-bold text-[#2c221e]">{totalHours} <span className="text-sm font-semibold">hrs</span></div>
          <div className="text-[10px] text-[#488053] font-bold mt-1">Across all sessions</div>
        </div>

        <div className="bg-white border-2 border-[#2c221e] rounded-xl p-3.5 shadow-pixel-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#847367] mb-1">
            <Flame className="w-4 h-4 text-[#df793b]" /> Current Streak
          </div>
          <div className="text-2xl font-bold text-[#2c221e]">{profile.streak} <span className="text-sm font-semibold">days</span></div>
          <div className="text-[10px] text-[#847367] font-semibold mt-1">Longest: {profile.longestStreak} days</div>
        </div>

        <div className="bg-white border-2 border-[#2c221e] rounded-xl p-3.5 shadow-pixel-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#847367] mb-1">
            <CheckCircle className="w-4 h-4 text-[#488053]" /> Completed Sessions
          </div>
          <div className="text-2xl font-bold text-[#2c221e]">{completedSessionsCount}</div>
          <div className="text-[10px] text-[#847367] font-semibold mt-1">
            Interrupted: {emergencyUnlockedCount}
          </div>
        </div>

        <div className="bg-white border-2 border-[#2c221e] rounded-xl p-3.5 shadow-pixel-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#847367] mb-1">
            <AlertCircle className="w-4 h-4 text-[#e58043]" /> Average Start Delay
          </div>
          <div className="text-2xl font-bold text-[#2c221e]">{averageDelay} <span className="text-sm font-semibold">min</span></div>
          <div className="text-[10px] text-[#488053] font-bold mt-1">
            {averageDelay < 5 ? 'Excellent punctuality!' : 'Gentle nudges active'}
          </div>
        </div>
      </div>

      {/* 3. TAB 1: OVERVIEW CHARTS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 7-Day Focus Activity Chart (8 cols) */}
          <div className="lg:col-span-8 bg-white border-2 border-[#2c221e] rounded-xl p-5 shadow-pixel-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-sm text-[#2c221e] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#488053]" /> 7-Day Study Trend
              </h3>
              <span className="text-xs text-[#847367] font-semibold">Hours per day</span>
            </div>

            {/* Custom Pixel Bar Chart */}
            <div className="flex items-end justify-between gap-3 h-48 pt-6 pb-2 px-2 border-b-2 border-[#2c221e]">
              {past7DaysData.map(item => {
                const heightPercent = Math.max(8, Math.round((item.minutes / maxDayMinutes) * 100));
                return (
                  <div key={item.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[10px] font-bold text-[#847367]">
                      {item.minutes > 0 ? `${item.hours}h` : '-'}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[36px] bg-[#488053] hover:bg-[#3b6b44] border-2 border-[#2c221e] rounded-t-sm transition-all"
                    />
                    <span className="text-[11px] font-bold text-[#2c221e] mt-1">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Focus Distribution by Subject (4 cols) */}
          <div className="lg:col-span-4 bg-white border-2 border-[#2c221e] rounded-xl p-5 shadow-pixel-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#2c221e] mb-4">
                Subject Breakdown
              </h3>
              <div className="flex flex-col gap-3">
                {subjects.map(sub => {
                  const subjectMins = sessions
                    .filter(s => s.subjectId === sub.id && s.status === 'completed')
                    .reduce((acc, s) => acc + s.actualMinutes, 0);
                  const subHours = (subjectMins / 60).toFixed(1);
                  const percent = totalCompletedMinutes > 0 ? Math.round((subjectMins / totalCompletedMinutes) * 100) : 0;

                  return (
                    <div key={sub.id}>
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="flex items-center gap-1.5">
                          <span>{sub.icon}</span> {sub.name}
                        </span>
                        <span className="text-[#847367]">{subHours}h ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 bg-[#f0e6dc] rounded-full overflow-hidden border border-[#2c221e]">
                        <div
                          className="h-full"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: sub.color || '#488053',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-[#f0e6dc] text-center text-xs text-[#847367] font-semibold">
              Consistency is built through daily small steps 🐾
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: ANTI-PROCRASTINATION ANALYTICS */}
      {activeTab === 'procrastination' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border-2 border-[#2c221e] rounded-xl p-5 shadow-pixel-sm">
            <h3 className="font-bold text-sm text-[#2c221e] mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#df793b]" />
              Start Delay Analysis
            </h3>
            <p className="text-xs text-[#847367] mb-4">
              Focus Buddy records the difference between your planned schedule and the exact minute you entered focus mode.
            </p>

            <div className="flex flex-col gap-3">
              <div className="p-3 bg-[#faeedf] border border-[#2c221e] rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-[#2c221e]">Average Hesitation</div>
                  <div className="text-[11px] text-[#847367]">Minutes before clicking start</div>
                </div>
                <div className="font-pixel text-base text-[#df793b]">{averageDelay} min</div>
              </div>

              <div className="p-3 bg-[#e5f0e6] border border-[#2c221e] rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-[#2c221e]">Zero-Delay Sessions</div>
                  <div className="text-[11px] text-[#847367]">Started within 2 mins of plan</div>
                </div>
                <div className="font-pixel text-base text-[#488053]">
                  {sessions.filter(s => (s.procrastinationDelayMinutes || 0) <= 2).length}
                </div>
              </div>

              <div className="p-3 bg-[#fcfaf6] border border-[#2c221e] rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-[#2c221e]">Emergency Unlocks</div>
                  <div className="text-[11px] text-[#847367]">Sessions interrupted early</div>
                </div>
                <div className="font-pixel text-base text-[#c9302c]">{emergencyUnlockedCount}</div>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-[#2c221e] rounded-xl p-5 shadow-pixel-sm">
            <h3 className="font-bold text-sm text-[#2c221e] mb-2">
              Top Procrastination Triggers
            </h3>
            <p className="text-xs text-[#847367] mb-4">
              When hesitation occurs, identifying the underlying friction is the first step to overcoming it.
            </p>

            <div className="flex flex-col gap-2.5">
              {[
                { reason: 'Too tired', defaultTip: 'Try a shorter 10-minute light-focus session.' },
                { reason: "Don't know where to start", defaultTip: 'Write down the smallest first action.' },
                { reason: 'Distracted', defaultTip: 'Start Focus Mode and activate your blockers.' },
                { reason: 'Task feels difficult', defaultTip: 'Break it into a 10-minute starter task.' },
              ].map(item => {
                const count = delayReasonsMap[item.reason] || 0;
                return (
                  <div
                    key={item.reason}
                    className="p-3 bg-[#fcfaf6] border border-[#2c221e] rounded-lg flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#2c221e]">{item.reason}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-white border border-[#2c221e] rounded">
                        Reported {count}x
                      </span>
                    </div>
                    <div className="text-[11px] text-[#5c4a3f] italic font-medium">
                      "{item.defaultTip}"
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 3: ACHIEVEMENTS & BADGES */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map(ach => (
            <div
              key={ach.id}
              className={`p-4 rounded-xl border-2 border-[#2c221e] shadow-pixel-sm flex items-start gap-3.5 transition-all ${
                ach.isUnlocked ? 'bg-white' : 'bg-[#fcfaf6] opacity-60'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-lg border-2 border-[#2c221e] flex items-center justify-center text-2xl flex-shrink-0 ${
                  ach.isUnlocked ? 'bg-[#fcf3d9]' : 'bg-[#e8ded3]'
                }`}
              >
                {ach.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-xs text-[#2c221e] truncate">
                    {ach.title}
                  </h4>
                  {ach.isUnlocked && (
                    <span className="text-[9px] font-pixel bg-[#d9ead3] text-[#1e3d23] border border-[#2c221e] px-1.5 py-0.5 rounded">
                      UNLOCKED
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#847367] mt-0.5 leading-snug">
                  {ach.description}
                </p>

                <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-[#5c4a3f]">
                  <span>⭐ +{ach.xpReward} XP</span>
                  <span>🪙 +{ach.coinReward} Coins</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
