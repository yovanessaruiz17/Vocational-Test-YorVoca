import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CAREERS_BY_ID } from '../../../data/careers';
import { useStudentStore } from '../../../hooks/useStudentStore';
import {
  buildInitialAcademicFilters,
  buildSuggestedFiltersFromContext,
  normalizeStudentContextForAcademic,
} from '../../../lib/academic';
import { getAcademicExplorerProvider } from '../../../services/academic';
import { searchAcademicOffer } from '../../../services/snies';
import {
  AcademicDataStatus,
  AcademicSearchFilters,
  AcademicSearchResult,
  AcademicSourceProvider,
} from '../../../types/academic';
import { Career } from '../../../types/career';
import {
  loadAndValidateResultsFromStorage,
  LoadedResultsState,
} from '../../results/hooks/useResults';

export type AcademicExplorerViewMode = 'programs' | 'institutions';

export function useAcademicExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: rawStudentContext } = useStudentStore();

  const [loadedAssessment] = useState<LoadedResultsState>(
    loadAndValidateResultsFromStorage
  );
  const { status: assessmentStatus, result: assessmentResult, notice: assessmentNotice } =
    loadedAssessment;

  const rawCareerParam = searchParams.get('career');

  // Validar que careerId exista en CAREERS_BY_ID (Sección 30 y 40)
  const careerValidation = useMemo<{
    requestedCareerId: string | null;
    validCareer: Career | null;
    invalidCareerNotice: string | null;
  }>(() => {
    if (!rawCareerParam || !rawCareerParam.trim()) {
      return {
        requestedCareerId: null,
        validCareer: null,
        invalidCareerNotice: null,
      };
    }

    const found = CAREERS_BY_ID[rawCareerParam.trim()];
    if (!found) {
      return {
        requestedCareerId: rawCareerParam.trim(),
        validCareer: null,
        invalidCareerNotice: `La carrera solicitada ("${rawCareerParam.trim()}") no existe en el catálogo vocacional. Mostrando opciones para tu Top 5 de carreras.`,
      };
    }

    return {
      requestedCareerId: found.id,
      validCareer: found,
      invalidCareerNotice: null,
    };
  }, [rawCareerParam]);

  const normalizedStudentContext = useMemo(
    () => normalizeStudentContextForAcademic(rawStudentContext),
    [rawStudentContext]
  );

  // Mapa de afinidades directamente desde careerScores (sin recalcular, Sección 19)
  const affinityByCareerId = useMemo<Record<string, number>>(() => {
    if (!assessmentResult) return {};
    const map: Record<string, number> = {};
    for (const cs of assessmentResult.careerScores) {
      map[cs.careerId] = cs.normalizedScore;
    }
    return map;
  }, [assessmentResult]);

  const topCareerIds = useMemo(
    () => assessmentResult?.topCareers ?? [],
    [assessmentResult]
  );

  const [filters, setFilters] = useState<AcademicSearchFilters>(() =>
    buildInitialAcademicFilters({
      studentContext: rawStudentContext,
      selectedCareerId: careerValidation.validCareer?.id ?? null,
      topCareerIds: assessmentResult?.topCareers ?? [],
    })
  );

  const [viewMode, setViewMode] = useState<AcademicExplorerViewMode>('programs');
  const [dataStatus, setDataStatus] = useState<AcademicDataStatus>('loading');
  const [provider, setProvider] = useState<AcademicSourceProvider>('mock');
  const [searchResult, setSearchResult] = useState<AcademicSearchResult | null>(null);

  // Sincronizar cuando cambia el parámetro ?career= en la URL
  useEffect(() => {
    if (careerValidation.validCareer) {
      setFilters((prev) => ({
        ...prev,
        careerScope: 'specific',
        careerId: careerValidation.validCareer!.id,
      }));
    }
  }, [careerValidation.validCareer]);

  // Ejecutar búsqueda cuando hay un AssessmentResult válido
  useEffect(() => {
    if (assessmentStatus !== 'ready' || !assessmentResult) {
      return;
    }

    let cancelled = false;
    setDataStatus('loading');

    searchAcademicOffer(
      filters,
      {
        studentContext: normalizedStudentContext,
        affinityByCareerId,
      },
      {
        provider: getAcademicExplorerProvider(),
      }
    ).then((res) => {
      if (cancelled) return;
      setSearchResult(res);
      setDataStatus(res.status);
      setProvider(res.provider);
    });

    return () => {
      cancelled = true;
    };
  }, [
    assessmentStatus,
    assessmentResult,
    filters,
    normalizedStudentContext,
    affinityByCareerId,
  ]);

  const updateFilters = useCallback(
    (partial: Partial<AcademicSearchFilters>) => {
      setFilters((prev) => {
        const next = { ...prev, ...partial };
        // Sincronizar URL query param ?career=
        if ('careerScope' in partial || 'careerId' in partial) {
          if (next.careerScope === 'specific' && next.careerId) {
            setSearchParams({ career: next.careerId }, { replace: true });
          } else {
            setSearchParams({}, { replace: true });
          }
        }
        return next;
      });
    },
    [setSearchParams]
  );

  const resetFiltersToContext = useCallback(() => {
    const initial = buildInitialAcademicFilters({
      studentContext: rawStudentContext,
      selectedCareerId: careerValidation.validCareer?.id ?? null,
      topCareerIds,
    });
    setFilters(initial);
  }, [rawStudentContext, careerValidation.validCareer, topCareerIds]);

  const expandFiltersToAllColombia = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      city: 'any',
      department: 'any',
      modality: 'any',
      institutionType: 'any',
      sector: 'any',
      status: 'active',
      verifiedOnly: false,
      matchType: 'all',
      searchQuery: '',
    }));
  }, []);

  const applyPreferencesAsFilters = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      ...buildSuggestedFiltersFromContext(rawStudentContext),
    }));
  }, [rawStudentContext]);

  const hasActiveRestrictiveFilters = useMemo(() => {
    return Boolean(
      (filters.city && filters.city !== 'any') ||
        (filters.department && filters.department !== 'any') ||
        (filters.modality && filters.modality !== 'any') ||
        (filters.institutionType && filters.institutionType !== 'any') ||
        (filters.sector && filters.sector !== 'any') ||
        (filters.matchType && filters.matchType !== 'all') ||
        filters.verifiedOnly ||
        (filters.searchQuery && filters.searchQuery.trim().length > 0)
    );
  }, [filters]);

  // Información de la carrera actualmente explorada (Sección 19)
  const exploredCareerContext = useMemo(() => {
    if (!assessmentResult) return null;
    const activeCareerId =
      filters.careerScope === 'specific' && filters.careerId ? filters.careerId : null;
    if (!activeCareerId) return null;

    const career = CAREERS_BY_ID[activeCareerId];
    if (!career) return null;

    const scoreObj = assessmentResult.careerScores.find(
      (cs) => cs.careerId === activeCareerId
    );

    return {
      career,
      affinityPercent: scoreObj ? Math.round(scoreObj.normalizedScore * 100) : null,
      rank: scoreObj?.rank ?? null,
    };
  }, [assessmentResult, filters.careerScope, filters.careerId]);

  return {
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
  };
}
