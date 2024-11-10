import React, { useContext, useEffect } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonText,
} from "@ionic/react";
import { OrderContext } from "../../api/Order/OrderContext";
import { useParams } from "react-router-dom";
import MyMapWithSearch from "../../components/MyMap/MyMapWithSearch";

interface OrderDetailParams {
  id: string;
}

export const OrderDetails: React.FC = () => {
  const { id } = useParams<OrderDetailParams>();
  const { orders, fetchOrderById } = useContext(OrderContext);
  const order = orders?.find((order) => order.id === id);

  useEffect(() => {
    if (!order) {
      fetchOrderById?.(id);
    }
  }, [id, order, fetchOrderById]);

  if (!order) return <IonText>Loading...</IonText>;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Order #{order.id}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem>
            <IonLabel>
              <h2>Address</h2>
              <IonText>{order.address}</IonText>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <h2>Customer</h2>
              <IonText>{order.userEmail}</IonText>
            </IonLabel>
          </IonItem>
          {order.products.map((product) => (
            <IonItem key={product.productId}>
              <IonLabel>
                <h2>
                  {product.title} by {product.band}
                </h2>
                <p>Quantity: {product.quantity}</p>
                <p>Price: ${product.price.toFixed(2)}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

        {/* Map to display order address */}
        <MyMapWithSearch
          initialLat={37.7749}
          initialLng={-122.4194}
          address={order.address}
        />
      </IonContent>
    </IonPage>
  );
};
