/**
 * @project YorVoca - Orientación Vocacional y Exploración Académica en Colombia
 * @author Yordev
 * @description Política de Cookies y Almacenamiento Local (PWA y localStorage).
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cookie, HardDrive, Info, ShieldCheck, Smartphone, Trash2 } from 'lucide-react';

export const CookiesPage: React.FC = () => {
  const handleClearData = () => {
    if (window.confirm('¿Deseas eliminar el almacenamiento local de YorVoca en este navegador?')) {
      localStorage.clear();
      alert('Almacenamiento local limpiado con éxito.');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 space-y-8">
      {/* Botón de retorno */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Volver al inicio
        </Link>
      </div>

      {/* Header del documento */}
      <header className="space-y-3 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
          <Cookie className="w-4 h-4" aria-hidden="true" />
          <span>Tecnologías de Almacenamiento Web y PWA</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
          Política de Cookies y Almacenamiento Local
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Transparencia técnica sobre memoria del navegador y funcionamiento sin conexión
        </p>
        <p className="text-sm sm:text-base text-gray-700 leading-relaxed pt-2">
          En <strong>YorVoca</strong> creemos en una web limpia, rápida y respetuosa. Esta política explica de forma clara y sin tecnicismos innecesarios cómo utilizamos el almacenamiento local de tu navegador y por qué <strong>no empleamos cookies de rastreo publicitario</strong>.
        </p>
      </header>

      {/* Secciones de Cookies */}
      <div className="space-y-6">
        {/* 1. Declaración de cero cookies publicitarias */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
              1
            </span>
            Cero Cookies de Publicidad o Rastreo de Terceros
          </h2>
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs sm:text-sm text-emerald-950 space-y-1.5 leading-relaxed">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Compromiso de Privacidad Activa
            </div>
            <p>
              YorVoca <strong>no utiliza cookies de terceros para publicidad comportamental, ni píxeles de seguimiento de redes sociales (como Facebook Pixel o Google Ads Remarketing), ni vende identificadores a redes de mercadeo</strong>.
            </p>
          </div>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            Tu navegación en YorVoca no genera huellas digitales para perseguirte con anuncios en otros sitios web.
          </p>
        </section>

        {/* 2. Qué tecnologías utilizamos */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
              2
            </span>
            Tecnologías de Almacenamiento Utilizadas
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            Para ofrecer una experiencia fluida y permitir que completes tu test vocacional a tu propio ritmo, utilizamos tecnologías nativas de los navegadores web modernos:
          </p>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
              <div className="font-bold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                <HardDrive className="w-4 h-4 text-blue-600" />
                Almacenamiento Local (localStorage)
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Es una memoria interna reservada por tu navegador para el dominio de YorVoca. Se utiliza exclusivamente para:
              </p>
              <ul className="list-disc list-inside text-xs sm:text-sm text-gray-700 space-y-1">
                <li>Guardar tu progreso en el test de 48 preguntas para que no pierdas tus respuestas si recargas la página o se cierra el navegador.</li>
                <li>Conservar tus preferencias de ubicación (departamento/ciudad objetivo) y modalidad de estudio.</li>
                <li>Mantener tu último resultado vocacional calculado (Top 5 y dimensiones destacadas) en tu dispositivo.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
              <div className="font-bold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                Caché de Aplicación Progresiva (Service Worker & Cache Storage)
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                YorVoca es una Progressive Web App (PWA). El Service Worker almacena en la memoria caché del navegador los archivos estáticos esenciales (código JavaScript, hojas de estilo CSS, fuentes e iconos) para permitir:
              </p>
              <ul className="list-disc list-inside text-xs sm:text-sm text-gray-700 space-y-1">
                <li>Carga casi instantánea al reingresar a la plataforma.</li>
                <li>Capacidad de operar y revisar tus resultados y catálogo académico <strong>incluso sin conexión a internet (modo offline)</strong>.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. Control y borrado del almacenamiento */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
              3
            </span>
            ¿Cómo puedes gestionar o eliminar estos datos?
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            Tienes la facultad total de borrar los datos almacenados en cualquier momento, bien sea desde esta misma pantalla o a través de los ajustes de tu navegador (Chrome, Safari, Edge, Firefox):
          </p>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Limpiar almacenamiento local de YorVoca</h3>
              <p className="text-xs text-gray-600">
                Esta acción restablece el test y borra los resultados de este navegador.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearData}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              Limpiar memoria local
            </button>
          </div>
        </section>
      </div>

      {/* Navegación a otras políticas */}
      <nav aria-label="Otras políticas legales" className="p-6 bg-white rounded-2xl border border-gray-200 space-y-3">
        <h3 className="text-sm font-bold text-gray-900">Documentos legales complementarios</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
          <Link
            to="/terminos"
            className="p-3 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition-colors border border-gray-100"
          >
            <div className="font-semibold text-gray-900">Términos y Condiciones</div>
            <div className="text-xs text-gray-500">Reglas de uso del servicio</div>
          </Link>
          <Link
            to="/privacidad"
            className="p-3 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition-colors border border-gray-100"
          >
            <div className="font-semibold text-gray-900">Política de Privacidad</div>
            <div className="text-xs text-gray-500">Habeas Data y Ley 1581</div>
          </Link>
          <Link
            to="/aviso-legal"
            className="p-3 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition-colors border border-gray-100"
          >
            <div className="font-semibold text-gray-900">Aviso Legal y Descargo</div>
            <div className="text-xs text-gray-500">Alcance orientativo y fuentes SNIES</div>
          </Link>
        </div>
      </nav>
    </div>
  );
};
