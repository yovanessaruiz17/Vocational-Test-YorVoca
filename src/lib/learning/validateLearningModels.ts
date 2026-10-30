import { CAREER_FAMILIES_BY_ID } from '../../data/careers/careerFamilies';
import { CAREERS, CAREERS_BY_ID } from '../../data/careers/careers';
import { DIMENSIONS_BY_ID } from '../../data/careers/dimensions';
import {
  CareerLearningPath,
  LearningAccessType,
  LearningDifficultyLevel,
  LearningLanguage,
  LearningPathStep,
  LearningResource,
  LearningResourceType,
  LearningSourceReference,
  LearningSourceType,
  LearningVerificationStatus,
} from '../../types/learning';

export interface LearningValidationResult {
  valid: boolean;
  errors: string[];
}

const VALID_RESOURCE_TYPES: LearningResourceType[] = [
  'mooc',
  'course',
  'guide',
  'documentation',
  'interactive_tutorial',
  'video_series',
  'book_open',
  'practice_platform',
  'community_program',
];

const VALID_DIFFICULTY_LEVELS: LearningDifficultyLevel[] = [
  'introductory',
  'foundational',
  'intermediate',
];

const VALID_ACCESS_TYPES: LearningAccessType[] = [
  'free',
  'freemium_audit',
  'public_open',
];

const VALID_LANGUAGES: LearningLanguage[] = [
  'es',
  'en',
  'es_subtitled',
];

const VALID_SOURCE_TYPES: LearningSourceType[] = [
  'public_institution',
  'university_open',
  'official_documentation',
  'established_open_platform',
];

const VALID_VERIFICATION_STATUSES: LearningVerificationStatus[] = [
  'verified',
  'partial_reference',
];

const FORBIDDEN_URL_TOKENS = [
  'localhost',
  '127.0.0.1',
  'example.com',
  'placeholder',
  'todo',
  'mock',
  'fake',
];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function normalizeLearningText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isValidIsoTimestamp(value: unknown): boolean {
  if (!isNonEmptyString(value)) return false;
  const isoPattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/;
  if (!isoPattern.test(value.trim())) return false;
  const time = Date.parse(value);
  return !Number.isNaN(time);
}

export function validateLearningCanonicalUrl(url: unknown): LearningValidationResult {
  const errors: string[] = [];

  if (!isNonEmptyString(url)) {
    return {
      valid: false,
      errors: ['La URL canónica es obligatoria y no puede estar vacía.'],
    };
  }

  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();

  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('http://')) {
    errors.push(`Protocolo no permitido en URL canónica: ${trimmed}. Solo se permite https://.`);
  }

  let parsed: URL | null = null;
  try {
    parsed = new URL(trimmed);
  } catch {
    errors.push(`Formato de URL inválido: ${trimmed}.`);
  }

  if (parsed) {
    if (parsed.protocol !== 'https:') {
      errors.push(`La URL debe utilizar exclusivamente el protocolo https:// (${trimmed}).`);
    }
    if (!parsed.hostname || !parsed.hostname.includes('.')) {
      errors.push(`El hostname de la URL es inválido o está vacío (${trimmed}).`);
    }
    const hostAndPathLower = `${parsed.hostname}${parsed.pathname}${parsed.search}`.toLowerCase();
    for (const token of FORBIDDEN_URL_TOKENS) {
      if (hostAndPathLower.includes(token)) {
        errors.push(`La URL contiene un dominio o marcador prohibido ("${token}"): ${trimmed}.`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function isValidLearningCanonicalUrl(url: unknown): boolean {
  return validateLearningCanonicalUrl(url).valid;
}

export function validateLearningSourceReference(
  source: LearningSourceReference
): LearningValidationResult {
  const errors: string[] = [];

  if (!isNonEmptyString(source.id)) {
    errors.push('LearningSourceReference.id es obligatorio.');
  }
  if (!isNonEmptyString(source.providerName)) {
    errors.push(`LearningSourceReference (${source.id || 'sin-id'}): providerName es obligatorio.`);
  }
  if (!VALID_SOURCE_TYPES.includes(source.sourceType)) {
    errors.push(
      `LearningSourceReference (${source.id || 'sin-id'}): sourceType inválido (${String(source.sourceType)}).`
    );
  }
  if (!VALID_VERIFICATION_STATUSES.includes(source.verificationStatus)) {
    errors.push(
      `LearningSourceReference (${source.id || 'sin-id'}): verificationStatus inválido (${String(
        source.verificationStatus
      )}).`
    );
  }
  if (!isNonEmptyString(source.costPolicyNote)) {
    errors.push(
      `LearningSourceReference (${source.id || 'sin-id'}): costPolicyNote es obligatorio.`
    );
  }
  if (!isValidIsoTimestamp(source.verifiedAt)) {
    errors.push(
      `LearningSourceReference (${source.id || 'sin-id'}): verifiedAt debe ser una fecha ISO válida.`
    );
  }

  const urlCheck = validateLearningCanonicalUrl(source.canonicalUrl);
  if (!urlCheck.valid) {
    for (const err of urlCheck.errors) {
      errors.push(`LearningSourceReference (${source.id || 'sin-id'}): ${err}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateLearningResource(
  resource: LearningResource,
  sourcesById?: Record<string, LearningSourceReference>
): LearningValidationResult {
  const errors: string[] = [];
  const label = `LearningResource (${resource.id || 'sin-id'})`;

  if (!isNonEmptyString(resource.id)) {
    errors.push(`${label}: id es obligatorio.`);
  }
  if (!isNonEmptyString(resource.title)) {
    errors.push(`${label}: title es obligatorio.`);
  }
  if (!isNonEmptyString(resource.normalizedTitle)) {
    errors.push(`${label}: normalizedTitle es obligatorio.`);
  } else if (
    isNonEmptyString(resource.title) &&
    resource.normalizedTitle !== normalizeLearningText(resource.title)
  ) {
    errors.push(
      `${label}: normalizedTitle ("${resource.normalizedTitle}") no coincide con la versión normalizada del título ("${normalizeLearningText(
        resource.title
      )}").`
    );
  }
  if (!isNonEmptyString(resource.providerName)) {
    errors.push(`${label}: providerName es obligatorio.`);
  }
  if (!VALID_RESOURCE_TYPES.includes(resource.resourceType)) {
    errors.push(`${label}: resourceType inválido (${String(resource.resourceType)}).`);
  }
  if (!VALID_DIFFICULTY_LEVELS.includes(resource.difficulty)) {
    errors.push(`${label}: difficulty inválido (${String(resource.difficulty)}).`);
  }
  if (!VALID_ACCESS_TYPES.includes(resource.accessType)) {
    errors.push(`${label}: accessType inválido (${String(resource.accessType)}).`);
  }
  if (!VALID_LANGUAGES.includes(resource.language)) {
    errors.push(`${label}: language inválido (${String(resource.language)}).`);
  }
  if (!isNonEmptyString(resource.estimatedDuration)) {
    errors.push(`${label}: estimatedDuration es obligatorio.`);
  }
  if (!isNonEmptyString(resource.summary)) {
    errors.push(`${label}: summary es obligatorio.`);
  }
  if (!isNonEmptyString(resource.prerequisitesNote)) {
    errors.push(`${label}: prerequisitesNote es obligatorio.`);
  }

  if (
    !Array.isArray(resource.whatYouWillLearn) ||
    resource.whatYouWillLearn.length < 2 ||
    !resource.whatYouWillLearn.every(isNonEmptyString)
  ) {
    errors.push(`${label}: whatYouWillLearn debe contener al menos 2 aprendizajes no vacíos.`);
  }

  if (!Array.isArray(resource.careerIds) || resource.careerIds.length < 1) {
    errors.push(`${label}: careerIds debe contener al menos 1 carrera.`);
  } else {
    for (const careerId of resource.careerIds) {
      if (!CAREERS_BY_ID[careerId]) {
        errors.push(`${label}: careerId inexistente en CAREERS_BY_ID ("${careerId}").`);
      }
    }
  }

  if (!Array.isArray(resource.familyIds) || resource.familyIds.length < 1) {
    errors.push(`${label}: familyIds debe contener al menos 1 familia profesional.`);
  } else {
    for (const familyId of resource.familyIds) {
      if (!CAREER_FAMILIES_BY_ID[familyId]) {
        errors.push(`${label}: familyId inexistente en CAREER_FAMILIES_BY_ID ("${familyId}").`);
      }
    }
  }

  if (!Array.isArray(resource.relatedDimensionIds) || resource.relatedDimensionIds.length < 1) {
    errors.push(`${label}: relatedDimensionIds debe contener al menos 1 dimensión vocacional.`);
  } else {
    for (const dimensionId of resource.relatedDimensionIds) {
      if (!DIMENSIONS_BY_ID[dimensionId]) {
        errors.push(`${label}: dimensionId inexistente en DIMENSIONS_BY_ID ("${dimensionId}").`);
      }
    }
  }

  if (
    !Array.isArray(resource.starterTopicTags) ||
    resource.starterTopicTags.length < 1 ||
    !resource.starterTopicTags.every(isNonEmptyString)
  ) {
    errors.push(`${label}: starterTopicTags debe contener al menos 1 etiqueta no vacía.`);
  }

  const urlCheck = validateLearningCanonicalUrl(resource.canonicalUrl);
  if (!urlCheck.valid) {
    for (const err of urlCheck.errors) {
      errors.push(`${label}: ${err}`);
    }
  }

  if (!isNonEmptyString(resource.sourceId)) {
    errors.push(`${label}: sourceId es obligatorio.`);
  } else if (sourcesById) {
    const linkedSource = sourcesById[resource.sourceId];
    if (!linkedSource) {
      errors.push(`${label}: sourceId "${resource.sourceId}" no existe en el catálogo de fuentes.`);
    } else if (
      resource.verificationStatus === 'verified' &&
      linkedSource.verificationStatus !== 'verified'
    ) {
      errors.push(
        `${label}: un recurso con verificationStatus="verified" no puede depender de una fuente "${linkedSource.verificationStatus}".`
      );
    }
  }

  if (!VALID_VERIFICATION_STATUSES.includes(resource.verificationStatus)) {
    errors.push(
      `${label}: verificationStatus inválido (${String(resource.verificationStatus)}).`
    );
  }

  if (typeof resource.isColombiaSpecific !== 'boolean') {
    errors.push(`${label}: isColombiaSpecific debe ser booleano.`);
  }
  if (typeof resource.active !== 'boolean') {
    errors.push(`${label}: active debe ser booleano.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateLearningPathStep(
  step: LearningPathStep,
  expectedOrder: number,
  resourcesById?: Record<string, LearningResource>
): LearningValidationResult {
  const errors: string[] = [];
  const label = `LearningPathStep (${step.id || `orden-${expectedOrder}`})`;

  if (!isNonEmptyString(step.id)) {
    errors.push(`${label}: id es obligatorio.`);
  }
  if (step.order !== expectedOrder) {
    errors.push(
      `${label}: el orden del paso debe ser secuencial iniciando en 1 (esperado ${expectedOrder}, recibido ${step.order}).`
    );
  }
  if (!isNonEmptyString(step.title)) {
    errors.push(`${label}: title es obligatorio.`);
  }
  if (!VALID_DIFFICULTY_LEVELS.includes(step.stage)) {
    errors.push(`${label}: stage inválido (${String(step.stage)}).`);
  }
  if (!isNonEmptyString(step.objective)) {
    errors.push(`${label}: objective es obligatorio.`);
  }
  if (
    !Array.isArray(step.coreTopics) ||
    step.coreTopics.length < 2 ||
    !step.coreTopics.every(isNonEmptyString)
  ) {
    errors.push(`${label}: coreTopics debe contener al menos 2 temas fundamentales no vacíos.`);
  }
  if (!isNonEmptyString(step.suggestedPractice)) {
    errors.push(`${label}: suggestedPractice es obligatorio.`);
  }
  if (!isNonEmptyString(step.estimatedEffort)) {
    errors.push(`${label}: estimatedEffort es obligatorio.`);
  }
  if (!Array.isArray(step.linkedResourceIds)) {
    errors.push(`${label}: linkedResourceIds debe ser un arreglo.`);
  } else if (resourcesById) {
    for (const resourceId of step.linkedResourceIds) {
      if (!resourcesById[resourceId]) {
        errors.push(
          `${label}: linkedResourceId "${resourceId}" no existe en el catálogo de recursos.`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateCareerLearningPath(
  path: CareerLearningPath,
  resourcesById?: Record<string, LearningResource>
): LearningValidationResult {
  const errors: string[] = [];
  const label = `CareerLearningPath (${path.id || path.careerId || 'sin-id'})`;

  if (!isNonEmptyString(path.id)) {
    errors.push(`${label}: id es obligatorio.`);
  }

  const career = CAREERS_BY_ID[path.careerId];
  if (!career) {
    errors.push(`${label}: careerId "${path.careerId}" no existe en CAREERS_BY_ID.`);
  } else if (path.familyId !== career.familyId) {
    errors.push(
      `${label}: familyId "${path.familyId}" no coincide con la familia de la carrera "${career.id}" ("${career.familyId}").`
    );
  }

  if (!isNonEmptyString(path.title)) {
    errors.push(`${label}: title es obligatorio.`);
  }
  if (!isNonEmptyString(path.firstStepsSummary)) {
    errors.push(`${label}: firstStepsSummary es obligatorio.`);
  }

  if (
    !Array.isArray(path.starterTopics) ||
    path.starterTopics.length < 3 ||
    !path.starterTopics.every(isNonEmptyString)
  ) {
    errors.push(`${label}: starterTopics debe contener al menos 3 temas de inicio no vacíos.`);
  }

  if (
    !Array.isArray(path.entryBarriers) ||
    path.entryBarriers.length < 1 ||
    !path.entryBarriers.every(isNonEmptyString)
  ) {
    errors.push(`${label}: entryBarriers debe contener al menos 1 reto de entrada no vacío.`);
  }

  if (!Array.isArray(path.steps) || path.steps.length < 3) {
    errors.push(`${label}: steps debe contener al menos 3 pasos ordenados.`);
  } else {
    path.steps.forEach((step, index) => {
      const stepCheck = validateLearningPathStep(step, index + 1, resourcesById);
      if (!stepCheck.valid) {
        for (const err of stepCheck.errors) {
          errors.push(`${label} -> ${err}`);
        }
      }
    });
  }

  if (
    !Array.isArray(path.recommendedProjects) ||
    path.recommendedProjects.length < 1 ||
    !path.recommendedProjects.every(isNonEmptyString)
  ) {
    errors.push(
      `${label}: recommendedProjects debe contener al menos 1 proyecto práctico recomendado.`
    );
  }

  if (!Array.isArray(path.relatedDimensionIds) || path.relatedDimensionIds.length < 1) {
    errors.push(`${label}: relatedDimensionIds debe contener al menos 1 dimensión vocacional.`);
  } else {
    for (const dimensionId of path.relatedDimensionIds) {
      if (!DIMENSIONS_BY_ID[dimensionId]) {
        errors.push(`${label}: dimensionId inexistente en DIMENSIONS_BY_ID ("${dimensionId}").`);
      }
    }
  }

  if (!isValidIsoTimestamp(path.verifiedAt)) {
    errors.push(`${label}: verifiedAt debe ser una fecha ISO válida.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateLearningCatalogIntegrity(
  sources: LearningSourceReference[],
  resources: LearningResource[],
  paths: CareerLearningPath[]
): LearningValidationResult {
  const errors: string[] = [];

  const sourcesById: Record<string, LearningSourceReference> = {};
  const seenSourceIds = new Set<string>();

  for (const source of sources) {
    if (seenSourceIds.has(source.id)) {
      errors.push(`ID duplicado en sources: "${source.id}".`);
    }
    seenSourceIds.add(source.id);
    sourcesById[source.id] = source;

    const sourceCheck = validateLearningSourceReference(source);
    if (!sourceCheck.valid) {
      errors.push(...sourceCheck.errors);
    }
  }

  const resourcesById: Record<string, LearningResource> = {};
  const seenResourceIds = new Set<string>();

  for (const resource of resources) {
    if (seenResourceIds.has(resource.id)) {
      errors.push(`ID duplicado en resources: "${resource.id}".`);
    }
    seenResourceIds.add(resource.id);
    resourcesById[resource.id] = resource;

    const resourceCheck = validateLearningResource(resource, sourcesById);
    if (!resourceCheck.valid) {
      errors.push(...resourceCheck.errors);
    }
  }

  const seenPathIds = new Set<string>();
  const seenStepIds = new Set<string>();
  const pathCountByCareerId: Record<string, number> = {};

  for (const path of paths) {
    if (seenPathIds.has(path.id)) {
      errors.push(`ID duplicado en paths: "${path.id}".`);
    }
    seenPathIds.add(path.id);

    pathCountByCareerId[path.careerId] = (pathCountByCareerId[path.careerId] ?? 0) + 1;

    if (Array.isArray(path.steps)) {
      for (const step of path.steps) {
        if (seenStepIds.has(step.id)) {
          errors.push(`ID duplicado en steps: "${step.id}".`);
        }
        seenStepIds.add(step.id);
      }
    }

    const pathCheck = validateCareerLearningPath(path, resourcesById);
    if (!pathCheck.valid) {
      errors.push(...pathCheck.errors);
    }
  }

  for (const career of CAREERS) {
    const count = pathCountByCareerId[career.id] ?? 0;
    if (count === 0) {
      errors.push(`La carrera "${career.id}" (${career.name}) no tiene CareerLearningPath.`);
    } else if (count > 1) {
      errors.push(
        `La carrera "${career.id}" (${career.name}) tiene ${count} rutas de aprendizaje (debe tener exactamente 1).`
      );
    }
  }

  if (paths.length !== CAREERS.length) {
    errors.push(
      `El total de CareerLearningPath (${paths.length}) debe coincidir exactamente con el total de carreras en CAREERS (${CAREERS.length}).`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
