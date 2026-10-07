/**
 * @project YorVoca - Orientación Vocacional y Exploración Académica en Colombia
 * @author Yordev
 * @description Configuración de rutas principales de la aplicación.
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Landing } from './pages/Landing';
import { OnboardingFlow } from './features/onboarding/OnboardingFlow';
import { AssessmentFlow } from './features/assessment/AssessmentFlow';
import { ResultsPage } from './features/results/ResultsPage';
import { CareerDetailPage } from './features/careers/CareerDetailPage';
import { AcademicPage } from './pages/AcademicPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Landing />} />
          <Route path="onboarding" element={<OnboardingFlow />} />
          <Route path="test" element={<AssessmentFlow />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="careers/:careerId" element={<CareerDetailPage />} />
          <Route path="academic" element={<AcademicPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
