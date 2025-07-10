import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Target, Settings, X, Filter, LogOut, User } from 'lucide-react';
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
    strokeCountRange: [1, 50]
  };

  const getInitialWordState = (word: HSK1Word): WordState => ({
    ...word,
    level: 0, // 0=new, 1=learning, 2=review, 3=mastered
    correctCount: 0,
    incorrectCount: 0,
    lastReviewed: null,
    nextReview: Date.now(), // Available immediately
    interval: 1 // Days until next review
  });

  // Load progress from Firebase or initialize
  const [wordStates, setWordStates] = useState<WordState[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Initialize word states
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoadingData(true);
        
        // Load user progress from Firebase
        const userProgress = await getUserProgress(currentUser.uid);
        
        if (userProgress && Object.keys(userProgress).length > 0) {
          // Merge Firebase data with base word data
          const mergedWordStates = hsk1Words.map(word => {
            const progress = userProgress[word.id];
            if (progress) {
              return {
                ...word,
                level: progress.level,
                correctCount: progress.correctCount,
                incorrectCount: progress.incorrectCount,
                lastReviewed: progress.lastReviewed,
                nextReview: progress.nextReview,
                interval: progress.interval
              };
            }
            return getInitialWordState(word);
          });
          setWordStates(mergedWordStates);
        } else {
          // No cloud data, use initial state
          setWordStates(hsk1Words.map(getInitialWordState));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Fallback to initial state
        setWordStates(hsk1Words.map(getInitialWordState));
      } finally {
        setIsLoadingData(false);
      }
    };

    loadUserData();
  }, [currentUser]);

  const [sessionSettings, setSessionSettings] = useState<SessionSettings>(defaultSettings);
  
  // Load user settings
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!currentUser) return;
      
      try {
        const userSettings = await getUserSettings(currentUser.uid);
        if (userSettings) {
          setSessionSettings(userSettings);
        }
      } catch (error) {
        console.error('Error loading user settings:', error);
      }
    };

    loadUserSettings();
  }, [currentUser]);

  const [currentSession, setCurrentSession] = useState<WordState[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [showWordList, setShowWordList] = useState(false);
  const [wordListData, setWordListData] = useState<{ title: string; words: WordState[] }>({ title: '', words: [] });

  // Save session settings to Firebase
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
    const now = Date.now();
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
      case 'dueToday':
        words = wordStates.filter(w => w.nextReview <= now);
        title = 'Due Today';
        break;
      default:
        return;
    }

    setWordListData({ title, words });
    setShowWordList(true);
  };

  // Generate study session with custom settings
  const generateSession = () => {
    const now = Date.now();
    
    // Filter words based on session settings
    const filteredWords = wordStates.filter(word => {
      // Filter by difficulty
      if (!sessionSettings.difficulties.includes(word.difficulty)) return false;
      
      // Filter by category (if categories specified)
      if (sessionSettings.categories.length > 0 && 
          !sessionSettings.categories.includes(word.category || 'other')) return false;
      
      // Filter by level
      if (!sessionSettings.levels.includes(word.level)) return false;
      
      // Filter by stroke count
      if (word.strokeCount && 
          (word.strokeCount < sessionSettings.strokeCountRange[0] || 
           word.strokeCount > sessionSettings.strokeCountRange[1])) return false;
      
      // Filter by learning state
      if (word.level === 0 && !sessionSettings.includeNew) return false;
      if (word.level === 1 && !sessionSettings.includeLearning) return false;
      if (word.level === 2 && !sessionSettings.includeReview) return false;
      if (word.level === 3 && !sessionSettings.includeMastered) return false;
      
      return true;
    });
    
    // Get cards that are due for review from filtered words
    const dueCards = filteredWords.filter(word => word.nextReview <= now);
    
    // Smart session composition based on difficulty
    const sessionSize = sessionSettings.sessionSize;
    let sessionCards: typeof wordStates = [];
    
    if (dueCards.length >= sessionSize) {
      // If enough due cards, balance difficulty levels
      const sortedDue = dueCards.sort((a, b) => a.difficulty - b.difficulty);
      
      // 60% comfort level (difficulty 1-2), 30% medium (3), 10% challenge (4-5)
      const comfort = Math.ceil(sessionSize * 0.6);
      const medium = Math.ceil(sessionSize * 0.3);
      const challenge = sessionSize - comfort - medium;
      
      const comfortCards = sortedDue.filter(w => w.difficulty <= 2).slice(0, comfort);
      const mediumCards = sortedDue.filter(w => w.difficulty === 3).slice(0, medium);
      const challengeCards = sortedDue.filter(w => w.difficulty >= 4).slice(0, challenge);
      
      sessionCards = [...comfortCards, ...mediumCards, ...challengeCards];
    } else {
      // Add due cards first
      sessionCards = [...dueCards];
      
      // Fill remaining slots with new cards, prioritizing easier ones
      const remainingSlots = sessionSize - sessionCards.length;
      const newCards = filteredWords
        .filter(word => word.level === 0 && !sessionCards.includes(word))
        .sort((a, b) => a.difficulty - b.difficulty)
        .slice(0, remainingSlots);
      
      sessionCards = [...sessionCards, ...newCards];
      
      // If still not enough, add some review cards
      if (sessionCards.length < sessionSize) {
        const reviewCards = filteredWords
          .filter(word => word.level > 0 && !sessionCards.includes(word))
          .sort((a, b) => (a.usageFrequency || 0) - (b.usageFrequency || 0)) // Prioritize high-frequency words
          .slice(0, sessionSize - sessionCards.length);
        sessionCards = [...sessionCards, ...reviewCards];
      }
    }
    
    // Shuffle the session but keep some structure (start easy, end with challenge)
    const shuffled = sessionCards.sort(() => Math.random() - 0.5);
    
    setCurrentSession(shuffled);
    setCurrentCardIndex(0);
    setSessionComplete(false);
    setShowAnswer(false);
    setSessionStats({ correct: 0, incorrect: 0 });
  };

  // Handle card response
  const handleCardResponse = (isCorrect: boolean) => {
    const currentWord = currentSession[currentCardIndex];
    if (!currentWord) return;
    
    const now = Date.now();
    
    setWordStates(prev => prev.map(word => {
      if (word.id === currentWord.id) {
        const updated = { ...word };
        updated.lastReviewed = now;
        
        if (isCorrect) {
          updated.correctCount++;
          updated.level = Math.min(updated.level + 1, 3);
          // Increase interval: 1 day -> 3 days -> 7 days -> 14 days
          updated.interval = Math.min(updated.interval * 2.5, 14);
        } else {
          updated.incorrectCount++;
          updated.level = Math.max(updated.level - 1, 0);
          updated.interval = 1; // Reset to 1 day
        }
        
        updated.nextReview = now + (updated.interval * 24 * 60 * 60 * 1000);
        return updated;
      }
      return word;
    }));
    
    setSessionStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1)
    }));
    
    // Move to next card
    if (currentCardIndex < currentSession.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      setSessionComplete(true);
    }
  };

  // Calculate enhanced statistics
  const stats = {
    total: wordStates.length,
    new: wordStates.filter(w => w.level === 0).length,
    learning: wordStates.filter(w => w.level === 1).length,
    review: wordStates.filter(w => w.level === 2).length,
    mastered: wordStates.filter(w => w.level === 3).length,
    dueToday: wordStates.filter(w => w.nextReview <= Date.now()).length,
    
    // Difficulty breakdown
    basic: wordStates.filter(w => w.difficulty === 1 && w.level >= 1).length,
    intermediate: wordStates.filter(w => w.difficulty === 2 && w.level >= 1).length,
    advanced: wordStates.filter(w => w.difficulty >= 3 && w.level >= 1).length,
    
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

  if (isLoadingData) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (currentSession.length === 0) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white min-h-screen">
        {/* User Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {currentUser?.displayName?.charAt(0) || '?'}
            </div>
            <div>
              <div className="font-medium text-gray-800">{currentUser?.displayName || 'User'}</div>
              <div className="text-sm text-gray-500">Welcome back!</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">HSK1 学习</h1>
          <p className="text-gray-600">Master 500 essential Chinese words</p>
        </div>

        {/* Enhanced Statistics Dashboard */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => showWordsForCategory('mastered')}
            className="bg-blue-50 p-4 rounded-lg text-center hover:bg-blue-100 transition-colors cursor-pointer border border-transparent hover:border-blue-200"
            title="Click to view mastered words"
          >
            <div className="text-2xl font-bold text-blue-600">{stats.mastered}</div>
            <div className="text-sm text-blue-700">Mastered</div>
          </button>
          <button
            onClick={() => showWordsForCategory('learning')}
            className="bg-green-50 p-4 rounded-lg text-center hover:bg-green-100 transition-colors cursor-pointer border border-transparent hover:border-green-200"
            title="Click to view learning words"
          >
            <div className="text-2xl font-bold text-green-600">{stats.learning + stats.review}</div>
            <div className="text-sm text-green-700">Learning</div>
          </button>
          <button
            onClick={() => showWordsForCategory('new')}
            className="bg-yellow-50 p-4 rounded-lg text-center hover:bg-yellow-100 transition-colors cursor-pointer border border-transparent hover:border-yellow-200"
            title="Click to view new words"
          >
            <div className="text-2xl font-bold text-yellow-600">{stats.new}</div>
            <div className="text-sm text-yellow-700">New</div>
          </button>
          <button
            onClick={() => showWordsForCategory('dueToday')}
            className="bg-red-50 p-4 rounded-lg text-center hover:bg-red-100 transition-colors cursor-pointer border border-transparent hover:border-red-200"
            title="Click to view words due today"
          >
            <div className="text-2xl font-bold text-red-600">{stats.dueToday}</div>
            <div className="text-sm text-red-700">Due Today</div>
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mb-6">Click on cards above to view word lists</p>

        {/* Difficulty Breakdown */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Progress by Difficulty</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 p-3 rounded text-center">
              <div className="text-lg font-bold text-green-600">{stats.basic}</div>
              <div className="text-xs text-gray-600">Basic (Diff 1)</div>
            </div>
            <div className="bg-gray-50 p-3 rounded text-center">
              <div className="text-lg font-bold text-yellow-600">{stats.intermediate}</div>
              <div className="text-xs text-gray-600">Intermediate (Diff 2)</div>
            </div>
            <div className="bg-gray-50 p-3 rounded text-center">
              <div className="text-lg font-bold text-red-600">{stats.advanced}</div>
              <div className="text-xs text-gray-600">Advanced (Diff 3+)</div>
            </div>
          </div>
        </div>

        {/* Category Progress */}
        {stats.categories.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Top Categories Learned</h3>
            <div className="space-y-2">
              {stats.categories.map(([category, count]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-sm capitalize text-gray-600">{category}</span>
                  <span className="text-sm font-semibold text-blue-600">{String(count)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Overall Progress</span>
            <span>{Math.round((stats.mastered / stats.total) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(stats.mastered / stats.total) * 100}%` }}
            />
          </div>
        </div>

        {/* Start Session Button */}
        <div className="space-y-3">
          <button
            onClick={generateSession}
            className="w-full bg-blue-500 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Target className="w-5 h-5" />
            Start Study Session
          </button>
          
          <button
            onClick={() => setShowSettings(true)}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Settings className="w-5 h-5" />
            Customize Session
            {isCustomSettings() && (
              <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                <Filter className="w-3 h-3" />
              </span>
            )}
          </button>
        </div>
        
        <p className="text-center text-gray-500 mt-4 text-sm">
          {stats.dueToday > 0 ? `${stats.dueToday} cards due for review` : 'All caught up! 🎉'}
        </p>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Session Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Current Filters Summary */}
                {isCustomSettings() && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-2">Current Filters:</h3>
                    <div className="text-sm text-blue-700">
                      <p>Session Size: {sessionSettings.sessionSize}</p>
                      <p>Difficulties: {sessionSettings.difficulties.join(', ')}</p>
                      {sessionSettings.categories.length > 0 && (
                        <p>Categories: {sessionSettings.categories.join(', ')}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Presets */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Presets
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSessionSettings({
                        ...defaultSettings,
                        difficulties: [1, 2],
                        sessionSize: 15
                      })}
                      className="p-2 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100"
                    >
                      Easy Focus
                    </button>
                    <button
                      onClick={() => setSessionSettings({
                        ...defaultSettings,
                        difficulties: [4, 5],
                        sessionSize: 8
                      })}
                      className="p-2 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100"
                    >
                      Hard Challenge
                    </button>
                    <button
                      onClick={() => setSessionSettings({
                        ...defaultSettings,
                        includeNew: true,
                        includeLearning: false,
                        includeReview: false,
                        includeMastered: false
                      })}
                      className="p-2 text-sm bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100"
                    >
                      New Words Only
                    </button>
                    <button
                      onClick={() => setSessionSettings({
                        ...defaultSettings,
                        includeNew: false,
                        includeLearning: true,
                        includeReview: true,
                        includeMastered: false
                      })}
                      className="p-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                    >
                      Review Only
                    </button>
                  </div>
                </div>

                {/* Session Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Size
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={sessionSettings.sessionSize}
                    onChange={(e) => setSessionSettings(prev => ({
                      ...prev,
                      sessionSize: parseInt(e.target.value) || 10
                    }))}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Difficulty Levels */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Levels
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map(diff => (
                      <label key={diff} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={sessionSettings.difficulties.includes(diff)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSessionSettings(prev => ({
                                ...prev,
                                difficulties: [...prev.difficulties, diff]
                              }));
                            } else {
                              setSessionSettings(prev => ({
                                ...prev,
                                difficulties: prev.difficulties.filter(d => d !== diff)
                              }));
                            }
                          }}
                          className="mr-1"
                        />
                        <span className="text-sm">{diff}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Learning States */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Include Words
                  </label>
                  <div className="space-y-2">
                    {[
                      { key: 'includeNew', label: 'New Words' },
                      { key: 'includeLearning', label: 'Learning' },
                      { key: 'includeReview', label: 'Review' },
                      { key: 'includeMastered', label: 'Mastered' }
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={sessionSettings[key as keyof SessionSettings] as boolean}
                          onChange={(e) => setSessionSettings(prev => ({
                            ...prev,
                            [key]: e.target.checked
                          }))}
                          className="mr-2"
                        />
                        <span className="text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categories (leave empty for all)
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {getAvailableCategories().map(category => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={sessionSettings.categories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSessionSettings(prev => ({
                                ...prev,
                                categories: [...prev.categories, category]
                              }));
                            } else {
                              setSessionSettings(prev => ({
                                ...prev,
                                categories: prev.categories.filter(c => c !== category)
                              }));
                            }
                          }}
                          className="mr-1"
                        />
                        <span className="text-xs capitalize">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setSessionSettings(defaultSettings)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => {
                      setShowSettings(false);
                      generateSession();
                    }}
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Start Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Word List Modal */}
        {showWordList && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">{wordListData.title}</h2>
                <button
                  onClick={() => setShowWordList(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-3">
                {wordListData.words.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No words in this category</p>
                ) : (
                  wordListData.words.map((word) => (
                    <div key={word.id} className="border-b border-gray-100 pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-gray-800">{word.chinese}</span>
                            <span className="text-lg text-gray-600">{word.pinyin}</span>
                          </div>
                          <div className="text-sm text-blue-600 mt-1">{word.english}</div>
                          {word.french && (
                            <div className="text-sm text-green-600">{word.french}</div>
                          )}
                        </div>
                        <div className="flex flex-col items-end text-xs text-gray-500">
                          <span>Difficulty: {word.difficulty}</span>
                          {word.level > 0 && (
                            <span className="mt-1">
                              ✓{word.correctCount} ✗{word.incorrectCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="text-sm text-gray-600 text-center">
                  Total: {wordListData.words.length} words
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Session Complete!</h2>
          
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
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
            className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentCard = currentSession[currentCardIndex];
  
  if (!currentCard) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white min-h-screen">
      {/* Session Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{currentCardIndex + 1} / {currentSession.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentCardIndex + 1) / currentSession.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="relative">
        <div 
          className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-lg min-h-[400px] flex flex-col justify-center items-center cursor-pointer transition-transform hover:scale-105"
          onClick={() => setShowAnswer(!showAnswer)}
        >
          {!showAnswer ? (
            <div className="text-center">
              <div className="text-6xl font-bold text-gray-800 mb-4">
                {currentCard.chinese}
              </div>
              <div className="text-lg text-gray-600 mb-2">
                {currentCard.pinyin}
              </div>
              <div className="text-sm text-gray-500">
                {currentCard.ipa}
              </div>
              <div className="mt-8 text-gray-400 text-sm">
                Tap to reveal meaning
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-800 mb-4">
                {currentCard.chinese}
              </div>
              <div className="text-lg text-gray-600 mb-4">
                {currentCard.pinyin}
              </div>
              <div className="text-sm text-gray-500 mb-6">
                {currentCard.ipa}
              </div>
              <div className="border-t pt-6">
                <div className="text-xl font-semibold text-blue-600 mb-2">
                  {currentCard.english}
                </div>
                <div className="text-lg text-green-600">
                  {currentCard.french}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Answer Buttons */}
        {showAnswer && (
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => handleCardResponse(false)}
              className="flex-1 bg-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Again
            </button>
            <button
              onClick={() => handleCardResponse(true)}
              className="flex-1 bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              Good
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Session Stats */}
      <div className="mt-6 flex justify-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>{sessionStats.correct}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>{sessionStats.incorrect}</span>
        </div>
      </div>
    </div>
  );
};

export default HSK1FlashcardApp;
