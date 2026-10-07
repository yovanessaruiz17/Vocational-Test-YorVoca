import React, { useState } from 'react';
import { departments, colombiaLocations } from '../../../data/colombiaLocations';
import { Location, Flexibility } from '../../../types/student';
import { MapPin, Navigation, Info } from 'lucide-react';

interface Props {
  initialCurrent: Location | null;
  initialTarget: Location | null;
  initialFlex: Flexibility | null;
  onNext: (current: Location, target: Location, flex: Flexibility) => void;
}

export const LocationStep: React.FC<Props> = ({ initialCurrent, initialTarget, initialFlex, onNext }) => {
  const [currentDept, setCurrentDept] = useState(initialCurrent?.department || '');
  const [currentCity, setCurrentCity] = useState(initialCurrent?.city || '');
  
  const [targetDept, setTargetDept] = useState(initialTarget?.department || '');
  const [targetCity, setTargetCity] = useState(initialTarget?.city || '');
  
  const [flex, setFlex] = useState<Flexibility | ''>(initialFlex || '');

  const isFormValid = currentDept && currentCity && targetDept && targetCity && flex;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onNext(
        { department: currentDept, city: currentCity },
        { department: targetDept, city: targetCity },
        flex as Flexibility
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 ">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          ¿Dónde te encuentras?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Departamento</label>
            <select
              value={currentDept}
              onChange={(e) => {
                setCurrentDept(e.target.value);
                setCurrentCity('');
              }}
              className="w-full rounded-xl border border-gray-300 p-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">Selecciona departamento</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Ciudad / Municipio</label>
            <select
              value={currentCity}
              onChange={(e) => setCurrentCity(e.target.value)}
              disabled={!currentDept}
              className="w-full rounded-xl border border-gray-300 p-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">Selecciona ciudad</option>
              {currentDept && colombiaLocations[currentDept]?.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Navigation className="w-5 h-5 text-emerald-600" />
          ¿Dónde te gustaría estudiar?
        </h2>
        <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm flex gap-2 items-start">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <p>Puedes elegir una ciudad diferente si planeas mudarte para tus estudios.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Departamento</label>
            <select
              value={targetDept}
              onChange={(e) => {
                setTargetDept(e.target.value);
                setTargetCity('');
              }}
              className="w-full rounded-xl border border-gray-300 p-3 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">Selecciona departamento</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Ciudad / Municipio</label>
            <select
              value={targetCity}
              onChange={(e) => setTargetCity(e.target.value)}
              disabled={!targetDept}
              className="w-full rounded-xl border border-gray-300 p-3 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">Selecciona ciudad</option>
              {targetDept && colombiaLocations[targetDept]?.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">Flexibilidad Geográfica</h2>
        <p className="text-sm text-gray-600">¿Estarías dispuesto a estudiar en un lugar diferente al elegido si encuentras una excelente oportunidad?</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(['Misma ciudad', 'Mismo departamento', 'Cualquier lugar del país'] as Flexibility[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFlex(f)}
              className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                flex === f 
                  ? 'border-blue-600 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-6">
        <button
          type="submit"
          disabled={!isFormValid}
          className="w-full bg-blue-600 text-white font-semibold p-4 rounded-xl shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar
        </button>
      </div>
    </form>
  );
};
