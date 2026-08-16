import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import crypto from 'crypto';

const MOBILE_HMAC_SECRET = process.env.MOBILE_HMAC_SECRET || 'okto_mobile_sec_2026_prod';

// 1. Helmet HTTP Security Headers Configuration
export const helmetMiddleware = helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  xFrameOptions: { action: 'deny' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// 2. Global Mobile API Rate Limiter
export const globalMobileRateLimiter = rateLimit({
  windowMs: 900000, // 15 minutes
  max: 100,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 3. Auth Routes Rate Limiter
export const authMobileRateLimiter = rateLimit({
  windowMs: 300000, // 5 minutes
  max: 5,
  message: { message: 'Too many authentication attempts. Please wait 5 minutes before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 4. Safe NoSQL Injection Sanitization Middleware
export const mongoSanitizeMiddleware = (req, res, next) => {
  try {
    if (req.body && typeof req.body === 'object') {
      mongoSanitize.sanitize(req.body, { replaceWith: '_' });
    }
    if (req.params && typeof req.params === 'object') {
      mongoSanitize.sanitize(req.params, { replaceWith: '_' });
    }
  } catch (err) {
    console.error('Mongo Sanitize Warning:', err.message);
  }
  next();
};

// 5. Request Validation Middleware: x-platform and x-app-signature
export function validateMobileHeaders(req, res, next) {
  const platform = req.headers['x-platform'];
  const appSignature = req.headers['x-app-signature'];

  // Validate x-platform
  if (!platform || !['android', 'ios'].includes(platform.toString().toLowerCase())) {
    return res.status(400).json({
      message: 'Invalid or missing x-platform header. Allowed values: android, ios.',
    });
  }

  // Validate x-app-signature presence
  if (!appSignature) {
    return res.status(400).json({
      message: 'Missing x-app-signature header. Mobile client verification required.',
    });
  }

  // Verify HMAC-SHA256 signature
  try {
    const rawBody = req.body ? JSON.stringify(req.body) : '';
    const expectedSignatureHex = crypto
      .createHmac('sha256', MOBILE_HMAC_SECRET)
      .update(rawBody)
      .digest('hex');

    const expectedSignatureBase64 = crypto
      .createHmac('sha256', MOBILE_HMAC_SECRET)
      .update(rawBody)
      .digest('base64');

    if (
      appSignature !== expectedSignatureHex &&
      appSignature !== expectedSignatureBase64 &&
      process.env.NODE_ENV === 'production'
    ) {
      return res.status(401).json({
        message: 'Invalid x-app-signature. HMAC signature verification failed.',
      });
    }
  } catch (err) {
    console.error('Error verifying app signature:', err);
  }

  next();
}
