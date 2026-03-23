// src/App.jsx — Página do app (após login / plano ativo)
import { useState, useEffect } from 'react';
import { checkProAccess } from './revenuecat.js';

function App() {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verificar = async () => {
      try {
        const pro = await checkProAccess();
        setIsPro(pro);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    verificar();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#0a0612',
        color: '#c9a84c',
        fontFamily: "'Cinzel', serif",
        fontSize: '18px'
      }}>
        ✦ Consultando os astros...
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0a0612', 
      color: '#f0e6d3',
      fontFamily: "'EB Garamond', serif",
      padding: '60px 32px', 
      textAlign: 'center' 
    }}>
      <h1 style={{ 
        fontFamily: "'Cinzel Decorative', serif", 
        fontSize: '2rem', 
        marginBottom: '24px',
        background: 'linear-gradient(135deg, #e8c97a, #c9a84c, #d4813a)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        ✦ Oráculo da Sorte
      </h1>

      {isPro ? (
        <div>
          <p style={{ fontSize: '24px', color: '#3d8c6e', marginBottom: '16px' }}>
            🎉 Você tem o plano Pro ativo!
          </p>
          <p style={{ color: '#a89880' }}>
            Em breve: sua consulta mística personalizada aparecerá aqui.
          </p>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: '20px', color: '#a89880', marginBottom: '24px' }}>
            Você está no plano Livre.
          </p>
          <a 
            href="/pricing" 
            style={{
              display: 'inline-block',
              padding: '14px 36px',
              background: 'linear-gradient(135deg, #c9a84c, #8a7230)',
              color: '#06060e',
              borderRadius: '10px',
              fontWeight: '600',
              textDecoration: 'none',
              fontSize: '16px',
            }}
          >
            ✦ Desbloquear Poderes Místicos
          </a>
        </div>
      )}
    </div>
  );
}

export default App;