import React, { useState, useEffect, useRef } from 'react';
import { LandingPage } from './components/LandingPage';
import { PlayerEntryPage } from './components/PlayerEntryPage';
import { GameMap } from './components/GameMap';
import { Game3DInterface } from './components/Game3DInterface';
import { QRCodePage } from './components/QRCodePage';
import { Level2 } from './components/Level2';
import { GameState, PlayerStats } from './types';

// تجاهل الأخطاء من Chrome Extensions
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('Could not establish connection')) {
      event.preventDefault();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('Could not establish connection')) {
      event.preventDefault();
    }
  });
}

/**
 * التطبيق الرئيسي للعبة نظف نيلك
 * يدير حالة اللعبة وانتقالات الشاشات
 */
const App: React.FC = () => {
  // حالة اللعبة الحالية
  const [gameState, setGameState] = useState<GameState>(GameState.LANDING);

  // بيانات اللاعب
  const [playerName, setPlayerName] = useState<string>('');

  // المستوى الحالي المحدد
  const [currentLevel, setCurrentLevel] = useState<number>(1);

  // حالة animation الركوب
  const [isRidingBoat, setIsRidingBoat] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [selectedTool, setSelectedTool] = useState<string>('');

  // حالة تحميل المستوى
  const [isLoadingLevel, setIsLoadingLevel] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  // حالة تحميل المرحلة الثانية
  const [isLoadingLevel2, setIsLoadingLevel2] = useState<boolean>(false);
  const [loadingProgress2, setLoadingProgress2] = useState<number>(0);

  // حالة صفحة QR code
  const [showQRCode, setShowQRCode] = useState<boolean>(false);

  // حالة الفيديو والصورة النهائية
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [showFinalImage, setShowFinalImage] = useState<boolean>(false);
  const [showCleanVideo1, setShowCleanVideo1] = useState<boolean>(false);
  const [showCleanVideo2, setShowCleanVideo2] = useState<boolean>(false);
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(false);
  const [videoLoadingProgress, setVideoLoadingProgress] = useState<number>(0);
  const [videoFinished, setVideoFinished] = useState<boolean>(false);

  // تحميل مسبق للفيديو
  const [videoPreloaded, setVideoPreloaded] = useState<boolean>(false);

  // refs for cleaning videos to force play when overlays open
  const cleanVideoRef1 = useRef<HTMLVideoElement | null>(null);
  const cleanVideoRef2 = useRef<HTMLVideoElement | null>(null);

  // Debug logging للحالات المهمة
  useEffect(() => {
    console.log('🔄 حالة اللعبة الحالية:', {
      gameState: GameState[gameState],
      playerName,
      currentLevel,
      isRidingBoat,
      gameStarted,
      selectedTool,
      showFinalImage,
      showCleanVideo1,
      showCleanVideo2
    });
  }, [gameState, playerName, currentLevel, isRidingBoat, gameStarted, selectedTool, showFinalImage, showCleanVideo1, showCleanVideo2]);

  // تحميل الفيديو مسبقاً عند بدء التطبيق
  useEffect(() => {
    const preloadVideo = () => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.src = '/image/drive_boot.mp4';
      video.oncanplaythrough = () => {
        console.log('🎬 تم تحميل الفيديو مسبقاً');
        setVideoPreloaded(true);
      };
    };

    // ابدأ التحميل المسبق بعد 2 ثانية من بدء التطبيق
    setTimeout(preloadVideo, 2000);
  }, []);

  // ensure clean1.mp4 starts playing when its overlay opens
  useEffect(() => {
    if (showCleanVideo1) {
      const v = cleanVideoRef1.current;
      if (v) {
        const playPromise = v.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch((err) => {
            console.warn('تعذر التشغيل التلقائي لـ clean1.mp4:', err);
            // لا نفعل أكثر هنا، المستخدم يمكنه الضغط على زر التشغيل داخل عنصر الفيديو
          });
        }
      }
    }
  }, [showCleanVideo1]);

  // ensure drive_boot.mp4 starts playing when its overlay opens
  useEffect(() => {
    if (showVideo) {
      console.log('🎬 بدء تشغيل drive_boot.mp4');
      setTimeout(() => {
        const video = document.querySelector('video[src="/image/drive_boot.mp4"]') as HTMLVideoElement;
        if (video) {
          const playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch((err) => {
              console.warn('تعذر التشغيل التلقائي لـ drive_boot.mp4:', err);
              // محاولة تشغيل الفيديو يدوياً
              video.muted = true;
              video.play().catch(e => console.error('فشل تشغيل drive_boot.mp4:', e));
            });
          }
        }
      }, 100);
    }
  }, [showVideo]);

  // ensure clean2.mp4 starts playing when its overlay opens
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

  /**
   * الانتقال إلى شاشة إدخال اسم اللاعب
   */
  const handleStartClick = () => {
    setGameState(GameState.PLAYER_ENTRY);
  };

  /**
   * حفظ اسم اللاعب والانتقال إلى خريطة المستويات
   */
  const handlePlayerEntry = (name: string) => {
    setPlayerName(name);
    setGameState(GameState.MAP);
  };

  /**
   * تحميل صورة فعلياً مع Promise
   */
  const loadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`فشل في تحميل الصورة: ${src}`));
      img.src = src;
    });
  };

  /**
   * تحميل مع تأخير اصطناعي لإظهار التقدم
   */
  const loadWithDelay = async (src: string, delay: number = 1000): Promise<void> => {
    await loadImage(src);
    // إضافة تأخير اصطناعي لإظهار التقدم بوضوح
    await new Promise(resolve => setTimeout(resolve, delay));
  };

  /**
   * بدء تحميل المستوى مع progress bar حقيقي ومرئي
   */
  const startLevelLoading = async () => {
    setIsLoadingLevel(true);
    setLoadingProgress(0);

    try {
      // قائمة الصور المطلوبة للمستوى الأول مع أوقات تحميل مختلفة
      const imagesToLoad = [
        { src: '/image/templ1.png', delay: 2000, weight: 50 }, // أكبر صورة
        { src: '/image/avtar1.png', delay: 1500, weight: 25 }, // صورة متوسطة
        { src: '/image/boot.png', delay: 1200, weight: 25 }   // صورة أصغر
      ];

      let totalProgress = 0;

      // تحميل كل الصور مع تحديث التقدم التدريجي
      for (const image of imagesToLoad) {
        await loadWithDelay(image.src, image.delay);

        // تحديث التقدم تدريجياً
        totalProgress += image.weight;
        setLoadingProgress(Math.min(totalProgress, 95)); // لا نصل لـ 100% حتى النهاية
      }

      // محاكاة تحضير إضافي
      setTimeout(() => setLoadingProgress(98), 300);
      setTimeout(() => setLoadingProgress(100), 600);

      // انتظار نهائي قبل الانتقال للمستوى
      setTimeout(() => {
        setIsLoadingLevel(false);
        // فتح المستوى - الشخصيات ثابتة في أماكنهم
        setGameState(GameState.GAME_OVER);
      }, 1000);

    } catch (error) {
      console.error('خطأ في تحميل المستوى:', error);
      // في حالة الخطأ، نكمل التقدم
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoadingLevel(false);
        setGameState(GameState.GAME_OVER);
      }, 500);
    }
  };

  /**
   * بدء تحميل المرحلة الثانية مع progress bar (8 ثواني)
   */
  const startLevel2Loading = () => {
    console.log('🚀 بدء تحميل المرحلة الثانية');
    setIsLoadingLevel2(true);
    setLoadingProgress2(0);

    // Progress bar لمدة 8 ثواني
    const progressInterval = setInterval(() => {
      setLoadingProgress2(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          console.log('✅ انتهى تحميل المرحلة الثانية');
          setTimeout(() => {
            setIsLoadingLevel2(false);
            setGameState(GameState.LEVEL_2);
          }, 500);
          return 100;
        }
        // تقدم سلس للمرحلة الثانية - 5% كل 400ms = 8 ثواني كاملة
        return prev + 5;
      });
    }, 400);
  };

  /**
   * تشغيل animation الركوب في المستوى الأول
   */
  const handleBoatRide = () => {
    console.log('🚤 بدء animation الركوب');
    setGameStarted(true);
    setIsRidingBoat(true);
    // بعد 11 ثانية من الركوب، أظهر progress bar للفيديو
    setTimeout(() => {
      console.log('📊 بدء تحميل الفيديو');
      setIsVideoLoading(true);
      setVideoLoadingProgress(0);
      setIsRidingBoat(false);

      // progress bar واضح ومتدرج للفيديو
      const progressInterval = setInterval(() => {
        setVideoLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            // انتظر قليلاً بعد الوصول لـ 100% قبل إخفاء progress bar
            setTimeout(() => {
              setIsVideoLoading(false);
              // بعد إخفاء progress bar، شغل الفيديو
              setTimeout(() => {
                console.log('🎬 تشغيل الفيديو');
                setShowVideo(true);
              }, 300);
            }, 800);
            return 100;
          }
          // تقدم أبطأ وأكثر انتظاماً
          return prev + 8; // تقدم ثابت 8% كل 200ms
        });
      }, 200);
    }, 11000);
  };

  /**
   * معالج انتهاء الفيديو
   */
  const handleVideoEnded = () => {
    console.log('📸 إظهار الصورة النهائية');
    console.log('🎯 سيتم إظهار قائمة الأدوات الآن');
    console.log('🔥 setShowFinalImage(true) جاري...');
    setVideoFinished(true);
    setShowVideo(false);
    setShowFinalImage(true);
    console.log('✅ تم تعيين showFinalImage = true');
    // ابقِ اللعبة في المستوى الأول لإظهار قائمة الأدوات
    // لا تنتقل لـ GAME_OVER حتى يختار اللاعب أداة
  };

  /**
   * تحديد المستوى والبدء في اللعب
   */
  const handleLevelSelect = (level: number) => {
    setCurrentLevel(level);
    if (level === 1) {
      // المستوى الأول - ابدأ تحميل المستوى مع progress bar
      startLevelLoading();
    } else if (level === 2) {
      // المستوى الثاني - ابدأ تحميل المستوى مع progress bar سريع (5 ثواني)
      startLevel2Loading();
    } else {
      // المستويات الأخرى - اللعبة الثلاثية الأبعاد
    setGameState(GameState.PLAYING_3D);
    }
  };

  /**
   * العودة إلى الشاشة الرئيسية وإعادة تعيين البيانات
   */
  const handleBackToLanding = () => {
    setGameState(GameState.LANDING);
    setPlayerName('');
  };

  /**
   * العودة إلى خريطة المستويات
   */
  const handleBackToMap = () => {
    setGameState(GameState.MAP);
  };

  /**
   * الانتقال إلى صفحة QR Code
   */
  const handleShowQRCode = () => {
    setGameState(GameState.QR_CODE);
  };

  /**
   * العودة من صفحة QR code
   */
  const handleBackFromQR = () => {
    setShowQRCode(false);
  };

  return (
    <main className="antialiased text-slate-100 font-sans min-h-screen bg-slate-900 selection:bg-amber-500 selection:text-white">
      {/* الشاشة الرئيسية - الترحيب والقائمة الرئيسية */}
      {gameState === GameState.LANDING && (
        <LandingPage
          onStartGame={handleStartClick}
          onShowQRCode={handleShowQRCode}
        />
      )}

      {/* شاشة إدخال اسم اللاعب */}
      {gameState === GameState.PLAYER_ENTRY && (
        <PlayerEntryPage
          onSubmit={handlePlayerEntry}
          onBack={handleBackToLanding}
        />
      )}

      {/* خريطة المستويات - اختيار المستوى */}
      {gameState === GameState.MAP && (
        <GameMap
          playerName={playerName}
          onSelectLevel={handleLevelSelect}
          onBack={handleBackToLanding}
        />
      )}

      {/* اللعبة ثلاثية الأبعاد - منطقة اللعب */}
      {gameState === GameState.PLAYING_3D && (
        <Game3DInterface onExit={handleBackToMap} />
      )}

      {/* المرحلة الثانية - المصنع */}
      {gameState === GameState.LEVEL_2 && (
        <Level2
          playerName={playerName}
          onComplete={() => setGameState(GameState.LEVEL_COMPLETE)}
          onBack={handleBackToMap}
        />
      )}

      {/* صفحة QR Code - مشاركة اللعبة */}
      {gameState === GameState.QR_CODE && (
        <QRCodePage onBack={handleBackToLanding} />
      )}

      {/* شاشة تحميل المستوى بتصميم فرعوني */}
      {isLoadingLevel && (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden">
          {/* خلفية الصورة كاملة */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('/image/templ1.png')`
            }}
          />
          {/* طبقة تعتيم خفيفة */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-900/70 via-yellow-900/50 to-amber-950/70"></div>

          {/* رموز فرعونية أكبر */}
          <div className="absolute top-16 left-16 text-8xl text-amber-300/30 animate-pulse">𓂀</div>
          <div className="absolute top-24 right-24 text-7xl text-yellow-400/25 animate-pulse animation-delay-1000">𓁛</div>
          <div className="absolute bottom-32 left-24 text-6xl text-amber-400/30 animate-pulse animation-delay-500">𓀠</div>
          <div className="absolute bottom-24 right-32 text-5xl text-yellow-300/35 animate-pulse animation-delay-1500">𓂓</div>
          <div className="absolute top-1/2 left-12 text-4xl text-amber-500/40 animate-pulse animation-delay-2000">𓁿</div>
          <div className="absolute top-1/2 right-12 text-4xl text-amber-500/40 animate-pulse animation-delay-2500">𓁿</div>

          {/* محتوى التحميل */}
          <div className="relative z-10 text-center px-8">
            {/* عنوان فرعوني */}
            <div className="mb-16">
              <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 mb-6 animate-pulse drop-shadow-2xl">
                𓂀 معبد أبو سمبل 𓂀
              </h1>
              <h2 className="text-4xl font-bold text-amber-200 animate-pulse">
                جاري تحميل المستوى...
              </h2>
            </div>

            {/* Progress Bar فرعوني عملاق */}
            <div className="w-[500px] mx-auto mb-12">
              {/* خلفية الشريط */}
              <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-full h-12 overflow-hidden shadow-inner border-6 border-amber-600 relative">
                {/* إطار فرعوني حول الشريط */}
                <div className="absolute -top-3 -left-3 text-3xl text-amber-400 animate-pulse">𓁿</div>
                <div className="absolute -top-3 -right-3 text-3xl text-amber-400 animate-pulse">𓁿</div>
                <div className="absolute -bottom-3 -left-3 text-3xl text-amber-400 animate-pulse">𓁿</div>
                <div className="absolute -bottom-3 -right-3 text-3xl text-amber-400 animate-pulse">𓁿</div>

                {/* الشريط المتحرك */}
                <div
                  className="bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-500 h-full rounded-full transition-all duration-500 ease-out shadow-lg relative overflow-hidden"
                  style={{ width: `${Math.min(loadingProgress, 100)}%` }}
                >
                  {/* تأثير الضوء المتقدم */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
                  {/* رموز متحركة متعددة */}
                  <div className="absolute inset-0 flex items-center justify-center text-2xl text-amber-900 animate-bounce space-x-2">
                    <span>𓂀</span>
                    <span>𓁛</span>
                    <span>𓂀</span>
                  </div>
                  {/* خطوط إضافية */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-300/60 to-transparent animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-300/60 to-transparent animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* النسبة المئوية عملاقة */}
            <div className="text-6xl font-black text-amber-300 mb-8 drop-shadow-2xl animate-pulse">
              {Math.round(Math.min(loadingProgress, 100))}%
            </div>

            {/* رسائل تحميل فعلية مع رموز كبيرة */}
            <div className="text-2xl text-amber-100 animate-pulse bg-black/40 rounded-xl px-8 py-4 border-2 border-amber-500/40 shadow-2xl">
              {loadingProgress < 33 && "𓂀 جاري تحميل معبد أبو سمبل..."}
              {loadingProgress >= 33 && loadingProgress < 66 && "𓁛 جاري تحميل الشخصية..."}
              {loadingProgress >= 66 && loadingProgress < 100 && "𓀠 جاري تحميل المركب..."}
              {loadingProgress >= 100 && "𓂓 اكتمل التحميل! جاري التحضير..."}
            </div>

            {/* رسالة تشجيعية */}
            <div className="mt-8 text-lg text-amber-200 animate-bounce">
              استعد لرحلة في معبد أبو سمبل الأسطوري! 🏛️
            </div>
          </div>

          {/* تأثيرات إضافية */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center">
            <div className="text-2xl text-amber-400/60 animate-pulse">
              𓁿 𓂀 𓁛 𓀠 𓂓 𓁿
            </div>
          </div>
        </div>
      )}

      {/* شاشة تحميل المرحلة الثانية بتصميم صناعي */}
      {isLoadingLevel2 && (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden">
          {/* خلفية الصورة كاملة */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('/image/factory.png')`
            }}
          />
          {/* طبقة تعتيم صناعية */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-blue-900/60 to-gray-950/80"></div>

          {/* رموز صناعية */}
          <div className="absolute top-16 left-16 text-8xl text-blue-300/30 animate-pulse">⚙️</div>
          <div className="absolute top-24 right-24 text-7xl text-gray-400/25 animate-pulse animation-delay-1000">🔧</div>
          <div className="absolute bottom-32 left-24 text-6xl text-blue-400/30 animate-pulse animation-delay-500">🏭</div>
          <div className="absolute bottom-24 right-32 text-5xl text-gray-300/35 animate-pulse animation-delay-1500">⚡</div>
          <div className="absolute top-1/2 left-12 text-4xl text-blue-500/40 animate-pulse animation-delay-2000">🔩</div>
          <div className="absolute top-1/2 right-12 text-4xl text-blue-500/40 animate-pulse animation-delay-2500">⚒️</div>

          {/* محتوى التحميل */}
          <div className="relative z-10 text-center px-8">
            {/* عنوان صناعي */}
            <div className="mb-16">
              <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 mb-6 animate-pulse drop-shadow-2xl">
                🏭 المصنع الصناعي 🏭
              </h1>
              <h2 className="text-4xl font-bold text-blue-200 animate-pulse">
                جاري تحميل المرحلة...
              </h2>
            </div>

            {/* Progress Bar صناعي عملاق */}
            <div className="w-[500px] mx-auto mb-12">
              {/* خلفية الشريط */}
              <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-full h-12 overflow-hidden shadow-inner border-6 border-blue-600 relative">
                {/* إطار صناعي حول الشريط */}
                <div className="absolute -top-3 -left-3 text-3xl text-blue-400 animate-pulse">⚙️</div>
                <div className="absolute -top-3 -right-3 text-3xl text-blue-400 animate-pulse">⚙️</div>
                <div className="absolute -bottom-3 -left-3 text-3xl text-blue-400 animate-pulse">⚙️</div>
                <div className="absolute -bottom-3 -right-3 text-3xl text-blue-400 animate-pulse">⚙️</div>

                {/* الشريط المتحرك */}
                <div
                  className="bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500 ease-out shadow-lg relative overflow-hidden"
                  style={{ width: `${Math.min(loadingProgress2, 100)}%` }}
                >
                  {/* تأثير الضوء المتقدم */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
                  {/* رموز متحركة متعددة */}
                  <div className="absolute inset-0 flex items-center justify-center text-2xl text-blue-900 animate-bounce space-x-2">
                    <span>⚙️</span>
                    <span>🔧</span>
                    <span>⚙️</span>
                  </div>
                  {/* خطوط إضافية */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-300/60 to-transparent animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-300/60 to-transparent animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* النسبة المئوية عملاقة */}
            <div className="text-6xl font-black text-blue-300 mb-8 drop-shadow-2xl animate-pulse">
              {Math.round(Math.min(loadingProgress2, 100))}%
            </div>

            {/* رسائل تحميل صناعية */}
            <div className="text-2xl text-blue-100 animate-pulse bg-black/40 rounded-xl px-8 py-4 border-2 border-blue-500/40 shadow-2xl">
              {loadingProgress2 < 33 && "🏭 جاري تحضير المصنع..."}
              {loadingProgress2 >= 33 && loadingProgress2 < 66 && "⚙️ جاري تحميل الآلات..."}
              {loadingProgress2 >= 66 && loadingProgress2 < 100 && "🔧 جاري تهيئة البيئة الصناعية..."}
              {loadingProgress2 >= 100 && "⚡ اكتمل التحضير! جاري البدء..."}
            </div>

            {/* رسالة تشجيعية صناعية */}
            <div className="mt-8 text-lg text-blue-200 animate-bounce">
              استعد لمغامرة في عالم المصانع الحديثة! 🏭⚡
            </div>
          </div>

          {/* تأثيرات صناعية إضافية */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center">
            <div className="text-2xl text-blue-400/60 animate-pulse">
              ⚙️ 🔧 🏭 ⚡ ⚒️ ⚙️
            </div>
          </div>
        </div>
      )}

      {/* شاشة إكمال المستوى */}
      {gameState === GameState.LEVEL_COMPLETE && (
        <div className="flex flex-col items-center justify-center h-screen text-white relative">
          {/* خلفية الصورة */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('/image/templ1.png')`
            }}
          />
          {/* طبقة تعتيم */}
          <div className="absolute inset-0 bg-gradient-to-b from-green-900/80 via-emerald-900/70 to-green-950/80"></div>

          {/* رموز فرعونية للاحتفال */}
          <div className="absolute top-16 left-16 text-8xl text-green-300/30 animate-pulse">𓂀</div>
          <div className="absolute top-24 right-24 text-7xl text-emerald-400/25 animate-pulse animation-delay-1000">𓁛</div>
          <div className="absolute bottom-32 left-24 text-6xl text-green-400/30 animate-pulse animation-delay-500">𓀠</div>
          <div className="absolute bottom-24 right-32 text-5xl text-emerald-300/35 animate-pulse animation-delay-1500">𓂓</div>

          <div className="relative z-10 text-center px-8">
            {/* عنوان الاحتفال */}
            <div className="mb-16">
              <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 mb-6 animate-pulse drop-shadow-2xl">
                🎉 مبروك! 🎉
              </h1>
              <h2 className="text-4xl font-bold text-green-200 animate-pulse">
                أكملت تنظيف النيل بنجاح!
              </h2>
            </div>

            {/* معلومات المستوى */}
            <div className="bg-black/40 rounded-xl px-8 py-6 border-2 border-green-500/40 shadow-2xl mb-8">
              <div className="text-2xl text-green-100 mb-4">
                🏆 المستوى: {currentLevel}
              </div>
              <div className="text-xl text-emerald-200 mb-4">
                🛠️ الأداة المستخدمة: {selectedTool === 'net' ? 'الشبكة' : 'المغرفة'}
              </div>
              <div className="text-lg text-green-300">
                💚 النيل أصبح نظيفاً الآن! شكراً لمساهمتك في حماية البيئة.
              </div>
            </div>

            {/* أزرار الخيارات */}
            <div className="flex gap-6">
              <button
                onClick={() => {
                  // إعادة تشغيل المستوى
                  setGameState(GameState.GAME_OVER);
                  setGameStarted(false);
                  setIsRidingBoat(false);
                  setShowVideo(false);
                  setShowFinalImage(false);
                  setShowCleanVideo1(false);
                  setShowCleanVideo2(false);
                  setVideoFinished(false);
                  setSelectedTool('');
                }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 hover:from-blue-700 hover:via-cyan-600 hover:to-blue-800 text-white font-black text-xl rounded-xl shadow-2xl hover:scale-110 active:scale-90 transition-all duration-300 border-4 border-cyan-400 animate-pulse"
              >
                🔄 إعادة اللعب
              </button>

              <button
                onClick={handleBackToMap}
                className="px-8 py-4 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 hover:from-amber-700 hover:via-yellow-600 hover:to-amber-800 text-white font-black text-xl rounded-xl shadow-2xl hover:scale-110 active:scale-90 transition-all duration-300 border-4 border-yellow-400 animate-pulse"
              >
                🗺️ اختر مستوى آخر
              </button>
            </div>

            {/* رسالة تشجيعية */}
            <div className="mt-8 text-lg text-green-200 animate-bounce">
              🌍 كل خطوة تخطوها تحمي كوكبنا الأزرق!
            </div>
          </div>
        </div>
      )}

      {/* شاشة نهاية اللعبة أو المستوى الأول */}
      {gameState === GameState.GAME_OVER && (
        <div className="flex flex-col items-center justify-center h-screen text-white relative">
          {/* خلفية الصورة للمستوى الأول */}
          {currentLevel === 1 && (
            <div className="relative w-full h-full">
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
                style={{
                  backgroundImage: `url('/image/templ1.png')`
                }}
              />
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
              {/* الفيديو - يأخذ الشاشة كاملة */}
              {showVideo && (
                <div className="absolute inset-0 z-40 bg-black">
                  <video
                    src="/image/drive_boot.mp4"
                    autoPlay
                    muted
                    playsInline
                    onEnded={handleVideoEnded}
                    onError={(e) => {
                      console.error('خطأ في drive_boot.mp4:', e);
                      alert('خطأ في تحميل فيديو الركوب');
                      setShowVideo(false);
                      setShowFinalImage(true);
                    }}
                    onLoadedData={() => console.log('drive_boot.mp4 جاهز')}
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                </div>
              )}

              {/* فيديو التنظيف 1 - يأخذ الشاشة كاملة */}
              {showCleanVideo1 && (
                <div className="absolute inset-0 z-50 bg-black">
                  <video
                    src="/image/clean1.mp4"
                    ref={cleanVideoRef1}
                    autoPlay
                    muted
                    playsInline
                    onEnded={() => {
                      setShowCleanVideo1(false);
                      setShowFinalImage(true);
                      setGameState(GameState.LEVEL_COMPLETE);
                    }}
                    onError={(e) => {
                      console.error('خطأ في clean1.mp4:', e);
                      alert('خطأ في تحميل الفيديو. تأكد من وجود clean1.mp4 في public/image');
                      setShowCleanVideo1(false);
                    }}
                    onLoadedData={() => console.log('clean1.mp4 جاهز')}
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                </div>
              )}

              {/* فيديو التنظيف 2 - يأخذ الشاشة كاملة */}
              {showCleanVideo2 && (
                <div className="absolute inset-0 z-50 bg-black">
                  <video
                    src="/image/clean2.mp4"
                    ref={cleanVideoRef2}
                    autoPlay
                    muted
                    playsInline
                    onEnded={() => {
                      setShowCleanVideo2(false);
                      setShowFinalImage(true);
                      setGameState(GameState.LEVEL_COMPLETE);
                    }}
                    onError={(e) => {
                      console.error('خطأ في clean2.mp4:', e);
                      alert('خطأ في تحميل الفيديو. تأكد من وجود clean2.mp4 في public/image');
                      setShowCleanVideo2(false);
                    }}
                    onLoadedData={() => console.log('clean2.mp4 جاهز')}
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                </div>
              )}

              {/* Progress Bar للفيديو - يظهر في وسط الصفحة */}
              {isVideoLoading && !showVideo && (
                <div className="absolute inset-0 z-40 bg-black/60 flex items-center justify-center">
                  <div className="text-center">
                    {/* عنوان - تم إزالته حسب الطلب */}

                    {/* Progress Bar كبير جداً */}
                    <div className="w-[600px] mx-auto mb-8">
                      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-full h-8 overflow-hidden shadow-inner border-6 border-amber-600 relative">
                        {/* إطار فرعوني */}
                        <div className="absolute -top-4 -left-4 text-4xl text-amber-400 animate-pulse">𓁿</div>
                        <div className="absolute -top-4 -right-4 text-4xl text-amber-400 animate-pulse">𓁿</div>
                        <div className="absolute -bottom-4 -left-4 text-4xl text-amber-400 animate-pulse">𓁿</div>
                        <div className="absolute -bottom-4 -right-4 text-4xl text-amber-400 animate-pulse">𓁿</div>

                        {/* الشريط المتحرك */}
                        <div
                          className="bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-500 h-full rounded-full transition-all duration-300 ease-out shadow-lg relative overflow-hidden"
                          style={{ width: `${Math.min(videoLoadingProgress, 100)}%` }}
                        >
                          {/* تأثير الضوء */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse"></div>
                          {/* رموز متحركة */}
                          <div className="absolute inset-0 flex items-center justify-center text-2xl text-amber-900 animate-bounce">
                            𓂀
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* النسبة المئوية عملاقة */}
                    <div className="text-7xl font-black text-amber-300 mb-6 drop-shadow-2xl animate-pulse">
                      {Math.round(Math.min(videoLoadingProgress, 100))}%
                    </div>

                    {/* رسائل متحركة */}
                    <div className="text-3xl text-amber-100 animate-pulse bg-black/50 rounded-xl px-8 py-4 border-2 border-amber-500/50 shadow-2xl">
                      {videoLoadingProgress < 30 && "🌟 تحضير المشاهد الساحرة..."}
                      {videoLoadingProgress >= 30 && videoLoadingProgress < 70 && "🎬 تحميل المغامرة البحرية..."}
                      {videoLoadingProgress >= 70 && videoLoadingProgress < 100 && "🏛️ إعداد عالم أبو الهول..."}
                      {videoLoadingProgress >= 100 && "✨ كل شيء جاهز! ابدأ المشاهدة..."}
                    </div>

                    {/* تأثيرات إضافية */}
                    <div className="mt-8 text-4xl text-amber-400/60 animate-pulse">
                      𓁿 𓂀 𓁛 𓀠 𓂓 𓁿
                    </div>
                  </div>
                </div>
              )}

              {/* الصورة النهائية - تظهر بعد الفيديو */}
              {showFinalImage && (
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-25 flex flex-col-reverse items-center">
                  {(() => {
                    console.log('🎯 قائمة الأدوات مرئية الآن');
                    console.log('🔧 showFinalImage:', showFinalImage);
                    console.log('🎬 showCleanVideo1:', showCleanVideo1);
                    console.log('🎬 showCleanVideo2:', showCleanVideo2);
                    return null;
                  })()}
                  
                  {/* الصورة */}
                  <img
                    src="/image/avtar&boot.png"
                    alt="الولد والمركب في الماء"
                    className="w-64 h-48 object-contain relative z-10"
                  />

                  {/* قائمة الأدوات - تظهر فوق الصورة */}
                  {showFinalImage && !showCleanVideo1 && !showCleanVideo2 && (
                    <div className="relative z-50 pt-2" style={{ pointerEvents: 'auto' }}>
                      <div className="flex gap-4">
                        {/* زر الشبكة */}
                        <button
                          onClick={() => {
                            console.log('🔵 تم النقر على الزر الأزرق (الشبكة)');
                            console.log('🎬 سيتم تشغيل clean1.mp4');
                            setSelectedTool('net');
                            setShowFinalImage(false);
                            setShowCleanVideo1(true);
                          }}
                          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer active:scale-95 font-bold text-lg shadow-2xl"
                        >
                          🕸️ شبكة
                        </button>

                        {/* زر المغرفة */}
                        <button
                          onClick={() => {
                            console.log('🟢 تم النقر على الزر الأخضر (المغرفة)');
                            console.log('🎬 سيتم تشغيل clean2.mp4');
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
                      console.log('🎮 تم الضغط على زر ابدأ اللعب');
                      handleBoatRide();
                    }}
                    className="px-10 py-4 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 hover:from-amber-700 hover:via-yellow-600 hover:to-amber-800 text-white font-black text-xl rounded-xl shadow-2xl hover:scale-110 active:scale-90 transition-all duration-300 border-4 border-yellow-400 animate-pulse"
                    style={{
                      background: 'linear-gradient(45deg, #d97706, #eab308, #b45309)',
                      boxShadow: '0 0 30px rgba(217, 119, 6, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.7)'
                    }}
                  >
                    ابدأ اللعب
                  </button>
                </div>
              )}
            </div>
          )}
          {/* طبقة التعتيم */}
          <div className="absolute inset-0 bg-slate-900/20 z-5 pointer-events-none" />

          {/* تأثيرات الماء في الأسفل فقط */}
          <div className="absolute bottom-0 left-0 right-0 h-1/6 overflow-hidden">
            {/* طبقة الماء الأساسية في الأسفل */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-800/70 to-cyan-700/50"></div>

            {/* أمواج متحركة في الأسفل */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/15 to-transparent animate-[water-wave_6s_ease-in-out_infinite]"></div>
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-cyan-400/10 to-transparent animate-[water-wave_8s_ease-in-out_infinite_reverse]"></div>

            {/* خطوط مائية متحركة في الأسفل */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-blue-700/30 to-transparent animate-[slide_4s_linear_infinite]"></div>
            <div className="absolute bottom-4 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-600/25 to-transparent animate-[slide_5s_linear_infinite_reverse]"></div>
            <div className="absolute bottom-8 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-800/20 to-transparent animate-[slide_6s_linear_infinite]"></div>

            {/* فقاعات مائية في الأسفل */}
            <div className="absolute bottom-12 left-16 w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce animation-delay-500"></div>
            <div className="absolute bottom-16 right-20 w-1 h-1 bg-cyan-200/80 rounded-full animate-bounce animation-delay-1200"></div>
            <div className="absolute bottom-8 left-1/3 w-1 h-1 bg-blue-300/90 rounded-full animate-bounce animation-delay-800"></div>
            <div className="absolute bottom-20 right-1/3 w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce animation-delay-2000"></div>
            <div className="absolute bottom-14 left-2/3 w-1 h-1 bg-cyan-400/70 rounded-full animate-bounce animation-delay-1500"></div>

            {/* انعكاسات ضوئية في الماء */}
            <div className="absolute bottom-6 left-1/4 w-3 h-3 bg-blue-300/40 rounded-full animate-pulse animation-delay-200"></div>
            <div className="absolute bottom-10 right-1/4 w-2 h-2 bg-cyan-500/50 rounded-full animate-pulse animation-delay-700"></div>
            <div className="absolute bottom-4 left-1/2 w-2.5 h-2.5 bg-blue-600/60 rounded-full animate-pulse animation-delay-1300"></div>

            {/* تأثير التموج في سطح الماء */}
            <div className="absolute bottom-0 left-0 w-full h-3 bg-gradient-to-b from-transparent to-blue-900/40 animate-pulse"></div>

            {/* ملوثات وقمامة في الماء */}
            {/* زجاجات بلاستيكية */}
            <div className="absolute bottom-8 left-12 w-4 h-6 bg-blue-300 rounded animate-bounce animation-delay-300 opacity-70">
              <div className="absolute top-1 left-1 right-1 h-1 bg-blue-400 rounded"></div>
            </div>
            <div className="absolute bottom-12 right-16 w-3 h-5 bg-green-400 rounded animate-bounce animation-delay-800 opacity-75">
              <div className="absolute top-0.5 left-0.5 right-0.5 h-0.5 bg-green-500 rounded"></div>
            </div>

            {/* أكياس بلاستيكية */}
            <div className="absolute bottom-6 left-1/3 w-5 h-3 bg-yellow-300 rounded-full animate-pulse animation-delay-1200 opacity-60"></div>
            <div className="absolute bottom-10 right-1/3 w-4 h-2.5 bg-red-300 rounded-full animate-pulse animation-delay-500 opacity-65"></div>

            {/* علب معدنية */}
            <div className="absolute bottom-14 left-2/3 w-2.5 h-4 bg-gray-400 rounded animate-bounce animation-delay-1500 opacity-80">
              <div className="absolute top-0.5 left-0.5 right-0.5 h-0.5 bg-gray-300 rounded"></div>
            </div>

            {/* أوراق ونفايات */}
            <div className="absolute bottom-4 right-8 w-3 h-2 bg-amber-800 rounded animate-pulse animation-delay-900 opacity-70"></div>
            <div className="absolute bottom-16 left-1/4 w-2 h-3 bg-amber-700 rounded animate-bounce animation-delay-600 opacity-75"></div>

            {/* فقاعات من التلوث */}
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
                {/* الصورة */}
                <img
                  src="/image/boot.png"
                  alt="مركب في النيل"
                  className="relative w-full h-full object-cover rounded-lg opacity-80"
                  draggable={false}
                />

                {/* انعكاس ضوئي */}
                <div className="absolute top-1 right-1 w-1 h-1 bg-blue-300/60 rounded-full animate-ping animation-delay-300"></div>
              </div>
            </div>
            )}
          </div>

          <div className="relative z-10">
            {currentLevel === 1 ? (
              <div></div>
            ) : (
              <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-amber-500">انتهت اللعبة</h1>
          <button
            onClick={handleBackToLanding}
            className="px-6 py-2 bg-slate-800 border border-slate-600 rounded-lg hover:bg-slate-700 text-white transition-colors"
          >
            العودة للقائمة الرئيسية
          </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* صفحة QR Code */}
      {showQRCode && (
        <QRCodePage onBack={handleBackFromQR} />
      )}
    </main>
  );
};

export default App;