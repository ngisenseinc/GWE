import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
// Removed modular router import; consolidating routes in this file (Plan A)
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variables
const PORT = Number(process.env.PORT) || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Supabase client for database operations
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERROR: Supabase credentials are required. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// All API routes are consolidated in this file (Plan A)

// Cloudinary configuration for signed uploads
let cloudinary: any = null;
try {
  // Dynamically require cloudinary if available in runtime
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const _cloudinary = require('cloudinary');
  cloudinary = _cloudinary?.v2 ?? null;
} catch {
  cloudinary = null;
}
const CLOUDINARY_CLOUD_NAME = process.env.VITE_CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_CLOUD_NAME ?? '';
const CLOUDINARY_API_KEY = process.env.VITE_CLOUDINARY_API_KEY ?? process.env.CLOUDINARY_API_KEY ?? '';
const CLOUDINARY_API_SECRET = process.env.VITE_CLOUDINARY_API_SECRET ?? process.env.CLOUDINARY_API_SECRET ?? '';
if (cloudinary && CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  cloudinary.config({ cloud_name: CLOUDINARY_CLOUD_NAME, api_key: CLOUDINARY_API_KEY, api_secret: CLOUDINARY_API_SECRET });
} else {
  console.warn('Cloudinary is not fully configured or library not available. Ensure CLOUD_NAME, API_KEY, and API_SECRET are set in env and cloudinary is installed.');
}

// Types
interface User {
  id: string;
  email: string;
  display_name?: string;
  role: 'owner' | 'employee';
  phone?: string;
  avatar_url?: string;
  password_hash?: string;
}

interface AuthRequest extends Request {
  user?: User;
}

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  exp?: number;
}

// JWT Utilities
function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload as any, JWT_SECRET as any, { expiresIn: JWT_EXPIRES_IN } as any) as string;
}

function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload as any, JWT_REFRESH_SECRET as any, { expiresIn: JWT_REFRESH_EXPIRES_IN } as any) as string;
}

function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// Authentication Middleware
function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }

  req.user = {
    id: payload.userId,
    email: payload.email,
    role: payload.role as 'owner' | 'employee',
  } as User;

  next();
}

// Optional auth middleware (for routes that work with or without auth)
function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const payload = verifyAccessToken(token);
    if (payload) {
      req.user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role as 'owner' | 'employee',
      } as User;
    }
  }

  next();
}

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { error: 'Rate limit exceeded. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Create Express app
const app = express();
// Mount modular API routes after app is created
// (Plan A) Router consolidation: no modular router mounting here

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
    connectSrc: ["'self'", supabaseUrl, "https://api.cloudinary.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: NODE_ENV === 'production'
    ? (process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com'])
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// ==================== AUTH ROUTES ====================

// Register (JWT-based, no Firebase/Supabase Auth reliance)
app.post('/api/auth/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create a new user record in our database (JWT-based) without any Firebase/Auth linkage
    const id = randomUUID();
    const { data: userData, error: profileError } = await supabase
      .from('users')
      .insert([{
        id,
        email: email.toLowerCase(),
        display_name: name || email.split('@')[0],
        role: 'employee',
        password_hash: passwordHash,
      }])
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return res.status(500).json({ error: 'Failed to create user profile' });
    }

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: id,
      email: email.toLowerCase(),
      role: 'employee',
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token in database
    await supabase.from('refresh_tokens').insert([{
      user_id: id,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }]);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: id,
        email: email.toLowerCase(),
        display_name: name || email.split('@')[0],
        role: 'employee',
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
app.post('/api/auth/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password using stored hash only
    let isValidPassword = false;
    if (user.password_hash) {
      isValidPassword = await bcrypt.compare(password, user.password_hash);
    } else {
      // No password hash stored; cannot authenticate
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token in database
    await supabase.from('refresh_tokens').insert([{
      user_id: user.id,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }]);

    // Clean up old refresh tokens for this user
    await supabase
      .from('refresh_tokens')
      .delete()
      .lt('expires_at', new Date().toISOString());

    res.json({
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
        phone: user.phone,
        avatar_url: user.avatar_url,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh Token
app.post('/api/auth/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    // Verify refresh token in database
    const { data: tokenData, error: tokenError } = await supabase
      .from('refresh_tokens')
      .select('*')
      .eq('token', refreshToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError || !tokenData) {
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }

    // Verify JWT signature
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      await supabase.from('refresh_tokens').delete().eq('token', refreshToken);
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    // Get user data
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', payload.userId)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new tokens
    const newTokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = generateAccessToken(newTokenPayload);
    const newRefreshToken = generateRefreshToken(newTokenPayload);

    // Replace old refresh token
    await supabase.from('refresh_tokens').delete().eq('token', refreshToken);
    await supabase.from('refresh_tokens').insert([{
      user_id: user.id,
      token: newRefreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }]);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
app.post('/api/auth/logout', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const refreshToken = req.body.refreshToken;

    // Delete refresh token from database
    if (refreshToken) {
      await supabase.from('refresh_tokens').delete().eq('token', refreshToken);
    }

    // Add access token to blacklist (optional - for immediate revocation)
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const payload = verifyAccessToken(token);
      if (payload) {
        const expVal = (payload as any).exp;
        const expiresAt = typeof expVal === 'number' ? new Date(expVal * 1000).toISOString() : new Date(Date.now() + 60 * 60 * 1000).toISOString();
        await supabase.from('token_blacklist').insert([{
          token,
          expires_at: expiresAt,
        }]);
      }
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, display_name, role, phone, avatar_url, created_at')
      .eq('id', req.user!.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
app.post('/api/auth/change-password', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Get user's current password hash
    const { data: user } = await supabase
      .from('users')
      .select('password_hash, email')
      .eq('id', req.user!.id)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = user.password_hash
      ? await bcrypt.compare(currentPassword, user.password_hash)
      : false;

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password in database
    await supabase
      .from('users')
      .update({ password_hash: newPasswordHash, updated_at: new Date().toISOString() })
      .eq('id', req.user!.id);

    // No external auth provider; password updated in database only

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Password reset request (JWT-based; using internal reset tokens)
app.post('/api/auth/forgot-password', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Look up user to get user id (if exists)
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    // Create a reset token if user exists; ignore otherwise to avoid leaking info
    if (user?.id) {
      const resetToken = randomUUID();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
      await supabase.from('password_reset_tokens').insert([{
        user_id: user.id,
        token: resetToken,
        expires_at: expiresAt,
      }]);
      // In production, send reset email containing the resetToken link
    }

    res.json({ message: 'If an account exists, a reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update current user (profile edits) - MVP: update display_name and phone
app.patch('/api/users/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { display_name, phone, avatar_url } = req.body;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const updatePayload: any = { updated_at: new Date().toISOString() };
    if (display_name !== undefined) updatePayload.display_name = display_name;
    if (phone !== undefined) updatePayload.phone = phone;
    if (avatar_url !== undefined) updatePayload.avatar_url = avatar_url;
    const { data: user, error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', userId)
      .select('id, email, display_name, role, phone, avatar_url')
      .single();

    if (error || !user) {
      return res.status(400).json({ error: 'Failed to update profile' });
    }
    res.json({ id: user.id, email: user.email, display_name: user.display_name, phone: user.phone, avatar_url: user.avatar_url, role: user.role });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cloudinary signed-upload signature endpoint (server signs uploads client-side)
app.post('/api/storage/sign-upload', (req: Request, res: Response) => {
  try {
    const { public_id, folder } = req.body;
    if (!public_id) return res.status(400).json({ error: 'public_id is required' });
    if (!cloudinary) {
      return res.status(500).json({ error: 'Cloudinary SDK not configured' });
    }
    const timestamp = Math.floor(Date.now() / 1000);
    const toSign: any = { public_id, folder, timestamp };
    const signature = cloudinary.utils.api_sign_request(toSign, CLOUDINARY_API_SECRET);
    res.json({ signature, timestamp, api_key: CLOUDINARY_API_KEY, cloud_name: CLOUDINARY_CLOUD_NAME, folder, public_id });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password using token
app.post('/api/auth/reset-password', authLimiter, async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Find the reset token
    const { data: tokenData, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError || !tokenData) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Get user and update password
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('id', tokenData.user_id)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update user password
    await supabase.from('users').update({ password_hash: newPasswordHash, updated_at: new Date().toISOString() }).eq('id', user.id);

    // Invalidate the token
    await supabase.from('password_reset_tokens').delete().eq('token', token);

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PROTECTED API ROUTES ====================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  });
});

// Orders API: fetch sales and purchase orders from Supabase
app.get('/api/orders', async (req: any, res: any) => {
  try {
    const { data: sales, error: salesError } = await supabase
      .from('sales_orders')
      .select('*')
      .order('created_at', { ascending: false });
    const { data: purchases, error: purchaseError } = await supabase
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
    const { data, error } = await supabase.from('customers').select('*').order('name', { ascending: true });
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
    const { data, error } = await supabase.from('suppliers').select('*').order('name', { ascending: true });
    if (error) return res.status(500).json({ error: 'Failed to fetch suppliers' });
    res.json(data || []);
  } catch (err) {
    console.error('Suppliers fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Employees API: fetch all employees (owners included if desired)
app.get('/api/employees', async (req: any, res: any) => {
  try {
    const { data, error } = await supabase.from('users').select('id, email, display_name, role, phone, avatar_url').order('display_name', { ascending: true }).eq('role', 'employee');
    if (error) return res.status(500).json({ error: 'Failed to fetch employees' });
    res.json(data || []);
  } catch (err) {
    console.error('Employees fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Lightweight data endpoint: Products list (MVP data flow via API)
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('API /api/products error:', error);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
    // Normalize if needed
    const normalized = (products || []).map((p: any) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category,
      emoji: p.emoji,
      image: p.image,
      price: Number(p.price),
      cost: Number(p.cost),
      stock: Number(p.stock),
      compat: p.compat,
      status: p.status,
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));
    res.json(normalized);
  } catch (err) {
    console.error('Unexpected error fetching products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected health check (requires auth)
app.get('/api/health/auth', authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({
    status: 'ok',
    user: req.user?.email,
    timestamp: new Date().toISOString(),
  });
});

// ==================== STATIC FILES & SPA ====================

// In production, serve static files
if (NODE_ENV === 'production') {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath, { index: false }));

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req: Request, res: Response) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Development - import Vite and setup middleware
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    ...(NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server only when not in serverless environment
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🛠️  God's Way Enterprise - Production Server               ║
║                                                              ║
║   Environment: ${NODE_ENV.padEnd(44)}║
║   Port:       ${PORT.toString().padEnd(44)}║
║   URL:        http://localhost:${PORT.toString().padEnd(39)}║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
  });
}

export default app;
