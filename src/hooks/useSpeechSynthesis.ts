import { useState, useEffect, useCallback } from 'react';
import AudioUsageTracker from '../services/audioUsageTracker';

interface SpeechSynthesisHookOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceGender?: 'auto' | 'female' | 'male';
}

interface SpeechSynthesisHook {
  speak: (text: string, options?: SpeechSynthesisHookOptions) => void;
  cancel: () => void;
  isSupported: boolean;
  isSpeaking: boolean;
  voices: SpeechSynthesisVoice[];
}

export const useSpeechSynthesis = (): SpeechSynthesisHook => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      // Load voices immediately
      loadVoices();

      // Also load voices when they become available (some browsers load them asynchronously)
      speechSynthesis.addEventListener('voiceschanged', loadVoices);

      return () => {
        speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, []);

  const speak = useCallback((text: string, options: SpeechSynthesisHookOptions = {}) => {
    if (!isSupported || !text.trim()) return;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set default options optimized for Chinese learning
    utterance.lang = options.lang || 'zh-CN';
    utterance.rate = options.rate ?? 0.7; // Slower for learning
    utterance.pitch = options.pitch ?? 1;
    utterance.volume = options.volume ?? 1;

    // Try to find a Chinese voice with preferred gender if available
    let selectedVoice = null;
    if (voices.length > 0) {
      const chineseVoices = voices.filter(voice => 
        voice.lang.includes('zh') || 
        voice.lang.includes('cmn') || 
        voice.name.toLowerCase().includes('chinese')
      );
      
      if (chineseVoices.length > 0) {
        let preferredVoice = null;
        
        if (options.voiceGender === 'female') {
          // Look for female indicators in voice names
          preferredVoice = chineseVoices.find(voice => 
            voice.name.toLowerCase().includes('female') ||
            voice.name.toLowerCase().includes('woman') ||
            voice.name.toLowerCase().includes('mei') ||
            voice.name.toLowerCase().includes('lily') ||
            voice.name.toLowerCase().includes('xiao')
          );
        } else if (options.voiceGender === 'male') {
          // Look for male indicators in voice names
          preferredVoice = chineseVoices.find(voice => 
            voice.name.toLowerCase().includes('male') ||
            voice.name.toLowerCase().includes('man') ||
            voice.name.toLowerCase().includes('wang') ||
            voice.name.toLowerCase().includes('yun')
          );
        }
        
        // Use preferred voice if found, otherwise use first available Chinese voice
        const chosenVoice = preferredVoice || chineseVoices[0];
        if (chosenVoice) {
          utterance.voice = chosenVoice;
          selectedVoice = chosenVoice.name;
        }
      }
    }

    // Event listeners
    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      // Track successful usage
      const tracker = AudioUsageTracker.getInstance();
      tracker.trackWebSpeechUsage(text, selectedVoice || 'default', true);
    };

    utterance.onerror = (event) => {
      console.warn('Speech synthesis error:', event.error);
      setIsSpeaking(false);
      // Track failed usage
      const tracker = AudioUsageTracker.getInstance();
      tracker.trackWebSpeechUsage(text, selectedVoice || 'default', false);
    };

    utterance.onpause = () => {
      setIsSpeaking(false);
    };

    utterance.onresume = () => {
      setIsSpeaking(true);
    };

    speechSynthesis.speak(utterance);
  }, [isSupported, voices]);

  const cancel = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return {
    speak,
    cancel,
    isSupported,
    isSpeaking,
    voices
  };
};

export default useSpeechSynthesis;
