import {Router} from 'express';
import {createRouter as productsRouter} from './products/routes.js';
import {createRouter as ordersRouter} from './orders/routes.js';
import {createRouter as healthRouter} from './health/routes.js';
import {createRouter as adminRouter} from './admin/routes.js';
export function createApiRouter({store,adminToken}){
  const router=Router();
  router.use('/health',healthRouter(store));
  router.use('/products',productsRouter(store));
  router.use('/orders',ordersRouter(store));
  router.use('/admin',adminRouter({store,adminToken}));
  return router;
}
