import React, { useState, useCallback } from 'react';
import { Timer } from '@/components/Timer';
import { MessageScheduler, ScheduledMessage } from '@/components/MessageScheduler';
import { VoiceSettings } from '@/components/VoiceSettings';
import { TimerProgress } from '@/components/TimerProgress';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useToast } from '@/hooks/use-toast';
import heroImage from '@/assets/hero-image.jpg';

const Index = () => {
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([]);
  const [currentDuration, setCurrentDuration] = useState(300); // 5 minutes default
  const [currentRemainingTime, setCurrentRemainingTime] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const { speak, selectedVoice, handleVoiceChange } = useSpeechSynthesis();
  const { toast } = useToast();

  const handleAddMessage = useCallback((messageData: Omit<ScheduledMessage, 'id' | 'executed'>) => {
    const newMessage: ScheduledMessage = {
      ...messageData,
      id: Date.now().toString(),
      executed: false
    };
    setScheduledMessages(prev => [...prev, newMessage]);
    toast({
      title: "Pesan Ditambahkan",
      description: `Pesan akan dibacakan pada menit ke-${Math.floor(messageData.timeInSeconds / 60)}:${(messageData.timeInSeconds % 60).toString().padStart(2, '0')}`,
    });
  }, [toast]);

  const handleRemoveMessage = useCallback((id: string) => {
    setScheduledMessages(prev => prev.filter(msg => msg.id !== id));
    toast({
      title: "Pesan Dihapus",
      description: "Pesan terjadwal telah dihapus dari daftar",
    });
  }, [toast]);

  const handleMessageExecuted = useCallback((messageId: string) => {
    setScheduledMessages(prev => {
      const updatedMessages = prev.map(msg => 
        msg.id === messageId ? { ...msg, executed: true } : msg
      );
      
      // Find and speak the message
      const message = prev.find(msg => msg.id === messageId);
      if (message) {
        speak(message.message);
        toast({
          title: "🔊 Pesan Otomatis Dibacakan",
          description: message.message,
          duration: 5000,
        });
      }
      
      return updatedMessages;
    });
  }, [speak, toast]);

  const handleTimeUpdate = useCallback((remainingSeconds: number, isRunning: boolean) => {
    setCurrentRemainingTime(remainingSeconds);
    setIsTimerRunning(isRunning);
  }, []);

  const handleSpeakMessage = useCallback((message: string) => {
    speak(message);
  }, [speak]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-primary text-white overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative z-10 container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
            Timer OSCE Pro
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">
            Timer profesional untuk ujian OSCE dengan pesan suara otomatis dan kontrol lengkap
          </p>
        </div>
      </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Timer */}
            <div className="space-y-8">
              <Timer 
                onTimeUpdate={handleTimeUpdate}
                scheduledMessages={scheduledMessages}
                onMessageExecuted={handleMessageExecuted}
              />
              
              <VoiceSettings
                onVoiceChange={handleVoiceChange}
                onSpeak={handleSpeakMessage}
                selectedVoice={selectedVoice}
              />
            </div>

            {/* Right Column - Message Scheduler & Progress */}
            <div className="space-y-8">
              <TimerProgress
                remainingSeconds={currentRemainingTime}
                totalSeconds={currentDuration}
                isRunning={isTimerRunning}
                scheduledMessages={scheduledMessages}
              />
              
              <MessageScheduler
                messages={scheduledMessages}
                onAddMessage={handleAddMessage}
                onRemoveMessage={handleRemoveMessage}
                onSpeakMessage={handleSpeakMessage}
                totalDuration={currentDuration}
              />
            </div>
          </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-card rounded-lg shadow-elegant">
            <div className="text-4xl mb-4">⏲️</div>
            <h3 className="text-lg font-semibold mb-2">Timer Akurat</h3>
            <p className="text-muted-foreground text-sm">
              Pengatur waktu mundur dengan kontrol menit dan detik yang presisi
            </p>
          </div>
          
          <div className="text-center p-6 bg-gradient-card rounded-lg shadow-elegant">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-semibold mb-2">Pesan Otomatis</h3>
            <p className="text-muted-foreground text-sm">
              Jadwalkan pesan untuk dibacakan pada waktu tertentu secara otomatis
            </p>
          </div>
          
          <div className="text-center p-6 bg-gradient-card rounded-lg shadow-elegant">
            <div className="text-4xl mb-4">🗣️</div>
            <h3 className="text-lg font-semibold mb-2">Text-to-Speech</h3>
            <p className="text-muted-foreground text-sm">
              Pilih suara yang tersedia di browser dengan kontrol volume dan kecepatan
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-16 bg-accent/20 rounded-lg p-8 border border-accent">
          <h2 className="text-2xl font-bold mb-6 text-center">Cara Penggunaan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 font-bold">1</div>
              <h4 className="font-semibold mb-2">Atur Timer</h4>
              <p className="text-sm text-muted-foreground">Set durasi ujian dalam menit dan detik</p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 font-bold">2</div>
              <h4 className="font-semibold mb-2">Tambah Pesan</h4>
              <p className="text-sm text-muted-foreground">Buat pesan pengingat untuk waktu tertentu</p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 font-bold">3</div>
              <h4 className="font-semibold mb-2">Pilih Suara</h4>
              <p className="text-sm text-muted-foreground">Sesuaikan pengaturan suara dan volume</p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 font-bold">4</div>
              <h4 className="font-semibold mb-2">Mulai Timer</h4>
              <p className="text-sm text-muted-foreground">Klik tombol mulai untuk memulai ujian</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;