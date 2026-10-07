-- =============================================================================
-- YORVOCA — FASE 6A: ESQUEMA POSTGRESQL / SUPABASE PARA DATOS ACADÉMICOS REALES
-- Versión: 1.6.0-PHASE6A-ACADEMIC-INTEGRATION
-- =============================================================================
-- Separa estrictamente:
--   1. Fuentes de procedencia (`academic_sources`)
--   2. Instituciones (`institutions`)
--   3. Programas académicos (`academic_programs`)
--   4. Contenido oficial descriptivo del sitio web (`program_official_content`)
--   5. Mapeo explícito Carrera <-> Programa (`career_program_mappings`)
--   6. Conflictos detectados entre SNIES y sitio institucional (`academic_conflicts`)
--   7. Ejecuciones de ingestión (`academic_ingestion_runs`)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.academic_sources (
  source_id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('snies', 'men_open_data', 'institution_website', 'mock')),
  source_url TEXT NOT NULL,
  institution_id TEXT,
  program_id TEXT,
  verification_status TEXT NOT NULL CHECK (verification_status IN ('verified', 'stale', 'unavailable', 'mock')),
  retrieved_at TIMESTAMPTZ,
  last_verified_at TIMESTAMPTZ,
  content_hash TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.institutions (
  institution_id TEXT PRIMARY KEY,
  official_name TEXT NOT NULL,
  short_name TEXT,
  snies_institution_code TEXT UNIQUE,
  nit TEXT,
  sector TEXT NOT NULL CHECK (sector IN ('public', 'private', 'mixed', 'unknown')),
  institution_type TEXT NOT NULL CHECK (
    institution_type IN (
      'university',
      'university_institution',
      'technological',
      'technical_professional',
      'sena',
      'other'
    )
  ),
  department TEXT NOT NULL,
  municipality TEXT NOT NULL,
  official_website_url TEXT,
  official_domain TEXT,
  accreditation TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'unknown')),
  source_status TEXT NOT NULL CHECK (source_status IN ('verified', 'stale', 'unavailable', 'mock')),
  official_source_id TEXT REFERENCES public.academic_sources(source_id) ON DELETE SET NULL,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.academic_programs (
  program_id TEXT PRIMARY KEY,
  institution_id TEXT NOT NULL REFERENCES public.institutions(institution_id) ON DELETE CASCADE,
  official_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  snies_code TEXT UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'unknown')),
  academic_level TEXT NOT NULL CHECK (
    academic_level IN (
      'technical_professional',
      'technological',
      'professional',
      'specialization',
      'masters',
      'doctorate',
      'other'
    )
  ),
  modality TEXT NOT NULL CHECK (modality IN ('presential', 'virtual', 'hybrid', 'unknown')),
  department TEXT NOT NULL,
  municipality TEXT NOT NULL,
  official_program_url TEXT,
  official_source_id TEXT REFERENCES public.academic_sources(source_id) ON DELETE SET NULL,
  source_status TEXT NOT NULL CHECK (source_status IN ('verified', 'stale', 'unavailable', 'mock')),
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.program_official_content (
  content_id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL UNIQUE REFERENCES public.academic_programs(program_id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  tuition TEXT,
  admission_requirements JSONB,
  graduate_profile TEXT,
  professional_profile TEXT,
  study_plan_url TEXT,
  modality_text TEXT,
  additional_information TEXT,
  retrieved_at TIMESTAMPTZ NOT NULL,
  last_verified_at TIMESTAMPTZ NOT NULL,
  content_hash TEXT,
  extraction_status TEXT NOT NULL CHECK (extraction_status IN ('verified', 'partial', 'unavailable')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.career_program_mappings (
  id TEXT PRIMARY KEY,
  career_id TEXT NOT NULL,
  program_id TEXT NOT NULL REFERENCES public.academic_programs(program_id) ON DELETE CASCADE,
  match_type TEXT NOT NULL CHECK (match_type IN ('direct_match', 'related_match')),
  confidence NUMERIC(4, 3) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (career_id, program_id)
);

CREATE TABLE IF NOT EXISTS public.academic_conflicts (
  conflict_id TEXT PRIMARY KEY,
  institution_id TEXT REFERENCES public.institutions(institution_id) ON DELETE CASCADE,
  program_id TEXT REFERENCES public.academic_programs(program_id) ON DELETE CASCADE,
  field TEXT NOT NULL,
  source_a TEXT NOT NULL,
  value_a JSONB,
  source_b TEXT NOT NULL,
  value_b JSONB,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolution TEXT
);

CREATE TABLE IF NOT EXISTS public.academic_ingestion_runs (
  id TEXT PRIMARY KEY,
  source_type TEXT NOT NULL CHECK (source_type IN ('snies', 'men_open_data', 'institution_website', 'mock')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'completed_with_warnings', 'failed')),
  records_found INTEGER NOT NULL DEFAULT 0,
  records_created INTEGER NOT NULL DEFAULT 0,
  records_updated INTEGER NOT NULL DEFAULT 0,
  records_skipped INTEGER NOT NULL DEFAULT 0,
  records_failed INTEGER NOT NULL DEFAULT 0,
  conflicts_detected INTEGER NOT NULL DEFAULT 0,
  error_summary JSONB
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) — SECCIÓN 34
-- =============================================================================
-- Reglas:
-- 1. Cualquier usuario/estudiante puede consultar (SELECT) datos académicos públicos.
-- 2. Ningún estudiante o cliente anónimo puede modificar instituciones, programas,
--    fuentes ni mapeos oficiales desde el frontend.
-- 3. Únicamente el proceso de backend con `service_role` puede ejecutar ingestión.
-- =============================================================================

ALTER TABLE public.academic_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_official_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_program_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_ingestion_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for academic_sources"
  ON public.academic_sources FOR SELECT
  USING (true);

CREATE POLICY "Public read access for institutions"
  ON public.institutions FOR SELECT
  USING (true);

CREATE POLICY "Public read access for academic_programs"
  ON public.academic_programs FOR SELECT
  USING (true);

CREATE POLICY "Public read access for program_official_content"
  ON public.program_official_content FOR SELECT
  USING (true);

CREATE POLICY "Public read access for career_program_mappings"
  ON public.career_program_mappings FOR SELECT
  USING (true);

CREATE POLICY "Public read access for academic_conflicts"
  ON public.academic_conflicts FOR SELECT
  USING (true);
