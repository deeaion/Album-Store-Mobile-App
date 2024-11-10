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
import { useHistory } from "react-router-dom";

export const Orders: React.FC = () => {
  const { orders, fetchOrders } = useContext(OrderContext);
  const history = useHistory();

  useEffect(() => {
    if (fetchOrders) {
      fetchOrders();
    }
  }, [fetchOrders]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My Orders</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {orders?.map((order) => (
            <IonItem
              key={order.id}
              button
              onClick={() => history.push(`/order/${order.id}`)}
            >
              <IonLabel>
                <h2>Order #{order.id}</h2>
                <IonText color="medium">
                  <p>Address: {order.address}</p>
                </IonText>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};
