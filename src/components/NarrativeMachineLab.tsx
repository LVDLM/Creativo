import React, { useEffect, useRef, useState } from 'react';
import { User } from 'firebase/auth';
import { Dices, Minus, Plus, RefreshCw } from 'lucide-react';
import { getLabActivityTitleClass } from './labActivityStyles';
import { WritingArea } from './WritingArea';
import {
  ColumnId,
  MACHINE_COLUMNS,
  MachineOption,
  Selection,
  drawAll,
  drawColumns,
  isCompatible,
  randomOption
} from '../data/narrativeMachine';

interface NarrativeMachineLabProps {
  theme: 'modern' | 'organic' | 'minimal';
  user: User | null;
  writingContent: string;
  setWritingContent: (content: string) => void;
  pseudonym: string;
  setPseudonym: (pseudonym: string) => void;
  onPublish: (content: string, summary: string) => void;
  isPublishing: boolean;
  publishSuccess: boolean;
  onLogin: () => void;
}

type Flags = Record<ColumnId, boolean>;

interface ReelState {
  strip: MachineOption[];
  rolling: boolean;
  duration: number;
}

type Reels = Record<ColumnId, ReelState>;

const ROW_H = 132;
const BASE_DURATION = 900;
const STAGGER = 260;
const FILLER_ROWS = 9;

const ALL_IDS = MACHINE_COLUMNS.map((column) => column.id);
const EXTRA_IDS = MACHINE_COLUMNS.filter((column) => column.optional).map((column) => column.id);

const makeFlags = (value: boolean): Flags =>
  Object.fromEntries(ALL_IDS.map((id) => [id, value])) as Flags;

const restingReel = (option: MachineOption): ReelState => ({ strip: [option], rolling: false, duration: 0 });

const makeReels = (selection: Selection): Reels =>
  Object.fromEntries(ALL_IDS.map((id) => [id, restingReel(selection[id])])) as Reels;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const describe = (id: ColumnId, option: MachineOption): string => {
  switch (id) {
    case 'narrador': return `narrador ${option.label.toLowerCase()}`;
    case 'persona': return option.label;
    case 'protagonista': return `protagonista: ${option.label.toLowerCase()}`;
    case 'antagonista': return `antagonista: ${option.label.toLowerCase()}`;
    case 'tiempo': return `tiempo: ${option.label.toLowerCase()}`;
    case 'espacio': return `lugar ${option.label.toLowerCase()}`;
  }
};

export const NarrativeMachineLab: React.FC<NarrativeMachineLabProps> = ({
  theme, user, writingContent, setWritingContent, pseudonym, setPseudonym,
  onPublish, isPublishing, publishSuccess, onLogin
}) => {
  const [selection, setSelection] = useState<Selection>(() => drawAll());
  const [reels, setReels] = useState<Reels>(() => makeReels(selection));
  const [locked, setLocked] = useState<Flags>(() => makeFlags(false));
  const [showExtras, setShowExtras] = useState(false);
  const timersRef = useRef<Partial<Record<ColumnId, number>>>({});

  const isMinimal = theme === 'minimal';
  const isModern = theme === 'modern';

  const visibleColumns = MACHINE_COLUMNS.filter((column) => !column.optional || showExtras);
  // Toda columna visible forma parte de la consigna; «Fijar» solo decide si cambia al girar.
  const activeIds = visibleColumns.map((column) => column.id);
  const rollableIds = activeIds.filter((id) => !locked[id]);
  const isRolling = ALL_IDS.some((id) => reels[id].rolling);

  const summaryParts = activeIds.map((id) => describe(id, selection[id]));
  const unusualCombination =
    activeIds.includes('narrador') &&
    activeIds.includes('persona') &&
    !isCompatible(selection.narrador, selection.persona);

  useEffect(() => () => {
    Object.values(timersRef.current).forEach((timer) => {
      if (timer) window.clearTimeout(timer);
    });
  }, []);

  const setResting = (next: Selection, ids: ColumnId[]) => {
    setReels((prev) => {
      const copy = { ...prev };
      ids.forEach((id) => { copy[id] = restingReel(next[id]); });
      return copy;
    });
  };

  const startRoll = (ids: ColumnId[]) => {
    if (isRolling || ids.length === 0) return;
    const next = drawColumns(selection, ids, activeIds);
    setSelection(next);

    if (prefersReducedMotion()) {
      setResting(next, ids);
      return;
    }

    // Cada carrete es una tira vertical: valor anterior, relleno aleatorio y valor final.
    // Los carretes se detienen de izquierda a derecha, como en una máquina de verdad.
    const ordered = ALL_IDS.filter((id) => ids.includes(id));
    setReels((prev) => {
      const copy = { ...prev };
      ordered.forEach((id, position) => {
        const filler = Array.from({ length: FILLER_ROWS }, () => randomOption(id));
        copy[id] = {
          strip: [selection[id], ...filler, next[id]],
          rolling: true,
          duration: BASE_DURATION + position * STAGGER
        };
      });
      return copy;
    });

    ordered.forEach((id, position) => {
      timersRef.current[id] = window.setTimeout(() => {
        setReels((prev) => ({ ...prev, [id]: restingReel(next[id]) }));
        delete timersRef.current[id];
      }, BASE_DURATION + position * STAGGER + 40);
    });
  };

  const setMode = (id: ColumnId, isLocked: boolean) => {
    setLocked((prev) => ({ ...prev, [id]: isLocked }));
  };

  const toggleExtras = () => {
    if (isRolling) return;
    if (!showExtras) {
      const next = drawColumns(selection, EXTRA_IDS, [...activeIds, ...EXTRA_IDS]);
      setSelection(next);
      setResting(next, EXTRA_IDS);
      setLocked((prev) => ({ ...prev, tiempo: false, espacio: false }));
    }
    setShowExtras((value) => !value);
  };

  const handlePublish = () => {
    if (!writingContent.trim()) return;
    onPublish(writingContent.trim(), summaryParts.join(' · '));
  };

  const textColor = isMinimal ? 'text-[#1C1510]' : isModern ? 'text-indigo-700' : 'text-stone-800';
  const modeButton = (active: boolean) => {
    const shape = isMinimal ? 'rounded-[2px]' : 'rounded-full';
    const state = active
      ? (isMinimal ? 'bg-[#0F5C52] border-[#0F5C52] text-white' : 'bg-indigo-600 border-indigo-600 text-white')
      : (isMinimal ? 'bg-white border-[#C8C2B4] text-[#5A5040] hover:bg-[#EDE8DF]' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50');
    return `flex-1 border px-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5C52] ${shape} ${state}`;
  };

  const renderOption = (option: MachineOption, key: string) => (
    <span
      key={key}
      className="flex w-full shrink-0 flex-col items-center justify-center px-2 text-center"
      style={{ height: ROW_H }}
    >
      {option.tag && (
        <span className="mb-1 text-[10px] uppercase tracking-[0.18em] opacity-50">{option.tag}</span>
      )}
      <span className={`font-editorial font-bold leading-tight text-[clamp(1.15rem,2.3vw,1.6rem)] break-words ${textColor}`}>
        {option.label}
      </span>
      {option.hint && (
        <span className="mt-1 text-[11px] leading-snug italic opacity-60">{option.hint}</span>
      )}
    </span>
  );

  const renderColumn = (id: ColumnId) => {
    const column = MACHINE_COLUMNS.find((item) => item.id === id)!;
    const reel = reels[id];
    const isLocked = locked[id];
    const current = selection[id];

    return (
      <article
        key={id}
        className={`relative min-w-0 border p-3 md:p-4 flex flex-col ${isMinimal ? 'bg-[#F7F4EE] border-[#C8C2B4] rounded-[2px]' : 'bg-stone-50 border-stone-200 rounded-2xl'} ${isLocked ? (isMinimal ? 'border-[#0F5C52]' : 'border-indigo-300') : ''}`}
      >
        <h4 className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] opacity-60">
          {column.title}
        </h4>

        <button
          type="button"
          onClick={() => startRoll([id])}
          disabled={isRolling || isLocked}
          aria-label={`${column.title}: ${describe(id, current)}. ${isLocked ? 'Fijada.' : 'Pulsa para cambiar solo esta condición.'}`}
          className="block w-full overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0F5C52] disabled:cursor-default"
          style={{ height: ROW_H }}
        >
          <span
            className="flex w-full flex-col"
            style={{
              transform: `translate3d(0, -${reel.rolling ? (reel.strip.length - 1) * ROW_H : 0}px, 0)`,
              transition: reel.rolling ? `transform ${reel.duration}ms cubic-bezier(0.16, 1, 0.3, 1)` : 'none'
            }}
            aria-hidden="true"
          >
            {reel.strip.map((option, index) => renderOption(option, `${option.id}-${index}`))}
          </span>
        </button>

        <div role="group" aria-label={`Qué hacer con la condición ${column.title}`} className="mt-3 flex gap-1">
          <button type="button" onClick={() => setMode(id, false)} aria-pressed={!isLocked} className={modeButton(!isLocked)}>
            Sortear
          </button>
          <button type="button" onClick={() => setMode(id, true)} aria-pressed={isLocked} className={modeButton(isLocked)}>
            Fijar
          </button>
        </div>
      </article>
    );
  };

  const core = visibleColumns.filter((column) => !column.optional);
  const extras = visibleColumns.filter((column) => column.optional);

  return (
    <div className={`max-w-5xl mx-auto p-4 md:p-6 ${isMinimal ? 'font-body text-[#1C1510]' : ''}`}>
      <header className="text-center mb-10 md:mb-12">
        <h2 className={`${getLabActivityTitleClass(theme)} mb-4`}>
          La máquina narradora
        </h2>
        <p className={`max-w-2xl mx-auto italic text-sm md:text-base leading-relaxed ${isMinimal ? 'text-[#5A5040]' : 'opacity-60'}`}>
          Deja que la máquina decida cómo se cuenta tu historia: quién narra, desde qué persona y quiénes se enfrentan. Fija lo que te guste y deja que la máquina sortee el resto.
        </p>
      </header>

      <section className={`p-5 md:p-7 border mb-6 ${isMinimal ? 'bg-white border-[#C8C2B4] rounded-[2px]' : 'bg-white border-stone-200 rounded-2xl'}`} aria-labelledby="maquina-heading">
        <div className="flex items-center gap-3 mb-5">
          <span className={`w-8 h-8 flex items-center justify-center text-sm font-bold ${isMinimal ? 'bg-[#EDE8DF]' : 'bg-indigo-50'}`}>1</span>
          <div>
            <h3 id="maquina-heading" className="font-bold text-lg">Tus condiciones</h3>
            <p className="text-[11pt] leading-relaxed opacity-70">Pulsa un carrete para cambiar solo esa condición, o gira la máquina entera.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4" aria-label="Condiciones de la historia">
          {core.map((column) => renderColumn(column.id))}
        </div>

        {extras.length > 0 && (
          <div className="mt-3 md:mt-4 grid grid-cols-2 gap-3 md:gap-4 lg:w-1/2 lg:mx-auto" aria-label="Tiempo y espacio">
            {extras.map((column) => renderColumn(column.id))}
          </div>
        )}

        <p className="sr-only" role="status" aria-live="polite">
          {isRolling ? '' : `Tus condiciones: ${summaryParts.join(', ')}.`}
        </p>

        {unusualCombination && (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950" role="status">
            Combinación poco habitual: un narrador {selection.narrador.label.toLowerCase()} rara vez cuenta en {selection.persona.label.toLowerCase()}. Puedes cambiar un carrete o aceptarlo como reto añadido.
          </p>
        )}

        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <button
              type="button"
              onClick={toggleExtras}
              disabled={isRolling}
              aria-pressed={showExtras}
              className={`inline-flex items-center gap-2 px-4 py-2 text-[11px] font-bold uppercase tracking-wider disabled:opacity-50 ${isMinimal ? 'border border-[#C8C2B4] text-[#1C1510] hover:bg-[#EDE8DF] rounded-[2px]' : 'border border-stone-200 rounded-full hover:bg-stone-50'}`}
            >
              {showExtras ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showExtras ? 'Quitar tiempo y lugar' : 'Añadir tiempo y lugar'}
            </button>
            {rollableIds.length === 0 && (
              <span className="text-[11px] opacity-60">
                Todas las condiciones están fijadas. Pulsa «Sortear» en alguna para volver a girar.
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => startRoll(rollableIds)}
            disabled={isRolling || rollableIds.length === 0}
            className={`shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-50 ${isMinimal ? 'bg-[#0F5C52] text-white rounded-[2px] hover:bg-[#0B4A42]' : 'bg-indigo-600 text-white rounded-full hover:bg-indigo-700'}`}
          >
            {isRolling ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Dices className="w-4 h-4" />}
            {isRolling ? 'La máquina gira…' : 'Girar la máquina'}
          </button>
        </div>
      </section>

      <section className={`p-5 md:p-7 border ${isMinimal ? 'bg-white border-[#C8C2B4] rounded-[2px]' : 'bg-white border-stone-200 rounded-2xl'}`} aria-labelledby="maquina-write-heading">
        <div className="flex items-center gap-3 mb-4">
          <span className={`w-8 h-8 flex items-center justify-center text-sm font-bold ${isMinimal ? 'bg-[#EDE8DF]' : 'bg-indigo-50'}`}>2</span>
          <div>
            <h3 id="maquina-write-heading" className="font-bold text-lg">Escribe tu historia</h3>
            <p className="text-[11pt] leading-relaxed opacity-70">
              Tu consigna: {summaryParts.join(' · ')}.
            </p>
          </div>
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
          placeholder="Empieza a escribir con las condiciones que ha decidido la máquina…"
          theme={theme}
          maxWidth="100%"
          textareaLabel="Tu historia"
          canPublish={writingContent.trim().length > 0}
        />
      </section>

      <p className="mt-5 text-center text-[11px] leading-relaxed opacity-50">
        Las condiciones son una invitación, no un examen: la actividad no comprueba el texto. En cada condición, «Sortear» hace que cambie al girar la máquina y «Fijar» la conserva. Todas las condiciones visibles forman parte de tu consigna.
      </p>
    </div>
  );
};
