import express from 'express';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { validateOrder } from './order.js';

export function createApp({ store, adminToken }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));
  const route = handler => (req, res, next) => Promise.resolve(handler(req, res)).catch(next);
  app.get('/api/health', route(async (_req, res) => { await store.readProducts(); res.json({ status: 'ok', database: 'supabase' }); }));
  app.get('/api/products', route(async (_req, res) => res.json(await store.readProducts())));
  app.use('/api/admin', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    const provided = Buffer.from(req.get('authorization') || '');
    const expected = Buffer.from(`Bearer ${adminToken || ''}`);
    if (!adminToken || provided.length !== expected.length || !timingSafeEqual(provided, expected)) return res.status(401).json({ error: 'Vui lòng đăng nhập quản trị.' });
    next();
  });
  app.get('/api/admin/products', route(async (_req, res) => res.json(await store.readProducts())));
  app.put('/api/admin/products/:id', route(async (req, res) => res.json(await store.updateProduct(req.params.id, req.body))));
  app.get('/api/admin/orders', route(async (_req, res) => res.json(await store.listOrders())));
  app.patch('/api/admin/orders/:id', route(async (req, res) => res.json(await store.updateOrderStatus(req.params.id, req.body?.status, req.body?.adminNote))));
  app.post('/api/orders', route(async (req, res) => {
    const catalog = await store.readProducts();
    let order;
    try { order = validateOrder(req.body, catalog); } catch (error) { error.status = 400; throw error; }
    const record = await store.createOrder({ ...order, id: randomUUID(), createdAt: new Date().toISOString(), status: 'Chờ xác nhận', adminNote: '' });
    res.status(201).json({ id: record.id, total: record.total });
  }));
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Không tìm thấy API.' }));
  app.use(express.static(fileURLToPath(new URL('../dist', import.meta.url))));
  app.get('*', (_req, res) => res.sendFile(fileURLToPath(new URL('../dist/index.html', import.meta.url))));
  app.use((err, _req, res, _next) => {
    const status = err.status || 500;
    res.status(status).json({ error: status === 500 ? 'Lỗi máy chủ. Vui lòng thử lại.' : status === 413 ? 'Yêu cầu quá lớn.' : err.message });
  });
  return app;
}
