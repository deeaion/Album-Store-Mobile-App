import { GoogleMap } from "@capacitor/google-maps";
import { useEffect, useRef } from "react";
import { mapsApiKey } from "../../mapsApiKey";

interface MyMapProps {
  lat: number;
  lng: number;
  onMapClick: (e: { latitude: number; longitude: number }) => void;
  onMarkerClick: (e: {
    markerId: string;
    latitude: number;
    longitude: number;
  }) => void;
}

const MyMap: React.FC<MyMapProps> = ({
  lat,
  lng,
  onMapClick,
  onMarkerClick,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapInstance = useRef<GoogleMap | null>(null);
  const isMapInitialized = useRef(false);
  const markerId = useRef<string | null>(null);

  useEffect(() => {
    if (isMapInitialized.current || !mapRef.current) return;

    const initializeMap = async () => {
      try {
        googleMapInstance.current = await GoogleMap.create({
          id: "my-map",
          element: mapRef.current as HTMLElement,
          apiKey: mapsApiKey,
          config: {
            center: { lat, lng },
            zoom: 14,
          },
        });

        markerId.current = await googleMapInstance.current.addMarker({
          coordinate: { lat, lng },
          title: "Selected Location",
        });

        googleMapInstance.current.setOnMapClickListener(
          async ({ latitude, longitude }) => {
            console.log("Map clicked at:", latitude, longitude);
            onMapClick({ latitude, longitude });

            if (markerId.current) {
              await googleMapInstance.current?.removeMarker(markerId.current);
            }
            const newMarkerId = await googleMapInstance.current?.addMarker({
              coordinate: { lat: latitude, lng: longitude },
              title: "Selected Location",
            });
            markerId.current = newMarkerId ?? null;
          }
        );

        googleMapInstance.current.setOnMarkerClickListener(
          ({ markerId, latitude, longitude }) => {
            console.log(
              "Marker clicked with ID:",
              markerId,
              "at:",
              latitude,
              longitude
            );
            onMarkerClick({ markerId, latitude, longitude });
          }
        );

        console.log("Map successfully created at lat:", lat, "lng:", lng);
        isMapInitialized.current = true;
      } catch (error) {
        console.error("Error creating map:", error);
      }
    };

    initializeMap();

    return () => {
      if (googleMapInstance.current) {
        googleMapInstance.current.removeAllMapListeners();
        googleMapInstance.current = null;
        isMapInitialized.current = false;
      }
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "400px", margin: "20px auto" }}
    ></div>
  );
};

export default MyMap;
