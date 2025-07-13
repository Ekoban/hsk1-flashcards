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
  azure?: Record<string, MonthStats>;
  webSpeech?: Record<string, MonthStats>;
}

export class AudioUsageTracker {
  private static instance: AudioUsageTracker;
  private azureUsageKey = 'azureSpeechUsage';
  private webSpeechUsageKey = 'webSpeechUsage';
  private audioStatsKey = 'audioStatsDetailed';

  static getInstance(): AudioUsageTracker {
    if (!AudioUsageTracker.instance) {
      AudioUsageTracker.instance = new AudioUsageTracker();
    }
    return AudioUsageTracker.instance;
  }

  // Track Azure Speech usage
  trackAzureUsage(text: string, voice: string, success: boolean) {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0] || now.toDateString();
    const monthStr = now.toISOString().substring(0, 7);
    
    const usage = this.getAzureUsage();
    const stats = this.getDetailedStats();
    
    // Update character counts
    if (success) {
      usage.monthlyUsage += text.length;
      usage.dailyUsage += text.length;
      usage.lastUsed = now.toISOString();
    }
    
    // Update detailed stats
    if (!stats.azure) stats.azure = {};
    if (!stats.azure[monthStr]) stats.azure[monthStr] = {};
    const monthData = stats.azure[monthStr];
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
    
    this.saveAzureUsage(usage);
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

  // Get Azure usage stats
  getAzureUsage() {
    const stored = localStorage.getItem(this.azureUsageKey);
    if (!stored) {
      return {
        monthlyUsage: 0,
        dailyUsage: 0,
        lastUsed: null,
        monthlyLimit: 450000,
        dailyLimit: 15000,
        lastReset: new Date().toISOString()
      };
    }
    
    const usage = JSON.parse(stored);
    this.checkAndResetUsage(usage);
    return usage;
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
    
    const usage = JSON.parse(stored);
    this.checkAndResetUsage(usage);
    return usage;
  }

  // Get detailed statistics
  getDetailedStats(): DetailedStats {
    const stored = localStorage.getItem(this.audioStatsKey);
    return stored ? JSON.parse(stored) : { azure: {}, webSpeech: {} };
  }

  // Save Azure usage
  private saveAzureUsage(usage: any) {
    localStorage.setItem(this.azureUsageKey, JSON.stringify(usage));
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
    const azureUsage = this.getAzureUsage();
    const webSpeechUsage = this.getWebSpeechUsage();
    const detailedStats = this.getDetailedStats();
    
    const now = new Date();
    const today = now.toISOString().split('T')[0] || now.toDateString();
    const thisMonth = now.toISOString().substring(0, 7);
    
    // Calculate today's stats
    const azureToday = detailedStats.azure?.[thisMonth]?.[today] || { calls: 0, characters: 0, errors: 0 };
    const webSpeechToday = detailedStats.webSpeech?.[thisMonth]?.[today] || { calls: 0, characters: 0, errors: 0 };
    
    // Calculate this month's stats
    const azureThisMonth = Object.values(detailedStats.azure?.[thisMonth] || {}).reduce((total: any, day: any) => ({
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
      azure: {
        today: azureToday,
        thisMonth: azureThisMonth,
        monthlyUsage: azureUsage.monthlyUsage,
        dailyUsage: azureUsage.dailyUsage,
        monthlyLimit: azureUsage.monthlyLimit,
        dailyLimit: azureUsage.dailyLimit,
        usagePercentage: (azureUsage.monthlyUsage / azureUsage.monthlyLimit) * 100,
        estimatedCost: azureUsage.monthlyUsage > 500000 ? 
          ((azureUsage.monthlyUsage - 500000) / 1000000) * 4 : 0
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
    const azureUsage = this.getAzureUsage();
    const webSpeechUsage = this.getWebSpeechUsage();
    
    const exportData = {
      exportDate: new Date().toISOString(),
      azureUsage,
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
    localStorage.removeItem(this.azureUsageKey);
    localStorage.removeItem(this.webSpeechUsageKey);
    localStorage.removeItem(this.audioStatsKey);
  }
}

export default AudioUsageTracker;
