import { useState, useCallback } from "react";
import type { GeolocationPosition } from "@/types";

interface GeolocationState {
  position: GeolocationPosition | null;
  error: string | null;
  isLoading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    isLoading: false,
  });

  const getCurrentPosition = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: GeolocationPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          
          setState({
            position: coords,
            error: null,
            isLoading: false,
          });
          
          resolve(coords);
        },
        (error) => {
          let errorMessage = "Unknown error occurred";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied by user";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
          }
          
          setState({
            position: null,
            error: errorMessage,
            isLoading: false,
          });
          
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }, []);

  return {
    ...state,
    getCurrentPosition,
  };
}
