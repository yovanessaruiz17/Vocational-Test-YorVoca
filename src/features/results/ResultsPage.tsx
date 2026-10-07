import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStudentStore } from '../../hooks/useStudentStore';
import { AIInterpretation } from './components/AIInterpretation';
import { CareerExplanation } from './components/CareerExplanation';
import { DimensionProfile } from './components/DimensionProfile';
import { FamilyScores } from './components/FamilyScores';
import { ResultsDisclaimer } from './components/ResultsDisclaimer';
import { ResultsHero } from './components/ResultsHero';
import { TopCareers } from './components/TopCareers';
import { useResults } from './hooks/useResults';
import {
  BookmarkCheck,
  Building2,
  Compass,
  RotateCcw,
} from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: studentContext } = useStudentStore();

  const {
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
  } = useResults();

  // Estado vacío o corrupto (secciones 28 y 29)
  if (status === 'empty' || status === 'corrupt' || !result) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Todavía no tienes un resultado vocacional.
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              {storageNotice ??
                'Completa las preguntas de exploración vocacional para conocer tus dimensiones destacadas, tus familias afines y tu Top 5 de carreras compatibles.'}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/test"
              className="w-full sm:w-auto min-h-[48px] px-7 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Realizar test
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleExplorePrimaryCareers = () => {
    const firstCareerId = topCareerItems[0]?.careerScore.careerId;
    if (firstCareerId) {
      setSelectedCareerId(firstCareerId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 md:py-6 space-y-8">
      {/* 1. Introducción personalizada + Disclaimer */}
      <div className="space-y-4">
        <ResultsHero
          completedAt={result.completedAt}
          evaluatedCount={evaluatedCount}
          studentContext={studentContext}
          onRequestRetake={() => setIsRetakeModalOpen(true)}
        />
        <ResultsDisclaimer />
      </div>

      {/* 2. Tu perfil vocacional y 3. Tus dimensiones destacadas */}
      <DimensionProfile dimensions={topDimensions} />

      {/* 4. Tus familias profesionales */}
      <FamilyScores families={topFamilies} />

      {/* 5. Top 5 carreras */}
      <TopCareers
        items={topCareerItems}
        selectedCareerId={selectedCareerId}
        onExploreCareer={(careerId) => setSelectedCareerId(careerId)}
      />

      {/* 6. ¿Por qué aparecen estas carreras? / Interpretación orientativa (Determinista + Gemini opcional) */}
      <AIInterpretation
        interpretation={interpretation}
        source={interpretationSource}
        isLoading={isLoadingAI}
        notice={aiNotice}
        onRequestGemini={handleRequestGeminiInterpretation}
      />

      {/* 8. Próximos pasos */}
      <section
        aria-labelledby="next-steps-heading"
        className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 space-y-6"
      >
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-gray-500">8. Próximos pasos</div>
          <h2
            id="next-steps-heading"
            className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight"
          >
            ¿Qué puedes hacer ahora?
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Continúa profundizando en las carreras compatibles o conserva tu perfil en este
            dispositivo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={handleExplorePrimaryCareers}
            className="min-h-[52px] p-4 rounded-xl bg-blue-600 text-white text-left hover:bg-blue-700 transition-colors flex flex-col justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <Compass className="w-5 h-5" aria-hidden="true" />
            <div>
              <div className="text-sm font-semibold">Explorar mis carreras</div>
              <div className="text-xs text-blue-100">
                Ver actividades y coincidencias del Top 5
              </div>
            </div>
          </button>

          <Link
            to="/academic"
            className="min-h-[52px] p-4 rounded-xl border border-gray-200 bg-gray-50 text-left hover:bg-gray-100 transition-colors flex flex-col justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Building2 className="w-5 h-5 text-blue-600" aria-hidden="true" />
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Explorar instituciones y programas
              </div>
              <div className="text-xs text-gray-500">
                Ver dónde estudiar tus carreras compatibles en Colombia
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleSaveResultLocally}
            className="min-h-[52px] p-4 rounded-xl border border-gray-200 bg-white text-left hover:bg-gray-50 transition-colors flex flex-col justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <BookmarkCheck className="w-5 h-5 text-blue-600" aria-hidden="true" />
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {savedConfirmation ? 'Resultado guardado localmente' : 'Guardar mi resultado'}
              </div>
              <div className="text-xs text-gray-500">
                {savedConfirmation
                  ? 'Disponible en este navegador al recargar'
                  : 'Conservar en la memoria de este navegador'}
              </div>
            </div>
          </button>
        </div>

        <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
          <span>
            ¿Sientes que tus preferencias cambiaron o quieres revisar otra perspectiva?
          </span>
          <button
            type="button"
            onClick={() => setIsRetakeModalOpen(true)}
            className="text-gray-700 font-medium hover:text-gray-900 hover:underline flex items-center gap-1.5 whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Volver a realizar el test
          </button>
        </div>
      </section>

      {/* 7. Modal dedicado para explorar carrera en profundidad */}
      <CareerExplanation
        explanation={selectedCareerExplanation}
        careerScore={selectedCareerScore}
        onClose={() => setSelectedCareerId(null)}
      />

      {/* Modal de confirmación para volver a realizar el test sin borrar el resultado de inmediato */}
      {isRetakeModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="retake-modal-title"
        >
          <div className="bg-white w-full max-w-md rounded-2xl border border-gray-200 p-6 space-y-4">
            <h3 id="retake-modal-title" className="text-lg font-bold text-gray-900">
              Volver a realizar el test
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              ¿Quieres comenzar nuevamente? Tu resultado actual será reemplazado cuando completes
              el nuevo test.
            </p>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsRetakeModalOpen(false)}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap"
              >
                Conservar mi resultado
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRetakeModalOpen(false);
                  navigate('/test?retake=1');
                }}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 whitespace-nowrap"
              >
                Comenzar nuevo test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
