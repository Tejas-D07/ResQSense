import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import OnboardingModal from './components/OnboardingModal';
import { AlertEntry, UserProfile, ViewMode } from './types';
import { triggerEmergencyDemo } from './services/demoApi';

const demoProfile: UserProfile = {
  name: 'Avery Cole',
  email: 'avery@nexquad.io',
  phone: '+1 555 024 8486',
  emergencyContacts: ['Mom — +1 555 123 4567', 'Partner — +1 555 987 6543'],
};

const defaultAlerts: AlertEntry[] = [
  {
    id: 'alert-1',
    title: 'System Ready',
    message: 'ResQSense is primed for live monitoring in demo mode.',
    severity: 'safe',
    timestamp: 'Just now',
    source: 'System',
  },
  {
    id: 'alert-2',
    title: 'AI Sound Check',
    message: 'Demo audio classification is available for simulated crises.',
    severity: 'warning',
    timestamp: '2 mins ago',
    source: 'Simulation Engine',
  },
];

export default function App() {
  const [view, setView] = useState<ViewMode>('landing');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [alerts, setAlerts] = useState<AlertEntry[]>(defaultAlerts);
  const [monitoringActive, setMonitoringActive] = useState(false);
  const [latestEmergency, setLatestEmergency] = useState<AlertEntry | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [permissions, setPermissions] = useState({
    microphone: false,
    location: false,
  });

  const userName = user?.name.split(' ')[0] ?? 'ResQSense User';

  useEffect(() => {
    const onboarded = localStorage.getItem('resqsense_onboarded');
    if (!onboarded) {
      setShowOnboarding(true);
    }

    // Check permissions
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
        setPermissions(prev => ({ ...prev, microphone: true }));
      }).catch(() => {});
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(() => {
        setPermissions(prev => ({ ...prev, location: true }));
      }, () => {});
    }
  }, []);

  const openDashboard = (profile: UserProfile) => {
    setUser(profile);
    setMonitoringActive(true);
    setView('dashboard');
    setShowOnboarding(false);
  };

  const handleAuthenticate = (profile: UserProfile) => {

  const openDashboard = (profile: UserProfile) => {
    setUser(profile);
    setMonitoringActive(true);
    setView('dashboard');
  };

  const handleAuthenticate = (profile: UserProfile) => {
    setAlerts([
      {
        id: `alert-${Date.now()}`,
        title: 'Welcome aboard',
        message: `Hi ${profile.name.split(' ')[0]}, your safety dashboard is ready.`,
        severity: 'safe',
        timestamp: 'Just now',
        source: 'System',
      },
      ...defaultAlerts,
    ]);
    openDashboard(profile);
  };

  const handleEmergency = async () => {
    if (!user) return;
    const result = await triggerEmergencyDemo(user);
    const record: AlertEntry = {
      id: `alert-${Date.now()}`,
      title: result.backend ? 'Emergency Escalated' : 'Emergency Simulation Triggered',
      message: result.backend
        ? 'Your alert was sent through the connected backend service.'
        : 'This emergency is being simulated for the web prototype.',
      severity: 'critical',
      timestamp: 'Right now',
      source: result.backend ? 'Backend API' : 'Web Demo',
    };

    setLatestEmergency(record);
    setAlerts(prev => [record, ...prev].slice(0, 12));
    setMonitoringActive(true);
  };

  const handleLogout = () => {
    setUser(null);
    setView('landing');
    setMonitoringActive(false);
    setLatestEmergency(null);
  };

  const handleUpdateContacts = (contacts: string[]) => {
    if (!user) return;
    setUser({ ...user, emergencyContacts: contacts });
  };

  const currentSection = useMemo(() => view, [view]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-slate-900">
      <AnimatePresence mode="wait">
        {currentSection === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <LandingPage onNavigate={setView} />
          </motion.div>
        )}

        {currentSection === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <AuthScreen mode="login" onAuthenticate={handleAuthenticate} onSwitch={setView} />
          </motion.div>
        )}

        {currentSection === 'signup' && (
          <motion.div
            key="signup"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <AuthScreen mode="signup" onAuthenticate={handleAuthenticate} onSwitch={setView} />
          </motion.div>
        )}

        {currentSection === 'dashboard' && user && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Dashboard
              user={user}
              userName={userName}
              alerts={alerts}
              latestEmergency={latestEmergency}
              monitoringActive={monitoringActive}
              permissions={permissions}
              onLogout={handleLogout}
              onToggleMonitoring={() => setMonitoringActive(prev => !prev)}
              onTriggerEmergency={handleEmergency}
              onUpdateContacts={handleUpdateContacts}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showOnboarding && (
          <OnboardingModal onComplete={openDashboard} />
        )}
      </AnimatePresence>
    </div>
  );
}
