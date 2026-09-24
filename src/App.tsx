import React, { useState, useEffect } from 'react';
import { storage } from './services/storage';
import {
  UserProfile,
  Subject,
  Topic,
  Task,
  FocusSession,
  BlockingProfile,
  VisionBoardItem,
  StoreItem,
  Achievement,
  Badge,
  UserSettings,
  FocusMode,
} from './types';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { TopStudySceneHeader } from './components/layout/TopStudySceneHeader';
import { HomeView } from './views/HomeView';
import { PlannerView } from './views/PlannerView';
import { FocusView } from './views/FocusView';
import { ProgressView } from './views/ProgressView';
import { StoreView } from './views/StoreView';
import { ProfileView } from './views/ProfileView';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { AuthModal } from './components/auth/AuthModal';
import { RewardResult } from './services/gamification';

export const App: React.FC = () => {
  // Primary domain state
  const [profile, setProfile] = useState<UserProfile>(() => storage.getProfile());
  const [subjects, setSubjects] = useState<Subject[]>(() => storage.getSubjects());
  const [topics, setTopics] = useState<Topic[]>(() => storage.getTopics());
  const [tasks, setTasks] = useState<Task[]>(() => storage.getTasks());
  const [sessions, setSessions] = useState<FocusSession[]>(() => storage.getSessions());
  const [blockingProfiles, setBlockingProfiles] = useState<BlockingProfile[]>(() =>
    storage.getBlockingProfiles()
  );
  const [visionItems, setVisionItems] = useState<VisionBoardItem[]>(() =>
    storage.getVisionItems()
  );
  const [storeItems, setStoreItems] = useState<StoreItem[]>(() =>
    storage.getStoreItems()
  );
  const [achievements, setAchievements] = useState<Achievement[]>(() =>
    storage.getAchievements()
  );
  const [badges, setBadges] = useState<Badge[]>(() => storage.getBadges());
  const [settings, setSettings] = useState<UserSettings>(() => storage.getSettings());

  // UI state
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => !storage.isOnboardingDone());
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Focus transition state
  const [focusConfig, setFocusConfig] = useState<{
    mode: FocusMode;
    duration: number;
    task?: Task | null;
  }>({ mode: 'deep_work', duration: 45, task: null });

  // Sync profile when storage updates
  const handleUpdateProfile = (newProf: UserProfile) => {
    setProfile(newProf);
    storage.saveProfile(newProf);
  };

  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    storage.saveSettings(newSettings);
  };

  const handleSaveSubjects = (subs: Subject[]) => {
    setSubjects(subs);
    storage.saveSubjects(subs);
  };

  const handleSaveTopics = (tops: Topic[]) => {
    setTopics(tops);
    storage.saveTopics(tops);
  };

  const handleSaveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    storage.saveTasks(newTasks);
  };

  const handleSaveVisionItems = (items: VisionBoardItem[]) => {
    setVisionItems(items);
    storage.saveVisionItems(items);
  };

  const handleSaveBlockingProfiles = (profs: BlockingProfile[]) => {
    setBlockingProfiles(profs);
    storage.saveBlockingProfiles(profs);
  };

  // Launch Focus from Home
  const handleStartFocusFromHome = (mode: FocusMode, durationMinutes: number) => {
    setFocusConfig({ mode, duration: durationMinutes, task: null });
    setCurrentTab('focus');
  };

  // Launch Focus on specific Task from Planner
  const handleStartFocusOnTask = (task: Task) => {
    setFocusConfig({
      mode: 'pomodoro',
      duration: task.estimatedMinutes || 25,
      task,
    });
    setCurrentTab('focus');
  };

  // Focus session completed or interrupted
  const handleSessionFinished = (
    session: FocusSession,
    rewards: RewardResult | null
  ) => {
    const updatedSessions = [session, ...sessions];
    setSessions(updatedSessions);
    storage.saveSessions(updatedSessions);

    // Update subject focus time
    if (session.subjectId && session.status === 'completed') {
      const updatedSubjects = subjects.map(s => {
        if (s.id === session.subjectId) {
          return { ...s, totalFocusMinutes: s.totalFocusMinutes + session.actualMinutes };
        }
        return s;
      });
      handleSaveSubjects(updatedSubjects);
    }

    // Refresh profile and achievements
    setProfile(storage.getProfile());
    setAchievements(storage.getAchievements());
    setSettings(storage.getSettings());

    // Switch back to Home or Progress
    setCurrentTab('home');
  };

  // Update today's goal
  const handleUpdateGoal = (newGoalHours: number) => {
    const updated = {
      ...profile,
      todayGoalMinutes: Math.round(newGoalHours * 60),
    };
    handleUpdateProfile(updated);
  };

  // Reward Store Purchase
  const handlePurchaseStoreItem = (item: StoreItem) => {
    if (profile.coins < item.price) return;

    const newCoins = profile.coins - item.price;
    const updatedProfile = { ...profile, coins: newCoins };
    handleUpdateProfile(updatedProfile);

    const updatedItems = storeItems.map(si => {
      if (si.id === item.id) {
        return { ...si, isOwned: true };
      }
      return si;
    });
    setStoreItems(updatedItems);
    storage.saveStoreItems(updatedItems);
  };

  // Reward Store Equip
  const handleEquipStoreItem = (item: StoreItem) => {
    const updatedItems = storeItems.map(si => {
      if (si.category === item.category) {
        return { ...si, isEquipped: si.id === item.id };
      }
      return si;
    });
    setStoreItems(updatedItems);
    storage.saveStoreItems(updatedItems);

    // If theme or timer skin, reflect in profile
    if (item.category === 'theme') {
      handleUpdateProfile({ ...profile, activeThemeId: item.id });
    } else if (item.category === 'timer') {
      handleUpdateProfile({ ...profile, activeTimerSkinId: item.id });
    }
  };

  const handleResetAllData = () => {
    storage.resetAllData();
    setProfile(storage.getProfile());
    setSubjects(storage.getSubjects());
    setTopics(storage.getTopics());
    setTasks(storage.getTasks());
    setSessions(storage.getSessions());
    setBlockingProfiles(storage.getBlockingProfiles());
    setVisionItems(storage.getVisionItems());
    setStoreItems(storage.getStoreItems());
    setAchievements(storage.getAchievements());
    setBadges(storage.getBadges());
    setSettings(storage.getSettings());
  };

  return (
    <div className="min-h-screen flex bg-[#fcfaf6] text-[#2c221e] antialiased">
      {/* Desktop Left Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={tab => setCurrentTab(tab)}
          mascotId={profile.selectedMascot}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() =>
            setIsSidebarCollapsed(prev => !prev)
          }
        />
      </div>

      {/* Main App Content Area */}
      <main className="flex-1 flex flex-col min-w-0 px-4 sm:px-6 md:px-8 py-4 md:py-6 overflow-y-auto mb-16 md:mb-0">
        {/* Top Cozy Study Scene Header (shown everywhere except during Focus session) */}
        {currentTab !== 'focus' && (
          <TopStudySceneHeader
            profile={profile}
            onOpenStore={() => setCurrentTab('store')}
          />
        )}

        {/* Tab Views */}
        {currentTab === 'home' && (
          <HomeView
            profile={profile}
            subjects={subjects}
            tasks={tasks}
            onStartFocus={handleStartFocusFromHome}
            onNavigateTab={tab => setCurrentTab(tab)}
            onOpenAddTask={() => setCurrentTab('planner')}
            onUpdateGoal={handleUpdateGoal}
          />
        )}

        {currentTab === 'planner' && (
          <PlannerView
            subjects={subjects}
            topics={topics}
            tasks={tasks}
            onSaveSubjects={handleSaveSubjects}
            onSaveTopics={handleSaveTopics}
            onSaveTasks={handleSaveTasks}
            onStartFocusTask={handleStartFocusOnTask}
          />
        )}

        {currentTab === 'focus' && (
          <FocusView
            profile={profile}
            settings={settings}
            subjects={subjects}
            tasks={tasks}
            blockingProfiles={blockingProfiles}
            visionItems={visionItems}
            preSelectedTask={focusConfig.task}
            initialMode={focusConfig.mode}
            initialDuration={focusConfig.duration}
            onSessionFinished={handleSessionFinished}
            onExit={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'progress' && (
          <ProgressView
            profile={profile}
            sessions={sessions}
            subjects={subjects}
            achievements={achievements}
            badges={badges}
          />
        )}

        {currentTab === 'store' && (
          <StoreView
            profile={profile}
            storeItems={storeItems}
            onPurchaseItem={handlePurchaseStoreItem}
            onEquipItem={handleEquipStoreItem}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            profile={profile}
            settings={settings}
            blockingProfiles={blockingProfiles}
            onUpdateProfile={handleUpdateProfile}
            onUpdateSettings={handleUpdateSettings}
            onUpdateBlockingProfiles={handleSaveBlockingProfiles}
            onResetAllData={handleResetAllData}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={tab => setCurrentTab(tab)}
      />

      {/* Onboarding Modal */}
      {isOnboardingOpen && (
        <OnboardingModal
          onComplete={() => {
            setIsOnboardingOpen(false);
            storage.setOnboardingDone(true);
          }}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={userPartial => {
          handleUpdateProfile({
            ...profile,
            name: userPartial.name || profile.name,
            email: userPartial.email || profile.email,
          });
        }}
      />
    </div>
  );
};

export default App;
