import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share, PlusSquare, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
      >
        <Download className="w-4 h-4" />
        Instalar App
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Instalar en iOS
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl relative">
              <button 
                onClick={() => setShowIOSGuide(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Instalar YorVoca en iOS</h3>
              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg mt-1">
                    <Share className="w-4 h-4 text-blue-600" />
                  </div>
                  <p>1. Toca el botón <strong>Compartir</strong> en la barra de navegación de Safari.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg mt-1">
                    <PlusSquare className="w-4 h-4 text-gray-700" />
                  </div>
                  <p>2. Desliza hacia abajo y selecciona <strong>Agregar a inicio</strong>.</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-lg bg-gray-100 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-200 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
