import React, { useContext, useEffect } from "react";
import {
  IonContent,
  IonItem,
  IonLabel,
  IonButton,
  IonList,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
} from "@ionic/react";
import { BasketContext } from "../../api/Basket/BasketContext";
import { BasketItem } from "../../api/Basket/basketTypes";
import { useHistory } from "react-router-dom";

const BasketPage = () => {
  const {
    basket,
    fetching,
    fetchingError,
    saving,
    updateItem,
    deleteItem,
    fetchBasket,
    hasFetched,
  } = useContext(BasketContext);
  const history = useHistory();

  useEffect(() => {
    if (!hasFetched) {
      fetchBasket?.(); // Only fetch if it hasn't been done yet
    }
  }, [fetchBasket, hasFetched]);

  if (fetching && !hasFetched) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <IonSpinner name="crescent" />
        <p>Loading basket items...</p>
      </div>
    );
  }

  if (fetchingError) {
    return <p>Error fetching basket: {fetchingError.message}</p>;
  }

  const handleUpdateQuantity = async (
    item: BasketItem,
    newQuantity: number
  ) => {
    if (newQuantity >= 1 && newQuantity <= 50) {
      await updateItem!({ id: item.id, quantity: newQuantity });
    }
  };

  const handleDeleteItem = async (id: string) => {
    await deleteItem!(id);
  };

  return (
    <IonContent>
      <IonGrid>
        <h2>My Basket</h2>
        {basket && basket.items.length > 0 ? (
          <IonList>
            {basket.items.map((item) => (
              <IonItem key={item.id}>
                <IonGrid>
                  <IonRow>
                    <IonCol size="3">
                      <img
                        src={item.imagePath || "products/Image-Not-Found.jpg"}
                        alt={item.title}
                        style={{ width: "100%", height: "auto" }}
                      />
                    </IonCol>
                    <IonCol size="6">
                      <IonLabel>
                        <h3>{item.title}</h3>
                        <p>{item.band}</p>
                        <p>Quantity: {item.quantity}</p>
                      </IonLabel>
                    </IonCol>
                    <IonCol
                      size="3"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <IonButton
                          onClick={() =>
                            handleUpdateQuantity(item, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          -
                        </IonButton>
                        <IonButton
                          onClick={() =>
                            handleUpdateQuantity(item, item.quantity + 1)
                          }
                          disabled={item.quantity >= 50}
                        >
                          +
                        </IonButton>
                      </div>
                      <IonButton
                        color="danger"
                        onClick={() => handleDeleteItem(item.id)}
                        style={{ marginTop: "10px" }}
                      >
                        Remove
                      </IonButton>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonItem>
            ))}
          </IonList>
        ) : (
          <p>Your basket is empty.</p>
        )}

        <IonButton
          expand="block"
          color="primary"
          onClick={() => history.push("/checkout")}
          disabled={basket?.items.length === 0 || saving}
        >
          {saving ? "Processing..." : "Proceed to Checkout"}
        </IonButton>
      </IonGrid>
    </IonContent>
  );
};

export default BasketPage;
