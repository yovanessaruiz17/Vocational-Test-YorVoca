# Arquitectura de Datos Académicos — YorVoca (Fase 6A)

**Versión:** `1.6.0-PHASE6A-ACADEMIC-INTEGRATION`

---

## 1. Visión general y principio de separación

YorVoca separa estrictamente el **cálculo vocacional determinista** (Fases 3A–4) de la **capa de exploración académica real en Colombia** (Fases 5–6A).

Dentro de la capa académica, YorVoca opera con **dos fuentes complementarias** que nunca se mezclan como equivalentes:

```text
FUENTE A: SNIES / Datos Abiertos MEN
    ↓
Validación regulatoria oficial:
- ¿Existe la institución y cuál es su código SNIES?
- ¿Existe el programa y cuál es su código SNIES?
- ¿Está activo su registro?
- ¿En qué municipio y departamento está registrado?
- ¿Qué modalidad y nivel de formación tiene registrados?
    ↓
FUENTE B: Sitio Web Oficial de la Institución (.edu.co)
    ↓
Información descriptiva orientada al estudiante:
- Descripción del programa
- Perfil profesional y del egresado
- Duración y costos publicados
- Plan de estudios y requisitos de admisión
- Enlace oficial verificado
    ↓
Pipeline de Ingestión (Normalización + Validación + Deduplicación + Conflictos)
    ↓
AcademicRepository / Supabase PostgreSQL
    ↓
LocalAcademicProvider → Academic Explorer (/academic)
```

---

## 2. Regla absoluta de integridad

> **Si un dato no puede ser verificado en una fuente oficial, no se inventa.**

- Nunca se generan URLs por patrón (`https://universidad.edu.co/programa/nombre`).
- Nunca se inventan códigos SNIES; cuando el código puntual de un programa no está disponible en el corte de datos abiertos cargado, el campo `sniesCode` permanece `undefined` y la interfaz informa explícitamente: `"Código SNIES no disponible en esta fuente"`.
- Nunca se asume la existencia de una API REST pública de SNIES; la arquitectura recibe cortes de datos abiertos / archivos oficiales del MEN a través del pipeline de ingestión.

---

## 3. Modelo de fuentes y estados de verificación

Definido en `src/types/academicSource.ts`:

- **`AcademicSourceType`**:
  - `snies`: Registro verificado del Sistema Nacional de Información de la Educación Superior (MEN).
  - `men_open_data`: Corte de datos abiertos del Ministerio de Educación Nacional.
  - `institution_website`: Sitio web oficial de la institución de educación superior.
  - `mock`: Datos exclusivos de demostración y pruebas automatizadas.

- **`SourceVerificationStatus`**:
  - `verified`: Fuente oficial válida comprobada dentro de la ventana de vigencia (≤ 180 días).
  - `stale`: Información válida cuya última fecha de verificación supera el umbral de vigencia (> 180 días).
  - `unavailable`: Fuente temporalmente no consultable o sin fecha de verificación válida.
  - `mock`: Registro de demostración (una fuente `mock` **jamás** puede alcanzar estado `verified`).

---

## 4. Reglas de precedencia y conflictos académicos

Implementadas en `src/lib/academic/resolveAcademicSource.ts` y `src/lib/academic/detectAcademicConflicts.ts`:

1. **Autoridad regulatoria (SNIES / MEN)**:
   - `sniesCode` / `sniesInstitutionCode`
   - `status` (`active` | `inactive` | `unknown`)
   - `modality` oficial registrada
   - `city` / `municipality` y `department`
   - `academicLevel`
   - `sector` y `institutionType`

2. **Autoridad descriptiva (Sitio Web Oficial de la Institución)**:
   - `description`, `duration`, `tuition`, `admissionRequirements`, `graduateProfile`, `professionalProfile`, `studyPlanUrl`, `officialProgramUrl`.

3. **Detección de conflictos (`AcademicConflict`)**:
   - Si el sitio web institucional reporta un dato que contradice el registro regulatorio de SNIES (por ejemplo, SNIES registra `Presencial` y el sitio web indica `Virtual`), **no se sobrescribe silenciosamente** el valor de SNIES.
   - Se genera una entidad `AcademicConflict` conservando `sourceA`, `valueA`, `sourceB`, `valueB`, `detectedAt` y la nota de resolución.

---

## 5. Validación de dominios oficiales y scraping responsable

Implementada en `src/lib/academic/verifyOfficialDomain.ts`:

- `verifyOfficialDomain(institution, url)` exige:
  1. Protocolo seguro `https:`.
  2. Coincidencia exacta o subdominio legítimo del `officialDomain` registrado para la institución (ej. `unicartagena.edu.co`, `utb.edu.co`, `unal.edu.co`).
  3. Rechazo automático de dominios falsos o *lookalike* (`https://utb-fake.com`, `https://utb.edu.co.phishing.com`).
  4. Bloqueo estricto de dominios de terceros, buscadores, Wikipedia, blogs, redes sociales y agregadores comerciales (`educaedu`, `universia`, `emagister`, `guiaacademica`, `google.com/search`, etc.).
- El frontend React **nunca** ejecuta scraping ni crawling directo.

---

## 6. Persistencia en Supabase y Seguridad (RLS)

El esquema PostgreSQL se encuentra en `supabase/migrations/001_phase6a_academic_schema.sql` e incluye:

- `academic_sources`
- `institutions`
- `academic_programs`
- `program_official_content`
- `career_program_mappings`
- `academic_conflicts`
- `academic_ingestion_runs`

### Seguridad y Row Level Security (RLS)
- Todas las tablas tienen `ENABLE ROW LEVEL SECURITY`.
- Los estudiantes/usuarios anónimos únicamente tienen permiso `SELECT` sobre los datos académicos públicos.
- Ningún usuario puede modificar instituciones, programas ni fuentes desde el navegador.
- `SUPABASE_SERVICE_ROLE_KEY` se mantiene exclusivamente en variables de entorno de backend (`.env`) y jamás se expone con prefijo `VITE_`.

---

## 7. Guía operativa paso a paso

### Cómo agregar una nueva institución
1. Verificar el código SNIES de la institución, NIT, carácter académico, sector, municipio y dominio oficial `.edu.co` en el directorio oficial del MEN/HECAA.
2. Agregar un registro `RawSniesInstitutionInput` en `src/data/academic/verifiedColombianCatalog.ts` (o en el lote de entrada de `runAcademicIngestionPipeline`).
3. Asegurarse de incluir `officialDomain` y `officialWebsiteUrl` con protocolo `https://`.

### Cómo importar programas
1. Agregar los registros `RawSniesProgramInput` indicando `sniesInstitutionCode`, `officialName`, `academicLevel`, `modality`, `department`, `municipality` y `status`.
2. Si se conoce el código SNIES verificado del programa, asignarlo en `sniesProgramCode`; si no está confirmado en la fuente, dejar `sniesProgramCode: undefined` (nunca inventarlo).

### Cómo verificar una fuente
1. Ejecutar `verifyOfficialDomain(institution, url)` para validar que la URL pertenezca al dominio institucional oficial.
2. Ejecutar `validateAcademicSourceRecord(source)` para comprobar el tipo de fuente, estado de verificación y ausencia de dominios de terceros.

### Cómo ejecutar una ingestión
```ts
import { defaultAcademicRepository } from '../src/services/academic';

const result = defaultAcademicRepository.ingest({
  institutions: [...],
  programs: [...],
  officialContents: [...],
  careerMappings: [...],
});
console.log(result.run); // Resumen de creados, actualizados, omitidos, fallidos y conflictos
```

### Cómo detectar conflictos
- Durante la ingestión o de forma aislada, invocar `detectAcademicConflicts(sniesProgram, websiteInput)` o consultar `defaultAcademicRepository.getAllConflicts()`.

---

## 8. Limitaciones actuales

1. **Cobertura inicial controlada y auditada (MVP Fase 6A + Auditoría F6A.1)**:
   - Se han cargado **11 instituciones reales** y **33 programas reales** priorizando **Cartagena y Bolívar** (Universidad de Cartagena, Universidad Tecnológica de Bolívar, Fundación Universitaria Tecnológico Comfenalco, Institución Universitaria Mayor de Cartagena, SENA) y **principales ciudades de Colombia** (UNAL Bogotá, Universidad de Antioquia, Universidad del Valle, Universidad del Norte, UIS, UNAD).
2. **Códigos SNIES verificados en fuentes primarias vs. información oficial parcial (Auditoría F6A.1)**:
   - **10 instituciones** cuentan con su código IES SNIES verificado contra fuentes primarias oficiales (`1205` Universidad de Cartagena, `1830` Universidad Tecnológica de Bolívar, `3103` Institución Universitaria Mayor de Cartagena, `9110` SENA, `1101` UNAL Bogotá, `1201` UdeA, `1203` Univalle, `1713` Universidad del Norte, `1204` UIS, `2102` UNAD), mientras que **1 institución** (`Fundación Universitaria Tecnológico Comfenalco`, NIT `890481183-1`) se mantiene con `sniesInstitutionCode: undefined` y `source.type = 'institution_website'` tras eliminar el código erróneo `2725`.
   - **18 programas** cuentan con su código SNIES individual verificado directamente en fuentes primarias oficiales (`.edu.co` institucional / MEN) y `source.type = 'snies'`, y **15 programas** provienen de oferta institucional pública confirmada sin código SNIES numérico individual en este corte local (`sniesCode: undefined`), por lo que se etiquetan como `"Información oficial parcial"` y `"Código SNIES no disponible en esta fuente"`.
3. **Contenido descriptivo web parcial**:
   - No se almacenan valores de matrícula por semestre ni URLs profundas no verificadas; cuando el enlace apunta a la raíz institucional `.edu.co`, la interfaz lo identifica explícitamente como `"Sitio oficial institucional"`.
4. **Persistencia local por defecto**:
   - Cuando `SUPABASE_URL` no está configurado en el entorno de ejecución, `AcademicRepository` sirve el catálogo verificado en memoria con respaldo offline en `localStorage` (`yorvoca_academic_verified_cache_v1`).
