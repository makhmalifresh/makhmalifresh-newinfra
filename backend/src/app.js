import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import borzoRoutes from './routes/borzo.routes.js';
import adminRoutes from './routes/admin.routes.js';
import settingRoutes from './routes/setting.routes.js';

// Middlewares
import { errorHandler } from './middlewares/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Health endpoint for frontend cold start loader
app.get('/api/health', (req, res) => res.status(200).json({ status: "ok" }));

// Apply routes
app.use('/api', productRoutes);
app.use('/api', orderRoutes);
app.use('/api', paymentRoutes);
app.use('/api', borzoRoutes);
app.use('/api', settingRoutes);
app.use('/api/admin', adminRoutes);

// In development, handle 404 for unknown endpoints.
// In production, serve frontend dist folder.
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/dist", "index.html"));
  });
} else {
  app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
  });
}

// Centralized error handler
app.use(errorHandler);

export default app;
