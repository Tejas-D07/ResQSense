import { useState, useCallback } from 'react';

interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
}

interface LocationData {
  coordinates: GeolocationCoordinates | null;
  address: string | null;
  url: string | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * Hook to get user's current geolocation
 * Returns coordinates, Google Maps URL, and reverse geocoded address
 */
export function useGeolocation() {
  const [locationData, setLocationData] = useState<LocationData>({
    coordinates: null,
    address: null,
    url: null,
    error: null,
    isLoading: false,
  });

  const requestLocation = useCallback(async () => {
    setLocationData(prev => ({ ...prev, isLoading: true, error: null }));

    return new Promise<LocationData>((resolve) => {
      if (!navigator.geolocation) {
        const error = 'Geolocation is not supported by your browser';
        setLocationData(prev => ({ ...prev, isLoading: false, error }));
        resolve({ coordinates: null, address: null, url: null, error, isLoading: false });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed } = position.coords;
          const coordinates = { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed };
          const googleMapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;

          // Try to get readable address using reverse geocoding (OpenStreetMap)
          let address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
              { headers: { 'Accept-Language': 'en' } }
            );
            if (response.ok) {
              const data = await response.json();
              address = data.address?.road
                ? `${data.address.road}, ${data.address.city || data.address.town || 'Unknown'}`
                : address;
            }
          } catch (err) {
            console.warn('Failed to reverse geocode location:', err);
          }

          const result = { coordinates, address, url: googleMapsUrl, error: null, isLoading: false };
          setLocationData(result);
          resolve(result);
        },
        (error) => {
          let errorMsg = 'Failed to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = 'Location permission denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = 'Location unavailable';
              break;
            case error.TIMEOUT:
              errorMsg = 'Location request timeout';
              break;
          }
          setLocationData(prev => ({ ...prev, isLoading: false, error: errorMsg }));
          resolve({ coordinates: null, address: null, url: null, error: errorMsg, isLoading: false });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  return {
    ...locationData,
    requestLocation,
  };
}
