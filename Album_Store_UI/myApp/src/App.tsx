import React, { useContext } from "react";
import { Route, Redirect, Switch } from "react-router-dom";
import {
  IonApp,
  IonSpinner,
  setupIonicReact,
  IonSplitPane,
  IonPage,
  IonRouterOutlet,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import SideMenu from "./components/SideMenu/SideMenu";
import Home from "./pages/Home/Home";
import BasketPage from "./pages/Basket/Basket";
import { Login } from "./pages/Login";
import { ProductDetails } from "./pages/Home/Products/ProductDetails";
import PrivateRoute from "./components/PrivateRoute";
import { AuthContext } from "./api/Auth/AuthProvider";
import "@ionic/react/css/core.css";
import "./theme/variables.css";
import Checkout from "./pages/Checkout/Checkout";
import { Collection } from "./pages/Collection/Collection";
import { Orders } from "./pages/Orders/Orders";
import { OrderDetails } from "./pages/Orders/OrderDetails";

setupIonicReact();

const App: React.FC = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <IonApp>
        <IonPage>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <IonSpinner name="crescent" />
            <p>Checking authentication...</p>
          </div>
        </IonPage>
      </IonApp>
    );
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonSplitPane contentId="main-content">
          <SideMenu />
          <IonRouterOutlet id="main-content">
            <Switch>
              <Route path="/login" exact>
                {isAuthenticated ? <Redirect to="/" /> : <Login />}
              </Route>

              <PrivateRoute path="/" exact component={Home} />
              <PrivateRoute path="/product/:id" component={ProductDetails} />
              <PrivateRoute path="/favorites" component={Home} />
              <PrivateRoute path="/profile" component={Home} />
              <PrivateRoute path="/settings" component={Home} />
              <PrivateRoute path="/collection" component={Collection} />
              <Route exact path="/orders" component={Orders} />
              <PrivateRoute path="/basket" component={BasketPage} />
              <PrivateRoute path="/checkout" component={Checkout} />
              <Route path="/order/:id" component={OrderDetails} />

              <Route path="*">
                <Redirect to={isAuthenticated ? "/" : "/login"} />
              </Route>
            </Switch>
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
