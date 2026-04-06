import { supabase } from '../lib/supabase';
import { Product, SalesOrder } from '../store/useStore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleSupabaseError(error: any, operationType: OperationType, path: string | null) {
  console.error(`Supabase Error (${operationType} on ${path}):`, error.message || error);
}

// Products
export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      handleSupabaseError(error, OperationType.LIST, 'products');
    } else if (data) {
      callback(data as any);
    }
  };

  fetchProducts();

  const channel = supabase
    .channel('products_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchProducts)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const addProductToDb = async (product: Omit<Product, 'id'>) => {
  const { data, error } = await supabase
    .from('products')
    .insert([{ ...product }])
    .select();

  if (error) {
    handleSupabaseError(error, OperationType.CREATE, 'products');
    return null;
  }
  return data?.[0]?.id;
};

export const updateProductInDb = async (id: string | number, data: Partial<Product>) => {
  const { error } = await supabase
    .from('products')
    .update(data)
    .eq('id', id);

  if (error) {
    handleSupabaseError(error, OperationType.UPDATE, `products/${id}`);
  }
};

export const deleteProductFromDb = async (id: string | number) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    handleSupabaseError(error, OperationType.DELETE, `products/${id}`);
  }
};

// Orders
export const subscribeToOrders = (callback: (orders: SalesOrder[]) => void) => {
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('sales_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      handleSupabaseError(error, OperationType.LIST, 'sales_orders');
    } else if (data) {
      const parsedOrders = data.map(o => ({
        ...o,
        id: o.id,
        customer: o.customer_name,
        items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
        returnedItems: o.returned_items || (typeof o.returned_items === 'string' ? JSON.parse(o.returned_items) : {}),
        total: o.total,
        payment: o.payment_method || '',
        status: o.status as any,
        time: o.created_at,
      }));
      callback(parsedOrders as any);
    }
  };

  fetchOrders();

  const channel = supabase
    .channel('orders_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'sales_orders' }, fetchOrders)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const addOrderToDb = async (order: SalesOrder) => {
  const { error } = await supabase
    .from('sales_orders')
    .insert([{
      customer_name: order.customer,
      items: JSON.stringify(order.items),
      total: order.total,
      status: order.status,
      payment_method: order.payment,
      returned_items: JSON.stringify(order.returnedItems || {}),
    }]);

  if (error) {
    handleSupabaseError(error, OperationType.CREATE, 'orders');
  }
};

export const updateOrderInDb = async (id: string, data: Partial<SalesOrder>) => {
  const updatePayload: any = {};
  if (data.status) updatePayload.status = data.status;
  if (data.returnedItems) updatePayload.returned_items = JSON.stringify(data.returnedItems);

  const { error } = await supabase
    .from('sales_orders')
    .update(updatePayload)
    .eq('id', id);

  if (error) {
    handleSupabaseError(error, OperationType.UPDATE, `orders/${id}`);
  }
};

// Purchase Orders
export const subscribeToPurchaseOrders = (callback: (pos: any[]) => void) => {
  const fetchPOs = async () => {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) handleSupabaseError(error, OperationType.LIST, 'purchase_orders');
    else callback(data || []);
  };
  fetchPOs();
  const channel = supabase.channel('po_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'purchase_orders' }, fetchPOs).subscribe();
  return () => { supabase.removeChannel(channel); };
};

// Suppliers
export const subscribeToSuppliers = (callback: (suppliers: any[]) => void) => {
  const fetchSuppliers = async () => {
    const { data, error } = await supabase.from('suppliers').select('*').order('name', { ascending: true });
    if (error) handleSupabaseError(error, OperationType.LIST, 'suppliers');
    else callback(data || []);
  };
  fetchSuppliers();
  const channel = supabase.channel('supplier_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'suppliers' }, fetchSuppliers).subscribe();
  return () => { supabase.removeChannel(channel); };
};

// Customers
export const subscribeToCustomers = (callback: (customers: any[]) => void) => {
  const fetchCustomers = async () => {
    const { data, error } = await supabase.from('customers').select('*').order('name', { ascending: true });
    if (error) handleSupabaseError(error, OperationType.LIST, 'customers');
    else callback(data || []);
  };
  fetchCustomers();
  const channel = supabase.channel('customer_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, fetchCustomers).subscribe();
  return () => { supabase.removeChannel(channel); };
}
