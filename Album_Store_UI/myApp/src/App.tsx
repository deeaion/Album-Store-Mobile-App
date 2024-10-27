// src/App.tsx
import React, { useContext } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import { IonApp, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ToastContainer } from 'react-toastify';

import Home from './pages/Home/Home';
import { Login } from './pages/Login';
import { ProductDetails } from './pages/Home/Products/ProductDetails';
import { AuthContext } from './api/Auth/AuthProvider';

import '@ionic/react/css/core.css';
import './theme/variables.css';
import PrivateRoute from './components/PrivateRoute';

setupIonicReact();

const App: React.FC = () => {
  const { isAuthenticated } = useContext(AuthContext); // Get auth status from context

  return (
    <IonApp>
      <ToastContainer />
      <IonReactRouter>
        <Switch>
          {/* Public Routes */}
          <Route path="/login" exact>
            {isAuthenticated ? <Redirect to="/" /> : <Login />}
          </Route>

          {/* Protected Routes */}
          <PrivateRoute path="/" exact component={Home} />
          <PrivateRoute path="/product/:id" component={ProductDetails} />

          {/* Fallback Route */}
          <Route path="*">
            <Redirect to={isAuthenticated ? "/" : "/login"} />
          </Route>
        </Switch>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
