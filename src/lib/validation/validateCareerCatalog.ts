import {
  CAREER_DIMENSION_WEIGHTS,
  CAREER_FAMILIES,
  CAREERS,
  VOCATIONAL_DIMENSIONS,
} from '../../data/careers';
import {
  Career,
  CareerDimensionWeight,
  CareerFamily,
  CatalogValidationIssue,
  CatalogValidationResult,
  DimensionCategory,
  VocationalDimension,
} from '../../types/career';

export interface ValidateCatalogInput {
  families?: CareerFamily[];
  dimensions?: VocationalDimension[];
  careers?: Career[];
  weights?: CareerDimensionWeight[];
}

const ALLOWED_NORMALIZED_WEIGHTS = new Set([0, 0.25, 0.5, 0.75, 1]);

export function validateCareerCatalog(
  input: ValidateCatalogInput = {}
): CatalogValidationResult {
  const families = input.families ?? CAREER_FAMILIES;
  const dimensions = input.dimensions ?? VOCATIONAL_DIMENSIONS;
  const careers = input.careers ?? CAREERS;
  const weights = input.weights ?? CAREER_DIMENSION_WEIGHTS;

  const issues: CatalogValidationIssue[] = [];

  // 1. Validate Career Families
  const familyIds = new Set<string>();
  for (const family of families) {
    if (!family.id || !family.id.trim()) {
      issues.push({
        code: 'EMPTY_FAMILY_ID',
        severity: 'error',
        message: 'Existe una familia profesional con ID vacío.',
        entityType: 'family',
      });
    } else if (familyIds.has(family.id)) {
      issues.push({
        code: 'DUPLICATE_FAMILY_ID',
        severity: 'error',
        message: `ID de familia profesional duplicado: "${family.id}".`,
        entityType: 'family',
        entityId: family.id,
      });
    } else {
      familyIds.add(family.id);
    }

    if (!family.name || !family.name.trim()) {
      issues.push({
        code: 'EMPTY_FAMILY_NAME',
        severity: 'error',
        message: `La familia "${family.id}" tiene el nombre vacío.`,
        entityType: 'family',
        entityId: family.id,
      });
    }

    if (!family.description || !family.description.trim()) {
      issues.push({
        code: 'EMPTY_FAMILY_DESCRIPTION',
        severity: 'error',
        message: `La familia "${family.id}" tiene la descripción vacía.`,
        entityType: 'family',
        entityId: family.id,
      });
    }
  }

  // 2. Validate Vocational Dimensions
  const dimensionIds = new Set<string>();
  const dimensionsByCategory: Record<DimensionCategory, number> = {
    interest: 0,
    aptitude: 0,
    work_preference: 0,
    motivator: 0,
  };

  for (const dimension of dimensions) {
    if (!dimension.id || !dimension.id.trim()) {
      issues.push({
        code: 'EMPTY_DIMENSION_ID',
        severity: 'error',
        message: 'Existe una dimensión vocacional con ID vacío.',
        entityType: 'dimension',
      });
    } else if (dimensionIds.has(dimension.id)) {
      issues.push({
        code: 'DUPLICATE_DIMENSION_ID',
        severity: 'error',
        message: `ID de dimensión vocacional duplicado: "${dimension.id}".`,
        entityType: 'dimension',
        entityId: dimension.id,
      });
    } else {
      dimensionIds.add(dimension.id);
    }

    if (!dimension.name || !dimension.name.trim()) {
      issues.push({
        code: 'EMPTY_DIMENSION_NAME',
        severity: 'error',
        message: `La dimensión "${dimension.id}" tiene el nombre vacío.`,
        entityType: 'dimension',
        entityId: dimension.id,
      });
    }

    if (!dimension.description || !dimension.description.trim()) {
      issues.push({
        code: 'EMPTY_DIMENSION_DESCRIPTION',
        severity: 'error',
        message: `La dimensión "${dimension.id}" tiene la descripción vacía.`,
        entityType: 'dimension',
        entityId: dimension.id,
      });
    }

    if (dimension.category in dimensionsByCategory) {
      dimensionsByCategory[dimension.category] += 1;
    } else {
      issues.push({
        code: 'INVALID_DIMENSION_CATEGORY',
        severity: 'error',
        message: `La dimensión "${dimension.id}" tiene una categoría inválida: "${String(dimension.category)}".`,
        entityType: 'dimension',
        entityId: dimension.id,
      });
    }
  }

  // 3. Validate Careers
  const careerIds = new Set<string>();
  for (const career of careers) {
    if (!career.id || !career.id.trim()) {
      issues.push({
        code: 'EMPTY_CAREER_ID',
        severity: 'error',
        message: 'Existe una carrera con ID vacío.',
        entityType: 'career',
      });
    } else if (careerIds.has(career.id)) {
      issues.push({
        code: 'DUPLICATE_CAREER_ID',
        severity: 'error',
        message: `ID de carrera duplicado: "${career.id}".`,
        entityType: 'career',
        entityId: career.id,
      });
    } else {
      careerIds.add(career.id);
    }

    if (!career.name || !career.name.trim()) {
      issues.push({
        code: 'EMPTY_CAREER_NAME',
        severity: 'error',
        message: `La carrera "${career.id}" tiene el nombre vacío.`,
        entityType: 'career',
        entityId: career.id,
      });
    }

    if (!career.normalizedName || !career.normalizedName.trim()) {
      issues.push({
        code: 'EMPTY_CAREER_NORMALIZED_NAME',
        severity: 'error',
        message: `La carrera "${career.id}" tiene normalizedName vacío.`,
        entityType: 'career',
        entityId: career.id,
      });
    }

    if (!career.shortDescription || !career.shortDescription.trim()) {
      issues.push({
        code: 'EMPTY_CAREER_DESCRIPTION',
        severity: 'error',
        message: `La carrera "${career.id}" tiene la descripción vacía.`,
        entityType: 'career',
        entityId: career.id,
      });
    }

    if (!career.familyId || !career.familyId.trim()) {
      issues.push({
        code: 'MISSING_CAREER_FAMILY',
        severity: 'error',
        message: `La carrera "${career.id}" no tiene familia asignada.`,
        entityType: 'career',
        entityId: career.id,
      });
    } else if (!familyIds.has(career.familyId)) {
      issues.push({
        code: 'NON_EXISTENT_CAREER_FAMILY',
        severity: 'error',
        message: `La carrera "${career.id}" apunta a una familia inexistente: "${career.familyId}".`,
        entityType: 'career',
        entityId: career.id,
      });
    }

    if (!Array.isArray(career.whatYouDo) || career.whatYouDo.length === 0) {
      issues.push({
        code: 'EMPTY_CAREER_WHAT_YOU_DO',
        severity: 'error',
        message: `La carrera "${career.id}" no define actividades en whatYouDo.`,
        entityType: 'career',
        entityId: career.id,
      });
    }

    if (!Array.isArray(career.typicalAreas) || career.typicalAreas.length === 0) {
      issues.push({
        code: 'EMPTY_CAREER_TYPICAL_AREAS',
        severity: 'error',
        message: `La carrera "${career.id}" no define áreas típicas en typicalAreas.`,
        entityType: 'career',
        entityId: career.id,
      });
    }

    if (!Array.isArray(career.relatedDimensions) || career.relatedDimensions.length === 0) {
      issues.push({
        code: 'CAREER_WITHOUT_RELATED_DIMENSIONS',
        severity: 'error',
        message: `La carrera "${career.id}" no tiene dimensiones relacionadas.`,
        entityType: 'career',
        entityId: career.id,
      });
    } else {
      const seenRel = new Set<string>();
      for (const dimId of career.relatedDimensions) {
        if (!dimensionIds.has(dimId)) {
          issues.push({
            code: 'BROKEN_RELATED_DIMENSION_REFERENCE',
            severity: 'error',
            message: `La carrera "${career.id}" referencia una dimensión inexistente en relatedDimensions: "${dimId}".`,
            entityType: 'career',
            entityId: career.id,
          });
        }
        if (seenRel.has(dimId)) {
          issues.push({
            code: 'DUPLICATE_RELATED_DIMENSION_IN_CAREER',
            severity: 'error',
            message: `La carrera "${career.id}" repite la dimensión "${dimId}" en relatedDimensions.`,
            entityType: 'career',
            entityId: career.id,
          });
        }
        seenRel.add(dimId);
      }
    }
  }

  // 4. Validate Career <-> Dimension Weights
  const weightPairKeys = new Set<string>();
  const weightsByCareer = new Map<string, Map<string, number>>();

  for (const weightItem of weights) {
    const pairKey = `${weightItem.careerId}::${weightItem.dimensionId}`;

    if (weightPairKeys.has(pairKey)) {
      issues.push({
        code: 'DUPLICATE_CAREER_DIMENSION_WEIGHT',
        severity: 'error',
        message: `Peso duplicado para la combinación "${pairKey}".`,
        entityType: 'weight',
        entityId: pairKey,
      });
    } else {
      weightPairKeys.add(pairKey);
    }

    if (!careerIds.has(weightItem.careerId)) {
      issues.push({
        code: 'WEIGHT_NON_EXISTENT_CAREER',
        severity: 'error',
        message: `Un peso apunta a una carrera inexistente: "${weightItem.careerId}".`,
        entityType: 'weight',
        entityId: pairKey,
      });
    }

    if (!dimensionIds.has(weightItem.dimensionId)) {
      issues.push({
        code: 'WEIGHT_NON_EXISTENT_DIMENSION',
        severity: 'error',
        message: `Un peso de "${weightItem.careerId}" apunta a una dimensión inexistente: "${weightItem.dimensionId}".`,
        entityType: 'weight',
        entityId: pairKey,
      });
    }

    if (
      typeof weightItem.weight !== 'number' ||
      Number.isNaN(weightItem.weight) ||
      weightItem.weight < 0 ||
      weightItem.weight > 1
    ) {
      issues.push({
        code: 'WEIGHT_OUT_OF_RANGE',
        severity: 'error',
        message: `El peso "${pairKey}" tiene un valor fuera del rango [0, 1]: ${String(weightItem.weight)}.`,
        entityType: 'weight',
        entityId: pairKey,
      });
    } else if (!ALLOWED_NORMALIZED_WEIGHTS.has(weightItem.weight)) {
      issues.push({
        code: 'WEIGHT_NOT_NORMALIZED_STEP',
        severity: 'warning',
        message: `El peso "${pairKey}" (${weightItem.weight}) no usa los escalones recomendados (0, 0.25, 0.5, 0.75, 1.0).`,
        entityType: 'weight',
        entityId: pairKey,
      });
    }

    if (!weightsByCareer.has(weightItem.careerId)) {
      weightsByCareer.set(weightItem.careerId, new Map());
    }
    weightsByCareer.get(weightItem.careerId)!.set(weightItem.dimensionId, weightItem.weight);
  }

  // 5. Ensure every career has weights and matches relatedDimensions, and no two careers have identical weight vectors
  const profileSignatures = new Map<string, string>();

  for (const career of careers) {
    const careerWeights = weightsByCareer.get(career.id);
    if (!careerWeights || careerWeights.size === 0) {
      issues.push({
        code: 'CAREER_WITHOUT_WEIGHTS',
        severity: 'error',
        message: `La carrera "${career.id}" no tiene pesos definidos en careerDimensionWeights.`,
        entityType: 'career',
        entityId: career.id,
      });
      continue;
    }

    for (const relDim of career.relatedDimensions) {
      if (!careerWeights.has(relDim)) {
        issues.push({
          code: 'MISSING_WEIGHT_FOR_RELATED_DIMENSION',
          severity: 'error',
          message: `La carrera "${career.id}" incluye "${relDim}" en relatedDimensions pero no tiene peso asignado.`,
          entityType: 'career',
          entityId: career.id,
        });
      }
    }

    for (const weightedDim of careerWeights.keys()) {
      if (!career.relatedDimensions.includes(weightedDim)) {
        issues.push({
          code: 'UNLISTED_WEIGHTED_DIMENSION',
          severity: 'error',
          message: `La carrera "${career.id}" tiene peso para "${weightedDim}" pero no la lista en relatedDimensions.`,
          entityType: 'career',
          entityId: career.id,
        });
      }
    }

    const sortedSignature = Array.from(careerWeights.entries())
      .filter(([, w]) => w > 0)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([d, w]) => `${d}:${w}`)
      .join('|');

    if (profileSignatures.has(sortedSignature)) {
      const otherCareerId = profileSignatures.get(sortedSignature)!;
      issues.push({
        code: 'IDENTICAL_CAREER_PROFILES',
        severity: 'error',
        message: `Las carreras "${career.id}" y "${otherCareerId}" tienen un perfil de pesos idéntico.`,
        entityType: 'career',
        entityId: career.id,
      });
    } else {
      profileSignatures.set(sortedSignature, career.id);
    }
  }

  const hasErrors = issues.some((issue) => issue.severity === 'error');

  return {
    isValid: !hasErrors,
    issues,
    stats: {
      familiesCount: families.length,
      dimensionsCount: dimensions.length,
      careersCount: careers.length,
      weightsCount: weights.length,
      dimensionsByCategory,
    },
  };
}
