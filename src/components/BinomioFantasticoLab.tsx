import React, { useEffect, useMemo, useRef, useState } from 'react';
import { User } from 'firebase/auth';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Dices, ExternalLink, RefreshCw, ShieldCheck, XCircle } from 'lucide-react';
import { WritingArea } from './WritingArea';
import { FANTASTIC_WORDS, FantasticWord } from '../data/fantasticWordBank';

interface BinomioFantasticoLabProps {
  theme: 'modern' | 'organic' | 'minimal';
  user: User | null;
  writingContent: string;
  setWritingContent: (content: string) => void;
  pseudonym: string;
  setPseudonym: (pseudonym: string) => void;
  onPublish: (content: string) => void;
  isPublishing: boolean;
  publishSuccess: boolean;
  onLogin: () => void;
}

type WordPair = [FantasticWord, FantasticWord];

const randomItem = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

const createRandomPair = (): WordPair => {
  const first = randomItem(FANTASTIC_WORDS);
  const second = randomItem(FANTASTIC_WORDS.filter(
    (item) => item.category !== first.category && item.word !== first.word
  ));
  return [first, second];
};

const normalizeToken = (value: string) =>
  value.normalize('NFD')
    .replace(/ñ/g, '\u0001')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0001/g, 'ñ')
    .toLocaleLowerCase('es');

const acceptedForms = (lemma: string) => {
  const normalized = normalizeToken(lemma);
  const plural = normalized.endsWith('z')
    ? normalized.slice(0, -1) + 'ces'
    : /[aeiou]$/.test(normalized)
      ? normalized + 's'
      : normalized + 'es';
  return [normalized, plural];
};

const containsWord = (text: string, lemma: string) => {
  const tokens = (text.match(/[\p{L}\p{M}]+/gu) || []).map(normalizeToken);
  const forms = acceptedForms(lemma);
  return forms.some((form) => tokens.includes(form));
};

export const BinomioFantasticoLab: React.FC<BinomioFantasticoLabProps> = ({
  theme, user, writingContent, setWritingContent, pseudonym, setPseudonym,
  onPublish, isPublishing, publishSuccess, onLogin
}) => {
  const [pair, setPair] = useState<WordPair>(() => createRandomPair());
  const [rollingWords, setRollingWords] = useState<WordPair>(() => pair);
  const [isRolling, setIsRolling] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);
  const [validationPassed, setValidationPassed] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const isMinimal = theme === 'minimal';
  const isModern = theme === 'modern';
  const missingWords = useMemo(
    () => pair.filter((item) => !containsWord(writingContent, item.word)),
    [pair, writingContent]
  );

  const buttonBase = isMinimal
    ? 'border border-[#C8C2B4] text-[#1C1510] hover:bg-[#EDE8DF] rounded-[2px]'
    : 'border border-stone-200 rounded-full hover:bg-stone-50';

  const clearRollTimers = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    intervalRef.current = null;
    timeoutRef.current = null;
  };

  useEffect(() => () => clearRollTimers(), []);

  const invalidateValidation = () => {
    setHasValidated(false);
    setValidationPassed(false);
    setValidationMessage('');
  };

  const handleTextChange = (text: string) => {
    setWritingContent(text);
    invalidateValidation();
  };

  const startRoll = (targetPair: WordPair, changedIndexes: number[]) => {
    if (isRolling) return;
    clearRollTimers();
    invalidateValidation();
    setIsRolling(true);

    const nextRollingWords: WordPair = [...pair];
    intervalRef.current = window.setInterval(() => {
      changedIndexes.forEach((index) => {
        const other = nextRollingWords[1 - index];
        const options = FANTASTIC_WORDS.filter(
          (item) => item.word !== other.word && item.category !== other.category
        );
        nextRollingWords[index] = randomItem(options);
      });
      setRollingWords([...nextRollingWords] as WordPair);
    }, 85);

    timeoutRef.current = window.setTimeout(() => {
      clearRollTimers();
      setPair(targetPair);
      setRollingWords(targetPair);
      setIsRolling(false);
    }, 1050);
  };

  const handleNewPair = () => {
    if (isRolling) return;
    let nextPair = createRandomPair();
    let attempts = 0;
    while (nextPair[0].word === pair[0].word && nextPair[1].word === pair[1].word && attempts < 8) {
      nextPair = createRandomPair();
      attempts += 1;
    }
    startRoll(nextPair, [0, 1]);
  };

  const handleReplaceWord = (index: number) => {
    if (isRolling) return;
    const other = pair[1 - index];
    const options = FANTASTIC_WORDS.filter(
      (item) => item.word !== pair[index].word &&
        item.word !== other.word &&
        item.category !== other.category
    );
    const replacement = randomItem(options);
    const nextPair: WordPair = [...pair];
    nextPair[index] = replacement;
    startRoll(nextPair, [index]);
  };

  const handleValidate = () => {
    if (!writingContent.trim()) {
      setHasValidated(true);
      setValidationPassed(false);
      setValidationMessage('Primero escribe tu historia y después comprueba si has utilizado las dos palabras.');
      return;
    }

    setHasValidated(true);
    if (missingWords.length === 0) {
      setValidationPassed(true);
      setValidationMessage('¡Binomio fantástico completado! Las dos palabras aparecen en tu historia.');
    } else {
      setValidationPassed(false);
      setValidationMessage(
        missingWords.length === 2
          ? 'Todavía no encontramos ninguna de las dos palabras en tu texto.'
          : `Todavía falta incluir «${missingWords[0].word}» en tu historia.`
      );
    }
  };

  const handlePublish = () => {
    if (!hasValidated || !validationPassed || missingWords.length > 0) {
      setValidationPassed(false);
      setValidationMessage('Valida tu historia e incluye las dos palabras antes de publicarla.');
      return;
    }
    onPublish(
      `EL BINOMIO FANTÁSTICO · ${pair[0].word.toLocaleUpperCase('es')} + ${pair[1].word.toLocaleUpperCase('es')}\n\n${writingContent.trim()}`
    );
  };

  const renderWordCard = (item: FantasticWord, index: number) => {
    const displayedWord = isRolling ? rollingWords[index].word : item.word;
    return (
      <article
        key={index}
        className={`relative min-w-0 border p-5 md:p-8 text-center flex flex-col items-center justify-center ${isMinimal ? 'bg-[#F7F4EE] border-[#C8C2B4] rounded-[2px]' : 'bg-stone-50 border-stone-200 rounded-2xl'}`}
      >
        <span className="text-[10px] uppercase tracking-[0.18em] opacity-50 mb-4">
          Palabra {index + 1}
        </span>
        <button
          type="button"
          onClick={() => handleReplaceWord(index)}
          disabled={isRolling}
          aria-label={`Cambiar la palabra ${item.word} por otra aleatoria`}
          className="group min-h-[92px] w-full flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F5C52] disabled:cursor-wait"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={displayedWord}
              initial={{ opacity: 0, rotateX: -75, y: 12, scale: 0.92 }}
              animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, rotateX: 75, y: -12, scale: 0.92 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className={`break-words font-editorial font-bold text-[clamp(1.8rem,5vw,3.2rem)] leading-tight ${isMinimal ? 'text-[#1C1510]' : isModern ? 'text-indigo-700' : 'text-stone-800'}`}
              style={{ transformPerspective: 700 }}
              aria-live="off"
            >
              {displayedWord}
            </motion.span>
          </AnimatePresence>
        </button>
        <a
          href={`https://dle.rae.es/${encodeURIComponent(item.word)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider underline underline-offset-4 opacity-60 hover:opacity-100"
          aria-label={`Consultar ${item.word} en el Diccionario de la lengua española`}
        >
          Consultar en el DLE <ExternalLink className="w-3 h-3" />
        </a>
        <span className="mt-4 text-[10px] opacity-40">
          {isRolling ? 'La ruleta está girando…' : 'Pulsa la palabra para cambiarla'}
        </span>
      </article>
    );
  };

  return (
    <div className={`max-w-4xl mx-auto p-4 md:p-6 ${isMinimal ? 'font-body text-[#1C1510]' : ''}`}>
      <header className="text-center mb-10 md:mb-12">
        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-3 ${isMinimal ? 'text-[#0F5C52]' : 'text-indigo-600'}`}>
          Laboratorio de palabras · 10–15 min
        </p>
        <h2 className={`${isMinimal ? 'font-editorial text-[36px] md:text-[48px] leading-tight' : 'text-4xl md:text-5xl font-bold'} mb-4 ${isModern ? 'display text-indigo-600' : ''}`}>
          El binomio fantástico
        </h2>
        <p className={`max-w-2xl mx-auto italic text-sm md:text-base leading-relaxed ${isMinimal ? 'text-[#5A5040]' : 'opacity-60'}`}>
          Dos palabras que parecen no tener nada en común. Tu misión es encontrar entre ellas una relación inesperada y convertirla en una historia.
        </p>
      </header>

      <section className={`p-5 md:p-7 border mb-6 ${isMinimal ? 'bg-white border-[#C8C2B4] rounded-[2px]' : 'bg-white border-stone-200 rounded-2xl'}`} aria-labelledby="binomio-pair-heading">
        <div className="flex items-center gap-3 mb-5">
          <span className={`w-8 h-8 flex items-center justify-center text-sm font-bold ${isMinimal ? 'bg-[#EDE8DF]' : 'bg-indigo-50'}`}>1</span>
          <div>
            <h3 id="binomio-pair-heading" className="font-bold text-lg">Tu pareja de palabras</h3>
            <p className="text-xs opacity-60">Las dos palabras proceden de lemas seleccionados del Diccionario de la lengua española.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-5" aria-label="Pareja de palabras">
          {renderWordCard(pair[0], 0)}
          {renderWordCard(pair[1], 1)}
        </div>

        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs opacity-60 text-center sm:text-left">
            ¿No te inspira una de ellas? Pulsa esa palabra para cambiar solo esa. También puedes probar con una pareja completamente nueva.
          </p>
          <button
            type="button"
            onClick={handleNewPair}
            disabled={isRolling}
            className={`shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-50 ${isMinimal ? 'bg-[#0F5C52] text-white rounded-[2px] hover:bg-[#0B4A42]' : 'bg-indigo-600 text-white rounded-full hover:bg-indigo-700'}`}
          >
            {isRolling ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Dices className="w-4 h-4" />}
            {isRolling ? 'Buscando pareja…' : 'Generar otra pareja'}
          </button>
        </div>
      </section>

      <section className={`p-5 md:p-7 border ${isMinimal ? 'bg-white border-[#C8C2B4] rounded-[2px]' : 'bg-white border-stone-200 rounded-2xl'}`} aria-labelledby="binomio-write-heading">
        <div className="flex items-center gap-3 mb-4">
          <span className={`w-8 h-8 flex items-center justify-center text-sm font-bold ${isMinimal ? 'bg-[#EDE8DF]' : 'bg-indigo-50'}`}>2</span>
          <div>
            <h3 id="binomio-write-heading" className="font-bold text-lg">Construye tu historia</h3>
            <p className="text-xs opacity-60">No hace falta explicar la relación: deja que las dos palabras provoquen algo inesperado.</p>
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
          placeholder={`¿Qué podría unir a «${pair[0].word}» y «${pair[1].word}»? Empieza a escribir…`}
          theme={theme}
          maxWidth="100%"
          textareaLabel="Tu historia"
          canPublish={hasValidated && validationPassed && missingWords.length === 0}
          afterTextarea={
            <div className="mt-2">
              <button
                type="button"
                onClick={handleValidate}
                className={isMinimal ? "w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider bg-[#0F5C52] text-white rounded-[2px] hover:bg-[#0B4A42]" : "w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider bg-indigo-600 text-white rounded-full hover:bg-indigo-700"}
              >
                <ShieldCheck className="w-4 h-4" /> Validar mi historia
              </button>

              {hasValidated && (
                <div className={validationPassed ? "mt-4 p-4 border text-sm border-emerald-200 bg-emerald-50 text-emerald-900" : "mt-4 p-4 border text-sm border-amber-200 bg-amber-50 text-amber-950"} role="status" aria-live="polite">
                  <div className="flex items-start gap-2">
                    {validationPassed ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
                    <div>
                      <p className="font-bold">{validationMessage}</p>
                      {!validationPassed && missingWords.length > 0 && (
                        <p className="mt-2 text-xs leading-relaxed">
                          Debes incorporar: <strong>{missingWords.map((item) => `«${item.word}»`).join(' y ')}</strong>.
                        </p>
                      )}
                      {validationPassed && <p className="mt-1 text-xs">Ya puedes publicar tu historia.</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          }
        />
      </section>

      <p className="mt-5 text-center text-[11px] leading-relaxed opacity-50">
        El validador acepta la palabra en singular o plural y no distingue mayúsculas, minúsculas ni tildes. Cada enlace abre la entrada correspondiente del DLE.
      </p>
    </div>
  );
};

