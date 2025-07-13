import React, { useState, useEffect } from 'react';
import { Users, Activity, Volume2, Cloud, BarChart3, Calendar, TrendingUp, Database } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface UserStats {
  totalUsers: number;
  guestUsers: number;
  authenticatedUsers: number;
  activeUsersLast7Days: number;
  activeUsersLast30Days: number;
  newUsersToday: number;
  newUsersThisWeek: number;
}

interface SessionStats {
  totalSessions: number;
  sessionsToday: number;
  sessionsThisWeek: number;
  sessionsThisMonth: number;
  averageSessionLength: number;
  totalWordsStudied: number;
  averageAccuracy: number;
}

interface AudioStats {
  azureCallsToday: number;
  azureCallsThisWeek: number;
  azureCallsThisMonth: number;
  azureCharactersToday: number;
  azureCharactersThisMonth: number;
  webSpeechCallsToday: number;
  webSpeechCallsThisWeek: number;
  webSpeechCallsThisMonth: number;
  azureUsagePercentage: number;
  estimatedMonthlyCost: number;
}

interface SystemStats {
  totalWords: number;
  totalProgress: number;
  averageWordsPerUser: number;
  mostActiveCategory: string;
  topHskLevel: number;
  databaseSize: string;
  lastBackup: string;
}

const AdminDashboard: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [audioStats, setAudioStats] = useState<AudioStats | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllStats();
  }, []);

  const loadAllStats = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadUserStats(),
        loadSessionStats(),
        loadAudioStats(),
        loadSystemStats()
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      // Get all users
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      let totalUsers = 0;
      let guestUsers = 0;
      let authenticatedUsers = 0;
      let activeUsersLast7Days = 0;
      let activeUsersLast30Days = 0;
      let newUsersToday = 0;
      let newUsersThisWeek = 0;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        totalUsers++;
        
        // Check if guest user
        if (userData.isGuest || !userData.email) {
          guestUsers++;
        } else {
          authenticatedUsers++;
        }

        // Check activity
        const lastActive = userData.lastActive?.toDate() || new Date(0);
        if (lastActive > weekAgo) activeUsersLast7Days++;
        if (lastActive > monthAgo) activeUsersLast30Days++;

        // Check registration date
        const createdAt = userData.createdAt?.toDate() || new Date(0);
        if (createdAt > today) newUsersToday++;
        if (createdAt > weekAgo) newUsersThisWeek++;
      });

      setUserStats({
        totalUsers,
        guestUsers,
        authenticatedUsers,
        activeUsersLast7Days,
        activeUsersLast30Days,
        newUsersToday,
        newUsersThisWeek
      });
    } catch (err) {
      console.error('Error loading user stats:', err);
    }
  };

  const loadSessionStats = async () => {
    try {
      // Get all user progress documents
      const progressRef = collection(db, 'userProgress');
      const progressSnapshot = await getDocs(progressRef);
      
      let totalSessions = 0;
      let sessionsToday = 0;
      let sessionsThisWeek = 0;
      let sessionsThisMonth = 0;
      let totalSessionTime = 0;
      let totalWordsStudied = 0;
      let totalCorrect = 0;
      let totalAnswers = 0;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      progressSnapshot.forEach((doc) => {
        const data = doc.data();
        const wordStates = data.wordStates || [];
        
        wordStates.forEach((word: any) => {
          const sessionCount = (word.correctCount || 0) + (word.incorrectCount || 0);
          totalSessions += sessionCount;
          totalCorrect += word.correctCount || 0;
          totalAnswers += sessionCount;
          totalWordsStudied++;

          // Check recent activity
          const lastReviewed = word.lastReviewed ? new Date(word.lastReviewed) : new Date(0);
          if (lastReviewed > today) sessionsToday += sessionCount;
          if (lastReviewed > weekAgo) sessionsThisWeek += sessionCount;
          if (lastReviewed > monthAgo) sessionsThisMonth += sessionCount;
        });

        totalSessionTime += data.totalLearningTime || 0;
      });

      setSessionStats({
        totalSessions,
        sessionsToday,
        sessionsThisWeek,
        sessionsThisMonth,
        averageSessionLength: totalSessions > 0 ? totalSessionTime / totalSessions : 0,
        totalWordsStudied,
        averageAccuracy: totalAnswers > 0 ? (totalCorrect / totalAnswers) * 100 : 0
      });
    } catch (err) {
      console.error('Error loading session stats:', err);
    }
  };

  const loadAudioStats = async () => {
    try {
      // Load from localStorage (since we're tracking Azure usage locally)
      const azureUsage = JSON.parse(localStorage.getItem('azureSpeechUsage') || '{"monthlyUsage": 0, "dailyUsage": 0}');
      const webSpeechUsage = JSON.parse(localStorage.getItem('webSpeechUsage') || '{"monthlyUsage": 0, "dailyUsage": 0}');
      
      // Load from Firebase if users are storing audio stats there
      const audioStatsRef = collection(db, 'audioStats');
      const audioSnapshot = await getDocs(audioStatsRef);
      
      let azureCallsTotal = 0;
      let webSpeechCallsTotal = 0;
      let azureCharactersTotal = 0;

      audioSnapshot.forEach((doc) => {
        const data = doc.data();
        azureCallsTotal += data.azureCalls || 0;
        webSpeechCallsTotal += data.webSpeechCalls || 0;
        azureCharactersTotal += data.azureCharacters || 0;
      });

      const azureUsagePercentage = (azureUsage.monthlyUsage / 450000) * 100; // 450k limit
      const estimatedMonthlyCost = azureUsage.monthlyUsage > 500000 ? 
        ((azureUsage.monthlyUsage - 500000) / 1000000) * 4 : 0; // $4 per 1M chars after free tier

      setAudioStats({
        azureCallsToday: 0, // Would need more detailed tracking
        azureCallsThisWeek: 0,
        azureCallsThisMonth: azureCallsTotal,
        azureCharactersToday: azureUsage.dailyUsage,
        azureCharactersThisMonth: azureUsage.monthlyUsage,
        webSpeechCallsToday: 0,
        webSpeechCallsThisWeek: 0,
        webSpeechCallsThisMonth: webSpeechUsage.monthlyUsage || 0,
        azureUsagePercentage,
        estimatedMonthlyCost
      });
    } catch (err) {
      console.error('Error loading audio stats:', err);
    }
  };

  const loadSystemStats = async () => {
    try {
      // Load from HSK database
      const hskWords = 2219; // Your total word count
      
      // Get database metrics
      const progressRef = collection(db, 'userProgress');
      const progressSnapshot = await getDocs(progressRef);
      
      let totalProgress = 0;
      let categoryStats: Record<string, number> = {};
      let hskLevelStats: Record<number, number> = {};

      progressSnapshot.forEach((doc) => {
        const data = doc.data();
        const wordStates = data.wordStates || [];
        
        wordStates.forEach((word: any) => {
          if (word.level > 0) totalProgress++;
          
          const category = word.category || 'other';
          categoryStats[category] = (categoryStats[category] || 0) + 1;
          
          const hskLevel = word.hskLevel || 1;
          hskLevelStats[hskLevel] = (hskLevelStats[hskLevel] || 0) + 1;
        });
      });

      const mostActiveCategory = Object.entries(categoryStats)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown';
      
      const topHskLevel = Object.entries(hskLevelStats)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || '1';

      setSystemStats({
        totalWords: hskWords,
        totalProgress,
        averageWordsPerUser: userStats ? totalProgress / Math.max(1, userStats.totalUsers) : 0,
        mostActiveCategory,
        topHskLevel: parseInt(topHskLevel),
        databaseSize: `${progressSnapshot.size} documents`,
        lastBackup: new Date().toISOString().split('T')[0] || new Date().toLocaleDateString()
      });
    } catch (err) {
      console.error('Error loading system stats:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading admin dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🛠️ Admin Dashboard</h1>
          <p className="text-gray-300">HSK Flashcards Analytics & Monitoring</p>
          <button 
            onClick={loadAllStats}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            🔄 Refresh Data
          </button>
        </div>

        {/* User Statistics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Users size={24} /> User Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Users" 
              value={userStats?.totalUsers || 0}
              icon={<Users />}
              color="blue"
            />
            <StatCard 
              title="Authenticated" 
              value={userStats?.authenticatedUsers || 0}
              icon={<Database />}
              color="green"
            />
            <StatCard 
              title="Guest Users" 
              value={userStats?.guestUsers || 0}
              icon={<Activity />}
              color="yellow"
            />
            <StatCard 
              title="Active (7 days)" 
              value={userStats?.activeUsersLast7Days || 0}
              icon={<TrendingUp />}
              color="purple"
            />
          </div>
        </div>

        {/* Session Statistics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 size={24} /> Session Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Sessions" 
              value={sessionStats?.totalSessions || 0}
              icon={<Activity />}
              color="blue"
            />
            <StatCard 
              title="Sessions Today" 
              value={sessionStats?.sessionsToday || 0}
              icon={<Calendar />}
              color="green"
            />
            <StatCard 
              title="Words Studied" 
              value={sessionStats?.totalWordsStudied || 0}
              icon={<Database />}
              color="yellow"
            />
            <StatCard 
              title="Avg Accuracy" 
              value={`${(sessionStats?.averageAccuracy || 0).toFixed(1)}%`}
              icon={<TrendingUp />}
              color="purple"
            />
          </div>
        </div>

        {/* Audio Statistics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Volume2 size={24} /> Audio API Usage
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Azure Characters (Month)" 
              value={audioStats?.azureCharactersThisMonth || 0}
              icon={<Cloud />}
              color="blue"
              subtitle={`${(audioStats?.azureUsagePercentage || 0).toFixed(1)}% of limit`}
            />
            <StatCard 
              title="Azure Characters (Today)" 
              value={audioStats?.azureCharactersToday || 0}
              icon={<Cloud />}
              color="green"
            />
            <StatCard 
              title="Web Speech Calls" 
              value={audioStats?.webSpeechCallsThisMonth || 0}
              icon={<Volume2 />}
              color="yellow"
            />
            <StatCard 
              title="Estimated Cost" 
              value={`$${(audioStats?.estimatedMonthlyCost || 0).toFixed(2)}`}
              icon={<TrendingUp />}
              color="purple"
            />
          </div>
        </div>

        {/* System Statistics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Database size={24} /> System Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total HSK Words" 
              value={systemStats?.totalWords || 0}
              icon={<Database />}
              color="blue"
            />
            <StatCard 
              title="Words in Progress" 
              value={systemStats?.totalProgress || 0}
              icon={<TrendingUp />}
              color="green"
            />
            <StatCard 
              title="Most Popular Category" 
              value={systemStats?.mostActiveCategory || 'N/A'}
              icon={<Activity />}
              color="yellow"
              isString
            />
            <StatCard 
              title="Top HSK Level" 
              value={systemStats?.topHskLevel || 1}
              icon={<BarChart3 />}
              color="purple"
            />
          </div>
        </div>

        {/* Usage Charts would go here */}
        <div className="bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">🚀 Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              📊 Export User Data
            </button>
            <button className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              🗄️ Backup Database
            </button>
            <button className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              📈 Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// StatCard Component
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  subtitle?: string;
  isString?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle, isString }) => {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-400',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-6`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">
        {isString ? value : typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-sm text-gray-300 mb-1">{title}</div>
      {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
    </div>
  );
};

export default AdminDashboard;
