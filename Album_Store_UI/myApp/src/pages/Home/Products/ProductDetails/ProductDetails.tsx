import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { IonContent, IonItem, IonLabel, IonButton, IonSpinner, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardContent, IonIcon, IonCardTitle, IonCardSubtitle } from '@ionic/react';
import { getProduct } from '../../../../api/productAPI'; // API call to get product details
import { arrowBackOutline } from 'ionicons/icons';

type ProductVersion = {
  id: string;
  version: string;
  description: string;
  imageUrl: string;
  price: number;
  productId: string;
};

type ProductDetailsProps = {
  id: string;
  name: string;
  description: string;
  price: number;
  genre: string;
  numberOfSales: number;
  numberOfStock: number;
  baseImageUrl: string;
  detailsImageUrl: string;
  bandName: string;
  artists: { id: string; name: string; genre: string }[];
  productVersions: ProductVersion[];
};

export const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();  // Get the product ID from the URL
  const [product, setProduct] = useState<ProductDetailsProps | null>(null);  // State to hold product details
  const [loading, setLoading] = useState(true);
  const history = useHistory();  // Initialize history to go back

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

  return (
    <IonContent>
      <IonGrid>
        {/* Back Button */}
        <div style={{ textAlign: 'left', marginBottom: '20px' ,display:'flex', gap:12}}>
          <IonButton onClick={() => history.push('/products')} color="primary">
            <IonIcon slot="start" icon={arrowBackOutline} />

          </IonButton>
            <h2>
                {product.name} - {product.bandName ? product.bandName : (product.artists && product.artists.length > 0 ? product.artists[0].name : '')}
            </h2>
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
        {product.productVersions.length > 0 && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Versions</IonCardTitle>
            </IonCardHeader>
            {product.productVersions.map((version) => (
              <IonCard key={version.id}>
                <IonCardHeader>
                  <IonCardTitle>{version.version}</IonCardTitle>
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
