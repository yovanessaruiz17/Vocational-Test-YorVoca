import { LearningValidationResult } from '../../lib/learning/validateLearningModels';
import {
  CareerLearningCoverageSummary,
  CareerLearningPath,
  LearningExplorerFilters,
  LearningPathStep,
  LearningResource,
  LearningResourceMatch,
  LearningSourceReference,
} from '../../types/learning';
import {
  defaultLearningRepository,
  LearningRepository,
} from './LearningRepository';

export interface LearningDataProvider {
  readonly providerId: string;
  isReady(): boolean;
  validateIntegrity(): LearningValidationResult;
  getAllSources(): LearningSourceReference[];
  getSourceById(sourceId: string): LearningSourceReference | undefined;
  getAllResources(): LearningResource[];
  getResourceById(resourceId: string): LearningResource | undefined;
  getLearningPathByCareerId(careerId: string): CareerLearningPath | undefined;
  getAllLearningPaths(): CareerLearningPath[];
  getResourcesForCareer(
    careerId: string,
    options?: { includeRelated?: boolean; verifiedOnly?: boolean }
  ): LearningResourceMatch[];
  queryResources(filters?: LearningExplorerFilters): LearningResourceMatch[];
  getCareerLearningCoverage(
    careerId: string
  ): CareerLearningCoverageSummary | undefined;
  getAllCareerLearningCoverage(): CareerLearningCoverageSummary[];
  getStepResources(step: LearningPathStep): LearningResource[];
  getPathResources(careerId: string): LearningResource[];
}

export interface LocalLearningProviderOptions {
  repository?: LearningRepository;
}

export class LocalLearningProvider implements LearningDataProvider {
  readonly providerId = 'local_verified_learning_provider';
  private readonly repository: LearningRepository;

  constructor(options?: LocalLearningProviderOptions) {
    this.repository = options?.repository ?? defaultLearningRepository;
  }

  isReady(): boolean {
    const integrity = this.repository.validateIntegrity();
    return (
      integrity.valid &&
      this.repository.getAllLearningPaths().length > 0 &&
      this.repository.getAllSources().length > 0
    );
  }

  validateIntegrity(): LearningValidationResult {
    return this.repository.validateIntegrity();
  }

  getAllSources(): LearningSourceReference[] {
    return this.repository.getAllSources();
  }

  getSourceById(sourceId: string): LearningSourceReference | undefined {
    return this.repository.getSourceById(sourceId);
  }

  getAllResources(): LearningResource[] {
    return this.repository.getAllResources();
  }

  getResourceById(resourceId: string): LearningResource | undefined {
    return this.repository.getResourceById(resourceId);
  }

  getLearningPathByCareerId(careerId: string): CareerLearningPath | undefined {
    return this.repository.getLearningPathByCareerId(careerId);
  }

  getAllLearningPaths(): CareerLearningPath[] {
    return this.repository.getAllLearningPaths();
  }

  getResourcesForCareer(
    careerId: string,
    options?: { includeRelated?: boolean; verifiedOnly?: boolean }
  ): LearningResourceMatch[] {
    return this.repository.getResourcesForCareer(careerId, options);
  }

  queryResources(filters?: LearningExplorerFilters): LearningResourceMatch[] {
    return this.repository.queryResources(filters);
  }

  getCareerLearningCoverage(
    careerId: string
  ): CareerLearningCoverageSummary | undefined {
    return this.repository.getCareerLearningCoverage(careerId);
  }

  getAllCareerLearningCoverage(): CareerLearningCoverageSummary[] {
    return this.repository.getAllCareerLearningCoverage();
  }

  getStepResources(step: LearningPathStep): LearningResource[] {
    return this.repository.getStepResources(step);
  }

  getPathResources(careerId: string): LearningResource[] {
    return this.repository.getPathResources(careerId);
  }
}

export const defaultLocalLearningProvider = new LocalLearningProvider();
