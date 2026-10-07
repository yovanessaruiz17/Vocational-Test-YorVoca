import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ASSESSMENT_QUESTIONS } from '../../data/questions';
import { LikertValue } from '../../types/assessment';
import { AssessmentNavigation } from './components/AssessmentNavigation';
import { AssessmentProgress } from './components/AssessmentProgress';
import { QuestionCard } from './components/QuestionCard';
import { useAssessment } from './hooks/useAssessment';
import {
  AlertCircle,
  ArrowRight,
  Compass,
  RotateCcw,
  SlidersHorizontal,
  X,
} from 'lucide-react';

export const AssessmentFlow: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    hasStarted,
    currentIndex,
    currentQuestion,
    currentAnswer,
    answers,
    result,
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
  } = useAssessment(ASSESSMENT_QUESTIONS);

  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending'>('all');
  const [isActiveQuestionnaire, setIsActiveQuestionnaire] = useState(false);

  // Si llega con ?retake=1 desde /results, inicia un nuevo intento sin borrar el resultado previo hasta finalizar
  useEffect(() => {
    if (searchParams.get('retake') === '1') {
      startNewRetakeAttempt();
      setIsActiveQuestionnaire(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, startNewRetakeAttempt]);

  // Navegación por teclado (1..5 para responder) cuando el cuestionario está activo
  useEffect(() => {
    const isAnswering =
      hasStarted && (!result || isActiveQuestionnaire) && !isReviewOpen && Boolean(currentQuestion);
    if (!isAnswering) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const val = Number(e.key) as LikertValue;
        selectAnswer(currentQuestion.id, val);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    hasStarted,
    result,
    isActiveQuestionnaire,
    isReviewOpen,
    currentQuestion,
    selectAnswer,
  ]);

  // 1. Pantalla de bienvenida / contexto antes de iniciar el test
  if (!hasStarted && answeredCount === 0 && !result) {
    return (
      <div className="max-w-2xl mx-auto py-6 md:py-10 space-y-6">
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Exploración vocacional multidimensional</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{totalQuestions} preguntas</span>
            </div>
            <h1
              className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Descubre qué áreas y carreras conectan con tu perfil
            </h1>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
              Exploraremos cuatro dimensiones de tu perfil: tus intereses temáticos, las aptitudes
              que percibes en ti, tu forma preferida de trabajar y lo que te motiva a futuro.
            </p>
          </div>

          <div className="space-y-3 pt-2 border-t border-gray-100">
            <blockquote className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-sm text-gray-800 leading-relaxed">
              No existen respuestas correctas o incorrectas. Responde pensando en cómo eres
              realmente, no en lo que crees que deberías responder.
            </blockquote>

            <blockquote className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs md:text-sm text-gray-600 leading-relaxed">
              Este test es una herramienta de exploración vocacional y no reemplaza una orientación
              profesional o evaluación psicológica.
            </blockquote>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs text-gray-600">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="font-semibold text-gray-900 tabular-nums">12 preguntas</div>
              <div>Intereses</div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="font-semibold text-gray-900 tabular-nums">12 preguntas</div>
              <div>Aptitudes percibidas</div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="font-semibold text-gray-900 tabular-nums">12 preguntas</div>
              <div>Entorno de trabajo</div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="font-semibold text-gray-900 tabular-nums">12 preguntas</div>
              <div>Motivadores</div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link
              to="/onboarding"
              className="w-full sm:w-auto min-h-[48px] px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center transition-colors whitespace-nowrap"
            >
              Ajustar contexto de estudio
            </Link>

            <button
              type="button"
              onClick={() => {
                startAssessment();
                setIsActiveQuestionnaire(true);
              }}
              className="w-full sm:w-auto min-h-[48px] px-8 py-3 rounded-xl bg-blue-600 text-sm md:text-base font-semibold text-white hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <Compass className="w-4 h-4" />
              Comenzar exploración vocacional
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Si ya existe un resultado completado y el usuario visita /test sin estar respondiendo de nuevo
  if (result && !isActiveQuestionnaire) {
    return (
      <div className="max-w-xl mx-auto py-10">
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 space-y-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Tu perfil vocacional ya está calculado
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              Tus respuestas fueron procesadas y tu resultado está guardado en este navegador.
              Puedes ir directamente a tus resultados o comenzar una nueva exploración.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/results"
              className="w-full sm:w-auto min-h-[48px] px-7 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Ver mis resultados
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>

            <button
              type="button"
              onClick={() => {
                startNewRetakeAttempt();
                setIsActiveQuestionnaire(true);
              }}
              className="w-full sm:w-auto min-h-[48px] px-5 py-3 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Volver a realizar el test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Flujo principal de preguntas (1 pregunta por pantalla)
  const handleFinishClick = () => {
    const computed = finishAssessment();
    if (computed) {
      setIsActiveQuestionnaire(false);
      navigate('/results');
    }
  };

  const filteredReviewItems = ASSESSMENT_QUESTIONS.map((q, index) => ({
    question: q,
    index,
    answer: answers[q.id],
  })).filter((item) => (reviewFilter === 'pending' ? !item.answer : true));

  return (
    <div className="max-w-2xl mx-auto py-4 md:py-8 space-y-6">
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 space-y-6">
        <AssessmentProgress
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
          answeredCount={answeredCount}
          progressPercentage={progressPercentage}
          category={currentQuestion.category}
          onOpenReview={() => setIsReviewOpen(true)}
        />

        {validationMessage && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs md:text-sm flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{validationMessage}</span>
          </div>
        )}

        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            selectedValue={currentAnswer?.value}
            onSelectAnswer={(val) => selectAnswer(currentQuestion.id, val)}
          />
        )}

        <AssessmentNavigation
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
          hasCurrentAnswer={Boolean(currentAnswer)}
          isAllRequiredAnswered={isAllRequiredAnswered}
          onPrevious={goToPrevious}
          onNext={goToNext}
          onFinish={handleFinishClick}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-gray-500">
        <span>
          Atajo de teclado: presiona las teclas <strong className="font-mono">1</strong> a{' '}
          <strong className="font-mono">5</strong> para seleccionar tu respuesta.
        </span>

        {result && (
          <Link
            to="/results"
            className="text-blue-600 font-semibold hover:underline whitespace-nowrap"
          >
            Conservar resultado anterior y volver a /results
          </Link>
        )}
      </div>

      {/* Modal / panel de revisión de las 48 respuestas */}
      {isReviewOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-modal-title"
        >
          <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-t-3xl sm:rounded-2xl border border-gray-200 flex flex-col overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between gap-4">
              <div>
                <h2 id="review-modal-title" className="text-lg font-bold text-gray-900">
                  Revisión de respuestas
                </h2>
                <p className="text-xs text-gray-500 tabular-nums">
                  {answeredCount} de {totalQuestions} respondidas · {unansweredQuestions.length}{' '}
                  pendientes
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsReviewOpen(false)}
                className="min-h-[44px] min-w-[44px] rounded-xl text-gray-500 hover:bg-gray-100 flex items-center justify-center"
                aria-label="Cerrar revisión"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 p-1 bg-gray-200/70 rounded-lg">
                <button
                  type="button"
                  onClick={() => setReviewFilter('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    reviewFilter === 'all'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Todas ({totalQuestions})
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter('pending')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    reviewFilter === 'pending'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Pendientes ({unansweredQuestions.length})
                </button>
              </div>

              <SlidersHorizontal className="w-4 h-4 text-gray-400" aria-hidden="true" />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2 sm:p-4">
              {filteredReviewItems.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-500">
                  ¡Excelente! Has respondido todas las preguntas obligatorias del test.
                </div>
              ) : (
                filteredReviewItems.map(({ question, index, answer }) => (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => goToQuestion(index)}
                    className={`w-full p-3 rounded-xl text-left flex items-start justify-between gap-3 hover:bg-gray-50 transition-colors ${
                      index === currentIndex ? 'bg-blue-50/60' : ''
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-xs font-medium text-gray-500 tabular-nums">
                        Pregunta {index + 1}
                      </div>
                      <p className="text-sm text-gray-800 line-clamp-2">{question.text}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      {answer ? (
                        <span className="text-xs font-semibold text-blue-600 tabular-nums whitespace-nowrap">
                          Opción {answer.value}/5
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-amber-700 whitespace-nowrap">
                          Sin responder
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-100 flex items-center justify-between gap-3 bg-white">
              <button
                type="button"
                onClick={() => setIsReviewOpen(false)}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap"
              >
                Seguir respondiendo
              </button>

              <button
                type="button"
                disabled={!isAllRequiredAnswered}
                onClick={() => {
                  setIsReviewOpen(false);
                  handleFinishClick();
                }}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-blue-600 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Ver mis resultados
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
