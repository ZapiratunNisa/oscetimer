import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Volume2, Play, Settings } from 'lucide-react';

interface VoiceSettingsProps {
  onVoiceChange: (voice: SpeechSynthesisVoice | null) => void;
  onSpeak: (text: string) => void;
  selectedVoice: SpeechSynthesisVoice | null;
}

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  onVoiceChange,
  onSpeak,
  selectedVoice
}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [volume, setVolume] = useState([0.8]);
  const [rate, setRate] = useState([1]);
  const [pitch, setPitch] = useState([1]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Set default voice (prefer Indonesian or English)
      if (availableVoices.length > 0 && !selectedVoice) {
        const indonesianVoice = availableVoices.find(voice => 
          voice.lang.includes('id') || voice.lang.includes('ID')
        );
        const englishVoice = availableVoices.find(voice => 
          voice.lang.includes('en') || voice.lang.includes('EN')
        );
        onVoiceChange(indonesianVoice || englishVoice || availableVoices[0]);
      }
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoice, onVoiceChange]);

  const handleTestSpeak = () => {
    onSpeak("Ini adalah tes suara untuk timer OSCE. Silakan periksa apakah suara terdengar jelas.");
  };

  const handleVoiceSelect = (voiceName: string) => {
    const voice = voices.find(v => v.name === voiceName) || null;
    onVoiceChange(voice);
  };

  // Store voice settings in localStorage
  useEffect(() => {
    localStorage.setItem('osceTimer_volume', volume[0].toString());
    localStorage.setItem('osceTimer_rate', rate[0].toString());
    localStorage.setItem('osceTimer_pitch', pitch[0].toString());
  }, [volume, rate, pitch]);

  // Load voice settings from localStorage
  useEffect(() => {
    const savedVolume = localStorage.getItem('osceTimer_volume');
    const savedRate = localStorage.getItem('osceTimer_rate');
    const savedPitch = localStorage.getItem('osceTimer_pitch');

    if (savedVolume) setVolume([parseFloat(savedVolume)]);
    if (savedRate) setRate([parseFloat(savedRate)]);
    if (savedPitch) setPitch([parseFloat(savedPitch)]);
  }, []);

  // Expose voice settings globally for speech synthesis
  useEffect(() => {
    (window as any).osceVoiceSettings = {
      volume: volume[0],
      rate: rate[0],
      pitch: pitch[0]
    };
  }, [volume, rate, pitch]);

  return (
    <Card className="p-6 bg-gradient-card shadow-elegant">
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold text-foreground">Pengaturan Suara</h3>
        </div>

        {/* Voice Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Pilih Suara:</label>
          <Select
            value={selectedVoice?.name || ''}
            onValueChange={handleVoiceSelect}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih suara..." />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] overflow-y-auto bg-popover">
              {voices.map((voice) => (
                <SelectItem key={voice.name} value={voice.name}>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{voice.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {voice.lang} {voice.localService ? '(Local)' : '(Online)'}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Voice Controls */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Volume
              </label>
              <span className="text-sm text-muted-foreground">{Math.round(volume[0] * 100)}%</span>
            </div>
            <Slider
              value={volume}
              onValueChange={setVolume}
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Kecepatan</label>
              <span className="text-sm text-muted-foreground">{rate[0]}x</span>
            </div>
            <Slider
              value={rate}
              onValueChange={setRate}
              min={0.5}
              max={2}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Nada</label>
              <span className="text-sm text-muted-foreground">{pitch[0]}</span>
            </div>
            <Slider
              value={pitch}
              onValueChange={setPitch}
              min={0.5}
              max={2}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>

        {/* Test Button */}
        <Button
          onClick={handleTestSpeak}
          variant="outline"
          className="w-full"
          disabled={!selectedVoice}
        >
          <Play className="h-4 w-4 mr-2" />
          Test Suara
        </Button>

        {voices.length === 0 && (
          <div className="text-center text-muted-foreground text-sm">
            <p>⚠️ Tidak ada suara yang tersedia</p>
            <p>Pastikan browser Anda mendukung Text-to-Speech</p>
          </div>
        )}
      </div>
    </Card>
  );
};