// Google Cloud Text-to-Speech TypeScript interfaces

export interface GoogleTTSVoice {
  name: string;
  languageCode: string;
  ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  voiceType: 'STANDARD' | 'NEURAL' | 'WAVENET';
}

export interface GoogleTTSRequest {
  text: string;
  voice: string;
  languageCode: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export interface GoogleTTSResponse {
  audioContent: string; // Base64 encoded audio
  success: boolean;
  error?: string;
  usage?: {
    characters: number;
    voice: string;
    cost: number;
  };
}

export interface GoogleTTSUsage {
  monthlyCharacters: number;
  dailyCharacters: number;
  monthlyAPICalls: number;
  dailyAPICalls: number;
  lastResetDate: string;
  preferredVoice: string;
  totalCost: number;
  lastUsed: string | null;
}

export interface GoogleTTSHookState {
  isLoading: boolean;
  error: string | null;
  isPlaying: boolean;
  usage: GoogleTTSUsage;
}

export interface GoogleTTSHookOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  fallbackToWebSpeech?: boolean;
}

// Recommended Chinese voices for HSK learning
export const CHINESE_VOICES: GoogleTTSVoice[] = [
  { 
    name: 'zh-CN-Standard-A', 
    languageCode: 'zh-CN', 
    ssmlGender: 'FEMALE', 
    voiceType: 'STANDARD' 
  },
  { 
    name: 'zh-CN-Standard-B', 
    languageCode: 'zh-CN', 
    ssmlGender: 'MALE', 
    voiceType: 'STANDARD' 
  },
  { 
    name: 'zh-CN-Wavenet-A', 
    languageCode: 'zh-CN', 
    ssmlGender: 'FEMALE', 
    voiceType: 'WAVENET' 
  },
  { 
    name: 'zh-CN-Wavenet-B', 
    languageCode: 'zh-CN', 
    ssmlGender: 'MALE', 
    voiceType: 'WAVENET' 
  },
  { 
    name: 'zh-CN-Neural2-A', 
    languageCode: 'zh-CN', 
    ssmlGender: 'FEMALE', 
    voiceType: 'NEURAL' 
  },
  { 
    name: 'zh-CN-Neural2-B', 
    languageCode: 'zh-CN', 
    ssmlGender: 'MALE', 
    voiceType: 'NEURAL' 
  }
];

export const DEFAULT_VOICE = 'zh-CN-Standard-A';
export const DEFAULT_LANGUAGE_CODE = 'zh-CN';
