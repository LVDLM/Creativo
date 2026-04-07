import React, { useState } from 'react';
import { WritingArea } from './WritingArea';
import { User } from 'firebase/auth';

interface PoetryLabProps {
  theme: 'modern' | 'organic' | 'minimal';
  user: User | null;
  writingContent: string;
  setWritingContent: (content: string) => void;
  pseudonym: string;
  setPseudonym: (pseudonym: string) => void;
  onPublish: (content?: string) => void;
  isPublishing: boolean;
  publishSuccess: boolean;
  onLogin: () => void;
}

export const PoetryLab: React.FC<PoetryLabProps> = ({ 
  theme, user, writingContent, setWritingContent, pseudonym, setPseudonym, onPublish, isPublishing, publishSuccess, onLogin 
}) => {
  const [castellanoText, setCastellanoText] = useState('');
  const isMinimal = theme === 'minimal';

  const handlePublish = () => {
    // Combine the fields for publication
    const fullContent = `En castellano se dice: ${castellanoText}\n\nPero en poesía decimos: ${writingContent}`;
    onPublish(fullContent);
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 ${isMinimal ? 'font-body text-[#1C1510]' : ''}`}>
      <div className="text-center mb-12">
        <h2 className={`${isMinimal ? 'font-editorial text-[32px] md:text-[42px] leading-tight' : 'text-4xl font-bold'} mb-4 ${theme === 'modern' ? 'display text-indigo-600' : ''}`}>
          En poesía se dice...
        </h2>
        <p className={`max-w-xl mx-auto italic ${isMinimal ? 'text-[#5A5040] text-sm leading-relaxed' : 'opacity-60'}`}>
          Toma una palabra o frase de tu día a día y saca toda tu literatura para decir "lo mismo" con Poesía.
        </p>
        <p className="mt-4 text-[10px] uppercase tracking-widest opacity-40">
          Idea tomada de <a href="https://www.instagram.com/xinxetart/" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-100">Alba Muñoz</a>
        </p>
      </div>

      <WritingArea 
        user={user}
        writingContent={writingContent}
        setWritingContent={setWritingContent}
        pseudonym={pseudonym}
        setPseudonym={setPseudonym}
        onPublish={handlePublish}
        isPublishing={isPublishing}
        publishSuccess={publishSuccess}
        onLogin={onLogin}
        placeholder="Escribe aquí tu versión poética..."
        theme={theme}
        maxWidth="56rem"
        textareaLabel="Pero en poesía decimos:"
      >
        <div className="flex flex-col gap-2">
          <label className={`text-[10px] font-bold uppercase tracking-widest ${isMinimal ? 'text-[#8A8070] [font-variant:small-caps]' : 'opacity-40'}`}>
            En castellano se dice:
          </label>
          <input
            type="text"
            value={castellanoText}
            onChange={(e) => setCastellanoText(e.target.value)}
            placeholder="Ej: Tengo sueño"
            className={`w-full px-6 py-3 transition-all ${
              isMinimal 
                ? 'border-[#C8C2B4] bg-white focus:border-[#1C1510] font-body text-[14px] rounded-[2px] text-[#1C1510]' 
                : 'border-stone-100 focus:border-stone-300 font-sans bg-stone-50/50 rounded-full'
            }`}
          />
        </div>
      </WritingArea>
    </div>
  );
};
