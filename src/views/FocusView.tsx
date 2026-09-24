import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, AlertTriangle, Volume2, VolumeX, Eye, EyeOff, Sparkles, CheckCircle, ArrowLeft, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  FocusMode,
  FocusPhase,
  FocusSession,
  Subject,
  Task,
  VisionBoardItem,
  BlockingProfile,
  UserProfile,
  UserSettings,
} from '../types';
import { PixelMascot } from '../components/mascot/PixelMascot';
import { audioEngine } from '../services/audioEngine';
import { blockingService } from '../services/blockingService';
import { GamificationService, RewardResult } from '../services/gamification';

interface FocusViewProps {
  profile: UserProfile;
  settings: UserSettings;
  subjects: Subject[];
  tasks: Task[];
  blockingProfiles: BlockingProfile[];
  visionItems: VisionBoardItem[];
  preSelectedTask?: Task | null;
  initialMode?: FocusMode;
  initialDuration?: number;
  onSessionFinished: (session: FocusSession, rewards: RewardResult | null) => void;
  onExit: () => void;
}

export const FocusView: React.FC<FocusViewProps> = ({
  profile,
  settings,
  subjects,
  tasks,
  blockingProfiles,
  visionItems,
  preSelectedTask,
  initialMode = 'deep_work',
  initialDuration = 45,
  onSessionFinished,
  onExit,
}) => {
  // Flow States: 'setup' -> 'active' -> 'completed'
  const [flowState, setFlowState] = useState<'setup' | 'active' | 'completed'>('setup');

  // Setup form states
  const [goalText, setGoalText] = useState(preSelectedTask?.title || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState(preSelectedTask?.subjectId || subjects[0]?.id || '');
  const [selectedTaskId, setSelectedTaskId] = useState(preSelectedTask?.id || '');
  const [mode, setMode] = useState<FocusMode>(initialMode);
  const [durationMinutes, setDurationMinutes] = useState<number>(initialDuration);
  const [selectedBlockingProfileId, setSelectedBlockingProfileId] = useState<string>(
    settings.activeBlockingProfileId || blockingProfiles[0]?.id || ''
  );

  // Anti-procrastination check state
  const [procrastinationNudge, setProcrastinationNudge] = useState<{
    delayMinutes: number;
    delayReason?: string;
    advice?: string;
  } | null>(null);

  // Timer & Session runtime state
  const [phase, setPhase] = useState<FocusPhase>('focus');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(initialDuration * 60);
  const [totalSeconds, setTotalSeconds] = useState<number>(initialDuration * 60);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [interruptionsCount, setInterruptionsCount] = useState<number>(0);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isStopConfirmOpen, setIsStopConfirmOpen] = useState<boolean>(false);
  const [emergencyConfirmText, setEmergencyConfirmText] = useState<string>('');
  const [emergencyPenalty, setEmergencyPenalty] = useState<{ xpLost: number; coinsLost: number } | null>(null);

  // Vision Board reminder & Audio
  const [showVisionReminder, setShowVisionReminder] = useState<boolean>(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [audioVolume, setAudioVolume] = useState<number>(settings.ambientVolume || 0.5);
  const [selectedSound, setSelectedSound] = useState<string>(settings.selectedAmbientSound || 'rain');

  // Completion modal state
  const [focusRating, setFocusRating] = useState<number>(5);
  const [reflectionNote, setReflectionNote] = useState<string>('');
  const [completionRewards, setCompletionRewards] = useState<RewardResult | null>(null);

  // Time reference tracking (resilient against tab freezes)
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(Date.now());
  const pausedTimeRef = useRef<number | null>(null);
  const totalPausedMsRef = useRef<number>(0);

  // Pinned vision item
  const pinnedGoal = visionItems.find(v => v.isPinnedToFocus) || visionItems[0];

  // Check procrastination on setup
  useEffect(() => {
    if (preSelectedTask?.plannedStartTime) {
      const planned = new Date(preSelectedTask.plannedStartTime).getTime();
      const now = Date.now();
      const delayMinutes = Math.round((now - planned) / 60000);
      if (delayMinutes > 5) {
        setProcrastinationNudge({ delayMinutes });
      }
    }
  }, [preSelectedTask]);

  // Timer Tick Engine
  useEffect(() => {
    if (flowState !== 'active' || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSessionNaturallyCompleted();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [flowState, isPaused]);

  // Start Focus Session
  const handleStartSession = async () => {
    const totalSecs = durationMinutes * 60;
    setTotalSeconds(totalSecs);
    setRemainingSeconds(totalSecs);
    startTimeRef.current = Date.now();
    totalPausedMsRef.current = 0;
    setFlowState('active');

    // Activate Distraction Blocker
    const profileToUse = blockingProfiles.find(p => p.id === selectedBlockingProfileId) || blockingProfiles[0];
    await blockingService.startBlocking(profileToUse, `sess_${Date.now()}`);

    // Auto-start ambient soundscape
    audioEngine.playSound(selectedSound);
    audioEngine.setVolume(audioVolume);
    setIsAudioPlaying(true);
  };

  const handleTogglePause = () => {
    if (isPaused) {
      // Resuming
      setIsPaused(false);
      audioEngine.setVolume(audioVolume);
    } else {
      // Pausing
      setIsPaused(true);
      setInterruptionsCount(prev => prev + 1);
      audioEngine.setVolume(audioVolume * 0.2); // lower volume while paused
    }
  };

  const handleToggleAudio = () => {
    if (isAudioPlaying) {
      audioEngine.stopSound();
      setIsAudioPlaying(false);
    } else {
      audioEngine.playSound(selectedSound);
      audioEngine.setVolume(audioVolume);
      setIsAudioPlaying(true);
    }
  };

  const handleChangeSound = (newSound: string) => {
    setSelectedSound(newSound);
    if (isAudioPlaying) {
      audioEngine.playSound(newSound);
    }
  };
  // Stop session early
const handleStopSession = async () => {
  await blockingService.stopBlocking();
  audioEngine.stopSound();

  if (timerRef.current) {
    clearInterval(timerRef.current);
  }

  const elapsedSeconds = totalSeconds - remainingSeconds;
  const actualMins = Math.floor(elapsedSeconds / 60);

  const interruptedSession: FocusSession = {
    id: `sess_${Date.now()}`,
    taskId: selectedTaskId || undefined,
    subjectId: selectedSubjectId || undefined,
    goalTitle: goalText || 'Interrupted Focus',
    mode,
    durationMinutes,
    actualMinutes: actualMins,
    status: 'interrupted',
    rewardGranted: false,
    actualStartTime: new Date(startTimeRef.current).toISOString(),
    endTime: new Date().toISOString(),
    procrastinationDelayMinutes: procrastinationNudge?.delayMinutes || 0,
    interruptionsCount: interruptionsCount + 1,
    xpEarned: 0,
    coinsEarned: 0,
    blockingProfileUsed: blockingProfiles.find(
      p => p.id === selectedBlockingProfileId
    )?.name,
  };

  onSessionFinished(interruptedSession, null);
};
  // Natural completion
  const handleSessionNaturallyCompleted = async () => {
    await blockingService.stopBlocking();
    audioEngine.stopSound();

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ffd152', '#488053', '#df793b', '#4a6fa5'],
      });
    } catch (e) {
      // Ignored
    }

    // Calculate initial rewards
    const rewards = GamificationService.awardSessionRewards(durationMinutes, focusRating);
    setCompletionRewards(rewards);
    setFlowState('completed');
  };

  // Submit Reflection and finalize
  const handleSubmitReflection = () => {
    const finishedSession: FocusSession = {
      id: `sess_${Date.now()}`,
      taskId: selectedTaskId || undefined,
      subjectId: selectedSubjectId || undefined,
      goalTitle: goalText || 'Deep Focus Session',
      mode,
      durationMinutes,
      actualMinutes: durationMinutes,
      status: 'completed',
      rewardGranted: true,
      actualStartTime: new Date(startTimeRef.current).toISOString(),
      endTime: new Date().toISOString(),
      procrastinationDelayMinutes: procrastinationNudge?.delayMinutes || 0,
      delayReason: procrastinationNudge?.delayReason,
      interruptionsCount,
      focusRating,
      reflectionNote,
      xpEarned: completionRewards?.xpEarned || durationMinutes,
      coinsEarned: completionRewards?.coinsEarned || Math.floor(durationMinutes / 3),
      blockingProfileUsed: blockingProfiles.find(p => p.id === selectedBlockingProfileId)?.name,
    };

    onSessionFinished(finishedSession, completionRewards);
  };

  // Emergency Unlock Flow
  const handleEmergencyUnlock = async () => {
    if (emergencyConfirmText.trim().toLowerCase() !== 'unlock') return;

    await blockingService.stopBlocking();
    audioEngine.stopSound();

    const penalty = GamificationService.applyEmergencyPenalty();
    setEmergencyPenalty(penalty);
    setIsEmergencyModalOpen(false);

    const actualMins = Math.max(1, Math.round((totalSeconds - remainingSeconds) / 60));
    const interruptedSession: FocusSession = {
      id: `sess_${Date.now()}`,
      taskId: selectedTaskId || undefined,
      subjectId: selectedSubjectId || undefined,
      goalTitle: goalText || 'Interrupted Focus',
      mode,
      durationMinutes,
      actualMinutes: actualMins,
      status: 'emergency_unlocked',
      rewardGranted: false,
      actualStartTime: new Date(startTimeRef.current).toISOString(),
      endTime: new Date().toISOString(),
      procrastinationDelayMinutes: procrastinationNudge?.delayMinutes || 0,
      interruptionsCount: interruptionsCount + 1,
      xpEarned: 0,
      coinsEarned: 0,
    };

    onSessionFinished(interruptedSession, null);
  };

  // Helper friction busters
  const handleSelectFrictionReason = (reason: string, tip: string) => {
    setProcrastinationNudge(prev => ({
      delayMinutes: prev?.delayMinutes || 10,
      delayReason: reason,
      advice: tip,
    }));
  };

  // Formatter for MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(
    100,
    Math.round(((totalSeconds - remainingSeconds) / totalSeconds) * 100)
  );

  // ----------------------------------------------------
  // 1. SETUP FLOW: "What are you working on?"
  // ----------------------------------------------------
  if (flowState === 'setup') {
    return (
      <div className="max-w-2xl mx-auto pb-12">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-bold text-[#847367] hover:text-[#2c221e] mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="bg-white border-2 border-[#2c221e] rounded-xl p-6 shadow-pixel">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#f0e6dc]">
            <div className="w-10 h-10">
              <PixelMascot id={profile.selectedMascot} state="studying" size={40} />
            </div>
            <div>
              <h2 className="font-pixel text-base text-[#2c221e]">Start Focus Session</h2>
              <p className="text-xs text-[#847367] font-medium">
                Choose your focus target, duration, and distraction profile.
              </p>
            </div>
          </div>

          {/* Anti-procrastination banner if late */}
          {procrastinationNudge && (
            <div className="mb-5 bg-[#faeedf] border-2 border-[#df793b] rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#df793b] mb-1">
                <span>⚡</span>
                <span>You planned to focus {procrastinationNudge.delayMinutes} minutes ago</span>
              </div>
              <p className="text-xs text-[#5c4a3f] mb-3">
                Delay happens to everyone. What feels in the way right now?
              </p>

              <div className="flex flex-wrap gap-2">
                {[
                  { reason: 'Too tired', tip: 'Try a shorter 10-minute light-focus session.' },
                  { reason: "Don't know where to start", tip: 'Write down the smallest first action.' },
                  { reason: 'Distracted', tip: 'Start Focus Mode and activate your blockers now.' },
                  { reason: 'Task feels difficult', tip: 'Break it into a 10-minute starter task.' },
                ].map(item => (
                  <button
                    key={item.reason}
                    type="button"
                    onClick={() => handleSelectFrictionReason(item.reason, item.tip)}
                    className="px-2.5 py-1 bg-white border border-[#2c221e] rounded text-xs font-bold hover:bg-[#fcf3d9] transition-all"
                  >
                    {item.reason}
                  </button>
                ))}
              </div>

              {procrastinationNudge.advice && (
                <div className="mt-3 p-2 bg-white rounded border border-[#df793b] text-xs font-semibold text-[#8c4e23]">
                  💡 <strong>Tip:</strong> {procrastinationNudge.advice}
                </div>
              )}
            </div>
          )}

          {/* Form */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-[#5c4a3f] mb-1">
                What are you working on? *
              </label>
              <input
                type="text"
                placeholder="e.g. Solve recursive backtracking problems"
                value={goalText}
                onChange={e => setGoalText(e.target.value)}
                className="w-full px-3.5 py-2.5 border-2 border-[#2c221e] rounded-lg text-sm font-semibold focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#5c4a3f] mb-1">
                  Subject
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={e => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#2c221e] rounded-lg text-xs font-bold"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.icon} {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5c4a3f] mb-1">
                  Attach Planner Task (Optional)
                </label>
                <select
                  value={selectedTaskId}
                  onChange={e => {
                    setSelectedTaskId(e.target.value);
                    const t = tasks.find(item => item.id === e.target.value);
                    if (t) setGoalText(t.title);
                  }}
                  className="w-full px-3 py-2 border-2 border-[#2c221e] rounded-lg text-xs font-bold"
                >
                  <option value="">None (Free Focus)</option>
                  {tasks
                    .filter(t => !t.completed)
                    .map(t => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Mode & Duration */}
            <div>
              <label className="block text-xs font-bold text-[#5c4a3f] mb-1.5">
                Session Mode & Duration
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('pomodoro');
                    setDurationMinutes(25);
                  }}
                  className={`p-2.5 rounded-lg border-2 text-center transition-all ${
                    mode === 'pomodoro'
                      ? 'bg-[#d9ead3] border-[#2c221e] font-bold shadow-pixel-sm'
                      : 'bg-white border-[#ded3c5] hover:bg-[#fcfaf6]'
                  }`}
                >
                  <div className="text-xs font-bold">25 min</div>
                  <div className="text-[10px] text-[#847367]">Pomodoro</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('deep_work');
                    setDurationMinutes(45);
                  }}
                  className={`p-2.5 rounded-lg border-2 text-center transition-all ${
                    mode === 'deep_work' && durationMinutes === 45
                      ? 'bg-[#d9ead3] border-[#2c221e] font-bold shadow-pixel-sm'
                      : 'bg-white border-[#ded3c5] hover:bg-[#fcfaf6]'
                  }`}
                >
                  <div className="text-xs font-bold">45 min</div>
                  <div className="text-[10px] text-[#847367]">Deep Work</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('deep_work');
                    setDurationMinutes(60);
                  }}
                  className={`p-2.5 rounded-lg border-2 text-center transition-all ${
                    mode === 'deep_work' && durationMinutes === 60
                      ? 'bg-[#d9ead3] border-[#2c221e] font-bold shadow-pixel-sm'
                      : 'bg-white border-[#ded3c5] hover:bg-[#fcfaf6]'
                  }`}
                >
                  <div className="text-xs font-bold">60 min</div>
                  <div className="text-[10px] text-[#847367]">Long Block</div>
                </button>
              </div>
            </div>

            {/* Distraction Blocker Profile */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#5c4a3f] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#488053]" />
                  Distraction Blocker Profile (Hard Lock)
                </label>
                <span className="text-[10px] font-bold text-[#df793b]">
                  🔒 Locked during session
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {blockingProfiles.map(prof => (
                  <button
                    key={prof.id}
                    type="button"
                    onClick={() => setSelectedBlockingProfileId(prof.id)}
                    className={`p-2.5 rounded-lg border-2 text-left flex items-start gap-2 transition-all ${
                      selectedBlockingProfileId === prof.id
                        ? 'bg-[#fcf3d9] border-[#2c221e] shadow-pixel-sm font-bold'
                        : 'bg-white border-[#ded3c5] hover:bg-[#fcfaf6]'
                    }`}
                  >
                    <span className="text-base">{prof.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs text-[#2c221e] leading-tight">
                        {prof.name}
                      </div>
                      <div className="text-[9px] text-[#847367] truncate mt-0.5">
                        Blocks {prof.blockedSites.length} websites
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Ambient Sound Selection */}
            <div>
              <label className="block text-xs font-bold text-[#5c4a3f] mb-1.5">
                Ambient Soundscape
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'rain', label: '🌧️ Rain' },
                  { id: 'fireplace', label: '🔥 Hearth' },
                  { id: 'ocean', label: '🌊 Ocean' },
                  { id: 'forest', label: '🍃 Forest' },
                  { id: 'brown_noise', label: '📻 Brown Noise' },
                ].map(snd => (
                  <button
                    key={snd.id}
                    type="button"
                    onClick={() => setSelectedSound(snd.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      selectedSound === snd.id
                        ? 'bg-[#2c221e] text-white border-[#2c221e]'
                        : 'bg-white text-[#5c4a3f] border-[#ded3c5] hover:bg-[#faeedf]'
                    }`}
                  >
                    {snd.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartSession}
              disabled={!goalText.trim()}
              className="mt-4 w-full py-3.5 pixel-btn-primary rounded-xl text-sm font-pixel text-white flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Enter Focus Room</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. ACTIVE FOCUS ROOM (Extremely clean & minimal)
  // ----------------------------------------------------
  if (flowState === 'active') {
    return (
      <div className="relative min-h-[540px] flex flex-col items-center justify-between p-6 max-w-4xl mx-auto bg-[#ffffff] border-3 border-[#2c221e] rounded-2xl shadow-pixel select-none">
        {/* Top Minimal Bar */}
        <div className="w-full flex items-center justify-between border-b border-[#f0e6dc] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#488053] animate-pulse" />
            <span className="font-pixel text-[11px] text-[#2c221e] uppercase">
              {phase === 'focus' ? 'Deep Work In Progress' : 'Short Break'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Vision Board subtle toggle */}
            <button
              onClick={() => setShowVisionReminder(!showVisionReminder)}
              className="flex items-center gap-1 text-xs text-[#847367] hover:text-[#2c221e] font-semibold"
            >
              {showVisionReminder ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span className="hidden sm:inline">Vision</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={handleToggleAudio}
              className={`p-1.5 rounded border border-[#2c221e] ${
                isAudioPlaying ? 'bg-[#d9ead3] text-[#1e3d23]' : 'bg-white text-[#847367]'
              }`}
              title="Toggle Ambient Audio"
            >
              {isAudioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Distraction Blocker Shield Badge */}
            <div className="flex items-center gap-1 bg-[#fcf3d9] border border-[#2c221e] px-2 py-0.5 rounded text-[10px] font-bold text-[#6b4e28]">
              <Shield className="w-3 h-3 text-[#df793b]" />
              <span>Blocker Active</span>
            </div>
          </div>
        </div>

        {/* Center: Quiet Studying Companion + Massive Digital Retro Timer */}
        <div className="flex flex-col items-center my-6 gap-4 text-center">
          {/* Companion quietly studying at desk */}
          <div className="w-16 h-16 transition-transform hover:scale-105">
            <PixelMascot id={profile.selectedMascot} state="studying" size={64} />
          </div>

          {/* Goal Label */}
          <div className="px-4 py-1.5 bg-[#fbf8f2] border-2 border-[#2c221e] rounded-lg max-w-lg">
            <h3 className="font-bold text-sm text-[#2c221e] truncate">
              {goalText || 'Focused Deep Work'}
            </h3>
          </div>

          {/* Retro Pixel Countdown Display */}
          <div className="font-pixel text-5xl md:text-7xl tracking-wider text-[#2c221e] py-3 px-6 bg-[#faeedf] border-3 border-[#2c221e] rounded-xl shadow-pixel-sm">
            {formatTime(remainingSeconds)}
          </div>

          {/* Progress Bar */}
          <div className="w-64 md:w-80 h-3 bg-[#e8ded3] border border-[#2c221e] rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-[#488053] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Subtle Vision Board Reminder */}
        {showVisionReminder && pinnedGoal && (
          <div className="my-2 p-3 bg-[#fffaf0] border border-[#2c221e] rounded-lg max-w-md text-center shadow-xs">
            <div className="text-[10px] font-pixel text-[#df793b] uppercase mb-0.5">
              Remember Why You're Doing This
            </div>
            <p className="text-xs font-bold text-[#3d2e26] italic">
              "{pinnedGoal.content || pinnedGoal.title}"
            </p>
          </div>
        )}

        {/* Bottom Minimal Controls Bar */}
        <div className="w-full flex items-center justify-between pt-4 border-t border-[#f0e6dc]">
          {/* Emergency Unlock */}
          <button
            onClick={() => setIsEmergencyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#c9302c] hover:bg-[#fbeae7] rounded-lg border border-transparent hover:border-[#c9302c] transition-all"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Emergency Unlock</span>
          </button>

          {/* Pause / Resume */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePause}
              className="px-5 py-2.5 pixel-btn-secondary text-xs font-bold rounded-lg flex items-center gap-2"
            >
              {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            {/* Stop Session */}
            <button
              onClick={() => setIsStopConfirmOpen(true)}
              className="px-3 py-2 bg-[#e5f0e6] text-[#2f5937] hover:bg-[#d9ead3] rounded-lg text-xs font-bold border border-[#2c221e]"
              title="Stop session early"
            >
             <span>Stop Session</span>
            </button>
          </div>
        </div>
        {/* Stop Session Confirmation Modal */}
{isStopConfirmOpen && (
  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
    <div className="bg-white border-3 border-[#2c221e] rounded-xl p-6 shadow-pixel max-w-sm w-full text-center">
      
      <div className="text-3xl mb-2">🛑</div>

      <h3 className="font-pixel text-sm text-[#c9302c] mb-2">
        Stop Focus Session?
      </h3>

      <p className="text-xs text-[#5c4a3f] mb-4 leading-relaxed">
        You're ending this focus session early.
        <br />
        <span className="font-bold">
          ⭐ 0 XP &nbsp; • &nbsp; 🪙 0 Coins
        </span>
        <br />
        Your streak will <strong>NOT</strong> be broken.
      </p>

      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setIsStopConfirmOpen(false)}
          className="px-4 py-2 border-2 border-[#2c221e] rounded-lg text-xs font-bold hover:bg-[#f5eee3]"
        >
          Keep Focusing
        </button>

        <button
          onClick={handleStopSession}
          className="px-4 py-2 bg-[#c9302c] text-white rounded-lg text-xs font-bold hover:bg-[#a92320]"
        >
          Stop Session
        </button>
      </div>

    </div>
  </div>
)}

        {/* Emergency Unlock Modal */}
        {isEmergencyModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border-3 border-[#2c221e] rounded-xl p-6 shadow-pixel max-w-sm w-full text-center">
              <div className="w-10 h-10 mx-auto text-2xl mb-2">🛑</div>
              <h3 className="font-pixel text-sm text-[#c9302c] mb-2">
                Emergency Unlock
              </h3>
              <p className="text-xs text-[#5c4a3f] mb-4 leading-relaxed">
                Emergency unlock will release all website blockers and interrupt your session.
                <br />
                <span className="font-bold text-[#df793b]">
                  Penalty: -15 XP and -10 Coins.
                </span>
                <br />
                Your daily streak will <strong>NOT</strong> be broken.
              </p>

              <div className="mb-4">
                <label className="block text-[11px] font-bold text-[#847367] mb-1">
                  Type <span className="text-[#2c221e]">"unlock"</span> to confirm:
                </label>
                <input
                  type="text"
                  placeholder="unlock"
                  value={emergencyConfirmText}
                  onChange={e => setEmergencyConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#2c221e] rounded text-center text-sm font-bold focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setIsEmergencyModalOpen(false)}
                  className="px-4 py-2 border-2 border-[#2c221e] rounded-lg text-xs font-bold hover:bg-[#f5eee3]"
                >
                  Stay Focused
                </button>
                <button
                  disabled={emergencyConfirmText.trim().toLowerCase() !== 'unlock'}
                  onClick={handleEmergencyUnlock}
                  className="px-4 py-2 pixel-btn-danger rounded-lg text-xs font-bold disabled:opacity-40"
                >
                  Confirm Unlock
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // 3. SESSION COMPLETED FLOW (Celebration & Reflection)
  // ----------------------------------------------------
  return (
    <div className="max-w-md mx-auto bg-white border-3 border-[#2c221e] rounded-xl p-6 shadow-pixel text-center select-none pb-8">
      {/* Happy Companion Mascot Jumping */}
      <div className="w-16 h-16 mx-auto mb-2">
        <PixelMascot id={profile.selectedMascot} state="celebrating" size={64} />
      </div>

      <div className="inline-block bg-[#d9ead3] text-[#1e3d23] border border-[#2c221e] px-3 py-1 rounded-md text-xs font-bold mb-2">
        🎉 Focus Session Complete!
      </div>

      <h2 className="font-pixel text-lg text-[#2c221e] mb-1">
        Awesome Work!
      </h2>
      <p className="text-xs text-[#847367] font-medium mb-4">
        {durationMinutes} minutes dedicated to: <strong>{goalText}</strong>
      </p>

      {/* Rewards Grid */}
      <div className="grid grid-cols-2 gap-3 bg-[#fcfaf6] border-2 border-[#2c221e] rounded-xl p-3 mb-5">
        <div className="flex items-center justify-center gap-2 bg-white border border-[#2c221e] rounded-lg py-2">
          <span className="text-base">⭐</span>
          <span className="font-pixel text-xs text-[#2c221e]">
            +{completionRewards?.xpEarned || durationMinutes} XP
          </span>
        </div>
        <div className="flex items-center justify-center gap-2 bg-white border border-[#2c221e] rounded-lg py-2">
          <span className="text-base">🪙</span>
          <span className="font-pixel text-xs text-[#2c221e]">
            +{completionRewards?.coinsEarned || Math.floor(durationMinutes / 3)} Coins
          </span>
        </div>
      </div>

      {/* Quick 1 to 5 Focus Reflection */}
      <div className="mb-5 text-left bg-[#faeedf] border border-[#2c221e] rounded-xl p-3">
        <label className="block text-xs font-bold text-[#5c4a3f] mb-2 text-center">
          How focused were you?
        </label>
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map(rating => (
            <button
              key={rating}
              onClick={() => setFocusRating(rating)}
              className={`w-9 h-9 rounded-lg border-2 font-bold text-sm transition-all ${
                focusRating === rating
                  ? 'bg-[#488053] text-white border-[#2c221e] scale-110 shadow-xs'
                  : 'bg-white text-[#2c221e] border-[#ded3c5] hover:bg-[#fcfaf6]'
              }`}
            >
              {rating}★
            </button>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-[#847367] font-semibold px-2 mt-1">
          <span>Distracted</span>
          <span>Laser Focused</span>
        </div>

        <input
          type="text"
          placeholder="Quick reflection note (optional)..."
          value={reflectionNote}
          onChange={e => setReflectionNote(e.target.value)}
          className="mt-3 w-full px-3 py-1.5 bg-white border border-[#2c221e] rounded text-xs font-medium focus:outline-none"
        />
      </div>

      <button
        onClick={handleSubmitReflection}
        className="w-full py-3 pixel-btn-primary rounded-xl text-xs font-pixel text-white flex items-center justify-center gap-2"
      >
        <CheckCircle className="w-4 h-4" />
        <span>Claim Rewards & Return</span>
      </button>
    </div>
  );
};
