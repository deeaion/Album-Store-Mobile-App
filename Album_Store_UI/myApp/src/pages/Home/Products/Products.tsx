import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef,
} from "react";
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
  IonSelect,
  IonSelectOption,
  createAnimation,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { add, heart, heartOutline } from "ionicons/icons";
import { Header } from "../../../components/Header";
import { ProductContext } from "../../../api/Products/ProductContext";
import { AddProductForm } from "./Modals/AddProductForm";
import { ProductListItem } from "../../../api/Products/productTypes";
import { getCurrentUser, User } from "../../../api/Auth/authAPI";
import { Band, getBands } from "../../../api/Band/bandAPI";
import "../Home.css";
export const Products: React.FC = () => {
  const {
    products,
    fetching,
    fetchingError,
    setFilter,
    totalNumberOfRecords,
    toggleFavorite,
  } = useContext(ProductContext);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [bandFilter, setBandFilter] = useState<string | undefined>(undefined);
  const take = 10;
  const history = useHistory();
  const [alert] = useIonAlert();
  const [bands, setBands] = useState<Band[]>([]);
  const canAddProduct = currentUser?.roles.includes("Admin");
  const [filteredProducts, setFilteredProducts] = useState<ProductListItem[]>(
    []
  );
  const iconRefs = useRef(new Map<string, HTMLIonIconElement>());

  useEffect(() => {
    const fetchBands = async () => {
      const result = await getBands();
      setBands(result.records || []);
    };
    fetchBands();
  }, []);

  useEffect(() => {
    getCurrentUser().then((user) => setCurrentUser(user));
  }, []);

  useEffect(() => {
    if (setFilter) {
      setFilter({ Skip: skip, Take: take, Search: search });
    }
  }, [setFilter, skip, take, search]);

  useEffect(() => {
    if (products) {
      const filtered = bandFilter
        ? products.filter((product) => product.bandName === bandFilter)
        : products;
      setFilteredProducts(filtered);
      setHasMore(filtered.length < (totalNumberOfRecords ?? 0));
    }
  }, [products, bandFilter, totalNumberOfRecords]);

  const loadMoreItems = useCallback(
    (event: CustomEvent<void>) => {
      if (hasMore) {
        setSkip((prevSkip) => prevSkip + take);
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
        header: "Access Denied",
        message: "Only admins can add new products.",
        buttons: ["OK"],
      });
    }
  }, [canAddProduct, alert]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFavoriteToggle = (product: ProductListItem) => {
    if (toggleFavorite) {
      toggleFavorite(product.id, product.isFavorited ?? false);
      if (iconRefs.current.has(product.id)) {
        animateHeart(iconRefs.current.get(product.id)!); // Trigger animation
      }
    }
  };

  const animateHeart = (icon: HTMLIonIconElement) => {
    const animation = createAnimation()
      .addElement(icon)
      .duration(300)
      .keyframes([
        { offset: 0, transform: "scale(1)", color: "gray" },
        { offset: 0.5, transform: "scale(1.3)", color: "red" },
        { offset: 1, transform: "scale(1)", color: "red" },
      ]);
    animation.play();
  };

  const handleSearchChange = useCallback((e: CustomEvent) => {
    const newSearch = e.detail.value!;
    setSearch(newSearch);
    setSkip(0);
  }, []);

  const handleBandSelectedChange = useCallback((e: CustomEvent) => {
    const selectedBand = e.detail.value;
    setBandFilter(selectedBand || undefined);
    setSkip(0);
  }, []);

  return (
    <IonContent>
      <Header />
      <IonSearchbar
        value={search}
        onIonChange={handleSearchChange}
        placeholder="Search products..."
      />
      <IonSelect
        placeholder="Select Band"
        onIonChange={handleBandSelectedChange}
        value={bandFilter}
        style={{ padding: 0, width: "80%", height: "40px", margin: "0px" }}
      >
        <IonSelectOption value={""}>None</IonSelectOption>
        {bands.map((band) => (
          <IonSelectOption key={band.id} value={band.name}>
            {band.name}
          </IonSelectOption>
        ))}
      </IonSelect>

      {fetching && skip === 0 ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <IonSpinner name="crescent" />
          <p>Loading products...</p>
        </div>
      ) : fetchingError ? (
        <p style={{ textAlign: "center", color: "red" }}>
          Failed to load products.{" "}
          {fetchingError.message || "Please try again later."}
        </p>
      ) : (
        <IonGrid>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <IonRow
                key={product.id}
                onClick={() => handleProductClick(product.id)}
              >
                <IonCol size="12">
                  <IonItem button>
                    <img
                      src={`/${
                        product.Image || "products/Image-Not-Found.jpg"
                      }`}
                      alt={product.name}
                      style={{
                        width: "100px",
                        height: "100px",
                        marginRight: "10px",
                      }}
                    />
                    <IonLabel>
                      <h2>{product.name}</h2>
                      <p>Price: ${product.price}</p>
                    </IonLabel>
                    <IonIcon
                      ref={(el) => el && iconRefs.current.set(product.id, el)}
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
            <p style={{ textAlign: "center" }}>No products available.</p>
          )}
        </IonGrid>
      )}

      <IonInfiniteScroll
        onIonInfinite={loadMoreItems}
        threshold="100px"
        disabled={!hasMore || fetching}
      >
        <IonInfiniteScrollContent
          loadingSpinner="crescent"
          loadingText="Loading more products..."
        ></IonInfiniteScrollContent>
      </IonInfiniteScroll>

      {canAddProduct && (
        <IonFab
          vertical="bottom"
          horizontal="end"
          slot="fixed"
          style={{ "--margin-bottom": "20px" }}
        >
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
        <IonContent className="ion-padding">
          <AddProductForm setIsModalOpen={setIsModalOpen} />
        </IonContent>
      </IonModal>
    </IonContent>
  );
};

export default Products;
