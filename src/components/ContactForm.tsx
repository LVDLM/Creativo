import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Send, CheckCircle2, AlertCircle, ArrowLeft, Lightbulb, MessageCircle } from 'lucide-react';
import { User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface ContactFormProps {
  onBack: () => void;
  theme: 'modern' | 'organic' | 'minimal';
  user: User | null;
  initialType?: 'suggestion' | 'contact';
}

const ContactForm: React.FC<ContactFormProps> = ({ onBack, theme, user, initialType = 'contact' }) => {
  const [messageType, setMessageType] = useState<'suggestion' | 'contact'>(initialType);
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const isMinimal = theme === 'minimal';
  const fieldClass = `w-full p-4 border focus:outline-none transition-all ${isMinimal ? 'bg-white border-[#C8C2B4] rounded-[2px] focus:border-[#1C1510]' : 'bg-stone-50 border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-200'}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      if (messageType === 'suggestion') {
        await addDoc(collection(db, 'suggestions'), {
          content: formData.message.trim(),
          authorName: user?.displayName || 'Invitado',
          authorId: user?.uid || 'guest',
          authorEmail: user?.email || null,
          createdAt: serverTimestamp(),
          isStarred: false
        });
      } else {
        await addDoc(collection(db, 'contact_messages'), {
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          isRead: false,
          createdAt: serverTimestamp()
        });
      }
      setStatus('success');
      setFormData(current => ({ ...current, subject: '', message: '' }));
    } catch (error) {
      console.error('Error submitting Ponte Creativo form:', error);
      setStatus('error');
      setErrorMessage('No se ha podido enviar. Comprueba la conexión e inténtalo de nuevo.');
    }
  };

  const heading = messageType === 'suggestion' ? 'Comparte tu idea' : 'Contacto privado';
  const description = messageType === 'suggestion'
    ? 'Cuéntanos qué actividad, juego, reto o herramienta te gustaría encontrar en Ponte Creativo.'
    : 'Este mensaje llegará únicamente al buzón privado de administración. No se publicará en la galería ni en las sugerencias.';

  return (
    <div className="min-h-screen py-20 px-6 bg-[var(--bg)] text-[var(--ink)]">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 mb-12 opacity-50 hover:opacity-100 transition-opacity sans text-sm font-bold uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>

        <header className="mb-10">
          <div className={`w-12 h-12 flex items-center justify-center mb-6 ${isMinimal ? 'bg-[#EDE8DF] text-[#5A4A3A] rounded-[2px]' : 'bg-stone-200 text-stone-600 rounded-2xl'}`}>
            {messageType === 'suggestion' ? <Lightbulb className="w-6 h-6" /> : <Mail className="w-6 h-6" />}
          </div>
          <h1 className={`text-4xl md:text-6xl font-bold mb-4 ${theme === 'modern' ? 'display' : 'font-editorial'}`}>Ideas y contacto</h1>
          <p className="opacity-60 italic text-lg">{description}</p>
        </header>

        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 mb-8 ${isMinimal ? 'bg-[#EDE8DF]' : 'bg-stone-100'}`}>
          <button type="button" onClick={() => { setMessageType('suggestion'); setStatus('idle'); }} className={`flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${messageType === 'suggestion' ? (isMinimal ? 'bg-white text-[#1C1510] shadow-sm' : 'bg-white text-stone-900 shadow-sm') : 'opacity-55'}`}>
            <Lightbulb className="w-4 h-4" /> Sugerencia
          </button>
          <button type="button" onClick={() => { setMessageType('contact'); setStatus('idle'); }} className={`flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${messageType === 'contact' ? (isMinimal ? 'bg-white text-[#1C1510] shadow-sm' : 'bg-white text-stone-900 shadow-sm') : 'opacity-55'}`}>
            <MessageCircle className="w-4 h-4" /> Contacto privado
          </button>
        </div>

        {status === 'success' ? (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className={`p-10 text-center border ${isMinimal ? 'bg-white border-[#E8E6E0] rounded-[2px]' : 'bg-stone-100 border-stone-200 rounded-3xl'}`}>
            <CheckCircle2 className="w-14 h-14 mx-auto mb-5 text-emerald-600" />
            <h2 className={`text-2xl font-bold mb-3 ${theme === 'modern' ? 'display' : 'font-editorial'}`}>{messageType === 'suggestion' ? '¡Idea recibida!' : '¡Mensaje recibido!'}</h2>
            <p className="opacity-65 mb-7">{messageType === 'suggestion' ? 'Gracias por aportar ideas. Tu propuesta se ha guardado en la bandeja de sugerencias para que podamos revisarla.' : 'Gracias por escribirnos. Tu mensaje se ha guardado en el buzón privado de administración.'}</p>
            <button onClick={() => setStatus('idle')} className={`${isMinimal ? 'bg-[#1C1510] text-[#F7F4EE] px-8 py-3 rounded-[2px] font-bold text-xs tracking-wider' : 'olive-button'}`}>Enviar otro</button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {messageType === 'contact' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="contact-name" className="text-xs font-bold uppercase tracking-widest opacity-50 sans">Nombre</label>
                    <input id="contact-name" type="text" required maxLength={100} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={fieldClass} placeholder="Tu nombre" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact-email" className="text-xs font-bold uppercase tracking-widest opacity-50 sans">Correo electrónico</label>
                    <input id="contact-email" type="email" required maxLength={200} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={fieldClass} placeholder="tu@email.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="contact-subject" className="text-xs font-bold uppercase tracking-widest opacity-50 sans">Asunto</label>
                  <input id="contact-subject" type="text" required maxLength={200} value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} className={fieldClass} placeholder="¿De qué trata tu mensaje?" />
                </div>
              </>
            )}

            <div className="space-y-2">
              <label htmlFor="contact-message" className="text-xs font-bold uppercase tracking-widest opacity-50 sans">{messageType === 'suggestion' ? 'Tu propuesta' : 'Mensaje'}</label>
              <textarea id="contact-message" required maxLength={5000} rows={6} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} className={`${fieldClass} resize-y`} placeholder={messageType === 'suggestion' ? 'Describe tu idea para una actividad, juego o herramienta...' : 'Escribe aquí tu mensaje...'} />
            </div>

            {messageType === 'suggestion' && (
              <p className="text-xs opacity-55">Enviando como {user ? (user.displayName || user.email) : 'Invitado'}. La propuesta será visible únicamente en el panel de administración hasta que decidas qué hacer con ella.</p>
            )}
            {messageType === 'contact' && (
              <p className="text-xs opacity-55">Tu mensaje es privado y solo podrán leerlo las personas con acceso de administración. Usaremos tu correo únicamente para poder responderte.</p>
            )}

            {status === 'error' && <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 border border-red-100 text-sm"><AlertCircle className="w-4 h-4" />{errorMessage}</div>}

            <button type="submit" disabled={status === 'sending' || !formData.message.trim()} className={`w-full flex items-center justify-center gap-2 py-4 font-bold transition-all disabled:opacity-50 ${isMinimal ? 'bg-[#1C1510] text-[#F7F4EE] rounded-[2px] hover:bg-black' : 'olive-button'}`}>
              <Send className="w-4 h-4" /> {status === 'sending' ? 'Enviando...' : messageType === 'suggestion' ? 'Enviar sugerencia' : 'Enviar mensaje privado'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactForm;
