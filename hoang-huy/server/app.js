import express from 'express';
import {createApiRouter} from './api/index.js';

export function createApp({ store, adminToken }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));
  app.use('/api', createApiRouter({store,adminToken}));
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Không tìm thấy API.' }));
  app.use((_req, res) => res.status(404).json({ error: 'Máy chủ này chỉ cung cấp API tại /api.' }));
  app.use((err, _req, res, _next) => {
    const status = err.status || 500;
    res.status(status).json({ error: status === 500 ? 'Lỗi máy chủ. Vui lòng thử lại.' : status === 413 ? 'Yêu cầu quá lớn.' : err.message });
  });
  return app;
}
