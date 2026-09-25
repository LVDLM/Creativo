import React, { useEffect, useRef } from 'react';
import { X, BookOpen, Info } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Cierra con Escape, mueve el foco al modal al abrir y lo devuelve
  // al elemento que lo abrió al cerrar (patrón de diálogo accesible).
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement;
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md cursor-pointer"
      onClick={handleBackdropClick}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
        className="bg-white border-2 border-black rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[12px_12px_0px_rgba(0,0,0,1)] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <h2 id="help-modal-title" className="text-4xl font-black text-slate-900 tracking-tighter">
              Guía de <span className="text-indigo-600">Vuelo</span>
            </h2>
            <button 
              ref={closeButtonRef}
              onClick={onClose} 
              aria-label="Cerrar guía"
              className="p-2 hover:bg-slate-100 border-2 border-black rounded-xl transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] active:shadow-none"
            >
              <X className="w-6 h-6 text-black" />
            </button>
          </div>

          <div className="space-y-8 text-slate-700 leading-relaxed font-medium">
            <section className="bg-indigo-50 p-6 rounded-3xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3 mb-4">
                <Info className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-black text-slate-900 uppercase">Mecánica</h3>
              </div>
              <p className="text-lg">
                Elige el número de voces, pulsa <span className="font-black text-indigo-600">GIRAR</span> y deja que el azar elija a tus personajes.
              </p>
            </section>

            <section className="bg-yellow-50 p-6 rounded-3xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-6 h-6 text-yellow-600" />
                <h3 className="text-xl font-black text-slate-900 uppercase">¿Qué es un Diálogo?</h3>
              </div>
              <p className="mb-4">
                Es el intercambio directo entre personajes. En el <strong>surrealismo</strong>, lo cotidiano se vuelve fantástico.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-black text-indigo-600 mt-1">—</span>
                  <span>Usa el guion largo para cada intervención.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-black text-indigo-600 mt-1">—</span>
                  <span>No busques la lógica, busca la emoción o el absurdo.</span>
                </li>
              </ul>
            </section>
          </div>

          <button 
            onClick={onClose}
            className="w-full mt-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xl border-2 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all active:shadow-none active:translate-x-1 active:translate-y-1"
          >
            ¡LISTO PARA CREAR!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
