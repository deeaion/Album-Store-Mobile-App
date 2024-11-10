// src/components/Header.tsx
import { createAnimation } from "@ionic/react";
import {
  IonButton,
  IonHeader,
  IonMenuButton,
  IonTitle,
  IonToolbar,
  IonButtons,
} from "@ionic/react";
import { useEffect, useState, useContext, useRef } from "react";
import { Preferences } from "@capacitor/preferences";
import { OnlineStatusContext } from "../../api/Status/OnlineStatusContext";

export const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isOnline } = useContext(OnlineStatusContext);

  useEffect(() => {
    const fetchToken = async () => {
      const { value } = await Preferences.get({ key: "authToken" });
      setIsLoggedIn(!!value);
    };

    fetchToken();
  }, []);

  const handleLogout = async () => {
    await Preferences.remove({ key: "authToken" });
    window.location.href = "/login";
  };

  function applyBeatAnimation(el: HTMLElement | null) {
    if (el) {
      const animation = createAnimation()
        .addElement(el)
        .duration(2000)
        .direction("alternate")
        .iterations(Infinity)
        .keyframes([
          { offset: 0, transform: "scale(1)", opacity: "1", color: "red" },
          {
            offset: 0.5,
            transform: "scale(1.2)",
            opacity: "0.8",
            color: "blue",
          },
          { offset: 1, transform: "scale(1)", opacity: "1", color: "purple" },
        ]);

      animation.play();
    }
  }
  const titleRef = useRef<HTMLIonTitleElement>(null);
  useEffect(() => {
    if (titleRef.current) {
      applyBeatAnimation(titleRef.current);
    }
  }, []);
  return (
    <IonHeader>
      <IonToolbar>
        {/* Menu button for opening the side menu */}
        <IonButtons slot="start">
          <IonMenuButton menu="main-menu" />
        </IonButtons>

        {/* Centered title */}
        <IonTitle ref={titleRef}>Beat Bliss</IonTitle>

        {/* Right-aligned status and logout button */}
        <IonButtons slot="end">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: "bold",
              color: isOnline ? "green" : "red",
            }}
            title={
              isOnline
                ? "You are online"
                : "You are offline. Cached data may be shown."
            }
          >
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: isOnline ? "green" : "red",
              }}
            ></span>
          </div>
          {isLoggedIn && (
            <IonButton onClick={handleLogout} color="primary">
              Logout
            </IonButton>
          )}
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
