/**
 * @project YorVoca - Orientación Vocacional y Exploración Académica en Colombia
 * @author Yordev
 * @description Términos y Condiciones de Uso de la plataforma YorVoca.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, FileText, HelpCircle, Scale, ShieldAlert } from 'lucide-react';

export const TermsPage: React.FC = () => {
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
          <Scale className="w-4 h-4" aria-hidden="true" />
          <span>Marco Legal y Regulatorio · Colombia</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
          Términos y Condiciones de Uso
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Última actualización y revisión legal: 29 de octubre de 2026 · Versión 1.6
        </p>
        <p className="text-sm sm:text-base text-gray-700 leading-relaxed pt-2">
          Bienvenido(a) a <strong>YorVoca</strong>. Al acceder, navegar o utilizar esta aplicación web progresiva (PWA),
          el usuario acepta de manera plena y sin reservas los presentes Términos y Condiciones de Uso.
          Si no estás de acuerdo con alguna de estas disposiciones, te solicitamos abstenerte de utilizar la plataforma.
        </p>
      </header>

      {/* Secciones de los Términos */}
      <div className="space-y-6">
        {/* 1. Naturaleza del servicio */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
              1
            </span>
            Naturaleza y Objeto del Servicio
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            YorVoca es una plataforma tecnológica de libre acceso desarrollada por <strong>Yordev</strong>, concebida con fines estrictamente <strong>educativos, orientativos y pedagógicos</strong> para estudiantes, docentes y familias en Colombia.
          </p>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            La plataforma proporciona herramientas de autopercepción vocacional multidimensional y consulta referencial de la oferta de educación superior en Colombia a partir de registros públicos oficiales (SNIES y portales institucionales .edu.co).
          </p>
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-xs sm:text-sm text-blue-900 space-y-1">
            <strong>Gratuidad absoluta:</strong> YorVoca es y seguirá siendo un recurso gratuito. No cobra tarifas por realizar evaluaciones vocacionales, ni por consultar programas académicos, ni exige suscripciones de pago.
          </div>
        </section>

        {/* 2. No vinculación ni intermediación */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
              2
            </span>
            Ausencia de Intermediación y No Vinculación Institucional
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            YorVoca <strong>no es una institución de educación superior</strong>, no es una agencia de admisiones, ni actúa como intermediario comercial o comisionista entre los aspirantes y las universidades.
          </p>
          <ul className="space-y-2 text-sm sm:text-base text-gray-700 list-disc list-inside">
            <li>La plataforma <strong>no garantiza cupos</strong>, admisiones, becas ni subsidios en ninguna institución académica pública o privada de Colombia.</li>
            <li>YorVoca no tramita inscripciones ni recauda dinero para derechos pecuniarios o pines de admisión.</li>
            <li>Todo trámite de postulación e inscripción debe ser realizado directamente por el estudiante en los portales autorizados de cada institución de educación superior.</li>
          </ul>
        </section>

        {/* 3. Uso aceptable */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
              3
            </span>
            Uso Aceptable y Responsabilidad del Usuario
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            El usuario se compromete a hacer un uso lícito, respetuoso y diligente de la plataforma. Queda expresamente prohibido:
          </p>
          <ul className="space-y-2 text-sm sm:text-base text-gray-700 list-disc list-inside">
            <li>Vulnerar o intentar eludir la seguridad informática, medidas técnicas de protección o el código fuente de la PWA.</li>
            <li>Utilizar robots, spiders, scripts automatizados o técnicas de scraping masivo que sobrecarguen o perturben el funcionamiento de la aplicación.</li>
            <li>Modificar, redistribuir o vender el código, contenidos, bases de ponderación o algoritmos de la plataforma sin autorización previa y por escrito de Yordev.</li>
            <li>Presentar los resultados orientativos como dictámenes médicos o certificaciones oficiales ante juzgados, entidades estatales o instituciones educativas.</li>
          </ul>
        </section>

        {/* 4. Propiedad Intelectual */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
              4
            </span>
            Propiedad Intelectual y Derechos de Autor
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            Todos los componentes que integran YorVoca —incluyendo, sin limitarse a, la arquitectura de software, algoritmos deterministas de cálculo vocacional, diseño visual, logotipos, textos explicativos, interfaces de usuario y bases de datos curadas— son propiedad exclusiva de <strong>Yordev</strong> o se emplean bajo licencias de código abierto legítimas.
          </p>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            Los nombres, acrónimos, marcas y logotipos de las instituciones de educación superior mencionadas en el catálogo pertenecen a sus respectivos titulares y se citan únicamente con propósitos informativos y de referencia académica, al amparo del derecho de cita y referencia legal vigente en Colombia (Decisión Andina 351 de 1993 y Ley 23 de 1982).
          </p>
        </section>

        {/* 5. Limitación de responsabilidad */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
              5
            </span>
            Limitación de Responsabilidad
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            YorVoca y su autor no serán responsables por decisiones académicas, profesionales, laborales o económicas que el usuario tome con base en los resultados o sugerencias emitidas por la plataforma.
          </p>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            Asimismo, aunque se procura mantener actualizada la información académica, YorVoca no se responsabiliza por modificaciones intempestivas en los planes de estudio, cierre de programas, cambios tarifarios o traslados de sede ejecutados por las universidades e instituciones públicas o privadas.
          </p>
        </section>

        {/* 6. Ley aplicable y jurisdicción */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
              6
            </span>
            Ley Aplicable y Resolución de Controversias
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            Los presentes Términos y Condiciones se rigen e interpretan de conformidad con las leyes de la <strong>República de Colombia</strong>. Cualquier inquietud, queja o discrepancia relacionada con la interpretación o aplicación de estos términos se resolverá prioritariamente mediante comunicación directa y concertación amistosa a través del canal de contacto institucional:
          </p>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm text-gray-800">
            <strong>Canal de contacto:</strong> <a href="mailto:yorle170203@gmail.com" className="text-blue-600 font-semibold hover:underline">yorle170203@gmail.com</a> (Atención Yordev).
          </div>
        </section>
      </div>

      {/* Navegación a otras políticas */}
      <nav aria-label="Otras políticas legales" className="p-6 bg-white rounded-2xl border border-gray-200 space-y-3">
        <h3 className="text-sm font-bold text-gray-900">Documentos legales complementarios</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
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
            <div className="text-xs text-gray-500">Alcance de la orientación</div>
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
