import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Timer as TimerIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScheduledMessage {
  id: string;
  message: string;
  timeInSeconds: number;
  executed: boolean;
}

interface TimerProps {
  onTimeUpdate?: (remainingSeconds: number) => void;
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

  useEffect(() => {
    setTotalSeconds(minutes * 60 + seconds);
    setRemainingSeconds(minutes * 60 + seconds);
  }, [minutes, seconds]);

  useEffect(() => {
    onTimeUpdate?.(remainingSeconds);
  }, [remainingSeconds, onTimeUpdate]);

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          const newTime = prev - 1;
          
          // Check for scheduled messages
          scheduledMessages.forEach(msg => {
            if (!msg.executed && newTime === (totalSeconds - msg.timeInSeconds)) {
              onMessageExecuted?.(msg.id);
            }
          });

          if (newTime <= 0) {
            setIsRunning(false);
            setIsCompleted(true);
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
  }, [isRunning, remainingSeconds, scheduledMessages, totalSeconds, onMessageExecuted]);

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

        {isCompleted && (
          <div className="text-destructive text-xl font-bold animate-fade-in">
            ⏰ Waktu Habis!
          </div>
        )}
      </div>
    </Card>
  );
};