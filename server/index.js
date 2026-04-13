// File: server/index.js
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// .env is in the project root (one level up from /server)
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import userRoutes from './routes/users.js';
import sessionRoutes from './routes/sessions.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
app.use(cors({ origin: 'http://localhost:5173' }));   // allow only the Vite dev server
app.use(express.json());

// ── Routes ──
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);

// ── Health check ──
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ── Global error handler ──
app.use(errorHandler);

// ── Connect to MongoDB, then start server ──
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected →', process.env.MONGODB_URI);
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
