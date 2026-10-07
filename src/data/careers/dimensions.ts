import { DimensionCategory, VocationalDimension } from '../../types/career';

export const VOCATIONAL_DIMENSIONS: VocationalDimension[] = [
  // 1. INTERESES (12)
  {
    id: 'technology',
    name: 'Tecnología y Sistemas Digitales',
    description: 'Curiosidad por cómo funcionan el software, las redes, la inteligencia artificial y las herramientas digitales.',
    category: 'interest',
  },
  {
    id: 'science',
    name: 'Ciencias e Investigación Natural',
    description: 'Interés por comprender fenómenos físicos, químicos, biológicos o matemáticos mediante la observación y experimentación.',
    category: 'interest',
  },
  {
    id: 'health',
    name: 'Salud y Bienestar Integral',
    description: 'Motivación por el cuidado de la vida humana, la prevención de enfermedades, la rehabilitación y la salud mental.',
    category: 'interest',
  },
  {
    id: 'engineering',
    name: 'Ingeniería, Procesos e Infraestructura',
    description: 'Atracción por diseñar, construir y optimizar máquinas, obras civiles, sistemas productivos o soluciones técnicas.',
    category: 'interest',
  },
  {
    id: 'business',
    name: 'Negocios, Gestión y Mercados',
    description: 'Interés por cómo crecen las organizaciones, la estrategia comercial, las finanzas y la coordinación de recursos.',
    category: 'interest',
  },
  {
    id: 'communication',
    name: 'Comunicación, Medios y Narrativa',
    description: 'Gusto por contar historias, informar, producir contenidos audiovisuales y conectar audiencias.',
    category: 'interest',
  },
  {
    id: 'social_sciences',
    name: 'Sociedad, Cultura y Comportamiento',
    description: 'Curiosidad por entender las dinámicas sociales, la historia, la cultura, la política y las comunidades humanas.',
    category: 'interest',
  },
  {
    id: 'education',
    name: 'Educación, Pedagogía y Formación',
    description: 'Interés por acompañar procesos de aprendizaje, explicar conceptos y potenciar el desarrollo de otras personas.',
    category: 'interest',
  },
  {
    id: 'arts_creativity',
    name: 'Expresión Artística y Cultural',
    description: 'Sensibilidad hacia la estética, las artes visuales, escénicas, literarias o sonoras como medio de expresión.',
    category: 'interest',
  },
  {
    id: 'design',
    name: 'Diseño de Productos, Espacios y Experiencias',
    description: 'Atracción por proyectar objetos, espacios arquitectónicos, piezas gráficas o interfaces funcionales y atractivas.',
    category: 'interest',
  },
  {
    id: 'environment',
    name: 'Medio Ambiente y Sostenibilidad',
    description: 'Interés por la conservación de ecosistemas, el manejo responsable de recursos naturales y la transición ecológica.',
    category: 'interest',
  },
  {
    id: 'law_public_service',
    name: 'Leyes, Justicia y Gestión Pública',
    description: 'Motivación por las normas, los derechos ciudadanos, las políticas públicas y el funcionamiento de las instituciones.',
    category: 'interest',
  },

  // 2. APTITUDES PERCIBIDAS (14)
  {
    id: 'logical_thinking',
    name: 'Pensamiento Lógico',
    description: 'Facilidad percibida para estructurar secuencias de pasos, detectar patrones e identificar relaciones de causa y efecto.',
    category: 'aptitude',
  },
  {
    id: 'analytical_thinking',
    name: 'Pensamiento Analítico',
    description: 'Disposición para descomponer situaciones complejas en partes más simples y evaluar información con rigor.',
    category: 'aptitude',
  },
  {
    id: 'problem_solving',
    name: 'Resolución de Problemas',
    description: 'Capacidad percibida para encontrar salidas prácticas y efectivas ante obstáculos técnicos, humanos o de gestión.',
    category: 'aptitude',
  },
  {
    id: 'mathematical_reasoning',
    name: 'Razonamiento Cuantitativo y Matemático',
    description: 'Comodidad al trabajar con números, proporciones, modelos estadísticos o cálculos aplicados.',
    category: 'aptitude',
  },
  {
    id: 'verbal_communication',
    name: 'Comunicación Oral y Argumentación',
    description: 'Facilidad para expresar ideas con claridad al hablar, exponer puntos de vista, negociar o dialogar con otros.',
    category: 'aptitude',
  },
  {
    id: 'written_communication',
    name: 'Comunicación Escrita y Redacción',
    description: 'Habilidad percibida para estructurar textos claros, persuasivos o técnicos y sintetizar información por escrito.',
    category: 'aptitude',
  },
  {
    id: 'creativity',
    name: 'Imaginación y Generación de Ideas',
    description: 'Facilidad para proponer enfoques originales, conectar conceptos distintos e imaginar alternativas nuevas.',
    category: 'aptitude',
  },
  {
    id: 'visual_thinking',
    name: 'Pensamiento Visual y Espacial',
    description: 'Capacidad percibida para imaginar formas, proporciones, composiciones gráficas o espacios en dos y tres dimensiones.',
    category: 'aptitude',
  },
  {
    id: 'organization',
    name: 'Organización y Planificación',
    description: 'Facilidad para ordenar tareas, administrar tiempos, estructurar recursos y hacer seguimiento a procesos.',
    category: 'aptitude',
  },
  {
    id: 'research',
    name: 'Indagación e Investigación',
    description: 'Hábito de buscar fuentes confiables, contrastar evidencias y profundizar antes de sacar conclusiones.',
    category: 'aptitude',
  },
  {
    id: 'leadership',
    name: 'Coordinación y Liderazgo',
    description: 'Disposición para tomar la iniciativa, orientar grupos, facilitar acuerdos y movilizar proyectos.',
    category: 'aptitude',
  },
  {
    id: 'teamwork',
    name: 'Colaboración y Trabajo en Equipo',
    description: 'Facilidad para escuchar diferentes perspectivas, construir acuerdos y sumar esfuerzos hacia una meta común.',
    category: 'aptitude',
  },
  {
    id: 'practical_skills',
    name: 'Destreza Práctica y Operativa',
    description: 'Comodidad al manipular instrumentos, construir prototipos, realizar trabajo de campo o ejecutar procedimientos técnicos.',
    category: 'aptitude',
  },
  {
    id: 'attention_to_detail',
    name: 'Atención al Detalle y Precisión',
    description: 'Cuidado para detectar errores sutiles, seguir protocolos rigurosos y mantener altos estándares de exactitud.',
    category: 'aptitude',
  },

  // 3. PREFERENCIAS DE ENTORNO Y FORMA DE TRABAJO (12)
  {
    id: 'working_with_people',
    name: 'Interactuar Directamente con Personas',
    description: 'Preferencia por entornos donde el contacto humano, la escucha, la asesoría o la atención directa son centrales.',
    category: 'work_preference',
  },
  {
    id: 'working_with_data',
    name: 'Trabajar con Datos e Información',
    description: 'Gusto por analizar bases de datos, indicadores financieros, estadísticas, registros o métricas.',
    category: 'work_preference',
  },
  {
    id: 'working_with_technology',
    name: 'Operar y Crear con Tecnología',
    description: 'Preferencia por entornos apoyados en software especializado, programación, automatización o sistemas digitales.',
    category: 'work_preference',
  },
  {
    id: 'working_with_objects',
    name: 'Trabajar con Equipos, Materiales o Terreno',
    description: 'Gusto por actividades tangibles en laboratorios, plantas, obras, talleres o ecosistemas naturales.',
    category: 'work_preference',
  },
  {
    id: 'working_with_ideas',
    name: 'Trabajar con Conceptos y Teorías',
    description: 'Preferencia por la reflexión intelectual, el diseño conceptual, la estrategia o el análisis abstracto.',
    category: 'work_preference',
  },
  {
    id: 'working_independently',
    name: 'Trabajo Autónomo y Concentrado',
    description: 'Comodidad al desarrollar tareas con alto grado de concentración individual y gestión propia del ritmo.',
    category: 'work_preference',
  },
  {
    id: 'working_in_teams',
    name: 'Entornos Colaborativos y Multidisciplinarios',
    description: 'Preferencia por dinámicas grupales constantes donde se co-crea y se comparte responsabilidad a diario.',
    category: 'work_preference',
  },
  {
    id: 'creating_things',
    name: 'Diseñar y Producir Obras o Soluciones',
    description: 'Gusto por ver materializado un producto propio: código, planos, piezas audiovisuales, diseños o textos.',
    category: 'work_preference',
  },
  {
    id: 'researching',
    name: 'Explorar, Experimentar y Documentar',
    description: 'Preferencia por actividades de estudio profundo, pruebas de laboratorio, trabajo documental o análisis de campo.',
    category: 'work_preference',
  },
  {
    id: 'organizing',
    name: 'Estructurar Procesos y Operaciones',
    description: 'Gusto por coordinar logística, presupuestos, cronogramas, normativas o flujos de trabajo.',
    category: 'work_preference',
  },
  {
    id: 'solving_problems',
    name: 'Diagnosticar y Resolver Casos Complejos',
    description: 'Preferencia por entornos dinámicos donde cada día implica diagnosticar fallas, conflictos o necesidades específicas.',
    category: 'work_preference',
  },
  {
    id: 'helping_others',
    name: 'Cuidar, Enseñar o Acompañar a Otros',
    description: 'Gusto por actividades cuyo propósito inmediato es aliviar, orientar, proteger o formar a personas y comunidades.',
    category: 'work_preference',
  },

  // 4. MOTIVADORES PROFESIONALES (12)
  {
    id: 'creative_freedom',
    name: 'Libertad Creativa y Sello Propio',
    description: 'Valorar espacios donde se pueda innovar estéticamente o conceptualmente sin depender siempre de rutinas rígidas.',
    category: 'motivator',
  },
  {
    id: 'stability',
    name: 'Estabilidad y Previsibilidad',
    description: 'Priorizar trayectorias profesionales estructuradas, con reglas claras y proyección laboral constante.',
    category: 'motivator',
  },
  {
    id: 'independence',
    name: 'Autonomía e Independencia Profesional',
    description: 'Valorar la posibilidad de ejercer como consultor independiente, gestionar horarios propios o tomar decisiones autónomas.',
    category: 'motivator',
  },
  {
    id: 'social_impact',
    name: 'Impacto Social y Comunitario',
    description: 'Sentir que el trabajo contribuye a reducir desigualdades, proteger el entorno o mejorar la calidad de vida colectiva.',
    category: 'motivator',
  },
  {
    id: 'innovation',
    name: 'Innovación y Vanguardia',
    description: 'Motivación por estar en la frontera del cambio tecnológico, científico o productivo creando el futuro.',
    category: 'motivator',
  },
  {
    id: 'continuous_learning',
    name: 'Aprendizaje Continuo y Desafío Intelectual',
    description: 'Disfrutar carreras que exigen actualizarse permanentemente y estudiar temas nuevos a lo largo de la vida.',
    category: 'motivator',
  },
  {
    id: 'complex_challenges',
    name: 'Superación de Retos Exigentes',
    description: 'Motivación por enfrentar problemas difíciles de alta exigencia técnica, clínica, jurídica o estratégica.',
    category: 'motivator',
  },
  {
    id: 'influence_leadership',
    name: 'Liderazgo e Influencia Estratégica',
    description: 'Interés por dirigir equipos, tomar decisiones de alto nivel e influir en el rumbo de organizaciones o instituciones.',
    category: 'motivator',
  },
  {
    id: 'recognition',
    name: 'Proyección y Reconocimiento Profesional',
    description: 'Valorar la visibilidad pública, el prestigio académico o el reconocimiento por logros destacados en un gremio.',
    category: 'motivator',
  },
  {
    id: 'entrepreneurship',
    name: 'Emprendimiento y Creación deProyectos',
    description: 'Motivación por fundar empresas, lanzar productos propios o desarrollar nuevas líneas de negocio.',
    category: 'motivator',
  },
  {
    id: 'financial_growth',
    name: 'Crecimiento Económico y Escalabilidad',
    description: 'Priorizar sectores con alto potencial de retorno financiero, escalabilidad comercial o proyección global.',
    category: 'motivator',
  },
  {
    id: 'service',
    name: 'Vocación de Servicio y Cuidado',
    description: 'Encontrar sentido personal al ayudar de forma directa y empática a quienes atraviesan momentos de necesidad.',
    category: 'motivator',
  },
];

export const DIMENSIONS_BY_ID: Record<string, VocationalDimension> = Object.fromEntries(
  VOCATIONAL_DIMENSIONS.map((dim) => [dim.id, dim])
);

export function getDimensionsByCategory(category: DimensionCategory): VocationalDimension[] {
  return VOCATIONAL_DIMENSIONS.filter((dim) => dim.category === category);
}
