import { CAREERS_BY_ID } from '../../data/careers';
import {
  AcademicProgram,
  CareerAcademicMapping,
  ProgramCareerMatchInfo,
} from '../../types/academic';
import { Career } from '../../types/career';

export function normalizeAcademicText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

interface CareerAcademicRule {
  directKeywords: string[];
  relatedKeywords: Array<{
    keyword: string;
    relevance: 'high' | 'medium' | 'low';
    rationale: string;
  }>;
}

/**
 * Reglas deterministas de normalización entre carreras vocacionales de YorVoca
 * y denominaciones de programas académicos en Colombia.
 * Distingue explícitamente entre `direct` (denominación equivalente/directa)
 * y `related` (programa cercano o afín dentro del área de conocimiento).
 */
export const CAREER_ACADEMIC_NORMALIZATION_RULES: Record<string, CareerAcademicRule> = {
  engineering_software: {
    directKeywords: ['ingenieria de software'],
    relatedKeywords: [
      {
        keyword: 'tecnologia en desarrollo de software',
        relevance: 'high',
        rationale: 'Formación tecnológica enfocada directamente en construcción de software.',
      },
      {
        keyword: 'analisis y desarrollo de software',
        relevance: 'high',
        rationale: 'Formación tecnológica práctica enfocada en análisis, diseño y programación de software.',
      },
      {
        keyword: 'ingenieria de sistemas',
        relevance: 'medium',
        rationale:
          'Ingeniería de Sistemas incluye diseño de software junto con infraestructura y TI.',
      },
      {
        keyword: 'ingenieria informatica',
        relevance: 'medium',
        rationale: 'Ingeniería Informática comparte fundamentos de programación y arquitectura.',
      },
    ],
  },
  engineering_systems: {
    directKeywords: ['ingenieria de sistemas', 'ingenieria de sistemas y computacion'],
    relatedKeywords: [
      {
        keyword: 'ingenieria de software',
        relevance: 'high',
        rationale: 'Comparte el núcleo de arquitectura de aplicaciones e ingeniería computacional.',
      },
      {
        keyword: 'ingenieria informatica',
        relevance: 'high',
        rationale: 'Enfoque cercano en sistemas de información y gestión tecnológica.',
      },
      {
        keyword: 'tecnologia en desarrollo de software',
        relevance: 'medium',
        rationale: 'Formación tecnológica en desarrollo de aplicaciones y sistemas de software.',
      },
      {
        keyword: 'analisis y desarrollo de software',
        relevance: 'medium',
        rationale: 'Programa tecnológico orientado a programación e implementación de sistemas.',
      },
      {
        keyword: 'tecnologia en sistemas',
        relevance: 'medium',
        rationale: 'Formación tecnológica en soporte, redes y administración de sistemas.',
      },
    ],
  },
  engineering_informatics: {
    directKeywords: ['ingenieria informatica'],
    relatedKeywords: [
      {
        keyword: 'ingenieria de sistemas',
        relevance: 'high',
        rationale: 'Denominación estrechamente relacionada en gestión y desarrollo de sistemas.',
      },
      {
        keyword: 'ingenieria de software',
        relevance: 'medium',
        rationale: 'Enfocada en el ciclo de vida de construcción de software.',
      },
      {
        keyword: 'tecnologia en desarrollo de software',
        relevance: 'medium',
        rationale: 'Opción tecnológica orientada a programación y sistemas.',
      },
      {
        keyword: 'analisis y desarrollo de software',
        relevance: 'medium',
        rationale: 'Formación tecnológica aplicada en desarrollo de sistemas informáticos.',
      },
    ],
  },
  data_science: {
    directKeywords: ['ciencia de datos', 'ingenieria en ciencia de datos'],
    relatedKeywords: [
      {
        keyword: 'matematicas',
        relevance: 'medium',
        rationale: 'Base cuantitativa y estadística fundamental para la ciencia de datos.',
      },
      {
        keyword: 'ingenieria de sistemas',
        relevance: 'medium',
        rationale: 'Formación computacional con líneas de profundización en analítica e IA.',
      },
      {
        keyword: 'ingenieria informatica',
        relevance: 'medium',
        rationale: 'Aborda sistemas de información, bases de datos e inteligencia de negocios.',
      },
      {
        keyword: 'economia',
        relevance: 'low',
        rationale: 'Comparte econometría, modelado estadístico y análisis cuantitativo de datos.',
      },
    ],
  },
  engineering_telecommunications: {
    directKeywords: ['ingenieria de telecomunicaciones', 'ingenieria en telecomunicaciones'],
    relatedKeywords: [
      {
        keyword: 'ingenieria electronica',
        relevance: 'high',
        rationale: 'Comparte fundamentos de señales, hardware y sistemas de comunicación.',
      },
      {
        keyword: 'ingenieria de sistemas',
        relevance: 'low',
        rationale: 'Relacionada en administración de redes y conectividad.',
      },
    ],
  },
  software_development_tech: {
    directKeywords: [
      'tecnologia en desarrollo de software',
      'analisis y desarrollo de software',
      'tecnologia en analisis y desarrollo de software',
    ],
    relatedKeywords: [
      {
        keyword: 'ingenieria de software',
        relevance: 'high',
        rationale: 'Nivel profesional universitario del mismo campo de desarrollo de software.',
      },
      {
        keyword: 'ingenieria de sistemas',
        relevance: 'medium',
        rationale: 'Opción profesional universitaria en sistemas computacionales y desarrollo.',
      },
      {
        keyword: 'ingenieria informatica',
        relevance: 'medium',
        rationale: 'Formación profesional en ingeniería de software y gestión informática.',
      },
      {
        keyword: 'tecnologia en sistemas',
        relevance: 'medium',
        rationale: 'Programa tecnológico afín en el área de informática y programación.',
      },
    ],
  },
  systems_tech: {
    directKeywords: ['tecnologia en sistemas', 'tecnologia en sistemas informaticos'],
    relatedKeywords: [
      {
        keyword: 'tecnologia en desarrollo de software',
        relevance: 'high',
        rationale: 'Programa tecnológico hermano con énfasis en desarrollo de aplicaciones.',
      },
      {
        keyword: 'analisis y desarrollo de software',
        relevance: 'high',
        rationale: 'Formación tecnológica del SENA en desarrollo e implementación de sistemas.',
      },
      {
        keyword: 'ingenieria de sistemas',
        relevance: 'high',
        rationale: 'Continuación natural a nivel profesional universitario.',
      },
      {
        keyword: 'ingenieria informatica',
        relevance: 'medium',
        rationale: 'Continuación profesional en arquitectura de sistemas e informática.',
      },
    ],
  },
  engineering_industrial: {
    directKeywords: ['ingenieria industrial'],
    relatedKeywords: [
      {
        keyword: 'administracion de empresas',
        relevance: 'medium',
        rationale: 'Comparte áreas de gestión de operaciones, estrategia y organizaciones.',
      },
      {
        keyword: 'negocios internacionales',
        relevance: 'low',
        rationale: 'Relacionada en logística global, cadena de suministro y comercio.',
      },
    ],
  },
  engineering_civil: {
    directKeywords: ['ingenieria civil'],
    relatedKeywords: [
      {
        keyword: 'arquitectura',
        relevance: 'low',
        rationale: 'Complementaria en proyectos de edificación, urbanismo y construcción.',
      },
      {
        keyword: 'ingenieria ambiental',
        relevance: 'low',
        rationale: 'Afín en recursos hidráulicos, acueductos y gestión ambiental de obras.',
      },
    ],
  },
  engineering_electronic: {
    directKeywords: ['ingenieria electronica'],
    relatedKeywords: [
      {
        keyword: 'ingenieria de telecomunicaciones',
        relevance: 'high',
        rationale: 'Estrechamente conectada en sistemas de transmisión y redes.',
      },
      {
        keyword: 'ingenieria de sistemas',
        relevance: 'medium',
        rationale: 'Complementaria en arquitectura de computadores, redes e integración hardware-software.',
      },
    ],
  },
  graphic_design: {
    directKeywords: ['diseno grafico', 'diseno visual'],
    relatedKeywords: [
      {
        keyword: 'diseno digital',
        relevance: 'high',
        rationale: 'Integra principios visuales en interfaces y medios interactivos.',
      },
      {
        keyword: 'diseno industrial',
        relevance: 'medium',
        rationale: 'Comparte fundamentos proyectuales de diseño, forma, color y comunicación visual.',
      },
      {
        keyword: 'comunicacion audiovisual',
        relevance: 'medium',
        rationale: 'Afín en dirección visual y producción de contenidos.',
      },
      {
        keyword: 'comunicacion social',
        relevance: 'low',
        rationale: 'Relacionada en medios de comunicación, diseño editorial y narrativa visual.',
      },
    ],
  },
  industrial_design: {
    directKeywords: ['diseno industrial'],
    relatedKeywords: [
      {
        keyword: 'diseno grafico',
        relevance: 'medium',
        rationale: 'Comparte el núcleo proyectual de diseño, morfología y representación visual.',
      },
      {
        keyword: 'arquitectura',
        relevance: 'low',
        rationale: 'Comparte proyección espacial, materiales y ergonomía.',
      },
      {
        keyword: 'ingenieria industrial',
        relevance: 'low',
        rationale: 'Relacionada en procesos de manufactura, desarrollo de producto y ergonomía.',
      },
    ],
  },
  digital_design: {
    directKeywords: ['diseno digital', 'diseno digital y multimedia', 'diseno interactivo'],
    relatedKeywords: [
      {
        keyword: 'diseno grafico',
        relevance: 'high',
        rationale: 'Comparte fundamentos de composición visual, tipografía, diseño de interfaces y comunicación digital.',
      },
      {
        keyword: 'comunicacion audiovisual',
        relevance: 'medium',
        rationale: 'Relacionada en producción multimedia y narrativa digital.',
      },
      {
        keyword: 'diseno industrial',
        relevance: 'medium',
        rationale: 'Afín en diseño centrado en el usuario, experiencia de producto e interacción.',
      },
      {
        keyword: 'comunicacion social',
        relevance: 'medium',
        rationale: 'Incluye producción de contenidos digitales, medios interactivos y narrativa transmedia.',
      },
      {
        keyword: 'tecnologia en desarrollo de software',
        relevance: 'low',
        rationale: 'Complementaria en la construcción técnica de interfaces web, móviles y productos digitales.',
      },
      {
        keyword: 'analisis y desarrollo de software',
        relevance: 'low',
        rationale: 'Complementaria en implementación frontend y desarrollo de aplicaciones interactivas.',
      },
    ],
  },
  architecture: {
    directKeywords: ['arquitectura'],
    relatedKeywords: [
      {
        keyword: 'ingenieria civil',
        relevance: 'medium',
        rationale: 'Campo afín en infraestructura, estructuras y desarrollo urbano.',
      },
      {
        keyword: 'diseno industrial',
        relevance: 'low',
        rationale: 'Afín en diseño proyectual y morfología.',
      },
    ],
  },
  fashion_design: {
    directKeywords: ['diseno de modas', 'diseno textil', 'diseno de vestuario'],
    relatedKeywords: [
      {
        keyword: 'diseno industrial',
        relevance: 'medium',
        rationale: 'Comparte metodologías de diseño de producto, estudio de materiales, ergonomía y morfología.',
      },
      {
        keyword: 'diseno grafico',
        relevance: 'medium',
        rationale: 'Afín en dirección de arte, identidad visual de marca, ilustración y comunicación estética.',
      },
    ],
  },
  business_administration: {
    directKeywords: ['administracion de empresas', 'administracion de negocios'],
    relatedKeywords: [
      {
        keyword: 'negocios internacionales',
        relevance: 'high',
        rationale: 'Comparte gestión organizacional con enfoque en mercados globales.',
      },
      {
        keyword: 'mercadeo',
        relevance: 'medium',
        rationale: 'Área estrechamente vinculada a la dirección comercial.',
      },
      {
        keyword: 'ingenieria industrial',
        relevance: 'medium',
        rationale: 'Afín en optimización de procesos y gerencia de operaciones.',
      },
      {
        keyword: 'contaduria publica',
        relevance: 'medium',
        rationale: 'Comparte el núcleo de ciencias económicas, control financiero y gestión empresarial.',
      },
      {
        keyword: 'economia',
        relevance: 'low',
        rationale: 'Complementaria en análisis del entorno económico y toma de decisiones estratégicas.',
      },
    ],
  },
  marketing: {
    directKeywords: ['mercadeo', 'mercadeo y publicidad', 'mercadeo y estrategia comercial'],
    relatedKeywords: [
      {
        keyword: 'administracion de empresas',
        relevance: 'medium',
        rationale: 'Incluye formación en gestión comercial y estrategia de negocios.',
      },
      {
        keyword: 'negocios internacionales',
        relevance: 'medium',
        rationale: 'Aborda posicionamiento y comercio en mercados internacionales.',
      },
      {
        keyword: 'comunicacion social',
        relevance: 'low',
        rationale: 'Relacionada en comunicación estratégica, publicidad y gestión de medios.',
      },
    ],
  },
  international_business: {
    directKeywords: [
      'negocios internacionales',
      'finanzas y negocios internacionales',
      'comercio internacional',
    ],
    relatedKeywords: [
      {
        keyword: 'finanzas y comercio internacional',
        relevance: 'high',
        rationale: 'Integra directamente operaciones de comercio exterior y finanzas.',
      },
      {
        keyword: 'administracion de empresas',
        relevance: 'medium',
        rationale: 'Base general de dirección y gestión empresarial.',
      },
      {
        keyword: 'economia',
        relevance: 'low',
        rationale: 'Afín en comercio exterior, macroeconomía y mercados internacionales.',
      },
    ],
  },
  public_accounting: {
    directKeywords: ['contaduria publica'],
    relatedKeywords: [
      {
        keyword: 'finanzas',
        relevance: 'medium',
        rationale: 'Área afín en análisis financiero y gestión de recursos.',
      },
      {
        keyword: 'administracion de empresas',
        relevance: 'low',
        rationale: 'Relacionada con la gestión administrativa y tributaria.',
      },
      {
        keyword: 'economia',
        relevance: 'low',
        rationale: 'Comparte fundamentos de ciencias económicas, fiscalidad y análisis financiero.',
      },
    ],
  },
  economics: {
    directKeywords: ['economia'],
    relatedKeywords: [
      {
        keyword: 'finanzas',
        relevance: 'high',
        rationale: 'Comparte análisis de mercados, inversión y política monetaria.',
      },
      {
        keyword: 'administracion de empresas',
        relevance: 'low',
        rationale: 'Relacionada en gestión económica de organizaciones y estrategia empresarial.',
      },
      {
        keyword: 'contaduria publica',
        relevance: 'low',
        rationale: 'Afín en análisis contable, tributario y financiero.',
      },
      {
        keyword: 'administracion publica',
        relevance: 'low',
        rationale: 'Relacionada en políticas públicas, presupuesto y desarrollo territorial.',
      },
    ],
  },
  finance: {
    directKeywords: [
      'finanzas',
      'finanzas y negocios internacionales',
      'finanzas y comercio internacional',
      'ingenieria financiera',
    ],
    relatedKeywords: [
      {
        keyword: 'economia',
        relevance: 'high',
        rationale: 'Comparte fundamentos macroeconómicos y análisis cuantitativo.',
      },
      {
        keyword: 'contaduria publica',
        relevance: 'medium',
        rationale: 'Afín en estados financieros, control y auditoría.',
      },
      {
        keyword: 'administracion de empresas',
        relevance: 'medium',
        rationale: 'Incluye gestión financiera corporativa, evaluación de proyectos y dirección.',
      },
      {
        keyword: 'negocios internacionales',
        relevance: 'medium',
        rationale: 'Comparte análisis de mercados globales, divisas y comercio internacional.',
      },
    ],
  },
  medicine: {
    directKeywords: ['medicina'],
    relatedKeywords: [
      {
        keyword: 'enfermeria',
        relevance: 'medium',
        rationale: 'Área clínica y de cuidado integral de la salud humana.',
      },
      {
        keyword: 'fisioterapia',
        relevance: 'low',
        rationale: 'Campo de la salud enfocado en rehabilitación física.',
      },
    ],
  },
  nursing: {
    directKeywords: ['enfermeria'],
    relatedKeywords: [
      {
        keyword: 'medicina',
        relevance: 'medium',
        rationale: 'Trabajo interdisciplinario en atención clínica y salud comunitaria.',
      },
      {
        keyword: 'fisioterapia',
        relevance: 'low',
        rationale: 'Área de ciencias de la salud orientada al cuidado y recuperación.',
      },
    ],
  },
  physiotherapy: {
    directKeywords: ['fisioterapia'],
    relatedKeywords: [
      {
        keyword: 'enfermeria',
        relevance: 'low',
        rationale: 'Comparte el ámbito hospitalario y de bienestar del paciente.',
      },
      {
        keyword: 'medicina',
        relevance: 'low',
        rationale: 'Comparte ciencias básicas de la salud y rehabilitación clínica.',
      },
    ],
  },
  dentistry: {
    directKeywords: ['odontologia'],
    relatedKeywords: [
      {
        keyword: 'medicina',
        relevance: 'medium',
        rationale: 'Comparte ciencias biomédicas, diagnóstico clínico y atención integral en salud.',
      },
      {
        keyword: 'enfermeria',
        relevance: 'low',
        rationale: 'Afín en promoción de la salud, prevención y cuidado clínico del paciente.',
      },
    ],
  },
  nutrition_dietetics: {
    directKeywords: ['nutricion y dietetica', 'nutricion'],
    relatedKeywords: [
      {
        keyword: 'medicina',
        relevance: 'medium',
        rationale: 'Relacionada en salud metabólica, prevención clínica y salud pública.',
      },
      {
        keyword: 'enfermeria',
        relevance: 'medium',
        rationale: 'Comparte el enfoque en promoción de la salud, bienestar y cuidado comunitario.',
      },
      {
        keyword: 'biologia',
        relevance: 'low',
        rationale: 'Comparte fundamentos de bioquímica, fisiología y ciencias de la vida.',
      },
    ],
  },
  psychology: {
    directKeywords: ['psicologia'],
    relatedKeywords: [
      {
        keyword: 'trabajo social',
        relevance: 'medium',
        rationale: 'Afín en intervención psicosocial, comunitaria y acompañamiento humano.',
      },
    ],
  },
  biology: {
    directKeywords: ['biologia', 'biologia marina', 'microbiologia'],
    relatedKeywords: [
      {
        keyword: 'ingenieria ambiental',
        relevance: 'medium',
        rationale: 'Relacionada en estudio de ecosistemas, biodiversidad y conservación.',
      },
      {
        keyword: 'gestion ambiental',
        relevance: 'low',
        rationale: 'Afín en manejo de recursos naturales y sostenibilidad de ecosistemas.',
      },
    ],
  },
  chemistry: {
    directKeywords: ['quimica', 'quimica farmaceutica', 'quimica industrial'],
    relatedKeywords: [
      {
        keyword: 'biologia',
        relevance: 'high',
        rationale: 'Comparte ciencias experimentales de laboratorio, bioquímica y análisis científico.',
      },
      {
        keyword: 'ingenieria ambiental',
        relevance: 'medium',
        rationale: 'Afín en análisis fisicoquímico de aguas, suelos y control de procesos ambientales.',
      },
    ],
  },
  physics: {
    directKeywords: ['fisica', 'ingenieria fisica'],
    relatedKeywords: [
      {
        keyword: 'ingenieria electronica',
        relevance: 'high',
        rationale: 'Aplica directamente electromagnetismo, circuitos, física de semiconductores e instrumentación.',
      },
      {
        keyword: 'ingenieria civil',
        relevance: 'medium',
        rationale: 'Fundamentada en mecánica clásica, análisis estructural e hidráulica.',
      },
      {
        keyword: 'ingenieria de sistemas',
        relevance: 'low',
        rationale: 'Relacionada en modelamiento matemático, simulación computacional y cálculo.',
      },
    ],
  },
  mathematics: {
    directKeywords: ['matematicas', 'matematicas aplicadas'],
    relatedKeywords: [
      {
        keyword: 'ciencia de datos',
        relevance: 'high',
        rationale: 'Aplicación directa del modelado matemático y estadístico.',
      },
      {
        keyword: 'licenciatura en matematicas',
        relevance: 'medium',
        rationale: 'Enfoque pedagógico de las ciencias matemáticas.',
      },
      {
        keyword: 'ingenieria de sistemas',
        relevance: 'medium',
        rationale: 'Comparte lógica formal, matemática discreta, algoritmos y modelamiento computacional.',
      },
      {
        keyword: 'economia',
        relevance: 'medium',
        rationale: 'Fuerte componente de matemática aplicada, econometría y modelos cuantitativos.',
      },
    ],
  },
  sociology: {
    directKeywords: ['sociologia'],
    relatedKeywords: [
      {
        keyword: 'trabajo social',
        relevance: 'high',
        rationale: 'Estrechamente vinculada en el estudio e intervención de realidades sociales y comunitarias.',
      },
      {
        keyword: 'ciencia politica',
        relevance: 'medium',
        rationale: 'Comparte el análisis del Estado, movimientos sociales, poder y políticas públicas.',
      },
      {
        keyword: 'comunicacion social',
        relevance: 'low',
        rationale: 'Afín en investigación de fenómenos culturales, opinión pública y sociedad.',
      },
    ],
  },
  social_work: {
    directKeywords: ['trabajo social'],
    relatedKeywords: [
      {
        keyword: 'psicologia',
        relevance: 'medium',
        rationale: 'Comparte procesos de orientación familiar, comunitaria y bienestar social.',
      },
      {
        keyword: 'ciencia politica',
        relevance: 'low',
        rationale: 'Relacionada en gestión social, participación ciudadana y políticas públicas.',
      },
    ],
  },
  anthropology: {
    directKeywords: ['antropologia'],
    relatedKeywords: [
      {
        keyword: 'trabajo social',
        relevance: 'high',
        rationale: 'Comparte metodologías de trabajo de campo etnográfico, comunidad, cultura y territorio.',
      },
      {
        keyword: 'comunicacion social',
        relevance: 'medium',
        rationale: 'Relacionada en estudios culturales, identidad, memoria y procesos simbólicos.',
      },
      {
        keyword: 'ciencia politica',
        relevance: 'low',
        rationale: 'Afín en el estudio de comunidades, interculturalidad y políticas territoriales.',
      },
    ],
  },
  political_science: {
    directKeywords: [
      'ciencia politica',
      'ciencia politica y gobierno',
      'ciencia politica y relaciones internacionales',
      'gobierno y relaciones internacionales',
    ],
    relatedKeywords: [
      {
        keyword: 'administracion publica',
        relevance: 'high',
        rationale: 'Enfocada en gestión del Estado, políticas públicas y servicio público.',
      },
      {
        keyword: 'derecho',
        relevance: 'medium',
        rationale: 'Comparte el estudio constitucional, institucional y normativo.',
      },
    ],
  },
  early_childhood_education: {
    directKeywords: [
      'licenciatura en educacion infantil',
      'licenciatura en pedagogia infantil',
    ],
    relatedKeywords: [
      {
        keyword: 'licenciatura en lenguas extranjeras',
        relevance: 'medium',
        rationale: 'Comparte el núcleo de formación docente, pedagogía, currículo y didáctica.',
      },
      {
        keyword: 'psicologia',
        relevance: 'medium',
        rationale: 'Afín en procesos de desarrollo cognitivo, emocional y aprendizaje en la infancia.',
      },
      {
        keyword: 'trabajo social',
        relevance: 'low',
        rationale: 'Relacionada en acompañamiento familiar, comunitario y protección integral de la niñez.',
      },
    ],
  },
  mathematics_education: {
    directKeywords: ['licenciatura en matematicas'],
    relatedKeywords: [
      {
        keyword: 'licenciatura en lenguas extranjeras',
        relevance: 'medium',
        rationale: 'Comparte formación pedagógica universitaria, didáctica y evaluación educativa.',
      },
      {
        keyword: 'ingenieria de sistemas',
        relevance: 'low',
        rationale: 'Afín en pensamiento lógico-matemático, resolución de problemas y modelamiento.',
      },
    ],
  },
  foreign_languages_education: {
    directKeywords: [
      'licenciatura en lenguas extranjeras',
      'licenciatura en bilinguismo',
      'licenciatura en lenguas modernas',
    ],
    relatedKeywords: [
      {
        keyword: 'licenciatura en educacion infantil',
        relevance: 'low',
        rationale: 'Comparte formación pedagógica, didáctica y curricular.',
      },
      {
        keyword: 'comunicacion social',
        relevance: 'low',
        rationale: 'Afín en estudios del lenguaje, expresión escrita e interculturalidad.',
      },
    ],
  },
  physical_education: {
    directKeywords: [
      'licenciatura en educacion fisica',
      'ciencias del deporte',
      'profesional en deporte',
    ],
    relatedKeywords: [
      {
        keyword: 'fisioterapia',
        relevance: 'high',
        rationale: 'Comparte el estudio del movimiento corporal humano, ejercicio físico y salud deportiva.',
      },
      {
        keyword: 'licenciatura en lenguas extranjeras',
        relevance: 'low',
        rationale: 'Comparte fundamentos de pedagogía, didáctica y formación docente.',
      },
    ],
  },
  social_communication: {
    directKeywords: ['comunicacion social', 'comunicacion social y periodismo'],
    relatedKeywords: [
      {
        keyword: 'comunicacion audiovisual',
        relevance: 'high',
        rationale: 'Enfocada en producción narrativa para medios audiovisuales y digitales.',
      },
      {
        keyword: 'diseno grafico',
        relevance: 'low',
        rationale: 'Complementaria en comunicación visual, diseño editorial y medios digitales.',
      },
    ],
  },
  journalism: {
    directKeywords: ['periodismo', 'comunicacion social y periodismo'],
    relatedKeywords: [
      {
        keyword: 'comunicacion social',
        relevance: 'high',
        rationale: 'En Colombia, Comunicación Social integra directamente la formación en periodismo, reportería y medios.',
      },
      {
        keyword: 'comunicacion audiovisual',
        relevance: 'medium',
        rationale: 'Afín en producción de reportajes, crónicas y contenidos informativos.',
      },
    ],
  },
  audiovisual_communication: {
    directKeywords: [
      'comunicacion audiovisual',
      'comunicacion audiovisual y multimedios',
      'cine y television',
    ],
    relatedKeywords: [
      {
        keyword: 'comunicacion social',
        relevance: 'high',
        rationale: 'Comparte bases de narrativa, medios y producción comunicativa.',
      },
      {
        keyword: 'diseno digital',
        relevance: 'medium',
        rationale: 'Afín en creación multimedia, animación y edición digital.',
      },
      {
        keyword: 'diseno grafico',
        relevance: 'medium',
        rationale: 'Comparte dirección de arte, composición visual y lenguaje de la imagen.',
      },
    ],
  },
  law: {
    directKeywords: ['derecho', 'jurisprudencia'],
    relatedKeywords: [
      {
        keyword: 'ciencia politica',
        relevance: 'medium',
        rationale: 'Afín en análisis del Estado, instituciones y marco público.',
      },
      {
        keyword: 'administracion publica',
        relevance: 'medium',
        rationale: 'Relacionada con derecho administrativo y gestión estatal.',
      },
    ],
  },
  public_administration: {
    directKeywords: ['administracion publica'],
    relatedKeywords: [
      {
        keyword: 'ciencia politica',
        relevance: 'high',
        rationale: 'Estrechamente vinculada en gobierno, políticas públicas y territorio.',
      },
      {
        keyword: 'derecho',
        relevance: 'medium',
        rationale: 'Marco normativo de la función pública en Colombia.',
      },
      {
        keyword: 'administracion de empresas',
        relevance: 'medium',
        rationale: 'Comparte principios de planeación, gestión de organizaciones y dirección.',
      },
      {
        keyword: 'economia',
        relevance: 'low',
        rationale: 'Afín en presupuesto público, política fiscal y planeación del desarrollo.',
      },
    ],
  },
  environmental_engineering: {
    directKeywords: ['ingenieria ambiental', 'ingenieria ambiental y sanitaria'],
    relatedKeywords: [
      {
        keyword: 'tecnologia en gestion ambiental',
        relevance: 'high',
        rationale: 'Formación tecnológica enfocada en manejo y control ambiental.',
      },
      {
        keyword: 'biologia',
        relevance: 'medium',
        rationale: 'Comparte estudio de ecosistemas y conservación.',
      },
    ],
  },
  forestry_engineering: {
    directKeywords: ['ingenieria forestal'],
    relatedKeywords: [
      {
        keyword: 'ingenieria ambiental',
        relevance: 'high',
        rationale: 'Comparte conservación de cuencas, restauración ecológica y manejo sostenible de recursos.',
      },
      {
        keyword: 'biologia',
        relevance: 'high',
        rationale: 'Comparte el estudio de la biodiversidad, botánica, ecología y ecosistemas terrestres.',
      },
      {
        keyword: 'tecnologia en gestion ambiental',
        relevance: 'medium',
        rationale: 'Afín en gestión ambiental territorial y sostenibilidad.',
      },
    ],
  },
  environmental_management: {
    directKeywords: [
      'gestion ambiental',
      'tecnologia en gestion ambiental',
      'administracion ambiental',
    ],
    relatedKeywords: [
      {
        keyword: 'ingenieria ambiental',
        relevance: 'high',
        rationale: 'Enfoque profesional de ingeniería sobre sostenibilidad y recursos naturales.',
      },
      {
        keyword: 'biologia',
        relevance: 'low',
        rationale: 'Afín en conservación de ecosistemas y biodiversidad.',
      },
    ],
  },
};

/**
 * Evalúa de forma 100% determinista la relación entre una carrera vocacional (`Career`)
 * y un programa académico (`AcademicProgram`).
 * Devuelve `null` si no existe relación verificable.
 */
export function matchCareerToProgram(
  career: Career,
  program: AcademicProgram,
  explicitMappings: CareerAcademicMapping[] = [],
  careerAffinityScore?: number
): ProgramCareerMatchInfo | null {
  const affinityPercent =
    typeof careerAffinityScore === 'number'
      ? Math.round(careerAffinityScore * 100)
      : undefined;

  // 1. Verificar primero si existe un mapping explícito curado para este par (careerId, programId)
  const explicit = explicitMappings.find(
    (m) => m.careerId === career.id && m.programId === program.programId
  );

  if (explicit) {
    const matchType =
      explicit.matchType ?? (explicit.relevance === 'high' ? 'direct' : 'related');
    return {
      careerId: career.id,
      careerName: career.name,
      matchType,
      relevance: explicit.relevance,
      rationale:
        explicit.rationale ??
        (matchType === 'direct'
          ? `Programa directamente relacionado con ${career.name}.`
          : `Programa relacionado con el campo de ${career.name}.`),
      careerAffinityScore,
      careerAffinityPercent: affinityPercent,
    };
  }

  // 2. Normalización determinista por nombre de carrera y reglas explícitas
  const normProgramName = normalizeAcademicText(program.normalizedName ?? program.name);
  const normCareerName = normalizeAcademicText(career.normalizedName || career.name);

  if (normProgramName === normCareerName) {
    return {
      careerId: career.id,
      careerName: career.name,
      matchType: 'direct',
      relevance: 'high',
      rationale: `Denominación académica directamente correspondiente a ${career.name}.`,
      careerAffinityScore,
      careerAffinityPercent: affinityPercent,
    };
  }

  const rule = CAREER_ACADEMIC_NORMALIZATION_RULES[career.id];
  if (rule) {
    for (const directKw of rule.directKeywords) {
      const normKw = normalizeAcademicText(directKw);
      if (normProgramName === normKw || normProgramName.startsWith(`${normKw} `)) {
        return {
          careerId: career.id,
          careerName: career.name,
          matchType: 'direct',
          relevance: 'high',
          rationale: `Programa directamente relacionado con ${career.name}.`,
          careerAffinityScore,
          careerAffinityPercent: affinityPercent,
        };
      }
    }

    for (const rel of rule.relatedKeywords) {
      const normKw = normalizeAcademicText(rel.keyword);
      if (normProgramName === normKw || normProgramName.includes(normKw)) {
        return {
          careerId: career.id,
          careerName: career.name,
          matchType: 'related',
          relevance: rel.relevance,
          rationale: rel.rationale,
          careerAffinityScore,
          careerAffinityPercent: affinityPercent,
        };
      }
    }
  }

  return null;
}

/**
 * Calcula todas las coincidencias deterministas de un programa frente a un conjunto de IDs de carreras.
 */
export function matchProgramAgainstCareers(
  program: AcademicProgram,
  careerIds: string[],
  explicitMappings: CareerAcademicMapping[] = [],
  affinityByCareerId: Record<string, number> = {}
): ProgramCareerMatchInfo[] {
  const matches: ProgramCareerMatchInfo[] = [];

  for (const careerId of careerIds) {
    const career = CAREERS_BY_ID[careerId];
    if (!career) continue;

    const match = matchCareerToProgram(
      career,
      program,
      explicitMappings,
      affinityByCareerId[careerId]
    );
    if (match) {
      matches.push(match);
    }
  }

  // Ordenar coincidencias internas: direct primero, luego mayor relevancia, luego mayor afinidad vocacional
  const relevanceWeight = { high: 3, medium: 2, low: 1 };
  matches.sort((a, b) => {
    if (a.matchType !== b.matchType) {
      return a.matchType === 'direct' ? -1 : 1;
    }
    if (relevanceWeight[b.relevance] !== relevanceWeight[a.relevance]) {
      return relevanceWeight[b.relevance] - relevanceWeight[a.relevance];
    }
    const scoreA = a.careerAffinityScore ?? 0;
    const scoreB = b.careerAffinityScore ?? 0;
    if (Math.abs(scoreB - scoreA) > 1e-6) {
      return scoreB - scoreA;
    }
    return a.careerName.localeCompare(b.careerName);
  });

  return matches;
}
