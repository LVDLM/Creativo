import React, { useEffect, useMemo, useState } from 'react';
import { getLabActivityTitleClass } from './labActivityStyles';
import { User } from 'firebase/auth';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { ArrowRight, Lightbulb, RefreshCw, Send } from 'lucide-react';
import { db } from '../firebase';
import { STARTER_HYPOTHESES } from '../data/fantasticHypotheses';

interface HipotesisFantasticaLabProps {
  theme: 'modern' | 'organic' | 'minimal';
  user: User | null;
  pseudonym: string;
  setPseudonym: (value: string) => void;
  onPublishStory: (content: string, hypothesis: string) => void;
  onSubmitHypothesis: (hypothesis: string) => void;
  isPublishing: boolean;
  publishSuccess: boolean;
  onLogin: () => void;
}

interface ApprovedHypothesis {
  id: string;
  content: string;
}

export const HipotesisFantasticaLab: React.FC<HipotesisFantasticaLabProps> = ({
  theme, user, pseudonym, setPseudonym, onPublishStory, onSubmitHypothesis,
  isPublishing, publishSuccess
}) => {
  const [section, setSection] = useState<'answer' | 'propose'>('answer');
  const [approvedHypotheses, setApprovedHypotheses] = useState<ApprovedHypothesis[]>([]);
  const [selectedHypothesis, setSelectedHypothesis] = useState('');
  const [story, setStory] = useState('');
  const [proposal, setProposal] = useState('');
  const [notice, setNotice] = useState('');
  const isMinimal = theme === 'minimal';
  const bank = useMemo(() => {
    const merged = [...STARTER_HYPOTHESES, ...approvedHypotheses.map(item => item.content)];
    return Array.from(new Set(merged.map(item => item.trim()).filter(Boolean)));
  }, [approvedHypotheses]);

  useEffect(() => {
    const approvedQuery = query(collection(db, 'hypotheses'), where('status', '==', 'approved'));
    return onSnapshot(approvedQuery, snapshot => {
      setApprovedHypotheses(snapshot.docs.map(item => ({
        id: item.id,
        content: item.data().content as string
      })));
    }, error => {
      console.error('Hypotheses subscription error:', error);
    });
  }, []);

  useEffect(() => {
    if (!selectedHypothesis && bank.length) {
      setSelectedHypothesis(bank[Math.floor(Math.random() * bank.length)]);
    }
  }, [bank, selectedHypothesis]);

  const chooseAnother = () => {
    const alternatives = bank.filter(item => item !== selectedHypothesis);
    if (alternatives.length) {
      setSelectedHypothesis(alternatives[Math.floor(Math.random() * alternatives.length)]);
      setNotice('');
    }
  };

  const handleStorySubmit = () => {
    if (!story.trim() || !selectedHypothesis || isPublishing) return;
    onPublishStory(story.trim(), selectedHypothesis);
  };

  const handleProposalSubmit = () => {
    const cleanProposal = proposal.trim();
    if (!cleanProposal || cleanProposal.length > 280 || isPublishing) return;
    onSubmitHypothesis(cleanProposal);
  };

  const sectionButton = (value: 'answer' | 'propose', label: string) => (
    <button
      type="button"
      onClick={() => { setSection(value); setNotice(''); }}
      className={`flex-1 px-4 py-3 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-colors ${section === value ? 'border-[#0F5C52] text-[#0F5C52]' : 'border-transparent text-[#8F8E88] hover:text-[#1C1510]'}`}
      aria-pressed={section === value}
    >
      {label}
    </button>
  );

  return (
    <div className={`max-w-4xl mx-auto p-4 md:p-6 ${isMinimal ? 'font-body text-[#1C1510]' : ''}`}>
      <header className="text-center mb-10 md:mb-12">
        <h2 className={`${getLabActivityTitleClass(theme)} mb-4`}>
          La hipótesis fantástica
        </h2>
        <p className={`max-w-2xl mx-auto italic text-sm md:text-base leading-relaxed ${isMinimal ? 'text-[#5A5040]' : 'opacity-60'}`}>
          Una pregunta basta para abrir una puerta. Explora una hipótesis, conviértela en relato o añade una nueva al repertorio colectivo.
        </p>
      </header>

      <section className={`bg-white border mb-6 ${isMinimal ? 'border-[#C8C2B4] rounded-[2px]' : 'border-stone-200 rounded-2xl'}`}>
        <div className="flex border-b border-[#E8E6E0]" role="tablist" aria-label="Modalidad de la actividad">
          {sectionButton('answer', 'Responder una hipótesis')}
          {sectionButton('propose', 'Proponer una hipótesis')}
        </div>

        {section === 'answer' ? (
          <div className="p-5 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-8 h-8 flex items-center justify-center bg-[#EDE8DF] text-[#1C1510]"><Lightbulb className="w-4 h-4" /></span>
              <div>
                <h3 className="font-bold text-lg">¿Qué pasaría si…?</h3>
                <p className="text-sm text-[#6B6258]">Elige una pregunta y deja que tu imaginación haga el resto.</p>
              </div>
            </div>

            <div className="bg-[#F7F4EE] border border-[#E8E6E0] p-6 md:p-8 text-center">
              <p className="font-editorial text-[21px] md:text-[27px] leading-relaxed text-[#1C1510]">{selectedHypothesis || 'Preparando una pregunta…'}</p>
              <button type="button" onClick={chooseAnother} className="mt-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#0F5C52] hover:underline" disabled={bank.length < 2}>
                <RefreshCw className="w-3.5 h-3.5" /> Otra hipótesis
              </button>
            </div>

            <label className="block mt-6 mb-2 text-[10px] font-bold uppercase tracking-widest text-[#5A4A3A]" htmlFor="fantastic-story">Tu historia</label>
            <textarea
              id="fantastic-story"
              value={story}
              onChange={event => setStory(event.target.value)}
              rows={8}
              maxLength={5000}
              placeholder="Imagina las consecuencias. ¿A quién afectaría? ¿Qué cambiaría? ¿Y qué ocurriría después?"
              className="w-full p-4 border border-[#C8C2B4] bg-white font-editorial text-[15px] leading-[1.7] resize-y focus:outline-none focus:border-[#0F5C52]"
            />
            <div className="flex justify-between text-[10px] text-[#8F8E88] mt-1">
              <span>La pregunta acompañará a tu texto en la galería.</span>
              <span>{story.length}/5000</span>
            </div>
            <label className="block mt-5 mb-2 text-[10px] font-bold uppercase tracking-widest text-[#5A4A3A]" htmlFor="fantastic-story-author">Firma o seudónimo</label>
            <input
              id="fantastic-story-author"
              value={pseudonym}
              onChange={event => setPseudonym(event.target.value)}
              maxLength={80}
              placeholder={user?.displayName || 'Invitado'}
              className="w-full p-3 border border-[#C8C2B4] bg-white text-sm focus:outline-none focus:border-[#0F5C52]"
            />
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs leading-relaxed text-[#6B6258]">Tu texto quedará pendiente de revisión antes de aparecer en la galería.</p>
              <button type="button" onClick={handleStorySubmit} disabled={!story.trim() || isPublishing} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0F5C52] text-white text-[10px] font-bold uppercase tracking-widest disabled:opacity-40 hover:bg-[#0B4A42]">
                <Send className="w-4 h-4" /> Enviar historia
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-8 h-8 flex items-center justify-center bg-[#EDE8DF] text-[#1C1510]"><Lightbulb className="w-4 h-4" /></span>
              <div>
                <h3 className="font-bold text-lg">Añade una pregunta al banco</h3>
                <p className="text-sm text-[#6B6258]">Una buena hipótesis invita a imaginar, no a responder sí o no.</p>
              </div>
            </div>
            <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-[#5A4A3A]" htmlFor="fantastic-hypothesis">Tu hipótesis</label>
            <textarea
              id="fantastic-hypothesis"
              value={proposal}
              onChange={event => setProposal(event.target.value)}
              rows={4}
              maxLength={280}
              placeholder="¿Qué pasaría si…?"
              className="w-full p-4 border border-[#C8C2B4] bg-white font-editorial text-[18px] leading-relaxed resize-y focus:outline-none focus:border-[#0F5C52]"
            />
            <div className="flex justify-between text-[10px] text-[#8F8E88] mt-1">
              <span>Debe ser una pregunta original y comprensible.</span>
              <span>{proposal.length}/280</span>
            </div>
            <label className="block mt-5 mb-2 text-[10px] font-bold uppercase tracking-widest text-[#5A4A3A]" htmlFor="fantastic-proposal-author">Firma o seudónimo</label>
            <input
              id="fantastic-proposal-author"
              value={pseudonym}
              onChange={event => setPseudonym(event.target.value)}
              maxLength={80}
              placeholder={user?.displayName || 'Invitado'}
              className="w-full p-3 border border-[#C8C2B4] bg-white text-sm focus:outline-none focus:border-[#0F5C52]"
            />
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs leading-relaxed text-[#6B6258]">Si se aprueba, la pregunta se incorporará al banco para futuras actividades.</p>
              <button type="button" onClick={handleProposalSubmit} disabled={!proposal.trim() || proposal.trim().length > 280 || isPublishing} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0F5C52] text-white text-[10px] font-bold uppercase tracking-widest disabled:opacity-40 hover:bg-[#0B4A42]">
                <ArrowRight className="w-4 h-4" /> Enviar hipótesis
              </button>
            </div>
          </div>
        )}
      </section>

      {publishSuccess && (
        <p role="status" className="mt-4 p-4 border border-emerald-200 bg-emerald-50 text-emerald-900 text-sm">
          Envío recibido. Gracias por contribuir al laboratorio.
        </p>
      )}
      {notice && <p role="status" className="mt-4 text-sm text-[#6B6258]">{notice}</p>}
      <p className="text-center text-[11px] leading-relaxed text-[#8F8E88]">
        Todas las historias y propuestas pasan por moderación. Las preguntas aprobadas alimentan el banco común; las historias aprobadas se publican en la galería.
      </p>
    </div>
  );
};
