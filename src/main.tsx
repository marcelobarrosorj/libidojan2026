import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './services/locationTracker'; // RASTREIO-GLOBAL

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// NOCOPY-JS: bloqueia o menu de salvar foto e o arrasto de imagens
document.addEventListener('contextmenu', (e) => {
  const alvo = e.target as HTMLElement;
  if (alvo && alvo.tagName === 'IMG') e.preventDefault();
});
document.addEventListener('dragstart', (e) => {
  const alvo = e.target as HTMLElement;
  if (alvo && alvo.tagName === 'IMG') e.preventDefault();
});
