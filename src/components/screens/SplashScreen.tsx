import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface Props {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: Props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return p + 2;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--color-void)' }}
    >
      {/* Background radial */}
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(37,99,235,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Animated rings */}
      {[1, 2, 3].map(i => (
        <motion.div
          key={i}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1 + i * 0.35, opacity: 0 }}
          transition={{ duration: 3, delay: i * 0.6, repeat: Infinity, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            width: 160, height: 160,
            borderRadius: '50%',
            border: '1px solid rgba(37,99,235,0.3)',
          }}
        />
      ))}

      {/* Shield icon */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: 80, height: 80,
          borderRadius: '50%',
          background: 'rgba(37,99,235,0.15)',
          border: '1px solid rgba(37,99,235,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 32,
          boxShadow: '0 0 60px -10px rgba(37,99,235,0.5)',
        }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7L12 2z"
            fill="rgba(37,99,235,0.3)" stroke="rgba(37,99,235,0.9)" strokeWidth="1.5"
            strokeLinejoin="round"/>
          <path d="M9 12l2 2 4-4" stroke="rgba(37,99,235,0.9)" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{ textAlign: 'center', marginBottom: 48 }}
      >
        <h1 style={{
          fontFamily: 'var(--font-sans)', fontSize: 28, fontWeight: 800,
          letterSpacing: '-0.02em', color: 'var(--color-text-primary)',
          marginBottom: 8,
        }}>
          Predictive Emergency AI
        </h1>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--color-text-secondary)', letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}>
          Real-time threat detection
        </p>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ width: 200 }}
      >
        <div style={{
          height: 2,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, rgba(37,99,235,0.6), rgba(37,99,235,1))',
            borderRadius: 2,
            transition: 'width 0.04s linear',
          }} />
        </div>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          color: 'var(--color-text-muted)', textAlign: 'center',
          marginTop: 10, letterSpacing: '0.1em',
        }}>
          INITIALISING {progress}%
        </p>
      </motion.div>
    </div>
  );
}
