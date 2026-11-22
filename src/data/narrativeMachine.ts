export type ColumnId =
  | 'narrador'
  | 'persona'
  | 'protagonista'
  | 'antagonista'
  | 'tiempo'
  | 'espacio';

export interface MachineOption {
  id: string;
  /** Texto principal que se ve en el carrete. */
  label: string;
  /** Etiqueta pequeña sobre el texto principal (p. ej. «Interno» / «Externo»). */
  tag?: string;
  /** Aclaración o pista que se ve debajo del texto principal. */
  hint?: string;
  /** Solo para narradores: personas gramaticales con las que funciona de forma natural. */
  persons?: string[];
}

export interface MachineColumn {
  id: ColumnId;
  title: string;
  /** Las columnas opcionales solo aparecen al pulsar «Añadir tiempo y lugar». */
  optional?: boolean;
  options: MachineOption[];
}

const NARRATORS: MachineOption[] = [
  { id: 'protagonista', tag: 'Interno', label: 'Protagonista', hint: 'Cuenta su propia historia.', persons: ['p1', 'p2'] },
  { id: 'testigo', tag: 'Interno', label: 'Testigo', hint: 'Está dentro de los hechos, pero no es el centro.', persons: ['p1', 'p2'] },
  { id: 'focalizado', tag: 'Interno', label: 'Focalizado', hint: 'Solo sabe y siente lo que sabe y siente un personaje.', persons: ['p3'] },
  { id: 'omnisciente', tag: 'Externo', label: 'Omnisciente', hint: 'Lo sabe todo, incluso lo que nadie dice.', persons: ['p3'] },
  { id: 'objetivo', tag: 'Externo', label: 'Objetivo', hint: 'Solo cuenta lo que se ve y se oye, como una cámara.', persons: ['p3'] },
  { id: 'cronista', tag: 'Externo', label: 'Cronista', hint: 'Relata lo que investigó o lo que le contaron.', persons: ['p1', 'p3'] }
];

const PERSONS: MachineOption[] = [
  { id: 'p1', label: '1.ª persona', hint: '«Salí de casa antes del amanecer.»' },
  { id: 'p2', label: '2.ª persona', hint: '«Sales de casa antes del amanecer.»' },
  { id: 'p3', label: '3.ª persona', hint: '«Salió de casa antes del amanecer.»' }
];

/**
 * Cada tipo de personaje aporta el mismo número de ejemplos, para que todos los
 * tipos tengan la misma probabilidad de salir. Los ejemplos son solo una sugerencia.
 */
const buildCharacters = (prefix: string, groups: Record<string, string[]>): MachineOption[] =>
  Object.entries(groups).flatMap(([type, examples]) =>
    examples.map((example) => ({
      id: `${prefix}-${type.toLowerCase()}-${example}`,
      label: type,
      hint: example
    }))
  );

const PROTAGONISTS = buildCharacters('prot', {
  Humano: [
    'una farera jubilada', 'un niño con fiebre', 'una cartera rural', 'un viejo relojero', 'una cirujana insomne',
    'un forastero sin nombre', 'una pareja de mellizos', 'un aprendiz de brujo', 'una vecina curiosa', 'un jefe de estación'
  ],
  Animal: [
    'una gaviota', 'un perro callejero', 'una polilla', 'un cuervo', 'una tortuga centenaria',
    'un zorro viejo', 'una araña tejedora', 'un pulpo', 'un gato de azotea', 'una cigüeña'
  ],
  Inanimado: [
    'un reloj parado', 'una maleta olvidada', 'una farola', 'un paraguas roto', 'una llave sin cerradura',
    'una silla vacía', 'un espejo antiguo', 'una carta sin abrir', 'un semáforo', 'una bicicleta oxidada'
  ]
});

const ANTAGONISTS = buildCharacters('ant', {
  Humano: [
    'un casero implacable', 'una rival de la infancia', 'un vigilante nocturno', 'un testigo que lo sabe todo', 'una jueza severa',
    'un impostor', 'un hermano envidioso', 'una vecina que espía', 'un cobrador', 'un coleccionista obsesivo'
  ],
  Animal: [
    'una plaga de hormigas', 'un gallo madrugador', 'un tiburón', 'una urraca ladrona', 'un jabalí',
    'un enjambre de avispas', 'una serpiente', 'un perro guardián', 'una rata de alcantarilla', 'un lobo cansado'
  ],
  Inanimado: [
    'un cerrojo atascado', 'un despertador', 'una escalera sin fin', 'una puerta que no se abre', 'un teléfono que suena',
    'un espejo mentiroso', 'un reloj implacable', 'un ascensor averiado', 'una cremallera atascada', 'una balanza trucada'
  ],
  // Fuerzas sin cuerpo que se oponen al protagonista (conflicto contra el destino,
  // la naturaleza, la sociedad o uno mismo). Solo se ofrecen como antagonistas.
  'Fuerza abstracta': [
    'el paso del tiempo', 'la culpa', 'el olvido', 'el miedo a no ser suficiente', 'una promesa incumplida',
    'la soledad', 'uno mismo', 'la tormenta', 'la niebla', 'el destino'
  ]
});

const TIMES: MachineOption[] = [
  { id: 'pasado', label: 'Pasado', hint: 'La historia ya ocurrió.' },
  { id: 'presente', label: 'Presente', hint: 'Está ocurriendo ahora.' },
  { id: 'futuro', label: 'Futuro', hint: 'Todavía no ha ocurrido.' }
];

const SPACES: MachineOption[] = [
  { id: 'real', label: 'Real', hint: 'Un lugar que existe en el mapa.' },
  { id: 'inventado', label: 'Inventado', hint: 'Un lugar que solo existe en tu historia.' }
];

/** Orden de visualización: primero las cuatro columnas principales y después las opcionales. */
export const MACHINE_COLUMNS: MachineColumn[] = [
  { id: 'narrador', title: 'Narrador', options: NARRATORS },
  { id: 'persona', title: 'Persona', options: PERSONS },
  { id: 'protagonista', title: 'Protagonista', options: PROTAGONISTS },
  { id: 'antagonista', title: 'Antagonista', options: ANTAGONISTS },
  { id: 'tiempo', title: 'Tiempo', optional: true, options: TIMES },
  { id: 'espacio', title: 'Espacio', optional: true, options: SPACES }
];

export const COLUMN_BY_ID = Object.fromEntries(
  MACHINE_COLUMNS.map((column) => [column.id, column])
) as Record<ColumnId, MachineColumn>;

export type Selection = Record<ColumnId, MachineOption>;

const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

/** Un narrador funciona con una persona si no declara restricciones o la incluye. */
export const isCompatible = (narrator: MachineOption, person: MachineOption): boolean =>
  !narrator.persons || narrator.persons.includes(person.id);

/**
 * Sortea de nuevo las columnas indicadas y devuelve una selección nueva.
 *
 * - `rolled`: columnas que cambian.
 * - `active`: columnas que cuentan como condición (marcadas y visibles). Solo estas
 *   se tienen en cuenta al evitar combinaciones contradictorias entre narrador y persona.
 * - Si solo se cambia una columna, se evita repetir el valor que ya tenía.
 */
export const drawColumns = (current: Selection, rolled: ColumnId[], active: ColumnId[]): Selection => {
  const next: Selection = { ...current };
  const rolling = new Set(rolled);
  const isActive = (id: ColumnId) => active.includes(id);
  const single = rolled.length === 1;

  // El narrador se sortea antes que la persona para que esta pueda adaptarse a él.
  const order = MACHINE_COLUMNS.map((column) => column.id).filter((id) => rolling.has(id));

  order.forEach((id) => {
    let options = COLUMN_BY_ID[id].options;

    if (id === 'narrador' && isActive('persona') && !rolling.has('persona')) {
      const compatible = options.filter((narrator) => isCompatible(narrator, current.persona));
      if (compatible.length > 0) options = compatible;
    }
    if (id === 'persona' && isActive('narrador')) {
      const compatible = options.filter((person) => isCompatible(next.narrador, person));
      if (compatible.length > 0) options = compatible;
    }
    if (single && options.length > 1) {
      options = options.filter((option) => option.id !== current[id].id);
    }
    next[id] = pick(options);
  });

  return next;
};

export const drawAll = (): Selection => {
  const ids = MACHINE_COLUMNS.map((column) => column.id);
  const empty = {} as Selection;
  ids.forEach((id) => { empty[id] = COLUMN_BY_ID[id].options[0]; });
  return drawColumns(empty, ids, ids);
};

export const randomOption = (id: ColumnId): MachineOption => pick(COLUMN_BY_ID[id].options);
