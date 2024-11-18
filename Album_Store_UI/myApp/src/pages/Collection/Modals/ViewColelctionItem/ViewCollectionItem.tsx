import React from "react";
import {
  IonModal,
  IonButton,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonImg,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
} from "@ionic/react";
import { CollectionItem } from "../../../../api/CollectionItem/collectionTypes";

interface CollectionItemDetailsModalProps {
  item: CollectionItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const CollectionItemDetailsModal: React.FC<CollectionItemDetailsModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  if (!item) return null;

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{item.title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonCard>
          <IonImg
            src={`data:image/jpeg;base64,${item.image?.imageBase64}`}
            alt={item.title}
            style={{ maxHeight: "300px", objectFit: "cover" }}
          />
          <IonCardHeader>
            <IonCardTitle>{item.title}</IonCardTitle>
            <IonCardSubtitle>{item.artist}</IonCardSubtitle>
          </IonCardHeader>
        </IonCard>
        <IonButton expand="block" onClick={onClose}>
          Close
        </IonButton>
      </IonContent>
    </IonModal>
  );
};

export default CollectionItemDetailsModal;
