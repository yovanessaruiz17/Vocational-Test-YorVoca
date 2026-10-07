/**
 * @project YorVoca - Orientación Vocacional y Exploración Académica en Colombia
 * @author Yordev
 * @description Layout principal de la aplicación, barra de navegación y pie de página.
 */
import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { PWAInstallButton } from '../PWAInstallButton';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="text-xl font-bold tracking-tight text-gray-900 hover:text-blue-600 transition-colors whitespace-nowrap"
          >
            YorVoca
          </Link>

          <nav
            aria-label="Navegación principal"
            className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-gray-600"
          >
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `py-1 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-blue-600 font-semibold underline underline-offset-4'
                    : 'hover:text-gray-900 hover:underline underline-offset-4'
                }`
              }
            >
              Inicio
            </NavLink>
            <NavLink
              to="/onboarding"
              className={({ isActive }) =>
                `py-1 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-blue-600 font-semibold underline underline-offset-4'
                    : 'hover:text-gray-900 hover:underline underline-offset-4'
                }`
              }
            >
              Contexto
            </NavLink>
            <NavLink
              to="/test"
              className={({ isActive }) =>
                `py-1 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-blue-600 font-semibold underline underline-offset-4'
                    : 'hover:text-gray-900 hover:underline underline-offset-4'
                }`
              }
            >
              Test vocacional
            </NavLink>
            <NavLink
              to="/results"
              className={({ isActive }) =>
                `py-1 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-blue-600 font-semibold underline underline-offset-4'
                    : 'hover:text-gray-900 hover:underline underline-offset-4'
                }`
              }
            >
              Resultados
            </NavLink>
            <NavLink
              to="/academic"
              className={({ isActive }) =>
                `py-1 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-blue-600 font-semibold underline underline-offset-4'
                    : 'hover:text-gray-900 hover:underline underline-offset-4'
                }`
              }
            >
              Dónde estudiar
            </NavLink>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <PWAInstallButton />
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6 lg:p-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-sm text-gray-500">
          <p>© {new Date().getFullYear()} YorVoca. Exploración académica en Colombia.</p>
          <p className="text-xs sm:text-sm text-gray-500">
            Autoría y desarrollo por <span className="font-semibold text-gray-800">Yordev</span>
          </p>
        </div>
      </footer>
    </div>
  );
};
