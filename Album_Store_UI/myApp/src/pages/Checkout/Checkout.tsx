import React, { useState, useContext } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonSpinner,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import MyMap from "../../components/MyMap/MyMap";
import { useMyLocation } from "../../hooks/useMyLocation";
import { mapsApiKey } from "../../mapsApiKey";
import { OrderContext } from "../../api/Order/OrderContext";
import { BasketContext } from "../../api/Basket/BasketContext";
import { useSnackbar } from "../../api/Snackbar/SnacbarContext";

const Checkout: React.FC = () => {
  const myLocation = useMyLocation();
  const { latitude: lat, longitude: lng } = myLocation.position?.coords || {};
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [address, setAddress] = useState("");
  const { saveOrder, saving } = useContext(OrderContext);
  const { basket, fetchBasket } = useContext(BasketContext);
  const { showSnackbar } = useSnackbar();
  const history = useHistory();

  const updateAddress = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${mapsApiKey}`
      );
      const data = await response.json();
      setAddress(data.results?.[0]?.formatted_address || "Address not found");
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddress("Unable to fetch address");
    }
  };

  const handleMapClick = (e: { latitude: number; longitude: number }) => {
    const { latitude, longitude } = e;
    setSelectedLocation({ lat: latitude, lng: longitude });
    updateAddress(latitude, longitude);
  };

  const handlePlaceOrder = async () => {
    if (saveOrder && selectedLocation && address && basket) {
      const orderData = { address };
      try {
        await saveOrder(orderData);
        showSnackbar("Order placed successfully!", "success");
        if (fetchBasket) {
          await fetchBasket();
        }
        history.push("/");
      } catch (error) {
        showSnackbar("Failed to place order. Please try again.", "error");
        console.error("Order placement error:", error);
      }
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Checkout</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {lat && lng ? (
          <MyMap
            lat={lat}
            lng={lng}
            onMapClick={handleMapClick}
            onMarkerClick={(e) => console.log("Marker clicked:", e)}
          />
        ) : (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <IonSpinner name="crescent" />
            <p>Loading your location...</p>
          </div>
        )}

        {selectedLocation && (
          <IonItem>
            <IonLabel>Selected Address</IonLabel>
            <IonInput value={address} readonly />
          </IonItem>
        )}

        <IonButton
          expand="block"
          onClick={handlePlaceOrder}
          disabled={saving || !selectedLocation}
        >
          {saving ? "Processing Order..." : "Place Order"}
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Checkout;
