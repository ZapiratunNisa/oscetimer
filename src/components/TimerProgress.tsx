import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScheduledMessage {
  id: string;
  message: string;
  timeInSeconds: number;
  executed: boolean;
}

interface TimerProgressProps {
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  scheduledMessages: ScheduledMessage[];
}

export const TimerProgress: React.FC<TimerProgressProps> = ({
  remainingSeconds,
  totalSeconds,
  isRunning,
  scheduledMessages
}) => {
  const formatTime = (timeInSeconds: number) => {
    const mins = Math.floor(timeInSeconds / 60);
    const secs = timeInSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const elapsedSeconds = totalSeconds - remainingSeconds;
  const progress = totalSeconds > 0 ? (elapsedSeconds / totalSeconds) * 100 : 0;

  // Get upcoming messages
  const upcomingMessages = scheduledMessages
    .filter(msg => !msg.executed && elapsedSeconds < msg.timeInSeconds)
    .sort((a, b) => a.timeInSeconds - b.timeInSeconds)
    .slice(0, 3); // Show next 3 messages

  // Get next message
  const nextMessage = upcomingMessages[0];
  const timeToNextMessage = nextMessage ? nextMessage.timeInSeconds - elapsedSeconds : null;

  return (
    <Card className="p-4 bg-gradient-timer shadow-elegant">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h4 className="font-semibold text-foreground">Progress & Pesan Mendatang</h4>
        </div>

        {/* Progress Bar with Messages */}
        <div className="relative">
          <div className="bg-muted rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-primary transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Message markers on progress bar */}
          <div className="absolute inset-0">
            {scheduledMessages.map(msg => {
              const messagePosition = (msg.timeInSeconds / totalSeconds) * 100;
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "absolute top-0 w-1 h-3 rounded-full transition-colors",
                    msg.executed ? "bg-primary" : "bg-secondary"
                  )}
                  style={{ left: `${messagePosition}%` }}
                  title={`${formatTime(msg.timeInSeconds)}: ${msg.message}`}
                />
              );
            })}
          </div>
        </div>

        {/* Next Message Alert */}
        {nextMessage && isRunning && (
          <div className="bg-accent/30 border border-accent rounded-lg p-3">
            <div className="flex items-start gap-2">
              <MessageCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Pesan Selanjutnya:
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  "{nextMessage.message}"
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {formatTime(nextMessage.timeInSeconds)}
                  </Badge>
                  {timeToNextMessage !== null && (
                    <span className="text-xs text-muted-foreground">
                      dalam {formatTime(timeToNextMessage)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Messages List */}
        {upcomingMessages.length > 1 && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-muted-foreground">
              Pesan Mendatang ({upcomingMessages.length - 1} lainnya):
            </h5>
            <div className="space-y-1">
              {upcomingMessages.slice(1).map(msg => (
                <div key={msg.id} className="flex items-center gap-2 text-xs">
                  <Badge variant="outline" className="text-xs">
                    {formatTime(msg.timeInSeconds)}
                  </Badge>
                  <span className="text-muted-foreground truncate">
                    {msg.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        <div className="text-center text-xs text-muted-foreground">
          {isRunning ? (
            <span className="text-primary">🟢 Timer berjalan - Pesan akan dibacakan otomatis</span>
          ) : (
            <span>⏸️ Timer berhenti - Mulai timer untuk aktivasi pesan</span>
          )}
        </div>
      </div>
    </Card>
  );
};