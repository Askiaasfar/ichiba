import serverless from 'serverless-http';
import { app } from '../../server';

// Netlify Functions handler routing requests to Express
export const handler = serverless(app);
