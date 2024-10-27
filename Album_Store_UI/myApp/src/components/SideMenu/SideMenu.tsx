// src/components/SideMenu.tsx
import React from 'react';
import { IonContent, IonList, IonItem, IonMenu, IonHeader, IonToolbar, IonTitle } from '@ionic/react';

const SideMenu: React.FC = () => {
  return (
    <IonMenu contentId="main-content" side="start">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Menu</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem routerLink="/home">Home</IonItem>
          <IonItem routerLink="/favorites">Favorites</IonItem>
          <IonItem routerLink="/profile">Profile</IonItem>
          <IonItem routerLink="/settings">Settings</IonItem>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default SideMenu;
