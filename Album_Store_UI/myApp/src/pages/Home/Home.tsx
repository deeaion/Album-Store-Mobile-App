import { useContext, useEffect, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import './Home.css';
import { Header } from '../../components/Header';
import Products from './Products/Products';
import Login from '../Login/Login'; // Assume Login component is correctly imported
import { AuthContext } from '../../api/Auth/AuthProvider';

const Home: React.FC = () => {
  // get from context
  const isAuthenticated=useContext(AuthContext);

  return (
    <IonPage>
      <IonContent>
        {isAuthenticated ? <Products /> : <Login />}
      </IonContent>
    </IonPage>
  );
};

export default Home;
