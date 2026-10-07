import { useCallback, useEffect, useMemo, useState } from 'react';
import { ASSESSMENT_QUESTIONS } from '../../../data/questions';
import { buildAssessmentResult } from '../../../lib/assessment';
import {
  AssessmentAnswer,
  AssessmentResult,
  AssessmentStorageState,
  LikertValue,
  Question,
} from '../../../types/assessment';

export const ASSESSMENT_STORAGE_KEY = 'yorvoca_assessment';

const DEFAULT_STORAGE_STATE: AssessmentStorageState = {
  hasStarted: false,
  currentIndex: 0,
  answers: {},
  result: null,
  updatedAt: new Date(0).toISOString(),
};

function loadInitialAssessmentState(): AssessmentStorageState {
  try {
    const raw = localStorage.getItem(ASSESSMENT_STORAGE_KEY);
    if (!raw) return DEFAULT_STORAGE_STATE;
    const parsed = JSON.parse(raw) as Partial<AssessmentStorageState>;
    return {
      hasStarted: Boolean(parsed.hasStarted),
      currentIndex:
        typeof parsed.currentIndex === 'number' &&
        parsed.currentIndex >= 0 &&
        parsed.currentIndex < ASSESSMENT_QUESTIONS.length
          ? parsed.currentIndex
          : 0,
      answers: parsed.answers && typeof parsed.answers === 'object' ? parsed.answers : {},
      result: parsed.result ?? null,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error loading assessment state from localStorage:', error);
    return DEFAULT_STORAGE_STATE;
  }
}

export function useAssessment(questions: Question[] = ASSESSMENT_QUESTIONS) {
  const [state, setState] = useState<AssessmentStorageState>(loadInitialAssessmentState);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving assessment state to localStorage:', error);
    }
  }, [state]);

  const totalQuestions = questions.length;
  const currentQuestion = questions[state.currentIndex] ?? questions[0];
  const currentAnswer: AssessmentAnswer | undefined = currentQuestion
    ? state.answers[currentQuestion.id]
    : undefined;

  const answeredCount = useMemo(() => {
    return questions.filter((q) => Boolean(state.answers[q.id])).length;
  }, [questions, state.answers]);

  const unansweredQuestions = useMemo(() => {
    return questions
      .map((q, index) => ({ question: q, index }))
      .filter(({ question }) => question.required && !state.answers[question.id]);
  }, [questions, state.answers]);

  const isAllRequiredAnswered = unansweredQuestions.length === 0;
  const progressPercentage =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const startAssessment = useCallback(() => {
    setValidationMessage(null);
    setState((prev) => ({
      ...prev,
      hasStarted: true,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const selectAnswer = useCallback((questionId: string, value: LikertValue) => {
    setValidationMessage(null);
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      hasStarted: true,
      answers: {
        ...prev.answers,
        [questionId]: {
          questionId,
          value,
          answeredAt: now,
        },
      },
      updatedAt: now,
    }));
  }, []);

  const goToNext = useCallback(() => {
    if (!currentQuestion) return;
    if (currentQuestion.required && !state.answers[currentQuestion.id]) {
      setValidationMessage('Selecciona una opción antes de avanzar a la siguiente pregunta.');
      return;
    }
    setValidationMessage(null);
    setState((prev) => ({
      ...prev,
      currentIndex: Math.min(totalQuestions - 1, prev.currentIndex + 1),
      updatedAt: new Date().toISOString(),
    }));
  }, [currentQuestion, state.answers, totalQuestions]);

  const goToPrevious = useCallback(() => {
    setValidationMessage(null);
    setState((prev) => ({
      ...prev,
      currentIndex: Math.max(0, prev.currentIndex - 1),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const goToQuestion = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalQuestions) return;
      setValidationMessage(null);
      setIsReviewOpen(false);
      setState((prev) => ({
        ...prev,
        currentIndex: index,
        updatedAt: new Date().toISOString(),
      }));
    },
    [totalQuestions]
  );

  const finishAssessment = useCallback((): AssessmentResult | null => {
    if (!isAllRequiredAnswered) {
      const firstMissing = unansweredQuestions[0];
      if (firstMissing) {
        setValidationMessage(
          `Aún tienes ${unansweredQuestions.length} pregunta(s) obligatoria(s) sin responder. Te llevamos a la pregunta ${firstMissing.index + 1}.`
        );
        setState((prev) => ({
          ...prev,
          currentIndex: firstMissing.index,
        }));
      }
      return null;
    }

    setValidationMessage(null);
    const computedResult = buildAssessmentResult(state.answers, { questions });
    const nextState: AssessmentStorageState = {
      ...state,
      result: computedResult,
      updatedAt: new Date().toISOString(),
    };
    setState(nextState);
    try {
      localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(nextState));
    } catch (error) {
      console.error('Error saving assessment result to localStorage:', error);
    }
    return computedResult;
  }, [isAllRequiredAnswered, questions, state, unansweredQuestions]);

  const startNewRetakeAttempt = useCallback(() => {
    setValidationMessage(null);
    setIsReviewOpen(false);
    setState((prev) => {
      const nextState: AssessmentStorageState = {
        hasStarted: true,
        currentIndex: 0,
        answers: {},
        // Conservamos el resultado anterior hasta que se complete el nuevo test
        result: prev.result,
        updatedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(nextState));
      } catch (error) {
        console.error('Error starting retake attempt:', error);
      }
      return nextState;
    });
  }, []);

  const resetAssessment = useCallback(() => {
    setValidationMessage(null);
    setIsReviewOpen(false);
    const fresh: AssessmentStorageState = {
      hasStarted: false,
      currentIndex: 0,
      answers: {},
      result: null,
      updatedAt: new Date().toISOString(),
    };
    setState(fresh);
    try {
      localStorage.removeItem(ASSESSMENT_STORAGE_KEY);
    } catch (error) {
      console.error('Error removing assessment state:', error);
    }
  }, []);

  return {
    hasStarted: state.hasStarted,
    currentIndex: state.currentIndex,
    currentQuestion,
    currentAnswer,
    answers: state.answers,
    result: state.result,
    totalQuestions,
    answeredCount,
    unansweredQuestions,
    isAllRequiredAnswered,
    progressPercentage,
    isReviewOpen,
    validationMessage,
    setIsReviewOpen,
    startAssessment,
    selectAnswer,
    goToNext,
    goToPrevious,
    goToQuestion,
    finishAssessment,
    startNewRetakeAttempt,
    resetAssessment,
  };
}
