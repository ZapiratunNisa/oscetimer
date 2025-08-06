import { useState, useCallback, useRef } from 'react';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Apply voice settings
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Get voice settings from global state
      const settings = (window as any).osceVoiceSettings || {
        volume: 0.8,
        rate: 1,
        pitch: 1
      };

      utterance.volume = settings.volume;
      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error);
        setIsSpeaking(false);
      };

      speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech synthesis not supported in this browser');
    }
  }, [selectedVoice]);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const handleVoiceChange = useCallback((voice: SpeechSynthesisVoice | null) => {
    setSelectedVoice(voice);
    if (voice) {
      localStorage.setItem('osceTimer_selectedVoice', voice.name);
    }
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    selectedVoice,
    handleVoiceChange,
    isSupported: 'speechSynthesis' in window
  };
};