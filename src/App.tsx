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
import { CHALLENGES, PONTE_SUB_PROMPTS } from './constants';
import { Challenge, Publication, OperationType, FirestoreErrorInfo } from './types';
import { MicroStoryLab } from './components/MicroStoryLab';
import { WeatherActionLab } from './components/WeatherActionLab';
import { SurrealDialogLab } from './components/surreal_dialog/SurrealDialogLab';
import { WritingArea } from './components/WritingArea';
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
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Icon mapping
const ICON_MAP: Record<string, any> = {
  Zap, Bus, Train, Type, Minimize2, Layers, Shuffle, Dices, Ghost, Search, Swords, Sun, Sparkles
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
  const [theme, setTheme] = useState<'organic' | 'modern'>('modern');
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [pontePrompt, setPontePrompt] = useState<any>(null);
  const [view, setView] = useState<'home' | 'challenge' | 'gallery' | 'lab'>('home');
  const [publications, setPublications] = useState<Publication[]>([]);
  const [writingContent, setWritingContent] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState<string>('all');
  const [showExamples, setShowExamples] = useState(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState<'retos' | 'lab' | null>(null);

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
          authorName: user.displayName || 'Anónimo',
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

  const renderHome = () => (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <header className="text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-6xl md:text-9xl mb-4 tracking-tighter display`}
        >
          Pluma Creativa
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

  const renderChallenge = () => {
    if (!activeChallenge) return null;
    const isPonte = activeChallenge.id === 'ponte-si-puedes';

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

            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 italic mt-8">
              <strong className="block mb-2 not-italic text-stone-400 uppercase text-xs tracking-widest">Ejemplo:</strong>
              {isPonte && pontePrompt?.example ? pontePrompt.example : activeChallenge.example}
            </div>

            {renderExamplesCarousel(activeChallenge.id)}
          </div>

          {(!isPonte || pontePrompt) && (
            <WritingArea 
              user={user}
              writingContent={writingContent}
              setWritingContent={setWritingContent}
              onPublish={() => handlePublish()}
              isPublishing={isPublishing}
              publishSuccess={publishSuccess}
              onLogin={handleLogin}
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

    return (
      <div className="mt-8 pt-8 border-t border-stone-100">
        {!showExamples ? (
          <button 
            onClick={() => setShowExamples(true)}
            className="flex items-center gap-2 text-indigo-600 font-bold hover:underline"
          >
            <Sparkles className="w-5 h-5" /> Ver ejemplos de otros escritores e inspirarse
          </button>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-stone-400 uppercase text-xs tracking-widest">Inspiración de la comunidad</h4>
              <button 
                onClick={() => setShowExamples(false)}
                className="text-stone-400 hover:text-stone-800 text-xs font-bold uppercase tracking-widest"
              >
                Ocultar
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
              {examples.map((ex) => (
                <div 
                  key={ex.id} 
                  className="min-w-[300px] max-w-[400px] bg-white p-6 rounded-2xl border border-stone-100 shadow-sm snap-start"
                >
                  <p className="text-stone-600 italic line-clamp-4 mb-4">"{ex.content}"</p>
                  <span className="text-xs font-bold text-stone-400">— {ex.authorName}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGallery = () => {
    const filteredPubs = galleryFilter === 'all' 
      ? publications 
      : publications.filter(p => p.challengeId === galleryFilter);

    const labOptions = [
      { id: 'lab-micro-story', title: 'Microhistorias' },
      { id: 'lab-weather-action', title: 'Tiempo y Acciones' },
      { id: 'lab-surreal-dialog', title: 'Diálogos Surrealistas' }
    ];

    const getFilterLabel = () => {
      if (galleryFilter === 'all') return 'Todos';
      const challenge = CHALLENGES.find(c => c.id === galleryFilter);
      if (challenge) return challenge.title;
      const lab = labOptions.find(l => l.id === galleryFilter);
      if (lab) return lab.title;
      return 'Filtrar';
    };

    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h2 className="text-5xl font-bold mb-2">Galería Pública</h2>
            <p className="text-stone-500 italic">Inspiración compartida por nuestra comunidad.</p>
          </div>
          <div className="flex flex-col items-end gap-4 w-full md:w-auto">
            <div className="flex items-center gap-4 bg-stone-100 p-1.5 rounded-2xl relative">
              <button
                onClick={() => {
                  setGalleryFilter('all');
                  setOpenFilterDropdown(null);
                }}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  galleryFilter === 'all' 
                    ? 'bg-white text-stone-800 shadow-sm' 
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                Todos
              </button>

              <div className="relative">
                <button
                  onClick={() => setOpenFilterDropdown(openFilterDropdown === 'retos' ? null : 'retos')}
                  className={`px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                    CHALLENGES.some(c => c.id === galleryFilter)
                      ? 'bg-white text-stone-800 shadow-sm' 
                      : 'text-stone-400 hover:text-stone-600'
                  }`}
                >
                  Retos <ChevronDown className={`w-4 h-4 transition-transform ${openFilterDropdown === 'retos' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFilterDropdown === 'retos' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-64 bg-white border border-stone-100 rounded-2xl shadow-xl z-50 py-2"
                    >
                      {CHALLENGES.map(c => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setGalleryFilter(c.id);
                            setOpenFilterDropdown(null);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-stone-50 transition-colors ${
                            galleryFilter === c.id ? 'text-indigo-600 font-bold' : 'text-stone-600'
                          }`}
                        >
                          {c.title}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <button
                  onClick={() => setOpenFilterDropdown(openFilterDropdown === 'lab' ? null : 'lab')}
                  className={`px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                    labOptions.some(l => l.id === galleryFilter)
                      ? 'bg-white text-stone-800 shadow-sm' 
                      : 'text-stone-400 hover:text-stone-600'
                  }`}
                >
                  Laboratorio <ChevronDown className={`w-4 h-4 transition-transform ${openFilterDropdown === 'lab' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFilterDropdown === 'lab' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 w-64 bg-white border border-stone-100 rounded-2xl shadow-xl z-50 py-2"
                    >
                      {labOptions.map(l => (
                        <button
                          key={l.id}
                          onClick={() => {
                            setGalleryFilter(l.id);
                            setOpenFilterDropdown(null);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-stone-50 transition-colors ${
                            galleryFilter === l.id ? 'text-indigo-600 font-bold' : 'text-stone-600'
                          }`}
                        >
                          {l.title}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {galleryFilter !== 'all' && (
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  Filtro: {getFilterLabel()}
                </span>
              )}
              <button 
                onClick={() => setView('home')}
                className="text-stone-800 font-medium flex items-center hover:underline underline-offset-8"
              >
                Ver retos <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {filteredPubs.length === 0 ? (
            <div className="text-center py-20 card">
              <PenTool className="w-12 h-12 text-stone-200 mx-auto mb-4" />
              <p className="text-stone-400">No hay publicaciones para este filtro. ¡Sé el primero!</p>
            </div>
          ) : (
            filteredPubs.map((pub) => {
              const challenge = CHALLENGES.find(c => c.id === pub.challengeId);
              const labToolNames: Record<string, string> = {
                'lab-micro-story': 'Microhistorias',
                'lab-weather-action': 'Tiempo y Acciones',
                'lab-surreal-dialog': 'Diálogos Surrealistas'
              };
              const challengeTitle = pub.subTitle || challenge?.title || labToolNames[pub.challengeId] || 'Desconocido';
              
              return (
                <motion.div 
                  key={pub.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-8 md:p-10 relative group"
                >
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(pub)}
                        className="p-2 bg-stone-100 hover:bg-indigo-100 text-stone-600 hover:text-indigo-600 rounded-full transition-colors"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(pub.id)}
                        className="p-2 bg-stone-100 hover:bg-red-100 text-stone-600 hover:text-red-600 rounded-full transition-colors"
                        title="Borrar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                        Reto: {challengeTitle}
                      </span>
                      <h4 className="text-lg font-semibold text-stone-800">Por {pub.authorName}</h4>
                    </div>
                    <span className="text-xs text-stone-400">
                      {pub.createdAt?.toDate 
                        ? pub.createdAt.toDate().toLocaleDateString() 
                        : new Date(pub.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="prose prose-stone max-w-none mb-8">
                    <p className="text-2xl leading-relaxed whitespace-pre-wrap">{pub.content}</p>
                  </div>
                  <div className="pt-6 border-t border-stone-100">
                    <button 
                      onClick={() => navigateToSource(pub)}
                      className="text-xs font-bold text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                    >
                      Publicado desde {challengeTitle} <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const [activeLabTool, setActiveLabTool] = useState<string | null>(null);

  const renderLab = () => {
    if (activeLabTool === 'microstory') {
      return (
        <div className="max-w-6xl mx-auto px-4 py-12">
          <button 
            onClick={() => {
              setActiveLabTool(null);
              setWritingContent('');
            }}
            className="mb-8 flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity font-bold uppercase text-xs tracking-widest"
          >
            <ChevronRight className="w-4 h-4 rotate-180" /> Volver al Laboratorio
          </button>
          <MicroStoryLab 
            theme={theme}
            user={user}
            writingContent={writingContent}
            setWritingContent={setWritingContent}
            onPublish={() => handlePublish('lab-micro-story')}
            isPublishing={isPublishing}
            publishSuccess={publishSuccess}
            onLogin={handleLogin}
          />
          <div className="max-w-4xl mx-auto">
            {renderExamplesCarousel('lab-micro-story')}
          </div>
        </div>
      );
    }

    if (activeLabTool === 'weatheraction') {
      return (
        <div className="max-w-6xl mx-auto px-4 py-12">
          <button 
            onClick={() => {
              setActiveLabTool(null);
              setWritingContent('');
            }}
            className="mb-8 flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity font-bold uppercase text-xs tracking-widest"
          >
            <ChevronRight className="w-4 h-4 rotate-180" /> Volver al Laboratorio
          </button>
          <WeatherActionLab 
            theme={theme}
            user={user}
            writingContent={writingContent}
            setWritingContent={setWritingContent}
            onPublish={() => handlePublish('lab-weather-action')}
            isPublishing={isPublishing}
            publishSuccess={publishSuccess}
            onLogin={handleLogin}
          />
          <div className="max-w-4xl mx-auto">
            {renderExamplesCarousel('lab-weather-action')}
          </div>
        </div>
      );
    }

    if (activeLabTool === 'surrealdialog') {
      return (
        <div className="max-w-6xl mx-auto px-4 py-12">
          <button 
            onClick={() => {
              setActiveLabTool(null);
              setWritingContent('');
            }}
            className="mb-8 flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity font-bold uppercase text-xs tracking-widest"
          >
            <ChevronRight className="w-4 h-4 rotate-180" /> Volver al Laboratorio
          </button>
          <SurrealDialogLab 
            theme={theme}
            user={user}
            writingContent={writingContent}
            setWritingContent={setWritingContent}
            onPublish={() => handlePublish('lab-surreal-dialog')}
            isPublishing={isPublishing}
            publishSuccess={publishSuccess}
            onLogin={handleLogin}
          />
          <div className="max-w-4xl mx-auto">
            {renderExamplesCarousel('lab-surreal-dialog')}
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h2 className={`text-5xl md:text-7xl mb-4 font-bold ${theme === 'modern' ? 'display text-indigo-600' : ''}`}>Laboratorio de Ideas</h2>
          <p className="text-xl opacity-60 italic max-w-2xl mx-auto">
            Explora herramientas experimentales diseñadas para desbloquear nuevos horizontes en tu escritura.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            whileHover={{ y: -5 }}
            onClick={() => setActiveLabTool('microstory')}
            className="card p-10 flex flex-col items-center text-center group cursor-pointer"
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${theme === 'modern' ? 'bg-indigo-50 text-indigo-600' : 'bg-stone-100 text-stone-700'}`}>
              <Type className="w-10 h-10" />
            </div>
            <h3 className={`text-3xl font-bold mb-4 ${theme === 'modern' ? 'display' : ''}`}>Microhistorias</h3>
            <p className="opacity-60 mb-8 max-w-sm">Genera letras aleatorias y desafía tu mente a crear oraciones coherentes bajo presión creativa.</p>
            <button className="olive-button">Abrir Herramienta</button>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            onClick={() => setActiveLabTool('weatheraction')}
            className="card p-10 flex flex-col items-center text-center group cursor-pointer"
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${theme === 'modern' ? 'bg-indigo-50 text-indigo-600' : 'bg-stone-100 text-stone-700'}`}>
              <CloudSun className="w-10 h-10" />
            </div>
            <h3 className={`text-3xl font-bold mb-4 ${theme === 'modern' ? 'display' : ''}`}>Tiempo y Acciones</h3>
            <p className="opacity-60 mb-8 max-w-sm">Combina el tiempo atmosférico con acciones variadas para inspirar tus relatos más dinámicos.</p>
            <button className="olive-button">Abrir Herramienta</button>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            onClick={() => setActiveLabTool('surrealdialog')}
            className="card p-10 flex flex-col items-center text-center group cursor-pointer"
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${theme === 'modern' ? 'bg-indigo-50 text-indigo-600' : 'bg-stone-100 text-stone-700'}`}>
              <MessageSquare className="w-10 h-10" />
            </div>
            <h3 className={`text-3xl font-bold mb-4 ${theme === 'modern' ? 'display' : ''}`}>Diálogos Surrealistas</h3>
            <p className="opacity-60 mb-8 max-w-sm">Genera personajes absurdos y crea conversaciones imposibles entre objetos y conceptos.</p>
            <button className="olive-button">Abrir Herramienta</button>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="card p-10 flex flex-col items-center text-center group opacity-50"
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${theme === 'modern' ? 'bg-indigo-50 text-indigo-600' : 'bg-stone-100 text-stone-700'}`}>
              <Globe className="w-10 h-10" />
            </div>
            <h3 className={`text-3xl font-bold mb-4 ${theme === 'modern' ? 'display' : ''}`}>Generador de Mundos</h3>
            <p className="opacity-60 mb-8 max-w-sm">Crea ecosistemas, mitologías y geografías únicas para tus historias de fantasía o ciencia ficción.</p>
            <button className="olive-button opacity-50 cursor-not-allowed">Próximamente</button>
          </motion.div>

          <div className="md:col-span-2 card p-12 bg-indigo-600/5 border-dashed border-2 border-indigo-200 flex flex-col items-center justify-center text-center">
            <Zap className="w-12 h-12 text-indigo-400 mb-4" />
            <h4 className="text-2xl font-bold mb-2">¿Tienes una herramienta propia?</h4>
            <p className="opacity-60 max-w-lg mb-6">Estamos listos para integrar tus otras aplicaciones de AI Studio aquí mismo para centralizar tu flujo creativo.</p>
            <div className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Listo para integración</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col theme-${theme}`}>
      <nav className={`sticky top-0 z-50 backdrop-blur-md border-b px-6 py-4 flex justify-between items-center transition-all duration-500 ${theme === 'modern' ? 'bg-white/70 border-indigo-50' : 'bg-white/80 border-stone-100'}`}>
        <div className="flex items-center gap-8">
          <div 
            className={`text-2xl font-bold cursor-pointer tracking-tighter ${theme === 'modern' ? 'display text-indigo-600' : 'text-stone-900'}`}
            onClick={() => setView('home')}
          >
            Pluma Creativa
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
          </div>
        </div>

        <div className="flex items-center gap-6 sans text-sm font-medium">
          <button onClick={() => setView('home')} className={`hover:opacity-100 transition-all ${view === 'home' ? 'opacity-100 font-bold' : 'opacity-40'}`}>Retos</button>
          <button onClick={() => setView('gallery')} className={`hover:opacity-100 transition-all ${view === 'gallery' ? 'opacity-100 font-bold' : 'opacity-40'}`}>Galería</button>
          <button onClick={() => setView('lab')} className={`hover:opacity-100 transition-all ${view === 'lab' ? 'opacity-100 font-bold' : 'opacity-40'}`}>Laboratorio</button>
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
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className={`py-12 px-6 border-t mt-20 transition-colors ${theme === 'modern' ? 'border-indigo-50 bg-indigo-50/10' : 'border-stone-200 bg-stone-50/30'}`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h3 className={`text-xl font-bold mb-2 ${theme === 'modern' ? 'display text-indigo-600' : ''}`}>Pluma Creativa</h3>
            <p className="opacity-40 text-sm italic">Cultivando el jardín de las palabras.</p>
          </div>
          <div className="flex gap-8 text-sm opacity-40 sans">
            <a href="#" className="hover:opacity-100 transition-opacity">Privacidad</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Términos</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Contacto</a>
          </div>
          <p className="text-xs opacity-30 sans">© 2026 Pluma Creativa. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
