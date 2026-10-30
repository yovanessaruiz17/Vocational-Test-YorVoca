/**
 * @project YorVoca - Orientación Vocacional y Exploración Académica en Colombia
 * @author Yordev
 * @description Layout principal de la aplicación con barra de navegación responsive y pie de página legal completo.
 */
import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { PWAInstallButton } from '../PWAInstallButton';
import {
  BookOpen,
  Building2,
  Compass,
  Home,
  Info,
  Menu,
  Scale,
  ShieldCheck,
  X,
} from 'lucide-react';

export const MainLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Cerrar menú móvil al navegar a otra ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Bloquear scroll de fondo cuando el menú móvil está abierto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Cerrar automáticamente si la pantalla se redimensiona a tamaño desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  const navLinks = [
    { to: '/', label: 'Inicio', icon: Home, end: true },
    { to: '/onboarding', label: 'Contexto', icon: Info, end: false },
    { to: '/test', label: 'Test vocacional', icon: Compass, end: false },
    { to: '/results', label: 'Resultados', icon: BookOpen, end: false },
    { to: '/academic', label: 'Dónde estudiar', icon: Building2, end: false },
  ];

  const legalLinks = [
    { to: '/terminos', label: 'Términos y Condiciones' },
    { to: '/privacidad', label: 'Política de Privacidad (Ley 1581)' },
    { to: '/aviso-legal', label: 'Aviso Legal y Descargo' },
    { to: '/cookies', label: 'Cookies y Almacenamiento' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans antialiased text-gray-900 w-full overflow-x-hidden">
      {/* Encabezado fijo accesible y responsive */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 w-full">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo Brand */}
          <Link
            to="/"
            className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-2 shrink-0 select-none"
          >
            <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-black shadow-xs shrink-0">
              Y
            </span>
            <span className="font-extrabold tracking-tight">YorVoca</span>
          </Link>

          {/* Navegación Desktop: visible únicamente a partir de lg (1024px) donde hay suficiente espacio */}
          <nav
            aria-label="Navegación principal desktop"
            className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium text-gray-600"
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-blue-600 font-semibold bg-blue-50'
                      : 'hover:text-gray-900 hover:bg-gray-100/70'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Acciones del header: Botón PWA y Botón Menú Móvil */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <PWAInstallButton variant="header" />

            {/* Botón hamburguesa accesible para móvil y tablet (< 1024px) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
              aria-expanded={isMobileMenuOpen}
              className="lg:hidden min-h-[44px] min-w-[44px] p-2.5 rounded-xl text-gray-700 hover:bg-gray-100 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-900" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6 text-gray-800" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Menú Móvil / Tablet desplegable anclado justo debajo del header */}
      {isMobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-40 lg:hidden flex flex-col">
          {/* Fondo oscuro con clic para cerrar */}
          <div
            className="fixed inset-0 top-16 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Panel de navegación móvil deslizable hacia abajo */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación móvil"
            className="relative z-10 w-full bg-white border-b border-gray-200 shadow-2xl flex flex-col max-h-[calc(100vh-4rem)] overflow-y-auto divide-y divide-gray-100"
          >
            {/* Lista de enlaces principales */}
            <nav
              aria-label="Navegación móvil"
              className="p-3 sm:p-4 space-y-1"
            >
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 pb-1">
                Exploración
              </div>
              {navLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `min-h-[48px] px-3.5 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <IconComponent className="w-5 h-5 shrink-0 text-blue-600" aria-hidden="true" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Acceso directo a la instalación de la App dentro del menú */}
            <div className="p-3 sm:p-4 bg-gray-50/70">
              <PWAInstallButton
                variant="drawer"
                onInstallSuccess={() => setIsMobileMenuOpen(false)}
              />
            </div>

            {/* Enlaces de políticas y marco legal */}
            <div className="p-3 sm:p-4 bg-gray-50 space-y-2">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                Políticas y Marco Legal
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {legalLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 text-xs font-medium text-gray-600 hover:text-blue-600 hover:underline rounded-lg"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="pt-2 px-3 text-[11px] text-gray-400 border-t border-gray-200/60">
                © {new Date().getFullYear()} YorVoca · Desarrollado por Yordev
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal de la página */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* Footer completo y legalmente blindado */}
      <footer className="bg-white border-t border-gray-200 mt-12 w-full">
        <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8">
          {/* Grilla de 4 columnas en desktop / 2 en tablet / 1 en móvil */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
            {/* Columna 1: Brand & Misión */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  Y
                </span>
                <span className="font-bold text-base text-gray-900">YorVoca</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Plataforma de orientación vocacional y exploración de oferta académica en Colombia.
              </p>
              <div className="text-xs text-gray-500 pt-1">
                Autoría y desarrollo por <span className="font-semibold text-gray-800">Yordev</span>
              </div>
            </div>

            {/* Columna 2: Navegación del estudiante */}
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 text-xs sm:text-sm uppercase tracking-wider">
                Exploración
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                <li>
                  <Link to="/" className="hover:text-blue-600 transition-colors">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link to="/onboarding" className="hover:text-blue-600 transition-colors">
                    Contexto y preferencias
                  </Link>
                </li>
                <li>
                  <Link to="/test" className="hover:text-blue-600 transition-colors">
                    Test vocacional (48 preguntas)
                  </Link>
                </li>
                <li>
                  <Link to="/results" className="hover:text-blue-600 transition-colors">
                    Mis resultados y Top 5
                  </Link>
                </li>
                <li>
                  <Link to="/academic" className="hover:text-blue-600 transition-colors">
                    Dónde estudiar (SNIES)
                  </Link>
                </li>
              </ul>
            </div>

            {/* Columna 3: Marco Legal y Políticas */}
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                Políticas y Legalidad
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                <li>
                  <Link to="/terminos" className="hover:text-blue-600 transition-colors">
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link to="/privacidad" className="hover:text-blue-600 transition-colors">
                    Política de Privacidad (Ley 1581)
                  </Link>
                </li>
                <li>
                  <Link to="/aviso-legal" className="hover:text-blue-600 transition-colors">
                    Aviso Legal y Descargo Vocacional
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="hover:text-blue-600 transition-colors">
                    Cookies y Almacenamiento Local
                  </Link>
                </li>
              </ul>
            </div>

            {/* Columna 4: Garantías y Transparencia */}
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                Transparencia
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Datos académicos basados en registros públicos del <strong>SNIES / MEN</strong>. La plataforma almacena tus respuestas de forma 100% local en tu navegador.
              </p>
              <div className="text-xs text-gray-500">
                Contacto institucional:{' '}
                <a
                  href="mailto:yorle170203@gmail.com"
                  className="text-blue-600 hover:underline"
                >
                  yorle170203@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Barra inferior de copyright y descargo */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 text-center sm:text-left">
            <div>
              © {new Date().getFullYear()} YorVoca · Desarrollado por Yordev. Todos los derechos reservados.
            </div>
            <div className="text-xs text-gray-400">
              Iniciativa pedagógica independiente sin vinculación comercial con instituciones educativas.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
