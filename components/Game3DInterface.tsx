/**
 * واجهة اللعبة ثلاثية الأبعاد - نظف نيلك
 *
 * يستخدم Three.js و React Three Fiber لعرض النماذج ثلاثية الأبعاد
 */

import React, { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html, useGLTF, Environment, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from './Button';
import { ArrowRight, Heart, Star, Zap, Shield, Sword } from 'lucide-react';
import { useSoundEffect } from '../hooks/useAudio';
import { audioGenerator } from '../utils/audioGenerator';
import { GameStorage } from '../utils/gameStorage';

interface Game3DInterfaceProps {
  onExit: () => void;
}

/**
 * مكون تحميل النموذج ثلاثي الأبعاد
 */
function Model({ url, position, scale = [1, 1, 1], onClick }: {
  url: string;
  position: [number, number, number];
  scale?: [number, number, number];
  onClick?: () => void;
}) {
  const { scene } = useGLTF(url);
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01; // دوران بطيء
    }
  });

  return (
    <group
      ref={meshRef}
      position={position}
      scale={scale}
      onClick={onClick}
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'auto'}
    >
      <primitive object={scene} />
    </group>
  );
}

/**
 * مكون اللاعب ثلاثي الأبعاد
 */
function Player3D({ position, onMove, speedBoost }: {
  position: [number, number, number];
  onMove: (newPosition: [number, number, number]) => void;
  speedBoost?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  // تحريك اللاعب
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const baseSpeed = 0.5;
      const speed = speedBoost ? baseSpeed * 1.5 : baseSpeed; // سرعة مضاعفة مع الطاقة
      let [x, y, z] = position;

      switch (event.key.toLowerCase()) {
        case 'arrowleft':
        case 'a':
          x -= speed;
          break;
        case 'arrowright':
        case 'd':
          x += speed;
          break;
        case 'arrowup':
        case 'w':
          z -= speed;
          break;
        case 'arrowdown':
        case 's':
          z += speed;
          break;
      }

      // حدود الخريطة
      x = Math.max(-10, Math.min(10, x));
      z = Math.max(-10, Math.min(10, z));

      onMove([x, y, z]);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [position, onMove, speedBoost]);

  // تحديث موقع الكاميرا لتتبع اللاعب
  useFrame(() => {
    camera.position.lerp(new THREE.Vector3(position[0], 15, position[2] + 10), 0.05);
    camera.lookAt(position[0], 0, position[2]);
  });

  return (
    <mesh ref={meshRef} position={position}>
      {/* جسم اللاعب - مكعب مؤقت */}
      <boxGeometry args={[1, 2, 1]} />
      <meshStandardMaterial color="#3b82f6" />
      {/* رأس اللاعب */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
    </mesh>
  );
}

/**
 * مكون الكنز ثلاثي الأبعاد
 */
function Treasure3D({ position, collected, onCollect }: {
  position: [number, number, number];
  collected: boolean;
  onCollect: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current && !collected) {
      meshRef.current.rotation.y += 0.02;
      meshRef.current.position.y = position[1] + Math.sin(Date.now() * 0.005) * 0.2;
    }
  });

  if (collected) return null;

  return (
    <mesh
      ref={meshRef}
      position={position}
    >
      <octahedronGeometry args={[0.5]} />
      <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.2} />
    </mesh>
  );
}

/**
 * مكون عناصر الطاقة ثلاثية الأبعاد
 */
function PowerUp3D({ position, collected, type }: {
  position: [number, number, number];
  collected: boolean;
  type: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current && !collected) {
      meshRef.current.rotation.y += 0.04;
      meshRef.current.position.y = position[1] + Math.sin(Date.now() * 0.008) * 0.3;
    }
  });

  if (collected) return null;

  const color = type === 'health' ? '#10b981' : '#8b5cf6'; // أخضر للشفاء، بنفسجي للطاقة

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.6, 0.6, 0.6]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
    </mesh>
  );
}

/**
 * مكون المنصات المتحركة
 */
function MovingPlatform({ startPosition, endPosition, speed = 0.02 }: {
  startPosition: [number, number, number];
  endPosition: [number, number, number];
  speed?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      const time = Date.now() * speed * 0.001;
      const progress = (Math.sin(time) + 1) / 2; // من 0 إلى 1

      const x = startPosition[0] + (endPosition[0] - startPosition[0]) * progress;
      const z = startPosition[2] + (endPosition[2] - startPosition[2]) * progress;

      meshRef.current.position.set(x, startPosition[1], z);
    }
  });

  return (
    <mesh ref={meshRef} position={startPosition}>
      <boxGeometry args={[3, 0.5, 3]} />
      <meshStandardMaterial color="#6b7280" emissive="#6b7280" emissiveIntensity={0.1} />
    </mesh>
  );
}

/**
 * مكون الصور ثلاثية الأبعاد
 */
function ImagePlane({ imageUrl, position, scale = [4, 4, 1], rotation = [0, 0, 0] }: {
  imageUrl: string;
  position: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
}) {
  const texture = useTexture(imageUrl);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005; // دوران بطيء
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale} rotation={rotation}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}

/**
 * مكون الأرضية ثلاثية الأبعاد
 */
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial color="#4a5568" />
    </mesh>
  );
}

/**
 * مكون العدو ثلاثي الأبعاد
 */
function Enemy3D({ position, active }: { position: [number, number, number]; active: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current && active) {
      meshRef.current.rotation.y += 0.03;
      meshRef.current.position.y = position[1] + Math.sin(Date.now() * 0.01) * 0.3;
    }
  });

  if (!active) return null;

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.4]} />
      <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.3} />
    </mesh>
  );
}

/**
 * المكون الرئيسي لواجهة اللعبة ثلاثية الأبعاد
 */
export const Game3DInterface: React.FC<Game3DInterfaceProps> = ({ onExit }) => {
  const { playClick, playVictory } = useSoundEffect();

  const backgroundMusicIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [level, setLevel] = useState(1);
  const [gameTime, setGameTime] = useState(0);
  const [speedBoost, setSpeedBoost] = useState(false);
  const [shield, setShield] = useState(false);
  const [speedBoostTime, setSpeedBoostTime] = useState(0);
  const [shieldTime, setShieldTime] = useState(0);

  const [treasures, setTreasures] = useState([
    { id: 1, position: [5, 0, 5] as [number, number, number], collected: false, type: 'coin' },
    { id: 2, position: [-3, 0, -4] as [number, number, number], collected: false, type: 'gem' },
    { id: 3, position: [7, 0, -2] as [number, number, number], collected: false, type: 'key' },
    { id: 4, position: [-6, 0, 3] as [number, number, number], collected: false, type: 'coin' },
    { id: 5, position: [2, 0, -7] as [number, number, number], collected: false, type: 'gem' },
    { id: 6, position: [0, 2, 0] as [number, number, number], collected: false, type: 'speed_boost' },
    { id: 7, position: [-8, 1, -8] as [number, number, number], collected: false, type: 'shield' },
  ]);

  const [enemies, setEnemies] = useState([
    { id: 1, position: [4, 0, 2] as [number, number, number], active: true, speed: 0.02 },
    { id: 2, position: [-2, 0, -3] as [number, number, number], active: true, speed: 0.025 },
    { id: 3, position: [6, 0, -5] as [number, number, number], active: true, speed: 0.018 },
  ]);

  // عناصر الطاقة (مراهم الشفاء)
  const [powerUps, setPowerUps] = useState([
    { id: 1, position: [3, 0, -1] as [number, number, number], collected: false, type: 'health', value: 25 },
    { id: 2, position: [-4, 0, 6] as [number, number, number], collected: false, type: 'health', value: 25 },
  ]);

  // بدء اللعبة
  useEffect(() => {
    if (gameStarted) {
      gameLoopRef.current = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameStarted]);

  // اكتشاف التصادم مع الكنز
  useEffect(() => {
    if (!gameStarted) return;

    const checkCollisions = () => {
      setTreasures(prevTreasures =>
        prevTreasures.map(treasure => {
          if (treasure.collected) return treasure;

          // حساب المسافة بين اللاعب والكنز
          const distance = Math.sqrt(
            Math.pow(playerPosition[0] - treasure.position[0], 2) +
            Math.pow(playerPosition[2] - treasure.position[2], 2)
          );

          // إذا كانت المسافة أقل من 1.5، اجمع الكنز
        if (distance < 1.5) {
          playClick();
          let points = 100;

          if (treasure.type === 'speed_boost') {
            setSpeedBoost(true);
            setSpeedBoostTime(10); // 10 ثوانٍ
            points = 200;
          } else if (treasure.type === 'shield') {
            setShield(true);
            setShieldTime(15); // 15 ثانية
            points = 300;
          }

          setScore(prev => prev + points);
          return { ...treasure, collected: true };
        }

          return treasure;
        })
      );
    };

    checkCollisions();

    // فحص التصادم مع عناصر الطاقة
    setPowerUps(prevPowerUps =>
      prevPowerUps.map(powerUp => {
        if (powerUp.collected) return powerUp;

        const distance = Math.sqrt(
          Math.pow(playerPosition[0] - powerUp.position[0], 2) +
          Math.pow(playerPosition[2] - powerUp.position[2], 2)
        );

        if (distance < 1.5) {
          playClick();
          if (powerUp.type === 'health') {
            setHealth(prev => Math.min(100, prev + powerUp.value));
            setScore(prev => prev + 50); // نقاط إضافية لجمع عنصر الطاقة
          }
          return { ...powerUp, collected: true };
        }

        return powerUp;
      })
    );
  }, [playerPosition, gameStarted, playClick]);

  // حركة الأعداء وهجومهم
  useEffect(() => {
    if (!gameStarted) return;

    const moveEnemies = () => {
      setEnemies(prevEnemies =>
        prevEnemies.map(enemy => {
          if (!enemy.active) return enemy;

          const dx = playerPosition[0] - enemy.position[0];
          const dz = playerPosition[2] - enemy.position[2];
          const distance = Math.sqrt(dx * dx + dz * dz);

          // إذا كان العدو قريباً جداً، يهاجم
          if (distance < 1.2) {
            // تقليل الصحة فقط إذا لم يكن هناك درع
            if (!shield) {
              setHealth(prev => Math.max(0, prev - 5));
            }
            return enemy; // لا يتحرك أثناء الهجوم
          }

          // تحريك العدو نحو اللاعب
          const normalizedDx = dx / distance;
          const normalizedDz = dz / distance;

          const newX = enemy.position[0] + normalizedDx * enemy.speed;
          const newZ = enemy.position[2] + normalizedDz * enemy.speed;

          // الاحتفاظ بالحدود
          const clampedX = Math.max(-10, Math.min(10, newX));
          const clampedZ = Math.max(-10, Math.min(10, newZ));

          return {
            ...enemy,
            position: [clampedX, enemy.position[1], clampedZ] as [number, number, number]
          };
        })
      );
    };

    const enemyInterval = setInterval(moveEnemies, 100);
    return () => clearInterval(enemyInterval);
  }, [playerPosition, gameStarted]);

  // تنظيف التايمرات
  useEffect(() => {
    return () => {
      audioGenerator.stopAudioFile();
      if (backgroundMusicIntervalRef.current) {
        clearInterval(backgroundMusicIntervalRef.current);
      }
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, []);

  const startGame = () => {
    setGameStarted(true);
    setGameWon(false);
    playClick();
  };

  const handleTreasureCollect = (treasureId: number) => {
    // هذه الدالة لم تعد مطلوبة لأن الجمع يتم تلقائياً عبر اكتشاف التصادم
  };

  const restartGame = () => {
    setPlayerPosition([0, 0, 0]);
    setScore(0);
    setHealth(100);
    setGameTime(0);
    setGameWon(false);
    setGameLost(false);
    setGameStarted(true);

    // إعادة تعيين الكنز
    setTreasures(prev => prev.map(t => ({ ...t, collected: false })));
    // إعادة تعيين عناصر الطاقة
    setPowerUps(prev => prev.map(p => ({ ...p, collected: false })));
    // إعادة تنشيط الأعداء
    setEnemies(prev => prev.map(e => ({ ...e, active: true })));
    // إعادة تعيين الطاقات
    setSpeedBoost(false);
    setShield(false);
    setSpeedBoostTime(0);
    setShieldTime(0);

    playClick();
    audioGenerator.stopAudioFile();
    audioGenerator.playAudioFile('/audio/sound1.wav');
  };

  const handleExit = () => {
    playClick();
    audioGenerator.stopAudioFile();
    if (backgroundMusicIntervalRef.current) {
      clearInterval(backgroundMusicIntervalRef.current);
    }
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    onExit();
  };

  // التحقق من الفوز والخسارة
  useEffect(() => {
    const allCollected = treasures.every(t => t.collected);
    if (allCollected && gameStarted && !gameWon) {
      setGameWon(true);
      playVictory();
      GameStorage.saveBestScore(score);
      GameStorage.saveGameStats(score, gameTime);
    }
  }, [treasures, gameStarted, gameWon, score, gameTime]);

  // التحقق من الخسارة
  useEffect(() => {
    if (health <= 0 && gameStarted && !gameWon) {
      setGameLost(true);
      setGameStarted(false);
      playClick();
    }
  }, [health, gameStarted, gameWon, playClick]);

  // مؤقتات الطاقة
  useEffect(() => {
    if (!gameStarted) return;

    const effectInterval = setInterval(() => {
      if (speedBoostTime > 0) {
        setSpeedBoostTime(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setSpeedBoost(false);
          }
          return newTime;
        });
      }

      if (shieldTime > 0) {
        setShieldTime(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setShield(false);
          }
          return newTime;
        });
      }
    }, 1000);

    return () => clearInterval(effectInterval);
  }, [gameStarted, speedBoostTime, shieldTime]);

  if (!gameStarted) {
    // شاشة البداية
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950"></div>

        <div className="relative z-10 text-center space-y-8 p-8 max-w-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md rounded-2xl shadow-2xl">
          <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto text-purple-400 animate-bounce">
            <Sword size={40} />
          </div>

          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            نظف نيلك ثلاثية الأبعاد
          </h2>
          <p className="text-slate-300 text-lg">
            مرحباً بك في النسخة ثلاثية الأبعاد! اكتشف عالماً جديداً من النماذج ثلاثية الأبعاد.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-sm">نماذج ثلاثية الأبعاد</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-sm">عالم تفاعلي</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <Zap className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-sm">رسومات متقدمة</p>
            </div>
          </div>

          <div className="space-y-4">
            <Button onClick={startGame} className="text-xl px-8 py-3">
              ابدأ نظف نيلك ثلاثية الأبعاد
              <Sword className="ml-2 w-5 h-5" />
            </Button>

            <Button variant="outline" onClick={handleExit}>
              العودة للقائمة الرئيسية
              <ArrowRight className="mr-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // اللعبة ثلاثية الأبعاد
  return (
    <div className="min-h-screen text-white relative overflow-hidden bg-slate-900">
      {/* شريط المعلومات العلوي */}
      <div className="relative z-10 p-4 flex justify-between items-center border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 animate-pulse">
              <Sword size={24} />
            </div>
            <div className="text-sm text-purple-400 font-bold animate-pulse">منظف النيل ثلاثي الأبعاد</div>
          </div>

          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="font-bold">{score}</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" />
            <span>{health}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <span>المستوى {level}</span>
          </div>

          {/* مؤشرات الطاقة */}
          {speedBoost && (
            <div className="flex items-center gap-2 text-yellow-400 animate-pulse">
              <Zap className="w-5 h-5" />
              <span className="text-sm">سرعة ({speedBoostTime}s)</span>
            </div>
          )}
          {shield && (
            <div className="flex items-center gap-2 text-green-400 animate-pulse">
              <Shield className="w-5 h-5" />
              <span className="text-sm">درع ({shieldTime}s)</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">الوقت: {Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}</span>
          <Button variant="outline" size="sm" onClick={handleExit}>
            خروج
          </Button>
        </div>
      </div>

      {/* منطقة اللعب ثلاثية الأبعاد */}
      <div className="relative flex-1">
        <Canvas
          camera={{ position: [0, 15, 10], fov: 60 }}
          style={{ height: 'calc(100vh - 80px)' }}
        >
          <Suspense fallback={
            <Html center>
              <div className="text-white text-xl">جاري تحميل النموذج ثلاثي الأبعاد...</div>
            </Html>
          }>
            {/* الإضاءة */}
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <pointLight position={[0, 10, 0]} intensity={0.5} />

            {/* البيئة */}
            <Environment preset="sunset" />

            {/* الأرضية */}
            <Ground />

            {/* اللاعب */}
            <Player3D
              position={playerPosition}
              onMove={setPlayerPosition}
              speedBoost={speedBoost}
            />

            {/* الكنز */}
            {treasures.map((treasure) => (
              <Treasure3D
                key={treasure.id}
                position={treasure.position}
                collected={treasure.collected}
                onCollect={() => {}} // لم يعد مطلوباً
              />
            ))}

            {/* الأعداء */}
            {enemies.map((enemy) => (
              <Enemy3D
                key={enemy.id}
                position={enemy.position}
                active={enemy.active}
              />
            ))}

            {/* عناصر الطاقة */}
            {powerUps.map((powerUp) => (
              <PowerUp3D
                key={powerUp.id}
                position={powerUp.position}
                collected={powerUp.collected}
                type={powerUp.type}
              />
            ))}

            {/* المنصات المتحركة */}
            <MovingPlatform
              startPosition={[-8, 0.5, 0]}
              endPosition={[8, 0.5, 0]}
              speed={0.015}
            />
            <MovingPlatform
              startPosition={[0, 0.5, -8]}
              endPosition={[0, 0.5, 8]}
              speed={0.02}
            />
            <MovingPlatform
              startPosition={[-5, 1, -5]}
              endPosition={[5, 1, 5]}
              speed={0.01}
            />

            {/* الصور الديكورية */}
            <ImagePlane
              imageUrl="/image/templ1.png"
              position={[0, 3, -8]}
              scale={[6, 6, 1]}
              rotation={[0, 0, 0]}
            />

            {/* عناصر تفاعلية */}
            <Text
              position={[0, 5, 0]}
              fontSize={1}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
نظف نيلك ثلاثية الأبعاد
            </Text>

            {/* التحكم في الكاميرا (اختياري) */}
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              maxPolarAngle={Math.PI / 2}
            />
          </Suspense>
        </Canvas>

        {/* تعليمات التحكم */}
        <div className="absolute bottom-4 left-4 text-white bg-black/50 p-4 rounded-lg">
          <h3 className="font-bold mb-2">التحكم:</h3>
          <p className="text-sm">• استخدم الأسهم أو WASD للحركة</p>
          <p className="text-sm">• انقر على الكنز لجمعه</p>
          <p className="text-sm">• استخدم الفأرة للنظر حولك</p>
        </div>

        {/* عداد الكنز وعناصر الطاقة */}
        <div className="absolute bottom-4 right-4 text-white bg-black/50 p-4 rounded-lg space-y-2">
          <p className="text-sm">
            الكنز: {treasures.filter(t => t.collected).length}/{treasures.length}
          </p>
          <p className="text-sm">
            عناصر الطاقة: {powerUps.filter(p => p.collected).length}/{powerUps.length}
          </p>
        </div>

        {/* أهداف المستوى */}
        <div className="absolute top-20 right-4 text-white bg-black/50 p-4 rounded-lg max-w-xs">
          <h3 className="font-bold mb-2 text-yellow-400">أهداف المستوى الأول:</h3>
          <ul className="text-sm space-y-1">
            <li>• اجمع جميع الكنز الذهبي</li>
            <li>• احصل على عناصر الطاقة الخضراء</li>
            <li>• تجنب الأعداء الحمر</li>
            <li>• احتفظ بصحتك!</li>
          </ul>
        </div>
      </div>

      {/* شاشة الفوز */}
      {gameWon && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-purple-400 to-blue-500 text-white p-8 rounded-2xl text-center shadow-2xl max-w-md">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-white animate-bounce" />
            </div>
            <h2 className="text-3xl font-bold mb-2">تهانينا! 🎉</h2>
            <p className="text-lg mb-4">لقد جمعت جميع الكنز في العالم ثلاثي الأبعاد!</p>
            <div className="bg-white/10 rounded-lg p-4 mb-6">
              <p className="text-sm opacity-90 mb-2">النتيجة النهائية:</p>
              <p className="text-2xl font-bold">{score} نقطة</p>
              <p className="text-xs opacity-75 mt-1">
                الوقت: {Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}
              </p>
            </div>
            <div className="space-y-3">
              <Button onClick={restartGame} className="w-full">
                العب مرة أخرى
                <Sword className="ml-2 w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={handleExit} className="w-full">
                العودة للقائمة الرئيسية
                <ArrowRight className="mr-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* شاشة الخسارة */}
      {gameLost && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-red-600 to-red-800 text-white p-8 rounded-2xl text-center shadow-2xl max-w-md">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold mb-2">انتهت اللعبة 😔</h2>
            <p className="text-lg mb-4">لقد خسرت كل صحتك في المعركة!</p>
            <div className="bg-white/10 rounded-lg p-4 mb-6">
              <p className="text-sm opacity-90 mb-2">النتيجة النهائية:</p>
              <p className="text-2xl font-bold">{score} نقطة</p>
              <p className="text-xs opacity-75 mt-1">
                الوقت: {Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}
              </p>
            </div>
            <div className="space-y-3">
              <Button onClick={restartGame} className="w-full">
                حاول مرة أخرى
                <Sword className="ml-2 w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={handleExit} className="w-full">
                العودة للقائمة الرئيسية
                <ArrowRight className="mr-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};