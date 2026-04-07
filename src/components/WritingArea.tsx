import React from 'react';
import { Send, CheckCircle2, LogIn } from 'lucide-react';
import { User } from 'firebase/auth';

interface WritingAreaProps {
  user: User | null;
  writingContent: string;
  setWritingContent: (content: string) => void;
  pseudonym: string;
  setPseudonym: (pseudonym: string) => void;
  onPublish: () => void;
  isPublishing: boolean;
  publishSuccess: boolean;
  onLogin: () => void;
  placeholder?: string;
  theme?: 'organic' | 'modern' | 'minimal';
  maxWidth?: string;
  children?: React.ReactNode;
  textareaLabel?: string;
}

export const WritingArea: React.FC<WritingAreaProps> = ({
  user,
  writingContent,
  setWritingContent,
  pseudonym,
  setPseudonym,
  onPublish,
  isPublishing,
  publishSuccess,
  onLogin,
  placeholder = "Escribe aquí tu obra maestra...",
  theme = 'organic',
  maxWidth,
  children,
  textareaLabel
}) => {
  const isMinimal = theme === 'minimal';

  return (
    <div className={`mt-12 ${isMinimal ? '' : 'border-t pt-12'} ${maxWidth ? 'mx-auto w-full' : ''}`} style={maxWidth ? { maxWidth } : {}}>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <label className={`text-[10px] font-bold uppercase tracking-widest ${isMinimal ? 'text-[#8A8070] [font-variant:small-caps]' : 'opacity-40'}`}>
            {user ? 'Publicar como (Seudónimo opcional):' : 'Nombre o Seudónimo (Opcional):'}
          </label>
          <input
            type="text"
            value={pseudonym}
            onChange={(e) => setPseudonym(e.target.value)}
            placeholder={user?.displayName || 'Invitado'}
            className={`w-full px-6 py-3 transition-all ${
              isMinimal 
                ? 'border-[#C8C2B4] bg-white focus:border-[#1C1510] font-body text-[14px] rounded-[2px] text-[#1C1510]' 
                : 'border-stone-100 focus:border-stone-300 font-sans bg-stone-50/50 rounded-full'
            }`}
          />
        </div>

        {children}

        <div className="flex flex-col gap-2">
          {textareaLabel && (
            <label className={`text-[10px] font-bold uppercase tracking-widest ${isMinimal ? 'text-[#8A8070] [font-variant:small-caps]' : 'opacity-40'}`}>
              {textareaLabel}
            </label>
          )}
          <textarea
            value={writingContent}
            onChange={(e) => setWritingContent(e.target.value)}
            placeholder={placeholder}
            className={`w-full h-80 p-8 transition-all text-xl resize-y focus:ring-0 ${
              isMinimal 
                ? 'border-[#C8C2B4] bg-white focus:border-[#1C1510] font-body text-[16px] leading-[1.8] rounded-[2px] text-[#1C1510]' 
                : 'border-stone-100 focus:border-stone-300 font-serif bg-stone-50/50 rounded-[32px]'
            }`}
          />
        </div>
        <div className="flex flex-col md:flex-row justify-end gap-4 items-center">
          {!user && (
            <button 
              onClick={onLogin} 
              className={`text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100 flex items-center gap-2 transition-all mb-4 md:mb-0`}
            >
              <LogIn className="w-4 h-4" /> O inicia sesión con Google
            </button>
          )}
          <button 
            disabled={isPublishing || !writingContent.trim()}
            onClick={onPublish}
            className={`${
              isMinimal 
                ? 'bg-[#1C1510] text-[#F7F4EE] px-8 py-3 rounded-[2px] font-body font-bold text-[12px] tracking-[0.06em]' 
                : 'olive-button'
            } flex items-center transition-all ${isPublishing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {publishSuccess ? (
              <><CheckCircle2 className="w-4 h-4 mr-2" /> {user ? 'Publicado' : 'Enviado a moderación'}</>
            ) : (
              <><Send className="w-4 h-4 mr-2" /> {isPublishing ? 'Procesando...' : (user ? 'Publicar en la Galería' : 'Publicar como Invitado')}</>
            )}
          </button>
        </div>
        {!user && (
          <p className="text-[10px] text-center opacity-40 uppercase tracking-widest mt-4">
            Los textos de invitados pasan por un panel de moderación antes de ser públicos.
          </p>
        )}
      </div>
    </div>
  );
};
