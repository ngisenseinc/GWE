<div align="center">
<img width="1200" height="475" alt="GWE Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# God's Way Enterprise (GWE)

A full-stack business management dashboard and POS system built with React, TypeScript, Express, and Supabase.

## Features

- **Dashboard** — Analytics, revenue tracking, stock alerts
- **Point of Sale (POS)** — Complete sales flow with receipt generation
- **Inventory Management** — Products, categories, stock levels
- **Customer Management** — CRM with purchase history
- **Supplier Management** — Vendor tracking
- **Employee Management** — Role-based access control (Owner/Employee)
- **Orders** — Sales and purchase orders with status tracking
- **Reports** — Business analytics and charts

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Recharts
- **Backend:** Express, TypeScript, JWT Auth
- **Database:** Supabase (PostgreSQL)
- **Images:** Cloudinary (signed uploads)
- **State:** Zustand
- **Deployment:** Vercel

## Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Run in development:**
   ```bash
   npm run dev
   ```

## Production & Deployment

### Build locally:
```bash
npm run build
npm run start
```

### Deploy to Vercel:

#### Prerequisites
- Node.js 18+
- Supabase project
- Cloudinary account

#### Environment Variables
Set these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `JWT_SECRET` | Secret for JWT signing | ✅ |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | ✅ |
| `JWT_EXPIRES_IN` | Token expiry (default: 15m) | ⏺️ |
| `JWT_REFRESH_EXPIRES_IN` | Refresh expiry (default: 7d) | ⏺️ |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ✅ |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key (server-only) | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret (server-only) | ✅ |

#### Database Setup
1. Go to Supabase SQL Editor
2. Run the schema from `supabase_schema.sql`
3. Create an owner user manually or via the register endpoint

#### Deploy Steps
1. Push code to GitHub
2. Import repo in Vercel
3. Set environment variables above
4. Deploy!

#### Verification
- Health check: `https://your-domain/api/health`
- Auth test: Register at `/api/auth/register`
- Login: `/api/auth/login`

## API Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/health` | GET | Health check | No |
| `/api/auth/register` | POST | Register new user | No |
| `/api/auth/login` | POST | Login user | No |
| `/api/auth/refresh` | POST | Refresh token | No |
| `/api/auth/me` | GET | Get current user | ✅ |
| `/api/products` | GET | List products | No |
| `/api/customers` | GET | List customers | No |
| `/api/suppliers` | GET | List suppliers | No |
| `/api/orders` | GET | List orders | No |
| `/api/storage/sign-upload` | POST | Get Cloudinary signature | ✅ |

## Security

- JWT-based authentication with access + refresh tokens
- Password hashing with bcrypt
- Rate limiting on auth endpoints
- Helmet.js for security headers
- Cloudinary signed uploads (no client-side secrets)
- Role-based access control (Owner vs Employee)

## License

Private — God's Way Enterprise
