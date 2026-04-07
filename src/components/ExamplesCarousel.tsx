import React, { useRef } from 'react';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Publication } from '../types';

interface ExamplesCarouselProps {
  challengeId: string;
  publications: Publication[];
  theme: 'organic' | 'modern' | 'minimal';
  showExamples: boolean;
  setShowExamples: (show: boolean) => void;
}

export const ExamplesCarousel: React.FC<ExamplesCarouselProps> = ({
  challengeId,
  publications,
  theme,
  showExamples,
  setShowExamples
}) => {
  const examples = publications.filter(p => p.challengeId === challengeId);
  if (examples.length === 0) return null;

  const isMinimal = theme === 'minimal';
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      // Scroll by approximately the width of one or two items
      const scrollAmount = clientWidth * 0.8; 
      const scrollTo = direction === 'left' 
        ? scrollLeft - scrollAmount
        : scrollLeft + scrollAmount;
      
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className={`mt-12 pt-12 ${isMinimal ? 'border-t border-[#C8C2B4]' : 'border-t border-stone-100'}`}>
      <AnimatePresence mode="wait">
        {!showExamples ? (
          <motion.button 
            key="show-button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={() => setShowExamples(true)}
            className={`flex items-center gap-2 font-bold hover:underline ${isMinimal ? 'text-[#1C1510] text-[12px] tracking-[0.06em]' : 'text-indigo-600'}`}
          >
            <Sparkles className="w-4 h-4" /> Ver ejemplos de otros escritores e inspirarse
          </motion.button>
        ) : (
          <motion.div 
            key="carousel-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h4 className={`font-bold uppercase text-[10px] tracking-widest ${isMinimal ? 'text-[#8A8070] [font-variant:small-caps]' : 'text-stone-400'}`}>
                Inspiración de la comunidad
              </h4>
              <div className="flex items-center gap-4">
                {examples.length > 1 && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => scroll('left')}
                      className={`p-2 rounded-full border transition-all ${isMinimal ? 'border-[#C8C2B4] hover:bg-[#EDE8DF] text-[#1C1510]' : 'border-stone-200 hover:bg-stone-50 text-stone-600'}`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => scroll('right')}
                      className={`p-2 rounded-full border transition-all ${isMinimal ? 'border-[#C8C2B4] hover:bg-[#EDE8DF] text-[#1C1510]' : 'border-stone-200 hover:bg-stone-50 text-stone-600'}`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <button 
                  onClick={() => setShowExamples(false)}
                  className={`text-[10px] font-bold uppercase tracking-widest ${isMinimal ? 'text-[#8A8070] hover:text-[#1C1510]' : 'text-stone-400 hover:text-stone-800'}`}
                >
                  Ocultar
                </button>
              </div>
            </div>
            <div 
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar scroll-smooth"
            >
              {examples.map((ex, idx) => (
                <motion.div 
                  key={ex.id} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex-shrink-0 ${challengeId === 'lab-poetry-says' ? 'w-[90%] md:w-[85%] lg:w-[65%]' : 'w-[85%] md:w-[45%] lg:w-[30%]'} p-8 border shadow-sm snap-start flex flex-col justify-between transition-all hover:shadow-md ${
                    isMinimal 
                      ? 'bg-white border-[#E8E6E0] rounded-[2px]' 
                      : 'bg-white border-stone-100 rounded-2xl'
                  }`}
                >
                  <div>
                    <p className={`italic mb-6 whitespace-pre-line ${isMinimal ? 'text-[#1C1510] text-[15px] leading-[1.8]' : 'text-stone-600'}`}>
                      "{ex.content}"
                    </p>
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-widest ${isMinimal ? 'text-[#8A8070] [font-variant:small-caps]' : 'text-stone-400'}`}>
                    — {ex.authorName}
                  </span>
                </motion.div>
              ))}
              {/* Spacer to allow the last item to snap correctly and not be cut off */}
              <div className="flex-shrink-0 w-[5%] md:w-[2%]"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
