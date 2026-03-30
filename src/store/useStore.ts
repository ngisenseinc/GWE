import { create } from 'zustand';
import { addProductToDb, updateProductInDb, addOrderToDb, updateOrderInDb, deleteProductFromDb } from '../services/supabaseService';

export type Product = {
  id: string | number;
  sku: string;
  name: string;
  category: string;
  emoji: string;
  image?: string;
  price: number;
  cost: number;
  stock: number;
  compat: string;
  status: 'in' | 'low' | 'out';
};

export type CartItem = Product & { qty: number };

export type SalesOrder = {
  id: string;
  customer: string;
  items: CartItem[];
  returnedItems?: Record<number, number>;
  total: number;
  payment: string;
  status: 'paid' | 'pending' | 'refund' | 'partial_refund' | 'processing' | 'shipped' | 'delivered';
  time: string;
};

interface AppState {
  products: Product[];
  cart: CartItem[];
  salesOrders: SalesOrder[];
  purchaseOrders: any[];
  suppliers: any[];
  customers: any[];
  user: any | null;
  isAuthReady: boolean;
  setProducts: (products: Product[]) => void;
  setSalesOrders: (orders: SalesOrder[]) => void;
  setPurchaseOrders: (pos: any[]) => void;
  setSuppliers: (suppliers: any[]) => void;
  setCustomers: (customers: any[]) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (id: string | number) => void;
  updateCartQty: (id: string | number, delta: number) => void;
  clearCart: () => void;
  setUser: (user: any | null) => void;
  setIsAuthReady: (ready: boolean) => void;
  updateProductStock: (id: string | number, newStock: number) => void;
  updateProductImage: (id: string | number, image: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string | number) => void;
  addSalesOrder: (order: SalesOrder) => void;
  updateSalesOrderStatus: (id: string, status: SalesOrder['status']) => void;
  updateSalesOrderReturns: (id: string, returnedItems: Record<string | number, number>, status: SalesOrder['status']) => void;
}

export const useStore = create<AppState>((set) => ({
  products: [],
  cart: [],
  salesOrders: [],
  purchaseOrders: [],
  suppliers: [],
  customers: [],
  user: null,
  isAuthReady: false,
  setProducts: (products) => set({ products }),
  setSalesOrders: (salesOrders) => set({ salesOrders }),
  setPurchaseOrders: (purchaseOrders) => set({ purchaseOrders }),
  setSuppliers: (suppliers) => set({ suppliers }),
  setCustomers: (customers) => set({ customers }),
  setIsAuthReady: (ready) => set({ isAuthReady: ready }),
  addToCart: (product) => set((state) => {
    const existing = state.cart.find((item) => item.id === product.id);
    if (existing) {
      if (existing.qty >= product.stock) return state;
      return {
        cart: state.cart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        ),
      };
    }
    if (product.stock <= 0) return state;
    return { cart: [...state.cart, { ...product, qty: 1 }] };
  }),
  removeFromCart: (id) => set((state) => ({
    cart: state.cart.filter((item) => item.id !== id),
  })),
  updateCartQty: (id, delta) => set((state) => ({
    cart: state.cart.map((item) => {
      if (item.id === id) {
        const product = state.products.find(p => p.id === id);
        const maxStock = product ? product.stock : Infinity;
        return { ...item, qty: Math.min(maxStock, Math.max(0, item.qty + delta)) };
      }
      return item;
    }).filter(item => item.qty > 0),
  })),
  clearCart: () => set({ cart: [] }),
  setUser: (user) => set({ user }),
  updateProductStock: (id, newStock) => {
    let status: 'in' | 'low' | 'out' = 'in';
    if (newStock === 0) status = 'out';
    else if (newStock <= 5) status = 'low';
    updateProductInDb(id, { stock: newStock, status });
  },
  updateProductImage: (id, image) => {
    updateProductInDb(id, { image });
  },
  addProduct: async (product) => {
    await addProductToDb(product);
  },
  deleteProduct: async (id) => {
    await deleteProductFromDb(id);
  },
  addSalesOrder: async (order) => {
    await addOrderToDb(order);
  },
  updateSalesOrderStatus: (id, status) => {
    updateOrderInDb(id, { status });
  },
  updateSalesOrderReturns: (id, returnedItems, status) => set((state) => {
    const order = state.salesOrders.find(o => o.id === id);
    if (order) {
      const newReturnedItems = { ...(order.returnedItems || {}) };
      Object.entries(returnedItems).forEach(([itemId, qty]) => {
        const idStr = String(itemId);
        newReturnedItems[idStr] = (newReturnedItems[idStr] || 0) + qty;
      });
      updateOrderInDb(id, { returnedItems: newReturnedItems, status });
    }
    return state;
  }),
}));
