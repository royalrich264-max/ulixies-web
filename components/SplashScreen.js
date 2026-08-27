'use client';

import { useEffect, useState } from 'react';
import { Crown } from 'lucide-react';

const SPLASH_SHOES = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80',
];

const BRAND_LETTERS = ['U', 'L', 'I', 'X', 'I', 'E', 'S'];

export default function SplashScreen({ onFinish }) {
  const [isSpinning, setIsSpinning] = useState(true);
  const [ringCollapsed, setRingCollapsed] = useState(false);
  const [revealedIndex, setRevealedIndex] = useState(-1);
  const [crownRevealed, setCrownRevealed] = useState(false);
  const [lineExpanded, setLineExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const ringTimer = setTimeout(() => {
      setIsSpinning(false);
      setRingCollapsed(true);

      setTimeout(() => {
        setCrownRevealed(true);
      }, 100);

      BRAND_LETTERS.forEach((_, idx) => {
        setTimeout(() => {
          setRevealedIndex((prev) => Math.max(prev, idx));
        }, 150 + idx * 70);
      });

      setTimeout(() => {
        setLineExpanded(true);
      }, 800);

      setTimeout(() => {
        setDismissed(true);
        setTimeout(() => {
          setRemoved(true);
          if (onFinish) onFinish();
        }, 800);
      }, 2400);

    }, 4500);

    return () => clearTimeout(ringTimer);
  }, [onFinish]);

  if (removed) return null;

  return (
    <div
      id="brand-splash"
      className={`fixed inset-0 bg-white z-[99999] flex items-center justify-center flex-col overflow-hidden transition-all duration-800 ease-[cubic-bezier(0.85,0,0.15,1)] ${
        dismissed ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        
        {/* 3D 6-Shoe Orbit Ring */}
        <div className="w-[480px] h-[480px] relative flex items-center justify-center [perspective:1200px]">
          <div
            className={`w-full h-full absolute [transform-style:preserve-3d] transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isSpinning ? 'spinning-slow' : ''
            }`}
            style={
              ringCollapsed
                ? { transform: 'rotateY(720deg) scale(0.12)', opacity: 0 }
                : undefined
            }
          >
            {SPLASH_SHOES.map((src, index) => (
              <div
                key={index}
                className="absolute w-[150px] h-[150px] left-1/2 top-1/2 -ml-[75px] -mt-[75px] flex items-center justify-center"
                style={{
                  transform: `rotateY(${index * 60}deg) translateZ(240px)`,
                }}
              >
                <img
                  src={src}
                  alt={`Shoe ${index + 1}`}
                  className="w-full h-auto object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.18)]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Crown & Staggered Letter Reveal */}
        <div className="absolute flex flex-col items-center select-none pointer-events-none">
          <div className="flex items-center justify-center gap-3 font-black text-[#111111] text-6xl sm:text-8xl md:text-9xl tracking-tighter uppercase font-sans overflow-hidden py-4">
            
            <div
              className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                crownRevealed
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-8 scale-50'
              }`}
            >
              <Crown className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-black fill-current" />
            </div>

            <div className="flex items-center">
              {BRAND_LETTERS.map((letter, idx) => {
                const isRevealed = idx <= revealedIndex;
                return (
                  <span
                    key={idx}
                    className={`inline-block transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isRevealed
                        ? 'opacity-100 translate-y-0 scale-100 [transform:rotateX(0deg)] blur-none'
                        : 'opacity-0 translate-y-[80px] scale-[0.7] [transform:rotateX(45deg)] blur-md'
                    }`}
                  >
                    {letter}
                  </span>
                );
              })}
            </div>
          </div>
          
          <div
            className="h-[3px] bg-[#111111] rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ width: lineExpanded ? '140px' : '0%' }}
          />
        </div>

      </div>
    </div>
  );
}