import { create } from 'zustand';
import { addProductToDb, updateProductInDb, addOrderToDb, updateOrderInDb, deleteProductFromDb } from '../services/firebaseService';

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
  user: any | null;
  setProducts: (products: Product[]) => void;
  setSalesOrders: (orders: SalesOrder[]) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (id: string | number) => void;
  updateCartQty: (id: string | number, delta: number) => void;
  clearCart: () => void;
  setUser: (user: any | null) => void;
  updateProductStock: (id: string | number, newStock: number) => void;
  updateProductImage: (id: string | number, image: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string | number) => void;
  addSalesOrder: (order: SalesOrder) => void;
  updateSalesOrderStatus: (id: string, status: SalesOrder['status']) => void;
  updateSalesOrderReturns: (id: string, returnedItems: Record<string | number, number>, status: SalesOrder['status']) => void;
}

const INITIAL_PRODUCTS: Product[] = [
  {id:1,sku:'GWE-RAD-001',name:'Toyota Corolla Radiator',category:'Radiators',emoji:'🌡️',image:'https://images.unsplash.com/photo-1486262715623-67db8c8bc165?q=80&w=400&auto=format&fit=crop',price:850,cost:520,stock:12,compat:'Toyota Corolla 2008-2018',status:'in'},
  {id:2,sku:'GWE-HDL-012',name:'Honda Civic Headlight Assembly (Pair)',category:'Lighting',emoji:'💡',image:'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=400&auto=format&fit=crop',price:620,cost:380,stock:8,compat:'Honda Civic 2012-2016',status:'in'},
  {id:3,sku:'GWE-ACP-034',name:'AC Compressor — Toyota Camry',category:'AC Parts',emoji:'❄️',image:'https://images.unsplash.com/photo-1600661653561-629509216228?q=80&w=400&auto=format&fit=crop',price:1200,cost:780,stock:3,compat:'Toyota Camry 2010-2017',status:'low'},
  {id:4,sku:'GWE-FAN-022',name:'Radiator Cooling Fan Assembly',category:'Fans',emoji:'🌀',image:'https://images.unsplash.com/photo-1530053969600-caed2596d242?q=80&w=400&auto=format&fit=crop',price:480,cost:290,stock:15,compat:'Universal Fit — Check Model',status:'in'},
  {id:5,sku:'GWE-BMP-008',name:'Front Bumper — Nissan Sentra',category:'Body Parts',emoji:'🚗',image:'https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=400&auto=format&fit=crop',price:750,cost:420,stock:0,compat:'Nissan Sentra 2013-2019',status:'out'},
  {id:6,sku:'GWE-RSP-041',name:'Radiator Support Frame — Honda Accord',category:'Supports',emoji:'🔩',image:'https://images.unsplash.com/photo-1504215680853-026ed2a45def?q=80&w=400&auto=format&fit=crop',price:920,cost:560,stock:6,compat:'Honda Accord 2008-2015',status:'in'},
  {id:7,sku:'GWE-TLL-019',name:'Tail Light Assembly — Toyota Camry',category:'Lighting',emoji:'💡',image:'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?q=80&w=400&auto=format&fit=crop',price:410,cost:240,stock:10,compat:'Toyota Camry 2012-2017',status:'in'},
  {id:8,sku:'GWE-ACV-055',name:'AC Evaporator Core — Hyundai Elantra',category:'AC Parts',emoji:'❄️',image:'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=400&auto=format&fit=crop',price:680,cost:400,stock:4,compat:'Hyundai Elantra 2011-2016',status:'low'},
  {id:9,sku:'GWE-RBR-003',name:'Front Reinforcement Bar — Toyota',category:'Reinforcement',emoji:'🛡️',image:'https://images.unsplash.com/photo-1503376713208-b49d10e51d21?q=80&w=400&auto=format&fit=crop',price:390,cost:220,stock:9,compat:'Toyota Corolla / Yaris 2010-2020',status:'in'},
  {id:10,sku:'GWE-FND-044',name:'Front Fender — Honda CR-V',category:'Body Parts',emoji:'🚗',image:'https://images.unsplash.com/photo-1553440569-bfc1015e5c56?q=80&w=400&auto=format&fit=crop',price:560,cost:330,stock:7,compat:'Honda CR-V 2012-2017',status:'in'},
  {id:11,sku:'GWE-RAD-018',name:'Aluminum Radiator — Suzuki Swift',category:'Radiators',emoji:'🌡️',image:'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=400&auto=format&fit=crop',price:720,cost:440,stock:2,compat:'Suzuki Swift 2005-2016',status:'low'},
  {id:12,sku:'GWE-ACF-061',name:'Blower Motor Fan — Kia Cerato',category:'AC Parts',emoji:'❄️',image:'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=400&auto=format&fit=crop',price:320,cost:180,stock:11,compat:'Kia Cerato 2013-2020',status:'in'},
];

const INITIAL_SALES_ORDERS: SalesOrder[] = [
  {id:'GWE-2026-0341',customer:'Kwesi Agyemang',items:[{...INITIAL_PRODUCTS[0], qty: 2}, {...INITIAL_PRODUCTS[1], qty: 1}],total:2320,payment:'MTN MoMo',status:'paid',time:'Today 2:34pm'},
  {id:'GWE-2026-0340',customer:'Walk-In Customer',items:[{...INITIAL_PRODUCTS[3], qty: 1}],total:480,payment:'Cash',status:'paid',time:'Today 1:15pm'},
  {id:'GWE-2026-0339',customer:'Ama Osei',items:[{...INITIAL_PRODUCTS[6], qty: 4}],total:1640,payment:'Card',status:'paid',time:'Today 11:02am'},
  {id:'GWE-2026-0338',customer:'Mechanics Workshop #4',items:[{...INITIAL_PRODUCTS[2], qty: 2}, {...INITIAL_PRODUCTS[5], qty: 5}],total:7000,payment:'Credit',status:'pending',time:'Today 9:45am'},
  {id:'GWE-2026-0337',customer:'Yaw Boateng',items:[{...INITIAL_PRODUCTS[1], qty: 1}],total:620,payment:'MTN MoMo',status:'refund',time:'Yesterday 4:20pm'},
];

export const useStore = create<AppState>((set) => ({
  products: INITIAL_PRODUCTS,
  cart: [],
  salesOrders: INITIAL_SALES_ORDERS,
  user: null,
  setProducts: (products) => set({ products }),
  setSalesOrders: (orders) => set({ salesOrders: orders }),
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
