export type DimensionCategory =
  | 'interest'
  | 'aptitude'
  | 'work_preference'
  | 'motivator';

export type NormalizedWeightValue = 0 | 0.25 | 0.5 | 0.75 | 1;

export interface VocationalDimension {
  id: string;
  name: string;
  description: string;
  category: DimensionCategory;
}

export interface CareerFamily {
  id: string;
  name: string;
  description: string;
}

export interface Career {
  id: string;
  name: string;
  normalizedName: string;
  familyId: string;
  shortDescription: string;
  whatYouDo: string[];
  typicalAreas: string[];
  relatedDimensions: string[];
}

export interface CareerDimensionWeight {
  careerId: string;
  dimensionId: string;
  weight: number;
}

export type ValidationSeverity = 'error' | 'warning';

export interface CatalogValidationIssue {
  code: string;
  severity: ValidationSeverity;
  message: string;
  entityType: 'family' | 'dimension' | 'career' | 'weight';
  entityId?: string;
}

export interface CatalogValidationResult {
  isValid: boolean;
  issues: CatalogValidationIssue[];
  stats: {
    familiesCount: number;
    dimensionsCount: number;
    careersCount: number;
    weightsCount: number;
    dimensionsByCategory: Record<DimensionCategory, number>;
  };
}
