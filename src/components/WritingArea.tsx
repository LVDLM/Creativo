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
}

export const WritingArea: React.FC<WritingAreaProps> = ({
  user,
  writingContent,
  setWritingContent,
  onPublish,
  isPublishing,
  publishSuccess,
  onLogin,
  placeholder = "Escribe aquí tu obra maestra..."
}) => {
  return (
    <div className="mt-12 border-t pt-12">
      {!user ? (
        <div className="text-center py-12 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
          <p className="text-stone-500 mb-6 font-medium">Inicia sesión para guardar y publicar tu creación en la galería.</p>
          <button onClick={onLogin} className="olive-button flex items-center mx-auto">
            <LogIn className="w-5 h-5 mr-2" /> Iniciar con Google
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <textarea
            value={writingContent}
            onChange={(e) => setWritingContent(e.target.value)}
            placeholder={placeholder}
            className="w-full h-64 p-6 rounded-3xl border-2 border-stone-100 focus:border-stone-300 focus:ring-0 transition-all text-xl font-serif resize-none bg-stone-50/50"
          />
          <div className="flex justify-end gap-4">
            <button 
              disabled={isPublishing || !writingContent.trim()}
              onClick={onPublish}
              className={`olive-button flex items-center ${isPublishing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {publishSuccess ? (
                <><CheckCircle2 className="w-5 h-5 mr-2" /> Publicado</>
              ) : (
                <><Send className="w-5 h-5 mr-2" /> {isPublishing ? 'Moderando...' : 'Publicar en la Galería'}</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
