import {
  UserProfile,
  Subject,
  Topic,
  Task,
  FocusSession,
  BlockingProfile,
  VisionBoardItem,
  StoreItem,
  UserReward,
  Achievement,
  Badge,
  UserSettings,
} from '../types';

const STORAGE_PREFIX = 'pix_pals_';

// Seed initial profile
const SEED_PROFILE: UserProfile = {
  id: 'user_default',
  name: 'Sekhar',
  email: 'sekhar.focus@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop',
  level: 5,
  xp: 320,
  xpToNextLevel: 500,
  coins: 120,
  streak: 12,
  longestStreak: 15,
  lastActiveDate: new Date().toISOString().split('T')[0],
  todayGoalMinutes: 180, // 3 hours
  todayCompletedMinutes: 90, // 1.5 hrs completed
  selectedMascot: 'calico_cat',
  activeThemeId: 'theme_cozy_room',
  activeTimerSkinId: 'timer_retro_amber',
  createdAt: '2026-09-01T08:00:00Z',
};

const SEED_SUBJECTS: Subject[] = [
  { id: 'sub_dsa', name: 'DSA', icon: '💻', color: '#4a6fa5', totalFocusMinutes: 420, createdAt: '2026-09-02T10:00:00Z' },
  { id: 'sub_web', name: 'Web Dev', icon: '</>', color: '#845ec2', totalFocusMinutes: 380, createdAt: '2026-09-02T10:00:00Z' },
  { id: 'sub_python', name: 'Python', icon: '🐍', color: '#488053', totalFocusMinutes: 240, createdAt: '2026-09-03T10:00:00Z' },
  { id: 'sub_tqm', name: 'TQM', icon: '📊', color: '#df793b', totalFocusMinutes: 120, createdAt: '2026-09-04T10:00:00Z' },
];

const SEED_TOPICS: Topic[] = [
  { id: 'top_1', subjectId: 'sub_dsa', name: 'Recursion & Backtracking', createdAt: '2026-09-02T10:00:00Z' },
  { id: 'top_2', subjectId: 'sub_dsa', name: 'Binary Search Trees', createdAt: '2026-09-02T10:00:00Z' },
  { id: 'top_3', subjectId: 'sub_web', name: 'React Server Components', createdAt: '2026-09-03T10:00:00Z' },
  { id: 'top_4', subjectId: 'sub_python', name: 'FastAPI Backend', createdAt: '2026-09-03T10:00:00Z' },
  { id: 'top_5', subjectId: 'sub_tqm', name: 'Six Sigma Principles', createdAt: '2026-09-04T10:00:00Z' },
];

const SEED_TASKS: Task[] = [
  {
    id: 'task_1',
    subjectId: 'sub_dsa',
    topicId: 'top_1',
    title: 'Practice 3 recursive subset problems',
    estimatedMinutes: 45,
    completedMinutes: 45,
    priority: 'high',
    deadline: '2026-09-24',
    plannedStartTime: '2026-09-23T10:00',
    completed: true,
    completedAt: '2026-09-23T10:48:00Z',
    createdAt: '2026-09-22T08:00:00Z',
  },
  {
    id: 'task_2',
    subjectId: 'sub_dsa',
    topicId: 'top_2',
    title: 'Solve Lowest Common Ancestor on LeetCode',
    estimatedMinutes: 45,
    completedMinutes: 0,
    priority: 'high',
    deadline: '2026-09-24',
    plannedStartTime: '2026-09-23T14:00',
    completed: false,
    createdAt: '2026-09-22T08:00:00Z',
  },
  {
    id: 'task_3',
    subjectId: 'sub_web',
    topicId: 'top_3',
    title: 'Build auth middleware & token refresh',
    estimatedMinutes: 60,
    completedMinutes: 45,
    priority: 'medium',
    deadline: '2026-09-25',
    plannedStartTime: '2026-09-23T16:30',
    completed: false,
    createdAt: '2026-09-22T09:00:00Z',
  },
  {
    id: 'task_4',
    subjectId: 'sub_python',
    topicId: 'top_4',
    title: 'Setup Pydantic V2 schemas and route validation',
    estimatedMinutes: 45,
    completedMinutes: 0,
    priority: 'medium',
    deadline: '2026-09-26',
    completed: false,
    createdAt: '2026-09-22T09:00:00Z',
  },
  {
    id: 'task_5',
    subjectId: 'sub_tqm',
    topicId: 'top_5',
    title: 'Review Chapter 4 Quality Control charts',
    estimatedMinutes: 30,
    completedMinutes: 0,
    priority: 'low',
    deadline: '2026-09-27',
    completed: false,
    createdAt: '2026-09-22T09:00:00Z',
  },
];

const SEED_BLOCKING_PROFILES: BlockingProfile[] = [
  {
    id: 'prof_study',
    name: 'Study Profile',
    description: 'Blocks addictive social media, video streaming & shopping during exam prep.',
    icon: '📚',
    isPreset: true,
    category: 'Study',
    blockedSites: ['youtube.com', 'instagram.com', 'reddit.com', 'netflix.com', 'twitter.com', 'x.com', 'tiktok.com', 'twitch.tv', 'facebook.com'],
    blockedApps: ['Instagram', 'YouTube', 'TikTok', 'Reddit', 'Netflix'],
    allowedSites: ['drive.google.com', 'docs.google.com', 'github.com', 'chatgpt.com', 'notion.so', 'wikipedia.org', 'stackoverflow.com', 'canvas.instructure.com'],
  },
  {
    id: 'prof_coding',
    name: 'Deep Coding',
    description: 'Keep documentation, AI assistance and GitHub open; block all social feeds.',
    icon: '💻',
    isPreset: true,
    category: 'Coding',
    blockedSites: ['twitter.com', 'x.com', 'reddit.com', 'youtube.com', 'instagram.com', 'facebook.com', 'news.ycombinator.com', 'amazon.com'],
    blockedApps: ['Discord', 'Telegram', 'Slack (Personal)'],
    allowedSites: ['github.com', 'gitlab.com', 'stackoverflow.com', 'chatgpt.com', 'claude.ai', 'localhost', 'developer.mozilla.org', 'npmjs.com'],
  },
  {
    id: 'prof_exam',
    name: 'Exam Lockdown',
    description: 'Strict lockdown with only whitelisted study references accessible.',
    icon: '🔒',
    isPreset: true,
    category: 'Exam Prep',
    blockedSites: ['*'],
    blockedApps: ['All Social Media', 'All Games', 'Streaming Apps'],
    allowedSites: ['docs.google.com', 'classroom.google.com', 'wikipedia.org'],
  },
  {
    id: 'prof_deep_work',
    name: 'Zen Deep Work',
    description: 'Silent sanctuary mode to get through challenging tasks without friction.',
    icon: '🧘',
    isPreset: true,
    category: 'Deep Work',
    blockedSites: ['youtube.com', 'reddit.com', 'instagram.com', 'news.google.com', 'bbc.com', 'cnn.com'],
    blockedApps: ['Messages', 'Email Clients', 'Social'],
    allowedSites: ['notion.so', 'obsidian.md', 'figma.com'],
  },
];

const SEED_STORE_ITEMS: StoreItem[] = [
  // 1. Vision Board: Stickers, Frames, Decors (Directly connects to Vision Board)
  {
    id: 'vb_cherry_blossom',
    category: 'vision_board',
    subcategory: 'sticker',
    name: 'Cherry Blossom Sticker',
    description: 'Graceful pastel pink sakura petal cluster to decorate your dreams.',
    price: 40,
    icon: '🌸',
    isOwned: false,
    isEquipped: false,
  },
  {
    id: 'vb_star_frame',
    category: 'vision_board',
    subcategory: 'frame',
    name: 'Pixel Star Frame',
    description: 'Glowing retro pixel star frame with warm amber border.',
    price: 60,
    icon: '⭐',
    isOwned: false,
    isEquipped: false,
  },
  {
    id: 'vb_gold_frame',
    category: 'vision_board',
    subcategory: 'frame',
    name: 'Gilded Pixel Frame',
    description: 'Gleaming 24-karat gold pixel border decoration for high-priority goals.',
    price: 80,
    icon: '🖼️',
    isOwned: false,
    isEquipped: false,
  },
  {
    id: 'vb_sparkle_stickers',
    category: 'vision_board',
    subcategory: 'sticker',
    name: 'Sparkle Stickers',
    description: 'Cute holographic stars and cute paw badges to stick anywhere.',
    price: 35,
    icon: '✨',
    isOwned: false,
    isEquipped: false,
  },
  {
    id: 'vb_goal_ribbon',
    category: 'vision_board',
    subcategory: 'decoration',
    name: 'Trophy Goal Ribbon',
    description: 'Pixel championship ribbon for your biggest study milestones.',
    price: 50,
    icon: '🎀',
    isOwned: false,
    isEquipped: false,
  },
  {
    id: 'vb_cozy_plant_pin',
    category: 'vision_board',
    subcategory: 'decoration',
    name: 'Cozy Plant Pin',
    description: 'Tiny potted pixel succulent pin to ground your aspirations.',
    price: 30,
    icon: '🪴',
    isOwned: false,
    isEquipped: false,
  },

  // 2. Room Themes
  { id: 'theme_cozy_room', category: 'theme', name: 'Sunset Bedroom', description: 'Warm twilight study room with sleepy cat & cozy lamp.', price: 0, icon: '🏡', isOwned: true, isEquipped: true },
  { id: 'theme_forest_cabin', category: 'theme', name: 'Forest Cabin', description: 'Peaceful timber study overlooking mossy pines and gentle rain.', price: 150, icon: '🌲', isOwned: false, isEquipped: false },
  { id: 'theme_sakura_garden', category: 'theme', name: 'Sakura Garden', description: 'Serene cherry blossom courtyard with falling pixel petals.', price: 200, icon: '🌸', isOwned: false, isEquipped: false },
  { id: 'theme_night_library', category: 'theme', name: 'Midnight Library', description: 'Stained glass windows, towering bookshelves and warm candlelight.', price: 250, icon: '📚', isOwned: false, isEquipped: false },

  // 3. Timer skins
  { id: 'timer_retro_amber', category: 'timer', name: 'Retro Amber LED', description: 'Warm nostalgic glowing amber 7-segment digital timer display.', price: 0, icon: '📟', isOwned: true, isEquipped: true },
  { id: 'timer_emerald_matrix', category: 'timer', name: 'Emerald Matrix', description: 'Clean arcade-green pixel numbers with crisp beveled border.', price: 80, icon: '🟩', isOwned: false, isEquipped: false },
  { id: 'timer_pastel_sunset', category: 'timer', name: 'Pastel Sunset', description: 'Soft pink and lilac gradient timer numerals.', price: 100, icon: '🌅', isOwned: false, isEquipped: false },

  // 4. Ambient Audio
  { id: 'audio_rain_window', category: 'audio', name: 'Rain on Window', description: 'Procedural soothing raindrops with soft low-pass filter.', price: 0, icon: '🌧️', isOwned: true, isEquipped: true },
  { id: 'audio_fireplace', category: 'audio', name: 'Cozy Fireplace', description: 'Crackling hearth wood fire with gentle ember pops.', price: 60, icon: '🔥', isOwned: true, isEquipped: false },
  { id: 'audio_ocean_waves', category: 'audio', name: 'Ocean Waves', description: 'Rhythmic sea waves washing against a calm pebble beach.', price: 90, icon: '🌊', isOwned: false, isEquipped: false },
  { id: 'audio_forest_wind', category: 'audio', name: 'Forest Whisper', description: 'Rustling leaves and breezy alpine wind.', price: 90, icon: '🍃', isOwned: false, isEquipped: false },

  // 5. Mascot Outfits
  { id: 'outfit_study_glasses', category: 'mascot_outfit', name: 'Study Glasses', description: 'Tiny intellectual round glasses for your companion.', price: 120, icon: '👓', isOwned: false, isEquipped: false },
  { id: 'outfit_cozy_scarf', category: 'mascot_outfit', name: 'Red Wool Scarf', description: 'Warm knitted scarf for crisp autumn study sessions.', price: 100, icon: '🧣', isOwned: false, isEquipped: false },
];

const SEED_VISION_ITEMS: VisionBoardItem[] = [
  {
    id: 'vis_1',
    type: 'goal',
    title: 'Pass Google Technical Interview',
    content: 'Solve 200 medium LeetCode questions with clear complexity breakdown and clean code.',
    deadline: 'December 2026',
    x: 20,
    y: 20,
    width: 280,
    height: 180,
    bgColor: '#fcf3d9',
    textColor: '#2c221e',
    fontStyle: 'pixel',
    isPinnedToFocus: true,
  },
  {
    id: 'vis_2',
    type: 'quote',
    content: '“Discipline today creates the life you dream about tomorrow.”',
    x: 320,
    y: 20,
    width: 260,
    height: 140,
    bgColor: '#e5f0e6',
    textColor: '#2f5937',
    fontStyle: 'clean',
    isPinnedToFocus: true,
  },
  {
    id: 'vis_3',
    type: 'note',
    title: 'Daily Rule',
    content: 'No morning social media until 1 hour of deep study is completed.',
    x: 20,
    y: 220,
    width: 240,
    height: 150,
    bgColor: '#faeedf',
    textColor: '#8c4e23',
    fontStyle: 'clean',
    isPinnedToFocus: false,
  },
  {
    id: 'vis_4',
    type: 'image',
    title: 'Dream Workspace',
    content: 'Clean desk with dual monitor, mechanical keyboard & potted bonsai.',
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&auto=format&fit=crop',
    x: 280,
    y: 180,
    width: 300,
    height: 220,
    bgColor: '#ffffff',
    textColor: '#2c221e',
    fontStyle: 'clean',
    isPinnedToFocus: false,
  },
];

const SEED_ACHIEVEMENTS: Achievement[] = [
  { id: 'ach_1', title: 'First Step', description: 'Complete your first focused study session.', icon: '🌱', category: 'focus', xpReward: 50, coinReward: 20, progress: 1, maxProgress: 1, isUnlocked: true, unlockedAt: '2026-09-02' },
  { id: 'ach_2', title: 'Deep Worker', description: 'Complete a 45+ minute Deep Work session.', icon: '🧠', category: 'focus', xpReward: 80, coinReward: 35, progress: 1, maxProgress: 1, isUnlocked: true, unlockedAt: '2026-09-04' },
  { id: 'ach_3', title: 'Unbreakable', description: 'Reach a 7-day focus streak without skipping.', icon: '🔥', category: 'streak', xpReward: 150, coinReward: 60, progress: 12, maxProgress: 7, isUnlocked: true, unlockedAt: '2026-09-18' },
  { id: 'ach_4', title: 'Centurion', description: 'Log over 10 hours of focused deep work.', icon: '⏳', category: 'focus', xpReward: 200, coinReward: 80, progress: 19, maxProgress: 10, isUnlocked: true, unlockedAt: '2026-09-20' },
  { id: 'ach_5', title: 'Anti-Procrastinator', description: 'Start a session within 2 minutes of planned time 5 times.', icon: '⚡', category: 'discipline', xpReward: 120, coinReward: 50, progress: 3, maxProgress: 5, isUnlocked: false },
  { id: 'ach_6', title: 'Zen Scholar', description: 'Complete 10 sessions with 5/5 laser focus ratings.', icon: '⭐', category: 'discipline', xpReward: 180, coinReward: 70, progress: 6, maxProgress: 10, isUnlocked: false },
  { id: 'ach_7', title: 'Visionary', description: 'Add 3 inspiring personal goals to your Vision Board.', icon: '🎯', category: 'explorer', xpReward: 50, coinReward: 25, progress: 3, maxProgress: 3, isUnlocked: true, unlockedAt: '2026-09-05' },
];

const SEED_BADGES: Badge[] = [
  { id: 'badge_flame', title: '10-Day Streak', description: 'Consistent daily discipline', icon: '🔥', rarity: 'rare', isUnlocked: true },
  { id: 'badge_star', title: 'Early Riser', description: 'Began focus before 8:00 AM', icon: '☀️', rarity: 'common', isUnlocked: true },
  { id: 'badge_shield', title: 'Iron Will', description: 'Resisted emergency unlock during a 90m session', icon: '🛡️', rarity: 'epic', isUnlocked: true },
  { id: 'badge_crown', title: 'Master of Focus', description: 'Achieve Level 10 productivity status', icon: '👑', rarity: 'legendary', isUnlocked: false },
];

const SEED_SETTINGS: UserSettings = {
  themeMode: 'cozy',
  ambientVolume: 0.5,
  sfxVolume: 0.6,
  selectedAmbientSound: 'rain',
  autoStartBreaks: false,
  autoStartFocus: false,
  pomodoroFocusMinutes: 25,
  pomodoroBreakMinutes: 5,
  pomodoroLongBreakMinutes: 15,
  pomodoroCycleCount: 4,
  deepWorkMinutes: 45,
  blockingEnabled: true,
  activeBlockingProfileId: 'prof_study',
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  notificationsEnabled: true,
  dailyCoinCap: 200,
  coinsEarnedToday: 35,
  lastCoinResetDate: new Date().toISOString().split('T')[0],
};

const SEED_SESSIONS: FocusSession[] = [
  {
    id: 'sess_1',
    taskId: 'task_1',
    subjectId: 'sub_dsa',
    topicId: 'top_1',
    goalTitle: 'Practice 3 recursive subset problems',
    mode: 'pomodoro',
    durationMinutes: 45,
    actualMinutes: 45,
    status: 'completed',
    plannedStartTime: '2026-09-23T10:00:00Z',
    actualStartTime: '2026-09-23T10:03:00Z',
    endTime: '2026-09-23T10:48:00Z',
    procrastinationDelayMinutes: 3,
    interruptionsCount: 0,
    focusRating: 5,
    reflectionNote: 'Felt great! Got through recursive backtracking cleanly.',
    xpEarned: 45,
    coinsEarned: 15,
    rewardGranted: true,
    blockingProfileUsed: 'Study Profile',
  },
  {
    id: 'sess_2',
    subjectId: 'sub_web',
    goalTitle: 'Read React Server Components RFC',
    mode: 'deep_work',
    durationMinutes: 45,
    actualMinutes: 45,
    status: 'completed',
    actualStartTime: '2026-09-22T14:15:00Z',
    endTime: '2026-09-22T15:00:00Z',
    procrastinationDelayMinutes: 0,
    interruptionsCount: 1,
    focusRating: 4,
    reflectionNote: 'Clear mental model now of server vs client boundaries.',
    xpEarned: 45,
    coinsEarned: 15,
    rewardGranted: true,
    blockingProfileUsed: 'Deep Coding',
  }
];

class StorageService {
  private activeUserId: string = 'user_default';

  public setActiveUser(userId: string) {
    this.activeUserId = userId;
  }

  public getActiveUserId(): string {
    return this.activeUserId;
  }

  private getKey(key: string, scoped: boolean = true): string {
    if (scoped && this.activeUserId) {
      return `${STORAGE_PREFIX}${this.activeUserId}_${key}`;
    }
    return `${STORAGE_PREFIX}${key}`;
  }

  private get<T>(key: string, defaultValue: T, scoped: boolean = true): T {
    try {
      const scopedKey = this.getKey(key, scoped);
      let item = localStorage.getItem(scopedKey);
      
      // Fallback/migration check from global or old focus_buddy key
      if (!item) {
        const oldKey = `focus_buddy_${key}`;
        item = localStorage.getItem(oldKey);
      }

      if (!item) return defaultValue;
      return JSON.parse(item);
    } catch (e) {
      console.error(`Error loading ${key} from storage:`, e);
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T, scoped: boolean = true): void {
    try {
      const scopedKey = this.getKey(key, scoped);
      localStorage.setItem(scopedKey, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving ${key} to storage:`, e);
    }
  }

  // Profile (scoped)
  public getProfile(): UserProfile {
    return this.get<UserProfile>('profile', SEED_PROFILE, true);
  }

  public saveProfile(profile: UserProfile): void {
    this.set('profile', profile, true);
  }

  // Subjects (scoped)
  public getSubjects(): Subject[] {
    return this.get<Subject[]>('subjects', SEED_SUBJECTS, true);
  }

  public saveSubjects(subjects: Subject[]): void {
    this.set('subjects', subjects, true);
  }

  // Topics (scoped)
  public getTopics(): Topic[] {
    return this.get<Topic[]>('topics', SEED_TOPICS, true);
  }

  public saveTopics(topics: Topic[]): void {
    this.set('topics', topics, true);
  }

  // Tasks (scoped)
  public getTasks(): Task[] {
    return this.get<Task[]>('tasks', SEED_TASKS, true);
  }

  public saveTasks(tasks: Task[]): void {
    this.set('tasks', tasks, true);
  }

  // Focus Sessions (scoped)
  public getSessions(): FocusSession[] {
    return this.get<FocusSession[]>('sessions', SEED_SESSIONS, true);
  }

  public saveSessions(sessions: FocusSession[]): void {
    this.set('sessions', sessions, true);
  }

  // Blocking Profiles (scoped)
  public getBlockingProfiles(): BlockingProfile[] {
    return this.get<BlockingProfile[]>('blocking_profiles', SEED_BLOCKING_PROFILES, true);
  }

  public saveBlockingProfiles(profiles: BlockingProfile[]): void {
    this.set('blocking_profiles', profiles, true);
  }

  // Vision Board Items (scoped)
  public getVisionItems(): VisionBoardItem[] {
    return this.get<VisionBoardItem[]>('vision_items', SEED_VISION_ITEMS, true);
  }

  public saveVisionItems(items: VisionBoardItem[]): void {
    this.set('vision_items', items, true);
  }

  // Store Items & Owned Inventory (scoped)
  public getStoreItems(): StoreItem[] {
    return this.get<StoreItem[]>('store_items', SEED_STORE_ITEMS, true);
  }

  public saveStoreItems(items: StoreItem[]): void {
    this.set('store_items', items, true);
  }

  // User Owned Rewards Table
  public getUserRewards(): UserReward[] {
    return this.get<UserReward[]>('user_rewards', [], true);
  }

  public saveUserRewards(rewards: UserReward[]): void {
    this.set('user_rewards', rewards, true);
  }

  public purchaseItem(itemId: string): boolean {
    const profile = this.getProfile();
    const items = this.getStoreItems();
    const item = items.find(i => i.id === itemId);
    if (!item || item.isOwned) return false;

    if (profile.coins < item.price) return false;

    // Deduct coins exactly once
    profile.coins -= item.price;
    this.saveProfile(profile);

    // Mark owned in catalog
    const updatedCatalog = items.map(i => {
      if (i.id === itemId) return { ...i, isOwned: true };
      return i;
    });
    this.saveStoreItems(updatedCatalog);

    // Save in user_rewards inventory
    const rewards = this.getUserRewards();
    rewards.push({
      userId: this.activeUserId,
      rewardId: itemId,
      purchaseDate: new Date().toISOString(),
      owned: true,
      equipped: false,
    });
    this.saveUserRewards(rewards);

    return true;
  }

  // Achievements (scoped)
  public getAchievements(): Achievement[] {
    return this.get<Achievement[]>('achievements', SEED_ACHIEVEMENTS, true);
  }

  public saveAchievements(achievements: Achievement[]): void {
    this.set('achievements', achievements, true);
  }

  // Badges (scoped)
  public getBadges(): Badge[] {
    return this.get<Badge[]>('badges', SEED_BADGES, true);
  }

  public saveBadges(badges: Badge[]): void {
    this.set('badges', badges, true);
  }

  // Settings (scoped)
  public getSettings(): UserSettings {
    const settings = this.get<UserSettings>('settings', SEED_SETTINGS, true);
    const today = new Date().toISOString().split('T')[0];
    if (settings.lastCoinResetDate !== today) {
      settings.coinsEarnedToday = 0;
      settings.lastCoinResetDate = today;
      this.saveSettings(settings);
    }
    return settings;
  }

  public saveSettings(settings: UserSettings): void {
    this.set('settings', settings, true);
  }

  // Onboarding
  public isOnboardingDone(): boolean {
    return this.get<boolean>('onboarding_done', false, false);
  }

  public setOnboardingDone(done: boolean): void {
    this.set('onboarding_done', done, false);
  }

  // Sidebar Collapsed preference
  public isSidebarCollapsed(): boolean {
    return this.get<boolean>('sidebar_collapsed', false, false);
  }

  public setSidebarCollapsed(collapsed: boolean): void {
    this.set('sidebar_collapsed', collapsed, false);
  }

  // JSON Data Export
  public exportDataJSON(): string {
    const fullBackup = {
      app: 'PIX_PALS',
      version: '2.0',
      userId: this.activeUserId,
      exportedAt: new Date().toISOString(),
      profile: this.getProfile(),
      subjects: this.getSubjects(),
      topics: this.getTopics(),
      tasks: this.getTasks(),
      sessions: this.getSessions(),
      blockingProfiles: this.getBlockingProfiles(),
      visionItems: this.getVisionItems(),
      storeItems: this.getStoreItems(),
      userRewards: this.getUserRewards(),
      achievements: this.getAchievements(),
      badges: this.getBadges(),
      settings: this.getSettings(),
    };
    return JSON.stringify(fullBackup, null, 2);
  }

  // JSON Data Import
  public importDataJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.profile) this.saveProfile(data.profile);
      if (data.subjects) this.saveSubjects(data.subjects);
      if (data.topics) this.saveTopics(data.topics);
      if (data.tasks) this.saveTasks(data.tasks);
      if (data.sessions) this.saveSessions(data.sessions);
      if (data.blockingProfiles) this.saveBlockingProfiles(data.blockingProfiles);
      if (data.visionItems) this.saveVisionItems(data.visionItems);
      if (data.storeItems) this.saveStoreItems(data.storeItems);
      if (data.userRewards) this.saveUserRewards(data.userRewards);
      if (data.achievements) this.saveAchievements(data.achievements);
      if (data.badges) this.saveBadges(data.badges);
      if (data.settings) this.saveSettings(data.settings);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }

  // Reset all data safely
  public resetAllData(): void {
    this.saveProfile(SEED_PROFILE);
    this.saveSubjects(SEED_SUBJECTS);
    this.saveTopics(SEED_TOPICS);
    this.saveTasks(SEED_TASKS);
    this.saveSessions(SEED_SESSIONS);
    this.saveBlockingProfiles(SEED_BLOCKING_PROFILES);
    this.saveVisionItems(SEED_VISION_ITEMS);
    this.saveStoreItems(SEED_STORE_ITEMS);
    this.saveUserRewards([]);
    this.saveAchievements(SEED_ACHIEVEMENTS);
    this.saveBadges(SEED_BADGES);
    this.saveSettings(SEED_SETTINGS);
    this.setOnboardingDone(true);
  }
}

export const storage = new StorageService();
