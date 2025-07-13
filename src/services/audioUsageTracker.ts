// Enhanced audio usage tracking service

interface DayStats {
  calls: number;
  characters: number;
  errors: number;
  voices: Record<string, number>;
}

interface MonthStats {
  [dateStr: string]: DayStats;
}

interface DetailedStats {
  webSpeech?: Record<string, MonthStats>;
  googleTTS?: Record<string, MonthStats>;
}

export class AudioUsageTracker {
  private static instance: AudioUsageTracker;
  private webSpeechUsageKey = 'webSpeechUsage';
  private googleTTSUsageKey = 'googleTTSUsage';
  private audioStatsKey = 'audioStatsDetailed';

  static getInstance(): AudioUsageTracker {
    if (!AudioUsageTracker.instance) {
      AudioUsageTracker.instance = new AudioUsageTracker();
    }
    return AudioUsageTracker.instance;
  }

  // Track Google TTS usage
  trackGoogleTTSUsage(text: string, voice: string, success: boolean) {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0] || now.toDateString();
    const monthStr = now.toISOString().substring(0, 7);
    
    const usage = this.getGoogleTTSUsage();
    const stats = this.getDetailedStats();
    
    // Update character counts
    if (success) {
      usage.monthlyUsage += text.length;
      usage.dailyUsage += text.length;
      usage.lastUsed = now.toISOString();
    }
    
    // Update detailed stats
    if (!stats.googleTTS) stats.googleTTS = {};
    if (!stats.googleTTS[monthStr]) stats.googleTTS[monthStr] = {};
    const monthData = stats.googleTTS[monthStr];
    if (!monthData[dateStr]) {
      monthData[dateStr] = {
        calls: 0,
        characters: 0,
        errors: 0,
        voices: {}
      };
    }
    
    const dayStats = monthData[dateStr];
    dayStats.calls++;
    if (success) {
      dayStats.characters += text.length;
    } else {
      dayStats.errors++;
    }
    
    // Track voice usage
    if (!dayStats.voices[voice]) dayStats.voices[voice] = 0;
    dayStats.voices[voice]++;
    
    this.saveGoogleTTSUsage(usage);
    this.saveDetailedStats(stats);
  }

  // Track Web Speech usage
  trackWebSpeechUsage(text: string, voice: string, success: boolean) {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0] || now.toDateString();
    const monthStr = now.toISOString().substring(0, 7);
    
    const usage = this.getWebSpeechUsage();
    const stats = this.getDetailedStats();
    
    // Update usage counts
    usage.monthlyUsage++;
    usage.dailyUsage++;
    usage.lastUsed = now.toISOString();
    
    // Update detailed stats
    if (!stats.webSpeech) stats.webSpeech = {};
    if (!stats.webSpeech[monthStr]) stats.webSpeech[monthStr] = {};
    const monthData = stats.webSpeech[monthStr];
    if (!monthData[dateStr]) {
      monthData[dateStr] = {
        calls: 0,
        characters: 0,
        errors: 0,
        voices: {}
      };
    }
    
    const dayStats = monthData[dateStr];
    dayStats.calls++;
    if (success) {
      dayStats.characters += text.length;
    } else {
      dayStats.errors++;
    }
    
    // Track voice usage
    if (!dayStats.voices[voice]) dayStats.voices[voice] = 0;
    dayStats.voices[voice]++;
    
    this.saveWebSpeechUsage(usage);
    this.saveDetailedStats(stats);
  }

  // Get Google TTS usage stats
  getGoogleTTSUsage() {
    const stored = localStorage.getItem(this.googleTTSUsageKey);
    if (!stored) {
      return {
        monthlyUsage: 0,
        dailyUsage: 0,
        lastUsed: null,
        monthlyLimit: 4000000, // Google TTS free tier: 4M characters/month
        dailyLimit: 133333,    // ~4M/30 days
        lastReset: new Date().toISOString()
      };
    }
    
    try {
      const usage = JSON.parse(stored);
      this.checkAndResetUsage(usage);
      return usage;
    } catch (error) {
      console.error('Failed to parse Google TTS usage data:', error);
      // Return default usage if parsing fails
      return {
        monthlyUsage: 0,
        dailyUsage: 0,
        lastUsed: null,
        monthlyLimit: 4000000,
        dailyLimit: 133333,
        lastReset: new Date().toISOString()
      };
    }
  }

  // Get Web Speech usage stats
  getWebSpeechUsage() {
    const stored = localStorage.getItem(this.webSpeechUsageKey);
    if (!stored) {
      return {
        monthlyUsage: 0,
        dailyUsage: 0,
        lastUsed: null,
        lastReset: new Date().toISOString()
      };
    }
    
    try {
      const usage = JSON.parse(stored);
      this.checkAndResetUsage(usage);
      return usage;
    } catch (error) {
      console.error('Failed to parse Web Speech usage data:', error);
      return {
        monthlyUsage: 0,
        dailyUsage: 0,
        lastUsed: null,
        lastReset: new Date().toISOString()
      };
    }
  }

  // Get detailed statistics
  getDetailedStats(): DetailedStats {
    const stored = localStorage.getItem(this.audioStatsKey);
    if (!stored) return { googleTTS: {}, webSpeech: {} };
    
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to parse detailed audio stats:', error);
      return { googleTTS: {}, webSpeech: {} };
    }
  }

  // Save Google TTS usage
  private saveGoogleTTSUsage(usage: any) {
    localStorage.setItem(this.googleTTSUsageKey, JSON.stringify(usage));
  }

  // Save Web Speech usage
  private saveWebSpeechUsage(usage: any) {
    localStorage.setItem(this.webSpeechUsageKey, JSON.stringify(usage));
  }

  // Save detailed stats
  private saveDetailedStats(stats: any) {
    localStorage.setItem(this.audioStatsKey, JSON.stringify(stats));
  }

  // Check and reset usage counters
  private checkAndResetUsage(usage: any) {
    const now = new Date();
    const lastReset = new Date(usage.lastReset);
    
    // Reset daily usage at midnight
    if (now.getDate() !== lastReset.getDate()) {
      usage.dailyUsage = 0;
    }
    
    // Reset monthly usage at start of month
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      usage.monthlyUsage = 0;
      usage.dailyUsage = 0;
    }
    
    usage.lastReset = now.toISOString();
  }

  // Get usage statistics for admin dashboard
  getUsageStats() {
    const googleTTSUsage = this.getGoogleTTSUsage();
    const webSpeechUsage = this.getWebSpeechUsage();
    const detailedStats = this.getDetailedStats();
    
    const now = new Date();
    const today = now.toISOString().split('T')[0] || now.toDateString();
    const thisMonth = now.toISOString().substring(0, 7);
    
    // Calculate today's stats
    const googleTTSToday = detailedStats.googleTTS?.[thisMonth]?.[today] || { calls: 0, characters: 0, errors: 0 };
    const webSpeechToday = detailedStats.webSpeech?.[thisMonth]?.[today] || { calls: 0, characters: 0, errors: 0 };
    
    // Calculate this month's stats
    const googleTTSThisMonth = Object.values(detailedStats.googleTTS?.[thisMonth] || {}).reduce((total: any, day: any) => ({
      calls: total.calls + day.calls,
      characters: total.characters + day.characters,
      errors: total.errors + day.errors
    }), { calls: 0, characters: 0, errors: 0 });
    
    const webSpeechThisMonth = Object.values(detailedStats.webSpeech?.[thisMonth] || {}).reduce((total: any, day: any) => ({
      calls: total.calls + day.calls,
      characters: total.characters + day.characters,
      errors: total.errors + day.errors
    }), { calls: 0, characters: 0, errors: 0 });
    
    return {
      googleTTS: {
        today: googleTTSToday,
        thisMonth: googleTTSThisMonth,
        monthlyUsage: googleTTSUsage.monthlyUsage,
        dailyUsage: googleTTSUsage.dailyUsage,
        monthlyLimit: googleTTSUsage.monthlyLimit,
        dailyLimit: googleTTSUsage.dailyLimit,
        usagePercentage: (googleTTSUsage.monthlyUsage / googleTTSUsage.monthlyLimit) * 100,
        estimatedCost: googleTTSUsage.monthlyUsage > 4000000 ? 
          ((googleTTSUsage.monthlyUsage - 4000000) / 1000000) * 4 : 0
      },
      webSpeech: {
        today: webSpeechToday,
        thisMonth: webSpeechThisMonth,
        monthlyUsage: webSpeechUsage.monthlyUsage,
        dailyUsage: webSpeechUsage.dailyUsage
      }
    };
  }

  // Export usage data for admin
  exportUsageData() {
    const stats = this.getDetailedStats();
    const googleTTSUsage = this.getGoogleTTSUsage();
    const webSpeechUsage = this.getWebSpeechUsage();
    
    const exportData = {
      exportDate: new Date().toISOString(),
      googleTTSUsage,
      webSpeechUsage,
      detailedStats: stats
    };
    
    // Create downloadable file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audio-usage-stats-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Clear all usage data (for testing or reset)
  clearUsageData() {
    localStorage.removeItem(this.googleTTSUsageKey);
    localStorage.removeItem(this.webSpeechUsageKey);
    localStorage.removeItem(this.audioStatsKey);
  }
}

export default AudioUsageTracker;
