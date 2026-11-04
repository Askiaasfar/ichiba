import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const publicDir = path.resolve(rootDir, 'public');
const redirectsFile = path.resolve(publicDir, '_redirects');

// Determine backend URL from environment variables
const backendUrl = (
  process.env.BACKEND_URL ||
  process.env.VITE_BACKEND_URL ||
  process.env.VITE_API_URL ||
  process.env.APP_URL ||
  ''
).replace(/\/$/, '');

let redirectsContent = '';

if (backendUrl && !backendUrl.includes('ais-dev-')) {
  console.log(`[Netlify Build Prep] Configuring API proxy target to live external backend: ${backendUrl}`);
  redirectsContent = `# Netlify API Proxy Route (Routes /api/* to external production backend server)
/api/*  ${backendUrl}/api/:splat  200!

# SPA Client-Side Routing Fallback
/*      /index.html               200
`;
} else {
  console.log(`[Netlify Build Prep] No external BACKEND_URL configured. Routing /api/* to built-in Netlify serverless function (/.netlify/functions/api/:splat).`);
  redirectsContent = `# Netlify API Serverless Function Route
/api/*  /.netlify/functions/api/:splat  200

# SPA Client-Side Routing Fallback
/*      /index.html                     200
`;
}

fs.writeFileSync(redirectsFile, redirectsContent, 'utf8');
console.log(`[Netlify Build Prep] Successfully generated public/_redirects`);

