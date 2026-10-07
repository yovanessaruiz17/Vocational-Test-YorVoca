/**
 * @project YorVoca - Orientación Vocacional y Exploración Académica en Colombia
 * @author Yordev
 * @description Explorador académico de instituciones y programas en Colombia.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ProgramCard } from '../programs/components/ProgramCard';
import { ProgramDetailModal } from '../programs/components/ProgramDetailModal';
import { useProgramSelection } from '../programs/hooks/useProgramSelection';
import { AcademicFiltersPanel } from './components/AcademicFiltersPanel';
import { InstitutionCard } from './components/InstitutionCard';
import { useAcademicExplorer } from './hooks/useAcademicExplorer';
import {
  AlertCircle,
  ArrowLeft,
  Compass,
  Info,
} from 'lucide-react';

export const AcademicExplorer: React.FC = () => {
  const {
    assessmentStatus,
    assessmentResult,
    assessmentNotice,
    normalizedStudentContext,
    rawStudentContext,
    topCareerIds,
    careerValidation,
    exploredCareerContext,
    filters,
    hasActiveRestrictiveFilters,
    viewMode,
    dataStatus,
    provider,
    searchResult,
    setViewMode,
    updateFilters,
    resetFiltersToContext,
    expandFiltersToAllColombia,
    applyPreferencesAsFilters,
  } = useAcademicExplorer();

  const { selectedProgram, openProgramDetail, closeProgramDetail } =
    useProgramSelection();

  // Secciones 32 y 33: Si no existe AssessmentResult o estaba corrupto
  if (
    assessmentStatus === 'empty' ||
    assessmentStatus === 'corrupt' ||
    !assessmentResult
  ) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Completa primero tu exploración vocacional para obtener recomendaciones académicas
              personalizadas.
            </h1>
            {assessmentNotice && (
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {assessmentNotice}
              </p>
            )}
          </div>

          <div className="pt-2">
            <Link
              to="/test"
              className="inline-flex min-h-[48px] px-7 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 items-center justify-center transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Comenzar exploración
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const programs = searchResult?.programs ?? [];
  const institutions = searchResult?.institutions ?? [];

  return (
    <div className="max-w-4xl mx-auto py-4 md:py-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/results"
          className="min-h-[40px] px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-gray-700 hover:bg-white border border-transparent hover:border-gray-200 flex items-center gap-1.5 transition-colors whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Volver a mis resultados
        </Link>

        {exploredCareerContext && (
          <Link
            to={`/careers/${encodeURIComponent(exploredCareerContext.career.id)}`}
            className="text-xs sm:text-sm font-medium text-blue-600 hover:underline whitespace-nowrap"
          >
            Ver ficha vocacional de {exploredCareerContext.career.name}
          </Link>
        )}
      </div>

      {/* 17. Header de Academic Explorer */}
      <section className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 space-y-5">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-blue-600">
            Explorador académico · Colombia
          </div>

          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            Encuentra dónde estudiar
          </h1>

          <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-3xl">
            Explora instituciones y programas relacionados con las carreras que más afinidad tienen
            con tu perfil.
          </p>

          {exploredCareerContext && (
            <p className="text-xs sm:text-sm font-medium text-blue-700 pt-1">
              Explorando opciones relacionadas con {exploredCareerContext.career.name}
            </p>
          )}
        </div>

        {/* 19. Career Context (si el usuario llegó desde o seleccionó una carrera específica) */}
        {exploredCareerContext && (
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-medium text-gray-600">Tu carrera explorada</div>
              <div className="text-base sm:text-lg font-bold text-gray-900">
                {exploredCareerContext.career.name}
              </div>
            </div>

            {typeof exploredCareerContext.affinityPercent === 'number' && (
              <div className="sm:text-right">
                <div className="text-xs text-gray-600">Afinidad en tu perfil:</div>
                <div className="text-xl font-bold text-blue-600 tabular-nums">
                  {exploredCareerContext.affinityPercent}%
                </div>
              </div>
            )}
          </div>
        )}

        {/* 18. Preferencias del estudiante separadas de los filtros explícitos (F6A.2) */}
        {rawStudentContext &&
          (rawStudentContext.currentLocation ||
            rawStudentContext.targetLocation ||
            rawStudentContext.preferredModality ||
            rawStudentContext.preferredInstitutionType ||
            rawStudentContext.preferredSector) && (
            <div className="pt-4 border-t border-gray-100 space-y-2.5 text-xs text-gray-600">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-semibold text-gray-800">
                    Tus preferencias guardadas (priorizan el orden sin ocultar opciones):
                  </span>
                  {(rawStudentContext.targetLocation || rawStudentContext.currentLocation) && (
                    <span>
                      Ubicación:{' '}
                      {
                        (rawStudentContext.targetLocation ?? rawStudentContext.currentLocation)!
                          .city
                      }
                      ,{' '}
                      {
                        (rawStudentContext.targetLocation ?? rawStudentContext.currentLocation)!
                          .department
                      }
                    </span>
                  )}
                  {rawStudentContext.preferredModality && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>
                        Modalidad: {rawStudentContext.preferredModality.toLowerCase()}
                      </span>
                    </>
                  )}
                  {normalizedStudentContext.preferredInstitutionType !== 'any' && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>
                        Institución: {rawStudentContext.preferredInstitutionType?.toLowerCase()}
                      </span>
                    </>
                  )}
                  {normalizedStudentContext.preferredSector !== 'any' && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>
                        Sector:{' '}
                        {normalizedStudentContext.preferredSector === 'public'
                          ? 'público'
                          : 'privado'}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {normalizedStudentContext.suggestedCity &&
                    filters.city !== normalizedStudentContext.suggestedCity && (
                      <button
                        type="button"
                        onClick={() =>
                          updateFilters({
                            city: normalizedStudentContext.suggestedCity,
                            department: normalizedStudentContext.suggestedDepartment ?? 'any',
                          })
                        }
                        className="px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50/70 text-blue-700 font-medium hover:bg-blue-100 transition-colors"
                      >
                        Filtrar en {normalizedStudentContext.suggestedCity}
                      </button>
                    )}

                  <button
                    type="button"
                    onClick={applyPreferencesAsFilters}
                    className="px-2.5 py-1 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Aplicar preferencias como filtros
                  </button>

                  {hasActiveRestrictiveFilters && (
                    <button
                      type="button"
                      onClick={expandFiltersToAllColombia}
                      className="px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      Mostrar toda Colombia
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
      </section>

      {/* Aviso si se ingresó un careerId inexistente por URL */}
      {careerValidation.invalidCareerNotice && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900 flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{careerValidation.invalidCareerNotice}</span>
        </div>
      )}

      {/* 26. Estado de datos y diferenciación explícita entre Fuente Oficial, Caché Offline y Datos de Demostración */}
      <aside
        aria-label="Estado de la fuente académica"
        className={`p-4 rounded-xl border text-xs sm:text-sm flex items-start gap-3 leading-relaxed ${
          provider === 'mock'
            ? 'bg-amber-50/80 border-amber-200 text-amber-900'
            : searchResult?.cacheMetadata?.isFromOfflineCache
            ? 'bg-blue-50/80 border-blue-200 text-blue-900'
            : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
        }`}
      >
        <Info className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <div className="font-semibold">
            {provider === 'mock'
              ? 'Datos de demostración (entorno de desarrollo · provider = mock)'
              : searchResult?.cacheMetadata?.isFromOfflineCache
              ? 'Datos almacenados localmente (modo sin conexión PWA)'
              : '✓ Fuente oficial verificada (SNIES / MEN + portales institucionales .edu.co)'}
          </div>
          <p>
            {provider === 'mock'
              ? 'Los registros mostrados utilizan instituciones de demostración ("Demo YorVoca") para validar el motor de búsqueda, normalización y filtros sin inventar datos sobre universidades reales.'
              : searchResult?.cacheMetadata?.isFromOfflineCache
              ? 'Mostrando copia validada almacenada localmente en este dispositivo. Conéctate a Internet para verificar actualizaciones recientes en los portales institucionales.'
              : 'Los registros provienen de instituciones reales verificadas con código SNIES y dominio institucional oficial (.edu.co). Cuando un código o dato específico no se encuentra en la fuente local, se indica explícitamente como no disponible sin inventarlo.'}
          </p>
        </div>
      </aside>

      {/* 14. Panel de filtros del explorador */}
      <AcademicFiltersPanel
        filters={filters}
        topCareerIds={topCareerIds}
        onUpdateFilters={updateFilters}
        onResetFilters={resetFiltersToContext}
      />

      {/* 22. Dos modos de exploración: Vista Programas vs Vista Instituciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Modo de visualización académica"
          className="inline-flex items-center gap-1 p-1 bg-gray-200/80 rounded-xl self-start"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'programs'}
            onClick={() => setViewMode('programs')}
            className={`min-h-[40px] px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
              viewMode === 'programs'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Programas ({programs.length})
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'institutions'}
            onClick={() => setViewMode('institutions')}
            className={`min-h-[40px] px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
              viewMode === 'institutions'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Instituciones ({institutions.length})
          </button>
        </div>

        <div className="text-xs text-gray-500 tabular-nums">
          Ordenado por relación con la carrera, compatibilidad de ubicación/modalidad y orden
          alfabético
        </div>
      </div>

      {/* Estado de carga */}
      {dataStatus === 'loading' && (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-sm text-gray-600">
          Consultando programas e instituciones compatibles...
        </div>
      )}

      {/* Estado de error */}
      {dataStatus === 'error' && (
        <div
          role="alert"
          className="bg-white p-6 md:p-8 rounded-2xl border border-red-200 text-center space-y-3"
        >
          <h2 className="text-lg font-bold text-gray-900">
            No fue posible consultar la oferta académica
          </h2>
          <p className="text-sm text-gray-600">
            {searchResult?.errorMessage ??
              'Ocurrió un inconveniente al consultar la fuente de datos académicos.'}
          </p>
        </div>
      )}

      {/* 31. Si no hay resultados: distinguir carrera sin cobertura en el catálogo local vs filtros restrictivos */}
      {dataStatus === 'empty' && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 space-y-5">
          {filters.careerScope === 'specific' &&
          exploredCareerContext &&
          (searchResult?.unfilteredCareerProgramsCount ?? 0) === 0 ? (
            <>
              <div className="space-y-1.5">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Aún no tenemos programas verificados para {exploredCareerContext.career.name} en
                  el catálogo académico actual.
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Tu afinidad vocacional con {exploredCareerContext.career.name} sigue siendo válida
                  en tu perfil, pero en este corte del catálogo local verificado no hay programas
                  directos ni estrechamente equivalentes registrados para esta carrera.
                </p>
              </div>

              <ul className="space-y-1.5 text-xs sm:text-sm text-gray-600 pl-4 list-disc">
                <li>Explorar programas compatibles con tus 5 carreras recomendadas (Top 5);</li>
                <li>Consultar la ficha vocacional de {exploredCareerContext.career.name};</li>
                <li>Explorar todas las carreras disponibles en el catálogo académico actual.</li>
              </ul>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateFilters({ careerScope: 'top5', careerId: undefined })}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  Ver programas para mi Top 5 vocacional
                </button>

                <button
                  type="button"
                  onClick={() => updateFilters({ careerScope: 'all', careerId: undefined })}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  Explorar todo el catálogo de Colombia
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  No encontramos programas que coincidan con todos tus filtros activos.
                </h2>
                {typeof searchResult?.unfilteredCareerProgramsCount === 'number' &&
                searchResult.unfilteredCareerProgramsCount > 0 ? (
                  <p className="text-sm font-medium text-blue-700">
                    Existen {searchResult.unfilteredCareerProgramsCount} programas compatibles con tu
                    selección vocacional en el catálogo de Colombia que están ocultos por los filtros
                    actuales (ubicación, modalidad, sector o tipo de institución).
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">Prueba ampliando la búsqueda:</p>
                )}
              </div>

              <ul className="space-y-1.5 text-xs sm:text-sm text-gray-600 pl-4 list-disc">
                <li>Explorar opciones en otras ciudades o departamentos de Colombia;</li>
                <li>Cambiar la modalidad a &ldquo;Cualquier modalidad&rdquo;;</li>
                <li>
                  Incluir otros tipos de institución (universidades, tecnológicas, SENA) y sectores;
                </li>
                <li>Permitir tanto programas directos como programas relacionados.</li>
              </ul>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={expandFiltersToAllColombia}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  {typeof searchResult?.unfilteredCareerProgramsCount === 'number' &&
                  searchResult.unfilteredCareerProgramsCount > 0
                    ? `Ver los ${searchResult.unfilteredCareerProgramsCount} programas disponibles en Colombia`
                    : 'Ampliar búsqueda a toda Colombia'}
                </button>

                <button
                  type="button"
                  onClick={resetFiltersToContext}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  Restablecer filtros iniciales
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Listado de resultados en modo Programas o modo Instituciones */}
      {(dataStatus === 'ready' || dataStatus === 'mock') && (
        <div className="space-y-4">
          {viewMode === 'programs'
            ? programs.map((item) => (
                <ProgramCard
                  key={item.program.programId}
                  item={item}
                  onSelectProgram={openProgramDetail}
                />
              ))
            : institutions.map((group) => (
                <InstitutionCard
                  key={group.institution.institutionId}
                  group={group}
                  onSelectProgram={openProgramDetail}
                />
              ))}
        </div>
      )}

      {/* Modal de detalle del programa */}
      <ProgramDetailModal item={selectedProgram} onClose={closeProgramDetail} />
    </div>
  );
};
