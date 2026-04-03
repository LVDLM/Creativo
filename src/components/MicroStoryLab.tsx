import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Minus, Plus, RefreshCw } from 'lucide-react';
import { WritingArea } from './WritingArea';
import { User } from 'firebase/auth';

interface MicroStoryLabProps {
  theme: 'modern' | 'organic' | 'minimal';
  user: User | null;
  writingContent: string;
  setWritingContent: (content: string) => void;
  pseudonym: string;
  setPseudonym: (pseudonym: string) => void;
  onPublish: () => void;
  isPublishing: boolean;
  publishSuccess: boolean;
  onLogin: () => void;
}

interface LetterDie {
  id: string;
  char: string;
  color: string;
}

const COLORS = [
  "#ffff54", "#8cd446", "#46acd3", "#4264c7", 
  "#8c3fc0", "#e64c8d", "#ff5454", "#ffb554"
];

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

export const MicroStoryLab: React.FC<MicroStoryLabProps> = ({ 
  theme, user, writingContent, setWritingContent, pseudonym, setPseudonym, onPublish, isPublishing, publishSuccess, onLogin 
}) => {
  const [diceCount, setDiceCount] = useState(3);
  const [dice, setDice] = useState<LetterDie[]>([]);
  const [isRolling, setIsRolling] = useState(false);

  const getRandomDie = (): LetterDie => ({
    id: Math.random().toString(36).substr(2, 9),
    char: ALPHABET[Math.floor(Math.random() * ALPHABET.length)],
    color: COLORS[Math.floor(Math.random() * COLORS.length)]
  });

  const rollAll = () => {
    setIsRolling(true);
    const newDice = Array.from({ length: diceCount }, () => getRandomDie());
    setDice(newDice);
    setTimeout(() => setIsRolling(false), 600);
  };

  const rollOne = (index: number) => {
    const newDice = [...dice];
    newDice[index] = getRandomDie();
    setDice(newDice);
  };

  useEffect(() => {
    rollAll();
  }, [diceCount]);

  const isMinimal = theme === 'minimal';

  return (
    <div className={`max-w-4xl mx-auto p-6 ${isMinimal ? 'font-body text-[#1C1510]' : ''}`}>
      <div className="text-center mb-12">
        <h2 className={`${isMinimal ? 'font-editorial text-[32px] md:text-[42px] leading-tight' : 'text-4xl font-bold'} mb-4 ${theme === 'modern' ? 'display text-indigo-600' : ''}`}>
          Creador de Microhistorias
        </h2>
        <p className={`max-w-xl mx-auto italic ${isMinimal ? 'text-[#5A5040] text-sm leading-relaxed' : 'opacity-60'}`}>
          Elige el número de letras. Crea una oración usando una palabra que empiece por cada letra en el orden que han salido.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
        <div className="flex items-center gap-4">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${isMinimal ? 'text-[#8A8070] [font-variant:small-caps]' : 'opacity-40'}`}>Letras:</span>
          <div className={`flex items-center p-1 ${isMinimal ? 'bg-[#EDE8DF] rounded-[2px]' : theme === 'modern' ? 'bg-indigo-50 rounded-full' : 'bg-stone-100 rounded-full'}`}>
            <button 
              onClick={() => setDiceCount(Math.max(1, diceCount - 1))}
              className={`p-2 transition-colors ${isMinimal ? 'hover:bg-white rounded-[2px]' : 'hover:bg-white rounded-full'}`}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 text-center font-bold text-xl">{diceCount}</span>
            <button 
              onClick={() => setDiceCount(Math.min(10, diceCount + 1))}
              className={`p-2 transition-colors ${isMinimal ? 'hover:bg-white rounded-[2px]' : 'hover:bg-white rounded-full'}`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button 
          onClick={rollAll}
          className={`flex items-center gap-2 px-8 py-3 font-bold transition-all transform active:scale-95 ${
            isMinimal
              ? 'bg-[#1C1510] text-[#F7F4EE] rounded-[2px] text-[12px] tracking-[0.06em]'
              : theme === 'modern' 
              ? 'bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200 hover:bg-indigo-700' 
              : 'bg-stone-800 text-white rounded-full hover:bg-stone-900'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
          NUEVO INTENTO
        </button>
      </div>

      {/* Dice Display */}
      <div className="flex flex-wrap justify-center gap-4 mb-16 min-h-[120px]">
        <AnimatePresence mode="popLayout">
          {dice.map((die, index) => (
            <motion.div
              key={die.id}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              whileHover={{ y: -5, scale: 1.05 }}
              onClick={() => rollOne(index)}
              className="relative cursor-pointer group"
            >
              <div 
                className={`w-20 h-20 md:w-24 md:h-24 flex items-center justify-center transition-transform ${
                  isMinimal 
                    ? 'bg-white border border-[#C8C2B4] rounded-[2px] shadow-sm' 
                    : 'rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                }`}
                style={isMinimal ? {} : { backgroundColor: die.color }}
              >
                <span className={`text-4xl md:text-5xl font-black uppercase ${isMinimal ? 'text-[#1C1510] font-editorial' : 'text-black'}`}>
                  {die.char}
                </span>
              </div>
              <div className="absolute -top-2 -right-2 bg-black text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <RefreshCw className="w-3 h-3" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <WritingArea 
        user={user}
        writingContent={writingContent}
        setWritingContent={setWritingContent}
        pseudonym={pseudonym}
        setPseudonym={setPseudonym}
        onPublish={onPublish}
        isPublishing={isPublishing}
        publishSuccess={publishSuccess}
        onLogin={onLogin}
        placeholder="Escribe tu microhistoria usando las letras de arriba..."
        theme={theme}
      />
    </div>
  );
};
