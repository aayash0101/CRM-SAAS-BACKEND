import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from '@config/app.config';
import { errorMiddleware } from '@common/middleware/error.middleware';
import authRoutes from '@modules/auth/auth.routes';

const app: Application = express();

app.use(helmet());
app.use(
  cors({
    origin: config.frontend.url,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.isDevelopment) {
  app.use(morgan('dev'));
}

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'CRM API is running',
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

app.use('/api/v1/auth', authLimiter, authRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorMiddleware);

export default app;