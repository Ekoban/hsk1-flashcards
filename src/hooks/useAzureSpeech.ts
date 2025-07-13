import { useState, useCallback } from 'react';

interface AzureSpeechConfig {
  monthlyLimit: number;
  dailyLimit: number;
  fallbackToWebSpeech: boolean;
}

interface UsageStats {
  monthlyUsage: number;
  dailyUsage: number;
  lastResetDate: string;
}

const DEFAULT_CONFIG: AzureSpeechConfig = {
  monthlyLimit: 450000,  // 90% of free tier (500k)
  dailyLimit: 15000,     // Spread usage evenly
  fallbackToWebSpeech: true
};

export const useAzureSpeech = (config: AzureSpeechConfig = DEFAULT_CONFIG) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats>(() => {
    const saved = localStorage.getItem('azureSpeechUsage');
    return saved ? JSON.parse(saved) : {
      monthlyUsage: 0,
      dailyUsage: 0,
      lastResetDate: new Date().toISOString().split('T')[0]
    };
  });

  const saveUsageStats = useCallback((stats: UsageStats) => {
    localStorage.setItem('azureSpeechUsage', JSON.stringify(stats));
    setUsageStats(stats);
  }, []);

  const resetDailyUsageIfNeeded = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const lastResetMonth = new Date(usageStats.lastResetDate).getMonth();
    
    let newStats = { ...usageStats };
    
    // Reset daily usage if it's a new day
    if (usageStats.lastResetDate !== today) {
      newStats.dailyUsage = 0;
      newStats.lastResetDate = today!;
    }
    
    // Reset monthly usage if it's a new month
    if (currentMonth !== lastResetMonth) {
      newStats.monthlyUsage = 0;
    }
    
    if (newStats !== usageStats) {
      saveUsageStats(newStats);
    }
    
    return newStats;
  }, [usageStats, saveUsageStats]);

  const canUseAzure = useCallback((textLength: number): boolean => {
    const currentStats = resetDailyUsageIfNeeded();
    
    // Check if this request would exceed limits
    const wouldExceedDaily = currentStats.dailyUsage + textLength > config.dailyLimit;
    const wouldExceedMonthly = currentStats.monthlyUsage + textLength > config.monthlyLimit;
    
    return !wouldExceedDaily && !wouldExceedMonthly;
  }, [config, resetDailyUsageIfNeeded]);

  const updateUsage = useCallback((textLength: number) => {
    const currentStats = resetDailyUsageIfNeeded();
    const newStats = {
      ...currentStats,
      dailyUsage: currentStats.dailyUsage + textLength,
      monthlyUsage: currentStats.monthlyUsage + textLength
    };
    saveUsageStats(newStats);
  }, [resetDailyUsageIfNeeded, saveUsageStats]);

  const speakWithAzure = useCallback(async (text: string, rate: number = 1.0): Promise<boolean> => {
    const textLength = text.length;
    
    if (!canUseAzure(textLength)) {
      console.log('Azure usage limit reached, falling back to Web Speech API');
      return false; // Signal to use fallback
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/azure-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          rate,
          voice: 'zh-CN-XiaoxiaoNeural', // High-quality Chinese voice
          lang: 'zh-CN'
        })
      });

      if (!response.ok) {
        throw new Error(`Azure Speech API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      // Play the audio
      await audio.play();
      
      // Update usage stats
      updateUsage(textLength);
      
      // Clean up the blob URL
      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl);
      });
      
      return true; // Success
    } catch (err) {
      console.error('Azure Speech error:', err);
      setError(err instanceof Error ? err.message : 'Azure Speech failed');
      return false; // Signal to use fallback
    } finally {
      setIsLoading(false);
    }
  }, [canUseAzure, updateUsage]);

  const getRemainingUsage = useCallback(() => {
    const currentStats = resetDailyUsageIfNeeded();
    return {
      dailyRemaining: Math.max(0, config.dailyLimit - currentStats.dailyUsage),
      monthlyRemaining: Math.max(0, config.monthlyLimit - currentStats.monthlyUsage),
      dailyUsed: currentStats.dailyUsage,
      monthlyUsed: currentStats.monthlyUsage,
      dailyLimit: config.dailyLimit,
      monthlyLimit: config.monthlyLimit
    };
  }, [config, resetDailyUsageIfNeeded]);

  return {
    speakWithAzure,
    canUseAzure,
    getRemainingUsage,
    isLoading,
    error,
    usageStats
  };
};
