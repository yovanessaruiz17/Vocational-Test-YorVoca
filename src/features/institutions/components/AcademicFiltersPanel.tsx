import React from 'react';
import { CAREERS, CAREERS_BY_ID } from '../../../data/careers';
import { colombiaLocations, departments } from '../../../data/colombiaLocations';
import {
  AcademicInstitutionType,
  AcademicMatchType,
  AcademicModality,
  AcademicSearchFilters,
  CareerFilterScope,
} from '../../../types/academic';
import { RotateCcw, Search } from 'lucide-react';

interface AcademicFiltersPanelProps {
  filters: AcademicSearchFilters;
  topCareerIds: string[];
  onUpdateFilters: (partial: Partial<AcademicSearchFilters>) => void;
  onResetFilters: () => void;
}

export const AcademicFiltersPanel: React.FC<AcademicFiltersPanelProps> = ({
  filters,
  topCareerIds,
  onUpdateFilters,
  onResetFilters,
}) => {
  const availableCities =
    filters.department && filters.department !== 'any'
      ? colombiaLocations[filters.department] ?? []
      : Array.from(new Set(Object.values(colombiaLocations).flat())).sort((a, b) =>
          a.localeCompare(b, 'es')
        );

  const handleCareerSelectChange = (value: string) => {
    if (value === '__top5__') {
      onUpdateFilters({ careerScope: 'top5', careerId: undefined });
    } else if (value === '__all__') {
      onUpdateFilters({ careerScope: 'all', careerId: undefined });
    } else {
      onUpdateFilters({ careerScope: 'specific', careerId: value });
    }
  };

  const currentCareerSelectValue =
    filters.careerScope === 'specific' && filters.careerId
      ? filters.careerId
      : filters.careerScope === 'all'
      ? '__all__'
      : '__top5__';

  const topCareersObjects = topCareerIds
    .map((id) => CAREERS_BY_ID[id])
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const otherCareersObjects = CAREERS.filter((c) => !topCareerIds.includes(c.id)).sort((a, b) =>
    a.name.localeCompare(b.name, 'es')
  );

  return (
    <section
      aria-label="Filtros del explorador académico"
      className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Filtrar oferta académica</h2>
          <p className="text-xs text-gray-500">
            Ajusta carrera, ubicación, modalidad o tipo de institución sin perder tu contexto.
          </p>
        </div>

        <button
          type="button"
          onClick={onResetFilters}
          className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 self-start sm:self-auto whitespace-nowrap transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          Restablecer filtros de mi perfil
        </button>
      </div>

      {/* Búsqueda por palabra clave */}
      <div className="relative">
        <label htmlFor="academic-search-input" className="sr-only">
          Buscar por nombre de programa, institución o ciudad
        </label>
        <Search
          className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />
        <input
          id="academic-search-input"
          type="search"
          value={filters.searchQuery ?? ''}
          onChange={(e) => onUpdateFilters({ searchQuery: e.target.value })}
          placeholder="Buscar por nombre de programa, institución o ciudad..."
          className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
        />
      </div>

      {/* Controles principales de filtrado (Sección 14) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Carrera */}
        <div className="space-y-1.5">
          <label
            htmlFor="filter-career"
            className="block text-xs font-semibold text-gray-700"
          >
            Carrera vocacional
          </label>
          <select
            id="filter-career"
            value={currentCareerSelectValue}
            onChange={(e) => handleCareerSelectChange(e.target.value)}
            className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="__top5__">Mis carreras recomendadas (Top 5)</option>
            <option value="__all__">Todas las carreras del catálogo</option>
            {topCareersObjects.length > 0 && (
              <optgroup label="Tu Top 5 vocacional">
                {topCareersObjects.map((c, idx) => (
                  <option key={c.id} value={c.id}>
                    #{idx + 1} · {c.name}
                  </option>
                ))}
              </optgroup>
            )}
            <optgroup label="Otras carreras del catálogo">
              {otherCareersObjects.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* 2. Departamento */}
        <div className="space-y-1.5">
          <label
            htmlFor="filter-department"
            className="block text-xs font-semibold text-gray-700"
          >
            Departamento
          </label>
          <select
            id="filter-department"
            value={filters.department ?? 'any'}
            onChange={(e) =>
              onUpdateFilters({
                department: e.target.value,
                city: 'any',
              })
            }
            className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="any">Cualquier departamento</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Ciudad */}
        <div className="space-y-1.5">
          <label htmlFor="filter-city" className="block text-xs font-semibold text-gray-700">
            Ciudad
          </label>
          <select
            id="filter-city"
            value={filters.city ?? 'any'}
            onChange={(e) => onUpdateFilters({ city: e.target.value })}
            className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="any">Cualquier ciudad</option>
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Modalidad */}
        <div className="space-y-1.5">
          <label
            htmlFor="filter-modality"
            className="block text-xs font-semibold text-gray-700"
          >
            Modalidad
          </label>
          <select
            id="filter-modality"
            value={filters.modality ?? 'any'}
            onChange={(e) =>
              onUpdateFilters({ modality: e.target.value as AcademicModality | 'any' })
            }
            className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="any">Cualquier modalidad</option>
            <option value="presential">Presencial</option>
            <option value="virtual">Virtual</option>
            <option value="hybrid">Híbrida / Distancia</option>
          </select>
        </div>

        {/* 5. Tipo de institución */}
        <div className="space-y-1.5">
          <label
            htmlFor="filter-institution-type"
            className="block text-xs font-semibold text-gray-700"
          >
            Tipo de institución
          </label>
          <select
            id="filter-institution-type"
            value={filters.institutionType ?? 'any'}
            onChange={(e) =>
              onUpdateFilters({
                institutionType: e.target.value as AcademicInstitutionType | 'any',
              })
            }
            className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="any">Cualquier tipo de institución</option>
            <option value="university">Universidad</option>
            <option value="university_institution">Institución Universitaria</option>
            <option value="technological">Institución Tecnológica</option>
            <option value="technical_professional">Técnica Profesional</option>
            <option value="sena">SENA</option>
          </select>
        </div>

        {/* 6. Sector y Tipo de coincidencia */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1.5">
            <label
              htmlFor="filter-sector"
              className="block text-xs font-semibold text-gray-700"
            >
              Sector
            </label>
            <select
              id="filter-sector"
              value={filters.sector ?? 'any'}
              onChange={(e) =>
                onUpdateFilters({
                  sector: e.target.value as 'public' | 'private' | 'any',
                })
              }
              className="w-full min-h-[44px] px-2.5 py-2 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="any">Cualquiera</option>
              <option value="public">Público</option>
              <option value="private">Privado</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="filter-match-type"
              className="block text-xs font-semibold text-gray-700"
            >
              Relación
            </label>
            <select
              id="filter-match-type"
              value={filters.matchType ?? 'all'}
              onChange={(e) =>
                onUpdateFilters({
                  matchType: e.target.value as AcademicMatchType | 'all',
                })
              }
              className="w-full min-h-[44px] px-2.5 py-2 rounded-xl border border-gray-300 bg-white text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">Directos y afines</option>
              <option value="direct">Solo directos</option>
              <option value="related">Solo relacionados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Selector rápido de alcance de carrera (Top 5 vs Específica vs Todas) + verifiedOnly */}
      <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-medium text-gray-700">Alcance actual:</span>
          <span>
            {(filters.careerScope as CareerFilterScope) === 'specific' && filters.careerId
              ? `Carrera específica (${CAREERS_BY_ID[filters.careerId]?.name ?? filters.careerId})`
              : filters.careerScope === 'all'
              ? 'Todas las carreras del catálogo'
              : 'Tus 5 carreras con mayor afinidad'}
          </span>
          <span aria-hidden="true">·</span>
          <span>Estado: solo programas activos</span>
        </div>

        <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 select-none">
          <input
            type="checkbox"
            checked={Boolean(filters.verifiedOnly)}
            onChange={(e) => onUpdateFilters({ verifiedOnly: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          />
          Solo fuentes oficiales verificadas
        </label>
      </div>
    </section>
  );
};
