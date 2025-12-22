import React, { useEffect } from 'react';
import { Button } from './Button';
import { Play } from 'lucide-react';
import { useSoundEffect } from '../hooks/useAudio';

interface LandingPageProps {
  onStartGame: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartGame }) => {
  const { playClick } = useSoundEffect();

  const handleStartGame = () => {
    playClick();
    onStartGame();
  };
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-end overflow-hidden bg-slate-950"
         style={{
           backgroundImage: 'url("/image/unnamed (1).jpg")',
           backgroundSize: 'cover',
           backgroundPosition: 'center'
         }}>

      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-amber-950/60 z-10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20 z-0"></div>
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-amber-600/30 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>


      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center justify-end w-full h-full flex-grow pb-32">
        
        {/* Start Button - Bottom */}
        <div className="relative group animate-fade-in-up">
            {/* Glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-600 to-amber-400 rounded-full blur-xl opacity-40 group-hover:opacity-80 transition duration-500 animate-pulse"></div>
            
            <Button
                onClick={handleStartGame}
                variant="stone"
                size="lg"
                className="relative min-w-[300px] text-4xl px-24 py-10 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border-t-4 border-amber-200"
            >
            <div className="flex items-center gap-6">
                <Play className="w-12 h-12 text-amber-950 fill-amber-950" />
                <span className="font-black text-amber-950">ابدأ اللعبة</span>
            </div>
            </Button>
        </div>
        
      </div>
    </div>
  );
};