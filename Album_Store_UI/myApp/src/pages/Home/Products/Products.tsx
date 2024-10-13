import React, { useEffect, useState } from 'react';
import { IonContent, IonItem, IonLabel, IonSpinner, IonGrid, IonRow, IonCol, IonFab, IonFabButton, IonIcon, IonModal, IonHeader, IonToolbar, IonTitle, IonButton } from '@ionic/react';
import { useHistory } from 'react-router-dom';  
import { add } from 'ionicons/icons';  // Importing the 'add' icon
import { getAllProducts } from '../../../api/productAPI';
import {AddProductForm} from './Modals/AddProductForm';  // Import the modal form component
import { Header } from '../../../components/Header';
import { toast } from 'react-toastify';
import {useWebSocket} from '../../../hooks/useWebSocket';

export const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const history = useHistory();  
  const [isModalOpen, setIsModalOpen] = useState(false);  // State to control modal visibility

    useWebSocket('https://localhost:60505/ws');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const result = await getAllProducts({ Skip: 0, Take: 10000 });
      setProducts(result.records || []);
      setLoading(false);
    };
    fetchProducts();
  }, []);
  const handleProductClick = (id: string) => {
    history.push(`/product/${id}`); 
  };

  const handleAddProduct = () => {
    setIsModalOpen(true);  // Open the modal
  };

  const closeModal = () => {
    setIsModalOpen(false);  // Close the modal
  };

  return (
    <IonContent>
        <Header/>
        
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <IonSpinner name="crescent" />
          <p>Loading products...</p>
        </div>
      ) : (
        <>
          <IonGrid>
            {products.map((product) => (
              <IonRow key={product.id} onClick={() => handleProductClick(product.id)}>
                <IonCol size="12">
                  <IonItem button>
                    <img
                      src={`/${product.image || 'products/Image-Not-Found.jpg'}`}
                      alt={product.name}
                      style={{ width: '100px', height: '100px', marginRight: '10px' }}
                    />
                    <IonLabel>
                      <h2>{product.name}</h2>
                      <p>Price: ${product.price}</p>
                    </IonLabel>
                  </IonItem>
                </IonCol>
              </IonRow>
            ))}
          </IonGrid>

          {/* Floating Action Button for Adding Products */}
          <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{ '--margin-bottom': '20px' }}>
            <IonFabButton color="primary" onClick={handleAddProduct}>
              <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>

          {/* Modal for Adding Product */}
          <IonModal isOpen={isModalOpen} onDidDismiss={closeModal}>
            <IonHeader>
              <IonToolbar>
                <IonTitle>Add Product</IonTitle>
                <IonButton onClick={closeModal} slot="end">
                  Close
                </IonButton>
              </IonToolbar>
            </IonHeader>
            <IonContent>
              <AddProductForm />  {/* Embed the AddProductForm */}
            </IonContent>
          </IonModal>
        </>
      )}
    </IonContent>
  );
};

export default Products;
