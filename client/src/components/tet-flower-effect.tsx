'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Flower {
  id: number;
  src: string;
  left: number;
  animationDuration: number;
  animationDelay: number;
  size: number;
  rotation: number;
  swayAmount: number;
}

const FLOWER_IMAGES = [
  '/images/flowers/f1.png',
  '/images/flowers/f8.png',
  '/images/flowers/f3.png',
  '/images/flowers/f4.png',
  '/images/flowers/f7.png',
  '/images/flowers/f6.png',
];

const TetFlowerEffect = () => {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Create random flowers
    const generateFlowers = () => {
      const newFlowers: Flower[] = [];
      const flowerCount = 25; // Number of flowers

      for (let i = 0; i < flowerCount; i++) {
        newFlowers.push({
          id: i,
          src: FLOWER_IMAGES[Math.floor(Math.random() * FLOWER_IMAGES.length)],
          left: Math.random() * 100, // Horizontal position (%)
          animationDuration: 8 + Math.random() * 10, // Fall duration (8-18s)
          animationDelay: Math.random() * 10, // Random delay
          size: 40 + Math.random() * 25, // Size (40-65px)
          rotation: Math.random() * 360, // Initial rotation angle
          swayAmount: 30 + Math.random() * 50, // Horizontal sway amount
        });
      }

      setFlowers(newFlowers);
    };

    generateFlowers();
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Toggle effect button */}
      <button
        onClick={() => setIsVisible(false)}
        className="fixed top-20 right-4 z-[60] flex items-center gap-1.5 rounded-full bg-red-500/80 px-3 py-1.5 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:bg-red-600"
        title="Hide flower effect"
      >
        <span>🌸</span>
        <span className="hidden sm:inline">Hide flowers</span>
      </button>

      {/* Flower fall container */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {flowers.map((flower) => (
          <div
            key={flower.id}
            className="animate-flower-fall absolute"
            style={
              {
                left: `${flower.left}%`,
                animationDuration: `${flower.animationDuration}s`,
                animationDelay: `${flower.animationDelay}s`,
                '--sway-amount': `${flower.swayAmount}px`,
                '--initial-rotation': `${flower.rotation}deg`,
              } as React.CSSProperties
            }
          >
            <Image
              src={flower.src}
              alt="Falling flower"
              width={flower.size}
              height={flower.size}
              className="animate-flower-sway drop-shadow-md"
              style={{
                animationDuration: `${2 + Math.random() * 2}s`,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              }}
              priority={false}
            />
          </div>
        ))}
      </div>

      {/* CSS Animation inline */}
      <style jsx global>{`
        @keyframes flower-fall {
          0% {
            transform: translateY(-100px) translateX(0) rotate(var(--initial-rotation, 0deg));
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(var(--sway-amount, 50px))
              rotate(calc(var(--initial-rotation, 0deg) + 360deg));
            opacity: 0;
          }
        }

        @keyframes flower-sway {
          0%,
          100% {
            transform: translateX(0) rotate(0deg);
          }
          25% {
            transform: translateX(15px) rotate(10deg);
          }
          50% {
            transform: translateX(0) rotate(0deg);
          }
          75% {
            transform: translateX(-15px) rotate(-10deg);
          }
        }

        .animate-flower-fall {
          animation: flower-fall linear infinite;
        }

        .animate-flower-sway {
          animation: flower-sway ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default TetFlowerEffect;
