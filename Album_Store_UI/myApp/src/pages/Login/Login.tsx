import React, { useState, useEffect } from 'react';
import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonPage, IonTitle, IonToolbar, useIonAlert } from '@ionic/react';
import { loginUser } from '../../api/authAPI';  // API function to handle login
import { useHistory } from 'react-router-dom';  // For navigation in React Router v5
import './Login.css';  // Your custom styles

export const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');  // Email state
  const [password, setPassword] = useState<string>('');  // Password state
  const [error, setError] = useState<string | null>(null);  // Error state for displaying error messages
  const history = useHistory();  // React Router v5's history for navigation
  const [alert] = useIonAlert();  // Ionic's useIonAlert hook for alerts

  // Effect to show an alert if there's an error
  useEffect(() => {
    if (error) {
      alert({
        header: 'Login Failed',
        message: error,
        buttons: ['OK'],
      });
    }
  }, [error, alert]);

  // Login handler
  const handleLogin = async (asGuest: boolean) => {
    try {
        console.log('Login');
      const response = await loginUser(email, password, asGuest);  // Send login request
    console.log(response);
    console.log(response.result.token);
      if (response.result.token) {
        console.log('Login');
        localStorage.setItem('authToken', response.result.token);
        history.push('/');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (error) {
      setError('An error occurred during login');
    }
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
          {/* Email Input */}
          <IonItem>
            <IonLabel position="floating">Email</IonLabel>
            <IonInput
              type="email"
              value={email}
              onIonChange={(e) => setEmail(e.detail.value!)}
            />
          </IonItem>

          {/* Password Input */}
          <IonItem>
            <IonLabel position="floating">Password</IonLabel>
            <IonInput
              type="password"
              value={password}
              onIonChange={(e) => setPassword(e.detail.value!)}
            />
          </IonItem>

          {/* Error message */}
          {error && <p className="error-message">{error}</p>}

          {/* Login and Login as Guest buttons */}
          <div className="grid">
            <IonButton onClick={() => handleLogin(false)} className="grid__item">Login</IonButton>
            <IonButton color="secondary" onClick={() => handleLogin(true)} className="grid__item">Login as Guest</IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
