import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';
import authRoutes from './routes/auth';
import categoryRoutes from './routes/categories';
import productRoutes from './routes/products';
import { peopleRouter } from './routes/people';
import inventoryRoutes from './routes/inventory';
import salesRoutes from './routes/sales';
import purchasesRoutes from './routes/purchases';
import expenseRoutes from './routes/expenses';
import reportsRoutes from './routes/reports';
import usersRoutes from './routes/users';
import settingsRoutes from './routes/settings';
import notificationsRoutes from './routes/notifications';
import auditRoutes from './routes/audit';
import contactRoutes from './routes/contact';
import { errorHandler } from './utils/errors';
import { createAppwriteRouter } from './appwrite';

const app = express();
const port = Number(process.env.PORT || 4000);
const corsOrigin = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 1000 }));
app.use('/uploads', express.static(path.resolve(process.env.UPLOAD_DIR || 'uploads')));

if (process.env.APPWRITE_PROJECT_ID && process.env.APPWRITE_API_KEY) {
  console.log('Using Appwrite backend provider');
  app.use('/api', createAppwriteRouter());
} else {
  console.log('Using PostgreSQL/Prisma backend provider');
  app.get('/api/health', (_req, res) => res.json({ ok: true, product: 'رقابة كلاود API', time: new Date().toISOString() }));
  app.use('/api/auth', authRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/customers', peopleRouter('customers'));
  app.use('/api/suppliers', peopleRouter('suppliers'));
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/sales', salesRoutes);
  app.use('/api/purchases', purchasesRoutes);
  app.use('/api/expenses', expenseRoutes);
  app.use('/api/reports', reportsRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/audit-logs', auditRoutes);
}

app.use((_req, res) => res.status(404).json({ message: 'المسار غير موجود' }));
app.use(errorHandler);

app.listen(port, () => console.log(`Raqaba API running on :${port}`));
