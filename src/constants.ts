import { Challenge } from './types';

export const CHALLENGES: Challenge[] = [
  {
    id: 'acento-en-su-lugar',
    title: 'El Acento en su Lugar',
    description: 'Escribe un texto con el máximo número de palabras esdrújulas.',
    example: 'Altísimos ánimos mayúsculos a los héroes. Recibámoslos cálidamente.',
    category: 'Juegos de Acentuación',
    icon: 'Zap',
    difficulty: 'Fácil',
    duration: '5 min',
    color: '#FF6B6B',
    tags: ['Acentuación', 'Juego', '5 min']
  },
  {
    id: 'autobus-calambur',
    title: 'Autobús Calambur',
    description: 'En el calambur, lo escrito se puede leer de dos maneras, según juntemos sonidos. ¿Podéis crear al menos dos ejemplos?',
    example: 'Si quieres que te lo diga, espera. / Oro parece, plata no es.',
    category: 'Calambur',
    icon: 'Bus',
    difficulty: 'Media',
    duration: '10 min',
    color: '#4ECDC4',
    tags: ['Juego de palabras', 'Ingenio', '10 min']
  },
  {
    id: 'en-el-tren-verde',
    title: 'En el Tren Verde',
    description: 'Con el monovocalismo intentamos crear textos usando solamente una vocal. ¿Os veis capaces?',
    example: 'Adán masca la manzana amarga, la traga, la carga ya cada garganta.',
    category: 'Monovocalismo',
    icon: 'Train',
    difficulty: 'Difícil',
    duration: '15 min',
    color: '#45B7D1',
    tags: ['Restricción', 'Vocales', '15 min']
  },
  {
    id: 'de-una-palabra-un-texto',
    title: 'De una Palabra, un Texto',
    description: 'Escribe una palabra en vertical. De cada una de las letras, empieza un verso o una frase corta. Al terminar, un acróstico debería asomar.',
    example: 'Mirada llena de cielo tiene:\nAmaneceres en su pupila de\nInalcanzables estrellas llena.\nTe lleva, siempre, inevitable\nEl universo a la sonrisa.',
    category: 'Acróstico',
    icon: 'Type',
    difficulty: 'Media',
    duration: '10 min',
    color: '#26DE81',
    tags: ['Poesía', 'Estructura', '10 min']
  },
  {
    id: 'pequeno-y-con-sentido',
    title: 'Pequeño y con Sentido',
    description: 'Veamos quién consigue hacer la oración más larga usando solo palabras monosílabas.',
    example: 'La que se ve es la sal del mar.',
    category: 'Monosílabos',
    icon: 'Minimize2',
    difficulty: 'Fácil',
    duration: '5 min',
    color: '#FED330',
    tags: ['Brevedad', 'Léxico', '5 min']
  },
  {
    id: 'muchos-significados',
    title: 'Muchos Significados',
    description: 'Elige palabras polisémicas y usa cada una de ellas en dos oraciones donde signifique cosas diferentes.',
    example: 'Con un pico escaló muy arriba.\nHasta que el pico conquistó.\nNo cierra el pico la tía,\ncincuenta veces y pico ya lo contó.',
    category: 'Polisemia',
    icon: 'Layers',
    difficulty: 'Media',
    duration: '10 min',
    color: '#FF8A5B',
    tags: ['Semántica', 'Vocabulario', '10 min']
  },
  {
    id: 'mezclar-y-revolver',
    title: 'Mezclar y Revolver',
    description: 'Elegid una de las siguientes palabras y escribid todos los anagramas que seáis capaces de encontrar: Roma, Leo, Renacer, Cabra, Cosa.',
    example: 'Sergio -> Riesgo\nRoma -> Amor, Mora, Armo.',
    category: 'Anagramas',
    icon: 'Shuffle',
    difficulty: 'Fácil',
    duration: '5 min',
    color: '#A55EEA',
    tags: ['Anagramas', 'Letras', '5 min']
  },
  {
    id: 'iguales-pero-no',
    title: 'Iguales pero no',
    description: 'Usa palabras homónimas (son palabras diferentes pero se escriben o suenan igual). Cuantas más, mejor ¡en un único texto!',
    example: 'El que vino solo no nada nada, solo vino al vino que regalan.',
    category: 'Homónimos',
    icon: 'RefreshCw',
    difficulty: 'Media',
    duration: '10 min',
    color: '#4b7bec',
    tags: ['Semántica', 'Juego de palabras', '10 min']
  },
  {
    id: 'ponte-si-puedes',
    title: 'Ponte (si puedes)...',
    description: 'Un reto dinámico que te propone diferentes escenarios y condiciones aleatorias para poner a prueba tu versatilidad.',
    example: 'Haz clic en el botón de aleatorizar para obtener tu misión.',
    category: 'Reto Dinámico',
    icon: 'Dices',
    difficulty: 'Media',
    duration: 'Variable',
    color: '#34495E',
    tags: ['Creatividad', 'Personajes', 'Inspiración']
  },
  {
    id: 'simon-romantico',
    title: 'Romántico',
    description: 'Escribe un relato de estilo romántico de no más de 500 palabras en el que participe un elefante, un espejo y una chica de 19 años.',
    example: 'Ella se miró en el espejo, ajustando su vestido de 19 primaveras, mientras el elefante de peluche observaba desde la cama...',
    category: 'Simón dice...',
    icon: 'Heart',
    difficulty: 'Media',
    duration: '15 min',
    tags: ['Simón dice...', 'Romance', 'Animales']
  },
  {
    id: 'simon-musico-asesino',
    title: 'Músico ciego asesino',
    description: 'Escribe una historia que tiene de protagonista a un joven ciego, culto, con dominio de instrumentos musicales, punto de cruz y masajes; y que además es asesino a sueldo.',
    example: 'Sus dedos, expertos en el violín y el punto de cruz, no temblaron al preparar el siguiente encargo...',
    category: 'Simón dice...',
    icon: 'Swords',
    difficulty: 'Difícil',
    duration: '20 min',
    tags: ['Simón dice...', 'Personajes', 'Misterio']
  },
  {
    id: 'simon-acabar-vida',
    title: 'Acabar una vida o no',
    description: 'Escribe un monólogo filosófico de un suicida a punto de quitarse la vida. Al final debe elegir si se suicida o no, tú eliges.',
    example: '¿Ser o no ser? El borde del puente parece la única respuesta lógica a una vida de preguntas sin respuesta...',
    category: 'Simón dice...',
    icon: 'AlertCircle',
    difficulty: 'Difícil',
    duration: '15 min',
    tags: ['Simón dice...', 'Filosofía', 'Drama']
  },
  {
    id: 'simon-mariposa',
    title: 'Mariposa',
    description: 'Crea un texto de terror sobre una mariposa.',
    example: 'Sus alas no eran de seda, sino de piel humana seca, y su aleteo sonaba como un susurro de ultratumba...',
    category: 'Simón dice...',
    icon: 'Ghost',
    difficulty: 'Media',
    duration: '10 min',
    tags: ['Simón dice...', 'Terror', 'Naturaleza']
  },
  {
    id: 'simon-con-estas-palabras',
    title: 'Con estas palabras',
    description: 'Escribe una historia de no más de 250 palabras, tiene que salir: un espejo, una flor y una escultura.',
    example: 'Frente al espejo, la flor marchita parecía una escultura de dolor olvidada por el tiempo.',
    category: 'Simón dice...',
    icon: 'Type',
    difficulty: 'Fácil',
    duration: '10 min',
    tags: ['Simón dice...', 'Restricción', '10 min']
  },
  {
    id: 'simon-creacion-mundo',
    title: 'Creación del mundo',
    description: 'Escribe un relato de extensión libre acerca de la creación del mundo fusionando dos teorías: la serpiente cósmica (mitología africana) y el Caos/Gea (mitología griega).',
    example: 'En el principio era el Caos, y en su centro, la serpiente cósmica comenzó a desenrollarse para dar forma a Gea...',
    category: 'Simón dice...',
    icon: 'Globe',
    difficulty: 'Difícil',
    duration: '20 min',
    tags: ['Simón dice...', 'Mitología', 'Épico']
  },
  {
    id: 'simon-fantasia-reves',
    title: 'Fantasía al revés',
    description: 'Escribe un relato corto (200 palabras) de fantasía épica que incluya un espadachín cobarde, un dragón vegetariano y dos personalidades o famosos.',
    example: 'El espadachín temblaba mientras el dragón masticaba lechuga, discutiendo con Cervantes y Einstein sobre el destino del reino.',
    category: 'Simón dice...',
    icon: 'Dices',
    difficulty: 'Media',
    duration: '15 min',
    tags: ['Simón dice...', 'Fantasía', 'Humor']
  },
  {
    id: 'simon-hiperbreves',
    title: 'Hiperbreves',
    description: 'Escribe tres relatos hiperbreves (no mas de 50 palabras), uno que exprese mucho amor, otro que exprese mucha tristeza y otro que exprese mucho odio.',
    example: 'Amor: Sus ojos eran mi único hogar. Tristeza: El paraguas no cubría su ausencia. Odio: Su nombre era ceniza en mi boca.',
    category: 'Simón dice...',
    icon: 'Minimize2',
    difficulty: 'Media',
    duration: '10 min',
    tags: ['Simón dice...', 'Brevedad', 'Emociones']
  },
  {
    id: 'simon-dios-perez',
    title: 'Dios y Pérez',
    description: 'Escribe un diálogo entre El ratoncito Pérez y Dios, de carácter humorístico donde se debata el sentido de la vida. Sin límite de palabras.',
    example: '—¿Y bien? —preguntó Pérez—. ¿Por qué los dientes? —Porque el calcio es la moneda del alma —respondió Dios con una sonrisa.',
    category: 'Simón dice...',
    icon: 'MessageSquare',
    difficulty: 'Media',
    duration: '15 min',
    tags: ['Simón dice...', 'Humor', 'Diálogo']
  },
  {
    id: 'simon-triangulo',
    title: 'Triángulo',
    description: 'Escribe una historia de amor a tres bandas entre un canario, un gato y un perro. A tu gusto quién se enamora de quién.',
    example: 'El canario cantaba para el gato, quien solo tenía ojos para el perro, mientras este último soñaba con las plumas amarillas.',
    category: 'Simón dice...',
    icon: 'Layers',
    difficulty: 'Media',
    duration: '15 min',
    tags: ['Simón dice...', 'Animales', 'Amor']
  },
  {
    id: 'simon-investidura',
    title: 'Investidura',
    description: 'Escribe el discurso de investidura de la primera presidenta del gobierno, extensión libre.',
    example: 'Ciudadanos, hoy no solo asumo un cargo, sino la responsabilidad de siglos de silencio que hoy se rompen con esperanza.',
    category: 'Simón dice...',
    icon: 'CheckCircle2',
    difficulty: 'Media',
    duration: '15 min',
    tags: ['Simón dice...', 'Política', 'Discurso']
  }
];

export const STARTING_PHRASES = [
  "Aquel martes, el cielo decidió cambiar de color...",
  "Nunca imaginé que una simple llave abriría esa puerta.",
  "El silencio en la biblioteca era casi ensordecedor.",
  "Había algo extraño en la forma en que el gato me miraba.",
  "La última carta llegó con un sello que no reconocí.",
  "A las tres de la mañana, el teléfono sonó por fin.",
  "El mapa indicaba un lugar que no debería existir.",
  "Sus pasos resonaban en el pasillo vacío.",
  "Todo comenzó con una pequeña mentira piadosa.",
  "El olor a café recién hecho inundaba la estancia.",
  "La maleta estaba abierta, pero no faltaba nada.",
  "Aquel tren nunca llegaba a su destino.",
  "La sombra en la pared no se movía con él.",
  "El espejo devolvió una imagen que no era la suya.",
  "Un sobre azul esperaba bajo el limpiaparabrisas."
];

export const PONTE_SUB_PROMPTS = [
  {
    id: 'misterioso',
    title: "Ponte misterioso",
    description: "Escribe un relato donde un grupo de personajes resuelvan un misterio. Debe incluir: Un árbol viejo, un mensaje y Suances.",
    example: "El viejo roble de la plaza de Suances guardaba un sobre lacrado entre sus raíces...",
    icon: "Ghost"
  },
  {
    id: 'investigar',
    title: "Ponte a investigar",
    description: "Escribe la historia de un objeto personal importante para alguien de tu familia.",
    example: "El reloj de bolsillo de mi abuelo no daba la hora, pero contaba historias de la guerra...",
    icon: "Search"
  },
  {
    id: 'romano',
    title: "Ponte romano",
    description: "Describe el encuentro entre los ejércitos romanos y el pueblo cántabro. Debes incluir, al menos, cuatro (4) frases en latín.",
    example: "Veni, vidi, vici. Los cántabros observaban desde las cumbres...",
    icon: "Swords"
  },
  {
    id: 'mitologico',
    title: "Ponte mitológico",
    description: "Elige un personaje mitológico y sitúalo en el mundo actual.",
    example: "Ícaro trabajaba ahora en una empresa de mensajería con drones, pero seguía mirando al sol...",
    icon: "Sparkles"
  },
  {
    id: 'divino',
    title: "Ponte Divino",
    description: "Describe el encuentro entre dos dioses romanos. Debes incluir, al menos, alguno de sus vástagos.",
    example: "Marte y Venus discutían en un café, mientras Cupido jugaba con su arco de juguete...",
    icon: "Sun"
  }
];
