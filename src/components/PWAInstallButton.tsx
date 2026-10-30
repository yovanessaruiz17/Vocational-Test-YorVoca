import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share, PlusSquare, X, Smartphone } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'drawer';
  onInstallSuccess?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  onInstallSuccess,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    if (variant === 'drawer') {
      return (
        <div className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>YorVoca está instalada en tu dispositivo</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onInstallSuccess?.();
    }
  };

  // Modo cajón móvil (drawer)
  if (variant === 'drawer') {
    if (isInstallable) {
      return (
        <button
          type="button"
          onClick={handleInstallClick}
          className="w-full min-h-[48px] p-3.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-between shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <div>
              <div className="text-sm font-bold leading-tight">Instalar YorVoca</div>
              <div className="text-[11px] text-blue-100">Acceso rápido y modo sin conexión</div>
            </div>
          </div>
          <span className="text-xs font-semibold bg-white text-blue-700 px-3 py-1.5 rounded-lg shrink-0">
            Instalar
          </span>
        </button>
      );
    }

    if (isIOS) {
      return (
        <>
          <button
            type="button"
            onClick={() => setShowIOSGuide(true)}
            className="w-full min-h-[48px] p-3.5 rounded-xl bg-white border border-blue-200 text-gray-800 hover:bg-blue-50/50 transition-colors flex items-center justify-between shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4 text-blue-600" aria-hidden="true" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900 leading-tight">Instalar en iPhone / iPad</div>
                <div className="text-[11px] text-gray-500">Añadir a pantalla de inicio</div>
              </div>
            </div>
            <span className="text-xs font-semibold text-blue-600 shrink-0">
              Ver cómo →
            </span>
          </button>

          {showIOSGuide && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-labelledby="ios-guide-title"
            >
              <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Cerrar guía de instalación"
                  className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 id="ios-guide-title" className="text-lg font-bold text-gray-900 mb-3">
                  Instalar YorVoca en iOS
                </h3>
                <div className="space-y-3.5 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-100 p-2 rounded-xl mt-0.5 shrink-0">
                      <Share className="w-4 h-4 text-blue-600" />
                    </div>
                    <p>
                      1. Toca el botón <strong>Compartir</strong> en la barra de Safari.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-100 p-2 rounded-xl mt-0.5 shrink-0">
                      <PlusSquare className="w-4 h-4 text-gray-700" />
                    </div>
                    <p>
                      2. Desliza hacia abajo y selecciona <strong>Agregar a inicio</strong>.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="mt-6 w-full min-h-[44px] rounded-xl bg-gray-100 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-200 transition-colors"
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
  }

  // Modo encabezado (header): compacto en móvil, expansible en desktop
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={handleInstallClick}
        title="Instalar YorVoca en tu dispositivo"
        aria-label="Instalar YorVoca en tu dispositivo"
        className="min-h-[40px] px-2.5 sm:px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline whitespace-nowrap">Instalar App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          title="Instalar en iOS"
          aria-label="Instalar en iOS"
          className="min-h-[40px] px-2.5 sm:px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 text-xs sm:text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <Download className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline whitespace-nowrap">Instalar en iOS</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-header-guide-title"
          >
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                aria-label="Cerrar guía de instalación"
                className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 id="ios-header-guide-title" className="text-lg font-bold text-gray-900 mb-3">
                Instalar YorVoca en iOS
              </h3>
              <div className="space-y-3.5 text-xs sm:text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 p-2 rounded-xl mt-0.5 shrink-0">
                    <Share className="w-4 h-4 text-blue-600" />
                  </div>
                  <p>
                    1. Toca el botón <strong>Compartir</strong> en la barra de Safari.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 p-2 rounded-xl mt-0.5 shrink-0">
                    <PlusSquare className="w-4 h-4 text-gray-700" />
                  </div>
                  <p>
                    2. Desliza hacia abajo y selecciona <strong>Agregar a inicio</strong>.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full min-h-[44px] rounded-xl bg-gray-100 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-200 transition-colors"
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
