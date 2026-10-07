import React from 'react';
import { CareerScore } from '../../../types/assessment';
import { Career, CareerFamily } from '../../../types/career';
import { CareerDetailedExplanation } from '../../../types/interpretation';
import { CareerResultCard } from './CareerResultCard';

export interface TopCareerItem {
  careerScore: CareerScore;
  career?: Career;
  family?: CareerFamily;
  explanation: CareerDetailedExplanation;
}

interface TopCareersProps {
  items: TopCareerItem[];
  selectedCareerId: string | null;
  onExploreCareer: (careerId: string) => void;
}

export const TopCareers: React.FC<TopCareersProps> = ({
  items,
  selectedCareerId,
  onExploreCareer,
}) => {
  if (items.length === 0) return null;

  return (
    <section
      id="top-careers-section"
      aria-labelledby="top-careers-heading"
      className="space-y-5"
    >
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 space-y-2">
        <div className="text-xs font-medium text-gray-500">
          5. Top 5 carreras · 6. ¿Por qué aparecen estas carreras?
        </div>
        <h2
          id="top-careers-heading"
          className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight"
        >
          Estas son las carreras que muestran mayor afinidad con tu perfil
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Cada porcentaje indica qué tanto coinciden tus respuestas con las dimensiones de cada
          carrera. No representa una probabilidad de éxito ni una certeza absoluta, sino un punto
          de partida fundamentado para explorar.
        </p>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <CareerResultCard
            key={item.careerScore.careerId}
            careerScore={item.careerScore}
            career={item.career}
            family={item.family}
            explanation={item.explanation}
            isSelected={selectedCareerId === item.careerScore.careerId}
            onExplore={onExploreCareer}
          />
        ))}
      </div>
    </section>
  );
};
