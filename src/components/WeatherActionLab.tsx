import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, RefreshCw } from 'lucide-react';
import { WritingArea } from './WritingArea';
import { User } from 'firebase/auth';

interface WeatherActionLabProps {
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

interface IconDie {
  id: string;
  icon: string;
  color: string;
}

const COLORS = [
  "#ffff54", "#8cd446", "#46acd3", "#4264c7", 
  "#8c3fc0", "#e64c8d", "#ff5454", "#ffb554"
];

const ICONS = [
  "001-happy.png", "001-sunny.png", "002-cloudy.png", "002-singing.png", "003-rain.png", "003-scientific.png", "004-rainy.png", "004-superhero.png", "005-heavy rain.png", "005-surfing.png", "006-ghost.png", "006-storm.png", "007-thunder.png", "007-whistle.png", "008-birthday.png", "008-snow.png", "009-cool.png", "009-snow.png", "010-sad.png", "010-wind.png", "011-strong.png", "011-wind.png", "012-devil.png", "012-full moon.png", "013-chef.png", "013-new moon.png", "014-sleeping.png", "014-waxing moon.png", "015-crescent moon.png", "015-exercise.png", "016-cloudy.png", "016-detective.png", "017-coffee.png", "017-rain.png", "018-eclipse.png", "018-toothbrushing.png", "019-popsicle.png", "019-snowflake.png", "020-love.png", "020-snowman.png", "021-astronaut.png", "021-snow.png", "022-leaf.png", "022-thinking.png", "023-leaf.png", "023-sick.png", "024-angry.png", "024-wind.png", "025-surprised.png", "025-tree.png", "026-laughing.png", "026-tree.png", "027-calling.png", "027-tree.png", "028-angel.png", "028-fire.png", "029-eating.png", "029-flower.png", "030-flower.png", "030-reading.png", "031-drop.png", "031-laptop.png", "032-drop.png", "032-sunbathing.png", "033-calendar.png", "033-volleyball.png", "034-listening.png", "034-umbrella.png", "035-shower.png", "035-umbrella.png", "036-crying.png", "036-umbrella.png", "037-thunder.png", "037-zombie.png", "038-pirate.png", "038-tornado.png", "039-blushing.png", "039-rainbow.png", "040-confused.png", "040-earth.png", "041-earth.png", "041-wrestler.png", "042-cyclone.png", "042-drunk.png", "043-mountain.png", "043-scare.png", "044-cellphone.png", "044-idea.png", "045-dancing.png", "045-thermometer.png", "046-drawing.png", "046-thermometer.png", "047-hot.png", "047-thermometer.png", "048-bubbles.png", "048-sweat.png", "049-cold.png", "049-selfie.png", "050-facial treatment.png", "050-rain.png"
];

export const WeatherActionLab: React.FC<WeatherActionLabProps> = ({ 
  theme, user, writingContent, setWritingContent, pseudonym, setPseudonym, onPublish, isPublishing, publishSuccess, onLogin 
}) => {
  const [diceCount, setDiceCount] = useState(3);
  const [dice, setDice] = useState<IconDie[]>([]);
  const [isRolling, setIsRolling] = useState(false);

  const getRandomDie = (): IconDie => ({
    id: Math.random().toString(36).substr(2, 9),
    icon: ICONS[Math.floor(Math.random() * ICONS.length)],
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
          Tiempo y Acciones
        </h2>
        <p className={`max-w-xl mx-auto italic ${isMinimal ? 'text-[#5A5040] text-sm leading-relaxed' : 'opacity-60'}`}>
          Combina el tiempo atmosférico con acciones cotidianas para crear historias únicas.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
        <div className="flex items-center gap-4">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${isMinimal ? 'text-[#8A8070] [font-variant:small-caps]' : 'opacity-40'}`}>Dados:</span>
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
          NUEVA HISTORIA
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
                className={`w-20 h-20 md:w-24 md:h-24 flex items-center justify-center transition-transform overflow-hidden ${
                  isMinimal 
                    ? 'bg-white border border-[#C8C2B4] rounded-[2px] shadow-sm' 
                    : 'rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                }`}
                style={isMinimal ? {} : { backgroundColor: die.color }}
              >
                <img 
                  src={`https://www.revistahabla.com/creatividad/apps/img/icons/${die.icon}`} 
                  alt={die.icon}
                  className="w-14 h-14 md:w-16 md:h-16 object-contain"
                  referrerPolicy="no-referrer"
                />
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
        placeholder="Escribe tu historia integrando el tiempo y las acciones de los dados..."
        theme={theme}
      />
    </div>
  );
};
