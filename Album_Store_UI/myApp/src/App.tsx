import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import { IonApp, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { useEffect, useState } from 'react';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
import './theme/variables.css';

import Home from './pages/Home/Home';
import { Login } from './pages/Login';
import { ProductDetails } from './pages/Home/Products/ProductDetails';
import { ToastContainer } from 'react-toastify';

setupIonicReact();

const RetrieveCorrectRoutes = () => {
  const token = localStorage.getItem('authToken');
  const tokenCookie = document.cookie.split(';').find((cookie) => cookie.trim().startsWith('token='));
  return !!(token || tokenCookie); // Return true if token exists
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(RetrieveCorrectRoutes());
  }, []);

  return (
    <IonApp>
      <ToastContainer />
      <IonReactRouter>
        <Router>
          <Switch>
            {/* Public routes */}
            <Route path="/login">
              {isAuthenticated ? <Redirect to="/" /> : <Login />}
            </Route>

            <Route path="/" exact>
              <Home />
            </Route>

            {/* Protected Routes */}
            <Route path="/product/:id">
              {isAuthenticated ? <ProductDetails /> : <Redirect to="/login" />}
            </Route>

            {/* Catch-all route for unknown URLs */}
            <Route>
              <Redirect to="/" />
            </Route>
          </Switch>
        </Router>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
