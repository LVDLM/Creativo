import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Send, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface ContactFormProps {
  onBack: () => void;
  theme: 'modern' | 'organic' | 'minimal';
  user: User | null;
}

const ContactForm: React.FC<ContactFormProps> = ({ onBack, theme, user }) => {
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      // 1. Save to Firestore as backup/record
      await addDoc(collection(db, 'contact_messages'), {
        ...formData,
        createdAt: serverTimestamp()
      });

      // 2. Call server-side API to send email
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setFormData({ ...formData, subject: '', message: '' });
      } else {
        // Even if email fails, if Firestore succeeded, we could consider it a partial success
        // but for now let's show the error from the API
        setStatus('error');
        setErrorMessage(data.error || 'Error al enviar el mensaje por email.');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setStatus('error');
      setErrorMessage('Error de conexión. Inténtalo de nuevo.');
    }
  };

  return (
    <div className={`min-h-screen py-20 px-6 ${theme === 'minimal' ? 'bg-[#F7F4EE]' : ''}`}>
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 mb-12 opacity-40 hover:opacity-100 transition-opacity sans text-sm font-bold uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <header className="mb-12">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${theme === 'modern' ? 'bg-indigo-100 text-indigo-600' : 'bg-stone-200 text-stone-600'}`}>
            <Mail className="w-6 h-6" />
          </div>
          <h1 className={`text-4xl md:text-6xl font-bold mb-4 ${theme === 'modern' ? 'display' : 'font-editorial'}`}>
            Contacto
          </h1>
          <p className="opacity-60 italic text-lg">
            ¿Tienes alguna duda, sugerencia o simplemente quieres saludar? Estamos aquí para escucharte.
          </p>
        </header>

        {status === 'success' ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-10 rounded-3xl text-center border ${theme === 'modern' ? 'bg-indigo-50 border-indigo-100' : 'bg-stone-100 border-stone-200'}`}
          >
            <CheckCircle2 className={`w-16 h-16 mx-auto mb-6 ${theme === 'modern' ? 'text-indigo-600' : 'text-stone-700'}`} />
            <h2 className={`text-2xl font-bold mb-4 ${theme === 'modern' ? 'display' : 'font-editorial'}`}>¡Mensaje Enviado!</h2>
            <p className="opacity-60 mb-8">Gracias por contactar con Ponte Creativo. Te responderemos lo antes posible.</p>
            <button 
              onClick={() => setStatus('idle')}
              className={`${theme === 'minimal' ? 'bg-[#1C1510] text-[#F7F4EE] px-8 py-3 rounded-[2px] font-bold text-[12px] tracking-[0.06em]' : 'olive-button'}`}
            >
              Enviar otro mensaje
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-40 sans">Nombre</label>
                <input 
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full p-4 rounded-xl border focus:outline-none transition-all ${theme === 'minimal' ? 'bg-white border-[#C8C2B4] rounded-[2px] focus:border-[#1C1510]' : 'bg-stone-50 border-stone-200 focus:ring-2 focus:ring-stone-200'}`}
                  placeholder="Tu nombre"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest opacity-40 sans">Email</label>
                <input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full p-4 rounded-xl border focus:outline-none transition-all ${theme === 'minimal' ? 'bg-white border-[#C8C2B4] rounded-[2px] focus:border-[#1C1510]' : 'bg-stone-50 border-stone-200 focus:ring-2 focus:ring-stone-200'}`}
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-40 sans">Asunto</label>
              <input 
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className={`w-full p-4 rounded-xl border focus:outline-none transition-all ${theme === 'minimal' ? 'bg-white border-[#C8C2B4] rounded-[2px] focus:border-[#1C1510]' : 'bg-stone-50 border-stone-200 focus:ring-2 focus:ring-stone-200'}`}
                placeholder="¿De qué trata tu mensaje?"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-40 sans">Mensaje</label>
              <textarea 
                required
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className={`w-full p-4 rounded-xl border focus:outline-none transition-all resize-none ${theme === 'minimal' ? 'bg-white border-[#C8C2B4] rounded-[2px] focus:border-[#1C1510]' : 'bg-stone-50 border-stone-200 focus:ring-2 focus:ring-stone-200'}`}
                placeholder="Escribe aquí tu mensaje..."
              />
            </div>

            {status === 'error' && (
              <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errorMessage}
              </div>
            )}

            <button 
              type="submit"
              disabled={status === 'sending'}
              className={`w-full flex items-center justify-center gap-2 py-4 font-bold transition-all ${status === 'sending' ? 'opacity-50 cursor-not-allowed' : ''} ${theme === 'minimal' ? 'bg-[#1C1510] text-[#F7F4EE] rounded-[2px] hover:bg-black' : 'olive-button'}`}
            >
              {status === 'sending' ? (
                <>Enviando...</>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Enviar Mensaje
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-16 pt-8 border-t border-stone-200 text-center">
          <p className="text-sm opacity-40 italic">
            Tu dirección de correo solo se utilizará para responderte y no se compartirá con terceros.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
