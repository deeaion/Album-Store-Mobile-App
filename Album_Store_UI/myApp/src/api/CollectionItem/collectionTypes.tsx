export type CollectionImage = {
  imageBase64: string;
  contentType: string;
  fileName: string;
};

export type CollectionItem = {
  id?: string;
  productId?: string;
  imageId?: string;
  title: string;
  artist: string;
  image: CollectionImage;
};

export type GetAllCollectionsResponse = {
  records: CollectionItem[];
  totalNumberOfRecords: number;
};

export type GetCollectionByIdResponse = CollectionItem;

export type CreateCollectionRequest = {
  collectionItem: CollectionItem;
};

export type ApiResponse = {
  errors?: {
    [key: string]: string[];
  };
  isValid: boolean;
};
