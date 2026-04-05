<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/0de6f038-870d-410b-88ed-30cac9d5e160

## Development

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` and `APP_URL` in your environment (or `.env` file).
3. Run the app in development:
   `npm run dev`

## Production & Deployment

1. Build the frontend:
   `npm run build`
2. Start the production server:
   `npm run start`

The server is hardened with `helmet` for security and `compression` for performance. It serves the static `dist` folder on the configured `PORT` (default 3000).
Deployment and Verification
- Prereqs: Node.js 18+, Supabase project, Cloudinary account, and a Vercel project ready to deploy.
- Required environment variables (example names):
  - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or ANON_KEY)
  - JWT_SECRET, JWT_REFRESH_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN
  - VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_UPLOAD_PRESET
  - VITE_CLOUDINARY_TARGET_FOLDER (optional; defaults to ce861f422e0915cd14c0225345d0b8b4ce)
  - CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET (server-side; not exposed to frontend)
  - VERCEL_BASE_URL or API_BASE_URL (for CI smoke tests)
- Steps to deploy and verify:
  1) Apply the updated Supabase schema (supabase_schema.sql) to your database.
  2) Configure Cloudinary credentials server-side and in your CI/hosting environment:
     - Cloudinary keys (server-side) must be kept secret. Frontend uses signed-signature flow via /api/storage/sign-upload.
  3) Deploy to Vercel:
     - Ensure the above env vars are set in Vercel's project settings.
     - The backend is served as a serverless function at /api (via api/server.ts).
  4) Validate basic health and auth flows:
     - Access http(s)://<vercel-domain>/api/health
     - Use /api/auth/register and /api/auth/login to obtain tokens
     - Access /api/auth/me with a Bearer token
  5) Run smoke tests (CI will run once you set API_BASE_URL in GitHub Secrets):
     - PRs will trigger smoke-test workflows using tests/smoke.js and tests/smoke-health.js.

Notes:
- This MVP uses Cloudinary signed uploads; no Cloudinary credentials are exposed to the browser.
- The frontend uploads avatars via /api/storage/sign-upload and Cloudinary, and stores the resulting URL in avatar_url.
- If you want to add more tests, we can extend the smoke suite in tests/.
