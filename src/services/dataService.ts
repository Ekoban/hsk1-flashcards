import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

export interface WordState {
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
  hskLevel?: 1 | 2 | 3; // Optional for backwards compatibility
  level: number;
  correctCount: number;
  incorrectCount: number;
  lastReviewed: number | null;
  nextReview: number;
  interval: number;
}

export interface SessionSettings {
  sessionSize: number;
  difficulties: number[];
  categories: string[];
  hskLevels: number[];
  levels: number[];
  includeNew: boolean;
  includeLearning: boolean;
  includeReview: boolean;
  includeMastered: boolean;
  strokeCountRange: [number, number];
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: any;
  lastLoginAt: any;
}

// User Profile Operations
export const createUserProfile = async (user: any): Promise<void> => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      });
    } else {
      // Update last login
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
};

// Progress Operations
export const validateWordState = (word: any): word is WordState => {
  return (
    word &&
    typeof word.id === 'number' &&
    typeof word.chinese === 'string' &&
    typeof word.pinyin === 'string' &&
    typeof word.english === 'string' &&
    typeof word.difficulty === 'number' &&
    typeof word.level === 'number' &&
    typeof word.correctCount === 'number' &&
    typeof word.incorrectCount === 'number' &&
    typeof word.interval === 'number' &&
    (word.hskLevel === undefined || [1, 2, 3].includes(word.hskLevel))
  );
};

export const saveUserProgress = async (userId: string, wordStates: WordState[]): Promise<void> => {
  try {
    const progressRef = doc(db, 'userProgress', userId);
    // Filter out words with invalid IDs and validate word structure
    const validWords = wordStates.filter(word => 
      word.id !== undefined && 
      word.id !== null && 
      !isNaN(Number(word.id)) && 
      Number.isInteger(Number(word.id)) &&
      validateWordState(word)
    );
    
    const progressData = validWords.reduce((acc, word) => {
      acc[word.id] = {
        level: word.level,
        correctCount: word.correctCount,
        incorrectCount: word.incorrectCount,
        lastReviewed: word.lastReviewed,
        nextReview: word.nextReview,
        interval: word.interval,
        hskLevel: word.hskLevel || 1 // Ensure HSK level is always saved
      };
      return acc;
    }, {} as Record<number, any>);

    console.log(`Saving ${validWords.length} valid words to Firebase`);
    await setDoc(progressRef, { words: progressData }, { merge: true });
  } catch (error) {
    console.error('Error saving user progress:', error);
  }
};

export const getUserProgress = async (userId: string): Promise<Record<number, any> | null> => {
  try {
    const progressRef = doc(db, 'userProgress', userId);
    const progressSnap = await getDoc(progressRef);
    
    if (progressSnap.exists()) {
      const data = progressSnap.data();
      console.log('Raw Firebase document data:', data);
      console.log('Document data keys:', Object.keys(data));
      
      // Handle both new format (nested under 'words') and old format (direct)
      if (data.words) {
        console.log('Found data under "words" field');
        return data.words;
      } else {
        console.log('Using direct document structure (legacy format)');
        // Remove any non-word fields that might exist
        const { createdAt, lastUpdated, ...wordData } = data;
        return wordData;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting user progress:', error);
    return null;
  }
};

// Settings Operations
export const saveUserSettings = async (userId: string, settings: SessionSettings): Promise<void> => {
  try {
    const settingsRef = doc(db, 'userSettings', userId);
    await setDoc(settingsRef, settings);
  } catch (error) {
    console.error('Error saving user settings:', error);
  }
};

export const getUserSettings = async (userId: string): Promise<SessionSettings | null> => {
  try {
    const settingsRef = doc(db, 'userSettings', userId);
    const settingsSnap = await getDoc(settingsRef);
    
    if (settingsSnap.exists()) {
      return settingsSnap.data() as SessionSettings;
    }
    return null;
  } catch (error) {
    console.error('Error getting user settings:', error);
    return null;
  }
};

// Migration helper to import localStorage data
export const migrateLocalStorageData = async (userId: string): Promise<void> => {
  try {
    // Check if user already has cloud data
    const existingProgress = await getUserProgress(userId);
    if (existingProgress && Object.keys(existingProgress).length > 0) {
      return; // Don't overwrite existing cloud data
    }

    // Import localStorage progress (check both new and legacy keys)
    const newProgress = localStorage.getItem('hsk-progress');
    const legacyProgress = localStorage.getItem('hsk1-progress');
    const progressToMigrate = newProgress || legacyProgress;
    
    if (progressToMigrate) {
      try {
        const wordStates = JSON.parse(progressToMigrate) as WordState[];
        await saveUserProgress(userId, wordStates);
        console.log('Successfully migrated progress data to cloud');
      } catch (error) {
        console.error('Failed to parse progress data:', error);
      }
    }

    // Import localStorage settings (check both new and legacy keys)
    const newSettings = localStorage.getItem('hsk-settings');
    const legacySettings = localStorage.getItem('hsk1-settings');
    const settingsToMigrate = newSettings || legacySettings;
    
    if (settingsToMigrate) {
      try {
        const settings = JSON.parse(settingsToMigrate) as SessionSettings;
        await saveUserSettings(userId, settings);
        console.log('Successfully migrated settings data to cloud');
      } catch (error) {
        console.error('Failed to parse settings data:', error);
      }
    }
  } catch (error) {
    console.error('Error migrating localStorage data:', error);
  }
};
