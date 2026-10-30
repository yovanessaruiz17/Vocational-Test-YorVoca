/**
 * @project YorVoca - Orientación Vocacional y Exploración Académica en Colombia
 * @author Yordev
 * @description Aviso Legal, Descargo de Responsabilidad Vocacional y Transparencia de Fuentes.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, BookOpen, ExternalLink, HelpCircle, Info, Landmark, ShieldAlert } from 'lucide-react';

export const LegalNoticePage: React.FC = () => {
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
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-600">
          <AlertTriangle className="w-4 h-4" aria-hidden="true" />
          <span>Aviso Legal · Descargo de Responsabilidad y Transparencia</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
          Aviso Legal y Descargo Vocacional
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Declaración de límites de orientación y procedencia de fuentes académicas oficiales
        </p>
        <p className="text-sm sm:text-base text-gray-700 leading-relaxed pt-2">
          La presente declaración establece de manera explícita el alcance orientativo de <strong>YorVoca</strong>, delimitando su propósito como herramienta pedagógica de autodescubrimiento y aclarando las fuentes oficiales utilizadas para el catálogo académico de Colombia.
        </p>
      </header>

      {/* Secciones del Aviso Legal */}
      <div className="space-y-6">
        {/* 1. Descargo vocacional explícito */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">
              1
            </span>
            Naturaleza de la Evaluación: Descargo Vocacional
          </h2>
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-sm text-amber-950 space-y-2 leading-relaxed">
            <div className="font-bold text-amber-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-700" />
              Declaración Fundamental de No Diagnóstico Clínico
            </div>
            <p>
              El test vocacional de 48 preguntas de YorVoca es un <strong>instrumento pedagógico de autopercepción y exploración formativa</strong>.
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
              <li><strong>NO constituye</strong> una evaluación psicológica clínica, diagnóstico de aptitud mental o dictamen psicométrico vinculante.</li>
              <li><strong>NO reemplaza</strong> el asesoramiento profesional individualizado brindado por psicólogos, psicopedagogos o consejeros escolares certificados.</li>
              <li>Los porcentajes de afinidad (por ejemplo, «85% de afinidad») representan una medida relativa de coincidencia matemática entre tus respuestas y las áreas temáticas de cada carrera; no significan probabilidad de éxito laboral, ni garantía de felicidad o rendimiento futuro.</li>
            </ul>
          </div>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            Invitamos a los aspirantes a utilizar estos resultados como un punto de partida para dialogar con orientadores escolares, familiares y profesionales en ejercicio antes de tomar una decisión de matrícula.
          </p>
        </section>

        {/* 2. Procedencia y datos del SNIES */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">
              2
            </span>
            Procedencia de la Información Académica (SNIES / MEN)
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            Los datos sobre instituciones de educación superior y programas académicos en Colombia provienen de fuentes regulatorias y públicas oficiales:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-gray-800">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5">
              <div className="font-bold text-gray-900 flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-blue-600" />
                SNIES — Ministerio de Educación Nacional
              </div>
              <p className="text-gray-600">
                Sistema Nacional de Información de la Educación Superior (SNIES). Se extrae el código oficial de registro, denominación oficial, nivel de formación y sede autorizada.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5">
              <div className="font-bold text-gray-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Portales Institucionales (.edu.co)
              </div>
              <p className="text-gray-600">
                Información descriptiva y enlaces canónicos directos a las páginas web de universidades públicas y privadas con dominio oficial autorizado en Colombia.
              </p>
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600">
            <strong>Compromiso contra datos ficticios:</strong> YorVoca no inventa códigos SNIES, ni crea programas ficticios bajo nombres de universidades reales. Cuando un dato no se encuentra en el corte del catálogo, se marca formalmente como «No disponible» para preservar la veracidad.
          </div>
        </section>

        {/* 3. Deber de verificación del aspirante */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">
              3
            </span>
            Deber de Verificación y Consulta Directa
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            Las ofertas académicas, calendarios de admisión, cupos, acreditaciones de alta calidad y valores de matrícula están sujetos a actualización constante por parte de cada institución y del Ministerio de Educación Nacional.
          </p>
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-xs sm:text-sm text-blue-900 space-y-2">
            <p><strong>Es responsabilidad del estudiante y de su familia:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Verificar en el portal oficial de la universidad las fechas de apertura de convocatorias e inscripciones.</li>
              <li>Consultar los costos actualizados de derechos de matrícula, becas del Estado (como Fondo de Solidaridad Educativa o Icetex) y descuentos vigentes.</li>
              <li>Revisar el plan de estudios vigente (malla curricular) y los prerrequisitos de grado.</li>
            </ul>
          </div>
        </section>

        {/* 4. Neutralidad e independencia */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">
              4
            </span>
            Neutralidad, Ausencia de Publicidad y No Patrocinio
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            YorVoca opera bajo un estricto principio de <strong>neutralidad pedagógica</strong>:
          </p>
          <ul className="space-y-2 text-sm sm:text-base text-gray-700 list-disc list-inside">
            <li>Ninguna institución de educación superior paga para aparecer en los primeros lugares de búsqueda ni para alterar los porcentajes de afinidad del estudiante.</li>
            <li>El ordenamiento en el explorador académico responde exclusivamente a criterios de afinidad con la carrera, cercanía geográfica declarada por el usuario y orden alfabético.</li>
            <li>No se incluyen anuncios gráficos invasivos, enlaces patrocinados encubiertos ni redirecciones comerciales hacia agentes de ventas.</li>
          </ul>
        </section>

        {/* 5. No afiliación gubernamental */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">
              5
            </span>
            Aclaración de No Afiliación Gubernamental
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            YorVoca es una iniciativa civil y tecnológica independiente creada por <strong>Yordev</strong>. No es una entidad gubernamental, ni es un canal oficial dependiente del Ministerio de Educación Nacional de Colombia, del Instituto Colombiano para la Evaluación de la Educación (ICFES) o del ICETEX.
          </p>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            Las menciones a programas públicos de orientación y portales estatales se realizan con fines informativos y de fomento del acceso a la educación superior en Colombia.
          </p>
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
            to="/cookies"
            className="p-3 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition-colors border border-gray-100"
          >
            <div className="font-semibold text-gray-900">Cookies y Almacenamiento</div>
            <div className="text-xs text-gray-500">PWA y memoria local</div>
          </Link>
        </div>
      </nav>
    </div>
  );
};
