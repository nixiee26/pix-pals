import { UserProfile, UserSettings, Achievement } from '../types';
import { storage } from './storage';
import { audioEngine } from './audioEngine';

export interface RewardResult {
  xpEarned: number;
  coinsEarned: number;
  leveledUp: boolean;
  newLevel: number;
  newAchievements: Achievement[];
}

export class GamificationService {
  public static getXPThresholdForLevel(level: number): number {
    return 100 + level * 80;
  }

  /**
   * Award rewards for a genuinely completed focus session.
   * If the session was stopped prematurely, awards 0 XP and 0 Coins!
   */
  public static awardSessionRewards(
    plannedMinutes: number,
    actualElapsedMinutes: number,
    focusRating: number = 4
  ): RewardResult {
    const profile = storage.getProfile();
    const settings = storage.getSettings();

    // STRICT VALIDATION: If elapsed is less than 95% of planned duration, NO REWARDS!
    const isGenuinelyCompleted = actualElapsedMinutes >= plannedMinutes * 0.95;

    if (!isGenuinelyCompleted) {
      return {
        xpEarned: 0,
        coinsEarned: 0,
        leveledUp: false,
        newLevel: profile.level,
        newAchievements: [],
      };
    }

    // 1 minute = 1 XP base. Rating bonus: 5 stars gives +10 XP, 4 stars gives +5 XP
    let xpGain = Math.round(plannedMinutes);
    if (focusRating >= 5) xpGain += 10;
    else if (focusRating >= 4) xpGain += 5;

    // Coins: ~1 coin per 3 focus minutes, capped by daily limit
    const baseCoins = Math.floor(plannedMinutes / 3);
    const availableCoinsToday = Math.max(0, settings.dailyCoinCap - settings.coinsEarnedToday);
    const coinsGain = Math.min(baseCoins, availableCoinsToday);

    settings.coinsEarnedToday += coinsGain;
    storage.saveSettings(settings);

    // Update Profile XP and Coins
    let newXP = profile.xp + xpGain;
    let newLevel = profile.level;
    let leveledUp = false;

    let threshold = this.getXPThresholdForLevel(newLevel);
    while (newXP >= threshold) {
      newXP -= threshold;
      newLevel += 1;
      leveledUp = true;
      threshold = this.getXPThresholdForLevel(newLevel);
    }

    // Update streak if today is a new active day
    const today = new Date().toISOString().split('T')[0];
    let newStreak = profile.streak;
    let newLongest = profile.longestStreak;

    if (profile.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (profile.lastActiveDate === yesterday) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
      if (newStreak > newLongest) {
        newLongest = newStreak;
      }
    }

    const updatedProfile: UserProfile = {
      ...profile,
      xp: newXP,
      xpToNextLevel: threshold,
      level: newLevel,
      coins: profile.coins + coinsGain,
      streak: newStreak,
      longestStreak: newLongest,
      lastActiveDate: today,
      todayCompletedMinutes: profile.todayCompletedMinutes + plannedMinutes,
    };

    storage.saveProfile(updatedProfile);

    if (leveledUp) {
      audioEngine.playPixelSfx('level_up');
    } else {
      audioEngine.playPixelSfx('complete');
    }

    // Check achievements
    const newAchievements = this.checkAchievements(updatedProfile, plannedMinutes, focusRating);

    return {
      xpEarned: xpGain,
      coinsEarned: coinsGain,
      leveledUp,
      newLevel,
      newAchievements,
    };
  }

  public static applyEmergencyPenalty(): { xpLost: number; coinsLost: number } {
    const profile = storage.getProfile();
    const xpLost = 15;
    const coinsLost = Math.min(10, profile.coins);

    const updatedProfile: UserProfile = {
      ...profile,
      xp: Math.max(0, profile.xp - xpLost),
      coins: Math.max(0, profile.coins - coinsLost),
    };

    storage.saveProfile(updatedProfile);
    audioEngine.playPixelSfx('emergency');

    return { xpLost, coinsLost };
  }

  private static checkAchievements(
    profile: UserProfile,
    sessionDuration: number,
    focusRating: number
  ): Achievement[] {
    const achievements = storage.getAchievements();
    const sessions = storage.getSessions();
    const unlockedNow: Achievement[] = [];

    achievements.forEach(ach => {
      if (ach.isUnlocked) return;

      let shouldUnlock = false;

      if (ach.id === 'ach_1' && sessions.length >= 1) {
        shouldUnlock = true;
      } else if (ach.id === 'ach_2' && sessionDuration >= 45) {
        shouldUnlock = true;
      } else if (ach.id === 'ach_3' && profile.streak >= 7) {
        shouldUnlock = true;
      } else if (ach.id === 'ach_4') {
        const totalMinutes = sessions.filter(s => s.status === 'completed').reduce((acc, s) => acc + s.actualMinutes, 0);
        if (totalMinutes >= 600) shouldUnlock = true;
      } else if (ach.id === 'ach_6') {
        const fiveStarCount = sessions.filter(s => s.focusRating === 5 && s.status === 'completed').length;
        if (fiveStarCount >= 10) shouldUnlock = true;
      }

      if (shouldUnlock) {
        ach.isUnlocked = true;
        ach.unlockedAt = new Date().toISOString().split('T')[0];
        ach.progress = ach.maxProgress;
        profile.xp += ach.xpReward;
        profile.coins += ach.coinReward;
        unlockedNow.push(ach);
      }
    });

    if (unlockedNow.length > 0) {
      storage.saveAchievements(achievements);
      storage.saveProfile(profile);
    }

    return unlockedNow;
  }
}
