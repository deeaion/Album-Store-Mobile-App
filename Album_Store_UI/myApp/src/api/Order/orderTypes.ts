export type OrderProduct = {
  quantity: number;
  price: number;
  productId: string;
  title: string;
  band: string;
  orderId: string;
};

export type Order = {
  id: string;
  products: OrderProduct[];
  address: string;
  userEmail: string;
};

export type GetAllOrdersResponse = {
  records: Order[];
  totalNumberOfRecords: number;
};

export type CreateOrderRequest = {
  address: string;
};
