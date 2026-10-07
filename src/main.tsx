/**
 * @project YorVoca - Orientación Vocacional y Exploración Académica en Colombia
 * @author Yordev
 * @description Punto de entrada cliente de la aplicación React.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
