import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Target, Settings, X, Filter, LogOut } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../contexts/AuthContext';
import { saveUserProgress, getUserProgress, saveUserSettings, getUserSettings } from '../services/dataService';
import hsk1Words from '../data/hsk1-words.json';

const HSK1FlashcardApp = () => {
  const { currentUser, logout } = useAuth();
  
  // Load HSK1 words from JSON
  // Learning algorithm: Spaced Repetition System (SRS)
  type HSK1Word = {
    id: number;
    chinese: string;
    pinyin: string;
    ipa?: string;
    english: string;
    french?: string;
    difficulty: number;
    usageFrequency?: number;
    category?: string;
    strokeCount?: number;
  };

  type WordState = HSK1Word & {
    level: number;
    correctCount: number;
    incorrectCount: number;
    lastReviewed: number | null;
    nextReview: number;
    interval: number;
  };

  type SessionSettings = {
    sessionSize: number;
    difficulties: number[];
    categories: string[];
    levels: number[];
    includeNew: boolean;
    includeLearning: boolean;
    includeReview: boolean;
    includeMastered: boolean;
    strokeCountRange: [number, number];
  };

  const defaultSettings: SessionSettings = {
    sessionSize: 10,
    difficulties: [1, 2, 3, 4, 5],
    categories: [],
    levels: [0, 1, 2, 3],
    includeNew: true,
    includeLearning: true,
    includeReview: true,
    includeMastered: false,
    strokeCountRange: [1, 20]
  };

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [wordStates, setWordStates] = useState<WordState[]>([]);
  const [sessionSettings, setSessionSettings] = useState<SessionSettings>(defaultSettings);
  const [currentSession, setCurrentSession] = useState<WordState[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });
  const [sessionComplete, setSessionComplete] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWordList, setShowWordList] = useState(false);
  const [wordListData, setWordListData] = useState<{ title: string; words: WordState[] }>({ title: '', words: [] });
  const [showFilter, setShowFilter] = useState(false);

  // Initialize word states from HSK1 data
  useEffect(() => {
    const initializeWordStates = () => {
      const initialStates: WordState[] = hsk1Words.words.map(word => ({
        ...word,
        level: 0, // New word
        correctCount: 0,
        incorrectCount: 0,
        lastReviewed: null,
        nextReview: Date.now(),
        interval: 1
      }));
      setWordStates(initialStates);
      setIsLoadingData(false);
    };

    initializeWordStates();
  }, []);

  // Load user progress from Firebase
  useEffect(() => {
    const loadUserProgress = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoadingData(true);
        const savedProgress = await getUserProgress(currentUser.uid);
        if (savedProgress && savedProgress.length > 0) {
          setWordStates(savedProgress);
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadUserProgress();
  }, [currentUser]);

  // Load user settings from Firebase
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!currentUser) return;
      
      try {
        const savedSettings = await getUserSettings(currentUser.uid);
        if (savedSettings) {
          setSessionSettings(savedSettings);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadUserSettings();
  }, [currentUser]);

  // Save settings to Firebase when changed
  useEffect(() => {
    const saveSettings = async () => {
      if (!currentUser || JSON.stringify(sessionSettings) === JSON.stringify(defaultSettings)) return;
      
      try {
        await saveUserSettings(currentUser.uid, sessionSettings);
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    };

    saveSettings();
  }, [sessionSettings, currentUser]);

  // Save progress to Firebase (debounced)
  useEffect(() => {
    const saveProgress = async () => {
      if (!currentUser || wordStates.length === 0) return;
      
      try {
        await saveUserProgress(currentUser.uid, wordStates);
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    };

    // Debounce saving to avoid too many writes
    const timeoutId = setTimeout(saveProgress, 1000);
    return () => clearTimeout(timeoutId);
  }, [wordStates, currentUser]);

  // Get available categories
  const getAvailableCategories = () => {
    return Array.from(new Set(wordStates.map(w => w.category || 'other'))).sort();
  };

  // Check if custom settings are applied
  const isCustomSettings = () => {
    return JSON.stringify(sessionSettings) !== JSON.stringify(defaultSettings);
  };

  // Show word list for a specific category
  const showWordsForCategory = (category: string) => {
    let words: WordState[] = [];
    let title = '';

    switch (category) {
      case 'mastered':
        words = wordStates.filter(w => w.level === 3);
        title = 'Mastered Words';
        break;
      case 'learning':
        words = wordStates.filter(w => w.level === 1);
        title = 'Learning Words';
        break;
      case 'review':
        words = wordStates.filter(w => w.level === 2);
        title = 'Review Words';
        break;
      case 'new':
        words = wordStates.filter(w => w.level === 0);
        title = 'New Words';
        break;
      default:
        words = wordStates.filter(w => (w.category || 'other') === category);
        title = `${category.charAt(0).toUpperCase() + category.slice(1)} Words`;
    }

    setWordListData({ title, words });
    setShowWordList(true);
  };

  // Get words for session based on settings
  const getSessionWords = () => {
    const now = Date.now();
    let candidates: WordState[] = [];

    // Filter by inclusion settings
    if (sessionSettings.includeNew) {
      candidates = candidates.concat(wordStates.filter(w => w.level === 0));
    }
    if (sessionSettings.includeLearning) {
      candidates = candidates.concat(wordStates.filter(w => w.level === 1));
    }
    if (sessionSettings.includeReview) {
      candidates = candidates.concat(wordStates.filter(w => w.level === 2 && w.nextReview <= now));
    }
    if (sessionSettings.includeMastered) {
      candidates = candidates.concat(wordStates.filter(w => w.level === 3 && w.nextReview <= now));
    }

    // Filter by difficulty
    candidates = candidates.filter(w => sessionSettings.difficulties.includes(w.difficulty));

    // Filter by category
    if (sessionSettings.categories.length > 0) {
      candidates = candidates.filter(w => sessionSettings.categories.includes(w.category || 'other'));
    }

    // Filter by stroke count
    candidates = candidates.filter(w => {
      const strokeCount = w.strokeCount || 5;
      return strokeCount >= sessionSettings.strokeCountRange[0] && strokeCount <= sessionSettings.strokeCountRange[1];
    });

    // Sort by priority (new words first, then by next review time)
    candidates.sort((a, b) => {
      if (a.level === 0 && b.level !== 0) return -1;
      if (a.level !== 0 && b.level === 0) return 1;
      return a.nextReview - b.nextReview;
    });

    return candidates.slice(0, sessionSettings.sessionSize);
  };

  // Start a new session
  const startSession = () => {
    const sessionWords = getSessionWords();
    if (sessionWords.length === 0) {
      alert('No words available for practice with current settings!');
      return;
    }
    
    setCurrentSession(sessionWords);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setSessionStats({ correct: 0, incorrect: 0 });
    setSessionComplete(false);
  };

  // Handle answer
  const handleAnswer = (isCorrect: boolean) => {
    const currentWord = currentSession[currentCardIndex];
    const now = Date.now();
    
    // Update session stats
    setSessionStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1)
    }));

    // Update word state using SRS algorithm
    const updatedWordStates = wordStates.map(word => {
      if (word.id === currentWord.id) {
        let newLevel = word.level;
        let newInterval = word.interval;
        
        if (isCorrect) {
          newLevel = Math.min(3, word.level + 1);
          newInterval = Math.max(1, word.interval * 2);
        } else {
          newLevel = Math.max(0, word.level - 1);
          newInterval = 1;
        }
        
        return {
          ...word,
          level: newLevel,
          correctCount: word.correctCount + (isCorrect ? 1 : 0),
          incorrectCount: word.incorrectCount + (isCorrect ? 0 : 1),
          lastReviewed: now,
          nextReview: now + (newInterval * 24 * 60 * 60 * 1000),
          interval: newInterval
        };
      }
      return word;
    });

    setWordStates(updatedWordStates);

    // Check for milestones and trigger confetti
    if (isCorrect) {
      const correctCount = sessionStats.correct + 1;
      if (correctCount === 5 || correctCount === 10 || correctCount === 15) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }

    // Move to next card or complete session
    if (currentCardIndex < currentSession.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      setSessionComplete(true);
    }
  };

  // Calculate study streak
  const getStudyStreak = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const reviewedWords = wordStates.filter(w => w.lastReviewed);
    const reviewDates = reviewedWords.map(w => {
      const date = new Date(w.lastReviewed!);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    });
    
    const uniqueDates = [...new Set(reviewDates)].sort((a, b) => b - a);
    
    let streak = 0;
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    for (let i = 0; i < uniqueDates.length; i++) {
      const expectedDate = today.getTime() - (i * oneDayMs);
      if (uniqueDates[i] === expectedDate) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Calculate user stats
  const getUserStats = () => {
    const totalWords = wordStates.length;
    const newWords = wordStates.filter(w => w.level === 0).length;
    const learningWords = wordStates.filter(w => w.level === 1).length;
    const reviewWords = wordStates.filter(w => w.level === 2).length;
    const masteredWords = wordStates.filter(w => w.level === 3).length;
    
    const studyStreak = getStudyStreak();
    
    return {
      totalWords,
      newWords,
      learningWords,
      reviewWords,
      masteredWords,
      studyStreak,
      totalSessions: Math.floor(wordStates.reduce((sum, w) => sum + w.correctCount + w.incorrectCount, 0) / sessionSettings.sessionSize),
      accuracy: wordStates.reduce((sum, w) => sum + w.correctCount, 0) / Math.max(1, wordStates.reduce((sum, w) => sum + w.correctCount + w.incorrectCount, 0)) * 100,
      // Category progress (top categories)
      categories: Object.entries(
        wordStates.reduce((acc, word) => {
          if (word.level >= 2) { // Only count learned words
            acc[word.category || 'other'] = (acc[word.category || 'other'] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>)
      ).sort(([,a], [,b]) => (b as number) - (a as number)).slice(0, 6)
    };
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-md mx-auto p-6 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 relative mx-auto mb-6">
              <div className="w-16 h-16 border-4 border-gradient-to-r from-indigo-400 to-purple-400 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-gradient-to-r from-purple-400 to-pink-400 border-t-transparent rounded-full animate-spin opacity-30" style={{animationDelay: '0.3s'}}></div>
            </div>
            <p className="text-gray-700 font-medium">Loading your progress...</p>
          </div>
        </div>
      </div>
    );
  }

  // Session complete check
  if (sessionComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-md mx-auto p-6 flex items-center justify-center min-h-screen">
          <div className="text-center bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Session Complete!
            </h2>
            
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{sessionStats.correct}</div>
                  <div className="text-sm text-gray-600">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{sessionStats.incorrect}</div>
                  <div className="text-sm text-gray-600">Incorrect</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-700">
                  {Math.round((sessionStats.correct / (sessionStats.correct + sessionStats.incorrect)) * 100)}% Accuracy
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentSession([])}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Flashcard session active
  if (currentSession.length > 0) {
    const currentCard = currentSession[currentCardIndex];
    
    if (!currentCard) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <div className="max-w-md mx-auto p-6 flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-16 h-16 relative mx-auto mb-6">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading flashcard...</h2>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-md mx-auto p-6">
          {/* Session Progress */}
          <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/20">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{currentCardIndex + 1} / {currentSession.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentCardIndex + 1) / currentSession.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Flashcard */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 mb-6">
            <div className="text-center">
              {!showAnswer ? (
                <div>
                  <div className="text-6xl mb-6 font-bold text-gray-800">{currentCard.chinese}</div>
                  <div className="text-xl text-gray-600 mb-8 font-medium">{currentCard.pinyin}</div>
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Show Answer
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-6xl mb-4 font-bold text-gray-800">{currentCard.chinese}</div>
                  <div className="text-xl text-gray-600 mb-4 font-medium">{currentCard.pinyin}</div>
                  <div className="text-2xl font-bold text-green-600 mb-8">{currentCard.english}</div>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleAnswer(false)}
                      className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white py-4 px-6 rounded-2xl font-semibold hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Incorrect
                    </button>
                    <button
                      onClick={() => handleAnswer(true)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Correct
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/20">
            <button
              onClick={() => {
                setCurrentSession([]);
                setCurrentCardIndex(0);
                setShowAnswer(false);
                setSessionStats({ correct: 0, incorrect: 0 });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md"
            >
              <ChevronLeft size={20} />
              Back
            </button>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">{sessionStats.correct}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="font-medium">{sessionStats.incorrect}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentSession.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-md mx-auto p-6">
          {/* User Header */}
          <div className="flex items-center justify-between mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {currentUser?.displayName?.charAt(0) || '?'}
              </div>
              <div>
                <div className="font-semibold text-gray-800">{currentUser?.displayName || 'User'}</div>
                <div className="text-sm text-gray-500">Welcome back! 👋</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-md"
            >
              <LogOut size={16} />
              <span className="text-sm">Logout</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/20">
              <div className="text-2xl font-bold text-indigo-600">{getUserStats().studyStreak}</div>
              <div className="text-sm text-gray-600">Study Streak</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/20">
              <div className="text-2xl font-bold text-purple-600">{getUserStats().masteredWords}</div>
              <div className="text-sm text-gray-600">Mastered</div>
            </div>
          </div>

          {/* Start Session Button */}
          <div className="mb-6">
            <button
              onClick={startSession}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start Study Session
            </button>
            {isCustomSettings() && (
              <div className="mt-2 text-center text-sm text-gray-600">
                Custom settings applied
              </div>
            )}
          </div>

          {/* Session Settings */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setShowSettings(true)}
              className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/20 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <Settings size={20} className="text-gray-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-800">Settings</div>
                  <div className="text-sm text-gray-600">{sessionSettings.sessionSize} cards</div>
                </div>
              </div>
            </button>
            <button
              onClick={() => setShowFilter(true)}
              className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white/20 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <Filter size={20} className="text-gray-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-800">Filters</div>
                  <div className="text-sm text-gray-600">{sessionSettings.difficulties.length} levels</div>
                </div>
              </div>
            </button>
          </div>

          {/* Progress Overview */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Progress Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
                onClick={() => showWordsForCategory('new')}
              >
                <div className="text-2xl font-bold text-blue-600">{getUserStats().newWords}</div>
                <div className="text-sm text-gray-600">New Words</div>
              </div>
              <div 
                className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl cursor-pointer hover:from-orange-100 hover:to-red-100 transition-all duration-200"
                onClick={() => showWordsForCategory('learning')}
              >
                <div className="text-2xl font-bold text-orange-600">{getUserStats().learningWords}</div>
                <div className="text-sm text-gray-600">Learning</div>
              </div>
              <div 
                className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl cursor-pointer hover:from-yellow-100 hover:to-amber-100 transition-all duration-200"
                onClick={() => showWordsForCategory('review')}
              >
                <div className="text-2xl font-bold text-yellow-600">{getUserStats().reviewWords}</div>
                <div className="text-sm text-gray-600">Review</div>
              </div>
              <div 
                className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl cursor-pointer hover:from-green-100 hover:to-emerald-100 transition-all duration-200"
                onClick={() => showWordsForCategory('mastered')}
              >
                <div className="text-2xl font-bold text-green-600">{getUserStats().masteredWords}</div>
                <div className="text-sm text-gray-600">Mastered</div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Words</span>
                <span className="font-medium">{getUserStats().totalWords}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Accuracy</span>
                <span className="font-medium">{getUserStats().accuracy.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sessions</span>
                <span className="font-medium">{getUserStats().totalSessions}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default HSK1FlashcardApp;
