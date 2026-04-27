import { useState } from 'react';
import { motion } from 'motion/react';

interface Props {
  onComplete: () => void;
}

interface Permission {
  id: string;
  icon: string;
  label: string;
  description: string;
  required: boolean;
  granted: boolean;
}

export default function PermissionsScreen({ onComplete }: Props) {
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: 'microphone',
      icon: '🎙️',
      label: 'Microphone',
      description: 'Required for YAMNet audio threat detection',
      required: true,
      granted: false,
    },
    {
      id: 'location',
      icon: '📍',
      label: 'Location',
      description: 'Sent with emergency alerts to responders',
      required: true,
      granted: false,
    },
  ]);

  const requestPermission = async (id: string) => {
    if (id === 'microphone') {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        grant(id);
      } catch {
        alert('Microphone access denied. Please allow it in browser settings.');
      }
    } else if (id === 'location') {
      navigator.geolocation.getCurrentPosition(
        () => grant(id),
        () => alert('Location access denied. Please allow it in browser settings.'),
      );
    }
  };

  const grant = (id: string) =>
    setPermissions(prev => prev.map(p => (p.id === id ? { ...p, granted: true } : p)));

  const allGranted = permissions.every(p => p.granted);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--color-void)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 420 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--color-pulse)', letterSpacing: '0.2em',
            textTransform: 'uppercase', marginBottom: 12,
          }}>
            Step 1 of 3
          </div>
          <h2 style={{
            fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em',
            color: 'var(--color-text-primary)', marginBottom: 10,
          }}>
            System Permissions
          </h2>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Grant access so the AI can monitor threats in real time.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          {permissions.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 + 0.2 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '16px 20px',
                background: p.granted ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${p.granted ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 16,
                transition: 'all 0.3s ease',
              }}
            >
              <span style={{ fontSize: 24 }}>{p.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 14, fontWeight: 600,
                  color: p.granted ? 'var(--color-safe)' : 'var(--color-text-primary)',
                  marginBottom: 2,
                }}>
                  {p.label}
                  {p.required && (
                    <span style={{
                      fontSize: 10, marginLeft: 8, fontFamily: 'var(--font-mono)',
                      color: 'var(--color-text-muted)', letterSpacing: '0.1em',
                    }}>
                      REQUIRED
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  {p.description}
                </div>
              </div>
              {p.granted ? (
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(16,185,129,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7l3.5 3.5 5.5-7" stroke="var(--color-safe)"
                      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              ) : (
                <button
                  onClick={() => requestPermission(p.id)}
                  style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: 'rgba(37,99,235,0.15)',
                    border: '1px solid rgba(37,99,235,0.35)',
                    color: 'rgba(147,197,253,1)', cursor: 'pointer',
                    flexShrink: 0, transition: 'all 0.2s',
                  }}
                >
                  Allow
                </button>
              )}
            </motion.div>
          ))}
        </div>

        <motion.button
          onClick={onComplete}
          disabled={!allGranted}
          whileHover={allGranted ? { scale: 1.02 } : {}}
          whileTap={allGranted ? { scale: 0.98 } : {}}
          style={{
            width: '100%', padding: '15px 24px',
            borderRadius: 14, fontSize: 14, fontWeight: 700,
            letterSpacing: '0.04em',
            background: allGranted
              ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
              : 'rgba(255,255,255,0.05)',
            border: 'none',
            color: allGranted ? '#fff' : 'var(--color-text-muted)',
            cursor: allGranted ? 'pointer' : 'not-allowed',
            boxShadow: allGranted ? '0 0 40px -8px rgba(37,99,235,0.5)' : 'none',
            transition: 'all 0.3s ease',
          }}
        >
          {allGranted ? 'Continue →' : 'Grant all permissions to continue'}
        </motion.button>

        {/* Skip for dev */}
        <button
          onClick={onComplete}
          style={{
            display: 'block', margin: '16px auto 0', background: 'none',
            border: 'none', fontSize: 12, color: 'var(--color-text-muted)',
            cursor: 'pointer', fontFamily: 'var(--font-mono)',
          }}
        >
          skip (dev mode)
        </button>
      </motion.div>
    </div>
  );
}
