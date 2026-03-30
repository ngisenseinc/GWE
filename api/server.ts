import app from '../server';

// Try to use serverless-http when available; otherwise fall back to a direct handler.
let handler: any;
try {
  // Lazy require to avoid build errors when dependency isn't installed yet
  // @ts-ignore
  const sl = require('serverless-http');
  handler = sl(app);
} catch {
  // Fallback: pass-through to the Express app (may work in some environments)
  handler = (req: any, res: any) => {
    // @ts-ignore
    return app(req, res);
  };
}
export default handler;
