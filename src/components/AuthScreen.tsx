import { FormEvent, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import type { AuthCredentials, UserProfile, ViewMode } from '../types';

interface Props {
  mode: 'login' | 'signup';
  onAuthenticate: (profile: UserProfile) => void;
  onSwitch: (view: ViewMode) => void;
}

const defaultContacts = ['Mom — +1 555 123 4567', 'Partner — +1 555 987 6543'];

export default function AuthScreen({ mode, onAuthenticate, onSwitch }: Props) {
  const initialState: AuthCredentials = {
    name: '',
    email: '',
    phone: '',
    password: '',
    contacts: [''],
  };

  const [form, setForm] = useState<AuthCredentials>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const title = useMemo(
    () => (mode === 'login' ? 'Login to ResQSense' : 'Create your ResQSense account'),
    [mode]
  );

  const description = useMemo(
    () =>
      mode === 'login'
        ? 'Access the web prototype to view monitoring, alerts, and emergency management in a polished dashboard.'
        : 'Sign up and configure your emergency contacts for the full demo experience.',
    [mode]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Enter a valid email address';
    }
    if (!form.password.trim() || form.password.length < 6) {
      nextErrors.password = 'Use at least 6 characters';
    }

    if (mode === 'signup') {
      if (!form.name.trim()) nextErrors.name = 'Full name is required';
      if (!form.phone.trim()) nextErrors.phone = 'Phone number is required';
      const contactErrors = form.contacts.map(contact => (!contact.trim() ? 'Required' : ''));
      if (contactErrors.some(Boolean)) nextErrors.contacts = 'Fix your emergency contacts';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onAuthenticate({
      name: mode === 'signup' ? form.name.trim() : 'Avery Cole',
      email: form.email.trim(),
      phone: mode === 'signup' ? form.phone.trim() : '+1 555 024 8486',
      emergencyContacts:
        mode === 'signup' ? form.contacts.filter(Boolean) : defaultContacts,
    });
  };

  const handleDemo = () => {
    onAuthenticate({
      name: 'Avery Cole',
      email: 'avery@nexquad.io',
      phone: '+1 555 024 8486',
      emergencyContacts: defaultContacts,
    });
  };

  return (
    <div className="min-h-screen px-6 py-10 lg:px-14 lg:py-12">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <div className="glass-strong border border-white/10 p-8 shadow-2xl shadow-slate-900/20">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">ResQSense authentication</p>
              <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">{title}</h1>
            </div>
            <button
              onClick={() => onSwitch(mode === 'login' ? 'signup' : 'login')}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/20 hover:bg-white/10"
            >
              {mode === 'login' ? 'Create account' : 'Already have an account?'}
            </button>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">{description}</p>
        </div>

        <form onSubmit={handleSubmit} className="glass p-8 shadow-2xl shadow-slate-900/20">
          <div className="grid gap-6">
            {mode === 'signup' && (
              <div className="grid gap-3">
                <label className="text-sm font-semibold text-slate-200">Full Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Jane Doe"
                  className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/70"
                />
                {errors.name && <span className="text-xs text-rose-400">{errors.name}</span>}
              </div>
            )}

            <div className="grid gap-3">
              <label className="text-sm font-semibold text-slate-200">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="you@example.com"
                className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/70"
              />
              {errors.email && <span className="text-xs text-rose-400">{errors.email}</span>}
            </div>

            {mode === 'signup' && (
              <div className="grid gap-3">
                <label className="text-sm font-semibold text-slate-200">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 555 000 0000"
                  className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/70"
                />
                {errors.phone && <span className="text-xs text-rose-400">{errors.phone}</span>}
              </div>
            )}

            <div className="grid gap-3">
              <label className="text-sm font-semibold text-slate-200">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter your password"
                className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/70"
              />
              {errors.password && <span className="text-xs text-rose-400">{errors.password}</span>}
            </div>

            {mode === 'signup' && (
              <div className="grid gap-3">
                <label className="text-sm font-semibold text-slate-200">Emergency Contacts</label>
                {form.contacts.map((value, index) => (
                  <input
                    key={index}
                    value={value}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        contacts: prev.contacts.map((item, i) => (i === index ? e.target.value : item)),
                      }))
                    }
                    placeholder="Name — +1 555 999 9999"
                    className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/70"
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, contacts: [...prev.contacts, ''] }))}
                  className="self-start rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/15"
                >
                  Add contact
                </button>
                {errors.contacts && <span className="text-xs text-rose-400">{errors.contacts}</span>}
              </div>
            )}

            <button
              type="submit"
              className="rounded-3xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              {mode === 'login' ? 'Continue to dashboard' : 'Create account'}
            </button>
          </div>
        </form>

        <div className="glass p-8 text-center text-slate-300">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-slate-500">Quick start</p>
          <p className="mb-6 text-base leading-7">
            Use demo mode to preview ResQSense instantly, or continue with your own credentials.
          </p>
          <button
            onClick={handleDemo}
            className="rounded-3xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
          >
            Continue with demo account
          </button>
        </div>
      </div>
    </div>
  );
}
