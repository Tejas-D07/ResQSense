import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppState, UserProfile } from '../../types';

interface Props {
  currentStep: AppState;
  userProfile: UserProfile | null;
  onCancel:    () => void;
  onEscalate:  () => void;
  onRestart:   () => void;
}

function CountdownBar({ seconds, onExpire }: { seconds: number; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
    const t = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { clearInterval(t); onExpire(); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [seconds, onExpire]);

  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginBottom: 6,
        fontFamily: 'var(--font-mono)', fontSize: 11,
        color: 'var(--color-text-secondary)',
      }}>
        <span>Auto-escalating in</span>
        <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>{remaining}s</span>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: seconds, ease: 'linear' }}
          style={{
            height: '100%', background: 'var(--color-danger)', borderRadius: 2,
            boxShadow: '0 0 8px var(--color-danger)',
          }}
        />
      </div>
    </div>
  );
}

export default function AlertScreens({ currentStep, userProfile, onCancel, onEscalate, onRestart }: Props) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px 20px',
        background: 'rgba(3,5,10,0.92)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <AnimatePresence mode="wait">

        {/* ── Pre-danger validation ─────────────────────────────────────────── */}
        {currentStep === AppState.PRE_DANGER_VALIDATION && (
          <motion.div
            key="pre-danger"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: '100%', maxWidth: 380 }}
          >
            <div style={{
              padding: '32px 28px',
              background: 'rgba(245,158,11,0.06)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 24,
              boxShadow: '0 0 80px -20px rgba(245,158,11,0.3)',
            }}>
              {/* Warning icon */}
              <div style={{
                width: 56, height: 56, borderRadius: '50%', margin: '0 auto 20px',
                background: 'rgba(245,158,11,0.12)',
                border: '1px solid rgba(245,158,11,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                    stroke="var(--color-warn)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <h2 style={{
                fontSize: 22, fontWeight: 800, textAlign: 'center',
                color: 'var(--color-warn)', marginBottom: 8, letterSpacing: '-0.01em',
              }}>
                Potential Threat Detected
              </h2>
              <p style={{
                fontSize: 13, color: 'var(--color-text-secondary)',
                textAlign: 'center', lineHeight: 1.6, marginBottom: 28,
              }}>
                YAMNet identified a dangerous sound. Are you in danger?
              </p>

              <div style={{ marginBottom: 24 }}>
                <CountdownBar seconds={10} onExpire={onEscalate} />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={onCancel}
                  style={{
                    flex: 1, padding: '13px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                    background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.25)',
                    color: 'var(--color-safe)', cursor: 'pointer',
                  }}
                >
                  ✓ I'm Safe
                </button>
                <button
                  onClick={onEscalate}
                  style={{
                    flex: 1, padding: '13px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                    background: 'rgba(239,68,68,0.12)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: 'var(--color-danger)', cursor: 'pointer',
                  }}
                >
                  ⚠ In Danger
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Danger detected ───────────────────────────────────────────────── */}
        {currentStep === AppState.DANGER_DETECTED && (
          <motion.div
            key="danger"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', maxWidth: 380 }}
          >
            {/* Flash border */}
            <motion.div
              animate={{ borderColor: ['rgba(239,68,68,0.6)', 'rgba(239,68,68,0.1)', 'rgba(239,68,68,0.6)'] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              style={{
                padding: '32px 28px', borderRadius: 24,
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.3)',
                boxShadow: '0 0 80px -10px rgba(239,68,68,0.4)',
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                style={{
                  width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7L12 2z"
                    fill="rgba(239,68,68,0.2)" stroke="var(--color-danger)"
                    strokeWidth="1.8" strokeLinejoin="round"/>
                  <path d="M12 8v4M12 16h.01" stroke="var(--color-danger)"
                    strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </motion.div>

              <h2 style={{
                fontSize: 24, fontWeight: 800, textAlign: 'center',
                color: 'var(--color-danger)', marginBottom: 8, letterSpacing: '-0.01em',
              }}>
                DANGER CONFIRMED
              </h2>
              <p style={{
                fontSize: 13, color: 'var(--color-text-secondary)',
                textAlign: 'center', lineHeight: 1.6, marginBottom: 28,
              }}>
                Activating emergency protocol. Emergency contacts will be notified.
              </p>

              <div style={{ marginBottom: 24 }}>
                <CountdownBar seconds={5} onExpire={onEscalate} />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={onCancel}
                  style={{
                    flex: 1, padding: '13px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--color-text-secondary)', cursor: 'pointer',
                  }}
                >
                  False Alarm
                </button>
                <button
                  onClick={onEscalate}
                  style={{
                    flex: 2, padding: '13px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                    border: 'none', color: '#fff', cursor: 'pointer',
                    boxShadow: '0 0 30px -6px rgba(239,68,68,0.6)',
                  }}
                >
                  🚨 SEND EMERGENCY ALERT
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── Emergency activated ───────────────────────────────────────────── */}
        {currentStep === AppState.EMERGENCY_ACTIVATED && (
          <motion.div
            key="emergency"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{ width: '100%', maxWidth: 380 }}
          >
            <div style={{
              padding: '32px 28px', borderRadius: 24,
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.25)',
              boxShadow: '0 0 100px -20px rgba(239,68,68,0.35)',
            }}>
              {/* Spinning ring */}
              <div style={{ width: 64, height: 64, margin: '0 auto 20px', position: 'relative' }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    border: '2px solid transparent',
                    borderTopColor: 'var(--color-danger)',
                    borderRightColor: 'rgba(239,68,68,0.3)',
                  }}
                />
                <div style={{
                  position: 'absolute', inset: 6, borderRadius: '50%',
                  background: 'rgba(239,68,68,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 20 }}>🚨</span>
                </div>
              </div>

              <h2 style={{
                fontSize: 22, fontWeight: 800, textAlign: 'center',
                color: '#fff', marginBottom: 8,
              }}>
                Emergency Activated
              </h2>
              <p style={{
                fontSize: 13, color: 'var(--color-text-secondary)',
                textAlign: 'center', lineHeight: 1.6, marginBottom: 20,
              }}>
                AI is contacting emergency services and notifying
                {userProfile?.emergencyContacts?.length
                  ? ` ${userProfile.emergencyContacts
                      .map(contact => contact.split('—')[0].trim())
                      .filter(Boolean)
                      .join(', ')}.`
                  : ' your emergency contacts.'}
              </p>

              {/* Status checklist */}
              {[
                { label: 'Location transmitted', done: true },
                { label: 'Emergency contact notified', done: true },
                { label: 'Emergency services alerted', done: false },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.3 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    background: item.done ? 'rgba(16,185,129,0.15)' : 'rgba(37,99,235,0.12)',
                    border: `1px solid ${item.done ? 'rgba(16,185,129,0.3)' : 'rgba(37,99,235,0.3)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {item.done ? (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5l2.5 2.5 4.5-5" stroke="var(--color-safe)"
                          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <motion.div
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-pulse)' }}
                      />
                    )}
                  </div>
                  <span style={{
                    fontSize: 13,
                    color: item.done ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  }}>
                    {item.label}
                  </span>
                </motion.div>
              ))}

              <button
                onClick={onCancel}
                style={{
                  width: '100%', marginTop: 20, padding: '13px', borderRadius: 12,
                  fontSize: 13, fontWeight: 600,
                  background: 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  color: 'var(--color-safe)', cursor: 'pointer',
                }}
              >
                ✓ I Am Now Safe
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Post emergency ────────────────────────────────────────────────── */}
        {currentStep === AppState.POST_EMERGENCY && (
          <motion.div
            key="post"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{ width: '100%', maxWidth: 380 }}
          >
            <div style={{
              padding: '32px 28px', borderRadius: 24,
              background: 'rgba(16,185,129,0.05)',
              border: '1px solid rgba(16,185,129,0.2)',
              boxShadow: '0 0 80px -20px rgba(16,185,129,0.3)',
              textAlign: 'center',
            }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                style={{
                  width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
                  background: 'rgba(16,185,129,0.15)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 40px -8px rgba(16,185,129,0.4)',
                }}
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="var(--color-safe)"
                    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>

              <h2 style={{
                fontSize: 24, fontWeight: 800, color: 'var(--color-safe)',
                marginBottom: 10, letterSpacing: '-0.01em',
              }}>
                All Clear
              </h2>
              <p style={{
                fontSize: 14, color: 'var(--color-text-secondary)',
                lineHeight: 1.6, marginBottom: 28,
              }}>
                Glad you're safe. Emergency monitoring has been paused.
                {userProfile?.name ? ` Take care, ${userProfile.name.split(' ')[0]}.` : ''}
              </p>

              <button
                onClick={onRestart}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12,
                  fontSize: 14, fontWeight: 700,
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  border: 'none', color: '#fff', cursor: 'pointer',
                  boxShadow: '0 0 30px -8px rgba(37,99,235,0.5)',
                }}
              >
                Return to Monitoring
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
