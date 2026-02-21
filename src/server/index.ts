import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Import Vercel API handlers
import loginHandler from '../../api/login.js';
import proxyHandler from '../../api/proxy.js'; // We can use the programmatic proxy or http-proxy-middleware for local 
import jceHandler from '../../api/jce.js';
import specialtiesHandler from '../../api/specialties.js';
import otpGenerateHandler from '../../api/otp/generate.js';
import otpValidateHandler from '../../api/otp/validate.js';
import teamRolesHandler from '../../api/team-roles.js';
import medicalCentersHandler from '../../api/medical-centers.js';
import healthInsurancesHandler from '../../api/health-insurances.js';
import enrollmentRequestsHandler from '../../api/enrollment-requests.js';

dotenv.config();

// Enforce UTC-4 / America/Santo_Domingo timezone for the Node process
process.env.TZ = 'America/Santo_Domingo';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fallback_key';

app.use(cors());

// Express Middleware for JWT
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        (req as any).user = payload;
        next();
    } catch (err) {
        res.status(403).json({ error: 'Invalid or expired token' });
    }
};

// --- Emulate Vercel Serverless Functions ---

// 1. Raw body for proxy if needed
// 2. Parsed JSON for normal handlers
const jsonParser = express.json({ limit: '10mb' });

app.post('/api/login', jsonParser, async (req, res) => {
    await loginHandler(req as any, res as any);
});

app.post('/api/jce', jsonParser, async (req, res) => {
    await jceHandler(req as any, res as any);
});

app.get('/api/specialties', async (req, res) => {
    await specialtiesHandler(req as any, res as any);
});

app.post('/api/otp/generate', jsonParser, async (req, res) => {
    await otpGenerateHandler(req as any, res as any);
});

app.post('/api/otp/validate', jsonParser, async (req, res) => {
    await otpValidateHandler(req as any, res as any);
});

app.get('/api/team-roles', async (req, res) => {
    await teamRolesHandler(req as any, res as any);
});

app.get('/api/medical-centers', async (req, res) => {
    await medicalCentersHandler(req as any, res as any);
});

app.get('/api/health-insurances', async (req, res) => {
    await healthInsurancesHandler(req as any, res as any);
});

app.post('/api/enrollment-requests', jsonParser, async (req, res) => {
    await enrollmentRequestsHandler(req as any, res as any);
});

// Since the Unipago proxy could be handled via the middleware directly for local dev (more efficient),
// or we can call our serverless proxy code to emulate exactly. Using http-proxy-middleware for better reliability.
app.use('/api/unipago', requireAuth, createProxyMiddleware({
    target: process.env.UNIPAGO_API_URL || 'https://api.test',
    changeOrigin: true,
    pathRewrite: { '^/api/unipago': '' },
    onProxyReq: (proxyReq) => {
        // Inject any required API keys
        if (process.env.UNIPAGO_API_KEY) {
            proxyReq.setHeader('Authorization', `Bearer ${process.env.UNIPAGO_API_KEY}`);
        }
    }
}));

// If we want to strictly use our `api/proxy.ts` instead:
app.all('/api/proxy/*', requireAuth, jsonParser, async (req, res) => {
    await proxyHandler(req as any, res as any);
});

app.listen(PORT, () => {
    console.log(`[Backend] Local Express dev server running on port ${PORT}`);
    console.log(`[Backend] Emulating Vercel functions at /api/*`);
});
