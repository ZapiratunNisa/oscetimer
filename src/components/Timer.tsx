import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Timer as TimerIcon, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTimerAudio } from '@/hooks/useTimerAudio';

interface ScheduledMessage {
  id: string;
  message: string;
  timeInSeconds: number;
  executed: boolean;
}

interface TimerProps {
  onTimeUpdate?: (remainingSeconds: number, isRunning: boolean) => void;
  scheduledMessages?: ScheduledMessage[];
  onMessageExecuted?: (messageId: string) => void;
}

export const Timer: React.FC<TimerProps> = ({ 
  onTimeUpdate, 
  scheduledMessages = [], 
  onMessageExecuted 
}) => {
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(300);
  const [remainingSeconds, setRemainingSeconds] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Audio hooks
  const { 
    playTick, 
    playWarningBeep, 
    playCompletionSound, 
    isTickEnabled, 
    setIsTickEnabled, 
    tickVolume, 
    setTickVolume,
    isSupported: isAudioSupported 
  } = useTimerAudio();

  useEffect(() => {
    setTotalSeconds(minutes * 60 + seconds);
    setRemainingSeconds(minutes * 60 + seconds);
  }, [minutes, seconds]);

  useEffect(() => {
    onTimeUpdate?.(remainingSeconds, isRunning);
  }, [remainingSeconds, isRunning, onTimeUpdate]);

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          const newTime = prev - 1;
          
          // Play tick sound
          if (isTickEnabled && newTime > 0) {
            playTick();
          }
          
          // Play warning beep when 30 seconds or less
          if (newTime === 30) {
            playWarningBeep();
          }
          
          // Check for scheduled messages
          scheduledMessages.forEach(msg => {
            if (!msg.executed && newTime === (totalSeconds - msg.timeInSeconds)) {
              onMessageExecuted?.(msg.id);
            }
          });

          if (newTime <= 0) {
            setIsRunning(false);
            setIsCompleted(true);
            playCompletionSound(); // Play completion sound
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, remainingSeconds, scheduledMessages, totalSeconds, onMessageExecuted, isTickEnabled, playTick, playWarningBeep, playCompletionSound]);

  const handleStart = () => {
    if (remainingSeconds > 0) {
      setIsRunning(!isRunning);
      setIsCompleted(false);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsCompleted(false);
    setRemainingSeconds(totalSeconds);
  };

  const formatTime = (timeInSeconds: number) => {
    const mins = Math.floor(timeInSeconds / 60);
    const secs = timeInSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  return (
    <Card className="p-8 bg-gradient-timer shadow-elegant">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <TimerIcon className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Timer OSCE</h2>
        </div>

        {/* Time Settings */}
        <div className="flex justify-center gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Menit</label>
            <Input
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
              disabled={isRunning}
              className="w-20 text-center"
              min="0"
              max="99"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Detik</label>
            <Input
              type="number"
              value={seconds}
              onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
              disabled={isRunning}
              className="w-20 text-center"
              min="0"
              max="59"
            />
          </div>
        </div>

        {/* Timer Display */}
        <div className="relative">
          <div className={cn(
            "text-8xl font-mono font-bold tracking-wider transition-all duration-300",
            remainingSeconds <= 30 && remainingSeconds > 0 && isRunning ? "text-destructive animate-pulse-glow" :
            isCompleted ? "text-destructive" : "text-timer-text"
          )}>
            {formatTime(remainingSeconds)}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-primary transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleStart}
            size="lg"
            className={cn(
              "px-8 py-3 text-lg font-semibold transition-all duration-300",
              isRunning ? "bg-destructive hover:bg-destructive/90" : "bg-gradient-primary hover:shadow-glow"
            )}
          >
            {isRunning ? (
              <>
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Mulai
              </>
            )}
          </Button>
          
          <Button
            onClick={handleReset}
            variant="outline"
            size="lg"
            className="px-8 py-3 text-lg font-semibold"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Reset
          </Button>
        </div>

        {/* Audio Controls */}
        {isAudioSupported && (
          <div className="bg-accent/20 rounded-lg p-4 border border-accent space-y-4">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Pengaturan Audio Timer
            </h4>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isTickEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
                <span className="text-sm">Suara Tick Per Detik</span>
              </div>
              <Switch
                checked={isTickEnabled}
                onCheckedChange={setIsTickEnabled}
              />
            </div>
            
            {isTickEnabled && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground">Volume Tick</label>
                  <span className="text-xs text-muted-foreground">{Math.round(tickVolume * 100)}%</span>
                </div>
                <Slider
                  value={[tickVolume]}
                  onValueChange={(value) => setTickVolume(value[0])}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>
            )}
            
            <p className="text-xs text-muted-foreground">
              Timer akan berbunyi setiap detik saat berjalan. Peringatan khusus pada 30 detik terakhir.
            </p>
          </div>
        )}

        {isCompleted && (
          <div className="text-destructive text-xl font-bold animate-fade-in">
            ⏰ Waktu Habis!
          </div>
        )}
      </div>
    </Card>
  );
};