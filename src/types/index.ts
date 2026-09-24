export type MascotId = 'cat' | 'calico_cat' | 'bunny' | 'turtle' | 'star' | 'bear';

export interface Mascot {
  id: MascotId;
  name: string;
  species: string;
  tagline: string;
  dialogues: {
    idle: string[];
    studying: string[];
    completed: string[];
    break: string[];
    procrastination: string[];
    streak: string[];
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string;
  todayGoalMinutes: number;
  todayCompletedMinutes: number;
  selectedMascot: MascotId;
  activeThemeId: string;
  activeTimerSkinId: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  totalFocusMinutes: number;
  createdAt: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  createdAt: string;
}

export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  subjectId: string;
  topicId?: string;
  title: string;
  estimatedMinutes: number;
  completedMinutes: number;
  priority: TaskPriority;
  deadline?: string;
  plannedStartTime?: string; // e.g. "2026-09-23T10:00"
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export type FocusMode = 'pomodoro' | 'deep_work' | 'custom';
export type FocusPhase = 'focus' | 'short_break' | 'long_break';
export type TimerStateStatus = 'idle' | 'preparing' | 'active' | 'paused' | 'completed' | 'interrupted';

export interface FocusSession {
  id: string;
  taskId?: string;
  subjectId?: string;
  topicId?: string;
  goalTitle: string;
  mode: FocusMode;
  durationMinutes: number;
  actualMinutes: number;
  plannedDurationSeconds?: number;
  elapsedSeconds?: number;
  remainingSeconds?: number;
  pauseDurationSeconds?: number;
  status: 'completed' | 'interrupted' | 'emergency_unlocked';
  plannedStartTime?: string;
  actualStartTime: string;
  endTime?: string;
  procrastinationDelayMinutes: number;
  delayReason?: string;
  interruptionsCount: number;
  focusRating?: number; // 1 to 5
  reflectionNote?: string;
  xpEarned: number;
  coinsEarned: number;
  rewardGranted: boolean;
  blockingProfileUsed?: string;
}

export interface BlockingProfile {
  id: string;
  name: string;
  description: string;
  icon: string;
  isPreset: boolean;
  blockedSites: string[];
  blockedApps: string[];
  allowedSites: string[];
  category: 'Study' | 'Coding' | 'Exam Prep' | 'Deep Work' | 'Custom';
}

export type VisionItemType = 'image' | 'goal' | 'quote' | 'note' | 'sticker' | 'frame' | 'decoration';

export interface VisionBoardItem {
  id: string;
  type: VisionItemType;
  title?: string;
  content: string;
  imageUrl?: string;
  deadline?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  bgColor: string;
  textColor: string;
  fontStyle: 'pixel' | 'clean' | 'script';
  isPinnedToFocus: boolean;
  storeRewardId?: string;
  assetIcon?: string;
  frameStyle?: string;
}

export type StoreCategory = 'vision_board' | 'audio' | 'timer' | 'theme' | 'mascot_outfit';

export interface StoreItem {
  id: string;
  category: StoreCategory;
  subcategory?: 'sticker' | 'frame' | 'decoration' | 'audio' | 'timer' | 'theme' | 'outfit';
  name: string;
  description: string;
  price: number;
  icon: string;
  badge?: string;
  isOwned: boolean;
  isEquipped: boolean;
}

export interface UserReward {
  userId: string;
  rewardId: string;
  purchaseDate: string;
  owned: boolean;
  equipped: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'focus' | 'streak' | 'discipline' | 'explorer';
  xpReward: number;
  coinReward: number;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isUnlocked: boolean;
}

export interface UserSettings {
  themeMode: 'cozy' | 'dark' | 'sepia';
  ambientVolume: number; // 0 to 1
  sfxVolume: number; // 0 to 1
  selectedAmbientSound: string;
  customAudioName?: string;
  customAudioDataUrl?: string;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  pomodoroFocusMinutes: number;
  pomodoroBreakMinutes: number;
  pomodoroLongBreakMinutes: number;
  pomodoroCycleCount: number;
  deepWorkMinutes: number;
  blockingEnabled: boolean;
  activeBlockingProfileId: string;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  notificationsEnabled: boolean;
  dailyCoinCap: number;
  coinsEarnedToday: number;
  lastCoinResetDate: string;
}
