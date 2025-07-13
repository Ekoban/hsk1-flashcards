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

// Default voice and language settings
export const DEFAULT_VOICE = 'zh-CN-Neural2-A';
export const DEFAULT_LANGUAGE_CODE = 'zh-CN';

// Voice quality tiers
export const VOICE_TIERS = {
  STANDARD: 'Standard',
  WAVENET: 'WaveNet',
  NEURAL: 'Neural2'
} as const;

// Chinese voices available in Google Cloud TTS
export const CHINESE_VOICES: GoogleTTSVoice[] = [
  // Standard voices (cheapest)
  { name: 'zh-CN-Standard-A', languageCode: 'zh-CN', ssmlGender: 'FEMALE', voiceType: 'STANDARD' },
  { name: 'zh-CN-Standard-B', languageCode: 'zh-CN', ssmlGender: 'MALE', voiceType: 'STANDARD' },
  { name: 'zh-CN-Standard-C', languageCode: 'zh-CN', ssmlGender: 'MALE', voiceType: 'STANDARD' },
  { name: 'zh-CN-Standard-D', languageCode: 'zh-CN', ssmlGender: 'FEMALE', voiceType: 'STANDARD' },
  
  // WaveNet voices (premium)
  { name: 'zh-CN-Wavenet-A', languageCode: 'zh-CN', ssmlGender: 'FEMALE', voiceType: 'WAVENET' },
  { name: 'zh-CN-Wavenet-B', languageCode: 'zh-CN', ssmlGender: 'MALE', voiceType: 'WAVENET' },
  { name: 'zh-CN-Wavenet-C', languageCode: 'zh-CN', ssmlGender: 'MALE', voiceType: 'WAVENET' },
  { name: 'zh-CN-Wavenet-D', languageCode: 'zh-CN', ssmlGender: 'FEMALE', voiceType: 'WAVENET' },
  
  // Neural2 voices (latest AI, premium)
  { name: 'zh-CN-Neural2-A', languageCode: 'zh-CN', ssmlGender: 'FEMALE', voiceType: 'NEURAL' },
  { name: 'zh-CN-Neural2-B', languageCode: 'zh-CN', ssmlGender: 'MALE', voiceType: 'NEURAL' },
  { name: 'zh-CN-Neural2-C', languageCode: 'zh-CN', ssmlGender: 'MALE', voiceType: 'NEURAL' },
  { name: 'zh-CN-Neural2-D', languageCode: 'zh-CN', ssmlGender: 'FEMALE', voiceType: 'NEURAL' }
];

// Usage limits (Google Cloud TTS free tier)
export const USAGE_LIMITS = {
  MONTHLY_CHARACTERS: 4000000,  // 4M characters per month
  DAILY_CHARACTERS: 133333,     // ~4M/30 days
  COST_PER_NEURAL_CHAR: 16 / 1000000,     // $16 per 1M characters
  COST_PER_STANDARD_CHAR: 4 / 1000000     // $4 per 1M characters
} as const;

// Audio quality settings
export const AUDIO_SETTINGS = {
  SAMPLE_RATE: 24000,
  ENCODING: 'MP3',
  MIN_SPEED: 0.25,
  MAX_SPEED: 4.0,
  DEFAULT_SPEED: 1.0,
  MIN_PITCH: -20.0,
  MAX_PITCH: 20.0,
  DEFAULT_PITCH: 0.0
} as const;
