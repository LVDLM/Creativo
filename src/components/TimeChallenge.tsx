import React, { useState, useEffect, useRef } from 'react';
import { Clock, Send, CheckCircle2, ChevronRight, Trophy, RotateCcw, AlertCircle, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Challenge } from '../types';
import { User } from 'firebase/auth';

interface TimeChallengeProps {
  challenges: Challenge[];
  user: User | null;
  onPublish: (content: string, challengeId: string, pseudonym: string) => Promise<boolean>;
  onBack: () => void;
  theme?: 'organic' | 'modern' | 'minimal';
}

export const TimeChallenge: React.FC<TimeChallengeProps> = ({
  challenges,
  user,
  onPublish,
  onBack,
  theme = 'minimal'
}) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'results'>('intro');
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const [timerType, setTimerType] = useState<'global' | 'per-challenge'>('global');
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [shuffledChallenges, setShuffledChallenges] = useState<Challenge[]>([]);
  const [writingContent, setWritingContent] = useState('');
  const [pseudonym, setPseudonym] = useState('');
  const [sessionTexts, setSessionTexts] = useState<{ challengeId: string; content: string; title: string }[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isMinimal = theme === 'minimal';

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0 && !showAbandonConfirm) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      if (timerType === 'per-challenge') {
        handleNextChallenge(true); // Auto-skip on timeout
      } else {
        setGameState('results');
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, timeLeft, timerType, showAbandonConfirm]);

  const startChallenge = (type: 'global' | 'per-challenge') => {
    let shuffled = [...challenges].sort(() => Math.random() - 0.5);
    if (type === 'per-challenge') {
      shuffled = shuffled.slice(0, 5);
    }
    setShuffledChallenges(shuffled);
    setTimerType(type);
    setTimeLeft(type === 'global' ? 600 : 120); // 10 mins or 2 mins
    setCurrentChallengeIndex(0);
    setSessionTexts([]);
    setWritingContent('');
    setGameState('playing');
    setShowAbandonConfirm(false);
  };

  const handleNextChallenge = async (isTimeout = false) => {
    if (writingContent.trim() && !isTimeout) {
      const currentChallenge = shuffledChallenges[currentChallengeIndex];
      setIsPublishing(true);
      const success = await onPublish(writingContent, currentChallenge.id, pseudonym);
      if (success) {
        setSessionTexts((prev) => [
          ...prev,
          { 
            challengeId: currentChallenge.id, 
            content: writingContent, 
            title: currentChallenge.title 
          }
        ]);
      }
      setIsPublishing(false);
    }

    if (currentChallengeIndex + 1 < shuffledChallenges.length) {
      setCurrentChallengeIndex((prev) => prev + 1);
      setWritingContent('');
      if (timerType === 'per-challenge') {
        setTimeLeft(120);
      }
    } else {
      setGameState('results');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameState === 'intro') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="font-editorial text-4xl md:text-6xl font-bold tracking-tight">Reto de Tiempo</h1>
          <p className="text-lg text-[#8A8070] max-w-2xl mx-auto leading-relaxed">
            Pon a prueba tu agilidad mental y creativa. Te presentaremos una serie de retos aleatorios que deberás resolver antes de que el tiempo se agote.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <button
              onClick={() => startChallenge('global')}
              className="p-8 border-2 border-[#C8C2B4] rounded-lg hover:border-[#1C1510] hover:bg-[#EDE8DF] transition-all group text-left"
            >
              <div className="flex items-center gap-3 mb-4">
                <Timer className="w-6 h-6 text-[#1C1510]" />
                <h3 className="font-bold uppercase tracking-widest text-sm">Límite Global</h3>
              </div>
              <p className="text-2xl font-editorial font-bold mb-2">10 Minutos</p>
              <p className="text-sm text-[#8A8070]">Tienes 10 minutos para completar tantos retos como puedas.</p>
            </button>

            <button
              onClick={() => startChallenge('per-challenge')}
              className="p-8 border-2 border-[#C8C2B4] rounded-lg hover:border-[#1C1510] hover:bg-[#EDE8DF] transition-all group text-left"
            >
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-[#1C1510]" />
                <h3 className="font-bold uppercase tracking-widest text-sm">Límite por Reto</h3>
              </div>
              <p className="text-2xl font-editorial font-bold mb-2">2 Minutos</p>
              <p className="text-sm text-[#8A8070]">Cada reto tiene su propio cronómetro de 2 minutos.</p>
            </button>
          </div>

          <button 
            onClick={onBack}
            className="text-xs font-bold uppercase tracking-widest text-[#8A8070] hover:text-[#1C1510] transition-colors mt-12"
          >
            ← Volver al inicio
          </button>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'playing') {
    const currentChallenge = shuffledChallenges[currentChallengeIndex];
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full flex items-center gap-2 font-bold text-lg ${timeLeft < 30 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-[#1C1510] text-[#F7F4EE]'}`}>
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#8A8070]">
              Reto {currentChallengeIndex + 1} de {shuffledChallenges.length}
            </div>
          </div>
          <button 
            onClick={() => setShowAbandonConfirm(true)}
            className="text-xs font-bold uppercase tracking-widest text-red-600 hover:opacity-70"
          >
            Abandonar
          </button>
        </div>

        <AnimatePresence>
          {showAbandonConfirm && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 p-6 bg-red-50 border border-red-200 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm font-bold text-red-900">¿Seguro que quieres abandonar la partida? Se perderá el progreso actual.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowAbandonConfirm(false)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-stone-600 hover:text-stone-900"
                >
                  Continuar jugando
                </button>
                <button 
                  onClick={() => {
                    setGameState('intro');
                    setShowAbandonConfirm(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white text-xs font-bold uppercase tracking-widest rounded-[2px] hover:bg-red-700"
                >
                  Sí, abandonar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          key={currentChallenge.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="bg-white p-8 border border-[#C8C2B4] rounded-lg shadow-sm">
            <h2 className="text-3xl font-editorial font-bold mb-4">{currentChallenge.title}</h2>
            <p className="text-[#5A5040] leading-relaxed italic">{currentChallenge.description}</p>
          </div>

          <div className="space-y-4">
            <textarea
              value={writingContent}
              onChange={(e) => setWritingContent(e.target.value)}
              placeholder="Escribe rápido, el tiempo vuela..."
              className="w-full h-64 p-8 border-[#C8C2B4] bg-white focus:border-[#1C1510] font-editorial text-lg leading-[1.8] rounded-lg text-[#1C1510] resize-none shadow-inner"
              autoFocus
            />
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-col gap-1 w-full md:w-auto">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#8A8070]">Seudónimo (Opcional):</label>
                <input
                  type="text"
                  value={pseudonym}
                  onChange={(e) => setPseudonym(e.target.value)}
                  placeholder={user?.displayName || 'Invitado'}
                  className="px-4 py-2 border-[#C8C2B4] bg-white focus:border-[#1C1510] font-body text-xs rounded-[2px] text-[#1C1510]"
                />
              </div>

              <button
                disabled={isPublishing || !writingContent.trim()}
                onClick={() => handleNextChallenge()}
                className="w-full md:w-auto bg-[#1C1510] text-[#F7F4EE] px-10 py-4 rounded-full font-body font-bold text-sm tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-30"
              >
                {isPublishing ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {currentChallengeIndex + 1 === shuffledChallenges.length ? 'Finalizar Partida' : 'Siguiente Reto'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-12"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="font-editorial text-4xl font-bold">¡Partida Finalizada!</h1>
          <p className="text-[#8A8070]">Has completado {sessionTexts.length} retos en esta sesión.</p>
        </div>

        <div className="space-y-8">
          <h2 className="font-bold uppercase tracking-widest text-xs border-b border-[#C8C2B4] pb-2">Tus creaciones de esta partida:</h2>
          {sessionTexts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {sessionTexts.map((text, idx) => (
                <div key={idx} className="bg-white p-8 border border-[#C8C2B4] rounded-lg shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#D85A30] rounded-full" />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#8A8070]">{text.title}</span>
                  </div>
                  <p className="font-editorial text-lg leading-[1.8] text-[#1C1510] whitespace-pre-wrap">{text.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#EDE8DF] rounded-lg border-2 border-dashed border-[#C8C2B4]">
              <AlertCircle className="w-8 h-8 text-[#8A8070] mx-auto mb-2" />
              <p className="text-[#8A8070] italic">No se publicaron textos en esta partida.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
          <button
            onClick={() => setGameState('intro')}
            className="bg-[#1C1510] text-[#F7F4EE] px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Nueva Partida
          </button>
          <button
            onClick={onBack}
            className="border border-[#C8C2B4] text-[#1C1510] px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#EDE8DF] transition-all"
          >
            Volver al Inicio
          </button>
        </div>
      </motion.div>
    </div>
  );
};
