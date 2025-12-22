import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { User, ArrowRight } from 'lucide-react';
import { useSoundEffect } from '../hooks/useAudio';
import { audioGenerator } from '../utils/audioGenerator';

interface PlayerEntryPageProps {
  onSubmit: (name: string) => void;
  onBack: () => void;
}

export const PlayerEntryPage: React.FC<PlayerEntryPageProps> = ({ onSubmit, onBack }) => {
  const { playClick } = useSoundEffect();
  const [name, setName] = useState('');

  // تشغيل الموسيقى الخلفية عند تحميل شاشة إدخال الاسم
  useEffect(() => {
    // إيقاف أي صوت سابق قبل تشغيل الجديد
    audioGenerator.stopAudioFile();
    audioGenerator.playAudioFile('/audio/sound1.wav');

    return () => {
      // إيقاف الموسيقى عند مغادرة الشاشة
      audioGenerator.stopAudioFile();
    };
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (name.trim()) {
      playClick();
      onSubmit(name);
    }
  };

  const handleBack = () => {
    playClick();
    onBack();
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-slate-900 overflow-hidden"
         style={{
           backgroundImage: 'url("/image/unnamed (1).jpg")',
           backgroundSize: 'cover',
           backgroundPosition: 'center'
         }}>
      {/* Background Effects (Consistent with Landing) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-amber-900/30 rounded-3xl p-8 shadow-2xl shadow-black/50 transform transition-all">
          <h2 className="text-3xl font-bold text-center text-amber-500 mb-2 font-sans">سجل اللاعب</h2>
          <p className="text-slate-400 text-center mb-8 text-sm">أدخل اسمك لتبدأ تنظيف النيل</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <User className="h-6 w-6 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full pr-12 pl-4 py-4 bg-slate-950 border-2 border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-lg text-right"
                placeholder="اسم اللاعب..."
                autoFocus
                dir="rtl"
              />
            </div>

            <Button 
              type="button"
              onClick={() => handleSubmit()}
              variant="stone" 
              size="lg"
              className={`w-full text-xl py-4 font-black tracking-wide ${!name.trim() ? 'opacity-60 cursor-not-allowed grayscale-[0.5]' : ''}`}
              disabled={!name.trim()}
            >
              دخول
            </Button>
            
            <button
              type="button"
              onClick={handleBack}
              className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-amber-400 text-sm mt-4 transition-colors"
            >
              <ArrowRight size={14} />
              العودة للقائمة
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};