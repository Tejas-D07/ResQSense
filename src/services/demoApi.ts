import type { UserProfile } from '../types';

export interface EmergencyResult {
  backend: boolean;
  response: any;
}

export async function triggerEmergencyDemo(user: UserProfile): Promise<EmergencyResult> {
  const location = 'Downtown demo district';
  const payload = {
    audioData: {
      sound: 'Manual emergency trigger',
      confidence: 0.98,
      danger: true,
    },
    contacts: user.emergencyContacts,
    location,
    userName: user.name,
  };

  if (typeof window !== 'undefined' && window.location.hostname.includes('localhost')) {
    try {
      const response = await fetch('/api/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      return {
        backend: response.ok,
        response: result,
      };
    } catch (error) {
      console.warn('Local backend unavailable:', error);
    }
  }

  return {
    backend: false,
    response: {
      status: 'ALERT_TRIGGERED',
      sound: payload.audioData.sound,
      confidence: payload.audioData.confidence,
      location,
      userName: user.name,
      smsResult: 'SIMULATED DELIVERY',
    },
  };
}
