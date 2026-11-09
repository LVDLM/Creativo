import React, { useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import { RefreshCw, Sparkles, WandSparkles } from 'lucide-react';
import { WritingArea } from './WritingArea';

type TriggerKind = 'Palabra' | 'Expresión' | 'Interpretación';

interface CreativeTrigger {
  kind: TriggerKind;
  source: string;
  twist: string;
  nudge: string;
}

interface ErrorCreativeLabProps {
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

const TRIGGERS: CreativeTrigger[] = [
  {
    kind: 'Palabra',
    source: 'Murciélago / Murcia-lago',
    twist: 'Un lago escondido aparece cada noche sobre los tejados de Murcia.',
    nudge: '¿Quién lo descubrió y qué criatura vive en sus aguas?'
  },
  {
    kind: 'Palabra',
    source: 'Estatu(a) / estatua',
    twist: 'Una estatua pierde una letra y, con ella, deja de ser de piedra.',
    nudge: '¿Qué puede hacer ahora que antes no podía?'
  },
  {
    kind: 'Palabra',
    source: 'Desconcierto / descon-cierto',
    twist: 'En una ciudad donde todos afinan, alguien organiza el primer desconcierto.',
    nudge: '¿Qué ocurre cuando la música deja de obedecer?'
  },
  {
    kind: 'Expresión',
    source: 'Se me ha ido el santo al cielo',
    twist: 'Un santo se ha escapado al cielo y nadie sabe cómo traerlo de vuelta.',
    nudge: '¿Quién emprende el rescate y qué pide el santo a cambio?'
  },
  {
    kind: 'Expresión',
    source: 'Estar en las nubes',
    twist: 'Una persona descubre que las nubes son edificios habitados.',
    nudge: '¿Qué vecino conoce allí y por qué no quiere bajar?'
  },
  {
    kind: 'Expresión',
    source: 'Tirar la casa por la ventana',
    twist: 'Una casa sale volando por la ventana y aterriza en otro barrio.',
    nudge: '¿A quién encuentra dentro y qué ha dejado atrás?'
  },
  {
    kind: 'Interpretación',
    source: '«Prohibido el paso»',
    twist: 'Un cartel no prohíbe entrar: advierte de que el pasillo está pasando por algún sitio.',
    nudge: '¿Adónde se dirige el pasillo y quién viaja dentro?'
  },
  {
    kind: 'Interpretación',
    source: '«Se alquila habitación con vistas»',
    twist: 'La habitación tiene ojos y observa a quien se aloja en ella.',
    nudge: '¿Qué secreto ha visto y por qué decide contarlo?'
  },
  {
    kind: 'Interpretación',
    source: '«Cuidado con el perro»',
    twist: 'El perro lleva años cuidando de todo el vecindario.',
    nudge: '¿De qué peligro protege a los vecinos?'
  }
];

const KINDS: TriggerKind[] = ['Palabra', 'Expresión', 'Interpretación'];

const randomTrigger = (kind?: TriggerKind): CreativeTrigger => {
  const options = kind ? TRIGGERS.filter((item) => item.kind === kind) : TRIGGERS;
  return options[Math.floor(Math.random() * options.length)];
};

const countWords = (text: string) =>
  text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;

export const ErrorCreativeLab: React.FC<ErrorCreativeLabProps> = ({
  theme,
  user,
  writingContent,
  setWritingContent,
  pseudonym,
  setPseudonym,
  onPublish,
  isPublishing,
  publishSuccess,
  onLogin
}) => {
  const [kind, setKind] = useState<TriggerKind | 'Aleatorio'>('Aleatorio');
  const [trigger, setTrigger] = useState<CreativeTrigger>(() => randomTrigger());
  const [ownTrigger, setOwnTrigger] = useState('');
  const [notice, setNotice] = useState('');
  const isMinimal = theme === 'minimal';
  const wordCount = useMemo(() => countWords(writingContent), [writingContent]);
  const inRange = wordCount >= 80 && wordCount <= 120;

  const surface = isMinimal
    ? 'bg-white border border-[#C8C2B4] rounded-[2px]'
    : theme === 'modern'
      ? 'bg-white border border-indigo-100 rounded-2xl'
      : 'bg-white border border-stone-200 rounded-2xl';
  const muted = isMinimal ? 'text-[#5A4A3A]' : 'opacity-60';
  const buttonBase = isMinimal
    ? 'border border-[#C8C2B4] text-[#1C1510] hover:bg-[#EDE8DF] rounded-[2px]'
    : 'border border-stone-200 rounded-full hover:bg-stone-50';

  const drawAnother = () => {
    setTrigger(randomTrigger(kind === 'Aleatorio' ? undefined : kind));
    setNotice('');
  };

  const useOwnTrigger = () => {
    const value = ownTrigger.trim();
    if (!value) {
      setNotice('Escribe una palabra, expresión o frase para transformarla.');
      return;
    }
    setTrigger({
      kind: 'Interpretación',
      source: value,
      twist: `En este mundo, «${value}» significa algo completamente distinto de lo que todos creen.`,
      nudge: '¿Quién descubre el verdadero significado y qué cambia a partir de entonces?'
    });
    setNotice('Tu error ya tiene una puerta de entrada a la historia.');
  };

  const handlePublish = () => {
    const fullText = [
      `EL ERROR CREATIVO · ${trigger.kind.toUpperCase()}`,
      `Disparador: ${trigger.source}`,
      `Nueva interpretación: ${trigger.twist}`,
      '',
      writingContent.trim()
    ].join('\n');
    onPublish(fullText);
  };

  return (
    <div className={`max-w-4xl mx-auto p-4 md:p-6 ${isMinimal ? 'font-body text-[#1C1510]' : ''}`}>
      <header className="text-center mb-10 md:mb-12">
        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-3 ${isMinimal ? 'text-[#0F5C52]' : 'text-indigo-600'}`}>
          Laboratorio de ideas · 5–10 min
        </p>
        <h2 className={`${isMinimal ? 'font-editorial text-[34px] md:text-[46px] leading-tight' : 'text-4xl md:text-5xl font-bold'} mb-4 ${theme === 'modern' ? 'display text-indigo-600' : ''}`}>
          El error creativo
        </h2>
        <p className={`max-w-2xl mx-auto italic text-sm md:text-base leading-relaxed ${muted}`}>
          Una errata, un malentendido o una lectura disparatada pueden ser el principio de una gran historia.
          Aquí no corregimos el error: lo seguimos.
        </p>
      </header>

      <section className={`${surface} p-5 md:p-7 mb-6`} aria-labelledby="error-step-one">
        <div className="flex items-center gap-3 mb-5">
          <span className={`w-8 h-8 flex items-center justify-center text-sm font-bold ${isMinimal ? 'bg-[#EDE8DF]' : 'bg-indigo-50'}`}>1</span>
          <div>
            <h3 id="error-step-one" className="font-bold text-lg">Provoca el error</h3>
            <p className={`text-xs ${muted}`}>Elige de dónde va a salir la chispa.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-5" role="group" aria-label="Tipo de disparador">
          {(['Aleatorio', ...KINDS] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={kind === option}
              onClick={() => {
                setKind(option);
                setTrigger(randomTrigger(option === 'Aleatorio' ? undefined : option));
                setNotice('');
              }}
              className={`px-4 py-2 text-xs font-bold transition-colors ${kind === option
                ? (isMinimal ? 'bg-[#1C1510] text-white' : 'bg-indigo-600 text-white') + (isMinimal ? ' rounded-[2px]' : ' rounded-full')
                : buttonBase}`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className={`p-5 md:p-6 mb-4 ${isMinimal ? 'bg-[#F7F4EE] border-l-4 border-[#C1441B]' : 'bg-stone-50 border-l-4 border-indigo-400'}`}>
          <p className={`text-[10px] uppercase font-bold tracking-widest mb-2 ${muted}`}>{trigger.kind} · punto de partida</p>
          <p className="font-editorial text-2xl md:text-3xl leading-snug">{trigger.source}</p>
          <div className="mt-5 pt-4 border-t border-black/10">
            <p className={`text-[10px] uppercase font-bold tracking-widest mb-2 ${muted}`}>La interpretación equivocada</p>
            <p className="text-base md:text-lg leading-relaxed">{trigger.twist}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button type="button" onClick={drawAnother} className={`inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${buttonBase}`}>
            <RefreshCw className="w-4 h-4" /> Otro error
          </button>
          <p className={`self-center text-xs italic ${muted}`}>{trigger.nudge}</p>
        </div>
      </section>

      <section className={`${surface} p-5 md:p-7 mb-6`} aria-labelledby="error-step-two">
        <div className="flex items-center gap-3 mb-4">
          <span className={`w-8 h-8 flex items-center justify-center text-sm font-bold ${isMinimal ? 'bg-[#EDE8DF]' : 'bg-indigo-50'}`}>2</span>
          <div>
            <h3 id="error-step-two" className="font-bold text-lg">Trae tu propio error</h3>
            <p className={`text-xs ${muted}`}>Una palabra que se te escapó, una frase oída a medias, un cartel mal leído…</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="sr-only" htmlFor="error-own-trigger">Tu palabra, expresión o interpretación</label>
          <input
            id="error-own-trigger"
            type="text"
            value={ownTrigger}
            onChange={(event) => setOwnTrigger(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') useOwnTrigger(); }}
            maxLength={100}
            placeholder="Ej.: Se venden sueños usados"
            className={`flex-1 min-w-0 px-4 py-3 border focus:ring-2 focus:ring-offset-1 ${isMinimal ? 'border-[#C8C2B4] bg-[#F7F4EE] focus:ring-[#C1441B]' : 'border-stone-200 focus:ring-indigo-400'}`}
          />
          <button type="button" onClick={useOwnTrigger} className={`inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider ${isMinimal ? 'bg-[#0F5C52] text-white rounded-[2px]' : 'bg-indigo-600 text-white rounded-full'}`}>
            <WandSparkles className="w-4 h-4" /> Convertir
          </button>
        </div>
        {notice && <p className="mt-3 text-xs" role="status">{notice}</p>}
      </section>

      <section className={`${surface} p-5 md:p-7`} aria-labelledby="error-step-three">
        <div className="flex items-center gap-3 mb-4">
          <span className={`w-8 h-8 flex items-center justify-center text-sm font-bold ${isMinimal ? 'bg-[#EDE8DF]' : 'bg-indigo-50'}`}>3</span>
          <div>
            <h3 id="error-step-three" className="font-bold text-lg">Sigue el error hasta el final</h3>
            <p className={`text-xs ${muted}`}>Escribe una microhistoria de entre 80 y 120 palabras.</p>
          </div>
        </div>

        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 mb-4 ${isMinimal ? 'bg-[#EDE8DF]' : 'bg-stone-50'}`}>
          <p className="text-sm font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4" /> Tu misión</p>
          <p className="text-xs">{trigger.nudge}</p>
        </div>

        <div className="flex items-center justify-between mb-2">
          <label htmlFor="writing-textarea" className="text-[10px] font-bold uppercase tracking-widest">Tu microhistoria</label>
          <span className={`text-xs font-bold tabular-nums ${inRange ? 'text-[#0F5C52]' : muted}`} aria-live="polite">{wordCount} / 80–120 palabras</span>
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
          placeholder="Todo empezó cuando alguien escribió mal una palabra…"
          theme={theme}
          maxWidth="100%"
        />
        <p className={`mt-3 text-xs italic ${muted}`}>
          No hace falta llegar a la perfección: busca un personaje, un conflicto y un giro. La recomendación es orientativa; puedes publicar tu texto cuando esté listo.
        </p>
      </section>
    </div>
  );
};
