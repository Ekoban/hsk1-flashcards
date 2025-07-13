import React from 'react';
import { Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useAzureSpeech } from '../hooks/useAzureSpeech';

interface AudioButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  tooltip?: string;
  rate?: number;
  autoPlay?: boolean;
}

const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  className = '',
  size = 'md',
  variant = 'ghost',
  disabled = false,
  tooltip = 'Listen to pronunciation',
  rate = 0.7,
  autoPlay = false
}) => {
  const { speak, isSupported, isSpeaking } = useSpeechSynthesis();
  const azureSpeech = useAzureSpeech();

  const handleSpeak = React.useCallback(async () => {
    if (disabled || !text) return;
    
    // Try Azure first, fallback to Web Speech API
    const azureSuccess = await azureSpeech.speakWithAzure(text, rate);
    
    if (!azureSuccess && isSupported) {
      // Fallback to Web Speech API
      speak(text, { rate });
    }
  }, [disabled, text, rate, isSupported, speak]);

  // Auto-play when text changes (if enabled) - Use a ref to prevent infinite loops
  const autoPlayRef = React.useRef(autoPlay);
  const textRef = React.useRef(text);
  
  React.useEffect(() => {
    autoPlayRef.current = autoPlay;
    textRef.current = text;
  });

  React.useEffect(() => {
    if (autoPlayRef.current && textRef.current && !disabled) {
      const timer = setTimeout(() => {
        handleSpeak();
      }, 300); // Small delay to avoid conflicts

      return () => clearTimeout(timer);
    }
  }, [text, handleSpeak]); // Only depend on text and handleSpeak

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

  const isLoading = isSpeaking || azureSpeech.isLoading;

  if (!isSupported && !azureSpeech.canUseAzure(text?.length || 0)) {
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
