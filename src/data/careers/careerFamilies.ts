import { CareerFamily } from '../../types/career';

export const CAREER_FAMILIES: CareerFamily[] = [
  {
    id: 'technology',
    name: 'Tecnología, Computación y Sistemas Digitales',
    description: 'Programas orientados al desarrollo de software, infraestructura digital, ciencia de datos, telecomunicaciones y sistemas de información.',
  },
  {
    id: 'engineering',
    name: 'Ingeniería, Industria e Infraestructura',
    description: 'Campos dedicados al diseño, construcción y optimización de obras civiles, sistemas mecánicos, electrónicos y procesos productivos.',
  },
  {
    id: 'health',
    name: 'Ciencias de la Salud y Bienestar',
    description: 'Profesiones enfocadas en la promoción de la salud, prevención, diagnóstico, tratamiento físico y acompañamiento psicológico.',
  },
  {
    id: 'business',
    name: 'Administración, Negocios y Mercadeo',
    description: 'Áreas orientadas a la dirección de organizaciones, estrategia comercial, comercio internacional y desarrollo empresarial.',
  },
  {
    id: 'economics_finance',
    name: 'Economía, Contaduría y Finanzas',
    description: 'Disciplinas centradas en el análisis económico, la gestión financiera, la inversión, el control contable y las políticas fiscales.',
  },
  {
    id: 'social_sciences',
    name: 'Ciencias Sociales y Humanas',
    description: 'Campos que estudian las sociedades, las culturas, las relaciones de poder y el acompañamiento a comunidades.',
  },
  {
    id: 'education',
    name: 'Educación y Pedagogía',
    description: 'Programas de licenciatura y formación docente orientados a guiar procesos de enseñanza y aprendizaje en distintas etapas y áreas.',
  },
  {
    id: 'communication',
    name: 'Comunicación, Periodismo y Medios',
    description: 'Profesiones dedicadas a la investigación periodística, la comunicación estratégica, la producción audiovisual y la gestión de medios.',
  },
  {
    id: 'law_public_service',
    name: 'Derecho, Gobierno y Servicio Público',
    description: 'Áreas enfocadas en el marco jurídico, la defensa de derechos, la justicia y la administración del Estado.',
  },
  {
    id: 'arts_design',
    name: 'Diseño, Arquitectura y Artes Creativas',
    description: 'Disciplinas proyectuales y creativas dedicadas a configurar espacios habitables, objetos industriales, comunicación visual, moda y entornos digitales.',
  },
  {
    id: 'environment',
    name: 'Medio Ambiente, Territorio y Sostenibilidad',
    description: 'Programas centrados en la gestión ambiental, la conservación de ecosistemas, el manejo forestal y el desarrollo sostenible.',
  },
  {
    id: 'natural_sciences',
    name: 'Ciencias Naturales y Exactas',
    description: 'Campos dedicados a la investigación científica fundamental y aplicada en biología, química, física y matemáticas.',
  },
];

export const CAREER_FAMILIES_BY_ID: Record<string, CareerFamily> = Object.fromEntries(
  CAREER_FAMILIES.map((family) => [family.id, family])
);
