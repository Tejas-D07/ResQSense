import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioDetection } from '../types';
import { useGeolocation } from './useGeolocation';

const BACKEND = 'http://localhost:5002';
const POLL_INTERVAL_MS = 3000;

export interface MonitorState {
  latest:      AudioDetection | null;
  history:     AudioDetection[];
  isPolling:   boolean;
  error:       string | null;
}

export function useAudioMonitor(
  active: boolean,
  onDangerConfirmed: () => void,
  emergencyContacts: string[] = [],
  userName: string = 'User',
) {
  const [state, setState] = useState<MonitorState>({
    latest: null, history: [], isPolling: false, error: null,
  });

  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const { requestLocation } = useGeolocation();

  const poll = useCallback(async () => {
    try {
      // 1. Get audio detection from YAMNet
      const audioRes = await fetch(`${BACKEND}/api/audio`);
      if (!audioRes.ok) throw new Error(`Audio endpoint ${audioRes.status}`);
      const audio: AudioDetection = await audioRes.json();

      setState(prev => ({
        ...prev,
        latest: audio,
        history: [audio, ...prev.history].slice(0, 20),
        error: null,
      }));

      // 2. If danger detected, get location and post to alert endpoint
      if (audio.danger) {
        // Request live location when danger is detected
        const locationData = await requestLocation();
        const formattedLocation = locationData.address || 
          (locationData.coordinates ? `${locationData.coordinates.latitude.toFixed(4)}, ${locationData.coordinates.longitude.toFixed(4)}` : 'Location unavailable');
        
        const alertRes = await fetch(`${BACKEND}/api/alert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioData: audio,
            contacts: emergencyContacts,
            location: formattedLocation,
            userName: userName,
          }),
        });
        const alert = await alertRes.json();
        if (alert.status === 'ALERT_TRIGGERED') {
          onDangerConfirmed();
        }
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Connection failed',
      }));
    }
  }, [onDangerConfirmed, emergencyContacts, userName, requestLocation]);

  useEffect(() => {
    if (active) {
      setState(prev => ({ ...prev, isPolling: true }));
      poll(); // immediate first poll
      timerRef.current = setInterval(poll, POLL_INTERVAL_MS);
    } else {
      setState(prev => ({ ...prev, isPolling: false }));
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active, poll]);

  return state;
}
