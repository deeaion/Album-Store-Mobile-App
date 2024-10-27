// src/components/Header.tsx

import { IonButton, IonHeader, IonMenuButton, IonTitle, IonToolbar } from '@ionic/react';
import { useEffect, useState, useContext } from 'react';
import { Preferences } from '@capacitor/preferences';
import { OnlineStatusContext } from '../../api/Status/OnlineStatusContext';

export const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isOnline } = useContext(OnlineStatusContext);

  useEffect(() => {
    const fetchToken = async () => {
      const { value } = await Preferences.get({ key: 'authToken' });
      setIsLoggedIn(!!value);
    };

    fetchToken();
  }, []);

  const handleLogout = async () => {
    await Preferences.remove({ key: 'authToken' });
    window.location.href = '/login';
  };

  return (
    <IonHeader>
      <IonToolbar
        style={{
          alignItems: 'center',
          justifyContent: 'space-between',
          display: 'flex',
          padding: '0 16px',
        }}
      >
        <IonMenuButton slot="start" />
        <IonTitle>Beat Bliss</IonTitle>
        {isLoggedIn && (
          <IonButton onClick={handleLogout} color="primary">
            Logout
          </IonButton>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 'bold',
            color: isOnline ? 'green' : 'red',
          }}
          title={isOnline ? 'You are online' : 'You are offline. Cached data may be shown.'}
        >
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: isOnline ? 'green' : 'red',
            }}
          ></span>
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
