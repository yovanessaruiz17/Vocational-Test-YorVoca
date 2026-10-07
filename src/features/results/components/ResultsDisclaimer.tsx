import React from 'react';
import { Info } from 'lucide-react';

export const ResultsDisclaimer: React.FC = () => {
  return (
    <aside
      aria-label="Aviso de orientación vocacional"
      className="p-4 rounded-xl bg-gray-100/80 border border-gray-200 text-xs sm:text-sm text-gray-700 flex items-start gap-3 leading-relaxed"
    >
      <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
      <p>
        Este resultado es una herramienta de exploración vocacional. No es un diagnóstico
        psicológico ni determina qué carrera debes estudiar.
      </p>
    </aside>
  );
};
