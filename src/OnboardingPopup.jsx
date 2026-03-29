// src/OnboardingPopup.jsx — Cadastro com geolocalização automática
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const COLORS = {
  bg: "#0a0612", gold: "#c9a84c", goldLight: "#e8c97a", amber: "#d4813a",
  text: "#f0e6d3", textMuted: "#a89880",
};

export default function OnboardingPopup({ userId, onComplete }) {
  var [fullName, setFullName] = useState('');
  var [birthDate, setBirthDate] = useState('');
  var [birthCity, setBirthCity] = useState('');
  var [location, setLocation] = useState(null);
  var [locStatus, setLocStatus] = useState('idle'); // idle | loading | success | error
  var [saving, setSaving] = useState(false);

  // Auto-detectar localização
  useEffect(function() {
    if (!navigator.geolocation) {
      setLocStatus('error');
      return;
    }

    setLocStatus('loading');

    navigator.geolocation.getCurrentPosition(
      function(position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        var timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Reverse geocoding com API gratuita (sem API key)
        fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' + lat + '&longitude=' + lng + '&localityLanguage=pt')
          .then(function(res) { return res.json(); })
          .then(function(data) {
            var city = data.city || data.locality || data.principalSubdivision || '';
            var state = data.principalSubdivision || '';
            var country = data.countryName || '';

            setLocation({
              city: city,
              state: state,
              country: country,
              latitude: lat,
              longitude: lng,
              timezone: timezone,
            });
            setBirthCity(city + (state ? ', ' + state : ''));
            setLocStatus('success');
          })
          .catch(function() {
            // Se a API falhar, pelo menos salvar coordenadas
            setLocation({ latitude: lat, longitude: lng, timezone: timezone, city: '', state: '', country: '' });
            setLocStatus('error');
          });
      },
      function() {
        setLocStatus('error');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  var handleSubmit = async function() {
    if (!fullName.trim() || !birthDate) return;

    setSaving(true);
    try {
      // Buscar email do usuário
      var { data: userData } = await supabase.auth.getUser();
      var email = userData?.user?.email || '';

      var profileData = {
        id: userId,
        full_name: fullName.trim(),
        birth_date: birthDate,
        birth_city: birthCity.trim(),
        email: email,
        plano: 'free',
        updated_at: new Date().toISOString(),
      };

      // Adicionar dados de localização se disponíveis
      if (location) {
        profileData.latitude = location.latitude;
        profileData.longitude = location.longitude;
        profileData.timezone = location.timezone;
      }

      var { error } = await supabase.from('profiles').upsert(profileData);

      if (error) {
        console.error('Erro ao salvar perfil:', error);
        alert('Erro ao salvar. Tente novamente.');
      } else {
        onComplete({
          fullName: fullName.trim(),
          birthDate: birthDate,
          birthCity: birthCity.trim(),
          location: location,
        });
      }
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro ao salvar. Tente novamente.');
    }
    setSaving(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #0e0a1a, #150f28)',
        border: '1px solid rgba(201,168,76,0.3)',
        borderRadius: 20, padding: '40px 32px',
        maxWidth: 440, width: '100%',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔮</div>
          <h2 style={{
            fontFamily: "'Cinzel Decorative', serif", fontSize: '1.4rem',
            background: 'linear-gradient(135deg, #e8c97a, #c9a84c, #d4813a)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 8,
          }}>Bem-vindo ao Oráculo</h2>
          <p style={{ color: COLORS.textMuted, fontSize: 15, fontStyle: 'italic' }}>
            Precisamos de alguns dados para personalizar seus rituais
          </p>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Nome */}
          <div>
            <label style={{
              display: 'block', fontFamily: "'Cinzel', serif",
              fontSize: 12, color: COLORS.gold, letterSpacing: '0.1em',
              textTransform: 'uppercase', marginBottom: 8,
            }}>Seu nome completo</label>
            <input
              type="text"
              value={fullName}
              onChange={function(e) { setFullName(e.target.value); }}
              placeholder="Como deseja ser chamado"
              style={{
                width: '100%', padding: '14px 18px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(201,168,76,0.3)',
                borderRadius: 10, color: COLORS.text,
                fontFamily: "'EB Garamond', serif", fontSize: 16,
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Data de nascimento */}
          <div>
            <label style={{
              display: 'block', fontFamily: "'Cinzel', serif",
              fontSize: 12, color: COLORS.gold, letterSpacing: '0.1em',
              textTransform: 'uppercase', marginBottom: 8,
            }}>Data de nascimento</label>
            <input
              type="date"
              value={birthDate}
              onChange={function(e) { setBirthDate(e.target.value); }}
              style={{
                width: '100%', padding: '14px 18px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(201,168,76,0.3)',
                borderRadius: 10, color: COLORS.text,
                fontFamily: "'EB Garamond', serif", fontSize: 16,
                outline: 'none', boxSizing: 'border-box',
                colorScheme: 'dark',
              }}
            />
          </div>

          {/* Localização */}
          <div>
            <label style={{
              display: 'block', fontFamily: "'Cinzel', serif",
              fontSize: 12, color: COLORS.gold, letterSpacing: '0.1em',
              textTransform: 'uppercase', marginBottom: 8,
            }}>Sua localização</label>

            {locStatus === 'loading' && (
              <div style={{
                padding: '14px 18px', background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(201,168,76,0.2)', borderRadius: 10,
                color: COLORS.textMuted, fontSize: 14, fontStyle: 'italic',
              }}>
                📍 Detectando sua localização...
              </div>
            )}

            {locStatus === 'success' && (
              <div style={{
                padding: '14px 18px', background: 'rgba(61,140,110,0.08)',
                border: '1px solid rgba(61,140,110,0.3)', borderRadius: 10,
                color: COLORS.text, fontSize: 15,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span>📍</span>
                <span>{birthCity}</span>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: '#3d8c6e' }}>✓</span>
              </div>
            )}

            {(locStatus === 'error' || locStatus === 'idle') && (
              <input
                type="text"
                value={birthCity}
                onChange={function(e) { setBirthCity(e.target.value); }}
                placeholder="Ex: São Paulo, SP"
                style={{
                  width: '100%', padding: '14px 18px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  borderRadius: 10, color: COLORS.text,
                  fontFamily: "'EB Garamond', serif", fontSize: 16,
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            )}

            {locStatus === 'error' && (
              <p style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 6, fontStyle: 'italic' }}>
                Não foi possível detectar automaticamente. Digite sua cidade.
              </p>
            )}
          </div>

          {/* Nota sobre uso */}
          <p style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.6, fontStyle: 'italic' }}>
            🔒 Seus dados são usados exclusivamente para cálculos místicos (numerologia, posição planetária, fuso horário). Nunca compartilhamos seus dados.
          </p>

          {/* Botão */}
          <button
            onClick={handleSubmit}
            disabled={!fullName.trim() || !birthDate || saving}
            style={{
              padding: '16px',
              background: (!fullName.trim() || !birthDate || saving)
                ? 'rgba(201,168,76,0.2)'
                : 'linear-gradient(135deg, #c9a84c, #8a7230)',
              color: (!fullName.trim() || !birthDate || saving) ? COLORS.textMuted : '#06060e',
              border: 'none', borderRadius: 12,
              fontSize: 16, fontWeight: 700,
              fontFamily: "'Cinzel', serif",
              cursor: (!fullName.trim() || !birthDate || saving) ? 'not-allowed' : 'pointer',
              letterSpacing: '0.05em',
              transition: 'all 0.2s ease',
            }}
          >
            {saving ? '✦ Salvando...' : '✦ Entrar no Oráculo'}
          </button>
        </div>
      </div>
    </div>
  );
}
