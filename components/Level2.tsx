import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { useSoundEffect } from '../hooks/useAudio';

interface Level2Props {
  playerName: string;
  onComplete: () => void;
  onBack: () => void;
}

export const Level2: React.FC<Level2Props> = ({ playerName, onComplete, onBack }) => {
  const { playClick } = useSoundEffect();

  // حالة animation الركوب
  const [isRidingBoat, setIsRidingBoat] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [selectedTool, setSelectedTool] = useState<string>('');

  // حالة الفيديو والصورة النهائية
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [showFinalImage, setShowFinalImage] = useState<boolean>(false);
  const [showCleanVideo1, setShowCleanVideo1] = useState<boolean>(false);
  const [showCleanVideo2, setShowCleanVideo2] = useState<boolean>(false);
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(false);
  const [videoLoadingProgress, setVideoLoadingProgress] = useState<number>(0);
  const [videoFinished, setVideoFinished] = useState<boolean>(false);

  // refs for cleaning videos
  const cleanVideoRef1 = useRef<HTMLVideoElement | null>(null);
  const cleanVideoRef2 = useRef<HTMLVideoElement | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('🔄 المرحلة الثانية - حالة اللعبة:', {
      playerName,
      isRidingBoat,
      gameStarted,
      selectedTool,
      showFinalImage,
      showCleanVideo1,
      showCleanVideo2
    });
  }, [playerName, isRidingBoat, gameStarted, selectedTool, showFinalImage, showCleanVideo1, showCleanVideo2]);

  // تشغيل الفيديوهات عند فتح الـ overlays
  useEffect(() => {
    if (showCleanVideo1) {
      const v = cleanVideoRef1.current;
      if (v) {
        const playPromise = v.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch((err) => {
            console.warn('تعذر التشغيل التلقائي لـ clean1.mp4:', err);
          });
        }
      }
    }
  }, [showCleanVideo1]);

  useEffect(() => {
    if (showCleanVideo2) {
      const v = cleanVideoRef2.current;
      if (v) {
        const playPromise = v.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch((err) => {
            console.warn('تعذر التشغيل التلقائي لـ clean2.mp4:', err);
          });
        }
      }
    }
  }, [showCleanVideo2]);

  // تشغيل animation الركوب في المرحلة الثانية
  const handleBoatRide = () => {
    console.log('🚤 بدء animation الركوب - المرحلة الثانية');
    setGameStarted(true);
    setIsRidingBoat(true);

    // بعد 11 ثانية، أظهر progress bar للفيديو
    setTimeout(() => {
      console.log('📊 بدء تحميل الفيديو - المرحلة الثانية');
      setIsVideoLoading(true);
      setVideoLoadingProgress(0);
      setIsRidingBoat(false);

      // progress bar متدرج للفيديو
      const progressInterval = setInterval(() => {
        setVideoLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => {
              setIsVideoLoading(false);
              setTimeout(() => {
                console.log('🎬 تشغيل الفيديو - المرحلة الثانية');
                setShowVideo(true);
              }, 300);
            }, 800);
            return 100;
          }
          return prev + 8;
        });
      }, 200);
    }, 11000);
  };

  // معالج انتهاء الفيديو
  const handleVideoEnded = () => {
    console.log('📸 إظهار الصورة النهائية - المرحلة الثانية');
    setVideoFinished(true);
    setShowVideo(false);
    setShowFinalImage(true);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-white relative">
      {/* خلفية صورة المصنع */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-10"
        style={{
          backgroundImage: `url('/image/factory.png')`
        }}
      />

      {/* الشخصية avtar.png على الأرض في الشمال */}
      <div className="absolute top-12 left-1/3 z-15 transform -translate-x-1/2">
        <div className="relative group">
          {/* الشخصية على الأرض */}
          <div className="relative">
            <img
              src="/image/avtar.png"
              alt="الشخصية على الأرض في الشمال"
              className="w-28 h-28 object-contain drop-shadow-2xl border-2 border-white/60 rounded-full transition-all duration-300 hover:scale-110"
              draggable={false}
            />
            {/* ظل تحت الشخصية */}
            <div className="absolute top-24 left-1/2 -translate-x-1/2 w-20 h-6 bg-black/40 blur-lg rounded-full"></div>
          </div>

          {/* اسم الشخصية */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-white text-sm font-bold bg-black/80 px-3 py-1 rounded-lg shadow-lg border border-white/30">
            👤 اللاعب
          </div>

          {/* مؤشر الوقوف على الأرض */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-amber-400 text-lg animate-bounce">
            🏭
          </div>
        </div>
      </div>

      {/* الشخصية avtar.png على الأرض في الشمال */}
      <div className="absolute top-8 left-1/4 z-15 transform -translate-x-1/2">
        <div className="relative group">
          {/* الشخصية على الأرض */}
          <div className="relative">
            <img
              src="/image/avtar.png"
              alt="الشخصية على الأرض في الشمال"
              className="w-24 h-24 object-contain drop-shadow-2xl border-2 border-white/50 rounded-full transition-all duration-300 hover:scale-110"
              draggable={false}
            />
            {/* ظل تحت الشخصية */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-16 h-4 bg-black/30 blur-lg rounded-full"></div>
          </div>

          {/* اسم الشخصية */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-white text-sm font-bold bg-black/70 px-2 py-1 rounded-md shadow-lg border border-white/30">
            👤 اللاعب
          </div>

          {/* مؤشر الوقوف على الأرض */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-400 text-lg animate-bounce">
            🏭
          </div>
        </div>
      </div>

      {/* الولد في اليمين - يختفي بعد انتهاء الفيديو */}
      {!videoFinished && (
        <div
          className={`absolute z-15 bottom-1/4 ${
            isRidingBoat ? 'left-1/2 transition-all duration-[11000ms] ease-in-out' : 'left-3/4'
          }`}
        >
          <div className="w-16 h-16 rounded-full overflow-hidden shadow-xl">
            <img
              src="/image/avtar1.png"
              alt="شخصية اللاعب"
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        </div>
      )}

      {/* الفيديو - يظهر بعد انتهاء الحركة */}
      {showVideo && (
        <div className="absolute inset-0 z-40 bg-black/50 flex items-center justify-center">
          <video
            src="/image/drive_boot.mp4"
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnded}
            className="max-w-full max-h-full rounded-lg shadow-2xl"
            style={{ maxWidth: '80%', maxHeight: '80%' }}
          />
        </div>
      )}

      {/* فيديو التنظيف 1 - يظهر عند اختيار الشبكة */}
      {showCleanVideo1 && (
        <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-white text-3xl font-bold mb-6">🎬 فيديو التنظيف - الشبكة (المصنع)</h2>

            <video
              src="/image/clean1.mp4"
              ref={cleanVideoRef1}
              controls
              autoPlay
              muted
              playsInline
              onEnded={() => {
                setShowCleanVideo1(false);
                onComplete();
              }}
              onError={(e) => {
                console.error('خطأ في clean1.mp4:', e);
                alert('خطأ في تحميل الفيديو. تأكد من وجود clean1.mp4 في public/image');
                setShowCleanVideo1(false);
              }}
              onLoadedData={() => console.log('clean1.mp4 جاهز')}
              className="w-full max-h-[70vh] rounded-lg shadow-2xl border-4 border-blue-500 mx-auto"
              preload="metadata"
            />

            <div className="mt-6">
              <p className="text-gray-300 text-lg mb-4">💡 الفيديو يبدأ تلقائياً، يمكنك التحكم فيه</p>
              <button
                onClick={() => setShowCleanVideo1(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg text-lg"
              >
                ✕ إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* فيديو التنظيف 2 - يظهر عند اختيار المغرفة */}
      {showCleanVideo2 && (
        <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-white text-3xl font-bold mb-6">🎬 فيديو التنظيف - المغرفة (المصنع)</h2>

            <video
              src="/image/clean2.mp4"
              ref={cleanVideoRef2}
              controls
              autoPlay
              muted
              playsInline
              onEnded={() => {
                setShowCleanVideo2(false);
                onComplete();
              }}
              onError={(e) => {
                console.error('خطأ في clean2.mp4:', e);
                alert('خطأ في تحميل الفيديو. تأكد من وجود clean2.mp4 في public/image');
                setShowCleanVideo2(false);
              }}
              onLoadedData={() => console.log('clean2.mp4 جاهز')}
              className="w-full max-h-[70vh] rounded-lg shadow-2xl border-4 border-green-500 mx-auto"
              preload="metadata"
            />

            <div className="mt-6">
              <p className="text-gray-300 text-lg mb-4">💡 الفيديو يبدأ تلقائياً، يمكنك التحكم فيه</p>
              <button
                onClick={() => setShowCleanVideo2(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg text-lg"
              >
                ✕ إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar للفيديو */}
      {isVideoLoading && !showVideo && (
        <div className="absolute inset-0 z-40 bg-black/60 flex items-center justify-center">
          <div className="text-center">
            <div className="w-[600px] mx-auto mb-8">
              <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-full h-8 overflow-hidden shadow-inner border-6 border-amber-600 relative">
                <div className="bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-500 h-full rounded-full transition-all duration-300 ease-out shadow-lg relative overflow-hidden"
                     style={{ width: `${Math.min(videoLoadingProgress, 100)}%` }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-2xl text-amber-900 animate-bounce">
                    𓂀
                  </div>
                </div>
              </div>
            </div>

            <div className="text-7xl font-black text-amber-300 mb-6 drop-shadow-2xl animate-pulse">
              {Math.round(Math.min(videoLoadingProgress, 100))}%
            </div>

            <div className="text-3xl text-amber-100 animate-pulse bg-black/50 rounded-xl px-8 py-4 border-2 border-amber-500/50 shadow-2xl">
              {videoLoadingProgress < 30 && "🌟 تحضير المشاهد الساحرة..."}
              {videoLoadingProgress >= 30 && videoLoadingProgress < 70 && "🎬 تحميل المغامرة البحرية..."}
              {videoLoadingProgress >= 70 && videoLoadingProgress < 100 && "🏭 إعداد عالم المصنع..."}
              {videoLoadingProgress >= 100 && "✨ كل شيء جاهز! ابدأ المشاهدة..."}
            </div>
          </div>
        </div>
      )}

      {/* الصورة النهائية - تظهر بعد الفيديو */}
      {showFinalImage && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-25 flex flex-col-reverse items-center">
          <img
            src="/image/avtar&boot.png"
            alt="الولد والمركب في الماء"
            className="w-64 h-48 object-contain relative z-10"
          />

          {/* قائمة الأدوات - تظهر فوق الصورة */}
          {showFinalImage && !showCleanVideo1 && !showCleanVideo2 && (
            <div className="relative z-50 pt-2" style={{ pointerEvents: 'auto' }}>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    console.log('🔵 تم النقر على الزر الأزرق (الشبكة)');
                    setSelectedTool('net');
                    setShowFinalImage(false);
                    setShowCleanVideo1(true);
                  }}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer active:scale-95 font-bold text-lg shadow-2xl"
                >
                  🕸️ شبكة
                </button>

                <button
                  onClick={() => {
                    console.log('🟢 تم النقر على الزر الأخضر (المغرفة)');
                    setSelectedTool('scoop');
                    setShowFinalImage(false);
                    setShowCleanVideo2(true);
                  }}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer active:scale-95 font-bold text-lg shadow-2xl"
                >
                  🥄 مغرفة
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* زر اللعبة في أعلى الصفحة - يختفي بعد الضغط عليه */}
      {!gameStarted && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <button
            onClick={() => {
              console.log('🎮 تم الضغط على زر ابدأ اللعب - المرحلة الثانية');
              handleBoatRide();
            }}
            className="px-10 py-4 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 hover:from-amber-700 hover:via-yellow-600 hover:to-amber-800 text-white font-black text-xl rounded-xl shadow-2xl hover:scale-110 active:scale-90 transition-all duration-300 border-4 border-yellow-400 animate-pulse"
            style={{
              background: 'linear-gradient(45deg, #d97706, #eab308, #b45309)',
              boxShadow: '0 0 30px rgba(217, 119, 6, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.7)'
            }}
          >
            ابدأ اللعب - المرحلة الثانية
          </button>
        </div>
      )}

      {/* زر العودة */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          onClick={() => {
            playClick();
            onBack();
          }}
          variant="secondary"
          size="sm"
        >
          🔙 العودة للخريطة
        </Button>
      </div>

      {/* طبقة التعتيم */}
      <div className="absolute inset-0 bg-slate-900/20 z-5 pointer-events-none" />

      {/* تأثيرات الماء في الأسفل فقط */}
      <div className="absolute bottom-0 left-0 right-0 h-1/6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-800/70 to-cyan-700/50"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/15 to-transparent animate-[water-wave_6s_ease-in-out_infinite]"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-cyan-400/10 to-transparent animate-[water-wave_8s_ease-in-out_infinite_reverse]"></div>

        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-blue-700/30 to-transparent animate-[slide_4s_linear_infinite]"></div>
        <div className="absolute bottom-4 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-600/25 to-transparent animate-[slide_5s_linear_infinite_reverse]"></div>
        <div className="absolute bottom-8 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-800/20 to-transparent animate-[slide_6s_linear_infinite]"></div>

        <div className="absolute bottom-12 left-16 w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce animation-delay-500"></div>
        <div className="absolute bottom-16 right-20 w-1 h-1 bg-cyan-200/80 rounded-full animate-bounce animation-delay-1200"></div>
        <div className="absolute bottom-8 left-1/3 w-1 h-1 bg-blue-300/90 rounded-full animate-bounce animation-delay-800"></div>
        <div className="absolute bottom-20 right-1/3 w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce animation-delay-2000"></div>
        <div className="absolute bottom-14 left-2/3 w-1 h-1 bg-cyan-400/70 rounded-full animate-bounce animation-delay-1500"></div>

        <div className="absolute bottom-6 left-1/4 w-3 h-3 bg-blue-300/40 rounded-full animate-pulse animation-delay-200"></div>
        <div className="absolute bottom-10 right-1/4 w-2 h-2 bg-cyan-500/50 rounded-full animate-pulse animation-delay-700"></div>
        <div className="absolute bottom-4 left-1/2 w-2.5 h-2.5 bg-blue-600/60 rounded-full animate-pulse animation-delay-1300"></div>

        <div className="absolute bottom-0 left-0 w-full h-3 bg-gradient-to-b from-transparent to-blue-900/40 animate-pulse"></div>

        {/* ملوثات وقمامة في الماء */}
        <div className="absolute bottom-8 left-12 w-4 h-6 bg-blue-300 rounded animate-bounce animation-delay-300 opacity-70">
          <div className="absolute top-1 left-1 right-1 h-1 bg-blue-400 rounded"></div>
        </div>
        <div className="absolute bottom-12 right-16 w-3 h-5 bg-green-400 rounded animate-bounce animation-delay-800 opacity-75">
          <div className="absolute top-0.5 left-0.5 right-0.5 h-0.5 bg-green-500 rounded"></div>
        </div>

        <div className="absolute bottom-6 left-1/3 w-5 h-3 bg-yellow-300 rounded-full animate-pulse animation-delay-1200 opacity-60"></div>
        <div className="absolute bottom-10 right-1/3 w-4 h-2.5 bg-red-300 rounded-full animate-pulse animation-delay-500 opacity-65"></div>

        <div className="absolute bottom-14 left-2/3 w-2.5 h-4 bg-gray-400 rounded animate-bounce animation-delay-1500 opacity-80">
          <div className="absolute top-0.5 left-0.5 right-0.5 h-0.5 bg-gray-300 rounded"></div>
        </div>

        <div className="absolute bottom-4 right-8 w-3 h-2 bg-amber-800 rounded animate-pulse animation-delay-900 opacity-70"></div>
        <div className="absolute bottom-16 left-1/4 w-2 h-3 bg-amber-700 rounded animate-bounce animation-delay-600 opacity-75"></div>

        <div className="absolute bottom-2 left-8 w-1 h-1 bg-green-400/50 rounded-full animate-ping animation-delay-200"></div>
        <div className="absolute bottom-3 right-12 w-0.5 h-0.5 bg-yellow-400/60 rounded-full animate-ping animation-delay-700"></div>
        <div className="absolute bottom-5 left-1/2 w-1.5 h-1.5 bg-gray-400/40 rounded-full animate-ping animation-delay-1100"></div>

        {/* المركب في الشمال - يختفي بعد انتهاء الفيديو */}
        {!videoFinished && (
          <div
            className={`absolute bottom-12 transform -translate-x-1/2 ${
              isRidingBoat ? 'left-1/2 transition-all duration-[11000ms] ease-in-out' : 'left-1/4'
            }`}
          >
            <div className="relative w-48 h-28 overflow-hidden rounded-lg">
              <img
                src="/image/boot.png"
                alt="مركب في النيل"
                className="relative w-full h-full object-cover rounded-lg opacity-80"
                draggable={false}
              />
              <div className="absolute top-1 right-1 w-1 h-1 bg-blue-300/60 rounded-full animate-ping animation-delay-300"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
