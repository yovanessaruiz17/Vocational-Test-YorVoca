import React, { useState } from 'react';
import { Modality, InstitutionType, SectorPreference } from '../../../types/student';
import { BookOpen, Building2, Landmark } from 'lucide-react';

interface Props {
  initialModality: Modality | null;
  initialType: InstitutionType | null;
  initialSector?: SectorPreference | null;
  onBack: () => void;
  onComplete: (modality: Modality, type: InstitutionType, sector: SectorPreference) => void;
}

const INSTITUTION_TYPE_OPTIONS: InstitutionType[] = [
  'Universidad',
  'Institución Universitaria',
  'Institución Tecnológica',
  'Técnica Profesional',
  'SENA',
  'Cualquiera',
];

const SECTOR_OPTIONS: SectorPreference[] = ['Pública', 'Privada', 'Cualquiera'];

export const PreferencesStep: React.FC<Props> = ({
  initialModality,
  initialType,
  initialSector,
  onBack,
  onComplete,
}) => {
  const [modality, setModality] = useState<Modality | ''>(initialModality || '');
  const [instType, setInstType] = useState<InstitutionType | ''>(() => {
    if (initialType === 'Pública' || initialType === 'Privada') {
      return 'Cualquiera';
    }
    return initialType || '';
  });
  const [sector, setSector] = useState<SectorPreference | ''>(() => {
    if (initialSector) return initialSector;
    if (initialType === 'Pública' || initialType === 'Privada') return initialType;
    return 'Cualquiera';
  });

  const isFormValid = Boolean(modality && instType && sector);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onComplete(
        modality as Modality,
        instType as InstitutionType,
        (sector || 'Cualquiera') as SectorPreference
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 ">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          Modalidad de Estudio Preferida
        </h2>
        <p className="text-sm text-gray-600">
          ¿Cómo prefieres recibir tus clases? Se usará como preferencia inicial sin ocultar otras opciones.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(['Presencial', 'Virtual', 'Distancia', 'Dual', 'Cualquiera'] as Modality[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setModality(m)}
              className={`p-4 rounded-xl border text-sm font-medium transition-all text-left flex justify-between items-center ${
                modality === m 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-800' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              {m}
              {modality === m && <span className="w-2 h-2 rounded-full bg-indigo-600"></span>}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-orange-600" />
          Tipo de Institución Preferido
        </h2>
        <p className="text-sm text-gray-600">
          ¿Qué carácter académico te interesa explorar principalmente?
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {INSTITUTION_TYPE_OPTIONS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setInstType(t)}
              className={`p-3.5 rounded-xl border text-sm font-medium transition-all flex items-center justify-between gap-2 ${
                instType === t 
                  ? 'border-orange-600 bg-orange-50 text-orange-800' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{t}</span>
              {instType === t && <span className="w-2 h-2 rounded-full bg-orange-600"></span>}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Landmark className="w-5 h-5 text-emerald-600" />
          Sector Preferido
        </h2>
        <p className="text-sm text-gray-600">
          ¿Tienes preferencia por instituciones del sector público o privado?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SECTOR_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSector(s)}
              className={`p-3.5 rounded-xl border text-sm font-medium transition-all flex flex-col items-center justify-center gap-2 ${
                sector === s
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-6 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-1/3 bg-white border border-gray-300 text-gray-700 font-semibold p-4 rounded-xl shadow-sm hover:bg-gray-50 transition-all"
        >
          Volver
        </button>
        <button
          type="submit"
          disabled={!isFormValid}
          className="w-2/3 bg-blue-600 text-white font-semibold p-4 rounded-xl shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Finalizar
        </button>
      </div>
    </form>
  );
};
