import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, MessageCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ScheduledMessage {
  id: string;
  message: string;
  timeInSeconds: number;
  executed: boolean;
}

interface MessageSchedulerProps {
  messages: ScheduledMessage[];
  onAddMessage: (message: Omit<ScheduledMessage, 'id' | 'executed'>) => void;
  onRemoveMessage: (id: string) => void;
  onSpeakMessage: (message: string) => void;
  totalDuration: number;
}

export const MessageScheduler: React.FC<MessageSchedulerProps> = ({
  messages,
  onAddMessage,
  onRemoveMessage,
  onSpeakMessage,
  totalDuration
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(30);

  const handleAddMessage = () => {
    if (newMessage.trim()) {
      const timeInSeconds = minutes * 60 + seconds;
      if (timeInSeconds <= totalDuration && timeInSeconds > 0) {
        onAddMessage({
          message: newMessage.trim(),
          timeInSeconds
        });
        setNewMessage('');
        setMinutes(0);
        setSeconds(30);
      }
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const mins = Math.floor(timeInSeconds / 60);
    const secs = timeInSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sortedMessages = [...messages].sort((a, b) => a.timeInSeconds - b.timeInSeconds);

  return (
    <Card className="p-6 bg-gradient-card shadow-elegant">
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold text-foreground">Pesan Terjadwal</h3>
        </div>

        {/* Add New Message */}
        <div className="space-y-4 p-4 bg-accent/20 rounded-lg border border-accent">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Pesan yang akan dibacakan:
            </label>
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Contoh: Waktu tersisa 2 menit, silakan selesaikan pemeriksaan"
              className="min-h-[80px]"
            />
          </div>
          
          <div className="flex items-end gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Menit</label>
              <Input
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-20 text-center"
                min="0"
                max={Math.floor(totalDuration / 60)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Detik</label>
              <Input
                type="number"
                value={seconds}
                onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                className="w-20 text-center"
                min="0"
                max="59"
              />
            </div>
            <Button 
              onClick={handleAddMessage}
              disabled={!newMessage.trim() || (minutes * 60 + seconds) <= 0 || (minutes * 60 + seconds) > totalDuration}
              className="bg-gradient-primary hover:shadow-glow"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Pesan akan dibacakan pada menit ke-{minutes}:{seconds.toString().padStart(2, '0')} dari total durasi {formatTime(totalDuration)}
          </p>
        </div>

        {/* Messages List */}
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Daftar Pesan ({sortedMessages.length})
          </h4>
          
          {sortedMessages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Belum ada pesan terjadwal</p>
              <p className="text-sm">Tambahkan pesan untuk dibacakan otomatis</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all duration-300",
                    msg.executed 
                      ? "bg-primary/10 border-primary text-primary-foreground" 
                      : "bg-card border-border hover:shadow-md"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={msg.executed ? "default" : "secondary"} className="text-xs">
                          {formatTime(msg.timeInSeconds)}
                        </Badge>
                        {msg.executed && (
                          <Badge variant="outline" className="text-xs text-primary border-primary">
                            ✓ Telah Dibacakan
                          </Badge>
                        )}
                      </div>
                      <p className={cn(
                        "text-sm leading-relaxed",
                        msg.executed ? "text-primary font-medium" : "text-foreground"
                      )}>
                        {msg.message}
                      </p>
                      {!msg.executed && (
                        <p className="text-xs text-muted-foreground mt-1">
                          📢 Akan dibacakan otomatis saat timer mencapai waktu ini
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSpeakMessage(msg.message)}
                        className="px-3"
                      >
                        🔊
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRemoveMessage(msg.id)}
                        className="px-3 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};