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
