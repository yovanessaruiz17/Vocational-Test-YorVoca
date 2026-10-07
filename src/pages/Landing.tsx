import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, BookOpen, GraduationCap, MapPin } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="flex flex-col gap-12 max-w-3xl mx-auto py-8">
      <section className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-4 text-blue-600">
          <Compass className="w-10 h-10" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
          Descubre tu camino <br className="hidden md:block"/> académico ideal
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          YorVoca te ayuda a explorar carreras universitarias en Colombia basadas en tus intereses, aptitudes y preferencias.
        </p>
        
        <div className="pt-4">
          <Link 
            to="/onboarding" 
            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white bg-blue-600 rounded-xl shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-95"
          >
            Comenzar exploración
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-gray-100">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Test Multidimensional</h3>
          <p className="text-sm text-gray-600">Evalúa tus intereses, aptitudes y motivadores para encontrar áreas afines.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl mb-4">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Programas Reales</h3>
          <p className="text-sm text-gray-600">Información basada en fuentes oficiales (SNIES) sobre instituciones en Colombia.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl mb-4">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Contexto Local</h3>
          <p className="text-sm text-gray-600">Filtra por ciudad, modalidad y tipo de institución según tus posibilidades.</p>
        </div>
      </section>
    </div>
  );
};
