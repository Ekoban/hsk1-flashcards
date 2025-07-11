import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Settings, LogOut } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../contexts/AuthContext';
import { saveUserProgress, getUserProgress, saveUserSettings, getUserSettings } from '../services/dataService';
import hsk1Words from '../data/hsk1-words.json';

const HSK1FlashcardApp = () => {
  const { currentUser, logout, isGuestMode } = useAuth();
  
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
    showPinyin: boolean;
    showIPA: boolean;
    showEnglish: boolean;
    showFrench: boolean;
  };

  const defaultSettings: SessionSettings = {
    sessionSize: 10,
    difficulties: [1, 2, 3, 4],
    categories: [],
    levels: [0, 1, 2, 3],
    includeNew: true,
    includeLearning: true,
    includeReview: true,
    includeMastered: false,
    strokeCountRange: [1, 20],
    showPinyin: true,
    showIPA: true,
    showEnglish: true,
    showFrench: true
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
  const [wordListData, setWordListData] = useState<{ title: string; words: WordState[]; description?: string }>({ title: '', words: [] });
  const [levelChangeMessage, setLevelChangeMessage] = useState<string>('');
  const [sessionElapsed, setSessionElapsed] = useState<number>(0);
  const [totalLearningTime, setTotalLearningTime] = useState<number>(0);

  // Initialize word states from HSK1 data
  const initializeWordStates = () => {
    const initialStates: WordState[] = hsk1Words.map((word: HSK1Word) => ({
      ...word,
      level: 0, // New word
      correctCount: 0,
      incorrectCount: 0,
      lastReviewed: null,
      nextReview: Date.now(),
      interval: 1
    }));
    console.log('Initializing with HSK1 words count:', hsk1Words.length);
    console.log('Initial states count:', initialStates.length);
    
    setWordStates(initialStates);
    setIsLoadingData(false);
  };

  // Load user progress from Firebase or localStorage
  useEffect(() => {
    const loadUserProgress = async () => {
      if (currentUser) {
        // Load from Firestore for authenticated users
        try {
          setIsLoadingData(true);
          const savedProgress = await getUserProgress(currentUser.uid);
          console.log('Firebase saved progress:', savedProgress);
          console.log('Saved progress type:', typeof savedProgress);
          console.log('Saved progress keys:', savedProgress ? Object.keys(savedProgress) : 'null');
          
          if (savedProgress) {
            // Convert Firebase data to array format
            let progressArray: any[];
            if (Array.isArray(savedProgress)) {
              progressArray = savedProgress;
            } else {
              // Filter out entries with undefined or invalid IDs and merge with HSK1 word data
              const validProgressEntries = Object.entries(savedProgress)
                .filter(([key, value]) => key !== 'undefined' && !isNaN(Number(key)) && value);
              
              // Create a map of progress data by ID
              const progressMap = new Map();
              validProgressEntries.forEach(([key, value]) => {
                progressMap.set(Number(key), value);
              });
              
              // Merge HSK1 words with progress data
              progressArray = hsk1Words.map((word: HSK1Word) => {
                const progressData = progressMap.get(word.id);
                if (progressData) {
                  // Merge original word data with progress data
                  return {
                    ...word,
                    level: progressData.level || 0,
                    correctCount: progressData.correctCount || 0,
                    incorrectCount: progressData.incorrectCount || 0,
                    lastReviewed: progressData.lastReviewed || null,
                    nextReview: progressData.nextReview || Date.now(),
                    interval: progressData.interval || 1
                  } as WordState;
                } else {
                  // No progress data, use defaults
                  return {
                    ...word,
                    level: 0,
                    correctCount: 0,
                    incorrectCount: 0,
                    lastReviewed: null,
                    nextReview: Date.now(),
                    interval: 1
                  } as WordState;
                }
              });
            }
            
            console.log('Progress array length after filtering:', progressArray.length);
            console.log('Valid entries:', progressArray.length);
            
            // If we filtered out invalid entries, save the cleaned data back to Firebase
            if (Array.isArray(savedProgress) === false && 
                Object.keys(savedProgress).some(key => key === 'undefined' || isNaN(Number(key)))) {
              console.log('Cleaning up invalid Firebase entries...');
              // Save the cleaned data back to Firebase
              setTimeout(() => {
                if (progressArray.length > 0) {
                  // This will trigger the save effect and clean up the Firebase data
                  setWordStates(progressArray as WordState[]);
                }
              }, 1000);
            }
            
            if (progressArray.length > 0) {
              setWordStates(progressArray as WordState[]);
              setIsLoadingData(false);
              return;
            }
          }
          // If no saved progress, initialize with fresh data
          initializeWordStates();
        } catch (error) {
          console.error('Error loading progress:', error);
          // If error loading, initialize with fresh data
          initializeWordStates();
        }
      } else if (isGuestMode) {
        // Load from localStorage for guest users
        try {
          setIsLoadingData(true);
          const savedProgress = localStorage.getItem('hsk1-progress');
          if (savedProgress) {
            const parsed = JSON.parse(savedProgress);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setWordStates(parsed as WordState[]);
              setIsLoadingData(false);
              return;
            }
          }
          // If no saved progress, initialize with fresh data
          initializeWordStates();
        } catch (error) {
          console.error('Error loading guest progress:', error);
          // If error loading, initialize with fresh data
          initializeWordStates();
        }
      } else {
        // No user and no guest mode - initialize with fresh data
        initializeWordStates();
      }
    };

    loadUserProgress();
  }, [currentUser, isGuestMode]);

  // Load user settings from Firebase or localStorage
  useEffect(() => {
    const loadUserSettings = async () => {
      if (currentUser) {
        // Load from Firestore for authenticated users
        try {
          const savedSettings = await getUserSettings(currentUser.uid);
          if (savedSettings) {
            setSessionSettings({ ...defaultSettings, ...savedSettings });
          }
        } catch (error) {
          console.error('Error loading settings:', error);
        }
      } else if (isGuestMode) {
        // Load from localStorage for guest users
        try {
          const savedSettings = localStorage.getItem('hsk1-settings');
          if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            setSessionSettings({ ...defaultSettings, ...parsed });
          }
        } catch (error) {
          console.error('Error loading guest settings:', error);
        }
      }
    };

    loadUserSettings();
  }, [currentUser, isGuestMode]);

  // Load total learning time from Firebase or localStorage
  useEffect(() => {
    const loadTotalLearningTime = async () => {
      if (currentUser) {
        // Load from Firestore for authenticated users
        try {
          const savedTime = localStorage.getItem(`hsk1-learning-time-${currentUser.uid}`);
          if (savedTime) {
            const parsedTime = parseInt(savedTime);
            console.log('📥 Loading user learning time:', parsedTime, 'seconds');
            // Only reset if the value is clearly corrupted (negative or NaN)
            if (parsedTime >= 0 && !isNaN(parsedTime)) {
              setTotalLearningTime(parsedTime);
            } else {
              console.warn('Invalid learning time detected:', parsedTime, 'seconds. Resetting to 0');
              setTotalLearningTime(0);
              localStorage.setItem(`hsk1-learning-time-${currentUser.uid}`, '0');
            }
          }
        } catch (error) {
          console.error('Error loading learning time:', error);
        }
      } else if (isGuestMode) {
        // Load from localStorage for guest users
        try {
          const savedTime = localStorage.getItem('hsk1-learning-time-guest');
          if (savedTime) {
            const parsedTime = parseInt(savedTime);
            console.log('📥 Loading guest learning time:', parsedTime, 'seconds');
            // Only reset if the value is clearly corrupted (negative or NaN)
            if (parsedTime >= 0 && !isNaN(parsedTime)) {
              setTotalLearningTime(parsedTime);
            } else {
              console.warn('Invalid learning time detected:', parsedTime, 'seconds. Resetting to 0');
              setTotalLearningTime(0);
              localStorage.setItem('hsk1-learning-time-guest', '0');
            }
          }
        } catch (error) {
          console.error('Error loading guest learning time:', error);
        }
      }
    };

    loadTotalLearningTime();
  }, [currentUser, isGuestMode]);

  // Save settings to Firebase or localStorage when changed
  useEffect(() => {
    const saveSettings = async () => {
      if (JSON.stringify(sessionSettings) === JSON.stringify(defaultSettings)) return;
      
      if (currentUser) {
        // Save to Firestore for authenticated users
        try {
          await saveUserSettings(currentUser.uid, sessionSettings);
        } catch (error) {
          console.error('Error saving settings:', error);
        }
      } else if (isGuestMode) {
        // Save to localStorage for guest users
        try {
          localStorage.setItem('hsk1-settings', JSON.stringify(sessionSettings));
        } catch (error) {
          console.error('Error saving guest settings:', error);
        }
      }
    };

    saveSettings();
  }, [sessionSettings, currentUser, isGuestMode]);

  // Save progress to Firebase or localStorage (debounced)
  useEffect(() => {
    const saveProgress = async () => {
      if (wordStates.length === 0) return;
      
      if (currentUser) {
        // Save to Firestore for authenticated users
        try {
          await saveUserProgress(currentUser.uid, wordStates);
        } catch (error) {
          console.error('Error saving progress:', error);
        }
      } else if (isGuestMode) {
        // Save to localStorage for guest users
        try {
          localStorage.setItem('hsk1-progress', JSON.stringify(wordStates));
        } catch (error) {
          console.error('Error saving guest progress:', error);
        }
      }
    };

    // Debounce saving to avoid too many writes
    const timeoutId = setTimeout(saveProgress, 1000);
    return () => clearTimeout(timeoutId);
  }, [wordStates, currentUser, isGuestMode]);

  // Session timer effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (currentSession.length > 0 && !sessionComplete) {
      intervalId = setInterval(() => {
        setSessionElapsed(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [currentSession.length, sessionComplete]);

  // Save total learning time when session ends
  useEffect(() => {
    if (sessionComplete && sessionElapsed > 0) {
      console.log('🕐 Session complete! Elapsed time:', sessionElapsed, 'seconds');
      
      // Get current total learning time from state or localStorage to avoid stale closure
      const getCurrentTotalTime = () => {
        if (currentUser) {
          const saved = localStorage.getItem(`hsk1-learning-time-${currentUser.uid}`);
          return saved ? parseInt(saved) : 0;
        } else if (isGuestMode) {
          const saved = localStorage.getItem('hsk1-learning-time-guest');
          return saved ? parseInt(saved) : 0;
        }
        return 0;
      };
      
      const currentTotalTime = getCurrentTotalTime();
      console.log('📊 Current total learning time from storage:', currentTotalTime, 'seconds');
      
      // Add the actual session time to total (no artificial limits)
      const newTotalTime = currentTotalTime + sessionElapsed;
      console.log('➕ New total time would be:', newTotalTime, 'seconds');
      
      setTotalLearningTime(newTotalTime);
      
      // Save to storage
      const saveTime = async () => {
        try {
          if (currentUser) {
            localStorage.setItem(`hsk1-learning-time-${currentUser.uid}`, newTotalTime.toString());
            console.log('💾 Saved to localStorage (user):', newTotalTime);
          } else if (isGuestMode) {
            localStorage.setItem('hsk1-learning-time-guest', newTotalTime.toString());
            console.log('💾 Saved to localStorage (guest):', newTotalTime);
          }
        } catch (error) {
          console.error('Error saving learning time:', error);
        }
      };
      
      saveTime();
    }
  }, [sessionComplete, sessionElapsed, currentUser, isGuestMode]); // Removed totalLearningTime from dependencies

  // Get available categories from HSK1 words
  const getAvailableCategories = () => {
    const categories = new Set(hsk1Words.map(word => word.category || 'other'));
    return Array.from(categories).sort();
  };

  // Count words available with current settings
  const getAvailableWordsCount = () => {
    const now = Date.now();
    const filtered = wordStates.filter(word => {
      // Filter by difficulty
      if (!sessionSettings.difficulties.includes(word.difficulty)) return false;
      
      // Filter by category
      if (sessionSettings.categories.length > 0 && !sessionSettings.categories.includes(word.category || 'other')) return false;
      
      // Filter by stroke count
      const strokeCount = word.strokeCount || 5;
      if (strokeCount < sessionSettings.strokeCountRange[0] || strokeCount > sessionSettings.strokeCountRange[1]) return false;
      
      // Filter by level (if levels array is specified and not empty)
      if (sessionSettings.levels.length > 0 && !sessionSettings.levels.includes(word.level)) return false;
      
      // Filter by inclusion settings
      if (word.level === 0 && !sessionSettings.includeNew) return false;
      if (word.level === 1 && !sessionSettings.includeLearning) return false;
      if (word.level === 2 && !sessionSettings.includeReview) return false;
      if (word.level === 3 && !sessionSettings.includeMastered) return false;
      
      return true;
    });
    
    const dueWords = filtered.filter(word => word.nextReview <= now);
    return { total: filtered.length, due: dueWords.length };
  };

  // Check if custom settings are applied
  const isCustomSettings = () => {
    return JSON.stringify(sessionSettings) !== JSON.stringify(defaultSettings);
  };

  // Format time in minutes and seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format total learning time in a readable format
  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${seconds}s`;
    }
  };

  // Show word list for a specific category
  const showWordsForCategory = (category: string) => {
    let words: WordState[] = [];
    let title = '';
    let description = '';

    switch (category) {
      case 'mastered':
        words = wordStates.filter(w => w.level === 3);
        title = 'Mastered Words';
        description = 'Words you know very well (answered correctly multiple times)';
        break;
      case 'learning':
        words = wordStates.filter(w => w.level === 1);
        title = 'Learning Words';
        description = 'Words you\'ve started learning but need more practice';
        break;
      case 'review':
        words = wordStates.filter(w => w.level === 2);
        title = 'Review Words';
        description = 'Words you know but need regular review to maintain';
        break;
      case 'new':
        words = wordStates.filter(w => w.level === 0);
        title = 'New Words';
        description = 'Words you haven\'t studied yet';
        break;
      default:
        words = wordStates.filter(w => (w.category || 'other') === category);
        title = `${category.charAt(0).toUpperCase() + category.slice(1)} Words`;
        description = `All words in the ${category} category`;
    }

    setWordListData({ title, words, description });
    setShowWordList(true);
  };

  // Get words for session based on settings - Enhanced version with proper randomization
  const getSessionWords = () => {
    const now = Date.now();
    
    // Apply basic filters to all candidates
    let allCandidates = wordStates.filter(word => {
      // Filter by difficulty
      if (!sessionSettings.difficulties.includes(word.difficulty)) return false;
      
      // Filter by category
      if (sessionSettings.categories.length > 0 && !sessionSettings.categories.includes(word.category || 'other')) return false;
      
      // Filter by stroke count
      const strokeCount = word.strokeCount || 5;
      if (strokeCount < sessionSettings.strokeCountRange[0] || strokeCount > sessionSettings.strokeCountRange[1]) return false;
      
      // Filter by level (if levels array is specified and not empty)
      if (sessionSettings.levels.length > 0 && !sessionSettings.levels.includes(word.level)) return false;
      
      // Filter by inclusion settings - this provides an additional way to control word types
      if (word.level === 0 && !sessionSettings.includeNew) return false;
      if (word.level === 1 && !sessionSettings.includeLearning) return false;
      if (word.level === 2 && !sessionSettings.includeReview) return false;
      if (word.level === 3 && !sessionSettings.includeMastered) return false;
      
      return true;
    });
    
    // Helper function for proper array shuffling (Fisher-Yates algorithm)
    const shuffleArray = (array: WordState[]) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = shuffled[i];
        if (temp && shuffled[j]) {
          shuffled[i] = shuffled[j];
          shuffled[j] = temp;
        }
      }
      return shuffled;
    };
    
    // Smart session composition with proper randomization
    const sessionSize = sessionSettings.sessionSize;
    let sessionCards: WordState[] = [];
    
    // Filter due cards from candidates
    const filteredDueCards = allCandidates.filter(word => word.nextReview <= now);
    
    if (filteredDueCards.length >= sessionSize) {
      // If enough due cards, create balanced difficulty mix but with random selection within each difficulty
      const comfortCards = shuffleArray(filteredDueCards.filter(w => w.difficulty <= 2));
      const mediumCards = shuffleArray(filteredDueCards.filter(w => w.difficulty === 3));
      const challengeCards = shuffleArray(filteredDueCards.filter(w => w.difficulty >= 4));
      
      // 60% comfort level (difficulty 1-2), 30% medium (3), 10% challenge (4-5)
      const comfort = Math.ceil(sessionSize * 0.6);
      const medium = Math.ceil(sessionSize * 0.3);
      const challenge = sessionSize - comfort - medium;
      
      sessionCards = [
        ...comfortCards.slice(0, comfort),
        ...mediumCards.slice(0, medium),
        ...challengeCards.slice(0, challenge)
      ];
      
      // Fill any remaining slots with more due cards (randomly selected)
      if (sessionCards.length < sessionSize) {
        const remaining = shuffleArray(filteredDueCards.filter(w => !sessionCards.includes(w)));
        sessionCards = [...sessionCards, ...remaining.slice(0, sessionSize - sessionCards.length)];
      }
    } else {
      // Add all due cards first
      sessionCards = [...filteredDueCards];
      
      // Fill remaining slots with new cards - randomly selected within difficulty preference
      const remainingSlots = sessionSize - sessionCards.length;
      if (remainingSlots > 0) {
        const newWords = allCandidates.filter(word => word.level === 0 && !sessionCards.includes(word));
        
        // Group by difficulty and shuffle within each group
        const newWordsByDifficulty = {
          easy: shuffleArray(newWords.filter(w => w.difficulty <= 2)),
          medium: shuffleArray(newWords.filter(w => w.difficulty === 3)),
          hard: shuffleArray(newWords.filter(w => w.difficulty >= 4))
        };
        
        // Prefer easier words but randomly select within each difficulty
        const selectedNew = [
          ...newWordsByDifficulty.easy.slice(0, Math.ceil(remainingSlots * 0.6)),
          ...newWordsByDifficulty.medium.slice(0, Math.ceil(remainingSlots * 0.3)),
          ...newWordsByDifficulty.hard.slice(0, Math.ceil(remainingSlots * 0.1))
        ].slice(0, remainingSlots);
        
        sessionCards = [...sessionCards, ...selectedNew];
        
        // If still not enough, add some review cards (randomly selected)
        if (sessionCards.length < sessionSize) {
          const reviewWords = shuffleArray(allCandidates.filter(word => word.level > 0 && !sessionCards.includes(word)));
          sessionCards = [...sessionCards, ...reviewWords.slice(0, sessionSize - sessionCards.length)];
        }
      }
    }
    
    // Final shuffle to randomize the order completely
    return shuffleArray(sessionCards).slice(0, sessionSize);
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
    setSessionElapsed(0);
  };

  // Handle answer
  const handleAnswer = (isCorrect: boolean) => {
    const currentWord = currentSession[currentCardIndex];
    if (!currentWord) return; // Safety check
    
    const now = Date.now();
    const oldLevel = currentWord.level;
    
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

    // Show level change message
    if (isCorrect && oldLevel < 3) {
      const newLevel = Math.min(3, oldLevel + 1);
      const messages = [
        "📘 → 📙 Now learning this word!",
        "📙 → 📒 Moving to review!",
        "📒 → 📗 Mastered! Well done!"
      ];
      if (newLevel > oldLevel && newLevel <= 3) {
        setLevelChangeMessage(messages[newLevel - 1] || "Level up!");
        setTimeout(() => setLevelChangeMessage(''), 2000);
      }
    } else if (!isCorrect && oldLevel > 0) {
      setLevelChangeMessage("📙 → 📘 Need more practice");
      setTimeout(() => setLevelChangeMessage(''), 2000);
    }

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900">
        <div className="max-w-md mx-auto lg:max-w-2xl xl:max-w-3xl p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 relative mx-auto mb-6 lg:mb-8">
              <div className="w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 border-4 lg:border-6 border-orange-500/50 border-t-orange-400 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 border-4 lg:border-6 border-orange-400/30 border-t-orange-300 rounded-full animate-spin opacity-30" style={{animationDelay: '0.3s'}}></div>
            </div>
            <p className="text-orange-100 font-medium text-base lg:text-lg xl:text-xl">Loading your progress...</p>
          </div>
        </div>
      </div>
    );
  }

  // Session complete check
  if (sessionComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900">
        <div className="max-w-md mx-auto lg:max-w-2xl xl:max-w-3xl p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-screen">
          <div className="text-center bg-black/20 backdrop-blur-xl rounded-3xl p-8 lg:p-12 xl:p-16 shadow-2xl w-full">
            <div className="text-6xl lg:text-7xl xl:text-8xl mb-6 lg:mb-8">🎉</div>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent mb-4 lg:mb-6">
              Session Complete!
            </h2>
            
            <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 backdrop-blur-sm p-6 lg:p-8 xl:p-10 rounded-3xl mb-6 lg:mb-8">
              <div className="flex justify-between items-center mb-4 lg:mb-6">
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl xl:text-4xl font-bold text-green-400">{sessionStats.correct}</div>
                  <div className="text-sm lg:text-base text-gray-400">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl xl:text-4xl font-bold text-red-400">{sessionStats.incorrect}</div>
                  <div className="text-sm lg:text-base text-gray-400">Incorrect</div>
                </div>
              </div>
              <div className="text-center mb-4 lg:mb-6">
                <div className="text-lg lg:text-xl xl:text-2xl font-semibold text-orange-100">
                  {Math.round((sessionStats.correct / (sessionStats.correct + sessionStats.incorrect)) * 100)}% Accuracy
                </div>
                <div className="text-sm lg:text-base text-gray-400 mt-1 lg:mt-2">
                  Session Time: {formatTime(sessionElapsed)}
                </div>
              </div>
              <div className="text-center text-xs lg:text-sm text-gray-400 space-y-1">
                <div>✅ <strong>Correct answers:</strong> Words advance to next level</div>
                <div>❌ <strong>Incorrect answers:</strong> Words return to earlier level for more practice</div>
              </div>
            </div>

            <button
              onClick={() => {
                setCurrentSession([]);
                setSessionComplete(false);
                setCurrentCardIndex(0);
                setShowAnswer(false);
                setSessionStats({ correct: 0, incorrect: 0 });
                setSessionElapsed(0);
              }}
              className="w-full lg:w-auto lg:px-12 xl:px-16 bg-gradient-to-r from-orange-500 to-amber-600 text-white py-4 lg:py-6 xl:py-8 px-6 lg:px-8 rounded-3xl font-semibold text-lg lg:text-xl xl:text-2xl hover:from-orange-600 hover:to-amber-700 transition-all duration-200 shadow-lg hover:shadow-xl"
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900">
          <div className="max-w-md mx-auto lg:max-w-2xl xl:max-w-3xl p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 relative mx-auto mb-6 lg:mb-8">
                <div className="w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 border-4 lg:border-6 border-orange-500/50 border-t-orange-400 rounded-full animate-spin"></div>
              </div>
              <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-orange-100 mb-4">Loading flashcard...</h2>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900">
        <div className="max-w-md mx-auto lg:max-w-2xl xl:max-w-3xl p-4 sm:p-6 lg:p-8">
          {/* Session Progress */}
          <div className="mb-6 lg:mb-8 bg-black/20 backdrop-blur-xl rounded-3xl p-4 lg:p-6 shadow-sm">
            <div className="flex justify-between text-sm lg:text-base text-gray-400 mb-2 lg:mb-3">
              <span>Progress</span>
              <span>{currentCardIndex + 1} / {currentSession.length}</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2 lg:h-3 mb-3 lg:mb-4">
              <div 
                className="bg-gradient-to-r from-orange-500 to-amber-600 h-2 lg:h-3 rounded-full transition-all duration-300"
                style={{ width: `${((currentCardIndex + 1) / currentSession.length) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="w-2 h-2 lg:w-3 lg:h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm lg:text-base text-gray-400">Session Time: {formatTime(sessionElapsed)}</span>
              </div>
              <div className="flex items-center gap-4 lg:gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 lg:w-4 lg:h-4 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-300 text-sm lg:text-base">{sessionStats.correct}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 lg:w-4 lg:h-4 bg-red-500 rounded-full"></div>
                  <span className="font-medium text-gray-300 text-sm lg:text-base">{sessionStats.incorrect}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Flashcard */}
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-8 lg:p-12 xl:p-16 shadow-2xl mb-6 lg:mb-8">
            <div className="text-center">
              {!showAnswer ? (
                <div>
                  <div className="text-6xl lg:text-8xl xl:text-9xl mb-6 lg:mb-8 xl:mb-10 font-bold text-orange-100">{currentCard.chinese}</div>
                  {sessionSettings.showPinyin && (
                    <div className="text-xl lg:text-2xl xl:text-3xl text-gray-300 mb-2 lg:mb-3 font-medium">{currentCard.pinyin}</div>
                  )}
                  {sessionSettings.showIPA && currentCard.ipa && (
                    <div className="text-lg lg:text-xl xl:text-2xl text-gray-400 mb-6 lg:mb-8 xl:mb-10 font-medium">[{currentCard.ipa}]</div>
                  )}
                  {!sessionSettings.showPinyin && !sessionSettings.showIPA && (
                    <div className="mb-8 lg:mb-10 xl:mb-12"></div>
                  )}
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="w-full lg:w-auto lg:px-12 xl:px-16 bg-gradient-to-r from-orange-500 to-amber-600 text-white py-4 lg:py-6 xl:py-8 px-6 lg:px-8 rounded-3xl font-semibold text-lg lg:text-xl xl:text-2xl hover:from-orange-600 hover:to-amber-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Show Answer
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-6xl lg:text-8xl xl:text-9xl mb-4 lg:mb-6 font-bold text-orange-100">{currentCard.chinese}</div>
                  {sessionSettings.showPinyin && (
                    <div className="text-xl lg:text-2xl xl:text-3xl text-gray-300 mb-2 lg:mb-3 font-medium">{currentCard.pinyin}</div>
                  )}
                  {sessionSettings.showIPA && currentCard.ipa && (
                    <div className="text-lg lg:text-xl xl:text-2xl text-gray-400 mb-2 lg:mb-3 font-medium">[{currentCard.ipa}]</div>
                  )}
                  <div className="mb-4 lg:mb-6 xl:mb-8">
                    {sessionSettings.showEnglish && (
                      <div className="text-2xl lg:text-3xl xl:text-4xl font-bold text-green-400 mb-2 lg:mb-3">{currentCard.english}</div>
                    )}
                    {sessionSettings.showFrench && currentCard.french && (
                      <div className="text-2xl lg:text-3xl xl:text-4xl font-bold text-blue-400">{currentCard.french}</div>
                    )}
                  </div>
                  
                  <div className="flex gap-4 lg:gap-6 xl:gap-8 lg:justify-center">
                    <button
                      onClick={() => handleAnswer(false)}
                      className="flex-1 lg:flex-none lg:px-8 xl:px-12 bg-gradient-to-r from-red-500 to-pink-600 text-white py-4 lg:py-6 xl:py-8 px-6 lg:px-8 rounded-3xl font-semibold text-lg lg:text-xl xl:text-2xl hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <ChevronLeft size={20} className="lg:w-6 lg:h-6 xl:w-7 xl:h-7" />
                      Again
                    </button>
                    <button
                      onClick={() => handleAnswer(true)}
                      className="flex-1 lg:flex-none lg:px-8 xl:px-12 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 lg:py-6 xl:py-8 px-6 lg:px-8 rounded-3xl font-semibold text-lg lg:text-xl xl:text-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      Good
                      <ChevronRight size={20} className="lg:w-6 lg:h-6 xl:w-7 xl:h-7" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center bg-black/20 backdrop-blur-xl rounded-3xl p-4 lg:p-6 shadow-sm">
            <button
              onClick={() => {
                setCurrentSession([]);
                setCurrentCardIndex(0);
                setShowAnswer(false);
                setSessionStats({ correct: 0, incorrect: 0 });
                setSessionElapsed(0);
              }}
              className="flex items-center gap-2 lg:gap-3 px-4 py-2 lg:px-6 lg:py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-3xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-md"
            >
              <ChevronLeft size={20} className="lg:w-6 lg:h-6" />
              <span className="text-sm lg:text-base">Back</span>
            </button>
            
            <div className="text-sm lg:text-base text-gray-400">
              Card {currentCardIndex + 1} of {currentSession.length}
            </div>
          </div>

          {/* Level Change Notification - Fixed Position */}
          {levelChangeMessage && (
            <div className="fixed bottom-20 lg:bottom-24 left-1/2 transform -translate-x-1/2 z-50 text-center text-sm lg:text-base font-medium text-orange-200 bg-orange-500/90 backdrop-blur-sm rounded-lg py-2 lg:py-3 px-4 lg:px-6 border border-orange-500/50 shadow-lg">
              {levelChangeMessage}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentSession.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900">
        <div className="max-w-md mx-auto lg:max-w-4xl xl:max-w-6xl p-4 sm:p-6">
          {/* User Header - Compact */}
          <div className="flex items-center justify-between mb-6 lg:mb-8 bg-black/10 backdrop-blur-xl rounded-3xl p-3 lg:p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center text-white font-bold text-sm lg:text-base">
                {currentUser?.displayName?.charAt(0) || (isGuestMode ? 'G' : '?')}
              </div>
              <div>
                <div className="font-medium text-orange-100 text-sm lg:text-base">
                  {currentUser?.displayName || (isGuestMode ? 'Guest User' : 'User')}
                </div>
                <div className="text-xs lg:text-sm text-gray-400">
                  {isGuestMode ? 'Learning as guest 📚' : 'Welcome back! 👋'}
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-md"
            >
              <LogOut size={14} className="lg:w-4 lg:h-4" />
              <span className="text-xs lg:text-sm">Logout</span>
            </button>
          </div>

          {/* Session Controls - Horizontal Layout */}
          <div className="mb-6 lg:mb-8 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Start Session Button - Takes 2/3 width on desktop */}
            <div className="lg:col-span-2">
              <button
                onClick={startSession}
                className="relative w-full h-24 lg:h-28 bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 lg:px-8 rounded-3xl font-bold text-lg lg:text-xl hover:from-orange-600 hover:to-amber-700 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-[1.02] transform overflow-hidden group"
              >
                {/* Animated Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-all duration-1000 ease-out"></div>
                
                {/* Sparkle Particles */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-2 left-1/4 w-1 h-1 bg-white rounded-full animate-ping"></div>
                  <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-white/80 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  <div className="absolute top-1/2 right-1/3 w-0.5 h-0.5 bg-white rounded-full animate-ping" style={{animationDelay: '0.6s'}}></div>
                  <div className="absolute bottom-1/4 right-1/2 w-1 h-1 bg-white/70 rounded-full animate-bounce" style={{animationDelay: '0.8s'}}></div>
                </div>
                
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-400 to-amber-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
                
                {/* Ripple Waves */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-2 border-2 border-white/20 rounded-3xl animate-ping"></div>
                  <div className="absolute inset-4 border border-white/10 rounded-lg animate-pulse" style={{animationDelay: '0.3s'}}></div>
                </div>
                
                {/* Button Content */}
                <span className="relative z-10 drop-shadow-lg">Start Study Session</span>
              </button>
            </div>

            {/* Session Settings - Takes 1/3 width on desktop */}
            <div className="lg:col-span-1">
              <button
                onClick={() => setShowSettings(true)}
                className="w-full h-24 lg:h-28 bg-black/20 backdrop-blur-xl rounded-3xl p-4 lg:p-6 shadow-sm hover:bg-black/30 transition-all duration-200 flex flex-col justify-center"
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Settings size={20} className="text-orange-400 lg:w-6 lg:h-6" />
                  <div className="font-medium text-orange-100 text-base lg:text-lg">Settings</div>
                </div>
                
                {/* Session Stats */}
                <div className="text-center">
                  <div className="text-sm lg:text-sm text-gray-300 leading-tight">
                    {(() => {
                      const counts = getAvailableWordsCount();
                      return `${counts.total} words available, ${counts.due} due for review`;
                    })()}
                  </div>
                  {isCustomSettings() && (
                    <div className="text-xs text-gray-400 mt-1">
                      {sessionSettings.sessionSize} cards
                      {sessionSettings.difficulties.length !== 4 && `, difficulties: ${sessionSettings.difficulties.join(', ')}`}
                      {sessionSettings.categories.length > 0 && `, ${sessionSettings.categories.length} categories`}
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Learning Progress Bar */}
          <div className="mb-6 lg:mb-8 bg-black/20 backdrop-blur-xl rounded-3xl p-4 lg:p-6 shadow-sm">
            <div className="flex justify-between items-center mb-3 lg:mb-4">
              <h3 className="text-lg lg:text-xl font-semibold text-orange-100">Overall Progress</h3>
              <div className="text-sm lg:text-base text-gray-400">
                {getUserStats().totalWords} words total
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="relative w-full bg-gray-700/50 rounded-full h-4 lg:h-6 mb-4 lg:mb-6 overflow-hidden">
              {(() => {
                const stats = getUserStats();
                const total = stats.totalWords;
                const masteredPercent = (stats.masteredWords / total) * 100;
                const reviewPercent = (stats.reviewWords / total) * 100;
                const learningPercent = (stats.learningWords / total) * 100;
                const newPercent = (stats.newWords / total) * 100;
                
                return (
                  <>
                    {/* Mastered (Green) */}
                    <div 
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-1000 ease-out"
                      style={{ width: `${masteredPercent}%` }}
                    />
                    {/* Review (Yellow) */}
                    <div 
                      className="absolute top-0 h-full bg-gradient-to-r from-yellow-500 to-amber-600 transition-all duration-1000 ease-out"
                      style={{ 
                        left: `${masteredPercent}%`,
                        width: `${reviewPercent}%`
                      }}
                    />
                    {/* Learning (Orange) */}
                    <div 
                      className="absolute top-0 h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-1000 ease-out"
                      style={{ 
                        left: `${masteredPercent + reviewPercent}%`,
                        width: `${learningPercent}%`
                      }}
                    />
                    {/* New (Blue) */}
                    <div 
                      className="absolute top-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 ease-out"
                      style={{ 
                        left: `${masteredPercent + reviewPercent + learningPercent}%`,
                        width: `${newPercent}%`
                      }}
                    />
                  </>
                );
              })()}
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="w-3 h-3 lg:w-4 lg:h-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"></div>
                <div className="text-xs lg:text-sm text-gray-300">
                  <div className="font-medium text-green-400">{getUserStats().masteredWords}</div>
                  <div className="text-gray-400">Mastered ({Math.round((getUserStats().masteredWords / getUserStats().totalWords) * 100)}%)</div>
                </div>
              </div>
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="w-3 h-3 lg:w-4 lg:h-4 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full"></div>
                <div className="text-xs lg:text-sm text-gray-300">
                  <div className="font-medium text-yellow-400">{getUserStats().reviewWords}</div>
                  <div className="text-gray-400">Review ({Math.round((getUserStats().reviewWords / getUserStats().totalWords) * 100)}%)</div>
                </div>
              </div>
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="w-3 h-3 lg:w-4 lg:h-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-full"></div>
                <div className="text-xs lg:text-sm text-gray-300">
                  <div className="font-medium text-orange-400">{getUserStats().learningWords}</div>
                  <div className="text-gray-400">Learning ({Math.round((getUserStats().learningWords / getUserStats().totalWords) * 100)}%)</div>
                </div>
              </div>
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="w-3 h-3 lg:w-4 lg:h-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                <div className="text-xs lg:text-sm text-gray-300">
                  <div className="font-medium text-blue-400">{getUserStats().newWords}</div>
                  <div className="text-gray-400">New ({Math.round((getUserStats().newWords / getUserStats().totalWords) * 100)}%)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Stats - Compact */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-4 lg:p-6 shadow-sm">
              <div className="text-2xl lg:text-3xl xl:text-4xl font-bold text-orange-400">{getUserStats().studyStreak}</div>
              <div className="text-sm lg:text-base text-gray-400">
                {getUserStats().studyStreak === 1 ? "Day Streak" : "Days Streak"}
              </div>
            </div>
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-4 lg:p-6 shadow-sm">
              <div className="text-2xl lg:text-3xl xl:text-4xl font-bold text-amber-400">{formatTotalTime(totalLearningTime)}</div>
              <div className="text-sm lg:text-base text-gray-400">Learning Time</div>
            </div>
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-4 lg:p-6 shadow-sm lg:block">
              <div className="text-2xl lg:text-3xl xl:text-4xl font-bold text-green-400">{getUserStats().accuracy.toFixed(1)}%</div>
              <div className="text-sm lg:text-base text-gray-400">Accuracy</div>
            </div>
            <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-4 lg:p-6 shadow-sm lg:block">
              <div className="text-2xl lg:text-3xl xl:text-4xl font-bold text-blue-400">{getUserStats().totalSessions}</div>
              <div className="text-sm lg:text-base text-gray-400">Sessions</div>
            </div>
          </div>

          {/* Learning Progress Details */}
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-6 lg:p-8 shadow-sm mb-6 lg:mb-8">
            <h3 className="text-lg lg:text-xl xl:text-2xl font-semibold text-orange-100 mb-4 lg:mb-6">Learning Progress Details</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div 
                className="p-4 lg:p-6 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl cursor-pointer hover:from-blue-500/25 hover:to-indigo-500/25 transition-colors duration-200 border border-blue-500/20 hover:border-blue-500/30 relative overflow-hidden group"
                onClick={() => showWordsForCategory('new')}
              >
                <div className="text-2xl lg:text-3xl xl:text-4xl font-bold text-blue-400">{getUserStats().newWords}</div>
                <div className="text-sm lg:text-base text-gray-400">New Words</div>
                <div className="text-xs lg:text-sm text-gray-500 mt-1">Appear frequently until you get them right</div>
              </div>
              <div 
                className="p-4 lg:p-6 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl cursor-pointer hover:from-orange-500/25 hover:to-red-500/25 transition-colors duration-200 border border-orange-500/20 hover:border-orange-500/30 relative overflow-hidden group"
                onClick={() => showWordsForCategory('learning')}
              >
                <div className="text-2xl lg:text-3xl xl:text-4xl font-bold text-orange-400">{getUserStats().learningWords}</div>
                <div className="text-sm lg:text-base text-gray-400">Learning</div>
                <div className="text-xs lg:text-sm text-gray-500 mt-1">Appear after 1-2 days when you answer correctly</div>
              </div>
              <div 
                className="p-4 lg:p-6 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl cursor-pointer hover:from-yellow-500/25 hover:to-amber-500/25 transition-colors duration-200 border border-yellow-500/20 hover:border-yellow-500/30 relative overflow-hidden group"
                onClick={() => showWordsForCategory('review')}
              >
                <div className="text-2xl lg:text-3xl xl:text-4xl font-bold text-yellow-400">{getUserStats().reviewWords}</div>
                <div className="text-sm lg:text-base text-gray-400">Review</div>
                <div className="text-xs lg:text-sm text-gray-500 mt-1">Appear after 3-7 days for reinforcement</div>
              </div>
              <div 
                className="p-4 lg:p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl cursor-pointer hover:from-green-500/25 hover:to-emerald-500/25 transition-colors duration-200 border border-green-500/20 hover:border-green-500/30 relative overflow-hidden group"
                onClick={() => showWordsForCategory('mastered')}
              >
                <div className="text-2xl lg:text-3xl xl:text-4xl font-bold text-green-400">{getUserStats().masteredWords}</div>
                <div className="text-sm lg:text-base text-gray-400">Mastered</div>
                <div className="text-xs lg:text-sm text-gray-500 mt-1">Appear after 1-2 weeks for maintenance</div>
              </div>
            </div>
          </div>

          {/* Settings Modal */}
          {showSettings && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-6 w-full max-w-md md:max-w-lg lg:max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                    Settings
                  </h2>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors text-orange-100"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6 lg:space-y-8">
                  <div>
                    <label className="block text-sm font-medium text-orange-100 mb-2">
                      Session Size: {sessionSettings.sessionSize}
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={sessionSettings.sessionSize}
                      onChange={(e) => setSessionSettings({...sessionSettings, sessionSize: parseInt(e.target.value)})}
                      className="w-full accent-orange-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>5</span>
                      <span>50</span>
                    </div>
                  </div>

                  {/* Preview of available words */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-3">
                    <div className="text-sm font-medium text-orange-100 mb-1">Preview</div>
                    <div className="text-xs text-gray-300">
                      {(() => {
                        const counts = getAvailableWordsCount();
                        if (counts.total === 0) {
                          return "⚠️ No words match current filters";
                        }
                        return `${counts.total} words available, ${counts.due} due for review`;
                      })()}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-orange-100 mb-3">
                      Include Word Types
                    </label>
                    <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-3 mb-4">
                      <div className="text-xs text-gray-400 space-y-1">
                        <div><span className="text-blue-400">📘 New:</span> Never studied</div>
                        <div><span className="text-orange-400">📙 Learning:</span> Getting familiar (answered correctly once)</div>
                        <div><span className="text-yellow-400">📒 Review:</span> Need reinforcement (answered correctly 2+ times)</div>
                        <div><span className="text-green-400">📗 Mastered:</span> Know very well (answered correctly many times)</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                      <button
                        onClick={() => setSessionSettings({...sessionSettings, includeNew: !sessionSettings.includeNew})}
                        className={`p-3 rounded-xl text-sm font-medium transition-all ${
                          sessionSettings.includeNew 
                            ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg' 
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        📘 New Words
                      </button>
                      <button
                        onClick={() => setSessionSettings({...sessionSettings, includeLearning: !sessionSettings.includeLearning})}
                        className={`p-3 rounded-xl text-sm font-medium transition-all ${
                          sessionSettings.includeLearning 
                            ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg' 
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        📙 Learning
                      </button>
                      <button
                        onClick={() => setSessionSettings({...sessionSettings, includeReview: !sessionSettings.includeReview})}
                        className={`p-3 rounded-xl text-sm font-medium transition-all ${
                          sessionSettings.includeReview 
                            ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg' 
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        📒 Review
                      </button>
                      <button
                        onClick={() => setSessionSettings({...sessionSettings, includeMastered: !sessionSettings.includeMastered})}
                        className={`p-3 rounded-xl text-sm font-medium transition-all ${
                          sessionSettings.includeMastered 
                            ? 'bg-gradient-to-r from-orange-500 to-emerald-600 text-white shadow-lg' 
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        📗 Mastered
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-orange-100 mb-3">
                      Difficulty Level
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map(difficulty => (
                        <button
                          key={difficulty}
                          onClick={() => {
                            const newDifficulties = sessionSettings.difficulties.includes(difficulty)
                              ? sessionSettings.difficulties.filter(d => d !== difficulty)
                              : [...sessionSettings.difficulties, difficulty];
                            setSessionSettings({...sessionSettings, difficulties: newDifficulties});
                          }}
                          className={`p-3 rounded-xl text-sm font-medium transition-all ${
                            sessionSettings.difficulties.includes(difficulty)
                              ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg' 
                              : 'bg-white/10 text-gray-300 hover:bg-white/20'
                          }`}
                        >
                          {difficulty}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-orange-100 mb-2">
                      Stroke Count Range: {sessionSettings.strokeCountRange[0]} - {sessionSettings.strokeCountRange[1]}
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs text-gray-400">Min</label>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          value={sessionSettings.strokeCountRange[0]}
                          onChange={(e) => setSessionSettings({
                            ...sessionSettings, 
                            strokeCountRange: [parseInt(e.target.value), sessionSettings.strokeCountRange[1]]
                          })}
                          className="w-full accent-orange-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-400">Max</label>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          value={sessionSettings.strokeCountRange[1]}
                          onChange={(e) => setSessionSettings({
                            ...sessionSettings, 
                            strokeCountRange: [sessionSettings.strokeCountRange[0], parseInt(e.target.value)]
                          })}
                          className="w-full accent-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-orange-100 mb-3">
                      Language Display Options
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Show Pinyin</span>
                        <button
                          onClick={() => setSessionSettings({...sessionSettings, showPinyin: !sessionSettings.showPinyin})}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            sessionSettings.showPinyin ? 'bg-orange-500' : 'bg-gray-600'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            sessionSettings.showPinyin ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Show IPA (Pronunciation)</span>
                        <button
                          onClick={() => setSessionSettings({...sessionSettings, showIPA: !sessionSettings.showIPA})}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            sessionSettings.showIPA ? 'bg-orange-500' : 'bg-gray-600'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            sessionSettings.showIPA ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Show English</span>
                        <button
                          onClick={() => setSessionSettings({...sessionSettings, showEnglish: !sessionSettings.showEnglish})}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            sessionSettings.showEnglish ? 'bg-orange-500' : 'bg-gray-600'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            sessionSettings.showEnglish ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Show French</span>
                        <button
                          onClick={() => setSessionSettings({...sessionSettings, showFrench: !sessionSettings.showFrench})}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            sessionSettings.showFrench ? 'bg-orange-500' : 'bg-gray-600'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            sessionSettings.showFrench ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-orange-100">
                        Categories {sessionSettings.categories.length > 0 && `(${sessionSettings.categories.length} selected)`}
                      </label>
                      <div className="flex gap-2">
                        {sessionSettings.categories.length > 0 && (
                          <button
                            onClick={() => setSessionSettings({...sessionSettings, categories: []})}
                            className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
                          >
                            Clear All
                          </button>
                        )}
                        {sessionSettings.categories.length < getAvailableCategories().length && (
                          <button
                            onClick={() => setSessionSettings({...sessionSettings, categories: getAvailableCategories()})}
                            className="text-xs text-green-400 hover:text-green-300 transition-colors"
                          >
                            Select All
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {getAvailableCategories().map(category => (
                          <button
                            key={category}
                            onClick={() => {
                              const newCategories = sessionSettings.categories.includes(category)
                                ? sessionSettings.categories.filter(c => c !== category)
                                : [...sessionSettings.categories, category];
                              setSessionSettings({...sessionSettings, categories: newCategories});
                            }}
                            className={`p-3 rounded-xl text-xs font-medium transition-all text-center min-h-[2.5rem] flex items-center justify-center ${
                              sessionSettings.categories.includes(category)
                                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg' 
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                    {sessionSettings.categories.length === 0 && (
                      <div className="text-xs text-gray-400 mt-2">
                        No categories selected (all categories included)
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSessionSettings(defaultSettings)}
                      className="flex-1 bg-gray-700 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-600 transition-colors"
                    >
                      Reset to Default
                    </button>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white py-3 px-4 rounded-xl font-medium hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Word List Modal */}
          {showWordList && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-6 w-full max-w-md mx-4 h-[80vh] overflow-hidden shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                      {wordListData.title}
                    </h2>
                    {wordListData.description && (
                      <p className="text-sm text-gray-400 mt-1">{wordListData.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowWordList(false)}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors text-orange-100"
                  >
                    ✕
                  </button>
                </div>

                <div className="overflow-y-auto h-full">
                  {wordListData.words.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <div className="text-4xl mb-4">📚</div>
                      <p>No words in this category yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {wordListData.words.map((word) => (
                        <div key={word.id} className="bg-white/10 backdrop-blur-sm rounded-3xl p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="text-2xl font-bold text-orange-100 mb-1">{word.chinese}</div>
                              <div className="text-sm text-gray-400 mb-1">{word.pinyin}</div>
                              <div className="text-lg text-orange-200">{word.english}</div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-xs text-gray-400">
                                {word.level === 0 && '📘 New'}
                                {word.level === 1 && '📙 Learning'}
                                {word.level === 2 && '📒 Review'}
                                {word.level === 3 && '📗 Mastered'}
                              </div>
                              <div className="text-xs text-gray-400">
                                {word.correctCount}✓ {word.incorrectCount}✗
                              </div>
                              {word.level > 0 && (
                                <div className="text-xs text-gray-500">
                                  {word.level === 1 && 'Getting familiar'}
                                  {word.level === 2 && 'Reinforcing'}
                                  {word.level === 3 && 'Well known'}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default HSK1FlashcardApp;
