import { Challenge } from './types';

export const CHALLENGES: Challenge[] = [
  {
    id: 'acento-en-su-lugar',
    title: 'El Acento en su Lugar',
    description: 'Escribe un texto con el máximo número de palabras esdrújulas.',
    example: 'Altísimos ánimos mayúsculos a los héroes. Recibámoslos cálidamente.',
    category: 'Juegos de Acentuación',
    icon: 'Zap'
  },
  {
    id: 'autobus-calambur',
    title: 'Autobús Calambur',
    description: 'En el calambur, lo escrito se puede leer de dos maneras, según juntemos sonidos. ¿Podéis crear al menos dos ejemplos?',
    example: 'Si quieres que te lo diga, espera. / Oro parece, plata no es.',
    category: 'Calambur',
    icon: 'Bus'
  },
  {
    id: 'en-el-tren-verde',
    title: 'En el Tren Verde',
    description: 'Con el monovocalismo intentamos crear textos usando solamente una vocal. ¿Os veis capaces?',
    example: 'Adán masca la manzana amarga, la traga, la carga ya cada garganta.',
    category: 'Monovocalismo',
    icon: 'Train'
  },
  {
    id: 'de-una-palabra-un-texto',
    title: 'De una Palabra, un Texto',
    description: 'Escribe una palabra en vertical. De cada una de las letras, empieza un verso o una frase corta. Al terminar, un acróstico debería asomar.',
    example: 'Mirada llena de cielo tiene:\nAmaneceres en su pupila de\nInalcanzables estrellas llena.\nTe lleva, siempre, inevitable\nEl universo a la sonrisa.',
    category: 'Acróstico',
    icon: 'Type'
  },
  {
    id: 'pequeno-y-con-sentido',
    title: 'Pequeño y con Sentido',
    description: 'Veamos quién consigue hacer la oración más larga usando solo palabras monosílabas.',
    example: 'La que se ve es la sal del mar.',
    category: 'Monosílabos',
    icon: 'Minimize2'
  },
  {
    id: 'muchos-significados',
    title: 'Muchos Significados',
    description: 'Elige palabras polisémicas y usa cada una de ellas en dos oraciones donde signifique cosas diferentes.',
    example: 'Con un pico escaló muy arriba / Hasta que el pico conquistó. / No cierra el pico la tía / cincuenta veces y pico ya lo contó.',
    category: 'Polisemia',
    icon: 'Layers'
  },
  {
    id: 'mezclar-y-revolver',
    title: 'Mezclar y Revolver',
    description: 'Elegid una de las siguientes palabras y escribid todos los anagramas que seáis capaces de encontrar: Roma, Leo, Renacer, Cabra, Cosa.',
    example: 'Sergio -> Riesgo / Roma -> Amor, Mora, Armo.',
    category: 'Anagramas',
    icon: 'Shuffle'
  },
  {
    id: 'ponte-si-puedes',
    title: 'Ponte (si puedes)...',
    description: 'Un reto dinámico que te propone diferentes escenarios y condiciones aleatorias para poner a prueba tu versatilidad.',
    example: 'Haz clic en el botón de aleatorizar para obtener tu misión.',
    category: 'Reto Dinámico',
    icon: 'Dices'
  }
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
