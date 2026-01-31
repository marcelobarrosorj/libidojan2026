
import { useEffect, useState } from 'react';

/**
 * Hook to manage user geolocation.
 * Handles permissions, loading states, and error reporting.
 */
export function useUserLocation() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada neste dispositivo/navegador.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setError(null);
        setLoading(false);
      },
      (err) => {
        let errorMsg = 'Não foi possível obter a localização.';
        if (err.code === err.PERMISSION_DENIED) {
          errorMsg = 'Permissão de localização negada.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMsg = 'Informação de localização indisponível.';
        } else if (err.code === err.TIMEOUT) {
          errorMsg = 'Tempo esgotado ao tentar obter localização.';
        }
        setError(errorMsg);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  return { location, loading, error };
}
