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
type AddProductFormProps = {
  setIsModalOpen: (isOpen: boolean) => void;
};
export const AddProductForm = ({
  setIsModalOpen
}:AddProductFormProps) => {
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
  function closeModal() {
    setIsModalOpen(false);
  }

  const onSubmit = (data: FormData) => {
    console.log(data);  // Handle form submission logic
    //calling the API to add a product
    createProduct(data).then((response)=>{
      console.log(response);
      //close the modal
      closeModal();
    }).catch((error)=>{
      console.log(error);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <IonItem>
        <IonInput label='Name' labelPlacement='floating' {...register('name')} />
        {errors.name && <p>{errors.name.message}</p>}
      </IonItem>

      <IonItem>
        <IonInput label='Description' labelPlacement='floating' {...register('description')} />
        {errors.description && <p>{errors.description.message}</p>}
      </IonItem>

      <IonItem>
        <IonInput label='Stock' labelPlacement='floating' {...register('numberOfStock')} />
        {errors.numberOfStock && <p>{errors.numberOfStock.message}</p>}
      </IonItem>

      <IonItem>
        <IonInput label='Genre' labelPlacement='floating' {...register('genre')} />
        {errors.genre && <p>{errors.genre.message}</p>}
      </IonItem>

      <IonItem>
        <IonSelect label='Band' labelPlacement='floating' {...register('bandId')}>
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

