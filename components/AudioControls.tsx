import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Settings, Music, Play, Pause } from 'lucide-react';
import { audioManager } from '../utils/audioManager';

interface AudioControlsProps {
  className?: string;
}

export const AudioControls: React.FC<AudioControlsProps> = ({ className = '' }) => {
  const [showControls, setShowControls] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('bottom');
  const [volume, setVolume] = useState(audioManager.getVolume());
  const [isMuted, setIsMuted] = useState(audioManager.getIsMuted());
  const buttonRef = useRef<HTMLButtonElement>(null);

  // تحديث الحالة عند تغيير الإعدادات
  useEffect(() => {
    const handleSettingsChange = () => {
      setVolume(audioManager.getVolume());
      setIsMuted(audioManager.getIsMuted());
    };

    const handleStorageChange = () => {
      setVolume(audioManager.getVolume());
      setIsMuted(audioManager.getIsMuted());
    };

    window.addEventListener('audioSettingsChanged', handleSettingsChange);
    window.addEventListener('storage', handleStorageChange);

    // تحديث أولي
    handleSettingsChange();

    return () => {
      window.removeEventListener('audioSettingsChanged', handleSettingsChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // إعادة حساب الموقع عند تغيير حجم النافذة
  useEffect(() => {
    const handleResize = () => {
      if (showControls) {
        updateDropdownPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showControls]);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setShowControls(false);
      }
    };

    if (showControls) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showControls]);

  // تحديد اتجاه فتح القائمة بناءً على موقع الزر
  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const dropdownHeight = 120; // تقريبي لارتفاع القائمة

      // إذا كان هناك مساحة كافية أسفل الزر، افتح للأسفل
      if (buttonRect.bottom + dropdownHeight < windowHeight) {
        setDropdownPosition('bottom');
      } else {
        setDropdownPosition('top');
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    audioManager.setMasterVolume(newVolume);
  };

  const toggleMute = () => {
    audioManager.toggleMute();
  };

  const handleToggleControls = () => {
    if (!showControls) {
      updateDropdownPosition(); // تحديث الموقع قبل فتح القائمة
    }
    setShowControls(!showControls);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        onClick={handleToggleControls}
        className={`bg-white/20 p-3 rounded-full text-white hover:bg-white/40 transition-colors border border-white/30 shadow-lg backdrop-blur-sm ${
          showControls ? 'bg-white/40' : ''
        }`}
        title="إعدادات الصوت والموسيقى"
      >
        <Settings size={24} />
      </button>

      {showControls && (
        <div className={`absolute bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-lg p-4 shadow-xl min-w-[220px] ${
          dropdownPosition === 'top'
            ? 'bottom-full mb-2 right-0'
            : 'top-full mt-2 right-0'
        }`}>
          {/* العنوان */}
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700">
            <Music size={16} className="text-amber-400" />
            <span className="text-white text-sm font-medium">إعدادات الصوت</span>
          </div>

          {/* التحكم في الصوت */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMute}
                className="text-white hover:text-amber-400 transition-colors p-1"
                title={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>

              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  disabled={isMuted}
                />
              </div>

              <span className="text-white text-xs min-w-[30px] text-center">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>

            {/* معلومات إضافية */}
            <div className="text-xs text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>الموسيقى الخلفية:</span>
                <span className="text-green-400">✓ نشطة</span>
              </div>
              <div className="flex items-center justify-between">
                <span>التأثيرات الصوتية:</span>
                <span className="text-green-400">✓ نشطة</span>
              </div>
            </div>

            {/* نصائح */}
            <div className="text-xs text-slate-500 bg-slate-800/50 rounded px-2 py-1">
              💡 انقر على أي مكان خارج القائمة لإغلاقها
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #fbbf24;
          cursor: pointer;
          border: 2px solid #1e293b;
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #fbbf24;
          cursor: pointer;
          border: 2px solid #1e293b;
        }
      `}</style>
    </div>
  );
};
