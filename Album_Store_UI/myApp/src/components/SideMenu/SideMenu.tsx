import React from "react";
import {
  IonContent,
  IonList,
  IonItem,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
} from "@ionic/react";

const SideMenu: React.FC = () => {
  return (
    <IonMenu contentId="main-content" side="start" menuId="main-menu">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Menu</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem routerLink="/home">Home</IonItem>
          {/* <IonItem routerLink="/favorites">Favorites</IonItem> */}
          {/* <IonItem routerLink="/profile">Profile</IonItem> */}
          {/* <IonItem routerLink="/settings">Settings</IonItem> */}
          <IonItem routerLink="/collection">Collection</IonItem>
          <IonItem routerLink="/basket">Basket</IonItem>
          <IonItem routerLink="/orders">Orders</IonItem>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default SideMenu;
