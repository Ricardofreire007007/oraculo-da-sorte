// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import Landing from './pages/Landing.jsx';
import PagamentoSucesso from './pages/PagamentoSucesso.jsx';
import Privacidade from './pages/Privacidade.jsx';
import Termos from './pages/Termos.jsx';
import { AuthProvider } from './AuthContext.jsx';
import { initRevenueCat, getOfferings } from './revenuecat.js';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

initRevenueCat().then(async () => {
  await getOfferings();

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/app" element={<App />} />
            <Route path="/pagamento-sucesso" element={<PagamentoSucesso />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="/termos" element={<Termos />} />
          </Routes>
          <Analytics />
          <SpeedInsights />
        </BrowserRouter>
      </AuthProvider>
    </StrictMode>
  );
});