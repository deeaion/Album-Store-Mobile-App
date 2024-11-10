import React, { useState, useContext, useEffect, useRef } from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonFooter,
  createAnimation,
} from "@ionic/react";
import { usePhotos } from "../../../../hooks/usePhotos";
import { CollectionContext } from "../../../../api/CollectionItem/CollectionContext";
import { getProducts } from "../../../../api/Products/productAPI";
import { getBands } from "../../../../api/Band/bandAPI";
import { ProductDetail as Product } from "../../../../api/Products/productTypes";
import { Band } from "../../../../api/Band/bandTypes";
import "./AddCollectionItemModal.css";

interface AddCollectionItemModalProps {
  onClose: () => void;
}

const AddCollectionItemModal: React.FC<AddCollectionItemModalProps> = ({
  onClose,
}) => {
  const { takePhoto } = usePhotos();
  const { saveCollectionItem } = useContext(CollectionContext);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [selectedBandId, setSelectedBandId] = useState<string | undefined>(
    undefined
  );
  const [isCustomArtist, setIsCustomArtist] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [bands, setBands] = useState<Band[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<
    string | undefined
  >(undefined);
  const modalRef = useRef<HTMLIonContentElement>(null);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productList = await getProducts({ Skip: 0, Take: 1000 });
        setProducts(productList.records);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchBands = async () => {
      const result = await getBands();
      setBands(result.records || []);
    };
    fetchBands();
  }, []);
  useEffect(() => {
    if (modalRef.current) {
      const animation = createAnimation()
        .addElement(modalRef.current)
        .duration(700)
        .direction("alternate")
        .iterations(1)
        .keyframes([
          { offset: 0, transform: "scale(0.7) rotate(-10deg)", opacity: "0" },
          {
            offset: 0.5,
            transform: "scale(1.05) rotate(10deg)",
            opacity: "0.5",
          },
          { offset: 1, transform: "scale(1) rotate(0deg)", opacity: "1" },
        ]);
      animation.play();
    }
  }, []);

  const handleBandChange = (bandId: string) => {
    if (bandId === "custom") {
      setIsCustomArtist(true);
      setArtist("");
    } else {
      setIsCustomArtist(false);
      setSelectedBandId(bandId);
      const selectedBand = bands.find((band) => band.id === bandId);
      setArtist(selectedBand ? selectedBand.name : "");
    }
  };

  const handleTakePhoto = async () => {
    const capturedPhoto = await takePhoto();
    if (capturedPhoto) {
      setPhoto(capturedPhoto.webviewPath || null);
    } else {
      setPhoto(null);
    }
  };

  const handleSaveItem = async () => {
    if (title && artist && photo) {
      const collectionItem = {
        productId: selectedProductId || undefined,
        imageId: undefined,
        title,
        artist,
        image: {
          imageBase64: photo.split(",")[1],
          contentType: "image/jpeg",
          fileName: `${Date.now()}.jpeg`,
        },
      };
      await saveCollectionItem?.(collectionItem);
      onClose();
    }
  };

  return (
    <IonContent ref={modalRef} className="modal-content">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Add Collection Item</IonTitle>
          <IonButton slot="end" onClick={onClose}>
            Close
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent scrollY className="ion-padding">
        <IonItem>
          <IonLabel position="stacked">Title</IonLabel>
          <IonInput
            value={title}
            onIonChange={(e) => setTitle(e.detail.value!)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Artist/Band</IonLabel>
          <IonSelect
            value={isCustomArtist ? "custom" : selectedBandId}
            placeholder="Select Band or Type Artist"
            onIonChange={(e) => handleBandChange(e.detail.value)}
          >
            <IonSelectOption value="custom">Other</IonSelectOption>
            {bands.map((band) => (
              <IonSelectOption key={band.id} value={band.id}>
                {band.name}
              </IonSelectOption>
            ))}
          </IonSelect>
          {isCustomArtist && (
            <IonInput
              value={artist}
              placeholder="Enter artist name"
              onIonChange={(e) => setArtist(e.detail.value!)}
              className="custom-artist-input"
            />
          )}
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Product (Optional)</IonLabel>
          <IonSelect
            value={selectedProductId}
            placeholder="Select Product"
            onIonChange={(e) => setSelectedProductId(e.detail.value)}
          >
            <IonSelectOption value={undefined}>None</IonSelectOption>
            {products.map((product) => (
              <IonSelectOption key={product.id} value={product.id}>
                {product.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <IonButton expand="block" onClick={handleTakePhoto}>
          Take Photo
        </IonButton>
        {photo && (
          <img
            src={photo}
            alt="Selected"
            style={{ width: "100%", marginTop: "10px" }}
            className="fade-in"
          />
        )}
      </IonContent>

      <IonFooter className="ion-padding">
        <IonButton
          expand="block"
          color="primary"
          onClick={handleSaveItem}
          disabled={!photo}
          className="save-button fade-in"
        >
          Save Item
        </IonButton>
      </IonFooter>
    </IonContent>
  );
};

export default AddCollectionItemModal;
