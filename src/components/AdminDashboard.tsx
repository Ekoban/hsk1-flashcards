import React, { useState, useEffect } from 'react';
import { Users, Activity, Volume2, Cloud, BarChart3, Calendar, TrendingUp, Database } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from '../firebase';
import { isAdminEmail } from '../config/admin';

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
  const [authenticated, setAuthenticated] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [needsSignIn, setNeedsSignIn] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔐 Auth state changed:', {
        user: user ? {
          email: user.email,
          uid: user.uid,
          displayName: user.displayName
        } : null
      });

      if (user) {
        setAuthenticated(true);
        console.log('✅ User authenticated, checking admin status...');
        
        // Check if this is the admin user
        const isAdmin = isAdminEmail(user.email || '');
        console.log('🛡️ Admin check result:', {
          userEmail: user.email,
          isAdmin: isAdmin
        });

        if (isAdmin) {
          console.log('🎯 Admin access granted');
          setIsAdminUser(true);
          setNeedsSignIn(false);
          loadAllStats(); // Load stats only for admin
        } else {
          console.log('❌ Admin access denied');
          setIsAdminUser(false);
          setError('Access denied. Admin privileges required.');
          setLoading(false);
        }
      } else {
        console.log('🚫 No user authenticated');
        setAuthenticated(false);
        setIsAdminUser(false);
        setNeedsSignIn(true);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      console.log('🔑 Starting Google sign-in...');
      setLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      const result = await signInWithPopup(auth, provider);
      console.log('✅ Google sign-in successful:', {
        user: result.user.email,
        uid: result.user.uid
      });
    } catch (err) {
      console.error('❌ Sign in error:', err);
      setError('Failed to sign in with Google. Please try again.');
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const loadAllStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if authenticated as admin
      if (!auth.currentUser || !isAdminUser) {
        setError('Admin authentication required');
        return;
      }

      // Double-check email for security
      if (!isAdminEmail(auth.currentUser.email || '')) {
        setError('Access denied: Invalid admin credentials');
        return;
      }

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
      // Set fallback stats when there's an error
      setUserStats({
        totalUsers: 0,
        guestUsers: 0,
        authenticatedUsers: 0,
        activeUsersLast7Days: 0,
        activeUsersLast30Days: 0,
        newUsersToday: 0,
        newUsersThisWeek: 0
      });
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
      // Set fallback stats when there's an error
      setSessionStats({
        totalSessions: 0,
        sessionsToday: 0,
        sessionsThisWeek: 0,
        sessionsThisMonth: 0,
        averageSessionLength: 0,
        totalWordsStudied: 0,
        averageAccuracy: 0
      });
    }
  };

  const loadAudioStats = async () => {
    try {
      // Simplified audio stats - only Web Speech API for now
      const webSpeechUsage = JSON.parse(localStorage.getItem('webSpeechUsage') || '{"monthlyUsage": 0, "dailyUsage": 0}');
      
      setAudioStats({
        azureCallsToday: 0, // Disabled
        azureCallsThisWeek: 0, // Disabled
        azureCallsThisMonth: 0, // Disabled
        azureCharactersToday: 0, // Disabled
        azureCharactersThisMonth: 0, // Disabled
        webSpeechCallsToday: 0,
        webSpeechCallsThisWeek: 0,
        webSpeechCallsThisMonth: webSpeechUsage.monthlyUsage || 0,
        azureUsagePercentage: 0, // Disabled
        estimatedMonthlyCost: 0 // Free with Web Speech API only
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
      // Set fallback stats when there's an error
      setSystemStats({
        totalWords: 2219,
        totalProgress: 0,
        averageWordsPerUser: 0,
        mostActiveCategory: 'N/A',
        topHskLevel: 1,
        databaseSize: 'No access',
        lastBackup: new Date().toISOString().split('T')[0] || new Date().toLocaleDateString()
      });
    }
  };

  if (needsSignIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <div className="bg-gray-800/50 rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">🛠️ Admin Access</h1>
            <p className="text-gray-300 mb-6">
              This dashboard requires administrator authentication. Please sign in with your authorized Google account.
            </p>
            <button
              onClick={handleGoogleSignIn}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
            <p className="text-xs text-gray-400 mt-4">
              Restricted to authorized administrators only
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Loading admin dashboard...</div>
          <div className="text-gray-300 text-sm">
            {authenticated ? 'Authenticated ✓ Loading data...' : 'Checking authentication...'}
          </div>
        </div>
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
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">🛠️ Admin Dashboard</h1>
              <p className="text-gray-300">HSK Flashcards Analytics & Monitoring</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Signed in as:</p>
              <p className="text-green-400 font-medium">{auth.currentUser?.email}</p>
              <button
                onClick={handleSignOut}
                className="mt-1 text-xs text-gray-400 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={loadAllStats}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              🔄 Refresh Data
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-600/20 text-green-400 rounded-lg text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              Admin Access Verified
            </div>
          </div>
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
            <Volume2 size={24} /> Audio API Usage (Web Speech Only)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Azure Service" 
              value="Disabled"
              icon={<Cloud />}
              color="blue"
              subtitle="Currently not configured"
              isString
            />
            <StatCard 
              title="Web Speech Calls" 
              value={audioStats?.webSpeechCallsThisMonth || 0}
              icon={<Volume2 />}
              color="green"
            />
            <StatCard 
              title="Cost" 
              value="$0.00"
              icon={<TrendingUp />}
              color="yellow"
              subtitle="Free with Web Speech API"
            />
            <StatCard 
              title="Status" 
              value="Active"
              icon={<Activity />}
              color="purple"
              subtitle="Web Speech API working"
              isString
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
