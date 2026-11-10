import React, { useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import { RefreshCw, Shuffle, Send, CheckCircle2, LogIn } from 'lucide-react';
import { Publication } from '../types';
import { getLabActivityTitleClass } from './labActivityStyles';

type ActivityId = 'diccionariocriaturlogico' | 'emitologias' | 'palabrandoimagenes';
interface NewLaboratoryActivitiesProps {
  activityId: ActivityId;
  theme: 'modern' | 'organic' | 'minimal';
  user: User | null;
  pseudonym: string;
  setPseudonym: (value: string) => void;
  publications: Publication[];
  onPublish: (content: string, metadata: Record<string, unknown>) => Promise<void> | void;
  isPublishing: boolean;
  publishSuccess: boolean;
  onLogin: () => void;
  onBack: () => void;
}

const EMOTIONS = {
  positive: ['Amor', 'Alegría', 'Generosidad', 'Gozo', 'Afecto', 'Compasión', 'Esperanza', 'Gratitud', 'Admiración', 'Entusiasmo'],
  negative: ['Tristeza', 'Melancolía', 'Aburrimiento', 'Angustia', 'Ansiedad', 'Vergüenza', 'Miedo', 'Frustración', 'Soledad', 'Envidia'],
  variable: ['Nostalgia', 'Añoranza', 'Atracción', 'Alarma', 'Asombro', 'Valentía', 'Sorpresa', 'Ternura', 'Deseo', 'Curiosidad']
};
const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

const ACTIVITY_COPY: Record<ActivityId, { title: string; description: string; placeholder: string }> = {
  diccionariocriaturlogico: {
    title: 'Diccionario Criaturlógico',
    description: 'Pon nombre a una criatura inventada y descríbela. Puedes añadir después alguna leyenda si quieres. Las aportaciones aprobadas irán formando un diccionario colectivo.',
    placeholder: 'Primera línea: nombre de la criatura\n\nA continuación: descripción, costumbres, poderes, aspecto… Y, si quieres, la leyenda que se cuenta sobre ella.'
  },
  emitologias: {
    title: 'Emitologías',
    description: 'Elige una palabra y dale una etimología totalmente inventada: imagina su origen, las aventuras que ha vivido y cómo llegó hasta nosotros.',
    placeholder: 'Primera línea: palabra elegida\n\nA continuación: la historia inventada de su origen.'
  },
  palabrandoimagenes: {
    title: 'Palabrando imágenes',
    description: 'Mira la imagen e intenta describir lo que ves. Después, en un segundo párrafo, cuenta cómo lo ves: esa segunda mirada aparecerá en cursiva.',
    placeholder: 'Describe primero lo que ves…\n\nY después, cómo lo ves: qué te sugiere, qué recuerdo despierta o qué historia intuyes…'
  }
};

const normalizeInitial = (value: string) => {
  const first = value.trim().charAt(0).toLocaleUpperCase('es');
  return first === 'Ñ' ? 'Ñ' : first.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export const NewLaboratoryActivities: React.FC<NewLaboratoryActivitiesProps> = ({
  activityId, theme, user, pseudonym, setPseudonym, publications, onPublish,
  isPublishing, publishSuccess, onLogin, onBack
}) => {
  const isMinimal = theme === 'minimal';
  const copy = ACTIVITY_COPY[activityId];
  const [content, setContent] = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [imageSeed, setImageSeed] = useState(() => Math.random().toString(36).slice(2, 11));
  const [emotion, setEmotion] = useState<string | null>(() => {
    const groups = Object.values(EMOTIONS);
    const all = groups.flat();
    return all[Math.floor(Math.random() * all.length)];
  });

  const imageUrl = `https://picsum.photos/seed/ponte-${imageSeed}/1100/700`;
  const isDictionary = activityId !== 'palabrandoimagenes';
  const entryTerm = content.split('\n')[0].trim();
  const storedChallengeId = activityId === 'diccionariocriaturlogico'
    ? 'lab-diccionario-criaturlogico'
    : activityId === 'emitologias' ? 'lab-emitologias' : 'lab-palabrando-imagenes';

  const entries = useMemo(() => publications
    .filter(item => item.challengeId === storedChallengeId && !!item.entryTerm)
    .sort((a, b) => (a.entryTerm || '').localeCompare(b.entryTerm || '', 'es', { sensitivity: 'base' })), [publications, storedChallengeId]);
  const availableLetters = useMemo(() => new Set(entries.map(item => normalizeInitial(item.entryTerm || ''))), [entries]);
  const visibleEntries = entries.filter(item => !activeLetter || normalizeInitial(item.entryTerm || '') === activeLetter);
  const imageExamples = publications
    .filter(item => item.challengeId === storedChallengeId)
    .slice(0, 12);

  const randomEmotion = () => {
    const all = Object.values(EMOTIONS).flat().filter(item => item !== emotion);
    setEmotion(all[Math.floor(Math.random() * all.length)]);
  };

  const handleSubmit = async () => {
    if (!content.trim() || isPublishing) return;
    const metadata = isDictionary
      ? { entryTerm }
      : { imageUrl, emotion: emotion || null };
    setSubmitError('');
    try {
      await onPublish(content.trim(), metadata);
      setContent('');
      if (activityId === 'palabrandoimagenes') setImageSeed(Math.random().toString(36).slice(2, 11));
    } catch {
      setSubmitError('No se ha podido enviar la aportación. Tu texto sigue aquí para que puedas intentarlo de nuevo.');
    }
  };

  const imageDescription = (value: string) => {
    const [description, ...impression] = value.split(/\n\s*\n/);
    return { description, impression: impression.join('\n\n').trim() };
  };

  return (
    <div className={`max-w-5xl mx-auto p-4 md:p-6 ${isMinimal ? 'font-body text-[#1C1510]' : ''}`}>
      <button onClick={onBack} className={`mb-8 flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest ${isMinimal ? 'text-[#5A4A3A] hover:text-[#1C1510]' : 'text-stone-500 hover:text-stone-800'}`}>
        ← Volver al Laboratorio
      </button>

      <header className="text-center mb-10 md:mb-12">
        <h2 className={`${getLabActivityTitleClass(theme)} mb-4`}>{copy.title}</h2>
        <p className={`max-w-3xl mx-auto text-sm md:text-base leading-relaxed ${isMinimal ? 'text-[#5A5040]' : 'opacity-70'}`}>{copy.description}</p>
      </header>

      {activityId === 'palabrandoimagenes' && (
        <section className="mb-8">
          <div className="bg-white border border-[#E8E6E0] p-3 md:p-4">
            <img src={imageUrl} alt="Imagen aleatoria para inspirar la escritura" className="w-full max-h-[520px] object-cover" />
            <div className="flex flex-wrap items-center justify-between gap-3 p-2">
              <span className="text-[10px] uppercase tracking-widest text-[#8A8070]">Imagen aleatoria · Picsum Photos</span>
              <button type="button" onClick={() => setImageSeed(Math.random().toString(36).slice(2, 11))} className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#0F5C52] hover:underline">
                <RefreshCw className="w-3.5 h-3.5" /> Cambiar imagen
              </button>
            </div>
          </div>

          <div className="mt-5 p-5 bg-white border border-[#E8E6E0]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#5A4A3A]">Emoción (opcional)</p>
                <p className="mt-1 font-editorial text-xl">{emotion || 'Sin emoción'}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={randomEmotion} className="inline-flex items-center gap-2 px-3 py-2 border border-[#C8C2B4] text-[10px] font-bold uppercase tracking-widest hover:bg-[#F7F4EE]">
                  <Shuffle className="w-3.5 h-3.5" /> Otra emoción
                </button>
                <button type="button" onClick={() => setEmotion(null)} className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#8A8070] hover:text-[#1C1510]">
                  {emotion ? 'Quitar' : 'Sin emoción'}
                </button>
              </div>
            </div>
            <p className="mt-3 text-[10px] text-[#8A8070]">Puedes conservarla, cambiarla o escribir sin una emoción sugerida.</p>
          </div>
        </section>
      )}

      <section className="mt-8">
        <div className="space-y-4">
          <div>
            <label htmlFor={`${activityId}-author`} className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-[#5A4A3A]">
              {user ? 'Publicar como (seudónimo opcional)' : 'Nombre o seudónimo (opcional)'}
            </label>
            <input id={`${activityId}-author`} value={pseudonym} onChange={event => setPseudonym(event.target.value)} maxLength={80} placeholder={user?.displayName || 'Invitado'} className="w-full p-3 border border-[#C8C2B4] bg-white text-sm focus:outline-none focus:border-[#1C1510]" />
          </div>
          <div>
            <label htmlFor={`${activityId}-content`} className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-[#5A4A3A]">
              {activityId === 'diccionariocriaturlogico' ? 'Nombre y descripción de la criatura' : activityId === 'emitologias' ? 'Palabra y etimología inventada' : 'Tu mirada sobre la imagen'}
            </label>
            <textarea id={`${activityId}-content`} value={content} onChange={event => setContent(event.target.value)} rows={10} maxLength={5000} placeholder={copy.placeholder} className="w-full p-6 border border-[#C8C2B4] bg-white font-editorial text-[16px] leading-[1.8] resize-y focus:outline-none focus:border-[#1C1510]" />
            <div className="flex justify-between mt-1 text-[10px] text-[#8F8E88]">
              <span>{isDictionary ? 'La primera línea será el nombre que aparecerá en el índice alfabético.' : 'Separa en dos párrafos la descripción y tu interpretación.'}</span>
              <span>{content.length}/5000</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {!user && <button type="button" onClick={onLogin} className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#5A4A3A] hover:underline"><LogIn className="w-4 h-4" /> Iniciar sesión o crear cuenta</button>}
            <button type="button" onClick={handleSubmit} disabled={!content.trim() || (isDictionary && (!entryTerm || entryTerm.length > 119)) || isPublishing} className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-[#1C1510] text-[#F7F4EE] text-[11px] font-bold uppercase tracking-widest disabled:opacity-40 sm:ml-auto">
              {publishSuccess ? <><CheckCircle2 className="w-4 h-4" /> Enviado</> : <><Send className="w-4 h-4" /> {isPublishing ? 'Enviando…' : 'Enviar aportación'}</>}
            </button>
          </div>
          {submitError && <p role="alert" className="text-sm text-red-700">{submitError}</p>}
          {!user && <p className="text-[10px] text-center text-[#8A8070]">Las aportaciones de invitados pasan por moderación antes de aparecer en el diccionario o la galería.</p>}
        </div>
      </section>

      {isDictionary ? (
        <section className="mt-14 pt-8 border-t border-[#C8C2B4]">
          <div className="mb-6">
            <h3 className="font-editorial text-2xl mb-2">{activityId === 'diccionariocriaturlogico' ? 'Diccionario de criaturas' : 'Diccionario de emitologías'}</h3>
            <p className="text-sm text-[#6B6258]">Consulta las aportaciones aprobadas por su letra inicial.</p>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-7" aria-label="Índice alfabético">
            {ALPHABET.map(letter => {
              const enabled = availableLetters.has(letter);
              return <button key={letter} type="button" disabled={!enabled} onClick={() => setActiveLetter(activeLetter === letter ? null : letter)} aria-pressed={activeLetter === letter} className={`w-9 h-9 border text-xs font-bold transition-colors ${activeLetter === letter ? 'bg-[#1C1510] text-white border-[#1C1510]' : enabled ? 'bg-white border-[#C8C2B4] text-[#1C1510] hover:bg-[#EDE8DF]' : 'bg-[#F1EEE8] border-[#E8E6E0] text-[#C8C2B4] cursor-not-allowed'}`}>{letter}</button>;
            })}
            {activeLetter && <button type="button" onClick={() => setActiveLetter(null)} className="ml-2 px-3 text-[10px] uppercase tracking-widest text-[#5A4A3A] underline">Todas</button>}
          </div>
          {visibleEntries.length ? (
            <div className="space-y-4">
              {visibleEntries.map(item => (
                <article key={item.id} className="bg-white border border-[#E8E6E0] p-5 md:p-6">
                  <h4 className="font-editorial text-xl font-bold mb-2">{item.entryTerm}</h4>
                  <p className="text-sm leading-[1.8] whitespace-pre-wrap">{item.content.split('\n').slice(1).join('\n').trim() || item.content}</p>
                  <p className="mt-4 text-[10px] uppercase tracking-widest text-[#8A8070]">— {item.authorName || 'Invitado'}</p>
                </article>
              ))}
            </div>
          ) : <p className="text-sm text-[#8A8070] italic">{entries.length ? 'No hay entradas con esa inicial.' : 'El diccionario todavía no tiene entradas aprobadas.'}</p>}
        </section>
      ) : (
        <section className="mt-14 pt-8 border-t border-[#C8C2B4]">
          <h3 className="font-editorial text-2xl mb-6">Otras miradas de la comunidad</h3>
          {imageExamples.length ? <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {imageExamples.map(item => {
              const parts = imageDescription(item.content);
              return <article key={item.id} className="bg-white border border-[#E8E6E0] p-4">
                {item.imageUrl && <img src={item.imageUrl} alt="Imagen de la aportación" className="w-full aspect-[16/9] object-cover mb-4" />}
                {item.emotion && <p className="text-[10px] uppercase tracking-widest text-[#0F5C52] font-bold mb-2">Emoción: {item.emotion}</p>}
                <p className="text-sm leading-[1.8] whitespace-pre-wrap">{parts.description}</p>
                {parts.impression && <p className="mt-3 text-sm leading-[1.8] italic whitespace-pre-wrap">{parts.impression}</p>}
                <p className="mt-4 text-[10px] uppercase tracking-widest text-[#8A8070]">— {item.authorName || 'Invitado'}</p>
              </article>;
            })}
          </div> : <p className="text-sm text-[#8A8070] italic">Todavía no hay aportaciones publicadas.</p>}
        </section>
      )}
    </div>
  );
};
