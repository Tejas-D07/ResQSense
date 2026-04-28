import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import type { UserProfile } from '../types';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

export default function OnboardingModal({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [userData, setUserData] = useState({
    name: '',
    phone: '',
    contacts: [''],
  });
  const [permissions, setPermissions] = useState({
    microphone: false,
    location: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    {
      title: 'Welcome to ResQSense',
      description: 'Let\'s set up your emergency safety profile. This will take just a minute.',
      content: (
        <div className="text-center">
          <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 p-4">
            <svg className="h-full w-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-300">Built by NexQuad for proactive emergency response.</p>
        </div>
      ),
    },
    {
      title: 'Your Profile',
      description: 'Tell us about yourself so we can personalize your emergency alerts.',
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Full Name</label>
            <input
              type="text"
              value={userData.name}
              onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500/70 focus:outline-none"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Your Phone Number</label>
            <input
              type="tel"
              value={userData.phone}
              onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500/70 focus:outline-none"
              placeholder="+1 555 000 0000"
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Emergency Contacts',
      description: 'Add trusted contacts who will receive alerts during emergencies.',
      content: (
        <div className="space-y-4">
          {userData.contacts.map((contact, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Emergency Contact {index + 1}
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => {
                  const newContacts = [...userData.contacts];
                  newContacts[index] = e.target.value;
                  setUserData(prev => ({ ...prev, contacts: newContacts }));
                }}
                className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500/70 focus:outline-none"
                placeholder="Name — +1 555 999 9999"
              />
            </div>
          ))}
          <button
            onClick={() => setUserData(prev => ({ ...prev, contacts: [...prev.contacts, ''] }))}
            className="w-full rounded-xl border border-blue-500/20 bg-blue-500/10 py-3 text-blue-200 hover:bg-blue-500/15 transition-colors"
          >
            + Add Another Contact
          </button>
        </div>
      ),
    },
    {
      title: 'Permissions',
      description: 'We need access to your microphone and location to detect emergencies and send accurate alerts.',
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/80 p-4">
            <div>
              <h4 className="font-medium text-white">Microphone Access</h4>
              <p className="text-sm text-slate-400">Required for audio threat detection</p>
            </div>
            <button
              onClick={async () => {
                try {
                  await navigator.mediaDevices.getUserMedia({ audio: true });
                  setPermissions(prev => ({ ...prev, microphone: true }));
                } catch {
                  alert('Microphone permission denied. You can grant it later in browser settings.');
                }
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                permissions.microphone
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30'
                  : 'bg-blue-500/20 text-blue-200 hover:bg-blue-500/30'
              }`}
            >
              {permissions.microphone ? 'Granted' : 'Grant Access'}
            </button>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/80 p-4">
            <div>
              <h4 className="font-medium text-white">Location Access</h4>
              <p className="text-sm text-slate-400">Used for emergency location reporting</p>
            </div>
            <button
              onClick={() => {
                navigator.geolocation.getCurrentPosition(
                  () => setPermissions(prev => ({ ...prev, location: true })),
                  () => alert('Location permission denied. You can grant it later in browser settings.')
                );
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                permissions.location
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30'
                  : 'bg-blue-500/20 text-blue-200 hover:bg-blue-500/30'
              }`}
            >
              {permissions.location ? 'Granted' : 'Grant Access'}
            </button>
          </div>
        </div>
      ),
    },
  ];

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!userData.name.trim()) newErrors.name = 'Name is required';
      if (!userData.phone.trim()) newErrors.phone = 'Phone is required';
    } else if (step === 2) {
      if (!userData.contacts.some(c => c.trim())) newErrors.contacts = 'At least one contact is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      if (step < steps.length - 1) {
        setStep(step + 1);
      } else {
        // Complete onboarding
        const profile: UserProfile = {
          name: userData.name,
          email: `${userData.name.toLowerCase().replace(/\s+/g, '.')}@demo.com`,
          phone: userData.phone,
          emergencyContacts: userData.contacts.filter(c => c.trim()),
        };
        localStorage.setItem('resqsense_onboarded', 'true');
        onComplete(profile);
      }
    }
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-4 w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl"
      >
        <div className="mb-6">
          <div className="mb-2 flex justify-center">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    index <= step ? 'bg-blue-500' : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
          <h2 className="text-center text-2xl font-bold text-white">{steps[step].title}</h2>
          <p className="mt-2 text-center text-slate-400">{steps[step].description}</p>
        </div>

        <div className="mb-8">{steps[step].content}</div>

        {Object.keys(errors).length > 0 && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
            {Object.values(errors).map((error, index) => (
              <p key={index} className="text-sm text-red-300">{error}</p>
            ))}
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={step === 0}
            className="rounded-xl px-6 py-3 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            onClick={nextStep}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-white font-medium hover:from-blue-700 hover:to-violet-700 transition-all"
          >
            {step === steps.length - 1 ? 'Complete Setup' : 'Next'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
