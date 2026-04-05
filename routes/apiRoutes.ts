import { Express } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';

// Product type definition for API routes
type Product = {
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

export default function registerRoutes(app: Express, supabase: SupabaseClient) {
  // Orders API: fetch sales and purchase orders from Supabase
  app.get('/api/orders', async (req: any, res: any) => {
    try {
      const { data: sales, error: salesError } = await (supabase as any)
        .from('sales_orders')
        .select('*')
        .order('created_at', { ascending: false });
      const { data: purchases, error: purchaseError } = await (supabase as any)
        .from('purchase_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (salesError || purchaseError) {
        console.error('Orders fetch error', salesError, purchaseError);
        return res.status(500).json({ error: 'Failed to fetch orders' });
      }

      const mapSales = (s: any) => ({
        id: s.id,
        customer: s.customer_name,
        items: Array.isArray(s.items) ? s.items : (typeof s.items === 'string' ? JSON.parse(s.items) : []),
        returnedItems: s.returned_items || {},
        total: s.total,
        payment: s.payment_method || '',
        status: s.status,
        time: s.created_at,
      });

      const mappedSales = (sales || []).map(mapSales);
      const mappedPurchases = (purchases || []).map((p: any) => ({
        id: p.id,
        customer: p.supplier_name,
        items: Array.isArray(p.items) ? p.items : (typeof p.items === 'string' ? JSON.parse(p.items) : []),
        total: p.total,
        status: p.status,
        time: p.created_at,
      }));

      res.json({ sales: mappedSales, purchases: mappedPurchases });
    } catch (err) {
      console.error('Orders endpoint error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Customers API: fetch all customers
  app.get('/api/customers', async (req: any, res: any) => {
    try {
      const { data, error } = await (supabase as any).from('customers').select('*').order('name', { ascending: true });
      if (error) return res.status(500).json({ error: 'Failed to fetch customers' });
      res.json(data || []);
    } catch (err) {
      console.error('Customers fetch error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Suppliers API: fetch all suppliers
  app.get('/api/suppliers', async (req: any, res: any) => {
    try {
      const { data, error } = await (supabase as any).from('suppliers').select('*').order('name', { ascending: true });
      if (error) return res.status(500).json({ error: 'Failed to fetch suppliers' });
      res.json(data || []);
    } catch (err) {
      console.error('Suppliers fetch error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Employees API: fetch all employees
  app.get('/api/employees', async (req: any, res: any) => {
    try {
      const { data, error } = await (supabase as any).from('users').select('id, email, display_name, role, phone, avatar_url').eq('role', 'employee').order('display_name', { ascending: true });
      if (error) return res.status(500).json({ error: 'Failed to fetch employees' });
      res.json(data || []);
    } catch (err) {
      console.error('Employees fetch error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}
