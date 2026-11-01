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
  'https://ais-dev-lhxqmcs4pkbt7hegjjbrdg-519153662077.europe-west2.run.app'
).replace(/\/$/, '');

console.log(`[Netlify Build Prep] Configuring API proxy target: ${backendUrl}`);

const redirectsContent = `# Netlify API Proxy Route (Routes /api/* to production backend server with streaming support)
/api/*  ${backendUrl}/api/:splat  200!

# SPA Client-Side Routing Fallback
/*      /index.html               200
`;

fs.writeFileSync(redirectsFile, redirectsContent, 'utf8');
console.log(`[Netlify Build Prep] Successfully generated public/_redirects pointing /api/* -> ${backendUrl}/api/:splat`);
