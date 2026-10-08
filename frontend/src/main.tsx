import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { SessionProvider } from './utils/session';
import { ToastProvider } from './components/Overlays';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SessionProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </SessionProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
