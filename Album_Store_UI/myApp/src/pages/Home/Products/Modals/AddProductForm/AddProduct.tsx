import React, { useEffect, useState } from 'react';
import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonSelect, IonSelectOption } from '@ionic/react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { getBands, Band } from '../../../../../api/bandAPI';
import { createProduct } from '../../../../../api/productAPI';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  description: yup.string().required('Description is required'),
  numberOfStock: yup.number().positive('Must be positive').required('Stock is required'),
  genre: yup.string().required('Genre is required'),
  bandId: yup.string().required('Band is required'),
});
type FormData={
  name:string;
  description:string;
  numberOfStock:number;
  genre:string;
  bandId:string;
}
export const AddProductForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const [bands, setBands] = useState<Band[]>([]);  // State to hold bands

  useEffect(() => {
    const fetchBands = async () => {
      const result = await getBands();
      setBands(result.records || []);
    };
    fetchBands();
  }, []);

  const onSubmit = (data: FormData) => {
    console.log(data);  // Handle form submission logic
    //calling the API to add a product
    createProduct(data).then((response)=>{
      console.log(response);
    }).catch((error)=>{
      console.log(error);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <IonItem>
        <IonLabel position="floating">Name</IonLabel>
        <IonInput {...register('name')} />
        {errors.name && <p>{errors.name.message}</p>}
      </IonItem>

      <IonItem>
        <IonLabel position="floating">Description</IonLabel>
        <IonInput {...register('description')} />
        {errors.description && <p>{errors.description.message}</p>}
      </IonItem>

      <IonItem>
        <IonLabel position="floating">Stock</IonLabel>
        <IonInput type="number" {...register('numberOfStock')} />
        {errors.numberOfStock && <p>{errors.numberOfStock.message}</p>}
      </IonItem>

      <IonItem>
        <IonLabel position="floating">Genre</IonLabel>
        <IonInput {...register('genre')} />
        {errors.genre && <p>{errors.genre.message}</p>}
      </IonItem>

      <IonItem>
        <IonLabel position="floating">Band</IonLabel>
        <IonSelect {...register('bandId')}>
          {bands.map(band => (
            <IonSelectOption key={band.id} value={band.id}>
              {band.name}
            </IonSelectOption>
          ))}
        </IonSelect>
        {errors.bandId && <p>{errors.bandId.message}</p>}
      </IonItem>

      <IonButton type="submit" expand="block" style={{ marginTop: '20px' }}>Add Product</IonButton>
    </form>
  );
};
