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
  IonSearchbar,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { add, heart, heartOutline } from 'ionicons/icons';
import { Header } from '../../../components/Header';
import { ProductContext } from '../../../api/Products/ProductContext';
import { AddProductForm } from './Modals/AddProductForm';
import { AuthContext } from '../../../api/Auth/AuthProvider';
import { ProductListItem } from '../../../api/Products/productTypes';
import { getCurrentUser, User } from '../../../api/Auth/authAPI';
import { debounce } from 'lodash'; // Add lodash debounce for better performance

export const Products: React.FC = () => {
  const { products, fetching, fetchingError, setFilter, totalNumberOfRecords, toggleFavorite } = useContext(ProductContext);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const take = 10;
  const history = useHistory();
  const [alert] = useIonAlert();
  const canAddProduct = currentUser?.roles.includes('Admin');

  // Fetch current user
  useEffect(() => {
    getCurrentUser().then(user => setCurrentUser(user));
  }, []);

  // Debounced function to set search filter
  const debouncedSetFilter = useCallback(
    debounce((newSearch: string) => {
      if (setFilter) {
        setFilter({ Skip: 0, Take: take, Search: newSearch });
      }
      setSkip(0); // Reset skip to 0 to reload from the start
    }, 500),
    [setFilter, take]
  );

  // Trigger filter whenever `skip`, `take`, or `search` changes
  useEffect(() => {
    if (hasMore && setFilter) {
      setFilter({ Skip: skip, Take: take, Search: search });
    }
  }, [setFilter, skip, take, search, hasMore]);

  // Check if more products are available
  useEffect(() => {
    if (products && totalNumberOfRecords !== undefined) {
      setHasMore(products.length < totalNumberOfRecords);
    }
  }, [products, totalNumberOfRecords]);

  // Load more items when scrolled to the bottom
  const loadMoreItems = useCallback(
    (event: CustomEvent<void>) => {
      if (hasMore) {
        setSkip(prevSkip => prevSkip + take);
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
    if (toggleFavorite) {
      toggleFavorite(product.id, product.isFavorited ?? false);
    }
  };

  // Function to handle search input changes
  const handleSearchChange = useCallback(
    (e: CustomEvent) => {
      const newSearch = e.detail.value!;
      setSearch(newSearch); // Update local search state
      debouncedSetFilter(newSearch); // Trigger debounced filter update
    },
    [debouncedSetFilter]
  );

  return (
    <IonContent>
      <Header />
      <IonSearchbar
        value={search}
        onIonChange={handleSearchChange}
        placeholder="Search products..."
      />
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
