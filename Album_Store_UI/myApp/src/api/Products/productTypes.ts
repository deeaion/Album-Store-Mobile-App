// src/api/productTypes.ts

// Type for product details in the listing (simpler structure)
export type ProductListItem = {
  id: string;
  name: string;
  price: number;
  bandName: string;
  artistsNames: string;
  Image: string;
  isFavorited: boolean;
};
export type ProductVersion = {
  id: string;
  version: string;
  description: string;
  imageUrl: string;
  price: number;
  productId: string;
};
// Type for the full product details (more complex structure)
export type ProductDetail = {
  id: string;
  name: string;
  description?: string;
  price: number;
  genre?: string;
  numberOfSales?: number;
  numberOfStock?: number;
  baseImageUrl?: string;
  detailsImageUrl?: string;
  bandId?: string;
  productVersions?: ProductVersion[];
  artistIds?: string[];
  artists?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  bandName?: string;
  isFavorited?: boolean;
};

// Response structure for getting all products
export type GetAllProductsProduct = {
  records: ProductListItem[];
  totalNumberOfRecords: number;
};
export type GetAllProductsFilter = Partial<{
  Skip: number;
  Take: number;
  SortBy: string;
  SortOrder: string;
  Search: string;
  ArtistName: string;
  Genre: string;
  ArtistId: string;
  BandName: string;
}>;
