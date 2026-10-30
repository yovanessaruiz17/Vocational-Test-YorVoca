import {
  defaultLocalLearningProvider,
  LearningDataProvider,
} from './LocalLearningProvider';

export type {
  LearningDataProvider,
  LocalLearningProviderOptions,
} from './LocalLearningProvider';
export {
  defaultLocalLearningProvider,
  LocalLearningProvider,
} from './LocalLearningProvider';
export {
  defaultLearningRepository,
  LearningRepository,
  type LearningRepositorySeed,
} from './LearningRepository';

export function getLearningExplorerProvider(): LearningDataProvider {
  return defaultLocalLearningProvider;
}
