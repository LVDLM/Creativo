import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where,
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  getDocFromServer,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db, loginWithGoogle, logout } from './firebase';
import { CHALLENGES, PONTE_SUB_PROMPTS, STARTING_PHRASES } from './constants';
import { Challenge, Publication, OperationType, FirestoreErrorInfo } from './types';
import { MicroStoryLab } from './components/MicroStoryLab';
import { WeatherActionLab } from './components/WeatherActionLab';
import { SurrealDialogLab } from './components/surreal_dialog/SurrealDialogLab';
import { WritingArea } from './components/WritingArea';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndConditions from './components/TermsAndConditions';
import ContactForm from './components/ContactForm';
import { 
  Zap, 
  Bus, 
  Train, 
  Type, 
  Minimize2, 
  Layers, 
  Shuffle, 
  PenTool, 
  Globe, 
  LogOut, 
  LogIn,
  ChevronRight,
  Send,
  CheckCircle2,
  AlertCircle,
  CloudSun,
  MessageSquare,
  Dices,
  Ghost,
  Search,
  Swords,
  Sun,
  Sparkles,
  Trash2,
  Edit3,
  ChevronDown,
  Clock,
  Plus,
  BarChart2,
  RefreshCw,
  Calendar,
  Layout,
  Palette,
  Sparkle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Icon mapping
const ICON_MAP: Record<string, any> = {
  Zap, Bus, Train, Type, Minimize2, Layers, Shuffle, Dices, Ghost, Search, Swords, Sun, Sparkles, Clock, BarChart2, RefreshCw, Calendar, Layout, Palette, Sparkle
};

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email || undefined,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId || undefined,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [theme, setTheme] = useState<'organic' | 'modern' | 'minimal'>('minimal');
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [pontePrompt, setPontePrompt] = useState<any>(null);
  const [view, setView] = useState<'home' | 'challenge' | 'gallery' | 'lab' | 'privacy' | 'terms' | 'contact'>('home');
  const [publications, setPublications] = useState<Publication[]>([]);
  const [writingContent, setWritingContent] = useState('');
  const [pseudonym, setPseudonym] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState<string>('all');
  const [showExamples, setShowExamples] = useState(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState<'retos' | 'lab' | null>(null);
  const [currentPhrase, setCurrentPhrase] = useState(STARTING_PHRASES[0]);
  const [activePillFilter, setActivePillFilter] = useState('Todos');

  const LAB_ACTIVITIES: (Challenge & { isLab?: boolean; labId?: string })[] = [
    {
      id: 'lab-micro-story',
      title: 'Microhistorias',
      description: 'Genera letras aleatorias y desafía tu mente a crear oraciones coherentes bajo presión creativa.',
      difficulty: 'Variable',
      duration: '5 min',
      category: 'Laboratorio',
      icon: 'Type',
      example: 'A B C... "Antes Buscaba Caminos"',
      isLab: true,
      labId: 'microstory',
      tags: ['Laboratorio', 'Letras', '5 min']
    },
    {
      id: 'lab-weather-action',
      title: 'Tiempo y Acciones',
      description: 'Combina el tiempo atmosférico con acciones variadas para inspirar tus relatos más dinámicos.',
      difficulty: 'Fácil',
      duration: '10 min',
      category: 'Laboratorio',
      icon: 'CloudSun',
      example: 'Llueve mientras alguien corre hacia un refugio...',
      isLab: true,
      labId: 'weatheraction',
      tags: ['Laboratorio', 'Escenarios', '10 min']
    },
    {
      id: 'lab-surreal-dialog',
      title: 'Diálogos Surrealistas',
      description: 'Genera personajes absurdos y crea conversaciones imposibles entre objetos y conceptos.',
      difficulty: 'Media',
      duration: '15 min',
      category: 'Laboratorio',
      icon: 'MessageSquare',
      example: 'Un paraguas discute con el concepto de la soledad.',
      isLab: true,
      labId: 'surrealdialog',
      tags: ['Laboratorio', 'Personajes', '15 min']
    }
  ];

  const ALL_ACTIVITIES = [...LAB_ACTIVITIES, ...CHALLENGES];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const path = 'publications';
    const q = query(
      collection(db, path), 
      where('isModerated', '==', true),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pubs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Publication[];
      setPublications(pubs);
    }, (error) => {
      console.error('Gallery subscription error:', error);
      // We don't throw here to avoid crashing the app
    });
    return () => unsubscribe();
  }, []);

  // Test connection
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  const handlePublish = async (labToolId?: string) => {
    if (!user || (!activeChallenge && !labToolId) || !writingContent.trim()) return;
    setIsPublishing(true);
    
    try {
      const path = 'publications';
      try {
        await addDoc(collection(db, path), {
          challengeId: labToolId || activeChallenge?.id,
          subTitle: pontePrompt?.title || null,
          authorId: user.uid,
          authorName: pseudonym.trim() || user.displayName || 'Anónimo',
          content: writingContent,
          createdAt: serverTimestamp(),
          isModerated: true // Published directly, admin can manage later
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }

      setPublishSuccess(true);
      setTimeout(() => {
        setPublishSuccess(false);
        setView('gallery');
        setActiveChallenge(null);
        setActiveLabTool(null);
        setWritingContent('');
        setPseudonym('');
      }, 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'publications');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error('Login error:', error);
      }
    }
  };

  const renderHome = () => {
    if (theme === 'minimal') return renderMinimalHome();
    
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <header className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-6xl md:text-9xl mb-4 tracking-tighter display`}
          >
            Ponte Creativo
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl opacity-70 italic"
          >
            Donde las palabras cobran vida y el ingenio se hace texto.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CHALLENGES.map((challenge, idx) => {
            const Icon = ICON_MAP[challenge.icon || 'PenTool'] || PenTool;
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                onClick={() => {
                  setActiveChallenge(challenge);
                  setView('challenge');
                }}
                className="card p-8 cursor-pointer group transition-all"
              >
                <div className={`w-14 h-14 rounded-3xl flex items-center justify-center mb-6 transition-all duration-500 ${theme === 'modern' ? 'bg-indigo-50 text-indigo-600 group-hover:scale-110' : 'bg-stone-100 text-stone-700'}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${theme === 'modern' ? 'display' : ''}`}>{challenge.title}</h3>
                <p className="opacity-60 mb-4 line-clamp-2 italic">{challenge.description}</p>
                <div className="flex items-center font-bold uppercase text-sm tracking-widest">
                  Empezar reto <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMinimalHome = () => {
    const pills = ['Todos', 'Laboratorio', 'Retos', '5 min', '10 min', 'Personajes', 'Poesía'];
    const filteredActivities = activePillFilter === 'Todos' 
      ? ALL_ACTIVITIES 
      : activePillFilter === 'Retos'
      ? CHALLENGES
      : activePillFilter === 'Laboratorio'
      ? LAB_ACTIVITIES
      : ALL_ACTIVITIES.filter(c => 
          c.duration === activePillFilter || 
          c.tags?.includes(activePillFilter) ||
          c.category.includes(activePillFilter)
        );

    const todayChallenge = CHALLENGES[new Date().getDate() % CHALLENGES.length];
    
    // Get a random quote from publications for the hero
    const heroQuote = publications.length > 0 
      ? publications[Math.floor(Math.random() * publications.length)]
      : { content: "Escribe como si nadie te estuviera mirando.", authorName: "Anónimo" };

    return (
      <div className="bg-[#F7F4EE] min-h-screen text-[#1C1510] font-body">
        {/* 5.1 Navegación del Hero */}
        <nav className="max-w-6xl mx-auto px-6 pt-8 pb-3 flex justify-between items-end border-b border-[#C8C2B4] mb-10">
          <div 
            className="font-editorial font-bold text-[15px] cursor-pointer"
            onClick={() => setView('home')}
          >
            Ponte Creativo
          </div>
          <div className="flex gap-6 text-[11px] font-body font-normal uppercase tracking-[0.12em] text-[#8A8070] [font-variant:small-caps]">
            <button onClick={() => { setView('home'); setActivePillFilter('Retos'); }} className="hover:text-[#1C1510] transition-colors">Retos</button>
            <button onClick={() => { setView('home'); setActivePillFilter('Laboratorio'); }} className="hover:text-[#1C1510] transition-colors">Laboratorio</button>
            <button onClick={() => setView('gallery')} className="hover:text-[#1C1510] transition-colors">Galería</button>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto px-6">
          {/* 5.2 Encabezado supratítulo */}
          <div className="text-[11px] font-body font-normal uppercase tracking-[0.12em] text-[#8A8070] [font-variant:small-caps] mb-4">
            Escritura creativa · Ejercicios breves
          </div>

          {/* 5.3 Título principal H1 */}
          <h1 className="font-editorial font-bold text-[34px] md:text-[52px] leading-[1.05] mb-5 max-w-[520px] tracking-[-0.02em]">
            Escribe como si <span className="italic">nadie</span> te estuviera mirando.
          </h1>

          {/* 5.4 Cuerpo principal (Layout de dos columnas) */}
          <div className="flex flex-col md:flex-row gap-10 mb-10 items-start">
            {/* Columna izquierda */}
            <div className="flex-1 max-w-[340px]">
              <p className="text-[#5A5040] text-[14px] leading-[1.75] mb-6">
                Desbloquea tu creatividad con retos de escritura de diez minutos. Un espacio diseñado para quienes aman las palabras y el tiempo bien invertido.
              </p>
              <div className="flex gap-[10px]">
                <button 
                  onClick={() => {
                    setActiveChallenge(todayChallenge);
                    setView('challenge');
                  }}
                  className="bg-[#1C1510] text-[#F7F4EE] px-[22px] py-[10px] rounded-[2px] text-[12px] font-body font-bold tracking-[0.06em] hover:opacity-90 transition-all"
                >
                  Actividad de hoy
                </button>
                <button 
                  onClick={() => setView('gallery')}
                  className="bg-transparent text-[#5A5040] border border-[#C8C2B4] px-[22px] py-[10px] rounded-[2px] text-[12px] font-body font-bold tracking-[0.06em] hover:bg-[#EDE8DF] transition-all"
                >
                  Explorar galería
                </button>
              </div>
            </div>

            {/* Columna derecha (Cita) */}
            <div className="w-full md:w-[180px] border-t md:border-t-0 md:border-l border-[#C8C2B4] pt-6 md:pt-0 md:pl-6">
              <div className="text-[10px] font-body font-normal uppercase tracking-[0.12em] text-[#8A8070] [font-variant:small-caps] mb-2">
                Hoy en la galería
              </div>
              <p className="font-editorial italic text-[14px] text-[#2C2416] leading-[1.6] mb-2">
                "{heroQuote.content.length > 80 ? heroQuote.content.substring(0, 80) + '...' : heroQuote.content}"
              </p>
              <p className="text-[11px] text-[#8A8070] font-body">
                — {heroQuote.authorName}
              </p>
            </div>
          </div>

          {/* 6. Pie de datos */}
          <div className="border-t border-[#C8C2B4] pt-3 flex flex-wrap gap-8 mb-20">
            <div className="flex flex-col">
              <span className="font-editorial font-bold text-[20px] text-[#1C1510]">47</span>
              <span className="text-[11px] text-[#8A8070] font-body [font-variant:small-caps]">actividades</span>
            </div>
            <div className="flex flex-col">
              <span className="font-editorial font-bold text-[20px] text-[#1C1510]">5 min</span>
              <span className="text-[11px] text-[#8A8070] font-body [font-variant:small-caps]">la más corta</span>
            </div>
            <div className="flex flex-col">
              <span className="font-editorial font-bold text-[20px] text-[#1C1510]">0</span>
              <span className="text-[11px] text-[#8A8070] font-body [font-variant:small-caps]">excusas necesarias</span>
            </div>
          </div>

          {/* 5.5 Sección de Retos (Fuera del Hero pero manteniendo el estilo) */}
          <section className="pb-20">
            <div className="flex flex-wrap items-center gap-2 mb-10">
              {pills.map(pill => (
                <button
                  key={pill}
                  onClick={() => setActivePillFilter(pill)}
                  className={`px-4 py-1 rounded-[2px] text-[11px] font-body font-bold uppercase tracking-widest transition-all ${
                    activePillFilter === pill 
                      ? 'bg-[#1C1510] text-[#F7F4EE]' 
                      : 'bg-[#EDE8DF] text-[#8A8070] hover:bg-[#C8C2B4]'
                  }`}
                >
                  {pill}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActivities.map((activity, idx) => {
                const Icon = ICON_MAP[activity.icon || 'PenTool'] || PenTool;
                const isLab = 'isLab' in activity && activity.isLab;
                
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => {
                      if (isLab && 'labId' in activity) {
                        setActiveLabTool((activity as any).labId || null);
                        setView('lab');
                      } else {
                        setActiveChallenge(activity as Challenge);
                        setView('challenge');
                      }
                    }}
                    className="group cursor-pointer bg-white border border-[#E8E6E0] p-6 rounded-[2px] hover:border-[#8F8E88] transition-all hover:shadow-sm relative"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-[2px] ${isLab ? 'bg-[#1C1510] text-[#F7F4EE]' : 'bg-[#EDE8DF] text-[#8A8070]'}`}>
                          {isLab ? 'LAB' : activity.difficulty}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-[#EDE8DF] rounded-[2px] text-[#8A8070] flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> {activity.duration}
                        </span>
                      </div>
                      <Icon className="w-5 h-5 text-[#C8C2B4] group-hover:text-[#1C1510] transition-colors" />
                    </div>
                    <h3 className="font-editorial text-xl font-bold mb-3 leading-tight text-[#1C1510]">{activity.title}</h3>
                    <p className="text-[#5A5040] text-sm mb-6 leading-relaxed line-clamp-2 font-body">
                      {activity.description}
                    </p>
                    <div className="pt-4 border-t border-[#E8E6E0] opacity-0 group-hover:opacity-100 transition-all">
                      <p className="text-[10px] italic text-[#8A8070] mb-1 font-body">Ejemplo:</p>
                      <p className="text-[#1C1510] text-xs font-body italic line-clamp-2">"{activity.example}"</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    );
  };

  const renderChallenge = () => {
    if (!activeChallenge) return null;
    const isPonte = activeChallenge.id === 'ponte-si-puedes';

    if (theme === 'minimal') {
      return (
        <div className="bg-[#F7F4EE] min-h-screen font-body text-[#1C1510]">
          <nav className="max-w-6xl mx-auto px-6 pt-8 pb-3 flex justify-between items-end border-b border-[#C8C2B4] mb-10">
            <div 
              className="font-editorial font-bold text-[15px] cursor-pointer"
              onClick={() => setView('home')}
            >
              Ponte Creativo
            </div>
            <div className="flex gap-6 text-[11px] font-body font-normal uppercase tracking-[0.12em] text-[#8A8070] [font-variant:small-caps]">
              <button onClick={() => setView('home')} className="hover:text-[#1C1510] transition-colors">Retos</button>
              <button onClick={() => setView('lab')} className="hover:text-[#1C1510] transition-colors">Laboratorio</button>
              <button onClick={() => setView('gallery')} className="hover:text-[#1C1510] transition-colors">Galería</button>
            </div>
          </nav>
          <div className="max-w-4xl mx-auto px-6 py-16">
            <button 
              onClick={() => {
                setView('home');
                setPontePrompt(null);
              }}
              className="mb-12 text-[#8A8070] hover:text-[#1C1510] flex items-center gap-2 font-bold text-[11px] uppercase tracking-[0.12em] transition-colors [font-variant:small-caps]"
            >
              ← Volver
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              <div className="lg:col-span-5">
                <div className="sticky top-32">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-[#EDE8DF] rounded-[2px] text-[#8A8070]">
                      {activeChallenge.difficulty}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-[#EDE8DF] rounded-[2px] text-[#8A8070] flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {activeChallenge.duration}
                    </span>
                  </div>
                  <h2 className="font-editorial text-[42px] font-bold leading-[1.1] mb-6 tracking-[-0.01em]">
                    {isPonte && pontePrompt ? pontePrompt.title : activeChallenge.title}
                  </h2>
                  <p className="text-[#5A5040] text-[15px] leading-[1.75] mb-8">
                    {isPonte && pontePrompt ? pontePrompt.description : activeChallenge.description}
                  </p>
                  
                  {isPonte && (
                    <button 
                      onClick={() => {
                        const random = PONTE_SUB_PROMPTS[Math.floor(Math.random() * PONTE_SUB_PROMPTS.length)];
                        setPontePrompt(random);
                      }}
                      className="w-full flex justify-center items-center gap-2 bg-[#1C1510] text-[#F7F4EE] px-6 py-3 rounded-[2px] font-bold text-[12px] tracking-[0.06em] hover:opacity-90 transition-all mb-8"
                    >
                      <RefreshCw className="w-4 h-4" /> Aleatorizar planteamiento
                    </button>
                  )}

                  <div className="bg-white p-8 rounded-[2px] border border-[#E8E6E0] shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A8070] mb-4 flex items-center gap-2 [font-variant:small-caps]">
                      <Sparkles className="w-3 h-3" /> Inspiración
                    </p>
                    <p className="text-[#1C1510] italic leading-[1.6] whitespace-pre-line font-body text-[15px]">
                      "{isPonte && pontePrompt?.example ? pontePrompt.example : activeChallenge.example}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                {(!isPonte || pontePrompt) && (
                  <WritingArea 
                    user={user}
                    writingContent={writingContent}
                    setWritingContent={setWritingContent}
                    pseudonym={pseudonym}
                    setPseudonym={setPseudonym}
                    onPublish={() => handlePublish()}
                    isPublishing={isPublishing}
                    publishSuccess={publishSuccess}
                    onLogin={handleLogin}
                    theme={theme}
                    maxWidth={activeChallenge.id === 'de-una-palabra-un-texto' ? '400px' : undefined}
                  />
                )}
                
                <div className="mt-12">
                  {renderExamplesCarousel(activeChallenge.id)}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button 
          onClick={() => {
            setView('home');
            setPontePrompt(null);
          }}
          className="mb-8 text-stone-500 hover:text-stone-800 flex items-center transition-colors"
        >
          ← Volver a los retos
        </button>

        <div className="card p-8 md:p-12 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center">
              {React.createElement(ICON_MAP[isPonte && pontePrompt ? pontePrompt.icon : (activeChallenge.icon || 'PenTool')], { className: "w-8 h-8 text-stone-700" })}
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-stone-400 font-bold">{activeChallenge.category}</span>
              <h2 className="text-4xl font-bold">{isPonte && pontePrompt ? pontePrompt.title : activeChallenge.title}</h2>
            </div>
          </div>

          <div className="prose prose-stone max-w-none mb-8">
            <p className="text-xl leading-relaxed text-stone-700">{isPonte && pontePrompt ? pontePrompt.description : activeChallenge.description}</p>
            
            {isPonte && (
              <button 
                onClick={() => {
                  const random = PONTE_SUB_PROMPTS[Math.floor(Math.random() * PONTE_SUB_PROMPTS.length)];
                  setPontePrompt(random);
                }}
                className="mt-4 flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                <Shuffle className="w-5 h-5" /> {pontePrompt ? 'Cambiar planteamiento' : 'Obtener planteamiento aleatorio'}
              </button>
            )}

            <div className="bg-stone-50 p-8 rounded-[32px] border border-stone-100 italic mt-8 whitespace-pre overflow-x-auto no-scrollbar">
              <strong className="block mb-4 not-italic text-indigo-600 uppercase text-xs font-black tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Ejemplo de inspiración:
              </strong>
              {isPonte && pontePrompt?.example ? pontePrompt.example : activeChallenge.example}
            </div>

            {renderExamplesCarousel(activeChallenge.id)}
          </div>

          {(!isPonte || pontePrompt) && (
            <WritingArea 
              user={user}
              writingContent={writingContent}
              setWritingContent={setWritingContent}
              pseudonym={pseudonym}
              setPseudonym={setPseudonym}
              onPublish={() => handlePublish()}
              isPublishing={isPublishing}
              publishSuccess={publishSuccess}
              onLogin={handleLogin}
              theme={theme}
              maxWidth={activeChallenge.id === 'de-una-palabra-un-texto' ? '400px' : undefined}
            />
          )}
        </div>
      </div>
    );
  };

  const isAdmin = user?.email === 'lavozdelosmuertos@gmail.com';

  const handleDelete = async (pubId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres borrar esta publicación?')) return;
    try {
      await deleteDoc(doc(db, 'publications', pubId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `publications/${pubId}`);
    }
  };

  const handleEdit = async (pub: Publication) => {
    const newContent = window.prompt('Editar contenido:', pub.content);
    if (newContent === null || newContent === pub.content) return;
    try {
      await updateDoc(doc(db, 'publications', pub.id), {
        content: newContent
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `publications/${pub.id}`);
    }
  };

  const navigateToSource = (pub: Publication) => {
    const challenge = CHALLENGES.find(c => c.id === pub.challengeId);
    if (challenge) {
      setActiveChallenge(challenge);
      if (challenge.id === 'ponte-si-puedes' && pub.subTitle) {
        const subPrompt = PONTE_SUB_PROMPTS.find(p => p.title === pub.subTitle);
        if (subPrompt) setPontePrompt(subPrompt);
      }
      setView('challenge');
    } else if (pub.challengeId.startsWith('lab-')) {
      const toolId = pub.challengeId.replace('lab-', '').replace('-', '');
      setActiveLabTool(toolId);
      setView('lab');
    }
    window.scrollTo(0, 0);
  };

  const renderExamplesCarousel = (challengeId: string) => {
    const examples = publications.filter(p => p.challengeId === challengeId);
    if (examples.length === 0) return null;

    const isMinimal = theme === 'minimal';

    return (
      <div className={`mt-8 pt-8 ${isMinimal ? 'border-t border-[#C8C2B4]' : 'border-t border-stone-100'}`}>
        {!showExamples ? (
          <button 
            onClick={() => setShowExamples(true)}
            className={`flex items-center gap-2 font-bold hover:underline ${isMinimal ? 'text-[#1C1510] text-[12px] tracking-[0.06em]' : 'text-indigo-600'}`}
          >
            <Sparkles className="w-4 h-4" /> Ver ejemplos de otros escritores e inspirarse
          </button>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className={`font-bold uppercase text-[10px] tracking-widest ${isMinimal ? 'text-[#8A8070] [font-variant:small-caps]' : 'text-stone-400'}`}>
                Inspiración de la comunidad
              </h4>
              <button 
                onClick={() => setShowExamples(false)}
                className={`text-[10px] font-bold uppercase tracking-widest ${isMinimal ? 'text-[#8A8070] hover:text-[#1C1510]' : 'text-stone-400 hover:text-stone-800'}`}
              >
                Ocultar
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x no-scrollbar">
              {examples.map((ex) => (
                <div 
                  key={ex.id} 
                  className={`min-w-[280px] max-w-[320px] p-6 border shadow-sm snap-start ${
                    isMinimal 
                      ? 'bg-white border-[#E8E6E0] rounded-[2px]' 
                      : 'bg-white border-stone-100 rounded-2xl'
                  }`}
                >
                  <p className={`italic mb-4 whitespace-pre-line ${isMinimal ? 'text-[#1C1510] text-sm leading-relaxed' : 'text-stone-600'}`}>
                    "{ex.content}"
                  </p>
                  <span className={`text-[10px] font-bold ${isMinimal ? 'text-[#8A8070]' : 'text-stone-400'}`}>
                    — {ex.authorName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGallery = () => {
    const labToolIds = ['lab-micro-story', 'lab-weather-action', 'lab-surreal-dialog'];
    const isMinimal = theme === 'minimal';
    
    // Determine type for filtering
    const getPubType = (pub: Publication) => {
      return labToolIds.includes(pub.challengeId) ? 'laboratorio' : 'reto';
    };

    const filteredPubs = galleryFilter === 'all' 
      ? publications 
      : galleryFilter === 'retos'
      ? publications.filter(p => getPubType(p) === 'reto')
      : publications.filter(p => getPubType(p) === 'laboratorio');

    const getCategoryColor = (challengeId: string) => {
      const challenge = CHALLENGES.find(c => c.id === challengeId);
      if (labToolIds.includes(challengeId)) return '#1D9E75'; // Verde azulado (Laboratorio)
      
      // Si es el reto dinámico, es Narrativa
      if (challengeId === 'ponte-si-puedes') return '#D85A30'; // Naranja (Narrativa)
      
      if (!challenge) return '#888780';
      
      const cat = challenge.category.toLowerCase();
      if (cat.includes('acentuación')) return '#7F77DD'; // Morado
      if (cat.includes('narrativa') || cat.includes('tren') || cat.includes('misterio')) return '#D85A30'; // Naranja
      if (cat.includes('vocabulario') || cat.includes('acróstico') || cat.includes('anagramas') || cat.includes('polisemia') || cat.includes('monosílabos') || cat.includes('calambur') || cat.includes('monovocalismo')) return '#BA7517'; // Ámbar
      return '#888780';
    };

    return (
      <div className={`min-h-screen ${isMinimal ? 'bg-[#F7F4EE] text-[#1C1510] font-body' : ''}`}>
        {isMinimal && (
          <nav className="max-w-6xl mx-auto px-6 pt-8 pb-3 flex justify-between items-end border-b border-[#C8C2B4] mb-10">
            <div 
              className="font-editorial font-bold text-[15px] cursor-pointer"
              onClick={() => setView('home')}
            >
              Ponte Creativo
            </div>
            <div className="flex gap-6 text-[11px] font-body font-normal uppercase tracking-[0.12em] text-[#8A8070] [font-variant:small-caps]">
              <button onClick={() => setView('home')} className="hover:text-[#1C1510] transition-colors">Retos</button>
              <button onClick={() => setView('lab')} className="hover:text-[#1C1510] transition-colors">Laboratorio</button>
              <button onClick={() => setView('gallery')} className="hover:text-[#1C1510] transition-colors">Galería</button>
            </div>
          </nav>
        )}
        <div className="max-w-6xl mx-auto px-6 py-16">
          {/* Cabecera de la sección */}
          <div className="mb-10">
            <h1 className={`text-[26px] font-bold mb-1 ${isMinimal ? 'font-editorial text-[34px] md:text-[52px] leading-[1.05] tracking-[-0.02em]' : 'text-stone-900'}`}>
              Galería pública
            </h1>
            <p className={`text-sm italic ${isMinimal ? 'text-[#8A8070] font-body' : 'text-[#888780]'}`}>
              Inspiración compartida por nuestra comunidad.
            </p>
          </div>

          {/* Sistema de filtros (Píldoras fijas) */}
          <div className="flex items-center gap-[6px] mb-8">
            {['all', 'retos', 'laboratorio'].map((filter) => (
              <button
                key={filter}
                onClick={() => setGalleryFilter(filter as any)}
                className={`px-4 py-1 rounded-[2px] text-[11px] font-body font-bold uppercase tracking-widest transition-all ${
                  galleryFilter === filter
                    ? 'bg-[#1C1510] text-[#F7F4EE]'
                    : 'bg-[#EDE8DF] text-[#8A8070] hover:bg-[#C8C2B4]'
                }`}
              >
                {filter === 'all' ? 'Todos' : filter === 'retos' ? 'Retos' : 'Laboratorio'}
              </button>
            ))}
          </div>

          {/* Contador de resultados */}
          <div className={`mb-4 text-[12px] ${isMinimal ? 'text-[#8A8070] font-body uppercase tracking-widest' : 'text-[#AAAAAA]'}`}>
            {filteredPubs.length} {filteredPubs.length === 1 ? 'entrada' : 'entradas'}
          </div>

          {/* Grid de tarjetas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
            {filteredPubs.map((pub, index) => {
              const isFeatured = galleryFilter === 'all' && index === 0;
              const challenge = CHALLENGES.find(c => c.id === pub.challengeId);
              const labToolNames: Record<string, string> = {
                'lab-micro-story': 'Microhistorias',
                'lab-weather-action': 'Tiempo y Acciones',
                'lab-surreal-dialog': 'Diálogos Surrealistas'
              };
              const typeLabel = getPubType(pub) === 'laboratorio' ? 'Laboratorio' : 'Reto';
              const challengeTitle = pub.subTitle || challenge?.title || labToolNames[pub.challengeId] || 'Desconocido';
              const dotColor = getCategoryColor(pub.challengeId);
              const initials = pub.authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

              return (
                <motion.div
                  key={pub.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => navigateToSource(pub)}
                  className={`group cursor-pointer bg-white border border-[#E8E6E0] hover:border-[#8F8E88] rounded-[2px] p-[24px] flex flex-col transition-all duration-[150ms] relative ${
                    isFeatured ? 'lg:col-span-2' : ''
                  }`}
                >
                  {/* Etiqueta de categoría */}
                  <div className="flex items-center gap-[8px] mb-4">
                    <div 
                      className="w-[8px] h-[8px] rounded-full" 
                      style={{ backgroundColor: dotColor }}
                    />
                    <span className="text-[10px] uppercase tracking-[0.12em] text-[#8A8070] font-body font-bold">
                      {typeLabel}: {challengeTitle}
                    </span>
                  </div>

                  {/* Extracto del texto */}
                  <div className="flex-grow mb-6">
                    <p className={`font-editorial text-[#1C1510] leading-[1.7] whitespace-pre-wrap overflow-hidden ${
                      isFeatured ? 'text-[18px] line-clamp-6' : 'text-[15px] line-clamp-5'
                    }`}>
                      {pub.content}
                    </p>
                  </div>

                  {/* Pie de tarjeta */}
                  <div className="pt-4 border-t border-[#E8E6E0] flex justify-between items-center">
                    <div className="flex items-center gap-[8px]">
                      <div className="w-6 h-6 rounded-full bg-[#EDE8DF] border-[0.5px] border-[#C8C2B4] flex items-center justify-center text-[10px] font-bold text-[#8A8070] font-body">
                        {initials}
                      </div>
                      <span className="text-[12px] text-[#8A8070] font-body">{pub.authorName}</span>
                    </div>
                    <span className="text-[11px] text-[#1C1510] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                      Ir al reto →
                    </span>
                  </div>
                  
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEdit(pub); }}
                        className="p-2 bg-white border border-[#E8E6E0] rounded-[2px] text-[#8A8070] hover:text-[#1C1510] hover:border-[#8F8E88]"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(pub.id); }}
                        className="p-2 bg-white border border-[#E8E6E0] rounded-[2px] text-[#8A8070] hover:text-red-600 hover:border-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* Tarjeta CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setView('home')}
              className="border border-dashed border-[#C8C2B4] rounded-[2px] p-8 flex flex-col items-center justify-center text-center min-h-[200px] cursor-pointer hover:bg-[#EDE8DF] transition-all duration-[150ms]"
            >
              <div className="w-10 h-10 rounded-full bg-[#F7F4EE] border border-[#C8C2B4] flex items-center justify-center mb-4">
                <Plus className="w-5 h-5 text-[#8A8070]" />
              </div>
              <p className="text-[14px] text-[#1C1510] font-bold uppercase tracking-widest mb-1 font-body">Añade tu texto</p>
              <p className="text-[12px] text-[#8A8070] font-body italic">Elige un reto y publica</p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  };

  const [activeLabTool, setActiveLabTool] = useState<string | null>(null);

  const renderLab = () => {
    const isMinimal = theme === 'minimal';

    if (activeLabTool === 'microstory') {
      return (
        <div className={`min-h-screen ${isMinimal ? 'bg-[#F7F4EE] font-body text-[#1C1510]' : ''}`}>
          <div className="max-w-6xl mx-auto px-6 py-12">
            <button 
              onClick={() => {
                setActiveLabTool(null);
                setWritingContent('');
              }}
              className={`mb-8 flex items-center gap-2 transition-opacity font-bold uppercase text-[10px] tracking-widest ${isMinimal ? 'text-[#8A8070] hover:text-[#1C1510] [font-variant:small-caps]' : 'opacity-40 hover:opacity-100'}`}
            >
              <ChevronRight className="w-4 h-4 rotate-180" /> Volver al Laboratorio
            </button>
            <MicroStoryLab 
              theme={theme}
              user={user}
              writingContent={writingContent}
              setWritingContent={setWritingContent}
              pseudonym={pseudonym}
              setPseudonym={setPseudonym}
              onPublish={() => handlePublish('lab-micro-story')}
              isPublishing={isPublishing}
              publishSuccess={publishSuccess}
              onLogin={handleLogin}
            />
            <div className="max-w-4xl mx-auto">
              {renderExamplesCarousel('lab-micro-story')}
            </div>
          </div>
        </div>
      );
    }

    if (activeLabTool === 'weatheraction') {
      return (
        <div className={`min-h-screen ${isMinimal ? 'bg-[#F7F4EE] font-body text-[#1C1510]' : ''}`}>
          <div className="max-w-6xl mx-auto px-6 py-12">
            <button 
              onClick={() => {
                setActiveLabTool(null);
                setWritingContent('');
              }}
              className={`mb-8 flex items-center gap-2 transition-opacity font-bold uppercase text-[10px] tracking-widest ${isMinimal ? 'text-[#8A8070] hover:text-[#1C1510] [font-variant:small-caps]' : 'opacity-40 hover:opacity-100'}`}
            >
              <ChevronRight className="w-4 h-4 rotate-180" /> Volver al Laboratorio
            </button>
            <WeatherActionLab 
              theme={theme}
              user={user}
              writingContent={writingContent}
              setWritingContent={setWritingContent}
              pseudonym={pseudonym}
              setPseudonym={setPseudonym}
              onPublish={() => handlePublish('lab-weather-action')}
              isPublishing={isPublishing}
              publishSuccess={publishSuccess}
              onLogin={handleLogin}
            />
            <div className="max-w-4xl mx-auto">
              {renderExamplesCarousel('lab-weather-action')}
            </div>
          </div>
        </div>
      );
    }

    if (activeLabTool === 'surrealdialog') {
      return (
        <div className={`min-h-screen ${isMinimal ? 'bg-[#F7F4EE] font-body text-[#1C1510]' : ''}`}>
          <div className="max-w-6xl mx-auto px-6 py-12">
            <button 
              onClick={() => {
                setActiveLabTool(null);
                setWritingContent('');
              }}
              className={`mb-8 flex items-center gap-2 transition-opacity font-bold uppercase text-[10px] tracking-widest ${isMinimal ? 'text-[#8A8070] hover:text-[#1C1510] [font-variant:small-caps]' : 'opacity-40 hover:opacity-100'}`}
            >
              <ChevronRight className="w-4 h-4 rotate-180" /> Volver al Laboratorio
            </button>
            <SurrealDialogLab 
              theme={theme}
              user={user}
              writingContent={writingContent}
              setWritingContent={setWritingContent}
              pseudonym={pseudonym}
              setPseudonym={setPseudonym}
              onPublish={() => handlePublish('lab-surreal-dialog')}
              isPublishing={isPublishing}
              publishSuccess={publishSuccess}
              onLogin={handleLogin}
            />
            <div className="max-w-4xl mx-auto">
              {renderExamplesCarousel('lab-surreal-dialog')}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`min-h-screen ${isMinimal ? 'bg-[#F7F4EE] font-body text-[#1C1510]' : ''}`}>
        {isMinimal && (
          <nav className="max-w-6xl mx-auto px-6 pt-8 pb-3 flex justify-between items-end border-b border-[#C8C2B4] mb-10">
            <div 
              className="font-editorial font-bold text-[15px] cursor-pointer"
              onClick={() => setView('home')}
            >
              Ponte Creativo
            </div>
            <div className="flex gap-6 text-[11px] font-body font-normal uppercase tracking-[0.12em] text-[#8A8070] [font-variant:small-caps]">
              <button onClick={() => setView('home')} className="hover:text-[#1C1510] transition-colors">Retos</button>
              <button onClick={() => setView('lab')} className="hover:text-[#1C1510] transition-colors">Laboratorio</button>
              <button onClick={() => setView('gallery')} className="hover:text-[#1C1510] transition-colors">Galería</button>
            </div>
          </nav>
        )}
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center mb-16">
            <h2 className={`${isMinimal ? 'font-editorial text-[42px] md:text-[64px] leading-[1.05] tracking-[-0.02em]' : 'text-5xl md:text-7xl font-bold'} mb-4 ${theme === 'modern' ? 'display text-indigo-600' : ''}`}>
              Laboratorio de Ideas
            </h2>
            <p className={`text-xl italic max-w-2xl mx-auto ${isMinimal ? 'text-[#5A5040] font-body' : 'opacity-60'}`}>
              Explora herramientas experimentales diseñadas para desbloquear nuevos horizontes en tu escritura.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              onClick={() => setActiveLabTool('microstory')}
              className={`${isMinimal ? 'bg-white border border-[#E8E6E0] rounded-[2px] hover:border-[#8F8E88]' : 'card'} p-10 flex flex-col items-center text-center group cursor-pointer transition-all`}
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${isMinimal ? 'bg-[#EDE8DF] text-[#1C1510]' : theme === 'modern' ? 'bg-indigo-50 text-indigo-600' : 'bg-stone-100 text-stone-700'}`}>
                <Type className="w-10 h-10" />
              </div>
              <h3 className={`text-3xl font-bold mb-4 ${isMinimal ? 'font-editorial' : theme === 'modern' ? 'display' : ''}`}>Microhistorias</h3>
              <p className={`mb-8 max-w-sm ${isMinimal ? 'text-[#5A5040] text-sm leading-relaxed' : 'opacity-60'}`}>Genera letras aleatorias y desafía tu mente a crear oraciones coherentes bajo presión creativa.</p>
              <button className={`${isMinimal ? 'bg-[#1C1510] text-[#F7F4EE] px-8 py-3 rounded-[2px] font-bold text-[12px] tracking-[0.06em]' : 'olive-button'}`}>
                Abrir Herramienta
              </button>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              onClick={() => setActiveLabTool('weatheraction')}
              className={`${isMinimal ? 'bg-white border border-[#E8E6E0] rounded-[2px] hover:border-[#8F8E88]' : 'card'} p-10 flex flex-col items-center text-center group cursor-pointer transition-all`}
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${isMinimal ? 'bg-[#EDE8DF] text-[#1C1510]' : theme === 'modern' ? 'bg-indigo-50 text-indigo-600' : 'bg-stone-100 text-stone-700'}`}>
                <CloudSun className="w-10 h-10" />
              </div>
              <h3 className={`text-3xl font-bold mb-4 ${isMinimal ? 'font-editorial' : theme === 'modern' ? 'display' : ''}`}>Tiempo y Acciones</h3>
              <p className={`mb-8 max-w-sm ${isMinimal ? 'text-[#5A5040] text-sm leading-relaxed' : 'opacity-60'}`}>Combina el tiempo atmosférico con acciones variadas para inspirar tus relatos más dinámicos.</p>
              <button className={`${isMinimal ? 'bg-[#1C1510] text-[#F7F4EE] px-8 py-3 rounded-[2px] font-bold text-[12px] tracking-[0.06em]' : 'olive-button'}`}>
                Abrir Herramienta
              </button>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              onClick={() => setActiveLabTool('surrealdialog')}
              className={`${isMinimal ? 'bg-white border border-[#E8E6E0] rounded-[2px] hover:border-[#8F8E88]' : 'card'} p-10 flex flex-col items-center text-center group cursor-pointer transition-all`}
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${isMinimal ? 'bg-[#EDE8DF] text-[#1C1510]' : theme === 'modern' ? 'bg-indigo-50 text-indigo-600' : 'bg-stone-100 text-stone-700'}`}>
                <MessageSquare className="w-10 h-10" />
              </div>
              <h3 className={`text-3xl font-bold mb-4 ${isMinimal ? 'font-editorial' : theme === 'modern' ? 'display' : ''}`}>Diálogos Surrealistas</h3>
              <p className={`mb-8 max-w-sm ${isMinimal ? 'text-[#5A5040] text-sm leading-relaxed' : 'opacity-60'}`}>Genera personajes absurdos y crea conversaciones imposibles entre objetos y conceptos.</p>
              <button className={`${isMinimal ? 'bg-[#1C1510] text-[#F7F4EE] px-8 py-3 rounded-[2px] font-bold text-[12px] tracking-[0.06em]' : 'olive-button'}`}>
                Abrir Herramienta
              </button>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className={`${isMinimal ? 'bg-white border border-[#E8E6E0] rounded-[2px] opacity-50' : 'card opacity-50'} p-10 flex flex-col items-center text-center group transition-all`}
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${isMinimal ? 'bg-[#EDE8DF] text-[#1C1510]' : theme === 'modern' ? 'bg-indigo-50 text-indigo-600' : 'bg-stone-100 text-stone-700'}`}>
                <Globe className="w-10 h-10" />
              </div>
              <h3 className={`text-3xl font-bold mb-4 ${isMinimal ? 'font-editorial' : theme === 'modern' ? 'display' : ''}`}>Generador de Mundos</h3>
              <p className={`mb-8 max-w-sm ${isMinimal ? 'text-[#5A5040] text-sm leading-relaxed' : 'opacity-60'}`}>Crea ecosistemas, mitologías y geografías únicas para tus historias de fantasía o ciencia ficción.</p>
              <button className={`${isMinimal ? 'bg-[#1C1510] text-[#F7F4EE] px-8 py-3 rounded-[2px] font-bold text-[12px] tracking-[0.06em] opacity-50 cursor-not-allowed' : 'olive-button opacity-50 cursor-not-allowed'}`}>
                Próximamente
              </button>
            </motion.div>

            <div className={`md:col-span-2 p-12 flex flex-col items-center justify-center text-center ${
              isMinimal 
                ? 'bg-white border border-[#C8C2B4] rounded-[2px]' 
                : 'card bg-indigo-600/5 border-dashed border-2 border-indigo-200'
            }`}>
              <Zap className={`w-12 h-12 mb-4 ${isMinimal ? 'text-[#1C1510]' : 'text-indigo-400'}`} />
              <h4 className={`text-2xl font-bold mb-2 ${isMinimal ? 'font-editorial' : ''}`}>¿Tienes una herramienta propia?</h4>
              <p className={`max-w-lg mb-6 ${isMinimal ? 'text-[#5A5040] text-sm leading-relaxed' : 'opacity-60'}`}>Estamos listos para integrar tus otras aplicaciones de AI Studio aquí mismo para centralizar tu flujo creativo.</p>
              <div className={`text-sm font-bold uppercase tracking-widest ${isMinimal ? 'text-[#1C1510]' : 'text-indigo-600'}`}>Listo para integración</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col theme-${theme}`}>
      {theme !== 'minimal' && (
        <nav className={`sticky top-0 z-50 backdrop-blur-md border-b px-6 py-4 flex justify-between items-center transition-all duration-500 ${theme === 'modern' ? 'bg-white/70 border-indigo-50' : 'bg-white/80 border-stone-100'}`}>
          <div className="flex items-center gap-8">
            <div 
              className={`text-2xl font-bold cursor-pointer tracking-tighter ${theme === 'modern' ? 'display text-indigo-600' : 'text-stone-900'}`}
              onClick={() => setView('home')}
            >
              Ponte Creativo
            </div>
            
              {/* Theme Selector */}
              <div className={`hidden md:flex p-1 rounded-full gap-1 transition-colors ${theme === 'modern' ? 'bg-indigo-50' : 'bg-stone-100'}`}>
                <button 
                  onClick={() => setTheme('modern')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${theme === 'modern' ? 'bg-white text-indigo-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  MODERNO
                </button>
                <button 
                  onClick={() => setTheme('organic')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${theme === 'organic' ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  CLÁSICO
                </button>
                <button 
                  onClick={() => setTheme('minimal')}
                  className="px-4 py-1.5 rounded-full text-xs font-bold transition-all text-stone-400 hover:text-stone-600"
                >
                  MÍNIMO
                </button>
              </div>
          </div>

          <div className="flex items-center gap-6 sans text-sm font-medium">
            <button onClick={() => { setView('home'); setActivePillFilter('Retos'); }} className={`hover:opacity-100 transition-all ${view === 'home' && activePillFilter === 'Retos' ? 'opacity-100 font-bold' : 'opacity-40'}`}>Retos</button>
            <button onClick={() => { setView('home'); setActivePillFilter('Laboratorio'); }} className={`hover:opacity-100 transition-all ${view === 'home' && activePillFilter === 'Laboratorio' ? 'opacity-100 font-bold' : 'opacity-40'}`}>Laboratorio</button>
            <button onClick={() => setView('gallery')} className={`hover:opacity-100 transition-all ${view === 'gallery' ? 'opacity-100 font-bold' : 'opacity-40'}`}>Galería</button>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="hidden md:inline opacity-40">Hola, {user.displayName?.split(' ')[0]}</span>
                <button onClick={logout} className="opacity-40 hover:opacity-100 hover:text-red-500 transition-all">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button onClick={handleLogin} className="opacity-60 hover:opacity-100 transition-all">Entrar</button>
            )}
          </div>
        </nav>
      )}

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={view + (activeChallenge?.id || '')}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'home' && renderHome()}
            {view === 'challenge' && renderChallenge()}
            {view === 'gallery' && renderGallery()}
            {view === 'lab' && renderLab()}
            {view === 'privacy' && <PrivacyPolicy onBack={() => setView('home')} theme={theme} />}
            {view === 'terms' && <TermsAndConditions onBack={() => setView('home')} theme={theme} />}
            {view === 'contact' && <ContactForm onBack={() => setView('home')} theme={theme} user={user} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className={`py-12 px-6 border-t mt-20 transition-colors ${theme === 'modern' ? 'border-indigo-50 bg-indigo-50/10' : 'border-stone-200 bg-stone-50/30'}`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h3 className={`text-xl font-bold mb-2 ${theme === 'modern' ? 'display text-indigo-600' : ''}`}>Ponte Creativo</h3>
            <p className="opacity-40 text-sm italic">Cultivando el jardín de las palabras.</p>
          </div>
          <div className="flex gap-8 text-sm opacity-40 sans">
            <button onClick={() => setView('privacy')} className="hover:opacity-100 transition-opacity">Privacidad</button>
            <button onClick={() => setView('terms')} className="hover:opacity-100 transition-opacity">Términos</button>
            <button onClick={() => setView('contact')} className="hover:opacity-100 transition-opacity">Contacto</button>
          </div>
          <p className="text-xs opacity-30 sans">© 2026 Ponte Creativo. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
