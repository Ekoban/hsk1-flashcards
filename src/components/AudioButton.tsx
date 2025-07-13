import React from 'react';
import { Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { useGoogleTTS } from '../hooks/useGoogleTTS';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

interface AudioButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  tooltip?: string;
  rate?: number;
  autoPlay?: boolean;
  audioService?: 'google-tts' | 'web-speech';
  voice?: string;
}

const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  className = '',
  size = 'md',
  variant = 'ghost',
  disabled = false,
  tooltip = 'Listen to pronunciation',
  rate = 0.7,
  autoPlay = false,
  audioService = 'google-tts',
  voice = 'zh-CN-Wavenet-A'
}) => {
  const googleTTS = useGoogleTTS();
  const webSpeech = useSpeechSynthesis();

  // Select the appropriate audio service
  const isGoogleTTS = audioService === 'google-tts';
  const { speak, isSupported } = isGoogleTTS ? googleTTS : webSpeech;
  
  // Handle loading state based on service
  const isLoading = isGoogleTTS 
    ? (googleTTS.isLoading || googleTTS.isPlaying)
    : webSpeech.isSpeaking;

  const handleSpeak = React.useCallback(() => {
    if (disabled || !text || !isSupported) return;
    
    if (isGoogleTTS) {
      speak(text, { 
        rate,
        voice, // Use the voice from props
        fallbackToWebSpeech: true // Enable fallback
      });
    } else {
      speak(text, { 
        rate,
        lang: 'zh-CN'
      });
    }
  }, [disabled, text, isSupported, speak, rate, voice, isGoogleTTS]);

  // Auto-play when text changes (if enabled)
  React.useEffect(() => {
    if (autoPlay && text && !disabled && isSupported) {
      const timer = setTimeout(() => {
        handleSpeak();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [text, autoPlay, disabled, isSupported, handleSpeak]);

  const handleClick = () => {
    if (!disabled && text) {
      handleSpeak();
    }
  };

  // Size configurations
  const sizeClasses = {
    sm: 'w-8 h-8 p-1.5',
    md: 'w-10 h-10 p-2',
    lg: 'w-12 h-12 p-2.5'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  // Variant configurations
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white shadow-md',
    secondary: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30',
    ghost: 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white'
  };

  if (!isSupported) {
    return (
      <div 
        className={`${sizeClasses[size]} rounded-full bg-gray-600/50 flex items-center justify-center cursor-not-allowed ${className}`}
        title="Audio not supported in this browser"
      >
        <AlertCircle size={iconSizes[size]} className="text-gray-500" />
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading || !text}
      className={`
        ${sizeClasses[size]} 
        ${variantClasses[variant]}
        rounded-full 
        flex items-center justify-center 
        transition-all duration-200 
        hover:scale-105 
        active:scale-95
        disabled:opacity-50 
        disabled:cursor-not-allowed 
        disabled:hover:scale-100
        ${className}
      `}
      title={tooltip}
      aria-label={`Play pronunciation for ${text}`}
    >
      {isLoading ? (
        <VolumeX 
          size={iconSizes[size]} 
          className="animate-pulse" 
        />
      ) : (
        <Volume2 size={iconSizes[size]} />
      )}
    </button>
  );
};

export default AudioButton;
