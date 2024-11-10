import React, { useState, useEffect, useContext } from "react";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonAlert,
  IonSpinner,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../../api/Auth/AuthProvider";
import "./Login.css";

export const Login: React.FC = () => {
  const { login, isAuthenticating, authenticationError, isAuthenticated } =
    useContext(AuthContext); // Add isAuthenticated
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const history = useHistory();
  const [alert] = useIonAlert();

  // Show an alert if there's an authentication error
  useEffect(() => {
    if (authenticationError) {
      alert({
        header: "Login Failed",
        message: authenticationError,
        buttons: ["OK"],
      });
    }
  }, [authenticationError, alert]);

  // Redirect to home if login was successful
  useEffect(() => {
    if (isAuthenticated && !isAuthenticating) {
      history.push("/"); // Redirect to home on successful login
    }
  }, [isAuthenticated, isAuthenticating, history]);

  // Login handler
  const handleLogin = async (asGuest: boolean) => {
    await login?.(email, password, asGuest);
  };

  return (
    <IonPage>
      <IonContent fullscreen className="page-container">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Login</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="form-container">
          <IonItem>
            <IonLabel position="floating">Email</IonLabel>
            <IonInput
              type="email"
              value={email}
              onIonChange={(e) => setEmail(e.detail.value!)}
            />
          </IonItem>

          <IonItem>
            <IonLabel position="floating">Password</IonLabel>
            <IonInput
              type="password"
              value={password}
              onIonChange={(e) => setPassword(e.detail.value!)}
            />
          </IonItem>

          {isAuthenticating && <IonSpinner name="crescent" />}

          <div className="grid">
            <IonButton
              onClick={() => handleLogin(false)}
              className="grid__item"
            >
              Login
            </IonButton>
            <IonButton
              color="secondary"
              onClick={() => handleLogin(true)}
              className="grid__item"
            >
              Login as Guest
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
