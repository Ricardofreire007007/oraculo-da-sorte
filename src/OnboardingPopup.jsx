// src/OnboardingPopup.jsx
import { useState } from 'react';
import { saveProfile } from './auth.js';

const COLORS = {
  bg: "#0a0612",
  gold: "#c9a84c",
  goldLight: "#e8c97a",
  amber: "#d4813a",
  text: "#f0e6d3",
  textMuted: "#a89880",
};

export default function OnboardingPopup({ userId, onComplete }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ fullName: '', birthDate: '', birthCity: '' });
  const [saving, setSaving] = useState(false);

  const steps = [
    {
      icon: '✦',
      title: 'Qual é o seu nome completo?',
      subtitle: 'O Oráculo precisa conhecer quem busca respostas.',
      field: 'fullName',
      type: 'text',
      placeholder: 'Seu nome completo',
    },
    {
      icon: '🗓️',
      title: 'Quando você nasceu?',
      subtitle: 'Sua data de nascimento revela seu número de vida.',
      field: 'birthDate',
      type: 'date',
      placeholder: '',
    },
    {
      icon: '📍',
      title: 'Onde você nasceu?',
      subtitle: 'A cidade natal influencia sua energia cósmica.',
      field: 'birthCity',
      type: 'text',
      placeholder: 'Cidade de nascimento',
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const canAdvance = form[current.field]?.trim() !== '';

  const handleNext = async () => {
    if (!canAdvance) return;
    if (isLast) {
      setSaving(true);
      const { error } = await saveProfile(userId, form);
      setSaving(false);
      if (!error) onComplete(form);
    } else {
      setStep(step + 1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleNext();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(6,4,12,0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #110d1e 0%, #160f28 100%)',
        border: '1px solid rgba(201,168,76,0.3)',
        borderRadius: 20,
        padding: '48px 40px',
        maxWidth: 460,
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 80px rgba(0,0,0,0.6), 0 0 40px rgba(201,168,76,0.08)',
      }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i <= step
                ? 'linear-gradient(135deg, #e8c97a, #c9a84c)'
                : 'rgba(201,168,76,0.2)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        {/* Icon */}
        <div style={{ fontSize: 48, marginBottom: 20 }}>{current.icon}</div>

        {/* Title */}
        <h2 style={{
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: '1.4rem',
          background: 'linear-gradient(135deg, #e8c97a, #c9a84c, #d4813a)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 8,
        }}>
          {current.title}
        </h2>

        {/* Subtitle */}
        <p style={{
          color: COLORS.textMuted,
          fontSize: 15,
          marginBottom: 32,
          fontStyle: 'italic',
          fontFamily: "'EB Garamond', serif",
        }}>
          {current.subtitle}
        </p>

        {/* Input */}
        <input
          type={current.type}
          placeholder={current.placeholder}
          value={form[current.field]}
          onChange={(e) => setForm({ ...form, [current.field]: e.target.value })}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            width: '100%',
            padding: '16px 20px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: 12,
            color: COLORS.text,
            fontSize: 17,
            fontFamily: "'EB Garamond', serif",
            outline: 'none',
            textAlign: 'center',
            colorScheme: 'dark',
            marginBottom: 24,
          }}
        />

        {/* Button */}
        <button
          onClick={handleNext}
          disabled={!canAdvance || saving}
          style={{
            width: '100%',
            padding: '16px',
            background: canAdvance
              ? 'linear-gradient(135deg, #c9a84c, #8a7230)'
              : 'rgba(201,168,76,0.15)',
            color: canAdvance ? '#06060e' : COLORS.textMuted,
            border: 'none',
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 700,
            fontFamily: "'Cinzel', serif",
            cursor: canAdvance ? 'pointer' : 'not-allowed',
            letterSpacing: '0.05em',
            transition: 'all 0.3s ease',
          }}
        >
          {saving ? '✦ Salvando...' : isLast ? '✦ Revelar meu destino' : '✦ Continuar'}
        </button>

        {/* Step counter */}
        <p style={{
          color: COLORS.textMuted,
          fontSize: 12,
          marginTop: 16,
          opacity: 0.5,
        }}>
          {step + 1} de {steps.length}
        </p>
      </div>
    </div>
  );
}