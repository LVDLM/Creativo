import React from 'react';
import { Send, CheckCircle2, LogIn } from 'lucide-react';
import { User } from 'firebase/auth';

interface WritingAreaProps {
  user: User | null;
  writingContent: string;
  setWritingContent: (content: string) => void;
  onPublish: () => void;
  isPublishing: boolean;
  publishSuccess: boolean;
  onLogin: () => void;
  placeholder?: string;
  theme?: 'organic' | 'modern' | 'minimal';
  maxWidth?: string;
}

export const WritingArea: React.FC<WritingAreaProps> = ({
  user,
  writingContent,
  setWritingContent,
  onPublish,
  isPublishing,
  publishSuccess,
  onLogin,
  placeholder = "Escribe aquí tu obra maestra...",
  theme = 'organic',
  maxWidth
}) => {
  const isMinimal = theme === 'minimal';

  return (
    <div className={`mt-12 ${isMinimal ? '' : 'border-t pt-12'} ${maxWidth ? 'mx-auto w-full' : ''}`} style={maxWidth ? { maxWidth } : {}}>
      {!user ? (
        <div className={`text-center py-12 ${
          isMinimal 
            ? 'bg-[#EDE8DF] border border-[#C8C2B4] rounded-[2px]' 
            : 'bg-stone-50 border-2 border-dashed border-stone-200 rounded-[32px]'
        }`}>
          <p className={`${isMinimal ? 'text-[#5A5040] font-body' : 'text-stone-500 font-medium'} mb-6`}>
            Inicia sesión para guardar y publicar tu creación en la galería.
          </p>
          <button 
            onClick={onLogin} 
            className={`${
              isMinimal 
                ? 'bg-[#1C1510] text-[#F7F4EE] px-8 py-3 rounded-[2px] font-body font-bold text-[12px] tracking-[0.06em]' 
                : 'olive-button rounded-full'
            } flex items-center mx-auto transition-all hover:opacity-90`}
          >
            <LogIn className="w-4 h-4 mr-2" /> Iniciar con Google
          </button>
        </div>
      ) : (
        <div className="space-y-6">
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
          <div className="flex justify-end gap-4">
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
                <><CheckCircle2 className="w-4 h-4 mr-2" /> Publicado</>
              ) : (
                <><Send className="w-4 h-4 mr-2" /> {isPublishing ? 'Moderando...' : 'Publicar en la Galería'}</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
