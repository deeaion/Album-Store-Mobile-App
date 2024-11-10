import React, { useContext, useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  IonModal,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
} from "@ionic/react";
import { add, trash } from "ionicons/icons";
import { CollectionContext } from "../../api/CollectionItem/CollectionContext";
import { CollectionItem } from "../../api/CollectionItem/collectionTypes";
import AddCollectionItemModal from "./Modals/AddItemToCollection/AddCollectionItem";

export const Collection: React.FC = () => {
  const { collections, deleteCollectionItem } = useContext(CollectionContext);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    console.log("Updated collections:", collections);
  }, [collections]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My Collection</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid>
          <IonRow>
            {collections?.map((item: CollectionItem) => (
              <IonCol size="12" sizeMd="6" key={item.id}>
                <IonCard>
                  <IonImg
                    src={`data:image/jpeg;base64,${item.image?.imageBase64}`}
                    alt={item.title || "Collection Item"}
                    style={{ maxHeight: "200px", objectFit: "cover" }}
                  />
                  <IonCardHeader>
                    <IonCardTitle>{item.title}</IonCardTitle>
                    <IonCardSubtitle>{item.artist}</IonCardSubtitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonFabButton
                      color="danger"
                      size="small"
                      onClick={() => item.id && deleteCollectionItem?.(item.id)}
                    >
                      <IonIcon icon={trash} />
                    </IonFabButton>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setShowModal(true)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        {/* Modal for adding collection items */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <AddCollectionItemModal onClose={() => setShowModal(false)} />
        </IonModal>
      </IonContent>
    </IonPage>
  );
};
