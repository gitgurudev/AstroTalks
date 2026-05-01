// File: server/index.js
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

import { Resolver } from 'dns/promises';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import userRoutes from './routes/users.js';
import sessionRoutes from './routes/sessions.js';
import { errorHandler } from './middleware/errorHandler.js';

/**
 * Resolves a mongodb+srv:// URI using Google DNS (8.8.8.8) directly,
 * bypassing ISP DNS that blocks SRV record lookups.
 * Returns a standard mongodb:// connection string.
 */
async function resolveSrvUri(srvUri) {
  const withoutScheme = srvUri.replace('mongodb+srv://', 'https://');
  const url = new URL(withoutScheme);
  const host = url.hostname;

  const resolver = new Resolver();
  resolver.setServers(['8.8.8.8', '8.8.4.4']); // Google DNS — bypasses ISP block

  console.log(`🔍 Resolving SRV records for ${host} via Google DNS…`);

  // Resolve _mongodb._tcp.<host> SRV records
  const srvRecords = await resolver.resolveSrv(`_mongodb._tcp.${host}`);

  // Resolve TXT records for connection options (e.g. authSource, replicaSet)
  let txtOptions = '';
  try {
    const txtRecords = await resolver.resolveTxt(host);
    txtOptions = txtRecords.flat().join('&');
  } catch { /* TXT optional */ }

  const hosts  = srvRecords.map(r => `${r.name}:${r.port}`).join(',');
  const auth   = `${url.username}:${url.password}@`;
  const db     = url.pathname || '/';
  const search = url.search   || '';
  const params = txtOptions
    ? `?${txtOptions}&ssl=true`
    : `?authSource=admin&ssl=true${search ? '&' + search.slice(1) : ''}`;

  const resolved = `mongodb://${auth}${hosts}${db}${params}`;
  console.log('✅ SRV resolved → standard connection string built');
  return resolved;
}

async function startServer() {
  const app  = express();
  const PORT = process.env.PORT || 5000;

  app.use(cors({ origin: /^http:\/\/localhost:\d+$/ }));
  app.use(express.json());
  app.use('/api/users', userRoutes);
  app.use('/api/sessions', sessionRoutes);
  app.get('/api/health', (_, res) => res.json({ status: 'ok' }));
  app.use(errorHandler);

  try {
    let uri = process.env.MONGODB_URI;

    // If SRV URI — resolve via Google DNS first
    if (uri.startsWith('mongodb+srv://')) {
      uri = await resolveSrvUri(uri);
    }

    await mongoose.connect(uri, { family: 4 });
    console.log('✅ MongoDB connected →', process.env.MONGODB_URI);
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

startServer();
