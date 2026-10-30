/**
 * @project YorVoca - Orientación Vocacional y Exploración Académica en Colombia
 * @author Yordev
 * @description Política de Privacidad y Tratamiento de Datos Personales (Ley 1581 de 2012 / Habeas Data).
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Database, Lock, ShieldCheck, Trash2, UserCheck } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const handleClearLocalStorage = () => {
    if (window.confirm('¿Deseas restablecer y borrar todos tus resultados y datos vocacionales guardados en este navegador?')) {
      localStorage.removeItem('yorvoca_student_context');
      localStorage.removeItem('yorvoca_assessment_result');
      alert('Tus datos vocacionales han sido completamente eliminados de este dispositivo.');
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
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
          <ShieldCheck className="w-4 h-4" aria-hidden="true" />
          <span>Protección de Datos Personales · Régimen Colombiano de Habeas Data</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
          Política de Privacidad y Tratamiento de Datos
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          En estricto cumplimiento de la Ley Estatutaria 1581 de 2012 y el Decreto Reglamentario 1377 de 2013 de Colombia
        </p>
        <p className="text-sm sm:text-base text-gray-700 leading-relaxed pt-2">
          En <strong>YorVoca</strong> protegemos y respetamos la privacidad de los estudiantes y usuarios.
          Nuestra arquitectura tecnológica implementa el principio de <strong>Privacidad por Diseño (Privacy by Design)</strong>:
          tus respuestas vocacionales y preferencias se procesan y almacenan directamente en tu propio dispositivo, sin que exista una base de datos centralizada de perfiles personales.
        </p>
      </header>

      {/* Secciones de Privacidad */}
      <div className="space-y-6">
        {/* 1. Responsable del Tratamiento */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
              1
            </span>
            Identificación del Responsable del Tratamiento
          </h2>
          <div className="text-sm sm:text-base text-gray-700 space-y-2 leading-relaxed">
            <p>
              El responsable del desarrollo, mantenimiento y soporte técnico de la plataforma YorVoca es <strong>Yordev</strong>.
            </p>
            <ul className="space-y-1.5 text-sm text-gray-700 list-disc list-inside">
              <li><strong>Plataforma:</strong> YorVoca — PWA de Orientación Vocacional en Colombia</li>
              <li><strong>Jurisdicción:</strong> República de Colombia</li>
              <li><strong>Correo para consultas de Habeas Data:</strong> <a href="mailto:yorle170203@gmail.com" className="text-blue-600 font-semibold hover:underline">yorle170203@gmail.com</a></li>
            </ul>
          </div>
        </section>

        {/* 2. Principio de Almacenamiento Local */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
              2
            </span>
            Principio Rector: Almacenamiento Local (Local Storage First)
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            A diferencia de otras plataformas web, YorVoca <strong>no exige la creación de cuentas con contraseña, ni recopila nombres de usuario, ni almacena tus respuestas en servidores externos</strong>:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-gray-800">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5">
              <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-blue-600" />
                Almacenamiento en tu navegador
              </div>
              <p className="text-gray-600">
                Las respuestas del test de 48 preguntas y las preferencias geográficas (ciudad objetivo y modalidad) se guardan en el <code>localStorage</code> de tu propio navegador.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5">
              <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-600" />
                Cálculo en el cliente
              </div>
              <p className="text-gray-600">
                Los algoritmos de puntuación de dimensiones, cálculo de familias y ordenamiento del Top 5 de carreras se ejecutan localmente en tu dispositivo mediante TypeScript.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Datos recopilados y No recopilados */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
              3
            </span>
            Datos Tratados y Datos Excluidos Expresamente
          </h2>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs sm:text-sm text-emerald-950 space-y-1.5">
              <div className="font-bold flex items-center gap-2 text-emerald-900">
                <Check className="w-4 h-4" />
                Lo que YorVoca procesa (estrictamente anónimo y funcional):
              </div>
              <ul className="list-disc list-inside space-y-1">
                <li>Selección en la escala Likert (1 al 5) para las 48 preguntas de autopercepción vocacional.</li>
                <li>Ubicación geográfica aproximada autodeclarada (departamento y municipio de interés) para contextualizar el explorador de universidades.</li>
                <li>Preferencia de modalidad (presencial, virtual, a distancia) y sector (público o privado).</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-100 text-xs sm:text-sm text-rose-950 space-y-1.5">
              <div className="font-bold flex items-center gap-2 text-rose-900">
                <ShieldCheck className="w-4 h-4" />
                Lo que YorVoca NUNCA solicita ni almacena:
              </div>
              <ul className="list-disc list-inside space-y-1">
                <li>Nombres y apellidos completos.</li>
                <li>Número de documento de identidad (C.C., T.I., pasaporte).</li>
                <li>Dirección de domicilio residencial o números telefónicos.</li>
                <li>Información financiera, ingresos familiares o cuentas bancarias.</li>
                <li>Datos sensibles protegidos por el Artículo 5 de la Ley 1581 (origen racial, orientación política, convicciones religiosas o filosóficas, pertenencia a sindicatos, datos biométricos).</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. Protección especial a menores de edad */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
              4
            </span>
            Tratamiento Especial de Datos de Menores de Edad (Artículo 7, Ley 1581)
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            Dado que un segmento importante de los usuarios de YorVoca son estudiantes de bachillerato (grados 9°, 10° y 11°), la plataforma adopta las máximas garantías de protección:
          </p>
          <ul className="space-y-2 text-sm sm:text-base text-gray-700 list-disc list-inside">
            <li>Se respeta el interés superior de los niños, niñas y adolescentes colombianos.</li>
            <li>No se generan perfiles comerciales ni publicitarios dirigidos a menores de edad.</li>
            <li>No se requiere registro formal que obligue al menor a proporcionar datos de contacto personales.</li>
            <li>Se invita a que los estudiantes menores de edad exploren sus afinidades vocacionales con el acompañamiento de sus padres, acudientes o docentes orientadores.</li>
          </ul>
        </section>

        {/* 5. Cero venta o transferencia a terceros */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
              5
            </span>
            No Transferencia, No Venta y No Cesión de Datos
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            <strong>YorVoca no vende, no comercializa, no alquila ni transfiere tus respuestas ni tus resultados vocacionales a ninguna universidad, corporación, call center ni red de publicidad.</strong>
          </p>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            Cuando utilizas la opción de «Personalizar lectura con Gemini», el sistema transmite únicamente un payload matemático anónimo (IDs de carreras y puntajes agregados sin ningún identificador de usuario) mediante proxy seguro de servidor, garantizando que ninguna información personal sea compartida.
          </p>
        </section>

        {/* 6. Derechos del titular (Habeas Data) y borrado de datos */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0">
              6
            </span>
            Tus Derechos de Habeas Data y Control Total de tus Datos
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            Conforme a la Ley 1581 de 2012, tienes derecho a conocer, actualizar, rectificar y suprimir tus datos en cualquier momento. Al residir tus datos en tu navegador, tienes <strong>control directo y soberano</strong>:
          </p>
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Eliminación inmediata de datos locales</h3>
                <p className="text-xs text-gray-600">
                  Haz clic aquí para purgar todas las respuestas del test y resultados guardados en este dispositivo.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearLocalStorage}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                Borrar mis datos ahora
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 pt-1">
            Para cualquier solicitud formal relacionada con el régimen de protección de datos, puedes escribir directamente a <a href="mailto:yorle170203@gmail.com" className="text-blue-600 underline">yorle170203@gmail.com</a>.
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
            <div className="text-xs text-gray-500">Condiciones de uso y propiedad</div>
          </Link>
          <Link
            to="/aviso-legal"
            className="p-3 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition-colors border border-gray-100"
          >
            <div className="font-semibold text-gray-900">Aviso Legal y Descargo</div>
            <div className="text-xs text-gray-500">Alcance orientativo y fuentes SNIES</div>
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
