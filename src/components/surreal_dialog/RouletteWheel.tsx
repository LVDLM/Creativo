import React, { useState, useEffect, useMemo } from 'react';
import { WORD_LIST } from './constants';

interface RouletteWheelProps {
  targetWord: string;
  isSpinning: boolean;
  delay: number;
  onFinish: () => void;
  index: number;
  total: number;
}

const RouletteWheel: React.FC<RouletteWheelProps> = ({ targetWord, isSpinning, delay, onFinish, index, total }) => {
  const [isDone, setIsDone] = useState(false);
  const itemHeight = 56;

  const displayWords = useMemo(() => {
    return [...WORD_LIST, ...WORD_LIST, ...WORD_LIST, ...WORD_LIST, ...WORD_LIST];
  }, []);
  
  const targetIndex = useMemo(() => WORD_LIST.indexOf(targetWord), [targetWord]);
  const finalIndexInList = (WORD_LIST.length * 2) + targetIndex;

  useEffect(() => {
    if (isSpinning) {
      setIsDone(false);
      const timer = setTimeout(() => {
        setIsDone(true);
        onFinish();
      }, 3000 + delay);
      return () => clearTimeout(timer);
    } else {
      setIsDone(true);
    }
  }, [isSpinning, delay, onFinish]);

  const transitionStyle = {
    transition: isSpinning ? `transform ${3 + delay / 1000}s cubic-bezier(0.15, 0, 0.15, 1)` : 'transform 0.5s ease-out',
    transform: `translateY(-${finalIndexInList * itemHeight}px)`
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[140px] md:max-w-[180px]">
      <div className="text-[10px] md:text-xs font-black text-indigo-600 mb-2 md:mb-4 uppercase tracking-tighter bg-white px-2 py-0.5 md:py-1 rounded-md border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
        P{index + 1}
      </div>
      
      <div className="relative w-full">
        <div className="relative w-full h-[56px] bg-white rounded-xl md:rounded-2xl overflow-hidden border-[2px] md:border-[3px] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_rgba(0,0,0,1)] z-10">
          <div 
            className="flex flex-col"
            style={transitionStyle}
          >
            {displayWords.map((word, i) => (
              <div 
                key={i} 
                style={{ height: `${itemHeight}px` }}
                className={`flex items-center justify-center text-sm md:text-lg font-bold leading-none select-none transition-all duration-300 px-2 text-center ${
                  isDone && i === finalIndexInList ? 'text-black scale-105' : 'text-slate-300'
                }`}
              >
                {word}
              </div>
            ))}
          </div>

          <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-slate-100/60 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-t from-slate-100/60 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default RouletteWheel;
