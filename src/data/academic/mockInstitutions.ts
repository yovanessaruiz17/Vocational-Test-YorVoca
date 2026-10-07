import { AcademicSource, Institution } from '../../types/academic';

export const MOCK_ACADEMIC_SOURCE: AcademicSource = {
  provider: 'mock',
  retrievedAt: '2026-10-06T12:00:00.000Z',
  lastVerifiedAt: '2026-10-06T12:00:00.000Z',
};

/**
 * Instituciones de demostración para desarrollo y validación de interfaz.
 * REGLA DE INTEGRIDAD (Sección 29):
 * Se utilizan exclusivamente nombres ficticios ("Demo YorVoca") y source.provider = "mock".
 * No se utilizan nombres de universidades reales con datos inventados ni se inventan URLs o códigos SNIES.
 */
export const MOCK_INSTITUTIONS: Institution[] = [
  {
    institutionId: 'inst_demo_caribe_pub',
    name: 'Universidad Pública Demo YorVoca — Sede Caribe',
    institutionType: 'university',
    sector: 'public',
    city: 'Cartagena',
    department: 'Bolívar',
    accreditation: 'Registro de demostración (entorno de desarrollo)',
    source: MOCK_ACADEMIC_SOURCE,
    lastVerifiedAt: '2026-10-06T12:00:00.000Z',
  },
  {
    institutionId: 'inst_demo_caribe_priv',
    name: 'Universidad Demo YorVoca del Caribe',
    institutionType: 'university',
    sector: 'private',
    city: 'Barranquilla',
    department: 'Atlántico',
    accreditation: 'Registro de demostración (entorno de desarrollo)',
    source: MOCK_ACADEMIC_SOURCE,
    lastVerifiedAt: '2026-10-06T12:00:00.000Z',
  },
  {
    institutionId: 'inst_demo_bogota_pub',
    name: 'Universidad Nacional Demo YorVoca — Sede Central',
    institutionType: 'university',
    sector: 'public',
    city: 'Bogotá D.C.',
    department: 'Bogotá D.C.',
    accreditation: 'Registro de demostración (entorno de desarrollo)',
    source: MOCK_ACADEMIC_SOURCE,
    lastVerifiedAt: '2026-10-06T12:00:00.000Z',
  },
  {
    institutionId: 'inst_demo_bogota_priv',
    name: 'Universidad Demo YorVoca — Campus Bogotá',
    institutionType: 'university',
    sector: 'private',
    city: 'Bogotá D.C.',
    department: 'Bogotá D.C.',
    accreditation: 'Registro de demostración (entorno de desarrollo)',
    source: MOCK_ACADEMIC_SOURCE,
    lastVerifiedAt: '2026-10-06T12:00:00.000Z',
  },
  {
    institutionId: 'inst_demo_antioquia_pub',
    name: 'Universidad Demo YorVoca de Antioquia',
    institutionType: 'university',
    sector: 'public',
    city: 'Medellín',
    department: 'Antioquia',
    accreditation: 'Registro de demostración (entorno de desarrollo)',
    source: MOCK_ACADEMIC_SOURCE,
    lastVerifiedAt: '2026-10-06T12:00:00.000Z',
  },
  {
    institutionId: 'inst_demo_antioquia_iu',
    name: 'Institución Universitaria Demo YorVoca — Medellín',
    institutionType: 'university_institution',
    sector: 'private',
    city: 'Medellín',
    department: 'Antioquia',
    accreditation: 'Registro de demostración (entorno de desarrollo)',
    source: MOCK_ACADEMIC_SOURCE,
    lastVerifiedAt: '2026-10-06T12:00:00.000Z',
  },
  {
    institutionId: 'inst_demo_valle_pub',
    name: 'Universidad Demo YorVoca del Pacífico',
    institutionType: 'university',
    sector: 'public',
    city: 'Cali',
    department: 'Valle del Cauca',
    accreditation: 'Registro de demostración (entorno de desarrollo)',
    source: MOCK_ACADEMIC_SOURCE,
    lastVerifiedAt: '2026-10-06T12:00:00.000Z',
  },
  {
    institutionId: 'inst_demo_santander_tech',
    name: 'Instituto Tecnológico Demo YorVoca — Oriente',
    institutionType: 'technological',
    sector: 'public',
    city: 'Bucaramanga',
    department: 'Santander',
    accreditation: 'Registro de demostración (entorno de desarrollo)',
    source: MOCK_ACADEMIC_SOURCE,
    lastVerifiedAt: '2026-10-06T12:00:00.000Z',
  },
  {
    institutionId: 'inst_demo_sena_caribe',
    name: 'Centro de Formación SENA Demo YorVoca',
    institutionType: 'sena',
    sector: 'public',
    city: 'Cartagena',
    department: 'Bolívar',
    accreditation: 'Registro de demostración (entorno de desarrollo)',
    source: MOCK_ACADEMIC_SOURCE,
    lastVerifiedAt: '2026-10-06T12:00:00.000Z',
  },
  {
    institutionId: 'inst_demo_virtual_col',
    name: 'Institución Universitaria Virtual Demo YorVoca',
    institutionType: 'university_institution',
    sector: 'private',
    city: 'Bogotá D.C.',
    department: 'Bogotá D.C.',
    accreditation: 'Registro de demostración (entorno de desarrollo)',
    source: MOCK_ACADEMIC_SOURCE,
    lastVerifiedAt: '2026-10-06T12:00:00.000Z',
  },
  {
    institutionId: 'inst_demo_eje_cafetero',
    name: 'Centro Técnico Profesional Demo YorVoca — Caldas',
    institutionType: 'technical_professional',
    sector: 'private',
    city: 'Manizales',
    department: 'Caldas',
    accreditation: 'Registro de demostración (entorno de desarrollo)',
    source: MOCK_ACADEMIC_SOURCE,
    lastVerifiedAt: '2026-10-06T12:00:00.000Z',
  },
];

export const MOCK_INSTITUTIONS_BY_ID: Record<string, Institution> = Object.fromEntries(
  MOCK_INSTITUTIONS.map((inst) => [inst.institutionId, inst])
);
