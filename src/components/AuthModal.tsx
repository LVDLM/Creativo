import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, User as UserIcon, LogIn, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword } from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'organic' | 'modern' | 'minimal';
}

type AuthMode = 'login' | 'register' | 'reset';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, theme = 'minimal' }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement;
    closeButtonRef.current?.focus();

    setError(null);
    setSuccessMessage(null);
    setPassword('');

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

  const getFriendlyErrorMessage = (err: any): string => {
    const code = err?.code || '';
    if (code === 'auth/invalid-email') return 'El correo electrónico no es válido.';
    if (code === 'auth/user-not-found') return 'No existe ninguna cuenta con este correo.';
    if (code === 'auth/wrong-password') return 'La contraseña no es correcta.';
    if (code === 'auth/invalid-credential') return 'Correo o contraseña incorrectos.';
    if (code === 'auth/email-already-in-use') return 'Ya existe una cuenta con este correo.';
    if (code === 'auth/weak-password') return 'La contraseña debe tener al menos 6 caracteres.';
    if (code === 'auth/popup-closed-by-user') return 'Has cerrado la ventana de inicio de sesión.';
    if (code === 'auth/too-many-requests') return 'Demasiados intentos. Espera unos momentos.';
    return err?.message || 'Ha ocurrido un error al procesar la solicitud.';
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(getFriendlyErrorMessage(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setError('Por favor, introduce tu correo electrónico.');
      return;
    }

    if (mode === 'reset') {
      setIsLoading(true);
      try {
        await resetPassword(email.trim());
        setSuccessMessage('Te hemos enviado un correo con instrucciones para restablecer tu contraseña.');
      } catch (err: any) {
        setError(getFriendlyErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!password) {
      setError('Por favor, introduce una contraseña.');
      return;
    }

    if (mode === 'register' && password.length < 6) {
      setError('La contraseña debe tener un mínimo de 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email.trim(), password);
        onClose();
      } else {
        await registerWithEmail(email.trim(), password, displayName.trim());
        onClose();
      }
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const isMinimal = theme === 'minimal';

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className={`w-full max-w-md bg-white border border-[#C8C2B4] rounded-[2px] shadow-2xl p-8 cursor-default max-h-[95vh] overflow-y-auto ${
          isMinimal ? 'font-body' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#5A4A3A] [font-variant:small-caps] mb-1">
              Ponte Creativo
            </div>
            <h2 id="auth-modal-title" className="font-editorial text-[28px] font-bold text-[#1C1510] leading-tight">
              {mode === 'login' ? 'Iniciar sesión' : mode === 'register' ? 'Crear una cuenta' : 'Recuperar contraseña'}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="p-1.5 text-[#5A4A3A] hover:text-[#1C1510] hover:bg-[#EDE8DF] rounded-[2px] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas modo login/registro */}
        {mode !== 'reset' && (
          <div className="flex border-b border-[#E8E6E0] mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 pb-2.5 text-[12px] font-bold uppercase tracking-wider transition-colors border-b-2 -mb-[1px] ${
                mode === 'login' 
                  ? 'border-[#1C1510] text-[#1C1510]' 
                  : 'border-transparent text-[#5A4A3A] hover:text-[#1C1510]'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 pb-2.5 text-[12px] font-bold uppercase tracking-wider transition-colors border-b-2 -mb-[1px] ${
                mode === 'register' 
                  ? 'border-[#1C1510] text-[#1C1510]' 
                  : 'border-transparent text-[#5A4A3A] hover:text-[#1C1510]'
              }`}
            >
              Crear cuenta
            </button>
          </div>
        )}

        {/* Botón de Google */}
        {mode !== 'reset' && (
          <div className="mb-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-[#C8C2B4] hover:bg-[#EDE8DF] text-[#1C1510] py-3 px-4 rounded-[2px] text-[13px] font-bold transition-all disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continuar con Google
            </button>

            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-[#E8E6E0]" />
              <span className="px-3 text-[11px] uppercase tracking-wider text-[#5A4A3A] [font-variant:small-caps]">
                o con correo electrónico
              </span>
              <div className="flex-1 border-t border-[#E8E6E0]" />
            </div>
          </div>
        )}

        {/* Mensajes de error / éxito */}
        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-[2px] flex items-start gap-2.5 text-red-700 text-[13px]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 rounded-[2px] flex items-start gap-2.5 text-emerald-800 text-[13px]">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label htmlFor="auth-name" className="block text-[11px] font-bold uppercase tracking-wider text-[#5A4A3A] mb-1 [font-variant:small-caps]">
                Nombre o seudónimo
              </label>
              <div className="relative">
                <input
                  id="auth-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Tu nombre de autor"
                  className="w-full px-3.5 py-2.5 pl-10 border border-[#C8C2B4] rounded-[2px] text-[14px] text-[#1C1510] bg-white focus:border-[#1C1510] focus:ring-0 transition-all"
                />
                <UserIcon className="w-4 h-4 text-[#5A4A3A] absolute left-3.5 top-3.5" />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-[11px] font-bold uppercase tracking-wider text-[#5A4A3A] mb-1 [font-variant:small-caps]">
              Correo electrónico
            </label>
            <div className="relative">
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full px-3.5 py-2.5 pl-10 border border-[#C8C2B4] rounded-[2px] text-[14px] text-[#1C1510] bg-white focus:border-[#1C1510] focus:ring-0 transition-all"
              />
              <Mail className="w-4 h-4 text-[#5A4A3A] absolute left-3.5 top-3.5" />
            </div>
          </div>

          {mode !== 'reset' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="auth-password" className="block text-[11px] font-bold uppercase tracking-wider text-[#5A4A3A] [font-variant:small-caps]">
                  Contraseña
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('reset'); setError(null); setSuccessMessage(null); }}
                    className="text-[11px] text-[#5A4A3A] hover:text-[#1C1510] hover:underline transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="auth-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                  className="w-full px-3.5 py-2.5 pl-10 border border-[#C8C2B4] rounded-[2px] text-[14px] text-[#1C1510] bg-white focus:border-[#1C1510] focus:ring-0 transition-all"
                />
                <Lock className="w-4 h-4 text-[#5A4A3A] absolute left-3.5 top-3.5" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-6 bg-[#1C1510] hover:bg-[#2C2416] text-[#F7F4EE] rounded-[2px] text-[12px] font-bold uppercase tracking-[0.08em] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              'Procesando...'
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" /> Iniciar sesión
              </>
            ) : mode === 'register' ? (
              <>
                <ArrowRight className="w-4 h-4" /> Crear cuenta
              </>
            ) : (
              'Enviar enlace de recuperación'
            )}
          </button>
        </form>

        {/* Pie alternativo */}
        <div className="mt-6 pt-5 border-t border-[#E8E6E0] text-center text-[12px] text-[#5A4A3A]">
          {mode === 'login' ? (
            <p>
              ¿No tienes una cuenta aún?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); }}
                className="font-bold text-[#1C1510] underline hover:opacity-80 transition-opacity"
              >
                Regístrate gratis
              </button>
            </p>
          ) : mode === 'register' ? (
            <p>
              ¿Ya tienes una cuenta?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className="font-bold text-[#1C1510] underline hover:opacity-80 transition-opacity"
              >
                Inicia sesión
              </button>
            </p>
          ) : (
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setSuccessMessage(null); }}
              className="font-bold text-[#1C1510] underline hover:opacity-80 transition-opacity"
            >
              ← Volver al inicio de sesión
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
