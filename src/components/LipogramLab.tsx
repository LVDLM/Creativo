import React, { useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import { CheckCircle2, Dice5, ShieldCheck, XCircle } from 'lucide-react';
import { WritingArea } from './WritingArea';

interface LipogramLabProps {
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

const SPANISH_ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

const normalizeForLetterCheck = (value: string) =>
  value.toLocaleLowerCase('es').replace(/[áàäâ]/g, 'a').replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i').replace(/[óòöô]/g, 'o').replace(/[úùüû]/g, 'u');

const countLetter = (text: string, letter: string) => {
  const normalizedText = normalizeForLetterCheck(text);
  const normalizedLetter = normalizeForLetterCheck(letter);
  return Array.from(normalizedText).filter((character) => character === normalizedLetter).length;
};

const findWordsWithLetter = (text: string, letter: string) => {
  const normalizedLetter = normalizeForLetterCheck(letter);
  return Array.from(new Set(text.match(/[\p{L}]+/gu) || []))
    .filter((word) => Array.from(normalizeForLetterCheck(word)).includes(normalizedLetter));
};

export const LipogramLab: React.FC<LipogramLabProps> = ({
  theme, user, writingContent, setWritingContent, pseudonym, setPseudonym,
  onPublish, isPublishing, publishSuccess, onLogin
}) => {
  const [selectedLetter, setSelectedLetter] = useState('A');
  const [hasValidated, setHasValidated] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [validationPassed, setValidationPassed] = useState(false);
  const isMinimal = theme === 'minimal';
  const isModern = theme === 'modern';
  const occurrences = useMemo(
    () => countLetter(writingContent, selectedLetter),
    [writingContent, selectedLetter]
  );
  const wordsToFix = useMemo(
    () => findWordsWithLetter(writingContent, selectedLetter),
    [writingContent, selectedLetter]
  );

  const buttonBase = isMinimal
    ? 'border border-[#C8C2B4] text-[#1C1510] hover:bg-[#EDE8DF] rounded-[2px]'
    : 'border border-stone-200 rounded-full hover:bg-stone-50';

  const handleLetterChange = (letter: string) => {
    setSelectedLetter(letter);
    setHasValidated(false);
    setValidationPassed(false);
    setValidationMessage('');
  };

  const handleTextChange = (text: string) => {
    setWritingContent(text);
    setHasValidated(false);
    setValidationPassed(false);
    setValidationMessage('');
  };

  const handleRandomLetter = () => {
    const choices = SPANISH_ALPHABET.filter((letter) => letter !== selectedLetter);
    const nextLetter = choices[Math.floor(Math.random() * choices.length)];
    handleLetterChange(nextLetter);
  };

  const handleValidate = () => {
    if (!writingContent.trim()) {
      setHasValidated(true);
      setValidationPassed(false);
      setValidationMessage('Primero escribe tu texto y después comprueba el resultado.');
      return;
    }
    setHasValidated(true);
    if (occurrences === 0) {
      setValidationPassed(true);
      setValidationMessage(`¡Reto superado! No has utilizado la letra ${selectedLetter}.`);
    } else {
      setValidationPassed(false);
      setValidationMessage(`Todavía aparece ${selectedLetter} ${occurrences === 1 ? 'vez' : `${occurrences} veces`} en tu texto. Puedes revisar las palabras señaladas y volver a intentarlo.`);
    }
  };

  const handlePublish = () => {
    if (!hasValidated || !validationPassed || occurrences > 0) {
      setValidationMessage('Valida el texto y elimina la letra prohibida antes de publicarlo.');
      setValidationPassed(false);
      return;
    }
    onPublish(`EL LIPOGRAMA · LETRA PROHIBIDA: ${selectedLetter}\n\n${writingContent.trim()}`);
  };

  return (
    <div className={`max-w-4xl mx-auto p-4 md:p-6 ${isMinimal ? 'font-body text-[#1C1510]' : ''}`}>
      <header className="text-center mb-10 md:mb-12">
        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-3 ${isMinimal ? 'text-[#0F5C52]' : 'text-indigo-600'}`}>
          Laboratorio de palabras · 5–10 min
        </p>
        <h2 className={`${isMinimal ? 'font-editorial text-[36px] md:text-[48px] leading-tight' : 'text-4xl md:text-5xl font-bold'} mb-4 ${isModern ? 'display text-indigo-600' : ''}`}>
          El lipograma
        </h2>
        <p className={`max-w-2xl mx-auto italic text-sm md:text-base leading-relaxed ${isMinimal ? 'text-[#5A5040]' : 'opacity-60'}`}>
          Escribe un texto sin utilizar una letra. Tú eliges cuál o deja que salga al azar. Cuando termines, comprobaremos si has conseguido evitarla.
        </p>
      </header>

      <section className={`p-5 md:p-7 border mb-6 ${isMinimal ? 'bg-white border-[#C8C2B4] rounded-[2px]' : 'bg-white border-stone-200 rounded-2xl'}`} aria-labelledby="lipogram-letter-heading">
        <div className="flex items-center gap-3 mb-5">
          <span className={`w-8 h-8 flex items-center justify-center text-sm font-bold ${isMinimal ? 'bg-[#EDE8DF]' : 'bg-indigo-50'}`}>1</span>
          <div>
            <h3 id="lipogram-letter-heading" className="font-bold text-lg">Elige la letra prohibida</h3>
            <p className="text-xs opacity-60">Puedes escoger una letra o pedir una al azar.</p>
          </div>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-9 md:grid-cols-14 gap-2 mb-4" role="group" aria-label="Selecciona la letra que no puedes utilizar">
          {SPANISH_ALPHABET.map((letter) => (
            <button
              key={letter}
              type="button"
              aria-pressed={selectedLetter === letter}
              aria-label={`Prohibir la letra ${letter}`}
              onClick={() => handleLetterChange(letter)}
              className={`aspect-square min-w-0 font-bold text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${selectedLetter === letter
                ? (isMinimal ? 'bg-[#C1441B] text-white' : 'bg-indigo-600 text-white') + (isMinimal ? ' rounded-[2px]' : ' rounded-lg')
                : buttonBase}`}
            >
              {letter}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-sm">Tu letra prohibida es <strong className={`text-xl mx-1 ${isMinimal ? 'text-[#C1441B]' : 'text-indigo-600'}`}>{selectedLetter}</strong></p>
          <button type="button" onClick={handleRandomLetter} className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider ${buttonBase}`}>
            <Dice5 className="w-4 h-4" /> Elegir al azar
          </button>
        </div>
        <p className="mt-3 text-xs opacity-60">La comprobación no distingue entre mayúsculas y minúsculas. Las vocales con tilde cuentan como la misma letra (por ejemplo, A también detecta á). La Ñ se considera una letra distinta de la N.</p>
      </section>

      <section className={`p-5 md:p-7 border ${isMinimal ? 'bg-white border-[#C8C2B4] rounded-[2px]' : 'bg-white border-stone-200 rounded-2xl'}`} aria-labelledby="lipogram-write-heading">
        <div className="flex items-center gap-3 mb-4">
          <span className={`w-8 h-8 flex items-center justify-center text-sm font-bold ${isMinimal ? 'bg-[#EDE8DF]' : 'bg-indigo-50'}`}>2</span>
          <div>
            <h3 id="lipogram-write-heading" className="font-bold text-lg">Escribe sin esa letra</h3>
            <p className="text-xs opacity-60">Puede ser una historia, una descripción, un poema o lo que te apetezca.</p>
          </div>
        </div>

        <WritingArea
          user={user}
          writingContent={writingContent}
          setWritingContent={handleTextChange}
          pseudonym={pseudonym}
          setPseudonym={setPseudonym}
          onPublish={handlePublish}
          isPublishing={isPublishing}
          publishSuccess={publishSuccess}
          onLogin={onLogin}
          placeholder={`Escribe aquí tu texto. Recuerda: no puedes utilizar la letra ${selectedLetter}...`}
          theme={theme}
          maxWidth="100%"
          textareaLabel={`Tu texto (sin la letra ${selectedLetter})`}
          canPublish={hasValidated && validationPassed && occurrences === 0}
        />

          afterTextarea={
            <div className="mt-2">
              <button
                type="button"
                onClick={handleValidate}
                className={isMinimal ? "w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider bg-[#0F5C52] text-white rounded-[2px] hover:bg-[#0B4A42]" : "w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white rounded-full hover:bg-indigo-700"}
              >
                <ShieldCheck className="w-4 h-4" /> Validar mi texto
              </button>

              {hasValidated && (
                <div className={validationPassed ? "mt-4 p-4 border text-sm border-emerald-200 bg-emerald-50 text-emerald-900" : "mt-4 p-4 border text-sm border-amber-200 bg-amber-50 text-amber-950"} role="status" aria-live="polite">
                  <div className="flex items-start gap-2">
                    {validationPassed ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
                    <div>
                      <p className="font-bold">{validationMessage}</p>
                      {!validationPassed && wordsToFix.length > 0 && (
                        <p className="mt-2 text-xs leading-relaxed">
                          Revisa estas palabras: <strong>{wordsToFix.slice(0, 20).join(", ")}</strong>{wordsToFix.length > 20 ? "…" : ""}
                        </p>
                      )}
                      {validationPassed && <p className="mt-1 text-xs">Ya puedes publicar tu lipograma.</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          }
      </section>
    </div>
  );
};
