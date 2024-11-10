import React, { useEffect, useRef, useState } from "react";
import { GoogleMap } from "@capacitor/google-maps";
import { mapsApiKey } from "../../mapsApiKey";
import { Geolocation } from "@capacitor/geolocation";

interface MyMapWithSearchProps {
  initialLat?: number;
  initialLng?: number;
  address?: string;
}

const MyMapWithSearch: React.FC<MyMapWithSearchProps> = ({
  initialLat,
  initialLng,
  address,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapInstance = useRef<GoogleMap | null>(null);
  const [markerId, setMarkerId] = useState<string | null>(null);

  const initMapWithCoordinates = async (
    lat: number,
    lng: number,
    title: string
  ) => {
    if (!googleMapInstance.current) {
      googleMapInstance.current = await GoogleMap.create({
        id: "my-map",
        element: mapRef.current as HTMLElement,
        apiKey: mapsApiKey,
        config: {
          center: { lat, lng },
          zoom: 14,
        },
      });
    } else {
      googleMapInstance.current.setCamera({
        coordinate: { lat, lng },
        animate: true,
      });
    }

    if (markerId) {
      await googleMapInstance.current.removeMarker(markerId);
    }
    const newMarker = await googleMapInstance.current.addMarker({
      coordinate: { lat, lng },
      title: title,
    });
    setMarkerId(newMarker);
  };

  const geocodeAddress = async () => {
    if (!address) return;
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${mapsApiKey}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        console.log("Geocoded address:", address, "Coordinates:", { lat, lng });
        await initMapWithCoordinates(lat, lng, "Address Location");
      } else {
        console.warn(
          "No results found for address. Falling back to device location."
        );
        initializeWithDeviceLocation();
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      initializeWithDeviceLocation();
    }
  };

  const initializeWithDeviceLocation = async () => {
    try {
      const position = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      console.log("Device location:", { latitude, longitude });
      await initMapWithCoordinates(latitude, longitude, "Current Location");
    } catch (error) {
      console.error("Error getting device location:", error);
    }
  };

  useEffect(() => {
    if (address) {
      geocodeAddress();
    } else if (initialLat && initialLng) {
      initMapWithCoordinates(initialLat, initialLng, "Initial Location");
    } else {
      initializeWithDeviceLocation();
    }

    return () => {
      googleMapInstance.current?.removeAllMapListeners();
      googleMapInstance.current = null;
    };
  }, [address, initialLat, initialLng]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "50vh",
        maxWidth: "800px",
        margin: "auto",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    ></div>
  );
};

export default MyMapWithSearch;
