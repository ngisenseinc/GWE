// Lightweight API client for core data endpoints (Products, Customers, Suppliers, Employees, Orders, etc.)
// This provides a single path to fetch data from the backend API, with optional auth via JWT stored in localStorage.

type Cleaner<T> = T;

const getToken = (): string | null => {
  try {
    return typeof window !== 'undefined' ? (localStorage.getItem('token') || null) : null;
  } catch {
    return null;
  }
};

const fetchWithAuth = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken();
  const headers: any = { ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    throw new Error(`API request failed: ${res.status}`);
  }
  return (await res.json()) as T;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  emoji?: string;
  image?: string;
  price: number;
  cost?: number;
  stock?: number;
  compat?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

export const getProducts = async (): Promise<Product[]> => {
  return fetchWithAuth<Product[]>('/api/products');
};

export const getCustomers = async (): Promise<any[]> => {
  return fetchWithAuth<any[]>('/api/customers');
};

export const getSuppliers = async (): Promise<any[]> => {
  return fetchWithAuth<any[]>('/api/suppliers');
};

export const getEmployees = async (): Promise<any[]> => {
  return fetchWithAuth<any[]>('/api/employees');
};

export const getOrders = async (): Promise<any> => {
  return fetchWithAuth<any>('/api/orders');
};
