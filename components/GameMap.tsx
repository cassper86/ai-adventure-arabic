import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { Lock, Trophy, ZoomIn, ZoomOut, MapPin, RefreshCw, RotateCcw } from 'lucide-react';
import { useSoundEffect } from '../hooks/useAudio';
import { AudioControls } from './AudioControls';
import { audioGenerator } from '../utils/audioGenerator';

interface GameMapProps {
  onSelectLevel: (level: number) => void;
  onBack: () => void;
  playerName: string;
}

export const GameMap: React.FC<GameMapProps> = ({ onSelectLevel, onBack, playerName }) => {
  const { playClick } = useSoundEffect();
  const [zoom, setZoom] = useState(0.85);
  const mapMusicIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // تشغيل الموسيقى الخلفية عند تحميل شاشة الخريطة
  useEffect(() => {
    // إيقاف أي صوت سابق قبل تشغيل الجديد
    audioGenerator.stopAudioFile();
    audioGenerator.playAudioFile('/audio/sound1.wav');

    return () => {
      // إيقاف الموسيقى عند مغادرة الشاشة
      audioGenerator.stopAudioFile();
      if (mapMusicIntervalRef.current) {
        clearInterval(mapMusicIntervalRef.current);
      }
    };
  }, []);
  
  // Camera State
  const [pitch, setPitch] = useState(30); // Vertical angle (Tilt)
  const [bearing, setBearing] = useState(0); // Horizontal angle (Rotation)

  // Pan State
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  // Drag Handling Refs (Using refs for immediate interaction data to avoid closure staleness during drag)
  const interactionMode = useRef<'pan' | 'orbit' | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const startValues = useRef({ panX: 0, panY: 0, pitch: 0, bearing: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Adjusted Level Positions with Landmark Images along the Nile River
  const levels = [
    {
      id: 1,
      x: 52, // النوبة - جنوب النيل
      y: 85,
      label: 'النوبة',
      status: 'active',
      imgUrl: '/image/abo_semble.jpg',
      imgTitle: 'معبد أبو سمبل'
    },
    {
      id: 2,
      x: 55, // الأقصر - وسط جنوب النيل
      y: 70,
      label: 'الأقصر',
      status: 'locked',
      imgUrl: '/image/allksor.jpg',
      imgTitle: 'معبد الأقصر'
    },
    {
      id: 3,
      x: 50, // المنيا - وسط النيل
      y: 55,
      label: 'المنيا',
      status: 'locked',
      imgUrl: '/image/menua.jpg',
      imgTitle: 'مقابر بني حسن'
    },
    {
      id: 4,
      x: 48, // القاهرة - شمال النيل
      y: 40,
      label: 'القاهرة',
      status: 'locked',
      imgUrl: '/image/alahram.jpg',
      imgTitle: 'أهرامات الجيزة'
    },
  ];

  const handleWheel = (e: React.WheelEvent) => {
    const scaleAmount = -e.deltaY * 0.001;
    const newZoom = Math.min(Math.max(0.5, zoom + scaleAmount), 2.0);
    setZoom(newZoom);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2.0));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  
  const handleResetCamera = () => {
      setZoom(0.85);
      setPitch(30);
      setBearing(0);
      setPan({ x: 0, y: 0 });
  };

  // Mouse Interaction Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Determine mode based on button: 0 = Left (Pan), 2 = Right (Orbit)
    if (e.button === 2) {
        interactionMode.current = 'orbit';
    } else {
        interactionMode.current = 'pan';
    }
    
    dragStart.current = { x: e.clientX, y: e.clientY };
    startValues.current = { panX: pan.x, panY: pan.y, pitch, bearing };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!interactionMode.current) return;
    e.preventDefault();
    
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;

    if (interactionMode.current === 'pan') {
        setPan({
            x: startValues.current.panX + deltaX,
            y: startValues.current.panY + deltaY
        });
    } else if (interactionMode.current === 'orbit') {
        const ROTATION_SPEED = 0.5;
        const TILT_SPEED = 0.5;

        // X movement rotates (Bearing)
        setBearing(startValues.current.bearing + (deltaX * ROTATION_SPEED));
        
        // Y movement tilts (Pitch) - Clamped between 0 and 75 degrees
        setPitch(Math.min(Math.max(startValues.current.pitch - (deltaY * TILT_SPEED), 0), 75));
    }
  };

  const handleMouseUp = () => {
    interactionMode.current = null;
  };

  // --- REALISTIC NILE PATHS ---
  const nileMainPath = `
    M 160,620 
    C 170,590 180,580 175,550
    S 190,500 210,480
    C 240,460 260,440 250,410 
    S 200,380 190,350
    S 180,300 185,240
  `;
  
  const deltaLeftPath = "M 185,240 C 175,210 160,180 140,140";  
  const deltaRightPath = "M 185,240 C 195,210 210,180 230,140"; 
  const deltaFillPath = "M 185,240 C 195,210 210,180 230,140 Q 185,120 140,140 C 160,180 175,210 185,240 Z";
  
  // Widened Land Path
  const landPath = "M 10,600 L 390,600 L 380,150 L 350,100 L 275,140 L 125,140 L 50,100 L 20,150 Z";
  
  // Widened Mountains
  const easternMountains = "M 295,580 L 320,500 L 285,420 L 330,300 L 310,200";

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()} // Disable context menu for right-click drag
      className={`relative h-screen w-full flex flex-col items-center justify-center overflow-hidden [perspective:3000px] cursor-pointer select-none`}
    >

      {/* Full Screen Background */}
      <div className="absolute inset-0 bg-cover bg-center pointer-events-none"
           style={{
             backgroundImage: "url('/image/main.png')"
           }}>
        <div className="absolute inset-0 bg-black/40 mix-blend-multiply"></div>
         <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-amber-100/10 rounded-full blur-[80px]"></div>
         <div className="absolute w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/clouds.png')] mix-blend-overlay animate-[pulse_20s_infinite]"></div>
      </div>

      {/* Header UI */}
      <div className="absolute top-8 z-50 w-full px-6 flex justify-between items-center max-w-4xl pointer-events-none">
        <div className="pointer-events-auto" onMouseDown={(e) => e.stopPropagation()}>
            <Button variant="stone" size="sm" onClick={() => {
              playClick();
              onBack();
            }}>خروج</Button>
        </div>
        <div className="bg-white/10 px-6 py-2 rounded-full shadow-lg border border-white/20 backdrop-blur-md pointer-events-auto">
          <span className="font-bold text-white text-lg tracking-wider drop-shadow-md">اللاعب: {playerName}</span>
        </div>
      </div>

      {/* Right Side Controls (Zoom & Reset & Settings) */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 pointer-events-auto" onMouseDown={(e) => e.stopPropagation()}>
        <button onClick={handleZoomIn} className="bg-white/20 p-3 rounded-full text-white hover:bg-white/40 transition-colors border border-white/30 shadow-lg backdrop-blur-sm" title="تقريب">
            <ZoomIn size={24} />
        </button>
        <button onClick={handleZoomOut} className="bg-white/20 p-3 rounded-full text-white hover:bg-white/40 transition-colors border border-white/30 shadow-lg backdrop-blur-sm" title="تبعيد">
            <ZoomOut size={24} />
        </button>
        <div className="h-4"></div>
        <button onClick={handleResetCamera} className="bg-amber-500/80 p-3 rounded-full text-white hover:bg-amber-600 transition-colors border border-amber-400 shadow-lg backdrop-blur-sm" title="إعادة ضبط الكاميرا">
            <RefreshCw size={24} />
        </button>
        <div className="h-4"></div>
        <AudioControls />
        <div className="h-4"></div>
        <button
          onClick={() => {
            playClick();
            // إعادة تشغيل اللعبة - العودة للشاشة الرئيسية
            window.location.reload();
          }}
          className="bg-red-500/80 p-3 rounded-full text-white hover:bg-red-600 transition-colors border border-red-400 shadow-lg backdrop-blur-sm"
          title="إعادة تشغيل اللعبة"
        >
          <RotateCcw size={24} />
        </button>
      </div>

      {/* 3D World Container */}
      <div
        className="relative w-full h-screen ease-out origin-center"
        style={{
          transformStyle: 'preserve-3d',
          transition: interactionMode.current ? 'none' : 'transform 0.3s ease-out',
          transform: `translate(${pan.x}px, ${pan.y}px) rotateX(${pitch}deg) rotateZ(${bearing}deg) scale(${zoom}) translateY(30px)`
        }}
      >
        
        {/* === MAP SVG LAYERS === */}

        {/* Shadow */}
        <div className="absolute inset-0 pointer-events-none" style={{ transform: 'translateZ(-10px) translateY(20px)' }}>
             <svg viewBox="0 0 400 600" className="w-full h-full filter blur-xl opacity-60">
               <path d={landPath} fill="#000" />
             </svg>
        </div>

        {/* Thickness */}
         <div className="absolute inset-0 pointer-events-none" style={{ transform: 'translateZ(-5px) translateY(5px)' }}>
             <svg viewBox="0 0 400 600" className="w-full h-full brightness-75">
               <path d={landPath} fill="#855e42" />
             </svg>
        </div>

        {/* Surface */}
        <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
            <svg viewBox="0 0 400 600" className="w-full h-full drop-shadow-2xl">
              <defs>
                 <linearGradient id="earthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fde68a" />
                    <stop offset="50%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#92400e" />
                 </linearGradient>

                 <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#bae6fd" />
                    <stop offset="20%" stopColor="#7dd3fc" />
                    <stop offset="50%" stopColor="#38bdf8" />
                    <stop offset="80%" stopColor="#7dd3fc" />
                    <stop offset="100%" stopColor="#bae6fd" />
                 </linearGradient>

                 <filter id="satelliteNoise">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
                    <feColorMatrix type="saturate" values="0.2" />
                    <feComposite operator="in" in2="SourceGraphic" result="noise"/>
                    <feBlend in="noise" in2="SourceGraphic" mode="multiply" />
                 </filter>

                 <filter id="mountainRelief">
                    <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
                    <feDiffuseLighting in="noise" lightingColor="#fff" surfaceScale="3" result="light">
                        <feDistantLight azimuth="135" elevation="45" />
                    </feDiffuseLighting>
                    <feComposite operator="in" in="light" in2="SourceGraphic" />
                    <feBlend in="SourceGraphic" mode="multiply" />
                 </filter>

                 <filter id="vegetationBlur">
                    <feGaussianBlur stdDeviation="3" />
                 </filter>

                 <filter id="waterRipple">
                    <feTurbulence type="turbulence" baseFrequency="0.01 0.05" numOctaves="2" result="noise" seed="2" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
                 </filter>
              </defs>
              
              <g filter="url(#mountainRelief)">
                  <path d={landPath} fill="url(#earthGradient)" />
                  <path d={landPath} filter="url(#satelliteNoise)" fill="#a67c52" className="mix-blend-overlay opacity-30"/>
                  <path d={easternMountains} stroke="#78350f" strokeWidth="35" fill="none" strokeLinecap="round" className="opacity-60 mix-blend-multiply blur-sm"/>
              </g>

              <g className="mix-blend-multiply opacity-90">
                 <path d={nileMainPath} stroke="#16a34a" strokeWidth="40" fill="none" strokeLinecap="round" filter="url(#vegetationBlur)" />
                 <path d={deltaLeftPath} stroke="#16a34a" strokeWidth="35" fill="none" strokeLinecap="round" filter="url(#vegetationBlur)" />
                 <path d={deltaRightPath} stroke="#16a34a" strokeWidth="35" fill="none" strokeLinecap="round" filter="url(#vegetationBlur)" />
                 <path d={deltaFillPath} fill="#15803d" filter="url(#vegetationBlur)" opacity="0.8" />
              </g>

              <g filter="url(#waterRipple)" className="water-path">
                <path d={nileMainPath} stroke="url(#riverGradient)" strokeWidth="22" fill="none" strokeLinecap="round" />
                <path d={deltaLeftPath} stroke="url(#riverGradient)" strokeWidth="18" fill="none" strokeLinecap="round" />
                <path d={deltaRightPath} stroke="url(#riverGradient)" strokeWidth="18" fill="none" strokeLinecap="round" />
              </g>
              
              <g className="mix-blend-overlay opacity-90">
                 <path d={nileMainPath} stroke="#bae6fd" strokeWidth="4" fill="none" strokeLinecap="round" transform="translate(-1, -1)" />
                 <path d={deltaLeftPath} stroke="#bae6fd" strokeWidth="3" fill="none" strokeLinecap="round" transform="translate(-1, -1)" />
                 <path d={deltaRightPath} stroke="#bae6fd" strokeWidth="3" fill="none" strokeLinecap="round" transform="translate(-1, -1)" />
              </g>

            </svg>

            {/* === LEVELS / MARKERS === */}
            {levels.map((level) => (
                <div 
                key={level.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                style={{ 
                    left: `${level.x}%`, 
                    top: `${level.y}%`, 
                    transformStyle: 'preserve-3d',
                }}
                onClick={(e) => {
                    e.stopPropagation(); // Prevent drag start when clicking a marker
                    if(level.status === 'active') {
                        playClick();
                        onSelectLevel(level.id);
                    }
                }}
                onMouseDown={(e) => e.stopPropagation()} // Stop drag on markers
                >
                    {/* Shadow for Marker */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 blur-md rounded-full transform scale-x-125" 
                         style={{ transform: 'translateZ(0px)' }}></div>

                    {/* Marker (Enlarged and Counter-Rotated to face camera roughly) */}
                    <div className="relative transition-all duration-300 ease-out hover:-translate-y-6 cursor-pointer"
                         style={{ transform: `translateZ(30px) rotateX(${-pitch}deg) rotateZ(${-bearing}deg)` }} 
                    >
                        {level.id === 5 ? (
                           /* SPECIAL PRIZE MARKER FOR LEVEL 5 */
                           <div className="relative group-hover:scale-110 transition-transform animate-bounce" style={{ animationDuration: '3s' }}>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-yellow-400/50 blur-xl rounded-full animate-pulse"></div>
                                <Trophy className="relative z-10 w-20 h-20 text-yellow-500 drop-shadow-[0_10px_15px_rgba(0,0,0,0.4)]" />
                                {level.status === 'locked' && (
                                   <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 rounded-full backdrop-blur-[1px]">
                                       <Lock className="w-8 h-8 text-white/90 drop-shadow-md" />
                                   </div>
                                )}
                           </div>
                        ) : (
                           /* STANDARD MARKER FOR LEVELS 1-4 */
                           level.status === 'active' ? (
                                <div className="relative group-hover:scale-125 transition-all duration-500">
                                   {/* حفرة مائية دائرية */}
                                   <div className="relative w-16 h-16 rounded-full border-3 border-stone-600 bg-gradient-to-br from-stone-600 via-stone-700 to-stone-800 shadow-xl overflow-hidden">
                                       {/* إطار الحفرة */}
                                       <div className="absolute inset-0.5 rounded-full border-2 border-amber-700/60"></div>

                                       {/* الماء داخل الحفرة */}
                                       <div className="absolute inset-2 rounded-full overflow-hidden">
                                           {/* طبقة الماء الأساسية */}
                                           <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-cyan-300 to-blue-500 rounded-full animate-pulse opacity-90"></div>

                                           {/* تأثير الأمواج */}
                                           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full animate-[wave_2s_ease-in-out_infinite]"></div>

                                           {/* انعكاسات ضوئية صغيرة */}
                                           <div className="absolute top-1 left-1 w-1 h-1 bg-white/60 rounded-full animate-ping"></div>
                                           <div className="absolute bottom-1 right-1 w-0.5 h-0.5 bg-cyan-200/70 rounded-full animate-pulse"></div>

                                           {/* فقاعات هوائية */}
                                           <div className="absolute bottom-0.5 left-1 w-0.5 h-0.5 bg-white/70 rounded-full animate-bounce"></div>
                                           <div className="absolute bottom-1 right-1 w-0.5 h-0.5 bg-white/50 rounded-full animate-bounce animation-delay-1000"></div>
                                       </div>
                                   </div>

                                   {/* رقم المرحلة في الأعلى */}
                                   <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-stone-600 to-stone-800 rounded-full flex items-center justify-center text-white font-black text-sm border border-amber-600/80 shadow-md">
                                       {level.id}
                                   </div>
                                </div>
                           ) : (
                               <div className="relative grayscale opacity-80">
                                   <Lock className="w-12 h-12 text-slate-500 drop-shadow-md bg-slate-200/50 rounded-full p-2" />
                               </div>
                           )
                        )}
                        

                        {/* Label Tooltip */}
                        <div className={`
                            absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold shadow-xl 
                            bg-white text-slate-900 border-2 border-amber-500
                            opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 z-50
                        `}>
                            {level.label}
                        </div>
                    </div>
                </div>
            ))}

        </div>
      </div>

      {/* صورة الشخصية على الجانب الأيسر */}
      <div className="absolute left-8 top-2/3 -translate-y-1/2 z-40">
        <div className="relative">
          <img
            src="/image/avtar.png"
            alt="اللاعب"
            className="w-56 h-56 object-contain drop-shadow-2xl"
            draggable={false}
          />
        </div>
      </div>

    </div>
  );
};