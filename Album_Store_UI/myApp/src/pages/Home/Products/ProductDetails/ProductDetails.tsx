import React, { useContext, useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { IonContent, IonItem, IonLabel, IonButton, IonSpinner, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardContent, IonIcon, IonCardTitle, IonCardSubtitle } from '@ionic/react';
import { deleteProduct, getProduct } from '../../../../api/Products/productAPI'; // API call to get product details
import { arrowBackOutline } from 'ionicons/icons';
import { ProductDetail } from '../../../../api/Products/productTypes';
import { ProductContext } from '../../../../api/Products/ProductContext';
import { AuthContext } from '../../../../api/Auth/AuthProvider';
import { getCurrentUser, User } from '../../../../api/Auth/authAPI';

type ProductVersion = {
  id: string;
  version: string;
  description: string;
  imageUrl: string;
  price: number;
  productId: string;
};



export const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();  // Get the product ID from the URL
  const [product, setProduct] = useState<ProductDetail | null>(null);  // State to hold product details
  const [loading, setLoading] = useState(true);
  const history = useHistory();  // Initialize history to go back
   const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    getCurrentUser().then(user => setCurrentUser(user));
  }, []);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      const result = await getProduct(id);
      setProduct(result);
      setLoading(false);
    };
    fetchProductDetails();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <IonSpinner name="crescent" />
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return <p>Product not found.</p>;
  }

 
  function handleDelete(id: string): void {
    // call delete api from context
   deleteProduct(id).then((response) => {
      console.log(response);
      // redirect to products
      history.push('/products');
     
   }).catch((error) => {
      console.log(error);
   });

  }

  return (
    <IonContent>
      <IonGrid>
        {/* Back Button */}
        <div style={{ textAlign: 'left', marginBottom: '20px' ,display:'flex', gap:12}}>
          <IonButton onClick={() => history.push('/products')} color="primary">
            <IonIcon slot="start" icon={arrowBackOutline} />

          </IonButton>
            <h2>
                {product.name} - {product.bandName ? product.bandName : 'Unknown Band'}
            </h2>
            {/* if admin product delete button */}
            {currentUser?.roles?.includes('Admin') && (
              <IonButton color="danger" onClick={() => handleDelete(product.id)}>
              Delete
              </IonButton>
            )}
        </div>

        {/* Product Details Card */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>{product.name}</IonCardTitle>
            <IonCardSubtitle>{product.bandName}</IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem>
              <img
                src={product.baseImageUrl || 'products/Image-Not-Found.jpg'}
                alt={product.name}
                style={{ width: '100%', height: 'auto', marginBottom: '20px' }}
              />
            </IonItem>
            <IonLabel>
                <div className={'detail-container'}>
                <h2 className='detail-container__item'>Description</h2>
                <p className='detail-container__item'>{product.description}</p>
                <h2 className='detail-container__item'>Price</h2>
                <p style={{ fontWeight: 'bold', fontSize: '1.2em' }} className='detail-container__item'>${product.price}</p>
             
              <h2 className='detail-container__item'>Genre : </h2>
              <span className='detail-container__item'>{product.genre}</span>
                </div>
              

            </IonLabel>
          </IonCardContent>
          
        </IonCard>

        {/* Display product versions if available */}
        {product.productVersions && product.productVersions.length > 0 && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Versions</IonCardTitle>
            </IonCardHeader>
            {product.productVersions.map((version) => (
              <IonCard key={version.version}>
                <IonCardHeader>
                  <IonCardTitle>{version.description}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p>{version.description}</p>
                  <p style={{ fontWeight: 'bold', fontSize: '1.1em' }}>Price: ${version.price}</p>
                </IonCardContent>
              </IonCard>
            ))}
          </IonCard>
        )}
      </IonGrid>
    </IonContent>
  );
};

export default ProductDetails;
