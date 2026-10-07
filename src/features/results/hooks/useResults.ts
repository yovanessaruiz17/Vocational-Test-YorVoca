import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CAREER_FAMILIES_BY_ID,
  CAREERS_BY_ID,
} from '../../../data/careers';
import {
  buildCareerExplanation,
  buildDeterministicAIInterpretation,
  getTopEvaluatedDimensions,
  validateStoredAssessmentResult,
} from '../../../lib/assessment';
import { requestVocationalInterpretation } from '../../../services/ai/gemini';
import {
  AssessmentResult,
  AssessmentStorageState,
  CareerScore,
} from '../../../types/assessment';
import {
  AIInterpretation,
  CareerDetailedExplanation,
  InterpretationSource,
} from '../../../types/interpretation';
import { ASSESSMENT_STORAGE_KEY } from '../../assessment/hooks/useAssessment';

export type ResultsLoadStatus = 'ready' | 'empty' | 'corrupt';

export interface LoadedResultsState {
  status: ResultsLoadStatus;
  result: AssessmentResult | null;
  notice?: string;
}

/**
 * Carga y valida de forma segura el resultado desde localStorage (yorvoca_assessment).
 * Si detecta un resultado corrupto o incompleto, limpia únicamente el campo `result`
 * corrupto conservando las respuestas válidas existentes.
 */
export function loadAndValidateResultsFromStorage(): LoadedResultsState {
  try {
    const raw = localStorage.getItem(ASSESSMENT_STORAGE_KEY);
    if (!raw) {
      return { status: 'empty', result: null };
    }

    const parsed = JSON.parse(raw) as Partial<AssessmentStorageState> | null;
    if (!parsed || typeof parsed !== 'object') {
      localStorage.removeItem(ASSESSMENT_STORAGE_KEY);
      return {
        status: 'corrupt',
        result: null,
        notice:
          'Encontramos un registro incompleto en tu navegador. Lo limpiamos para que puedas realizar el test sin inconvenientes.',
      };
    }

    if (parsed.result === null || parsed.result === undefined) {
      return { status: 'empty', result: null };
    }

    const validation = validateStoredAssessmentResult(parsed.result);
    if (!validation.isValid || !validation.result) {
      // Limpiar únicamente el resultado corrupto, preservando las respuestas del usuario
      const cleanedState: AssessmentStorageState = {
        hasStarted: Boolean(parsed.hasStarted),
        currentIndex: typeof parsed.currentIndex === 'number' ? parsed.currentIndex : 0,
        answers:
          parsed.answers && typeof parsed.answers === 'object' ? parsed.answers : {},
        result: null,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(cleanedState));

      return {
        status: 'corrupt',
        result: null,
        notice:
          'Tu resultado anterior estaba incompleto o desactualizado. Limpiamos ese registro para que puedas completar el test de forma segura.',
      };
    }

    return {
      status: 'ready',
      result: validation.result,
    };
  } catch {
    try {
      localStorage.removeItem(ASSESSMENT_STORAGE_KEY);
    } catch {
      // Ignorar errores de almacenamiento bloqueado
    }
    return {
      status: 'corrupt',
      result: null,
      notice:
        'No fue posible leer el resultado guardado. Puedes realizar nuevamente el test vocacional.',
    };
  }
}

export function useResults() {
  const [loadedState] = useState<LoadedResultsState>(loadAndValidateResultsFromStorage);
  const { status, result, notice: storageNotice } = loadedState;

  const [selectedCareerId, setSelectedCareerId] = useState<string | null>(null);
  const [isRetakeModalOpen, setIsRetakeModalOpen] = useState(false);
  const [savedConfirmation, setSavedConfirmation] = useState(false);

  const deterministicInterpretation = useMemo<AIInterpretation | null>(() => {
    if (!result) return null;
    return buildDeterministicAIInterpretation(result);
  }, [result]);

  const [interpretation, setInterpretation] = useState<AIInterpretation | null>(
    deterministicInterpretation
  );
  const [interpretationSource, setInterpretationSource] =
    useState<InterpretationSource>('deterministic_fallback');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  useEffect(() => {
    if (deterministicInterpretation) {
      setInterpretation(deterministicInterpretation);
    }
  }, [deterministicInterpretation]);

  const topDimensions = useMemo(() => {
    if (!result) return [];
    return getTopEvaluatedDimensions(result.dimensionScores, 6);
  }, [result]);

  const evaluatedCount = useMemo(() => {
    if (!result) return 0;
    return result.dimensionScores.filter((d) => d.assessed).length;
  }, [result]);

  const topFamilies = useMemo(() => {
    if (!result) return [];
    return result.familyScores.slice(0, 4).map((fs) => {
      const family = CAREER_FAMILIES_BY_ID[fs.familyId];
      return {
        ...fs,
        name: family?.name ?? fs.familyId,
        description: family?.description ?? '',
      };
    });
  }, [result]);

  const topCareerItems = useMemo(() => {
    if (!result) return [];
    const scoresById = new Map<string, CareerScore>();
    for (const cs of result.careerScores) {
      scoresById.set(cs.careerId, cs);
    }

    return result.topCareers
      .slice(0, 5)
      .map((careerId) => scoresById.get(careerId))
      .filter((cs): cs is CareerScore => Boolean(cs))
      .map((cs) => {
        const career = CAREERS_BY_ID[cs.careerId];
        const family = career
          ? CAREER_FAMILIES_BY_ID[career.familyId]
          : CAREER_FAMILIES_BY_ID[cs.familyId];
        return {
          careerScore: cs,
          career,
          family,
          explanation: buildCareerExplanation(cs, career, family),
        };
      });
  }, [result]);

  const selectedCareerExplanation = useMemo<CareerDetailedExplanation | null>(() => {
    if (!selectedCareerId || !result) return null;
    const found = topCareerItems.find(
      (item) => item.careerScore.careerId === selectedCareerId
    );
    if (found) return found.explanation;

    const cs = result.careerScores.find((c) => c.careerId === selectedCareerId);
    if (!cs) return null;
    return buildCareerExplanation(cs);
  }, [selectedCareerId, result, topCareerItems]);

  const selectedCareerScore = useMemo<CareerScore | null>(() => {
    if (!selectedCareerId || !result) return null;
    return result.careerScores.find((c) => c.careerId === selectedCareerId) ?? null;
  }, [selectedCareerId, result]);

  const handleRequestGeminiInterpretation = useCallback(async () => {
    if (!result) return;
    setIsLoadingAI(true);
    setAiNotice(null);
    const response = await requestVocationalInterpretation(result);
    setInterpretation(response.interpretation);
    setInterpretationSource(response.source);
    if (response.notice) {
      setAiNotice(response.notice);
    }
    setIsLoadingAI(false);
  }, [result]);

  const handleSaveResultLocally = useCallback(() => {
    if (!result) return;
    try {
      const raw = localStorage.getItem(ASSESSMENT_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as Partial<AssessmentStorageState>) : {};
      const next: AssessmentStorageState = {
        hasStarted: true,
        currentIndex: typeof parsed.currentIndex === 'number' ? parsed.currentIndex : 0,
        answers: parsed.answers && typeof parsed.answers === 'object' ? parsed.answers : {},
        result,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(next));
      setSavedConfirmation(true);
    } catch {
      // Ignorar si localStorage falla
    }
  }, [result]);

  return {
    status,
    result,
    storageNotice,
    topDimensions,
    evaluatedCount,
    topFamilies,
    topCareerItems,
    selectedCareerId,
    selectedCareerExplanation,
    selectedCareerScore,
    interpretation,
    interpretationSource,
    isLoadingAI,
    aiNotice,
    isRetakeModalOpen,
    savedConfirmation,
    setSelectedCareerId,
    setIsRetakeModalOpen,
    handleRequestGeminiInterpretation,
    handleSaveResultLocally,
  };
}
