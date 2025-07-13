// Google Cloud Text-to-Speech React Hook
import { useState, useCallback } from 'react';
import type { 
  GoogleTTSRequest, 
  GoogleTTSResponse, 
  GoogleTTSHookState, 
  GoogleTTSHookOptions 
} from '../types/googleTTS';
import { DEFAULT_VOICE, DEFAULT_LANGUAGE_CODE } from '../types/googleTTS';
import AudioUsageTracker from '../services/audioUsageTracker';
import { useSpeechSynthesis } from './useSpeechSynthesis';

export const useGoogleTTS = () => {
  const [state, setState] = useState<GoogleTTSHookState>({
    isLoading: false,
    error: null,
    isPlaying: false,
    usage: AudioUsageTracker.getInstance().getGoogleTTSUsage()
  });

  // Fallback to Web Speech API
  const webSpeechAPI = useSpeechSynthesis();

  const speak = useCallback(async (
    text: string, 
    options: GoogleTTSHookOptions = {}
  ): Promise<boolean> => {
    if (!text.trim()) {
      console.warn('⚠️ Empty text provided to Google TTS');
      return false;
    }

    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null 
    }));

    const request: GoogleTTSRequest = {
      text: text.trim(),
      voice: options.voice || DEFAULT_VOICE,
      languageCode: DEFAULT_LANGUAGE_CODE,
      rate: options.rate || 1.0,
      pitch: options.pitch || 0,
      volume: options.volume || 1.0
    };

    try {
      console.log(`🎯 Attempting Google TTS for: "${text.substring(0, 50)}..." with voice ${request.voice}`);

      const response = await fetch('/api/google-tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result: GoogleTTSResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Google TTS API returned unsuccessful response');
      }

      if (!result.audioContent) {
        throw new Error('No audio content received from Google TTS');
      }

      // Convert base64 audio to blob and play
      const audioBlob = base64ToBlob(result.audioContent, 'audio/mpeg');
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      // Set audio properties
      audio.volume = options.volume || 1.0;
      audio.playbackRate = options.rate || 1.0;

      // Handle audio events
      audio.onplay = () => {
        setState(prev => ({ 
          ...prev, 
          isPlaying: true, 
          isLoading: false 
        }));
      };

      audio.onended = () => {
        setState(prev => ({ 
          ...prev, 
          isPlaying: false 
        }));
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = (e) => {
        console.error('❌ Audio playback error:', e);
        setState(prev => ({ 
          ...prev, 
          isPlaying: false,
          error: 'Audio playback failed'
        }));
        URL.revokeObjectURL(audioUrl);
      };

      // Track usage
      AudioUsageTracker.getInstance().trackGoogleTTSUsage(
        text,
        request.voice,
        true
      );
      
      setState(prev => ({ 
        ...prev, 
        usage: AudioUsageTracker.getInstance().getGoogleTTSUsage()
      }));

      // Play the audio with error handling for autoplay policies
      try {
        await audio.play();
        console.log(`✅ Google TTS Success: Played ${text.length} characters with ${request.voice}`);
        return true;
      } catch (playError) {
        console.warn('⚠️ Audio play failed (likely autoplay policy):', playError);
        // Audio was generated successfully but couldn't play automatically
        // User can still manually trigger playback
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          isPlaying: false
        }));
        return true; // Still consider this a success since audio was generated
      }

    } catch (error) {
      console.error('❌ Google TTS Error:', error);
      
      // Track the failed attempt
      AudioUsageTracker.getInstance().trackGoogleTTSUsage(
        text,
        request.voice,
        false
      );
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage,
        isPlaying: false
      }));

      // Fallback to Web Speech API if enabled
      if (options.fallbackToWebSpeech !== false && webSpeechAPI.isSupported) {
        console.log('🔄 Falling back to Web Speech API');
        webSpeechAPI.speak(text, {
          rate: options.rate || 0.7,
          lang: 'zh-CN'
        });
        return true;
      }

      return false;
    }
  }, [webSpeechAPI]);

  const cancel = useCallback(() => {
    // Note: We can't cancel Google TTS audio once it starts playing
    // But we can cancel any Web Speech API fallback
    webSpeechAPI.cancel();
    setState(prev => ({ 
      ...prev, 
      isPlaying: false,
      isLoading: false
    }));
  }, [webSpeechAPI]);

  const getUsageStats = useCallback(() => {
    return AudioUsageTracker.getInstance().getUsageStats();
  }, []);

  const getRemainingQuota = useCallback(() => {
    const usage = AudioUsageTracker.getInstance().getGoogleTTSUsage();
    return {
      monthly: Math.max(0, usage.monthlyLimit - usage.monthlyUsage),
      daily: Math.max(0, usage.dailyLimit - usage.dailyUsage)
    };
  }, []);

  return {
    speak,
    cancel,
    getUsageStats,
    getRemainingQuota,
    isLoading: state.isLoading,
    error: state.error,
    isPlaying: state.isPlaying || webSpeechAPI.isSpeaking,
    usage: state.usage,
    isSupported: true, // Google TTS is always "supported" (with fallback)
    webSpeechFallback: webSpeechAPI.isSupported
  };
};

// Helper function to convert base64 to blob
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

export default useGoogleTTS;
