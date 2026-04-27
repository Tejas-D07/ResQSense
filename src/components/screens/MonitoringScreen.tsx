import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../../types';
import { useAudioMonitor } from '../../hooks/useAudioMonitor';

interface Props {
  isActive:       boolean;
  userProfile:    UserProfile | null;
  onToggle:       () => void;
  onTriggerAlert: () => void;
}

function ConfidenceMeter({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct > 70 ? 'var(--color-danger)' : pct > 40 ? 'var(--color-warn)' : 'var(--color-safe)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        flex: 1, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: color, borderRadius: 2,
          transition: 'width 0.4s ease, background 0.3s ease',
          boxShadow: `0 0 8px ${color}`,
        }} />
      </div>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 11,
        color, minWidth: 36, textAlign: 'right',
      }}>
        {pct}%
      </span>
    </div>
  );
}

export default function MonitoringScreen({ isActive, userProfile, onToggle, onTriggerAlert }: Props) {
  const contacts = userProfile?.emergencyContacts ?? [];
  const userName = userProfile?.name ?? 'User';
  const { latest, history, isPolling, error } = useAudioMonitor(isActive, onTriggerAlert, contacts, userName);

  const statusColor = !isActive ? 'var(--color-text-muted)'
    : latest?.danger ? 'var(--color-danger)'
    : 'var(--color-safe)';

  const statusLabel = !isActive ? 'STANDBY'
    : latest?.danger ? 'THREAT DETECTED'
    : 'MONITORING';

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'var(--color-void)' }}
    >
      {/* Subtle background glow when active */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            key="bg-glow"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: latest?.danger
                ? 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(239,68,68,0.06) 0%, transparent 70%)'
                : 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(37,99,235,0.05) 0%, transparent 70%)',
              transition: 'background 0.8s ease',
            }}
          />
        )}
      </AnimatePresence>

      {/* Scanline when active */}
      {isActive && (
        <div className="scanline" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      )}

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 20px 40px' }}>

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
            }}>
              {isActive && (
                <span className="status-dot" style={{
                  background: statusColor, boxShadow: `0 0 8px ${statusColor}`,
                }} />
              )}
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                color: statusColor, letterSpacing: '0.15em',
                transition: 'color 0.4s ease',
              }}>
                {statusLabel}
              </span>
            </div>
            <h1 style={{
              fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)',
            }}>
              {userProfile ? `Hi, ${userProfile.name.split(' ')[0]}` : 'Emergency AI'}
            </h1>
          </div>

          {/* Toggle button */}
          <motion.button
            onClick={onToggle}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            style={{
              padding: '10px 20px', borderRadius: 12,
              fontSize: 13, fontWeight: 700, letterSpacing: '0.05em',
              background: isActive
                ? 'rgba(239,68,68,0.12)'
                : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              border: isActive ? '1px solid rgba(239,68,68,0.3)' : 'none',
              color: isActive ? 'var(--color-danger)' : '#fff',
              cursor: 'pointer',
              boxShadow: isActive ? 'none' : '0 0 30px -8px rgba(37,99,235,0.5)',
              transition: 'all 0.3s ease',
            }}
          >
            {isActive ? 'Stop' : 'Start Monitoring'}
          </motion.button>
        </div>

        {/* ── Central orb ────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          <div style={{ position: 'relative', width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Pulse rings */}
            {isActive && [1, 2].map(i => (
              <motion.div
                key={i}
                initial={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: 1.8 + i * 0.4, opacity: 0 }}
                transition={{ duration: 2.5, delay: i * 0.8, repeat: Infinity, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  width: 120, height: 120, borderRadius: '50%',
                  border: `1px solid ${latest?.danger ? 'rgba(239,68,68,0.4)' : 'rgba(37,99,235,0.3)'}`,
                  transition: 'border-color 0.5s ease',
                }}
              />
            ))}

            {/* Core circle */}
            <motion.div
              animate={isActive ? {
                boxShadow: latest?.danger
                  ? ['0 0 40px -8px rgba(239,68,68,0.4)', '0 0 70px -4px rgba(239,68,68,0.6)', '0 0 40px -8px rgba(239,68,68,0.4)']
                  : ['0 0 40px -8px rgba(37,99,235,0.3)', '0 0 60px -4px rgba(37,99,235,0.5)', '0 0 40px -8px rgba(37,99,235,0.3)'],
              } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 120, height: 120, borderRadius: '50%',
                background: isActive
                  ? latest?.danger ? 'rgba(239,68,68,0.12)' : 'rgba(37,99,235,0.12)'
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isActive
                  ? latest?.danger ? 'rgba(239,68,68,0.35)' : 'rgba(37,99,235,0.35)'
                  : 'rgba(255,255,255,0.08)'}`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.5s ease',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                {isActive ? (
                  /* Waveform icon */
                  <path d="M2 12h2M6 8v8M10 5v14M14 9v6M18 7v10M22 12h-2"
                    stroke={latest?.danger ? 'var(--color-danger)' : 'rgba(37,99,235,0.9)'}
                    strokeWidth="1.8" strokeLinecap="round"/>
                ) : (
                  /* Shield icon */
                  <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7L12 2z"
                    fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.25)"
                    strokeWidth="1.5" strokeLinejoin="round"/>
                )}
              </svg>
              {isActive && latest && (
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9,
                  color: latest.danger ? 'var(--color-danger)' : 'rgba(37,99,235,0.8)',
                  marginTop: 6, letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}>
                  LIVE
                </span>
              )}
            </motion.div>
          </div>
        </div>

        {/* ── Latest detection card ──────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {isActive && latest ? (
            <motion.div
              key={latest.sound + latest.confidence}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{
                padding: '18px 20px',
                background: latest.danger ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${latest.danger ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 16, marginBottom: 16,
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    color: 'var(--color-text-muted)', letterSpacing: '0.12em',
                    textTransform: 'uppercase', display: 'block', marginBottom: 4,
                  }}>
                    Detected Sound
                  </span>
                  <span style={{
                    fontSize: 16, fontWeight: 700,
                    color: latest.danger ? 'var(--color-danger)' : 'var(--color-text-primary)',
                  }}>
                    {latest.sound}
                  </span>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                  background: latest.danger ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.12)',
                  color: latest.danger ? 'var(--color-danger)' : 'var(--color-safe)',
                  border: `1px solid ${latest.danger ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.2)'}`,
                  fontFamily: 'var(--font-mono)',
                }}>
                  {latest.danger ? '⚠ DANGER' : '✓ SAFE'}
                </span>
              </div>
              <ConfidenceMeter value={latest.confidence} />

              {latest.audioClip && (
                <div style={{ marginTop: 16 }}>
                  <span style={{
                    display: 'block', fontSize: 10, fontFamily: 'var(--font-mono)',
                    color: 'var(--color-text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase',
                    marginBottom: 8,
                  }}>
                    Captured audio
                  </span>
                  <audio
                    controls
                    src={`data:audio/wav;base64,${latest.audioClip}`}
                    style={{ width: '100%', borderRadius: 14, background: 'rgba(255,255,255,0.04)' }}
                  />
                </div>
              )}

              {/* Top 3 */}
              {latest.top3 && latest.top3.length > 1 && (
                <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {latest.top3.slice(1).map((t, i) => (
                    <span key={i} style={{
                      padding: '3px 10px', borderRadius: 20,
                      fontSize: 10, fontFamily: 'var(--font-mono)',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: 'var(--color-text-secondary)',
                    }}>
                      {t.sound} · {Math.round(t.score * 100)}%
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ) : isActive ? (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{
                padding: '18px 20px', borderRadius: 16, marginBottom: 16,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                textAlign: 'center',
              }}
            >
              <span className="flicker" style={{
                fontFamily: 'var(--font-mono)', fontSize: 12,
                color: 'var(--color-text-muted)', letterSpacing: '0.12em',
              }}>
                SCANNING AUDIO…
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{
                padding: '24px 20px', borderRadius: 16, marginBottom: 16,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Press <strong style={{ color: 'var(--color-text-secondary)' }}>Start Monitoring</strong> to
                activate real-time YAMNet sound detection.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error banner ────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{
                padding: '12px 16px', borderRadius: 12, marginBottom: 16,
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-danger)' }}>
                ⚠ Backend error: {error}
              </p>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                Ensure the backend server is running on port 5002.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── History log ─────────────────────────────────────────────────────── */}
        {history.length > 0 && (
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              color: 'var(--color-text-muted)', letterSpacing: '0.15em',
              textTransform: 'uppercase', marginBottom: 10,
            }}>
              Detection Log
            </div>
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 4,
              maxHeight: 200, overflowY: 'auto',
            }}>
              {history.map((h, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 14px', borderRadius: 10,
                  background: i === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
                  border: i === 0 ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
                }}>
                  <span style={{
                    fontSize: 12, color: h.danger ? 'var(--color-danger)' : 'var(--color-text-secondary)',
                    fontWeight: h.danger ? 600 : 400,
                  }}>
                    {h.danger ? '⚠' : '·'} {h.sound}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    color: 'var(--color-text-muted)',
                  }}>
                    {Math.round(h.confidence * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Manual trigger (dev/demo) ───────────────────────────────────────── */}
        {isActive && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={onTriggerAlert}
            style={{
              display: 'block', margin: '24px auto 0', background: 'none',
              border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8,
              padding: '8px 20px', fontSize: 11, fontFamily: 'var(--font-mono)',
              color: 'rgba(239,68,68,0.5)', cursor: 'pointer',
              letterSpacing: '0.1em',
            }}
          >
            SIMULATE ALERT (dev)
          </motion.button>
        )}
      </div>
    </div>
  );
}
