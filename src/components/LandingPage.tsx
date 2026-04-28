import { motion } from 'motion/react';
import type { ViewMode } from '../types';

interface Props {
  onNavigate: (page: ViewMode) => void;
}

const featureCards = [
  {
    title: 'Intelligent Threat Detection',
    description: 'AI-powered audio monitoring identifies danger signatures before an incident escalates.',
  },
  {
    title: 'Instant Alert Flow',
    description: 'Simulate emergency activation, contact notification and response escalation in one prototype.',
  },
  {
    title: 'Secure Contact Management',
    description: 'Manage trusted emergency contacts directly from the dashboard.',
  },
];

export default function LandingPage({ onNavigate }: Props) {
  return (
    <div className="min-h-screen px-6 py-10 lg:px-14 lg:py-12" style={{ color: 'var(--color-text-primary)' }}>
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur-sm">
              Built by NexQuad — AI-focused safety systems
            </span>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-[-0.04em] text-white sm:text-5xl">
              ResQSense
              <span className="block text-3xl text-slate-300 sm:text-4xl">
                AI-Powered Predictive Emergency Safety System
              </span>
            </h1>
            <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
              Discover the web prototype for the same intelligent safety platform powering live emergency workflows. Simulate alerts, manage contacts, and showcase emergency readiness with premium design.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate('signup')}
                className="rounded-2xl bg-gradient-to-r from-slate-800 via-blue-600 to-violet-600 px-7 py-3 text-sm font-semibold text-white shadow-2xl shadow-blue-800/20 transition hover:-translate-y-0.5 hover:shadow-blue-700/30"
              >
                Start free demo
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="rounded-2xl border border-white/10 bg-white/5 px-7 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/20 hover:bg-white/10"
              >
                Login to prototype
              </button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong relative overflow-hidden p-8 shadow-2xl shadow-slate-900/30"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-blue-500/20 to-transparent" />
            <div className="mb-4 flex items-center justify-between text-sm text-slate-300">
              <span className="rounded-full bg-white/5 px-3 py-1">Live Demo</span>
              <span>Preview</span>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
              <div className="mb-5 text-xs uppercase tracking-[0.28em] text-slate-400">ResQSense Console</div>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl bg-slate-900/80 p-4">
                  <div>
                    <p className="text-sm text-slate-400">Monitoring</p>
                    <p className="text-xl font-semibold text-white">Active</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-200">Secure</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                    <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Contacts</p>
                    <p className="mt-2 text-lg font-semibold text-white">4 saved</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                    <p className="text-xs uppercase tracking-[0.26em] text-slate-400">Alerts</p>
                    <p className="mt-2 text-lg font-semibold text-white">2 critical</p>
                  </div>
                </div>
                <div className="rounded-3xl border border-blue-500/10 bg-blue-500/5 p-4 text-sm text-slate-200">
                  Simulated emergency flow active. A modern web prototype that demonstrates the full product concept.
                </div>
              </div>
            </div>
          </motion.div>
        </header>

        <section className="grid gap-5 lg:grid-cols-3">
          {featureCards.map((item) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="glass p-6"
            >
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
            </motion.div>
          ))}
        </section>

        <section className="grid gap-8 lg:grid-cols-[1fr_0.76fr]">
          <div className="glass p-8">
            <h2 className="text-2xl font-bold text-white">Why ResQSense?</h2>
            <p className="mt-4 max-w-xl text-slate-300 leading-7">
              ResQSense blends live audio threat detection with emergency notification workflows, contact management, and rapid escalation. This prototype captures the full UX without requiring native device changes.
            </p>
            <div className="mt-8 grid gap-4">
              <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                <p className="text-sm text-slate-400">Smart emergency activation</p>
                <p className="mt-2 text-base text-white">Trigger emergency workflows with one click and keep teams informed throughout the incident.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                <p className="text-sm text-slate-400">Premium design</p>
                <p className="mt-2 text-base text-white">High-end visual presentation built for stakeholder demos and investor previews.</p>
              </div>
            </div>
          </div>

          <div className="glass p-8">
            <h2 className="text-2xl font-bold text-white">Team & Vision</h2>
            <p className="mt-4 text-slate-300 leading-7">
              ResQSense is designed by NexQuad for organizations that need fast situational awareness and proactive response. The web prototype showcases how AI, sound analysis, and contact workflows come together in a modern safety platform.
            </p>
            <div className="mt-8 grid gap-4">
              {['NexQuad', 'Emergency automation', 'Future-ready architecture'].map((text) => (
                <div key={text} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-sm text-slate-200">
                  {text}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="glass p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">ResQSense prototype</p>
              <h2 className="mt-2 text-3xl font-bold text-white">A complete demo experience for emergency readiness.</h2>
            </div>
            <button
              onClick={() => onNavigate('signup')}
              className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              Launch dashboard
            </button>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
              <h3 className="text-lg font-semibold text-white">Sound detection</h3>
              <p className="mt-3 text-slate-300">Showcase the AI concept with sound incident simulation and threshold-based alerts.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
              <h3 className="text-lg font-semibold text-white">Contact workflow</h3>
              <p className="mt-3 text-slate-300">Build trust by letting users manage their emergency contacts at any time.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
              <h3 className="text-lg font-semibold text-white">Emergency flow</h3>
              <p className="mt-3 text-slate-300">Simulated escalation demonstrates how alerts progress through the system.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
