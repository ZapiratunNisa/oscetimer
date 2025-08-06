import { useCallback, useRef, useState, useEffect } from 'react';

export const useTimerAudio = () => {
  const [isTickEnabled, setIsTickEnabled] = useState(true);
  const [tickVolume, setTickVolume] = useState(0.3);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    const initAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };

    // Resume audio context on user interaction
    const handleUserInteraction = () => {
      initAudioContext();
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };

    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  // Load settings from localStorage
  useEffect(() => {
    const savedTickEnabled = localStorage.getItem('osceTimer_tickEnabled');
    const savedTickVolume = localStorage.getItem('osceTimer_tickVolume');

    if (savedTickEnabled !== null) {
      setIsTickEnabled(savedTickEnabled === 'true');
    }
    if (savedTickVolume) {
      setTickVolume(parseFloat(savedTickVolume));
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('osceTimer_tickEnabled', isTickEnabled.toString());
    localStorage.setItem('osceTimer_tickVolume', tickVolume.toString());
  }, [isTickEnabled, tickVolume]);

  const playTick = useCallback(() => {
    if (!isTickEnabled || !audioContextRef.current) return;

    try {
      const audioContext = audioContextRef.current;
      
      // Create a simple beep sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configure the tick sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Higher pitch for tick
      oscillator.type = 'sine';

      // Set volume
      gainNode.gain.setValueAtTime(tickVolume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

      // Play the sound
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn('Error playing tick sound:', error);
    }
  }, [isTickEnabled, tickVolume]);

  const playWarningBeep = useCallback(() => {
    if (!audioContextRef.current) return;

    try {
      const audioContext = audioContextRef.current;
      
      // Create a warning beep (lower pitch, longer duration)
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(400, audioContext.currentTime); // Lower pitch for warning
      oscillator.type = 'triangle';

      gainNode.gain.setValueAtTime(tickVolume * 1.5, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Error playing warning beep:', error);
    }
  }, [tickVolume]);

  const playCompletionSound = useCallback(() => {
    if (!audioContextRef.current) return;

    try {
      const audioContext = audioContextRef.current;
      
      // Create a completion sound (series of beeps)
      const playBeep = (startTime: number, frequency: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = 'triangle';

        gainNode.gain.setValueAtTime(tickVolume * 2, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.2);
      };

      // Play 3 beeps with increasing pitch
      playBeep(audioContext.currentTime, 600);
      playBeep(audioContext.currentTime + 0.3, 800);
      playBeep(audioContext.currentTime + 0.6, 1000);
    } catch (error) {
      console.warn('Error playing completion sound:', error);
    }
  }, [tickVolume]);

  return {
    playTick,
    playWarningBeep,
    playCompletionSound,
    isTickEnabled,
    setIsTickEnabled,
    tickVolume,
    setTickVolume,
    isSupported: !!(window.AudioContext || (window as any).webkitAudioContext)
  };
};