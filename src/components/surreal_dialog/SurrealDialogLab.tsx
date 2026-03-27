import React, { useState, useCallback, useEffect } from 'react';
import { HelpCircle, RefreshCw, Sparkles } from 'lucide-react';
import HelpModal from './HelpModal';
import RouletteWheel from './RouletteWheel';
import { WORD_LIST } from './constants';
import { motion } from 'framer-motion';
import { WritingArea } from '../WritingArea';
import { User } from 'firebase/auth';

interface SurrealDialogLabProps {
  theme: 'modern' | 'organic' | 'minimal';
  user: User | null;
  writingContent: string;
  setWritingContent: (content: string) => void;
  onPublish: () => void;
  isPublishing: boolean;
  publishSuccess: boolean;
  onLogin: () => void;
}

const Bubble: React.FC<{ style: React.CSSProperties, className?: string, content?: string, shape: 'oval' | 'rect' | 'cloud' }> = ({ style, className, content, shape }) => {
  const shapeClasses = {
    oval: "rounded-[50%]",
    rect: "rounded-xl",
    cloud: "rounded-[40%_60%_70%_30%/50%_40%_60%_50%]"
  };

  return (
    <div 
      className={`absolute border-2 border-black bg-white flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] pointer-events-none z-0 ${shapeClasses[shape]} ${className}`}
      style={style}
    >
      {content && <span className="text-black font-black text-xs md:text-sm">{content}</span>}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-black rotate-45"></div>
    </div>
  );
};

export const SurrealDialogLab: React.FC<SurrealDialogLabProps> = ({ 
  theme, user, writingContent, setWritingContent, onPublish, isPublishing, publishSuccess, onLogin 
}) => {
  const isMinimal = theme === 'minimal';
  const [numInterlocutors, setNumInterlocutors] = useState(2);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [finishedWheels, setFinishedWheels] = useState(0);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    const shuffled = [...WORD_LIST].sort(() => 0.5 - Math.random());
    setSelectedWords(shuffled.slice(0, numInterlocutors));
    setFinishedWheels(0);
  }, [numInterlocutors]);

  const handleSpin = () => {
    setFinishedWheels(0);
    setIsSpinning(true);
    const shuffled = [...WORD_LIST].sort(() => 0.5 - Math.random());
    setSelectedWords(shuffled.slice(0, numInterlocutors));
  };

  const handleWheelFinish = useCallback(() => {
    setFinishedWheels(prev => prev + 1);
  }, []);

  const allFinished = finishedWheels === numInterlocutors;

  useEffect(() => {
    if (allFinished && isSpinning) {
      setIsSpinning(false);
    }
  }, [allFinished, isSpinning]);

  const renderSurrealTitle = () => {
    const word1 = "DIÁLOGOS".split("");
    const word2 = "SURREALISTAS".split("");

    const getSurrealClass = (i: number) => {
      if (i % 5 === 0) return 'animate-surreal-flip';
      if (i % 3 === 0) return 'animate-surreal-spin';
      if (i % 7 === 0) return 'animate-surreal-glitch';
      return 'animate-surreal-float';
    };

    if (isMinimal) {
      return (
        <div className="flex flex-col items-center sm:items-start select-none">
          <h1 className="flex flex-wrap justify-center sm:justify-start gap-x-1 md:gap-x-2">
            <span className="font-editorial text-[32px] md:text-[52px] text-[#1C1510] tracking-tight">
              Diálogos Surrealistas
            </span>
          </h1>
          <p className="text-[10px] md:text-xs text-[#8A8070] uppercase tracking-[0.2em] font-bold mt-1 ml-1 [font-variant:small-caps]">
            Laboratorio Literario
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center sm:items-start select-none [perspective:1000px]">
        <h1 className="flex flex-wrap justify-center sm:justify-start gap-x-1 md:gap-x-2">
          <span className="flex">
            {word1.map((char, i) => (
              <span
                key={`w1-${i}`}
                className={`inline-block font-black text-2xl md:text-5xl text-slate-900 ${getSurrealClass(i)}`}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  transformStyle: 'preserve-3d',
                  display: 'inline-block'
                }}
              >
                {char}
              </span>
            ))}
          </span>
          
          <span className="flex ml-2 sm:ml-0">
            {word2.map((char, i) => (
              <span
                key={`w2-${i}`}
                className={`inline-block font-black text-2xl md:text-5xl text-indigo-600 ${getSurrealClass(i + 8)}`}
                style={{
                  animationDelay: `${(i + 5) * 0.3}s`,
                  transformStyle: 'preserve-3d',
                  display: 'inline-block',
                  textShadow: i % 4 === 0 ? '2px 2px 0px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {char}
              </span>
            ))}
          </span>
        </h1>
        <p className="text-[10px] md:text-sm text-indigo-500/70 uppercase tracking-[0.3em] font-black italic mt-2 ml-1">
          Laboratorio Literario
        </p>
      </div>
    );
  };

  return (
    <div className={`relative p-4 md:p-8 max-w-full overflow-hidden ${isMinimal ? 'font-body text-[#1C1510]' : ''}`}>
      {/* Decorative Bubbles */}
      {!isMinimal && (
        <>
          <Bubble shape="oval" content="..." style={{ top: '5%', left: '2%', width: '60px', height: '40px', transform: 'rotate(-15deg)', animation: 'float 7s infinite ease-in-out' }} />
          <Bubble shape="cloud" content="?" style={{ top: '10%', right: '5%', width: '50px', height: '50px', transform: 'rotate(10deg)', animation: 'float-delayed 9s infinite ease-in-out' }} />
        </>
      )}
      
      {/* Decorative Surreal Elements */}
      <img 
        src="/Globo1.png" 
        alt="" 
        className={`absolute top-20 -right-16 md:right-0 w-40 md:w-64 -z-10 pointer-events-none animate-float transition-all ${isMinimal ? 'opacity-10 grayscale' : 'opacity-20 md:opacity-30'}`}
        aria-hidden="true"
      />
      <img 
        src="/Globo2.png" 
        alt="" 
        className={`absolute bottom-10 -left-16 md:left-0 w-40 md:w-64 -z-10 pointer-events-none animate-float-delayed transition-all ${isMinimal ? 'opacity-10 grayscale' : 'opacity-20 md:opacity-30'}`}
        aria-hidden="true"
      />

      {/* Header */}
      <header className="w-full max-w-5xl flex flex-col sm:flex-row justify-between items-center mb-8 md:mb-16 gap-6 z-10 relative">
        <div className="flex items-center gap-4 md:gap-6">
          <div className={`p-3 md:p-5 border-2 border-black transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer group ${
            isMinimal ? 'bg-[#F7F4EE] rounded-[2px]' : 'bg-indigo-600 rounded-[2rem] md:rounded-[2.5rem] shadow-[4px_4px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_rgba(0,0,0,1)]'
          }`}>
            <Sparkles className={`w-6 h-6 md:w-10 md:h-10 group-hover:scale-125 transition-transform ${isMinimal ? 'text-[#1C1510]' : 'text-white'}`} />
          </div>
          {renderSurrealTitle()}
        </div>

        <button 
          onClick={() => setIsHelpOpen(true)}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 transition-all border-2 border-black ${
            isMinimal 
              ? 'bg-white hover:bg-[#F7F4EE] rounded-[2px] shadow-sm' 
              : 'bg-white hover:bg-slate-50 rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1'
          }`}
        >
          <span className={`text-sm font-black uppercase tracking-wider ${isMinimal ? 'text-[#1C1510] [font-variant:small-caps]' : 'text-slate-900'}`}>Ayuda</span>
          <HelpCircle className={`w-5 h-5 ${isMinimal ? 'text-[#8A8070]' : 'text-indigo-600'}`} />
        </button>
      </header>

      {/* Main Content */}
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center z-10 relative">
        {/* Controls */}
        <div className={`p-6 md:p-8 border-2 border-black w-full max-w-2xl mb-8 md:mb-16 ${
          isMinimal 
            ? 'bg-white rounded-[2px] shadow-sm' 
            : 'bg-white rounded-[2.5rem] shadow-[10px_10px_0px_rgba(99,102,241,0.2)]'
        }`}>
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-8 md:gap-10">
            <div className="flex-1 space-y-4">
              <label className={`text-[10px] font-black uppercase tracking-widest block text-center md:text-left ${isMinimal ? 'text-[#8A8070] [font-variant:small-caps]' : 'text-slate-500'}`}>
                ¿Cuántos hablan?
              </label>
              <div className="flex gap-2 md:gap-3 justify-center md:justify-start flex-wrap">
                {[2, 3, 4, 5, 6].map(num => (
                  <button
                    key={num}
                    onClick={() => !isSpinning && setNumInterlocutors(num)}
                    disabled={isSpinning}
                    className={`w-10 h-10 md:w-12 md:h-12 font-black text-base md:text-lg border-2 border-black transition-all ${
                      numInterlocutors === num 
                        ? isMinimal ? 'bg-[#1C1510] text-white rounded-[2px]' : 'bg-indigo-600 text-white rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] -translate-y-1' 
                        : isMinimal ? 'bg-[#F7F4EE] text-[#8A8070] rounded-[2px] border-[#C8C2B4]' : 'bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 active:shadow-none'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className={`flex items-center justify-center gap-3 px-8 md:px-10 py-4 md:py-5 border-2 border-black font-black text-lg md:text-xl transition-all transform active:scale-95 active:shadow-none ${
                isSpinning 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : isMinimal 
                    ? 'bg-[#1C1510] text-[#F7F4EE] rounded-[2px] text-[14px] tracking-[0.06em]'
                    : 'bg-yellow-400 text-black rounded-[2rem] shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:bg-yellow-300'
              }`}
            >
              {isSpinning ? (
                <>
                  <RefreshCw className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                  GIRANDO
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 md:w-6 md:h-6" />
                  ¡GIRAR!
                </>
              )}
            </button>
          </div>
        </div>

        {/* Wheels Container */}
        <div className="flex flex-wrap justify-center gap-x-4 md:gap-x-8 lg:gap-x-12 gap-y-6 md:gap-y-10 mb-12 md:mb-20 w-full max-w-5xl">
          {selectedWords.map((word, idx) => (
            <RouletteWheel 
              key={idx}
              targetWord={word}
              isSpinning={isSpinning}
              delay={idx * 300}
              onFinish={handleWheelFinish}
              index={idx}
              total={numInterlocutors}
              theme={theme}
            />
          ))}
        </div>

        <WritingArea 
          user={user}
          writingContent={writingContent}
          setWritingContent={setWritingContent}
          onPublish={onPublish}
          isPublishing={isPublishing}
          publishSuccess={publishSuccess}
          onLogin={onLogin}
          placeholder="Escribe el diálogo surrealista usando las palabras de las ruletas..."
          theme={theme}
        />
      </div>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(var(--initial-rot, 0deg)); }
          50% { transform: translateY(-20px) rotate(calc(var(--initial-rot, 0deg) + 5deg)); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(var(--initial-rot, 0deg)); }
          50% { transform: translateY(20px) rotate(calc(var(--initial-rot, 0deg) - 5deg)); }
        }
        
        @keyframes surreal-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        
        @keyframes surreal-flip {
          0%, 80% { transform: rotateY(0deg); }
          90% { transform: rotateY(180deg); }
          100% { transform: rotateY(360deg); }
        }
        
        @keyframes surreal-spin {
          0%, 75% { transform: rotate(0deg); }
          85% { transform: rotate(360deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes surreal-glitch {
          0%, 90% { transform: translate(0, 0) scale(1); }
          93% { transform: translate(2px, -2px) scale(1.1); filter: hue-rotate(90deg); }
          96% { transform: translate(-2px, 2px) scale(0.9); filter: hue-rotate(-90deg); }
          100% { transform: translate(0, 0) scale(1); }
        }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        
        .animate-surreal-float { animation: surreal-float 3s ease-in-out infinite; }
        .animate-surreal-flip { animation: surreal-flip 8s ease-in-out infinite; }
        .animate-surreal-spin { animation: surreal-spin 10s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite; }
        .animate-surreal-glitch { animation: surreal-glitch 12s ease-in-out infinite; }
      `}} />
    </div>
  );
};
