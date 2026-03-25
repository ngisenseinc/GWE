import { Product, SalesOrder } from '../store/useStore';
import { 
  listProducts, 
  listOrders, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  createOrder, 
  updateOrder 
} from '../dataconnect';
import { dataConnect } from '../firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  
  // Suppress NOT_FOUND errors for operations that haven't been deployed yet
  if (errInfo.error.includes('NOT_FOUND') || errInfo.error.includes('not found')) {
    console.warn(`DataConnect Warning: Operation for ${path} not found. Please deploy your Data Connect schema using 'firebase deploy --only dataconnect'.`);
    return;
  }

  console.error('DataConnect Error: ', JSON.stringify(errInfo));
  // We log the error but do not throw it to prevent the app from crashing
  // if the Data Connect service hasn't been deployed yet.
}

// Products
export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  let isSubscribed = true;
  let interval: ReturnType<typeof setInterval>;
  
  const fetchProducts = async () => {
    try {
      const response = await listProducts(dataConnect);
      if (isSubscribed) {
        callback(response.data.products as any);
      }
    } catch (error: any) {
      handleFirestoreError(error, OperationType.LIST, 'products');
      if (error?.message?.includes('NOT_FOUND') || String(error).includes('NOT_FOUND')) {
        clearInterval(interval);
      }
    }
  };

  fetchProducts();
  
  // Polling every 10 seconds as a fallback for real-time
  interval = setInterval(fetchProducts, 10000);

  return () => {
    isSubscribed = false;
    clearInterval(interval);
  };
};

export const addProductToDb = async (product: Omit<Product, 'id'>) => {
  try {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await createProduct(dataConnect, { 
      ...product, 
      id, 
      createdAt: now, 
      updatedAt: now 
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'products');
  }
};

export const updateProductInDb = async (id: string | number, data: Partial<Product>) => {
  try {
    const now = new Date().toISOString();
    await updateProduct(dataConnect, { 
      ...data, 
      id: String(id), 
      updatedAt: now 
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
  }
};

export const deleteProductFromDb = async (id: string | number) => {
  try {
    await deleteProduct(dataConnect, { id: String(id) });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
  }
};

// Orders
export const subscribeToOrders = (callback: (orders: SalesOrder[]) => void) => {
  let isSubscribed = true;
  let interval: ReturnType<typeof setInterval>;
  
  const fetchOrders = async () => {
    try {
      const response = await listOrders(dataConnect);
      if (isSubscribed) {
        const parsedOrders = response.data.orders.map(o => ({
          ...o,
          items: JSON.parse(o.items)
        }));
        callback(parsedOrders as any);
      }
    } catch (error: any) {
      handleFirestoreError(error, OperationType.LIST, 'orders');
      if (error?.message?.includes('NOT_FOUND') || String(error).includes('NOT_FOUND')) {
        clearInterval(interval);
      }
    }
  };

  fetchOrders();
  
  interval = setInterval(fetchOrders, 10000);

  return () => {
    isSubscribed = false;
    clearInterval(interval);
  };
};

export const addOrderToDb = async (order: SalesOrder) => {
  try {
    const now = new Date().toISOString();
    await createOrder(dataConnect, { 
      ...order, 
      items: JSON.stringify(order.items),
      createdAt: now 
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'orders');
  }
};

export const updateOrderInDb = async (id: string, data: Partial<SalesOrder>) => {
  try {
    await updateOrder(dataConnect, { 
      id, 
      status: data.status 
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${id}`);
  }
};
