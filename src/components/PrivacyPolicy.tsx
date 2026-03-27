import React from 'react';
import { motion } from 'motion/react';
import { Shield, ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
  theme: 'modern' | 'organic' | 'minimal';
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack, theme }) => {
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
            <Shield className="w-6 h-6" />
          </div>
          <h1 className={`text-4xl md:text-6xl font-bold mb-4 ${theme === 'modern' ? 'display' : 'font-editorial'}`}>
            Política de Privacidad
          </h1>
          <p className="opacity-60 italic">Última actualización: 27 de marzo de 2026</p>
        </header>

        <div className={`prose prose-stone max-w-none ${theme === 'modern' ? 'sans' : 'font-body'} leading-relaxed text-lg opacity-80 space-y-8`}>
          <section>
            <h2 className="text-2xl font-bold text-stone-900 mb-4">1. Introducción</h2>
            <p>
              En <strong>Ponte Creativo</strong>, valoramos tu privacidad y nos comprometemos a proteger tus datos personales. Esta política explica cómo manejamos la información cuando utilizas nuestra plataforma de escritura creativa.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-stone-900 mb-4">2. Datos que Recopilamos</h2>
            <p>
              Utilizamos el sistema de autenticación de <strong>Google</strong> para facilitar tu registro y acceso. Al iniciar sesión, recibimos de Google:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Tu nombre completo o nombre de usuario.</li>
              <li>Tu dirección de correo electrónico (utilizada únicamente para la gestión técnica de la cuenta).</li>
              <li>Tu imagen de perfil (opcional, según tu configuración de Google).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-stone-900 mb-4">3. Acceso del Administrador</h2>
            <p className="bg-stone-100 p-6 rounded-2xl border border-stone-200 italic">
              "Es importante destacar que el administrador de esta plataforma <strong>no tiene acceso a tus datos personales privados</strong> (como tu correo electrónico completo o datos de contacto)."
            </p>
            <p className="mt-4">
              El administrador solo puede visualizar:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>El <strong>texto</strong> que decidas publicar en la galería.</li>
              <li>El <strong>nombre de usuario</strong> que se muestra públicamente junto a dicho texto.</li>
            </ul>
            <p className="mt-4">
              Este acceso limitado tiene como único fin la <strong>moderación de contenidos</strong> para asegurar que la comunidad se mantenga como un espacio seguro y creativo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-stone-900 mb-4">4. Uso de la Información</h2>
            <p>
              Utilizamos tu información exclusivamente para:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Permitirte publicar y gestionar tus textos creativos.</li>
              <li>Atribuir correctamente la autoría de las obras que decidas compartir en la galería pública.</li>
              <li>Mantener la seguridad y funcionalidad técnica de la aplicación.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-stone-900 mb-4">5. Compartición de Datos</h2>
            <p>
              <strong>No vendemos, alquilamos ni compartimos</strong> tus datos personales con terceros. Tus textos solo son visibles para otros usuarios si decides publicarlos en la Galería.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-stone-900 mb-4">6. Tus Derechos</h2>
            <p>
              Puedes solicitar la eliminación de tu cuenta y de todos tus textos publicados en cualquier momento. Al ser una aplicación basada en Google Auth, también puedes revocar el acceso a la aplicación directamente desde la configuración de tu cuenta de Google.
            </p>
          </section>

          <section className="pt-10 border-t border-stone-200">
            <p className="text-sm opacity-60">
              Si tienes dudas sobre esta política, puedes contactarnos a través de la plataforma.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
