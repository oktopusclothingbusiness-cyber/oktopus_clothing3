import express from 'express';
import cors from 'cors';
import {
  helmetMiddleware,
  globalMobileRateLimiter,
  mongoSanitizeMiddleware,
  validateMobileHeaders,
} from './middleware/mobileSecurity.js';
import mobileRoutes from './routes/mobile.js';

const app = express();

// Enable CORS for mobile client headers
app.use(
  cors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization', 'x-app-signature', 'x-platform', 'x-app-secret'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Security Headers (Helmet) & NoSQL Injection Protection
app.use(helmetMiddleware);
app.use(mongoSanitizeMiddleware);

// Mobile API Namespace & Middlewares
app.use('/api/v1/mobile', globalMobileRateLimiter, validateMobileHeaders, mobileRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Oktopus Clothing Backend API', version: '1.0.0' });
});

export default app;
