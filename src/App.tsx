import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AppState, UserProfile } from './types';
import SplashScreen from './components/screens/SplashScreen';
import PermissionsScreen from './components/screens/PermissionsScreen';
import UserSetupScreen from './components/screens/UserSetupScreen';
import MonitoringScreen from './components/screens/MonitoringScreen';
import AlertScreens from './components/screens/AlertScreens';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -16, transition: { duration: 0.25 } },
};

export default function App() {
  const [currentPage, setCurrentPage]           = useState<AppState>(AppState.SPLASH);
  const [userProfile, setUserProfile]           = useState<UserProfile | null>(null);
  const [isMonitoringActive, setIsMonitoringActive] = useState(false);

  const toPermissions = () => setCurrentPage(AppState.PERMISSIONS);
  const toSetup       = () => setCurrentPage(AppState.USER_SETUP);

  const toMonitoring  = (profile?: UserProfile) => {
    if (profile) setUserProfile(profile);
    setCurrentPage(AppState.MONITORING_INACTIVE);
  };

  const toggleMonitoring = () => {
    setIsMonitoringActive(prev => !prev);
    setCurrentPage(prev =>
      prev === AppState.MONITORING_INACTIVE
        ? AppState.MONITORING_ACTIVE
        : AppState.MONITORING_INACTIVE
    );
  };

  const triggerValidation = () => setCurrentPage(AppState.PRE_DANGER_VALIDATION);
  const triggerDanger     = () => setCurrentPage(AppState.DANGER_DETECTED);
  const triggerEscalation = () => setCurrentPage(AppState.EMERGENCY_ACTIVATED);

  const setSafe = () => {
    setCurrentPage(AppState.POST_EMERGENCY);
    setIsMonitoringActive(false);
  };

  const resetMonitoring = () => {
    setCurrentPage(AppState.MONITORING_INACTIVE);
    setIsMonitoringActive(false);
  };

  const isAlertState = [
    AppState.PRE_DANGER_VALIDATION,
    AppState.DANGER_DETECTED,
    AppState.EMERGENCY_ACTIVATED,
    AppState.POST_EMERGENCY,
  ].includes(currentPage);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-void)', color: 'var(--color-text-primary)' }}>
      <AnimatePresence mode="wait">
        {currentPage === AppState.SPLASH && (
          <motion.div key="splash" {...pageVariants}>
            <SplashScreen onComplete={toPermissions} />
          </motion.div>
        )}

        {currentPage === AppState.PERMISSIONS && (
          <motion.div key="permissions" {...pageVariants}>
            <PermissionsScreen onComplete={toSetup} />
          </motion.div>
        )}

        {currentPage === AppState.USER_SETUP && (
          <motion.div key="setup" {...pageVariants}>
            <UserSetupScreen onComplete={toMonitoring} />
          </motion.div>
        )}

        {(currentPage === AppState.MONITORING_INACTIVE || currentPage === AppState.MONITORING_ACTIVE) && (
          <motion.div key="monitoring" {...pageVariants}>
            <MonitoringScreen
              isActive={isMonitoringActive}
              userProfile={userProfile}
              onToggle={toggleMonitoring}
              onTriggerAlert={triggerValidation}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert screens overlay */}
      <AnimatePresence>
        {isAlertState && (
          <motion.div
            key="alerts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50 }}
          >
            <AlertScreens
              currentStep={currentPage}
              userProfile={userProfile}
              onCancel={setSafe}
              onEscalate={
                currentPage === AppState.PRE_DANGER_VALIDATION ? triggerDanger : triggerEscalation
              }
              onRestart={resetMonitoring}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
