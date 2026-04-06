import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../server.js';

// Try to use serverless-http when available; otherwise fall back to a direct handler.
let handler: any;
try {
  // Lazy require to avoid build errors when dependency isn't installed yet
  // @ts-ignore
  const sl = await import('serverless-http');
  handler = sl.default(app);
} catch {
  // Fallback: pass-through to the Express app
  handler = (req: any, res: any) => {
    return app(req, res);
  };
}

export default async function(req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}