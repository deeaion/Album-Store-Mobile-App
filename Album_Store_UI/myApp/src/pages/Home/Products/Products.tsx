import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  IonContent,
  IonItem,
  IonLabel,
  IonSpinner,
  IonGrid,
  IonRow,
  IonCol,
  IonFab,
  IonFabButton,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { add } from 'ionicons/icons';
import { Header } from '../../../components/Header';
import { toast } from 'react-toastify';
import { ProductContext } from '../../../api/Products/ProductContext';
import { AddProductForm } from './Modals/AddProductForm';

export const Products: React.FC = () => {
  const { products, fetching, fetchingError, setFilter } = useContext(ProductContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const history = useHistory();

  // Initialize filter on component mount
  useEffect(() => {
    if (setFilter) {
      setFilter({ Skip: 0, Take: 10000 }); // Set filter once on mount
    }
  }, [setFilter]);

  // Handle product click, memoized for performance
  const handleProductClick = useCallback((id: string) => {
    history.push(`/product/${id}`);
  }, [history]);

  // Toggle add product modal
  const handleAddProduct = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  // Close add product modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <IonContent>
      <Header />

      {/* Show spinner when fetching */}
      {fetching ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <IonSpinner name="crescent" />
          <p>Loading products...</p>
        </div>
      ) : fetchingError ? (
        // Show detailed error message
        <p style={{ textAlign: 'center', color: 'red' }}>
          Failed to load products. {fetchingError.message || 'Please try again later.'}
        </p>
      ) : (
        <IonGrid>
          {/* Confirm products is an array and map through it */}
          {Array.isArray(products) && products.length > 0 ? (
            products.map((product) => (
              <IonRow key={product.id} onClick={() => handleProductClick(product.id)}>
                <IonCol size="12">
                  <IonItem button>
                    <img
                      src={`/${product.baseImageUrl || 'products/Image-Not-Found.jpg'}`}
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
            ))
          ) : (
            // No products available message
            <p style={{ textAlign: 'center' }}>No products available.</p>
          )}
        </IonGrid>
      )}

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
          <AddProductForm setIsModalOpen={setIsModalOpen} />
        </IonContent>
      </IonModal>
    </IonContent>
  );
};

export default Products;
