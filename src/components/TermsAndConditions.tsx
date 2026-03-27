import React from 'react';
import { motion } from 'motion/react';
import { FileText, ArrowLeft } from 'lucide-react';

interface TermsAndConditionsProps {
  onBack: () => void;
  theme: 'modern' | 'organic' | 'minimal';
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ onBack, theme }) => {
  return (
    <div className={`min-h-screen py-20 px-6 ${theme === 'minimal' ? 'bg-[#F7F4EE]' : ''}`}>
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 mb-12 opacity-40 hover:opacity-100 transition-opacity sans text-sm font-bold uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <header className="mb-16">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${theme === 'modern' ? 'bg-indigo-100 text-indigo-600' : 'bg-stone-200 text-stone-600'}`}>
            <FileText className="w-6 h-6" />
          </div>
          <h1 className={`text-4xl md:text-6xl font-bold mb-4 ${theme === 'modern' ? 'display' : 'font-editorial'}`}>
            Términos y Condiciones
          </h1>
          <p className="opacity-60 italic">Última actualización: 27 de marzo de 2026</p>
        </header>

        <div className={`prose prose-stone max-w-none ${theme === 'modern' ? 'sans' : 'font-body'} leading-relaxed text-lg opacity-80 space-y-8`}>
          <section>
            <h2 className="text-2xl font-bold text-stone-900 mb-4">1. Aceptación de los Términos</h2>
            <p>
              Al acceder y utilizar <strong>Ponte Creativo</strong>, aceptas estar sujeto a estos Términos y Condiciones. Si no estás de acuerdo con alguna parte de estos términos, no podrás utilizar la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-stone-900 mb-4">2. Uso de la Plataforma</h2>
            <p>
              <strong>Ponte Creativo</strong> es un espacio para la expresión literaria y creativa. Te comprometes a utilizar la plataforma de manera responsable y a no publicar contenido que sea ilegal, ofensivo, difamatorio o que infrinja los derechos de terceros.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-stone-900 mb-4">3. Registro y Autenticación</h2>
            <p>
              Para participar en los retos y publicar textos, debes registrarte utilizando tu cuenta de <strong>Google</strong>. Eres responsable de mantener la seguridad de tu cuenta y de todas las actividades que ocurran bajo la misma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-stone-900 mb-4">4. Propiedad Intelectual</h2>
            <p>
              Tú conservas todos los derechos de propiedad intelectual sobre los textos originales que publiques en <strong>Ponte Creativo</strong>. Sin embargo, al publicar contenido en la galería pública, nos otorgas una licencia mundial, no exclusiva y gratuita para mostrar, reproducir y distribuir dicho contenido únicamente dentro de la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-stone-900 mb-4">5. Moderación de Contenidos</h2>
            <p className="bg-stone-100 p-6 rounded-2xl border border-stone-200 italic">
              "El administrador se reserva el derecho de <strong>moderar, editar o eliminar</strong> cualquier contenido que considere inapropiado o que viole estos términos, con el fin de mantener la calidad y el respeto en la comunidad."
            </p>
            <p className="mt-4">
              La moderación se realiza con acceso exclusivo al texto publicado y al nombre de usuario asociado, sin acceso a otros datos personales del autor.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-stone-900 mb-4">6. Limitación de Responsabilidad</h2>
            <p>
              <strong>Ponte Creativo</strong> se proporciona "tal cual" y "según disponibilidad". No garantizamos que la plataforma esté libre de errores o interrupciones. No somos responsables de los daños que puedan derivarse del uso de la plataforma o de la pérdida de datos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-stone-900 mb-4">7. Modificaciones</h2>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Te notificaremos sobre cambios significativos publicando los nuevos términos en esta página.
            </p>
          </section>

          <section className="pt-10 border-t border-stone-200">
            <p className="text-sm opacity-60">
              El uso continuado de la plataforma tras cualquier cambio constituye tu aceptación de los nuevos Términos y Condiciones.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
