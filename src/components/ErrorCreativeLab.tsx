import React, { useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import { RefreshCw, Sparkles, WandSparkles } from 'lucide-react';
import { WritingArea } from './WritingArea';
import { getLabActivityTitleClass } from './labActivityStyles';

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
  { kind: 'Palabra', source: '«Murciélago» → «Murcia-lago»', twist: 'En Murcia aparece cada noche un lago suspendido sobre los tejados. Al amanecer desaparece sin dejar una gota.', nudge: '¿Quién lo descubre y qué criatura llega con el agua?' },
  { kind: 'Palabra', source: '«Mariposa» → «mar y posa»', twist: 'Una viajera del mar necesita encontrar un lugar donde posar sus alas antes de que suba la marea.', nudge: '¿Quién le ofrece refugio y qué precio le pide?' },
  { kind: 'Palabra', source: '«Paraguas» → «para aguas»', twist: 'Un objeto misterioso tiene el poder de detener cualquier agua: lluvia, ríos e incluso lágrimas.', nudge: '¿Quién lo utiliza primero y qué consecuencia inesperada provoca?' },
  { kind: 'Palabra', source: '«Desconcierto» → «des-con-cierto»', twist: 'En una ciudad donde todo está ensayado, alguien organiza un concierto en el que nadie sabe qué va a ocurrir.', nudge: '¿Qué instrumento rompe el orden y quién se atreve a seguirlo?' },
  { kind: 'Palabra', source: '«Cartera» → «carta era»', twist: 'Una carta antigua resulta ser una era completa: dentro caben generaciones, cosechas y recuerdos.', nudge: '¿Quién abre la carta y qué época encuentra dentro?' },
  { kind: 'Expresión', source: '«Estar en las nubes»', twist: 'Las nubes son edificios habitados y alguien lleva tanto tiempo viviendo allí que ha olvidado cómo se baja.', nudge: '¿Qué vecino conoce allí y qué le impide regresar?' },
  { kind: 'Expresión', source: '«Meter la pata»', twist: 'Una persona mete literalmente la pata en un lugar donde no debería: al otro lado hay un mundo diminuto.', nudge: '¿Quién vive allí y cómo interpreta esa llegada?' },
  { kind: 'Expresión', source: '«Dar calabazas»', twist: 'En una escuela extraña, las calabazas son premios que se entregan a quien se atreve a decir que no.', nudge: '¿Quién recibe la primera calabaza y por qué se convierte en noticia?' },
  { kind: 'Expresión', source: '«Echar una mano»', twist: 'Una mano se separa de su dueño para ayudar a desconocidos, pero empieza a tomar decisiones por su cuenta.', nudge: '¿A quién ayuda primero y qué quiere a cambio?' },
  { kind: 'Expresión', source: '«Dormirse en los laureles»', twist: 'Los laureles son árboles que susurran a quien duerme bajo ellos y le cuentan futuros posibles.', nudge: '¿Qué futuro escucha el protagonista y qué hace al despertar?' },
  { kind: 'Interpretación', source: '«Se ruega silencio»', twist: 'Silencio es el nombre de una persona a la que todo el pueblo lleva años pidiendo que se arrodille.', nudge: '¿Por qué no se arrodilla y qué ocurre cuando por fin responde?' },
  { kind: 'Interpretación', source: '«Salida de emergencia»', twist: 'La emergencia es una criatura que intenta salir del edificio y cada puerta la conduce a una habitación distinta.', nudge: '¿Quién decide ayudarla y qué sucede si consigue escapar?' },
  { kind: 'Interpretación', source: '«Cuidado con el perro»', twist: 'El perro lleva años cuidando de todo el vecindario; el cartel es una advertencia para quien quiera hacerle daño.', nudge: '¿De qué peligro protege a los vecinos?' },
  { kind: 'Interpretación', source: '«Se busca personal»', twist: 'Personal es el nombre de alguien que ha desaparecido y todos los carteles de la ciudad llevan su retrato.', nudge: '¿Quién lo busca y qué sabe esa persona que nadie más conoce?' },
  { kind: 'Interpretación', source: '«Prohibido el paso»', twist: 'El pasillo no prohíbe que entren: está pasando por algún sitio y no puede detenerse.', nudge: '¿Adónde se dirige el pasillo y quién viaja dentro?' }
];

const KINDS: TriggerKind[] = ['Palabra', 'Expresión', 'Interpretación'];

const randomTrigger = (kind?: TriggerKind, previousSource?: string): CreativeTrigger => {
  const matching = kind ? TRIGGERS.filter((item) => item.kind === kind) : TRIGGERS;
  const alternatives = matching.filter((item) => item.source !== previousSource);
  const options = alternatives.length ? alternatives : matching;
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
  const [ownKind, setOwnKind] = useState<TriggerKind>('Palabra');
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
    setTrigger(randomTrigger(kind === 'Aleatorio' ? undefined : kind, trigger.source));
    setNotice('');
  };

  const useOwnTrigger = () => {
    const value = ownTrigger.trim();
    if (!value) {
      setNotice('Escribe primero tu palabra, expresión o interpretación.');
      return;
    }

    const customPrompt: Record<TriggerKind, { twist: string; nudge: string }> = {
      Palabra: {
        twist: `Imagina que «${value}» se ha escrito, separado o escuchado de otra manera. Acepta esa nueva lectura como si fuera cierta.`,
        nudge: '¿Qué lugar, objeto o criatura nace de esa nueva palabra?'
      },
      Expresión: {
        twist: `Olvida el sentido figurado de «${value}»: en tu historia sucede exactamente lo que dicen sus palabras.`,
        nudge: '¿Quién la toma al pie de la letra y qué consecuencias tiene?'
      },
      Interpretación: {
        twist: `La lectura equivocada de «${value}» es la única explicación posible en este mundo.`,
        nudge: '¿Quién descubre esa explicación y qué cambia a partir de entonces?'
      }
    };

    setKind(ownKind);
    setTrigger({ kind: ownKind, source: value, ...customPrompt[ownKind] });
    setNotice('Tu disparador ya está listo. No lo corrijas: conviértelo en el motor de la historia.');
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
        <h2 className={`${getLabActivityTitleClass(theme)} mb-4`}>
          El error creativo
        </h2>
        <p className={`max-w-2xl mx-auto italic text-sm md:text-base leading-relaxed ${muted}`}>
          Elige una errata, una expresión tomada al pie de la letra o un mensaje mal interpretado.
          No corrijas el error: acepta su nueva lógica y conviértela en una historia breve.
        </p>
      </header>

      <section className={`${surface} p-5 md:p-7 mb-6`} aria-labelledby="error-step-one">
        <div className="flex items-center gap-3 mb-5">
          <span className={`w-8 h-8 flex items-center justify-center text-sm font-bold ${isMinimal ? 'bg-[#EDE8DF]' : 'bg-indigo-50'}`}>1</span>
          <div>
            <h3 id="error-step-one" className="font-bold text-lg">Provoca el error</h3>
            <p className={`text-[11pt] leading-relaxed ${muted}`}>Escoge un disparador al azar o limita el tipo de error. Después, dale una consecuencia narrativa.</p>
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
                setTrigger(randomTrigger(option === 'Aleatorio' ? undefined : option, trigger.source));
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
            <p className={`text-[11pt] leading-relaxed ${muted}`}>Escribe una errata, algo que oíste mal o una frase que interpretaste de otra manera.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-3 mb-3">
          <div className="min-w-0">
            <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest" htmlFor="error-own-kind">Tipo de error</label>
            <select
              id="error-own-kind"
              value={ownKind}
              onChange={(event) => setOwnKind(event.target.value as TriggerKind)}
              className={`w-full px-4 py-3 border text-[11pt] focus:ring-2 focus:ring-offset-1 ${isMinimal ? 'border-[#C8C2B4] bg-[#F7F4EE] focus:ring-[#C1441B]' : 'border-stone-200 bg-white focus:ring-indigo-400'}`}
            >
              {KINDS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div className="min-w-0 sm:col-span-2">
            <label className="sr-only" htmlFor="error-own-trigger">Tu palabra, expresión o interpretación</label>
            <input
              id="error-own-trigger"
              type="text"
              value={ownTrigger}
              onChange={(event) => setOwnTrigger(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter') useOwnTrigger(); }}
              maxLength={140}
              aria-describedby="error-own-help"
              placeholder="Ej.: Se venden sueños usados"
              className={`w-full min-w-0 px-4 py-3 border text-[11pt] focus:ring-2 focus:ring-offset-1 ${isMinimal ? 'border-[#C8C2B4] bg-[#F7F4EE] focus:ring-[#C1441B]' : 'border-stone-200 focus:ring-indigo-400'}`}
            />
            <p id="error-own-help" className={`mt-2 text-xs ${muted}`}>Escribe el error tal como lo has visto, oído o entendido.</p>
          </div>
          <button type="button" onClick={useOwnTrigger} className={`sm:col-span-2 inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider ${isMinimal ? 'bg-[#0F5C52] text-white rounded-[2px]' : 'bg-indigo-600 text-white rounded-full'}`}>
            <WandSparkles className="w-4 h-4" /> Convertir mi error en disparador
          </button>
        </div>
        {notice && <p className="mt-3 text-xs" role="status">{notice}</p>}
      </section>

      <section className={`${surface} p-5 md:p-7`} aria-labelledby="error-step-three">
        <div className="flex items-center gap-3 mb-4">
          <span className={`w-8 h-8 flex items-center justify-center text-sm font-bold ${isMinimal ? 'bg-[#EDE8DF]' : 'bg-indigo-50'}`}>3</span>
          <div>
            <h3 id="error-step-three" className="font-bold text-lg">Sigue el error hasta el final</h3>
            <p className={`text-[11pt] leading-relaxed ${muted}`}>Escribe una microhistoria breve: recomendamos entre 80 y 120 palabras.</p>
          </div>
        </div>

        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 mb-4 ${isMinimal ? 'bg-[#EDE8DF]' : 'bg-stone-50'}`}>
          <p className="text-sm font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4" /> Tu misión</p>
          <p className="text-xs">{trigger.nudge}</p>
        </div>

        <div className="flex items-center justify-between mb-2">
          <label htmlFor="writing-textarea" className="text-[10px] font-bold uppercase tracking-widest">Tu microhistoria</label>
          <span className={`text-xs font-bold tabular-nums ${inRange ? 'text-[#0F5C52]' : muted}`} aria-live="polite">{wordCount} / 80–120 palabras recomendadas</span>
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
          La extensión es orientativa, no un límite. Busca un personaje, un conflicto y un giro; cuando tu historia esté lista, puedes enviarla a moderación.
        </p>
      </section>
    </div>
  );
};
