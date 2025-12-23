import React from 'react';
import { Button } from './Button';

interface QRCodePageProps {
  onBack: () => void;
}

export const QRCodePage: React.FC<QRCodePageProps> = ({ onBack }) => {
  const gameUrl = 'https://phenomenal-faloodeh-52c1a6.netlify.app';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(gameUrl);
      alert('تم نسخ الرابط إلى الحافظة! 📋');
    } catch (err) {
      console.error('فشل في نسخ الرابط:', err);
      // Fallback: select text in a temporary input
      const textArea = document.createElement('textarea');
      textArea.value = gameUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('تم نسخ الرابط إلى الحافظة! 📋');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6">
      {/* خلفية مع رموز فرعونية */}
      <div className="absolute top-16 left-16 text-6xl text-amber-300/20 animate-pulse">𓂀</div>
      <div className="absolute top-24 right-24 text-5xl text-blue-400/20 animate-pulse animation-delay-1000">𓁛</div>
      <div className="absolute bottom-32 left-24 text-4xl text-amber-400/20 animate-pulse animation-delay-500">𓀠</div>
      <div className="absolute bottom-24 right-32 text-3xl text-blue-300/20 animate-pulse animation-delay-1500">𓂓</div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* العنوان */}
        <div className="mb-8">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 mb-4 drop-shadow-2xl">
            🎮 شارك اللعبة!
          </h1>
          <h2 className="text-2xl font-bold text-blue-200 mb-2">
            نظف نيلك - مغامرة ثلاثية الأبعاد
          </h2>
          <p className="text-lg text-slate-300">
            مسح الباركود بالكاميرا للعب فوراً!
          </p>
        </div>

        {/* الـ QR Code */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-amber-500/30 shadow-2xl mb-8">
          <img
            src="/image/game-qr-code.png"
            alt="QR Code للعبة نظف نيلك"
            className="w-64 h-64 mx-auto rounded-xl shadow-lg border-4 border-amber-400"
          />
          <p className="text-sm text-amber-200 mt-4">
            📱 مسح هذا الباركود بكاميرا الهاتف
          </p>
        </div>

        {/* معلومات إضافية */}
        <div className="bg-black/30 rounded-xl p-6 border border-blue-500/30 mb-8">
          <h3 className="text-xl font-bold text-blue-300 mb-4">💡 كيفية المشاركة:</h3>
          <div className="space-y-3 text-left max-w-md mx-auto">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📷</span>
              <p className="text-slate-200">مسح الباركود بكاميرا الهاتف للعب مباشرة</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔗</span>
              <p className="text-slate-200">نسخ الرابط ومشاركته مع الأصدقاء</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📱</span>
              <p className="text-slate-200">يعمل على جميع الأجهزة (حاسوب، موبايل، تاب)</p>
            </div>
          </div>
        </div>

        {/* الرابط */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600 mb-8">
          <p className="text-sm text-slate-400 mb-2">الرابط المباشر:</p>
          <div className="flex items-center gap-3 bg-slate-900/50 rounded px-3 py-2">
            <code className="text-amber-300 text-sm flex-1 break-all">
              {gameUrl}
            </code>
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              📋 نسخ
            </button>
          </div>
        </div>

        {/* أزرار التنقل */}
        <div className="flex gap-4">
          <Button
            onClick={onBack}
            variant="secondary"
            className="px-6 py-3"
          >
            🔙 العودة للقائمة
          </Button>

          <Button
            onClick={() => window.open(gameUrl, '_blank')}
            variant="primary"
            className="px-6 py-3"
          >
            🎮 شغل اللعبة
          </Button>
        </div>

        {/* رسالة تشجيعية */}
        <div className="mt-8 text-center">
          <p className="text-lg text-amber-200 animate-pulse">
            🌍 ساعد في حماية النيل من التلوث! 🏛️
          </p>
        </div>
      </div>
    </div>
  );
};