import React from 'react';
import { useAzureSpeech } from '../hooks/useAzureSpeech';

const AzureUsageStats: React.FC<{ className?: string }> = ({ className }) => {
  const { getRemainingUsage } = useAzureSpeech();
  const usage = getRemainingUsage();

  const dailyPercentage = (usage.dailyUsed / usage.dailyLimit) * 100;
  const monthlyPercentage = (usage.monthlyUsed / usage.monthlyLimit) * 100;

  return (
    <div className={`bg-white/5 rounded-xl p-3 ${className}`}>
      <div className="text-sm font-medium text-orange-100 mb-2">🎯 Audio Usage (Azure)</div>
      
      <div className="space-y-2">
        {/* Daily Usage */}
        <div>
          <div className="flex justify-between text-xs text-gray-300 mb-1">
            <span>Today</span>
            <span>{usage.dailyUsed.toLocaleString()} / {usage.dailyLimit.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, dailyPercentage)}%` }}
            />
          </div>
        </div>

        {/* Monthly Usage */}
        <div>
          <div className="flex justify-between text-xs text-gray-300 mb-1">
            <span>This Month</span>
            <span>{usage.monthlyUsed.toLocaleString()} / {usage.monthlyLimit.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, monthlyPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {dailyPercentage > 90 && (
        <div className="text-xs text-yellow-400 mt-2">
          ⚠️ Daily limit almost reached - switching to Web Speech API
        </div>
      )}
      
      {monthlyPercentage > 90 && (
        <div className="text-xs text-red-400 mt-2">
          🚨 Monthly limit almost reached - will use Web Speech API
        </div>
      )}

      <div className="text-xs text-gray-400 mt-2">
        Premium Azure voices with automatic fallback to browser audio
      </div>
    </div>
  );
};

export default AzureUsageStats;
