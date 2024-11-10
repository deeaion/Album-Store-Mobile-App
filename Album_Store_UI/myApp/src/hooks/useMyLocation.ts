import { useEffect, useState } from "react";
import { Geolocation, Position } from "@capacitor/geolocation";

interface MyLocation {
  position?: Position | null;
  error?: Error | null;
}

export const useMyLocation = () => {
  const [state, setState] = useState<MyLocation>({ error: null });

  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  };

  useEffect(() => {
    let cancelled = false;
    let callbackId: string | null = null;

    const watchMyLocation = async () => {
      try {
        const position = await Geolocation.getCurrentPosition(options);
        updateMyPosition("initial", position);
      } catch (error) {
        console.error("Error getting initial position:", error);
        updateMyPosition("initial", null, error);
      }

      // Watch for location updates
      callbackId = await Geolocation.watchPosition(
        options,
        (position, error) => {
          if (error) {
            console.error("Error watching position:", error);
          }
          updateMyPosition("watch", position, error);
        }
      );
    };

    watchMyLocation();

    // Cleanup on unmount
    return () => {
      cancelled = true;
      if (callbackId) {
        Geolocation.clearWatch({ id: callbackId });
      }
    };

    function updateMyPosition(
      source: string,
      position?: Position | null,
      error: any = undefined
    ) {
      console.log(`${source} position update`, position, error);
      if (!cancelled) {
        setState({ position, error });
      }
    }
  }, []);

  return state;
};
