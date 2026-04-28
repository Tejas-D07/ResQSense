import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { AlertEntry, UserProfile } from '../types';

interface Props {
  user: UserProfile;
  userName: string;
  alerts: AlertEntry[];
  latestEmergency: AlertEntry | null;
  monitoringActive: boolean;
  onLogout: () => void;
  onToggleMonitoring: () => void;
  onTriggerEmergency: () => void;
  onUpdateContacts: (contacts: string[]) => void;
}

export default function Dashboard({
  user,
  userName,
  alerts,
  latestEmergency,
  monitoringActive,
  onLogout,
  onToggleMonitoring,
  onTriggerEmergency,
  onUpdateContacts,
}: Props) {
  const [editableContacts, setEditableContacts] = useState(user.emergencyContacts);

  useEffect(() => {
    setEditableContacts(user.emergencyContacts);
  }, [user.emergencyContacts]);

  const addContact = () => setEditableContacts(prev => [...prev, '']);

  const updateContact = (index: number, value: string) =>
    setEditableContacts(prev => prev.map((item, idx) => (idx === index ? value : item)));

  const removeContact = (index: number) =>
    setEditableContacts(prev => prev.filter((_, idx) => idx !== index));

  const saveContacts = () => onUpdateContacts(editableContacts.filter(Boolean));

  const summaryStatus = monitoringActive
    ? latestEmergency?.severity === 'critical'
      ? 'Emergency Activated'
      : 'Monitoring Active'
    : 'Listening Standby';

  return (
    <div className="min-h-screen px-6 py-10 lg:px-14 lg:py-12">
      <div className="mx-auto grid max-w-7xl gap-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-white/5 px-4 py-2 text-sm text-slate-300 ring-1 ring-white/10">
              NexQuad · ResQSense dashboard
            </div>
            <h1 className="text-4xl font-bold tracking-[-0.04em] text-white sm:text-5xl">Hello, {userName}</h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300">
              Your demo command center for emergency safety, contact readiness, and simulated response workflows.
            </p>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex items-center justify-center rounded-3xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/20 hover:bg-white/10"
          >
            Sign out
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="grid gap-6">
            <div className="glass-strong p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Monitoring status</p>
                  <h2 className="mt-3 text-3xl font-semibold text-white">{summaryStatus}</h2>
                </div>
                <button
                  onClick={onToggleMonitoring}
                  className="rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                >
                  {monitoringActive ? 'Pause monitoring' : 'Activate monitoring'}
                </button>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
                  <p className="text-sm text-slate-400">Emergency contacts</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{user.emergencyContacts.length}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
                  <p className="text-sm text-slate-400">Recent alerts</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{alerts.length}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
                  <p className="text-sm text-slate-400">AI status</p>
                  <p className="mt-3 text-2xl font-semibold text-white">Ready</p>
                </div>
              </div>
            </div>

            <div className="glass p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Emergency flow</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Trigger the emergency simulation</h3>
                </div>
                <button
                  onClick={onTriggerEmergency}
                  className="rounded-3xl bg-gradient-to-r from-rose-500 to-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                >
                  Trigger Emergency
                </button>
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-300">
                Simulate alert escalation, visual notification, and emergency contact notification. This prototype demonstrates the full action flow without modifying native app logic.
              </p>
            </div>

            <div className="glass p-8">
              <h3 className="text-2xl font-semibold text-white">Alert history</h3>
              <div className="mt-6 grid gap-4">
                {alerts.slice(0, 5).map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-3xl border border-white/10 bg-slate-950/80 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">{alert.title}</p>
                        <p className="mt-2 text-sm text-slate-300">{alert.message}</p>
                      </div>
                      <span className="text-xs uppercase tracking-[0.3em] text-slate-500">{alert.timestamp}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{alert.source}</span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{alert.severity}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="glass p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Emergency contacts</p>
                  <h3 className="mt-3 text-2xl font-semibold text-white">Manage trusted contacts</h3>
                </div>
                <button
                  onClick={addContact}
                  className="rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/15"
                >
                  Add contact
                </button>
              </div>
              <div className="mt-6 space-y-4">
                {editableContacts.map((contact, index) => (
                  <div key={`${contact}-${index}`} className="grid gap-2 rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                    <input
                      value={contact}
                      onChange={(event) => updateContact(index, event.target.value)}
                      className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/70"
                    />
                    <button
                      type="button"
                      onClick={() => removeContact(index)}
                      className="self-start rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 transition hover:border-white/20 hover:bg-white/10"
                    >
                      Remove contact
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={saveContacts}
                className="mt-6 rounded-3xl bg-gradient-to-r from-slate-700 to-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                Save contacts
              </button>
            </div>

            <div className="glass p-8">
              <h3 className="text-2xl font-semibold text-white">AI feature showcase</h3>
              <div className="mt-6 grid gap-4">
                {[
                  { title: 'Sound detection concept', detail: 'Demonstrates how dangerous audio signatures would trigger the alert flow.' },
                  { title: 'Manual SOS workflow', detail: 'Sample emergency activation from a trusted user interface.' },
                  { title: 'Architecture readiness', detail: 'Ready for backend integration and future cross-platform deployment.' },
                ].map((item) => (
                  <div key={item.title} className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
                    <p className="text-base font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass p-8">
              <h3 className="text-2xl font-semibold text-white">Future scope</h3>
              <ul className="mt-6 space-y-3 text-slate-300">
                {['Live audio analytics', 'SMS + Twilio integration', 'Geolocation awareness', 'Cross-platform notification hub'].map((item) => (
                  <li key={item} className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-4">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {latestEmergency && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="glass p-8"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Latest outcome</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{latestEmergency.title}</h3>
                </div>
                <span className="rounded-full bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200">
                  {latestEmergency.source}
                </span>
              </div>
              <p className="mt-4 text-slate-300">{latestEmergency.message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
