import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles/theme.css';
import './styles/index.css';
import './styles/tailwind.css';
import { registerSW } from 'virtual:pwa-register';
import { ConfirmProvider } from './app/contexts/ConfirmContext';

// Register the PWA service worker
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfirmProvider>
      <App />
    </ConfirmProvider>
  </StrictMode>
);
