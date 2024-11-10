import React, { useContext, useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  IonContent,
  IonItem,
  IonLabel,
  IonButton,
  IonSpinner,
  IonGrid,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonIcon,
  IonCardTitle,
  IonCardSubtitle,
  IonInput,
} from "@ionic/react";
import { deleteProduct, getProduct } from "../../../../api/Products/productAPI";
import { arrowBackOutline } from "ionicons/icons";
import { ProductDetail } from "../../../../api/Products/productTypes";
import { AuthContext } from "../../../../api/Auth/AuthProvider";
import { getCurrentUser, User } from "../../../../api/Auth/authAPI";
import { addBasketItem } from "../../../../api/Basket/basketAPI";
import { BasketContext } from "../../../../api/Basket/BasketContext";

export const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useContext(BasketContext); // Use addItem from context
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [quantity, setQuantity] = useState<number>(1); // Quantity state

  useEffect(() => {
    getCurrentUser().then((user) => setCurrentUser(user));
  }, []);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      const result = await getProduct(id);
      setProduct(result);
      setLoading(false);
    };
    fetchProductDetails();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <IonSpinner name="crescent" />
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return <p>Product not found.</p>;
  }

  const handleAddToBasket = async () => {
    if (product) {
      const basketItem = {
        id: product.id,
        quantity,
        productId: product.id,
        userBasketId: currentUser?.id || "",
        title: product.name,
        band: product.bandName || "Unknown Band",
        price: product.price,
        imagePath: product.baseImageUrl || "",
      };
      try {
        if (addItem) {
          await addItem(basketItem); // Use context's addItem for real-time updates
        } else {
          console.error("addItem is undefined");
        }
        alert("Product added to basket!");
      } catch (error) {
        console.error("Failed to add to basket:", error);
      }
    }
  };

  const incrementQuantity = () => setQuantity((prev) => Math.min(prev + 1, 50));
  const decrementQuantity = () => setQuantity((prev) => Math.max(prev - 1, 1));

  function handleDelete(id: string): void {
    throw new Error("Function not implemented.");
  }

  return (
    <IonContent>
      <IonGrid>
        <div
          style={{
            textAlign: "left",
            marginBottom: "20px",
            display: "flex",
            gap: 12,
          }}
        >
          <IonButton onClick={() => history.push("/products")} color="primary">
            <IonIcon slot="start" icon={arrowBackOutline} />
          </IonButton>
          <h2>
            {product.name} -{" "}
            {product.bandName ? product.bandName : "Unknown Band"}
          </h2>
          {currentUser?.roles?.includes("Admin") && (
            <IonButton color="danger" onClick={() => handleDelete(product.id)}>
              Delete
            </IonButton>
          )}
        </div>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>{product.name}</IonCardTitle>
            <IonCardSubtitle>{product.bandName}</IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem>
              <img
                src={product.baseImageUrl || "products/Image-Not-Found.jpg"}
                alt={product.name}
                style={{ width: "100%", height: "auto", marginBottom: "20px" }}
              />
            </IonItem>
            <IonLabel>
              <div className="detail-container">
                <h2 className="detail-container__item">Description</h2>
                <p className="detail-container__item">{product.description}</p>
                <h2 className="detail-container__item">Price</h2>
                <p
                  style={{ fontWeight: "bold", fontSize: "1.2em" }}
                  className="detail-container__item"
                >
                  ${product.price}
                </p>
                <h2 className="detail-container__item">Genre : </h2>
                <span className="detail-container__item">{product.genre}</span>
              </div>
            </IonLabel>
          </IonCardContent>
        </IonCard>

        {/* Quantity Selector */}
        <IonItem
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <IonLabel>Quantity</IonLabel>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <IonButton
              onClick={decrementQuantity}
              color="light"
              disabled={quantity === 1}
            >
              -
            </IonButton>
            <IonInput
              type="number"
              value={quantity}
              onIonChange={(e) => {
                const value = parseInt(e.detail.value!, 10);
                if (!isNaN(value) && value >= 1 && value <= 50) {
                  setQuantity(value);
                }
              }}
              style={{ width: "50px", textAlign: "center" }}
            />
            <IonButton
              onClick={incrementQuantity}
              color="light"
              disabled={quantity === 50}
            >
              +
            </IonButton>
          </div>
        </IonItem>

        {/* Add to Basket Button */}
        <IonButton
          expand="block"
          color="success"
          onClick={handleAddToBasket}
          style={{ marginTop: "20px" }}
        >
          Add to Basket
        </IonButton>
      </IonGrid>
    </IonContent>
  );
};

export default ProductDetails;
