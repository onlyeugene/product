import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from 'react';

export const MAX_PRODUCTS = 5;

export interface Product {
  id: string;
  name: string;
  price: string;
  photoUri: string | null;
  createdAt: number;
}

interface ProductState {
  products: Product[];
  limitReached: boolean;
  lastNotifiedAt: number | null;
}

type ProductAction =
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'REMOVE_PRODUCT'; payload: string }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'MARK_NOTIFIED' };

interface ProductContextType {
  state: ProductState;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => boolean;
  removeProduct: (id: string) => void;
  updateProduct: (product: Product) => void;
  markNotified: () => void;
  canAddMore: boolean;
}

const initialState: ProductState = {
  products: [],
  limitReached: false,
  lastNotifiedAt: null,
};

function productReducer(state: ProductState, action: ProductAction): ProductState {
  switch (action.type) {
    case 'ADD_PRODUCT': {
      const updated = [...state.products, action.payload];
      return {
        ...state,
        products: updated,
        limitReached: updated.length >= MAX_PRODUCTS,
      };
    }
    case 'REMOVE_PRODUCT': {
      const updated = state.products.filter((p) => p.id !== action.payload);
      return {
        ...state,
        products: updated,
        limitReached: updated.length >= MAX_PRODUCTS,
      };
    }
    case 'UPDATE_PRODUCT': {
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    }
    case 'MARK_NOTIFIED': {
      return { ...state, lastNotifiedAt: Date.now() };
    }
    default:
      return state;
  }
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(productReducer, initialState);

  const addProduct = useCallback(
    (product: Omit<Product, 'id' | 'createdAt'>): boolean => {
      if (state.products.length >= MAX_PRODUCTS) return false;
      dispatch({
        type: 'ADD_PRODUCT',
        payload: {
          ...product,
          id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          createdAt: Date.now(),
        },
      });
      return true;
    },
    [state.products.length]
  );

  const removeProduct = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_PRODUCT', payload: id });
  }, []);

  const updateProduct = useCallback((product: Product) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: product });
  }, []);

  const markNotified = useCallback(() => {
    dispatch({ type: 'MARK_NOTIFIED' });
  }, []);

  return (
    <ProductContext.Provider
      value={{
        state,
        addProduct,
        removeProduct,
        updateProduct,
        markNotified,
        canAddMore: state.products.length < MAX_PRODUCTS,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProducts must be used within ProductProvider');
  return ctx;
}
