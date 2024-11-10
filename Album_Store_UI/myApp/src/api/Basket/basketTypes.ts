export type BasketItem = {
  id: string;
  quantity: number;
  productId: string;
  userBasketId: string;
  title: string;
  band: string;
  price: number;
  imagePath: string;
};

export type Basket = {
  basketId: string;
  items: BasketItem[];
};

export type CreateBasketItemRequest = {
  productBasket: BasketItem;
};

export type UpdateBasketItemRequest = {
  id: string;
  quantity: number;
};

export type ApiResponse = {
  errors?: {
    [key: string]: string[];
  };
  isValid: boolean;
};
