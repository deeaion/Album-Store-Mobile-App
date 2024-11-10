import React from "react";
import { AuthProvider } from "./Auth//AuthProvider";
import { ProductProvider } from "./Products/ProductContext";
import { SnackbarProvider } from "./Snackbar/SnacbarContext";
import {
  OnlineStatusContext,
  OnlineStatusProvider,
} from "./Status/OnlineStatusContext";
import { BandProvider } from "./Band/BandContext";
import { OrderProvider } from "./Order/OrderContext";
import { BasketContext, BasketProvider } from "./Basket/BasketContext";
import { CollectionProvider } from "./CollectionItem/CollectionContext";

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <OnlineStatusProvider>
      <SnackbarProvider>
        <AuthProvider>
          <ProductProvider>
            <BandProvider>
              <OrderProvider>
                <BasketProvider>
                  <CollectionProvider>{children}</CollectionProvider>
                </BasketProvider>
              </OrderProvider>
            </BandProvider>
          </ProductProvider>
        </AuthProvider>
      </SnackbarProvider>
      //{" "}
    </OnlineStatusProvider>
  );
};
