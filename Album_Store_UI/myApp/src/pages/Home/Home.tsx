import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './Home.css';
import {Header} from '../../components/Header';
import Products from './Products/Products';
import { toast } from 'react-toastify';
const Home: React.FC = () => {

  return (
    <IonPage>
        
       <Products/>
    </IonPage>
  );
};

export default Home;
