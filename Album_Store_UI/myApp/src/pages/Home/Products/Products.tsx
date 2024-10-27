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
  IonButton,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  useIonAlert,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { add, heart, heartOutline } from 'ionicons/icons';
import { Header } from '../../../components/Header';
import { ProductContext } from '../../../api/Products/ProductContext';
import { AddProductForm } from './Modals/AddProductForm';
import { AuthContext } from '../../../api/Auth/AuthProvider';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { ProductListItem } from '../../../api/Products/productTypes';

export const Products: React.FC = () => {
  const { products, fetching, fetchingError, setFilter, totalNumberOfRecords, toggleFavorite } = useContext(ProductContext);
  const { loginResult } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const take = 10;
  const history = useHistory();
  const [alert] = useIonAlert();
  const user = loginResult?.user;
  const canAddProduct = user?.roles.includes('admin');

  useEffect(() => {
    if (setFilter && hasMore) {
      setFilter({ Skip: skip, Take: take });
    }
  }, [setFilter, skip, take, hasMore]);

  useEffect(() => {
    if (products && totalNumberOfRecords !== undefined) {
      setHasMore(products.length < totalNumberOfRecords);
    }
  }, [products, totalNumberOfRecords]);

  const loadMoreItems = useCallback(
    (event: CustomEvent<void>) => {
      if (hasMore) {
        setSkip((prevSkip) => prevSkip + take);
      }
      const target = event.target as HTMLIonInfiniteScrollElement | null;
      if (target) {
        target.complete();
      }
    },
    [hasMore, take]
  );

  const handleProductClick = useCallback(
    (id: string) => {
      history.push(`/product/${id}`);
    },
    [history]
  );

  const handleAddProduct = useCallback(() => {
    if (canAddProduct) {
      setIsModalOpen(true);
    } else {
      alert({
        header: 'Access Denied',
        message: 'Only admins can add new products.',
        buttons: ['OK'],
      });
    }
  }, [canAddProduct, alert]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFavoriteToggle = (product: ProductListItem) => {
    // Call toggleFavorite to handle both optimistic UI update and backend request
    if (toggleFavorite) {
      toggleFavorite(product.id, product.isFavorited ?? false)
        .then(() => {
          console.log(`Product ${product.id} favorite status toggled to ${!product.isFavorited}`);
        })
        .catch((error) => {
          console.error('Error toggling favorite:', error);
          alert({
            header: 'Error',
            message: 'Failed to update favorite status. Please try again later.',
            buttons: ['OK'],
          });
        });
    }
  };

  useWebSocket({
    url: 'https://localhost:60505/hubs/albumstore',
    token: loginResult?.token,
    onMessage: (notification) => {
      if (notification.type === 'product') {
        alert({
          header: 'Product Updated',
          message: `Product ${notification.id} has been updated.`,
          buttons: ['OK'],
        });
      }
    },
  });

  return (
    <IonContent>
      <Header />

      {fetching && skip === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <IonSpinner name="crescent" />
          <p>Loading products...</p>
        </div>
      ) : fetchingError ? (
        <p style={{ textAlign: 'center', color: 'red' }}>
          Failed to load products. {fetchingError.message || 'Please try again later.'}
        </p>
      ) : (
        <IonGrid>
          {Array.isArray(products) && products.length > 0 ? (
            products.map((product) => (
              <IonRow key={product.id} onClick={() => handleProductClick(product.id)}>
                <IonCol size="12">
                  <IonItem button>
                    <img
                      src={`/${product.Image || 'products/Image-Not-Found.jpg'}`}
                      alt={product.name}
                      style={{ width: '100px', height: '100px', marginRight: '10px' }}
                    />
                    <IonLabel>
                      <h2>{product.name}</h2>
                      <p>Price: ${product.price}</p>
                    </IonLabel>
                    <IonIcon
                      icon={product.isFavorited ? heart : heartOutline}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavoriteToggle(product);
                      }}
                    />
                  </IonItem>
                </IonCol>
              </IonRow>
            ))
          ) : (
            <p style={{ textAlign: 'center' }}>No products available.</p>
          )}
        </IonGrid>
      )}

      <IonInfiniteScroll onIonInfinite={loadMoreItems} threshold="100px" disabled={!hasMore || fetching}>
        <IonInfiniteScrollContent loadingSpinner="crescent" loadingText="Loading more products..."></IonInfiniteScrollContent>
      </IonInfiniteScroll>

      {canAddProduct && (
        <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{ '--margin-bottom': '20px' }}>
          <IonFabButton color="primary" onClick={handleAddProduct}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      )}

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
